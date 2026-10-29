import { buildEmbeddingTable, eccEncrypt, eccDecrypt, generatePublicKey, negatePoint } from '../ecc.js';
import { caesarEncrypt, caesarDecrypt, letterFrequency, recoverKey, exhaustiveSearch } from '../caesar.js';
import { bruteForceAttack, babyStepGiantStep, compareAttacks } from '../attack.js';
import { indexOfCoincidence, shannonEntropy, analyzeByLength } from '../stats.js';

const BASE_POINT = { x: 1, y: 5 };
const PRIVATE_KEY = 6;
function testsNegatePoint() {
    console.log("Tests for negatePoint()");

    const p = { x: 1, y: 5 };
    const neg = negatePoint(p);
    console.assert(neg.x === 1, "Error: negated point should have same x");
    console.assert(neg.y === 12, "Error: negated point of (1,5) should have y=12 (17-5)");

    console.assert(negatePoint(null) === null, "Error: negatePoint(null) should return null");

    console.log("\nnegatePoint() tests passed.\n");
}

function testsBuildEmbeddingTable() {
    console.log("Tests for buildEmbeddingTable()");

    const { pointToChar, charToPoint, points } = buildEmbeddingTable();

    console.assert(points.length > 0, "Error: should have at least one valid point");
    console.assert(pointToChar.size > 0, "Error: pointToChar should not be empty");
    console.assert(charToPoint.size > 0, "Error: charToPoint should not be empty");

    console.assert(pointToChar.size === charToPoint.size, 
        "Error: pointToChar and charToPoint should have same size");

    console.log("\nbuildEmbeddingTable() tests passed.\n");
}

function testsEccEncryptDecrypt() {
    console.log("Tests for eccEncrypt() and eccDecrypt()");

    const publicKey = generatePublicKey(PRIVATE_KEY, BASE_POINT);
    const message = "AB";
    const r = 2;

    const ciphertext = eccEncrypt(message, publicKey, BASE_POINT, r);

    console.assert(ciphertext.length === message.length, 
        `Error: ciphertext should have ${message.length} pairs`);
    ciphertext.forEach(({ C1, C2 }) => {
        console.assert(C1 !== null, "Error: C1 should not be null");
        console.assert(C2 !== null, "Error: C2 should not be null");
    });

    const decrypted = eccDecrypt(ciphertext, PRIVATE_KEY);
    console.assert(decrypted === message, 
        `Error: decrypted should be '${message}', got '${decrypted}'`);

    const ciphertext2 = eccEncrypt(message, publicKey, BASE_POINT, r);
    console.assert(
        JSON.stringify(ciphertext) === JSON.stringify(ciphertext2),
        "Error: same inputs should produce same ciphertext"
    );

    const ciphertext3 = eccEncrypt(message, publicKey, BASE_POINT, r + 1);
    console.assert(
        JSON.stringify(ciphertext) !== JSON.stringify(ciphertext3),
        "Error: different r should produce different ciphertext"
    );

    let threw = false;
    try {
        eccEncrypt("€", publicKey, BASE_POINT, r);
    } catch (e) {
        threw = true;
    }
    console.assert(threw, "Error: unmappable character should throw");

    console.log("\neccEncrypt() and eccDecrypt() tests passed.\n");
}

function testsGeneratePublicKey() {
    console.log("Tests for generatePublicKey()");

    const publicKey = generatePublicKey(PRIVATE_KEY, BASE_POINT);
    console.assert(publicKey !== null, "Error: public key should not be null");
    console.assert(publicKey.x === 5 && publicKey.y === 8, 
        `Error: 6G should be (5, 8), got (${publicKey.x}, ${publicKey.y})`);

    const k1 = generatePublicKey(1, BASE_POINT);
    console.assert(k1.x === BASE_POINT.x && k1.y === BASE_POINT.y,
        "Error: 1*G should be G itself");

    console.log("\ngeneratePublicKey() tests passed.\n");
}


function testsCaesarEncryptDecrypt() {
    console.log("Tests for caesarEncrypt() and caesarDecrypt()");

    console.assert(caesarEncrypt("ABC", 3) === "DEF", "Error: ABC shifted by 3 should be DEF");
    console.assert(caesarEncrypt("XYZ", 3) === "ABC", "Error: XYZ shifted by 3 should wrap to ABC");

    console.assert(caesarEncrypt("abc", 3) === "def", "Error: lowercase should work");
    console.assert(caesarEncrypt("Hello World!", 3) === "Khoor Zruog!", 
        "Error: spaces and punctuation should be unchanged");

    console.assert(caesarDecrypt("DEF", 3) === "ABC", "Error: decryption should reverse encryption");
    console.assert(caesarDecrypt(caesarEncrypt("Hello World!", 13), 13) === "Hello World!",
        "Error: encrypt then decrypt should return original");

    console.assert(caesarEncrypt("ABC", 0) === "ABC", "Error: shift 0 should not change message");

    console.assert(caesarEncrypt("DEF", -3) === "ABC", "Error: negative shift should work");

    console.assert(caesarEncrypt("ABC", 29) === caesarEncrypt("ABC", 3),
        "Error: shift 29 should be same as shift 3");

    console.log("\ncaesarEncrypt() and caesarDecrypt() tests passed.\n");
}

function testsLetterFrequency() {
    console.log("Tests for letterFrequency()");

    const { freq, total } = letterFrequency("aab");
    console.assert(total === 3, `Error: total should be 3, got ${total}`);
    console.assert(Math.abs(freq['a'] - 66.7) < 0.1, "Error: 'a' frequency should be ~66.7%");
    console.assert(Math.abs(freq['b'] - 33.3) < 0.1, "Error: 'b' frequency should be ~33.3%");

    const empty = letterFrequency("");
    console.assert(empty.total === 0, "Error: empty text should have total 0");

    const { total: t } = letterFrequency("123 !?");
    console.assert(t === 0, "Error: non-letters should not be counted");

    console.log("\nletterFrequency() tests passed.\n");
}

function testsRecoverKey() {
    console.log("Tests for recoverKey()");

    const longText = "The quick brown fox jumps over the lazy dog. ".repeat(10);

    for (const shift of [3, 7, 13, 25]) {
        const encrypted = caesarEncrypt(longText, shift);
        const { bestShift } = recoverKey(encrypted);
        console.assert(bestShift === shift, 
            `Error: should recover shift ${shift}, got ${bestShift}`);
    }

    console.log("\nrecoverKey() tests passed.\n");
}

function testsExhaustiveSearch() {
    console.log("Tests for exhaustiveSearch()");

    const results = exhaustiveSearch("DEF");
    console.assert(results.length === 26, `Error: should have 26 results, got ${results.length}`);
    console.assert(results[3].decrypted === "ABC", "Error: shift 3 should decrypt DEF to ABC");
    console.assert(results[0].decrypted === "DEF", "Error: shift 0 should not change DEF");

    console.log("\nexhaustiveSearch() tests passed.\n");
}


function testsBruteForceAttack() {
    console.log("Tests for bruteForceAttack()");

    const publicKey = generatePublicKey(PRIVATE_KEY, BASE_POINT);
    const message = "AB";
    const ciphertext = eccEncrypt(message, publicKey, BASE_POINT, 2);

    const result = bruteForceAttack(ciphertext, BASE_POINT, publicKey);

    console.assert(result !== null, "Error: brute force should find the key");
    console.assert(result.privateKey === PRIVATE_KEY, 
        `Error: should find k=${PRIVATE_KEY}, got k=${result.privateKey}`);
    console.assert(result.decrypted === message,
        `Error: decrypted should be '${message}', got '${result.decrypted}'`);
    console.assert(result.stepsRequired === PRIVATE_KEY,
        `Error: steps required should be ${PRIVATE_KEY}`);

    console.log("\nbruteForceAttack() tests passed.\n");
}

function testsBabyStepGiantStep() {
    console.log("Tests for babyStepGiantStep()");

    const publicKey = generatePublicKey(PRIVATE_KEY, BASE_POINT);
    const groupOrder = 9;

    const result = babyStepGiantStep(BASE_POINT, publicKey, groupOrder);

    console.assert(result !== null, "Error: BSGS should find the key");
    console.assert(result.privateKey === PRIVATE_KEY,
        `Error: should find k=${PRIVATE_KEY}, got k=${result.privateKey}`);
    console.assert(result.totalSteps < groupOrder,
        `Error: BSGS should use fewer steps than brute force`);

    console.log("\nbabyStepGiantStep() tests passed.\n");
}

function testsIndexOfCoincidence() {
    console.log("Tests for indexOfCoincidence()");

    const english = "o be or not to be that is the question whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune or to take arms against a sea of troubles".repeat(3);
    const ic = parseFloat(indexOfCoincidence(english));
    console.assert(ic > 0.05 && ic < 0.08, 
        `Error: English IC should be ~0.065, got ${ic}`);

    console.assert(indexOfCoincidence("") === 0, "Error: empty text IC should be 0");

    console.log("\nindexOfCoincidence() tests passed.\n");
}

function testsShannonEntropy() {
    console.log("Tests for shannonEntropy()");

    console.assert(parseFloat(shannonEntropy("aaaa")) === 0,
        "Error: single letter text should have entropy 0");

    console.assert(parseFloat(shannonEntropy("abcd")) > 0,
        "Error: varied text should have entropy > 0");

    console.log("\nshannonEntropy() tests passed.\n");
}

function runTests() {
    testsNegatePoint();
    testsBuildEmbeddingTable();
    testsGeneratePublicKey();
    testsEccEncryptDecrypt();
    testsCaesarEncryptDecrypt();
    testsLetterFrequency();
    testsRecoverKey();
    testsExhaustiveSearch();
    testsBruteForceAttack();
    testsBabyStepGiantStep();
    testsIndexOfCoincidence();
    testsShannonEntropy();
    console.log("All tests passed.");
}

runTests(); 