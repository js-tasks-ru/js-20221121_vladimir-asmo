export default class DoubleSlider {
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

  HANDLE = { left: 'left', right: 'right' };

  element = null;
  subElements = {};

  target = '';
  slider = {};
  selected = {
    value: { from: 0, to: 0 },
    percent: { from: 0, to: 0 },
  };

  constructor({
    min = 0,
    max = 100,
    formatValue = (value) => '$' + value,
    selected = {},
  } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;

    this.selectedValue = { from: selected.from, to: selected.to };

    this.onPointerDown = DoubleSlider.throttle(this.onPointerDown);
    this.onPointerUp = DoubleSlider.throttle(this.onPointerUp);
    this.onPointerMove = DoubleSlider.throttle(this.onPointerMove);

    this.render();
    this.subElements = this.getSubElements();
    this.addListeners();
  }

  get selectedPercent() {
    return this.selected.percent;
  }

  set selectedPercent({
    left = this.selected.percent.from,
    right = this.selected.percent.to,
  }) {
    const round = (value) => Math.round(value);
    const percentToValue = (percent) =>
      this.min + ((this.max - this.min) * percent) / 100;

    this.selected.percent = { from: left, to: right };
    this.selected.value = {
      from: round(percentToValue(left)),
      to: round(percentToValue(right)),
    };
  }

  get selectedValue() {
    return this.selected.value;
  }

  set selectedValue({ from = this.min, to = this.max }) {
    const valueToPercent = (value) =>
      (100 / (this.max - this.min)) * (value - this.min);

    this.selectedPercent = {
      left: valueToPercent(from),
      right: valueToPercent(to),
    };
  }

  get template() {
    const { formatValue, selectedPercent, selectedValue } = this;
    const [left, right] = [selectedPercent.from, 100 - selectedPercent.to];
    return `
      <div class="range-slider">
        <span data-element="from">${formatValue(selectedValue.from)}</span>
        <div class="range-slider__inner" data-element="slider">
          <span class="range-slider__progress" data-element="progress"
          style="left: ${left}%; right: ${right}%"></span>
          <span class="range-slider__thumb-left" data-element="left"
          style="left: ${left}%"></span>
          <span class="range-slider__thumb-right" data-element="right"
            style="right: ${right}%"></span>
        </div>
        <span data-element="to">${formatValue(selectedValue.to)}</span>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild || wrapper;
  }

  getSubElements(selector = '[data-element]') {
    const elements = this.element.querySelectorAll(selector);
    const subElements = {};

    for (const el of elements) {
      subElements[el.dataset.element] = el;
    }

    return subElements;
  }

  addListeners() {
    this.subElements.slider.addEventListener('pointerdown', this.onPointerDown);
  }

  removeListeners() {
    this.subElements.slider.removeEventListener(
      'pointerdown',
      this.onPointerDown
    );
    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('pointermove', this.onPointerMove);
  }

  onPointerDown = ({ target }) => {
    this.target = target.dataset.element;

    this.slider = this.subElements.slider.getBoundingClientRect();

    document.addEventListener('pointerup', this.onPointerUp);
    document.addEventListener('pointermove', this.onPointerMove);
  };

  onPointerUp = () => {
    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('pointermove', this.onPointerMove);

    this.target = '';
    this.update();
    this.dispatchRangeSelectEvent();
  };

  dispatchRangeSelectEvent() {
    this.element.dispatchEvent(
      new CustomEvent('range-select', {
        detail: { ...this.selected.value },
      })
    );
  }

  onPointerMove = ({ clientX }) => {
    const { HANDLE, target, slider } = this;
    const isTargetHandle = target === HANDLE.left || target === HANDLE.right;

    if (!isTargetHandle) {
      return;
    }

    const { from, to } = this.selectedPercent;

    const getX = () => (100 / slider.width) * (clientX - slider.left);
    const limit = (value, max, min = 0) => Math.max(min, Math.min(value, max));

    const [min, max] = target === HANDLE.left ? [0, to] : [from, 100];

    this.selectedPercent = {
      [target]: limit(getX(), max, min),
    };

    this.update();
  };

  update() {
    const { selectedPercent, selectedValue, formatValue } = this;
    const formatPercent = (value) => value + '%';

    const [left, right] = [
      formatPercent(selectedPercent.from),
      formatPercent(100 - selectedPercent.to),
    ];

    this.subElements.progress.style.left = left;
    this.subElements.progress.style.right = right;

    this.subElements.left.style.left = left;
    this.subElements.right.style.right = right;

    this.subElements.from.textContent = formatValue(selectedValue.from);
    this.subElements.to.textContent = formatValue(selectedValue.to);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    if (this.element) {
      this.removeListeners();
      this.remove();
    }
    this.element = null;
    this.subElements = {};
  }
}
