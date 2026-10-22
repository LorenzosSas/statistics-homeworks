import { mod, curvePointAddition, multiplyPointScalarFast, computeGroupPoints, CURVE_PRIME } from "../hw01/logic.js";
import { eccDecrypt } from "./ecc.js";

export function bruteForceAttack(ciphertext, basePoint, publicKey) {
    const groupPoints = computeGroupPoints(basePoint);
    const maxK = groupPoints.length;

    for (let k = 1; k <= maxK; k++) {
        const candidatePublicKey = multiplyPointScalarFast(k, basePoint);

        if (candidatePublicKey && 
            candidatePublicKey.x === publicKey.x && 
            candidatePublicKey.y === publicKey.y) {
            const decrypted = eccDecrypt(ciphertext, k);
            return {
                privateKey: k,
                stepsRequired: k,
                decrypted
            };
        }
    }

    return null;
}

export function babyStepGiantStep(basePoint, publicKey, groupOrder) {
    const m = Math.ceil(Math.sqrt(groupOrder));
    const babySteps = new Map();
    let current = null;

    for (let i = 0; i < m; i++) {
        if (current === null) {
            babySteps.set('null', 0);
        } else {
            babySteps.set(`${current.x},${current.y}`, i);
        }
        current = curvePointAddition(current, basePoint);
    }

    const mG = multiplyPointScalarFast(m, basePoint);
    const negMG = mG ? { x: mG.x, y: mod(mod(-mG.y, CURVE_PRIME) + CURVE_PRIME, CURVE_PRIME)} : null;

    let gamma = publicKey;
    for (let j = 0; j <= m; j++) {
        const key = gamma === null ? 'null' : `${gamma.x},${gamma.y}`;

        if (babySteps.has(key)) {
            const i = babySteps.get(key);
            const k = j * m + i;
            return {
                privateKey: k,
                babySteps: m,
                giantSteps: j + 1,
                totalSteps: m + j + 1
            };
        }

        gamma = curvePointAddition(gamma, negMG);
    }

    return null;
}

export function compareAttacks(ciphertext, basePoint, publicKey) {
    const groupPoints = computeGroupPoints(basePoint);
    const groupOrder = groupPoints.length + 1;

    const bfStart = performance.now();
    const bfResult = bruteForceAttack(ciphertext, basePoint, publicKey);
    const bfTime = (performance.now() - bfStart).toFixed(3);

    const bsgsStart = performance.now();
    const bsgsResult = babyStepGiantStep(basePoint, publicKey, groupOrder);
    const bsgsTime = (performance.now() - bsgsStart).toFixed(3);

    return {
        bruteForce: {...bfResult, timeMs: bfTime},
        babyStepGiantStep: {...bsgsResult, timeMs: bsgsTime},
        groupOrder
    };
} 
