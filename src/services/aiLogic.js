// AI logic for Tic Tac Toe (Easy, Medium, Minimax Master)

export function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
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

export function getAIMove(board, aiSymbol = 'O', difficulty = 'master') {
  const humanSymbol = aiSymbol === 'X' ? 'O' : 'X';
  const availableMoves = board
    .map((val, idx) => (val === null ? idx : null))
    .filter(val => val !== null);

  if (availableMoves.length === 0) return null;

  // Easy: Random choice
  if (difficulty === 'easy') {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  // Medium: 60% Minimax, 40% Random or Immediate Win/Block
  if (difficulty === 'medium') {
    // 1. Check if AI can win immediately
    for (const move of availableMoves) {
      const copy = [...board];
      copy[move] = aiSymbol;
      if (checkWinner(copy)?.winner === aiSymbol) return move;
    }
    // 2. Check if AI needs to block human win
    for (const move of availableMoves) {
      const copy = [...board];
      copy[move] = humanSymbol;
      if (checkWinner(copy)?.winner === humanSymbol) return move;
    }
    // 3. 50% random fallback
    if (Math.random() < 0.4) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
  }

  // Master (Minimax with alpha-beta pruning)
  function minimax(currentBoard, depth, isMaximizing) {
    const result = checkWinner(currentBoard);
    if (result) {
      if (result.winner === aiSymbol) return 10 - depth;
      if (result.winner === humanSymbol) return depth - 10;
      if (result.winner === 'draw') return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = aiSymbol;
          const score = minimax(currentBoard, depth + 1, false);
          currentBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = humanSymbol;
          const score = minimax(currentBoard, depth + 1, true);
          currentBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  let bestMove = availableMoves[0];
  let bestScore = -Infinity;

  for (const move of availableMoves) {
    board[move] = aiSymbol;
    const score = minimax(board, 0, false);
    board[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
