export function bernoulli(p) {
    return Math.random() < p ? 1 : 0;
}

export function rademacher() {
    return Math.random() < 0.5 ? 1 : -1;
}
export function simulateTrajectory(n, model, p = 0.5) {
    const steps = [];
    let cumSum = 0;

    for (let i = 1; i <= n; i++) {
        const X = model === 'bernoulli' ? bernoulli(p) : rademacher();
        cumSum += X;

        steps.push({
            i,
            Sn: cumSum,
            SnOverN: cumSum / i,
            SnOverSqrtN: cumSum / Math.sqrt(i)
        });
    }

    return steps;
}

export function simulateMultiple(n, m, model, p = 0.5) {
    return Array.from({length: m}, () => simulateTrajectory(n, model, p));
}

export function finalDistribution(trajectories) {
    return {
        Sn: trajectories.map(t => t[t.length - 1].Sn),
        SnOverN: trajectories.map(t => t[t.length - 1].SnOverN),
        SnOverSqrtN: trajectories.map(t => t[t.length - 1].SnOverSqrtN)
    };
}

export function theoreticalValues(n, model, p = 0.5) {
    const mean = model === 'bernoulli' ? p : 0;
    const variance = model === 'bernoulli' ? p * (1 - p) : 1;

    return {
        meanSn: mean * n,
        varSn: variance * n,

        meanSnOverN: mean,
        varSnOverN: variance / n,

        meanSnOverSqrtN: 0,
        varSnOverSqrtN: variance
    };
} 