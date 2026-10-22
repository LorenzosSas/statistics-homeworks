export function caesarEncrypt(message, shift) {
    return message.split('').map(char => shiftChar(char, shift)).join('');
}

export function caesarDecrypt(message, shift) {
    return caesarEncrypt(message, -shift);
}

function shiftChar(char, shift) {
    if (char >= 'A' && char <= 'Z') {
        return String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26 + 26) % 26 + 65);
    }
    if (char >= 'a' && char <= 'z') {
        return String.fromCharCode(((char.charCodeAt(0) - 97 + shift) % 26 + 26) % 26 + 97);
    }
    return char;
}

const ENGLISH_FREQ = {
    'a': 8.2, 'b': 1.5, 'c': 2.8, 'd': 4.3, 'e': 12.7,
    'f': 2.2, 'g': 2.0, 'h': 6.1, 'i': 7.0, 'j': 0.2,
    'k': 0.8, 'l': 4.0, 'm': 2.4, 'n': 6.7, 'o': 7.5,
    'p': 1.9, 'q': 0.1, 'r': 6.0, 's': 6.3, 't': 9.1,
    'u': 2.8, 'v': 1.0, 'w': 2.4, 'x': 0.2, 'y': 2.0,
    'z': 0.1
};

export function letterFrequency(text) {
    const freq = {};
    let total = 0;

    for (const char of text.toLowerCase()) {
        if (char >= 'a' && char <= 'z') {
            freq[char] = (freq[char] || 0) + 1;
            total++;
        }
    }

    const result = {};
    for (const char in freq) {
        result[char] = (freq[char] / total * 100);
    }

    return {freq: result, total};
}

function chiSquareScore(text) {
    const {freq, total} = letterFrequency(text);
    if (total === 0) return Infinity;

    let score = 0;
    for (const char of 'abcdefghijklmnopqrstuvwxyz') {
        const observed = (freq[char] || 0) / 100 * total;
        const expected = ENGLISH_FREQ[char] / 100 * total;
        score += Math.pow(observed - expected, 2) / expected;
    }

    return score;
}

export function recoverKey(ciphertext) {
    let bestShift = 0;
    let bestScore = Infinity;
    const scores = [];

    for (let shift = 0; shift < 26; shift++) {
        const decrypted = caesarDecrypt(ciphertext, shift);
        const score = chiSquareScore(decrypted);
        scores.push({ shift, score: score.toFixed(2), decrypted });

        if (score < bestScore) {
            bestScore = score;
            bestShift = shift;
        }
    }

    return {
        bestShift,
        bestScore: bestScore.toFixed(2),
        decrypted: caesarDecrypt(ciphertext, bestShift),
        scores
    };
}

export function exhaustiveSearch(ciphertext) {
    const results = [];
    for (let shift = 0; shift < 26; shift++) {
        results.push({
            shift,
            decrypted: caesarDecrypt(ciphertext, shift)
        });
    }
    return results;
}
