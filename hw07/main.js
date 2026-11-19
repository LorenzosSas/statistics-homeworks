import { DATASETS, parseCSV } from "./datasets.js";
import { prepareData, buildContingencyTable, expectedFrequencies, chiSquareStatistic, interpret } from "./contingency.js";
import { chiSquarePValue, chiSquarePDF, criticalValue } from "./chiSquare.js";

const datasetSelect = document.getElementById('dataset-select');
const csvInput = document.getElementById('csv-input');
const csvParseBtn = document.getElementById('csv-parse-btn');
const numBinsInput = document.getElementById('num-bins-input');
const alphaInput = document.getElementById('alpha-input');
const computeBtn = document.getElementById('compute-btn');
const errorOutput = document.getElementById('error-output');

let currentData = null;
let currentType = null;
let currentVariables = null;

const defaultOption = document.createElement('option');
defaultOption.value = '';
defaultOption.textContent = 'Select a dataset';
datasetSelect.appendChild(defaultOption);

Object.entries(DATASETS).forEach(([key, ds]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = `${ds.name} (${ds.type})`;
    datasetSelect.appendChild(option);
});

datasetSelect.addEventListener('change', () => {
    const key = datasetSelect.value;
    if (!key) return;
    const ds = DATASETS[key];
    currentData = ds.data;
    currentType = ds.type;
    currentVariables = ds.variables;
    errorOutput.textContent = '';
    document.getElementById('data-preview').textContent =
        `Loaded: ${ds.name} - ${ds.data.length} observations, type: ${ds.type}`;
    document.getElementById('variables-info').textContent =
        `X: ${ds.variables.X} | F: ${ds.variables.F}`;
});

csvParseBtn.addEventListener('click', () => {
    const text = csvInput.value.trim();
    if (!text) { errorOutput.textContent = 'Please paste CSV data.'; return; }

    try {
        const result = parseCSV(text);
        currentData = result.data;
        currentType = result.type;
        currentVariables = result.variables;
        errorOutput.textContent = '';
        document.getElementById('data-preview').textContent = `Parsed: ${result.data.length} observations, type: ${result.type}`;
        document.getElementById('variables-info').textContent = `X: ${result.variables.X} | F: ${result.variables.F}`;
        datasetSelect.value = '';
    } catch (e) {
        errorOutput.textContent = `CSV parse error: ${e.message}`;
    }
});

function renderContingencyTable(table, expected, chiResult) {
    const {observed, rowTotals, colTotals, xCategories, fCategories, n} = table;

    const headerRow = `<tr><th></th>${fCategories.map(f => `<th>${f}</th>`).join('')}<th>Total</th></tr>`;

    const dataRows = xCategories.map(x => `
        <tr>
            <td><strong>${x}</strong></td>
            ${fCategories.map(f => `
                <td>
                    ${observed[x][f]}
                    <span class="expected">(${expected[x][f].toFixed(2)})</span>
                    <span class="contribution">[${chiResult.contributions[x][f].toFixed(3)}]</span>
                </td>
            `).join('')}
            <td><strong>${rowTotals[x]}</strong></td>
        </tr>
    `).join('');

    const totalRow = `
        <tr>
            <td><strong>Total</strong></td>
            ${fCategories.map(f => `<td><strong>${colTotals[f]}</strong></td>`).join('')}
            <td><strong>${n}</strong></td>
        </tr>
    `;

    return `
        <table class="results-table contingency-table">
            <thead>${headerRow}</thead>
            <tbody>${dataRows}${totalRow}</tbody>
        </table>
        <p class="table-legend">Format: observed (expected) [χ² contribution]</p>
    `;
}

function renderConditional(table) {
    const {conditionalFgivenX, xCategories, fCategories} = table;

    const headerRow = `<tr><th>P(F|X)</th>${fCategories.map(f => `<th>${f}</th>`).join('')}</tr>`;
    const dataRows = xCategories.map(x => `
        <tr>
            <td><strong>${x}</strong></td>
            ${fCategories.map(f => `<td>${(conditionalFgivenX[x][f] * 100).toFixed(1)}%</td>`).join('')}
        </tr>
    `).join('');

    return `
        <table class="results-table">
            <thead>${headerRow}</thead>
            <tbody>${dataRows}</tbody>
        </table>
    `;
}

function renderChiSquarePlot(chi2, df) {
    const canvas = document.getElementById('canvas-chisquare');
    const ctx = canvas.getContext('2d');
    const padding = 40;
    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    const xMax = Math.max(chi2 * 1.5, df * 3, 10);
    const samples = 300;

    const points = [];
    for (let i = 1; i <= samples; i++) {
        const x = xMax * i / samples;
        const y = chiSquarePDF(x, df);
        if (isFinite(y)) points.push({x, y});
    }

    const yMax = Math.max(...points.map(p => p.y)) * 1.1;

    const toCanvas = (x, y) => ({
        cx: padding + (x / xMax) * (W - 2 * padding),
        cy: H - padding - (y / yMax) * (H - 2 * padding)
    });

    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, H - padding);
    ctx.lineTo(W - padding, H - padding);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, H - padding);
    ctx.stroke();

    ctx.fillStyle = 'rgba(247, 129, 102, 0.3)';
    ctx.beginPath();
    let started = false;
    points.forEach(({x, y}) => {
        if (x >= chi2) {
            const {cx, cy} = toCanvas(x, y);
            if (!started) { ctx.moveTo(cx, H - padding); ctx.lineTo(cx, cy); started = true; }
            else ctx.lineTo(cx, cy);
        }
    });
    ctx.lineTo(W - padding, H - padding);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach(({x, y}, i) => {
        const {cx, cy} = toCanvas(x, y);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
    });
    ctx.stroke();

    const {cx: chi2X} = toCanvas(chi2, 0);
    ctx.strokeStyle = '#f78166';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(chi2X, padding);
    ctx.lineTo(chi2X, H - padding);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#8b949e';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`χ²=${chi2.toFixed(2)}`, chi2X, padding - 5);
    ctx.fillText('0', padding, H - padding + 15);
    ctx.fillText(xMax.toFixed(1), W - padding, H - padding + 15);

    ctx.fillStyle = '#58a6ff';
    ctx.fillRect(W - 130, 15, 15, 3);
    ctx.fillStyle = '#c9d1d9';
    ctx.textAlign = 'left';
    ctx.fillText(`χ²(${df}) PDF`, W - 110, 19);
    ctx.fillStyle = 'rgba(247, 129, 102, 0.6)';
    ctx.fillRect(W - 130, 32, 15, 10);
    ctx.fillStyle = '#c9d1d9';
    ctx.fillText('p-value area', W - 110, 41);
}

computeBtn.addEventListener('click', () => {
    if (!currentData || currentData.length === 0) {
        errorOutput.textContent = 'Please select a dataset or paste CSV data.';
        return;
    }

    const numBins = parseInt(numBinsInput.value) || 4;
    const alpha = parseFloat(alphaInput.value) || 0.05;
    errorOutput.textContent = '';

    const prepared = prepareData(currentData, currentType, numBins);

    const table = buildContingencyTable(prepared);
    const expected = expectedFrequencies(table);
    const chiResult = chiSquareStatistic(table, expected);
    const pValue = chiSquarePValue(chiResult.chi2, chiResult.degreesOfFreedom);
    const interpretation = interpret(chiResult.chi2, chiResult.degreesOfFreedom, pValue, alpha);
    const critical = criticalValue(alpha === 0.05 ? 0.05 : alpha === 0.01 ? 0.01 : 0.10,
        chiResult.degreesOfFreedom);

    document.getElementById('contingency-output').innerHTML =
        renderContingencyTable(table, expected, chiResult);

    document.getElementById('marginal-output').innerHTML = `
        <div class="freq-grid">
            <div>
                <h3>Marginal frequencies of ${currentVariables.X}</h3>
                <table class="results-table">
                    <tr><th>Category</th><th>Count</th><th>Frequency</th></tr>
                    ${table.xCategories.map(x => `
                        <tr>
                            <td>${x}</td>
                            <td>${table.rowTotals[x]}</td>
                            <td>${(table.rowFreq[x] * 100).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
            <div>
                <h3>Marginal frequencies of ${currentVariables.F}</h3>
                <table class="results-table">
                    <tr><th>Category</th><th>Count</th><th>Frequency</th></tr>
                    ${table.fCategories.map(f => `
                        <tr>
                            <td>${f}</td>
                            <td>${table.colTotals[f]}</td>
                            <td>${(table.colFreq[f] * 100).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        </div>
    `;

    document.getElementById('conditional-output').innerHTML =
        renderConditional(table);

    document.getElementById('chisquare-output').innerHTML = `
        <div class="stat-block">
            <h3>Chi-square Test Results</h3>
            <p>χ² statistic: <strong>${chiResult.chi2.toFixed(4)}</strong></p>
            <p>Degrees of freedom: <strong>${chiResult.degreesOfFreedom}</strong></p>
            <p>p-value: <strong>${pValue.toFixed(6)}</strong></p>
            <p>Significance level α: <strong>${alpha}</strong></p>
            ${critical !== null ? `<p>Critical value χ²(${alpha}, ${chiResult.degreesOfFreedom}): <strong>${critical}</strong></p>` : ''}
        </div>
        <div class="stat-block ${interpretation.isDependent ? 'dependent' : 'independent'}">
            <h3>Interpretation</h3>
            <p>${interpretation.conclusion}</p>
            <p class="causality-note">${interpretation.causalityNote}</p>
        </div>
    `;

    renderChiSquarePlot(chiResult.chi2, chiResult.degreesOfFreedom);
});

numBinsInput.value = 4;
alphaInput.value = 0.05; 