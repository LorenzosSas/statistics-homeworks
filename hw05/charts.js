const COLORS = {
    primary: 'rgba(88, 166, 255, 0.6)',
    primaryBorder: 'rgba(88, 166, 255, 1)',
    secondary: 'rgba(247, 129, 102, 0.6)',
    secondaryBorder: 'rgba(247, 129, 102, 1)',
    theoretical: '#2ea043',
    theoretical2: '#f78166'
};

const chartInstances = {};

function destroyChart(id) {
    if (chartInstances[id]) {
        chartInstances[id].destroy();
        delete chartInstances[id];
    }
}

function normalPDF(x, mean, variance) {
    const sigma = Math.sqrt(variance);
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * ((x - mean) / sigma) ** 2);
}

export function drawDistributionHistogram(canvasId, values, theoreticalMean, theoreticalVariance) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');

    const numBins = 30;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / numBins || 1;

    const counts = new Array(numBins).fill(0);
    values.forEach(v => {
        const idx = Math.min(Math.floor((v - min) / binWidth), numBins - 1);
        counts[idx]++;
    });

    const labels = Array.from({ length: numBins }, (_, i) =>
        (min + (i + 0.5) * binWidth).toFixed(2)
    );

    const densities = counts.map(c => c / values.length / binWidth);

    const normalPoints = labels.map(x =>
        normalPDF(parseFloat(x), theoreticalMean, theoreticalVariance)
    );

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Sampling Means',
                    data: densities,
                    backgroundColor: COLORS.primary,
                    borderColor: COLORS.primaryBorder,
                    borderWidth: 1
                },
                {
                    label: `N(μ, σ²/n)`,
                    data: normalPoints,
                    type: 'line',
                    borderColor: COLORS.theoretical,
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            animation: { duration: 0 },
            plugins: {
                legend: {display: true, labels: {color: '#c9d1d9'}},
                title: {display: true, text: 'Distribution of Sampling Means', color: '#c9d1d9'}
            },
            scales: {
                x: {ticks: {color: '#8b949e', maxTicksLimit: 10}, grid: {color: '#30363d'}},
                y: {title: {display: true, text: 'Density', color: '#8b949e'}, ticks: {color: '#8b949e'}, grid: {color: '#30363d'}}
            }
        }
    });
}

export function drawVarOfMeansByN(canvasId, experimentResults) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');

    const labels = experimentResults.map(r => r.n);
    const empirical = experimentResults.map(r => r.varOfMeans);
    const theoretical = experimentResults.map(r => r.theoreticalVarOfMeans);

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Empirical Var(X̄)',
                    data: empirical,
                    borderColor: COLORS.primaryBorder,
                    backgroundColor: COLORS.primary,
                    borderWidth: 2,
                    pointRadius: 4,
                    fill: false
                },
                {
                    label: 'Theoretical σ²/n',
                    data: theoretical,
                    borderColor: COLORS.theoretical,
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            animation: {duration: 0},
            plugins: {
                legend: {display: true, labels: {color: '#c9d1d9'}},
                title: {display: true, text: 'Variance of Sampling Means vs n', color: '#c9d1d9'}
            },
            scales: {
                x: {title: {display: true, text: 'n', color: '#8b949e'}, ticks: { color: '#8b949e' }, grid: {color: '#30363d'}},
                y: {title: {display: true, text: 'Variance', color: '#8b949e'}, ticks: {color: '#8b949e'}, grid: {color: '#30363d'}}
            }
        }
    });
}

export function drawMeanOfVariancesByN(canvasId, experimentResults) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');

    const labels = experimentResults.map(r => r.n);
    const empirical = experimentResults.map(r => r.meanOfVariances);
    const theoretical = experimentResults.map(r => r.theoreticalVariance);

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Mean of Sampling Variances',
                    data: empirical,
                    borderColor: COLORS.secondaryBorder,
                    backgroundColor: COLORS.secondary,
                    borderWidth: 2,
                    pointRadius: 4,
                    fill: false
                },
                {
                    label: 'Theoretical σ²',
                    data: theoretical,
                    borderColor: COLORS.theoretical,
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            animation: {duration: 0},
            plugins: {
                legend: {display: true, labels: {color: '#c9d1d9' }},
                title: {display: true, text: 'Mean of Sampling Variances vs n', color: '#c9d1d9'}
            },
            scales: {
                x: {title: {display: true, text: 'n', color: '#8b949e'}, ticks: {color: '#8b949e'}, grid: {color: '#30363d'}},
                y: {title: {display: true, text: 'Variance', color: '#8b949e'}, ticks: {color: '#8b949e'}, grid: {color: '#30363d'}}
            }
        }
    });
}

export function drawScoreDistribution(canvasId, distribution) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');

    const counts = new Array(11).fill(0);
    for (let i = 0; i < 10000; i++) {
        counts[distribution.sample()]++;
    }

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Array.from({length: 11}, (_, i) => i),
            datasets: [{
                label: 'Probability',
                data: counts.map(c => c / 10000),
                backgroundColor: COLORS.primary,
                borderColor: COLORS.primaryBorder,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            animation: {duration: 0},
            plugins: {
                legend: {display: false},
                title: {display: true, text: `Score Distribution: ${distribution.name}`, color: '#c9d1d9'}
            },
            scales: {
                x: {title: {display: true, text: 'Score', color: '#8b949e'}, ticks: {color: '#8b949e'}, grid: {color: '#30363d'}},
                y: {title: {display: true, text: 'Probability', color: '#8b949e'}, ticks: {color: '#8b949e'}, grid: {color: '#30363d'}}
            }
        }
    });
}