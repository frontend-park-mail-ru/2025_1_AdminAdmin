export default class AuxHeader {
  #parent;
  #template;

  constructor(parent) {
    this.#parent = parent;
    this.#template = Handlebars.templates['auxHeader.hbs'];
  }

  render() {
    this.#parent.innerHTML = this.#template();
  }

  remove() {
    this.#parent.innerHTML = '';
  }
}
