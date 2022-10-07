import { getRestaurantsFullData } from "beavereats";

export default function scrape(): Promise<ScrapeResults> {
  return getRestaurantsFullData();
}
