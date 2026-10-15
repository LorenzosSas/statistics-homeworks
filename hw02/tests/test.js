import { 
    generateMnemonic, 
    validateMnemonic, 
    runPipeline, 
    toChecksumAddress,
    bytesToHex
} from '../pipeline.js';

function testsGenerateMnemonic() {
    console.log("Tests for generateMnemonic()");

    const mnemonic = generateMnemonic();
    const words = mnemonic.split(' ');

    console.assert(words.length === 12, `Error: expected 12 words, got ${words.length}`);
    console.assert(typeof mnemonic === 'string', "Error: mnemonic should be a string");
    console.assert(mnemonic.length > 0, "Error: mnemonic should not be empty");
    const mnemonic2 = generateMnemonic();
    console.assert(mnemonic !== mnemonic2, "Error: two generated mnemonics should differ");

    console.log("\ngenerateMnemonic() tests passed.\n");
}

function testsValidateMnemonic() {
    console.log("Tests for validateMnemonic()");

    const valid = generateMnemonic();
    console.assert(validateMnemonic(valid) === true, "Error: generated mnemonic should be valid");

    console.assert(validateMnemonic("invalid words here") === false, "Error: invalid mnemonic should return false");

    console.assert(validateMnemonic("") === false, "Error: empty string should return false");

    console.assert(validateMnemonic("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon") === false, "Error: wrong checksum should return false");

    console.log("\nvalidateMnemonic() tests passed.\n");
}

async function testsRunPipeline() {
    console.log("Tests for runPipeline()");

    const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

    const result1 = await runPipeline(mnemonic);
    const result2 = await runPipeline(mnemonic);

    console.assert(result1.seed === result2.seed, "Error: same mnemonic should produce same seed");
    console.assert(result1.privateKey === result2.privateKey, "Error: same mnemonic should produce same private key");
    console.assert(result1.address === result2.address, "Error: same mnemonic should produce same address");
    console.assert(result1.checksummedAddress === result2.checksummedAddress, "Error: same mnemonic should produce same checksummed address");

    console.assert(result1.seed.length === 128, `Error: seed should be 128 hex chars (512 bit), got ${result1.seed.length}`);
    console.assert(result1.privateKey.length === 64, `Error: private key should be 64 hex chars (256 bit), got ${result1.privateKey.length}`);
    console.assert(result1.address.startsWith('0x'), "Error: address should start with 0x");
    console.assert(result1.address.length === 42, `Error: address should be 42 chars, got ${result1.address.length}`);
    console.assert(result1.checksummedAddress.startsWith('0x'), "Error: checksummed address should start with 0x");
    console.assert(result1.derivationPath === "m/44'/60'/0'/0/0", "Error: wrong derivation path");

    const resultWithPass = await runPipeline(mnemonic, 'mypassphrase');
    console.assert(result1.seed !== resultWithPass.seed, "Error: different passphrase should produce different seed");
    console.assert(result1.address !== resultWithPass.address, "Error: different passphrase should produce different address");

    let threw = false;
    try {
        await runPipeline("invalid mnemonic phrase here");
    } catch (e) {
        threw = true;
    }
    console.assert(threw === true, "Error: invalid mnemonic should throw");

    console.log("\nrunPipeline() tests passed.\n");
}

function testsToChecksumAddress() {
    console.log("Tests for toChecksumAddress()");

    const known = [
        {input: '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359', expected: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359'},
        {input: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed', expected: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'},
    ];

    known.forEach(({ input, expected }) => {
        const result = toChecksumAddress(input);
        console.assert(result === expected, `Error: expected ${expected}, got ${result}`);
    });

    const addr = '0x1234567890123456789012345678901234567890';
    const checksummed = toChecksumAddress(addr);
    console.assert(checksummed.replace(/[A-F]/gi, '').toLowerCase() === addr.toLowerCase(),
        "Error: checksum should not change numeric characters");

    console.log("\ntoChecksumAddress() tests passed.\n");
}

function testsBytesToHex() {
    console.log("Tests for bytesToHex()");

    console.assert(bytesToHex(new Uint8Array([0])) === '00', "Error: 0 should be '00'");
    console.assert(bytesToHex(new Uint8Array([255])) === 'ff', "Error: 255 should be 'ff'");
    console.assert(bytesToHex(new Uint8Array([0, 255])) === '00ff', "Error: [0, 255] should be '00ff'");
    console.assert(bytesToHex(new Uint8Array([])) === '', "Error: empty array should be ''");

    console.log("\nbytesToHex() tests passed.\n");
}

async function runTests() {
    testsGenerateMnemonic();
    testsValidateMnemonic();
    await testsRunPipeline();
    testsToChecksumAddress();
    testsBytesToHex();
    console.log("All tests passed.");
}

runTests(); 
