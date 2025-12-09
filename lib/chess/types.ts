export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type Color = 'white' | 'black';
export type GameStatus = 'pending' | 'in_progress' | 'checkmate' | 'stalemate' | 'draw';

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  type: PieceType;
  color: Color;
  position: Position;
  hasMoved: boolean;
}

export interface Square {
  piece: Piece | null;
  position: Position;
}

export type BoardState = Square[][];

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece: Piece | null;
  isCheck: boolean;
  isCheckmate: boolean;
  isCastling: boolean;
  isEnPassant: boolean;
  isPromotion: boolean;
  promotionPiece?: PieceType;
  san: string;
  uci: string;
  fenBefore: string;
  fenAfter: string;
}

export interface GameState {
  board: BoardState;
  currentTurn: Color;
  moves: Move[];
  status: GameStatus;
  winner: Color | null;
  isCheck: boolean;
  castlingRights: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  };
  enPassantTarget: Position | null;
  halfMoveClock: number;
  fullMoveNumber: number;
}
