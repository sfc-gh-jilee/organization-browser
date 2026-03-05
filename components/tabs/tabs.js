class StellarTabs {
  constructor(element) {
    this.root = element;
    this.tablist = element.querySelector('[role="tablist"]');
    this.triggers = Array.from(this.tablist.querySelectorAll('[role="tab"]'));
    this.init();
  }

  init() {
    this.triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => this.selectTab(trigger));
      trigger.addEventListener("keydown", (e) => this.handleKeydown(e, trigger));
    });
  }

  selectTab(trigger) {
    this.triggers.forEach((t) => {
      const isSelected = t === trigger;
      t.setAttribute("aria-selected", isSelected ? "true" : "false");
      t.setAttribute("tabindex", isSelected ? "0" : "-1");
    });
    trigger.focus();
  }

  handleKeydown(e, currentTrigger) {
    const currentIndex = this.triggers.indexOf(currentTrigger);
    let nextIndex;

    switch (e.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % this.triggers.length;
        break;
      case "ArrowLeft":
        nextIndex =
          (currentIndex - 1 + this.triggers.length) % this.triggers.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = this.triggers.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    this.selectTab(this.triggers[nextIndex]);
  }
}

document.querySelectorAll('[data-component="tabs"]').forEach((el) => {
  new StellarTabs(el);
});
