class Tooltip {
  static instance = null;

  static throttle = (fn, delay = 16) => {
    let timerId = null;

    return (...args) => {
      if (!timerId) {
        return fn(...args);
      }

      timerId = setTimeout(() => {
        clearTimeout(timerId);
        timerId = null;
      }, delay);
    };
  };

  element = null;
  viewport = { width: 0, height: 0 };
  tooltip = { width: 0, height: 0 };

  onPointerOver = ({ target }) => {
    const element = target.closest('[data-tooltip]');

    if (!element) {
      document.removeEventListener('pointermove', this.onPointerMove);
      this.hide();
      return;
    }

    this.render(element.dataset.tooltip);
    this.getTooltipSize();

    document.addEventListener('pointermove', this.onPointerMove);
  };

  onPointerMove = ({ clientX, clientY }) => {
    this.updatePosition({ x: clientX, y: clientY });
  };

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    this.getPageSize();
    this.renderTemplate();
    this.hide();
    this.addListeners();
    Tooltip.instance = this;

    this.onPointerMove = Tooltip.throttle(this.onPointerMove);
  }

  get template() {
    return `
      <div class="tooltip"></div>
    `;
  }

  initialize(target = document.body) {
    target.append(this.element);
  }

  renderTemplate() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild || wrapper;
  }

  addListeners() {
    document.addEventListener('pointerover', this.onPointerOver);
    window.addEventListener('resize', this.getPageSize);
  }

  removeListeners() {
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('resize', this.getPageSize);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.removeListeners();
    this.remove();
    this.element = null;
    Tooltip.instance = null;
  }

  render(text = '') {
    this.updateText(text);
    this.show();
  }

  updatePosition(cursor) {
    const GAP = 15;
    const UNIT = 'px';
    const { tooltip, viewport } = this;

    const isTooltipIntersectRight = () =>
      tooltip.width + cursor.x + GAP >= viewport.width;

    const isTooltipIntersectBottom = () =>
      tooltip.height + cursor.y + GAP >= viewport.height;

    const left = isTooltipIntersectRight()
      ? viewport.width - tooltip.width
      : cursor.x + GAP;

    const top = isTooltipIntersectBottom()
      ? viewport.width - tooltip.width
      : cursor.y + GAP;

    this.element.style.left = left + UNIT;
    this.element.style.top = top + UNIT;
  }

  updateText(text = '') {
    this.element.textContent = text;
  }

  show() {
    this.element.hidden = false;
  }

  hide() {
    this.element.hidden = true;
  }

  getPageSize = () => {
    const { clientWidth, clientHeight } = document.documentElement;
    this.viewport = { width: clientWidth, height: clientHeight };
  };

  getTooltipSize = () => {
    const { width, height } = this.element.getBoundingClientRect();
    this.tooltip = { width, height };
  };
}

export default Tooltip;
