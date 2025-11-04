const ejs = require("ejs")
const http = require("http")
const fs = require("fs")
const path = require("path")
const JavaScriptObfuscator = require("javascript-obfuscator")
const { atob, btoa } = require("./src/atobbtoa.js")
const work = require("./data/work.json")
const engineerTools = require("./data/engineer_tools.json")
const aiTools = require("./data/ai_tools.json")
const resource = require("./data/resource.json")
const information = require("./data/information.json")
const tools = require("./data/tools.json")
const money = require("./data/money.json")
const game = require("./data/game.json")
const search = require("./data/search.json")
const download = require("./data/download.json")
const app = require("./data/app.json")

const clientScriptSource = fs.readFileSync(path.resolve(__dirname, "./src/client.js"), "utf-8")

const data = [
  ...work,
  ...information,
  ...search,
  ...download,
  ...engineerTools,
  ...aiTools,
  ...game,
  ...tools,
  ...resource,
  ...app,
  ...money,
]

const btoaData = data.map((category) => {
  category.links = category.links.map((item) => {
    item.link = btoa(encodeURI(item.link))
    return item
  })
  return category
})
// .sort((a, b) => {
//   return b.links.length - a.links.length
// })

const { minify } = require("terser")

const clientScript = `
(function() {
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


const setKey = (newKey) => {
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

setKey(CONFIG.DEFAULT_KEY)

  const atob = ${atob};
  ${clientScriptSource}
})();
`

const getHtml = async () => {
  const compressedScript = await minify(clientScript, {
    ecma: 2015, // 将 ECMAScript 版本设置为 ES5
    output: {
      ascii_only: false, // 不输出 ASCII 字符
      comments: false,
      beautify: false,
    },
    compress: {
      drop_console: true,
      ecma: 2015,
      // global_defs: {
      //   "@console.log": "noop",
      // },
      passes: 2,
      unsafe: true,
      unsafe_comps: true,
    },
    mangle: {
      properties: {
        regex: /^_/, // 以 "_" 开头的属性名不会被压缩
      },
      toplevel: true,
    },
  })

  const script = JavaScriptObfuscator.obfuscate(compressedScript.code, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 1,
    debugProtection: true,
    debugProtectionInterval: 4000,
    disableConsoleOutput: false, // TEMPORARY: Allow console for debugging
    identifierNamesGenerator: "hexadecimal",
    log: false,
    numbersToExpressions: true,
    renameGlobals: true,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 3,
    stringArray: true,
    stringArrayEncoding: ["rc4"],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 5,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 5,
    stringArrayWrappersType: "function",
    transformObjectKeys: true,
    unicodeEscapeSequence: false,
  })

  const template = fs.readFileSync("./src/template.ejs", "utf-8")
  const html = ejs.render(template, {
    data: btoaData,
    script,
  })

  // const server = http.createServer((req, res) => {
  //   res.writeHead(200, { "Content-Type": "text/html" });
  //   res.end(html);
  // });

  // server.listen(3000, () => {
  //   console.log("Server running on http://localhost:3000");
  // });
  fs.writeFileSync("index.html", html, "utf8")
}

getHtml()
