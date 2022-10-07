import { Router } from "express";
import databaseUtil from "../util/db/index.js";

export const locationsRouter = Router();

const demoData = [
  {
    name: "Trader Bing's",
    area: "Austin Hall",
    address: "2751 SW Jefferson Way Corvallis, OR 97331",
    description: "Example description",
    latitude: 44.56505,
    longitude: -123.282096,
    usesDiningDollars: true,
    startHours: "07:30",
    endHours: "18:00",
  },
];

function waitForDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const interval = setInterval(() => {
      if (databaseUtil.dataInitialized) {
        clearInterval(interval);
        resolve();
      } else {
        tries++;
        if (tries > 15) {
          clearInterval(interval);
          reject();
        }
      }
    }, 1000);
  });
}

locationsRouter.use(async (req, res, next) => {
  if (!databaseUtil.dataInitialized) {
    await waitForDatabase();
    next();
  } else {
    next();
  }
});

locationsRouter.get("/", (req, res) => {
  res.json(demoData);
});
