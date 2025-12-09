'use client';

import { useState, useCallback } from 'react';
import { GameState, Position, Piece } from '../lib/chess/types';
import { createInitialGameState, makeMove } from '../lib/chess/chess-engine';
import { getLegalMoves } from '../lib/chess/game-state';
import { boardToFen } from '../lib/chess/fen-utils';

export function useChessGame() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);

  const selectPiece = useCallback((piece: Piece | null) => {
    setSelectedPiece(piece);
    if (piece && piece.color === gameState.currentTurn) {
      const moves = getLegalMoves(gameState, piece);
      setValidMoves(moves);
    } else {
      setValidMoves([]);
    }
  }, [gameState]);

  const movePiece = useCallback((from: Position, to: Position, promotionPiece?: string) => {
    const newState = makeMove(gameState, from, to, promotionPiece);
    if (newState) {
      const lastMove = newState.moves.at(-1)?.fenAfter
      setGameState(newState);
      setSelectedPiece(null);
      setValidMoves([]);
      return true;
    }
    return false;
  }, [gameState]);

  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
    setSelectedPiece(null);
    setValidMoves([]);
  }, []);

  const exportFen = useCallback(() => {
    return boardToFen(gameState);
  }, [gameState]);

  return {
    gameState,
    selectedPiece,
    validMoves,
    selectPiece,
    movePiece,
    resetGame,
    exportFen
  };
}
