import { BoardState, Color, GameState } from './types';

export function boardToFen(gameState: GameState): string {
  const { board, currentTurn, castlingRights, enPassantTarget, halfMoveClock, fullMoveNumber } = gameState;

  let fen = '';

  for (let row = 0; row < 8; row++) {
    let emptyCount = 0;

    for (let col = 0; col < 8; col++) {
      const piece = board[row][col].piece;

      if (!piece) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          fen += emptyCount;
          emptyCount = 0;
        }

        const pieceChar = getPieceChar(piece.type);
        fen += piece.color === 'white' ? pieceChar.toUpperCase() : pieceChar.toLowerCase();
      }
    }

    if (emptyCount > 0) {
      fen += emptyCount;
    }

    if (row < 7) {
      fen += '/';
    }
  }

  fen += ' ' + (currentTurn === 'white' ? 'w' : 'b');

  let castling = '';
  if (castlingRights.whiteKingSide) castling += 'K';
  if (castlingRights.whiteQueenSide) castling += 'Q';
  if (castlingRights.blackKingSide) castling += 'k';
  if (castlingRights.blackQueenSide) castling += 'q';
  fen += ' ' + (castling || '-');

  if (enPassantTarget) {
    const file = String.fromCharCode(97 + enPassantTarget.col);
    const rank = (8 - enPassantTarget.row).toString();
    fen += ' ' + file + rank;
  } else {
    fen += ' -';
  }

  fen += ' ' + halfMoveClock;
  fen += ' ' + fullMoveNumber;

  return fen;
}

function getPieceChar(type: string): string {
  switch (type) {
    case 'pawn': return 'p';
    case 'knight': return 'n';
    case 'bishop': return 'b';
    case 'rook': return 'r';
    case 'queen': return 'q';
    case 'king': return 'k';
    default: return '';
  }
}

function charToPieceType(char: string): string {
  const lower = char.toLowerCase();
  switch (lower) {
    case 'p': return 'pawn';
    case 'n': return 'knight';
    case 'b': return 'bishop';
    case 'r': return 'rook';
    case 'q': return 'queen';
    case 'k': return 'king';
    default: return '';
  }
}

export function fenToGameState(fen: string): Partial<GameState> {
  const parts = fen.split(' ');
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

  const ranks = parts[0].split('/');
  for (let row = 0; row < 8; row++) {
    let col = 0;
    for (const char of ranks[row]) {
      if (char >= '1' && char <= '8') {
        col += parseInt(char);
      } else {
        const color: Color = char === char.toUpperCase() ? 'white' : 'black';
        const type = charToPieceType(char);
        if (type) {
          board[row][col].piece = {
            type: type as any,
            color,
            position: { row, col },
            hasMoved: false
          };
        }
        col++;
      }
    }
  }

  const currentTurn: Color = parts[1] === 'w' ? 'white' : 'black';

  const castlingRights = {
    whiteKingSide: parts[2].includes('K'),
    whiteQueenSide: parts[2].includes('Q'),
    blackKingSide: parts[2].includes('k'),
    blackQueenSide: parts[2].includes('q')
  };

  let enPassantTarget = null;
  if (parts[3] !== '-') {
    const col = parts[3].charCodeAt(0) - 97;
    const row = 8 - parseInt(parts[3][1]);
    enPassantTarget = { row, col };
  }

  const halfMoveClock = parseInt(parts[4]) || 0;
  const fullMoveNumber = parseInt(parts[5]) || 1;

  return {
    board,
    currentTurn,
    castlingRights,
    enPassantTarget,
    halfMoveClock,
    fullMoveNumber
  };
}
