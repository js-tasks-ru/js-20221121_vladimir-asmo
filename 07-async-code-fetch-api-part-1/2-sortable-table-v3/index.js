import fetchJson from './utils/fetch-json.js';
import { createGetter } from '../../03-objects-arrays-intro-to-testing/1-create-getter/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  SORT_ORDER = {
    asc: 'asc',
    desc: 'desc',
  };
  CLASS_NAME = {
    loading: 'sortable-table_loading',
    placeholder: 'sortable-table_empty',
  };

  element = null;
  subElements = {};
  headerRefs = {};
  controller = new AbortController();

  products = [];

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

  onDataLoaded = (data) => {
    this.products = data;
    if (this.sorted.isLocally) {
      this.sortOnClient();
    }
    this.update();
    this.toggleLoader(false);

    if (!this.products.length) {
      this.togglePlaceholder();
    }

    return data;
  };

  constructor(
    headersConfig,
    { sorted = {}, url = 'api/rest/products', isSortLocally = false } = {}
  ) {
    this.headers = headersConfig;
    this.url = url;
    this.sorted = {
      id: sorted.id || this.headers.find((item) => item.sortable).id,
      order: sorted.order || this.SORT_ORDER.asc,
      compareFn: sorted.compareFn,
      isLocally: isSortLocally,
    };

    this.render();
  }

  render() {
    this.renderTemplate();
    this.subElements = this.getSubElements();
    this.headerRefs = this.getSubElements('[data-id]', {
      target: this.subElements.header,
      propNamePattern: 'id',
    });
    this.addListeners();

    if (!this.sorted.isLocally) {
      return this.sortOnServer(this.sorted.id, this.sorted.order);
    }

    return this.loadData().then(this.onDataLoaded);
  }

  renderTemplate() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild || wrapper;
  }

  sort() {
    if (this.sorted.isLocally) {
      return this.sortOnClient(this.sorted.id, this.sorted.order);
    }

    return this.sortOnServer(this.sorted.id, this.sorted.order);
  }

  sortOnServer(id = this.sorted.id, order = this.sorted.order) {
    return this.loadData().then(this.onDataLoaded);
  }

  sortOnClient(id = this.sorted.id, order = this.sorted.order) {
    const comparator = {
      string: (current, next) =>
        current.localeCompare(next, ['ru', 'en'], { caseFirst: 'upper' }),
      number: (current, next) => parseFloat(next) - parseFloat(current),
      custom: this.sorted.compareFn,
    };

    const byId = (header) => header.id === id;
    const compareFn =
      comparator.custom || comparator[this.headers.find(byId).sortType];

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

  loadData() {
    const params = { _start: 0, _end: 30 };
    if (!this.sorted.isLocally) {
      params._sort = this.sorted.id;
      params._order = this.sorted.order;
    }
    if (this.sorted.from && this.sorted.to) {
      params.from = this.sorted.from;
      params.to = this.sorted.to;
    }

    const url = this.getUrl(this.url, { params });

    this.toggleLoader();
    return fetchJson(url, { signal: this.controller.signal });
  }

  getUrl(pathname, { base = BACKEND_URL, params = {} } = {}) {
    const url = new URL(pathname, base);

    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, params[key]);
    });

    return url;
  }

  update() {
    this.updateHeader();
    this.updateProducts();
  }

  updateHeader() {
    const byId = (element) => element.dataset.id === this.sorted.id;
    const current = Object.values(this.headerRefs).find(byId);
    current.append(this.subElements.arrow);
    current.dataset.order = this.sorted.order;
  }

  updateProducts() {
    this.subElements.body.innerHTML = this.tableBody;
  }

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

  toggleLoader(isLoading = true) {
    if (isLoading) {
      this.subElements.table.classList.add(this.CLASS_NAME.loading);
      return;
    }

    this.subElements.table.classList.remove(this.CLASS_NAME.loading);
  }

  togglePlaceholder(isNotProducts = true) {
    if (isNotProducts) {
      this.subElements.table.classList.add(this.CLASS_NAME.placeholder);
      return;
    }

    this.subElements.table.classList.remove(this.CLASS_NAME.placeholder);
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div data-element="table" class="sortable-table ${this.CLASS_NAME.loading}">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.tableHeader}
          </div>

          <div data-element="body" class="sortable-table__body">
            ${this.tableBody}
          </div>

          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
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
      field.template?.(product[field.id]) ??
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
  getSubElements(
    selector = '[data-element]',
    { target = this.element, propNamePattern = 'element' } = {}
  ) {
    const elements = target.querySelectorAll(selector);
    const subElements = {};

    for (const el of elements) {
      subElements[el.dataset[propNamePattern]] = el;
    }

    return subElements;
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
    this.controller.abort();
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
