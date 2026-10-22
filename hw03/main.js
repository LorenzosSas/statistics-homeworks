import { buildEmbeddingTable, eccEncrypt, eccDecrypt, generatePublicKey } from './ecc.js';
import { caesarEncrypt, caesarDecrypt, letterFrequency, recoverKey, exhaustiveSearch } from './caesar.js';
import { bruteForceAttack, babyStepGiantStep, compareAttacks } from './attack.js';
import { compareDistributions, indexOfCoincidence, shannonEntropy, analyzeByLength, fullStatAnalysis } from './stats.js';
import { computeValidCurvePoints, computeGroupPoints } from '../hw01/logic.js';

const DEFAULT_BASE_POINT = { x: 1, y: 5 };
const DEFAULT_PRIVATE_KEY = 6;
const DEFAULT_MESSAGE = "HELLO";
const DEFAULT_CAESAR_SHIFT = 3;
const DEFAULT_R = 2;

const messageInput = document.getElementById('message-input');
const privateKeyInput = document.getElementById('private-key-input');
const rInput = document.getElementById('r-input');
const gSelect = document.getElementById('g-select');
const caesarShiftInput = document.getElementById('caesar-shift-input');
const encryptBtn = document.getElementById('encrypt-btn');
const errorOutput = document.getElementById('error-output');

const validPoints = computeValidCurvePoints();
validPoints.forEach(({ x, y }) => {
    const option = document.createElement('option');
    option.value = JSON.stringify({ x, y });
    option.textContent = (`${x}, ${y}`);
    if (x === DEFAULT_BASE_POINT.x && y === DEFAULT_BASE_POINT.y) option.selected = true;
    gSelect.appendChild(option);
});

function showError(msg) {
    errorOutput.textContent = msg;
}

function clearError() {
    errorOutput.textContent = '';
}

function setOutput(id, content) {
    document.getElementById(id).innerHTML = content;
}

encryptBtn.addEventListener('click', () => {
    clearError();

    const message = messageInput.value.trim();
    const privateKey = parseInt(privateKeyInput.value);
    const r = parseInt(rInput.value);
    const basePoint = JSON.parse(gSelect.value);
    const caesarShift = parseInt(caesarShiftInput.value);

    if (!message) { showError('Please enter a message.'); return; }
    if (isNaN(privateKey) || privateKey < 1) { showError('Private key must be a positive integer.'); return; }
    if (isNaN(r) || r < 1) { showError('r must be a positive integer.'); return; }
    if (isNaN(caesarShift)) { showError('Caesar shift must be an integer.'); return; }

    try {
        const publicKey = generatePublicKey(privateKey, basePoint);
        const eccCiphertext = eccEncrypt(message, publicKey, basePoint, r);
        const eccDecrypted = eccDecrypt(eccCiphertext, privateKey);

        setOutput('ecc-public-key', `Q = ${privateKey}G = (${publicKey.x}, ${publicKey.y})`);
        setOutput('ecc-ciphertext', eccCiphertext.map((pair, i) =>
            `Char '${message[i]}': C1=(${pair.C1.x}, ${pair.C1.y}), C2=(${pair.C2.x}, ${pair.C2.y})`
        ).join('<br>'));
        setOutput('ecc-decrypted', eccDecrypted);

        const caesarEncrypted = caesarEncrypt(message, caesarShift);
        const caesarDecrypted = caesarDecrypt(caesarEncrypted, caesarShift);

        setOutput('caesar-ciphertext', caesarEncrypted);
        setOutput('caesar-decrypted', caesarDecrypted);

        const corpusInput = document.getElementById('corpus-input').value;
        const corpus = corpusInput || message.repeat(20);
        const corpusEncrypted = caesarEncrypt(corpus, caesarShift);
        const recovered = recoverKey(corpusEncrypted);

        setOutput('freq-analysis-output', `
            <p>Ciphertext length: ${corpusEncrypted.length} characters</p>
            <p>Recovered key: shift = ${recovered.bestShift}</p>
            <p>Correct: ${recovered.bestShift === ((caesarShift % 26 + 26) % 26) ? '✓' : '✗'}</p>
            <p>Chi-square score: ${recovered.bestScore}</p>
            <p>Decrypted: ${recovered.decrypted.slice(0, 100)}${recovered.decrypted.length > 100 ? '...' : ''}</p>
        `);

        const lengthResults = analyzeByLength(corpus, caesarShift);
        setOutput('length-analysis-output', lengthResults.map(r =>
            `<p>Length ${r.length}: recovered shift=${r.bestShift} ${r.recovered ? '✓' : '✗'} (score: ${r.score})</p>`
        ).join(''));

        const attackResults = compareAttacks(eccCiphertext, basePoint, publicKey);

        setOutput('brute-force-output', `
            <p>Private key found: k = ${attackResults.bruteForce.privateKey}</p>
            <p>Steps required: ${attackResults.bruteForce.stepsRequired}</p>
            <p>Time: ${attackResults.bruteForce.timeMs} ms</p>
            <p>Decrypted: ${attackResults.bruteForce.decrypted}</p>
        `);

        setOutput('bsgs-output', `
            <p>Private key found: k = ${attackResults.babyStepGiantStep.privateKey}</p>
            <p>Baby steps: ${attackResults.babyStepGiantStep.babySteps}</p>
            <p>Giant steps: ${attackResults.babyStepGiantStep.giantSteps}</p>
            <p>Total steps: ${attackResults.babyStepGiantStep.totalSteps}</p>
            <p>Time: ${attackResults.babyStepGiantStep.timeMs} ms</p>
        `);

        const eccCiphertextStr = eccCiphertext.map(p => `(${p.C1.x},${p.C1.y})`).join('');
        const stats = fullStatAnalysis(message, caesarEncrypted, eccCiphertextStr);

        setOutput('stats-output', `
            <div class="stat-block">
                <h3>Plaintext</h3>
                <p>Index of Coincidence: ${stats.plaintext.ic} (English ≈ 0.065)</p>
                <p>Shannon Entropy: ${stats.plaintext.entropy} bits</p>
            </div>
            <div class="stat-block">
                <h3>Caesar Ciphertext</h3>
                <p>Index of Coincidence: ${stats.caesar.ic}</p>
                <p>Shannon Entropy: ${stats.caesar.entropy} bits</p>
                <p><em>${stats.caesar.note}</em></p>
            </div>
            <div class="stat-block">
                <h3>ECC Ciphertext</h3>
                <p><em>${stats.ecc.note}</em></p>
            </div>
        `);

    } catch (err) {
        showError(`Error: ${err.message}`);
    }
});

document.getElementById('exhaustive-btn').addEventListener('click', () => {
    const ciphertext = document.getElementById('corpus-input').value ||
        caesarEncrypt(messageInput.value, parseInt(caesarShiftInput.value));
    const results = exhaustiveSearch(ciphertext);

    setOutput('exhaustive-output', results.map(r =>
        `<p>Shift ${r.shift}: ${r.decrypted.slice(0, 60)}${r.decrypted.length > 60 ? '...' : ''}</p>`
    ).join(''));
});

messageInput.value = DEFAULT_MESSAGE;
privateKeyInput.value = DEFAULT_PRIVATE_KEY;
rInput.value = DEFAULT_R;
caesarShiftInput.value = DEFAULT_CAESAR_SHIFT; 
