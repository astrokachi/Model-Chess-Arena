import { GameState, Color, Position, Piece, Move, BoardState } from './types';
import { getPossibleMoves, isSquareAttacked } from './move-validator';
import { cloneBoard, getPieceAt, setPieceAt, findKing, positionsEqual } from './board-utils';
import { boardToFen } from './fen-utils';
import { positionToString } from './board-utils';

export function isInCheck(gameState: GameState, color: Color): boolean {
  const kingPos = findKing(gameState.board, color);
  if (!kingPos) return false;

  const opponentColor: Color = color === 'white' ? 'black' : 'white';
  return isSquareAttacked(gameState.board, kingPos, opponentColor, gameState.enPassantTarget);
}

export function getLegalMoves(gameState: GameState, piece: Piece): Position[] {
  const possibleMoves = getPossibleMoves(gameState.board, piece, gameState.enPassantTarget);
  const legalMoves: Position[] = [];

  for (const move of possibleMoves) {
    if (isMoveLegal(gameState, piece.position, move)) {
      legalMoves.push(move);
    }
  }

  if (piece.type === 'king' && !piece.hasMoved) {
    const castlingMoves = getCastlingMoves(gameState, piece);
    legalMoves.push(...castlingMoves);
  }

  return legalMoves;
}

function isMoveLegal(gameState: GameState, from: Position, to: Position): boolean {
  const piece = getPieceAt(gameState.board, from);
  if (!piece) return false;

  const testState = simulateMove(gameState, from, to);
  return !isInCheck(testState, piece.color);
}

function simulateMove(gameState: GameState, from: Position, to: Position): GameState {
  const newBoard = cloneBoard(gameState.board);
  const piece = getPieceAt(newBoard, from);

  if (piece) {
    setPieceAt(newBoard, to, piece);
    setPieceAt(newBoard, from, null);
  }

  return {
    ...gameState,
    board: newBoard
  };
}

function getCastlingMoves(gameState: GameState, king: Piece): Position[] {
  const moves: Position[] = [];
  const { board, castlingRights } = gameState;
  const row = king.position.row;

  if (king.color === 'white') {
    if (castlingRights.whiteKingSide) {
      if (canCastle(board, row, 4, 7, king.color, gameState.enPassantTarget)) {
        moves.push({ row, col: 6 });
      }
    }
    if (castlingRights.whiteQueenSide) {
      if (canCastle(board, row, 0, 4, king.color, gameState.enPassantTarget)) {
        moves.push({ row, col: 2 });
      }
    }
  } else {
    if (castlingRights.blackKingSide) {
      if (canCastle(board, row, 4, 7, king.color, gameState.enPassantTarget)) {
        moves.push({ row, col: 6 });
      }
    }
    if (castlingRights.blackQueenSide) {
      if (canCastle(board, row, 0, 4, king.color, gameState.enPassantTarget)) {
        moves.push({ row, col: 2 });
      }
    }
  }

  return moves;
}

function canCastle(board: BoardState, row: number, rookCol: number, kingCol: number, color: Color, enPassantTarget: Position | null): boolean {
  const rook = getPieceAt(board, { row, col: rookCol });
  if (!rook || rook.type !== 'rook' || rook.hasMoved) return false;

  const start = Math.min(rookCol, kingCol);
  const end = Math.max(rookCol, kingCol);

  for (let col = start + 1; col < end; col++) {
    if (getPieceAt(board, { row, col })) return false;
  }

  const opponentColor: Color = color === 'white' ? 'black' : 'white';
  const kingPath = rookCol > kingCol ? [kingCol, kingCol + 1, kingCol + 2] : [kingCol - 2, kingCol - 1, kingCol];

  for (const col of kingPath) {
    if (isSquareAttacked(board, { row, col }, opponentColor, enPassantTarget)) {
      return false;
    }
  }

  return true;
}

export function hasLegalMoves(gameState: GameState, color: Color): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col].piece;
      if (piece && piece.color === color) {
        const moves = getLegalMoves(gameState, piece);
        if (moves.length > 0) return true;
      }
    }
  }
  return false;
}

export function isCheckmate(gameState: GameState, color: Color): boolean {
  return isInCheck(gameState, color) && !hasLegalMoves(gameState, color);
}

export function isStalemate(gameState: GameState, color: Color): boolean {
  return !isInCheck(gameState, color) && !hasLegalMoves(gameState, color);
}

export function isDraw(gameState: GameState): boolean {
  if (gameState.halfMoveClock >= 100) return true;

  if (isInsufficientMaterial(gameState.board)) return true;

  return false;
}

function isInsufficientMaterial(board: BoardState): boolean {
  const pieces: Piece[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col].piece;
      if (piece) pieces.push(piece);
    }
  }

  if (pieces.length === 2) return true;

  if (pieces.length === 3) {
    const hasMinorPiece = pieces.some(p => p.type === 'knight' || p.type === 'bishop');
    return hasMinorPiece;
  }

  return false;
}
