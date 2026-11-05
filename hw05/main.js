import { DISTRIBUTIONS, simulateHackers, experimentByN } from "./simulation.js";
import { drawDistributionHistogram, drawVarOfMeansByN, drawMeanOfVariancesByN, drawScoreDistribution } from "./charts.js";

const distributionSelect = document.getElementById('distribution-select');
const nInput = document.getElementById('n-input');
const mInput = document.getElementById('m-input');
const simulateBtn = document.getElementById('simulate-btn');
const errorOutput = document.getElementById('error-output');

Object.entries(DISTRIBUTIONS).forEach(([key, dist]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = dist.name;
    distributionSelect.appendChild(option);
});

function validateInputs(n, m) {
    if (isNaN(n) || n < 2) return 'n must be at least 2.';
    if (isNaN(m) || m < 1) return 'm must be a positive integer.';
    if (n > 10000) return 'n must be ≤ 10000.';
    if (m > 1000) return 'm must be ≤ 1000.';
    return null;
}

function renderStats(result, n, m) {
    const dist = DISTRIBUTIONS[distributionSelect.value];

    document.getElementById('stats-output').innerHTML = `
        <div class="stat-block">
            <h3>Theoretical Values</h3>
            <p>μ (theoretical mean): ${dist.mean.toFixed(4)}</p>
            <p>σ² (theoretical variance): ${dist.variance.toFixed(4)}</p>
        </div>

        <div class="stat-block">
            <h3>Sampling Results (n=${n}, m=${m} hackers)</h3>
            <p>Average of sampling means: ${result.meanOfMeans.toFixed(4)}</p>
            <p>Error vs μ: ${Math.abs(result.meanOfMeans - dist.mean).toFixed(4)}</p>
            <p>Average of sampling variances: ${result.meanOfVariances.toFixed(4)}</p>
            <p>Error vs σ²: ${Math.abs(result.meanOfVariances - dist.variance).toFixed(4)}</p>
        </div>

        <div class="stat-block">
            <h3>Variance of Sampling Means</h3>
            <p>Empirical Var(X̄): ${result.hackers.reduce((acc, h) => {
                const diff = h.samplingMean - result.meanOfMeans;
                return acc + diff * diff;
            }, 0) / m < 0.0001 
                ? '< 0.0001' 
                : (result.hackers.reduce((acc, h) => {
                    const diff = h.samplingMean - result.meanOfMeans;
                    return acc + diff * diff;
                }, 0) / m).toFixed(4)
            }</p>
            <p>Theoretical σ²/n: ${(dist.variance / n).toFixed(4)}</p>
            <p>As n increases, Var(X̄) = σ²/n → 0 (Law of Large Numbers)</p>
        </div>
    `;
}

simulateBtn.addEventListener('click', () => {
    const n = parseInt(nInput.value);
    const m = parseInt(mInput.value);
    const distKey = distributionSelect.value;
    const dist = DISTRIBUTIONS[distKey];

    const error = validateInputs(n, m);
    if (error) {errorOutput.textContent = error; return;}
    errorOutput.textContent = '';

    const result = simulateHackers(n, m, dist);

    drawScoreDistribution('canvas-score-dist', dist);

    const samplingMeans = result.hackers.map(h => h.samplingMean);
    drawDistributionHistogram(
        'canvas-means-dist',
        samplingMeans,
        dist.mean,
        dist.variance / n
    );

    renderStats(result, n, m);

    const nValues = [2, 5, 10, 20, 50, 100, 200, 500, n].filter((v, i, arr) => arr.indexOf(v) === i).sort((a, b) => a - b);
    const expResults = experimentByN(nValues, m, dist);

    drawVarOfMeansByN('canvas-var-by-n', expResults);
    drawMeanOfVariancesByN('canvas-var-of-var-by-n', expResults);
});

distributionSelect.addEventListener('change', () => {
    const dist = DISTRIBUTIONS[distributionSelect.value];
    drawScoreDistribution('canvas-score-dist', dist);

    document.getElementById('theoretical-mean').textContent = dist.mean.toFixed(4);
    document.getElementById('theoretical-variance').textContent = dist.variance.toFixed(4);
});

nInput.value = 100;
mInput.value = 100;

const defaultDist = DISTRIBUTIONS[distributionSelect.value || 'uniform'];
drawScoreDistribution('canvas-score-dist', defaultDist);
document.getElementById('theoretical-mean').textContent = defaultDist.mean.toFixed(4);
document.getElementById('theoretical-variance').textContent = defaultDist.variance.toFixed(4); 