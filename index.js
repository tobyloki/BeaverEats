const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');

async function getRestaurantBasicInfo() {
	const data = await fetch(
		'https://my.uhds.oregonstate.edu/api/dining/calendar'
	).then(res => res.text());
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

exports.getRestaurantsFullData = async () => {
	const restaurantInfos = await getRestaurantBasicInfo();

	const pageText = await fetch('https://food.oregonstate.edu').then(res => res.text());
	const dom = new JSDOM(pageText, {
		runScripts: 'dangerously',
		resources: 'usable',
		url: 'https://food.oregonstate.edu',
		virtualConsole: new VirtualConsole()
	});
	const { document } = dom.window;

	console.log('Getting restaurant data');
	let restaurants = [];
	await (() => {
		return new Promise(resolve => {
			const checker = setInterval(() => {
				let items = document.getElementsByClassName('resturantLoc');
				if (items.length > 0) {
					for (let item of items) {
						// get the content of the h3 tag
						let location = item.getElementsByTagName('h3')[0].textContent;
						// get div element
						let div = item.getElementsByTagName('div')[0];
						// get inner div element
						let innerDiv = div.getElementsByTagName('div');

						for (var iDiv of innerDiv) {
							// get title for href
							let name = iDiv.getElementsByTagName('a')[0].textContent;
							// get href value
							let url = iDiv.getElementsByTagName('a')[0].href;
							restaurants.push({
								location,
								name,
								url
							});
						}
					}
					resolve();
					clearInterval(checker);
				}
			}, 1000);
		});
	})();
	dom.window.close();
	// console.log(restaurants);

	// for every restaurant, merge with the restaurant info
	for (let i = 0; i < restaurants.length; i++) {
		for (let j = 0; j < restaurantInfos.length; j++) {
			if (restaurants[i].name === restaurantInfos[j].name) {
				// restaurants[i] = {
				// 	...restaurants[i],
				// 	...restaurantInfos[j]
				// };
				restaurants[i].diningDollars = restaurantInfos[j].diningDollars;
				if (restaurants[i].hours == null) {
					restaurants[i].hours = [];
				}
				restaurants[i].hours.push({
					start: restaurantInfos[j].start,
					end: restaurantInfos[j].end
				});
			}
		}
	}

	// const restaurant = restaurants[restaurants.length - 1];
	// console.log(restaurant);

	// const menu = await getMenu(
	// 	browser,
	// 	'https://uhds.oregonstate.edu/restaurants/off-the-quad'
	// );
	// console.log(JSON.stringify(menu, null, 2));

	const promises = [];
	for (let restaurant of restaurants) {
		promises.push(
			new Promise(async (resolve) => {
				const menu = await getMenu(restaurant.url);
				restaurant.menu = menu;
				// save this back to restaurants
				resolve(restaurant);
			})
		);
	}
	restaurants = await Promise.all(promises);

	// console.log(JSON.stringify(restaurants[0], null, 2));

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

	console.log('Done');

	return restaurants;
};

async function getMenu(url) {
	const pageText = await fetch(url).then(res => res.text());
	const dom = new JSDOM(pageText, {
		runScripts: 'dangerously',
		resources: 'usable',
		url,
		virtualConsole: new VirtualConsole()
	});
	const { document } = dom.window;

	// wait for page to load
	// await page.waitForSelector('.menu');

	// await page.goto('https://mu.oregonstate.edu/trader-bings-cafe');

	let menu = [];

	console.log('Getting menu');

	const iframe = Array.from(document.querySelectorAll("iframe")).find((frame) => {
		// menu.push(frame.url());
		return frame
			.src
			.startsWith(
				'https://app.uhds.oregonstate.edu/api/dining/weeklymenu/drupal?loc='
			);
	});
	if (iframe) {
		// menu.push('iframe found');
		const iframeText = await fetch(iframe.src).then(res => res.text());
		const iframeDom = new JSDOM(iframeText, {
			runScripts: 'dangerously',
			resources: 'usable',
			url: iframe.src
		});
		const { document: iframeDocument } = iframeDom.window;
		menu = [];
		const div = iframeDocument.getElementsByClassName('col-wrap pure-u-1')[0];
		let menuItem = {
			title: '',
			items: []
		};
		for (var childDiv of div.children) {
			for (var child of childDiv.children) {
				if (child.tagName.startsWith('H')) {
					if (menuItem.title.length > 0) {
						if (menuItem.items.length > 0) {
							menu.push(menuItem);
						}
						menuItem = {
							title: '',
							items: []
						};
					}
					menuItem.title = child.textContent;
				} else if (child.tagName === 'P') {
					menuItem.items.push({
						name: child.textContent
					});
				}
			}
			// add last item
			if (menuItem.title.length > 0) {
				if (menuItem.items.length > 0) {
					menu.push(menuItem);
				}
			}
		}
		iframeDom.window.close();
	} else {
		function getMenuForCoffeeShop(item) {
			const data = [];

			let menuItem = {
				title: '',
				items: []
			};

			// menu is ordered h4, p, p, p
			// get all menu items
			let tags = item.querySelectorAll('h4,p');
			for (const tag of tags) {
				if (tag.tagName.startsWith('H')) {
					if (menuItem.title.length > 0) {
						if (menuItem.items.length > 0) {
							data.push(menuItem);
						}
						menuItem = {
							title: '',
							items: []
						};
					}

					// data.push(tag.innerText);
					menuItem.title = tag.textContent;
				} else if (tag.tagName === 'P') {
					let text = tag.getElementsByTagName('strong');
					if (text.length > 0) {
						const name = text[0].textContent.trim();
						const description = tag.textContent
							.replace(name, '')
							.replace('\n', '')
							.trim();

						menuItem.items.push({
							name,
							description: description.length > 0 ? description : null
						});
					}
				}
			}

			// add the last item
			if (menuItem.title.length > 0) {
				if (menuItem.items.length > 0) {
					data.push(menuItem);
				}
			}

			return data;
		}

		function getMenuForRestaurant(item) {
			const data = [];

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
					let title = pTag.getElementsByTagName('strong')[0].textContent;
					let trimmedTitle = title.trim();
					if (trimmedTitle != '*') {
						menuItem.title = trimmedTitle;
					}

					// check if pTag has a style
				} else if (pTag.style.length > 0) {
					// get value of pTag
					let item = pTag.textContent.trim();
					// menuItem.items.push(item);
					// get last menuItem.items
					let lastItem = menuItem.items[menuItem.items.length - 1];
					if (lastItem != null && item.length > 0) {
						if (lastItem.description == null) {
							lastItem.description = [];
						}
						lastItem.description.push(item);
						// update value in menuItems
						menuItem.items[menuItem.items.length - 1] = lastItem;
					}
				} else {
					const name = pTag.textContent;
					// trim name
					const trimmedName = name.trim();
					// check if name is not empty
					if (trimmedName.length > 0) {
						menuItem.items.push({
							name: trimmedName
							// description: []
						});
					}
				}
			}

			// add the final element
			if (menuItem.title.length > 0) {
				if (menuItem.items.length > 0) {
					data.push(menuItem);
				}
			}

			return data;
		}

		menu = [];

		let items = document.getElementsByClassName('field-item even');
		for (let item of items) {
			let tagCheck = item.getElementsByTagName('H4');
			if (tagCheck.length > 0) {
				const newData = getMenuForCoffeeShop(item);
				// append newData array to data
				menu = menu.concat(newData);
			} else {
				const newData = getMenuForRestaurant(item);
				// append newData array to data
				menu = menu.concat(newData);
			}
			continue;
		}
	}
	dom.window.close();

	return menu;
}
