import sqlite3 from "sqlite3";

export class Statement {
  _stmt: sqlite3.Statement;

  constructor(stmt: sqlite3.Statement) {
    this._stmt = stmt;
  }

  run(...param: any): Promise<Statement> {
    return new Promise((resolve, reject) => {
      this._stmt.run(...param, (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  finalize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._stmt.finalize((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export class Database {
  _db: sqlite3.Database;

  constructor(db: sqlite3.Database) {
    this._db = db;
  }

  async run(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this._db.run(sql, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  prepare(sql: string): Promise<Statement> {
    return new Promise((resolve, reject) => {
      const stmp = this._db.prepare(sql, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(new Statement(stmp));
        }
      });
    });
  }
}
