import express from "express";
import restaurantRouter from './routers/restaurants.js';
const app = express();

app.use(express.static("public"));
app.use(logger)
app.use('/restaurants', restaurantRouter);

app.get("/", (req, res) => {
    res.render("index");
});

function logger(req, res, next) {
    console.log(req.originalUrl);
    next();
}

app.listen(3000)