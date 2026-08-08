import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentRoom = null;
    this.listeners = new Map();
  }

  connect(serverUrl = window.location.origin) {
    if (this.socket) return this.socket;

    // Use environment variable VITE_SERVER_URL if set (e.g., on Netlify),
    // otherwise fallback to port 3001 in local dev
    let url = import.meta.env.VITE_SERVER_URL;
    if (!url) {
      url = serverUrl.includes(':5173') 
        ? serverUrl.replace(':5173', ':3001')
        : serverUrl;
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.emitLocal('connection_status', { connected: true, id: this.socket.id });
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.emitLocal('connection_status', { connected: false });
    });

    this.socket.on('room_updated', (roomData) => {
      this.currentRoom = roomData;
      this.emitLocal('room_updated', roomData);
    });

    this.socket.on('reaction_received', (data) => {
      this.emitLocal('reaction_received', data);
    });

    this.socket.on('chat_received', (msg) => {
      this.emitLocal('chat_received', msg);
    });

    this.socket.on('error_message', (err) => {
      this.emitLocal('error_message', err);
    });

    return this.socket;
  }

  // Event dispatching to React listeners
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emitLocal(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in socket listener for ${event}:`, err);
        }
      });
    }
  }

  // Room actions
  createRoom(userData) {
    this.connect();
    return new Promise((resolve) => {
      this.socket.emit('create_room', userData, (response) => {
        if (response?.success) {
          this.currentRoom = response.room;
        }
        resolve(response);
      });
    });
  }

  joinRoom(roomId, userData) {
    this.connect();
    return new Promise((resolve) => {
      this.socket.emit('join_room', { roomId, ...userData }, (response) => {
        if (response?.success) {
          this.currentRoom = response.room;
        }
        resolve(response);
      });
    });
  }

  leaveRoom() {
    if (this.socket && this.currentRoom) {
      this.socket.emit('leave_room', { roomId: this.currentRoom.id });
      this.currentRoom = null;
    }
  }

  switchGame(gameType) {
    if (this.socket && this.currentRoom) {
      this.socket.emit('switch_game', { roomId: this.currentRoom.id, gameType });
    }
  }

  // Tic Tac Toe Actions
  makeTicTacToeMove(index) {
    if (this.socket && this.currentRoom) {
      this.socket.emit('ttt_move', { roomId: this.currentRoom.id, index });
    }
  }

  resetTicTacToe() {
    if (this.socket && this.currentRoom) {
      this.socket.emit('ttt_reset', { roomId: this.currentRoom.id });
    }
  }

  // Hidden Model Guessing Game Actions
  updatePlayersCount(count) {
    if (this.socket && this.currentRoom) {
      this.socket.emit('hm_update_players', { roomId: this.currentRoom.id, count });
    }
  }

  addCustomPlayer(player) {
    if (this.socket && this.currentRoom) {
      this.socket.emit('hm_add_player', { roomId: this.currentRoom.id, player });
    }
  }

  removePlayer(playerId) {
    if (this.socket && this.currentRoom) {
      this.socket.emit('hm_remove_player', { roomId: this.currentRoom.id, playerId });
    }
  }

  lockInModelChoice(playerId, secretModel, customReason = '') {
    if (this.socket && this.currentRoom) {
      this.socket.emit('hm_lock_in_choice', {
        roomId: this.currentRoom.id,
        playerId,
        secretModel,
        customReason
      });
    }
  }

  submitPredictions(playerId, predictions) {
    if (this.socket && this.currentRoom) {
      this.socket.emit('hm_submit_predictions', {
        roomId: this.currentRoom.id,
        playerId,
        predictions
      });
    }
  }

  startRevealCountdown() {
    if (this.socket && this.currentRoom) {
      this.socket.emit('hm_trigger_reveal', { roomId: this.currentRoom.id });
    }
  }

  resetHiddenModelGame() {
    if (this.socket && this.currentRoom) {
      this.socket.emit('hm_reset_game', { roomId: this.currentRoom.id });
    }
  }

  startGuessing() {
    if (this.socket && this.currentRoom) {
      this.socket.emit('hm_start_guessing', { roomId: this.currentRoom.id });
    }
  }

  // Social & Chat Actions
  sendReaction(emoji) {
    if (this.socket && this.currentRoom) {
      this.socket.emit('send_reaction', {
        roomId: this.currentRoom.id,
        emoji,
        senderId: this.socket.id
      });
    }
  }

  sendChatMessage(text, senderName) {
    if (this.socket && this.currentRoom) {
      this.socket.emit('send_chat', {
        roomId: this.currentRoom.id,
        text,
        senderName
      });
    }
  }
}

export const socketService = new SocketService();
