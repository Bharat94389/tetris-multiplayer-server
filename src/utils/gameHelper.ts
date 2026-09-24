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
