import { FUNCTIONS } from "./functions.js";
import { riemannMidpoint, riemannTrapezoid, riemannSimpson, lebesgueIntegrate, convergenceAnalysis, timingAnalysis } from "./integration.js";
import { normalCDFSimpson, normalCDFErf, normalCDFRational, compareMethods, erfConvergence, simpsonConvergence } from "./normalcdf.js";
import { drawRiemann, drawLebesgue, drawConvergence, drawNormalCDF } from "./canvas.js";

const functionSelect = document.getElementById('function-select');
const nInput = document.getElementById('n-input');
const mInput = document.getElementById('m-input');
const computeBtn = document.getElementById('compute-btn');
const errorOutput = document.getElementById('error-output');

Object.entries(FUNCTIONS).forEach(([key, fn]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = fn.name;
    functionSelect.appendChild(option);
});

const N_VALUES = [10, 50, 100, 500, 1000, 5000, 10000];

function validateInputs(n, m) {
    if (isNaN(n) || n < 1) return 'n must be a positive integer.';
    if (isNaN(m) || m < 1) return 'm must be a positive integer.';
    if (n > 100000) return 'n must be ≤ 100000.';
    if (m > 1000) return 'm must be ≤ 1000.';
    return null;
}

function renderIntegrationResults(fn, n, m) {
    const {f, a, b, exact, description} = fn;

    const midpoint = riemannMidpoint(f, a, b, n);
    const trapezoid = riemannTrapezoid(f, a, b, n);
    const simpson = riemannSimpson(f, a, b, n);
    const lebesgue = lebesgueIntegrate(f, a, b, m);

    const timing = timingAnalysis(f, a, b, n);

    const convergence = convergenceAnalysis(f, a, b, exact, N_VALUES);

    drawRiemann('canvas-riemann', f, a, b, Math.min(n, 50), 'midpoint');
    drawLebesgue('canvas-lebesgue', f, a, b, Math.min(m, 20));
    drawConvergence('canvas-convergence', convergence);

    document.getElementById('integration-results').innerHTML = `
        <div class="stat-block">
            <h3>Function: ${fn.name}</h3>
            <p>${description}</p>
            <p>Domain: [${a}, ${b > 3 ? 'π' : b}]</p>
            <p>Exact value: ${exact}</p>
        </div>

        <div class="stat-block">
            <h3>Numerical Results (n=${n} partitions)</h3>
            <table class="results-table">
                <tr>
                    <th>Method</th>
                    <th>Result</th>
                    <th>Error</th>
                    <th>Time (ms)</th>
                </tr>
                <tr>
                    <td>Midpoint</td>
                    <td>${midpoint.toFixed(8)}</td>
                    <td>${Math.abs(midpoint - exact).toExponential(3)}</td>
                    <td>${timing.midpoint.time.toFixed(3)}</td>
                </tr>
                <tr>
                    <td>Trapezoid</td>
                    <td>${trapezoid.toFixed(8)}</td>
                    <td>${Math.abs(trapezoid - exact).toExponential(3)}</td>
                    <td>${timing.trapezoid.time.toFixed(3)}</td>
                </tr>
                <tr>
                    <td>Simpson</td>
                    <td>${simpson.toFixed(8)}</td>
                    <td>${Math.abs(simpson - exact).toExponential(3)}</td>
                    <td>${timing.simpson.time.toFixed(3)}</td>
                </tr>
                <tr>
                    <td>Lebesgue (m=${m})</td>
                    <td>${lebesgue.toFixed(8)}</td>
                    <td>${Math.abs(lebesgue - exact).toExponential(3)}</td>
                    <td>${timing.lebesgue.time.toFixed(3)}</td>
                </tr>
            </table>
        </div>
    `;
}

function renderCDFResults() {
    drawNormalCDF('canvas-cdf', {
        simpson: x => normalCDFSimpson(x),
        erf: x => normalCDFErf(x),
        rational: x => normalCDFRational(x)
    });

    const xValues = [-3, -2, -1, 0, 1, 1.645, 1.96, 2, 2.576, 3];
    const comparison = compareMethods(xValues);

    const erfConv = erfConvergence(2, 40);
    const simpsonConv = simpsonConvergence(2, N_VALUES);

    document.getElementById('cdf-results').innerHTML = `
        <div class="stat-block">
            <h3>CDF Values at Key Points</h3>
            <table class="results-table">
                <tr>
                    <th>x</th>
                    <th>Simpson</th>
                    <th>Erf Series</th>
                    <th>Rational (A&S)</th>
                    <th>|Δ Simpson|</th>
                    <th>|Δ Erf|</th>
                </tr>
                ${comparison.map(r => `
                    <tr>
                        <td>${r.x}</td>
                        <td>${r.simpson.toFixed(6)}</td>
                        <td>${r.erf.toFixed(6)}</td>
                        <td>${r.rational.toFixed(6)}</td>
                        <td>${r.diffSimpsonRational.toExponential(2)}</td>
                        <td>${r.diffErfRational.toExponential(2)}</td>
                    </tr>
                `).join('')}
            </table>
        </div>

        <div class="stat-block">
            <h3>Erf Series Convergence at x=2</h3>
            <p>Number of terms needed to reach error &lt; 10⁻⁶: 
               <strong>${erfConv.findIndex(r => r.error < 1e-6) + 1}</strong>
            </p>
        </div>

        <div class="stat-block">
            <h3>Simpson Convergence at x=2</h3>
            <table class="results-table">
                <tr><th>n</th><th>CDF(2)</th><th>Error</th></tr>
                ${simpsonConv.map(r => `
                    <tr>
                        <td>${r.n}</td>
                        <td>${r.value.toFixed(8)}</td>
                        <td>${r.error.toExponential(3)}</td>
                    </tr>
                `).join('')}
            </table>
        </div>
    `;
}

computeBtn.addEventListener('click', () => {
    const n = parseInt(nInput.value);
    const m = parseInt(mInput.value);
    const fnKey = functionSelect.value;
    const fn = FUNCTIONS[fnKey];

    const error = validateInputs(n, m);
    if (error) {errorOutput.textContent = error; return;}
    errorOutput.textContent = '';

    renderIntegrationResults(fn, n, m);
    renderCDFResults();
});

functionSelect.addEventListener('change', () => {
    const fn = FUNCTIONS[functionSelect.value];
    const n = parseInt(nInput.value) || 20;
    const m = parseInt(mInput.value) || 10;
    drawRiemann('canvas-riemann', fn.f, fn.domain[0], fn.domain[1], Math.min(n, 50), 'midpoint');
    drawLebesgue('canvas-lebesgue', fn.f, fn.domain[0], fn.domain[1], Math.min(m, 20));
});

nInput.value = 1000;
mInput.value = 100;

const defaultFn = FUNCTIONS[functionSelect.value || 'sin'];
drawRiemann('canvas-riemann', defaultFn.f, defaultFn.domain[0], defaultFn.domain[1], 20, 'midpoint');
drawLebesgue('canvas-lebesgue', defaultFn.f, defaultFn.domain[0], defaultFn.domain[1], 10);
renderCDFResults();