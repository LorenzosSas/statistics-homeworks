function clearCanvas(canvas, ctx) {
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function worldToCanvas(x, y, xMin, xMax, yMin, yMax, width, height, padding) {
    const cx = padding + (x - xMin) / (xMax - xMin) * (width - 2 * padding);
    const cy = height - padding - (y - yMin) / (yMax - yMin) * (height - 2 * padding);
    return {cx, cy};
}

function drawAxes(ctx, canvas, xMin, xMax, yMin, yMax, padding) {
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;

    const {cy: yAxis} = worldToCanvas(0, 0, xMin, xMax, yMin, yMax, canvas.width, canvas.height, padding);
    ctx.beginPath();
    ctx.moveTo(padding, yAxis);
    ctx.lineTo(canvas.width - padding, yAxis);
    ctx.stroke();

    const {cx: xAxis} = worldToCanvas(0, 0, xMin, xMax, yMin, yMax, canvas.width, canvas.height, padding);
    if (xAxis >= padding && xAxis <= canvas.width - padding) {
        ctx.beginPath();
        ctx.moveTo(xAxis, padding);
        ctx.lineTo(xAxis, canvas.height - padding);
        ctx.stroke();
    }

    ctx.fillStyle = '#8b949e';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    const xTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
        const x = xMin + (xMax - xMin) * i / xTicks;
        const {cx, cy} = worldToCanvas(x, yMin, xMin, xMax, yMin, yMax, canvas.width, canvas.height, padding);
        ctx.fillText(x.toFixed(2), cx, cy + 15);
    }

    ctx.textAlign = 'right';
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
        const y = yMin + (yMax - yMin) * i / yTicks;
        const {cx, cy} = worldToCanvas(xMin, y, xMin, xMax, yMin, yMax, canvas.width, canvas.height, padding);
        ctx.fillText(y.toFixed(2), cx - 5, cy + 4);
    }
}

function drawFunction(ctx, canvas, f, xMin, xMax, yMin, yMax, padding, color = '#58a6ff', samples = 500) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    let first = true;
    for (let i = 0; i <= samples; i++) {
        const x = xMin + (xMax - xMin) * i / samples;
        const y = f(x);
        if (!isFinite(y)) {first = true; continue;}
        const {cx, cy} = worldToCanvas(x, y, xMin, xMax, yMin, yMax, canvas.width, canvas.height, padding);
        if (first) {ctx.moveTo(cx, cy); first = false;}
        else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
}

export function drawRiemann(canvasId, f, a, b, n, method = 'midpoint') {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const padding = 40;

    const samples = 500;
    const ys = [];
    for (let i = 0; i <= samples; i++) {
        const x = a + (b - a) * i / samples;
        const y = f(x);
        if (isFinite(y)) ys.push(y);
    }
    const yMin = Math.min(0, ...ys);
    const yMax = Math.max(...ys) * 1.1;

    clearCanvas(canvas, ctx);
    drawAxes(ctx, canvas, a, b, yMin, yMax, padding);

    const h = (b - a) / n;
    for (let i = 0; i < n; i++) {
        let xSample;
        if (method === 'midpoint') xSample = a + (i + 0.5) * h;
        else if (method === 'trapezoid') xSample = a + i * h;
        else xSample = a + (i + 0.5) * h;

        const height = f(xSample);
        if (!isFinite(height)) continue;

        const x0 = a + i * h;
        const {cx: rectX, cy: rectY} = worldToCanvas(x0, Math.max(0, height), a, b, yMin, yMax, canvas.width, canvas.height, padding);
        const {cx: rectX2, cy: baseY} = worldToCanvas(x0 + h, 0, a, b, yMin, yMax, canvas.width, canvas.height, padding);

        ctx.fillStyle = 'rgba(88, 166, 255, 0.2)';
        ctx.strokeStyle = 'rgba(88, 166, 255, 0.5)';
        ctx.lineWidth = 0.5;
        ctx.fillRect(rectX, rectY, rectX2 - rectX, baseY - rectY);
        ctx.strokeRect(rectX, rectY, rectX2 - rectX, baseY - rectY);
    }

    drawFunction(ctx, canvas, f, a, b, yMin, yMax, padding, '#58a6ff');
}

export function drawLebesgue(canvasId, f, a, b, m) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const padding = 40;

    const samples = 1000;
    const ys = [];
    const xs = [];
    for (let i = 0; i <= samples; i++) {
        const x = a + (b - a) * i / samples;
        const y = f(x);
        if (isFinite(y)) { ys.push(y); xs.push(x); }
    }
    const yMin = Math.min(0, ...ys);
    const yMax = Math.max(...ys) * 1.1;
    const fMin = Math.min(...ys);
    const fMax = Math.max(...ys);

    clearCanvas(canvas, ctx);
    drawAxes(ctx, canvas, a, b, yMin, yMax, padding);

    const h = (fMax - fMin) / m;
    for (let j = 0; j < m; j++) {
        const level = fMin + j * h;
        const levelTop = level + h;
        const hue = 240 - j / m * 60;

        for (let i = 0; i < xs.length - 1; i++) {
            if (ys[i] > level) {
                const {cx: x0, cy: y0} = worldToCanvas(xs[i], levelTop, a, b, yMin, yMax, canvas.width, canvas.height, padding);
                const {cx: x1, cy: y1} = worldToCanvas(xs[i + 1], level, a, b, yMin, yMax, canvas.width, canvas.height, padding);
                ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.3)`;
                ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
            }
        }

        const {cx: lx0, cy: ly} = worldToCanvas(a, level, a, b, yMin, yMax, canvas.width, canvas.height, padding);
        const {cx: lx1} = worldToCanvas(b, level, a, b, yMin, yMax, canvas.width, canvas.height, padding);
        ctx.strokeStyle = `hsla(${hue}, 70%, 50%, 0.5)`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(lx0, ly);
        ctx.lineTo(lx1, ly);
        ctx.stroke();
    }

    drawFunction(ctx, canvas, f, a, b, yMin, yMax, padding, '#58a6ff');
}

export function drawConvergence(canvasId, convergenceData) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const padding = 50;

    clearCanvas(canvas, ctx);

    const ns = convergenceData.map(r => Math.log10(r.n));
    const methods = ['errorMidpoint', 'errorTrapezoid', 'errorSimpson', 'errorLebesgue'];
    const colors = ['#58a6ff', '#79c0ff', '#2ea043', '#f78166'];
    const labels = ['Midpoint', 'Trapezoid', 'Simpson', 'Lebesgue'];

    const allErrors = convergenceData.flatMap(r =>
        methods.map(m => r[m]).filter(e => e > 0)
    );
    const logErrors = allErrors.map(e => Math.log10(e));
    const yMin = Math.min(...logErrors) - 0.5;
    const yMax = Math.max(...logErrors) + 0.5;
    const xMin = Math.min(...ns);
    const xMax = Math.max(...ns);

    ctx.fillStyle = '#8b949e';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('log₁₀(n)', canvas.width / 2, canvas.height - 5);

    ctx.save();
    ctx.translate(12, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('log₁₀(error)', 0, 0);
    ctx.restore();

    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
        const y = yMin + (yMax - yMin) * i / 5;
        const {cy} = worldToCanvas(xMin, y, xMin, xMax, yMin, yMax, canvas.width, canvas.height, padding);
        ctx.beginPath();
        ctx.moveTo(padding, cy);
        ctx.lineTo(canvas.width - padding, cy);
        ctx.stroke();
        ctx.fillStyle = '#8b949e';
        ctx.textAlign = 'right';
        ctx.fillText(y.toFixed(1), padding - 5, cy + 4);
    }

    methods.forEach((method, idx) => {
        ctx.strokeStyle = colors[idx];
        ctx.lineWidth = 2;
        ctx.beginPath();

        convergenceData.forEach((r, i) => {
            const error = r[method];
            if (error <= 0) return;
            const x = Math.log10(r.n);
            const y = Math.log10(error);
            const {cx, cy} = worldToCanvas(x, y, xMin, xMax, yMin, yMax, canvas.width, canvas.height, padding);
            if (i === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        });
        ctx.stroke();

        const lastR = convergenceData[convergenceData.length - 1];
        const lastError = lastR[method];
        if (lastError > 0) {
            const {cx, cy} = worldToCanvas(
                Math.log10(lastR.n), Math.log10(lastError),
                xMin, xMax, yMin, yMax, canvas.width, canvas.height, padding
            );
            ctx.fillStyle = colors[idx];
            ctx.textAlign = 'left';
            ctx.fillText(labels[idx], cx + 5, cy);
        }
    });
}

export function drawNormalCDF(canvasId, methods) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const padding = 40;

    clearCanvas(canvas, ctx);
    drawAxes(ctx, canvas, -4, 4, -0.05, 1.1, padding);

    const colors = {
        simpson: '#58a6ff',
        erf: '#2ea043',
        rational: '#f78166'
    };

    Object.entries(methods).forEach(([name, fn]) => {
        drawFunction(ctx, canvas, fn, -4, 4, -0.05, 1.1, padding, colors[name]);
    });

    let y = 20;
    Object.entries(colors).forEach(([name, color]) => {
        ctx.fillStyle = color;
        ctx.fillRect(canvas.width - 120, y, 20, 3);
        ctx.fillStyle = '#c9d1d9';
        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(name, canvas.width - 95, y + 4);
        y += 20;
    });
}