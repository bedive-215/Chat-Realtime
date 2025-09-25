// logger.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// log file nằm cùng thư mục logger.js
const logDir = __dirname;

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, "app.log");
const logStream = fs.createWriteStream(logFile, { flags: "a" });

// Ghi đè console.log
console.log = function (...args) {
  const message = args.map(arg =>
    typeof arg === "string" ? arg : JSON.stringify(arg)
  ).join(" ");

  logStream.write(`[${new Date().toISOString()}] ${message}\n`);
};