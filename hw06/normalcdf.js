const SQRT_2 = Math.sqrt(2);
const SQRT_2PI = Math.sqrt(2 * Math.PI);

export function normalCDFSimpson(x, n = 1000) {
    const phi = t => Math.exp(-0.5 * t * t) / SQRT_2PI;

    if (x === 0) return 0.5;

    const a = -8;
    const b = x;

    if (n % 2 !== 0) n++;
    const h = (b - a) / n;
    let sum = phi(a) + phi(b);

    for (let i = 1; i < n; i++) {
        sum += phi(a + i * h) * (i % 2 === 0 ? 2 : 4);
    }

    return Math.max(0, Math.min(1, sum * h / 3));
}

export function erfSeries(x, terms = 50) {
    let sum = 0;
    let term = x;
    let sign = 1;
    let factorial = 1;

    for (let n = 0; n < terms; n++) {
        if (n > 0) {
            sign *= -1;
            factorial *= n;
            term *= x * x;
        }
        sum += sign * term / (factorial * (2 * n + 1));
    }

    return (2 / Math.sqrt(Math.PI)) * sum;
}

export function normalCDFErf(x) {
    return 0.5 * (1 + erfSeries(x / SQRT_2));
}

export function normalCDFRational(x) {
    const p = 0.2316419;
    const b1 = 0.319381530;
    const b2 = -0.356563782;
    const b3 = 1.781477937;
    const b4 = -1.821255978;
    const b5 = 1.330274429;

    const phi = t => Math.exp(-0.5 * t * t) / SQRT_2PI;

    if (x >= 0) {
        const t = 1 / (1 + p * x);
        const poly = t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5))));
        return 1 - phi(x) * poly;
    } else {
        return 1 - normalCDFRational(-x);
    }
}

export function compareMethods(xValues) {
    return xValues.map(x => {
        const simpson = normalCDFSimpson(x);
        const erf = normalCDFErf(x);
        const rational = normalCDFRational(x);

        return {
            x,
            simpson,
            erf,
            rational,
            diffSimpsonRational: Math.abs(simpson - rational),
            diffErfRational: Math.abs(erf - rational)
        };
    });
}

export function erfConvergence(x, maxTerms = 50) {
    const exact = normalCDFRational(x);
    const results = [];

    for (let terms = 1; terms <= maxTerms; terms++) {
        const value = 0.5 * (1 + erfSeries(x / SQRT_2, terms));
        results.push({
            terms,
            value,
            error: Math.abs(value - exact)
        });
    }

    return results;
}

export function simpsonConvergence(x, nValues) {
    const exact = normalCDFRational(x);
    return nValues.map(n => ({
        n,
        value: normalCDFSimpson(x, n),
        error: Math.abs(normalCDFSimpson(x, n) - exact)
    }));
} 