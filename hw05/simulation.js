import { welfordInit, welfordUpdate, welfordVariance } from "./welford.js";

export const DISTRIBUTIONS = {
    uniform: {
        name: 'Uniform (0-10)',
        mean: 5,
        variance: 10,
        sample: () => Math.floor(Math.random() * 11)
    },
    triangular: {
        name: 'Triangular (peak at 5)',
        mean: 5,
        variance: 70 / 12,
        sample: () => Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6)
    },
    skewedLow: {
        name: 'Skewed Low (weak attacker)',
        mean: 2.5,
        variance: 6.25,
        sample: () => Math.floor(Math.random() * 11 * Math.random())
    },
    skewedHigh: {
        name: 'Skewed High (expert attacker)',
        mean: 7.5,
        variance: 6.25,
        sample: () => 10 - Math.floor(Math.random() * 11 * Math.random())
    },
    bimodal: {
        name: 'Bimodal (novice or expert)',
        mean: 5,
        variance: 250 / 6 - 25,
        sample: () => {
            return Math.random() < 0.5
                ? Math.floor(Math.random() * 3)
                : Math.floor(8 + Math.random() * 3);
        }
    }
};

export function simulateHacker(n, distribution) {
    let state = welfordInit();
    const scores = [];

    for (let i = 0; i < n; i++) {
        const score = distribution.sample();
        scores.push(score);
        state = welfordUpdate(state, score);
    }

    return {
        scores,
        samplingMean: state.mean,
        samplingVariance: welfordVariance(state),
        n: state.n
    };
}

export function simulateHackers(n, m, distribution) {
    const hackers = Array.from({length: m}, () => simulateHacker(n, distribution));

    const meanOfMeans = hackers.reduce((acc, h) => acc + h.samplingMean, 0) / m;

    const meanOfVariances = hackers.reduce((acc, h) => acc + h.samplingVariance, 0) / m;

    return {
        hackers,
        meanOfMeans,
        meanOfVariances,
        theoreticalMean: distribution.mean,
        theoreticalVariance: distribution.variance
    };
}

export function experimentByN(nValues, m, distribution) {
    return nValues.map(n => {
        const result = simulateHackers(n, m, distribution);
        const samplingMeans = result.hackers.map(h => h.samplingMean);
        const samplingVariances = result.hackers.map(h => h.samplingVariance);

        const varOfMeans = samplingMeans.reduce((acc, x) => {
            const diff = x - result.meanOfMeans;
            return acc + diff * diff;
        }, 0) / m;

        return {
            n,
            meanOfMeans: result.meanOfMeans,
            meanOfVariances: result.meanOfVariances,
            varOfMeans,
            theoreticalMean: distribution.mean,
            theoreticalVariance: distribution.variance,
            theoreticalVarOfMeans: distribution.variance / n
        };
    });
} 