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
    const fs = require("fs");
    if (fs.existsSync(socketPath)) {
      console.log("> DB socket check OK: " + socketPath + " exists");
    } else {
      console.error("> DB socket check FAILED: " + socketPath + " does not exist");
      // Check common socket locations
      const commonSockets = [
        "/var/run/mysqld/mysqld.sock",
        "/tmp/mysql.sock",
        "/var/lib/mysql/mysql.sock",
        "/run/mysqld/mysqld.sock",
      ];
      for (const s of commonSockets) {
        if (fs.existsSync(s)) console.log("> Found socket at: " + s);
      }
    }
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
