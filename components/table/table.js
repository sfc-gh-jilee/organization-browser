class StellarTable {
  constructor(element) {
    this.root = element;
    this.grid = this.root.querySelector('[role="grid"]');
    this.init();
  }

  init() {
    if (!this.grid) return;

    this.columnHeaders = this.grid.querySelectorAll('[role="columnheader"]');
    this.rows = this.grid.querySelectorAll('[role="row"]:not(.stellar-table__header-row)');
    this.cells = this.grid.querySelectorAll('[role="gridcell"]');

    this.setupGridNavigation();
  }

  setupGridNavigation() {
    this.grid.addEventListener('keydown', (e) => {
      const target = e.target;
      const role = target.getAttribute('role');

      if (role === 'columnheader' || role === 'gridcell') {
        this.handleCellKeydown(e, target);
      } else if (role === 'grid') {
        this.handleGridKeydown(e);
      }
    });
  }

  handleGridKeydown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const firstHeader = this.columnHeaders[0];
      if (firstHeader) firstHeader.focus();
    }
  }

  handleCellKeydown(e, target) {
    const allFocusable = [
      ...this.columnHeaders,
      ...this.cells
    ];
    const currentIndex = allFocusable.indexOf(target);
    if (currentIndex === -1) return;

    const colCount = this.columnHeaders.length;

    switch (e.key) {
      case 'ArrowRight': {
        e.preventDefault();
        const next = allFocusable[currentIndex + 1];
        if (next) next.focus();
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        const prev = allFocusable[currentIndex - 1];
        if (prev) prev.focus();
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        const below = allFocusable[currentIndex + colCount];
        if (below) below.focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const above = allFocusable[currentIndex - colCount];
        if (above) above.focus();
        break;
      }
      case 'Home': {
        e.preventDefault();
        const rowStart = Math.floor(currentIndex / colCount) * colCount;
        allFocusable[rowStart]?.focus();
        break;
      }
      case 'End': {
        e.preventDefault();
        const rowEnd = Math.floor(currentIndex / colCount) * colCount + colCount - 1;
        allFocusable[Math.min(rowEnd, allFocusable.length - 1)]?.focus();
        break;
      }
    }
  }
}

document.querySelectorAll('[data-component="table"]').forEach(el => {
  new StellarTable(el);
});
