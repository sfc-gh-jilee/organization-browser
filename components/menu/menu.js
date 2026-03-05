class StellarMenu {
  constructor(triggerElement) {
    this.trigger = triggerElement;
    this.menuEl = triggerElement.nextElementSibling;
    if (!this.menuEl || !this.menuEl.classList.contains('stellar-menu')) return;

    this.list = this.menuEl.querySelector('.stellar-menu__list');
    this.items = [];
    this.focusedIndex = -1;
    this.isOpen = false;

    this._refreshItems();
    this._bindEvents();
    this._setAriaAttributes();
  }

  _refreshItems() {
    this.items = Array.from(
      this.menuEl.querySelectorAll('.stellar-menu__item:not(.stellar-menu__item--disabled)')
    );
  }

  _setAriaAttributes() {
    this.trigger.setAttribute('aria-haspopup', 'true');
    this.trigger.setAttribute('aria-expanded', 'false');

    if (!this.list.id) {
      this.list.id = 'stellar-menu-' + Math.random().toString(36).slice(2, 8);
    }
    this.trigger.setAttribute('aria-controls', this.list.id);
  }

  _bindEvents() {
    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    this.trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.open();
        this._focusItem(0);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.open();
        this._focusItem(this.items.length - 1);
      }
    });

    this.menuEl.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this._focusItem(this.focusedIndex + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this._focusItem(this.focusedIndex - 1);
          break;
        case 'Home':
          e.preventDefault();
          this._focusItem(0);
          break;
        case 'End':
          e.preventDefault();
          this._focusItem(this.items.length - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          this._selectFocused();
          break;
        case 'Escape':
        case 'Tab':
          this.close();
          this.trigger.focus();
          break;
      }
    });

    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.trigger.contains(e.target) && !this.menuEl.contains(e.target)) {
        this.close();
      }
    });
  }

  _focusItem(index) {
    if (this.items.length === 0) return;

    if (index < 0) index = this.items.length - 1;
    if (index >= this.items.length) index = 0;

    this.items.forEach(item => item.classList.remove('stellar-menu__item--focused'));
    this.focusedIndex = index;
    const item = this.items[this.focusedIndex];
    item.classList.add('stellar-menu__item--focused');
    item.querySelector('.stellar-menu__item-label')?.focus();
  }

  _clearFocus() {
    this.items.forEach(item => item.classList.remove('stellar-menu__item--focused'));
    this.focusedIndex = -1;
  }

  _selectFocused() {
    if (this.focusedIndex >= 0 && this.focusedIndex < this.items.length) {
      const item = this.items[this.focusedIndex];
      const event = new CustomEvent('menu-select', {
        detail: { id: item.dataset.key },
        bubbles: true,
      });
      this.trigger.dispatchEvent(event);
      this.close();
      this.trigger.focus();
    }
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.menuEl.classList.add('stellar-menu--open');
    this.trigger.setAttribute('aria-expanded', 'true');
    this.list.setAttribute('role', 'menu');
    this._positionMenu();
    this._refreshItems();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.menuEl.classList.remove('stellar-menu--open');
    this.trigger.setAttribute('aria-expanded', 'false');
    this._clearFocus();
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
      this._focusItem(0);
    }
  }

  _positionMenu() {
    const triggerRect = this.trigger.getBoundingClientRect();
    const menuRect = this.menuEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    this.menuEl.style.left = '0px';
    this.menuEl.style.right = 'auto';

    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    if (spaceBelow >= menuRect.height || spaceBelow >= spaceAbove) {
      this.menuEl.style.top = triggerRect.height + 'px';
      this.menuEl.style.bottom = 'auto';
    } else {
      this.menuEl.style.bottom = triggerRect.height + 'px';
      this.menuEl.style.top = 'auto';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-menu-trigger]').forEach(trigger => {
    new StellarMenu(trigger);
  });
});
