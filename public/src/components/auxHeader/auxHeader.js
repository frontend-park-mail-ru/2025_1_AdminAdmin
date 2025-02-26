export default class auxHeader {
    constructor(parent) {
        this.parent = parent;
        this.template = Handlebars.templates["auxHeader.hbs"];
    }

    render() {
        this.parent.innerHTML = this.template();
    }

}
