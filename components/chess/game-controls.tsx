'use client';

import { useChessGame } from '@/hooks/use-chess-game';

export function GameControls() {
  const { gameState, resetGame, exportFen } = useChessGame();

  const getStatusMessage = () => {
    if (gameState.status === 'checkmate') {
      return `Checkmate! ${gameState.winner === 'white' ? 'White' : 'Black'} wins!`;
    }
    if (gameState.status === 'stalemate') {
      return 'Stalemate! Draw.';
    }
    if (gameState.status === 'draw') {
      return 'Draw!';
    }
    if (gameState.isCheck) {
      return `${gameState.currentTurn === 'white' ? 'White' : 'Black'} is in check!`;
    }
    return `${gameState.currentTurn === 'white' ? 'White' : 'Black'} to move`;
  };

  return (
    <div className="game-controls">
      <div className="status-display">
        <h2>{getStatusMessage()}</h2>
        <p>Move #{gameState.fullMoveNumber}</p>
      </div>

      <div className="move-history">
        <h3>Move History</h3>
        <div className="moves-list">
          {gameState.moves.map((move, index) => (
            <div key={index} className="move-item">
              <span className="move-number">{Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '..'}</span>
              <span className="move-san">{move.san}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="control-buttons">
        <button onClick={resetGame} className="btn-reset">
          New Game
        </button>
      </div>
    </div>
  );
}
