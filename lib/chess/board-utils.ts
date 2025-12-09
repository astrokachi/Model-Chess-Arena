import { BoardState, Piece, Position, Color, PieceType, Square } from './types';

export function positionToString(pos: Position): string {
  const file = String.fromCharCode(97 + pos.col);
  const rank = (8 - pos.row).toString();
  return file + rank;
}

export function stringToPosition(pos: string): Position {
  const col = pos.charCodeAt(0) - 97;
  const row = 8 - parseInt(pos[1]);
  return { row, col };
}

export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
}

export function positionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.row === pos2.row && pos1.col === pos2.col;
}

export function getPieceAt(board: BoardState, pos: Position): Piece | null {
  if (!isValidPosition(pos)) return null;
  return board[pos.row][pos.col].piece;
}

export function setPieceAt(board: BoardState, pos: Position, piece: Piece | null): void {
  if (!isValidPosition(pos)) return;
  board[pos.row][pos.col].piece = piece;
  if (piece) {
    piece.position = pos;
  }
}

export function cloneBoard(board: BoardState): BoardState {
  return board.map(row =>
    row.map(square => ({
      position: { ...square.position },
      piece: square.piece ? { ...square.piece, position: { ...square.piece.position } } : null
    }))
  );
}

export function createEmptyBoard(): BoardState {
  const board: BoardState = [];
  for (let row = 0; row < 8; row++) {
    board[row] = [];
    for (let col = 0; col < 8; col++) {
      board[row][col] = {
        position: { row, col },
        piece: null
      };
    }
  }
  return board;
}

export function getInitialBoard(): BoardState {
  const board = createEmptyBoard();

  const backRank: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

  for (let col = 0; col < 8; col++) {
    setPieceAt(board, { row: 0, col }, {
      type: backRank[col],
      color: 'black',
      position: { row: 0, col },
      hasMoved: false
    });

    setPieceAt(board, { row: 1, col }, {
      type: 'pawn',
      color: 'black',
      position: { row: 1, col },
      hasMoved: false
    });

    setPieceAt(board, { row: 6, col }, {
      type: 'pawn',
      color: 'white',
      position: { row: 6, col },
      hasMoved: false
    });

    setPieceAt(board, { row: 7, col }, {
      type: backRank[col],
      color: 'white',
      position: { row: 7, col },
      hasMoved: false
    });
  }

  return board;
}

export function getAllPieces(board: BoardState, color?: Color): Piece[] {
  const pieces: Piece[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col].piece;
      if (piece && (!color || piece.color === color)) {
        pieces.push(piece);
      }
    }
  }
  return pieces;
}

export function findKing(board: BoardState, color: Color): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col].piece;
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}
