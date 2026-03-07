/**
 * Organization Browser — Main Application
 * Virtual scroll, multi-select, drag-drop, control bar.
 */

(function () {
  'use strict';

  const ITEM_HEIGHT = 56;
  const BUFFER_COUNT = 15;

  const { accounts, userGroups, users, relationships } = window.ORG_DATA;
  const { userToGroups, groupToUsers, groupToAccounts, accountToGroups } = relationships;

  // ─── State ──────────────────────────────────────────────
  const state = {
    columns: {
      accounts: {
        items: accounts,
        filteredItems: accounts,
        selected: new Set(),
        highlighted: new Set(),
        lastClickIndex: -1,
        scrollEl: null,
        spacerEl: null,
        contentEl: null,
        countEl: null,
      },
      userGroups: {
        items: userGroups,
        filteredItems: userGroups,
        selected: new Set(),
        highlighted: new Set(),
        lastClickIndex: -1,
        scrollEl: null,
        spacerEl: null,
        contentEl: null,
        countEl: null,
      },
      users: {
        items: users,
        filteredItems: users,
        selected: new Set(),
        highlighted: new Set(),
        lastClickIndex: -1,
        scrollEl: null,
        spacerEl: null,
        contentEl: null,
        countEl: null,
      },
    },
    activeColumn: null,
    dragSourceColumn: null,
    dragItems: [],
  };

  // ─── DOM refs ───────────────────────────────────────────
  const COL_LABELS = {
    accounts: 'Accounts',
    userGroups: 'Org user groups',
    users: 'Org users',
  };

  function initDomRefs() {
    const c = state.columns;
    c.accounts.scrollEl = document.getElementById('accounts-scroll');
    c.accounts.spacerEl = document.getElementById('accounts-spacer');
    c.accounts.contentEl = document.getElementById('accounts-content');
    c.accounts.countEl = document.getElementById('accounts-count');
    c.accounts.searchEl = document.getElementById('accounts-search');

    c.userGroups.scrollEl = document.getElementById('usergroups-scroll');
    c.userGroups.spacerEl = document.getElementById('usergroups-spacer');
    c.userGroups.contentEl = document.getElementById('usergroups-content');
    c.userGroups.countEl = document.getElementById('usergroups-count');
    c.userGroups.searchEl = document.getElementById('usergroups-search');

    c.users.scrollEl = document.getElementById('users-scroll');
    c.users.spacerEl = document.getElementById('users-spacer');
    c.users.contentEl = document.getElementById('users-content');
    c.users.countEl = document.getElementById('users-count');
    c.users.searchEl = document.getElementById('users-search');
  }

  // ─── Renderers ──────────────────────────────────────────

  function itemClasses(isSelected, isHighlighted) {
    let cls = 'list-item';
    if (isSelected) cls += ' list-item--selected';
    else if (isHighlighted) cls += ' list-item--related';
    return cls;
  }

  const CLOUD_ICON = '<svg class="list-item__icon" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path fill="currentColor" d="M14 9.5c0-1.312-.997-2.39-2.274-2.52l-.26-.013q-.13 0-.253.012l-.479.047-.066-.475a2.97 2.97 0 0 0-2.66-2.538L7.732 4a2.967 2.967 0 0 0-2.966 2.967l.004.163q.004.08.012.158l.064.594-.596-.041a2 2 0 0 0-.15-.008 2.1 2.1 0 0 0-2.1 2.1l.01.215a2.1 2.1 0 0 0 2.09 1.885h7.354l.151-.004a2.53 2.53 0 0 0 2.382-2.278zm.996.176a3.534 3.534 0 0 1-3.348 3.352l-.012.001-.156.004H4.1a3.1 3.1 0 0 1-3.096-2.94L1 9.933a3.1 3.1 0 0 1 2.767-3.082A3.967 3.967 0 0 1 7.73 3l.187.004a3.97 3.97 0 0 1 3.651 2.965A3.533 3.533 0 0 1 15 9.5z"/></svg>';
  const CLOUD_EXTERNAL_ICON = '<svg class="list-item__icon" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><g fill="currentColor"><path d="M7.918 3.004 8 3.011v1L7.731 4a2.967 2.967 0 0 0-2.966 2.967l.004.163q.004.08.012.158l.064.594-.596-.041a2 2 0 0 0-.15-.008A2.1 2.1 0 0 0 2 9.933l.01.215a2.1 2.1 0 0 0 2.09 1.885h7.354l.151-.004a2.53 2.53 0 0 0 2.382-2.278L14 9.5a2.52 2.52 0 0 0-.493-1.5h1.159c.214.455.334.964.334 1.5l-.004.176a3.534 3.534 0 0 1-3.348 3.352l-.012.001-.156.004H4.1a3.1 3.1 0 0 1-3.096-2.94L1 9.933a3.1 3.1 0 0 1 2.767-3.082A3.967 3.967 0 0 1 7.73 3z"/><path d="M13.5 2a.5.5 0 0 1 .5.5V7h-1V3.707L7.854 8.854l-.708-.708L12.293 3H9V2z"/></g></svg>';

  const ITEM_MENU_BTN = `<button class="list-item__menu-btn" data-item-menu aria-label="More actions">
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none"><path fill="currentColor" d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/></svg>
  </button>`;

  function getSortMetadata(item, colKey) {
    const sort = activeSort[colKey];
    if (!sort || sort.key === 'name') return null;
    const def = (SORT_DEFS[colKey] || []).find(d => d.key === sort.key);
    if (!def) return null;
    let val = item[sort.key];
    if (val instanceof Date || (typeof val === 'string' && /^\d{4}-\d{2}/.test(val))) {
      val = new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return `${def.label}: ${val}`;
  }

  function renderAccountItem(item, isSelected, isHighlighted) {
    const initials = item.name.split('_').slice(0, 2).map(w => w[0]).join('');
    const editionClass = item.edition === 'Business Critical' ? 'Business critical' : item.edition;
    const cloudIcon = item.tenantType === 'External' ? CLOUD_EXTERNAL_ICON : CLOUD_ICON;
    const sortMeta = getSortMetadata(item, 'accounts');
    const subtitle = sortMeta || `${editionClass} · ${item.cloud} ${item.region}`;
    return `
      <div class="${itemClasses(isSelected, isHighlighted)}"
           data-id="${item.id}" data-col="accounts" draggable="true" tabindex="-1">
        ${cloudIcon}
        <div class="list-item__text">
          <div class="list-item__name">${item.name}</div>
          <div class="list-item__subtitle">${subtitle}</div>
        </div>
        ${ITEM_MENU_BTN}
        <svg class="list-item__chevron" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
          <path fill="currentColor" d="m5.854 2.646 5 5a.5.5 0 0 1 0 .708l-5 5-.708-.707L9.793 8 5.146 3.354z"/>
        </svg>
      </div>`;
  }

  function renderUserGroupItem(item, isSelected, isHighlighted) {
    const initials = item.name.split('_').slice(0, 2).map(w => w[0]).join('');
    const accountLabel = item.accountCount === 0
      ? '<span class="list-item__subtitle-tag">Account unassigned</span>'
      : `${item.accountCount} accounts`;
    const sortMeta = getSortMetadata(item, 'userGroups');
    const subtitle = sortMeta || `${item.userCount} users · ${accountLabel}`;
    return `
      <div class="${itemClasses(isSelected, isHighlighted)}"
           data-id="${item.id}" data-col="userGroups" draggable="true" tabindex="-1">
        <svg class="list-item__icon" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
          <g fill="currentColor"><path d="M8.5 11a1.5 1.5 0 0 1 1.5 1.5V14H9v-1.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0-.5.5V14H1v-1.5A1.5 1.5 0 0 1 2.5 11zm5-2a1.5 1.5 0 0 1 1.5 1.5V12h-1v-1.5a.5.5 0 0 0-.5-.5H11V9z"/><path fill-rule="evenodd" d="M5.5 3a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7m0 1a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5" clip-rule="evenodd"/><path d="M11 2a3 3 0 1 1-1.005 5.824L9.992 7h.012l-.001-.269a2 2 0 1 0-.352-3.206l-.603-.8A3 3 0 0 1 11 2"/></g>
        </svg>
        <div class="list-item__text">
          <div class="list-item__name">${item.name}</div>
          <div class="list-item__subtitle">${subtitle}</div>
        </div>
        ${ITEM_MENU_BTN}
        <svg class="list-item__chevron" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
          <path fill="currentColor" d="m5.854 2.646 5 5a.5.5 0 0 1 0 .708l-5 5-.708-.707L9.793 8 5.146 3.354z"/>
        </svg>
      </div>`;
  }

  function renderUserItem(item, isSelected, isHighlighted) {
    const initials = item.displayName.split(' ').map(w => w[0]).join('').slice(0, 2);
    const mfaLabel = item.mfaEnabled ? 'Yes' : 'No';
    const groups = userToGroups[item.id] || [];
    const groupCount = groups.length;
    const groupLabel = groupCount === 0
      ? '<span class="list-item__subtitle-tag">Group unassigned</span>'
      : `${groupCount} group${groupCount > 1 ? 's' : ''}`;
    const sortMeta = getSortMetadata(item, 'users');
    const subtitle = sortMeta || `MFA: ${mfaLabel} · ${groupLabel}`;
    return `
      <div class="${itemClasses(isSelected, isHighlighted)}"
           data-id="${item.id}" data-col="users" draggable="true" tabindex="-1">
        <div class="list-item__status list-item__status--${item.status === 'Disabled' ? 'disabled' : 'enabled'}"></div>
        ${item.userType === 'Person' ? `<div class="list-item__avatar">${initials}</div>` : ''}
        <div class="list-item__text">
          <div class="list-item__name">${item.name}</div>
          <div class="list-item__subtitle">${subtitle}</div>
        </div>
        ${ITEM_MENU_BTN}
      </div>`;
  }

  const RENDERERS = {
    accounts: renderAccountItem,
    userGroups: renderUserGroupItem,
    users: renderUserItem,
  };

  // ─── Table View (expanded columns) ────────────────────

  const TABLE_COLS = {
    accounts: [
      { key: 'name', label: 'ACCOUNT', flex: 2 },
      { key: 'edition', label: 'EDITION', flex: 1.2 },
      { key: 'cloud', label: 'CLOUD', flex: 0.8 },
      { key: 'region', label: 'REGION', flex: 1.4 },
      { key: 'created', label: 'CREATED', flex: 1.2 },
      { key: 'locator', label: 'LOCATOR', flex: 1 },
    ],
    userGroups: [
      { key: 'name', label: 'GROUP', flex: 2 },
      { key: 'comment', label: 'COMMENT', flex: 2.5 },
      { key: 'userCount', label: 'USERS', flex: 0.6 },
      { key: 'accountCount', label: 'ACCOUNTS', flex: 0.7 },
      { key: 'created', label: 'CREATED', flex: 1.2 },
    ],
    users: [
      { key: 'avatar', label: '', flex: 0 },
      { key: 'name', label: 'NAME', flex: 1.8 },
      { key: 'displayName', label: 'DISPLAY NAME', flex: 1.5 },
      { key: 'authMethod', label: 'AUTHENTICATION', flex: 1.2 },
      { key: 'mfaEnabled', label: 'MFA', flex: 0.5 },
      { key: 'status', label: 'STATUS', flex: 0.6 },
    ],
  };

  const expandedColumns = new Set();

  function renderTableHeader(colKey) {
    const cols = TABLE_COLS[colKey];
    if (!cols) return '';
    const col = state.columns[colKey];
    const total = col.filteredItems.length;
    const selCount = col.selected.size;
    const allSelected = total > 0 && selCount === total;
    const someSelected = selCount > 0 && !allSelected;
    let cbCls = 'table-checkbox table-checkbox--header-cb';
    if (allSelected) cbCls += ' table-checkbox--checked';
    else if (someSelected) cbCls += ' table-checkbox--indeterminate';

    const currentSort = activeSort[colKey];
    const arrowUp = '<svg class="table-sort-icon" viewBox="0 0 16 16" width="12" height="12" fill="none"><path fill="currentColor" d="m8 3.5 4 5H4z"/></svg>';
    const arrowDown = '<svg class="table-sort-icon" viewBox="0 0 16 16" width="12" height="12" fill="none"><path fill="currentColor" d="m8 12.5-4-5h8z"/></svg>';

    let html = '<div class="table-header-row">';
    html += `<div class="table-cell table-cell--checkbox"><div class="${cbCls}" data-select-all="${colKey}"></div></div>`;
    for (const c of cols) {
      const style = c.flex === 0 ? 'width:40px;flex:none;' : `flex:${c.flex};`;
      if (!c.label || c.flex === 0) {
        html += `<div class="table-cell table-cell--header" style="${style}"></div>`;
      } else {
        const isActive = currentSort && currentSort.key === c.key;
        const arrow = isActive ? (currentSort.dir === 'asc' ? arrowUp : arrowDown) : '';
        const activeCls = isActive ? ' table-cell--sort-active' : '';
        html += `<div class="table-cell table-cell--header table-cell--sortable${activeCls}" style="${style}" data-table-sort="${c.key}" data-table-sort-col="${colKey}">${c.label}${arrow}</div>`;
      }
    }
    html += '</div>';
    return html;
  }

  function formatTableCell(item, key, colKey) {
    if (key === 'avatar') {
      if (item.userType === 'Person') {
        const initials = item.displayName.split(' ').map(w => w[0]).join('').slice(0, 2);
        return `<div class="list-item__avatar" style="width:28px;height:28px;font-size:11px;line-height:28px;">${initials}</div>`;
      }
      return '';
    }
    if (key === 'mfaEnabled') {
      return item.mfaEnabled
        ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill="var(--themed-status-success-ui,#22a861)" d="M6.5 11.2 3.3 8l-.7.7 3.9 3.9 8-8-.7-.7z"/></svg>'
        : '<span style="color:var(--themed-reusable-text-tertiary);">-</span>';
    }
    if (key === 'userType') {
      return item.userType === 'Person'
        ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill="currentColor" d="M8 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6M6 5a2 2 0 1 1 4 0 2 2 0 0 1-4 0m-2.5 9v-1.5A1.5 1.5 0 0 1 5 11h6a1.5 1.5 0 0 1 1.5 1.5V14h-1v-1.5a.5.5 0 0 0-.5-.5H5a.5.5 0 0 0-.5.5V14z"/></svg>'
        : '<span style="color:var(--themed-reusable-text-tertiary);">-</span>';
    }
    if (key === 'created') {
      const d = new Date(item[key]);
      const now = new Date();
      const diff = now - d;
      const days = Math.floor(diff / 86400000);
      if (days < 1) return 'Today';
      if (days < 2) return 'Yesterday';
      if (days < 7) return `${days} days ago`;
      if (days < 14) return 'Last week';
      if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
      if (days < 60) return 'Last month';
      if (days < 365) return `${Math.floor(days / 30)} months ago`;
      return `${Math.floor(days / 365)} years ago`;
    }
    if (key === 'edition') {
      return item[key] === 'Business Critical' ? 'Business critical' : item[key];
    }
    const val = item[key];
    return val != null ? String(val) : '-';
  }

  function renderTableRow(item, isSelected, isHighlighted, colKey) {
    const cols = TABLE_COLS[colKey];
    if (!cols) return '';
    const cls = 'table-row' + (isSelected ? ' table-row--selected' : '') + (isHighlighted ? ' table-row--related' : '');
    let html = `<div class="${cls}" data-id="${item.id}" data-col="${colKey}" draggable="true" tabindex="-1">`;
    html += `<div class="table-cell table-cell--checkbox"><div class="table-checkbox${isSelected ? ' table-checkbox--checked' : ''}"></div></div>`;
    for (const c of cols) {
      const style = c.flex === 0 ? 'width:40px;flex:none;' : `flex:${c.flex};`;
      const cellCls = c.key === 'name' ? 'table-cell table-cell--name' : 'table-cell';
      html += `<div class="${cellCls}" style="${style}">${formatTableCell(item, c.key, colKey)}</div>`;
    }
    html += '</div>';
    return html;
  }

  const TABLE_RENDERERS = {
    accounts: (item, sel, hl) => renderTableRow(item, sel, hl, 'accounts'),
    userGroups: (item, sel, hl) => renderTableRow(item, sel, hl, 'userGroups'),
    users: (item, sel, hl) => renderTableRow(item, sel, hl, 'users'),
  };

  // ─── Virtual Scroll ─────────────────────────────────────

  function updateVirtualScroll(colKey) {
    const col = state.columns[colKey];
    const items = col.filteredItems;
    const totalHeight = items.length * ITEM_HEIGHT;
    col.spacerEl.style.height = totalHeight + 'px';

    const scrollTop = col.scrollEl.scrollTop;
    const viewHeight = col.scrollEl.clientHeight;

    let startIdx = Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_COUNT;
    let endIdx = Math.ceil((scrollTop + viewHeight) / ITEM_HEIGHT) + BUFFER_COUNT;
    startIdx = Math.max(0, startIdx);
    endIdx = Math.min(items.length, endIdx);

    const isTable = expandedColumns.has(colKey);
    const renderer = isTable ? TABLE_RENDERERS[colKey] : RENDERERS[colKey];
    let html = '';
    for (let i = startIdx; i < endIdx; i++) {
      const item = items[i];
      const isSelected = col.selected.has(item.id);
      const isHighlighted = col.highlighted.has(item.id);
      html += renderer(item, isSelected, isHighlighted);
    }

    col.contentEl.style.transform = `translateY(${startIdx * ITEM_HEIGHT}px)`;
    col.contentEl.innerHTML = html;

    const tableHeaderEl = document.getElementById(`${colKey === 'userGroups' ? 'usergroups' : colKey}-table-header`);
    if (tableHeaderEl) {
      tableHeaderEl.innerHTML = isTable ? renderTableHeader(colKey) : '';
      tableHeaderEl.style.display = isTable ? 'block' : 'none';
    }

    const label = COL_LABELS[colKey] || colKey;
    col.searchEl.placeholder = `${label} (${items.length.toLocaleString()})`;
  }

  function initVirtualScroll() {
    for (const colKey of Object.keys(state.columns)) {
      const col = state.columns[colKey];
      col.scrollEl.addEventListener('scroll', () => updateVirtualScroll(colKey), { passive: true });
      updateVirtualScroll(colKey);
    }
  }

  // ─── Selection ──────────────────────────────────────────

  function clearSelectionInOtherColumns(activeColKey) {
    for (const colKey of Object.keys(state.columns)) {
      if (colKey !== activeColKey && state.columns[colKey].selected.size > 0) {
        state.columns[colKey].selected.clear();
        state.columns[colKey].lastClickIndex = -1;
        updateVirtualScroll(colKey);
      }
    }
  }

  function getItemIndex(colKey, itemId) {
    return state.columns[colKey].filteredItems.findIndex(it => it.id === itemId);
  }

  function handleItemClick(colKey, itemId, e) {
    const col = state.columns[colKey];
    const idx = getItemIndex(colKey, itemId);
    if (idx === -1) return;

    const isMeta = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;

    clearSelectionInOtherColumns(colKey);
    state.activeColumn = colKey;

    if (isShift && col.lastClickIndex >= 0) {
      const from = Math.min(col.lastClickIndex, idx);
      const to = Math.max(col.lastClickIndex, idx);
      if (!isMeta) col.selected.clear();
      for (let i = from; i <= to; i++) {
        col.selected.add(col.filteredItems[i].id);
      }
    } else if (isMeta) {
      if (col.selected.has(itemId)) {
        col.selected.delete(itemId);
      } else {
        col.selected.add(itemId);
      }
      col.lastClickIndex = idx;
    } else {
      if (col.selected.size === 1 && col.selected.has(itemId)) {
        col.selected.clear();
        col.lastClickIndex = -1;
      } else {
        col.selected.clear();
        col.selected.add(itemId);
        col.lastClickIndex = idx;
      }
    }

    updateControlBar();
    updateColumnActiveState();
    updateRelationshipHighlights();
  }

  function handleCheckboxClick(colKey, itemId) {
    const col = state.columns[colKey];
    clearSelectionInOtherColumns(colKey);
    state.activeColumn = colKey;

    if (col.selected.has(itemId)) {
      col.selected.delete(itemId);
    } else {
      col.selected.add(itemId);
    }

    updateControlBar();
    updateColumnActiveState();
    updateRelationshipHighlights();
  }

  function handleSelectAll(colKey) {
    const col = state.columns[colKey];
    clearSelectionInOtherColumns(colKey);
    state.activeColumn = colKey;

    const allSelected = col.filteredItems.length > 0 && col.selected.size === col.filteredItems.length;
    if (allSelected) {
      col.selected.clear();
    } else {
      col.selected.clear();
      for (const item of col.filteredItems) {
        col.selected.add(item.id);
      }
    }

    updateControlBar();
    updateColumnActiveState();
    updateRelationshipHighlights();
  }

  function updateColumnActiveState() {
    document.querySelectorAll('.column').forEach(el => {
      el.classList.remove('column--active');
    });
    if (state.activeColumn) {
      const colAttr = state.activeColumn === 'userGroups' ? 'userGroups' : state.activeColumn;
      const el = document.querySelector(`.column[data-column="${colAttr}"]`);
      if (el) el.classList.add('column--active');
    }
  }

  function getColumnSearchQuery(colKey) {
    const col = state.columns[colKey];
    return col.searchEl ? col.searchEl.value.trim().toLowerCase() : '';
  }

  function applyHighlightOrder(items, col) {
    const hl = col.highlighted;
    const sel = col.selected;
    if (sel.size === 0 && hl.size === 0) return items;
    const selected = [];
    const highlighted = [];
    const rest = [];
    for (const item of items) {
      if (sel.has(item.id)) selected.push(item);
      else if (hl.has(item.id)) highlighted.push(item);
      else rest.push(item);
    }
    return selected.concat(highlighted, rest);
  }

  function getBaseFilteredItems(col, query, colKey) {
    let items = col.items;

    // Apply per-column search
    const colQuery = getColumnSearchQuery(colKey);
    if (colQuery) {
      items = items.filter(item => {
        const name = item.name || '';
        const display = item.displayName || '';
        return name.toLowerCase().includes(colQuery) || display.toLowerCase().includes(colQuery);
      });
    }

    // Apply global search
    if (query) {
      items = items.filter(item => {
        const name = item.name || '';
        const display = item.displayName || '';
        return name.toLowerCase().includes(query) || display.toLowerCase().includes(query);
      });
    }

    // Apply column filters
    if (colKey && activeFilters[colKey]) {
      const defs = FILTER_DEFS[colKey] || [];
      for (const def of defs) {
        const active = activeFilters[colKey][def.key];
        if (active && active.size > 0) {
          items = items.filter(item => active.has(def.accessor(item)));
        }
      }
    }

    // Apply sort
    if (colKey && activeSort[colKey]) {
      const { key, dir } = activeSort[colKey];
      items = [...items].sort((a, b) => compareFn(a, b, key, dir));
    }

    return items;
  }

  // ─── Relationship Highlighting ──────────────────────────

  function updateRelationshipHighlights() {
    const acctHL = new Set();
    const grpHL = new Set();
    const usrHL = new Set();

    const acctSel = state.columns.accounts.selected;
    const grpSel = state.columns.userGroups.selected;
    const usrSel = state.columns.users.selected;

    // Account selected → downstream: groups imported in that account → users in those groups
    for (const accId of acctSel) {
      const groups = accountToGroups[accId] || [];
      for (const gId of groups) {
        grpHL.add(gId);
        const usrs = groupToUsers[gId] || [];
        for (const uId of usrs) usrHL.add(uId);
      }
    }

    // User group selected → upstream: accounts the group is in / downstream: users in the group
    for (const gId of grpSel) {
      const accs = groupToAccounts[gId] || [];
      for (const aId of accs) acctHL.add(aId);
      const usrs = groupToUsers[gId] || [];
      for (const uId of usrs) usrHL.add(uId);
    }

    // User selected → upstream: groups the user belongs to → accounts those groups are in
    for (const uId of usrSel) {
      const groups = userToGroups[uId] || [];
      for (const gId of groups) {
        grpHL.add(gId);
        const accs = groupToAccounts[gId] || [];
        for (const aId of accs) acctHL.add(aId);
      }
    }

    // Don't highlight items that are themselves selected
    for (const id of acctSel) acctHL.delete(id);
    for (const id of grpSel) grpHL.delete(id);
    for (const id of usrSel) usrHL.delete(id);

    state.columns.accounts.highlighted = acctHL;
    state.columns.userGroups.highlighted = grpHL;
    state.columns.users.highlighted = usrHL;

    const hlMap = { accounts: acctHL, userGroups: grpHL, users: usrHL };
    const searchQuery = document.getElementById('globalSearch').value.trim().toLowerCase();
    for (const colKey of Object.keys(state.columns)) {
      const col = state.columns[colKey];
      if (hlMap[colKey] && hlMap[colKey].size > 0) {
        activeSort[colKey] = null;
      } else if (!activeSort[colKey]) {
        activeSort[colKey] = { key: 'name', dir: 'asc' };
      }
      col.filteredItems = applyHighlightOrder(getBaseFilteredItems(col, searchQuery, colKey), col);
      col.scrollEl.scrollTop = 0;
      updateVirtualScroll(colKey);
    }
  }

  function closestItem(el) {
    return el.closest('.list-item') || el.closest('.table-row');
  }

  function initSelection() {
    for (const colKey of Object.keys(state.columns)) {
      const col = state.columns[colKey];
      col.contentEl.addEventListener('click', (e) => {
        const isCheckbox = e.target.closest('.table-checkbox');
        const itemEl = closestItem(e.target);
        if (!itemEl) return;
        if (isCheckbox || itemEl.classList.contains('table-row')) {
          handleCheckboxClick(colKey, itemEl.dataset.id);
        } else {
          handleItemClick(colKey, itemEl.dataset.id, e);
        }
      });
    }

    // Select-all checkbox in table headers
    document.addEventListener('click', (e) => {
      const selectAllEl = e.target.closest('[data-select-all]');
      if (selectAllEl) {
        handleSelectAll(selectAllEl.dataset.selectAll);
        return;
      }
      const sortEl = e.target.closest('[data-table-sort]');
      if (sortEl) {
        const key = sortEl.dataset.tableSort;
        const colKey = sortEl.dataset.tableSortCol;
        const current = activeSort[colKey];
        if (current && current.key === key) {
          activeSort[colKey] = { key, dir: current.dir === 'asc' ? 'desc' : 'asc' };
        } else {
          activeSort[colKey] = { key, dir: 'asc' };
        }
        applyFilters(colKey);
        return;
      }
    });

    // Select unassigned / Select all buttons for userGroups and users columns
    initColumnSelectButtons();
  }

  function getUnassignedItems(colKey) {
    const col = state.columns[colKey];
    if (colKey === 'userGroups') {
      return col.filteredItems.filter(g => (groupToAccounts[g.id] || []).length === 0);
    } else if (colKey === 'users') {
      return col.filteredItems.filter(u => (userToGroups[u.id] || []).length === 0);
    }
    return [];
  }

  function isListFiltered(colKey) {
    const query = document.getElementById('globalSearch').value.trim();
    if (query.length > 0) return true;
    if (colKey && getColumnSearchQuery(colKey).length > 0) return true;
    if (colKey && activeFilters[colKey]) {
      return Object.values(activeFilters[colKey]).some(s => s && s.size > 0);
    }
    return false;
  }

  function hasActiveColumnFilter(colKey) {
    if (colKey && activeFilters[colKey]) {
      return Object.values(activeFilters[colKey]).some(s => s && s.size > 0);
    }
    return false;
  }

  function updateSelectButtonLabels() {
    const ugBtn = document.getElementById('usergroups-select-btn');
    const usrBtn = document.getElementById('users-select-btn');
    if (ugBtn) ugBtn.textContent = hasActiveColumnFilter('userGroups') ? 'Select all' : 'Select unassigned';
    if (usrBtn) usrBtn.textContent = hasActiveColumnFilter('users') ? 'Select all' : 'Select unassigned';
  }

  function initColumnSelectButtons() {
    const btnMap = {
      userGroups: document.getElementById('usergroups-select-btn'),
      users: document.getElementById('users-select-btn'),
    };

    for (const [colKey, btn] of Object.entries(btnMap)) {
      if (!btn) continue;
      btn.addEventListener('click', () => {
        const col = state.columns[colKey];
        let targetItems;

        if (hasActiveColumnFilter(colKey)) {
          targetItems = col.filteredItems;
        } else {
          targetItems = getUnassignedItems(colKey);
        }

        const allAlreadySelected = targetItems.length > 0 && targetItems.every(it => col.selected.has(it.id));
        if (allAlreadySelected) {
          targetItems.forEach(it => col.selected.delete(it.id));
        } else {
          clearSelectionInOtherColumns(colKey);
          col.selected.clear();
          targetItems.forEach(it => col.selected.add(it.id));
        }

        state.activeColumn = colKey;
        updateControlBar();
        updateColumnActiveState();
        updateRelationshipHighlights();
      });
    }
  }

  // ─── Control Bar ────────────────────────────────────────

  // SVG icons for action buttons
  const ACTION_ICONS = {
    edit: '<svg class="stellar-button__icon" viewBox="0 0 16 16" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M9.916 2.378a1.5 1.5 0 0 1 2.156.038l1.634 1.749a1.5 1.5 0 0 1-.035 2.084l-6.595 6.594a1.5 1.5 0 0 1-.796.416l-3.523.633a.502.502 0 0 1-.578-.596l.771-3.61a1.5 1.5 0 0 1 .407-.748zM4.064 9.645a.5.5 0 0 0-.136.25l-.615 2.88 2.79-.5a.5.5 0 0 0 .266-.139l4.636-4.635-2.398-2.399zm7.278-6.547a.5.5 0 0 0-.719-.013l-1.31 1.31 2.4 2.399 1.251-1.252a.5.5 0 0 0 .012-.695z" clip-rule="evenodd"/></svg>',
    reset: '<svg class="stellar-button__icon" viewBox="0 0 16 16" fill="none"><path fill="currentColor" d="M8 2a6 6 0 1 0 6 6h-1a5 5 0 1 1-1.465-3.535L9.5 6.5H14V2l-1.88 1.88A5.98 5.98 0 0 0 8 2"/></svg>',
    addMember: '<svg class="stellar-button__icon" viewBox="0 0 16 16" fill="none"><path fill="currentColor" d="M8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6M6 4a2 2 0 1 1 4 0 2 2 0 0 1-4 0m-2.5 6A1.5 1.5 0 0 0 2 11.5V14h1v-2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5V14h1v-2.5A1.5 1.5 0 0 0 9.5 10zM14 10v2h2v1h-2v2h-1v-2h-2v-1h2v-2z"/></svg>',
    importGroups: '<svg class="stellar-button__icon" viewBox="0 0 16 16" fill="none"><path fill="currentColor" d="M8.5 1.5v6h6v1h-6v6h-1v-6h-6v-1h6v-6z"/></svg>',
    overflow: '<svg class="stellar-button__icon" viewBox="0 0 16 16" fill="none"><path fill="currentColor" d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/></svg>',
  };

  const CONTEXTUAL_ACTIONS = {
    users: {
      buttons: [
        { key: 'edit', label: 'Edit', icon: 'edit' },
        { key: 'resetPassword', label: 'Reset password', icon: 'reset' },
      ],
      overflow: [
        { key: 'disable', label: 'Disable' },
        { key: 'removeFromGroup', label: 'Remove from group' },
        { key: 'transferOwnership', label: 'Transfer ownership' },
        { divider: true },
        { key: 'delete', label: 'Delete', critical: true },
      ],
    },
    userGroups: {
      buttons: [
        { key: 'edit', label: 'Edit', icon: 'edit' },
        { key: 'addMember', label: 'Add member', icon: 'importGroups' },
      ],
      overflow: [
        { key: 'assignToAccount', label: 'Assign to account' },
        { key: 'removeFromAccount', label: 'Remove from account' },
        { key: 'duplicate', label: 'Duplicate group' },
        { divider: true },
        { key: 'delete', label: 'Delete', critical: true },
      ],
    },
    accounts: {
      buttons: [
        { key: 'edit', label: 'Edit', icon: 'edit' },
        { key: 'importGroups', label: 'Import user groups', icon: 'importGroups' },
      ],
      overflow: [
        { key: 'manageResourceMonitor', label: 'Manage resource monitor' },
        { key: 'enableReplication', label: 'Enable replication' },
        { key: 'viewUsage', label: 'View usage' },
        { divider: true },
        { key: 'drop', label: 'Drop', critical: true },
      ],
    },
  };

  function buildActionButtons(colKey) {
    const config = CONTEXTUAL_ACTIONS[colKey];
    if (!config) return '';

    let html = '';

    const parentAction = getParentContext(colKey);
    if (parentAction) {
      html += `<button class="stellar-button stellar-button--secondary" data-bar-action="${parentAction.key}">${parentAction.label}</button>`;
    }

    for (const btn of config.buttons) {
      html += `<button class="stellar-button stellar-button--secondary">${ACTION_ICONS[btn.icon] || ''}${btn.label}</button>`;
    }

    let overflowItems = '';
    for (const item of config.overflow) {
      if (item.divider) {
        overflowItems += '<div class="stellar-menu__divider" role="separator"></div>';
        continue;
      }
      const textStyle = item.critical ? ' style="color:var(--themed-status-critical-ui);"' : '';
      overflowItems += `<div class="stellar-menu__item" role="menuitem" data-key="${item.key}">
        <div class="stellar-menu__item-label" tabindex="0">
          <div style="flex-grow:1; min-width:0; display:flex; flex-direction:column; gap:2px">
            <span class="stellar-menu__item-text"${textStyle}>${item.label}</span>
          </div>
        </div>
      </div>`;
    }

    html += `<div class="stellar-menu-trigger">
      <button class="stellar-button stellar-button--secondary" data-overflow-trigger>
        ${ACTION_ICONS.overflow}
      </button>
      <div class="stellar-menu action-overflow-menu" role="dialog">
        <div class="stellar-menu__list" role="menu" tabindex="0">
          ${overflowItems}
        </div>
      </div>
    </div>`;

    return html;
  }

  function positionOverflowMenu(menuEl) {
    menuEl.style.top = '';
    menuEl.style.bottom = '';
    menuEl.style.left = '';
    menuEl.style.right = '0';
    const rect = menuEl.getBoundingClientRect();
    if (rect.bottom > window.innerHeight - 8) {
      menuEl.style.top = 'auto';
      menuEl.style.bottom = '100%';
    }
    if (rect.right > getMainContentRight() - 8) {
      menuEl.style.right = '0';
      menuEl.style.left = 'auto';
    }
    if (rect.left < 8) {
      menuEl.style.left = '0';
      menuEl.style.right = 'auto';
    }
  }

  let currentActionCol = null;

  function updateControlBar() {
    let totalSelected = 0;
    let activeColKey = null;
    for (const colKey of Object.keys(state.columns)) {
      const n = state.columns[colKey].selected.size;
      if (n > 0) {
        totalSelected += n;
        activeColKey = colKey;
      }
    }

    const actionsEl = document.getElementById('selectionActions');
    const actionBtnsEl = document.getElementById('actionButtons');
    const searchEl = document.querySelector('.control-bar__left');
    const createBtn = document.getElementById('createButton');
    const pillEl = document.getElementById('selectionPill');

    if (totalSelected > 0) {
      actionsEl.style.display = 'flex';
      searchEl.style.display = 'none';
      createBtn.style.display = 'none';

      actionBtnsEl.innerHTML = buildActionButtons(activeColKey);
      currentActionCol = activeColKey;
      initOverflowToggle(actionBtnsEl);
      initBarActions(actionBtnsEl, activeColKey);
      actionBtnsEl.style.display = 'flex';
      actionBtnsEl.style.gap = 'var(--stellar-space-gap-sm)';
      actionBtnsEl.style.alignItems = 'center';

      const labelMap = { accounts: 'Account', userGroups: 'User group', users: 'Org user' };
      const label = labelMap[activeColKey] || 'item';
      const pillLabel = `${totalSelected} ${label}${totalSelected > 1 ? 's' : ''} selected`;
      pillEl.innerHTML = `${pillLabel} <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true" class="selection-pill__clear"><path fill="currentColor" d="m13.354 3.366-4.642 4.64 4.634 4.635-.708.707-4.633-4.633-4.633 4.633-.707-.707 4.633-4.633-4.642-4.642.707-.707L8.005 7.3l4.641-4.64z"/></svg>`;

      const countsEl = document.getElementById('relationCounts');
      const parts = [];
      const sel = state.columns[activeColKey].selected;

      if (activeColKey === 'accounts') {
        const grpSet = new Set();
        const usrSet = new Set();
        for (const accId of sel) {
          for (const gId of (accountToGroups[accId] || [])) {
            grpSet.add(gId);
            for (const uId of (groupToUsers[gId] || [])) usrSet.add(uId);
          }
        }
        parts.push(`${grpSet.size} group${grpSet.size !== 1 ? 's' : ''}`);
        parts.push(`${usrSet.size} user${usrSet.size !== 1 ? 's' : ''}`);
      } else if (activeColKey === 'userGroups') {
        const acctSet = new Set();
        const usrSet = new Set();
        for (const gId of sel) {
          for (const aId of (groupToAccounts[gId] || [])) acctSet.add(aId);
          for (const uId of (groupToUsers[gId] || [])) usrSet.add(uId);
        }
        parts.push(`In ${acctSet.size} account${acctSet.size !== 1 ? 's' : ''}`);
        parts.push(`${usrSet.size} user${usrSet.size !== 1 ? 's' : ''}`);
      } else if (activeColKey === 'users') {
        const grpSet = new Set();
        const acctSet = new Set();
        for (const uId of sel) {
          for (const gId of (userToGroups[uId] || [])) {
            grpSet.add(gId);
            for (const aId of (groupToAccounts[gId] || [])) acctSet.add(aId);
          }
        }
        parts.push(`In ${grpSet.size} group${grpSet.size !== 1 ? 's' : ''}`);
        parts.push(`In ${acctSet.size} account${acctSet.size !== 1 ? 's' : ''}`);
      }
      countsEl.textContent = parts.join(' · ');
    } else {
      actionsEl.style.display = 'none';
      actionBtnsEl.style.display = 'none';
      actionBtnsEl.innerHTML = '';
      currentActionCol = null;
      searchEl.style.display = '';
      createBtn.style.display = '';
    }
  }

  function initOverflowToggle(container) {
    const trigger = container.querySelector('[data-overflow-trigger]');
    if (!trigger) return;
    const menuEl = container.querySelector('.action-overflow-menu');
    if (!menuEl) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menuEl.classList.contains('stellar-menu--open');
      document.querySelectorAll('.action-overflow-menu').forEach(m => m.classList.remove('stellar-menu--open'));
      if (!isOpen) {
        menuEl.classList.add('stellar-menu--open');
        positionOverflowMenu(menuEl);
      }
    });
  }

  function initBarActions(container, colKey) {
    container.querySelectorAll('[data-bar-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.barAction;
        const selectedIds = [...state.columns[colKey].selected];
        if (selectedIds.length === 0) return;
        handleUnassignAction(action, selectedIds, colKey);
      });
    });
  }

  document.addEventListener('click', () => {
    document.querySelectorAll('.action-overflow-menu').forEach(m => m.classList.remove('stellar-menu--open'));
  });

  function initControlBar() {
    const pillEl = document.getElementById('selectionPill');
    pillEl.addEventListener('click', () => {
      for (const colKey of Object.keys(state.columns)) {
        state.columns[colKey].selected.clear();
        state.columns[colKey].lastClickIndex = -1;
      }
      state.activeColumn = null;
      updateControlBar();
      updateColumnActiveState();
      updateRelationshipHighlights();
    });
  }

  // ─── Search / Filter ───────────────────────────────────

  function applyColumnSearch(colKey) {
    const col = state.columns[colKey];
    const globalQuery = document.getElementById('globalSearch').value.trim().toLowerCase();
    col.filteredItems = applyHighlightOrder(getBaseFilteredItems(col, globalQuery, colKey), col);
    col.scrollEl.scrollTop = 0;
    updateVirtualScroll(colKey);
  }

  function applyAllColumnSearches() {
    for (const colKey of Object.keys(state.columns)) {
      applyColumnSearch(colKey);
    }
    updateSelectButtonLabels();
  }

  function initSearch() {
    const globalInput = document.getElementById('globalSearch');
    let globalDebounce;
    globalInput.addEventListener('input', () => {
      clearTimeout(globalDebounce);
      globalDebounce = setTimeout(() => {
        applyAllColumnSearches();
      }, 150);
    });

    for (const colKey of Object.keys(state.columns)) {
      const col = state.columns[colKey];
      let colDebounce;
      col.searchEl.addEventListener('input', () => {
        clearTimeout(colDebounce);
        colDebounce = setTimeout(() => {
          applyColumnSearch(colKey);
          updateSelectButtonLabels();
        }, 150);
      });
    }
  }

  // ─── Drag and Drop ─────────────────────────────────────

  const VALID_DROP_MAP = {
    users: 'userGroups',
    userGroups: 'accounts',
  };

  function initDragDrop() {
    const ghostEl = document.getElementById('dragGhost');

    for (const colKey of Object.keys(state.columns)) {
      const col = state.columns[colKey];

      col.contentEl.addEventListener('dragstart', (e) => {
        const itemEl = closestItem(e.target);
        if (!itemEl) return;

        const itemId = itemEl.dataset.id;

        // Dismiss popovers and menus
        if (popoverVisible) hidePopover();
        if (inlineMenuOpen) closeInlineMenu();
        document.querySelectorAll('.filter-menu--open').forEach(m => m.classList.remove('filter-menu--open'));
        document.querySelectorAll('.action-overflow-menu').forEach(m => m.classList.remove('stellar-menu--open'));

        state.dragSourceColumn = colKey;
        if (col.selected.has(itemId)) {
          state.dragItems = [...col.selected];
        } else {
          state.dragItems = [itemId];
        }

        const count = state.dragItems.length;
        const labelMap = { accounts: 'account', userGroups: 'user group', users: 'user' };
        const label = labelMap[colKey] || 'item';

        ghostEl.style.display = 'flex';
        ghostEl.querySelector('.drag-ghost__count').textContent = count;
        ghostEl.querySelector('.drag-ghost__label').textContent =
          `${label}${count > 1 ? 's' : ''}`;

        e.dataTransfer.setDragImage(ghostEl, 20, 20);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify({ colKey, ids: state.dragItems }));

        const dragSet = new Set(state.dragItems);
        requestAnimationFrame(() => {
          col.contentEl.querySelectorAll('.list-item, .table-row').forEach(el => {
            if (dragSet.has(el.dataset.id)) {
              el.classList.add(el.classList.contains('table-row') ? 'table-row--dragging' : 'list-item--dragging');
            }
          });
        });
      });

      col.contentEl.addEventListener('dragend', () => {
        ghostEl.style.display = 'none';
        ghostEl.style.top = '-1000px';
        ghostEl.style.left = '-1000px';

        col.contentEl.querySelectorAll('.list-item--dragging, .table-row--dragging').forEach(el => {
          el.classList.remove('list-item--dragging', 'table-row--dragging');
        });

        document.querySelectorAll('.column--drop-target').forEach(el => {
          el.classList.remove('column--drop-target');
        });
        document.querySelectorAll('.list-item--drag-over, .table-row--drag-over').forEach(el => {
          el.classList.remove('list-item--drag-over');
        });

        state.dragSourceColumn = null;
        state.dragItems = [];
      });
    }

    // Drop targets: each column listens for dragover/drop
    document.querySelectorAll('.column').forEach(colEl => {
      const targetColKey = colEl.dataset.column;

      colEl.addEventListener('dragover', (e) => {
        const sourceCol = state.dragSourceColumn;
        if (!sourceCol) return;
        if (VALID_DROP_MAP[sourceCol] !== targetColKey) return;

        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        colEl.classList.add('column--drop-target');

        const itemEl = closestItem(e.target);
        colEl.querySelectorAll('.list-item--drag-over, .table-row--drag-over').forEach(el => el.classList.remove('list-item--drag-over', 'table-row--drag-over'));
        if (itemEl) {
          itemEl.classList.add(itemEl.classList.contains('table-row') ? 'table-row--drag-over' : 'list-item--drag-over');
        }
      });

      colEl.addEventListener('dragleave', (e) => {
        if (!colEl.contains(e.relatedTarget)) {
          colEl.classList.remove('column--drop-target');
          colEl.querySelectorAll('.list-item--drag-over, .table-row--drag-over').forEach(el => el.classList.remove('list-item--drag-over', 'table-row--drag-over'));
        }
      });

      colEl.addEventListener('drop', (e) => {
        e.preventDefault();
        colEl.classList.remove('column--drop-target');
        colEl.querySelectorAll('.list-item--drag-over, .table-row--drag-over').forEach(el => el.classList.remove('list-item--drag-over', 'table-row--drag-over'));

        const targetItem = closestItem(e.target);
        const targetName = targetItem
          ? (targetItem.querySelector('.list-item__name') || targetItem.querySelector('.table-cell--name'))?.textContent
          : targetColKey;

        let data;
        try {
          data = JSON.parse(e.dataTransfer.getData('text/plain'));
        } catch { return; }

        const sourceCol = data.colKey;
        const count = data.ids.length;
        const labelMap = { accounts: 'account', userGroups: 'user group', users: 'user' };
        const sourceLabel = labelMap[sourceCol] || 'item';

        // Update relationship data
        const targetItemId = targetItem ? targetItem.dataset.id : null;
        applyDrop(sourceCol, targetColKey, data.ids, targetItemId);

        console.log(
          `Dropped ${count} ${sourceLabel}${count > 1 ? 's' : ''} onto ${targetName}`,
          { source: sourceCol, target: targetColKey, ids: data.ids }
        );

        showDropToast(count, sourceLabel, targetName);
      });
    });
  }

  function applyDrop(sourceColKey, targetColKey, sourceIds, targetItemId) {
    if (sourceColKey === 'users' && targetColKey === 'userGroups' && targetItemId) {
      // Dropping users onto a user group
      for (const userId of sourceIds) {
        if (!userToGroups[userId]) userToGroups[userId] = [];
        if (!userToGroups[userId].includes(targetItemId)) {
          userToGroups[userId].push(targetItemId);
        }
        if (!groupToUsers[targetItemId]) groupToUsers[targetItemId] = [];
        if (!groupToUsers[targetItemId].includes(userId)) {
          groupToUsers[targetItemId].push(userId);
        }
      }
      // Update user count on the target group
      const grp = userGroups.find(g => g.id === targetItemId);
      if (grp) grp.userCount = (groupToUsers[targetItemId] || []).length;
    } else if (sourceColKey === 'userGroups' && targetColKey === 'accounts' && targetItemId) {
      // Dropping user groups onto an account
      for (const groupId of sourceIds) {
        if (!groupToAccounts[groupId]) groupToAccounts[groupId] = [];
        if (!groupToAccounts[groupId].includes(targetItemId)) {
          groupToAccounts[groupId].push(targetItemId);
        }
        if (!accountToGroups[targetItemId]) accountToGroups[targetItemId] = [];
        if (!accountToGroups[targetItemId].includes(groupId)) {
          accountToGroups[targetItemId].push(groupId);
        }
        // Update account count on the group
        const grp = userGroups.find(g => g.id === groupId);
        if (grp) grp.accountCount = (groupToAccounts[groupId] || []).length;
      }
    }

    // Recalculate highlights and re-render all columns
    updateRelationshipHighlights();
    updateControlBar();
  }

  function removeFromArray(arr, val) {
    const idx = arr.indexOf(val);
    if (idx !== -1) arr.splice(idx, 1);
  }

  function unassignFromGroup(userIds, groupIds) {
    let count = 0;
    for (const userId of userIds) {
      for (const gId of groupIds) {
        if (userToGroups[userId] && userToGroups[userId].includes(gId)) {
          removeFromArray(userToGroups[userId], gId);
          if (groupToUsers[gId]) removeFromArray(groupToUsers[gId], userId);
          const grp = userGroups.find(g => g.id === gId);
          if (grp) grp.userCount = (groupToUsers[gId] || []).length;
          count++;
        }
      }
    }
    return count;
  }

  function unassignFromAccount(itemIds, accountIds, colKey) {
    let count = 0;
    if (colKey === 'userGroups') {
      for (const gId of itemIds) {
        for (const aId of accountIds) {
          if (groupToAccounts[gId] && groupToAccounts[gId].includes(aId)) {
            removeFromArray(groupToAccounts[gId], aId);
            if (accountToGroups[aId]) removeFromArray(accountToGroups[aId], gId);
            const grp = userGroups.find(g => g.id === gId);
            if (grp) grp.accountCount = (groupToAccounts[gId] || []).length;
            count++;
          }
        }
      }
    } else if (colKey === 'users') {
      for (const userId of itemIds) {
        const userGroupIds = [...(userToGroups[userId] || [])];
        for (const gId of userGroupIds) {
          const grpAccounts = groupToAccounts[gId] || [];
          for (const aId of accountIds) {
            if (grpAccounts.includes(aId)) {
              removeFromArray(userToGroups[userId], gId);
              if (groupToUsers[gId]) removeFromArray(groupToUsers[gId], userId);
              const grp = userGroups.find(g => g.id === gId);
              if (grp) grp.userCount = (groupToUsers[gId] || []).length;
              count++;
            }
          }
        }
      }
    }
    return count;
  }

  function handleUnassignAction(actionKey, itemIds, colKey) {
    let count = 0;
    let targetLabel = '';

    if (actionKey === 'unassignFromGroup') {
      const groupIds = [...state.columns.userGroups.selected];
      count = unassignFromGroup(itemIds, groupIds);
      const grpNames = groupIds.map(id => userGroups.find(g => g.id === id)?.name || id);
      targetLabel = grpNames.length === 1 ? grpNames[0] : `${grpNames.length} groups`;
    } else if (actionKey === 'unassignFromAccount') {
      const accountIds = [...state.columns.accounts.selected];
      count = unassignFromAccount(itemIds, accountIds, colKey);
      const accNames = accountIds.map(id => accounts.find(a => a.id === id)?.name || id);
      targetLabel = accNames.length === 1 ? accNames[0] : `${accNames.length} accounts`;
    }

    if (count > 0) {
      const labelMap = { accounts: 'account', userGroups: 'user group', users: 'user' };
      const typeLabel = labelMap[colKey] || 'item';
      showUnassignToast(itemIds.length, typeLabel, targetLabel);
    }

    ['accounts', 'userGroups', 'users'].forEach(k => applyFilters(k));
    updateRelationshipHighlights();
    updateControlBar();
  }

  function showUnassignToast(count, typeLabel, targetLabel) {
    const text = `Unassigned ${count} ${typeLabel}${count > 1 ? 's' : ''} from ${targetLabel}`;
    showToast(text);
  }

  function showToast(text) {
    const checkSvg = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;"><circle cx="10" cy="10" r="10" fill="#22a861"/><path d="M8.5 13.2 5.3 10l-.9.9 4.1 4.1 8-8-.9-.9z" fill="#fff"/></svg>';
    const closeSvg = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="cursor:pointer;color:var(--themed-reusable-text-secondary);flex-shrink:0;"><path fill="currentColor" d="m8.708 8 3.646-3.646-.707-.708L8 7.293 4.354 3.646l-.708.708L7.293 8l-3.647 3.646.708.708L8 8.707l3.646 3.647.708-.708z"/></svg>';
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; top: 24px; left: 50%; transform: translateX(-50%) translateY(-8px);
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; border-radius: var(--stellar-radius-sm);
      background: var(--themed-surface-level-1-background, #fff);
      color: var(--themed-reusable-text-primary);
      font-family: var(--themed-font-family-body); font-size: 14px; font-weight: 500;
      box-shadow: 0 4px 24px rgba(0,0,0,.12), 0 1px 4px rgba(0,0,0,.08);
      border: 1px solid var(--themed-reusable-border-default, #e5e7eb);
      z-index: 10000; opacity: 0; transition: opacity 0.2s, transform 0.2s;
      white-space: nowrap;
    `;
    toast.innerHTML = `${checkSvg}<span>${text}</span><span class="toast-close">${closeSvg}</span>`;
    document.body.appendChild(toast);
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-8px)';
      setTimeout(() => toast.remove(), 200);
    });
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-8px)';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }

  function showDropToast(count, sourceLabel, targetName) {
    showToast(`Assigned ${count} ${sourceLabel}${count > 1 ? 's' : ''} to ${targetName}`);
  }

  // ─── Column Filters ────────────────────────────────────

  const FILTER_DEFS = {
    accounts: [
      { key: 'edition', label: 'Edition', accessor: item => item.edition },
      { key: 'cloud', label: 'Cloud', accessor: item => item.cloud },
      { key: 'region', label: 'Region', accessor: item => item.region },
      { key: 'tenantType', label: 'Tenant type', accessor: item => item.tenantType },
    ],
    userGroups: [
      { key: 'assignment', label: 'Assignment', accessor: item => {
        return (groupToAccounts[item.id] || []).length === 0 ? 'Unassigned' : 'Assigned';
      }},
    ],
    users: [
      { key: 'status', label: 'Status', accessor: item => item.status || 'Enabled' },
      { key: 'userType', label: 'Type', accessor: item => item.userType },
      { key: 'authMethod', label: 'Auth method', accessor: item => item.authMethod },
      { key: 'mfaEnabled', label: 'MFA', accessor: item => item.mfaEnabled ? 'Enabled' : 'Disabled' },
      { key: 'assignment', label: 'Assignment', accessor: item => {
        return (userToGroups[item.id] || []).length === 0 ? 'Unassigned' : 'Assigned';
      }},
    ],
  };

  const SORT_DEFS = {
    accounts: [
      { key: 'name', label: 'Name' },
      { key: 'edition', label: 'Edition' },
      { key: 'cloud', label: 'Cloud' },
      { key: 'created', label: 'Created' },
    ],
    userGroups: [
      { key: 'name', label: 'Name' },
      { key: 'userCount', label: 'User count' },
      { key: 'accountCount', label: 'Account count' },
      { key: 'created', label: 'Created' },
    ],
    users: [
      { key: 'name', label: 'Name' },
      { key: 'status', label: 'Status' },
      { key: 'userType', label: 'Type' },
      { key: 'authMethod', label: 'Auth method' },
      { key: 'created', label: 'Created' },
    ],
  };

  const activeSort = {
    accounts: { key: 'name', dir: 'asc' },
    userGroups: { key: 'name', dir: 'asc' },
    users: { key: 'name', dir: 'asc' },
  };

  function compareFn(a, b, key, dir) {
    let va = a[key], vb = b[key];
    if (va == null) va = '';
    if (vb == null) vb = '';
    if (typeof va === 'number' && typeof vb === 'number') {
      return dir === 'asc' ? va - vb : vb - va;
    }
    if (key === 'created') {
      const da = new Date(va), db = new Date(vb);
      return dir === 'asc' ? da - db : db - da;
    }
    const sa = String(va).toLowerCase(), sb = String(vb).toLowerCase();
    const cmp = sa.localeCompare(sb);
    return dir === 'asc' ? cmp : -cmp;
  }

  const activeFilters = {
    accounts: {},
    userGroups: {},
    users: {},
  };

  function getFilterOptions(colKey, filterKey) {
    const col = state.columns[colKey];
    const def = FILTER_DEFS[colKey].find(d => d.key === filterKey);
    if (!def) return [];
    const countMap = {};
    for (const item of col.items) {
      const val = def.accessor(item);
      countMap[val] = (countMap[val] || 0) + 1;
    }
    return Object.keys(countMap).sort().map(val => ({ value: val, count: countMap[val] }));
  }

  function buildFilterMenu(colKey) {
    const menuEl = document.getElementById(`${colKey === 'userGroups' ? 'usergroups' : colKey}-filter-menu`);
    if (!menuEl) return;

    const defs = FILTER_DEFS[colKey];
    const chevronSvg = '<svg class="filter-menu__item-chevron" viewBox="0 0 16 16" fill="none"><path fill="currentColor" d="m5.854 2.646 5 5a.5.5 0 0 1 0 .708l-5 5-.708-.707L9.793 8 5.146 3.354z"/></svg>';
    const checkSvg = '<svg class="filter-submenu__check-icon" viewBox="0 0 16 16" fill="none"><path fill="currentColor" d="m13.86 4.847-7.214 7.5a.5.5 0 0 1-.702.018l-4.285-4 .682-.73 3.926 3.663 6.873-7.145z"/></svg>';

    const sortDefs = SORT_DEFS[colKey] || [];
    const currentSort = activeSort[colKey];
    const radioSvg = '<svg class="filter-submenu__check-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" fill="currentColor"/></svg>';

    let html = '';

    // Sort section
    if (sortDefs.length > 0) {
      const sortChevron = '<svg class="filter-menu__item-chevron" viewBox="0 0 16 16" fill="none"><path fill="currentColor" d="m5.854 2.646 5 5a.5.5 0 0 1 0 .708l-5 5-.708-.707L9.793 8 5.146 3.354z"/></svg>';
      const sortLabel = currentSort ? `Sort by ${sortDefs.find(s => s.key === currentSort.key)?.label || 'Name'}` : 'Sort by';
      html += `<div class="filter-menu__item filter-menu__item--sort" data-sort-menu>
        <span>${sortLabel}</span>${sortChevron}
        <div class="filter-submenu">`;
      for (const sd of sortDefs) {
        const isAsc = currentSort && currentSort.key === sd.key && currentSort.dir === 'asc';
        const isDesc = currentSort && currentSort.key === sd.key && currentSort.dir === 'desc';
        html += `<div class="filter-submenu__item sort-submenu__item${isAsc ? ' sort-submenu__item--active' : ''}" data-sort-key="${sd.key}" data-sort-dir="asc">
          <span class="sort-submenu__radio"></span>
          <span>${sd.label} ↑</span>
        </div>`;
        html += `<div class="filter-submenu__item sort-submenu__item${isDesc ? ' sort-submenu__item--active' : ''}" data-sort-key="${sd.key}" data-sort-dir="desc">
          <span class="sort-submenu__radio"></span>
          <span>${sd.label} ↓</span>
        </div>`;
      }
      html += '</div></div>';
      html += '<div class="filter-menu__divider"></div>';
    }

    for (const def of defs) {
      const options = getFilterOptions(colKey, def.key);
      const active = activeFilters[colKey][def.key] || new Set();

      const menuLabel = active.size > 0
        ? `${def.label} (${active.size})`
        : def.label;
      const itemClass = active.size > 0 ? 'filter-menu__item filter-menu__item--active' : 'filter-menu__item';
      html += `<div class="${itemClass}" data-filter-key="${def.key}">
        <span>${menuLabel}</span>${chevronSvg}
        <div class="filter-submenu">`;

      for (const opt of options) {
        const isActive = active.has(opt.value);
        html += `<div class="filter-submenu__item${isActive ? ' filter-submenu__item--active' : ''}" data-filter-key="${def.key}" data-filter-value="${opt.value}">
          <span class="filter-submenu__check">${checkSvg}</span>
          <span>${opt.value}</span>
          <span class="filter-submenu__count">${opt.count}</span>
        </div>`;
      }
      html += '</div></div>';
    }

    const hasActive = Object.values(activeFilters[colKey]).some(s => s && s.size > 0);
    if (hasActive) {
      html += `<div class="filter-menu__clear" data-action="clear">Clear all filters</div>`;
    }

    menuEl.innerHTML = html;
  }

  function applyFilters(colKey) {
    const col = state.columns[colKey];
    const globalQuery = document.getElementById('globalSearch').value.trim().toLowerCase();

    col.filteredItems = applyHighlightOrder(getBaseFilteredItems(col, globalQuery, colKey), col);
    col.scrollEl.scrollTop = 0;
    updateVirtualScroll(colKey);
    updateSelectButtonLabels();

    // Update filter button appearance
    const btnId = `${colKey === 'userGroups' ? 'usergroups' : colKey}-filter-btn`;
    const btn = document.getElementById(btnId);
    let totalActiveCount = 0;
    for (const s of Object.values(activeFilters[colKey])) {
      if (s && s.size > 0) totalActiveCount += s.size;
    }
    const hasActive = totalActiveCount > 0;
    btn.classList.toggle('column__icon-btn--filter-active', hasActive);
    if (hasActive) {
      btn.innerHTML = `<span class="filter-count-badge">${totalActiveCount}</span>`;
    } else {
      btn.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M1.5 3h13v1.003L10 8.838V14l-4-2.5V8.838L1.5 4.003zm1.134 1L7 7.662v3.338l2 1.25V7.662L13.366 4z" clip-rule="evenodd"/></svg>';
    }
  }

  function getMainContentRight() {
    const mc = document.querySelector('.main-content');
    return mc ? mc.getBoundingClientRect().right : window.innerWidth;
  }

  function positionFilterMenu(menuEl) {
    const rect = menuEl.getBoundingClientRect();
    const vw = getMainContentRight();
    const vh = window.innerHeight;

    if (rect.right > vw) {
      menuEl.style.right = '0';
      menuEl.style.left = 'auto';
    }
    if (rect.left < 0) {
      menuEl.style.left = '0';
      menuEl.style.right = 'auto';
    }
    if (rect.bottom > vh) {
      menuEl.style.top = 'auto';
      menuEl.style.bottom = '100%';
      menuEl.style.marginTop = '';
      menuEl.style.marginBottom = '4px';
    }

    // Flip submenus left if they'd overflow the right edge
    const menuRight = menuEl.getBoundingClientRect().right;
    const submenus = menuEl.querySelectorAll('.filter-submenu');
    const needsFlip = menuRight + 170 > vw;
    submenus.forEach(sub => {
      if (needsFlip) {
        sub.classList.add('filter-submenu--flip-left');
      } else {
        sub.classList.remove('filter-submenu--flip-left');
      }
    });

    // Position submenus
    menuEl.querySelectorAll('.filter-menu__item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        const sub = item.querySelector('.filter-submenu');
        if (!sub) return;
        // Reset
        sub.style.left = '100%';
        sub.style.right = '';
        sub.style.top = '-4px';
        sub.style.bottom = '';

        // Force display to measure
        const origDisplay = sub.style.display;
        sub.style.display = 'block';
        const subRect = sub.getBoundingClientRect();
        sub.style.display = origDisplay;

        // If overflows right, flip to left
        if (subRect.right > vw) {
          sub.style.left = 'auto';
          sub.style.right = '100%';
        }
        // If overflows bottom, align to bottom
        if (subRect.bottom > vh) {
          sub.style.top = 'auto';
          sub.style.bottom = '-4px';
        }
      });
    });
  }

  function initFilters() {
    for (const colKey of Object.keys(FILTER_DEFS)) {
      const btnId = `${colKey === 'userGroups' ? 'usergroups' : colKey}-filter-btn`;
      const menuId = `${colKey === 'userGroups' ? 'usergroups' : colKey}-filter-menu`;
      const btn = document.getElementById(btnId);
      const menuEl = document.getElementById(menuId);
      if (!btn || !menuEl) continue;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menuEl.classList.contains('filter-menu--open');

        // Close all filter menus
        document.querySelectorAll('.filter-menu').forEach(m => m.classList.remove('filter-menu--open'));

        if (!isOpen) {
          buildFilterMenu(colKey);
          // Reset position before measuring
          menuEl.style.left = '';
          menuEl.style.right = '0';
          menuEl.style.top = '';
          menuEl.style.bottom = '';
          menuEl.classList.add('filter-menu--open');
          positionFilterMenu(menuEl);
        }
      });

      menuEl.addEventListener('click', (e) => {
        e.stopPropagation();

        const clearEl = e.target.closest('.filter-menu__clear');
        if (clearEl) {
          activeFilters[colKey] = {};
          applyFilters(colKey);
          menuEl.classList.remove('filter-menu--open');
          return;
        }

        // Sort item click
        const sortItem = e.target.closest('[data-sort-key]');
        if (sortItem) {
          activeSort[colKey] = { key: sortItem.dataset.sortKey, dir: sortItem.dataset.sortDir };
          applyFilters(colKey);
          buildFilterMenu(colKey);
          positionFilterMenu(menuEl);
          return;
        }

        const subItem = e.target.closest('.filter-submenu__item');
        if (!subItem) return;

        const filterKey = subItem.dataset.filterKey;
        const filterValue = subItem.dataset.filterValue;

        if (!activeFilters[colKey][filterKey]) {
          activeFilters[colKey][filterKey] = new Set();
        }

        const set = activeFilters[colKey][filterKey];
        if (set.has(filterValue)) {
          set.delete(filterValue);
          if (set.size === 0) delete activeFilters[colKey][filterKey];
        } else {
          set.add(filterValue);
        }

        applyFilters(colKey);
        buildFilterMenu(colKey);
        positionFilterMenu(menuEl);
      });
    }

    // Close menus on outside click
    document.addEventListener('click', () => {
      document.querySelectorAll('.filter-menu').forEach(m => m.classList.remove('filter-menu--open'));
    });
  }

  // ─── Hover Popover ─────────────────────────────────────

  const popoverEl = document.getElementById('itemPopover');
  let popoverTimer = null;
  let popoverVisible = false;
  let popoverCurrentId = null;

  function findItemById(id) {
    for (const colKey of ['accounts', 'userGroups', 'users']) {
      const found = state.columns[colKey].items.find(i => i.id === id);
      if (found) return { item: found, colKey };
    }
    return null;
  }

  function formatRelativeDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const days = Math.floor(diffMs / 86400000);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (rem === 0) return `${years} year${years !== 1 ? 's' : ''} ago`;
    return `${years}y ${rem}m ago`;
  }

  function buildPopoverHTML(item, colKey) {
    const xSvg = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill="currentColor" d="m8.708 8 3.646-3.646-.707-.708L8 7.293 4.354 3.646l-.708.708L7.293 8l-3.647 3.646.708.708L8 8.707l3.646 3.647.708-.708z"/></svg>';

    const ownerSvg = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path fill="currentColor" d="M8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6M6 4a2 2 0 1 1 4 0 2 2 0 0 1-4 0m-2.5 6A1.5 1.5 0 0 0 2 11.5V14h1v-2.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5V14h1v-2.5A1.5 1.5 0 0 0 12.5 10z"/></svg>';
    const peopleIconSvg = '<svg viewBox="0 0 16 16" width="20" height="20" fill="none"><g fill="currentColor"><path d="M8.5 11a1.5 1.5 0 0 1 1.5 1.5V14H9v-1.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0-.5.5V14H1v-1.5A1.5 1.5 0 0 1 2.5 11zm5-2a1.5 1.5 0 0 1 1.5 1.5V12h-1v-1.5a.5.5 0 0 0-.5-.5H11V9z"/><path fill-rule="evenodd" d="M5.5 3a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7m0 1a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5" clip-rule="evenodd"/><path d="M11 2a3 3 0 1 1-1.005 5.824L9.992 7h.012l-.001-.269a2 2 0 1 0-.352-3.206l-.603-.8A3 3 0 0 1 11 2"/></g></svg>';
    const cloudIconSvg = '<svg viewBox="0 0 16 16" width="20" height="20" fill="none"><path fill="currentColor" d="M14 9.5c0-1.312-.997-2.39-2.274-2.52l-.26-.013q-.13 0-.253.012l-.479.047-.066-.475a2.97 2.97 0 0 0-2.66-2.538L7.732 4a2.967 2.967 0 0 0-2.966 2.967l.004.163q.004.08.012.158l.064.594-.596-.041a2 2 0 0 0-.15-.008 2.1 2.1 0 0 0-2.1 2.1l.01.215a2.1 2.1 0 0 0 2.09 1.885h7.354l.151-.004a2.53 2.53 0 0 0 2.382-2.278zm.996.176a3.534 3.534 0 0 1-3.348 3.352l-.012.001-.156.004H4.1a3.1 3.1 0 0 1-3.096-2.94L1 9.933a3.1 3.1 0 0 1 2.767-3.082A3.967 3.967 0 0 1 7.73 3l.187.004a3.97 3.97 0 0 1 3.651 2.965A3.533 3.533 0 0 1 15 9.5z"/></svg>';
    const cloudExternalIconSvg = '<svg viewBox="0 0 16 16" width="20" height="20" fill="none"><g fill="currentColor"><path d="M7.918 3.004 8 3.011v1L7.731 4a2.967 2.967 0 0 0-2.966 2.967l.004.163q.004.08.012.158l.064.594-.596-.041a2 2 0 0 0-.15-.008A2.1 2.1 0 0 0 2 9.933l.01.215a2.1 2.1 0 0 0 2.09 1.885h7.354l.151-.004a2.53 2.53 0 0 0 2.382-2.278L14 9.5a2.52 2.52 0 0 0-.493-1.5h1.159c.214.455.334.964.334 1.5l-.004.176a3.534 3.534 0 0 1-3.348 3.352l-.012.001-.156.004H4.1a3.1 3.1 0 0 1-3.096-2.94L1 9.933a3.1 3.1 0 0 1 2.767-3.082A3.967 3.967 0 0 1 7.73 3z"/><path d="M13.5 2a.5.5 0 0 1 .5.5V7h-1V3.707L7.854 8.854l-.708-.708L12.293 3H9V2z"/></g></svg>';

    if (colKey === 'users') {
      const initials = item.displayName.split(' ').map(w => w[0]).join('').slice(0, 2);
      const statusDotClass = item.status === 'Enabled' ? 'item-popover__status-dot--enabled' : 'item-popover__status-dot--disabled';
      const avatarHtml = item.userType === 'Person' ? `<div class="item-popover__avatar">${initials}</div>` : '';
      return `
        <div class="item-popover__header">
          ${avatarHtml}
          <div class="item-popover__name">${item.name}</div>
          <div class="item-popover__close">${xSvg}</div>
        </div>
        <div class="item-popover__body">
          <div class="item-popover__row">
            <div class="item-popover__label">Display name</div>
            <div class="item-popover__value">${item.displayName || '—'}</div>
          </div>
          <div class="item-popover__row">
            <div class="item-popover__label">Email</div>
            <div class="item-popover__value">${item.email || '—'}</div>
          </div>
          <div class="item-popover__row">
            <div class="item-popover__label">Status</div>
            <div class="item-popover__value">
              <span class="item-popover__status">
                <span class="item-popover__status-dot ${statusDotClass}"></span>
                ${item.status || 'Enabled'}
              </span>
            </div>
          </div>
          <div class="item-popover__row">
            <div class="item-popover__label">MFA</div>
            <div class="item-popover__value">${item.mfaEnabled ? 'Yes' : 'No'}</div>
          </div>
          <div class="item-popover__row">
            <div class="item-popover__label">Authentication</div>
            <div class="item-popover__value">${item.authMethod}</div>
          </div>
          <div class="item-popover__row">
            <div class="item-popover__label">User type</div>
            <div class="item-popover__value">${item.userType}</div>
          </div>
          <div class="item-popover__row">
            <div class="item-popover__label">Owner</div>
            <div class="item-popover__value">
              <span class="item-popover__owner-icon">${ownerSvg} ${item.owner || 'GLOBALORGADMIN'}</span>
            </div>
          </div>
          <div class="item-popover__row">
            <div class="item-popover__label">Created</div>
            <div class="item-popover__value">${item.created ? formatRelativeDate(item.created) : '—'}</div>
          </div>
        </div>`;
    }

    if (colKey === 'accounts') {
      const headerIcon = item.tenantType === 'External' ? cloudExternalIconSvg : cloudIconSvg;
      return `
        <div class="item-popover__header">
          <div class="item-popover__header-icon">${headerIcon}</div>
          <div class="item-popover__name">${item.name}</div>
          <div class="item-popover__close">${xSvg}</div>
        </div>
        <div class="item-popover__body">
          <div class="item-popover__row">
            <div class="item-popover__label">Edition</div>
            <div class="item-popover__value">${item.edition}</div>
          </div>
          <div class="item-popover__row">
            <div class="item-popover__label">Cloud</div>
            <div class="item-popover__value">${item.cloud} ${item.region}</div>
          </div>
          <div class="item-popover__row">
            <div class="item-popover__label">Locator</div>
            <div class="item-popover__value">${item.locator}</div>
          </div>
          <div class="item-popover__row">
            <div class="item-popover__label">Tenant type</div>
            <div class="item-popover__value">${item.tenantType || 'Internal'}</div>
          </div>
          <div class="item-popover__row">
            <div class="item-popover__label">Created</div>
            <div class="item-popover__value">${item.created ? formatRelativeDate(item.created) : '—'}</div>
          </div>
        </div>`;
    }

    if (colKey === 'userGroups') {
      const groups = groupToAccounts[item.id] || [];
      return `
        <div class="item-popover__header">
          <div class="item-popover__header-icon">${peopleIconSvg}</div>
          <div class="item-popover__name">${item.name}</div>
          <div class="item-popover__close">${xSvg}</div>
        </div>
        <div class="item-popover__body">
          <div class="item-popover__row">
            <div class="item-popover__label">Comment</div>
            <div class="item-popover__value">${item.comment || '—'}</div>
          </div>
          <div class="item-popover__row">
            <div class="item-popover__label">Users</div>
            <div class="item-popover__value">${item.userCount}</div>
          </div>
          <div class="item-popover__row">
            <div class="item-popover__label">Accounts</div>
            <div class="item-popover__value">${groups.length}</div>
          </div>
          <div class="item-popover__row">
            <div class="item-popover__label">Owner</div>
            <div class="item-popover__value">${item.owner || '—'}</div>
          </div>
          <div class="item-popover__row">
            <div class="item-popover__label">Created</div>
            <div class="item-popover__value">${item.created ? formatRelativeDate(item.created) : '—'}</div>
          </div>
        </div>`;
    }

    return '';
  }

  function positionPopover(triggerEl) {
    const rect = triggerEl.getBoundingClientRect();
    const pw = 320;
    const popH = popoverEl.offsetHeight || 250;

    let left = rect.right + 8;
    if (left + pw > getMainContentRight() - 12) {
      left = rect.left - pw - 8;
    }
    if (left < 4) left = 4;

    let top = rect.top;
    if (top + popH > window.innerHeight - 12) {
      top = window.innerHeight - 12 - popH;
    }
    if (top < 4) top = 4;

    popoverEl.style.left = left + 'px';
    popoverEl.style.top = top + 'px';
  }

  function showPopover(itemEl, id) {
    const result = findItemById(id);
    if (!result) return;
    popoverCurrentId = id;
    popoverEl.innerHTML = buildPopoverHTML(result.item, result.colKey);
    popoverEl.style.display = 'block';
    positionPopover(itemEl);
    requestAnimationFrame(() => popoverEl.classList.add('item-popover--visible'));
    popoverVisible = true;
  }

  function hidePopover() {
    clearTimeout(popoverTimer);
    popoverTimer = null;
    popoverEl.classList.remove('item-popover--visible');
    popoverVisible = false;
    popoverCurrentId = null;
    setTimeout(() => { popoverEl.style.display = 'none'; }, 150);
  }

  function initPopover() {
    document.querySelectorAll('.column__body').forEach(bodyEl => {
      bodyEl.addEventListener('mouseover', (e) => {
        const itemEl = closestItem(e.target);
        if (!itemEl) return;
        if (itemEl.classList.contains('table-row')) return;
        const id = itemEl.dataset.id;
        if (!id || id === popoverCurrentId) return;

        clearTimeout(popoverTimer);
        if (popoverVisible) hidePopover();
        popoverTimer = setTimeout(() => showPopover(itemEl, id), 400);
      });

      bodyEl.addEventListener('mouseout', (e) => {
        const itemEl = closestItem(e.target);
        if (!itemEl) return;
        const related = e.relatedTarget;
        if (related && closestItem(related) === itemEl) return;
        clearTimeout(popoverTimer);
        popoverTimer = null;
        if (popoverVisible) hidePopover();
      });

      bodyEl.addEventListener('scroll', () => {
        if (popoverVisible) hidePopover();
      }, { passive: true });
    });
  }

  // ─── Inline Item Menu ──────────────────────────────────

  const inlineMenuEl = document.getElementById('itemInlineMenu');
  let inlineMenuOpen = false;
  let inlineMenuBtnEl = null;

  function getColKeyForItem(itemEl) {
    return itemEl.dataset.col || null;
  }

  function getParentContext(colKey) {
    if (colKey === 'userGroups' && state.columns.accounts.selected.size > 0) {
      return { label: 'Unassign from account', key: 'unassignFromAccount' };
    }
    if (colKey === 'users' && state.columns.userGroups.selected.size > 0) {
      return { label: 'Unassign from group', key: 'unassignFromGroup' };
    }
    if (colKey === 'users' && state.columns.accounts.selected.size > 0) {
      return { label: 'Unassign from account', key: 'unassignFromAccount' };
    }
    return null;
  }

  function buildInlineMenuHTML(colKey, itemId) {
    const config = CONTEXTUAL_ACTIONS[colKey];
    if (!config) return '';

    let html = '';

    const parentAction = getParentContext(colKey);
    if (parentAction) {
      html += `<div class="item-inline-menu__item" data-action="${parentAction.key}" data-item-id="${itemId}">${parentAction.label}</div>`;
      html += '<div class="item-inline-menu__divider"></div>';
    }

    for (const btn of config.buttons) {
      html += `<div class="item-inline-menu__item" data-action="${btn.key}" data-item-id="${itemId}">${btn.label}</div>`;
    }

    for (const item of config.overflow) {
      if (item.divider) {
        html += '<div class="item-inline-menu__divider"></div>';
        continue;
      }
      const cls = item.critical ? 'item-inline-menu__item item-inline-menu__item--critical' : 'item-inline-menu__item';
      html += `<div class="${cls}" data-action="${item.key}" data-item-id="${itemId}">${item.label}</div>`;
    }

    return html;
  }

  function positionInlineMenu(triggerEl) {
    const rect = triggerEl.getBoundingClientRect();
    inlineMenuEl.style.left = '';
    inlineMenuEl.style.top = '';

    let top = rect.bottom + 4;
    let left = rect.left;

    inlineMenuEl.classList.add('item-inline-menu--open');
    const menuRect = inlineMenuEl.getBoundingClientRect();

    if (top + menuRect.height > window.innerHeight - 8) {
      top = rect.top - menuRect.height - 4;
    }
    if (top < 4) top = 4;

    if (left + menuRect.width > getMainContentRight() - 8) {
      left = rect.right - menuRect.width;
    }
    if (left < 4) left = 4;

    inlineMenuEl.style.top = top + 'px';
    inlineMenuEl.style.left = left + 'px';
  }

  function openInlineMenu(btnEl, colKey, itemId) {
    closeInlineMenu();
    inlineMenuBtnEl = btnEl;
    btnEl.classList.add('list-item__menu-btn--active');
    inlineMenuEl.innerHTML = buildInlineMenuHTML(colKey, itemId);
    positionInlineMenu(btnEl);
    inlineMenuOpen = true;
  }

  function closeInlineMenu() {
    inlineMenuEl.classList.remove('item-inline-menu--open');
    inlineMenuEl.innerHTML = '';
    inlineMenuOpen = false;
    if (inlineMenuBtnEl) {
      inlineMenuBtnEl.classList.remove('list-item__menu-btn--active');
      inlineMenuBtnEl = null;
    }
  }

  function initItemMenus() {
    document.querySelectorAll('.column__body').forEach(bodyEl => {
      bodyEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-item-menu]');
        if (!btn) return;
        e.stopPropagation();
        e.preventDefault();

        const itemEl = closestItem(btn);
        if (!itemEl) return;
        const colKey = getColKeyForItem(itemEl);
        const itemId = itemEl.dataset.id;
        if (!colKey || !itemId) return;

        if (inlineMenuOpen && inlineMenuBtnEl === btn) {
          closeInlineMenu();
          return;
        }
        openInlineMenu(btn, colKey, itemId);
      }, true);

      bodyEl.addEventListener('scroll', () => {
        if (inlineMenuOpen) closeInlineMenu();
      }, { passive: true });
    });

    inlineMenuEl.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl) return;
      const action = actionEl.dataset.action;
      const itemId = actionEl.dataset.itemId;
      if (!action || !itemId) return;

      const itemEl = document.querySelector(`.list-item[data-id="${itemId}"], .table-row[data-id="${itemId}"]`);
      const colKey = itemEl ? getColKeyForItem(itemEl) : null;

      if (action === 'unassignFromAccount' || action === 'unassignFromGroup') {
        handleUnassignAction(action, [itemId], colKey);
      }

      closeInlineMenu();
    });

    document.addEventListener('click', (e) => {
      if (inlineMenuOpen && !e.target.closest('.item-inline-menu') && !e.target.closest('[data-item-menu]')) {
        closeInlineMenu();
      }
    });
  }

  // ─── Initialize ─────────────────────────────────────────

  function init() {
    initDomRefs();
    initVirtualScroll();
    initSelection();
    initControlBar();
    initSearch();
    initDragDrop();
    initFilters();
    initPopover();
    initItemMenus();
    initSidePanel();
    initColumnVisibility();
    updateColumnActiveState();
  }

  // ─── Column Visibility Toggle ──────────────────────────

  const COL_KEY_TO_EL_ID = { accounts: 'col-accounts', userGroups: 'col-usergroups', users: 'col-users' };
  const columnVisibility = { accounts: true, userGroups: true, users: true };

  function initColumnVisibility() {
    const btn = document.getElementById('colVisibilityBtn');
    const menu = document.getElementById('colVisibilityMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('col-visibility-menu--open');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.col-visibility-trigger')) {
        menu.classList.remove('col-visibility-menu--open');
      }
    });

    menu.querySelectorAll('[data-col-toggle]').forEach(label => {
      const colKey = label.dataset.colToggle;
      const checkbox = label.querySelector('input[type="checkbox"]');

      checkbox.addEventListener('change', () => {
        columnVisibility[colKey] = checkbox.checked;
        applyColumnVisibility();
      });
    });

    applyColumnVisibility();
  }

  function applyColumnVisibility() {
    const visibleKeys = Object.keys(columnVisibility).filter(k => columnVisibility[k]);

    // Enforce minimum 1 visible
    const menu = document.getElementById('colVisibilityMenu');
    menu.querySelectorAll('[data-col-toggle]').forEach(label => {
      const colKey = label.dataset.colToggle;
      const checkbox = label.querySelector('input[type="checkbox"]');
      const isLastVisible = visibleKeys.length === 1 && columnVisibility[colKey];
      label.classList.toggle('col-visibility-menu__item--disabled', isLastVisible);
      checkbox.disabled = isLastVisible;
    });

    // Determine which columns are expanded (table view)
    expandedColumns.clear();
    if (visibleKeys.length === 1) {
      expandedColumns.add(visibleKeys[0]);
    } else if (visibleKeys.length === 2) {
      expandedColumns.add(visibleKeys[1]);
    }

    // Show/hide columns and apply sizing
    for (const colKey of Object.keys(columnVisibility)) {
      const colEl = document.getElementById(COL_KEY_TO_EL_ID[colKey]);
      if (!colEl) continue;
      colEl.classList.toggle('column--hidden', !columnVisibility[colKey]);
      colEl.classList.toggle('column--expanded', expandedColumns.has(colKey));

      if (visibleKeys.length === 2 && columnVisibility[colKey]) {
        const idx = visibleKeys.indexOf(colKey);
        colEl.classList.toggle('column--narrow', idx === 0);
        if (idx !== 0) {
          colEl.classList.remove('column--narrow');
          colEl.style.flex = '1';
        }
      } else {
        colEl.classList.remove('column--narrow');
        colEl.style.flex = '';
      }
    }

    // Mark last visible column
    const allKeys = Object.keys(columnVisibility);
    for (const colKey of allKeys) {
      const colEl = document.getElementById(COL_KEY_TO_EL_ID[colKey]);
      if (colEl) colEl.classList.remove('column--last-visible');
    }
    const lastVisibleKey = visibleKeys[visibleKeys.length - 1];
    if (lastVisibleKey) {
      const lastEl = document.getElementById(COL_KEY_TO_EL_ID[lastVisibleKey]);
      if (lastEl) lastEl.classList.add('column--last-visible');
    }

    // Re-render visible columns
    for (const colKey of visibleKeys) {
      updateVirtualScroll(colKey);
    }
  }

  // ─── Side Panel (resize & collapse) ────────────────────

  function initSidePanel() {
    const panel = document.getElementById('sidePanel');
    const handle = document.getElementById('sidePanelResize');
    const closeBtn = document.getElementById('sidePanelClose');
    if (!panel || !handle) return;

    let dragging = false;
    let startX = 0;
    let startWidth = 0;

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      dragging = true;
      startX = e.clientX;
      startWidth = panel.offsetWidth;
      handle.classList.add('side-panel__resize-handle--active');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const delta = startX - e.clientX;
      const newWidth = Math.min(Math.max(startWidth + delta, 280), window.innerWidth * 0.6);
      panel.style.width = newWidth + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('side-panel__resize-handle--active');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
