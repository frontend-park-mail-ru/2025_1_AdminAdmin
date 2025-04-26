import template from './layout.hbs';

/**
 * Макет
 */
class Layout {
  #parent;

  /**
   * Конструктор класса
   * @param {Element} parent - родительский элемент
   */
  constructor(parent) {
    this.#parent = parent;
  }

  /**
   * Рендеринг страницы
   */
  render() {
    this.#parent.insertAdjacentHTML('beforeend', template());
    const frame = this.#parent.querySelector('iframe');
    frame.src = '/survey';
    frame.style.opacity = '0';
    frame.style.pointerEvents = 'none';
    frame.style.transform = 'translateY(20px)';
    frame.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  }

  show() {
    const frame = document.querySelector('iframe');
    if (frame) {
      requestAnimationFrame(() => {
        frame.style.opacity = '1';
        frame.style.pointerEvents = 'all';
        frame.style.transform = 'translateY(0)';
      });
    }
  }

  hide() {
    const frame = document.querySelector('iframe');
    if (frame) {
      frame.style.opacity = 0;
      frame.style.pointerEvents = 'none';
    }
  }

  remove() {
    const frame = document.querySelector('iframe');
    if (frame) {
      frame.remove();
    }
  }
}

export default Layout;
