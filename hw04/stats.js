export function mean(values) {
    return values.reduce((acc, x) => acc + x, 0) / values.length;
}

export function variance(values) {
    const m = mean(values);
    return values.reduce((acc, x) => acc + (x - m) ** 2, 0) / values.length;
}

export function stdDev(values) {
    return Math.sqrt(variance(values));
}

export function histogram(values, numBins = 30) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / numBins;

    const bins = Array.from({ length: numBins }, (_, i) => ({
        min: min + i * binWidth,
        max: min + (i + 1) * binWidth,
        count: 0,
        frequency: 0
    }));

    values.forEach(v => {
        const idx = Math.min(
            Math.floor((v - min) / binWidth),
            numBins - 1
        );
        bins[idx].count++;
    });

    const total = values.length;
    bins.forEach(bin => bin.frequency = bin.count / total);

    return {bins, binWidth, min, max};
}

export function normalPDF(x, mean = 0, variance = 1) {
    const sigma = Math.sqrt(variance);
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * ((x - mean) / sigma) ** 2);
}

export function llnConvergence(trajectories, theoreticalMean) {
    const finalValues = trajectories.map(t => t[t.length - 1].SnOverN);
    const empiricalMean = mean(finalValues);
    const empiricalVar = variance(finalValues);

    return {
        empiricalMean: empiricalMean.toFixed(4),
        theoreticalMean: theoreticalMean.toFixed(4),
        empiricalVariance: empiricalVar.toFixed(6),
        error: Math.abs(empiricalMean - theoreticalMean).toFixed(6)
    };
}

export function cltConvergence(trajectories, theoreticalVariance) {
    const finalValues = trajectories.map(t => t[t.length - 1].SnOverSqrtN);
    const empiricalMean = mean(finalValues);
    const empiricalVar = variance(finalValues);

    return {
        empiricalMean: empiricalMean.toFixed(4),
        empiricalVariance: empiricalVar.toFixed(4),
        theoreticalVariance: theoreticalVariance.toFixed(4),
        varianceError: Math.abs(empiricalVar - theoreticalVariance).toFixed(6)
    };
}

export function varianceAnalysis(trajectories) {
    const Sn = trajectories.map(t => t[t.length - 1].Sn);
    const SnOverN = trajectories.map(t => t[t.length - 1].SnOverN);
    const SnOverSqrtN = trajectories.map(t => t[t.length - 1].SnOverSqrtN);

    return {
        varSn: variance(Sn).toFixed(4),
        varSnOverN: variance(SnOverN).toFixed(6),
        varSnOverSqrtN: variance(SnOverSqrtN).toFixed(4)
    };
}


export function fullStats(values) {
    return {
        mean: mean(values).toFixed(4),
        variance: variance(values).toFixed(4),
        stdDev: stdDev(values).toFixed(4),
        min: Math.min(...values).toFixed(4),
        max: Math.max(...values).toFixed(4)
    };
}