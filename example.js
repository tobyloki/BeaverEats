import { getRestaurantsFullData } from "./index.js";
import fs from "fs";

getRestaurantsFullData().then((data) => {
  fs.writeFileSync("restaurants.json", JSON.stringify(data, null, 2));
});
