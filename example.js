const { getRestaurantsFullData } = require('./index.js'),
  fs = require('fs');

getRestaurantsFullData().then((data) => {
  fs.writeFileSync('restaurants.json', JSON.stringify(data, null, 2));
})
