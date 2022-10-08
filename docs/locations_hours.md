# Location Hours

## Fetch all location hours

[`GET /locations/:location/hours`](https://beaver-eats-backend-demo.fly.dev/locations/hours)

- `:location` is the name of the restaurant

### Response

```json
[
  {
    "start": "0730",
    "end": "1100"
  },
  {
    "start": "1300",
    "end": "1845"
  }
]
```

- This list may be empty, indicating that the location may no longer open for the day.
- Sorted by `start` time
- `start` and `end` are in 24-hour time
