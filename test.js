const { getRestaurantsFullData } = require('./index.js');

test(
	'Get restaurant full data',
	async () => {
		const restaurants = await getRestaurantsFullData();
		expect(restaurants.length).toBeGreaterThan(0);
	},
	20 * 1000
);
