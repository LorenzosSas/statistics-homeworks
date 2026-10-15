function coordFrequency(points) {
    const freqX = {};
    const freqY = {};

    points.forEach(({x, y}) => {
        freqX[x] = (freqX[x] || 0) + 1;
        freqY[y] = (freqY[y] || 0) + 1;
    });

    return {freqX, freqY};
}

function bitDistribution(points) {
    let [zeros, ones] = [0, 0];

    points.forEach(({x, y}) => {
        [x, y].forEach(val => {
            const bits = val.toString(2);
            zeros += bits.split("0").length - 1;
            ones += bits.split("1").length - 1;
        });
    });

    return {zeros, ones, ratio: ones / (zeros + ones)};
}

function hammingDistance(val1, val2) {
    return (val1 ^ val2).toString(2).split("1").length - 1;
}

function avalancheTest(basePoint, maxK) {
    const results = [];

    for (let i = 1; i <= maxK; i++) {
        const {result} = multiplyPointScalar(i, basePoint);
        results.push({k: i, point: result ? {...result} : null});
    }

    const diffs = [];
    for (let i = 0; i < results.length - 1; i++) {
        const p1 = results[i].point;
        const p2 = results[i + 1].point;
        
        if (!p1 || !p2) {
            diffs.push({k: results[i].k, bitsChanged: null});
            continue;
        }
        const bitsChanged = hammingDistance(p1.x, p2.x) + hammingDistance(p1.y, p2.y);
        diffs.push({k: results[i].k, bitsChanged});
    }

    return {results, diffs};
}
