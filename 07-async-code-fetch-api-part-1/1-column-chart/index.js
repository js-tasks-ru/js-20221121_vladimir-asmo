import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  static getColumnProps(data, chartHeight) {
    const maxValue = Math.max(...data);
    const scale = chartHeight / maxValue;

    return data.map((item) => {
      return {
        percent: ((item / maxValue) * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale)),
      };
    });
  }

  LOADER_NAME = 'column-chart_loading';
  chartHeight = 50;
  element = null;
  subElements = {};
  data = [];
  value = 0;
  controller = new AbortController();

  // todo: add abortController

  constructor({
    url = 'api/dashboard/orders',
    range = {
      from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      to: new Date(),
    },
    label = '',
    link = '',
    formatHeading = (data) => data,
  } = {}) {
    this.props = { label, link, formatHeading, url };

    this.render();
    this.getSubElements();
    this.update(range.from, range.to);
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const el of elements) {
      this.subElements[el.dataset.element] = el;
    }
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
  }

  update(from, to) {
    const url = this.getUrl(this.props.url, { params: { from, to } });

    return fetchJson(url, { signal: this.controller.signal }).then((data) => {
      this.updateData(data);
      this.updateView();
      return data;
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.controller.abort();
    this.remove();
  }

  getUrl(pathname, { base = BACKEND_URL, params = {} }) {
    const url = new URL(pathname, base);

    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, params[key]);
    });

    return url;
  }

  updateData(data) {
    this.data = data;
    const getTotal = (total, current) => total + current;
    this.value = Object.values(data).reduce(getTotal);
  }

  updateView() {
    this.subElements.body.innerHTML = this.getChartItems();
    this.subElements.header.innerHTML = this.getChartHeader();
    this.toggleLoader(false);
  }

  toggleLoader(isLoading = true) {
    if (isLoading) {
      this.element.classList.add(this.LOADER_NAME);
      return;
    }
    this.element.classList.remove(this.LOADER_NAME);
  }

  getTemplate() {
    return `
      <div class="dashboard__chart_${this.props.label} ${this.LOADER_NAME}">
        <div class="column-chart"
          style="--chart-height: ${this.chartHeight}">
          <div class="column-chart__title">
            ${this.getTitle()}
            ${this.getLink()}
          </div>
          <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">
              ${this.getChartHeader()}
            </div>
            <div data-element="body" class="column-chart__chart">
              ${this.getChartItems()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getTitle() {
    return `Total ${this.props.label}`;
  }

  getLink() {
    return !!this.props.link
      ? `
      <a href="${this.props.link}" class="column-chart__link">
        View all
      </a>
    `
      : '';
  }

  getChartHeader() {
    return this.props.formatHeading(this.value);
  }

  getChartItems() {
    return ColumnChart.getColumnProps(
      Object.values(this.data),
      this.chartHeight
    )
      .map(
        (it) =>
          `<div style="--value: ${it.value}" data-tooltip="${it.percent}"></div>`
      )
      .join('');
  }
}
