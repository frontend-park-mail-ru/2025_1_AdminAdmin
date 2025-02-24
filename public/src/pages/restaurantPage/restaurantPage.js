import * as requests from "../../modules/requests.js";
import {AppRestaurantRequests} from "../../modules/ajax.js";

export default class RestaurantPage {
    constructor(parent, id) {
        this.parent = parent;
        this.id = id;
        this.restaurantDetail = null;
        this.page = null
    }

    async render() {
        try {
            this.restaurantDetail = await AppRestaurantRequests.Get(this.id);
            if (!this.restaurantDetail) throw new Error("Empty restaurant detail");

            const template = Handlebars.templates["restaurantPage.hbs"];
            this.page = template({ restaurantDetail: this.restaurantDetail, openStatus: this._getOpenStatus() });
            this.parent.innerHTML = this.page;

        } catch (error) {
            console.error("Error rendering restaurant page:", error);
        }
    }

    _getOpenStatus() {
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (this.restaurantDetail.workingHours.open < currentTime && this.restaurantDetail.workingHours.closed > currentTime) {
            return "Open";
        } else {
            return "Closed";
        }
    }
}
