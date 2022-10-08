import databaseUtil from "./index.js";
import moment from "moment-timezone";

export function formatHour(hour: string): string {
  return moment(hour, "h:mm A").format("HHmm");
}

async function insertHours(
  name: string,
  hours: Hours[],
  database: import("./databasePromise.js").Database
) {
  for (const { start, end } of hours) {
    const stmt = await database.prepare(
      `
      INSERT INTO Hours
      VALUES (?,?,?)
      `
    );
    if (start && end) {
      const formattedStart = formatHour(start),
        formattedEnd = formatHour(end);
      await stmt.run(name, formattedStart, formattedEnd);
    }
  }
}

async function insertRestaurant(
  restaurant: Restaurant,
  database: import("./databasePromise.js").Database
) {
  const stmt = await database.prepare(
      `
      INSERT INTO Location
      VALUES (?,?,?)
      `
    ),
    { name, location, diningDollars, hours } = restaurant;
  await stmt.run(name, location, !!diningDollars);
  await insertHours(name, hours, database);
}

async function insertMenuSection(
  menuSection: MenuSection,
  location: string,
  database: import("./databasePromise.js").Database
) {
  const stmt = await database.prepare(
      `
      INSERT INTO MenuItemSection (name, locationName)
      VALUES (?,?)
      `
    ),
    { title } = menuSection;
  await stmt.run(title, location);
}

async function insertMenuItem(
  menuItem: MenuItem,
  menuSectionTitle: string,
  locationName: string,
  database: import("./databasePromise.js").Database
) {
  const stmt = await database.prepare(
      `
      INSERT INTO MenuItem
      VALUES (?,?,?,?)
      `
    ),
    { name, description } = menuItem;
  await stmt.run(
    name,
    description?.join("\n") ?? "",
    menuSectionTitle,
    locationName
  );
}

export default async function updateData(data: ScrapeResults | null) {
  if (data === null) {
    return;
  }
  const { database } = databaseUtil;
  databaseUtil.dataInitialized = false;
  await database.run("DELETE FROM Location");
  await database.run("DELETE FROM MenuItemSection");
  await database.run("DELETE FROM MenuItem");
  await database.run("DELETE FROM Hours");
  for (const restaurant of data) {
    await insertRestaurant(restaurant, database);
    for (const section of restaurant.menu) {
      await insertMenuSection(section, restaurant.name, database).catch(() => {
        console.error(
          "Duplicate menu section:",
          section.title,
          restaurant.name
        );
      });
      for (const item of section.items) {
        await insertMenuItem(
          item,
          section.title,
          restaurant.name,
          database
        ).catch((err) => {
          console.error(
            "Duplicate item found:",
            item.name,
            section.title,
            restaurant.name,
            err
          );
        });
      }
    }
  }
  databaseUtil.dataInitialized = true;
}
