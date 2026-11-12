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

function runTests() {
    testsFunctions();
    console.log("All tests passed.");
}

runTests();