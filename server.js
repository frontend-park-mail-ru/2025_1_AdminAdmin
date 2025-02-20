const express = require('express');
const app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(logger)

app.get("/", (req, res) => {
    res.render("index");
});

const restaurantRouter = require('./routers/restaurants');

app.use('/restaurants', restaurantRouter);

function logger(req, res, next) {
    console.log(req.originalUrl);
    next();
}

app.listen(3000)