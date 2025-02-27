import express from "express";
import path from "path";
import * as mocks from "./mocks.js";

const app = express();

app.use(express.static("public"));

app.use(logger);

function logger(req, res, next) {
    console.log(req.originalUrl);
    next();
}

app.get("*", (req, res) => {
    res.sendFile(path.resolve("public", "index.html"));
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
