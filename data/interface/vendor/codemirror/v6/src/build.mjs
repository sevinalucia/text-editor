/*
 * CodeMirror 6 vendor bundle - BUILD SCRIPT
 * =========================================
 * One command rebuild:  npm ci  &&  node build.mjs
 *
 * Steps:
 *   1. Bundle src/entry.js with esbuild (IIFE, minified, target es2020).
 *      NOTE: no --global-name wrapper; entry.js assigns
 *      window.CodeMirror6 itself (an esbuild global-name wrapper would
 *      clobber it with undefined in browsers - var is a real global in
 *      classic scripts, unlike in Node's module wrapper).
 *   2. ASCII-normalize: replace every character >= U+0080 with its
 *      \uXXXX escape (legacy language packs contain raw Unicode regex
 *      literals that break under wrong-charset decoding). Semantics are
 *      byte-identical.
 *   3. Write ../codemirror.js and print its SHA-256.
 *      The printed hash must equal the value recorded in the README.
 */

import esbuild from "esbuild";
import fs from "fs";
import crypto from "crypto";

/* 1. bundle */
let bundled = await esbuild.build({
  "entryPoints": ["entry.js"],
  "bundle": true,
  "format": "iife",
  "minify": true,
  "target": ["es2020"],
  "write": false,
  "logLevel": "silent"
});
let source = bundled.outputFiles[0].text;

/* 2. ascii-normalize (semantically identical, encoding-proof) */
let output = "";
for (const ch of source) {
  const cp = ch.codePointAt(0);
  if (cp < 0x80) {
    output += ch;
  } else if (cp <= 0xffff) {
    output += "\\u" + cp.toString(16).padStart(4, "0");
  } else {
    const hi = Math.floor((cp - 0x10000) / 0x400) + 0xd800;
    const lo = ((cp - 0x10000) % 0x400) + 0xdc00;
    output += "\\u" + hi.toString(16).padStart(4, "0") + "\\u" + lo.toString(16).padStart(4, "0");
  }
}

/* 3. write + verify */
let target = new URL("../codemirror.js", import.meta.url);
fs.writeFileSync(target, output, "utf8");
/*  */
let bytes = fs.readFileSync(target);
let bad = 0;
for (const byte of bytes) if (byte >= 0x80) bad++;
let hash = crypto.createHash("sha256").update(bytes).digest("hex").toUpperCase();
/*  */
console.log("written   :", target.pathname.slice(1));
console.log("bytes     :", bytes.length);
console.log("non-ascii :", bad, bad === 0 ? "(OK)" : "(FAIL - build is not encoding-proof)");
console.log("sha256    :", hash);
if (bad !== 0) process.exit(1);
