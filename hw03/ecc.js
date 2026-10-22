import { mod, curvePointAddition, multiplyPointScalarFast, computeValidCurvePoints, CURVE_PRIME } from '../hw01/logic.js';

export function buildEmbeddingTable() {
    const points = computeValidCurvePoints();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ,.!?';

    const pointToChar = new Map();
    const charToPoint = new Map();

    points.forEach((point, i) => {
        if (i < chars.length) {
            const key = `${point.x},${point.y}`;
            pointToChar.set(key, chars[i]);
            charToPoint.set(chars[i], point);
        }
    });

    return {pointToChar, charToPoint, points};
}

export function negatePoint(point) {
    if (point === null) return null;
    return {x: point.x, y: mod(mod(-point.y, CURVE_PRIME) + CURVE_PRIME, CURVE_PRIME)};
}

export function eccEncrypt(message, publicKey, basePoint, r) {
    const {charToPoint} = buildEmbeddingTable();
    const ciphertext = [];

    for (const char of message) {
        const M = charToPoint.get(char);
        if (!M) throw new Error(`Character '${char}' cannot be embedded on this curve`);

        const C1 = multiplyPointScalarFast(r, basePoint);
        const rQ = multiplyPointScalarFast(r, publicKey);
        const C2 = curvePointAddition(M, rQ);

        ciphertext.push({ C1, C2 });
    }

    return ciphertext;
}

export function eccDecrypt(ciphertext, privateKey) {
    const { pointToChar } = buildEmbeddingTable();
    let message = '';

    for (const { C1, C2 } of ciphertext) {
        const rQ = multiplyPointScalarFast(privateKey, C1);
        const minusRQ = negatePoint(rQ);
        const M = curvePointAddition(C2, minusRQ);

        const key = `${M.x},${M.y}`;
        const char = pointToChar.get(key);
        if (!char) throw new Error(`Decrypted point (${M.x}, ${M.y}) has no character mapping`);

        message += char;
    }

    return message;
}

export function generatePublicKey(privateKey, basePoint) {
    return multiplyPointScalarFast(privateKey, basePoint);
}
