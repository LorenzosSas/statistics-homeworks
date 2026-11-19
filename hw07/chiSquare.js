function gamma(n) {
    if (n < 0.5) {
        return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n));
    }

    n -= 1;
    const g = 7;
    const c = [
        0.99999999999980993,
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.13857109526572012,
        9.9843695780195716e-6,
        1.5056327351493116e-7
    ];

    let x = c[0];
    for (let i = 1; i < g + 2; i++) {
        x += c[i] / (n + i);
    }

    const t = n + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;
}

function lowerIncompleteGamma(s, x, terms = 100) {
    if (x < 0) return 0;
    if (x === 0) return 0;

    let sum = 0;
    let term = 1 / (s);
    sum = term;

    for (let n = 1; n < terms; n++) {
        term *= x / (s + n);
        sum += term;
        if (Math.abs(term) < 1e-15 * Math.abs(sum)) break;
    }

    return Math.pow(x, s) * Math.exp(-x) * sum;
}

export function chiSquareCDF(x, k) {
    if (x <= 0) return 0;
    if (k <= 0) throw new Error('Degrees of freedom must be positive');

    const s = k / 2;
    const halfX = x / 2;

    return lowerIncompleteGamma(s, halfX) / gamma(s);
}

export function chiSquarePValue(chi2, degreesOfFreedom) {
    if (chi2 < 0) throw new Error('Chi-square statistic must be non-negative');
    if (degreesOfFreedom < 1) throw new Error('Degrees of freedom must be at least 1');
    return Math.max(0, Math.min(1, 1 - chiSquareCDF(chi2, degreesOfFreedom)));
}

export function chiSquarePDF(x, k) {
    if (x <= 0) return 0;
    const s = k / 2;
    return Math.pow(x, s - 1) * Math.exp(-x / 2) /
        (Math.pow(2, s) * gamma(s));
}

const CRITICAL_VALUES = {
    0.10: [2.706, 4.605, 6.251, 7.779, 9.236, 10.645, 12.017, 13.362, 14.684, 15.987],
    0.05: [3.841, 5.991, 7.815, 9.488, 11.070, 12.592, 14.067, 15.507, 16.919, 18.307],
    0.01: [6.635, 9.210, 11.345, 13.277, 15.086, 16.812, 18.475, 20.090, 21.666, 23.209]
};

export function criticalValue(alpha, df) {
    const table = CRITICAL_VALUES[alpha];
    if (!table) throw new Error(`Alpha ${alpha} not in table. Use 0.10, 0.05, or 0.01`);
    if (df < 1 || df > 10) return null;
    return table[df - 1];
}