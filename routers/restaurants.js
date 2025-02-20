import { fileURLToPath } from "url";
import { dirname, join } from "node:path";
import renderTemplate from "../utils/renderTemplate.js";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const restaurants = [
    { name: "Restaurant A" },
    { name: "Restaurant B" },
    { name: "Restaurant C" }
];

router.get("/", (req, res) => {
    const html = renderTemplate(join(__dirname, "../views/restaurantList.hbs"), { restaurants });
    res.send(html);
});

router.get("/:id", (req, res) => {
    if (!req.restaurant) {
        return res.status(404).send("Ресторан не найден");
    }
    const html = renderTemplate(join(__dirname, "../views/restaurantDetail.hbs"), { restaurant: req.restaurant });
    res.send(html);
});

router.param("id", (req, res, next, id) => {
    req.restaurant = restaurants[id];
    next();
});

export default router;
