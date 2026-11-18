import { parseCSV, discretize, DATASETS } from "../datasets.js";

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

function runTests() {
    testsDATASETS();
    testsParseCSV();
    testsDiscretize();
    console.log("All tests passed.");
}

runTests(); 