import { generateMnemonic, validateMnemonic, runPipeline, bytesToHex } from './pipeline.js';
import { avalancheKeccak, addressByteDistribution, bitDistributionKeccak, eip55UppercaseDistribution } from './stats.js';

const mnemonicInput = document.getElementById('mnemonic-input');
const passphraseInput = document.getElementById('passphrase-input');
const generateBtn = document.getElementById('generate-btn');
const deriveBtn = document.getElementById('derive-btn');
const errorOutput = document.getElementById('error-output');
const seedOutput = document.getElementById('seed-output');
const privateKeyOutput = document.getElementById('private-key-output');
const publicKeyOutput = document.getElementById('public-key-output');
const addressOutput = document.getElementById('address-output');
const checksumOutput = document.getElementById('checksum-output');
const pathOutput = document.getElementById('path-output');

function clearOutputs() {
    [seedOutput, privateKeyOutput, publicKeyOutput,
     addressOutput, checksumOutput, pathOutput]
        .forEach(el => el.textContent = '');
    errorOutput.textContent = '';
}

function showError(msg) {
    errorOutput.textContent = msg;
}

generateBtn.addEventListener('click', () => {
    mnemonicInput.value = generateMnemonic();
    clearOutputs();
});

deriveBtn.addEventListener('click', async () => {
    clearOutputs();

    const mnemonic = mnemonicInput.value.trim().toLowerCase();
    const passphrase = passphraseInput.value;

    if (!mnemonic) {
        showError('Please enter or generate a mnemonic phrase.');
        return;
    }

    if (!validateMnemonic(mnemonic)) {
        showError('Invalid mnemonic phrase. Please check the words and try again.');
        return;
    }

    try {
        const result = await runPipeline(mnemonic, passphrase);

        pathOutput.textContent = result.derivationPath;
        seedOutput.textContent = result.seed;
        privateKeyOutput.textContent = result.privateKey;
        publicKeyOutput.textContent = result.publicKey;
        addressOutput.textContent = result.address;
        checksumOutput.textContent = result.checksummedAddress;

    } catch (err) {
        showError(`Error: ${err.message}`);
    }
});

document.getElementById('stats-btn').addEventListener('click', async () => {
    const sampleSize = parseInt(document.getElementById('sample-size').value);
    const statsOutput = document.getElementById('stats-output');
    statsOutput.innerHTML = '<p>Running analysis...</p>';

    try {
        const mnemonics = Array.from({length: sampleSize}, () => generateMnemonic());
        const addresses = [];

        for (const mnemonic of mnemonics) {
            const result = await runPipeline(mnemonic);
            addresses.push(result.checksummedAddress);
        }

        const avalanche = avalancheKeccak(mnemonics[0]);

        const bits = bitDistributionKeccak(mnemonics);

        const byteStats = await addressByteDistribution(addresses);

        const eip55 = eip55UppercaseDistribution(addresses);

        const avalancheRows = avalanche.results.map(r => 
            `<p>Bit ${r.bit} flipped: ${r.bitsChanged} bits changed (${r.percentage}%)</p>`
        ).join('');

        statsOutput.innerHTML = `
            <div class="stat-block">
                <h3>Avalanche Effect (Keccak-256)</h3>
                <p>Flipping 1 bit of the input changes on average 
                    <strong>${avalanche.avgBitsChanged}</strong> bits out of 256 
                    (${avalanche.avgPercentage}%).</p>
                <p>Ideal: ~50% (128 bits). The closer to 50%, the stronger the avalanche.</p>
                ${avalancheRows}
            </div>

            <div class="stat-block">
                <h3>Bit Distribution (Keccak-256 over ${sampleSize} inputs)</h3>
                <p>Zeros: ${bits.zeros}</p>
                <p>Ones: ${bits.ones}</p>
                <p>Ones ratio: ${bits.ratio}% (ideal: 50%)</p>
            </div>

            <div class="stat-block">
                <h3>Byte Distribution in Ethereum Addresses</h3>
                <p>Total bytes analyzed: ${byteStats.totalBytes}</p>
                <p>Min frequency: ${byteStats.min}</p>
                <p>Max frequency: ${byteStats.max}</p>
                <p>Average frequency per byte value: ${byteStats.avg}</p>
                <p>Chi-square statistic: ${byteStats.chiSquare} (lower = more uniform)</p>
            </div>

            <div class="stat-block">
                <h3>EIP-55 Uppercase Distribution</h3>
                <p>Average uppercase letters per address: ${eip55.avgUppercase}%</p>
                <p>Note: EIP-55 uses Keccak-256 of the address to determine case,
                    so ~50% of letters should be uppercase on average.</p>
            </div>
        `;
    } catch (err) {
        statsOutput.innerHTML = `<p class="error">Error: ${err.message}</p>`;
    }
});
