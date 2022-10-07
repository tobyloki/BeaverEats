import { spawn } from "child_process";
import path from "path";
import { URL } from "url";
import fs from "fs/promises";

const __dirname = new URL(".", import.meta.url).pathname;

export default function scrape(): Promise<ScrapeResults> {
  return new Promise((resolve, reject) => {
    const child = spawn("node", ["scrapeWorker.js"], {
      cwd: path.join(__dirname),
      stdio: "ignore",
    });

    child.on("exit", async (code) => {
      if (code === 0) {
        resolve(
          JSON.parse(
            await fs.readFile(path.join(__dirname, "restaurants.json"), "utf-8")
          )
        );
      } else {
        reject();
      }
    });
  });
}
