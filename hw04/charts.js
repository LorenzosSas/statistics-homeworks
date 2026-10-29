import { normalPDF } from "./stats";

const COLORS = {
    bernoulli: [
        'rgba(88, 166, 255, 0.6)',
        'rgba(121, 192, 255, 0.6)',
        'rgba(56, 139, 253, 0.6)',
        'rgba(31, 111, 235, 0.6)',
        'rgba(9, 105, 218, 0.6)'
    ],
    rademacher: [
        'rgba(247, 129, 102, 0.6)',
        'rgba(255, 166, 87, 0.6)',
        'rgba(240, 100, 73, 0.6)',
        'rgba(220, 80, 50, 0.6)',
        'rgba(200, 60, 30, 0.6)'
    ]
};

const chartInstances = {};

function destroyChart(id) {
    if (chartInstances[id]) {
        chartInstances[id].destroy();
        delete chartInstances[id];
    }
}

export function drawTrajectories(canvasId, trajectories, quantity, model, theoreticalValue = null) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');
    const colors = COLORS[model];
    const n = trajectories[0].length;

    const datasets = trajectories.slice(0, 50).map((traj, i) => ({
        label: `Trajectory ${i + 1}`,
        data: traj.map(step => ({ x: step.i, y: step[quantity] })),
        borderColor: colors[i % colors.length],
        borderWidth: 1,
        pointRadius: 0,
        fill: false
    }));

    if (theoreticalValue !== null) {
        datasets.push({
            label: 'Theoretical',
            data: [{ x: 1, y: theoreticalValue }, { x: n, y: theoreticalValue }],
            borderColor: '#2ea043',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
        });
    }

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            animation: { duration: 0 },
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: quantityLabel(quantity),
                    color: '#c9d1d9'
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'n', color: '#8b949e' },
                    ticks: { color: '#8b949e' },
                    grid: { color: '#30363d' }
                },
                y: {
                    title: { display: true, text: quantityLabel(quantity), color: '#8b949e' },
                    ticks: { color: '#8b949e' },
                    grid: { color: '#30363d' }
                }
            }
        }
    });
}

export function drawHistogram(canvasId, values, model, theoreticalVariance = null) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');

    const numBins = 30;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / numBins;

    const counts = new Array(numBins).fill(0);
    values.forEach(v => {
        const idx = Math.min(Math.floor((v - min) / binWidth), numBins - 1);
        counts[idx]++;
    });

    const labels = Array.from({ length: numBins }, (_, i) =>
        (min + (i + 0.5) * binWidth).toFixed(2)
    );

    const datasets = [{
        label: 'Frequency',
        data: counts.map(c => c / values.length / binWidth),
        backgroundColor: COLORS[model][0],
        borderColor: COLORS[model][0].replace('0.6', '1'),
        borderWidth: 1
    }];

    if (theoreticalVariance !== null) {
        const normalPoints = labels.map(x => normalPDF(parseFloat(x), 0, theoreticalVariance));
        datasets.push({
            label: 'N(0, σ²)',
            data: normalPoints,
            borderColor: '#2ea043',
            borderWidth: 2,
            type: 'line',
            pointRadius: 0,
            fill: false
        });
    }

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: {
            responsive: true,
            animation: { duration: 0 },
            plugins: {
                legend: { display: theoreticalVariance !== null },
                title: {
                    display: true,
                    text: 'Final Distribution',
                    color: '#c9d1d9'
                }
            },
            scales: {
                x: {
                    ticks: { 
                        color: '#8b949e',
                        maxTicksLimit: 10
                    },
                    grid: { color: '#30363d' }
                },
                y: {
                    title: { display: true, text: 'Density', color: '#8b949e' },
                    ticks: { color: '#8b949e' },
                    grid: { color: '#30363d' }
                }
            }
        }
    });
}

function quantityLabel(quantity) {
    switch (quantity) {
        case 'Sn': return 'Sₙ (Total Score)';
        case 'SnOverN': return 'Sₙ/n (Average Score)';
        case 'SnOverSqrtN': return 'Sₙ/√n (Normalized Score)';
        default: return quantity;
    }
}