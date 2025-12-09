import { BoardState, Piece, Position, Color } from './types';
import { isValidPosition, getPieceAt, positionsEqual } from './board-utils';

export function getPossibleMoves(board: BoardState, piece: Piece, enPassantTarget: Position | null): Position[] {
  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(board, piece, enPassantTarget);
    case 'knight':
      return getKnightMoves(board, piece);
    case 'bishop':
      return getBishopMoves(board, piece);
    case 'rook':
      return getRookMoves(board, piece);
    case 'queen':
      return getQueenMoves(board, piece);
    case 'king':
      return getKingMoves(board, piece);
    default:
      return [];
  }
}

function getPawnMoves(board: BoardState, piece: Piece, enPassantTarget: Position | null): Position[] {
  const moves: Position[] = [];
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;
  const { row, col } = piece.position;

  const forward = { row: row + direction, col };
  if (isValidPosition(forward) && !getPieceAt(board, forward)) {
    moves.push(forward);

    if (row === startRow) {
      const doubleForward = { row: row + 2 * direction, col };
      if (!getPieceAt(board, doubleForward)) {
        moves.push(doubleForward);
      }
    }
  }

  const captures = [
    { row: row + direction, col: col - 1 },
    { row: row + direction, col: col + 1 }
  ];

  for (const capturePos of captures) {
    if (isValidPosition(capturePos)) {
      const targetPiece = getPieceAt(board, capturePos);
      if (targetPiece && targetPiece.color !== piece.color) {
        moves.push(capturePos);
      }

      if (enPassantTarget && positionsEqual(capturePos, enPassantTarget)) {
        moves.push(capturePos);
      }
    }
  }

  return moves;
}

function getKnightMoves(board: BoardState, piece: Piece): Position[] {
  const moves: Position[] = [];
  const { row, col } = piece.position;

  const offsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];

  for (const [dr, dc] of offsets) {
    const newPos = { row: row + dr, col: col + dc };
    if (isValidPosition(newPos)) {
      const targetPiece = getPieceAt(board, newPos);
      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push(newPos);
      }
    }
  }

  return moves;
}

function getBishopMoves(board: BoardState, piece: Piece): Position[] {
  return getSlidingMoves(board, piece, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
}

function getRookMoves(board: BoardState, piece: Piece): Position[] {
  return getSlidingMoves(board, piece, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
}

function getQueenMoves(board: BoardState, piece: Piece): Position[] {
  return getSlidingMoves(board, piece, [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]);
}

function getKingMoves(board: BoardState, piece: Piece): Position[] {
  const moves: Position[] = [];
  const { row, col } = piece.position;

  const offsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];

  for (const [dr, dc] of offsets) {
    const newPos = { row: row + dr, col: col + dc };
    if (isValidPosition(newPos)) {
      const targetPiece = getPieceAt(board, newPos);
      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push(newPos);
      }
    }
  }

  return moves;
}

function getSlidingMoves(board: BoardState, piece: Piece, directions: number[][]): Position[] {
  const moves: Position[] = [];
  const { row, col } = piece.position;

  for (const [dr, dc] of directions) {
    let newRow = row + dr;
    let newCol = col + dc;

    while (isValidPosition({ row: newRow, col: newCol })) {
      const targetPiece = getPieceAt(board, { row: newRow, col: newCol });

      if (!targetPiece) {
        moves.push({ row: newRow, col: newCol });
      } else {
        if (targetPiece.color !== piece.color) {
          moves.push({ row: newRow, col: newCol });
        }
        break;
      }

      newRow += dr;
      newCol += dc;
    }
  }

  return moves;
}

export function isSquareAttacked(board: BoardState, position: Position, byColor: Color, enPassantTarget: Position | null): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col].piece;
      if (piece && piece.color === byColor) {
        const moves = getPossibleMoves(board, piece, enPassantTarget);
        if (moves.some(move => positionsEqual(move, position))) {
          return true;
        }
      }
    }
  }
  return false;
}
