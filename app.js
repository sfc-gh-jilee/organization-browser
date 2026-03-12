/**
 * Organization Browser — Main Application
 * Virtual scroll, multi-select, drag-drop, control bar.
 */

(function () {
  'use strict';

  const ITEM_HEIGHT = 56;
  const TABLE_ROW_HEIGHT = 40;
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
        stickyOrder: null,
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
        stickyOrder: null,
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
        stickyOrder: null,
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
      { key: 'tenantType', label: 'TENANT TYPE', flex: 1 },
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
    const arrowUp = '<svg class="table-sort-icon" viewBox="0 0 16 16" width="14" height="14" fill="none"><path fill="currentColor" d="M8 2a.5.5 0 0 1 .354.146l5 5-.707.708L8.5 3.707V14h-1V3.707L3.354 7.854l-.708-.708 5-5A.5.5 0 0 1 8 2"/></svg>';
    const arrowDown = '<svg class="table-sort-icon" viewBox="0 0 16 16" width="14" height="14" fill="none"><path fill="currentColor" d="M8 14a.5.5 0 0 0 .354-.146l5-5-.707-.708L8.5 12.293V2h-1v10.293L3.354 8.146l-.708.708 5 5A.5.5 0 0 0 8 14"/></svg>';

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
    const isTable = expandedColumns.has(colKey);
    const rowHeight = isTable ? TABLE_ROW_HEIGHT : ITEM_HEIGHT;
    const totalHeight = items.length * rowHeight;
    col.spacerEl.style.height = totalHeight + 'px';

    const scrollTop = col.scrollEl.scrollTop;
    const viewHeight = col.scrollEl.clientHeight;

    let startIdx = Math.floor(scrollTop / rowHeight) - BUFFER_COUNT;
    let endIdx = Math.ceil((scrollTop + viewHeight) / rowHeight) + BUFFER_COUNT;
    startIdx = Math.max(0, startIdx);
    endIdx = Math.min(items.length, endIdx);

    const renderer = isTable ? TABLE_RENDERERS[colKey] : RENDERERS[colKey];
    let html = '';
    for (let i = startIdx; i < endIdx; i++) {
      const item = items[i];
      const isSelected = col.selected.has(item.id);
      const isHighlighted = col.highlighted.has(item.id);
      html += renderer(item, isSelected, isHighlighted);
    }

    col.contentEl.style.transform = `translateY(${startIdx * rowHeight}px)`;
    col.contentEl.innerHTML = html;

    if (typeof applyRelatedHoverDom === 'function') applyRelatedHoverDom();

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
        for (const k of Object.keys(state.columns)) state.columns[k].stickyOrder = null;
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

  // Returns IDs of source-column items that are related to the given target item.
  // itemId = highlighted item being sorted; colKey = its column; sourceColKey = column with selections.
  function getRelatedSourceIds(itemId, colKey, sourceColKey) {
    if (sourceColKey === 'accounts') {
      if (colKey === 'userGroups') {
        // group → which accounts link to it
        return groupToAccounts[itemId] || [];
      }
      if (colKey === 'users') {
        // user → groups → accounts
        const result = new Set();
        for (const gId of (userToGroups[itemId] || [])) {
          for (const aId of (groupToAccounts[gId] || [])) result.add(aId);
        }
        return [...result];
      }
    }
    if (sourceColKey === 'userGroups') {
      if (colKey === 'accounts') {
        // account → which groups link to it
        return accountToGroups[itemId] || [];
      }
      if (colKey === 'users') {
        // user → which groups it belongs to
        return userToGroups[itemId] || [];
      }
    }
    if (sourceColKey === 'users') {
      if (colKey === 'userGroups') {
        // group → which users belong to it
        return groupToUsers[itemId] || [];
      }
      if (colKey === 'accounts') {
        // account → groups → users
        const result = new Set();
        for (const gId of (accountToGroups[itemId] || [])) {
          for (const uId of (groupToUsers[gId] || [])) result.add(uId);
        }
        return [...result];
      }
    }
    return [];
  }

  function applyStickyOrder(items, col) {
    const posMap = col.stickyOrder;
    const inSticky = [];
    const notInSticky = [];
    for (const item of items) {
      if (posMap.has(item.id)) inSticky.push(item);
      else notInSticky.push(item);
    }
    inSticky.sort((a, b) => posMap.get(a.id) - posMap.get(b.id));
    return inSticky.concat(notInSticky);
  }

  function applyHighlightOrder(items, col, colKey) {
    const hl = col.highlighted;
    const sel = col.selected;

    // If column has a sticky order from a previous highlight-sort, use it
    if (col.stickyOrder && hl.size === 0) {
      return applyStickyOrder(items, col);
    }

    if (sel.size === 0 && hl.size === 0) return items;

    const highlighted = [];
    const rest = [];
    for (const item of items) {
      if (hl.has(item.id) && !sel.has(item.id)) highlighted.push(item);
      else rest.push(item);
    }

    if (highlighted.length === 0) return items;

    if (state.activeColumn && state.activeColumn !== colKey) {
      const sourceColKey = state.activeColumn;
      const sourceCol = state.columns[sourceColKey];
      const sourceOrder = sourceCol.filteredItems;
      const sourcePositionMap = new Map();
      for (let i = 0; i < sourceOrder.length; i++) {
        sourcePositionMap.set(sourceOrder[i].id, i);
      }

      highlighted.sort((a, b) => {
        const aRels = getRelatedSourceIds(a.id, colKey, sourceColKey);
        const bRels = getRelatedSourceIds(b.id, colKey, sourceColKey);

        let aMin = Infinity;
        for (const relId of aRels) {
          const pos = sourcePositionMap.get(relId);
          if (pos !== undefined && pos < aMin) aMin = pos;
        }
        let bMin = Infinity;
        for (const relId of bRels) {
          const pos = sourcePositionMap.get(relId);
          if (pos !== undefined && pos < bMin) bMin = pos;
        }

        if (aMin !== bMin) return aMin - bMin;
        const aName = (a.name || a.displayName || '').toLowerCase();
        const bName = (b.name || b.displayName || '').toLowerCase();
        return aName.localeCompare(bName);
      });
    }

    return highlighted.concat(rest);
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

  function intersect(sets) {
    if (sets.length === 0) return new Set();
    let result = new Set(sets[0]);
    for (let i = 1; i < sets.length; i++) {
      result = new Set([...result].filter(x => sets[i].has(x)));
    }
    return result;
  }

  function computeHighlightsUnion() {
    const acctHL = new Set();
    const grpHL = new Set();
    const usrHL = new Set();

    const acctSel = state.columns.accounts.selected;
    const grpSel = state.columns.userGroups.selected;
    const usrSel = state.columns.users.selected;

    for (const accId of acctSel) {
      const groups = accountToGroups[accId] || [];
      for (const gId of groups) {
        grpHL.add(gId);
        const usrs = groupToUsers[gId] || [];
        for (const uId of usrs) usrHL.add(uId);
      }
    }

    for (const gId of grpSel) {
      const accs = groupToAccounts[gId] || [];
      for (const aId of accs) acctHL.add(aId);
      const usrs = groupToUsers[gId] || [];
      for (const uId of usrs) usrHL.add(uId);
    }

    for (const uId of usrSel) {
      const groups = userToGroups[uId] || [];
      for (const gId of groups) {
        grpHL.add(gId);
        const accs = groupToAccounts[gId] || [];
        for (const aId of accs) acctHL.add(aId);
      }
    }

    return { acctHL, grpHL, usrHL };
  }

  function computeHighlightsIntersection() {
    const acctSel = state.columns.accounts.selected;
    const grpSel = state.columns.userGroups.selected;
    const usrSel = state.columns.users.selected;

    // Per-item related sets for each selected column
    const grpSets = [];
    const usrSets = [];
    const acctSets = [];

    // Accounts selected → intersect downstream groups & users
    for (const accId of acctSel) {
      const perGrp = new Set();
      const perUsr = new Set();
      for (const gId of (accountToGroups[accId] || [])) {
        perGrp.add(gId);
        for (const uId of (groupToUsers[gId] || [])) perUsr.add(uId);
      }
      grpSets.push(perGrp);
      usrSets.push(perUsr);
    }

    // User groups selected → intersect upstream accounts & downstream users
    for (const gId of grpSel) {
      const perAcct = new Set();
      for (const aId of (groupToAccounts[gId] || [])) perAcct.add(aId);
      acctSets.push(perAcct);
      const perUsr = new Set();
      for (const uId of (groupToUsers[gId] || [])) perUsr.add(uId);
      usrSets.push(perUsr);
    }

    // Users selected → intersect upstream groups & accounts
    for (const uId of usrSel) {
      const perGrp = new Set();
      const perAcct = new Set();
      for (const gId of (userToGroups[uId] || [])) {
        perGrp.add(gId);
        for (const aId of (groupToAccounts[gId] || [])) perAcct.add(aId);
      }
      grpSets.push(perGrp);
      acctSets.push(perAcct);
    }

    return {
      acctHL: intersect(acctSets),
      grpHL: intersect(grpSets),
      usrHL: intersect(usrSets),
    };
  }

  function updateRelationshipHighlights() {
    const acctSel = state.columns.accounts.selected;
    const grpSel = state.columns.userGroups.selected;
    const usrSel = state.columns.users.selected;

    const useIntersection = highlightMode === 'intersection';
    const { acctHL, grpHL, usrHL } = useIntersection
      ? computeHighlightsIntersection()
      : computeHighlightsUnion();

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
      const hasNewHighlights = hlMap[colKey] && hlMap[colKey].size > 0;

      if (hasNewHighlights) {
        activeSort[colKey] = null;
      } else if (!col.stickyOrder && !activeSort[colKey]) {
        activeSort[colKey] = { key: 'name', dir: 'asc' };
      }

      const prevHighlightCount = col.filteredItems.filter(i => col.highlighted.has(i.id)).length;
      col.filteredItems = applyHighlightOrder(getBaseFilteredItems(col, searchQuery, colKey), col, colKey);

      // Snapshot the order when highlights produce a new sort
      if (hasNewHighlights) {
        const orderMap = new Map();
        for (let i = 0; i < col.filteredItems.length; i++) {
          orderMap.set(col.filteredItems[i].id, i);
        }
        col.stickyOrder = orderMap;
      } else if (!col.stickyOrder) {
        // No sticky order and no highlights — normal mode
      }

      const newHighlightCount = hasNewHighlights ? hlMap[colKey].size : 0;
      if (newHighlightCount > 0 && newHighlightCount !== prevHighlightCount) {
        col.scrollEl.scrollTop = 0;
      }
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
        if (isCheckbox) {
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
    users: [
      { key: 'edit', label: 'Edit', icon: 'edit', singleOnly: true },
      { key: 'assignToGroup', label: 'Assign to groups' },
      { key: 'removeFromGroup', label: 'Remove from groups' },
      { key: 'resetPassword', label: 'Reset password', icon: 'reset', singleOnly: true },
      { key: 'disable', label: 'Disable' },
      { divider: true },
      { key: 'drop', label: 'Drop', critical: true },
    ],
    userGroups: [
      { key: 'edit', label: 'Edit', icon: 'edit', singleOnly: true },
      { key: 'assignToAccount', label: 'Assign to accounts' },
      { key: 'removeFromAccount', label: 'Remove from accounts' },
      { divider: true },
      { key: 'drop', label: 'Drop', critical: true },
    ],
    accounts: [
      { key: 'edit', label: 'Edit', icon: 'edit', singleOnly: true },
      { key: 'setTenantType', label: 'Set as external' },
      { divider: true },
      { key: 'drop', label: 'Drop', critical: true },
    ],
  };

  const MAX_VISIBLE_BUTTONS = 2;

  function buildActionButtons(colKey, selectedCount) {
    let allActions = CONTEXTUAL_ACTIONS[colKey];
    if (!allActions) return '';
    const isMulti = selectedCount > 1;

    if (colKey === 'users') {
      const selectedIds = [...state.columns.users.selected];
      const selectedUsers = selectedIds.map(id => state.columns.users.items.find(i => i.id === id)).filter(Boolean);
      const allDisabled = selectedUsers.length > 0 && selectedUsers.every(u => u.status === 'Disabled');
      const allEnabled = selectedUsers.length > 0 && selectedUsers.every(u => u.status === 'Enabled');

      allActions = allActions.map(a => {
        if (a.key !== 'disable') return a;
        if (isMulti) {
          return [
            { key: 'enable', label: 'Enable all selected' },
            { key: 'disable', label: 'Disable all selected' },
          ];
        }
        if (allDisabled) return { key: 'enable', label: 'Enable' };
        return a;
      }).flat();
    }

    if (colKey === 'accounts') {
      const selectedIds = [...state.columns.accounts.selected];
      const selectedAccounts = selectedIds.map(id => state.columns.accounts.items.find(i => i.id === id)).filter(Boolean);
      const allInternal = selectedAccounts.length > 0 && selectedAccounts.every(a => a.tenantType !== 'External');
      const allExternal = selectedAccounts.length > 0 && selectedAccounts.every(a => a.tenantType === 'External');

      allActions = allActions.map(a => {
        if (a.key !== 'setTenantType') return a;
        if (isMulti) {
          return [
            { key: 'setInternal', label: 'Set as internal' },
            { key: 'setExternal', label: 'Set as external' },
          ];
        }
        if (allExternal) return { key: 'setInternal', label: 'Set as internal' };
        return { key: 'setExternal', label: 'Set as external' };
      }).flat();
    }

    if (isMulti) {
      allActions = allActions.map(a => {
        if (a.key === 'drop') return { ...a, label: 'Drop all selected' };
        return a;
      });
    }

    const available = allActions.filter(a => a.divider || !(isMulti && a.singleOnly));

    const promoted = [];
    const overflowActions = [];
    for (const action of available) {
      if (!action.divider && !action.critical && promoted.length < MAX_VISIBLE_BUTTONS) {
        promoted.push(action);
      } else {
        overflowActions.push(action);
      }
    }

    while (overflowActions.length > 0 && overflowActions[0].divider) overflowActions.shift();
    while (overflowActions.length > 0 && overflowActions[overflowActions.length - 1].divider) overflowActions.pop();

    let html = '';

    const parentAction = getParentContext(colKey);
    if (parentAction) {
      html += `<button class="stellar-button stellar-button--secondary" data-bar-action="${parentAction.key}">${parentAction.label}</button>`;
    }

    for (const btn of promoted) {
      html += `<button class="stellar-button stellar-button--secondary" data-bar-action="${btn.key}">${ACTION_ICONS[btn.icon] || ''}${btn.label}</button>`;
    }

    let overflowItems = '';
    for (const item of overflowActions) {
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

    if (overflowActions.length > 0) {
      html += `<div class="stellar-menu-trigger">
        <button class="stellar-button stellar-button--secondary stellar-button--icon-only" data-overflow-trigger>
          ${ACTION_ICONS.overflow}
        </button>
        <div class="stellar-menu action-overflow-menu" role="dialog">
          <div class="stellar-menu__list" role="menu" tabindex="0">
            ${overflowItems}
          </div>
        </div>
      </div>`;
    }

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
  let highlightMode = 'union'; // 'union' | 'intersection'

  function getSelectionIcon(colKey, item) {
    const iconCls = 'selection-title__icon';
    if (colKey === 'accounts') {
      return `<svg class="${iconCls}" viewBox="0 0 16 16" width="20" height="20" fill="none"><path fill="currentColor" d="M14 9.5c0-1.312-.997-2.39-2.274-2.52l-.26-.013q-.13 0-.253.012l-.479.047-.066-.475a2.97 2.97 0 0 0-2.66-2.538L7.732 4a2.967 2.967 0 0 0-2.966 2.967l.004.163q.004.08.012.158l.064.594-.596-.041a2 2 0 0 0-.15-.008 2.1 2.1 0 0 0-2.1 2.1l.01.215a2.1 2.1 0 0 0 2.09 1.885h7.354l.151-.004a2.53 2.53 0 0 0 2.382-2.278zm.996.176a3.534 3.534 0 0 1-3.348 3.352l-.012.001-.156.004H4.1a3.1 3.1 0 0 1-3.096-2.94L1 9.933a3.1 3.1 0 0 1 2.767-3.082A3.967 3.967 0 0 1 7.73 3l.187.004a3.97 3.97 0 0 1 3.651 2.965A3.533 3.533 0 0 1 15 9.5z"/></svg>`;
    }
    if (colKey === 'userGroups') {
      return `<svg class="${iconCls}" viewBox="0 0 16 16" width="20" height="20" fill="none"><g fill="currentColor"><path d="M8.5 11a1.5 1.5 0 0 1 1.5 1.5V14H9v-1.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0-.5.5V14H1v-1.5A1.5 1.5 0 0 1 2.5 11zm5-2a1.5 1.5 0 0 1 1.5 1.5V12h-1v-1.5a.5.5 0 0 0-.5-.5H11V9z"/><path fill-rule="evenodd" d="M5.5 3a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7m0 1a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5" clip-rule="evenodd"/><path d="M11 2a3 3 0 1 1-1.005 5.824L9.992 7h.012l-.001-.269a2 2 0 1 0-.352-3.206l-.603-.8A3 3 0 0 1 11 2"/></g></svg>`;
    }
    if (colKey === 'users' && item && item.userType === 'Person') {
      const initials = (item.displayName || '').split(' ').map(w => w[0]).join('').slice(0, 2);
      return `<div class="selection-title__avatar">${initials}</div>`;
    }
    return '';
  }

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
    const headerEl = document.querySelector('.control-bar__left');
    const createBtn = document.getElementById('createButton');
    const colVisBtn = document.getElementById('colVisibilityTrigger');
    const pillEl = document.getElementById('selectionPill');

    const doneBtn = document.getElementById('selectionDismiss');
    const selDivider = document.getElementById('selectionDivider');

    if (totalSelected > 0) {
      actionsEl.style.display = 'flex';
      headerEl.style.display = 'none';
      createBtn.style.display = 'none';
      colVisBtn.style.display = 'none';
      doneBtn.style.display = '';
      selDivider.style.display = '';

      actionBtnsEl.innerHTML = buildActionButtons(activeColKey, totalSelected);
      currentActionCol = activeColKey;
      initOverflowToggle(actionBtnsEl);
      initBarActions(actionBtnsEl, activeColKey);
      actionBtnsEl.style.display = 'flex';
      actionBtnsEl.style.gap = 'var(--stellar-space-gap-sm)';
      actionBtnsEl.style.alignItems = 'center';

      const labelMap = { accounts: 'Account', userGroups: 'User group', users: 'Org user' };
      const label = labelMap[activeColKey] || 'item';
      let pillText;
      let pillIcon = '';
      if (totalSelected === 1) {
        const selectedId = [...state.columns[activeColKey].selected][0];
        const selectedItem = state.columns[activeColKey].items.find(i => i.id === selectedId);
        pillText = selectedItem ? (selectedItem.name || selectedItem.displayName) : '';
        pillIcon = getSelectionIcon(activeColKey, selectedItem);
      } else {
        pillText = `${totalSelected} ${label}${totalSelected > 1 ? 's' : ''}`;
        pillIcon = getSelectionIcon(activeColKey, null);
      }
      pillEl.innerHTML = pillIcon + `<span>${pillText}</span>`;

      const countsEl = document.getElementById('relationCounts');
      const hlModeTrigger = document.getElementById('highlightModeTrigger');
      const parts = [];

      // Compute counts from raw relationships (before selected-item removal)
      const useIntersection = highlightMode === 'intersection' && totalSelected >= 2;
      const { acctHL: acctCounts, grpHL: grpCounts, usrHL: usrCounts } = useIntersection
        ? computeHighlightsIntersection()
        : computeHighlightsUnion();

      if (activeColKey === 'accounts') {
        parts.push(`${grpCounts.size} group${grpCounts.size !== 1 ? 's' : ''}`);
        parts.push(`${usrCounts.size} user${usrCounts.size !== 1 ? 's' : ''}`);
      } else if (activeColKey === 'userGroups') {
        parts.push(`In ${acctCounts.size} account${acctCounts.size !== 1 ? 's' : ''}`);
        parts.push(`${usrCounts.size} user${usrCounts.size !== 1 ? 's' : ''}`);
      } else if (activeColKey === 'users') {
        parts.push(`In ${grpCounts.size} group${grpCounts.size !== 1 ? 's' : ''}`);
        parts.push(`In ${acctCounts.size} account${acctCounts.size !== 1 ? 's' : ''}`);
      }
      const suffix = totalSelected >= 2
        ? (highlightMode === 'intersection' ? ' in common' : ' combined')
        : '';
      countsEl.textContent = parts.join(' · ') + suffix;

      // Show chevron only for multi-select (dropdown available)
      const chevron = hlModeTrigger.querySelector('.highlight-mode-btn__chevron');
      if (totalSelected >= 2) {
        chevron.style.display = '';
        hlModeTrigger.querySelector('.highlight-mode-btn').style.cursor = 'pointer';
      } else {
        chevron.style.display = 'none';
        hlModeTrigger.querySelector('.highlight-mode-btn').style.cursor = 'default';
      }
    } else {
      actionsEl.style.display = 'none';
      actionBtnsEl.style.display = 'none';
      doneBtn.style.display = 'none';
      selDivider.style.display = 'none';
      actionBtnsEl.innerHTML = '';
      currentActionCol = null;
      headerEl.style.display = '';
      createBtn.style.display = '';
      colVisBtn.style.display = '';
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

  function handleBarAction(action, colKey) {
    const selectedIds = [...state.columns[colKey].selected];
    if (selectedIds.length === 0) return;
    if (action === 'edit' && selectedIds.length === 1) {
      if (colKey === 'users' && window._openEditUserDialog) {
        window._openEditUserDialog(selectedIds[0]);
        return;
      }
      if (colKey === 'userGroups' && window._openEditGroupDialog) {
        window._openEditGroupDialog(selectedIds[0]);
        return;
      }
      if (colKey === 'accounts' && window._openEditAccountDialog) {
        window._openEditAccountDialog(selectedIds[0]);
        return;
      }
    }
    if ((action === 'disable' || action === 'enable') && colKey === 'users' && window._openDisableDialog) {
      window._openDisableDialog(selectedIds, action === 'enable');
      return;
    }
    if (action === 'assignToAccount' && colKey === 'userGroups' && window._openAssignAccountsDialog) {
      window._openAssignAccountsDialog(selectedIds);
      return;
    }
    if (action === 'assignToGroup' && colKey === 'users' && window._openAssignGroupsDialog) {
      window._openAssignGroupsDialog(selectedIds);
      return;
    }
    if ((action === 'removeFromGroup' || action === 'removeFromAccount') && window._openRemoveFromDialog) {
      window._openRemoveFromDialog(action, selectedIds, colKey);
      return;
    }
    if ((action === 'setInternal' || action === 'setExternal') && colKey === 'accounts') {
      const newType = action === 'setInternal' ? 'Internal' : 'External';
      const prevTypes = {};
      for (const id of selectedIds) {
        const acc = state.columns.accounts.items.find(i => i.id === id);
        if (acc) {
          prevTypes[id] = acc.tenantType;
          acc.tenantType = newType;
        }
      }
      applyFilters('accounts');
      updateRelationshipHighlights();
      updateControlBar();
      const count = selectedIds.length;
      const label = count === 1
        ? `Set "${state.columns.accounts.items.find(i => i.id === selectedIds[0])?.name}" as ${newType.toLowerCase()}`
        : `Set ${count} accounts as ${newType.toLowerCase()}`;
      showToast(label, {
        onUndo: () => {
          for (const id of selectedIds) {
            const acc = state.columns.accounts.items.find(i => i.id === id);
            if (acc && prevTypes[id]) acc.tenantType = prevTypes[id];
          }
          applyFilters('accounts');
          updateRelationshipHighlights();
          updateControlBar();
          showToast(`Reverted tenant type change for ${count} account${count > 1 ? 's' : ''}`);
        }
      });
      return;
    }
    handleUnassignAction(action, selectedIds, colKey);
  }

  function initBarActions(container, colKey) {
    container.querySelectorAll('[data-bar-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleBarAction(btn.dataset.barAction, colKey);
      });
    });

    container.querySelectorAll('.action-overflow-menu .stellar-menu__item[data-key]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const menuEl = item.closest('.action-overflow-menu');
        if (menuEl) menuEl.classList.remove('stellar-menu--open');
        handleBarAction(item.dataset.key, colKey);
      });
    });
  }

  document.addEventListener('click', () => {
    document.querySelectorAll('.action-overflow-menu').forEach(m => m.classList.remove('stellar-menu--open'));
  });

  function initControlBar() {
    const dismissBtn = document.getElementById('selectionDismiss');
    dismissBtn.addEventListener('click', () => {
      for (const colKey of Object.keys(state.columns)) {
        state.columns[colKey].selected.clear();
        state.columns[colKey].lastClickIndex = -1;
        state.columns[colKey].stickyOrder = null;
      }
      state.activeColumn = null;
      highlightMode = 'union';
      updateControlBar();
      updateColumnActiveState();
      updateRelationshipHighlights();
    });

    // Highlight mode dropdown
    const hlModeBtn = document.getElementById('highlightModeBtn');
    const hlModeMenu = document.getElementById('highlightModeMenu');

    hlModeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      let totalSel = 0;
      for (const colKey of Object.keys(state.columns)) totalSel += state.columns[colKey].selected.size;
      if (totalSel < 2) return;
      hlModeMenu.classList.toggle('highlight-mode-menu--open');
    });

    hlModeMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.highlight-mode-menu__item');
      if (!item) return;
      const mode = item.dataset.mode;
      if (mode === highlightMode) {
        hlModeMenu.classList.remove('highlight-mode-menu--open');
        return;
      }
      highlightMode = mode;
      hlModeMenu.querySelectorAll('.highlight-mode-menu__item').forEach(el => {
        el.classList.toggle('highlight-mode-menu__item--active', el.dataset.mode === mode);
      });
      hlModeMenu.classList.remove('highlight-mode-menu--open');
      updateRelationshipHighlights();
      updateControlBar();
    });

    document.addEventListener('click', () => {
      hlModeMenu.classList.remove('highlight-mode-menu--open');
    });
  }

  // ─── Search / Filter ───────────────────────────────────

  function applyColumnSearch(colKey) {
    const col = state.columns[colKey];
    const globalQuery = document.getElementById('globalSearch').value.trim().toLowerCase();
    col.filteredItems = applyHighlightOrder(getBaseFilteredItems(col, globalQuery, colKey), col, colKey);
    col.scrollEl.scrollTop = 0;
    updateVirtualScroll(colKey);
  }

  function applyAllColumnSearches() {
    for (const colKey of Object.keys(state.columns)) {
      applyColumnSearch(colKey);
    }
    updateSelectButtonLabels();
  }

  function updateSearchWrapState(colKey) {
    const col = state.columns[colKey];
    const wrap = col.searchEl.closest('.column__search-wrap');
    if (!wrap) return;
    const hasValue = col.searchEl.value.trim().length > 0;
    wrap.classList.toggle('column__search-wrap--has-value', hasValue);
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
      const wrap = col.searchEl.closest('.column__search-wrap');
      let colDebounce;

      col.searchEl.addEventListener('input', () => {
        updateSearchWrapState(colKey);
        clearTimeout(colDebounce);
        colDebounce = setTimeout(() => {
          applyColumnSearch(colKey);
          updateSelectButtonLabels();
        }, 150);
      });

      col.searchEl.addEventListener('focus', () => {
        if (wrap) wrap.classList.add('column__search-wrap--focused');
      });

      col.searchEl.addEventListener('blur', () => {
        if (wrap) wrap.classList.remove('column__search-wrap--focused');
      });
    }

    document.querySelectorAll('[data-search-clear]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const colKey = btn.dataset.searchClear;
        const col = state.columns[colKey];
        if (!col) return;
        col.searchEl.value = '';
        updateSearchWrapState(colKey);
        applyColumnSearch(colKey);
        updateSelectButtonLabels();
        col.searchEl.focus();
      });
    });
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

        // Dismiss popovers (including pending timer) and menus
        clearTimeout(popoverTimer);
        popoverTimer = null;
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
    showToast(text, {
      onUndo: () => showToast(`Reverted unassignment of ${count} ${typeLabel}${count > 1 ? 's' : ''} from ${targetLabel}`)
    });
  }

  function showToast(text, opts = {}) {
    const checkSvg = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;"><circle cx="10" cy="10" r="10" fill="#22a861"/><path d="M8.5 13.2 5.3 10l-.9.9 4.1 4.1 8-8-.9-.9z" fill="#fff"/></svg>';
    const closeSvg = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="cursor:pointer;color:var(--themed-reusable-text-secondary);flex-shrink:0;"><path fill="currentColor" d="m8.708 8 3.646-3.646-.707-.708L8 7.293 4.354 3.646l-.708.708L7.293 8l-3.647 3.646.708.708L8 8.707l3.646 3.647.708-.708z"/></svg>';
    const undoIcon = '<svg class="stellar-button__icon" viewBox="0 0 16 16" fill="none"><path fill="currentColor" d="M2 6.5c0 .133.053.26.146.354l3 3 .708-.708L3.707 7H10.5C11.881 7 13 8.119 13 9.5S11.881 12 10.5 12H7.5v1h3C12.433 13 14 11.433 14 9.5S12.433 6 10.5 6H3.707l2.147-2.146-.708-.708-3 3A.5.5 0 0 0 2 6.5z"/></svg>';
    const undoHtml = opts.onUndo
      ? `<button class="stellar-button stellar-button--secondary stellar-button--small toast-undo">${undoIcon}Undo</button>`
      : '';
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
    toast.innerHTML = `${checkSvg}<span>${text}</span>${undoHtml}<span class="toast-close">${closeSvg}</span>`;
    document.body.appendChild(toast);

    const dismissToast = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-8px)';
      setTimeout(() => toast.remove(), 200);
    };

    toast.querySelector('.toast-close').addEventListener('click', dismissToast);

    if (opts.onUndo) {
      toast.querySelector('.toast-undo').addEventListener('click', () => {
        opts.onUndo();
        dismissToast();
      });
    }

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
    }, 5000);
  }

  function showDropToast(count, sourceLabel, targetName) {
    showToast(`Assigned ${count} ${sourceLabel}${count > 1 ? 's' : ''} to ${targetName}`, {
      onUndo: () => showToast(`Reverted assignment of ${count} ${sourceLabel}${count > 1 ? 's' : ''} to ${targetName}`)
    });
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

    col.filteredItems = applyHighlightOrder(getBaseFilteredItems(col, globalQuery, colKey), col, colKey);
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
        if (state.dragSourceColumn) return;
        const itemEl = closestItem(e.target);
        if (!itemEl) return;
        if (itemEl.classList.contains('table-row')) return;
        const id = itemEl.dataset.id;
        if (!id || id === popoverCurrentId) return;

        const isSelected = Object.values(state.columns).some(c => c.selected.has(id));
        if (isSelected) {
          clearTimeout(popoverTimer);
          if (popoverVisible) hidePopover();
          return;
        }

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
    const actions = CONTEXTUAL_ACTIONS[colKey];
    if (!actions) return '';

    let html = '';

    const parentAction = getParentContext(colKey);
    if (parentAction) {
      html += `<div class="item-inline-menu__item" data-action="${parentAction.key}" data-item-id="${itemId}">${parentAction.label}</div>`;
      html += '<div class="item-inline-menu__divider"></div>';
    }

    for (const item of actions) {
      if (item.divider) {
        html += '<div class="item-inline-menu__divider"></div>';
        continue;
      }
      let actionKey = item.key;
      let actionLabel = item.label;
      if (item.key === 'disable' && colKey === 'users') {
        const user = state.columns.users.items.find(i => i.id === itemId);
        if (user && user.status === 'Disabled') {
          actionKey = 'enable';
          actionLabel = 'Enable';
        }
      }
      if (item.key === 'setTenantType' && colKey === 'accounts') {
        const acc = state.columns.accounts.items.find(i => i.id === itemId);
        if (acc && acc.tenantType === 'External') {
          actionKey = 'setInternal';
          actionLabel = 'Set as internal';
        } else {
          actionKey = 'setExternal';
          actionLabel = 'Set as external';
        }
      }
      const cls = item.critical ? 'item-inline-menu__item item-inline-menu__item--critical' : 'item-inline-menu__item';
      html += `<div class="${cls}" data-action="${actionKey}" data-item-id="${itemId}">${actionLabel}</div>`;
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
      } else if (action === 'edit' && colKey === 'users' && window._openEditUserDialog) {
        window._openEditUserDialog(itemId);
      } else if (action === 'edit' && colKey === 'userGroups' && window._openEditGroupDialog) {
        window._openEditGroupDialog(itemId);
      } else if (action === 'edit' && colKey === 'accounts' && window._openEditAccountDialog) {
        window._openEditAccountDialog(itemId);
      } else if ((action === 'disable' || action === 'enable') && colKey === 'users' && window._openDisableDialog) {
        window._openDisableDialog([itemId], action === 'enable');
      } else if (action === 'assignToAccount' && colKey === 'userGroups' && window._openAssignAccountsDialog) {
        window._openAssignAccountsDialog([itemId]);
      } else if (action === 'assignToGroup' && colKey === 'users' && window._openAssignGroupsDialog) {
        window._openAssignGroupsDialog([itemId]);
      } else if ((action === 'removeFromGroup' || action === 'removeFromAccount') && window._openRemoveFromDialog) {
        window._openRemoveFromDialog(action, [itemId], colKey);
      } else if ((action === 'setInternal' || action === 'setExternal') && colKey === 'accounts') {
        const newType = action === 'setInternal' ? 'Internal' : 'External';
        const acc = state.columns.accounts.items.find(i => i.id === itemId);
        if (acc) {
          const prevType = acc.tenantType;
          acc.tenantType = newType;
          applyFilters('accounts');
          updateRelationshipHighlights();
          updateControlBar();
          showToast(`Set "${acc.name}" as ${newType.toLowerCase()}`, {
            onUndo: () => {
              acc.tenantType = prevType;
              applyFilters('accounts');
              updateRelationshipHighlights();
              updateControlBar();
              showToast(`Reverted tenant type for "${acc.name}"`);
            }
          });
        }
      }

      closeInlineMenu();
    });

    document.addEventListener('click', (e) => {
      if (inlineMenuOpen && !e.target.closest('.item-inline-menu') && !e.target.closest('[data-item-menu]')) {
        closeInlineMenu();
      }
    });
  }

  // ─── Cross-Column Related Hover ─────────────────────────

  let relatedHoverState = { active: false, sourceColKey: null, sourceItemId: null, relatedMap: null };

  function getRelatedIdsForItem(itemId, colKey) {
    const ids = { accounts: new Set(), userGroups: new Set(), users: new Set() };

    if (colKey === 'accounts') {
      const groups = accountToGroups[itemId] || [];
      for (const gId of groups) {
        ids.userGroups.add(gId);
        for (const uId of (groupToUsers[gId] || [])) ids.users.add(uId);
      }
    } else if (colKey === 'userGroups') {
      for (const aId of (groupToAccounts[itemId] || [])) ids.accounts.add(aId);
      for (const uId of (groupToUsers[itemId] || [])) ids.users.add(uId);
    } else if (colKey === 'users') {
      const groups = userToGroups[itemId] || [];
      for (const gId of groups) {
        ids.userGroups.add(gId);
        for (const aId of (groupToAccounts[gId] || [])) ids.accounts.add(aId);
      }
    }

    return ids;
  }

  function clearRelatedHoverDom() {
    document.querySelectorAll('.list-item--related-hover, .table-row--related-hover').forEach(el => {
      el.classList.remove('list-item--related-hover', 'table-row--related-hover');
    });
  }

  let relatedHoverTimer = null;
  let relatedClearTimer = null;
  const RELATED_HOVER_DELAY = 400;

  function clearRelatedHover() {
    clearTimeout(relatedHoverTimer);
    relatedHoverTimer = null;
    if (!relatedHoverState.active) return;
    clearRelatedHoverDom();
    relatedHoverState = { active: false, sourceColKey: null, sourceItemId: null, relatedMap: null };
  }

  function applyRelatedHoverDom() {
    if (!relatedHoverState.active) return;
    const { relatedMap, sourceColKey } = relatedHoverState;
    for (const colKey of Object.keys(relatedMap)) {
      if (colKey === sourceColKey) continue;
      const idSet = relatedMap[colKey];
      if (idSet.size === 0) continue;
      const col = state.columns[colKey];
      const hlSet = col.highlighted;
      col.contentEl.querySelectorAll('.list-item, .table-row').forEach(el => {
        const id = el.dataset.id;
        if (idSet.has(id) && (hlSet.has(id) || col.selected.has(id))) {
          el.classList.add(el.classList.contains('table-row') ? 'table-row--related-hover' : 'list-item--related-hover');
        }
      });
    }
  }

  function setRelatedHover(itemId, colKey) {
    clearRelatedHoverDom();
    const relatedMap = getRelatedIdsForItem(itemId, colKey);
    relatedHoverState = { active: true, sourceColKey: colKey, sourceItemId: itemId, relatedMap };
    applyRelatedHoverDom();
  }

  function scheduleRelatedHover(itemId, colKey) {
    clearTimeout(relatedClearTimer);
    relatedClearTimer = null;
    if (relatedHoverState.active && relatedHoverState.sourceItemId === itemId) return;
    clearTimeout(relatedHoverTimer);
    relatedHoverTimer = setTimeout(() => {
      relatedHoverTimer = null;
      setRelatedHover(itemId, colKey);
    }, RELATED_HOVER_DELAY);
  }

  function scheduleClearRelatedHover() {
    clearTimeout(relatedHoverTimer);
    relatedHoverTimer = null;
    clearRelatedHover();
  }

  function initRelatedHover() {
    for (const colKey of Object.keys(state.columns)) {
      const col = state.columns[colKey];
      col.contentEl.addEventListener('mouseover', (e) => {
        if (state.dragSourceColumn) return;
        const itemEl = closestItem(e.target);
        if (!itemEl) { scheduleClearRelatedHover(); return; }

        const id = itemEl.dataset.id;
        if (!id || !(col.highlighted.has(id) || col.selected.has(id))) { scheduleClearRelatedHover(); return; }

        scheduleRelatedHover(id, colKey);
      });

      col.contentEl.addEventListener('mouseleave', () => {
        scheduleClearRelatedHover();
      });
    }
  }

  // ─── Initialize ─────────────────────────────────────────

  function buildSkeletonHTML(rowCount, colKey) {
    const widths = ['skeleton-line--long', 'skeleton-line--medium', 'skeleton-line--short'];
    let html = '';
    for (let i = 0; i < rowCount; i++) {
      const w1 = widths[i % widths.length];
      const w2 = widths[(i + 1) % widths.length];
      const d = i * 60;
      let leading = '';
      if (colKey === 'users') {
        leading = `<div class="skeleton-dot" style="animation-delay:${d}ms"></div>
          <div class="skeleton-circle" style="animation-delay:${d}ms"></div>`;
      } else {
        leading = `<div class="skeleton-icon" style="animation-delay:${d}ms"></div>`;
      }
      html += `<div class="skeleton-row" style="animation-delay:${d}ms">
        ${leading}
        <div class="skeleton-lines">
          <div class="skeleton-line ${w1}" style="animation-delay:${d + 100}ms"></div>
          <div class="skeleton-line ${w2}" style="animation-delay:${d + 200}ms"></div>
        </div>
      </div>`;
    }
    return html;
  }

  function initSkeletonLoading() {
    const delays = {
      accounts: 1600 + Math.random() * 2400,
      userGroups: 1200 + Math.random() * 1600,
      users: 2000 + Math.random() * 3000,
    };

    for (const colKey of Object.keys(state.columns)) {
      const col = state.columns[colKey];
      const skeleton = document.createElement('div');
      skeleton.className = 'column__skeleton';
      skeleton.innerHTML = buildSkeletonHTML(12, colKey);
      col.scrollEl.appendChild(skeleton);

      col.spacerEl.style.visibility = 'hidden';
      col.contentEl.style.visibility = 'hidden';
      if (col.countEl) col.countEl.style.visibility = 'hidden';

      setTimeout(() => {
        skeleton.classList.add('column__skeleton--hidden');
        col.spacerEl.style.visibility = '';
        col.contentEl.style.visibility = '';
        if (col.countEl) col.countEl.style.visibility = '';
        setTimeout(() => skeleton.remove(), 300);
      }, delays[colKey]);
    }
  }

  // ─── Org User Dialog (Create / Edit) ────────────────────

  let userDialogMode = 'create';
  let userDialogEditId = null;

  function initUserDialog() {
    const backdrop = document.getElementById('createUserBackdrop');
    const titleEl = document.getElementById('createUserTitle');
    const cancelBtn = document.getElementById('createUserCancel');
    const submitBtn = document.getElementById('createUserSubmit');
    const checkbox = document.getElementById('resetPasswordCheckbox');
    const checkboxRow = checkbox ? checkbox.closest('.dialog__checkbox-row') : null;
    if (!backdrop) return;

    const inputs = backdrop.querySelectorAll('.stellar-textinput__input');
    const [firstNameInput, lastNameInput, loginInput, displayInput, emailInput, passwordInput, confirmPasswordInput] = inputs;

    function openCreateDialog() {
      userDialogMode = 'create';
      userDialogEditId = null;
      titleEl.textContent = 'Create Org user';
      submitBtn.textContent = 'Create';
      inputs.forEach(inp => { inp.value = ''; });
      if (checkboxRow) checkboxRow.style.display = '';
      if (!checkbox.classList.contains('dialog__checkbox--checked')) {
        checkbox.classList.add('dialog__checkbox--checked');
      }
      passwordInput.closest('.dialog__row').style.display = '';
      backdrop.style.display = 'flex';
      setTimeout(() => firstNameInput.focus(), 50);
    }

    function openEditDialog(userId) {
      const result = findItemById(userId);
      if (!result || result.colKey !== 'users') return;
      const user = result.item;

      userDialogMode = 'edit';
      userDialogEditId = userId;
      titleEl.textContent = 'Edit Org user';
      submitBtn.textContent = 'Save';

      const nameParts = (user.displayName || '').split(' ');
      firstNameInput.value = nameParts[0] || '';
      lastNameInput.value = nameParts.slice(1).join(' ') || '';
      loginInput.value = user.name || '';
      displayInput.value = user.displayName || '';
      emailInput.value = user.email || '';
      passwordInput.closest('.dialog__row').style.display = 'none';
      if (checkboxRow) checkboxRow.style.display = 'none';

      backdrop.style.display = 'flex';
      setTimeout(() => firstNameInput.focus(), 50);
    }

    function closeDialog() {
      backdrop.style.display = 'none';
      inputs.forEach(inp => { inp.value = ''; });
    }

    // Expose for external callers
    window._openEditUserDialog = openEditDialog;

    const splitActionBtn = document.querySelector('#createButton .stellar-splitbutton__action');
    if (splitActionBtn) {
      splitActionBtn.addEventListener('click', () => {
        const label = splitActionBtn.textContent.trim();
        if (label === 'Create Org user') openCreateDialog();
      });
    }

    const createUserMenuItem = document.querySelector('#createButton .stellar-menu__item[data-key="create-user"]');
    if (createUserMenuItem) {
      createUserMenuItem.addEventListener('click', () => openCreateDialog());
    }

    cancelBtn.addEventListener('click', closeDialog);

    submitBtn.addEventListener('click', () => {
      closeDialog();
      if (userDialogMode === 'edit') {
        showToast('Org user updated successfully');
      } else {
        showToast('Org user created successfully');
      }
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeDialog();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.style.display !== 'none') closeDialog();
    });

    if (checkboxRow) {
      checkboxRow.addEventListener('click', () => {
        checkbox.classList.toggle('dialog__checkbox--checked');
      });
    }
  }

  // ─── Disable / Enable User Dialog ───────────────────────

  function initDisableDialog() {
    const backdrop = document.getElementById('disableDialogBackdrop');
    const titleEl = document.getElementById('disableDialogTitle');
    const messageEl = document.getElementById('disableDialogMessage');
    const userListEl = document.getElementById('disableDialogUserList');
    const cancelBtn = document.getElementById('disableDialogCancel');
    const submitBtn = document.getElementById('disableDialogSubmit');
    if (!backdrop) return;

    let pendingUserIds = [];
    let isEnabling = false;

    function openDialog(userIds, forceEnable) {
      pendingUserIds = userIds;
      const users = userIds.map(id => state.columns.users.items.find(i => i.id === id)).filter(Boolean);
      if (users.length === 0) return;

      isEnabling = forceEnable != null ? forceEnable : users.every(u => u.status === 'Disabled');
      const action = isEnabling ? 'enable' : 'disable';
      const Action = isEnabling ? 'Enable' : 'Disable';

      if (users.length === 1) {
        titleEl.textContent = `${Action} user`;
        messageEl.textContent = `Are you sure you want to ${action} ${users[0].name}? ${isEnabling
          ? 'They will be able to sign in to accounts in the organization again.'
          : 'They will no longer be able to sign in to any account in the organization.'}`;
        userListEl.style.display = 'none';
      } else {
        titleEl.textContent = `${Action} ${users.length} users`;
        messageEl.textContent = `Are you sure you want to ${action} these ${users.length} users? ${isEnabling
          ? 'They will be able to sign in to accounts in the organization again.'
          : 'They will no longer be able to sign in to any account in the organization.'}`;
        userListEl.innerHTML = users.map(u => `<span class="dialog__user-list-item">${u.name}</span>`).join('');
        userListEl.style.display = '';
      }

      submitBtn.textContent = Action;
      submitBtn.className = isEnabling
        ? 'stellar-button stellar-button--primary'
        : 'stellar-button stellar-button--critical';

      backdrop.style.display = 'flex';
    }

    function closeDialog() {
      backdrop.style.display = 'none';
      pendingUserIds = [];
    }

    function applyStatusChange() {
      const newStatus = isEnabling ? 'Enabled' : 'Disabled';
      const prevStatuses = {};
      for (const id of pendingUserIds) {
        const user = state.columns.users.items.find(i => i.id === id);
        if (user) {
          prevStatuses[id] = user.status;
          user.status = newStatus;
        }
      }
      applyFilters('users');
      updateVirtualScroll('users');
      updateRelationshipHighlights();

      const count = pendingUserIds.length;
      const action = isEnabling ? 'Enabled' : 'Disabled';
      const label = count === 1
        ? `${action} ${state.columns.users.items.find(i => i.id === pendingUserIds[0])?.name || 'user'}`
        : `${action} ${count} users`;

      const savedIds = [...pendingUserIds];
      showToast(label, {
        onUndo: () => {
          for (const id of savedIds) {
            const user = state.columns.users.items.find(i => i.id === id);
            if (user && prevStatuses[id]) user.status = prevStatuses[id];
          }
          applyFilters('users');
          updateVirtualScroll('users');
          showToast(`Reverted status change for ${count} user${count > 1 ? 's' : ''}`);
        }
      });
    }

    window._openDisableDialog = openDialog;

    cancelBtn.addEventListener('click', closeDialog);
    submitBtn.addEventListener('click', () => {
      applyStatusChange();
      closeDialog();
    });
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeDialog();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.style.display !== 'none') closeDialog();
    });
  }

  // ─── Remove From Confirmation Dialog ────────────────────

  function initRemoveFromDialog() {
    const backdrop = document.getElementById('removeFromBackdrop');
    const titleEl = document.getElementById('removeFromTitle');
    const badgesEl = document.getElementById('removeFromBadges');
    const messageEl = document.getElementById('removeFromMessage');
    const parentListEl = document.getElementById('removeFromParentList');
    const cancelBtn = document.getElementById('removeFromCancel');
    const submitBtn = document.getElementById('removeFromSubmit');
    if (!backdrop) return;

    const userIcon = '<svg class="dialog__badge-icon" viewBox="0 0 16 16" fill="none"><path fill="currentColor" d="M8 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6M6 5a2 2 0 1 1 4 0 2 2 0 0 1-4 0m-2.5 9v-1.5A1.5 1.5 0 0 1 5 11h6a1.5 1.5 0 0 1 1.5 1.5V14h-1v-1.5a.5.5 0 0 0-.5-.5H5a.5.5 0 0 0-.5.5V14z"/></svg>';
    const groupIcon = '<svg class="dialog__badge-icon" viewBox="0 0 16 16" fill="none"><g fill="currentColor"><path d="M8.5 11a1.5 1.5 0 0 1 1.5 1.5V14H9v-1.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0-.5.5V14H1v-1.5A1.5 1.5 0 0 1 2.5 11zm5-2a1.5 1.5 0 0 1 1.5 1.5V12h-1v-1.5a.5.5 0 0 0-.5-.5H11V9z"/><path fill-rule="evenodd" d="M5.5 3a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7m0 1a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5" clip-rule="evenodd"/><path d="M11 2a3 3 0 1 1-1.005 5.824L9.992 7h.012l-.001-.269a2 2 0 1 0-.352-3.206l-.603-.8A3 3 0 0 1 11 2"/></g></svg>';
    const accountIcon = '<svg class="dialog__badge-icon" viewBox="0 0 16 16" fill="none"><path fill="currentColor" d="M14 9.5c0-1.312-.997-2.39-2.274-2.52l-.26-.013q-.13 0-.253.012l-.479.047-.066-.475a2.97 2.97 0 0 0-2.66-2.538L7.732 4a2.967 2.967 0 0 0-2.966 2.967l.004.163q.004.08.012.158l.064.594-.596-.041a2 2 0 0 0-.15-.008 2.1 2.1 0 0 0-2.1 2.1l.01.215a2.1 2.1 0 0 0 2.09 1.885h7.354l.151-.004a2.53 2.53 0 0 0 2.382-2.278zm.996.176a3.534 3.534 0 0 1-3.348 3.352l-.012.001-.156.004H4.1a3.1 3.1 0 0 1-3.096-2.94L1 9.933a3.1 3.1 0 0 1 2.767-3.082A3.967 3.967 0 0 1 7.73 3l.187.004a3.97 3.97 0 0 1 3.651 2.965A3.533 3.533 0 0 1 15 9.5z"/></svg>';

    let pendingAction = null;

    function openDialog(actionType, itemIds, colKey) {
      const isRemoveFromGroups = actionType === 'removeFromGroup';
      const items = itemIds.map(id => state.columns[colKey].items.find(i => i.id === id)).filter(Boolean);
      if (items.length === 0) return;

      // Collect affected parents
      const parentIds = new Set();
      if (isRemoveFromGroups) {
        for (const id of itemIds) {
          for (const gId of (userToGroups[id] || [])) parentIds.add(gId);
        }
      } else {
        for (const id of itemIds) {
          for (const aId of (groupToAccounts[id] || [])) parentIds.add(aId);
        }
      }

      if (parentIds.size === 0) {
        const parentLabel = isRemoveFromGroups ? 'groups' : 'accounts';
        const typeLabel = isRemoveFromGroups ? 'user' : 'group';
        showToast(`Selected ${typeLabel}${items.length > 1 ? 's are' : ' is'} not assigned to any ${parentLabel}`);
        return;
      }

      // Build badge chips for selected items
      const badgeIcon = isRemoveFromGroups ? userIcon : groupIcon;
      if (items.length === 1) {
        const name = items[0].name || items[0].displayName;
        badgesEl.innerHTML = `<span class="dialog__badge">${badgeIcon} ${name}</span>`;
      } else {
        const typeLabel = isRemoveFromGroups ? 'Org users' : 'Org user groups';
        badgesEl.innerHTML = `<span class="dialog__badge">${badgeIcon} ${items.length} ${typeLabel}</span>`;
      }

      // Title
      const parentTypeLabel = isRemoveFromGroups ? 'groups' : 'accounts';
      titleEl.textContent = `Remove from ${parentTypeLabel}`;

      // Message + parent list
      const parentPlural = parentIds.size === 1
        ? (isRemoveFromGroups ? 'group' : 'account')
        : (isRemoveFromGroups ? 'groups' : 'accounts');
      messageEl.textContent = `Will be removed from ${parentIds.size} ${parentPlural}:`;

      const parentIcon = isRemoveFromGroups ? groupIcon : accountIcon;
      const parentItems = [...parentIds].map(id => {
        if (isRemoveFromGroups) {
          const g = userGroups.find(g => g.id === id);
          return g ? g.name : id;
        } else {
          const a = accounts.find(a => a.id === id);
          return a ? a.name : id;
        }
      });
      parentListEl.innerHTML = parentItems.map(name =>
        `<span class="dialog__user-list-item">${parentIcon} ${name}</span>`
      ).join('');
      parentListEl.style.display = '';

      pendingAction = { actionType, itemIds: [...itemIds], colKey };
      backdrop.style.display = 'flex';
    }

    function closeDialog() {
      backdrop.style.display = 'none';
      pendingAction = null;
    }

    function applyRemoval() {
      if (!pendingAction) return;
      const { actionType, itemIds, colKey } = pendingAction;
      const isRemoveFromGroups = actionType === 'removeFromGroup';

      const prevState = {};
      let totalRemoved = 0;

      if (isRemoveFromGroups) {
        for (const userId of itemIds) {
          const groups = [...(userToGroups[userId] || [])];
          prevState[userId] = groups;
          for (const gId of groups) {
            removeFromArray(userToGroups[userId], gId);
            if (groupToUsers[gId]) removeFromArray(groupToUsers[gId], userId);
            const grp = userGroups.find(g => g.id === gId);
            if (grp) grp.userCount = (groupToUsers[gId] || []).length;
            totalRemoved++;
          }
        }
      } else {
        for (const gId of itemIds) {
          const accts = [...(groupToAccounts[gId] || [])];
          prevState[gId] = accts;
          for (const aId of accts) {
            removeFromArray(groupToAccounts[gId], aId);
            if (accountToGroups[aId]) removeFromArray(accountToGroups[aId], gId);
            const grp = userGroups.find(g => g.id === gId);
            if (grp) grp.accountCount = (groupToAccounts[gId] || []).length;
            totalRemoved++;
          }
        }
      }

      ['accounts', 'userGroups', 'users'].forEach(k => applyFilters(k));
      updateRelationshipHighlights();
      updateControlBar();

      const parentLabel = isRemoveFromGroups ? 'group' : 'account';
      const typeLabel = isRemoveFromGroups ? 'user' : 'group';
      const names = itemIds.map(id => {
        const item = state.columns[colKey].items.find(i => i.id === id);
        return item ? (item.name || item.displayName) : id;
      });
      const subjectText = names.length === 1 ? names[0] : `${names.length} ${typeLabel}s`;
      const toastText = `Removed ${subjectText} from ${totalRemoved} ${totalRemoved === 1 ? parentLabel : parentLabel + 's'}`;

      showToast(toastText, {
        onUndo: () => {
          if (isRemoveFromGroups) {
            for (const userId of itemIds) {
              const groups = prevState[userId] || [];
              userToGroups[userId] = groups;
              for (const gId of groups) {
                if (!groupToUsers[gId]) groupToUsers[gId] = [];
                if (!groupToUsers[gId].includes(userId)) groupToUsers[gId].push(userId);
                const grp = userGroups.find(g => g.id === gId);
                if (grp) grp.userCount = (groupToUsers[gId] || []).length;
              }
            }
          } else {
            for (const gId of itemIds) {
              const accts = prevState[gId] || [];
              groupToAccounts[gId] = accts;
              for (const aId of accts) {
                if (!accountToGroups[aId]) accountToGroups[aId] = [];
                if (!accountToGroups[aId].includes(gId)) accountToGroups[aId].push(gId);
                const grp = userGroups.find(g => g.id === gId);
                if (grp) grp.accountCount = (groupToAccounts[gId] || []).length;
              }
            }
          }
          ['accounts', 'userGroups', 'users'].forEach(k => applyFilters(k));
          updateRelationshipHighlights();
          updateControlBar();
          showToast(`Reverted removal of ${subjectText}`);
        }
      });
    }

    window._openRemoveFromDialog = openDialog;

    cancelBtn.addEventListener('click', closeDialog);
    submitBtn.addEventListener('click', () => {
      applyRemoval();
      closeDialog();
    });
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeDialog();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.style.display !== 'none') closeDialog();
    });
  }

  // ─── Org User Group Dialog (Create / Edit) ──────────────

  // ─── Dialog Filter Helper ───────────────────────────────

  function initDialogFilter(btnEl, menuEl, filterDefs, items, activeFilters, onFilterChange) {
    const chevronSvg = '<svg class="filter-menu__item-chevron" viewBox="0 0 16 16" fill="none"><path fill="currentColor" d="m5.854 2.646 5 5a.5.5 0 0 1 0 .708l-5 5-.708-.707L9.793 8 5.146 3.354z"/></svg>';
    const checkSvg = '<svg class="filter-submenu__check-icon" viewBox="0 0 16 16" fill="none"><path fill="currentColor" d="m13.86 4.847-7.214 7.5a.5.5 0 0 1-.702.018l-4.285-4 .682-.73 3.926 3.663 6.873-7.145z"/></svg>';

    function getOptions(filterKey) {
      const def = filterDefs.find(d => d.key === filterKey);
      if (!def) return [];
      const countMap = {};
      for (const item of items()) {
        const val = def.accessor(item);
        countMap[val] = (countMap[val] || 0) + 1;
      }
      return Object.keys(countMap).sort().map(val => ({ value: val, count: countMap[val] }));
    }

    function buildMenu() {
      let html = '';
      for (const def of filterDefs) {
        const options = getOptions(def.key);
        const active = activeFilters[def.key] || new Set();
        const menuLabel = active.size > 0 ? `${def.label} (${active.size})` : def.label;
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
      const hasActive = Object.values(activeFilters).some(s => s && s.size > 0);
      if (hasActive) {
        html += `<div class="filter-menu__clear" data-action="clear">Clear all filters</div>`;
      }
      menuEl.innerHTML = html;
    }

    function updateBtn() {
      let total = 0;
      for (const s of Object.values(activeFilters)) if (s && s.size > 0) total += s.size;
      if (total > 0) {
        btnEl.innerHTML = `<span class="filter-count-badge">${total}</span>`;
        btnEl.classList.add('stellar-button--primary');
        btnEl.classList.remove('stellar-button--secondary');
      } else {
        btnEl.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M1.5 3h13v1.003L10 8.838V14l-4-2.5V8.838L1.5 4.003zm1.134 1L7 7.662v3.338l2 1.25V7.662L13.366 4z" clip-rule="evenodd"/></svg>';
        btnEl.classList.remove('stellar-button--primary');
        btnEl.classList.add('stellar-button--secondary');
      }
    }

    function applyFilter(filterKey, filterValue) {
      if (!activeFilters[filterKey]) activeFilters[filterKey] = new Set();
      const set = activeFilters[filterKey];
      if (set.has(filterValue)) { set.delete(filterValue); } else { set.add(filterValue); }
      buildMenu();
      updateBtn();
      onFilterChange();
    }

    function clearAll() {
      for (const k in activeFilters) activeFilters[k] = new Set();
      buildMenu();
      updateBtn();
      onFilterChange();
    }

    function reset() {
      for (const k in activeFilters) activeFilters[k] = new Set();
      updateBtn();
    }

    function matchesFilters(item) {
      for (const def of filterDefs) {
        const set = activeFilters[def.key];
        if (set && set.size > 0 && !set.has(def.accessor(item))) return false;
      }
      return true;
    }

    btnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menuEl.classList.contains('filter-menu--open');
      document.querySelectorAll('.filter-menu').forEach(m => m.classList.remove('filter-menu--open'));
      if (!isOpen) {
        buildMenu();
        menuEl.classList.add('filter-menu--open');
        positionFilterMenu(menuEl);
      }
    });

    menuEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const clearEl = e.target.closest('[data-action="clear"]');
      if (clearEl) { clearAll(); return; }
      const subItem = e.target.closest('.filter-submenu__item[data-filter-value]');
      if (subItem) {
        applyFilter(subItem.dataset.filterKey, subItem.dataset.filterValue);
      }
    });

    return { reset, matchesFilters, buildMenu };
  }

  // ─── Assign to Groups Dialog ────────────────────────────

  function initAssignGroupsDialog() {
    const backdrop = document.getElementById('assignGroupsBackdrop');
    const badgesEl = document.getElementById('assignGroupsBadges');
    const countEl = document.getElementById('assignGroupsCount');
    const searchInput = document.getElementById('assignGroupsSearch');
    const tableHeaderEl = document.getElementById('assignGroupsTableHeader');
    const tableBodyEl = document.getElementById('assignGroupsTableBody');
    const selectAllBtn = document.getElementById('assignGroupsSelectAll');
    const unselectAllBtn = document.getElementById('assignGroupsUnselectAll');
    const filterBtn = document.getElementById('assignGroupsFilterBtn');
    const filterMenuEl = document.getElementById('assignGroupsFilterMenu');
    const cancelBtn = document.getElementById('assignGroupsCancel');
    const submitBtn = document.getElementById('assignGroupsSubmit');
    if (!backdrop) return;

    let pendingUserIds = [];
    let selectedGroups = new Set();
    let allGroups = [];
    let filteredGroups = [];
    let grpSort = null;

    const grpFilterDefs = FILTER_DEFS.userGroups;
    const grpActiveFilters = {};
    for (const d of grpFilterDefs) grpActiveFilters[d.key] = new Set();
    const grpFilter = initDialogFilter(filterBtn, filterMenuEl, grpFilterDefs, () => allGroups, grpActiveFilters, () => renderRows());

    const TABLE_COLS_GRP = [
      { key: 'name', label: 'GROUP', flex: 2 },
      { key: 'comment', label: 'COMMENT', flex: 2.5 },
      { key: 'userCount', label: 'USERS', flex: 0.6 },
      { key: 'accountCount', label: 'ACCOUNTS', flex: 0.7 },
      { key: 'created', label: 'CREATED', flex: 1.2 },
    ];

    const sortUp = '<svg class="table-sort-icon" viewBox="0 0 16 16" width="14" height="14" fill="none"><path fill="currentColor" d="M8 2a.5.5 0 0 1 .354.146l5 5-.707.708L8.5 3.707V14h-1V3.707L3.354 7.854l-.708-.708 5-5A.5.5 0 0 1 8 2"/></svg>';
    const sortDown = '<svg class="table-sort-icon" viewBox="0 0 16 16" width="14" height="14" fill="none"><path fill="currentColor" d="M8 14a.5.5 0 0 0 .354-.146l5-5-.707-.708L8.5 12.293V2h-1v10.293L3.354 8.146l-.708.708 5 5A.5.5 0 0 0 8 14"/></svg>';

    function buildHeader() {
      const allChecked = filteredGroups.length > 0 && filteredGroups.every(g => selectedGroups.has(g.id));
      const someChecked = !allChecked && filteredGroups.some(g => selectedGroups.has(g.id));
      const cls = allChecked ? ' table-checkbox--checked' : (someChecked ? ' table-checkbox--indeterminate' : '');
      let html = `<div class="table-cell table-cell--checkbox" style="flex:0 0 36px;"><div class="table-checkbox${cls}" data-select-all-visible></div></div>`;
      for (const c of TABLE_COLS_GRP) {
        const isActive = grpSort && grpSort.key === c.key;
        const arrow = isActive ? (grpSort.dir === 'asc' ? sortUp : sortDown) : '';
        const activeCls = isActive ? ' table-cell--sort-active' : '';
        html += `<div class="table-cell table-cell--header table-cell--sortable${activeCls}" style="flex:${c.flex};" data-grp-sort="${c.key}">${c.label}${arrow}</div>`;
      }
      tableHeaderEl.innerHTML = html;
    }

    function sortGroups(list) {
      if (!grpSort) return list;
      const { key, dir } = grpSort;
      return list.sort((a, b) => {
        let va = a[key] ?? '', vb = b[key] ?? '';
        if (key === 'created') {
          va = new Date(va).getTime(); vb = new Date(vb).getTime();
        } else if (key === 'userCount' || key === 'accountCount') {
          va = Number(va); vb = Number(vb);
        } else {
          va = String(va).toLowerCase(); vb = String(vb).toLowerCase();
        }
        if (va < vb) return dir === 'asc' ? -1 : 1;
        if (va > vb) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    function renderRows() {
      const query = searchInput.value.trim().toLowerCase();
      filteredGroups = allGroups.filter(g => {
        if (query && !g.name.toLowerCase().includes(query) && !(g.comment || '').toLowerCase().includes(query)) return false;
        return grpFilter.matchesFilters(g);
      });
      filteredGroups = sortGroups(filteredGroups);
      filteredGroups.sort((a, b) => {
        const aS = selectedGroups.has(a.id) ? 0 : 1;
        const bS = selectedGroups.has(b.id) ? 0 : 1;
        return aS - bS;
      });

      let html = '';
      for (const grp of filteredGroups) {
        const isSel = selectedGroups.has(grp.id);
        const cls = 'assign-accounts__row' + (isSel ? ' assign-accounts__row--selected' : '');
        html += `<div class="${cls}" data-grp-id="${grp.id}">`;
        html += `<div class="table-cell table-cell--checkbox" style="flex:0 0 36px;"><div class="table-checkbox${isSel ? ' table-checkbox--checked' : ''}"></div></div>`;
        for (const c of TABLE_COLS_GRP) {
          html += `<div class="table-cell" style="flex:${c.flex};">${formatTableCell(grp, c.key, 'userGroups')}</div>`;
        }
        html += '</div>';
      }
      tableBodyEl.innerHTML = html;
      countEl.textContent = `Select groups (${selectedGroups.size})`;
      buildHeader();
    }

    function openDialog(userIds) {
      pendingUserIds = userIds;
      allGroups = [...state.columns.userGroups.items];
      selectedGroups = new Set();
      grpSort = null;
      grpFilter.reset();

      if (userIds.length === 1) {
        for (const gId of (userToGroups[userIds[0]] || [])) selectedGroups.add(gId);
      } else {
        const sets = userIds.map(uId => new Set(userToGroups[uId] || []));
        for (const gId of sets[0]) {
          if (sets.every(s => s.has(gId))) selectedGroups.add(gId);
        }
      }

      const userIcon = '<svg class="dialog__badge-icon" viewBox="0 0 16 16" fill="none"><path fill="currentColor" d="M8 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6M6 5a2 2 0 1 1 4 0 2 2 0 0 1-4 0m-2.5 9v-1.5A1.5 1.5 0 0 1 5 11h6a1.5 1.5 0 0 1 1.5 1.5V14h-1v-1.5a.5.5 0 0 0-.5-.5H5a.5.5 0 0 0-.5.5V14z"/></svg>';
      if (userIds.length === 1) {
        const u = state.columns.users.items.find(i => i.id === userIds[0]);
        const name = u ? u.name : userIds[0];
        badgesEl.innerHTML = `<span class="dialog__badge">${userIcon} ${name}</span>`;
      } else {
        badgesEl.innerHTML = `<span class="dialog__badge">${userIcon} ${userIds.length} Org users</span>`;
      }

      searchInput.value = '';
      buildHeader();
      renderRows();
      backdrop.style.display = 'flex';
    }

    function closeDialog() {
      backdrop.style.display = 'none';
      pendingUserIds = [];
      selectedGroups.clear();
    }

    window._openAssignGroupsDialog = openDialog;

    tableHeaderEl.addEventListener('click', (e) => {
      if (e.target.closest('[data-select-all-visible]')) {
        const allChecked = filteredGroups.length > 0 && filteredGroups.every(g => selectedGroups.has(g.id));
        for (const g of filteredGroups) {
          if (allChecked) { selectedGroups.delete(g.id); } else { selectedGroups.add(g.id); }
        }
        renderRows();
        return;
      }
      const cell = e.target.closest('[data-grp-sort]');
      if (!cell) return;
      const key = cell.dataset.grpSort;
      if (grpSort && grpSort.key === key) {
        grpSort.dir = grpSort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        grpSort = { key, dir: 'asc' };
      }
      buildHeader();
      renderRows();
    });

    tableBodyEl.addEventListener('click', (e) => {
      const row = e.target.closest('[data-grp-id]');
      if (!row) return;
      const gId = row.dataset.grpId;
      if (selectedGroups.has(gId)) {
        selectedGroups.delete(gId);
      } else {
        selectedGroups.add(gId);
      }
      renderRows();
    });

    selectAllBtn.addEventListener('click', () => {
      for (const g of allGroups) selectedGroups.add(g.id);
      renderRows();
    });

    unselectAllBtn.addEventListener('click', () => {
      selectedGroups.clear();
      renderRows();
    });

    searchInput.addEventListener('input', () => renderRows());
    cancelBtn.addEventListener('click', closeDialog);

    submitBtn.addEventListener('click', () => {
      const count = selectedGroups.size;
      const msg = `Assigned ${pendingUserIds.length > 1 ? pendingUserIds.length + ' users' : '1 user'} to ${count} group${count !== 1 ? 's' : ''}`;
      closeDialog();
      showToast(msg, { onUndo: () => showToast('Assignment reverted') });
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeDialog();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.style.display !== 'none') closeDialog();
    });
  }

  // ─── Assign to Accounts Dialog ──────────────────────────

  function initAssignAccountsDialog() {
    const backdrop = document.getElementById('assignAccountsBackdrop');
    const titleEl = document.getElementById('assignAccountsTitle');
    const badgesEl = document.getElementById('assignAccountsBadges');
    const countEl = document.getElementById('assignAccountsCount');
    const searchInput = document.getElementById('assignAccountsSearch');
    const tableHeaderEl = document.getElementById('assignAccountsTableHeader');
    const tableBodyEl = document.getElementById('assignAccountsTableBody');
    const selectAllBtn = document.getElementById('assignAccountsSelectAll');
    const unselectAllBtn = document.getElementById('assignAccountsUnselectAll');
    const filterBtn = document.getElementById('assignAccountsFilterBtn');
    const filterMenuEl = document.getElementById('assignAccountsFilterMenu');
    const visibleAllEl = document.getElementById('assignAccountsVisibleAll');
    const visibleCheckbox = document.getElementById('assignAccountsVisibleCheckbox');
    const cancelBtn = document.getElementById('assignAccountsCancel');
    const submitBtn = document.getElementById('assignAccountsSubmit');
    if (!backdrop) return;

    let pendingGroupIds = [];
    let selectedAccounts = new Set();
    let allAccounts = [];
    let filteredAccounts = [];
    let assignSort = null;

    const acctFilterDefs = FILTER_DEFS.accounts;
    const acctActiveFilters = {};
    for (const d of acctFilterDefs) acctActiveFilters[d.key] = new Set();
    const acctFilter = initDialogFilter(filterBtn, filterMenuEl, acctFilterDefs, () => allAccounts, acctActiveFilters, () => renderRows());

    const TABLE_COLS_ASSIGN = [
      { key: 'name', label: 'ACCOUNT', flex: 2 },
      { key: 'edition', label: 'EDITION', flex: 1.2 },
      { key: 'cloud', label: 'CLOUD', flex: 0.8 },
      { key: 'region', label: 'REGION', flex: 1.4 },
      { key: 'created', label: 'CREATED', flex: 1.2 },
    ];

    const sortArrowUp = '<svg class="table-sort-icon" viewBox="0 0 16 16" width="14" height="14" fill="none"><path fill="currentColor" d="M8 2a.5.5 0 0 1 .354.146l5 5-.707.708L8.5 3.707V14h-1V3.707L3.354 7.854l-.708-.708 5-5A.5.5 0 0 1 8 2"/></svg>';
    const sortArrowDown = '<svg class="table-sort-icon" viewBox="0 0 16 16" width="14" height="14" fill="none"><path fill="currentColor" d="M8 14a.5.5 0 0 0 .354-.146l5-5-.707-.708L8.5 12.293V2h-1v10.293L3.354 8.146l-.708.708 5 5A.5.5 0 0 0 8 14"/></svg>';

    function buildHeader() {
      const allChecked = filteredAccounts.length > 0 && filteredAccounts.every(a => selectedAccounts.has(a.id));
      const someChecked = !allChecked && filteredAccounts.some(a => selectedAccounts.has(a.id));
      const cls = allChecked ? ' table-checkbox--checked' : (someChecked ? ' table-checkbox--indeterminate' : '');
      let html = `<div class="table-cell table-cell--checkbox" style="flex:0 0 36px;"><div class="table-checkbox${cls}" data-select-all-visible></div></div>`;
      for (const c of TABLE_COLS_ASSIGN) {
        const isActive = assignSort && assignSort.key === c.key;
        const arrow = isActive ? (assignSort.dir === 'asc' ? sortArrowUp : sortArrowDown) : '';
        const activeCls = isActive ? ' table-cell--sort-active' : '';
        html += `<div class="table-cell table-cell--header table-cell--sortable${activeCls}" style="flex:${c.flex};" data-assign-sort="${c.key}">${c.label}${arrow}</div>`;
      }
      tableHeaderEl.innerHTML = html;
    }

    function sortAccounts(list) {
      if (!assignSort) return list;
      const { key, dir } = assignSort;
      return list.sort((a, b) => {
        let va = a[key] ?? '', vb = b[key] ?? '';
        if (key === 'created') {
          va = new Date(va).getTime(); vb = new Date(vb).getTime();
        } else {
          va = String(va).toLowerCase(); vb = String(vb).toLowerCase();
        }
        if (va < vb) return dir === 'asc' ? -1 : 1;
        if (va > vb) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    function renderRows() {
      const query = searchInput.value.trim().toLowerCase();
      filteredAccounts = allAccounts.filter(a => {
        if (query && !a.name.toLowerCase().includes(query) && !(a.region || '').toLowerCase().includes(query) && !(a.cloud || '').toLowerCase().includes(query)) return false;
        return acctFilter.matchesFilters(a);
      });
      filteredAccounts = sortAccounts(filteredAccounts);
      filteredAccounts.sort((a, b) => {
        const aS = selectedAccounts.has(a.id) ? 0 : 1;
        const bS = selectedAccounts.has(b.id) ? 0 : 1;
        return aS - bS;
      });

      let html = '';
      for (const acc of filteredAccounts) {
        const isSel = selectedAccounts.has(acc.id);
        const cls = 'assign-accounts__row' + (isSel ? ' assign-accounts__row--selected' : '');
        html += `<div class="${cls}" data-acc-id="${acc.id}">`;
        html += `<div class="table-cell table-cell--checkbox" style="flex:0 0 36px;"><div class="table-checkbox${isSel ? ' table-checkbox--checked' : ''}"></div></div>`;
        for (const c of TABLE_COLS_ASSIGN) {
          html += `<div class="table-cell" style="flex:${c.flex};">${formatTableCell(acc, c.key, 'accounts')}</div>`;
        }
        html += '</div>';
      }
      tableBodyEl.innerHTML = html;
      updateCount();
      buildHeader();
    }

    function updateCount() {
      const total = selectedAccounts.size;
      countEl.textContent = `Select accounts (${total})`;
      visibleAllEl.style.display = total === allAccounts.length && total > 0 ? '' : 'none';
    }

    function openDialog(groupIds) {
      pendingGroupIds = groupIds;
      allAccounts = [...state.columns.accounts.items];
      selectedAccounts = new Set();
      assignSort = null;
      acctFilter.reset();

      if (groupIds.length === 1) {
        for (const aId of (groupToAccounts[groupIds[0]] || [])) selectedAccounts.add(aId);
      } else {
        const sets = groupIds.map(gId => new Set(groupToAccounts[gId] || []));
        for (const aId of sets[0]) {
          if (sets.every(s => s.has(aId))) selectedAccounts.add(aId);
        }
      }

      const groupIcon = '<svg class="dialog__badge-icon" viewBox="0 0 16 16" fill="none"><g fill="currentColor"><path d="M8.5 11a1.5 1.5 0 0 1 1.5 1.5V14H9v-1.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0-.5.5V14H1v-1.5A1.5 1.5 0 0 1 2.5 11zm5-2a1.5 1.5 0 0 1 1.5 1.5V12h-1v-1.5a.5.5 0 0 0-.5-.5H11V9z"/><path fill-rule="evenodd" d="M5.5 3a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7m0 1a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5" clip-rule="evenodd"/><path d="M11 2a3 3 0 1 1-1.005 5.824L9.992 7h.012l-.001-.269a2 2 0 1 0-.352-3.206l-.603-.8A3 3 0 0 1 11 2"/></g></svg>';
      if (groupIds.length === 1) {
        const g = state.columns.userGroups.items.find(i => i.id === groupIds[0]);
        const name = g ? g.name : groupIds[0];
        badgesEl.innerHTML = `<span class="dialog__badge">${groupIcon} ${name}</span>`;
      } else {
        badgesEl.innerHTML = `<span class="dialog__badge">${groupIcon} ${groupIds.length} Org user groups</span>`;
      }

      if (!visibleCheckbox.classList.contains('dialog__checkbox--checked')) {
        visibleCheckbox.classList.add('dialog__checkbox--checked');
      }

      searchInput.value = '';
      buildHeader();
      renderRows();
      backdrop.style.display = 'flex';
    }

    function closeDialog() {
      backdrop.style.display = 'none';
      pendingGroupIds = [];
      selectedAccounts.clear();
    }

    window._openAssignAccountsDialog = openDialog;

    tableHeaderEl.addEventListener('click', (e) => {
      if (e.target.closest('[data-select-all-visible]')) {
        const allChecked = filteredAccounts.length > 0 && filteredAccounts.every(a => selectedAccounts.has(a.id));
        for (const a of filteredAccounts) {
          if (allChecked) { selectedAccounts.delete(a.id); } else { selectedAccounts.add(a.id); }
        }
        renderRows();
        return;
      }
      const cell = e.target.closest('[data-assign-sort]');
      if (!cell) return;
      const key = cell.dataset.assignSort;
      if (assignSort && assignSort.key === key) {
        assignSort.dir = assignSort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        assignSort = { key, dir: 'asc' };
      }
      buildHeader();
      renderRows();
    });

    tableBodyEl.addEventListener('click', (e) => {
      const row = e.target.closest('[data-acc-id]');
      if (!row) return;
      const accId = row.dataset.accId;
      if (selectedAccounts.has(accId)) {
        selectedAccounts.delete(accId);
      } else {
        selectedAccounts.add(accId);
      }
      renderRows();
    });

    selectAllBtn.addEventListener('click', () => {
      for (const acc of allAccounts) selectedAccounts.add(acc.id);
      renderRows();
    });

    unselectAllBtn.addEventListener('click', () => {
      selectedAccounts.clear();
      renderRows();
    });

    searchInput.addEventListener('input', () => renderRows());

    visibleAllEl.addEventListener('click', () => {
      visibleCheckbox.classList.toggle('dialog__checkbox--checked');
    });

    cancelBtn.addEventListener('click', closeDialog);

    submitBtn.addEventListener('click', () => {
      const count = selectedAccounts.size;
      const msg = `Assigned ${pendingGroupIds.length > 1 ? pendingGroupIds.length + ' groups' : '1 group'} to ${count} account${count !== 1 ? 's' : ''}`;
      closeDialog();
      showToast(msg, { onUndo: () => showToast('Assignment reverted') });
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeDialog();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.style.display !== 'none') closeDialog();
    });
  }

  // ─── Bulk Create Org Users Wizard ───────────────────────

  function initBulkUserDialog() {
    const backdrop = document.getElementById('bulkUserBackdrop');
    const sidebar = document.getElementById('bulkUserSidebar');
    const step1El = document.getElementById('bulkUserStep1');
    const step2El = document.getElementById('bulkUserStep2');
    const step3El = document.getElementById('bulkUserStep3');
    const emailsInput = document.getElementById('bulkUserEmails');
    const reviewBody = document.getElementById('bulkUserReviewBody');
    const reviewTitle = document.getElementById('bulkUserReviewTitle');
    const issueCount = document.getElementById('bulkUserIssueCount');
    const searchInput = document.getElementById('bulkUserSearch');
    const cancelBtn = document.getElementById('bulkUserCancel');
    const prevBtn = document.getElementById('bulkUserPrev');
    const nextBtn = document.getElementById('bulkUserNext');
    const submitBtn = document.getElementById('bulkUserSubmit');
    const radioEmail = document.getElementById('bulkUserRadioEmail');
    const radioCsv = document.getElementById('bulkUserRadioCsv');
    const resetPwCheckbox = document.getElementById('bulkUserResetPwCheckbox');
    if (!backdrop) return;

    let currentStep = 1;
    let parsedUsers = [];

    function parseEmails(text) {
      const emails = text.split(/[,;\n]+/).map(s => s.trim()).filter(s => s.includes('@'));
      return emails.map(email => {
        const local = email.split('@')[0];
        const parts = local.replace(/[._-]/g, ' ').split(/\s+/);
        const firstName = (parts[0] || '').charAt(0).toUpperCase() + (parts[0] || '').slice(1);
        const lastName = parts.length > 1 ? (parts[parts.length - 1] || '').charAt(0).toUpperCase() + (parts[parts.length - 1] || '').slice(1) : '';
        const displayName = [firstName, lastName].filter(Boolean).join(' ');
        return {
          email,
          loginName: local.replace(/\s/g, ''),
          displayName,
          firstName,
          lastName,
          error: false,
        };
      });
    }

    function renderReviewTable(filter) {
      const query = (filter || '').toLowerCase();
      let html = '';
      let issues = 0;
      for (let i = 0; i < parsedUsers.length; i++) {
        const u = parsedUsers[i];
        if (query && !u.email.toLowerCase().includes(query) && !u.displayName.toLowerCase().includes(query)) continue;
        const lastErr = !u.lastName ? ' wizard__review-input--error' : '';
        if (!u.lastName) issues++;
        html += `<div class="wizard__review-row" data-idx="${i}">
          <div class="wizard__review-cell wizard__review-cell--cb"><div class="table-checkbox"></div></div>
          <div class="wizard__review-cell" style="flex:1.2;"><input value="${u.email}" data-field="email" tabindex="-1" /></div>
          <div class="wizard__review-cell" style="flex:1.2;"><input value="${u.loginName}" data-field="loginName" /></div>
          <div class="wizard__review-cell" style="flex:1.2;"><input value="${u.displayName}" data-field="displayName" /></div>
          <div class="wizard__review-cell" style="flex:0.8;"><input value="${u.firstName}" data-field="firstName" /></div>
          <div class="wizard__review-cell" style="flex:0.8;"><input value="${u.lastName}" data-field="lastName" class="${lastErr}" /></div>
        </div>`;
      }
      reviewBody.innerHTML = html;
      reviewTitle.textContent = `Review Org user information (${parsedUsers.length})`;
      if (issues > 0) {
        issueCount.innerHTML = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none"><circle cx="8" cy="8" r="7" fill="var(--themed-status-critical-ui, #d93025)"/><path fill="white" d="M7.5 4h1v5h-1zm0 6h1v1h-1z"/></svg> ${issues} issue${issues > 1 ? 's' : ''} to resolve`;
      } else {
        issueCount.textContent = '';
      }

      reviewBody.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
          const row = input.closest('.wizard__review-row');
          const idx = parseInt(row.dataset.idx);
          const field = input.dataset.field;
          if (parsedUsers[idx]) parsedUsers[idx][field] = input.value;
          if (field === 'lastName') {
            input.classList.toggle('wizard__review-input--error', !input.value.trim());
            renderIssueCount();
          }
        });
      });
    }

    function renderIssueCount() {
      const issues = parsedUsers.filter(u => !u.lastName).length;
      if (issues > 0) {
        issueCount.innerHTML = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none"><circle cx="8" cy="8" r="7" fill="var(--themed-status-critical-ui, #d93025)"/><path fill="white" d="M7.5 4h1v5h-1zm0 6h1v1h-1z"/></svg> ${issues} issue${issues > 1 ? 's' : ''} to resolve`;
      } else {
        issueCount.textContent = '';
      }
    }

    const ICON_EMPTY = '<svg class="wizard__step-svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" fill="currentColor"/></svg>';
    const ICON_CURRENT = '<svg class="wizard__step-svg wizard__step-svg--current" width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" fill="currentColor"/><circle cx="8" cy="8" r="3" fill="currentColor"/></svg>';
    const ICON_DONE = '<svg class="wizard__step-svg wizard__step-svg--done" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7.35554 10.3536L11.3555 6.35359L10.6484 5.64648L7.00199 9.29293L5.35554 7.64648L4.64844 8.35359L6.64844 10.3536C6.8437 10.5489 7.16028 10.5489 7.35554 10.3536Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8ZM14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" fill="currentColor"/></svg>';

    function showStep(step) {
      currentStep = step;
      step1El.style.display = step === 1 ? '' : 'none';
      step2El.style.display = step === 2 ? '' : 'none';
      step3El.style.display = step === 3 ? '' : 'none';

      sidebar.querySelectorAll('.wizard__step').forEach(el => {
        const s = parseInt(el.dataset.wizardStep);
        el.classList.remove('wizard__step--active', 'wizard__step--done');
        const iconEl = el.querySelector('.wizard__step-icon');
        if (s === step) {
          el.classList.add('wizard__step--active');
          iconEl.innerHTML = ICON_CURRENT;
        } else if (s < step) {
          el.classList.add('wizard__step--done');
          iconEl.innerHTML = ICON_DONE;
        } else {
          iconEl.innerHTML = ICON_EMPTY;
        }

        const label = el.querySelector('.wizard__step-label');
        if (s === 1) {
          label.textContent = s < step ? 'Emails' : 'Add user list';
        } else if (s === 2) {
          label.textContent = parsedUsers.length > 0 ? `Review information (${parsedUsers.length})` : 'Review information';
        }
      });

      prevBtn.style.visibility = step === 1 ? 'hidden' : '';
      nextBtn.style.display = step < 3 ? '' : 'none';
      submitBtn.style.display = step === 3 ? '' : 'none';
      if (step === 3) {
        submitBtn.textContent = `Create ${parsedUsers.length} Org users`;
      }

      if (step === 2) {
        parsedUsers = parseEmails(emailsInput.value);
        renderReviewTable();
      }
    }

    function openDialog() {
      emailsInput.value = '';
      parsedUsers = [];
      searchInput.value = '';
      document.getElementById('bulkUserPassword').value = '';
      document.getElementById('bulkUserPasswordConfirm').value = '';
      if (!resetPwCheckbox.classList.contains('dialog__checkbox--checked')) {
        resetPwCheckbox.classList.add('dialog__checkbox--checked');
      }
      radioEmail.classList.add('wizard__radio--checked');
      radioCsv.classList.remove('wizard__radio--checked');
      showStep(1);
      backdrop.style.display = 'flex';
    }

    function closeDialog() {
      backdrop.style.display = 'none';
    }

    window._openBulkUserDialog = openDialog;

    radioEmail.addEventListener('click', () => {
      radioEmail.classList.add('wizard__radio--checked');
      radioCsv.classList.remove('wizard__radio--checked');
    });
    radioCsv.addEventListener('click', () => {
      radioCsv.classList.add('wizard__radio--checked');
      radioEmail.classList.remove('wizard__radio--checked');
    });

    resetPwCheckbox.closest('.dialog__checkbox-row').addEventListener('click', () => {
      resetPwCheckbox.classList.toggle('dialog__checkbox--checked');
    });

    searchInput.addEventListener('input', () => renderReviewTable(searchInput.value));

    const bulkMenuItem = document.querySelector('#createButton .stellar-menu__item[data-key="create-bulk-users"]');
    if (bulkMenuItem) {
      bulkMenuItem.addEventListener('click', () => openDialog());
    }

    cancelBtn.addEventListener('click', closeDialog);
    prevBtn.addEventListener('click', () => showStep(currentStep - 1));
    nextBtn.addEventListener('click', () => showStep(currentStep + 1));
    submitBtn.addEventListener('click', () => {
      closeDialog();
      showToast(`Created ${parsedUsers.length} Org users`);
    });
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeDialog();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.style.display !== 'none') closeDialog();
    });
  }

  // ─── Create Account Dialog (2-step) ─────────────────────

  function initCreateAccountDialog() {
    const backdrop = document.getElementById('createAccountBackdrop');
    const titleEl = document.getElementById('createAccountTitle');
    const subtitleEl = document.getElementById('createAccountSubtitle');
    const step1El = document.getElementById('createAccountStep1');
    const step2El = document.getElementById('createAccountStep2');
    const contextEl = document.getElementById('createAccountStep2Context');
    const cloudSelect = document.getElementById('createAccountCloud');
    const regionSelect = document.getElementById('createAccountRegion');
    const editionSelect = document.getElementById('createAccountEdition');
    const nameInput = document.getElementById('createAccountName');
    const userInput = document.getElementById('createAccountUser');
    const passwordInput = document.getElementById('createAccountPassword');
    const passwordConfirmInput = document.getElementById('createAccountPasswordConfirm');
    const emailInput = document.getElementById('createAccountEmail');
    const cancelBtn = document.getElementById('createAccountCancel');
    const nextBtn = document.getElementById('createAccountNext');
    const backBtn = document.getElementById('createAccountBack');
    const submitBtn = document.getElementById('createAccountSubmit');
    if (!backdrop) return;

    const REGIONS = {
      AWS: ['US-East-1', 'US-East-2', 'US-West-2', 'EU-West-1', 'EU-Central-1', 'AP-Southeast-1', 'AP-Northeast-1', 'CA-Central-1', 'SA-East-1'],
      Azure: ['East US', 'East US 2', 'West US 2', 'West Europe', 'North Europe', 'Southeast Asia', 'Australia East', 'Canada Central', 'Japan East'],
      GCP: ['US-Central1', 'US-East4', 'Europe-West1', 'Europe-West4', 'Asia-East1', 'Asia-Northeast1', 'Australia-Southeast1'],
    };

    let currentStep = 1;

    function populateRegions() {
      const cloud = cloudSelect.value;
      const regions = REGIONS[cloud] || [];
      regionSelect.innerHTML = regions.map(r => `<option value="${r}">${r}</option>`).join('');
    }

    function showStep(step) {
      currentStep = step;
      if (step === 1) {
        step1El.style.display = '';
        step2El.style.display = 'none';
        titleEl.textContent = 'Create new account';
        subtitleEl.textContent = 'Each account in your organization will have its own set of users, roles, databases and warehouses.';
        subtitleEl.style.display = '';
        contextEl.style.display = '';
        nextBtn.style.display = '';
        backBtn.style.visibility = 'hidden';
        submitBtn.style.display = 'none';
      } else {
        step1El.style.display = 'none';
        step2El.style.display = '';
        const cloudLabel = cloudSelect.options[cloudSelect.selectedIndex].text;
        const editionLabel = editionSelect.value;
        titleEl.textContent = 'Create new account';
        subtitleEl.textContent = `${cloudLabel} · ${regionSelect.value} · ${editionLabel === 'Business Critical' ? 'Business critical' : editionLabel} Edition`;
        subtitleEl.style.display = '';
        contextEl.style.display = 'none';
        nextBtn.style.display = 'none';
        backBtn.style.visibility = '';
        submitBtn.style.display = '';
        setTimeout(() => nameInput.focus(), 50);
      }
    }

    function openDialog() {
      cloudSelect.value = 'AWS';
      populateRegions();
      editionSelect.value = 'Standard';
      nameInput.value = '';
      userInput.value = '';
      passwordInput.value = '';
      passwordConfirmInput.value = '';
      emailInput.value = '';
      showStep(1);
      backdrop.style.display = 'flex';
    }

    function closeDialog() {
      backdrop.style.display = 'none';
    }

    function createAccount() {
      const name = nameInput.value.trim() || 'NEW_ACCOUNT';
      const cloud = cloudSelect.value;
      const region = regionSelect.value;
      const edition = editionSelect.value;

      const newAccount = {
        id: `acc-new-${Date.now()}`,
        name: name.toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
        edition,
        cloud,
        region,
        created: new Date().toISOString().split('T')[0],
        locator: name.slice(0, 7).toUpperCase(),
        tenantType: 'Internal',
      };

      state.columns.accounts.items.unshift(newAccount);
      applyFilters('accounts');
      updateVirtualScroll('accounts');
      updateRelationshipHighlights();

      showToast(`Account "${newAccount.name}" created`);
    }

    window._openCreateAccountDialog = openDialog;

    const splitActionBtn = document.querySelector('#createButton .stellar-splitbutton__action');
    if (splitActionBtn) {
      splitActionBtn.addEventListener('click', () => {
        const label = splitActionBtn.textContent.trim();
        if (label === 'Create Account') openDialog();
      });
    }

    const createAccountMenuItem = document.querySelector('#createButton .stellar-menu__item[data-key="create-account"]');
    if (createAccountMenuItem) {
      createAccountMenuItem.addEventListener('click', () => openDialog());
    }

    cloudSelect.addEventListener('change', populateRegions);
    cancelBtn.addEventListener('click', closeDialog);
    nextBtn.addEventListener('click', () => showStep(2));
    backBtn.addEventListener('click', () => showStep(1));
    submitBtn.addEventListener('click', () => {
      createAccount();
      closeDialog();
    });
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeDialog();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.style.display !== 'none') closeDialog();
    });
  }

  // ─── Edit Account Dialog ────────────────────────────────

  function initEditAccountDialog() {
    const backdrop = document.getElementById('editAccountBackdrop');
    const titleEl = document.getElementById('editAccountTitle');
    const nameInput = document.getElementById('editAccountName');
    const urlPreview = document.getElementById('editAccountUrlPreview');
    const saveOldUrlCheckbox = document.getElementById('editAccountSaveOldUrl');
    const editionSelect = document.getElementById('editAccountEdition');
    const tenantTypeSelect = document.getElementById('editAccountTenantType');
    const commentInput = document.getElementById('editAccountComment');
    const cancelBtn = document.getElementById('editAccountCancel');
    const submitBtn = document.getElementById('editAccountSubmit');
    if (!backdrop) return;

    let editingAccountId = null;
    let originalName = '';
    const orgName = 'ACMECORP';

    function updateUrlPreview() {
      const newName = nameInput.value.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_') || 'ACCOUNT_NAME';
      const oldUrl = `${orgName}-${originalName}.snowflakecomputing.com`;
      const newUrl = `${orgName}-${newName}.snowflakecomputing.com`;
      const changed = newName !== originalName;
      if (changed) {
        urlPreview.innerHTML =
          `<div style="margin-bottom:4px;"><span style="color:var(--themed-reusable-text-tertiary);">New URL:</span> ${newUrl.toLowerCase()}</div>` +
          `<div><span style="color:var(--themed-reusable-text-tertiary);">Old URL:</span> ${oldUrl.toLowerCase()}</div>`;
        saveOldUrlCheckbox.closest('.dialog__checkbox-row').style.display = '';
      } else {
        urlPreview.innerHTML = `<div>${newUrl.toLowerCase()}</div>`;
        saveOldUrlCheckbox.closest('.dialog__checkbox-row').style.display = 'none';
      }
    }

    function openDialog(accountId) {
      const result = findItemById(accountId);
      if (!result || result.colKey !== 'accounts') return;
      const account = result.item;

      editingAccountId = accountId;
      originalName = account.name;
      titleEl.textContent = 'Edit account';
      nameInput.value = account.name;
      editionSelect.value = account.edition;
      tenantTypeSelect.value = account.tenantType || 'Internal';
      commentInput.value = account.comment || '';

      if (!saveOldUrlCheckbox.classList.contains('dialog__checkbox--checked')) {
        saveOldUrlCheckbox.classList.add('dialog__checkbox--checked');
      }

      updateUrlPreview();
      backdrop.style.display = 'flex';
      setTimeout(() => nameInput.focus(), 50);
    }

    function closeDialog() {
      backdrop.style.display = 'none';
      editingAccountId = null;
    }

    function applyChanges() {
      if (!editingAccountId) return;
      const account = state.columns.accounts.items.find(i => i.id === editingAccountId);
      if (!account) return;

      const newName = nameInput.value.trim();
      const prevName = account.name;
      const prevEdition = account.edition;
      const prevTenantType = account.tenantType;
      const prevComment = account.comment;

      if (newName) account.name = newName;
      account.edition = editionSelect.value;
      account.tenantType = tenantTypeSelect.value;
      account.comment = commentInput.value.trim();

      applyFilters('accounts');
      updateRelationshipHighlights();
      updateControlBar();

      showToast(`Account "${account.name}" updated`, {
        onUndo: () => {
          account.name = prevName;
          account.edition = prevEdition;
          account.tenantType = prevTenantType;
          account.comment = prevComment;
          applyFilters('accounts');
          updateRelationshipHighlights();
          updateControlBar();
          showToast(`Reverted changes to "${prevName}"`);
        }
      });
    }

    window._openEditAccountDialog = openDialog;

    nameInput.addEventListener('input', updateUrlPreview);

    saveOldUrlCheckbox.closest('.dialog__checkbox-row').addEventListener('click', () => {
      saveOldUrlCheckbox.classList.toggle('dialog__checkbox--checked');
    });

    cancelBtn.addEventListener('click', closeDialog);
    submitBtn.addEventListener('click', () => {
      applyChanges();
      closeDialog();
    });
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeDialog();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.style.display !== 'none') closeDialog();
    });
  }

  function initGroupDialog() {
    const backdrop = document.getElementById('groupDialogBackdrop');
    const titleEl = document.getElementById('groupDialogTitle');
    const cancelBtn = document.getElementById('groupDialogCancel');
    const submitBtn = document.getElementById('groupDialogSubmit');
    const nameInput = document.getElementById('groupNameInput');
    const descInput = document.getElementById('groupDescInput');
    if (!backdrop) return;

    let mode = 'create';

    function openCreateDialog() {
      mode = 'create';
      titleEl.textContent = 'Create Org user group';
      submitBtn.textContent = 'Create';
      nameInput.value = '';
      descInput.value = '';
      backdrop.style.display = 'flex';
      setTimeout(() => nameInput.focus(), 50);
    }

    function openEditDialog(groupId) {
      const result = findItemById(groupId);
      if (!result || result.colKey !== 'userGroups') return;
      const group = result.item;

      mode = 'edit';
      titleEl.textContent = 'Edit Org user group';
      submitBtn.textContent = 'Save';
      nameInput.value = group.name || '';
      descInput.value = group.comment || '';
      backdrop.style.display = 'flex';
      setTimeout(() => nameInput.focus(), 50);
    }

    function closeDialog() {
      backdrop.style.display = 'none';
      nameInput.value = '';
      descInput.value = '';
    }

    window._openEditGroupDialog = openEditDialog;

    const splitActionBtn = document.querySelector('#createButton .stellar-splitbutton__action');
    if (splitActionBtn) {
      splitActionBtn.addEventListener('click', () => {
        const label = splitActionBtn.textContent.trim();
        if (label === 'Create User group') openCreateDialog();
      });
    }

    const createGroupMenuItem = document.querySelector('#createButton .stellar-menu__item[data-key="create-group"]');
    if (createGroupMenuItem) {
      createGroupMenuItem.addEventListener('click', () => openCreateDialog());
    }

    cancelBtn.addEventListener('click', closeDialog);

    submitBtn.addEventListener('click', () => {
      closeDialog();
      showToast(mode === 'edit' ? 'Org user group updated successfully' : 'Org user group created successfully');
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeDialog();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.style.display !== 'none') closeDialog();
    });
  }

  function init() {
    initDomRefs();
    initSkeletonLoading();
    initVirtualScroll();
    initSelection();
    initControlBar();
    initSearch();
    initDragDrop();
    initFilters();
    initPopover();
    initItemMenus();
    initRelatedHover();
    initSidePanel();
    initColumnVisibility();
    initUserDialog();
    initGroupDialog();
    initCreateAccountDialog();
    initBulkUserDialog();
    initEditAccountDialog();
    initDisableDialog();
    initRemoveFromDialog();
    initAssignGroupsDialog();
    initAssignAccountsDialog();
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

    // Update primary create button based on rightmost visible column
    const createActionBtn = document.querySelector('#createButton .stellar-splitbutton__action');
    if (createActionBtn) {
      const CREATE_LABELS = {
        accounts: 'Create Account',
        userGroups: 'Create User group',
        users: 'Create Org user',
      };
      createActionBtn.textContent = CREATE_LABELS[lastVisibleKey] || 'Create Org user';
    }

    // Reset scroll and re-render visible columns
    for (const colKey of visibleKeys) {
      state.columns[colKey].scrollEl.scrollTop = 0;
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
