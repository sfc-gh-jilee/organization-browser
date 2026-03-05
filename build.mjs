import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CSS_FILES = [
  'tokens/stellar-tokens.css',
  'components/text/text.css',
  'components/button/button.css',
  'components/card/card.css',
  'components/layout/layout.css',
  'components/menu/menu.css',
  'components/tabs/tabs.css',
  'components/table/table.css',
  'components/textinput/textinput.css',
  'components/segmentedbutton/segmentedbutton.css',
  'components/splitbutton/splitbutton.css',
  'components/switch/switch.css',
  'components/globalnav/globalnav.css',
];

const JS_FILES = [
  'components/menu/menu.js',
  'components/tabs/tabs.js',
  'components/table/table.js',
  'components/textinput/textinput.js',
  'components/segmentedbutton/segmentedbutton.js',
  'components/splitbutton/splitbutton.js',
  'components/switch/switch.js',
  'components/globalnav/globalnav.js',
];

mkdirSync(join(__dirname, 'dist'), { recursive: true });

let css = `/* Stellar Design System — Combined Build\n * Generated: ${new Date().toISOString().split('T')[0]}\n * Components: ${CSS_FILES.length - 1} + tokens\n */\n\n`;
for (const file of CSS_FILES) {
  const content = readFileSync(join(__dirname, file), 'utf8');
  css += `/* === ${file} === */\n${content}\n\n`;
}
writeFileSync(join(__dirname, 'dist/stellar.css'), css);

let js = `/* Stellar Design System — Combined JS\n * Generated: ${new Date().toISOString().split('T')[0]}\n * Components: ${JS_FILES.length}\n */\n\n`;
for (const file of JS_FILES) {
  const content = readFileSync(join(__dirname, file), 'utf8');
  js += `/* === ${file} === */\n${content}\n\n`;
}
writeFileSync(join(__dirname, 'dist/stellar.js'), js);

console.log(`Built dist/stellar.css (${CSS_FILES.length} files)`);
console.log(`Built dist/stellar.js (${JS_FILES.length} files)`);
