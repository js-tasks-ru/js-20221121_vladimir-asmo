export default class NotificationMessage {
  static lastInstance = null;

  element = null;
  timerId = null;

  constructor(
    message = 'Hello world',
    { duration = 2000, type = 'success' } = {}
  ) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  get template() {
    return `
      <div class="notification ${this.type}"
        style="--value:${this.duration}ms">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  get activeMessage() {
    return NotificationMessage.lastInstance;
  }

  set activeMessage(instance) {
    if (NotificationMessage.lastInstance) {
      NotificationMessage.lastInstance.hide();
    }

    NotificationMessage.lastInstance = instance;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
  }

  clearTimer() {
    clearTimeout(this.timerId);
    this.timerId = null;
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  destroy() {
    this.remove();
    this.clearTimer();
  }

  show(target = document.body) {
    this.activeMessage = this;

    if (!this.element) {
      this.render();
    }

    target.append(this.element);

    this.timerId = setTimeout(() => {
      this.hide();
    }, this.duration);
  }

  hide() {
    this.destroy();
  }
}
