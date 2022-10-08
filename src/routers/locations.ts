import express from "express";
import databaseUtil from "../util/db/index.js";

export const locationsRouter = express.Router();

function waitForDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const interval = setInterval(() => {
      if (databaseUtil.dataInitialized) {
        clearInterval(interval);
        resolve();
      } else {
        tries++;
        if (tries > 25) {
          clearInterval(interval);
          reject(new Error("Database not initialized."));
        }
      }
    }, 1000);
  });
}

locationsRouter.use(async (req, res, next) => {
  if (!databaseUtil.dataInitialized) {
    waitForDatabase().then(next).catch(next);
  } else {
    next();
  }
});

locationsRouter.get("/", async (req, res) => {
  const sqlbuilder = new databaseUtil.SQLBuilder(),
    { query } = req,
    order = query.order?.toString().toUpperCase() === "DESC" ? "DESC" : "ASC",
    bindValues: any[] = [];

  sqlbuilder.from("Location");

  if (query.sort) {
    switch (query.sort) {
      case "name":
        sqlbuilder.order("name", order);
        break;
      case "area":
      case "usesDiningDollars":
      case "startHours":
      case "endHours":
        sqlbuilder.order(query.sort.toString(), order);
        sqlbuilder.order("name", "ASC");
        break;
    }
  } else {
    sqlbuilder.order("name", "ASC");
  }

  if (query.search) {
    sqlbuilder.where("name LIKE ? OR area LIKE ?");
    bindValues.push(`%${query.search}%`, `%${query.search}%`);
  }

  const sql = sqlbuilder.build(),
    stmt = await databaseUtil.database.prepare(sql),
    rows = await stmt.all<SQLLocation>(...bindValues).catch(() => []);
  res.json(
    rows.map((row) => {
      return {
        name: row.name,
        area: row.area,
        usesDiningDollars: !!row.usesDiningDollars,
        startHours: row.startHours,
        endHours: row.endHours,
      };
    })
  );
});

/* eslint-disable @typescript-eslint/no-unused-vars */
// Eslint is complaining about the unused next parameter,
// but it is required for express to recognize this as an error handler.
locationsRouter.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
);
/* eslint-enable @typescript-eslint/no-unused-vars */
