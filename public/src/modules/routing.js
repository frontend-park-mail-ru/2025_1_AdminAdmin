import RestaurantList from "../pages/restaurantList/restaurantList.js";
import RestaurantPage from "../pages/restaurantPage/restaurantPage.js";
import LoginPage from "../pages/loginPage/loginPage.js";
import RegisterPage from "../pages/registerPage/registerPage.js";

let parentElement;

const config = {
    home: {
        href: '/',
        class: RestaurantList,
    },
    restaurantPage: {
        href: '/restaurants/',
        class: RestaurantPage,
    },
    loginPage: {
        href: '/login',
        class: LoginPage,
    },
    registerPage: {
        href: '/register',
        class: RegisterPage,
    }
};


export function initRouting(parent) {
    parentElement = parent;
    handleRouteChange();

    window.addEventListener("popstate", handleRouteChange); // Обработчик кнопок "назад"/"вперёд"
}

function handleRouteChange() {
    const currentPath = window.location.pathname;

    if (currentPath === "/") {
        goToPage('home', null, false);
        return;
    }
    for (const [page, { href }] of Object.entries(config).slice(1)) {
        if (currentPath.startsWith(href)) {
            const id = currentPath.split("/")[2] || null;
            return goToPage(page, id, false);
        }
    }
}

export default async function goToPage(page, id = null, shouldPushState = true) {
    parentElement.innerHTML = '';
    if (shouldPushState) {
        if (id) {
            history.pushState({ id: id }, "", `${config[page].href}${id}`);
        } else {
            history.pushState({}, "", config[page].href);
        }
    }
    const pageClass = new config[page].class(parentElement, id)
    pageClass.render()
}
