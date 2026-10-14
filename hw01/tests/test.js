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

    const k0 = multiplyPointScalar(0, BASE_POINT);
    console.assert(k0.result === null, "Error: 0*G should return null result");
    console.assert(k0.steps.length === 0, "Error: 0*G should return empty steps");

    const nullPoint = multiplyPointScalar(6, null);
    console.assert(nullPoint.result === null, "Error: k*null should return null result");
    console.assert(nullPoint.steps.length === 0, "Error: k*null should return empty steps");

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
}

function testsMultiplyPointScalarFast() {
    console.log("Tests for the multiplyPointScalarFast() function");

    const k0 = multiplyPointScalarFast(0, BASE_POINT);
    console.assert(k0 === null, "Error: 0*G should be null");

    const nullPoint = multiplyPointScalarFast(6, null);
    console.assert(nullPoint === null, "Error: k*null should return null");

    const k1 = multiplyPointScalarFast(1, BASE_POINT);
    console.assert(k1 !== null && k1.x === BASE_POINT.x && k1.y === BASE_POINT.y, "Error: 1*G should be G itself");

    const k6 = multiplyPointScalarFast(6, BASE_POINT);
    console.assert(k6 !== null && k6.x === 5 && k6.y === 8, `Error: 6*G should be {x: 5, y: 8}, got`, k6);

    const k18 = multiplyPointScalarFast(18, BASE_POINT);
    console.assert(k18 === null, "Error: 18*G should be null (group order)");

    console.log("\nFunction multiplyPointScalarFast() tests passed.\n");
}

function testsComputeScalarMultiplication() {
    console.log("Tests for the computeScalarMultiplication() function");

    const k0 = computeScalarMultiplication(0, BASE_POINT);
    console.assert(k0.result === null, "Error: 0*G should return null result");
    console.assert(k0.steps.length === 0, "Error: 0*G should return empty steps");
    console.assert(k0.fastMethodUsed === false, "Error: 0*G should have fastMethodUsed false");

    const nullPoint = computeScalarMultiplication(6, null);
    console.assert(nullPoint.result === null, "Error: k*null should return null result");
    console.assert(nullPoint.steps.length === 0, "Error: k*null should return empty steps");
    console.assert(nullPoint.fastMethodUsed === false, "Error: k*null should have fastMethodUsed false");

    const slow = computeScalarMultiplication(6, BASE_POINT);
    console.assert(slow.fastMethodUsed === false, "Error: k=6 should use the slow method");
    console.assert(slow.steps.length === 6, "Error: steps length should equal k when using slow method");
    console.assert(slow.result !== null && slow.result.x === 5 && slow.result.y === 8, `Error: 6*G should be {x: 5, y: 8}, got`, slow.result);

    const fast = computeScalarMultiplication(MAX_SEQUENTIAL_THRESHOLD + 1, BASE_POINT);
    console.assert(fast.fastMethodUsed === true, "Error: k > MAX_SEQUENTIAL_THRESHOLD should use the fast method");
    console.assert(fast.steps.length === 3, "Error: fast method should return exactly 3 steps");

    const direct = multiplyPointScalar(6, BASE_POINT).result;
    console.assert(slow.result !== null && slow.result.x === direct.x && slow.result.y === direct.y, "Error: computeScalarMultiplication and multiplyPointScalar should agree on k=6");

    console.log("\nFunction computeScalarMultiplication() tests passed.\n");
}

function testsSlowFastConsistency() {
    console.log("Consistency tests between slow and fast methods");

    [1, 2, 3, 6, 10, 17].forEach(k => {
        const slow = multiplyPointScalar(k, BASE_POINT).result;
        const fast = multiplyPointScalarFast(k, BASE_POINT);
        const match = (slow === null && fast === null) || (slow !== null && fast !== null && slow.x === fast.x && slow.y === fast.y);
        console.assert(match, `Error: slow and fast methods disagree at k=${k}. Slow:`, slow, "Fast:", fast);
    });

    console.log("\nConsistency tests passed.\n");
}

function runTests() {
    testsMod();

    testsModInverse();

    testsCurvePointAddition();

    testsMultiplyPointScalar();

    testsMultiplyPointScalarFast();

    testsComputeScalarMultiplication();

    testsSlowFastConsistency();

    console.log("All tests passed.");
}

runTests();
