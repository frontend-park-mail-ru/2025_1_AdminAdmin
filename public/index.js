import "./build/restaurantList.js";
import "./build/restaurantDetail.js";

const rootElement = document.getElementById('root');
const pageElement = document.createElement('main');

rootElement.appendChild(pageElement);

const restaurants = [
    { name: "Restaurant A" },
    { name: "Restaurant B" },
    { name: "Restaurant C" }
];


function renderRestaurantList() {
    const template = Handlebars.templates['restaurantList.hbs'];
    pageElement.innerHTML = template({ restaurantList: restaurants });
}

renderRestaurantList()


