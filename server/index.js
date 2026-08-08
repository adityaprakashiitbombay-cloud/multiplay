import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Persistent Records Store ────────────────────────────────────────────────
const RECORDS_FILE = path.join(__dirname, 'records.json');

function loadRecords() {
  try {
    if (fs.existsSync(RECORDS_FILE)) {
      return JSON.parse(fs.readFileSync(RECORDS_FILE, 'utf8'));
    }
  } catch (e) { console.warn('[Records] Failed to load:', e.message); }
  return { tictactoe: [], hiddenModel: [] };
}

function saveRecords(records) {
  try {
    fs.writeFileSync(RECORDS_FILE, JSON.stringify(records, null, 2), 'utf8');
  } catch (e) { console.warn('[Records] Failed to save:', e.message); }
}

const gameRecords = loadRecords();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Default popular Cricketer, Footballer, and Person presets (players can also type any custom name)
const DEFAULT_PERSON_PRESETS = [
  'Virat Kohli',
  'Cristiano Ronaldo',
  'Lionel Messi',
  'MS Dhoni',
  'Rohit Sharma',
  'Kylian Mbappé',
  'Sachin Tendulkar',
  'Erling Haaland',
  'Neymar Jr',
  'Jasprit Bumrah',
  'AB de Villiers',
  'Babar Azam'
];

// Memory state for multiplayer rooms
const rooms = new Map();

// Helper to generate readable memorable room code
function generateRoomCode() {
  const words = ['NEON', 'CYBER', 'HYPER', 'QUANTUM', 'TURBO', 'MATRIX', 'SOLAR', 'APEX', 'NOVA', 'ECHO'];
  const num = Math.floor(10 + Math.random() * 90);
  const word = words[Math.floor(Math.random() * words.length)];
  return `${word}-${num}`;
}

// Tic Tac Toe Win Checker
function checkTTTWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: lines[i] };
    }
  }

  if (board.every(cell => cell !== null)) {
    return { winner: 'draw', line: null };
  }

  return null;
}

// Helper to sanitize room state before broadcasting (hide secrets during Phase 1 & 2)
function getSanitizedRoom(room, forSocketId = null) {
  const sanitized = JSON.parse(JSON.stringify(room));
  
  // If in hidden model setup or prediction phase, mask choices for everyone except self
  if (sanitized.hiddenModel && sanitized.hiddenModel.phase !== 'revealed') {
    sanitized.hiddenModel.players = sanitized.hiddenModel.players.map(p => {
      const isSelf = forSocketId && p.socketId === forSocketId;
      return {
        ...p,
        secretModel: (p.lockedIn && !isSelf) ? '🔒 HIDDEN' : p.secretModel,
        customReason: (p.lockedIn && !isSelf) ? '' : p.customReason,
        isMasked: (p.lockedIn && !isSelf)
      };
    });
  }

  return sanitized;
}

// Broadcast sanitized room to all members
function broadcastRoomUpdate(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const roomSockets = io.sockets.adapter.rooms.get(roomId);
  if (roomSockets) {
    roomSockets.forEach(sockId => {
      const socket = io.sockets.sockets.get(sockId);
      if (socket) {
        socket.emit('room_updated', getSanitizedRoom(room, sockId));
      }
    });
  }
}

// Create fresh room structure
function createNewRoom(roomId, hostData, socketId) {
  return {
    id: roomId,
    createdAt: Date.now(),
    hostId: socketId,
    activeGame: 'tictactoe', // 'tictactoe' | 'hidden-model'
    connectedUsers: [
      {
        id: socketId,
        name: hostData?.name || 'Host Player',
        avatar: hostData?.avatar || '👾',
        isHost: true,
        joinedAt: Date.now()
      }
    ],
    chat: [
      {
        id: 'init-msg',
        sender: 'System 🤖',
        text: `Room ${roomId} created! Share the room ID or link to invite friends.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ],
    // Game 1: Tic Tac Toe State
    ticTacToe: {
      board: Array(9).fill(null),
      currentTurn: 'X',
      playerX: { id: socketId, name: hostData?.name || 'Player X', avatar: hostData?.avatar || '👾' },
      playerO: null,
      scores: { X: 0, O: 0, ties: 0 },
      status: 'playing', // 'playing' | 'won' | 'draw'
      winner: null,
      winningLine: null,
      moveHistory: [],
      turnTimeLeft: 15
    },
    // Game 2: Hidden Model Guessing Game State
    hiddenModel: {
      phase: 'setup', // 'setup' | 'predicting' | 'countdown' | 'revealed'
      countdownValue: 3,
      presetModels: DEFAULT_PERSON_PRESETS,
      players: [
        {
          id: 'p-1',
          socketId: socketId,
          name: hostData?.name || 'Player 1',
          avatar: hostData?.avatar || '👾',
          secretModel: '',
          customReason: '',
          lockedIn: false,
          predictions: {}, // { targetPlayerId: 'Predicted Model' }
          hasSubmittedPredictions: false
        },
        {
          id: 'p-2',
          socketId: null,
          name: 'Player 2',
          avatar: '🤖',
          secretModel: '',
          customReason: '',
          lockedIn: false,
          predictions: {},
          hasSubmittedPredictions: false
        }
      ],
      resultsSummary: null
    }
  };
}

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // 1. Create Room
  socket.on('create_room', (userData, callback) => {
    const roomId = generateRoomCode();
    const newRoom = createNewRoom(roomId, userData, socket.id);
    rooms.set(roomId, newRoom);
    socket.join(roomId);

    console.log(`[Room Created] ${roomId} by ${userData?.name || 'Host'}`);
    if (typeof callback === 'function') {
      callback({ success: true, roomId, room: getSanitizedRoom(newRoom, socket.id) });
    }
    broadcastRoomUpdate(roomId);
  });

  // 2. Join Room
  socket.on('join_room', (data, callback) => {
    const roomId = data.roomId ? data.roomId.toUpperCase().trim() : '';
    let room = rooms.get(roomId);

    if (!room) {
      // Auto-create room if joining non-existent for effortless instant play
      room = createNewRoom(roomId || generateRoomCode(), data, socket.id);
      rooms.set(room.id, room);
    } else {
      // Check if user already exists
      const existingUser = room.connectedUsers.find(u => u.id === socket.id);
      if (!existingUser) {
        room.connectedUsers.push({
          id: socket.id,
          name: data.name || `Player ${room.connectedUsers.length + 1}`,
          avatar: data.avatar || '🎮',
          isHost: room.connectedUsers.length === 0,
          joinedAt: Date.now()
        });

        // Assign to Tic Tac Toe Player O if open
        if (!room.ticTacToe.playerO && room.ticTacToe.playerX?.id !== socket.id) {
          room.ticTacToe.playerO = {
            id: socket.id,
            name: data.name || 'Player O',
            avatar: data.avatar || '🎮'
          };
        }

        // Add to Hidden Model player list if not already present
        const hmPlayerExists = room.hiddenModel.players.some(p => p.socketId === socket.id);
        if (!hmPlayerExists) {
          room.hiddenModel.players.push({
            id: `p-${Date.now()}`,
            socketId: socket.id,
            name: data.name || `Player ${room.hiddenModel.players.length + 1}`,
            avatar: data.avatar || '⚡',
            secretModel: '',
            customReason: '',
            lockedIn: false,
            predictions: {},
            hasSubmittedPredictions: false
          });
        }

        room.chat.push({
          id: `msg-${Date.now()}`,
          sender: 'System 🤖',
          text: `${data.name || 'A player'} joined the room!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    }

    socket.join(room.id);
    if (typeof callback === 'function') {
      callback({ success: true, roomId: room.id, room: getSanitizedRoom(room, socket.id) });
    }
    broadcastRoomUpdate(room.id);
  });

  // 3. Switch Active Game Tab
  socket.on('switch_game', ({ roomId, gameType }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.activeGame = gameType;
      broadcastRoomUpdate(roomId);
    }
  });

  // --- TIC TAC TOE EVENTS ---
  socket.on('ttt_move', ({ roomId, index }) => {
    const room = rooms.get(roomId);
    if (!room || room.ticTacToe.status !== 'playing') return;

    const ttt = room.ticTacToe;
    if (ttt.board[index] !== null) return; // Cell already occupied

    // Check player turns if 2 players are registered
    const isPlayerX = ttt.playerX?.id === socket.id;
    const isPlayerO = ttt.playerO?.id === socket.id;

    // In local / sandbox mode or if user is the assigned player
    if (ttt.playerO && !isPlayerX && !isPlayerO) {
      // Spectator clicking
      return;
    }
    if (ttt.playerO && isPlayerX && ttt.currentTurn !== 'X') return;
    if (ttt.playerO && isPlayerO && ttt.currentTurn !== 'O') return;

    // Apply move
    const symbol = ttt.currentTurn;
    ttt.board[index] = symbol;
    ttt.moveHistory.push({
      step: ttt.moveHistory.length + 1,
      symbol,
      index,
      row: Math.floor(index / 3) + 1,
      col: (index % 3) + 1,
      timestamp: Date.now()
    });

    const result = checkTTTWinner(ttt.board);
    if (result) {
      if (result.winner === 'draw') {
        ttt.status = 'draw';
        ttt.scores.ties += 1;
        room.chat.push({
          id: `msg-${Date.now()}`,
          sender: 'Referee ⚔️',
          text: `Tic Tac Toe ended in a draw! 🤝`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        // Save draw record
        gameRecords.tictactoe.push({
          type: 'draw',
          roomId,
          playerX: ttt.playerX?.name || 'Player X',
          playerO: ttt.playerO?.name || 'Player O',
          scores: { ...ttt.scores },
          timestamp: Date.now(),
          date: new Date().toISOString()
        });
        saveRecords(gameRecords);
      } else {
        ttt.status = 'won';
        ttt.winner = result.winner;
        ttt.winningLine = result.line;
        ttt.scores[result.winner] += 1;
        const winnerName = result.winner === 'X' ? (ttt.playerX?.name || 'Player X') : (ttt.playerO?.name || 'Player O');
        const loserName  = result.winner === 'X' ? (ttt.playerO?.name  || 'Player O') : (ttt.playerX?.name || 'Player X');
        room.chat.push({
          id: `msg-${Date.now()}`,
          sender: 'Referee ⚔️',
          text: `🎉 ${winnerName} won the match with ${result.winner}!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        // Save win record
        gameRecords.tictactoe.push({
          type: 'win',
          roomId,
          winner: winnerName,
          loser: loserName,
          symbol: result.winner,
          winningLine: result.line,
          scores: { ...ttt.scores, [result.winner]: ttt.scores[result.winner] },
          totalMoves: ttt.moveHistory.length,
          timestamp: Date.now(),
          date: new Date().toISOString()
        });
        if (gameRecords.tictactoe.length > 500) gameRecords.tictactoe.shift();
        saveRecords(gameRecords);
      }
    } else {
      ttt.currentTurn = ttt.currentTurn === 'X' ? 'O' : 'X';
    }

    broadcastRoomUpdate(roomId);
  });

  socket.on('ttt_reset', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.ticTacToe.board = Array(9).fill(null);
    room.ticTacToe.currentTurn = 'X';
    room.ticTacToe.status = 'playing';
    room.ticTacToe.winner = null;
    room.ticTacToe.winningLine = null;
    room.ticTacToe.moveHistory = [];

    room.chat.push({
      id: `msg-${Date.now()}`,
      sender: 'Referee ⚔️',
      text: 'Tic Tac Toe board reset! New round started.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    broadcastRoomUpdate(roomId);
  });

  // --- HIDDEN MODEL GUESSING GAME EVENTS ---

  // Phase 1: Setup - Update player count
  socket.on('hm_update_players', ({ roomId, count }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const num = Math.max(2, Math.min(8, parseInt(count, 10) || 2));
    const current = room.hiddenModel.players;

    if (num > current.length) {
      for (let i = current.length; i < num; i++) {
        current.push({
          id: `p-${Date.now()}-${i}`,
          socketId: null,
          name: `Player ${i + 1}`,
          avatar: ['🤖', '⚡', '🧠', '🔮', '👾', '🚀', '🎯', '💎'][i % 8],
          secretModel: '',
          customReason: '',
          lockedIn: false,
          predictions: {},
          hasSubmittedPredictions: false
        });
      }
    } else if (num < current.length) {
      room.hiddenModel.players = current.slice(0, num);
    }

    broadcastRoomUpdate(roomId);
  });

  socket.on('hm_add_player', ({ roomId, player }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.hiddenModel.players.push({
      id: `p-${Date.now()}`,
      socketId: null,
      name: player.name || `Player ${room.hiddenModel.players.length + 1}`,
      avatar: player.avatar || '🤖',
      secretModel: '',
      customReason: '',
      lockedIn: false,
      predictions: {},
      hasSubmittedPredictions: false
    });

    broadcastRoomUpdate(roomId);
  });

  socket.on('hm_remove_player', ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    if (room.hiddenModel.players.length <= 2) return; // Keep at least 2 players

    room.hiddenModel.players = room.hiddenModel.players.filter(p => p.id !== playerId);
    broadcastRoomUpdate(roomId);
  });

  // Phase 1: Lock in private model choice
  socket.on('hm_lock_in_choice', ({ roomId, playerId, secretModel, customReason }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.hiddenModel.players.find(p => p.id === playerId || p.socketId === socket.id);
    if (player) {
      player.secretModel = secretModel.trim();
      player.customReason = customReason?.trim() || '';
      player.lockedIn = true;

      room.chat.push({
        id: `msg-${Date.now()}`,
        sender: 'AI Host 🔮',
        text: `🔒 ${player.name} locked in their secret model!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      // Check if all players have locked in choices → go to chatting phase
      const allLocked = room.hiddenModel.players.every(p => p.lockedIn);
      if (allLocked) {
        room.hiddenModel.phase = 'chatting';
        room.chat.push({
          id: `msg-${Date.now()}`,
          sender: '🎮 Game Host',
          text: `🔒 All stars locked in! Chat, drop clues, then start guessing when ready!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    }

    broadcastRoomUpdate(roomId);
  });

  // Phase 2 → 3: Host or any player signals ready to start guessing
  socket.on('hm_start_guessing', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.hiddenModel.phase = 'predicting';
    room.chat.push({
      id: `msg-${Date.now()}`,
      sender: '🎮 Game Host',
      text: `🎯 Guessing phase started! Write your answers for each opponent.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    broadcastRoomUpdate(roomId);
  });

  // Phase 2: Submit predictions for other players
  socket.on('hm_submit_predictions', ({ roomId, playerId, predictions }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.hiddenModel.players.find(p => p.id === playerId || p.socketId === socket.id);
    if (player) {
      player.predictions = predictions;
      player.hasSubmittedPredictions = true;

      room.chat.push({
        id: `msg-${Date.now()}`,
        sender: 'AI Host 🔮',
        text: `🧠 ${player.name} submitted predictions!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    broadcastRoomUpdate(roomId);
  });

  // Phase 3: Trigger synchronized countdown & reveal
  socket.on('hm_trigger_reveal', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.hiddenModel.phase = 'countdown';
    room.hiddenModel.countdownValue = 3;
    broadcastRoomUpdate(roomId);

    // Synchronized countdown sequence 3... 2... 1... REVEAL!
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        room.hiddenModel.countdownValue = count;
        broadcastRoomUpdate(roomId);
      } else {
        clearInterval(interval);
        room.hiddenModel.phase = 'revealed';

        // Calculate Results & Summary
        const players = room.hiddenModel.players;
        const modelClusters = {}; // { 'Claude 3.5 Sonnet': ['Player 1', 'Player 2'] }
        const accuracyLeaderboard = [];

        players.forEach(p => {
          const model = p.secretModel || 'Unknown Model';
          if (!modelClusters[model]) modelClusters[model] = [];
          modelClusters[model].push(p.name);
        });

        // Calculate score for each player's predictions
        players.forEach(guesser => {
          let correctCount = 0;
          let totalGuesses = 0;
          const guessDetails = [];

          players.forEach(target => {
            if (target.id !== guesser.id) {
              totalGuesses += 1;
              const predicted = (guesser.predictions[target.id] || '').trim().toLowerCase();
              const actual = (target.secretModel || '').trim().toLowerCase();
              const isCorrect = predicted !== '' && predicted === actual;
              if (isCorrect) correctCount += 1;

              guessDetails.push({
                targetId: target.id,
                targetName: target.name,
                predicted: guesser.predictions[target.id] || 'No Guess',
                actual: target.secretModel,
                isCorrect
              });
            }
          });

          const accuracy = totalGuesses > 0 ? Math.round((correctCount / totalGuesses) * 100) : 0;
          accuracyLeaderboard.push({
            playerId: guesser.id,
            playerName: guesser.name,
            avatar: guesser.avatar,
            correctCount,
            totalGuesses,
            accuracy,
            guessDetails
          });
        });

        accuracyLeaderboard.sort((a, b) => b.correctCount - a.correctCount || b.accuracy - a.accuracy);

        room.hiddenModel.resultsSummary = {
          revealedAt: Date.now(),
          modelClusters,
          accuracyLeaderboard,
          topScorer: accuracyLeaderboard[0] || null
        };

        room.chat.push({
          id: `msg-${Date.now()}`,
          sender: 'AI Host 🔮',
          text: `✨ ALL CHOICES REVEALED! Check out the summary results and matching selections!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // Save Hidden Model round record
        gameRecords.hiddenModel.push({
          roomId,
          playerCount: players.length,
          players: players.map(p => ({
            name: p.name,
            avatar: p.avatar,
            secretChoice: p.secretModel
          })),
          topScorer: accuracyLeaderboard[0]?.playerName || null,
          topAccuracy: accuracyLeaderboard[0]?.accuracy || 0,
          leaderboard: accuracyLeaderboard.map(e => ({
            name: e.playerName,
            correct: e.correctCount,
            accuracy: e.accuracy
          })),
          timestamp: Date.now(),
          date: new Date().toISOString()
        });
        if (gameRecords.hiddenModel.length > 500) gameRecords.hiddenModel.shift();
        saveRecords(gameRecords);

        broadcastRoomUpdate(roomId);
      }
    }, 1000);
  });

  // Reset Hidden Model Game for new round
  socket.on('hm_reset_game', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.hiddenModel.phase = 'setup';
    room.hiddenModel.countdownValue = 3;
    room.hiddenModel.resultsSummary = null;
    room.hiddenModel.players.forEach(p => {
      p.secretModel = '';
      p.customReason = '';
      p.lockedIn = false;
      p.predictions = {};
      p.hasSubmittedPredictions = false;
    });

    room.chat.push({
      id: `msg-${Date.now()}`,
      sender: 'AI Host 🔮',
      text: '🔄 Hidden Model Game has been reset. Lock in your new secret models!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    broadcastRoomUpdate(roomId);
  });

  // --- SOCIAL & CHAT ---
  socket.on('send_reaction', ({ roomId, emoji, senderId }) => {
    io.to(roomId).emit('reaction_received', {
      id: `react-${Date.now()}-${Math.random()}`,
      emoji,
      senderId,
      timestamp: Date.now(),
      x: 10 + Math.random() * 80 // random horizontal float percentage
    });
  });

  socket.on('send_chat', ({ roomId, text, senderName }) => {
    const room = rooms.get(roomId);
    if (!room || !text?.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: senderName || 'Player',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    room.chat.push(newMsg);
    if (room.chat.length > 50) room.chat.shift();

    io.to(roomId).emit('chat_received', newMsg);
    broadcastRoomUpdate(roomId);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ${socket.id}`);
    rooms.forEach((room, roomId) => {
      const userIndex = room.connectedUsers.findIndex(u => u.id === socket.id);
      if (userIndex !== -1) {
        const removed = room.connectedUsers.splice(userIndex, 1)[0];
        room.chat.push({
          id: `msg-${Date.now()}`,
          sender: 'System 🤖',
          text: `${removed?.name || 'A player'} left the room.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        if (room.connectedUsers.length === 0) {
          // Keep room for a few minutes before garbage collection
          setTimeout(() => {
            if (rooms.get(roomId)?.connectedUsers.length === 0) {
              rooms.delete(roomId);
            }
          }, 300000);
        } else {
          // If host left, transfer host
          if (room.hostId === socket.id && room.connectedUsers[0]) {
            room.hostId = room.connectedUsers[0].id;
            room.connectedUsers[0].isHost = true;
          }
          broadcastRoomUpdate(roomId);
        }
      }
    });
  });
});

// API status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    activeRooms: rooms.size,
    totalTTTGames: gameRecords.tictactoe.length,
    totalHMRounds: gameRecords.hiddenModel.length,
    timestamp: Date.now()
  });
});

// GET all saved game records
app.get('/api/records', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json({
    tictactoe: gameRecords.tictactoe.slice(-limit).reverse(),
    hiddenModel: gameRecords.hiddenModel.slice(-limit).reverse(),
    stats: {
      totalTTTGames: gameRecords.tictactoe.length,
      totalTTTWins: gameRecords.tictactoe.filter(r => r.type === 'win').length,
      totalTTTDraws: gameRecords.tictactoe.filter(r => r.type === 'draw').length,
      totalHMRounds: gameRecords.hiddenModel.length
    }
  });
});

// GET leaderboard from records (top TTT winners)
app.get('/api/records/leaderboard', (req, res) => {
  const winMap = {};
  gameRecords.tictactoe.filter(r => r.type === 'win').forEach(r => {
    winMap[r.winner] = (winMap[r.winner] || 0) + 1;
  });
  const leaderboard = Object.entries(winMap)
    .map(([name, wins]) => ({ name, wins }))
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 20);
  res.json({ leaderboard });
});

// Serve frontend build if dist folder exists
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'), (err) => {
    if (err) {
      res.send('Live Multiplayer Game Hub API Server running on port ' + PORT);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Live Multiplayer Game Server running at http://localhost:${PORT}`);
});
