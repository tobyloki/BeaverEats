import express from "express";
import databaseUtil from "../util/db/index.js";
import { formatHour } from "../util/db/updateData.js";
import moment from "moment-timezone";

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
    bindValues: any[] = [],
    currentHoursFormatted = formatHour(
      moment().tz("America/Los_Angeles").format("h:mm A")
    );
  sqlbuilder.from("Location");

  if (query.sort) {
    switch (query.sort) {
      case "name":
        sqlbuilder.order("name", order);
        break;
      case "area":
      case "usesDiningDollars":
        sqlbuilder.order(query.sort.toString(), order);
        sqlbuilder.order("name", "ASC");
        break;
      case "startHours":
      case "endHours":
        sqlbuilder.order(
          `
        (SELECT ${query.sort === "startHours" ? "start" : "end"}
        FROM Hours
        WHERE locationName = Location.name
          AND start <= "${currentHoursFormatted}"
          AND end >= "${currentHoursFormatted}"
        LIMIT 1)
        `,
          order
        );
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
    await Promise.all(
      rows.map(async (row) => {
        const sql = `
        SELECT start, end
        FROM Hours
        WHERE locationName = ?
          AND start <= "${currentHoursFormatted}"
          AND end >= "${currentHoursFormatted}"
        LIMIT 1
      `,
          stmt = await databaseUtil.database.prepare(sql),
          hours = await stmt.get<SQLHours>(row.name).catch(() => null);
        return {
          name: row.name,
          area: row.area,
          usesDiningDollars: !!row.usesDiningDollars,
          startHours: hours?.start ?? null,
          endHours: hours?.end ?? null,
        };
      })
    )
  );
});

locationsRouter.get("/:location/hours", async (req, res) => {
  const sql = `
    SELECT start, end
    FROM Hours
    WHERE locationName = ?
    ORDER BY start ASC
  `,
    stmt = await databaseUtil.database.prepare(sql),
    rows = await stmt.all<SQLHours>(req.params.location).catch(() => []);
  console.log(req.params);
  res.json(
    rows.map((row) => ({
      start: row.start,
      end: row.end,
    }))
  );
});

locationsRouter.get("/:location/menus", async (req, res) => {
  const sql = `
    SELECT name
    FROM MenuItemSection
    WHERE locationName = ?
    ORDER BY name ASC
  `,
    stmt = await databaseUtil.database.prepare(sql),
    rows = await stmt.all<SQLMenuSection>(req.params.location).catch(() => []);
  res.json(
    rows.map((row) => ({
      name: row.name,
    }))
  );
});

locationsRouter.get("/:location/menus/:section", async (req, res) => {
  const sql = `
    SELECT name, description
    FROM MenuItem
    WHERE locationName = ?
      AND menuSection = ?
    ORDER BY name ASC
  `,
    stmt = await databaseUtil.database.prepare(sql),
    rows = await stmt
      .all<SQLMenuItem>(req.params.location, req.params.section)
      .catch(() => []);
  res.json(
    rows.map((row) => ({
      name: row.name,
      description: row.description,
    }))
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
