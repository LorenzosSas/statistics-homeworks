import { simulateMultiple, finalDistribution, theoreticalValues } from './simulation.js';
import { mean, variance, llnConvergence, cltConvergence, varianceAnalysis, fullStats } from './stats.js';
import { drawTrajectories, drawHistogram } from './charts.js';

const nInput = document.getElementById('n-input');
const mInput = document.getElementById('m-input');
const pInput = document.getElementById('p-input');
const simulateBtn = document.getElementById('simulate-btn');
const errorOutput = document.getElementById('error-output');

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

function validateInputs(n, m, p) {
    if (isNaN(n) || n < 1) { return 'n must be a positive integer.'; }
    if (isNaN(m) || m < 1) { return 'm must be a positive integer.'; }
    if (isNaN(p) || p < 0 || p > 1) { return 'p must be between 0 and 1.'; }
    if (n > 10000) { return 'n must be ≤ 10000.'; }
    if (m > 1000) { return 'm must be ≤ 1000.'; }
    return null;
}

function renderStats(id, trajectories, dist, theoretical, model) {
    const lln = llnConvergence(trajectories, theoretical.meanSnOverN);
    const clt = cltConvergence(trajectories, theoretical.varSnOverSqrtN);
    const varAnalysis = varianceAnalysis(trajectories);

    document.getElementById(id).innerHTML = `
        <div class="stat-block">
            <h3>Descriptive Statistics</h3>
            <p>Sₙ — mean: ${fullStats(dist.Sn).mean}, variance: ${fullStats(dist.Sn).variance}</p>
            <p>Sₙ/n — mean: ${fullStats(dist.SnOverN).mean}, variance: ${fullStats(dist.SnOverN).variance}</p>
            <p>Sₙ/√n — mean: ${fullStats(dist.SnOverSqrtN).mean}, variance: ${fullStats(dist.SnOverSqrtN).variance}</p>
        </div>

        <div class="stat-block">
            <h3>Theoretical Values</h3>
            <p>E[Sₙ] = ${theoretical.meanSn}, Var[Sₙ] = ${theoretical.varSn}</p>
            <p>E[Sₙ/n] = ${theoretical.meanSnOverN}, Var[Sₙ/n] = ${theoretical.varSnOverN.toFixed(6)}</p>
            <p>E[Sₙ/√n] = ${theoretical.meanSnOverSqrtN}, Var[Sₙ/√n] = ${theoretical.varSnOverSqrtN}</p>
        </div>

        <div class="stat-block">
            <h3>Law of Large Numbers</h3>
            <p>Empirical mean of Sₙ/n: ${lln.empiricalMean}</p>
            <p>Theoretical mean: ${lln.theoreticalMean}</p>
            <p>Error: ${lln.error}</p>
            <p>Variance of Sₙ/n: ${lln.empiricalVariance}</p>
        </div>

        <div class="stat-block">
            <h3>Central Limit Theorem</h3>
            <p>Empirical mean of Sₙ/√n: ${clt.empiricalMean} (ideal: 0)</p>
            <p>Empirical variance of Sₙ/√n: ${clt.empiricalVariance}</p>
            <p>Theoretical variance: ${clt.theoreticalVariance}</p>
            <p>Variance error: ${clt.varianceError}</p>
        </div>

        <div class="stat-block">
            <h3>Variance under different normalizations</h3>
            <p>Var[Sₙ] = ${varAnalysis.varSn} (grows with n)</p>
            <p>Var[Sₙ/n] = ${varAnalysis.varSnOverN} (shrinks to 0)</p>
            <p>Var[Sₙ/√n] = ${varAnalysis.varSnOverSqrtN} (stabilizes)</p>
        </div>
    `;
}

simulateBtn.addEventListener('click', () => {
    const n = parseInt(nInput.value);
    const m = parseInt(mInput.value);
    const p = parseFloat(pInput.value);

    const error = validateInputs(n, m, p);
    if (error) { errorOutput.textContent = error; return; }
    errorOutput.textContent = '';

    const trajB = simulateMultiple(n, m, 'bernoulli', p);
    const distB = finalDistribution(trajB);
    const thB = theoreticalValues(n, 'bernoulli', p);

    drawTrajectories('canvas-b-sn', trajB, 'Sn', 'bernoulli', thB.meanSn);
    drawTrajectories('canvas-b-sn-n', trajB, 'SnOverN', 'bernoulli', thB.meanSnOverN);
    drawTrajectories('canvas-b-sn-sqrt-n', trajB, 'SnOverSqrtN', 'bernoulli', null);

    drawHistogram('canvas-b-hist-sn', distB.Sn, 'bernoulli', null);
    drawHistogram('canvas-b-hist-sn-n', distB.SnOverN, 'bernoulli', null);
    drawHistogram('canvas-b-hist-sn-sqrt-n', distB.SnOverSqrtN, 'bernoulli', thB.varSnOverSqrtN);

    renderStats('stats-bernoulli', trajB, distB, thB, 'bernoulli');

    const trajR = simulateMultiple(n, m, 'rademacher');
    const distR = finalDistribution(trajR);
    const thR = theoreticalValues(n, 'rademacher');

    drawTrajectories('canvas-r-sn', trajR, 'Sn', 'rademacher', thR.meanSn);
    drawTrajectories('canvas-r-sn-n', trajR, 'SnOverN', 'rademacher', thR.meanSnOverN);
    drawTrajectories('canvas-r-sn-sqrt-n', trajR, 'SnOverSqrtN', 'rademacher', null);

    drawHistogram('canvas-r-hist-sn', distR.Sn, 'rademacher', null);
    drawHistogram('canvas-r-hist-sn-n', distR.SnOverN, 'rademacher', null);
    drawHistogram('canvas-r-hist-sn-sqrt-n', distR.SnOverSqrtN, 'rademacher', thR.varSnOverSqrtN);

    renderStats('stats-rademacher', trajR, distR, thR, 'rademacher');
});

nInput.value = 100;
mInput.value = 50;
pInput.value = 0.5;