export function welfordUpdate(state, x) {
    const n = state.n + 1;
    const delta = x - state.mean;
    const mean = state.mean + delta / n;
    const delta2 = x - mean;
    const SS = state.SS + delta * delta2;

    return {n, mean, SS};
}

export function welfordInit() {
    return {n: 0, mean: 0, SS: 0};
}

export function welfordVariance(state) {
    if (state.n < 2) return 0;
    return state.SS / (state.n - 1);
}

export function welfordArray(values) {
    let state = welfordInit();
    for (const x of values) {
        state = welfordUpdate(state, x);
    }
    return {
        mean: state.mean,
        variance: welfordVariance(state),
        n: state.n
    };
} 