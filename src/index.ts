import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { locationsRouter } from "./routers/locations.js";
import scrape from "./util/scrape.js";
import databaseUtil from "./util/db/index.js";

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

async function updateDatabase() {
  databaseUtil
    .updateData(
      await scrape().catch(() => {
        console.log("Failed to initialize scraper. Check logs for details.");
        return null;
      })
    )
    .catch((err) => {
      console.log("Failed to update database. Check logs for details.");
      console.log(err);
    });
}

await updateDatabase();
setInterval(updateDatabase, 1000 * 60 * 30);
