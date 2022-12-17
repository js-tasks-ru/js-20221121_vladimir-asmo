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

  element = {};
  #subElements = {};

  chartHeight = 50;

  constructor({
    url = 'api/dashboard/orders',
    range = {
      from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      to: new Date(),
    },
    label = '',
    value = 0,
    data = [],
    link = '',
    formatHeading = (data) => data,
  } = {}) {
    this.props = { label, value, data, link, formatHeading, url, range };

    this.render();
    this.getSubElements();
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const el of elements) {
      this.#subElements[el.dataset.element] = el;
    }
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
  }

  update(props) {
    this.props = { ...this.props, ...props };

    if (!!props.data?.length) {
      this.#subElements.body.innerHTML = this.getChartItems();
    }

    if (!!props.value) {
      this.#subElements.header.innerHTML = this.getChartHeader();
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  getTemplate() {
    return `
      <div class="dashboard__chart_${this.props.label}
        ${!this.isDataLoading() ? 'column-chart_loading' : ''}">
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

  isDataLoading() {
    return !!this.props.data.length;
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
    return this.props.formatHeading(this.props.value);
  }

  getChartItems() {
    return ColumnChart.getColumnProps(this.props.data, this.chartHeight)
      .map(
        (it) =>
          `<div style="--value: ${it.value}" data-tooltip="${it.percent}"></div>`
      )
      .join('');
  }
}
