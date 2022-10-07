export default class SQLBuilder {
    _db;
    _from;
    _where;
    _order;
    _limit;
    _attributes;
    _action;
    _offset;
    constructor(db) {
        this._db = db;
        this._from = "";
        this._where = "";
        this._order = "";
        this._limit = null;
        this._attributes = "*";
        this._action = "SELECT";
        this._offset = 0;
    }
    action(action) {
        this._action = action;
        return this;
    }
    attributes(attributes) {
        this._attributes = attributes;
        return this;
    }
    from(name) {
        this._from = name;
        return this;
    }
    limit(limit) {
        this._limit = limit;
        return this;
    }
    order(order, direction) {
        if (this._order) {
            this._order = `${order} ${direction}`;
        }
        else {
            this._order += `, ${order} ${direction}`;
        }
        return this;
    }
    where(condition) {
        this._where = condition;
        return this;
    }
    build() {
        const sqlList = [];
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
