export const FUNCTIONS = {
    sin: {
        name: 'sin(x)',
        latex: '\\sin(x)',
        f: x => Math.sin(x),
        domain: [0, Math.PI],
        exact: 2,
        description: 'Smooth, bounded, Riemann-integrable'
    },
    square: {
        name: 'x²',
        latex: 'x^2',
        f: x => x * x,
        domain: [0, 1],
        exact: 1 / 3,
        description: 'Smooth polynomial, Riemann-integrable'
    },
    step: {
        name: '1 if x < 0.5, 3 if x ≥ 0.5',
        latex: '\\begin{cases} 1 & x < 0.5 \\\\ 3 & x \\geq 0.5 \\end{cases}',
        f: x => x < 0.5 ? 1 : 3,
        domain: [0, 1],
        exact: 2,
        description: 'Step function - discontinuous, but Riemann-integrable'
    },
    abs: {
        name: '|x - 0.5|',
        latex: '|x - 0.5|',
        f: x => Math.abs(x - 0.5),
        domain: [0, 1],
        exact: 0.25,
        description: 'Continuous but not differentiable at x=0.5'
    },
    invsqrt: {
        name: '1/√x',
        latex: '\\frac{1}{\\sqrt{x}}',
        f: x => x > 0 ? 1 / Math.sqrt(x) : Infinity,
        domain: [1e-10, 1],
        exact: 2,
        description: 'Improper integral - unbounded at x=0'
    },
    indicator: {
        name: '1 if x < 0.5, 0 if x ≥ 0.5',
        latex: '\\mathbf{1}_{[0, 0.5)}(x)',
        f: x => x < 0.5 ? 1 : 0,
        domain: [0, 1],
        exact: 0.5,
        description: 'Indicator function - Riemann-integrable'
    },
    sinc: {
        name: 'sin(x)/x',
        latex: '\\frac{\\sin(x)}{x}',
        f: x => x === 0 ? 1 : Math.sin(x) / x,
        domain: [0, Math.PI],
        exact: 1.8519,
        description: 'Sinc function - removable singularity at x=0'
    },
    dirichlet: {
        name: 'Dirichlet function',
        latex: '\\mathbf{1}_{\\mathbb{Q}}(x)',
        f: x => {
            const denom = 1000;
            return Math.abs(x * denom - Math.round(x * denom)) < 1e-10 ? 1 : 0;
        },
        domain: [0, 1],
        exact: 0,
        description: 'Pathological - Lebesgue-integrable (=0), but not Riemann-integrable'
    },
    thomae: {
        name: "Thomae's function",
        latex: '\\begin{cases} 1/q & x = p/q \\text{ in lowest terms} \\\\ 0 & x \\text{ irrational} \\end{cases}',
        f: x => {
            if (x === 0 || x === 1) return 1;
            const maxDenom = 100;
            let bestDenom = 1;
            let bestDist = Infinity;
            for (let q = 1; q <= maxDenom; q++) {
                const p = Math.round(x * q);
                const dist = Math.abs(x - p / q);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestDenom = q;
                }
            }
            return bestDist < 1e-6 ? 1 / bestDenom : 0;
        },
        domain: [0, 1],
        exact: 0,
        description: 'Pathological - continuous at irrationals, discontinuous at rationals'
    }
}; 