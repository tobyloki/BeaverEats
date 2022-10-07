import sqlite3 from "sqlite3";
import { URL } from "url";
import path from "path";

const __dirname = new URL('.', import.meta.url).pathname;

function openDatabase(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(path.join(__dirname, "../../../db/database.sqlite.db"), (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(db);
      }
    });
  });
}

const database = await openDatabase();
