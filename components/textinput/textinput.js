/**
 * TextInput — Vanilla JS from Stellar Design System
 * Manages focus-visible state on the field wrapper
 */

class StellarTextInput {
  constructor(element) {
    this.root = element;
    this.input = element.querySelector('.stellar-textinput__input');
    if (!this.input) return;
    this.init();
  }

  init() {
    this.input.addEventListener('focus', () => {
      this.root.setAttribute('data-focus-visible', 'true');
    });

    this.input.addEventListener('blur', () => {
      this.root.setAttribute('data-focus-visible', 'false');
    });
  }
}

document.querySelectorAll('.stellar-textinput').forEach(el => {
  new StellarTextInput(el);
});
