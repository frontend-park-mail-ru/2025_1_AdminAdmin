import goToPage from "../../modules/routing.js";
import {AppRestaurantRequests} from "../../modules/ajax.js";
import Header from "../../components/header/header.js";
import { restaurantCard } from "../../components/restaurantCard/restaurantCard.js";

export default class RestaurantList {
    #parent;
    #header;

    constructor(parent) {
        this.parent = parent;
        this.restaurantList = [];
        this.template = Handlebars.templates["restaurantList.hbs"];
        this.page = null
    }

    /* Ссылка на объект */
    get self(){
        return document.querySelector("restaurant__container");
    } 

    async render() {
        try {
            this.restaurantList = await AppRestaurantRequests.GetAll();
            if (!this.restaurantList) throw new Error("Empty restaurant list"); // Список ресторанов пуст
            this.#header = new Header(parent)
            this.#header.render() // Рендерим хедер перед карточками
            template = window.Handlebars.templates["restaurantList.hbs"];
            html =  template();
            this.#parent.insertAdjacentHTML("beforeend", html);
            for (let restaurant of restaurantList) {
                const card = new restaurantCard(this.self, restaurant);
                card.render();
            };
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
