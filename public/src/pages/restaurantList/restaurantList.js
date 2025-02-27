import { router } from "../../modules/routing.js";
import { AppRestaurantRequests } from "../../modules/ajax.js";

export default class RestaurantList {
    #parent;
    #restaurantList;
    #template;
    #page;
    #clickHandler;

    constructor(parent) {
        this.#parent = parent;
        this.#restaurantList = [];
        this.#template = Handlebars.templates["restaurantList.hbs"];
        this.#page = null;
        this.#clickHandler = this.#handleClick.bind(this);
    }

    async render() {
        try {
            this.#restaurantList = await AppRestaurantRequests.GetAll();
            if (!this.#restaurantList) throw new Error("Empty restaurant list");

            this.#page = this.#template({ restaurantList: this.#restaurantList });
            this.#parent.innerHTML = this.#page;
            this.#addEventListeners();
        } catch (error) {
            console.error("Error rendering restaurant list:", error);
        }
    }

    #addEventListeners() {
        document.addEventListener("click", this.#clickHandler);
    }

    #handleClick(event) {
        const restaurantCard = event.target.closest(".restaurant-card");
        if (restaurantCard) {
            const restaurantId = restaurantCard.dataset.id;
            router.goToPage("restaurantPage", restaurantId);
        }
    }

    remove() {
        document.removeEventListener("click", this.#clickHandler);
        this.#parent.innerHTML = "";
    }
}
