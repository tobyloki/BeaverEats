import { Router } from "express";
import databaseUtil from "../util/db/index.js";

export const hoursRouter = Router();

hoursRouter.get("/", async (req, res) => {
  const locationSQL = `
    SELECT name
    FROM Location
  `,
    locations = await databaseUtil.database.all<SQLLocation>(locationSQL);
  res.json(
    await Promise.all(
      locations.map(async (location) => {
        const hoursSql = `
          SELECT start, end
          FROM Hours
          WHERE locationName = ?
        `,
          hoursStmt = await databaseUtil.database.prepare(hoursSql),
          hours = await hoursStmt.all<SQLHours>(location.name);
        return {
          name: location.name,
          hours,
        };
      })
    )
  );
});
