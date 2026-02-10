import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const appModules = [
  'source/js/_app/utils.js',
  'source/js/_app/dom.js',
  'source/js/_app/player.js',
  'source/js/_app/global.js',
  'source/js/_app/sidebar.js',
  'source/js/_app/page.js',
  'source/js/_app/pjax.js'
];

const appOutput = 'static/js/app.js';
const fireworksInput = 'source/js/_app/fireworks.js';
const fireworksOutput = 'static/js/fireworks.js';

const normalize = (text) => text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const readUtf8 = (relPath) => readFileSync(resolve(root, relPath), 'utf8');

const mergedApp = appModules.map((file) => normalize(readUtf8(file))).join('\n');
const fireworks = normalize(readUtf8(fireworksInput));

if (process.argv.includes('--check')) {
  const currentApp = normalize(readUtf8(appOutput));
  const currentFireworks = normalize(readUtf8(fireworksOutput));
  let ok = true;

  if (currentApp !== mergedApp) {
    console.error('Drift detected: static/js/app.js is out of sync with source/js/_app/*');
    ok = false;
  }
  if (currentFireworks !== fireworks) {
    console.error('Drift detected: static/js/fireworks.js is out of sync with source/js/_app/fireworks.js');
    ok = false;
  }

  process.exit(ok ? 0 : 1);
}

writeFileSync(resolve(root, appOutput), mergedApp, 'utf8');
writeFileSync(resolve(root, fireworksOutput), fireworks, 'utf8');

console.log('Synced static/js/app.js and static/js/fireworks.js from source/js/_app/');
