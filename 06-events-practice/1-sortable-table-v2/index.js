import { createGetter } from '../../03-objects-arrays-intro-to-testing/1-create-getter/index.js';

export default class SortableTable {
  SORT_ORDER = {
    asc: 'asc',
    desc: 'desc',
  };

  element = null;
  subElements = {};

  constructor(
    headerConfig,
    { data = [], isSortedLocally = true, sorted = {} } = {}
  ) {
    this.headers = headerConfig;
    this.products = data;

    this.sorted = {
      id: sorted.id || this.headers.find((item) => item.sortable).id,
      order: sorted.order || SORT_ORDER.asc,
      compareFn: sorted.compareFn,
      isLocally: isSortedLocally,
    };

    this.sort();

    this.render();
    this.subElements = this.getSubElements();
    this.addListeners();
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

  update() {
    this.subElements.header.innerHTML = this.tableHeader;
    this.subElements.body.innerHTML = this.tableBody;
  }

  addListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
  }

  removeListeners() {
    this.subElements.header.removeEventListener(
      'pointerdown',
      this.onHeaderClick
    );
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

  onHeaderClick = (evt) => {
    const { id, sortable } = evt.target.closest('[data-id]').dataset;
    const isNotSortable = sortable === 'false';

    if (isNotSortable) {
      return;
    }

    if (this.isSameField(id)) {
      this.toggleSortOrder();
    }

    this.changeSortField(id);

    this.sort();
    this.update();
  };

  isSameField(fieldId) {
    return this.sorted.id === fieldId;
  }

  toggleSortOrder() {
    const { asc, desc } = this.SORT_ORDER;
    this.sorted.order = this.sorted.order === asc ? desc : asc;
  }

  changeSortField(targetId) {
    this.sorted.id = targetId;
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
    const mapConfigToDomString = ({ id, title, sortable }) => `
      <div class="sortable-table__cell"
        data-id="${id}"
        data-sortable="${sortable}"
        ${this.isSameField(id) ? `data-order=${this.sorted.order}` : ''}>
        <span>${title}</span>
        ${this.isSameField(id) ? `${this.arrow}` : ''}
      </div>
    `;

    return this.headers.map(mapConfigToDomString).join('');
  }

  get tableBody() {
    const mapProductToDomString = (product) => `
      <a href="/products/${product.id}" class="sortable-table__row">
        ${this.headers.map(formatProduct(product)).join('')}
      </a>
    `;

    const formatProduct = (product) => (field) =>
      field.template?.(product) ??
      `<div class="sortable-table__cell">${product[field.id]}</div>`;

    return this.products.map(mapProductToDomString).join('');
  }

  get arrow() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  sort() {
    if (this.sorted.isLocally) {
      return this.sortOnClient();
    }

    return this.sortOnServer();
  }

  sortOnServer() {
    throw new Error('Not implemented.');
  }

  sortOnClient() {
    const { sorted, headers } = this;

    const comparator = {
      string: (current, next) =>
        current.localeCompare(next, ['ru', 'en'], { caseFirst: 'upper' }),
      number: (current, next) => parseFloat(next) - parseFloat(current),
      custom: sorted.compareFn,
    };

    const byId = ({ id }) => id === sorted.id;
    const compareFn =
      comparator.custom || comparator[headers.find(byId).sortType];

    this.sortProducts(compareFn);
  }

  sortProducts(compareFn) {
    const { sorted, products } = this;
    const direction = { asc: 1, desc: -1 };
    const getId = createGetter(sorted.id);

    products.sort(
      (product, nextProduct) =>
        direction[sorted.order] * compareFn(getId(product), getId(nextProduct))
    );
  }
}
