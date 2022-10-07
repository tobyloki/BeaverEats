export default class SQLBuilder {
  _from: string;
  _where: string;
  _order: string;
  _limit: number | null;
  _attributes: string;
  _action: string;
  _offset: number;

  constructor() {
    this._from = "";
    this._where = "";
    this._order = "";
    this._limit = null;
    this._attributes = "*";
    this._action = "SELECT";
    this._offset = 0;
  }

  action(action: string) {
    this._action = action;
    return this;
  }

  attributes(attributes: string) {
    this._attributes = attributes;
    return this;
  }

  from(name: string) {
    this._from = name;
    return this;
  }

  limit(limit: number) {
    this._limit = limit;
    return this;
  }

  order(order: string, direction: "ASC" | "DESC") {
    if (this._order) {
      this._order = `${order} ${direction}`;
    } else {
      this._order += `, ${order} ${direction}`;
    }
    return this;
  }

  where(condition: string, isRequired = true) {
    if (this._where) {
      this._where += ` ${isRequired ? "AND" : "OR"} ${condition}`;
    } else {
      this._where = condition;
    }
    return this;
  }

  build() {
    const sqlList: string[] = [];
    sqlList.push(this._action);
    switch (this._action) {
      case "SELECT":
        sqlList.push(this._attributes);
        sqlList.push("FROM");
        sqlList.push(this._from);
        if (this._where) {
          sqlList.push("WHERE");
          sqlList.push(this._where);
        }
        if (this._order) {
          sqlList.push("ORDER BY");
          sqlList.push(this._order);
        }
        if (this._limit) {
          sqlList.push("LIMIT");
          sqlList.push(this._limit.toString());
        }
        if (this._offset) {
          sqlList.push("OFFSET");
          sqlList.push(this._offset.toString());
        }
        break;
    }
    return sqlList.join(" ");
  }
}
