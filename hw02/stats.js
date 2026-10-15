import {bytesToHex} from './pipeline.js';
import {keccak_256} from 'https://cdn.jsdelivr.net/npm/@noble/hashes@1.5.0/sha3/+esm';

function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
}

function hammingDistance(a, b) {
    let dist = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        dist += (a[i] ^ b[i]).toString(2).split('1').length - 1;
    }
    return dist;
}

export function avalancheKeccak(input) {
    const encoder = new TextEncoder();
    const inputBytes = encoder.encode(input);
    const originalHash = keccak_256(inputBytes);
    const results = [];

    for (let bit = 0; bit < 8; bit++) {
        const modified = new Uint8Array(inputBytes);
        modified[0] ^= (1 << bit);
        const modifiedHash = keccak_256(modified);
        const bitsChanged = hammingDistance(originalHash, modifiedHash);
        const totalBits = originalHash.length * 8;
        results.push({
            bit,
            bitsChanged,
            percentage: (bitsChanged / totalBits * 100).toFixed(1)
        });
    }

    const avgBitsChanged = results.reduce((acc, r) => acc + r.bitsChanged, 0) / results.length;
    const avgPercentage = (avgBitsChanged / (originalHash.length * 8) * 100).toFixed(1);

    return {results, avgBitsChanged: avgBitsChanged.toFixed(2), avgPercentage};
}

export async function addressByteDistribution(addresses) {
    const byteCounts = new Array(256).fill(0);
    let totalBytes = 0;

    addresses.forEach(addr => {
        const hex = addr.replace('0x', '');
        for (let i = 0; i < hex.length; i += 2) {
            byteCounts[parseInt(hex.slice(i, i + 2), 16)]++;
            totalBytes++;
        }
    });

    const expectedFreq = totalBytes / 256;
    const chiSquare = byteCounts.reduce((acc, count) => {
        return acc + Math.pow(count - expectedFreq, 2) / expectedFreq;
    }, 0);

    const nonZero = byteCounts.filter(c => c > 0);
    const min = Math.min(...nonZero);
    const max = Math.max(...byteCounts);
    const avg = (totalBytes / 256).toFixed(2);

    return {byteCounts, chiSquare: chiSquare.toFixed(2), min, max, avg, totalBytes};
}

export function bitDistributionKeccak(inputs) {
    let zeros = 0, ones = 0;

    inputs.forEach(input => {
        const hash = keccak_256(new TextEncoder().encode(input));
        hash.forEach(byte => {
            const bits = byte.toString(2).padStart(8, '0');
            zeros += bits.split('0').length - 1;
            ones += bits.split('1').length - 1;
        });
    });

    const total = zeros + ones;
    return {
        zeros,
        ones,
        ratio: (ones / total * 100).toFixed(1)
    };
}

export function eip55UppercaseDistribution(addresses) {
    const results = addresses.map(addr => {
        const hex = addr.replace('0x', '');
        const letters = hex.replace(/[0-9]/g, '');
        const uppercase = letters.replace(/[a-z]/g, '').length;
        const total = letters.length;
        return { uppercase, total, ratio: (uppercase / total * 100).toFixed(1) };
    });

    const avgUppercase = (results.reduce((acc, r) => acc + parseFloat(r.ratio), 0) / results.length).toFixed(1);

    return {results, avgUppercase};
}
