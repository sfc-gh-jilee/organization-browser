#!/usr/bin/env node

/**
 * Extract design tokens from @snowflake/balto-tokens, @snowflake/balto-themes,
 * and @snowflake/stellar-tokens into a single CSS custom properties file.
 *
 * Sources:
 *   - balto-tokens/src/generated/css/base-colors.css
 *   - balto-tokens/src/generated/css/base-dimensions.css
 *   - balto-tokens/src/generated/css/theme-light.css
 *   - balto-tokens/src/generated/css/theme-dark.css
 *   - balto-themes/dist/generated/*Light.stylex.js + *Dark.stylex.js
 *     (component-specific theme tokens: button, field, filter, etc.)
 *   - stellar-tokens (semantic spacing/size/radius — manually mapped from StyleX)
 *
 * Usage:  node tokens/extract-tokens.mjs
 * Output: tokens/stellar-tokens.css
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, 'stellar-tokens.css');

const SEARCH_PATHS = [
  join(__dirname, '..', '..', '..', '_examples', '_sample', 'node_modules'),
  join(__dirname, '..', '..', '..', '..', 'node_modules'),
  join(__dirname, '..', 'node_modules'),
];

// Also search the pnpm store for balto-themes (hoisted differently)
const PNPM_STORE_PATHS = [
  join(__dirname, '..', '..', '..', '..', 'node_modules', '.pnpm'),
];

function findPackage(pkg) {
  for (const base of SEARCH_PATHS) {
    const p = join(base, pkg);
    if (existsSync(p)) return p;
  }
  return null;
}

function findBaltoThemes() {
  const direct = findPackage('@snowflake/balto-themes');
  if (direct) return direct;

  // Search inside pnpm store
  for (const pnpmDir of PNPM_STORE_PATHS) {
    if (!existsSync(pnpmDir)) continue;
    try {
      const entries = readFileSync('/dev/null', 'utf-8'); // dummy
    } catch {}
    // Check common pnpm hoisted path pattern
    const candidates = [
      join(pnpmDir, '@snowflake+balto-themes@file+vendor+snowflake-balto-themes-0.25.2.tgz', 'node_modules', '@snowflake', 'balto-themes'),
    ];
    for (const c of candidates) {
      if (existsSync(c)) return c;
    }
  }
  return null;
}

function readCSS(pkgPath, relPath) {
  const full = join(pkgPath, relPath);
  if (!existsSync(full)) {
    console.warn(`  ⚠ Missing: ${full}`);
    return null;
  }
  return readFileSync(full, 'utf-8');
}

/**
 * Parse a StyleX theme JS file (e.g. buttonLight.stylex.js) and extract
 * key-value pairs like { primaryBackgroundDefault: "#1a6ce7", ... }.
 */
function parseStyleXTheme(filePath) {
  if (!existsSync(filePath)) return null;
  const src = readFileSync(filePath, 'utf-8');
  const tokens = {};
  // Match lines like:   tokenName: "value",  or  tokenName: stylex.types.integer(400),
  const re = /^\s+(\w+):\s*(?:"([^"]+)"|stylex\.types\.\w+\(([^)]+)\)),?$/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    const key = m[1];
    const value = m[2] !== undefined ? m[2] : m[3];
    tokens[key] = value;
  }
  return tokens;
}

/**
 * Convert a camelCase StyleX token name to a kebab-case CSS custom property name.
 * e.g. "primaryBackgroundDefault" -> "primary-background-default"
 */
function camelToKebab(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Build CSS custom properties for a component theme pair (light + dark).
 * Returns { lightProps: string[], darkProps: string[] } with formatted lines.
 */
function buildComponentThemeProps(prefix, lightTokens, darkTokens) {
  const lightProps = [];
  const darkProps = [];
  const allKeys = new Set([...Object.keys(lightTokens), ...Object.keys(darkTokens)]);

  for (const key of allKeys) {
    const cssVar = `--${prefix}-${camelToKebab(key)}`;
    const lightVal = lightTokens[key];
    const darkVal = darkTokens[key];
    if (lightVal !== undefined) {
      lightProps.push(`  ${cssVar}: ${lightVal};`);
    }
    if (darkVal !== undefined) {
      darkProps.push(`  ${cssVar}: ${darkVal};`);
    }
  }
  return { lightProps, darkProps };
}

const COMPONENT_THEMES = [
  { name: 'button', prefix: 'button' },
  { name: 'field', prefix: 'field' },
  { name: 'filter', prefix: 'filter' },
  { name: 'segmentedButton', prefix: 'segmented-button' },
  { name: 'toolbar', prefix: 'toolbar' },
  { name: 'appNavigation', prefix: 'app-navigation' },
  { name: 'progressBar', prefix: 'progress-bar' },
  { name: 'skeleton', prefix: 'skeleton' },
  { name: 'aiLoading', prefix: 'ai-loading' },
];

const SEMANTIC_SPACING = `
/* ============================================================
   SEMANTIC SPACING TOKENS (from @snowflake/stellar-tokens)
   Regular density values. Use for layout gaps, padding, sizing.
   ============================================================ */
:root {
  /* --- Gap (space between elements) --- */
  --stellar-space-gap-3xs: 2px;
  --stellar-space-gap-2xs: 4px;
  --stellar-space-gap-xs: 6px;
  --stellar-space-gap-sm: 8px;
  --stellar-space-gap-md: 12px;
  --stellar-space-gap-lg: 16px;
  --stellar-space-gap-xl: 20px;
  --stellar-space-gap-2xl: 24px;
  --stellar-space-gap-3xl: 32px;
  --stellar-space-gap-4xl: 40px;

  /* --- Horizontal padding (left/right) --- */
  --stellar-space-horizontal-3xs: 2px;
  --stellar-space-horizontal-2xs: 4px;
  --stellar-space-horizontal-xs: 6px;
  --stellar-space-horizontal-sm: 8px;
  --stellar-space-horizontal-md: 12px;
  --stellar-space-horizontal-lg: 16px;
  --stellar-space-horizontal-xl: 20px;
  --stellar-space-horizontal-2xl: 24px;
  --stellar-space-horizontal-3xl: 32px;
  --stellar-space-horizontal-4xl: 40px;

  /* --- Vertical padding (top/bottom) --- */
  --stellar-space-vertical-3xs: 2px;
  --stellar-space-vertical-2xs: 4px;
  --stellar-space-vertical-xs: 6px;
  --stellar-space-vertical-sm: 8px;
  --stellar-space-vertical-md: 12px;
  --stellar-space-vertical-lg: 16px;
  --stellar-space-vertical-xl: 20px;
  --stellar-space-vertical-2xl: 24px;
  --stellar-space-vertical-3xl: 32px;
  --stellar-space-vertical-4xl: 40px;

  /* --- Size (component dimensions) --- */
  --stellar-size-6xs: 4px;
  --stellar-size-5xs: 6px;
  --stellar-size-4xs: 8px;
  --stellar-size-3xs: 12px;
  --stellar-size-2xs: 16px;
  --stellar-size-xs: 20px;
  --stellar-size-sm: 24px;
  --stellar-size-md: 32px;
  --stellar-size-lg: 40px;
  --stellar-size-xl: 48px;
  --stellar-size-2xl: 64px;

  /* --- Border radius --- */
  --stellar-radius-xs: 4px;
  --stellar-radius-sm: 6px;
  --stellar-radius-md: 8px;
  --stellar-radius-lg: 12px;
  --stellar-radius-xl: 16px;
  --stellar-radius-xxl: 24px;
  --stellar-radius-circle: 9999px;
}
`;

function build() {
  const baltoPath = findPackage('@snowflake/balto-tokens');
  if (!baltoPath) {
    console.error('ERROR: Could not find @snowflake/balto-tokens in any search path.');
    console.error('Searched:', SEARCH_PATHS.map(p => join(p, '@snowflake/balto-tokens')).join('\n  '));
    console.error('\nMake sure a sibling prototype (e.g. _examples/_sample) has run pnpm install.');
    process.exit(1);
  }
  console.log(`Found balto-tokens at: ${baltoPath}`);

  const themesPath = findBaltoThemes();
  if (themesPath) {
    console.log(`Found balto-themes at: ${themesPath}`);
  } else {
    console.warn('⚠ Could not find @snowflake/balto-themes — component-specific tokens will be skipped.');
  }

  // --- Base tokens from balto-tokens CSS ---
  const files = [
    { name: 'BASE COLORS', path: 'src/generated/css/base-colors.css' },
    { name: 'BASE DIMENSIONS', path: 'src/generated/css/base-dimensions.css' },
    { name: 'THEME: LIGHT', path: 'src/generated/css/theme-light.css' },
    { name: 'THEME: DARK', path: 'src/generated/css/theme-dark.css' },
  ];

  const banner = [
    '/**',
    ' * Stellar Design System — CSS Custom Property Tokens',
    ` * Generated: ${new Date().toISOString().slice(0, 10)}`,
    ' *',
    ' * Sources:',
    ' *   @snowflake/balto-tokens  (colors, themed colors, dimensions)',
    ' *   @snowflake/balto-themes  (component-specific light/dark theme tokens)',
    ' *   @snowflake/stellar-tokens (semantic spacing, sizing, radius)',
    ' *',
    ' * Dark mode activation:',
    ' *   - Class-based: add class="darkMode" to <html> or a wrapper element',
    ' *   - Automatic: respects @media (prefers-color-scheme: dark) unless',
    ' *     .lightMode or .darkMode is explicitly set',
    ' *',
    ' * Regenerate: node tokens/extract-tokens.mjs',
    ' * Do not edit manually.',
    ' */',
    '',
  ].join('\n');

  const sections = files.map(({ name, path }) => {
    const css = readCSS(baltoPath, path);
    if (!css) return '';
    const cleaned = css
      .replace(/\/\*\*[\s\S]*?\*\/\s*/, '')
      .trim();
    return [
      `/* ${'='.repeat(60)} */`,
      `/* ${name} */`,
      `/* ${'='.repeat(60)} */`,
      '',
      cleaned,
      '',
    ].join('\n');
  });

  // --- Component-specific theme tokens from balto-themes ---
  let componentSections = '';
  let prefersColorSchemeDarkProps = [];

  if (themesPath) {
    const allLightProps = [];
    const allDarkProps = [];

    for (const { name, prefix } of COMPONENT_THEMES) {
      const lightFile = join(themesPath, 'dist', 'generated', `${name}Light.stylex.js`);
      const darkFile = join(themesPath, 'dist', 'generated', `${name}Dark.stylex.js`);

      const lightTokens = parseStyleXTheme(lightFile);
      const darkTokens = parseStyleXTheme(darkFile);

      if (!lightTokens && !darkTokens) {
        console.warn(`  ⚠ Skipping ${name}: no light/dark files found`);
        continue;
      }

      const { lightProps, darkProps } = buildComponentThemeProps(
        prefix, lightTokens || {}, darkTokens || {}
      );

      if (lightProps.length > 0) {
        allLightProps.push(`  /* --- ${name} --- */`);
        allLightProps.push(...lightProps);
      }
      if (darkProps.length > 0) {
        allDarkProps.push(`  /* --- ${name} --- */`);
        allDarkProps.push(...darkProps);
      }

      console.log(`  ✓ ${name}: ${lightProps.length} light, ${darkProps.length} dark tokens`);
    }

    if (allLightProps.length > 0 || allDarkProps.length > 0) {
      componentSections = [
        '',
        `/* ${'='.repeat(60)} */`,
        '/* COMPONENT-SPECIFIC THEME TOKENS (from @snowflake/balto-themes) */',
        `/* ${'='.repeat(60)} */`,
        '',
        ':root, .lightMode {',
        ...allLightProps,
        '}',
        '',
        '.darkMode {',
        ...allDarkProps,
        '}',
        '',
      ].join('\n');

      prefersColorSchemeDarkProps = allDarkProps;
    }
  }

  // --- Build @media (prefers-color-scheme: dark) block ---
  // Extract the dark theme CSS block from the balto-tokens theme-dark.css
  // and merge with component-specific dark tokens
  const darkThemeCSS = readCSS(baltoPath, 'src/generated/css/theme-dark.css');
  let prefersColorSchemeSection = '';

  if (darkThemeCSS || prefersColorSchemeDarkProps.length > 0) {
    const darkPropsFromBalto = [];
    if (darkThemeCSS) {
      // Extract the content between { and } of the .darkMode rule
      const match = darkThemeCSS.match(/\.darkMode\s*\{([^}]+)\}/);
      if (match) {
        darkPropsFromBalto.push(
          ...match[1].trim().split('\n').map(l => '    ' + l.trim()).filter(l => l.trim())
        );
      }
    }

    const darkPropsFromComponents = prefersColorSchemeDarkProps.map(l => '  ' + l);

    prefersColorSchemeSection = [
      '',
      `/* ${'='.repeat(60)} */`,
      '/* AUTO DARK MODE (system preference) */',
      '/* Applies dark tokens when OS is in dark mode, unless */',
      '/* .lightMode or .darkMode is explicitly set on :root. */',
      `/* ${'='.repeat(60)} */`,
      '',
      '@media (prefers-color-scheme: dark) {',
      '  :root:not(.lightMode):not(.darkMode) {',
      ...darkPropsFromBalto,
      ...darkPropsFromComponents,
      '  }',
      '}',
      '',
    ].join('\n');
  }

  const output = banner
    + sections.join('\n')
    + componentSections
    + SEMANTIC_SPACING
    + prefersColorSchemeSection;

  writeFileSync(OUTPUT, output);
  const kb = (Buffer.byteLength(output) / 1024).toFixed(1);
  console.log(`✓ tokens/stellar-tokens.css (${kb} KB)`);
}

build();
