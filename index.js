const puppeteer = require('puppeteer');
const fs = require('fs');

main();

async function getRestaurantBasicInfo() {
	const response = await fetch(
		'https://my.uhds.oregonstate.edu/api/dining/calendar'
	);
	const data = await response.text();
	// console.log(data);
	const json = JSON.parse(data);

	const restaurants = [];
	for (let i = 0; i < json.length; i++) {
		// console.log(json[i].name);
		restaurants.push({
			location: json[i].zone,
			name: json[i].concept_title,
			diningDollars: json[i].dining_dollars,
			start: json[i].start,
			end: json[i].end
		});
	}

	// console.log(restaurants[0]);
	return restaurants;
}

async function main() {
	const restaurantInfos = await getRestaurantBasicInfo();

	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();

	await page.goto('https://food.oregonstate.edu');

	console.log('Getting resturantLoc');
	let restaurants = await page.evaluate(() => {
		let data = [];
		let items = document.getElementsByClassName('resturantLoc');
		for (var item of items) {
			// get the content of the h3 tag
			let location = item.getElementsByTagName('h3')[0].innerText;
			// get div element
			let div = item.getElementsByTagName('div')[0];
			// get inner div element
			let innerDiv = div.getElementsByTagName('div')[0];
			// get title for href
			let name = innerDiv.getElementsByTagName('a')[0].textContent;
			// get href value
			let url = innerDiv.getElementsByTagName('a')[0].href;

			data.push({
				location,
				name,
				url
			});
		}
		return data;
	});
	// console.log(restaurants);

	// for every restaurant, merge with the restaurant info
	for (let i = 0; i < restaurants.length; i++) {
		for (let j = 0; j < restaurantInfos.length; j++) {
			if (restaurants[i].name === restaurantInfos[j].name) {
				restaurants[i] = {
					...restaurants[i],
					...restaurantInfos[j]
				};
			}
		}
	}

	// const restaurant = restaurants[1];
	// console.log(restaurant);

	// const menu = await getMenu(page, restaurant);
	// // console.log(menu.length);
	// // console.log(JSON.stringify(menu, null, 2));
	// restaurant.menu = menu;

	// console.log(JSON.stringify(restaurant, null, 2));

	// let pages = await browser.pages();
	// console.log(pages.length);
	// console.log(restaurants.length);

	const promises = [];
	for (restaurant of restaurants) {
		promises.push(
			new Promise(async (resolve, reject) => {
				const menu = await getMenu(browser, restaurant);
				restaurant.menu = menu;
				// save this back to restaurants
				resolve(restaurant);
			})
		);
	}

	restaurants = await Promise.all(promises);

	console.log(JSON.stringify(restaurants[0], null, 2));

	// save restaurants to a file
	fs.writeFileSync(
		'restaurants.json',
		JSON.stringify(restaurants, null, 2),
		(err) => {
			if (err) {
				console.log(err);
			}
		}
	);

	browser.close();
	console.log('Done');
}

async function getMenu(browser, restaurant) {
	const page = await browser.newPage();
	await page.goto(restaurant.url);

	// await page.goto('https://mu.oregonstate.edu/trader-bings-cafe');

	console.log('Getting menu');
	let menu = await page.evaluate(() => {
		let data = [];
		let items = document.getElementsByClassName('field-item even');
		for (var item of items) {
			// get first p tag
			let pTags = item.getElementsByTagName('p');

			let menuItem = {
				title: '',
				items: []
			};

			for (var pTag of pTags) {
				// if pTag has a child element of strong
				if (pTag.getElementsByTagName('strong').length > 0) {
					if (menuItem.title.length > 0) {
						if (menuItem.items.length > 0) {
							data.push(menuItem);
						}
						menuItem = {
							title: '',
							items: []
						};
					}

					// get value of strong
					let title = pTag.getElementsByTagName('strong')[0].innerText;
					menuItem.title = title;

					// check if pTag has a style
				} else if (pTag.style.length > 0) {
					// get value of pTag
					let item = pTag.innerText;
					// menuItem.items.push(item);
					// get last menuItem.items
					let lastItem = menuItem.items[menuItem.items.length - 1];
					if (lastItem != null) {
						lastItem.description.push(item);
						// update value in menuItems
						menuItem.items[menuItem.items.length - 1] = lastItem;
					}
				} else {
					const name = pTag.innerText;
					// trim name
					const trimmedName = name.trim();
					// check if name is not empty
					if (trimmedName.length > 0) {
						menuItem.items.push({
							name: trimmedName,
							description: []
						});
					}
				}
			}

			// add the final element
			if (menuItem.title.length > 0) {
				data.push(menuItem);
				menuItem = {
					title: '',
					items: []
				};
			}

			// data.push({
			// 	title
			// });
		}
		return data;
	});

	return menu;
}
