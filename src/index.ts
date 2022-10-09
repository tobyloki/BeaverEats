import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { locations, hours } from "./routers/index.js";
import scrape from "./util/scrape.js";
import databaseUtil from "./util/db/index.js";
import moment from "moment-timezone";

const app = express();

app.use((req, res, next) => {
  console.log(`Handling request for ${req.url}`);
  next();
});

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json("200 OK");
});

app.use("/locations", locations);
app.use("/hours", hours);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on port ${process.env.PORT || 3000}`);
});

async function updateDatabase() {
  databaseUtil
    .updateData(
      await scrape()
        .then(async (data) => {
          await databaseUtil.database.run("BEGIN TRANSACTION");
          return data;
        })
        .catch((err) => {
          console.error(
            "Failed to initialize scraper. Check logs for details."
          );
          console.error(err);
          return null;
        })
    )
    .then(async () => {
      await databaseUtil.database.run("COMMIT TRANSACTION");
      console.log("Updated database successfully.");
    })
    .catch(async (err) => {
      await databaseUtil.database.run("ROLLBACK TRANSACTION");
      console.error("Failed to update database. Check logs for details.");
      console.error(err);
    });
}

// Get time in milliseconds until next 30 minute interval
const currentTime = moment(),
  nextInterval = moment().add(30 - (currentTime.minute() % 30), "minutes"),
  timeUntilNextInterval = nextInterval.diff(currentTime);

if (timeUntilNextInterval > 1000 * 60 * 5) {
  await updateDatabase();
}
setTimeout(() => {
  updateDatabase();
  setInterval(updateDatabase, 30 * 60 * 1000);
}, timeUntilNextInterval);
