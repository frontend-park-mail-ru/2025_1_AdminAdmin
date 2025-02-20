import express from "express";
import path from "path";
const app = express();

app.use(express.static("public"));
app.use("/handlebars", express.static(path.join('node_modules', 'handlebars', 'dist')));

app.use(logger)

function logger(req, res, next) {
    console.log(req.originalUrl);
    next();
}

app.listen(3000)