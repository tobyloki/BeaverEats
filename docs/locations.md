# Location

## Fetch all locations

[`GET /locations`](https://beaver-eats-backend-demo.fly.dev/locations)

### Response

```json
[
  {
    "name": "Trader Bing's",
    "area": "Austin Hall",
    "usesDiningDollars": true,
    "startHours": "07:30",
    "endHours": "18:00"
  }
]
```

* `startHours` and `endHours` are in 24-hour time and may be `null`.

## Options

### Sorting

`?sort=<field>`

- [`name`](https://beaver-eats-backend-demo.fly.dev/locations?sort=name)
  - Sorts alphabetically by name
- [`area`](https://beaver-eats-backend-demo.fly.dev/locations?sort=area)
  - Sorts alphabetically by area name
- [`usesDiningDollars`](https://beaver-eats-backend-demo.fly.dev/locations?sort=usesDiningDollars)
  - Sorts by name
  - Prioritizes locations that accept dining dollars
- [`startHours`](https://beaver-eats-backend-demo.fly.dev/locations?sort=startHours)
  - Sorts by name
  - Prioritizes locations that open earlier
- [`endHours`](https://beaver-eats-backend-demo.fly.dev/locations?sort=endHours)
  - Sorts by name
  - Prioritizes locations that close later

### Ordering

`?order=<order>`

- `asc`
  - Sorts in ascending order
- `desc`
  - Sorts in descending order

### Filtering

`?filter=(<field>:<value>|...)`

### Searching

`?search=<query>`

- Searches for locations that match the query
