import { CURVE_PRIME, computeValidCurvePoints, computeScalarMultiplication, curvePointAddition, multiplyPointScalarFast } from "./logic.js";

const canvas = document.getElementById("ec-canvas");
const ctx = canvas.getContext("2d");

const PADDING = 40;
const CELL = (canvas.width - PADDING * 2) / (CURVE_PRIME - 1);

let animationTimeout = null;

function toCanvas(x, y) {
    return {
        cx: PADDING + x * CELL,
        cy: canvas.height - PADDING - y * CELL
    };
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#161b22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#30363d";
    ctx.lineWidth = 0.5;

    for (let i = 0; i < CURVE_PRIME; i++) {
        const {cx} = toCanvas(i, 0);
        ctx.beginPath(); ctx.moveTo(cx, PADDING); ctx.lineTo(cx, canvas.height - PADDING); ctx.stroke();

        const {cy} = toCanvas(0, i);
        ctx.beginPath(); ctx.moveTo(PADDING, cy); ctx.lineTo(canvas.width - PADDING, cy); ctx.stroke();

        ctx.fillStyle = "#8b949e";
        ctx.font = "10px monospace";
        ctx.fillText(i, PADDING + i * CELL - 3, canvas.height - PADDING + 15);
        ctx.fillText(i, PADDING - 20, canvas.height - PADDING - i * CELL + 4);
    }
}

function drawValidPoints(points) {
    points.forEach(({x, y}) => {
        const {cx, cy} = toCanvas(x, y);
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#30363d";
        ctx.fill();
    });
}

function drawPoint(x, y, color, label) {
    const {cx, cy} = toCanvas(x, y);
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.font = "bold 11px monospace";
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(cx + 7, cy - 20, textWidth + 4, 16);

    ctx.fillStyle = color;
    ctx.fillText(label, cx + 8, cy - 8);
}

function drawLine(x1, y1, x2, y2, color = "#58a6ff44") {
    const p1 = toCanvas(x1, y1);
    const p2 = toCanvas(x2, y2);
    ctx.beginPath();
    ctx.moveTo(p1.cx, p1.cy);
    ctx.lineTo(p2.cx, p2.cy);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

function generateFastAnimationSteps(scalar, point) {
    let result = null;
    let currentDouble = {...point};
    let remainingScalar = scalar;
    const animationSteps = [];

    while (remainingScalar > 0) {
        const bit = remainingScalar & 1;

        if (bit === 1) {
            const previousResult = result ? {...result} : null;
            result = curvePointAddition(result, currentDouble);

            animationSteps.push({
                type: "add",
                desc: `BIT = 1: Adding current double to accumulator`,
                pointToDraw: result ? {...result} : null,
                prevResult: previousResult,
                addedPoint: {...currentDouble}
            });
        } else {
            animationSteps.push({
                type: "skip",
                desc: `BIT = 0: Skipping addition`,
                pointToDraw: currentDouble ? {...currentDouble} : null
            });
        }

        currentDouble = curvePointAddition(currentDouble, currentDouble);

        if (currentDouble) {
            animationSteps.push({
                type: "double",
                desc: `DOUBLE: Doubling current point`,
                pointToDraw: {...currentDouble}
            });
        }

        remainingScalar >>= 1;
    }

    return animationSteps;
}

function animateSequential(steps, validPoints, k) {
    let i = 0;

    function step() {
        drawGrid();
        drawValidPoints(validPoints);

        for (let j = 0; j < i; j++) {
            const {point} = steps[j];
            if (!point) continue;
            const prev = j > 0 ? steps[j - 1].point : null;
            if (prev) drawLine(prev.x, prev.y, point.x, point.y);
            drawPoint(point.x, point.y, "#58a6ff", `${j + 1}G`);
        }

        if (i < steps.length) {
            const {point} = steps[i];
            if (point) {
                const prev = i > 0 ? steps[i - 1].point : null;
                if (prev) drawLine(prev.x, prev.y, point.x, point.y);
                drawPoint(point.x, point.y, "#f78166", `${i + 1}G`);
                document.getElementById("anim-step").textContent =
                    `Step ${i + 1}/${steps.length}: ${i + 1}G = (${point.x}, ${point.y})`;
            } else {
                document.getElementById("anim-step").textContent =
                    `Step ${i + 1}/${steps.length}: ${i + 1}G = point at infinity`;
            }
            i++;
            animationTimeout = setTimeout(step, 600);
        } else {
            const final = steps[steps.length - 1].point;
            document.getElementById("anim-step").textContent = final
                ? `Public Key Q = ${k}G = (${final.x}, ${final.y})`
                : `${k}G = point at infinity`;
        }
    }

    step();
}

function animateFast(steps, validPoints, k, basePoint) {
    let i = 0;
    const accumulatedLines = [];

    document.getElementById("anim-step").innerHTML = `
        <span style="color: #ffa657;">Large k detected: using Double-and-Add algorithm.</span><br>
        <span style="color: #8b949e;">Note: in real cryptography, private keys are not chosen to be large —
        they are chosen randomly. A large k on this toy curve is cryptographically 
        meaningless: the points repeat cyclically with period equal to the group order.</span>
        <br><br>Binary representation of k=${k}: <b style="color: #79c0ff;">${k.toString(2)}</b>
    `;

    function step() {
        drawGrid();
        drawValidPoints(validPoints);

        accumulatedLines.forEach(line =>
            drawLine(line.x1, line.y1, line.x2, line.y2, "#34d05888")
        );

        if (i < steps.length) {
            const currentStep = steps[i];

            if (currentStep.type === "double" && currentStep.pointToDraw) {
                drawPoint(currentStep.pointToDraw.x, currentStep.pointToDraw.y, "#b392f0", "2^n·G");
                document.getElementById("anim-step").innerHTML += `
                    <br><span style="color: #b392f0;">[DOUBLE]</span> ${currentStep.desc} → (${currentStep.pointToDraw.x}, ${currentStep.pointToDraw.y})
                `;
            } else if (currentStep.type === "add" && currentStep.pointToDraw) {
                drawPoint(currentStep.pointToDraw.x, currentStep.pointToDraw.y, "#ffa657", "Q");
                if (currentStep.prevResult) {
                    drawLine(
                        currentStep.prevResult.x, currentStep.prevResult.y,
                        currentStep.pointToDraw.x, currentStep.pointToDraw.y,
                        "#34d058"
                    );
                    accumulatedLines.push({
                        x1: currentStep.prevResult.x, y1: currentStep.prevResult.y,
                        x2: currentStep.pointToDraw.x, y2: currentStep.pointToDraw.y
                    });
                }
                document.getElementById("anim-step").innerHTML += `
                    <br><span style="color: #34d058;">[ADD]</span> ${currentStep.desc} → Q = (${currentStep.pointToDraw.x}, ${currentStep.pointToDraw.y})
                `;
            } else if (currentStep.type === "skip") {
                document.getElementById("anim-step").innerHTML += `
                    <br><span style="color: #8b949e;">[SKIP]</span> ${currentStep.desc}
                `;
            }

            i++;
            animationTimeout = setTimeout(step, 1000);
        } else {
            const finalPoint = multiplyPointScalarFast(k, basePoint);
            document.getElementById("anim-step").innerHTML += `
                <br><br><span style="color: #79c0ff;">Double-and-Add complete!</span> 
                Q = ${k}G = (${finalPoint.x}, ${finalPoint.y})
            `;
        }
    }

    setTimeout(step, 3000);
}

function resetAnimation() {
    if (animationTimeout) clearTimeout(animationTimeout);

    const gSelectElement = document.getElementById("g-select");
    if (!gSelectElement || !gSelectElement.value) return;

    const basePoint = JSON.parse(gSelectElement.value);
    const validPoints = computeValidCurvePoints();
    drawGrid();
    drawValidPoints(validPoints);
    document.getElementById("anim-step").textContent = "";
}

document.getElementById("start-btn").addEventListener("click", () => {
    if (animationTimeout) clearTimeout(animationTimeout);

    const basePoint = JSON.parse(document.getElementById("g-select").value);
    const k = parseInt(document.getElementById("k-input").value);
    const validPoints = computeValidCurvePoints();
    const engineResult = computeScalarMultiplication(k, basePoint);

    if (!engineResult.fastMethodUsed) {
        animateSequential(engineResult.steps, validPoints, k);
    } else {
        const fastSteps = generateFastAnimationSteps(k, basePoint);
        animateFast(fastSteps, validPoints, k, basePoint);
    }
});

document.getElementById("reset-btn").addEventListener("click", resetAnimation);

setTimeout(resetAnimation, 50);
