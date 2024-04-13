import { GAME_CONSTANTS } from '../constants';

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
