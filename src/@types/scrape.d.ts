declare module "beavereats" {}

interface MenuItem {
  /**
   * The name of the menu item
   */
  name: string;

  /**
   * The description of the menu item
   */
  description: [string];
}

interface MenuSection {
  /**
   * The name of the menu section
   */
  title: string;

  /**
   * The menu items in the section
   */
  items: MenuItem[];
}

interface Restaurant {
  /**
   * The location the restaurant is in
   */
  location: string;

  /**
   * The name of the restaurant
   */
  name: string;

  /**
   * The link to the restaurant's website
   */
  url: string;

  /**
   * Whether the restaurant accepts Dining Dollars
   */
  diningDollars: 1 | 0;

  /**
   * The start time of the restaurant's hours
   */
  start: string | null;

  /**
   * The end time of the restaurant's hours
   */
  end: string | null;

  /**
   * The menu sections of the restaurant
   */
  menu: MenuSection[];
}

type ScrapeResults = Restaurant[];
