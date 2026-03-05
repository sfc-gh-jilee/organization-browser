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
  function initDomRefs() {
    const c = state.columns;
    c.accounts.scrollEl = document.getElementById('accounts-scroll');
    c.accounts.spacerEl = document.getElementById('accounts-spacer');
    c.accounts.contentEl = document.getElementById('accounts-content');
    c.accounts.countEl = document.getElementById('accounts-count');

    c.userGroups.scrollEl = document.getElementById('usergroups-scroll');
    c.userGroups.spacerEl = document.getElementById('usergroups-spacer');
    c.userGroups.contentEl = document.getElementById('usergroups-content');
    c.userGroups.countEl = document.getElementById('usergroups-count');

    c.users.scrollEl = document.getElementById('users-scroll');
    c.users.spacerEl = document.getElementById('users-spacer');
    c.users.contentEl = document.getElementById('users-content');
    c.users.countEl = document.getElementById('users-count');
  }

  // ─── Renderers ──────────────────────────────────────────

  function itemClasses(isSelected, isHighlighted) {
    let cls = 'list-item';
    if (isSelected) cls += ' list-item--selected';
    else if (isHighlighted) cls += ' list-item--related';
    return cls;
  }

  function renderAccountItem(item, isSelected, isHighlighted) {
    const initials = item.name.split('_').slice(0, 2).map(w => w[0]).join('');
    const editionClass = item.edition === 'Business Critical' ? 'Business critical' : item.edition;
    return `
      <div class="${itemClasses(isSelected, isHighlighted)}"
           data-id="${item.id}" draggable="true" tabindex="-1">
        <div class="list-item__text">
          <div class="list-item__name">${item.name}</div>
          <div class="list-item__subtitle">${editionClass} · ${item.cloud} ${item.region}</div>
        </div>
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
    return `
      <div class="${itemClasses(isSelected, isHighlighted)}"
           data-id="${item.id}" draggable="true" tabindex="-1">
        <div class="list-item__text">
          <div class="list-item__name">${item.name}</div>
          <div class="list-item__subtitle">${item.userCount} users · ${accountLabel}</div>
        </div>
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
    return `
      <div class="${itemClasses(isSelected, isHighlighted)}"
           data-id="${item.id}" draggable="true" tabindex="-1">
        <div class="list-item__status list-item__status--enabled"></div>
        <div class="list-item__avatar">${initials}</div>
        <div class="list-item__text">
          <div class="list-item__name">${item.name}</div>
          <div class="list-item__subtitle">MFA: ${mfaLabel} · ${groupLabel}</div>
        </div>
      </div>`;
  }

  const RENDERERS = {
    accounts: renderAccountItem,
    userGroups: renderUserGroupItem,
    users: renderUserItem,
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

    const renderer = RENDERERS[colKey];
    let html = '';
    for (let i = startIdx; i < endIdx; i++) {
      const item = items[i];
      const isSelected = col.selected.has(item.id);
      const isHighlighted = col.highlighted.has(item.id);
      html += renderer(item, isSelected, isHighlighted);
    }

    col.contentEl.style.transform = `translateY(${startIdx * ITEM_HEIGHT}px)`;
    col.contentEl.innerHTML = html;

    col.countEl.textContent = `(${items.length.toLocaleString()})`;
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
      col.selected.clear();
      col.selected.add(itemId);
      col.lastClickIndex = idx;
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

  function getBaseFilteredItems(col, query, colKey) {
    let items = col.items;

    // Apply search filter
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

    // Reorder all columns: selected first, then highlighted, then rest
    const searchQuery = document.getElementById('globalSearch').value.trim().toLowerCase();
    for (const colKey of Object.keys(state.columns)) {
      const col = state.columns[colKey];
      const hl = col.highlighted;
      const sel = col.selected;

      if (sel.size > 0 || hl.size > 0) {
        const baseItems = getBaseFilteredItems(col, searchQuery, colKey);
        const selected = [];
        const highlighted = [];
        const rest = [];
        for (const item of baseItems) {
          if (sel.has(item.id)) selected.push(item);
          else if (hl.has(item.id)) highlighted.push(item);
          else rest.push(item);
        }
        col.filteredItems = selected.concat(highlighted, rest);
        col.scrollEl.scrollTop = 0;
      } else {
        col.filteredItems = getBaseFilteredItems(col, searchQuery, colKey);
      }

      updateVirtualScroll(colKey);
    }
  }

  function initSelection() {
    for (const colKey of Object.keys(state.columns)) {
      const col = state.columns[colKey];
      col.contentEl.addEventListener('click', (e) => {
        const itemEl = e.target.closest('.list-item');
        if (!itemEl) return;
        handleItemClick(colKey, itemEl.dataset.id, e);
      });
    }

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
    if (colKey && activeFilters[colKey]) {
      return Object.values(activeFilters[colKey]).some(s => s && s.size > 0);
    }
    return false;
  }

  function updateSelectButtonLabels() {
    const filtered = isListFiltered('userGroups') || isListFiltered('users');
    const ugBtn = document.getElementById('usergroups-select-btn');
    const usrBtn = document.getElementById('users-select-btn');
    if (ugBtn) ugBtn.textContent = filtered ? 'Select all' : 'Select unassigned';
    if (usrBtn) usrBtn.textContent = filtered ? 'Select all' : 'Select unassigned';
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

        if (isListFiltered(colKey)) {
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
      actionBtnsEl.style.display = 'flex'; actionBtnsEl.style.gap = 'var(--stellar-space-gap-sm)'; actionBtnsEl.style.alignItems = 'center';
      searchEl.style.display = 'none';
      createBtn.style.display = 'none';

      const labelMap = { accounts: 'Account', userGroups: 'User group', users: 'Org user' };
      const label = labelMap[activeColKey] || 'item';
      const pillLabel = `${totalSelected} ${label}${totalSelected > 1 ? 's' : ''} selected`;
      pillEl.innerHTML = `${pillLabel} <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true" class="selection-pill__clear"><path fill="currentColor" d="m13.354 3.366-4.642 4.64 4.634 4.635-.708.707-4.633-4.633-4.633 4.633-.707-.707 4.633-4.633-4.642-4.642.707-.707L8.005 7.3l4.641-4.64z"/></svg>`;

      // Compute relationship counts
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
      searchEl.style.display = '';
      createBtn.style.display = '';
    }
  }

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

  function initSearch() {
    const input = document.getElementById('globalSearch');
    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = input.value.trim().toLowerCase();
        for (const colKey of Object.keys(state.columns)) {
          const col = state.columns[colKey];
          if (!query) {
            col.filteredItems = col.items;
          } else {
            col.filteredItems = col.items.filter(item => {
              const name = item.name || '';
              const display = item.displayName || '';
              return name.toLowerCase().includes(query) || display.toLowerCase().includes(query);
            });
          }
          col.scrollEl.scrollTop = 0;
          updateVirtualScroll(colKey);
        }
        updateSelectButtonLabels();
      }, 150);
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
        const itemEl = e.target.closest('.list-item');
        if (!itemEl) return;

        const itemId = itemEl.dataset.id;

        if (!col.selected.has(itemId)) {
          clearSelectionInOtherColumns(colKey);
          col.selected.clear();
          col.selected.add(itemId);
          col.lastClickIndex = getItemIndex(colKey, itemId);
          state.activeColumn = colKey;
          updateVirtualScroll(colKey);
          updateControlBar();
          updateColumnActiveState();
        }

        state.dragSourceColumn = colKey;
        state.dragItems = [...col.selected];

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

        requestAnimationFrame(() => {
          col.contentEl.querySelectorAll('.list-item').forEach(el => {
            if (col.selected.has(el.dataset.id)) {
              el.classList.add('list-item--dragging');
            }
          });
        });
      });

      col.contentEl.addEventListener('dragend', () => {
        ghostEl.style.display = 'none';
        ghostEl.style.top = '-1000px';
        ghostEl.style.left = '-1000px';

        col.contentEl.querySelectorAll('.list-item--dragging').forEach(el => {
          el.classList.remove('list-item--dragging');
        });

        document.querySelectorAll('.column--drop-target').forEach(el => {
          el.classList.remove('column--drop-target');
        });
        document.querySelectorAll('.list-item--drag-over').forEach(el => {
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

        const itemEl = e.target.closest('.list-item');
        colEl.querySelectorAll('.list-item--drag-over').forEach(el => el.classList.remove('list-item--drag-over'));
        if (itemEl) {
          itemEl.classList.add('list-item--drag-over');
        }
      });

      colEl.addEventListener('dragleave', (e) => {
        if (!colEl.contains(e.relatedTarget)) {
          colEl.classList.remove('column--drop-target');
          colEl.querySelectorAll('.list-item--drag-over').forEach(el => el.classList.remove('list-item--drag-over'));
        }
      });

      colEl.addEventListener('drop', (e) => {
        e.preventDefault();
        colEl.classList.remove('column--drop-target');
        colEl.querySelectorAll('.list-item--drag-over').forEach(el => el.classList.remove('list-item--drag-over'));

        const targetItem = e.target.closest('.list-item');
        const targetName = targetItem
          ? targetItem.querySelector('.list-item__name')?.textContent
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

    // Re-render all columns to reflect updated data
    for (const colKey of Object.keys(state.columns)) {
      updateVirtualScroll(colKey);
    }
  }

  function showDropToast(count, sourceLabel, targetName) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
      padding: 10px 20px; border-radius: var(--stellar-radius-sm);
      background: var(--themed-reusable-text-primary);
      color: var(--themed-surface-level-1-background);
      font-family: var(--themed-font-family-body); font-size: 13px; font-weight: 500;
      box-shadow: var(--themed-elevation-3-box-shadow);
      z-index: 10000; opacity: 0; transition: opacity 0.2s;
    `;
    toast.textContent = `Added ${count} ${sourceLabel}${count > 1 ? 's' : ''} to ${targetName}`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ─── Column Filters ────────────────────────────────────

  const FILTER_DEFS = {
    accounts: [
      { key: 'edition', label: 'Edition', accessor: item => item.edition },
      { key: 'cloud', label: 'Cloud', accessor: item => item.cloud },
      { key: 'region', label: 'Region', accessor: item => item.region },
    ],
    userGroups: [
      { key: 'assignment', label: 'Assignment', accessor: item => {
        return (groupToAccounts[item.id] || []).length === 0 ? 'Unassigned' : 'Assigned';
      }},
    ],
    users: [
      { key: 'userType', label: 'Type', accessor: item => item.userType },
      { key: 'authMethod', label: 'Auth method', accessor: item => item.authMethod },
      { key: 'mfaEnabled', label: 'MFA', accessor: item => item.mfaEnabled ? 'Enabled' : 'Disabled' },
      { key: 'assignment', label: 'Assignment', accessor: item => {
        return (userToGroups[item.id] || []).length === 0 ? 'Unassigned' : 'Assigned';
      }},
    ],
  };

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

    let html = '';
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
    const defs = FILTER_DEFS[colKey];
    const query = document.getElementById('globalSearch').value.trim().toLowerCase();

    let items = col.items;

    // Apply search
    if (query) {
      items = items.filter(item => {
        const name = item.name || '';
        const display = item.displayName || '';
        return name.toLowerCase().includes(query) || display.toLowerCase().includes(query);
      });
    }

    // Apply each active filter
    for (const def of defs) {
      const active = activeFilters[colKey][def.key];
      if (active && active.size > 0) {
        items = items.filter(item => active.has(def.accessor(item)));
      }
    }

    col.filteredItems = items;
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

  function positionFilterMenu(menuEl) {
    const rect = menuEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // If overflows right, align to right edge of trigger
    if (rect.right > vw) {
      menuEl.style.right = '0';
      menuEl.style.left = 'auto';
    }
    // If overflows left
    if (rect.left < 0) {
      menuEl.style.left = '0';
      menuEl.style.right = 'auto';
    }
    // If overflows bottom, open upward
    if (rect.bottom > vh) {
      menuEl.style.top = 'auto';
      menuEl.style.bottom = '100%';
      menuEl.style.marginTop = '';
      menuEl.style.marginBottom = '4px';
    }

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
      });
    }

    // Close menus on outside click
    document.addEventListener('click', () => {
      document.querySelectorAll('.filter-menu').forEach(m => m.classList.remove('filter-menu--open'));
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
    updateColumnActiveState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
