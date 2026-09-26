import { GAME_CONSTANTS } from '../constants';
import { TBoard } from '../database/schema';

export const nextPiece = () => {
    const pieces = Object.values(GAME_CONSTANTS.PIECES);
    const randomPiece = pieces[Math.floor((Math.random() * 100) % pieces.length)];
    return randomPiece;
};

export const nextNPieces = (n: number) => {
    let npieces = '';
    for (let i = 0; i < n; i++) {
        npieces += nextPiece();
    }
    return npieces;
};

const pieceValues: string[] = Object.values(GAME_CONSTANTS.PIECES);

// Checks that a board sent by a client has the right shape and only known cell values
export const isValidBoard = (board: unknown): board is TBoard =>
    Array.isArray(board) &&
    board.length === GAME_CONSTANTS.ROWS &&
    board.every(
        (row) =>
            Array.isArray(row) &&
            row.length === GAME_CONSTANTS.COLS &&
            row.every((cell) => cell === 0 || pieceValues.includes(cell))
    );

const isIntInRange = (n: unknown, min: number, max: number): n is number =>
    Number.isInteger(n) && (n as number) >= min && (n as number) <= max;

export interface IPiece {
    type: string;
    rotation: number;
    x: number;
    y: number;
    pieceNumber: number;
}

// Checks the falling piece a player streams to the spectators, pieces are at most 4 cells wide
export const isValidPiece = (piece: unknown): piece is IPiece => {
    if (!piece || typeof piece !== 'object') {
        return false;
    }
    const { type, rotation, x, y, pieceNumber } = piece as Record<string, unknown>;
    return (
        isIntInRange(pieceNumber, 0, Number.MAX_SAFE_INTEGER) &&
        typeof type === 'string' &&
        pieceValues.includes(type) &&
        isIntInRange(rotation, 0, 3) &&
        isIntInRange(x, -3, GAME_CONSTANTS.COLS) &&
        isIntInRange(y, -3, GAME_CONSTANTS.ROWS)
    );
};
