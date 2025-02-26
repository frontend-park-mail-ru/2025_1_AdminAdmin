import goToPage from "../../modules/routing.js";
import {AppRestaurantRequests} from "../../modules/ajax.js";

export default class RestaurantList {
    constructor(parent) {
        this.parent = parent;
        this.restaurantList = [];
        this.template = Handlebars.templates["restaurantList.hbs"];
        this.page = null
    }

    async render() {
        try {
            this.restaurantList = await AppRestaurantRequests.GetAll();
            if (!this.restaurantList) throw new Error("Empty restaurant list");
            this.page = this.template({ restaurantList: this.restaurantList });
            this._addEventListeners();
            this.parent.innerHTML = this.page;
        } catch (error) {
            console.error("Error rendering restaurant list:", error);
        }
    }

    _addEventListeners() {
        document.addEventListener("click", (event) => {
            if (event.target.closest(".restaurant-card")) {
                const restaurantId = event.target.closest(".restaurant-card").dataset.id;
                goToPage('restaurantPage', restaurantId);
            }
        });
    }
}
