# Location

- [Menu API](./locations_menus.md)
- [Hours API](./locations_hours.md)

## Fetch all locations

[`GET /locations`](https://beaver-eats-backend-demo.fly.dev/locations)

### Response

```json
[
  {
    "name": "Trader Bing's",
    "area": "Austin Hall",
    "usesDiningDollars": true,
    "startHours": "0730",
    "endHours": "1800"
  }
]
```

- `startHours` and `endHours` are in 24-hour time and may be `null`.
  - `null` indicates that the location may be currently closed.

## Options

### Sorting

`?sort=<field>`

- [`name`](https://beaver-eats-backend-demo.fly.dev/locations?sort=name) (default)
  - Sorts alphabetically by name
- [`area`](https://beaver-eats-backend-demo.fly.dev/locations?sort=area)
  - Sorts alphabetically by area name
- [`usesDiningDollars`](https://beaver-eats-backend-demo.fly.dev/locations?sort=usesDiningDollars)
  - Sorts by name
  - Prioritizes locations that don't accept dining dollars
  - Set `order` to `desc` to reverse this
- [`startHours`](https://beaver-eats-backend-demo.fly.dev/locations?sort=startHours)
  - Sorts by name
  - Prioritizes locations that open earlier
- [`endHours`](https://beaver-eats-backend-demo.fly.dev/locations?sort=endHours)
  - Sorts by name
  - Prioritizes locations that close earlier

### Ordering

`?order=<order>`

- `asc` (default)
  - Sorts in ascending order
- `desc`
  - Sorts in descending order

### Filtering

`?filter=(<field>:<value>|...)`

- Currently not implemented

### Searching

`?search=<query>`

- Searches for locations that match the query
