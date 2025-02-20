const express = require('express');
const router = express.Router();

const restaurants = [
    { name: "Restaurant A" },
    { name: "Restaurant B" },
    { name: "Restaurant C" }
];

router.get("/", (req, res) => {
    res.render("restaurantList", { restaurants });
});

router.get("/:id", (req, res) => {
    res.render("restaurantDetail", { restaurant: req.restaurant });
});

router.param("id", (req, res, next, id) => {
    req.restaurant = restaurants[id]
    next()
})

module.exports = router;
