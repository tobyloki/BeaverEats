import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { locationsRouter } from "./routers/locations.js";
import scrape from "./util/scrape.js";
import updateData from "./util/db/updateData.js";
const app = express();
app.use((req, res, next) => {
    console.log(`Handling request for ${req.url}`);
    next();
});
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.json("200 OK");
});
app.use("/locations", locationsRouter);
app.listen(process.env.PORT || 3000, () => {
    console.log(`Listening on port ${process.env.PORT || 3000}`);
});
updateData(await scrape());
