import "./build/restaurantList.js";
import "./build/restaurantPage.js";
import "./build/header.js";
import "./build/restaurantCard.js"
import * as requests from "./src/modules/requests.js"

const rootElement = document.getElementById("root");
const pageElement = document.createElement("main");

rootElement.appendChild(pageElement);

Handlebars.registerPartial("restaurantCard", Handlebars.templates["restaurantCard.hbs"]);

function renderHeader() {
    const template = Handlebars.templates["header.hbs"];
    rootElement.insertAdjacentHTML("afterbegin", template());

    document.getElementsByClassName("logo")[0].addEventListener("click", () => {
        renderRestaurantList();
        history.pushState({}, "", "/");
    })
}

async function renderRestaurantList() {
    try {
        let restaurantList = await requests.getRestaurantList();
        if (!restaurantList) throw new Error("Empty restaurant list");
        const template = Handlebars.templates["restaurantList.hbs"];
        pageElement.innerHTML = template({ restaurantList });

        document.querySelectorAll(".restaurant-card").forEach(card => {
            card.addEventListener("click", () => {
                const restaurantId = card.dataset.id;
                renderRestaurantPage(restaurantId);
                history.pushState({ id: restaurantId }, "", `/restaurants/${restaurantId}`);
            });
        });

    } catch (error) {
        console.error("Error rendering restaurant list:", error);
    }
}

async function renderRestaurantPage(id) {
    pageElement.innerHTML = '';
    try {
        let restaurantDetail = await requests.getRestaurantById(id);
        if (!restaurantDetail) throw new Error("Empty restaurant list");
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let openStatus;
        if (restaurantDetail.workingHours.open < currentTime && restaurantDetail.workingHours.closed > currentTime)
            openStatus = "Open"
        else
            openStatus = "Closed"
        const template = Handlebars.templates["restaurantPage.hbs"];
        pageElement.innerHTML = template({ restaurantDetail, openStatus });
    } catch (error) {
        console.error("Error rendering restaurant list:", error);
    }
}

window.addEventListener('popstate', (event) => {
    const restaurantId = event.state ? event.state.id : null;
    if (restaurantId) {
        renderRestaurantPage(restaurantId);
    } else {
        renderRestaurantList();
    }
});

const currentPath = window.location.pathname;
if (currentPath.startsWith("/restaurants/")) {
    const restaurantId = currentPath.split("/")[2];
    renderRestaurantPage(restaurantId);
} else {
    renderRestaurantList();
}

renderHeader();
