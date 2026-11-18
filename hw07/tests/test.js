import { parseCSV, discretize, DATASETS } from "../datasets.js";
import { prepareData, buildContingencyTable, expectedFrequencies, chiSquareStatistic, interpret } from "../contingency.js";

function testsDATASETS() {
    console.log("Tests for DATASETS");

    for (const [key, ds] of Object.entries(DATASETS)) {
        console.assert(typeof ds.name === 'string', `Error: ${key} should have a name`);
        console.assert(typeof ds.description === 'string', `Error: ${key} should have a description`);
        console.assert(Array.isArray(ds.data) && ds.data.length > 0, `Error: ${key} should have data`);
        console.assert(typeof ds.variables.X === 'string', `Error: ${key} should have X variable name`);
        console.assert(typeof ds.variables.F === 'string', `Error: ${key} should have F variable name`);
        console.assert(ds.type === 'categorical' || ds.type === 'continuous', `Error: ${key} should have valid type`);

        ds.data.forEach((row, i) => {
            console.assert(row.X !== undefined, `Error: ${key} row ${i} should have X`);
            console.assert(row.F !== undefined, `Error: ${key} row ${i} should have F`);
        });
    }

    console.log("\nDATASETS tests passed.\n");
}

function testsParseCSV() {
    console.log("Tests for parseCSV()");

    const csv1 = `Gender,Disease\nMale,Yes\nMale,No\nFemale,Yes\nFemale,No`;
    const result1 = parseCSV(csv1);
    console.assert(result1.data.length === 4, `Error: should have 4 rows, got ${result1.data.length}`);
    console.assert(result1.variables.X === 'Gender', `Error: X should be 'Gender', got ${result1.variables.X}`);
    console.assert(result1.variables.F === 'Disease', `Error: F should be 'Disease', got ${result1.variables.F}`);
    console.assert(result1.type === 'categorical', `Error: type should be categorical, got ${result1.type}`);
    console.assert(result1.data[0].X === 'Male', `Error: first X should be 'Male'`);
    console.assert(result1.data[0].F === 'Yes', `Error: first F should be 'Yes'`);

    const csv2 = `Age,Score\n20,80\n30,90\n40,70`;
    const result2 = parseCSV(csv2);
    console.assert(result2.data.length === 3, `Error: should have 3 rows`);
    console.assert(result2.type === 'continuous', `Error: type should be continuous, got ${result2.type}`);
    console.assert(result2.data[0].X === 20, `Error: first X should be 20`);
    console.assert(result2.data[0].F === 80, `Error: first F should be 80`);

    const csv3 = `Male,Yes\nFemale,No`;
    const result3 = parseCSV(csv3, 0, 1, false);
    console.assert(result3.data.length === 2, `Error: should have 2 rows`);
    console.assert(result3.variables.X === 'X', `Error: X should be 'X' without header`);

    const csv4 = `ID,Gender,Age,Disease\n1,Male,30,Yes\n2,Female,25,No`;
    const result4 = parseCSV(csv4, 1, 3);
    console.assert(result4.variables.X === 'Gender', `Error: X should be 'Gender'`);
    console.assert(result4.variables.F === 'Disease', `Error: F should be 'Disease'`);
    console.assert(result4.data[0].X === 'Male', `Error: first X should be 'Male'`);

    const csv5 = `A,B\n1,2\n\n3,4\n`;
    const result5 = parseCSV(csv5);
    console.assert(result5.data.length === 2, `Error: empty rows should be filtered, got ${result5.data.length}`);

    console.log("\nparseCSV() tests passed.\n");
}

function testsDiscretize() {
    console.log("Tests for discretize()");

    const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = discretize(values, 4);

    console.assert(result.length === values.length, `Error: output length should match input, got ${result.length}`);

    result.forEach((bin, i) => {
        console.assert(typeof bin === 'string', `Error: bin ${i} should be a string`);
        console.assert(bin.startsWith('['), `Error: bin ${i} should start with [, got ${bin}`);
        console.assert(bin.includes(','), `Error: bin ${i} should contain comma`);
    });

    const bins = discretize([0, 10], 4);
    console.assert(bins[0] !== bins[1], "Error: 0 and 10 should be in different bins");

    const sameBins = discretize([5, 5, 5], 4);
    console.assert(sameBins[0] === sameBins[1] && sameBins[1] === sameBins[2], "Error: equal values should be in same bin");

    const oneBin = discretize([1, 5, 9], 1);
    console.assert(oneBin[0] === oneBin[1] && oneBin[1] === oneBin[2], "Error: with 1 bin everything should be in same bin");

    console.log("\ndiscretize() tests passed.\n");
}

function testsPrepareData() {
    console.log("Tests for prepareData()");

    const catData = [{X: 'Male', F: 'Yes'}, {X: 'Female', F: 'No'}];
    const catResult = prepareData(catData, 'categorical');
    console.assert(catResult[0].X === 'Male', "Error: categorical X should be unchanged");
    console.assert(catResult[0].F === 'Yes', "Error: categorical F should be unchanged");

    const contData = [{X: 0, F: 0}, {X: 5, F: 5}, {X: 10, F: 10}];
    const contResult = prepareData(contData, 'continuous', 2);
    console.assert(typeof contResult[0].X === 'string', "Error: continuous X should be discretized to string");
    console.assert(typeof contResult[0].F === 'string', "Error: continuous F should be discretized to string");
    console.assert(contResult[0].X !== contResult[2].X, "Error: 0 and 10 should be in different bins");

    const numData = [{X: 1, F: 2}];
    const numResult = prepareData(numData, 'categorical');
    console.assert(typeof numResult[0].X === 'string', "Error: categorical should convert to string");

    console.log("\nprepareData() tests passed.\n");
}

function testsBuildContingencyTable() {
    console.log("Tests for buildContingencyTable()");

    const data = [
        {X: 'A', F: 'X'},
        {X: 'A', F: 'X'},
        {X: 'A', F: 'Y'},
        {X: 'B', F: 'X'},
        {X: 'B', F: 'Y'},
        {X: 'B', F: 'Y'},
    ];

    const table = buildContingencyTable(data);

    console.assert(table.n === 6, `Error: n should be 6, got ${table.n}`);
    console.assert(table.xCategories.length === 2, "Error: should have 2 X categories");
    console.assert(table.fCategories.length === 2, "Error: should have 2 F categories");

    console.assert(table.observed['A']['X'] === 2, `Error: A,X should be 2`);
    console.assert(table.observed['A']['Y'] === 1, `Error: A,Y should be 1`);
    console.assert(table.observed['B']['X'] === 1, `Error: B,X should be 1`);
    console.assert(table.observed['B']['Y'] === 2, `Error: B,Y should be 2`);

    console.assert(table.rowTotals['A'] === 3, `Error: row total A should be 3`);
    console.assert(table.rowTotals['B'] === 3, `Error: row total B should be 3`);
    console.assert(table.colTotals['X'] === 3, `Error: col total X should be 3`);
    console.assert(table.colTotals['Y'] === 3, `Error: col total Y should be 3`);

    console.assert(Math.abs(table.rowFreq['A'] - 0.5) < 1e-10, "Error: row freq A should be 0.5");
    console.assert(Math.abs(table.colFreq['X'] - 0.5) < 1e-10, "Error: col freq X should be 0.5");

    console.assert(Math.abs(table.conditionalFgivenX['A']['X'] - 2/3) < 1e-10, "Error: P(X|A) should be 2/3");
    console.assert(Math.abs(table.conditionalFgivenX['B']['Y'] - 2/3) < 1e-10, "Error: P(Y|B) should be 2/3");

    console.assert(Math.abs(table.conditionalXgivenF['X']['A'] - 2/3) < 1e-10, "Error: P(A|X) should be 2/3");

    table.xCategories.forEach(x => {
        const sum = table.fCategories.reduce((acc, f) => acc + table.conditionalFgivenX[x][f], 0);
        console.assert(Math.abs(sum - 1) < 1e-10, `Error: P(F|${x}) should sum to 1`);
    });

    console.log("\nbuildContingencyTable() tests passed.\n");
}

function testsExpectedFrequencies() {
    console.log("Tests for expectedFrequencies()");

    const data = [
        {X: 'A', F: 'X'},
        {X: 'A', F: 'Y'},
        {X: 'B', F: 'X'},
        {X: 'B', F: 'Y'},
    ];

    const table = buildContingencyTable(data);
    const expected = expectedFrequencies(table);

    table.xCategories.forEach(x => {
        table.fCategories.forEach(f => {
            console.assert(Math.abs(expected[x][f] - 1) < 1e-10, `Error: expected[${x}][${f}] should be 1, got ${expected[x][f]}`);
        });
    });

    let sum = 0;
    table.xCategories.forEach(x => {
        table.fCategories.forEach(f => {sum += expected[x][f];});
    });
    console.assert(Math.abs(sum - table.n) < 1e-10, `Error: sum of expected should be n=${table.n}, got ${sum}`);

    table.xCategories.forEach(x => {
        const expRowTotal = table.fCategories.reduce((acc, f) => acc + expected[x][f], 0);
        console.assert(Math.abs(expRowTotal - table.rowTotals[x]) < 1e-10, `Error: expected row total for ${x} should match observed`);
    });

    console.log("\nexpectedFrequencies() tests passed.\n");
}

function testsChiSquareStatistic() {
    console.log("Tests for chiSquareStatistic()");

    const indepData = [
        {X: 'A', F: 'X'}, {X: 'A', F: 'Y'},
        {X: 'B', F: 'X'}, {X: 'B', F: 'Y'},
    ];
    const indepTable = buildContingencyTable(indepData);
    const indepExpected = expectedFrequencies(indepTable);
    const indepResult = chiSquareStatistic(indepTable, indepExpected);
    console.assert(Math.abs(indepResult.chi2) < 1e-10, `Error: chi2 for independent variables should be 0, got ${indepResult.chi2}`);

    console.assert(indepResult.degreesOfFreedom === 1, `Error: df for 2x2 table should be 1, got ${indepResult.degreesOfFreedom}`);

    const depData = [
        {X: 'A', F: 'X'}, {X: 'A', F: 'X'}, {X: 'A', F: 'X'},
        {X: 'B', F: 'Y'}, {X: 'B', F: 'Y'}, {X: 'B', F: 'Y'},
    ];
    const depTable = buildContingencyTable(depData);
    const depExpected = expectedFrequencies(depTable);
    const depResult = chiSquareStatistic(depTable, depExpected);
    console.assert(depResult.chi2 > 0, `Error: chi2 for dependent variables should be > 0, got ${depResult.chi2}`);

    console.assert(indepResult.chi2 >= 0, "Error: chi2 should be >= 0");
    console.assert(depResult.chi2 >= 0, "Error: chi2 should be >= 0");

    let sum = 0;
    indepTable.xCategories.forEach(x => {
        indepTable.fCategories.forEach(f => {
            sum += indepResult.contributions[x][f];
        });
    });
    console.assert(Math.abs(sum - indepResult.chi2) < 1e-10, "Error: contributions should sum to chi2");

    const data3x2 = [
        {X: 'A', F: 'X'}, {X: 'B', F: 'Y'}, {X: 'C', F: 'X'},
        {X: 'A', F: 'Y'}, {X: 'B', F: 'X'}, {X: 'C', F: 'Y'},
    ];
    const table3x2 = buildContingencyTable(data3x2);
    const exp3x2 = expectedFrequencies(table3x2);
    const result3x2 = chiSquareStatistic(table3x2, exp3x2);
    console.assert(result3x2.degreesOfFreedom === 2, `Error: df for 3x2 table should be 2, got ${result3x2.degreesOfFreedom}`);

    console.log("\nchiSquareStatistic() tests passed.\n");
}

function testsInterpret() {
    console.log("Tests for interpret()");

    const dep = interpret(10, 1, 0.001);
    console.assert(dep.isDependent === true, "Error: p=0.001 < 0.05 should be dependent");
    console.assert(typeof dep.conclusion === 'string', "Error: conclusion should be a string");
    console.assert(typeof dep.causalityNote === 'string', "Error: causalityNote should be a string");

    const indep = interpret(0.1, 1, 0.9);
    console.assert(indep.isDependent === false, "Error: p=0.9 >= 0.05 should be independent");

    const custom = interpret(5, 1, 0.03, 0.01);
    console.assert(custom.isDependent === false, "Error: p=0.03 >= 0.01 should be independent");

    console.log("\ninterpret() tests passed.\n");
}

function runTests() {
    testsDATASETS();
    testsParseCSV();
    testsDiscretize();
    testsPrepareData();
    testsBuildContingencyTable();
    testsExpectedFrequencies();
    testsChiSquareStatistic();
    testsInterpret();
    console.log("All tests passed.");
}

runTests(); 