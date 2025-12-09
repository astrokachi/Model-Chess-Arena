'use client';

import { useChessGame } from '@/hooks/use-chess-game';
import { ChessPiece } from './chess-piece';
import { BoardSquare } from './board-square';
import { positionsEqual } from '@/lib/chess/board-utils';
import { Position } from '@/lib/chess/types';

export function ChessBoard() {
  const { gameState, selectedPiece, validMoves, selectPiece, movePiece } = useChessGame();

  const handleSquareClick = (row: number, col: number) => {
    const position: Position = { row, col };
    const piece = gameState.board[row][col].piece;

    if (selectedPiece) {
      const isValidMove = validMoves.some(move => positionsEqual(move, position));

      if (isValidMove) {
        const success = movePiece(selectedPiece.position, position);
        if (!success) {
          selectPiece(null);
        }
      } else if (piece && piece.color === gameState.currentTurn) {
        selectPiece(piece);
      } else {
        selectPiece(null);
      }
    } else if (piece && piece.color === gameState.currentTurn) {
      selectPiece(piece);
    }
  };

  const lastMove = gameState.moves[gameState.moves.length - 1];

  return (
    <div className="chess-board">
      {gameState.board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((square, colIndex) => {
            const isSelected = selectedPiece ? positionsEqual(selectedPiece.position, square.position) : false;
            const isValidMove = validMoves.some(move => positionsEqual(move, square.position));
            const isLastMove = lastMove ?
              positionsEqual(lastMove.from, square.position) || positionsEqual(lastMove.to, square.position)
              : false;
            const isCheck = gameState.isCheck && square.piece?.type === 'king' && square.piece.color === gameState.currentTurn;

            return (
              <BoardSquare
                key={`${rowIndex}-${colIndex}`}
                position={square.position}
                piece={square.piece}
                isSelected={isSelected}
                isValidMove={isValidMove}
                isLastMove={isLastMove}
                isCheck={isCheck}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
              >
                {square.piece && (
                  <ChessPiece
                    piece={square.piece}
                    isSelected={isSelected}
                    onClick={() => { }}
                  />
                )}
              </BoardSquare>
            );
          })}
        </div>
      ))}
    </div>
  );
}
