class Tooltip {
  static instance = null;

  static debounce = (fn, delay = 16) => {
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
  GAP = 15;
  UNIT = 'px';
  cursor = { x: 0, y: 0 };
  client = { width: 0, height: 0 };
  tooltip = { width: 0, height: 0 };
  isHidden = false;
  content = '';

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    this.getPageSize();
    this.renderTemplate();
    this.hide();
    this.addListeners();
    Tooltip.instance = this;

    this.onPointerMove = Tooltip.debounce(this.onPointerMove);
  }

  get template() {
    return `
      <div class="tooltip">${this.content}</div>
    `;
  }

  initialize(target = document.body) {
    target.append(this.element);
  }

  render(content = '') {
    this.content = content;
    this.updateText();
    this.show();
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

  onPointerOver = ({ target }) => {
    this.content = target.dataset.tooltip;

    if (!this.content) {
      document.removeEventListener('pointermove', this.onPointerMove);
      this.hide();

      return;
    }

    this.show();
    this.updateText();
    this.getTooltipSize();

    document.addEventListener('pointermove', this.onPointerMove);
  };

  onPointerMove = ({ clientX, clientY }) => {
    this.cursor = { x: clientX, y: clientY };
    this.updatePosition();
  };

  updatePosition() {
    const { tooltip, cursor, client, GAP, UNIT } = this;

    const isTooltipIntersectRight = () =>
      tooltip.width + cursor.x + GAP >= client.width;

    const isTooltipIntersectBottom = () =>
      tooltip.height + cursor.y + GAP >= client.height;

    const left = isTooltipIntersectRight()
      ? client.width - tooltip.width
      : cursor.x + GAP;

    const top = isTooltipIntersectBottom()
      ? client.width - tooltip.width
      : cursor.y + GAP;

    this.element.style.left = left + UNIT;
    this.element.style.top = top + UNIT;
  }

  updateText() {
    this.element.textContent = this.content;
  }

  show() {
    this.isHidden = false;
    this.element.hidden = false;
  }

  hide() {
    this.isHidden = true;
    this.element.hidden = true;
  }

  getPageSize = () => {
    const { clientWidth, clientHeight } = document.documentElement;
    this.client = { width: clientWidth, height: clientHeight };
  };

  getTooltipSize = () => {
    const { width, height } = this.element.getBoundingClientRect();
    this.tooltip = { width, height };
  };

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
}

export default Tooltip;
