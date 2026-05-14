const { execSync, spawnSync } = require('child_process');
const { mkdtempSync } = require('fs');
const { join } = require('path');
const os = require('os');

const tmpDir = mkdtempSync(join(os.tmpdir(), 'hono-test-'));
const projectPath = join(tmpDir, `test-api-hono`);
console.log('Scaffolding into', projectPath);
execSync(`node ./dist/bin/stackmint.js --preset api-hono "${projectPath}" --no-install`, { stdio: 'inherit' });
console.log('Installing dependencies...');
execSync('npm install --legacy-peer-deps', { cwd: projectPath, stdio: 'inherit' });
console.log('Running dev server...');
const child = spawnSync('npm', ['run', 'dev'], { cwd: projectPath, encoding: 'utf-8', timeout: 5000 });
console.log('STDOUT:', child.stdout);
console.log('STDERR:', child.stderr);
