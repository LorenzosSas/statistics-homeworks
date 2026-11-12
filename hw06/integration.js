export function riemannMidpoint(f, a, b, n) {
    const h = (b - a) / n;
    let sum = 0;
    for (let i = 0; i < n; i++) {
        const x = a + (i + 0.5) * h;
        sum += f(x);
    }
    return sum * h;
}

export function riemannTrapezoid(f, a, b, n) {
    const h = (b - a) / n;
    let sum = (f(a) + f(b)) / 2;
    for (let i = 1; i < n; i++) {
        sum += f(a + i * h);
    }
    return sum * h;
}

export function riemannSimpson(f, a, b, n) {
    if (n % 2 !== 0) n++;
    const h = (b - a) / n;
    let sum = f(a) + f(b);
    for (let i = 1; i < n; i++) {
        sum += f(a + i * h) * (i % 2 === 0 ? 2 : 4);
    }
    return sum * h / 3;
}

export function lebesgueIntegrate(f, a, b, m, samplePoints = 10000) {
    const samples = [];
    const xs = [];
    for (let i = 0; i <= samplePoints; i++) {
        const x = a + (b - a) * i / samplePoints;
        const fx = f(x);
        if (isFinite(fx)) {
            samples.push(fx);
            xs.push(x);
        }
    }

    const fMin = samples.reduce((a, b) => Math.min(a, b), Infinity);
    const fMax = samples.reduce((a, b) => Math.max(a, b), -Infinity);

    if (fMin === fMax) return fMin * (b - a);

    const h = (fMax - fMin) / m;
    let integral = 0;

    for (let j = 0; j < m; j++) {
        const level = fMin + (j + 0.5) * h;

        let measure = 0;
        for (let i = 0; i < xs.length - 1; i++) {
            if (samples[i] > level) {
                measure += xs[i + 1] - xs[i];
            }
        }

        integral += h * measure;
    }

    integral += fMin * (b - a);

    return integral;
}

export function convergenceAnalysis(f, a, b, exact, nValues) {
    return nValues.map(n => {
        const midpoint = riemannMidpoint(f, a, b, n);
        const trapezoid = riemannTrapezoid(f, a, b, n);
        const simpson = riemannSimpson(f, a, b, n);
        const lebesgue = lebesgueIntegrate(f, a, b, n);

        return {
            n,
            midpoint,
            trapezoid,
            simpson,
            lebesgue,
            errorMidpoint: Math.abs(midpoint - exact),
            errorTrapezoid: Math.abs(trapezoid - exact),
            errorSimpson: Math.abs(simpson - exact),
            errorLebesgue: Math.abs(lebesgue - exact)
        };
    });
}


export function timingAnalysis(f, a, b, n) {
    const time = (fn) => {
        const start = performance.now();
        const result = fn();
        return {result, time: performance.now() - start};
    };

    return {
        midpoint: time(() => riemannMidpoint(f, a, b, n)),
        trapezoid: time(() => riemannTrapezoid(f, a, b, n)),
        simpson: time(() => riemannSimpson(f, a, b, n)),
        lebesgue: time(() => lebesgueIntegrate(f, a, b, n))
    };
}