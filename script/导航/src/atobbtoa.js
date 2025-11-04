// FILE: ./helios-codec.js

/**
 * @fileoverview Helios Codec: A proprietary, key-based, and salted encoding scheme.
 * This module provides btoa and atob functions that are incompatible with standard Base64 decoders.
 * The encryption key is managed internally for API simplicity and security.
 * @author Helios
 */

// --- Configuration ---
// Centralized configuration for maintainability.
const CONFIG = {
  // The standard Base64 character set. This is our starting point.
  STANDARD_ALPHABET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split(''),
  // A secure, non-obvious default key. Users SHOULD override this.
  DEFAULT_KEY: 'd294a0d4-a7ef-4d6a-a71c-7f0471b05a76',
  // A unique separator to distinguish the nonce from the payload.
  SEPARATOR: '::HELIOS::',
};

// --- Module-Scoped State ---
// These variables are private to the module and managed via the exported functions.
let internalKey = '';
let cachedShuffledAlphabet = [];
let cachedReverseAlphabet = null;

/**
 * Generates a deterministically shuffled alphabet based on a secret key.
 * The same key will always produce the same shuffled alphabet.
 *
 * @private
 * @param {string} key - The secret key used to seed the shuffle algorithm.
 * @returns {string[]} A new array containing the shuffled Base64 characters.
 */
function generateShuffledAlphabet(key) {
  const alphabet = [...CONFIG.STANDARD_ALPHABET];
  let seed = 1;

  // Create a simple, deterministic seed from the key's character codes.
  for (let i = 0; i < key.length; i++) {
    seed = (seed * key.charCodeAt(i)) % 1999; // Use a prime number for better distribution
  }

  // Fisher-Yates shuffle algorithm, seeded by our key.
  for (let i = alphabet.length - 1; i > 0; i--) {
    // Generate a pseudo-random index based on the seed.
    seed = (seed * 16807) % 2147483647; // Park-Miller PRNG
    const j = seed % (i + 1);
    [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]]; // Swap elements
  }

  return alphabet;
}

/**
 * Sets the secret key for all subsequent encoding and decoding operations.
 * This function MUST be called at least once during application initialization
 * to set a custom key and prime the codec.
 *
 * @exports
 * @param {string} newKey - The new secret key. Must be a non-empty string.
 */
exports.setKey = (newKey) => {
  if (typeof newKey !== 'string' || newKey.length === 0) {
    throw new Error('HeliosCodec Error: Key must be a non-empty string.');
  }

  internalKey = newKey;
  cachedShuffledAlphabet = generateShuffledAlphabet(internalKey);

  // Pre-calculate the reverse map for fast decoding.
  cachedReverseAlphabet = new Map();
  cachedShuffledAlphabet.forEach((char, index) => {
    cachedReverseAlphabet.set(char, index);
  });
};

/**
 * Encodes a string using the proprietary HeliosCodec algorithm.
 * The output is not compatible with standard Base64 decoders.
 *
 * @exports
 * @param {string} str - The string to encode.
 * @returns {string|undefined} The encoded string, or undefined if input is invalid.
 */
exports.btoa = (str) => {
  if (str === null || typeof str === 'undefined') {
    return undefined;
  }
  
  // 1. Prepend the dynamic salt (nonce).
  const nonce = Date.now();
  const payload = `${nonce}${CONFIG.SEPARATOR}${str}`;

  // 2. Convert payload string to a stream of 8-bit binary representations.
  let binaryString = '';
  for (let i = 0; i < payload.length; i++) {
    binaryString += payload[i].charCodeAt(0).toString(2).padStart(8, '0');
  }

  // 3. Split the binary stream into 6-bit chunks.
  const chunks = binaryString.match(/.{1,6}/g) || [];

  // 4. Handle padding for the last chunk.
  if (chunks.length > 0) {
    chunks[chunks.length - 1] = chunks[chunks.length - 1].padEnd(6, '0');
  }

  // 5. Map each 6-bit chunk to a character from our SHUFFLED alphabet.
  return chunks
    .map(chunk => parseInt(chunk, 2))
    .map(decimalIndex => cachedShuffledAlphabet[decimalIndex])
    .join('');
};

/**
 * Decodes a string that was encoded with the HeliosCodec algorithm.
 *
 * @exports
 * @param {string} encodedStr - The string to decode.
 * @returns {string|undefined} The original decoded string, or undefined if input is invalid.
 */
exports.atob = (encodedStr) => {
  if (typeof encodedStr !== 'string' || encodedStr.length === 0) {
    return undefined;
  }

  // 1. Map each character back to its 6-bit index using the REVERSE shuffled map.
  const binaryString = encodedStr
    .split('')
    .map(char => {
      if (!cachedReverseAlphabet.has(char)) {
        throw new Error(`HeliosCodec Error: Invalid character "${char}" in encoded string.`);
      }
      return cachedReverseAlphabet.get(char).toString(2).padStart(6, '0');
    })
    .join('');

  // 2. Split the binary stream into 8-bit chunks.
  const chunks = binaryString.match(/.{1,8}/g) || [];
  
  // We might have extra padding bits at the end, so we only process full 8-bit chunks.
  const chars = [];
  for (const chunk of chunks) {
    if (chunk.length === 8) {
      chars.push(String.fromCharCode(parseInt(chunk, 2)));
    }
  }

  // 3. Join characters to get the full payload and remove padding null characters.
  const payload = chars.join('').replace(/\u0000/g, '');

  // 4. Extract the original string by splitting at the separator.
  const separatorIndex = payload.indexOf(CONFIG.SEPARATOR);
  if (separatorIndex === -1) {
    throw new Error('HeliosCodec Error: Separator not found in decoded payload. The key may be incorrect or the data corrupted.');
  }

  return payload.substring(separatorIndex + CONFIG.SEPARATOR.length);
};

// --- Initialization ---
// Immediately initialize the codec with the default key upon module load.
// This ensures the codec is always in a ready state.
exports.setKey(CONFIG.DEFAULT_KEY);