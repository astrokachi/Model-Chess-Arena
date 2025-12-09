import { Position, Piece } from '@/lib/chess/types';
import { positionsEqual } from '@/lib/chess/board-utils';

interface BoardSquareProps {
  position: Position;
  piece: Piece | null;
  isSelected: boolean;
  isValidMove: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

export function BoardSquare({
  position,
  piece,
  isSelected,
  isValidMove,
  isLastMove,
  isCheck,
  onClick,
  children
}: BoardSquareProps) {
  const isLight = (position.row + position.col) % 2 === 0;

  let className = `board-square ${isLight ? 'light' : 'dark'}`;
  if (isSelected) className += ' selected';
  if (isValidMove) className += ' valid-move';
  if (isLastMove) className += ' last-move';
  if (isCheck && piece?.type === 'king') className += ' check';

  return (
    <div className={className} onClick={onClick}>
      {children}
      {isValidMove && !piece && <div className="move-indicator" />}
      {isValidMove && piece && <div className="capture-indicator" />}
    </div>
  );
}
