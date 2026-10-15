import * as bip39 from 'https://cdn.jsdelivr.net/npm/@scure/bip39@1.5.0/+esm';
import {wordlist} from 'https://cdn.jsdelivr.net/npm/@scure/bip39@1.5.0/wordlists/english/+esm';
import {HDKey} from 'https://cdn.jsdelivr.net/npm/@scure/bip32@2.3.0/+esm';
import {keccak_256} from 'https://cdn.jsdelivr.net/npm/@noble/hashes@1.5.0/sha3/+esm';
import {secp256k1} from 'https://cdn.jsdelivr.net/npm/@noble/curves@1.6.0/secp256k1/+esm';

const ETH_DERIVATION_PATH = "m/44'/60'/0'/0/0";

export function generateMnemonic() {
    return bip39.generateMnemonic(wordlist, 128);
}

export function validateMnemonic(mnemonic) {
    return bip39.validateMnemonic(mnemonic, wordlist);
}

export async function mnemonicToSeed(mnemonic, passphrase = '') {
    return await bip39.mnemonicToSeed(mnemonic, passphrase);
}

export function derivePrivateKey(seed) {
    const hdKey = HDKey.fromMasterSeed(seed);
    const derived = hdKey.derive(ETH_DERIVATION_PATH);
    return derived.privateKey;
}

export function privateKeyToPublicKey(privateKey) {
    return secp256k1.getPublicKey(privateKey, false);
}

export function publicKeyToAddress(publicKey) {
    const pubKeyBytes = publicKey.slice(1);
    const hash = keccak_256(pubKeyBytes);
    const addressBytes = hash.slice(-20);
    return '0x' + bytesToHex(addressBytes);
}

export function toChecksumAddress(address) {
    const addr = address.toLowerCase().replace('0x', '');
    const hash = bytesToHex(keccak_256(new TextEncoder().encode(addr)));

    let checksummed = '0x';
    for (let i = 0; i < addr.length; i++) {
        if (parseInt(hash[i], 16) >= 8) {
            checksummed += addr[i].toUpperCase();
        } else {
            checksummed += addr[i];
        }
    }
    return checksummed;
}

export async function runPipeline(mnemonic, passphrase = '') {
    if (!validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic phrase');
    }

    const seed = await mnemonicToSeed(mnemonic, passphrase);
    const privateKey = derivePrivateKey(seed);
    const publicKey = privateKeyToPublicKey(privateKey);
    const address = publicKeyToAddress(publicKey);
    const checksummedAddress = toChecksumAddress(address);

    return {
        mnemonic,
        seed: bytesToHex(seed),
        privateKey: bytesToHex(privateKey),
        publicKey: bytesToHex(publicKey),
        address,
        checksummedAddress,
        derivationPath: ETH_DERIVATION_PATH
    };
}

export function bytesToHex(bytes) {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
