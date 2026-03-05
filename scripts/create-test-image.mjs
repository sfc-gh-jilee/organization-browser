#!/usr/bin/env node
/**
 * Creates synthetic test PNGs for extract-colors.mjs validation.
 *
 * Layouts:
 *   1) Sidebar + header + body
 *   2) No sidebar, header + body + footer
 *   3) Full bleed (no distinct regions)
 */

import { writeFileSync } from 'fs';
import { PNG } from 'pngjs';

function createPng(w, h, fillFn) {
  const png = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (w * y + x) * 4;
      const c = fillFn(x, y, w, h);
      png.data[idx]     = c.r;
      png.data[idx + 1] = c.g;
      png.data[idx + 2] = c.b;
      png.data[idx + 3] = 255;
    }
  }
  return PNG.sync.write(png);
}

const SIDEBAR  = { r: 0x1e, g: 0x25, b: 0x2f }; // gray-85
const WHITE    = { r: 0xff, g: 0xff, b: 0xff };
const GRAY00   = { r: 0xfb, g: 0xfb, b: 0xfb }; // gray-00
const GRAY10   = { r: 0xf7, g: 0xf7, b: 0xf7 }; // gray-10
const BORDER   = { r: 0xd5, g: 0xda, b: 0xe4 };

// 1) Sidebar + header + body
writeFileSync('test-screenshot.png', createPng(1280, 800, (x, y) => {
  if (x < 240) return SIDEBAR;
  if (y < 48)  return WHITE;
  if (y === 48) return BORDER;
  return GRAY00;
}));
console.log('Created test-screenshot.png  (sidebar + header + body)');

// 2) No sidebar, header + body + footer
writeFileSync('test-no-sidebar.png', createPng(1280, 800, (x, y) => {
  if (y < 56)  return GRAY10;
  if (y === 56) return BORDER;
  if (y >= 750) return GRAY10;
  if (y === 749) return BORDER;
  return WHITE;
}));
console.log('Created test-no-sidebar.png  (header + body + footer)');

// 3) Full bleed white
writeFileSync('test-fullbleed.png', createPng(1280, 800, () => WHITE));
console.log('Created test-fullbleed.png   (no distinct regions)');
