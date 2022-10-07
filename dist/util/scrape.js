import { spawn } from "child_process";
import path from "path";
import { URL } from "url";
const __dirname = new URL(".", import.meta.url).pathname;
export async function scrape() {
    return new Promise((resolve, reject) => {
        let output = "";
        const child = spawn("node", ["scrapeWorker.js"], {
            cwd: path.join(__dirname),
        });
        child.on("exit", (code) => {
            if (code === 0) {
                resolve(output);
            }
            else {
                reject();
            }
        });
        child.stdout.on("data", (data) => {
            output += data.toString("utf8");
        });
    });
}
