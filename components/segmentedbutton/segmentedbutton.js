class StellarSegmentedButton {
  constructor(element) {
    this.root = element;
    this.items = Array.from(element.querySelectorAll('.stellar-segmentedbutton__item'));
    this.init();
  }

  init() {
    this.items.forEach(item => {
      if (!item.disabled) {
        item.addEventListener('click', () => this.select(item));
      }
      item.addEventListener('keydown', (e) => this.handleKeydown(e, item));
    });
  }

  select(item) {
    if (item.disabled) return;

    this.items.forEach(btn => {
      btn.setAttribute('aria-checked', 'false');
      btn.removeAttribute('data-selected');
      btn.setAttribute('tabindex', '-1');
    });

    item.setAttribute('aria-checked', 'true');
    item.setAttribute('data-selected', 'true');
    item.setAttribute('tabindex', '0');
    item.focus();

    this.root.dispatchEvent(new CustomEvent('change', {
      detail: { value: item.dataset.value },
      bubbles: true,
    }));
  }

  handleKeydown(e, currentItem) {
    const enabledItems = this.items.filter(i => !i.disabled);
    const currentIndex = enabledItems.indexOf(currentItem);
    if (currentIndex === -1) return;

    let nextIndex;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = (currentIndex + 1) % enabledItems.length;
        this.select(enabledItems[nextIndex]);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length;
        this.select(enabledItems[nextIndex]);
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        this.select(currentItem);
        break;
    }
  }
}

document.querySelectorAll('.stellar-segmentedbutton').forEach(el => {
  new StellarSegmentedButton(el);
});
