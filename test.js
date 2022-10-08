import { getRestaurantsFullData } from './index.js';

test(
	'Get restaurant full data',
	async () => {
		const restaurants = await getRestaurantsFullData();
		expect(restaurants.length).toBeGreaterThan(0);
	},
	25 * 1000
);
