import { welfordInit, welfordUpdate, welfordVariance, welfordArray } from "../welford.js";
import { DISTRIBUTIONS, simulateHacker, simulateHackers, experimentByN } from "../simulation.js";

function testsWelfordInit() {
    console.log("Tests for welfordInit()");

    const state = welfordInit();
    console.assert(state.n === 0, "Error: initial n should be 0");
    console.assert(state.mean === 0, "Error: initial mean should be 0");
    console.assert(state.SS === 0, "Error: initial SS should be 0");

    console.log("\nwelfordInit() tests passed.\n");
}

function testsWelfordUpdate() {
    console.log("Tests for welfordUpdate()");

    let state = welfordInit();
    state = welfordUpdate(state, 5);
    console.assert(state.n === 1, "Error: n should be 1 after first update");
    console.assert(state.mean === 5, "Error: mean should be 5 after first update");
    console.assert(state.SS === 0, "Error: SS should be 0 after first update");

    state = welfordUpdate(state, 3);
    console.assert(state.n === 2, "Error: n should be 2 after second update");
    console.assert(state.mean === 4, `Error: mean should be 4, got ${state.mean}`);
    console.assert(state.SS === 2, `Error: SS should be 2, got ${state.SS}`);

    state = welfordUpdate(state, 7);
    console.assert(state.n === 3, "Error: n should be 3");
    console.assert(Math.abs(state.mean - 5) < 1e-10, `Error: mean should be 5, got ${state.mean}`);
    console.assert(Math.abs(state.SS - 8) < 1e-10, `Error: SS should be 8, got ${state.SS}`);

    let stateNeg = welfordInit();
    stateNeg = welfordUpdate(stateNeg, -2);
    stateNeg = welfordUpdate(stateNeg, 2);
    console.assert(stateNeg.mean === 0, `Error: mean of [-2, 2] should be 0, got ${stateNeg.mean}`);
    console.assert(stateNeg.SS === 8, `Error: SS of [-2, 2] should be 8, got ${stateNeg.SS}`);

    let stateConst = welfordInit();
    stateConst = welfordUpdate(stateConst, 5);
    stateConst = welfordUpdate(stateConst, 5);
    stateConst = welfordUpdate(stateConst, 5);
    console.assert(stateConst.mean === 5, "Error: mean of constant should be 5");
    console.assert(Math.abs(stateConst.SS) < 1e-10, "Error: SS of constant should be 0");

    console.log("\nwelfordUpdate() tests passed.\n");
}

function testsWelfordVariance() {
    console.log("Tests for welfordVariance()");

    const state1 = welfordUpdate(welfordInit(), 5);
    console.assert(welfordVariance(state1) === 0, "Error: variance with n=1 should be 0");

    let state = welfordInit();
    state = welfordUpdate(state, 3);
    state = welfordUpdate(state, 5);
    state = welfordUpdate(state, 7);
    console.assert(Math.abs(welfordVariance(state) - 4) < 1e-10, `Error: variance of [3,5,7] should be 4, got ${welfordVariance(state)}`);

    let stateConst = welfordInit();
    stateConst = welfordUpdate(stateConst, 3);
    stateConst = welfordUpdate(stateConst, 3);
    stateConst = welfordUpdate(stateConst, 3);
    console.assert(welfordVariance(stateConst) === 0, "Error: variance of constant should be 0");

    console.log("\nwelfordVariance() tests passed.\n");
}

function testsWelfordArray() {
    console.log("Tests for welfordArray()");

    const result = welfordArray([2, 4, 4, 4, 5, 5, 7, 9]);
    console.assert(result.n === 8, `Error: n should be 8, got ${result.n}`);
    console.assert(Math.abs(result.mean - 5) < 1e-10, `Error: mean should be 5, got ${result.mean}`);
    console.assert(Math.abs(result.variance - 32/7) < 1e-10, `Error: variance should be 32/7, got ${result.variance}`);

    const empty = welfordArray([]);
    console.assert(empty.n === 0, "Error: empty array should have n=0");
    console.assert(empty.mean === 0, "Error: empty array should have mean=0");
    console.assert(empty.variance === 0, "Error: empty array should have variance=0");

    const single = welfordArray([7]);
    console.assert(single.n === 1, "Error: single element should have n=1");
    console.assert(single.mean === 7, "Error: single element mean should be 7");
    console.assert(single.variance === 0, "Error: single element variance should be 0");

    const large = welfordArray([1e8, 1e8 + 1, 1e8 + 2]);
    console.assert(Math.abs(large.mean - (1e8 + 1)) < 1e-6, `Error: large values mean should be 1e8+1, got ${large.mean}`);
    console.assert(Math.abs(large.variance - 1) < 1e-6, `Error: large values variance should be 1, got ${large.variance}`);

    console.log("\nwelfordArray() tests passed.\n");
}

function testsDistributions() {
    console.log("Tests for DISTRIBUTIONS");

    for (const [key, dist] of Object.entries(DISTRIBUTIONS)) {
        console.assert(typeof dist.name === 'string', `Error: ${key} should have a name`);
        console.assert(typeof dist.mean === 'number', `Error: ${key} should have a mean`);
        console.assert(typeof dist.variance === 'number', `Error: ${key} should have a variance`);
        console.assert(typeof dist.sample === 'function', `Error: ${key} should have a sample function`);

        for (let i = 0; i < 100; i++) {
            const s = dist.sample();
            console.assert(s >= 0 && s <= 10, `Error: ${key} sample should be between 0 and 10, got ${s}`);
            console.assert(Number.isInteger(s), `Error: ${key} sample should be integer, got ${s}`);
        }

        const samples = Array.from({length: 10000}, () => dist.sample());
        const empiricalMean = samples.reduce((a, b) => a + b, 0) / samples.length;
        console.assert(Math.abs(empiricalMean - dist.mean) < 0.5, `Error: ${key} empirical mean ${empiricalMean} should be close to theoretical ${dist.mean}`);

        const empiricalVariance = welfordArray(samples).variance;
        console.assert(Math.abs(empiricalVariance - dist.variance) < 1, `Error: ${key} empirical variance ${empiricalVariance} should be close to theoretical ${dist.variance}`)
    }

    console.log("\nDISTRIBUTIONS tests passed.\n");
}

function testsSimulateHacker() {
    console.log("Tests for simulateHacker()");

    const dist = DISTRIBUTIONS.uniform;
    const result = simulateHacker(100, dist);

    console.assert(result.scores.length === 100, `Error: should have 100 scores`);
    console.assert(result.n === 100, `Error: n should be 100`);
    console.assert(typeof result.samplingMean === 'number', "Error: samplingMean should be a number");
    console.assert(typeof result.samplingVariance === 'number', "Error: samplingVariance should be a number");

    result.scores.forEach(s => {
        console.assert(s >= 0 && s <= 10, `Error: score ${s} should be between 0 and 10`);
    });

    const welford = welfordArray(result.scores);
    console.assert(Math.abs(result.samplingMean - welford.mean) < 1e-10, "Error: samplingMean should match welfordArray mean");
    console.assert(Math.abs(result.samplingVariance - welford.variance) < 1e-10, "Error: samplingVariance should match welfordArray variance");

    const largeSim = simulateHacker(10000, dist);
    console.assert(Math.abs(largeSim.samplingMean - dist.mean) < 0.5, `Error: large n mean should be close to theoretical ${dist.mean}`);

    console.log("\nsimulateHacker() tests passed.\n");
}

function testsSimulateHackers() {
    console.log("Tests for simulateHackers()");

    const dist = DISTRIBUTIONS.uniform;
    const result = simulateHackers(100, 50, dist);

    console.assert(result.hackers.length === 50, "Error: should have 50 hackers");
    console.assert(typeof result.meanOfMeans === 'number', "Error: meanOfMeans should be a number");
    console.assert(typeof result.meanOfVariances === 'number', "Error: meanOfVariances should be a number");
    console.assert(result.theoreticalMean === dist.mean, "Error: theoreticalMean should match distribution");
    console.assert(result.theoreticalVariance === dist.variance, "Error: theoreticalVariance should match distribution");

    const largeSim = simulateHackers(1000, 100, dist);
    console.assert(Math.abs(largeSim.meanOfMeans - dist.mean) < 0.5, `Error: meanOfMeans should be close to ${dist.mean}, got ${largeSim.meanOfMeans}`);

    console.assert(Math.abs(largeSim.meanOfVariances - dist.variance) < 1, `Error: meanOfVariances should be close to ${dist.variance}, got ${largeSim.meanOfVariances}`);

    console.log("\nsimulateHackers() tests passed.\n");
}

function testsExperimentByN() {
    console.log("Tests for experimentByN()");

    const dist = DISTRIBUTIONS.uniform;
    const nValues = [10, 50, 100];
    const results = experimentByN(nValues, 50, dist);

    console.assert(results.length === nValues.length, `Error: should have ${nValues.length} results`);

    results.forEach((r, i) => {
        console.assert(r.n === nValues[i], `Error: n should be ${nValues[i]}, got ${r.n}`);
        console.assert(typeof r.meanOfMeans === 'number', "Error: meanOfMeans should be a number");
        console.assert(typeof r.varOfMeans === 'number', "Error: varOfMeans should be a number");
        console.assert(r.theoreticalVarOfMeans === dist.variance / r.n, `Error: theoreticalVarOfMeans should be ${dist.variance / r.n}`);
    });

    const varOfMeans = results.map(r => r.varOfMeans);
    console.assert(varOfMeans[0] > varOfMeans[varOfMeans.length - 1], "Error: variance of means should decrease as n increases");

    console.log("\nexperimentByN() tests passed.\n");
}

function runTests() {
    testsWelfordInit();
    testsWelfordUpdate();
    testsWelfordVariance();
    testsWelfordArray();
    testsDistributions();
    testsSimulateHacker();
    testsSimulateHackers();
    testsExperimentByN();
    console.log("All tests passed.");
}

runTests(); 