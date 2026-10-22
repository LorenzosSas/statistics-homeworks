import { letterFrequency, caesarEncrypt, recoverKey } from "./caesar.js";


export function compareDistributions(plaintext, ciphertext) {
    const plainFreq = letterFrequency(plaintext);
    const cipherFreq = letterFrequency(ciphertext);

    return {
        plaintext: plainFreq.freq,
        ciphertext: cipherFreq.freq,
        plaintextTotal: plainFreq.total,
        ciphertextTotal: cipherFreq.total
    };
}

export function indexOfCoincidence(text) {
    const {freq, total} = letterFrequency(text);
    if (total < 2) return 0;

    let sum = 0;
    for (const char in freq) {
        const count = freq[char] / 100 * total;
        sum += count * (count - 1);
    }

    return sum / (total * (total - 1));
}

export function shannonEntropy(text) {
    const {freq, total} = letterFrequency(text);
    if (total === 0) return 0;

    let entropy = 0;
    for (const char in freq) {
        const p = freq[char] / 100;
        if (p > 0) entropy -= p * Math.log2(p);
    }

    return entropy.toFixed(4);
}

export function fullStatAnalysis(plaintext, caesarCiphertext, eccCiphertext) {
    return {
        plaintext: {
            ic: indexOfCoincidence(plaintext).toFixed(4),
            entropy: shannonEntropy(plaintext),
            freq: letterFrequency(plaintext).freq
        },
        caesar: {
            ic: indexOfCoincidence(caesarCiphertext).toFixed(4),
            entropy: shannonEntropy(caesarCiphertext),
            freq: letterFrequency(caesarCiphertext).freq,
            note: "Caesar preserves letter frequencies - IC stays high, entropy unchanged"
        },
        ecc: {
            ic: null,
            entropy: null,
            freq: null,
            note: "ECC operates on curve points, not letters - standard letter statistics do not apply"
        }
    };
}

export function analyzeByLength(plaintext, shift) { 
    const lengths = [10, 20, 50, 100, 200, plaintext.length];
    const results = [];

    for (const len of lengths) { 
        if (len > plaintext.length) continue;
        const sample = plaintext.slice(0, len);
        const encrypted = caesarEncrypt(sample, shift);
        const {bestShift, bestScore} = recoverKey(encrypted);
        results.push({
            length: len,
            recovered: bestShift === shift,
            bestShift, score: bestScore
        }); 
    }
    
    return results;
} 
