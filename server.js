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
  const net = require("net");
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("> DB check FAILED: DATABASE_URL env var is not set");
    return;
  }
  let parsed;
  try {
    parsed = new URL(dbUrl);
    console.log("> DB check: host=" + parsed.hostname + " port=" + (parsed.port || "3306") + " db=" + parsed.pathname.slice(1) + " user=" + parsed.username);
  } catch (e) {
    console.error("> DB check FAILED: DATABASE_URL is not a valid URL:", e.message);
    return;
  }

  const socketPath = parsed.searchParams.get("socket");
  if (socketPath) {
    // Test actual mysql2 connection via socket
    let mysql2;
    try {
      mysql2 = require(path.join(ROOT, "node_modules/mysql2"));
    } catch (e) {
      console.log("> DB socket file exists but mysql2 not yet available for test");
      return;
    }
    const conn = mysql2.createConnection({
      socketPath,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: decodeURIComponent(parsed.pathname.slice(1)),
    });
    conn.connect((err) => {
      if (err) {
        console.error("> DB mysql2 socket FAILED:", err.message, "(code:", err.code + ")");
      } else {
        console.log("> DB mysql2 socket OK: connected successfully");
        conn.end();
      }
    });
    return;
  }

  const host = parsed.hostname;
  const port = parseInt(parsed.port || "3306", 10);
  const client = net.createConnection({ host, port }, () => {
    console.log("> DB TCP check OK: " + host + ":" + port + " is reachable");
    client.destroy();
  });
  client.on("error", (err) => {
    console.error("> DB TCP check FAILED: cannot reach " + host + ":" + port + " — " + err.message);
  });
  client.setTimeout(5000, () => {
    console.error("> DB TCP check FAILED: connection to " + host + ":" + port + " timed out");
    client.destroy();
  });
}

// Diagnostics
const fs = require("fs");
console.log("> __dirname:", __dirname);
console.log("> WEB_DIR:", WEB_DIR);
console.log("> WEB_DIR exists:", fs.existsSync(WEB_DIR));
console.log("> .next exists:", fs.existsSync(path.join(WEB_DIR, ".next")));
console.log("> .next/static exists:", fs.existsSync(path.join(WEB_DIR, ".next/static")));

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
