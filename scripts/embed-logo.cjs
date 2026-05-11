#!/usr/bin/env node
// AUTO-RUN before tsup — embeds the stackmint logo as a base64 constant.
// This ensures the logo is baked into dist/bin/stackmint.js and works
// correctly from npx, global installs, and local tsx runs alike.

'use strict';

const fs = require('fs');
const path = require('path');

const srcLogo = path.resolve(__dirname, '../public/bgremove/logo.png');
const outFile = path.resolve(__dirname, '../src/generated/logo-base64.ts');

if (!fs.existsSync(srcLogo)) {
  console.error(`✗ Logo not found at: ${srcLogo}`);
  process.exit(1);
}

const b64 = fs.readFileSync(srcLogo).toString('base64');
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(
  outFile,
  `// AUTO-GENERATED — do not edit manually. Run \`npm run build\` to refresh.\n// Source: public/bgremove/logo.png\nexport const STACKMINT_LOGO_BASE64 = '${b64}';\n`,
  'utf8'
);

console.log(`✓ Logo embedded as base64 constant → src/generated/logo-base64.ts`);
