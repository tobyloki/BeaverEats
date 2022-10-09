# Location Menus

## Fetch all location menu sections

[`GET /locations/:location/menus`](https://beaver-eats-backend-demo.fly.dev/locations/Deli/menus)

- `:location` is the name of the restaurant

### Response

```json
[
  {
    "title": "Drinks",
    "items": [
      {
        "name": "Coffee",
        "description": "Example description"
      }
    ]
  }
]
```
- `title` is the name of the menu section
- `items` is a list of menu items
  - `name` is the name of the menu item
  - `description` is the description of the menu item

## Fetch all location menu items

[`GET /locations/:location/menus/:section`](https://beaver-eats-backend-demo.fly.dev/locations/Deli/menus/Nori%20Grill%20~%20Build%20Your%20Own%20Ramen%20Bowl-%20Broth%20Selections)

- `:location` is the name of the restaurant
- `:section` is the name of the menu section

### Response

```json
[
  {
    "name": "Coke",
    "description": "A refreshing beverage"
  },
  {
    "name": "Pepsi",
    "description": "A refreshing beverage"
  }
]
```

- Description may be an empty string
- Description may contain newlines, indicating more subcategories
- Sorted by `name`
