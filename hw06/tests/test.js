import { riemannMidpoint, riemannTrapezoid, riemannSimpson, lebesgueIntegrate, convergenceAnalysis } from "../integration.js";
import { normalCDFSimpson, normalCDFErf, normalCDFRational, compareMethods, erfConvergence, simpsonConvergence } from "../normalcdf.js";
import { FUNCTIONS } from "../functions.js";

function testsFunctions() {
    console.log("Tests for FUNCTIONS");

    for (const [key, fn] of Object.entries(FUNCTIONS)) {
        console.assert(typeof fn.name === 'string', `Error: ${key} should have a name`);
        console.assert(typeof fn.f === 'function', `Error: ${key} should have a function f`);
        console.assert(Array.isArray(fn.domain) && fn.domain.length === 2, `Error: ${key} should have a domain array of length 2`);
        console.assert(fn.domain[0] < fn.domain[1], `Error: ${key} domain should have a < b`);
        console.assert(typeof fn.exact === 'number', `Error: ${key} should have an exact value`);

        const mid = (fn.domain[0] + fn.domain[1]) / 2;
        const val = fn.f(mid);
        console.assert(typeof val === 'number', `Error: ${key} f(mid) should return a number, got ${val}`);
    }

    console.assert(Math.abs(FUNCTIONS.sin.f(Math.PI / 2) - 1) < 1e-10, "Error: sin(π/2) should be 1");
    console.assert(Math.abs(FUNCTIONS.square.f(2) - 4) < 1e-10, "Error: 2² should be 4");
    console.assert(FUNCTIONS.step.f(0.3) === 1, "Error: step(0.3) should be 1");
    console.assert(FUNCTIONS.step.f(0.7) === 3, "Error: step(0.7) should be 3");
    console.assert(Math.abs(FUNCTIONS.abs.f(0.5)) < 1e-10, "Error: |0.5 - 0.5| should be 0");
    console.assert(FUNCTIONS.indicator.f(0.3) === 1, "Error: indicator(0.3) should be 1");
    console.assert(FUNCTIONS.indicator.f(0.7) === 0, "Error: indicator(0.7) should be 0");
    console.assert(Math.abs(FUNCTIONS.sinc.f(0) - 1) < 1e-10, "Error: sinc(0) should be 1 (removable singularity)");
    console.assert(FUNCTIONS.dirichlet.f(0) === 1, "Error: dirichlet(0) should be 1 (rational)");
    console.assert(FUNCTIONS.dirichlet.f(Math.PI / 4) === 0, "Error: dirichlet(π/4) should be 0 (irrational)");
    console.assert(Math.abs(FUNCTIONS.thomae.f(0.5) - 0.5) < 1e-10, "Error: thomae(1/2) should be 1/2");
    console.assert(FUNCTIONS.thomae.f(Math.PI / 4) === 0, "Error: thomae(π/4) should be 0 (irrational)");

    console.log("\nFUNCTIONS tests passed.\n");
}


function testsRiemannMidpoint() {
    console.log("Tests for riemannMidpoint()");

    const r1 = riemannMidpoint(x => x * x, 0, 1, 10000);
    console.assert(Math.abs(r1 - 1/3) < 1e-6, `Error: ∫x² should be 1/3, got ${r1}`);

    const r2 = riemannMidpoint(x => Math.sin(x), 0, Math.PI, 10000);
    console.assert(Math.abs(r2 - 2) < 1e-6, `Error: ∫sin(x) should be 2, got ${r2}`);

    const r3 = riemannMidpoint(x => 1, 0, 1, 100);
    console.assert(Math.abs(r3 - 1) < 1e-10, `Error: ∫1 should be 1, got ${r3}`);

    const r4 = riemannMidpoint(x => x, 0, 1, 10000);
    console.assert(Math.abs(r4 - 0.5) < 1e-6, `Error: ∫x should be 0.5, got ${r4}`);

    const r5 = riemannMidpoint(x => x, 0, 1, 1);
    console.assert(Math.abs(r5 - 0.5) < 1e-10, `Error: midpoint with n=1 should be 0.5, got ${r5}`);

    console.log("\nriemannMidpoint() tests passed.\n");
}

function testsRiemannTrapezoid() {
    console.log("Tests for riemannTrapezoid()");

    const r1 = riemannTrapezoid(x => x * x, 0, 1, 10000);
    console.assert(Math.abs(r1 - 1/3) < 1e-6, `Error: ∫x² should be 1/3, got ${r1}`);

    const r2 = riemannTrapezoid(x => Math.sin(x), 0, Math.PI, 10000);
    console.assert(Math.abs(r2 - 2) < 1e-6, `Error: ∫sin(x) should be 2, got ${r2}`);

    const r3 = riemannTrapezoid(x => 2 * x + 1, 0, 1, 10);
    console.assert(Math.abs(r3 - 2) < 1e-10, `Error: ∫(2x+1) should be 2, got ${r3}`);

    const r4 = riemannTrapezoid(x => 1, 0, 1, 100);
    console.assert(Math.abs(r4 - 1) < 1e-10, `Error: ∫1 should be 1, got ${r4}`);

    console.log("\nriemannTrapezoid() tests passed.\n");
}

function testsRiemannSimpson() {
    console.log("Tests for riemannSimpson()");

    const r1 = riemannSimpson(x => x * x, 0, 1, 2);
    console.assert(Math.abs(r1 - 1/3) < 1e-10, `Error: ∫x² should be 1/3, got ${r1}`);

    const r2 = riemannSimpson(x => x * x * x, 0, 1, 2);
    console.assert(Math.abs(r2 - 1/4) < 1e-10, `Error: ∫x³ should be 1/4, got ${r2}`);

    const r3 = riemannSimpson(x => Math.sin(x), 0, Math.PI, 1000);
    console.assert(Math.abs(r3 - 2) < 1e-8, `Error: ∫sin(x) should be 2, got ${r3}`);

    const r4 = riemannSimpson(x => x * x, 0, 1, 3);
    console.assert(Math.abs(r4 - 1/3) < 1e-10, `Error: Simpson with odd n should still work, got ${r4}`);

    const n = 10;
    const f = x => Math.sin(x);
    const exact = 2;
    const errMid = Math.abs(riemannMidpoint(f, 0, Math.PI, n) - exact);
    const errTrap = Math.abs(riemannTrapezoid(f, 0, Math.PI, n) - exact);
    const errSimp = Math.abs(riemannSimpson(f, 0, Math.PI, n) - exact);
    console.assert(errSimp < errMid && errSimp < errTrap, `Error: Simpson should be more accurate than midpoint and trapezoid for n=${n}`);

    console.log("\nriemannSimpson() tests passed.\n");
}

function testsLebesgueIntegrate() {
    console.log("Tests for lebesgueIntegrate()");

    const r1 = lebesgueIntegrate(x => x * x, 0, 1, 1000);
    console.assert(Math.abs(r1 - 1/3) < 1e-2, `Error: ∫x² should be ~1/3, got ${r1}`);

    const r2 = lebesgueIntegrate(x => Math.sin(x), 0, Math.PI, 1000);
    console.assert(Math.abs(r2 - 2) < 1e-2, `Error: ∫sin(x) should be ~2, got ${r2}`);

    const r3 = lebesgueIntegrate(x => 1, 0, 1, 100);
    console.assert(Math.abs(r3 - 1) < 1e-6, `Error: ∫1 should be 1, got ${r3}`);

    const r4 = lebesgueIntegrate(FUNCTIONS.dirichlet.f, 0, 1, 1000);
    console.assert(Math.abs(r4) < 0.11, `Error: Dirichlet Lebesgue integral should be ~0, got ${r4}`);

    console.log("\nlebesgueIntegrate() tests passed.\n");
}

function testsConvergenceAnalysis() {
    console.log("Tests for convergenceAnalysis()");

    const nValues = [10, 100, 1000];
    const results = convergenceAnalysis(
        x => Math.sin(x), 0, Math.PI, 2, nValues
    );

    console.assert(results.length === nValues.length, `Error: should have ${nValues.length} results`);

    const errors = results.map(r => r.errorSimpson);
    console.assert(errors[0] > errors[1] && errors[1] > errors[2], "Error: Simpson error should decrease as n increases");

    results.forEach(r => {
        console.assert(r.errorSimpson <= r.errorMidpoint + 1e-10, `Error: Simpson should be at least as accurate as midpoint for n=${r.n}`);
    });

    results.forEach(r => {
        console.assert(typeof r.midpoint === 'number', "Error: midpoint should be a number");
        console.assert(typeof r.trapezoid === 'number', "Error: trapezoid should be a number");
        console.assert(typeof r.simpson === 'number', "Error: simpson should be a number");
        console.assert(typeof r.lebesgue === 'number', "Error: lebesgue should be a number");
        console.assert(r.errorMidpoint >= 0, "Error: errorMidpoint should be >= 0");
        console.assert(r.errorSimpson >= 0, "Error: errorSimpson should be >= 0");
    });

    console.log("\nconvergenceAnalysis() tests passed.\n");
}

function testsNormalCDFSimpson() {
    console.log("Tests for normalCDFSimpson()");

    console.assert(Math.abs(normalCDFSimpson(0) - 0.5) < 1e-6, `Error: CDF(0) should be 0.5, got ${normalCDFSimpson(0)}`);

    console.assert(Math.abs(normalCDFSimpson(1.96) - 0.975) < 1e-3, `Error: CDF(1.96) should be ~0.975, got ${normalCDFSimpson(1.96)}`);

    console.assert(Math.abs(normalCDFSimpson(-1.96) - 0.025) < 1e-3, `Error: CDF(-1.96) should be ~0.025, got ${normalCDFSimpson(-1.96)}`);

    const vals = [-3, -2, -1, 0, 1, 2, 3].map(x => normalCDFSimpson(x));
    for (let i = 1; i < vals.length; i++) {
        console.assert(vals[i] > vals[i-1], `Error: CDF should be monotonically increasing`);
    }

    [-5, -3, 0, 3, 5].forEach(x => {
        const v = normalCDFSimpson(x);
        console.assert(v >= 0 && v <= 1, `Error: CDF(${x}) should be in [0,1], got ${v}`);
    });

    console.log("\nnormalCDFSimpson() tests passed.\n");
}

function testsNormalCDFErf() {
    console.log("Tests for normalCDFErf()");

    console.assert(Math.abs(normalCDFErf(0) - 0.5) < 1e-6, `Error: CDF(0) should be 0.5, got ${normalCDFErf(0)}`);

    console.assert(Math.abs(normalCDFErf(1.96) - 0.975) < 1e-4, `Error: CDF(1.96) should be ~0.975, got ${normalCDFErf(1.96)}`);

    [1, 2, 3].forEach(x => {
        const sym = Math.abs(normalCDFErf(-x) - (1 - normalCDFErf(x)));
        console.assert(sym < 1e-6, `Error: CDF(-${x}) should be 1 - CDF(${x}), diff=${sym}`);
    });

    console.log("\nnormalCDFErf() tests passed.\n");
}

function testsNormalCDFRational() {
    console.log("Tests for normalCDFRational()");

    console.assert(Math.abs(normalCDFRational(0) - 0.5) < 1e-7, `Error: CDF(0) should be 0.5, got ${normalCDFRational(0)}`);

    console.assert(Math.abs(normalCDFRational(1.96) - 0.975) < 1e-4, `Error: CDF(1.96) should be ~0.975, got ${normalCDFRational(1.96)}`);

    console.assert(Math.abs(normalCDFRational(-1.96) - 0.025) < 1e-4, `Error: CDF(-1.96) should be ~0.025, got ${normalCDFRational(-1.96)}`);

    [1, 2, 3].forEach(x => {
        const sym = Math.abs(normalCDFRational(-x) - (1 - normalCDFRational(x)));
        console.assert(sym < 1e-7, `Error: symmetry failed for x=${x}, diff=${sym}`);
    });

    console.log("\nnormalCDFRational() tests passed.\n");
}

function testsCompareMethods() {
    console.log("Tests for compareMethods()");

    const xValues = [-2, -1, 0, 1, 2];
    const results = compareMethods(xValues);

    console.assert(results.length === xValues.length, `Error: should have ${xValues.length} results`);

    results.forEach(r => {
        console.assert(Math.abs(r.simpson - r.rational) < 1e-4, `Error: Simpson and rational should agree at x=${r.x}`);
        console.assert(Math.abs(r.erf - r.rational) < 1e-4, `Error: Erf and rational should agree at x=${r.x}`);
        console.assert(r.diffSimpsonRational >= 0, "Error: diffSimpsonRational should be >= 0");
        console.assert(r.diffErfRational >= 0, "Error: diffErfRational should be >= 0");
    });

    console.log("\ncompareMethods() tests passed.\n");
}

function testsErfConvergence() {
    console.log("Tests for erfConvergence()");

    const results = erfConvergence(1, 30);
    console.assert(results.length === 30, `Error: should have 30 results, got ${results.length}`);

    const firstError = results[0].error;
    const lastError = results[results.length - 1].error;
    console.assert(lastError < firstError, `Error: error should decrease with more terms`);

    console.log("\nerfConvergence() tests passed.\n");
}

function testsSimpsonConvergence() {
    console.log("Tests for simpsonConvergence()");

    const nValues = [10, 100, 1000];
    const results = simpsonConvergence(1, nValues);

    console.assert(results.length === nValues.length, `Error: should have ${nValues.length} results`);

    const errors = results.map(r => r.error);
    console.assert(errors[0] > errors[1] && errors[1] > errors[2], "Error: Simpson CDF error should decrease as n increases");

    console.log("\nsimpsonConvergence() tests passed.\n");
}

function runTests() {
    testsFunctions();
    testsRiemannMidpoint();
    testsRiemannTrapezoid();
    testsRiemannSimpson();
    testsLebesgueIntegrate();
    testsConvergenceAnalysis();
    testsNormalCDFSimpson();
    testsNormalCDFErf();
    testsNormalCDFRational();
    testsCompareMethods();
    testsErfConvergence();
    testsSimpsonConvergence();
    console.log("All tests passed.");
}

runTests();