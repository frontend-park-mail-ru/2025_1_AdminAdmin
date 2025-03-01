import { AppRestaurantRequests } from '../../modules/ajax.js';

export default class RestaurantPage {
  #parent;
  #id;
  #restaurantDetail;
  #page;

  constructor(parent, id) {
    this.#parent = parent;
    this.#id = id;
    this.#restaurantDetail = null;
    this.#page = null;
  }

  async render() {
    try {
      const restaurants = await AppRestaurantRequests.GetAll();
      if (!Array.isArray(restaurants)) {
        throw new Error('Expected an array of restaurants');
      }
      this.#restaurantDetail = restaurants.find((r) => r.id === this.#id);

      const template = Handlebars.templates['restaurantPage.hbs'];
      this.#page = template({ restaurantDetail: this.#restaurantDetail });
      this.#parent.innerHTML = this.#page;
    } catch (error) {
      console.error('Error rendering restaurant page:', error);
    }
  }

  /*  #getOpenStatus() {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (
      this.#restaurantDetail.workingHours.open < currentTime &&
      this.#restaurantDetail.workingHours.closed > currentTime
    ) {
      return 'Open';
    } else {
      return 'Closed';
    }
  }*/

  remove() {
    this.#parent.innerHTML = '';
  }
}
