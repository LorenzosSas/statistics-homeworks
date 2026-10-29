import { bernoulli, rademacher, simulateTrajectory, simulateMultiple, finalDistribution, theoreticalValues } from '../simulation.js';
import { mean, variance, stdDev, histogram, normalPDF, llnConvergence, cltConvergence, varianceAnalysis, fullStats } from '../stats.js';

function testsBernoulli() {
    console.log("Tests for bernoulli()");

    for (let i = 0; i < 100; i++) {
        const x = bernoulli(0.5);
        console.assert(x === 0 || x === 1, `Error: bernoulli should return 0 or 1, got ${x}`);
    }

    for (let i = 0; i < 10; i++) {
        console.assert(bernoulli(0) === 0, "Error: bernoulli(0) should always return 0");
    }

    for (let i = 0; i < 10; i++) {
        console.assert(bernoulli(1) === 1, "Error: bernoulli(1) should always return 1");
    }

    const samples = Array.from({ length: 10000 }, () => bernoulli(0.3));
    const sampleMean = samples.reduce((a, b) => a + b, 0) / samples.length;
    console.assert(Math.abs(sampleMean - 0.3) < 0.05, `Error: mean of bernoulli(0.3) should be ~0.3, got ${sampleMean}`);

    console.log("\nbernoulli() tests passed.\n");
}

function testsRademacher() {
    console.log("Tests for rademacher()");

    for (let i = 0; i < 100; i++) {
        const x = rademacher();
        console.assert(x === 1 || x === -1, `Error: rademacher should return 1 or -1, got ${x}`);
    }

    const samples = Array.from({ length: 10000 }, () => rademacher());
    const sampleMean = samples.reduce((a, b) => a + b, 0) / samples.length;
    console.assert(Math.abs(sampleMean) < 0.05, `Error: mean of rademacher should be ~0, got ${sampleMean}`);

    console.log("\nrademacher() tests passed.\n");
}

function testsSimulateTrajectory() {
    console.log("Tests for simulateTrajectory()");

    const n = 100;

    const trajB = simulateTrajectory(n, 'bernoulli', 0.5);
    console.assert(trajB.length === n, `Error: trajectory should have ${n} steps`);
    console.assert(trajB[0].i === 1, "Error: first step should be i=1");
    console.assert(trajB[n-1].i === n, `Error: last step should be i=${n}`);

    trajB.forEach(({i, Sn, SnOverN, SnOverSqrtN}) => {
        console.assert(typeof Sn === 'number', "Error: Sn should be a number");
        console.assert(Math.abs(SnOverN - Sn / i) < 1e-10, "Error: SnOverN should be Sn/i");
        console.assert(Math.abs(SnOverSqrtN - Sn / Math.sqrt(i)) < 1e-10, "Error: SnOverSqrtN should be Sn/sqrt(i)");
    });

    const trajR = simulateTrajectory(n, 'rademacher');
    console.assert(trajR.length === n, `Error: trajectory should have ${n} steps`);

    trajB.forEach(({Sn}) => {
        console.assert(Number.isInteger(Sn), `Error: Sn should be integer for Bernoulli, got ${Sn}`);
    });
    trajR.forEach(({Sn}) => {
        console.assert(Number.isInteger(Sn), `Error: Sn should be integer for Rademacher, got ${Sn}`);
    });

    console.log("\nsimulateTrajectory() tests passed.\n");
}

function testsSimulateMultiple() {
    console.log("Tests for simulateMultiple()");

    const n = 50;
    const m = 10;
    const trajectories = simulateMultiple(n, m, 'bernoulli', 0.5);

    console.assert(trajectories.length === m, `Error: should have ${m} trajectories`);
    trajectories.forEach(t => {
        console.assert(t.length === n, `Error: each trajectory should have ${n} steps`);
    });

    const firstFinalSn = trajectories[0][n-1].Sn;
    const allSame = trajectories.every(t => t[n-1].Sn === firstFinalSn);
    console.assert(!allSame, "Error: trajectories should be independent (not all the same)");

    console.log("\nsimulateMultiple() tests passed.\n");
}

function testsFinalDistribution() {
    console.log("Tests for finalDistribution()");

    const n = 50;
    const m = 10;
    const trajectories = simulateMultiple(n, m, 'bernoulli', 0.5);
    const dist = finalDistribution(trajectories);

    console.assert(dist.Sn.length === m, `Error: Sn should have ${m} values`);
    console.assert(dist.SnOverN.length === m, `Error: SnOverN should have ${m} values`);
    console.assert(dist.SnOverSqrtN.length === m, `Error: SnOverSqrtN should have ${m} values`);

    trajectories.forEach((t, i) => {
        console.assert(dist.Sn[i] === t[n-1].Sn, "Error: Sn should match last step");
        console.assert(dist.SnOverN[i] === t[n-1].SnOverN, "Error: SnOverN should match last step");
    });

    console.log("\nfinalDistribution() tests passed.\n");
}

function testsTheoreticalValues() {
    console.log("Tests for theoreticalValues()");

    const thB = theoreticalValues(100, 'bernoulli', 0.5);
    console.assert(thB.meanSn === 50, "Error: E[Sn] for Bernoulli(0.5) n=100 should be 50");
    console.assert(thB.varSn === 25, "Error: Var[Sn] for Bernoulli(0.5) n=100 should be 25");
    console.assert(thB.meanSnOverN === 0.5, "Error: E[Sn/n] should be p=0.5");
    console.assert(thB.varSnOverSqrtN === 0.25, "Error: Var[Sn/sqrt(n)] should be p(1-p)=0.25");

    const thR = theoreticalValues(100, 'rademacher');
    console.assert(thR.meanSn === 0, "Error: E[Sn] for Rademacher should be 0");
    console.assert(thR.varSn === 100, "Error: Var[Sn] for Rademacher n=100 should be 100");
    console.assert(thR.meanSnOverN === 0, "Error: E[Sn/n] for Rademacher should be 0");
    console.assert(thR.varSnOverSqrtN === 1, "Error: Var[Sn/sqrt(n)] for Rademacher should be 1");

    console.log("\ntheoreticalValues() tests passed.\n");
}

function testsMean() {
    console.log("Tests for mean()");

    console.assert(mean([1, 2, 3, 4, 5]) === 3, "Error: mean([1,2,3,4,5]) should be 3");
    console.assert(mean([0]) === 0, "Error: mean([0]) should be 0");
    console.assert(mean([-1, 1]) === 0, "Error: mean([-1,1]) should be 0");
    console.assert(Math.abs(mean([1, 2, 3]) - 2) < 1e-10, "Error: mean([1,2,3]) should be 2");

    console.log("\nmean() tests passed.\n");
}

function testsVariance() {
    console.log("Tests for variance()");

    console.assert(variance([5, 5, 5]) === 0, "Error: variance of constant should be 0");

    console.assert(variance([-1, 1]) === 1, "Error: variance([-1,1]) should be 1");

    console.assert(Math.abs(variance([0, 1]) - 0.25) < 1e-10, "Error: variance([0,1]) should be 0.25");

    console.log("\nvariance() tests passed.\n");
}

function testsStdDev() {
    console.log("Tests for stdDev()");

    console.assert(stdDev([5, 5, 5]) === 0, "Error: stdDev of constant should be 0");
    console.assert(Math.abs(stdDev([-1, 1]) - 1) < 1e-10, "Error: stdDev([-1,1]) should be 1");

    console.log("\nstdDev() tests passed.\n");
}

function testsHistogram() {
    console.log("Tests for histogram()");

    const values = [1, 2, 3, 4, 5];
    const { bins, min, max } = histogram(values, 5);

    console.assert(bins.length === 5, `Error: should have 5 bins, got ${bins.length}`);
    console.assert(min === 1, `Error: min should be 1, got ${min}`);
    console.assert(max === 5, `Error: max should be 5, got ${max}`);

    const totalFreq = bins.reduce((acc, b) => acc + b.frequency, 0);
    console.assert(Math.abs(totalFreq - 1) < 1e-10, `Error: total frequency should be 1, got ${totalFreq}`);

    console.log("\nhistogram() tests passed.\n");
}

function testsNormalPDF() {
    console.log("Tests for normalPDF()");

    const expected = 1 / Math.sqrt(2 * Math.PI);
    console.assert(Math.abs(normalPDF(0) - expected) < 1e-10, `Error: normalPDF(0) should be ${expected}`);

    [-3, -2, -1, 0, 1, 2, 3].forEach(x => {
        console.assert(normalPDF(x) > 0, `Error: normalPDF(${x}) should be positive`);
    });

    console.assert(Math.abs(normalPDF(-1) - normalPDF(1)) < 1e-10, "Error: normalPDF should be symmetric");

    console.log("\nnormalPDF() tests passed.\n");
}

function testsLLNConvergence() {
    console.log("Tests for llnConvergence()");

    const trajectories = simulateMultiple(1000, 500, 'bernoulli', 0.5);
    const result = llnConvergence(trajectories, 0.5);

    console.assert(parseFloat(result.error) < 0.05, `Error: LLN error should be < 0.05, got ${result.error}`);

    console.assert(parseFloat(result.empiricalVariance) < 0.01, `Error: variance of Sn/n should be small with large n, got ${result.empiricalVariance}`);

    console.log("\nllnConvergence() tests passed.\n");
}

function testsCLTConvergence() {
    console.log("Tests for cltConvergence()");

    const trajectories = simulateMultiple(1000, 500, 'rademacher');
    const result = cltConvergence(trajectories, 1);

    console.assert(parseFloat(result.varianceError) < 0.1, `Error: CLT variance error should be < 0.1, got ${result.varianceError}`);

    console.assert(Math.abs(parseFloat(result.empiricalMean)) < 0.1, `Error: CLT mean should be ~0, got ${result.empiricalMean}`);

    console.log("\ncltConvergence() tests passed.\n");
}

function runTests() {
    testsBernoulli();
    testsRademacher();
    testsSimulateTrajectory();
    testsSimulateMultiple();
    testsFinalDistribution();
    testsTheoreticalValues();
    testsMean();
    testsVariance();
    testsStdDev();
    testsHistogram();
    testsNormalPDF();
    testsLLNConvergence();
    testsCLTConvergence();
    console.log("All tests passed.");
}

runTests();