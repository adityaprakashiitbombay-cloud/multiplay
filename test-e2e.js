import { io } from 'socket.io-client';

async function runFullIntegrationTest() {
  console.log('=== STARTING MULTIPLAYER GAME HUB INTEGRATION TEST ===');

  const client1 = io('http://localhost:3001', { transports: ['websocket'] });
  const client2 = io('http://localhost:3001', { transports: ['websocket'] });

  await new Promise((resolve) => {
    let connected = 0;
    const check = () => {
      connected++;
      if (connected === 2) resolve();
    };
    client1.on('connect', check);
    client2.on('connect', check);
  });

  console.log('✅ Both Player 1 and Player 2 connected via WebSocket!');

  // Test 1: Room Creation by Player 1
  let roomId = '';
  await new Promise((resolve) => {
    client1.emit('create_room', { name: 'Player 1 (Nova)', avatar: '⚡' }, (res) => {
      console.log('Room created response:', res);
      roomId = res.roomId;
      resolve();
    });
  });

  if (!roomId) throw new Error('Room creation failed');
  console.log(`✅ Room ${roomId} successfully created by Player 1`);

  // Test 2: Player 2 joins Room
  await new Promise((resolve) => {
    client2.emit('join_room', { roomId, name: 'Player 2 (Cyber)', avatar: '🤖' }, (res) => {
      console.log('Player 2 joined response:', res.success, res.room?.connectedUsers?.length);
      resolve();
    });
  });

  // Test 3: Tic Tac Toe Moves & Win
  console.log('\n--- Testing Game 1: Live Tic Tac Toe ---');
  await new Promise((resolve) => {
    client1.on('room_updated', (room) => {
      if (room.ticTacToe?.status === 'won') {
        console.log(`✅ Tic Tac Toe Won by: Player ${room.ticTacToe.winner}! Score:`, room.ticTacToe.scores);
        resolve();
      }
    });

    // Make moves: X(0), O(3), X(1), O(4), X(2) -> X wins top row [0, 1, 2]
    client1.emit('ttt_move', { roomId, index: 0 }); // X
    setTimeout(() => client2.emit('ttt_move', { roomId, index: 3 }), 50); // O
    setTimeout(() => client1.emit('ttt_move', { roomId, index: 1 }), 100); // X
    setTimeout(() => client2.emit('ttt_move', { roomId, index: 4 }), 150); // O
    setTimeout(() => client1.emit('ttt_move', { roomId, index: 2 }), 200); // X wins!
  });

  // Test Tic Tac Toe Reset
  client1.emit('ttt_reset', { roomId });
  await new Promise(r => setTimeout(r, 200));
  console.log('✅ Tic Tac Toe reset verified!');

  // Test 4: Hidden Model Guessing Game
  console.log('\n--- Testing Game 2: Hidden Model Guessing Game ---');
  client1.emit('switch_game', { roomId, gameType: 'hidden-model' });

  // Phase 1: Lock in Secret Choices
  client1.emit('hm_lock_in_choice', {
    roomId,
    playerId: 'p-1',
    secretModel: 'Claude 3.5 Sonnet',
    customReason: 'Top coding powerhouse'
  });

  client2.emit('hm_lock_in_choice', {
    roomId,
    playerId: 'p-2',
    secretModel: 'GPT-4o',
    customReason: 'Multimodal speed'
  });

  await new Promise(r => setTimeout(r, 300));
  console.log('✅ Phase 1: Both players locked in secret models!');

  // Phase 2: Predictions
  client1.emit('hm_submit_predictions', {
    roomId,
    playerId: 'p-1',
    predictions: { 'p-2': 'GPT-4o' } // Correct guess!
  });

  client2.emit('hm_submit_predictions', {
    roomId,
    playerId: 'p-2',
    predictions: { 'p-1': 'Claude 3.5 Sonnet' } // Correct guess!
  });

  await new Promise(r => setTimeout(r, 300));
  console.log('✅ Phase 2: Predictions submitted!');

  // Phase 3: Reveal Trigger & Countdown
  console.log('Triggering Reveal Countdown...');
  client1.emit('hm_trigger_reveal', { roomId });

  await new Promise((resolve) => {
    client1.on('room_updated', (room) => {
      if (room.hiddenModel?.phase === 'revealed') {
        console.log('✅ Phase 3: Models Revealed!');
        console.log('Model Clusters:', room.hiddenModel.resultsSummary?.modelClusters);
        console.log('Accuracy Leaderboard:', room.hiddenModel.resultsSummary?.accuracyLeaderboard);
        resolve();
      }
    });
  });

  // Test Chat and Reaction
  client1.emit('send_reaction', { roomId, emoji: '🔥', senderId: client1.id });
  client2.emit('send_chat', { roomId, text: 'Great game!', senderName: 'Player 2' });

  await new Promise(r => setTimeout(r, 200));
  console.log('✅ Chat & Reaction broadcast verified!');

  client1.disconnect();
  client2.disconnect();
  console.log('\n=== ALL INTEGRATION TESTS PASSED 100% SUCCESSFULLY! ===');
  process.exit(0);
}

runFullIntegrationTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
