import { GameState, Move, Position, Piece, Color } from './types';
import { getInitialBoard, cloneBoard, getPieceAt, setPieceAt, positionsEqual, positionToString } from './board-utils';
import { getLegalMoves, isInCheck, isCheckmate, isStalemate, isDraw } from './game-state';
import { boardToFen } from './fen-utils';

export function createInitialGameState(): GameState {
  return {
    board: getInitialBoard(),
    currentTurn: 'white',
    moves: [],
    status: 'in_progress',
    winner: null,
    isCheck: false,
    castlingRights: {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true
    },
    enPassantTarget: null,
    halfMoveClock: 0,
    fullMoveNumber: 1
  };
}

export function makeMove(gameState: GameState, from: Position, to: Position, promotionPiece?: string): GameState | null {
  const piece = getPieceAt(gameState.board, from);
  if (!piece || piece.color !== gameState.currentTurn) return null;

  const legalMoves = getLegalMoves(gameState, piece);
  const isLegal = legalMoves.some(move => positionsEqual(move, to));

  if (!isLegal) return null;

  const newBoard = cloneBoard(gameState.board);
  const movingPiece = getPieceAt(newBoard, from)!;
  const capturedPiece = getPieceAt(newBoard, to);

  const fenBefore = boardToFen(gameState);

  let isCastling = false;
  let isEnPassant = false;
  let isPromotion = false;

  if (movingPiece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    isCastling = true;
    const rookFromCol = to.col > from.col ? 7 : 0;
    const rookToCol = to.col > from.col ? 5 : 3;
    const rook = getPieceAt(newBoard, { row: from.row, col: rookFromCol });
    if (rook) {
      setPieceAt(newBoard, { row: from.row, col: rookToCol }, { ...rook, hasMoved: true });
      setPieceAt(newBoard, { row: from.row, col: rookFromCol }, null);
    }
  }

  if (movingPiece.type === 'pawn' && gameState.enPassantTarget && positionsEqual(to, gameState.enPassantTarget)) {
    isEnPassant = true;
    const captureRow = movingPiece.color === 'white' ? to.row + 1 : to.row - 1;
    setPieceAt(newBoard, { row: captureRow, col: to.col }, null);
  }

  if (movingPiece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
    isPromotion = true;
    movingPiece.type = (promotionPiece || 'queen') as any;
  }

  setPieceAt(newBoard, to, { ...movingPiece, hasMoved: true });
  setPieceAt(newBoard, from, null);

  const newEnPassantTarget =
    movingPiece.type === 'pawn' && Math.abs(to.row - from.row) === 2
      ? { row: (from.row + to.row) / 2, col: from.col }
      : null;

  const newCastlingRights = { ...gameState.castlingRights };
  if (movingPiece.type === 'king') {
    if (movingPiece.color === 'white') {
      newCastlingRights.whiteKingSide = false;
      newCastlingRights.whiteQueenSide = false;
    } else {
      newCastlingRights.blackKingSide = false;
      newCastlingRights.blackQueenSide = false;
    }
  }
  if (movingPiece.type === 'rook') {
    if (movingPiece.color === 'white') {
      if (from.col === 0) newCastlingRights.whiteQueenSide = false;
      if (from.col === 7) newCastlingRights.whiteKingSide = false;
    } else {
      if (from.col === 0) newCastlingRights.blackQueenSide = false;
      if (from.col === 7) newCastlingRights.blackKingSide = false;
    }
  }

  const nextTurn: Color = gameState.currentTurn === 'white' ? 'black' : 'white';

  const newGameState: GameState = {
    board: newBoard,
    currentTurn: nextTurn,
    moves: gameState.moves,
    status: gameState.status,
    winner: null,
    isCheck: false,
    castlingRights: newCastlingRights,
    enPassantTarget: newEnPassantTarget,
    halfMoveClock: capturedPiece || movingPiece.type === 'pawn' ? 0 : gameState.halfMoveClock + 1,
    fullMoveNumber: gameState.currentTurn === 'black' ? gameState.fullMoveNumber + 1 : gameState.fullMoveNumber
  };

  const fenAfter = boardToFen(newGameState);

  const san = generateSAN(gameState, from, to, movingPiece, capturedPiece, isCastling, isPromotion, promotionPiece);
  const uci = positionToString(from) + positionToString(to) + (isPromotion ? (promotionPiece || 'q') : '');

  const inCheck = isInCheck(newGameState, nextTurn);
  newGameState.isCheck = inCheck;

  const move: Move = {
    from,
    to,
    piece: movingPiece,
    capturedPiece,
    isCheck: inCheck,
    isCheckmate: false,
    isCastling,
    isEnPassant,
    isPromotion,
    promotionPiece: isPromotion ? (promotionPiece as any || 'queen') : undefined,
    san,
    uci,
    fenBefore,
    fenAfter
  };

  if (isCheckmate(newGameState, nextTurn)) {
    newGameState.status = 'checkmate';
    newGameState.winner = gameState.currentTurn;
    move.isCheckmate = true;
  } else if (isStalemate(newGameState, nextTurn)) {
    newGameState.status = 'stalemate';
  } else if (isDraw(newGameState)) {
    newGameState.status = 'draw';
  }

  newGameState.moves = [...gameState.moves, move];

  return newGameState;
}

function generateSAN(gameState: GameState, from: Position, to: Position, piece: Piece, captured: Piece | null, isCastling: boolean, isPromotion: boolean, promotionPiece?: string): string {
  if (isCastling) {
    return to.col > from.col ? 'O-O' : 'O-O-O';
  }

  let san = '';

  if (piece.type !== 'pawn') {
    san += piece.type[0].toUpperCase();
  }

  if (captured) {
    if (piece.type === 'pawn') {
      san += String.fromCharCode(97 + from.col);
    }
    san += 'x';
  }

  san += positionToString(to);

  if (isPromotion) {
    san += '=' + (promotionPiece || 'Q').toUpperCase();
  }

  return san;
}
