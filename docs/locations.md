# Location

## Fetch all locations

`GET /locations`

### Response

```json
[
  {
    "name": "Trader Bing's",
    "area": "Austin Hall",
    "address": "2751 SW Jefferson Way Corvallis, OR 97331",
    "description": "Example description",
    "latitude": 44.56505,
    "longitude": -123.282096,
    "usesDiningDollars": true,
    "startHours": "07:30",
    "endHours": "18:00"
  }
]
```

## Options

### Sorting

`?sort=<field>`

- `name`
  - Sorts alphabetically by name
- `area`
  - Sorts alphabetically by area name
- `usesDiningDollars`
  - Sorts by name
  - Prioritizes locations that accept dining dollars
- `startHours`
  - Sorts by name
  - Prioritizes locations that open earlier
- `endHours`
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
