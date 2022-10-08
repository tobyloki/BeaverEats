import { JSDOM, VirtualConsole } from "jsdom";

async function getRestaurantBasicInfo() {
  const data = await fetch(
      "https://my.uhds.oregonstate.edu/api/dining/calendar"
    ).then((res) => res.text()),
    json = JSON.parse(data),
    restaurants = [];
  for (let i = 0; i < json.length; i++) {
    restaurants.push({
      location: json[i].zone,
      name: json[i].concept_title,
      diningDollars: json[i].dining_dollars,
      start: json[i].start,
      end: json[i].end,
    });
  }

  return restaurants;
}

export async function getRestaurantsFullData() {
  const restaurantInfos = await getRestaurantBasicInfo(),
    pageText = await fetch("https://food.oregonstate.edu").then((res) =>
      res.text()
    ),
    dom = new JSDOM(pageText, {
      runScripts: "dangerously",
      resources: "usable",
      url: "https://food.oregonstate.edu",
      virtualConsole: new VirtualConsole(),
    }),
    { document } = dom.window;
  // Hacky way to "implement innerText"
  dom.window.Object.defineProperty(
    dom.window.HTMLElement.prototype,
    "innerText",
    {
      set(value) {
        this.textContent = value;
      },
      get() {
        return this.textContent;
      },
    }
  );

  const restaurants = [];
  await (() => {
    return new Promise((resolve) => {
      const checker = setInterval(() => {
        const items = document.querySelectorAll(".resturantLoc");
        if (items.length > 0) {
          for (const item of items) {
            const location = item.querySelector("h3").textContent,
              div = item.querySelector("div"),
              innerDiv = div.querySelectorAll("div");

            for (const iDiv of innerDiv) {
              const name = iDiv.querySelector("a").textContent,
                url = iDiv.querySelector("a").href;
              restaurants.push({
                location,
                name,
                url,
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

  // for every restaurant, merge with the restaurant info
  for (let i = 0; i < restaurants.length; i++) {
    for (let j = 0; j < restaurantInfos.length; j++) {
      if (restaurants[i].name === restaurantInfos[j].name) {
        restaurants[i].diningDollars = restaurantInfos[j].diningDollars;
        if (restaurants[i].hours == null) {
          restaurants[i].hours = [];
        }
        restaurants[i].hours.push({
          start: restaurantInfos[j].start,
          end: restaurantInfos[j].end,
        });
      }
    }
  }

  for (let i = 0; i < restaurants.length; i += 5) {
    const promises = [];
    for (let j = i; j < i + 5 && j < restaurants.length; j++) {
      promises.push(
        getMenu(restaurants[j].url).then((menu) => {
          restaurants[j].menu = menu;
        })
      );
    }
    await Promise.all(promises);
  }

  return restaurants;
};

function getMenuForCoffeeShop(item) {
  const data = [];

  let menuItem = {
    title: "",
    items: [],
  };

  // menu is ordered h4, p, p, p
  // get all menu items
  const tags = item.querySelectorAll("h4,p");
  for (const tag of tags) {
    if (tag.tagName.startsWith("H")) {
      if (menuItem.title.length > 0) {
        if (menuItem.items.length > 0) {
          data.push(menuItem);
        }
        menuItem = {
          title: "",
          items: [],
        };
      }

      menuItem.title = tag.textContent;
    } else if (tag.tagName === "P") {
      const text = tag.querySelectorAll("strong");
      if (text.length > 0) {
        const name = text[0].textContent.trim(),
          description = tag.textContent
            .replace(name, "")
            .replace("\n", "")
            .trim();

        menuItem.items.push({
          name,
          description: description.length > 0 ? description : null,
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
  const data = [],
    pTags = item.getElementsByTagName("p");

  let menuItem = {
    title: "",
    items: [],
  };

  for (const pTag of pTags) {
    if (pTag.getElementsByTagName("strong").length > 0) {
      if (menuItem.title.length > 0) {
        if (menuItem.items.length > 0) {
          data.push(menuItem);
        }
        menuItem = {
          title: "",
          items: [],
        };
      }

      const title = pTag.getElementsByTagName("strong")[0].textContent,
        trimmedTitle = title.trim();
      if (trimmedTitle != "*") {
        menuItem.title = trimmedTitle;
      }
    } else if (pTag.style.length > 0) {
      const item = pTag.textContent.trim(),
        lastItem = menuItem.items[menuItem.items.length - 1];
      if (lastItem != null && item.length > 0) {
        if (lastItem.description == null) {
          lastItem.description = [];
        }
        lastItem.description.push(item);
        // update value in menuItems
        menuItem.items[menuItem.items.length - 1] = lastItem;
      }
    } else {
      const name = pTag.textContent,
        trimmedName = name.trim();
      // check if name is not empty
      if (trimmedName.length > 0) {
        menuItem.items.push({
          name: trimmedName,
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

async function getMenu(url) {
  const pageText = await fetch(url).then((res) => res.text()),
    dom = new JSDOM(pageText, {
      url,
    }),
    { document } = dom.window;

  let menu = [];

  const iframe = Array.from(document.querySelectorAll("iframe")).find(
    (frame) => {
      return frame.src.startsWith(
        "https://app.uhds.oregonstate.edu/api/dining/weeklymenu/drupal?loc="
      );
    }
  );
  if (iframe) {
    const iframeText = await fetch(iframe.src).then((res) => res.text()),
      iframeDom = new JSDOM(iframeText, {
        url: iframe.src,
      }),
      { document: iframeDocument } = iframeDom.window;
    menu = [...iframeDocument.querySelectorAll(".section")].map((section) => {
      return {
        title: section.querySelector("h6").textContent,
        items: [...section.querySelectorAll("p")].map((item) => {
          return {
            name: item.textContent,
          };
        }),
      };
    });
    iframeDom.window.close();
  } else {
    menu = [];

    const items = document.querySelectorAll(".field-item.even");
    for (const item of items) {
      const tagCheck = item.querySelector("h4");
      if (tagCheck) {
        const newData = getMenuForCoffeeShop(item);
        menu = menu.concat(newData);
      } else {
        const newData = getMenuForRestaurant(item);
        menu = menu.concat(newData);
      }
      continue;
    }
  }
  dom.window.close();

  return menu;
}
