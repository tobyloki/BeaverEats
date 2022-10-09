# Hours

## Fetch all hours

[`GET /hours`](https://beaver-eats-backend-demo.fly.dev/hours)

### Response

```json
[
  {
    "name": "Deli",
    "hours": [
      {
        "start": "0730",
        "end": "1100"
      },
      {
        "start": "1300",
        "end": "1845"
      }
    ]
  },
  {
    "name": "Nori Grill",
    "hours": [
      {
        "start": "0730",
        "end": "1100"
      },
      {
        "start": "1300",
        "end": "1845"
      }
    ]
  }
]
```

- `name` is the name of the restaurant
- `hours` is a list of hours for the restaurant
  - `start` and `end` are in 24-hour time
  - May contain 0 or more items
