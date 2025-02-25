import RestaurantList from "../pages/restaurantList/restaurantList.js";
import RestaurantPage from "../pages/restaurantPage/restaurantPage.js";
import LoginPage from "../pages/loginPage/loginPage.js";
import RegisterPage from "../pages/registerPage/registerPage.js";
import Header from "../../src/components/header/header.js";
import auxHeader from "../components/auxHeader/auxHeader.js";

let parentElement;
let headerElement;
let pageElement;
let currentHeader = '';

const config = {
    home: {
        href: '/',
        class: RestaurantList,
        header: Header,
    },
    restaurantPage: {
        href: '/restaurants/',
        class: RestaurantPage,
        header: Header,
    },
    loginPage: {
        href: '/login',
        class: LoginPage,
        header: auxHeader,
    },
    registerPage: {
        href: '/register',
        class: RegisterPage,
        header: auxHeader,
    }
};


export function initRouting(parent) {
    parentElement = parent;
    headerElement = document.createElement("header");
    parentElement.appendChild(headerElement);
    pageElement = document.createElement("main");
    parentElement.appendChild(pageElement);

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
    if (config[page].header !== currentHeader) {
        headerElement.innerHTML = ''; // исправлено innerHtml → innerHTML
        currentHeader = config[page].header; // обновляем текущий заголовок
        const header = new currentHeader(headerElement);
        header.render();
    }

    pageElement.innerHTML = '';

    if (shouldPushState) {
        const newPath = id ? `${config[page].href}${id}` : config[page].href;
        history.pushState(id ? { id } : {}, "", newPath);
    }

    const pageClass = new config[page].class(pageElement, id);
    pageClass.render();
}

