function testsMod() {
    console.log("Tests for the mod() function");
    console.assert(mod(5, 3) === 2, "Error: mod(5, 3) should be 2");
    console.assert(mod(-1, 5) === 4, "Error: mod(-1, 5) should be 4");
    console.assert(mod(5, 5) === 0, "Error: mod(5, 5) should be 0");
    console.assert(mod(-7, 10) === 3, "Error: mod(-7, 10) should be 3");
    console.log("\nFunction mod() tests passed.\n");
}

function testsModInverse() {
    console.log("Tests for the modInverse() function");
    console.assert(modInverse(3, 17) === 6, "Error: the multiplicative inverse of 3 mod 17 should be 6");
    console.assert(modInverse(5, 17) === 7, "Error: the multiplicative inverse of 5 mod 17 should be 7");
    
    let throwed = false;
    try {
        modInverse(4, 6);
    } catch (error) {
        throwed = true;
    }
    console.assert(throwed === true, "Error: 4 and 6 aren't coprimes, therefore modInverse() should've thrown an error");
    throwed = false;
    try {
        modInverse(0, 17);
    } catch (error) {
        throwed = true;
    }
    console.assert(throwed === true, "Error: 0 and 17 aren't coprimes, therefore modInverse() should've thrown an error");
    console.log("\nFunction modInverse() tests passed.\n");
}

function testsCurvePointAddition() {
    console.log("Tests for the curvePointAddition() function");
    console.assert(curvePointAddition(BASE_POINT, null) === BASE_POINT, "Error: G + the identity i should return G");
    console.assert(curvePointAddition(null, BASE_POINT) === BASE_POINT, "Error: the identity i + G should return G");
    
    const doubleG = curvePointAddition(BASE_POINT, BASE_POINT);
    console.assert(doubleG != null && doubleG.x === 2 && doubleG.y === 10, `Error: 2G should be {x: 2, y: 10}, while the current result is `, doubleG);

    const negG = {x: 1, y: 12};
    const sumSymmetric = curvePointAddition(BASE_POINT, negG);
    console.assert(sumSymmetric === null, "Error the sum of points symmetric across the x-axis must return null");
    console.log("\nFunction curvePointsAdditon() tests passed.\n");
}

function testsMultiplyPointScalar() {
    console.log("Tests for the multiplyPointScalar() function");

    const k1 = multiplyPointScalar(1, BASE_POINT);
    console.assert(k1.result !== null && k1.result.x === BASE_POINT.x && k1.result.y === BASE_POINT.y,"Error: 1*G should be G itself");

    const k2 = multiplyPointScalar(2, BASE_POINT);
    const doubleG = curvePointAddition(BASE_POINT, BASE_POINT);
    console.assert(k2.result !== null && k2.result.x === doubleG.x && k2.result.y === doubleG.y,"Error: 2*G should match curvePointAddition(G, G)");

    const k6 = multiplyPointScalar(6, BASE_POINT);
    console.assert(k6.result !== null && k6.result.x === 5 && k6.result.y === 8, `Error: 6*G should be {x: 5, y: 8}, while the current result is, `, k6.result);

    const k18 = multiplyPointScalar(18, BASE_POINT);
    console.assert(k18.result === null, "Error: 18*G should be the point at infinity (null)");

    console.assert(k1.steps.length === 1, "Error: steps length should equal k (k=1)");
    console.assert(k2.steps.length === 2, "Error: steps length should equal k (k=2)");
    console.assert(k6.steps.length === 6, "Error: steps length should equal k (k=6)");

    console.assert(k2.steps[0].point.x === BASE_POINT.x && k2.steps[0].point.y === BASE_POINT.y,"Error: the first step should always be G")
    console.log("\nFunction multiplyPointScalar() tests passed\n");
    console.log("All tests passed.");
}

function runTests() {
    testsMod();

    testsModInverse();

    testsCurvePointAddition();

    testsMultiplyPointScalar();
}

runTests();
