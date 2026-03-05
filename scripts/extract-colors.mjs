#!/usr/bin/env node
/**
 * extract-colors.mjs
 *
 * Analyzes a screenshot image to detect page regions (sidebar, header, body, footer)
 * and extract their background colors, then maps each color to the nearest Stellar
 * design token.
 *
 * Usage:
 *   node scripts/extract-colors.mjs <screenshot.png> [--output color-map.json]
 *
 * Output: JSON with detected regions, sampled colors, and matched tokens.
 *
 * Dependencies: pngjs (for reading PNG files)
 * Install:      cd scripts && npm install
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, resolve, extname } from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const TOKENS_FILE = join(PROJECT_ROOT, 'tokens', 'stellar-tokens.css');

// ---------------------------------------------------------------------------
// 1. Token Parsing
// ---------------------------------------------------------------------------

function parseTokens(cssPath, excludeSelectors = ['.darkMode']) {
  const css = readFileSync(cssPath, 'utf-8');

  // Remove excluded selector blocks (e.g. dark mode) to avoid duplicate tokens.
  // Must find the selector as an actual CSS rule (not inside a comment).
  let filtered = css;
  for (const sel of excludeSelectors) {
    // Match selector followed by optional whitespace then '{', outside comments
    const selectorRe = new RegExp(
      sel.replace('.', '\\.') + '\\s*\\{',
      'g'
    );
    // First strip block comments to avoid false matches
    const noComments = filtered.replace(/\/\*[\s\S]*?\*\//g, '');
    const selectorMatch = selectorRe.exec(noComments);
    if (!selectorMatch) continue;

    // Find the same position in the original (comment-included) string
    // by searching for the selector+brace pattern after each comment
    const patternStr = sel + ' {'; // relaxed find in original
    let searchFrom = 0;
    let realIdx = -1;
    while (true) {
      // Find next occurrence of the selector that starts a CSS rule
      const candidateRe = new RegExp(sel.replace('.', '\\.') + '\\s*\\{', 'g');
      candidateRe.lastIndex = searchFrom;
      const m = candidateRe.exec(filtered);
      if (!m) break;
      // Check we're not inside a block comment
      const before = filtered.slice(0, m.index);
      const openComments = (before.match(/\/\*/g) || []).length;
      const closeComments = (before.match(/\*\//g) || []).length;
      if (openComments <= closeComments) {
        realIdx = m.index;
        break;
      }
      searchFrom = m.index + m[0].length;
    }

    if (realIdx === -1) continue;

    const open = filtered.indexOf('{', realIdx);
    if (open === -1) continue;
    let depth = 1;
    let close = open + 1;
    while (close < filtered.length && depth > 0) {
      if (filtered[close] === '{') depth++;
      if (filtered[close] === '}') depth--;
      close++;
    }
    filtered = filtered.slice(0, realIdx) + filtered.slice(close);
  }

  const tokens = [];
  const seen = new Set();
  const re = /--([a-zA-Z0-9_-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g;
  let m;
  while ((m = re.exec(filtered)) !== null) {
    const name = `--${m[1]}`;
    const hex = m[2];
    if (seen.has(name)) continue; // keep first occurrence (light mode)
    seen.add(name);
    const rgb = hexToRgb(hex);
    if (rgb) {
      tokens.push({ name, hex, rgb });
    }
  }
  return tokens;
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  }
  if (hex.length === 8) hex = hex.slice(0, 6); // strip alpha
  if (hex.length !== 6) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

// ---------------------------------------------------------------------------
// 2. Color Distance (weighted Euclidean — gives better perceptual results
//    than raw Euclidean by weighting green channel higher)
// ---------------------------------------------------------------------------

function colorDistance(c1, c2) {
  const rMean = (c1.r + c2.r) / 2;
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  // Weighted Euclidean (redmean approximation of perceptual distance)
  return Math.sqrt(
    (2 + rMean / 256) * dr * dr +
    4 * dg * dg +
    (2 + (255 - rMean) / 256) * db * db
  );
}

// ---------------------------------------------------------------------------
// 3. Token Matching
// ---------------------------------------------------------------------------

// Token preference tiers by usage context.
// Earlier entries in a tier are preferred when distances are close.
const TOKEN_TIERS = {
  background: [
    'themed-surface-',
    'themed-reusable-background-',
    'base-color-gray-',
    'base-color-white',
    'base-color-black',
  ],
  text: [
    'themed-reusable-text-',
    'themed-reusable-link-',
    'base-color-gray-',
    'base-color-white',
    'base-color-black',
  ],
  border: [
    'themed-reusable-border-',
    'base-color-gray-',
  ],
  any: [
    'themed-surface-',
    'themed-reusable-background-',
    'themed-reusable-text-',
    'themed-reusable-border-',
    'themed-interaction-',
    'themed-status-',
    'base-color-',
  ],
};

function tokenTierRank(name, usage) {
  const prefixes = TOKEN_TIERS[usage] || TOKEN_TIERS.any;
  for (let i = 0; i < prefixes.length; i++) {
    if (name.includes(prefixes[i])) return i;
  }
  return prefixes.length; // unranked
}

/**
 * Find the closest design token for a given RGB color.
 * @param {object} rgb          - { r, g, b }
 * @param {Array}  tokens       - parsed tokens from CSS
 * @param {'background'|'text'|'border'|'any'} usage - what the color is for
 */
function findClosestToken(rgb, tokens, usage = 'any') {
  let bestToken = null;
  let bestDist = Infinity;
  let bestRank = Infinity;

  for (const token of tokens) {
    const dist = colorDistance(rgb, token.rgb);
    const rank = tokenTierRank(token.name, usage);

    // Prefer a higher-ranked (lower number) token if within 10% distance
    const dominated = bestToken &&
      dist >= bestDist &&
      !(dist <= bestDist * 1.10 && rank < bestRank);

    if (!dominated || dist < bestDist) {
      if (dist < bestDist || (dist <= bestDist * 1.10 && rank < bestRank)) {
        bestDist = dist;
        bestToken = token;
        bestRank = rank;
      }
    }
  }

  const type = bestToken && bestToken.name.startsWith('--themed-') ? 'semantic' : 'base';
  return { token: bestToken, distance: bestDist, type };
}

// ---------------------------------------------------------------------------
// 4. Image Loading & Pixel Sampling
// ---------------------------------------------------------------------------

function loadPng(filePath) {
  const buffer = readFileSync(filePath);
  const png = PNG.sync.read(buffer);
  return png;
}

function getPixel(png, x, y) {
  x = Math.max(0, Math.min(x, png.width - 1));
  y = Math.max(0, Math.min(y, png.height - 1));
  const idx = (png.width * y + x) * 4;
  return {
    r: png.data[idx],
    g: png.data[idx + 1],
    b: png.data[idx + 2],
    a: png.data[idx + 3],
  };
}

/** Sample a grid of pixels in a rectangular region, return the median color. */
function sampleRegion(png, x, y, w, h, gridSize = 7) {
  const rs = [], gs = [], bs = [];
  const stepX = Math.max(1, Math.floor(w / gridSize));
  const stepY = Math.max(1, Math.floor(h / gridSize));

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const px = x + Math.floor(stepX * (gx + 0.5));
      const py = y + Math.floor(stepY * (gy + 0.5));
      const p = getPixel(png, px, py);
      rs.push(p.r);
      gs.push(p.g);
      bs.push(p.b);
    }
  }

  rs.sort((a, b) => a - b);
  gs.sort((a, b) => a - b);
  bs.sort((a, b) => a - b);

  const mid = Math.floor(rs.length / 2);
  return { r: rs[mid], g: gs[mid], b: bs[mid] };
}

function rgbToHex(rgb) {
  return '#' + [rgb.r, rgb.g, rgb.b].map(c => c.toString(16).padStart(2, '0')).join('');
}

function rgbToString(rgb) {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

// ---------------------------------------------------------------------------
// 5. Region Detection
// ---------------------------------------------------------------------------

/**
 * Detect whether a left sidebar exists by comparing the left strip vs. the center.
 * Returns { hasSidebar, sidebarWidth } or { hasSidebar: false }.
 */
function detectSidebar(png) {
  const h = png.height;
  const w = png.width;

  // Sample a narrow strip at x=20 (inside potential sidebar)
  const leftColor = sampleRegion(png, 5, Math.floor(h * 0.2), 30, Math.floor(h * 0.6), 5);
  // Sample the center area
  const centerColor = sampleRegion(png, Math.floor(w * 0.5), Math.floor(h * 0.3), Math.floor(w * 0.3), Math.floor(h * 0.4), 5);

  const dist = colorDistance(leftColor, centerColor);

  // If left strip has a distinctly different color from center (dist > 40), it's a sidebar
  if (dist < 40) {
    return { hasSidebar: false, sidebarWidth: 0, sidebarColor: null };
  }

  // Find the sidebar edge: scan horizontally at multiple y positions
  let edgeXSum = 0;
  let edgeCount = 0;
  const scanYs = [0.25, 0.4, 0.5, 0.6, 0.75].map(f => Math.floor(h * f));

  for (const scanY of scanYs) {
    let prevColor = getPixel(png, 0, scanY);
    for (let x = 10; x < Math.min(w * 0.4, 400); x += 2) {
      const px = getPixel(png, x, scanY);
      const d = colorDistance(prevColor, px);
      if (d > 30) {
        edgeXSum += x;
        edgeCount++;
        break;
      }
    }
  }

  if (edgeCount === 0) {
    return { hasSidebar: false, sidebarWidth: 0, sidebarColor: null };
  }

  const sidebarWidth = Math.round(edgeXSum / edgeCount);
  const sidebarColor = sampleRegion(png, 5, Math.floor(h * 0.2), sidebarWidth - 10, Math.floor(h * 0.6), 7);

  return { hasSidebar: true, sidebarWidth, sidebarColor };
}

/**
 * Detect whether a top header bar exists in the content area.
 * Scans downward looking for a horizontal color change (border).
 */
function detectHeader(png, contentStartX) {
  const h = png.height;
  const w = png.width;
  const contentW = w - contentStartX;
  const sampleX = contentStartX + Math.floor(contentW * 0.3);

  // Scan down from top looking for a color transition (header → body boundary)
  let prevColor = getPixel(png, sampleX, 5);
  for (let y = 10; y < Math.min(h * 0.3, 200); y += 2) {
    const px = getPixel(png, sampleX, y);
    const d = colorDistance(prevColor, px);
    // A border line or color change indicates header boundary
    if (d > 25) {
      // Verify it's a horizontal transition (check another x position)
      const sampleX2 = contentStartX + Math.floor(contentW * 0.6);
      const px2 = getPixel(png, sampleX2, y);
      const prevColor2 = getPixel(png, sampleX2, y - 5);
      const d2 = colorDistance(prevColor2, px2);
      if (d2 > 20) {
        const headerColor = sampleRegion(png, contentStartX + 10, 5, contentW - 20, y - 5, 5);
        return { hasHeader: true, headerHeight: y, headerColor };
      }
    }
    prevColor = px;
  }

  return { hasHeader: false, headerHeight: 0, headerColor: null };
}

/**
 * Detect whether a bottom footer exists.
 * Compares the bottom strip color against the mid-body color,
 * then scans upward to find the exact boundary.
 */
function detectFooter(png, contentStartX) {
  const h = png.height;
  const w = png.width;
  const contentW = w - contentStartX;

  // Quick check: is the bottom strip different from the middle body area?
  const bottomColor = sampleRegion(png, contentStartX + 20, h - 40, contentW - 40, 30, 5);
  const midColor = sampleRegion(png, contentStartX + 20, Math.floor(h * 0.4), contentW - 40, Math.floor(h * 0.2), 5);
  const stripDist = colorDistance(bottomColor, midColor);

  if (stripDist < 15) {
    return { hasFooter: false, footerY: h, footerColor: null };
  }

  // Scan upward from near-bottom to find the transition point
  const sampleX = contentStartX + Math.floor(contentW * 0.3);
  let prevColor = getPixel(png, sampleX, h - 5);
  for (let y = h - 8; y > h * 0.6; y--) {
    const px = getPixel(png, sampleX, y);
    const d = colorDistance(prevColor, px);
    if (d > 18) {
      // Verify with a second x position
      const sampleX2 = contentStartX + Math.floor(contentW * 0.6);
      const px2 = getPixel(png, sampleX2, y);
      const prevColor2 = getPixel(png, sampleX2, y + 3);
      const d2 = colorDistance(prevColor2, px2);
      if (d2 > 15) {
        const footerColor = sampleRegion(png, contentStartX + 10, y + 3, contentW - 20, h - y - 8, 5);
        return { hasFooter: true, footerY: y, footerColor };
      }
    }
    prevColor = px;
  }

  return { hasFooter: false, footerY: h, footerColor: null };
}

// ---------------------------------------------------------------------------
// 6. Main Extraction Pipeline
// ---------------------------------------------------------------------------

function extractColors(imagePath, tokens) {
  const png = loadPng(imagePath);
  const { width, height } = png;
  console.log(`Image: ${width}×${height}`);

  const regions = [];

  // Detect sidebar
  const sidebar = detectSidebar(png);
  const contentStartX = sidebar.hasSidebar ? sidebar.sidebarWidth : 0;

  if (sidebar.hasSidebar) {
    const match = findClosestToken(sidebar.sidebarColor, tokens, 'background');
    regions.push({
      name: 'sidebar',
      bounds: { x: 0, y: 0, w: sidebar.sidebarWidth, h: height },
      color: rgbToString(sidebar.sidebarColor),
      hex: rgbToHex(sidebar.sidebarColor),
      token: `var(${match.token.name})`,
      tokenName: match.token.name,
      tokenValue: match.token.hex,
      tokenDistance: Math.round(match.distance * 10) / 10,
      tokenType: match.type,
    });
    console.log(`  Sidebar: ${sidebar.sidebarWidth}px wide, ${rgbToHex(sidebar.sidebarColor)} → ${match.token.name} (Δ${Math.round(match.distance)})`);
  }

  // Detect header
  const header = detectHeader(png, contentStartX);
  if (header.hasHeader) {
    const match = findClosestToken(header.headerColor, tokens, 'background');
    regions.push({
      name: 'header',
      bounds: { x: contentStartX, y: 0, w: width - contentStartX, h: header.headerHeight },
      color: rgbToString(header.headerColor),
      hex: rgbToHex(header.headerColor),
      token: `var(${match.token.name})`,
      tokenName: match.token.name,
      tokenValue: match.token.hex,
      tokenDistance: Math.round(match.distance * 10) / 10,
      tokenType: match.type,
    });
    console.log(`  Header: ${header.headerHeight}px tall, ${rgbToHex(header.headerColor)} → ${match.token.name} (Δ${Math.round(match.distance)})`);
  }

  // Detect footer
  const footer = detectFooter(png, contentStartX);
  if (footer.hasFooter) {
    const match = findClosestToken(footer.footerColor, tokens, 'background');
    regions.push({
      name: 'footer',
      bounds: { x: contentStartX, y: footer.footerY, w: width - contentStartX, h: height - footer.footerY },
      color: rgbToString(footer.footerColor),
      hex: rgbToHex(footer.footerColor),
      token: `var(${match.token.name})`,
      tokenName: match.token.name,
      tokenValue: match.token.hex,
      tokenDistance: Math.round(match.distance * 10) / 10,
      tokenType: match.type,
    });
    console.log(`  Footer: starts at y=${footer.footerY}, ${rgbToHex(footer.footerColor)} → ${match.token.name} (Δ${Math.round(match.distance)})`);
  }

  // Body (everything else)
  const bodyTop = header.hasHeader ? header.headerHeight + 2 : 0;
  const bodyBottom = footer.hasFooter ? footer.footerY - 2 : height;
  const bodyColor = sampleRegion(
    png,
    contentStartX + 20,
    bodyTop + 20,
    width - contentStartX - 40,
    bodyBottom - bodyTop - 40,
    9
  );
  const bodyMatch = findClosestToken(bodyColor, tokens, 'background');
  regions.push({
    name: 'body',
    bounds: { x: contentStartX, y: bodyTop, w: width - contentStartX, h: bodyBottom - bodyTop },
    color: rgbToString(bodyColor),
    hex: rgbToHex(bodyColor),
    token: `var(${bodyMatch.token.name})`,
    tokenName: bodyMatch.token.name,
    tokenValue: bodyMatch.token.hex,
    tokenDistance: Math.round(bodyMatch.distance * 10) / 10,
    tokenType: bodyMatch.type,
  });
  console.log(`  Body: ${rgbToHex(bodyColor)} → ${bodyMatch.token.name} (Δ${Math.round(bodyMatch.distance)})`);

  return {
    image: { width, height, path: imagePath },
    regions,
    cssVariables: buildCssVariables(regions),
  };
}

// ---------------------------------------------------------------------------
// 7. CSS Variable Output (for direct use in prototypes)
// ---------------------------------------------------------------------------

function buildCssVariables(regions) {
  const vars = {};
  for (const r of regions) {
    if (r.name === 'sidebar') {
      vars['--stellar-sidebar-bg'] = r.token;
      // Determine text color: dark bg → white text, light bg → dark text
      const brightness = (r.hex ? hexToRgb(r.hex) : { r: 0, g: 0, b: 0 });
      const lum = 0.299 * brightness.r + 0.587 * brightness.g + 0.114 * brightness.b;
      vars['--stellar-sidebar-text'] = lum < 128
        ? 'var(--base-color-white)'
        : 'var(--themed-reusable-text-primary)';
    }
  }

  // Build inline style string for .stellar-page
  const parts = Object.entries(vars).map(([k, v]) => `${k}: ${v}`);
  return {
    variables: vars,
    inlineStyle: parts.length > 0 ? parts.join('; ') : null,
  };
}

// ---------------------------------------------------------------------------
// 8. CLI
// ---------------------------------------------------------------------------

function printUsage() {
  console.log(`
Usage: node extract-colors.mjs <screenshot.png> [options]

Options:
  --output, -o <file>   Write JSON output to file (default: stdout)
  --tokens <file>       Path to stellar-tokens.css (auto-detected)
  --help, -h            Show this help

Examples:
  node scripts/extract-colors.mjs screenshot.png
  node scripts/extract-colors.mjs screenshot.png -o color-map.json
`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  let imagePath = null;
  let outputPath = null;
  let tokensPath = TOKENS_FILE;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' || args[i] === '-o') {
      outputPath = args[++i];
    } else if (args[i] === '--tokens') {
      tokensPath = args[++i];
    } else if (!args[i].startsWith('-')) {
      imagePath = args[i];
    }
  }

  if (!imagePath) {
    console.error('Error: No image path provided.');
    printUsage();
    process.exit(1);
  }

  imagePath = resolve(imagePath);
  if (!existsSync(imagePath)) {
    console.error(`Error: File not found: ${imagePath}`);
    process.exit(1);
  }

  const ext = extname(imagePath).toLowerCase();
  if (ext !== '.png') {
    console.error(`Error: Only PNG files are supported (got ${ext}). Convert with: sips -s format png input.jpg --out input.png`);
    process.exit(1);
  }

  if (!existsSync(tokensPath)) {
    console.error(`Error: Tokens file not found: ${tokensPath}`);
    console.error('Run: node tokens/extract-tokens.mjs');
    process.exit(1);
  }

  // Parse tokens
  console.log('Parsing design tokens...');
  const tokens = parseTokens(tokensPath);
  console.log(`  ${tokens.length} color tokens loaded\n`);

  // Extract colors
  console.log('Analyzing screenshot...');
  const result = extractColors(imagePath, tokens);

  // Output
  console.log('\n═══════════════════════════════════════════');
  console.log(' COLOR EXTRACTION REPORT');
  console.log('═══════════════════════════════════════════\n');

  console.log(` Image: ${result.image.width}×${result.image.height}`);
  console.log(` Regions detected: ${result.regions.length}\n`);

  for (const r of result.regions) {
    const dist = r.tokenDistance < 5 ? '✓ exact' : `Δ${r.tokenDistance}`;
    console.log(` ${r.name.toUpperCase().padEnd(10)} ${r.hex.padEnd(9)} → ${r.tokenName}  (${dist})`);
  }

  if (result.cssVariables.inlineStyle) {
    console.log(`\n Sidebar style override:`);
    console.log(`   style="${result.cssVariables.inlineStyle}"`);
  }

  console.log('\n═══════════════════════════════════════════\n');

  const json = JSON.stringify(result, null, 2);

  if (outputPath) {
    writeFileSync(resolve(outputPath), json);
    console.log(`Written to: ${resolve(outputPath)}`);
  } else {
    // Print JSON to stdout for piping
    console.log('JSON output:');
    console.log(json);
  }
}

main();
