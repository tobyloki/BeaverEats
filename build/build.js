import sqlite3 from "sqlite3";
import { URL } from "url";
import fs from "fs/promises";
import path from "path";

const __dirname = new URL(".", import.meta.url).pathname,
  db = new sqlite3.Database(path.join(__dirname, "../db/database.sqlite.db")),
  sql = await fs.readFile(path.join(__dirname, "../db/schema.sql"), "utf8");

db.on("open", () => {
  db.exec(sql, (err) => {
    if (err) {
      console.error(err);
    }
  });
});
