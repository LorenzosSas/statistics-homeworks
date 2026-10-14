const CURVE_PRIME = 17;
const CURVE_PARAM_A = 0;
const CURVE_PARAM_B = 7;
const BASE_POINT= {x: 1, y: 5};
const PRIVATE_KEY = 6;
const mod = (n, m) => ((n % m ) + m) % m;
const MAX_SEQUENTIAL_THRESHOLD = 1000;

function modInverse(num, modulo) {
    num = mod(num, modulo);

    let [prevRemainder, currRemainder] = [num, modulo];
    let [prevCoeff, currCoeff] = [1, 0];

    while (currRemainder !== 0) {
        const quotient = Math.floor(prevRemainder / currRemainder);
        const newRemainder = prevRemainder - quotient * currRemainder;
        const newCoeff = prevCoeff - quotient * currCoeff;

        [prevRemainder, currRemainder] = [currRemainder, newRemainder];
        [prevCoeff, currCoeff] = [currCoeff, newCoeff];
    }

    if (prevRemainder !== 1) {
        throw new Error(`The element ${num} doesn't have a multiplicative inverse modulo ${modulo} (MCD = ${prevRemainder})`);
    }

    return mod(prevCoeff, modulo);
}


function curvePointAddition(point1, point2) {
    if (point1 === null) return point2;
    if (point2 === null) return point1;

    if (point1.x === point2.x && (point1.y !== point2.y || point1.y === 0)) {
        return null;
    }

    let slope;

    if (point1.x === point2.x && point1.y === point2.y) {
        const numerator = 3 * (point1.x ** 2) + CURVE_PARAM_A;
        const denominator = 2 * point1.y;
        slope = mod(numerator * modInverse(denominator, CURVE_PRIME), CURVE_PRIME);
    } else {
        const numerator = point1.y - point2.y;
        const denominator = point1.x - point2.x;
        slope = mod(numerator * modInverse(denominator, CURVE_PRIME), CURVE_PRIME);
    }

    const x3 = mod(mod(mod(slope ** 2, CURVE_PRIME) - point1.x, CURVE_PRIME) - point2.x, CURVE_PRIME);
    const y3 = mod(point1.y + mod(slope * mod(x3 - point1.x, CURVE_PRIME), CURVE_PRIME), CURVE_PRIME);

    return {x: x3, y: mod(-y3, CURVE_PRIME)};
}

function multiplyPointScalar(scalar, point) {
    if (scalar === 0 || point === null) return {result: null, steps: []};
    let currResult = null;
    const execSteps = [];

    for (let stepIdx = 1; stepIdx <= scalar; stepIdx++) {
        currResult = curvePointAddition(currResult, point);

        execSteps.push({
            step: stepIdx,
            point: currResult ? {...currResult} : null
        });
    }

    return {
        result: currResult,
        steps: execSteps
    };
}

function multiplyPointScalarFast(scalar, point) {
    if (scalar === 0 || point === null) return null;

    let result = null;
    let currDouble = {...point};
    let remainingScalar = scalar;

    while (remainingScalar > 0) {
        if ((remainingScalar & 1) === 1) result = curvePointAddition(result, currDouble);
        currDouble = curvePointAddition(currDouble, currDouble);
        remainingScalar >>= 1;
    }

    return result;
}

function computeScalarMultiplication(scalar, point) {
    if (scalar === 0 || point === null) return {result: null, steps: [], fastMethodUsed: false};
    if (scalar <= MAX_SEQUENTIAL_THRESHOLD) {
        return {...multiplyPointScalar(scalar, point), fastMethodUsed: false};
    } else {
        const finalPoint = multiplyPointScalarFast(scalar, point);

        return {
            result: finalPoint,
            steps: [
                {step: 1, point: {...point}},
                {step: "...", point: null},
                {step: scalar, point: finalPoint ? {...finalPoint} : null}
            ],
            fastMethodUsed: true
        };
    }
}
