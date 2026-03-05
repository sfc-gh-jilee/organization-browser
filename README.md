# Vanilla Stellar — Component Kit for Snowsight Prototyping

> **For AI Agents**: This is the authoritative guide for building Snowsight (Snowflake web UI) prototypes using vanilla HTML/CSS/JS. These components are pixel-accurate extractions from Snowflake's Stellar Design System. **You MUST use these components instead of creating custom UI.**

## Critical Rules

1. **ALWAYS use the components in this kit before writing any custom HTML/CSS.** If a UI element exists here, use it. No exceptions.
2. **NEVER create custom buttons, inputs, tabs, menus, tables, or text styles.** They already exist and are design-system accurate.
3. **NEVER invent CSS class names** that start with `stellar-`. Only use the classes documented below.
4. **NEVER hardcode colors or font sizes.** Use the text component classes or the documented color values.
5. **Include `stellar.css` and `stellar.js`** in every prototype HTML file. They contain all components.

## Quick Start

Every prototype page should start from this boilerplate:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Prototype</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="dist/stellar.css">
</head>
<body>
  <!-- Your prototype content here -->

  <script src="dist/stellar.js"></script>
</body>
</html>
```

**CRITICAL**: Always load `dist/stellar.css` and `dist/stellar.js` — never the root-level copies or individual component files. Only the `dist/` build includes design tokens (spacing, colors, borders) and all components. Without it, token variables like `var(--stellar-space-*)` and `var(--themed-*)` resolve to nothing.

Run `node build.mjs` to regenerate the `dist/` files after any component changes.

---

## Available Components

### 1. Button

Standard action button with 4 variants and 2 sizes.

**CSS file**: `components/button/button.css`
**JS**: None (static element)

#### Variants

| Class | Appearance |
|-------|------------|
| `stellar-button--primary` | Blue filled button (main actions) |
| `stellar-button--secondary` | White button with gray border (secondary actions) |
| `stellar-button--tertiary` | Transparent button, gray text (subtle actions) |
| `stellar-button--critical` | Red filled button (destructive actions like Delete) |

#### Sizes

| Class | Height |
|-------|--------|
| _(default)_ | 32px |
| `stellar-button--small` | 24px |

#### States

| Class / Attribute | Effect |
|-------------------|--------|
| `disabled` | Muted colors, `not-allowed` cursor |
| `stellar-button--selected` | Toggle/pressed appearance |

#### HTML

```html
<!-- Primary button -->
<button class="stellar-button stellar-button--primary">Label</button>

<!-- Secondary small button -->
<button class="stellar-button stellar-button--secondary stellar-button--small">Label</button>

<!-- With leading icon -->
<button class="stellar-button stellar-button--primary">
  <svg class="stellar-button__icon" viewBox="0 0 16 16" aria-hidden="true" fill="none">
    <path fill="currentColor" d="M8 7h6.005v1H8v6H7V8H1.005V7H7V1h1z"/>
  </svg>
  Create
</button>

<!-- Disabled -->
<button class="stellar-button stellar-button--primary" disabled>Label</button>

<!-- Selected / pressed -->
<button class="stellar-button stellar-button--secondary stellar-button--selected" aria-pressed="true">Label</button>
```

#### Usage Notes

- **Sizing**: Buttons are `inline-flex` and shrink-wrap their content. They never fill their container width — this is correct behavior.
- **Do NOT** set `width: 100%` or `display: block` on buttons. If you need to align buttons, wrap them in a flex container.
- Buttons should be placed inside layout containers (flex/grid divs) that control spacing and alignment.

#### All CSS Classes

```
.stellar-button                  /* Base (required) */
.stellar-button--primary         /* Blue filled */
.stellar-button--secondary       /* White with border */
.stellar-button--tertiary        /* Transparent */
.stellar-button--critical        /* Red filled */
.stellar-button--small           /* 24px height */
.stellar-button--selected        /* Pressed/toggle state */
.stellar-button__icon            /* SVG icon inside button */
```

---

### 2. Menu (Dropdown)

Click-triggered dropdown menu with keyboard navigation, sections, dividers, and disabled items.

**CSS file**: `components/menu/menu.css`
**JS file**: `components/menu/menu.js` — auto-initializes all `[data-menu-trigger]` elements

#### HTML

```html
<!-- Basic dropdown menu -->
<div class="stellar-menu-trigger">
  <button class="stellar-button stellar-button--secondary" data-menu-trigger>Actions</button>
  <div class="stellar-menu" role="dialog">
    <div class="stellar-menu__list" role="menu" tabindex="0">
      <div class="stellar-menu__item" role="menuitem" data-key="edit">
        <div class="stellar-menu__item-label" tabindex="0">
          <div style="flex-grow:1; min-width:0; display:flex; flex-direction:column; gap:2px">
            <span class="stellar-menu__item-text">Edit</span>
          </div>
        </div>
      </div>
      <div class="stellar-menu__item" role="menuitem" data-key="duplicate">
        <div class="stellar-menu__item-label" tabindex="0">
          <div style="flex-grow:1; min-width:0; display:flex; flex-direction:column; gap:2px">
            <span class="stellar-menu__item-text">Duplicate</span>
          </div>
        </div>
      </div>
      <div class="stellar-menu__divider" role="separator"></div>
      <div class="stellar-menu__item" role="menuitem" data-key="delete">
        <div class="stellar-menu__item-label" tabindex="0">
          <div style="flex-grow:1; min-width:0; display:flex; flex-direction:column; gap:2px">
            <span class="stellar-menu__item-text">Delete</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

#### Menu Item with Icon

```html
<div class="stellar-menu__item" role="menuitem" data-key="edit">
  <div class="stellar-menu__item-label" tabindex="0">
    <svg class="stellar-menu__item-icon" viewBox="0 0 16 16" role="presentation" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- icon path here -->
    </svg>
    <div style="flex-grow:1; min-width:0; display:flex; flex-direction:column; gap:2px">
      <span class="stellar-menu__item-text">Edit</span>
    </div>
  </div>
</div>
```

#### Section Groups

```html
<div class="stellar-menu__section" role="group">
  <div class="stellar-menu__section-header">Section Title</div>
  <div class="stellar-menu__item" role="menuitem" data-key="item1">...</div>
  <div class="stellar-menu__item" role="menuitem" data-key="item2">...</div>
</div>
```

#### Disabled Items

```html
<div class="stellar-menu__item stellar-menu__item--disabled" role="menuitem" aria-disabled="true" data-key="copy">
  <div class="stellar-menu__item-label" tabindex="-1">
    <div style="flex-grow:1; min-width:0; display:flex; flex-direction:column; gap:2px">
      <span class="stellar-menu__item-text">Copy</span>
    </div>
  </div>
</div>
```

#### JS Events

Listen for item selection on the trigger button:

```js
document.querySelector('[data-menu-trigger]').addEventListener('menu-select', (e) => {
  console.log('Selected:', e.detail.id); // matches data-key
});
```

#### Usage Notes

- **Sizing**: The trigger (`.stellar-menu-trigger`) is `inline-block` — it wraps the button that opens the menu. The dropdown panel (`.stellar-menu`) is absolutely positioned and auto-sizes to its content.
- **Do NOT** set width on the menu or trigger. The menu automatically sizes to fit its items (`min-width: max-content`).
- Place the trigger inside your layout (toolbar, button group, etc.) like any other button.

#### All CSS Classes

```
.stellar-menu-trigger            /* Wrapper (inline-block, position:relative) */
.stellar-menu                    /* Dropdown panel (hidden by default) */
.stellar-menu--open              /* Visible state (added/removed by JS) */
.stellar-menu__list              /* Inner list container */
.stellar-menu__item              /* Menu item row */
.stellar-menu__item--disabled    /* Greyed-out item */
.stellar-menu__item--focused     /* Keyboard-focused item (added by JS) */
.stellar-menu__item-label        /* Flex row inside item */
.stellar-menu__item-text         /* Text label */
.stellar-menu__item-icon         /* 16x16 SVG icon */
.stellar-menu__divider           /* Horizontal separator line */
.stellar-menu__section           /* Group wrapper */
.stellar-menu__section-header    /* Group title text */
```

---

### 3. Tabs

Horizontal tab bar with keyboard navigation (ArrowLeft/Right) and active indicator.

**CSS file**: `components/tabs/tabs.css`
**JS file**: `components/tabs/tabs.js` — auto-initializes all `[data-component="tabs"]` elements

#### HTML

```html
<div data-component="tabs" class="stellar-tabs">
  <div class="stellar-tabs__list" role="tablist">
    <button class="stellar-tabs__trigger" role="tab" aria-selected="true" tabindex="0">
      <span class="stellar-tabs__content">Overview</span>
      <span class="stellar-tabs__indicator"></span>
    </button>
    <button class="stellar-tabs__trigger" role="tab" aria-selected="false" tabindex="-1">
      <span class="stellar-tabs__content">Details</span>
      <span class="stellar-tabs__indicator"></span>
    </button>
    <button class="stellar-tabs__trigger" role="tab" aria-selected="false" tabindex="-1">
      <span class="stellar-tabs__content">Settings</span>
      <span class="stellar-tabs__indicator"></span>
    </button>
  </div>
</div>
```

**Important**: The `data-component="tabs"` attribute on the root is required for JS initialization.

#### Usage Notes

- **Sizing**: Tabs are `display: flex; flex-direction: column` and will **fill the width of their container**. The tab list scrolls horizontally if there are more tabs than fit.
- Place the tabs component inside a container that defines the desired width. Do not set a fixed width on `.stellar-tabs` itself.
- The bottom border line spans the full width automatically via a `::before` pseudo-element.

#### All CSS Classes

```
.stellar-tabs                    /* Root flex column wrapper */
.stellar-tabs__list              /* Horizontal tab bar (role="tablist") */
.stellar-tabs__trigger           /* Individual tab button (role="tab") */
.stellar-tabs__content           /* Inner content wrapper */
.stellar-tabs__indicator         /* Bottom underline bar (2px) */
```

Active tab uses `aria-selected="true"` which turns the text and indicator blue.

---

### 4. Table (Data Grid)

CSS Grid-based data table with sticky header, keyboard navigation, and ARIA grid roles.

**CSS file**: `components/table/table.css`
**JS file**: `components/table/table.js` — auto-initializes all `[data-component="table"]` elements

#### HTML

```html
<div data-component="table" class="stellar-table">
  <div class="stellar-table__grid" role="grid" tabindex="0"
       style="grid-template-columns: 1fr 1fr 1fr 1fr;">
    <!-- Header -->
    <div class="stellar-table__header-group" role="rowgroup">
      <div class="stellar-table__header-row" role="row">
        <div class="stellar-table__column-header" role="columnheader" tabindex="-1">
          <div class="stellar-table__column-header-inner">
            <div class="stellar-table__column-label-container">
              <span class="stellar-table__column-label">Name</span>
            </div>
          </div>
        </div>
        <div class="stellar-table__column-header" role="columnheader" tabindex="-1">
          <div class="stellar-table__column-header-inner">
            <div class="stellar-table__column-label-container">
              <span class="stellar-table__column-label">Role</span>
            </div>
          </div>
        </div>
        <!-- ... more column headers -->
      </div>
    </div>
    <!-- Body -->
    <div class="stellar-table__body-group" role="rowgroup">
      <div class="stellar-table__row" role="row" tabindex="-1">
        <div class="stellar-table__cell" role="gridcell" tabindex="-1">
          <div class="stellar-table__cell-content">Alice Johnson</div>
        </div>
        <div class="stellar-table__cell" role="gridcell" tabindex="-1">
          <div class="stellar-table__cell-content">Engineer</div>
        </div>
        <!-- ... more cells -->
      </div>
      <!-- ... more rows -->
    </div>
  </div>
</div>
```

#### Usage Notes

- **Width**: The table fills **100% of its container width** by default. **NEVER set a fixed pixel width** on `.stellar-table`. If you need the table narrower, constrain the parent container instead.
- **Column count**: Set `grid-template-columns` on `.stellar-table__grid` (inline style or in your CSS) to match your number of columns. The default is `1fr 1fr 1fr 1fr` (4 equal columns).
- **Column sizing**: Use `1fr` for flexible columns that share space equally, fixed values like `200px` or `120px` for fixed-width columns, and `minmax(100px, 1fr)` for columns with a minimum width. Example: `grid-template-columns: 2fr 1fr 1fr 120px;` gives the first column twice the space.
- **Scrollable tables**: If the table's parent has `overflow-y: auto` and a fixed height, the header will stick to the top automatically (`position: sticky`).

```html
<!-- CORRECT: Table fills its container -->
<div style="padding: 16px;">
  <div data-component="table" class="stellar-table">
    <div class="stellar-table__grid" role="grid" tabindex="0"
         style="grid-template-columns: 2fr 1fr 1fr 120px;">
      ...
    </div>
  </div>
</div>

<!-- WRONG: Do NOT set fixed pixel width -->
<div data-component="table" class="stellar-table" style="width: 800px;"> <!-- NEVER do this -->
```

#### All CSS Classes

```
.stellar-table                       /* Root wrapper */
.stellar-table__grid                 /* CSS Grid container (role="grid") */
.stellar-table__header-group         /* Sticky header rowgroup */
.stellar-table__header-row           /* Header row (display:contents) */
.stellar-table__column-header        /* Column header cell */
.stellar-table__column-header-inner  /* Inner flex wrapper */
.stellar-table__column-label-container /* Label + icon container */
.stellar-table__column-label         /* Header text (12px, 500 weight, gray) */
.stellar-table__body-group           /* Body rowgroup */
.stellar-table__row                  /* Data row */
.stellar-table__cell                 /* Data cell (40px min-height) */
.stellar-table__cell-content         /* Cell text with ellipsis */
```

---

### 5. TextInput

Form text input with sizes, validation states, prefix icons, and form field wrapper.

**CSS file**: `components/textinput/textinput.css`
**JS file**: `components/textinput/textinput.js` — manages focus-visible state

#### HTML

```html
<!-- Basic input -->
<div class="stellar-textinput stellar-textinput--regular">
  <input class="stellar-textinput__input" type="text" placeholder="Placeholder text">
</div>

<!-- Small input -->
<div class="stellar-textinput stellar-textinput--small">
  <input class="stellar-textinput__input" type="text" placeholder="Placeholder text">
</div>

<!-- With prefix icon (e.g. search) -->
<div class="stellar-textinput stellar-textinput--regular">
  <svg class="stellar-textinput__icon" viewBox="0 0 16 16" fill="none">
    <path fill="currentColor" fill-rule="evenodd" d="M7 2a5 5 0 0 1 3.871 8.164l3.983 3.983-.707.707-3.983-3.983A5 5 0 1 1 7 2m0 1a4 4 0 1 0 0 8 4 4 0 0 0 0-8" clip-rule="evenodd"/>
  </svg>
  <input class="stellar-textinput__input" type="text" placeholder="Search...">
</div>

<!-- Disabled -->
<div class="stellar-textinput stellar-textinput--regular stellar-textinput--disabled">
  <input class="stellar-textinput__input" type="text" placeholder="Disabled" disabled>
</div>

<!-- With form field wrapper + error -->
<div class="stellar-field">
  <div class="stellar-field__label-area">
    <label class="stellar-field__label">Label</label>
  </div>
  <div class="stellar-field__control-area">
    <div class="stellar-textinput stellar-textinput--regular stellar-textinput--fullwidth stellar-textinput--critical">
      <input class="stellar-textinput__input" type="text" placeholder="Enter value">
      <span class="stellar-textinput__status-icon">
        <svg viewBox="0 0 16 16" fill="none"><path fill="rgb(211, 19, 47)" fill-rule="evenodd" d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1m0 6.293L5.354 4.646l-.708.708L7.293 8l-2.647 2.646.708.707L8 8.708l2.646 2.646.707-.707L8.708 8l2.646-2.646-.707-.708z" clip-rule="evenodd"/></svg>
      </span>
    </div>
    <p class="stellar-field__description stellar-field__description--critical">This field is required</p>
  </div>
</div>
```

#### Usage Notes

- **Sizing**: TextInput is `inline-flex` by default — it shrink-wraps to its content width. **In most cases you want `stellar-textinput--fullwidth`** to make it fill the container (adds `width: 100%`).
- **Form fields**: When using `.stellar-field` (label + input wrapper), the `.stellar-field__control-area` has `flex-grow: 1`, so the input area fills available space automatically. Always add `stellar-textinput--fullwidth` to the input inside a field.
- **Do NOT** set a fixed pixel width on inputs. Control width through the parent container.

```html
<!-- CORRECT: Input fills its container -->
<div class="stellar-textinput stellar-textinput--regular stellar-textinput--fullwidth">
  <input class="stellar-textinput__input" type="text" placeholder="Full width">
</div>

<!-- WRONG: Bare input without --fullwidth will be narrow -->
<div class="stellar-textinput stellar-textinput--regular">
  <input class="stellar-textinput__input" type="text" placeholder="This will be too narrow">
</div>
```

#### All CSS Classes

```
/* Input wrapper */
.stellar-textinput               /* Base (required) */
.stellar-textinput--regular      /* 32px height, 14px font */
.stellar-textinput--small        /* 24px height, 12px font */
.stellar-textinput--disabled     /* Greyed out */
.stellar-textinput--readonly     /* Not editable */
.stellar-textinput--fullwidth    /* Expands to fill container */
.stellar-textinput--critical     /* Red border (error) */
.stellar-textinput--caution      /* Yellow border (warning) */
.stellar-textinput--success      /* Green border (success) */

/* Inner elements */
.stellar-textinput__input        /* The actual <input> element */
.stellar-textinput__icon         /* Prefix icon (16x16 SVG) */
.stellar-textinput__status-icon  /* Suffix validation icon */

/* Form field wrapper */
.stellar-field                   /* Outer layout (label + input side-by-side) */
.stellar-field__label-area       /* Label container */
.stellar-field__label            /* Label text */
.stellar-field__control-area     /* Input + description column */
.stellar-field__description      /* Helper text below input */
.stellar-field__description--critical  /* Red error text */
.stellar-field__description--caution   /* Brown warning text */
```

---

### 6. Text (Typography)

Complete type ramp with editorial, heading, paragraph, label, single-line, and pre components.

**CSS file**: `components/text/text.css`
**JS**: None (static styles only)

#### Type Ramp Classes

| Class | Font Size | Weight | Line Height | Use For |
|-------|-----------|--------|-------------|---------|
| `stellar-type-larger-editorial` | 40px | 700 | 48px | Hero headlines |
| `stellar-type-large-editorial` | 28px | 700 | 34px | Section heroes |
| `stellar-type-page-header` | 20px | 700 | 24px | Page titles |
| `stellar-type-sub-header` | 16px | 600 | 20px | Section headers |
| `stellar-type-paragraph` | 14px | 400 | 20px | Body text |
| `stellar-type-paragraph-bold` | 14px | 600 | 20px | Emphasized body |
| `stellar-type-small-paragraph` | 12px | 400 | 18px | Secondary text |
| `stellar-type-small-paragraph-bold` | 12px | 600 | 18px | Emphasized secondary |
| `stellar-type-label` | 14px | 500 | 16px | Form labels, button text |
| `stellar-type-label-small` | 12px | 500 | 16px | Small labels |
| `stellar-type-single-line` | 14px | 400 | 16px | Single-line truncated text |
| `stellar-type-single-line-bold` | 14px | 600 | 16px | Bold single-line |
| `stellar-type-small-single-line` | 12px | 400 | 14px | Small truncated text |
| `stellar-type-all-caps` | 13px | 500 | 20px | Uppercase labels |
| `stellar-type-all-caps-small` | 11px | 500 | 16px | Small uppercase labels |

#### Component Base Classes

```
.stellar-editorial         /* Hero/display text (word-break, text-wrap:balance) */
.stellar-heading           /* Section headings */
.stellar-heading--disabled /* Greyed heading */
.stellar-paragraph         /* Body text (max-width:70em) */
.stellar-span              /* Inline text */
.stellar-span--truncate    /* Truncated with ellipsis */
.stellar-label             /* Form labels */
.stellar-singleline        /* Single-line truncated text */
.stellar-pre               /* Monospace preformatted text */
```

#### Color Modifiers

```
.stellar-text--primary     /* var(--themed-reusable-text-primary) — default dark text */
.stellar-text--secondary   /* var(--themed-reusable-text-secondary) — muted/gray text */
.stellar-text--critical    /* var(--themed-status-critical-ui) — error/danger red */
.stellar-text--caution     /* var(--themed-status-caution-text) — warning brown */
.stellar-text--disabled    /* var(--themed-reusable-disabled-text) — disabled gray */
```

#### HTML

```html
<!-- Page title -->
<h1 class="stellar-heading stellar-type-page-header">Dashboard</h1>

<!-- Section header -->
<h2 class="stellar-heading stellar-type-sub-header">Recent Activity</h2>

<!-- Body text -->
<p class="stellar-paragraph stellar-type-paragraph">
  This is standard body text at 14px.
</p>

<!-- Secondary caption -->
<span class="stellar-span stellar-type-small-paragraph stellar-text--secondary">
  Last updated 5 minutes ago
</span>

<!-- Error message -->
<p class="stellar-paragraph stellar-type-small-paragraph stellar-text--critical">
  Connection failed. Please try again.
</p>

<!-- Monospace code -->
<pre class="stellar-pre">SELECT * FROM users WHERE active = true;</pre>
```

#### Usage Notes

- **Sizing**: Text components are block-level and fill their container width. `.stellar-paragraph` has `max-width: 70em` for readability.
- **Always combine** a base class (e.g., `.stellar-heading`) with a type ramp class (e.g., `.stellar-type-page-header`). The base class sets display/margin behavior; the ramp class sets font size/weight.
- **Color**: Use `.stellar-text--secondary` for muted text, `.stellar-text--critical` for errors. Default color is `rgb(30, 37, 47)` (near-black).

#### CSS Custom Properties (from text.css)

These are convenience aliases that reference the underlying `--themed-*` tokens:

```css
--stellar-font-body       /* → var(--themed-font-family-body) */
--stellar-font-heading    /* → var(--themed-font-family-heading) */
--stellar-font-editorial  /* → var(--themed-font-family-editorial) */
--stellar-font-mono       /* → var(--themed-font-family-mono) */
--stellar-color-header    /* → var(--themed-reusable-text-header) */
--stellar-color-primary   /* → var(--themed-reusable-text-primary) */
--stellar-color-secondary /* → var(--themed-reusable-text-secondary) */
--stellar-color-critical  /* → var(--themed-status-critical-ui) */
--stellar-color-caution   /* → var(--themed-status-caution-text) */
--stellar-color-disabled  /* → var(--themed-reusable-disabled-text) */
```

---

### 7. Segmented Button

Toggle button group (radio-like selection). Keyboard navigable with ArrowLeft/Right.

**CSS file**: `components/segmentedbutton/segmentedbutton.css`
**JS file**: `components/segmentedbutton/segmentedbutton.js` — auto-initializes all `.stellar-segmentedbutton` elements

#### Sizes

| Class | Height |
|-------|--------|
| `stellar-segmentedbutton--regular` | 32px |
| `stellar-segmentedbutton--small` | 24px |

#### HTML

```html
<div class="stellar-segmentedbutton stellar-segmentedbutton--regular" role="radiogroup">
  <button class="stellar-segmentedbutton__item" role="radio" aria-checked="true" tabindex="0" data-value="list">
    List
  </button>
  <button class="stellar-segmentedbutton__item" role="radio" aria-checked="false" tabindex="-1" data-value="grid">
    Grid
  </button>
  <button class="stellar-segmentedbutton__item" role="radio" aria-checked="false" tabindex="-1" data-value="chart">
    Chart
  </button>
</div>
```

#### With Icons

```html
<button class="stellar-segmentedbutton__item" role="radio" aria-checked="true" tabindex="0" data-value="list">
  <svg viewBox="0 0 16 16" aria-hidden="true" fill="none">
    <!-- icon SVG path -->
  </svg>
  List
</button>
```

#### With Count Badge

```html
<button class="stellar-segmentedbutton__item" role="radio" aria-checked="true" tabindex="0" data-value="all">
  All
  <span class="stellar-segmentedbutton__badge">12</span>
</button>
```

#### JS Events

```js
document.querySelector('.stellar-segmentedbutton').addEventListener('change', (e) => {
  console.log('Selected:', e.detail.value); // matches data-value
});
```

#### Usage Notes

- **Sizing**: Segmented button is `width: fit-content` — it sizes to its content. It does NOT fill its container.
- Place it inside a flex container and use alignment (e.g., `justify-content: flex-end`) to position it within toolbars or headers.
- **Do NOT** set `width: 100%` on a segmented button. It should remain content-sized.

#### All CSS Classes

```
.stellar-segmentedbutton           /* Root container (required) */
.stellar-segmentedbutton--regular  /* 32px height */
.stellar-segmentedbutton--small    /* 24px height */
.stellar-segmentedbutton__item     /* Individual toggle button */
.stellar-segmentedbutton__badge    /* Count badge pill */
```

Selected state uses `aria-checked="true"` (white bg, blue text, border).

---

### 8. Split Button

Button with primary action + dropdown trigger (chevron). Combines Button and Menu patterns.

**CSS file**: `components/splitbutton/splitbutton.css`
**JS file**: `components/splitbutton/splitbutton.js` — auto-initializes all `.stellar-splitbutton` elements
**Dependency**: Also requires `components/menu/menu.css` for the dropdown menu styling.

#### Variants

| Class | Appearance |
|-------|------------|
| `stellar-splitbutton--primary` | Blue filled |
| `stellar-splitbutton--secondary` | White with border |
| `stellar-splitbutton--tertiary` | Transparent |
| `stellar-splitbutton--critical` | Red filled |

#### States

| Class | Effect |
|-------|--------|
| `stellar-splitbutton--disabled` | Muted, not interactive |

#### HTML

```html
<div class="stellar-splitbutton stellar-splitbutton--primary" style="position:relative;">
  <!-- Action button (left) -->
  <button class="stellar-splitbutton__action">Create</button>
  <!-- Trigger button (right chevron) -->
  <button class="stellar-splitbutton__trigger" data-menu-trigger>
    <svg class="stellar-splitbutton__trigger-icon" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path fill="currentColor" d="m8 10.5-4-5h8z"/>
    </svg>
  </button>
  <!-- Dropdown menu (reuses menu component) -->
  <div class="stellar-menu" role="dialog">
    <div class="stellar-menu__list" role="menu" tabindex="0">
      <div class="stellar-menu__item" role="menuitem" data-key="option-a">
        <div class="stellar-menu__item-label" tabindex="0">
          <div style="flex-grow:1; min-width:0; display:flex; flex-direction:column; gap:2px">
            <span class="stellar-menu__item-text">Option A</span>
          </div>
        </div>
      </div>
      <div class="stellar-menu__item" role="menuitem" data-key="option-b">
        <div class="stellar-menu__item-label" tabindex="0">
          <div style="flex-grow:1; min-width:0; display:flex; flex-direction:column; gap:2px">
            <span class="stellar-menu__item-text">Option B</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

#### JS Events

```js
document.querySelector('.stellar-splitbutton').addEventListener('menu-select', (e) => {
  console.log('Menu selected:', e.detail.id);
});
```

#### Usage Notes

- **Sizing**: Split button is `display: flex` and shrink-wraps its content, like a regular button. It does NOT fill its container.
- Needs `position: relative` on the root element (for the dropdown menu positioning).
- Place it inside flex/grid layout containers to control alignment.

#### All CSS Classes

```
.stellar-splitbutton               /* Root flex container */
.stellar-splitbutton--primary      /* Blue variant */
.stellar-splitbutton--secondary    /* White/border variant */
.stellar-splitbutton--tertiary     /* Transparent variant */
.stellar-splitbutton--critical     /* Red variant */
.stellar-splitbutton--disabled     /* Disabled state */
.stellar-splitbutton__action       /* Left action button */
.stellar-splitbutton__trigger      /* Right chevron button */
.stellar-splitbutton__trigger-icon /* Chevron SVG icon */
.stellar-splitbutton__action-icon  /* Optional icon in action button */
```

---

### 9. Card

Container component for grouping content with optional header, body, and footer sections. Supports interactive (clickable) variant.

**CSS file**: `components/card/card.css`
**JS**: None (static element)

#### HTML

```html
<!-- Basic card -->
<section class="stellar-card">
  <div class="stellar-card__header">
    <div class="stellar-card__header-content">
      <div class="stellar-card__heading-row">
        <h1 class="stellar-card__heading">Card Title</h1>
      </div>
      <p class="stellar-card__subtitle">Optional subtitle text</p>
    </div>
  </div>
  <div class="stellar-card__body">
    <p>Card content goes here.</p>
  </div>
  <div class="stellar-card__footer">
    <button class="stellar-button stellar-button--secondary">Cancel</button>
    <button class="stellar-button stellar-button--primary">Confirm</button>
  </div>
</section>

<!-- Interactive (clickable) card -->
<button class="stellar-card stellar-card--interactive">
  <div class="stellar-card__header">
    <div class="stellar-card__header-content">
      <div class="stellar-card__heading-row">
        <h1 class="stellar-card__heading">Clickable Card</h1>
      </div>
    </div>
  </div>
  <div class="stellar-card__body">Click me</div>
</button>
```

#### Usage Notes

- **Sizing**: Card uses `flex-grow: 1; flex-shrink: 1` — it **fills available space** in a flex container and shares space equally with sibling cards. This is the correct behavior for card grids.
- **Card grids**: Place cards in a flex row (`display: flex; gap: 16px;`) and they will distribute evenly. For fixed columns, use CSS Grid instead: `display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;`.
- **Do NOT** set a fixed pixel width on cards. Let the flex/grid parent control sizing.
- Cards have `24px` internal padding and `8px` border-radius by default.
- **Do NOT add inline padding to `.stellar-card__body`** — the card root (`.stellar-card`) already provides 24px padding on all sides. Adding padding to inner elements causes double-padding and makes the card much taller than intended. If you need smaller card padding (e.g. for compact quick-action cards), override the root padding instead:

```html
<!-- ❌ WRONG: Double padding (card root 24px + body 16px = 40px per side) -->
<button class="stellar-card stellar-card--interactive">
  <div class="stellar-card__body" style="padding:16px;">Content</div>
</button>

<!-- ✅ CORRECT: Override root padding for compact cards via CSS -->
<style>
  .compact-cards .stellar-card {
    padding: 12px 16px;
    gap: 6px;
  }
</style>
<div class="compact-cards">
  <button class="stellar-card stellar-card--interactive">
    <div class="stellar-card__body">Content</div>
  </button>
</div>
```

#### All CSS Classes

```
.stellar-card                    /* Root container (<section> or <button>) */
.stellar-card--interactive       /* Clickable variant (hover shadow, cursor:pointer) */
.stellar-card--disabled          /* Disabled interactive card */
.stellar-card__header            /* Header row (title + actions) */
.stellar-card__header-content    /* Title + subtitle column */
.stellar-card__heading-row       /* Heading + badge row */
.stellar-card__heading           /* Title text (16px, 600 weight) */
.stellar-card__subtitle          /* Subtitle text (12px, secondary color) */
.stellar-card__secondary-actions /* Action buttons in header */
.stellar-card__body              /* Main content area (flex-grow:1) */
.stellar-card__footer            /* Footer row for actions */
```

---

### 10. GlobalNav (Snowflake Sidebar Navigation)

Full Snowflake production sidebar navigation with expand/collapse, 3 nav sections, user profile, and notification badge. **Use this instead of building a custom sidebar.**

**CSS file**: `components/globalnav/globalnav.css`
**JS file**: `components/globalnav/globalnav.js` — auto-initializes all `[data-component="globalnav"]` elements. All 18 SVG icons and the Snowflake logo are inlined (no fetch needed, works with `file://`).

#### HTML

```html
<!-- Wrap in a flex layout with your content -->
<div style="display:flex; min-height:100vh;">

  <!-- GlobalNav (auto-initialized) -->
  <aside
    data-component="globalnav"
    data-active="projects"
    data-user='{"name":"Danny Banks","role":"PUBLIC","hasNotifications":true}'
  ></aside>

  <!-- Main content -->
  <main style="flex:1; padding:24px;">
    <h1>Your Content Here</h1>
  </main>

</div>
```

#### Data Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-component="globalnav"` | string | _(required)_ | Enables auto-initialization |
| `data-active` | string | `"projects"` | ID of the initially active nav item |
| `data-collapsed` | `"true"` or omit | _(expanded)_ | Start in collapsed icon-rail mode (56px) |
| `data-user` | JSON string | `{"name":"Danny Banks","role":"PUBLIC"}` | User profile for the footer |
| `data-sections` | JSON string | _(default Snowflake nav)_ | Custom nav sections array |

#### User Config (data-user JSON)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | string | `"Danny Banks"` | Display name |
| `role` | string | `"PUBLIC"` | Role label |
| `initials` | string | _(derived from name)_ | Avatar initials override |
| `hasNotifications` | boolean | `false` | Show red notification badge |

#### Available Nav Item Icon Keys

| Key | Icon | Key | Icon |
|-----|------|-----|------|
| `projects` | ProjectsIcon | `catalog` | DatabaseIcon |
| `ingestion` | UploadCloudIcon | `data-sharing` | DataSharingIcon |
| `transformation` | DataPipelinesIcon | `governance` | ShieldIcon |
| `ai-ml` | AiIcon | `compute` | ComputeIcon |
| `monitoring` | ActivityIcon | `postgres` | PostgresIcon |
| `marketplace` | MarketplaceIcon | `admin` | ToolIcon |

#### Custom Sections

```html
<aside
  data-component="globalnav"
  data-active="my-item"
  data-sections='[
    {
      "title": "My Section",
      "items": [
        { "id": "my-item", "label": "Custom Item", "icon": "projects" },
        { "id": "other", "label": "Another", "icon": "ai-ml" }
      ]
    }
  ]'
></aside>
```

#### JS Events

```js
// Listen for active item changes
document.querySelector('[data-component="globalnav"]')
  .addEventListener('globalnav-change', (e) => {
    console.log('Active:', e.detail.activeItem);
  });
```

#### Programmatic Control

```js
const el = document.querySelector('[data-component="globalnav"]');
const nav = new StellarGlobalNav(el);
nav.setActive('monitoring');
nav.toggleCollapse();
```

#### States

| State | Behavior |
|-------|----------|
| **Expanded** (default) | 220px wide, logo + wordmark, section titles, labels, user profile with name/role |
| **Collapsed** | 56px wide, icon-only nav items (icon rail), CSS tooltips on hover, avatar initials only |
| **Light theme** | Automatically adapts — all colors use `--themed-*` CSS tokens that respond to `.lightMode`/`.darkMode` on `<html>` |
| **Dark theme** | Default Snowsight appearance — dark background with light text/icons |

#### Starting Collapsed

To render GlobalNav in its collapsed (icon rail) state by default:

```html
<aside data-component="globalnav" data-active="projects" data-collapsed="true"></aside>
```

Or programmatically:
```js
const nav = new StellarGlobalNav(el);
nav.toggleCollapse(); // toggle between expanded ↔ collapsed
```

#### Usage Notes

- **Use for ANY Snowflake sidebar** — whether the screenshot shows a dark expanded sidebar, light collapsed icon rail, or anything in between. GlobalNav handles all these variants.
- **Always wrap in a flex container** — GlobalNav is `position: sticky; height: 100vh`. Place it beside your content in a `display:flex` wrapper.
- **Works with `file://`** — all icons are inlined in the JS, no network requests needed.
- **Light and dark mode** — uses `--themed-*` CSS token variables, automatically adapts to the page theme. Works in both light and dark mode without any configuration.
- **Expanded and collapsed** — supports both 220px expanded sidebar with labels AND 56px collapsed icon rail. Set `data-collapsed="true"` or call `.toggleCollapse()`.
- **Two instances OK** — each `data-component="globalnav"` element gets its own independent state.
- **Replaces `.stellar-page__sidenav`** — for Snowflake-style prototypes, always use GlobalNav instead of the basic sidenav for higher fidelity.

#### All CSS Classes

```
.stellar-globalnav                          /* Root sidebar (220px, sticky) */
.stellar-globalnav--collapsed               /* Collapsed state (56px) */
.stellar-globalnav__header                  /* Logo + collapse button row */
.stellar-globalnav__logo                    /* Snowflake logo container */
.stellar-globalnav__logo-wordmark           /* "snowflake" text (hidden when collapsed) */
.stellar-globalnav__icon-btn               /* Small icon button (collapse toggle) */
.stellar-globalnav__actions                /* Quick action buttons row (Home/+/Search) */
.stellar-globalnav__actions--collapsed     /* Vertical stacked actions */
.stellar-globalnav__action-btn             /* Individual action button */
.stellar-globalnav__divider                /* Horizontal separator */
.stellar-globalnav__divider--compact       /* Tighter divider (collapsed sections) */
.stellar-globalnav__nav                    /* Scrollable nav area */
.stellar-globalnav__section                /* Nav section group */
.stellar-globalnav__section-title          /* Section heading (e.g. "Work with data") */
.stellar-globalnav__nav-list               /* <ul> for nav items */
.stellar-globalnav__nav-item               /* Nav item button */
.stellar-globalnav__nav-item--active       /* Active/selected state (blue) */
.stellar-globalnav__nav-item--collapsed    /* Icon-only collapsed item */
.stellar-globalnav__nav-icon               /* Icon container in nav item */
.stellar-globalnav__nav-label              /* Text label in nav item */
.stellar-globalnav__tooltip-wrap           /* Tooltip wrapper (collapsed mode) */
.stellar-globalnav__footer                 /* User profile area */
.stellar-globalnav__footer--collapsed      /* Collapsed footer (avatar + bell only) */
.stellar-globalnav__profile                /* Profile row */
.stellar-globalnav__profile-left           /* Avatar + user info */
.stellar-globalnav__avatar                 /* Circular avatar with initials */
.stellar-globalnav__user-info              /* Name + role column */
.stellar-globalnav__user-name              /* User name text */
.stellar-globalnav__user-role              /* Role text */
.stellar-globalnav__profile-right          /* Divider + notification bell */
.stellar-globalnav__profile-divider        /* Vertical divider in profile */
.stellar-globalnav__notification-btn       /* Bell icon button */
.stellar-globalnav__notification-badge     /* Red dot badge */
```

---

### 11. Divider

Horizontal or vertical separator line.

**CSS file**: `components/layout/layout.css`
**JS**: None (static element)

#### HTML

```html
<!-- Horizontal divider (default) -->
<hr class="stellar-divider">

<!-- Vertical divider (use inside a flex row) -->
<hr class="stellar-divider stellar-divider--vertical">
```

#### All CSS Classes

```
.stellar-divider              /* Horizontal line (default) */
.stellar-divider--vertical    /* Vertical line (use in flex row) */
```

---

### 12. Flex

Flexbox utility container with direction, alignment, gap, and wrap modifiers.

**CSS file**: `components/layout/layout.css`
**JS**: None (static element)

#### Direction

| Class | Direction |
|-------|-----------|
| _(default)_ | `row` |
| `stellar-flex--column` | `column` |
| `stellar-flex--row-reverse` | `row-reverse` |
| `stellar-flex--column-reverse` | `column-reverse` |

#### Alignment

| Class | Effect |
|-------|--------|
| `stellar-flex--align-start` | `align-items: flex-start` |
| `stellar-flex--align-center` | `align-items: center` |
| `stellar-flex--align-end` | `align-items: flex-end` |
| `stellar-flex--align-baseline` | `align-items: baseline` |
| `stellar-flex--align-stretch` | `align-items: stretch` |

#### Justification

| Class | Effect |
|-------|--------|
| `stellar-flex--justify-start` | `justify-content: flex-start` |
| `stellar-flex--justify-center` | `justify-content: center` |
| `stellar-flex--justify-end` | `justify-content: flex-end` |
| `stellar-flex--justify-between` | `justify-content: space-between` |

#### Gap

| Class | Size | Stellar Multiplier |
|-------|------|----|
| `stellar-flex--gap-0` | 0px | 0x |
| `stellar-flex--gap-3xs` | 2px | 0.25x |
| `stellar-flex--gap-2xs` | 4px | 0.5x |
| `stellar-flex--gap-xs` | 6px | 0.75x (default) |
| `stellar-flex--gap-sm` | 8px | 1x |
| `stellar-flex--gap-md` | 12px | 1.5x |
| `stellar-flex--gap-lg` | 16px | 2x |
| `stellar-flex--gap-xl` | 20px | 2.5x |
| `stellar-flex--gap-2xl` | 24px | 3x |
| `stellar-flex--gap-3xl` | 32px | 4x |
| `stellar-flex--gap-4xl` | 40px | 5x |

#### HTML

```html
<!-- Row with 8px gap, vertically centered -->
<div class="stellar-flex stellar-flex--gap-sm stellar-flex--align-center">
  <span>Left</span>
  <span>Right</span>
</div>

<!-- Column layout with 16px gap -->
<div class="stellar-flex stellar-flex--column stellar-flex--gap-lg">
  <div>Top</div>
  <div>Bottom</div>
</div>

<!-- Toolbar: title left, buttons right -->
<div class="stellar-flex stellar-flex--align-center stellar-flex--justify-between">
  <h2 class="stellar-heading stellar-type-sub-header">Title</h2>
  <div class="stellar-flex stellar-flex--gap-sm">
    <button class="stellar-button stellar-button--secondary">Cancel</button>
    <button class="stellar-button stellar-button--primary">Save</button>
  </div>
</div>

<!-- Wrapping tags -->
<div class="stellar-flex stellar-flex--wrap stellar-flex--gap-md">
  <span>Tag 1</span>
  <span>Tag 2</span>
  <span>Tag 3</span>
</div>
```

#### Usage Notes

- **Default gap** is 6px (xs). Add a gap modifier to change it.
- **Flex is `display: flex`** (block-level). Use `stellar-flex--inline` for inline-flex.
- Combine multiple modifiers: `stellar-flex stellar-flex--column stellar-flex--gap-lg stellar-flex--align-center`
- Use `stellar-flex--grow` to make the flex container fill its parent.

#### All CSS Classes

```
.stellar-flex                     /* Base flex row (required) */
.stellar-flex--inline             /* inline-flex */
.stellar-flex--column             /* Column direction */
.stellar-flex--row-reverse        /* Reverse row */
.stellar-flex--column-reverse     /* Reverse column */
.stellar-flex--align-start        /* Cross-axis start */
.stellar-flex--align-center       /* Cross-axis center */
.stellar-flex--align-end          /* Cross-axis end */
.stellar-flex--align-baseline     /* Cross-axis baseline */
.stellar-flex--align-stretch      /* Cross-axis stretch */
.stellar-flex--justify-start      /* Main-axis start */
.stellar-flex--justify-center     /* Main-axis center */
.stellar-flex--justify-end        /* Main-axis end */
.stellar-flex--justify-between    /* Main-axis space-between */
.stellar-flex--wrap               /* Enable wrapping */
.stellar-flex--wrap-reverse       /* Wrap reverse */
.stellar-flex--nowrap             /* Disable wrapping (explicit) */
.stellar-flex--grow               /* flex-grow: 1 */
.stellar-flex--shrink             /* flex-shrink: 1 */
.stellar-flex--no-grow            /* flex-grow: 0 */
.stellar-flex--no-shrink          /* flex-shrink: 0 */
.stellar-flex--gap-0              /* 0px gap */
.stellar-flex--gap-3xs            /* 2px gap */
.stellar-flex--gap-2xs            /* 4px gap */
.stellar-flex--gap-xs             /* 6px gap (default) */
.stellar-flex--gap-sm             /* 8px gap */
.stellar-flex--gap-md             /* 12px gap */
.stellar-flex--gap-lg             /* 16px gap */
.stellar-flex--gap-xl             /* 20px gap */
.stellar-flex--gap-2xl            /* 24px gap */
.stellar-flex--gap-3xl            /* 32px gap */
.stellar-flex--gap-4xl            /* 40px gap */
```

---

### 13. Grid

12-column grid system with item sizing, plus simple N-column presets.

**CSS file**: `components/layout/layout.css`
**JS**: None (static element)

#### HTML

```html
<!-- 12-column grid with items -->
<div class="stellar-grid stellar-grid--no-margin">
  <div class="stellar-grid__item--4">Sidebar</div>
  <div class="stellar-grid__item--8">Main content</div>
</div>

<!-- Simple 3-column card grid -->
<div class="stellar-grid stellar-grid--cols-3 stellar-grid--no-margin">
  <section class="stellar-card">Card 1</section>
  <section class="stellar-card">Card 2</section>
  <section class="stellar-card">Card 3</section>
</div>

<!-- Full-width item spanning all 12 columns -->
<div class="stellar-grid stellar-grid--no-margin">
  <div class="stellar-grid__item--grow">Full width row</div>
  <div class="stellar-grid__item--6">Half</div>
  <div class="stellar-grid__item--6">Half</div>
</div>
```

#### Usage Notes

- **Default** is a 12-column grid with 16px gap and 24px horizontal margin.
- **Use `--no-margin`** when the grid is inside a container that already provides padding.
- **Grid items** use `stellar-grid__item--N` where N is the number of columns (1-12) to span.
- **Simple columns**: Use `stellar-grid--cols-N` (1-6) for equal-width columns without the 12-col system.

#### All CSS Classes

```
.stellar-grid                    /* 12-column grid (required) */
.stellar-grid--no-margin         /* Remove default 24px margin */
.stellar-grid--grow              /* flex-grow: 1 */
.stellar-grid--gap-0             /* 0px gap */
.stellar-grid--gap-sm            /* 8px gap */
.stellar-grid--gap-md            /* 12px gap */
.stellar-grid--gap-lg            /* 16px gap (default) */
.stellar-grid--gap-xl            /* 20px gap */
.stellar-grid--gap-2xl           /* 24px gap */
.stellar-grid--gap-3xl           /* 32px gap */
.stellar-grid--cols-1            /* 1 equal column */
.stellar-grid--cols-2            /* 2 equal columns */
.stellar-grid--cols-3            /* 3 equal columns */
.stellar-grid--cols-4            /* 4 equal columns */
.stellar-grid--cols-5            /* 5 equal columns */
.stellar-grid--cols-6            /* 6 equal columns */
.stellar-grid__item--1 to --12   /* Span N of 12 columns */
.stellar-grid__item--grow        /* Span all columns (full width) */
.stellar-grid__item--auto        /* Auto-size */
```

---

### 14. Page

Full-page shell with sidebar, navigation bar, and scrollable content. The standard structure for Snowsight-style pages.

**CSS file**: `components/layout/layout.css`
**JS**: None (static element)

#### HTML

```html
<div class="stellar-page">
  <div class="stellar-page__body">
    <!-- Sidebar (optional) -->
    <nav class="stellar-page__sidenav" aria-label="Navigation">
      <div style="padding:var(--stellar-space-vertical-sm) var(--stellar-space-horizontal-md); margin-bottom:var(--stellar-space-gap-lg);">
        <span class="stellar-type-sub-header" style="color:inherit;">Snowsight</span>
      </div>
      <a href="#" class="stellar-sidenav-item stellar-sidenav-item--active">
        <svg class="stellar-sidenav-item__icon" ...>...</svg>
        Dashboards
      </a>
      <a href="#" class="stellar-sidenav-item">
        <svg class="stellar-sidenav-item__icon" ...>...</svg>
        Worksheets
      </a>
    </nav>

    <!-- Content -->
    <div class="stellar-page__content">
      <header class="stellar-page__content-header">
        <h1 class="stellar-heading stellar-type-page-header" style="margin:0;">Page Title</h1>
        <div class="stellar-flex stellar-flex--gap-sm">
          <button class="stellar-button stellar-button--primary">Action</button>
        </div>
      </header>
      <div class="stellar-page__content-body">
        <!-- Page content here -->
      </div>
    </div>
  </div>
</div>
```

#### Customizable CSS Variables

The sidebar colors are controlled by CSS custom properties, making it easy to override per-prototype:

| Variable | Default | Use For |
|----------|---------|---------|
| `--stellar-sidebar-bg` | `var(--base-color-gray-85)` (#1e252f) | Sidebar background color |
| `--stellar-sidebar-text` | `var(--base-color-white)` (#ffffff) | Sidebar text color |
| `--stellar-sidebar-width` | `240px` | Sidebar width |

```html
<!-- Dark sidebar (default — Snowsight style) -->
<div class="stellar-page">...</div>

<!-- Light sidebar -->
<div class="stellar-page" style="
  --stellar-sidebar-bg: var(--themed-surface-level-2-background);
  --stellar-sidebar-text: var(--themed-reusable-text-primary);
">...</div>

<!-- Blue sidebar -->
<div class="stellar-page" style="
  --stellar-sidebar-bg: var(--base-color-blue-70);
  --stellar-sidebar-text: var(--base-color-white);
">...</div>

<!-- No sidebar (page without sidebar) -->
<div class="stellar-page">
  <div class="stellar-page__body">
    <div class="stellar-page__content">
      <header class="stellar-page__content-header">...</header>
      <div class="stellar-page__content-body">...</div>
    </div>
  </div>
</div>
```

#### Page Variants

| Class | Effect |
|-------|--------|
| _(default)_ | Full-width content |
| `stellar-page--centered` | Content max-width 1200px, centered |
| `stellar-page--full` | Explicitly full-width (no max-width) |

#### Usage Notes

- **Height**: `.stellar-page` uses `height: 100vh` to fill the browser window.
- **Scrolling**: `.stellar-page__content` has `overflow-y: auto` — the content area scrolls, not the page.
- **No sidebar**: Just omit the `.stellar-page__sidenav` element. The content fills the full width.
- **Sidebar position**: Add `stellar-page__sidenav--after` to place the sidebar on the right side.
- **NEVER set fixed widths** on content areas. Use the layout structure and let flex handle sizing.

#### All CSS Classes

```
.stellar-page                    /* Root (100vh flex column) */
.stellar-page--centered          /* Center content, max-width 1200px */
.stellar-page--full              /* Full-width content */
.stellar-page__body              /* Flex row holding sidebar + content */
.stellar-page__nav-bar           /* Top navigation bar */
.stellar-page__nav-bar--bottom   /* Bottom navigation bar */
.stellar-page__nav-bar--sticky   /* Sticky nav bar */
.stellar-page__sidenav           /* Side navigation panel */
.stellar-page__sidenav--after    /* Sidebar on right side */
.stellar-page__content           /* Main content column */
.stellar-page__content-header    /* Toolbar row (title + actions) */
.stellar-page__content-body      /* Scrollable content area */
.stellar-sidenav-item            /* Navigation item in sidebar */
.stellar-sidenav-item--active    /* Active/selected nav item */
.stellar-sidenav-item__icon      /* 16x16 icon in nav item */
```

---

### 15. Layout

Generic layout shell (no page-level assumptions). Useful for nested sections within a page.

**CSS file**: `components/layout/layout.css`
**JS**: None (static element)

#### HTML

```html
<div class="stellar-layout stellar-layout--with-sidebar">
  <aside class="stellar-layout__sidebar">Sidebar</aside>
  <div class="stellar-layout__content stellar-layout__content--scrollable">
    <header class="stellar-layout__header stellar-layout__header--sticky">Header</header>
    <div>Main content</div>
    <footer class="stellar-layout__footer">Footer</footer>
  </div>
</div>
```

#### All CSS Classes

```
.stellar-layout                       /* Root flex column */
.stellar-layout--with-sidebar         /* Flex row (for sidebar layout) */
.stellar-layout--scrollable           /* Root is scrollable */
.stellar-layout__header               /* Header area */
.stellar-layout__header--sticky       /* Sticky header */
.stellar-layout__sidebar              /* Sidebar panel */
.stellar-layout__content              /* Main content area */
.stellar-layout__content--scrollable  /* Scrollable content */
.stellar-layout__footer               /* Footer area */
.stellar-layout__footer--sticky       /* Sticky footer */
```

---

### 16. Padding Utilities

Quick padding presets using design tokens.

```html
<div class="stellar-padding-sm">8px padding</div>
<div class="stellar-padding-md">12px padding</div>
<div class="stellar-padding-lg">16px padding</div>
<div class="stellar-padding-xl">20px padding</div>
<div class="stellar-padding-2xl">24px padding</div>
<div class="stellar-padding-3xl">32px padding</div>
```

---

## Design Tokens (CSS Custom Properties)

All components and prototypes use **CSS custom properties** (design tokens) extracted from Snowflake's Stellar Design System packages. These are automatically included in `stellar.css` — no extra imports needed.

**CRITICAL**: When building prototype layouts, **ALWAYS use token variables** instead of hardcoded colors or spacing values. This ensures consistency with the design system.

### Token Categories

| Prefix | Source | Contents |
|--------|--------|----------|
| `--base-color-*` | `@snowflake/balto-tokens` | Base color palette (gray, blue, red, green, yellow, violet scales) |
| `--base-dimension-*` | `@snowflake/balto-tokens` | Base dimensions (text sizes, spacing, radius, breakpoints) |
| `--themed-*` | `@snowflake/balto-tokens` | Semantic themed colors (surfaces, text, borders, status, interactions) |
| `--stellar-space-*` | `@snowflake/stellar-tokens` | Semantic spacing (gap, horizontal padding, vertical padding) |
| `--stellar-size-*` | `@snowflake/stellar-tokens` | Component dimension scale |
| `--stellar-radius-*` | `@snowflake/stellar-tokens` | Border radius scale |

### Color Tokens — Quick Reference

Use `var(--themed-*)` for all colors. The most important ones:

#### Text Colors

| Token | Light Value | Use For |
|-------|-------------|---------|
| `var(--themed-reusable-text-primary)` | `#1e252f` | Body text, headings |
| `var(--themed-reusable-text-secondary)` | `#5d6a85` | Captions, labels, placeholders |
| `var(--themed-reusable-text-header)` | `#1e252f` | Page/section titles |
| `var(--themed-reusable-disabled-text)` | `#9fabc1` | Disabled elements |

#### Background Colors

| Token | Light Value | Use For |
|-------|-------------|---------|
| `var(--themed-surface-level-1-background)` | `#ffffff` | Page background |
| `var(--themed-surface-level-2-background)` | `#fbfbfb` | Cards, inputs, elevated surfaces |
| `var(--themed-surface-level-3-background)` | `#fbfbfb` | Dialogs, popovers, temporary surfaces |
| `var(--themed-reusable-background-row-hover)` | `#eceef1` | Table/list row hover |
| `var(--themed-reusable-background-additional-info)` | `#f7f7f7` | Inset backgrounds, code blocks |

#### Border Colors

| Token | Light Value | Use For |
|-------|-------------|---------|
| `var(--themed-reusable-border-default)` | `#d5dae4` | Standard borders, dividers |
| `var(--themed-reusable-border-bright)` | `#bdc4d5` | Higher-contrast borders |
| `var(--themed-reusable-border-hover)` | `#9fabc1` | Border hover states |
| `var(--themed-reusable-border-disabled)` | `#dee3ea` | Disabled borders |
| `var(--themed-reusable-border-active)` | `#1a6ce7` | Active/selected borders |

#### Interactive Colors (Buttons, Links)

| Token | Light Value | Use For |
|-------|-------------|---------|
| `var(--themed-interaction-pressable-default-background)` | `#1a6ce7` | Primary button bg |
| `var(--themed-interaction-pressable-hovered-background)` | `#085bd7` | Primary hover |
| `var(--themed-interaction-pressable-pressed-background)` | `#003e9a` | Primary pressed |
| `var(--themed-interaction-pressable-disabled-background)` | `#bbd6fe` | Primary disabled bg |
| `var(--themed-interaction-pressable-default-content)` | `#ffffff` | White text on primary |
| `var(--themed-reusable-selected-text)` | `#085bd7` | Selected item text |
| `var(--themed-reusable-selected-background)` | `#d6e6ff` | Selected item bg |

#### Status Colors

| Status | Background | Text | UI Element |
|--------|-----------|------|------------|
| Critical | `var(--themed-status-critical-background)` | `var(--themed-status-critical-text)` | `var(--themed-status-critical-ui)` |
| Caution | `var(--themed-status-caution-background)` | `var(--themed-status-caution-text)` | `var(--themed-status-caution-ui)` |
| Success | `var(--themed-status-success-background)` | `var(--themed-status-success-text)` | `var(--themed-status-success-ui)` |
| Info | `var(--themed-status-info-background)` | `var(--themed-status-info-text)` | `var(--themed-status-info-ui)` |
| Neutral | `var(--themed-status-neutral-background)` | `var(--themed-status-neutral-text)` | `var(--themed-status-neutral-ui)` |

#### Elevation (Shadows)

| Token | Use For |
|-------|---------|
| `var(--themed-elevation-1-box-shadow)` | Subtle elevation (cards) |
| `var(--themed-elevation-2-box-shadow)` | Medium elevation (hover cards, dropdowns) |
| `var(--themed-elevation-3-box-shadow)` | High elevation (dialogs, menus) |

#### Chart Colors

8-color palette: `var(--themed-chart-1)` through `var(--themed-chart-8)`, plus dim variants `var(--themed-chart-dim-1)` through `var(--themed-chart-dim-8)`.

### Spacing Tokens — Quick Reference

Use `var(--stellar-space-*)` for all padding and gaps:

| Token | Value | Use For |
|-------|-------|---------|
| `var(--stellar-space-gap-2xs)` | 4px | Icon + text, tight groups |
| `var(--stellar-space-gap-xs)` | 6px | Menu spacing |
| `var(--stellar-space-gap-sm)` | 8px | Button groups, label + input |
| `var(--stellar-space-gap-md)` | 12px | Medium section gaps |
| `var(--stellar-space-gap-lg)` | 16px | Content sections |
| `var(--stellar-space-gap-xl)` | 20px | Larger sections |
| `var(--stellar-space-gap-2xl)` | 24px | Between form elements |
| `var(--stellar-space-gap-3xl)` | 32px | Page sections |
| `var(--stellar-space-gap-4xl)` | 40px | Major divisions |

Horizontal (`--stellar-space-horizontal-*`) and vertical (`--stellar-space-vertical-*`) follow the same scale (3xs=2px through 4xl=40px).

### Size Tokens

| Token | Value | Use For |
|-------|-------|---------|
| `var(--stellar-size-sm)` | 24px | Small buttons, small inputs |
| `var(--stellar-size-md)` | 32px | Regular buttons, inputs |
| `var(--stellar-size-lg)` | 40px | Tab bar height, large controls |
| `var(--stellar-size-xl)` | 48px | Extra large elements |

### Radius Tokens

| Token | Value | Use For |
|-------|-------|---------|
| `var(--stellar-radius-xs)` | 4px | Subtle rounding |
| `var(--stellar-radius-sm)` | 6px | Buttons, inputs |
| `var(--stellar-radius-md)` | 8px | Cards, segmented buttons |
| `var(--stellar-radius-lg)` | 12px | Large cards |
| `var(--stellar-radius-circle)` | 9999px | Pills, badges |

### Base Color Palette (for custom elements)

When you need specific colors outside the semantic tokens, use `var(--base-color-*)`:

| Scale | Range | Example |
|-------|-------|---------|
| Gray | `--base-color-gray-00` to `--base-color-gray-95` | `var(--base-color-gray-30)` = `#d5dae4` |
| Blue | `--base-color-blue-00` to `--base-color-blue-90` | `var(--base-color-blue-50)` = `#1a6ce7` |
| Red | `--base-color-red-00` to `--base-color-red-90` | `var(--base-color-red-50)` = `#d3132f` |
| Green | `--base-color-green-00` to `--base-color-green-90` | `var(--base-color-green-70)` = `#0e9c73` |
| Yellow | `--base-color-yellow-00` to `--base-color-yellow-90` | `var(--base-color-yellow-50)` = `#ecb700` |
| Violet | `--base-color-violet-00` to `--base-color-violet-90` | `var(--base-color-violet-50)` = `#7157f4` |

### Typography Tokens

| Token | Value |
|-------|-------|
| `var(--themed-font-family-body)` | Inter, Roboto, ... sans-serif |
| `var(--themed-font-family-mono)` | "Apercu Mono Pro", ui-monospace, Menlo, ... monospace |
| `var(--themed-font-size-small)` | 12px |
| `var(--themed-font-size-regular)` | 14px |
| `var(--themed-font-size-large)` | 16px |
| `var(--themed-font-size-xlarge)` | 20px |
| `var(--themed-font-size-xxlarge)` | 28px |
| `var(--themed-font-size-xxxlarge)` | 40px |
| `var(--themed-font-weight-regular)` | 400 |
| `var(--themed-font-weight-medium)` | 500 |
| `var(--themed-font-weight-semi-bold)` | 600 |
| `var(--themed-font-weight-bold)` | 700 |

### Regenerating Tokens

If the Stellar design system packages are updated, regenerate the tokens:

```bash
node tokens/extract-tokens.mjs
node build.mjs
```

---

## Icons

The boilerplate includes **437 Stellar icons**, **104 pictograms**, and **26 illustrations** as standalone SVG files. See `icons/ICON-INDEX.md` for the full searchable list.

**Usage:** Search `icons/ICON-INDEX.md` by keyword, read the SVG file, and paste it inline.

| Type | Size | Path |
|------|------|------|
| Icons | 16x16 | `./icons/svg/[Name].svg` |
| Medium icons | 20x20 | `./icons/svg/[Name]-medium.svg` |
| Pictograms | 48x48 | `./icons/pictograms/[Name].svg` |
| Illustrations | 142x126 | `./icons/illustrations/[Name].svg` |

All icon SVGs use `fill="currentColor"` so they inherit the parent element's text color.

### Common Icons (inline quick-reference)

These are the most frequently used icons, inlined here for convenience. For any other icon, search `icons/ICON-INDEX.md`.

### Plus (Create / Add)
```html
<svg viewBox="0 0 16 16" aria-hidden="true" fill="none"><path fill="currentColor" d="M8 7h6.005v1H8v6H7V8H1.005V7H7V1h1z"/></svg>
```

### Search
```html
<svg viewBox="0 0 16 16" aria-hidden="true" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M7 2a5 5 0 0 1 3.871 8.164l3.983 3.983-.707.707-3.983-3.983A5 5 0 1 1 7 2m0 1a4 4 0 1 0 0 8 4 4 0 0 0 0-8" clip-rule="evenodd"/></svg>
```

### Settings (Gear)
```html
<svg viewBox="0 0 16 16" aria-hidden="true" fill="none"><g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"><path d="M8.393 5.264a2.625 2.625 0 0 1 2.356 2.611l-.014.268a2.624 2.624 0 0 1-2.61 2.356l-.269-.014a2.625 2.625 0 0 1-2.342-2.342L5.5 7.875A2.625 2.625 0 0 1 8.125 5.25zm-.268.986a1.625 1.625 0 1 0 0 3.25 1.625 1.625 0 0 0 0-3.25"/><path d="M8.89 1c.437 0 .824.285.955.702l.482 1.546q.402.19.763.441l1.583-.354c.426-.095.866.097 1.085.476l.796 1.378c.218.38.165.857-.131 1.178l-1.1 1.193q.019.216.02.439-.001.222-.02.44l1.1 1.194c.296.322.348.799.13 1.178l-.796 1.377a1 1 0 0 1-1.085.477l-1.582-.356q-.36.251-.763.441l-.482 1.547c-.13.417-.518.702-.955.702H7.298a1 1 0 0 1-.954-.702l-.485-1.547a5 5 0 0 1-.761-.441l-1.582.355a1 1 0 0 1-1.086-.476l-.795-1.378a1 1 0 0 1 .13-1.177l1.1-1.195A5 5 0 0 1 2.844 8q0-.222.02-.438l-1.1-1.194a1 1 0 0 1-.131-1.178l.796-1.377a1 1 0 0 1 1.085-.477l1.583.354q.36-.251.761-.44l.485-1.547A1 1 0 0 1 7.298 1zM7.298 2.001l-.615 1.965-.397.186a4 4 0 0 0-.617.358l-.36.252-.43-.097-1.583-.354L2.5 5.689l1.397 1.517-.036.437a4 4 0 0 0-.016.356q0 .171.016.356l.036.438L2.5 10.311l.796 1.377 2.013-.452.36.252q.22.153.457.278l.16.08.397.186.615 1.966 1.593.001.613-1.967.397-.186a4 4 0 0 0 .617-.358l.362-.252 2.01.452.797-1.378-1.397-1.516.037-.438q.016-.191.017-.357 0-.165-.017-.356l-.037-.439.298-.322 1.1-1.193-.796-1.378-1.583.354-.43.097-.36-.252a4 4 0 0 0-.618-.358l-.397-.186L8.89 2z"/></g></svg>
```

### Delete (Trash)
```html
<svg viewBox="0 0 16 16" aria-hidden="true" fill="none"><g fill="currentColor"><path d="M7 11H6V7h1zm3 0H9V7h1z"/><path fill-rule="evenodd" d="M9.5 2A1.5 1.5 0 0 1 11 3.5V4h3v1h-1.027l-.421 7.583A1.5 1.5 0 0 1 11.054 14H4.946a1.5 1.5 0 0 1-1.498-1.417L3.028 5H2V4h3v-.5A1.5 1.5 0 0 1 6.5 2zM4.446 12.527a.5.5 0 0 0 .5.473h6.108a.5.5 0 0 0 .5-.473L11.972 5H4.028zM6.5 3a.5.5 0 0 0-.5.5V4h4v-.5a.5.5 0 0 0-.5-.5z" clip-rule="evenodd"/></g></svg>
```

### Edit (Pencil)
```html
<svg viewBox="0 0 16 16" aria-hidden="true" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M9.916 2.378a1.5 1.5 0 0 1 2.156.038l1.634 1.749a1.5 1.5 0 0 1-.035 2.084l-6.595 6.594a1.5 1.5 0 0 1-.796.416l-3.523.633a.502.502 0 0 1-.578-.596l.771-3.61a1.5 1.5 0 0 1 .407-.748zM4.064 9.645a.5.5 0 0 0-.136.25l-.615 2.88 2.79-.5a.5.5 0 0 0 .266-.139l4.636-4.635-2.398-2.399zm7.278-6.547a.5.5 0 0 0-.719-.013l-1.31 1.31 2.4 2.399 1.251-1.252a.5.5 0 0 0 .012-.695z" clip-rule="evenodd"/></svg>
```

### Copy
```html
<svg viewBox="0 0 16 16" aria-hidden="true" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M10.5 2A1.5 1.5 0 0 1 12 3.5V5h.5A1.5 1.5 0 0 1 14 6.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 5 12.5V12H3.5A1.5 1.5 0 0 1 2 10.5v-7A1.5 1.5 0 0 1 3.5 2zm-4 4a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-.5-.5zm-3-3a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5H5V6.5A1.5 1.5 0 0 1 6.5 5H11V3.5a.5.5 0 0 0-.5-.5z" clip-rule="evenodd"/></svg>
```

### Chevron Down (Dropdown arrow)
```html
<svg viewBox="0 0 16 16" aria-hidden="true" fill="none"><path fill="currentColor" d="m8 10.5-4-5h8z"/></svg>
```

### Error Circle (Validation)
```html
<svg viewBox="0 0 16 16" aria-hidden="true" fill="none"><path fill="rgb(211, 19, 47)" fill-rule="evenodd" d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1m0 6.293L5.354 4.646l-.708.708L7.293 8l-2.647 2.646.708.707L8 8.708l2.646 2.646.707-.707L8.708 8l2.646-2.646-.707-.708z" clip-rule="evenodd"/></svg>
```

---

## Building `dist/stellar.css` and `dist/stellar.js`

Run the build script to concatenate all component files into single distributable files:

```bash
node build.mjs
```

This produces:
- `dist/stellar.css` — design tokens + all component CSS combined
- `dist/stellar.js` — all component JS combined
- `dist/template.html` — starter HTML page with all assets linked

To regenerate tokens from the latest Stellar packages:

```bash
node tokens/extract-tokens.mjs   # re-extract tokens
node build.mjs                    # rebuild dist
```

### Color Extraction from Screenshots

The `scripts/extract-colors.mjs` script analyzes a screenshot PNG to detect page regions (sidebar, header, body, footer) and map each region's background color to the closest Stellar design token.

```bash
# Install (first time only)
cd scripts && npm install && cd ..

# Extract colors from a screenshot
node scripts/extract-colors.mjs screenshot.png

# Save JSON output to a file
node scripts/extract-colors.mjs screenshot.png -o color-map.json
```

**Output includes:**
- Detected regions with pixel bounds
- Sampled hex color for each region
- Closest matching Stellar design token (with distance score)
- Ready-to-use CSS variable overrides for sidebar customization

**Example output:**
```
 SIDEBAR    #1e252f   → --base-color-gray-85  (✓ exact)
 HEADER     #ffffff   → --themed-surface-level-1-background  (✓ exact)
 BODY       #fbfbfb   → --themed-surface-level-2-background  (✓ exact)

 Sidebar style override:
   style="--stellar-sidebar-bg: var(--base-color-gray-85); --stellar-sidebar-text: var(--base-color-white)"
```

**For AI agents**: When building a prototype from a screenshot, run this script first. Use the output tokens for `background` CSS properties instead of hardcoding hex values. Apply the sidebar style override to the `.stellar-page` element.

---

## Prototype Page Layout Patterns

**IMPORTANT**: Use layout components (`.stellar-page`, `.stellar-flex`, `.stellar-grid`) instead of inline flex/grid styles. Use token variables for any remaining inline styles.

### Snowsight-style page with GlobalNav (preferred)

Use GlobalNav for any Snowflake/Snowsight UI. It includes the Snowflake logo, all nav icons, user profile, and expand/collapse.

```html
<div style="display:flex; min-height:100vh;">
  <!-- GlobalNav auto-initializes, handles its own dark background -->
  <aside data-component="globalnav" data-active="projects"
    data-user='{"name":"Danny Banks","role":"PUBLIC","hasNotifications":true}'></aside>

  <!-- Content area -->
  <div style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
    <header class="stellar-page__content-header">
      <h1 class="stellar-heading stellar-type-page-header" style="margin:0;">Page Title</h1>
      <div class="stellar-flex stellar-flex--gap-sm">
        <button class="stellar-button stellar-button--primary">Action</button>
      </div>
    </header>
    <div class="stellar-page__content-body" style="flex:1; overflow-y:auto;">
      <!-- Content here -->
    </div>
  </div>
</div>
```

### Simple sidebar page (without GlobalNav)

```html
<div class="stellar-page">
  <div class="stellar-page__body">
    <nav class="stellar-page__sidenav" aria-label="Navigation">
      <div style="padding:var(--stellar-space-vertical-sm) var(--stellar-space-horizontal-md); margin-bottom:var(--stellar-space-gap-lg);">
        <span class="stellar-type-sub-header" style="color:inherit;">Snowsight</span>
      </div>
      <a href="#" class="stellar-sidenav-item stellar-sidenav-item--active">Dashboards</a>
      <a href="#" class="stellar-sidenav-item">Worksheets</a>
    </nav>
    <div class="stellar-page__content">
      <header class="stellar-page__content-header">
        <h1 class="stellar-heading stellar-type-page-header" style="margin:0;">Page Title</h1>
        <div class="stellar-flex stellar-flex--gap-sm">
          <button class="stellar-button stellar-button--primary">Action</button>
        </div>
      </header>
      <div class="stellar-page__content-body">
        <!-- Content here -->
      </div>
    </div>
  </div>
</div>
```

### Custom sidebar colors (override defaults)

```html
<!-- Light sidebar -->
<div class="stellar-page" style="--stellar-sidebar-bg: var(--themed-surface-level-2-background); --stellar-sidebar-text: var(--themed-reusable-text-primary);">
  ...
</div>

<!-- Blue sidebar -->
<div class="stellar-page" style="--stellar-sidebar-bg: var(--base-color-blue-70); --stellar-sidebar-text: var(--base-color-white);">
  ...
</div>
```

### Toolbar with actions

```html
<div class="stellar-flex stellar-flex--align-center stellar-flex--justify-between" style="padding:var(--stellar-space-vertical-md) var(--stellar-space-horizontal-lg); border-bottom:1px solid var(--themed-reusable-border-default);">
  <h2 class="stellar-heading stellar-type-sub-header">Section Title</h2>
  <div class="stellar-flex stellar-flex--gap-sm">
    <button class="stellar-button stellar-button--tertiary">Filter</button>
    <button class="stellar-button stellar-button--primary">
      <svg class="stellar-button__icon" viewBox="0 0 16 16" aria-hidden="true" fill="none">
        <path fill="currentColor" d="M8 7h6.005v1H8v6H7V8H1.005V7H7V1h1z"/>
      </svg>
      Create
    </button>
  </div>
</div>
```

### Form layout

```html
<div class="stellar-flex stellar-flex--column stellar-flex--gap-2xl" style="max-width:600px;">
  <div class="stellar-field">
    <div class="stellar-field__label-area"><label class="stellar-field__label">Name</label></div>
    <div class="stellar-field__control-area">
      <div class="stellar-textinput stellar-textinput--regular stellar-textinput--fullwidth">
        <input class="stellar-textinput__input" type="text" placeholder="Enter name">
      </div>
    </div>
  </div>
  <div class="stellar-field">
    <div class="stellar-field__label-area"><label class="stellar-field__label">Email</label></div>
    <div class="stellar-field__control-area">
      <div class="stellar-textinput stellar-textinput--regular stellar-textinput--fullwidth">
        <input class="stellar-textinput__input" type="email" placeholder="Enter email">
      </div>
    </div>
  </div>
  <div class="stellar-flex stellar-flex--gap-sm stellar-flex--justify-end">
    <button class="stellar-button stellar-button--secondary">Cancel</button>
    <button class="stellar-button stellar-button--primary">Save</button>
  </div>
</div>
```

### Status banner

```html
<div class="stellar-flex stellar-flex--align-center stellar-flex--gap-sm stellar-padding-lg" style="background:var(--themed-status-info-background); border-radius:var(--stellar-radius-md);">
  <span class="stellar-span stellar-type-small-paragraph" style="color:var(--themed-status-info-text);">
    This is an informational message.
  </span>
</div>
```

---

## Component Sizing Quick Reference

**CRITICAL**: Never set fixed pixel widths on components. Control sizing through the parent container.

| Component | Default Width Behavior | Fills Container? | Notes |
|-----------|----------------------|------------------|-------|
| **GlobalNav** | `width: 220px` (expanded) / `56px` (collapsed) | **No** | Sticky sidebar, 100vh. Place in flex row with content. |
| **Page** | `height: 100vh` | **Yes** | Full viewport. Sidebar + content fill the space. |
| **Flex** | `display: flex` | **Yes** | Block-level. Add `--inline` for inline-flex. |
| **Grid** | 12-col grid + 24px margin | **Yes** | Add `--no-margin` when inside padded containers. |
| **Divider** | border line | **Yes** | Horizontal fills width. Vertical needs flex parent with `align-self: stretch`. |
| **Table** | `width: 100%` | **Yes** | Always fills parent. Use `grid-template-columns` to control column sizes. |
| **Tabs** | `display: flex` | **Yes** | Fills parent width. Bottom border spans full width. |
| **Card** | `flex-grow: 1` | **Yes** | Fills available flex space. Shares space equally with sibling cards. |
| **TextInput** | `inline-flex` (shrink-wrap) | **No** — add `--fullwidth` | Add `stellar-textinput--fullwidth` for `width: 100%`. |
| **Button** | `inline-flex` (shrink-wrap) | **No** | Content-sized. Place in `.stellar-flex` for alignment. |
| **Menu** | `inline-block` trigger | **No** | Trigger is content-sized. Dropdown auto-sizes to items. |
| **SegmentedButton** | `fit-content` | **No** | Content-sized. Place in `.stellar-flex` for alignment. |
| **SplitButton** | `display: flex` (shrink-wrap) | **No** | Content-sized. Place in `.stellar-flex` for alignment. |
| **Text** | block-level | **Yes** | Paragraphs have `max-width: 70em` for readability. |

### Common Mistakes to Avoid

```html
<!-- ❌ WRONG: max-width on main content panel (cuts off content, wastes space) -->
<div style="flex:1; max-width:960px;">...</div>
<main style="max-width:1200px;">...</main>

<!-- ✅ CORRECT: Content panel fills all available space next to the sidebar -->
<div style="flex:1; overflow:hidden;">...</div>

<!-- ❌ WRONG: Fixed pixel width on table -->
<div class="stellar-table" style="width: 800px;">

<!-- ✅ CORRECT: Table fills its container naturally -->
<div style="padding: 16px;">
  <div class="stellar-table">...</div>
</div>

<!-- ❌ WRONG: Input without --fullwidth in a form -->
<div class="stellar-textinput stellar-textinput--regular">

<!-- ✅ CORRECT: Input fills the form field -->
<div class="stellar-textinput stellar-textinput--regular stellar-textinput--fullwidth">

<!-- ❌ WRONG: Fixed width on a card -->
<section class="stellar-card" style="width: 300px;">

<!-- ✅ CORRECT: Cards in a grid -->
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
  <section class="stellar-card">...</section>
  <section class="stellar-card">...</section>
  <section class="stellar-card">...</section>
</div>
```

---

## Preventing Broken Builds

Three issues that **silently break prototypes** and how to avoid them:

### 1. Missing Design Tokens (all spacing/colors collapse to 0)

**Symptom**: Every `var(--stellar-space-*)`, `var(--themed-*)`, and `var(--base-color-*)` resolves to nothing. Padding, margins, gaps, and colors all disappear.

**Cause**: The prototype loads a raw component CSS file (e.g. the root-level `stellar.css`) instead of `dist/stellar.css`. Only the `dist/` build prepends `tokens/stellar-tokens.css` which defines all 600+ CSS custom properties.

**Prevention**:
- **ALWAYS reference `dist/stellar.css`** in HTML files, never root-level or component-level CSS.
- After any change, run `node build.mjs` and verify the `dist/` output includes the `DESIGN TOKENS` section at the top.
- If you see spacing collapse in the browser, the **first thing to check** is whether the HTML `<link>` points to `dist/stellar.css`.

### 2. New Component CSS Not Included in Build

**Symptom**: A component's classes (e.g. `.stellar-card`) have no effect — elements render as unstyled HTML.

**Cause**: The component's CSS file exists in `components/[name]/[name].css`, but it was never added to the `CSS_FILES` array in `build.mjs`. The build script only concatenates explicitly listed files.

**Prevention**:
- **After converting any new component**, immediately add its CSS file to `build.mjs`:
  ```js
  const CSS_FILES = [
    'components/text/text.css',
    'components/button/button.css',
    'components/card/card.css',       // ← Don't forget new components!
    // ...
  ];
  ```
- If the component has JS, also add it to the `JS_FILES` array.
- Run `node build.mjs` and verify the output banner lists the correct component count.

### 3. Hardcoded Pixel Widths from Reference Extraction

**Symptom**: A component (commonly Table) has a fixed pixel width (e.g. `width: 800px`) instead of filling its container.

**Cause**: During reference extraction (Phase 1 of conversion), the Playwright script captures computed styles at a specific viewport width. If the source component had a fixed width in the demo page, that value gets baked into the CSS.

**Prevention**:
- **After converting a component**, review its CSS file for hardcoded pixel values that should be `100%` or `auto`.
- Key properties to audit: `width`, `height`, `max-width`, `min-width` on root-level selectors.
- The table component should always have `width: 100%`, never a fixed pixel value.
- Run `node build.mjs` after any fix so the `dist/` output reflects the change.

### Verification Checklist (run after any component conversion or build change)

```bash
# 1. Rebuild
node build.mjs

# 2. Verify tokens are included
head -30 dist/stellar.css  # Should show "DESIGN TOKENS" section

# 3. Verify component count matches components/ directory
ls components/  # Count the folders
# build.mjs output should list the same count

# 4. Verify no hardcoded widths on root selectors
grep -n 'width: [0-9]*px' dist/stellar.css  # Review any matches
```

---

## AI Agent Decision Tree

When asked to build any UI, follow this decision process:

```
Need a page shell?    → Use .stellar-page with .stellar-page__body, __sidenav, __content, __content-header, __content-body
Need a Snowflake sidebar? → Use GlobalNav: <aside data-component="globalnav" data-active="projects"></aside> (full Snowsight nav)
Need a basic sidebar? → Use .stellar-page__sidenav (simple, colors via --stellar-sidebar-bg, --stellar-sidebar-text)
Need a flex row/col?  → Use .stellar-flex with direction/gap/align/justify modifiers
Need a grid?          → Use .stellar-grid with __item--N (12-col) or --cols-N (simple)
Need a divider?       → Use .stellar-divider (or .stellar-divider--vertical)
Need a toolbar?       → Use .stellar-flex--align-center + .stellar-flex--justify-between
Need a button?        → Use .stellar-button (NEVER create a custom <button> style)
Need a dropdown?      → Use .stellar-menu-trigger + .stellar-menu
Need tabs?            → Use .stellar-tabs with role="tablist"
Need a data table?    → Use .stellar-table with CSS Grid (fills 100% width — NEVER set fixed width)
Need a text input?    → Use .stellar-textinput (add --fullwidth for forms)
Need a form field?    → Use .stellar-field wrapping a .stellar-textinput--fullwidth
Need typography?      → Use .stellar-type-* classes
Need a toggle group?  → Use .stellar-segmentedbutton
Need button+dropdown? → Use .stellar-splitbutton
Need a card?          → Use .stellar-card (fills flex space — NEVER set fixed width)
Need text color?      → Use .stellar-text--* color modifiers
Need an icon?         → Search icons/ICON-INDEX.md, read from ./icons/svg/[Name].svg (NEVER fabricate SVG paths)
Need something else?  → Build with plain HTML + inline styles using var(--themed-*) and var(--stellar-*) tokens
```

### Layout Rules

1. **Use layout components for page structure** — `.stellar-page`, `.stellar-flex`, `.stellar-grid` instead of inline `display:flex`/`display:grid`.
2. **Sidebar colors are customizable** — override `--stellar-sidebar-bg` and `--stellar-sidebar-text` instead of hardcoding colors.
3. **When building from a screenshot**, run `node scripts/extract-colors.mjs <screenshot.png>` first to detect regions and extract color tokens. Use the output tokens directly instead of eyeballing colors.
4. **NEVER set fixed pixel widths** on Table, Card, Tabs, or TextInput. These components are designed to fill their containers.
5. **NEVER set `max-width` on the main content panel.** The content area next to a sidebar should always use `flex:1` to fill all available space. Do NOT add `max-width: 960px`, `max-width: 1200px`, or any other `max-width` to the main content container — this wastes screen space and doesn't match Snowsight.
6. **Control sizing through parent containers** — use `.stellar-flex`, `.stellar-grid`, or constrain individual sections (not the whole content panel).
7. **Buttons and menus are content-sized** — they shrink-wrap their text. This is correct. Place them in `.stellar-flex` rows for alignment.
8. **TextInput requires `--fullwidth`** to fill its container. Without it, the input will be narrow.

### Token Usage Rules (CRITICAL)

1. **NEVER hardcode colors.** Use `var(--themed-*)` or `var(--base-color-*)` for every `color`, `background-color`, `border-color`, and `box-shadow` value.
2. **NEVER hardcode spacing.** Use `var(--stellar-space-*)` for `padding`, `margin`, and `gap`. Use `var(--stellar-size-*)` for `width` and `height` of UI elements.
3. **NEVER hardcode border-radius.** Use `var(--stellar-radius-*)`.
4. **NEVER hardcode font properties.** Use `var(--themed-font-*)` for `font-family`, `font-size`, `font-weight`, and `line-height`.

```html
<!-- ❌ WRONG: Hardcoded values -->
<div style="padding:16px; background:#f7f7f7; border:1px solid #d5dae4; border-radius:8px; color:#1e252f;">

<!-- ✅ CORRECT: Token variables -->
<div style="padding:var(--stellar-space-vertical-lg); background:var(--themed-reusable-background-additional-info); border:1px solid var(--themed-reusable-border-default); border-radius:var(--stellar-radius-md); color:var(--themed-reusable-text-primary);">
```

**If the UI element is not in this kit**, build it using standard HTML elements styled with inline styles (or a `<style>` block) that use the documented token variables. Never invent `stellar-*` class names for custom elements.
