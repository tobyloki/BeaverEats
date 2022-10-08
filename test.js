const { getRestaurantsFullData } = require('./index.js');

// main();

// async function main() {
// 	const restaurants = await getRestaurantsFullData();
// 	// console.log('Length: ' + restaurants.length);
// }

test(
	'Get restaurant full data',
	async () => {
		const restaurants = await getRestaurantsFullData();
		expect(restaurants.length).toBeGreaterThan(0);
	},
	25 * 1000
);
