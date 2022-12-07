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

  constructor({
    label = '',
    value = 0,
    data = [],
    link = '#',
    formatHeading = (data) => data,
  } = {}) {
    this.props = { label, value, data, link, formatHeading };
    this.chartHeight = 50;
    this.rootRef = null;
    this.render();
  }

  set element(value) {
    this._el = value;
  }

  get element() {
    this.rootRef = this._el.parentNode;
    return this._el;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
  }

  update(props) {
    this.props = { ...this.props, ...props };
    this.replace();
  }

  replace() {
    this.remove();
    this.render();
    this.rootRef.append(this.element);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.rootRef = null;
  }

  getTemplate() {
    return `
      <div class="dashboard__chart_${this.props.label}
        ${!this.isDataLoaded() ? 'column-chart_loading' : ''}">
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

  isDataLoaded() {
    return !!this.props.data.length;
  }

  getTitle() {
    return `Total ${this.props.label}`;
  }

  getLink() {
    return `
      <a href="${this.props.link}" class="column-chart__link">
        View all
      </a>
    `;
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
