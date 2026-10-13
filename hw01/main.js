const {result, steps} = multiplyPointScalar(PRIVATE_KEY, BASE_POINT);

const stepsOutput = document.getElementById("steps-output");
steps.forEach(({ step, point }) => {
    const p = document.createElement("p");
    p.textContent = `${step}G = (${point.x}, ${point.y})`;
    stepsOutput.appendChild(p);
});

const resultOutput = document.getElementById("result-output");
resultOutput.textContent = `Public Key Q = ${PRIVATE_KEY}G = (${result.x}, ${result.y})`;
