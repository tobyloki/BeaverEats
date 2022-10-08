import databaseUtil from "./index.js";
import moment from "moment-timezone";

function getRelevantHours(hours: Hours[]): Hours {
  const now = moment().tz("America/Los_Angeles");
  let bestHours: Hours = { start: null, end: null };
  for (const hour of hours) {
    const { start, end } = hour,
      start24 = moment(start, "h:mm A").format("HH:mm"),
      end24 = moment(end, "h:mm A").format("HH:mm"),
      startMoment = now.clone(),
      endMoment = now.clone();

    startMoment.hour(parseInt(start24.split(":")[0]));
    startMoment.minute(parseInt(start24.split(":")[1]));
    startMoment.second(0);
    endMoment.hour(parseInt(end24.split(":")[0]));
    endMoment.minute(parseInt(end24.split(":")[1]));
    endMoment.second(0);
    if (now.isBetween(startMoment, endMoment)) {
      bestHours = {
        start: start24,
        end: end24,
      };
      break;
    }
  }
  return bestHours;
}

async function insertRestaurant(
  restaurant: Restaurant,
  database: import("./databasePromise.js").Database
) {
  const stmt = await database.prepare(
      `
      INSERT INTO Location
      VALUES (?,?,?,?,?)
      `
    ),
    { name, location, diningDollars, hours } = restaurant,
    { start, end } = getRelevantHours(hours);
  await stmt.run(name, location, !!diningDollars, start, end);
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
    description?.join(" ") ?? "",
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
  for (const restaurant of data) {
    await insertRestaurant(restaurant, database);
    for (const section of restaurant.menu) {
      await insertMenuSection(section, restaurant.name, database).catch(() => {
        console.error("Duplicate menu section:", section.title, restaurant.name);
      });
      for (const item of section.items) {
        await insertMenuItem(
          item,
          section.title,
          restaurant.name,
          database
        ).catch(() => {
          console.error("Duplicate item found:", item.name, section.title, restaurant.name);
        });
      }
    }
  }
  databaseUtil.dataInitialized = true;
}
