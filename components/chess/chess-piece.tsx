import { Piece, PieceType, Color } from '@/lib/chess/types';

const pieceSymbols: Record<Color, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
};

interface ChessPieceProps {
  piece: Piece;
  isSelected: boolean;
  onClick: () => void;
}

export function ChessPiece({ piece, isSelected, onClick }: ChessPieceProps) {
  const symbol = pieceSymbols[piece.color][piece.type];

  return (
    <div
      className={`chess-piece ${isSelected ? 'selected' : ''} ${piece.color === 'white' ? 'white-piece' : 'black-piece'}`}
      onClick={onClick}
    >
      {symbol}
    </div>
  );
}
