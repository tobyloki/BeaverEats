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

  get<E>(...param: any): Promise<E> {
    return new Promise((resolve, reject) => {
      this._stmt.get(...param, (err: Error | null, row: E) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all<E>(...param: any): Promise<E[]> {
    return new Promise((resolve, reject) => {
      this._stmt.all(...param, (err: Error | null, rows: E[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
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

  run(sql: string): Promise<void> {
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

  get<E>(sql: string): Promise<E> {
    return new Promise((resolve, reject) => {
      this._db.get(sql, (error, row) => {
        if (error) {
          reject(error);
        } else {
          resolve(row);
        }
      });
    });
  }

  all<E>(sql: string): Promise<E[]> {
    return new Promise((resolve, reject) => {
      this._db.all(sql, (error, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve(rows);
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
