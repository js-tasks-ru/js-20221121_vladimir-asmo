import { createGetter } from '../../03-objects-arrays-intro-to-testing/1-create-getter/index.js';
export default class SortableTable {
  static mapConfigToDomString = ({ id, title, sortable }) => `
    <div class="sortable-table__cell"
      data-id="${id}"
      data-sortable="${sortable}"
      <span>${title}</span>
    </div>
  `;

  static mapProductToDomString = (config) => (product) =>
    `
    <a href="/products/${product.id}" class="sortable-table__row">
      ${config.map(SortableTable.formatProduct(product))}
    </a>
  `;

  static formatProduct = (product) => (field) =>
    field.template?.(product) ??
    `<div class="sortable-table__cell">${product[field.id]}</div>`;

  element = null;
  subElements = {};
  getSortField = null;

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.products = data;

    this.render();
    this.getSubElements();
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.tableHeader}
          </div>

          <div data-element="body" class="sortable-table__body">
            ${this.tableBody}
          </div>
        </div>
      </div>
    `;
  }

  get tableHeader() {
    return this.headerConfig.map(SortableTable.mapConfigToDomString).join('');
  }

  get tableBody() {
    return this.products
      .map(SortableTable.mapProductToDomString(this.headerConfig))
      .join('');
  }

  sort(field, order) {
    const findById = ({ id }) => id === field;
    const { sortable, sortType } = this.headerConfig.find(findById);

    if (!sortable) {
      return;
    }

    this.getSortField = createGetter(field);

    const SORT_BY = {
      string: (dir) => this.sortStrings(dir),
      number: (dir) => this.sortNumbers(dir),
    };

    const direction = { asc: 1, desc: -1 };

    SORT_BY[sortType](direction[order]);

    this.update();
  }

  sortStrings(direction) {
    const { getSortField } = this;

    const compare = (current, next) =>
      current.localeCompare(next, ['ru', 'en'], { caseFirst: 'upper' });

    this.products.sort(
      (product, nextProduct) =>
        direction * compare(getSortField(product), getSortField(nextProduct))
    );
  }

  sortNumbers(direction) {
    const { getSortField } = this;

    const compare = (current, next) => parseFloat(current) - parseFloat(next);

    this.products.sort(
      (product, nextProduct) =>
        direction * compare(getSortField(product), getSortField(nextProduct))
    );
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
  }

  update() {
    this.subElements.header.innerHTML = this.tableHeader;
    this.subElements.body.innerHTML = this.tableBody;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const el of elements) {
      this.subElements[el.dataset.element] = el;
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
