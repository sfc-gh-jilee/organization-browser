#!/usr/bin/env node
/**
 * generate-index.mjs
 *
 * Reads icons.json and generates ICON-INDEX.md — a compact, greppable
 * reference of all available icons for AI agents to search.
 *
 * Usage:  node icons/generate-index.mjs
 * Run from the project root (prototypes/jilee/vanilla-stellar).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(__dirname, 'icons.json'), 'utf8'));

const icons = (data.icons || []).map(e => e.name);
const pictograms = (data.pictograms || []).map(e => e.name);
const illustrations = (data.illustrations || []).map(e => e.name);

function wrapNames(names, perLine = 8) {
  const lines = [];
  for (let i = 0; i < names.length; i += perLine) {
    lines.push(names.slice(i, i + perLine).join(', '));
  }
  return lines.join(',\n');
}

const md = `# Stellar Icon Index

${icons.length} icons | ${pictograms.length} pictograms | ${illustrations.length} illustrations
Source: ${data.meta.source}

Search this file by keyword to find the right icon name, then read the SVG file and inline it.

## Icons (16x16) — ./icons/svg/[Name].svg

For 20x20 medium size, use ./icons/svg/[Name]-medium.svg

${wrapNames(icons)}

## Pictograms (48x48) — ./icons/pictograms/[Name].svg

${wrapNames(pictograms)}

## Illustrations (142x126) — ./icons/illustrations/[Name].svg

${wrapNames(illustrations)}
`;

const outPath = join(__dirname, 'ICON-INDEX.md');
writeFileSync(outPath, md);
console.log(`Generated ${outPath}`);
console.log(`  ${icons.length} icons, ${pictograms.length} pictograms, ${illustrations.length} illustrations`);
