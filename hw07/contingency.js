import { discretize } from "./datasets.js";

export function prepareData(data, type, numBins = 4) {
    if (type === 'continuous') {
        const xValues = data.map(r => r.X);
        const fValues = data.map(r => r.F);
        const xDiscrete = discretize(xValues, numBins);
        const fDiscrete = discretize(fValues, numBins);
        return data.map((_, i) => ({ X: xDiscrete[i], F: fDiscrete[i] }));
    }
    return data.map(r => ({X: String(r.X), F: String(r.F)}));
}

export function buildContingencyTable(data) {
    const xCategories = [...new Set(data.map(r => r.X))].sort();
    const fCategories = [...new Set(data.map(r => r.F))].sort();
    const n = data.length;

    const observed = {};
    xCategories.forEach(x => {
        observed[x] = {};
        fCategories.forEach(f => {observed[x][f] = 0;});
    });
    data.forEach(({X, F}) => {observed[X][F]++;});

    const rowTotals = {};
    xCategories.forEach(x => {
        rowTotals[x] = fCategories.reduce((acc, f) => acc + observed[x][f], 0);
    });

    const colTotals = {};
    fCategories.forEach(f => {
        colTotals[f] = xCategories.reduce((acc, x) => acc + observed[x][f], 0);
    });

    const rowFreq = {};
    xCategories.forEach(x => {rowFreq[x] = rowTotals[x] / n;});

    const colFreq = {};
    fCategories.forEach(f => {colFreq[f] = colTotals[f] / n;});

    const conditionalFgivenX = {};
    xCategories.forEach(x => {
        conditionalFgivenX[x] = {};
        fCategories.forEach(f => {
            conditionalFgivenX[x][f] = rowTotals[x] > 0
                ? observed[x][f] / rowTotals[x]
                : 0;
        });
    });

    const conditionalXgivenF = {};
    fCategories.forEach(f => {
        conditionalXgivenF[f] = {};
        xCategories.forEach(x => {
            conditionalXgivenF[f][x] = colTotals[f] > 0
                ? observed[x][f] / colTotals[f]
                : 0;
        });
    });

    return {
        observed,
        rowTotals,
        colTotals,
        rowFreq,
        colFreq,
        conditionalFgivenX,
        conditionalXgivenF,
        xCategories,
        fCategories,
        n
    };
}

export function expectedFrequencies(table) {
    const {rowTotals, colTotals, xCategories, fCategories, n} = table;
    const expected = {};

    xCategories.forEach(x => {
        expected[x] = {};
        fCategories.forEach(f => {
            expected[x][f] = (rowTotals[x] * colTotals[f]) / n;
        });
    });

    return expected;
}

export function chiSquareStatistic(table, expected) {
    const { observed, xCategories, fCategories } = table;
    let chi2 = 0;
    let degreesOfFreedom = (xCategories.length - 1) * (fCategories.length - 1);
    const contributions = {};

    xCategories.forEach(x => {
        contributions[x] = {};
        fCategories.forEach(f => {
            const O = observed[x][f];
            const E = expected[x][f];
            const contrib = E > 0 ? Math.pow(O - E, 2) / E : 0;
            contributions[x][f] = contrib;
            chi2 += contrib;
        });
    });

    return {chi2, degreesOfFreedom, contributions};
}

export function interpret(chi2, degreesOfFreedom, pValue, alpha = 0.05) {
    const isDependent = pValue < alpha;

    return {
        isDependent,
        alpha,
        conclusion: isDependent
            ? `The variables appear statistically dependent (χ²=${chi2.toFixed(4)}, p=${pValue.toFixed(4)} < ${alpha}).`
            : `The variables appear statistically independent (χ²=${chi2.toFixed(4)}, p=${pValue.toFixed(4)} ≥ ${alpha}).`,
        causalityNote: isDependent
            ? 'Statistical association does not imply causality. A significant chi-square only indicates that the variables are not independent in the sample — it does not establish a causal relationship.'
            : 'No significant association was found in this sample. This does not prove independence in the population — it may simply reflect insufficient sample size.'
    };
}