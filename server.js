const path = require("path");
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const ROOT = __dirname;
const WEB_DIR = path.join(ROOT, "apps/web");

const app = next({
  dev: false,
  dir: WEB_DIR,
});
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || "3000", 10);

function testDbConnection() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("> DB check FAILED: DATABASE_URL env var is not set");
    return;
  }
  try {
    const url = new URL(dbUrl);
    console.log("> DB check: host=" + url.hostname + " port=" + (url.port || "3306") + " db=" + url.pathname.slice(1) + " user=" + url.username);
  } catch (e) {
    console.error("> DB check FAILED: DATABASE_URL is not a valid URL:", e.message);
    return;
  }

  let mysql2;
  try {
    mysql2 = require(path.join(WEB_DIR, "node_modules/mysql2"));
  } catch (e) {
    console.log("> DB check skipped: mysql2 not available");
    return;
  }

  const conn = mysql2.createConnection(dbUrl);
  conn.connect((err) => {
    if (err) {
      console.error("> DB connection FAILED:", err.message);
    } else {
      console.log("> DB connection OK");
      conn.end();
    }
  });
}

// Start the server first so static files respond immediately
app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  }).listen(port, "0.0.0.0", () => {
    console.log("> Ready on port " + port);
    testDbConnection();
  });
}).catch((err) => {
  console.error("> Failed to start:", err);
  process.exit(1);
});
