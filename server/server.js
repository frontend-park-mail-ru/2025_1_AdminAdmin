import express from "express";
import path from "path";
import * as mocks from "./mocks.js";

const app = express();

app.use(express.static("public"));
app.use("/handlebars", express.static(path.join('node_modules', 'handlebars', 'dist')));

app.use(logger);

function logger(req, res, next) {
    console.log(req.originalUrl);
    next();
}

app.get('/restaurants', (req, res) => {
    res.json(mocks.restaurantList);
});

app.get('/restaurants/:id', (req, res) => {
    const restaurant = mocks.restaurantList.find(r => r.id === parseInt(req.params.id));

    if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }

    const menuItemIds = mocks.restaurantMenu[restaurant.id] || [];
    const menu = [];

    for (const category in mocks.menuItems) {
        const items = mocks.menuItems[category].filter(item => menuItemIds.includes(item.id));
        if (items.length > 0) {
            menu.push({ category, items });
        }
    }

    res.json({ ...restaurant, menu });
});

app.get("*", (req, res) => {
    res.sendFile(path.resolve("public", "index.html"));
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
