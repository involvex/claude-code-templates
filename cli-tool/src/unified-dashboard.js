const express = require("express");
const path = require("path");
const chalk = require("chalk");
const open = require("open");

/**
 * Unified Dashboard Server
 * Serves all Claude Code dashboards from a single interface
 * Default view: Analytics, with navigation to all other dashboards
 */
class UnifiedDashboard {
  constructor(options = {}) {
    this.options = options;
    this.app = express();
    this.port = options.port || 3339;
    this.host = options.host || "localhost";
    this.httpServer = null;

    // Dashboard configurations
    this.dashboards = {
      analytics: {
        port: 3333,
        name: "Analytics",
        icon: "📊",
        path: "/analytics",
      },
      chats: { port: 3335, name: "Chats", icon: "💬", path: "/chats" },
      plugins: { port: 3336, name: "Plugins", icon: "🔌", path: "/plugins" },
      skills: { port: 3337, name: "Skills", icon: "🎯", path: "/skills" },
      hooks: { port: 3338, name: "Hooks", icon: "🪝", path: "/hooks" },
    };

    this.defaultDashboard = options.defaultDashboard || "analytics";
  }

  setupRoutes() {
    // CORS middleware
    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      next();
    });

    // Serve shared navigation files
    const sharedDir = path.join(__dirname, "shared");
    this.app.use("/shared", express.static(sharedDir));

    // Serve unified dashboard web files
    const webDir = path.join(__dirname, "unified-dashboard-web");
    this.app.use(express.static(webDir));

    // API: Get dashboard configuration
    this.app.get("/api/dashboards", (req, res) => {
      res.json({
        dashboards: this.dashboards,
        defaultDashboard: this.defaultDashboard,
        currentHost: this.host,
        currentPort: this.port,
      });
    });

    // API: Check dashboard status
    this.app.get("/api/status/:dashboard", async (req, res) => {
      const dashboard = this.dashboards[req.params.dashboard];
      if (!dashboard) {
        return res.status(404).json({ error: "Dashboard not found" });
      }

      try {
        const fetch = require("node-fetch");
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);

        await fetch(`http://localhost:${dashboard.port}/`, {
          signal: controller.signal,
        });

        clearTimeout(timeout);
        res.json({ online: true, port: dashboard.port });
      } catch (error) {
        res.json({ online: false, port: dashboard.port });
      }
    });

    // Proxy routes to individual dashboards
    Object.entries(this.dashboards).forEach(([key, config]) => {
      this.app.get(config.path, (req, res) => {
        res.redirect(
          `http://localhost:${config.port}${req.query.scope ? "?scope=" + req.query.scope : ""}`,
        );
      });
    });

    // Main route - serve unified dashboard
    this.app.get("/", (req, res) => {
      res.sendFile(path.join(webDir, "index.html"));
    });
  }

  async startServer() {
    this.setupRoutes();
    await this.tryPort(this.port);
  }

  async tryPort(port) {
    return new Promise((resolve, reject) => {
      this.httpServer = this.app
        .listen(port, this.host, () => {
          this.port = port;
          console.log(
            chalk.green(
              `\n🎛️  Unified Dashboard running at http://${this.host}:${port}`,
            ),
          );
          console.log(chalk.gray(`   Default view: ${this.defaultDashboard}`));
          console.log(
            chalk.gray(
              `   Available dashboards: ${Object.keys(this.dashboards).length}\n`,
            ),
          );
          resolve();
        })
        .on("error", (err) => {
          if (err.code === "EADDRINUSE") {
            console.log(
              chalk.yellow(`Port ${port} in use, trying ${port + 1}...`),
            );
            this.tryPort(port + 1)
              .then(resolve)
              .catch(reject);
          } else {
            reject(err);
          }
        });
    });
  }

  async openBrowser() {
    const url = `http://${this.host}:${this.port}`;
    try {
      await open(url);
      console.log(chalk.blue(`📱 Opened unified dashboard in browser: ${url}`));
    } catch (error) {
      console.log(
        chalk.yellow(`Could not open browser automatically. Visit: ${url}`),
      );
    }
  }

  stop() {
    if (this.httpServer) {
      this.httpServer.close();
      console.log(chalk.gray("Unified dashboard server stopped"));
    }
  }
}

async function runUnifiedDashboard(options = {}) {
  const dashboard = new UnifiedDashboard(options);

  try {
    console.log(chalk.blue("🔄 Initializing unified dashboard..."));
    await dashboard.startServer();
    await dashboard.openBrowser();

    // Keep process alive
    process.on("SIGINT", () => {
      console.log(chalk.yellow("\n👋 Shutting down unified dashboard..."));
      dashboard.stop();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log(chalk.yellow("\n👋 Shutting down unified dashboard..."));
      dashboard.stop();
      process.exit(0);
    });

    // Keep the process running
    await new Promise(() => {});
  } catch (error) {
    console.error(
      chalk.red("❌ Error starting unified dashboard:"),
      error.message,
    );
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

module.exports = { UnifiedDashboard, runUnifiedDashboard };
