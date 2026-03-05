#!/usr/bin/env node
/**
 * extract-icons.mjs
 *
 * Batch-extracts all icons, pictograms, and illustrations from the
 * @snowflake/stellar-icons tarball into standalone .svg files.
 *
 * Usage:  node icons/extract-icons.mjs
 * Run from the project root (prototypes/jilee/vanilla-stellar).
 */

import { execSync } from 'node:child_process';
import {
  mkdtempSync, readFileSync, writeFileSync,
  mkdirSync, readdirSync, rmSync,
} from 'node:fs';
import { join, basename } from 'node:path';
import { tmpdir } from 'node:os';

// ---------------------------------------------------------------------------
// SVG wrapper dimensions
// ---------------------------------------------------------------------------
const SVG_CONFIGS = {
  iconRegular:   { viewBox: '0 0 16 16',   width: 16,  height: 16  },
  iconMedium:    { viewBox: '0 0 20 20',   width: 20,  height: 20  },
  pictogram:     { viewBox: '0 0 50 48',   width: 48,  height: 48  },
  illustration:  { viewBox: '0 0 142 126', width: 142, height: 126 },
};

// ---------------------------------------------------------------------------
// 1. Locate workspace root & tarball
// ---------------------------------------------------------------------------
const wsRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
const tarball = execSync(
  `ls "${wsRoot}"/vendor/snowflake-stellar-icons-*.tgz | sort -V | tail -1`,
  { encoding: 'utf8' },
).trim();
const version = (tarball.match(/snowflake-stellar-icons-(.+)\.tgz/) || [])[1] || 'unknown';
console.log(`Tarball : ${tarball}`);
console.log(`Version : ${version}\n`);

// ---------------------------------------------------------------------------
// 2. Extract tarball to a temp directory
// ---------------------------------------------------------------------------
const tmpDir = mkdtempSync(join(tmpdir(), 'stellar-icons-'));
execSync(`tar xzf "${tarball}" -C "${tmpDir}"`);
const pkgDir = join(tmpDir, 'package');

const componentsDir   = join(pkgDir, 'dist', 'generated', 'components');
const pictogramsDir   = join(componentsDir, 'generated', 'pictogram-components');
const illustrationsDir = join(componentsDir, 'generated', 'illustration-components');

// ---------------------------------------------------------------------------
// 3. Prepare output directories
// ---------------------------------------------------------------------------
const outBase = join(process.cwd(), 'icons');
for (const sub of ['svg', 'pictograms', 'illustrations']) {
  mkdirSync(join(outBase, sub), { recursive: true });
}

// ---------------------------------------------------------------------------
// Virtual-DOM helpers (no React dependency needed)
// ---------------------------------------------------------------------------
const FRAGMENT = Symbol('Fragment');

function createVNode(type, props) {
  return { type, ...props };
}

/** React camelCase prop → SVG attribute name */
const PROP_REMAP = {
  className: 'class',
  fillRule: 'fill-rule',
  clipRule: 'clip-rule',
  fillOpacity: 'fill-opacity',
  strokeWidth: 'stroke-width',
  strokeLinecap: 'stroke-linecap',
  strokeLinejoin: 'stroke-linejoin',
  strokeDasharray: 'stroke-dasharray',
  strokeDashoffset: 'stroke-dashoffset',
  strokeMiterlimit: 'stroke-miterlimit',
  strokeOpacity: 'stroke-opacity',
  stopColor: 'stop-color',
  stopOpacity: 'stop-opacity',
  floodColor: 'flood-color',
  floodOpacity: 'flood-opacity',
  lightingColor: 'lighting-color',
  colorInterpolation: 'color-interpolation',
  colorInterpolationFilters: 'color-interpolation-filters',
  xlinkHref: 'xlink:href',
  xmlSpace: 'xml:space',
};

function attrName(reactProp) {
  return PROP_REMAP[reactProp] ?? reactProp;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function styleToString(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
    .join('; ');
}

/**
 * If the top-level node is a bare <g> with no visual attributes,
 * unwrap it so the SVG output is cleaner.
 */
function unwrapBareG(node) {
  if (!node || typeof node !== 'object') return node;
  if (node.type !== 'g') return node;
  const { type, children, ref, key, ...attrs } = node;
  if (Object.keys(attrs).length === 0 && children != null) return children;
  return node;
}

const SKIP_ATTRS = new Set(['ref', 'key']);
const SELF_CLOSING = new Set([
  'path', 'circle', 'ellipse', 'line', 'polygon', 'polyline',
  'rect', 'use', 'image', 'stop',
  'feFlood', 'feColorMatrix', 'feOffset', 'feGaussianBlur',
  'feBlend', 'feMergeNode', 'feComposite', 'feMorphology',
  'feTurbulence', 'feDisplacementMap', 'feImage',
]);

function serialize(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string') return escapeXml(node);
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(serialize).join('');

  const { type, children, ...rest } = node;

  // Fragment → just render children
  if (type === FRAGMENT) {
    return children == null ? '' :
      Array.isArray(children) ? children.map(serialize).join('') : serialize(children);
  }

  // Wrapper pseudo-types → extract svgContent
  if (type === 'IconWrapper' || type === 'PictogramWrapper' || type === 'IllustrationWrapper') {
    return serialize(rest.svgContent);
  }

  // Function component → call it
  if (typeof type === 'function') {
    try {
      return serialize(type({ ...rest, children }, null));
    } catch { return ''; }
  }

  // Regular SVG element
  if (typeof type === 'string') {
    const parts = [];
    for (const [k, v] of Object.entries(rest)) {
      if (v == null || SKIP_ATTRS.has(k)) continue;
      if (k === 'style' && typeof v === 'object') {
        parts.push(`style="${escapeXml(styleToString(v))}"`);
      } else {
        parts.push(`${attrName(k)}="${escapeXml(String(v))}"`);
      }
    }
    const attrStr = parts.length ? ' ' + parts.join(' ') : '';

    const childStr = children == null ? '' :
      Array.isArray(children) ? children.map(serialize).join('') : serialize(children);

    if (!childStr && SELF_CLOSING.has(type)) return `<${type}${attrStr}/>`;
    return `<${type}${attrStr}>${childStr}</${type}>`;
  }

  return '';
}

function wrapSvg(inner, { viewBox, width, height }) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"`,
    ` width="${width}" height="${height}" fill="none"`,
    ` role="presentation" aria-hidden="true">`,
    inner,
    `</svg>`,
    '',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Component evaluator
// ---------------------------------------------------------------------------

/**
 * Takes the raw .es.js source, strips imports/exports, injects mocks for
 * React/Stellar dependencies, and calls the component to obtain a vnode tree.
 */
function evaluateComponent(source) {
  let code = source
    .replace(/^import\s+[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm, '')
    .replace(/\/\/# sourceMappingURL=.*$/gm, '');

  const exportMatch = code.match(/export\s*\{\s*(\w+)\s*\}/);
  if (!exportMatch) return null;
  const componentName = exportMatch[1];
  code = code.replace(/export\s*\{[^}]*\}\s*;?/g, '');

  // Build mocks
  let idCounter = 0;
  const mocks = {
    jsx: createVNode,
    jsxs: createVNode,
    Fragment: FRAGMENT,
    forwardRef: (fn) => fn,
    useContext: () => ({}),
    baltoTheme: { reusableIconDefault: 'currentColor' },
    useIconContext: () => ({ color: 'currentColor', size: '16px' }),
    IconWrapper: 'IconWrapper',
    PictogramWrapper: 'PictogramWrapper',
    IllustrationWrapper: 'IllustrationWrapper',
  };

  // Detect mangled useId aliases (e.g. $bdb11010cef70236$export$f680877a34711e37)
  const mangledIds = [...new Set(code.match(/\$\w+\$export\$\w+/g) || [])];
  for (const id of mangledIds) {
    mocks[id] = () => `s${idCounter++}`;
  }

  try {
    const names = Object.keys(mocks);
    const vals  = Object.values(mocks);
    const fn = new Function(...names, `${code}\nreturn ${componentName};`);
    const component = fn(...vals);
    return component({}, null);
  } catch (e) {
    console.warn(`  ⚠ eval failed for ${componentName}: ${e.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

const manifest = {
  icons: [],
  pictograms: [],
  illustrations: [],
  meta: {
    source: `@snowflake/stellar-icons@${version}`,
    extractedAt: new Date().toISOString(),
    totalIcons: 0,
    totalPictograms: 0,
    totalIllustrations: 0,
  },
};

function extractAndWrite(srcDir, fileFilter, outSubdir, svgConfig, manifestList, nameCleaner) {
  const files = readdirSync(srcDir).filter(fileFilter);
  let count = 0;
  for (const file of files) {
    const name = nameCleaner ? nameCleaner(basename(file, '.es.js')) : basename(file, '.es.js');
    const source = readFileSync(join(srcDir, file), 'utf8');
    const tree = evaluateComponent(source);
    if (!tree) continue;
    const inner = serialize(unwrapBareG(tree));
    const svg = wrapSvg(inner, svgConfig);
    const outFile = `${name}.svg`;
    writeFileSync(join(outBase, outSubdir, outFile), svg);
    manifestList.push({ name, file: `${outSubdir}/${outFile}`, viewBox: svgConfig.viewBox });
    count++;
  }
  return count;
}

// --- Icons: Regular variants ---
console.log('Extracting icons (regular)…');
const regularFilter = (f) => f.endsWith('RegularIcon.es.js');
const regularFiles = readdirSync(componentsDir).filter(regularFilter);

const regularBases = new Set();
let iconEntries = 0;

for (const file of regularFiles) {
  const fullName = basename(file, '.es.js');           // e.g. AccountTeamRegularIcon
  const baseName = fullName.replace(/RegularIcon$/, ''); // e.g. AccountTeam
  regularBases.add(baseName);

  const source = readFileSync(join(componentsDir, file), 'utf8');
  const tree = evaluateComponent(source);
  if (!tree) continue;

  const inner = serialize(unwrapBareG(tree));
  const svg = wrapSvg(inner, SVG_CONFIGS.iconRegular);
  const outFile = `${baseName}Icon.svg`;
  writeFileSync(join(outBase, 'svg', outFile), svg);

  const entry = {
    name: `${baseName}Icon`,
    file: `svg/${outFile}`,
    viewBox: SVG_CONFIGS.iconRegular.viewBox,
    sizes: ['regular'],
  };

  // Check for a matching Medium variant
  const medFile = `${baseName}MediumIcon.es.js`;
  const medPath = join(componentsDir, medFile);
  try {
    const medSource = readFileSync(medPath, 'utf8');
    const medTree = evaluateComponent(medSource);
    if (medTree) {
      const medInner = serialize(unwrapBareG(medTree));
      const medSvg = wrapSvg(medInner, SVG_CONFIGS.iconMedium);
      const medOutFile = `${baseName}Icon-medium.svg`;
      writeFileSync(join(outBase, 'svg', medOutFile), medSvg);
      entry.sizes.push('medium');
    }
  } catch { /* no medium variant */ }

  manifest.icons.push(entry);
  iconEntries++;
}

// --- Icons: Medium-only (no Regular counterpart) ---
const mediumOnlyFilter = (f) => {
  if (!f.endsWith('MediumIcon.es.js')) return false;
  const base = basename(f, '.es.js').replace(/MediumIcon$/, '');
  return !regularBases.has(base);
};
const mediumOnlyFiles = readdirSync(componentsDir).filter(mediumOnlyFilter);

for (const file of mediumOnlyFiles) {
  const baseName = basename(file, '.es.js').replace(/MediumIcon$/, '');
  const source = readFileSync(join(componentsDir, file), 'utf8');
  const tree = evaluateComponent(source);
  if (!tree) continue;

  const inner = serialize(unwrapBareG(tree));
  const svg = wrapSvg(inner, SVG_CONFIGS.iconMedium);
  const outFile = `${baseName}Icon-medium.svg`;
  writeFileSync(join(outBase, 'svg', outFile), svg);
  manifest.icons.push({
    name: `${baseName}Icon`,
    file: `svg/${outFile}`,
    viewBox: SVG_CONFIGS.iconMedium.viewBox,
    sizes: ['medium'],
  });
  iconEntries++;
}

// --- Icons: Standalone (top-level files with no Regular/Medium variants) ---
const allIconFiles = readdirSync(componentsDir).filter(
  (f) => f.endsWith('Icon.es.js') && !f.endsWith('RegularIcon.es.js') && !f.endsWith('MediumIcon.es.js'),
);
const standaloneFilter = (f) => {
  const base = basename(f, '.es.js').replace(/Icon$/, '');
  // Skip if we already processed this base via Regular/Medium
  if (regularBases.has(base)) return false;
  // Skip Medium-only bases too
  if (mediumOnlyFiles.some((m) => basename(m, '.es.js').replace(/MediumIcon$/, '') === base)) return false;
  return true;
};

const nonComponentFiles = new Set([
  'IconWrapper.es.js', 'IconContext.es.js', 'useIconContext.es.js',
]);

for (const file of allIconFiles) {
  if (nonComponentFiles.has(file)) continue;
  if (!standaloneFilter(file)) continue;

  const name = basename(file, '.es.js');
  const source = readFileSync(join(componentsDir, file), 'utf8');

  // Standalone icons import IconWrapper — they ARE content files
  if (!source.includes('IconWrapper')) continue;

  const tree = evaluateComponent(source);
  if (!tree) continue;

  const inner = serialize(unwrapBareG(tree));
  const svg = wrapSvg(inner, SVG_CONFIGS.iconRegular);
  const outFile = `${name}.svg`;
  writeFileSync(join(outBase, 'svg', outFile), svg);
  manifest.icons.push({
    name,
    file: `svg/${outFile}`,
    viewBox: SVG_CONFIGS.iconRegular.viewBox,
    sizes: ['regular'],
  });
  iconEntries++;
}

console.log(`  ✓ ${iconEntries} icon sets\n`);
manifest.meta.totalIcons = iconEntries;

// --- Pictograms ---
console.log('Extracting pictograms…');
const pictoCount = extractAndWrite(
  pictogramsDir,
  (f) => f.endsWith('Pictogram.es.js'),
  'pictograms',
  SVG_CONFIGS.pictogram,
  manifest.pictograms,
);
console.log(`  ✓ ${pictoCount} pictograms\n`);
manifest.meta.totalPictograms = pictoCount;

// --- Illustrations ---
console.log('Extracting illustrations…');
const illusCount = extractAndWrite(
  illustrationsDir,
  (f) => f.endsWith('Illustration.es.js'),
  'illustrations',
  SVG_CONFIGS.illustration,
  manifest.illustrations,
);
console.log(`  ✓ ${illusCount} illustrations\n`);
manifest.meta.totalIllustrations = illusCount;

// --- Write manifest ---
writeFileSync(join(outBase, 'icons.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Manifest → icons/icons.json`);

// --- Cleanup ---
rmSync(tmpDir, { recursive: true, force: true });

console.log(`\nDone! Total: ${iconEntries} icons · ${pictoCount} pictograms · ${illusCount} illustrations`);
console.log(`Output → ${outBase}/`);
