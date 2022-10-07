import databaseUtil from "./index.js";

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
    { name, location, diningDollars, start, end } = restaurant;
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
  database: import("./databasePromise.js").Database
) {
  const stmt = await database.prepare(
      `
      INSERT INTO MenuItem
      VALUES (?,?,?)
      `
    ),
    { name, description } = menuItem;
  await stmt.run(name, description[0], menuSectionTitle);
}

export default async function updateData(data: ScrapeResults | null) {
  if (data === null) {
    return;
  }
  const { database } = databaseUtil;
  for (const restaurant of data) {
    await insertRestaurant(restaurant, database);
    for (const section of restaurant.menu) {
      await insertMenuSection(section, restaurant.location, database);
      for (const item of section.items) {
        await insertMenuItem(item, section.title, database);
      }
    }
  }
  databaseUtil.dataInitialized = true;
}
