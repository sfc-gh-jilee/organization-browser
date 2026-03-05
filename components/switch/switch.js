class StellarSwitch {
  constructor(element) {
    this.root = element;
    this.input = element.querySelector('.stellar-switch__input');
    this.init();
  }

  init() {
    this.root.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggle();
    });
    this.root.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  toggle() {
    if (this.root.hasAttribute('data-disabled')) return;

    const isChecked = this.root.hasAttribute('data-selected');
    if (isChecked) {
      this.root.removeAttribute('data-selected');
    } else {
      this.root.setAttribute('data-selected', 'true');
    }

    if (this.input) {
      this.input.checked = !isChecked;
    }
    this.root.setAttribute('aria-checked', String(!isChecked));
  }
}

document.querySelectorAll('.stellar-switch').forEach(el => {
  new StellarSwitch(el);
});
