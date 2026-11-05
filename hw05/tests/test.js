import { welfordInit, welfordUpdate, welfordVariance, welfordArray } from "../welford.js";

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

function runTests() {
    testsWelfordInit();
    testsWelfordUpdate();
    testsWelfordVariance();
    testsWelfordArray();
    console.log("All tests passed.");
}

runTests(); 