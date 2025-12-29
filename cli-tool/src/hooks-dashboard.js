const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const chalk = require("chalk");
const open = require("open");

class HooksDashboard {
  constructor(options = {}) {
    this.options = options;
    this.app = express();
    this.port = options.port || 3338;
    this.host = options.host || "localhost";
    this.httpServer = null;
    this.homeDir = require("os").homedir();
    this.installedHooks = [];
    this.availableHooks = [];
  }

  async initialize() {
    await this.loadHooksData();
    this.setupWebServer();
  }

  async loadHooksData() {
    // Determine scope to scan
    const scopeToScan = this.options.scope || "all";

    if (scopeToScan === "all") {
      // Scan all: user, project, local
      await this.loadUserHooks();
      await this.loadProjectHooks();
      await this.loadLocalHooks();
    } else {
      // Scan only specified scope
      if (scopeToScan === "user" || scopeToScan === "global") {
        await this.loadUserHooks();
      } else if (scopeToScan === "project") {
        await this.loadProjectHooks();
      } else if (scopeToScan === "local") {
        await this.loadLocalHooks();
      }
    }

    // Load available hooks from components directory
    await this.loadAvailableHooks();
  }

  async loadUserHooks() {
    const settingsPath = path.join(this.homeDir, ".claude", "settings.json");
    await this.loadHooksFromSettings(settingsPath, "user");
  }

  async loadProjectHooks() {
    const settingsPath = path.join(process.cwd(), ".claude", "settings.json");
    await this.loadHooksFromSettings(settingsPath, "project");
  }

  async loadLocalHooks() {
    const settingsPath = path.join(
      process.cwd(),
      ".claude",
      "settings.local.json",
    );
    await this.loadHooksFromSettings(settingsPath, "local");
  }

  async loadHooksFromSettings(settingsPath, source) {
    try {
      if (!(await fs.pathExists(settingsPath))) return;
      const settings = await fs.readJson(settingsPath);

      if (!settings.hooks) return;

      // Parse new array-based hook format
      for (const [eventType, matchers] of Object.entries(settings.hooks)) {
        if (!Array.isArray(matchers)) continue;

        for (const matcher of matchers) {
          for (const hook of matcher.hooks || []) {
            this.installedHooks.push({
              id: `${source}-${eventType}-${this.installedHooks.length}`,
              eventType,
              matcher: matcher.matcher,
              type: hook.type,
              command: hook.command,
              prompt: hook.prompt,
              source,
              settingsPath,
              enabled: true,
            });
          }
        }
      }
    } catch (error) {
      console.warn(chalk.yellow(`Could not load hooks from ${settingsPath}`));
    }
  }

  async loadAvailableHooks() {
    const componentsDir = path.join(__dirname, "../components/hooks");

    try {
      if (!(await fs.pathExists(componentsDir))) {
        console.warn(chalk.yellow("Components directory not found"));
        return;
      }

      const categories = await fs.readdir(componentsDir);

      for (const category of categories) {
        const categoryPath = path.join(componentsDir, category);
        const stat = await fs.stat(categoryPath);

        if (!stat.isDirectory()) continue;

        const hookFiles = await fs.readdir(categoryPath);
        for (const file of hookFiles) {
          if (!file.endsWith(".json")) continue;

          try {
            const hookPath = path.join(categoryPath, file);
            const hookConfig = await fs.readJson(hookPath);

            this.availableHooks.push({
              id: `${category}/${file.replace(".json", "")}`,
              name: file.replace(".json", ""),
              category,
              description: hookConfig.description || "",
              events: Object.keys(hookConfig.hooks || {}),
              installed: this.isHookInstalled(
                `${category}/${file.replace(".json", "")}`,
              ),
            });
          } catch (error) {
            // Skip invalid hook files
          }
        }
      }
    } catch (error) {
      console.warn(
        chalk.yellow(`Could not load available hooks: ${error.message}`),
      );
    }
  }

  isHookInstalled(hookId) {
    // Check if any installed hook matches this available hook
    // This is a simple check - could be enhanced with better matching logic
    return false;
  }

  setupWebServer() {
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

    // Serve static files from hooks-dashboard-web directory
    const webDir = path.join(__dirname, "hooks-dashboard-web");
    this.app.use(express.static(webDir));

    // API: Get all installed hooks
    this.app.get("/api/hooks", async (req, res) => {
      try {
        // Support scope from query parameter
        const scopeOverride = req.query.scope;
        if (scopeOverride) {
          const originalScope = this.options.scope;
          this.options.scope = scopeOverride;
          await this.loadHooksData();
          this.options.scope = originalScope;
        } else {
          await this.loadHooksData();
        }

        res.json({
          hooks: this.installedHooks,
          count: this.installedHooks.length,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error loading hooks:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // API: Get available hooks
    this.app.get("/api/hooks/available", async (req, res) => {
      try {
        res.json({
          hooks: this.availableHooks,
          count: this.availableHooks.length,
        });
      } catch (error) {
        console.error("Error loading available hooks:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // API: Get hooks by category
    this.app.get("/api/hooks/category/:category", async (req, res) => {
      try {
        const category = req.params.category;
        const categoryHooks = this.availableHooks.filter(
          (h) => h.category === category,
        );
        res.json({
          category,
          hooks: categoryHooks,
          count: categoryHooks.length,
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API: Summary stats
    this.app.get("/api/summary", async (req, res) => {
      try {
        const eventTypes = [
          ...new Set(this.installedHooks.map((h) => h.eventType)),
        ];
        const sources = [...new Set(this.installedHooks.map((h) => h.source))];
        const categories = [
          ...new Set(this.availableHooks.map((h) => h.category)),
        ];

        res.json({
          totalInstalled: this.installedHooks.length,
          totalAvailable: this.availableHooks.length,
          eventTypes: eventTypes.length,
          sources: sources.length,
          categories: categories.length,
          bySource: {
            user: this.installedHooks.filter((h) => h.source === "user").length,
            project: this.installedHooks.filter((h) => h.source === "project")
              .length,
            local: this.installedHooks.filter((h) => h.source === "local")
              .length,
          },
          byEventType: eventTypes.reduce((acc, type) => {
            acc[type] = this.installedHooks.filter(
              (h) => h.eventType === type,
            ).length;
            return acc;
          }, {}),
          categoriesList: categories,
        });
      } catch (error) {
        console.error("Error generating summary:", error);
        res.status(500).json({ error: error.message });
      }
    });

    // Main route
    this.app.get("/", (req, res) => {
      res.sendFile(path.join(webDir, "index.html"));
    });
  }

  async startServer() {
    await this.tryPort(this.port);
  }

  async tryPort(port) {
    return new Promise((resolve, reject) => {
      this.httpServer = this.app
        .listen(port, this.host, () => {
          this.port = port;
          console.log(
            chalk.green(
              `\n🪝 Hooks Dashboard running at http://${this.host}:${port}`,
            ),
          );
          console.log(chalk.gray(`   Scope: ${this.options.scope || "all"}`));
          console.log(
            chalk.gray(`   Installed hooks: ${this.installedHooks.length}`),
          );
          console.log(
            chalk.gray(`   Available hooks: ${this.availableHooks.length}\n`),
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
      console.log(chalk.blue(`📱 Opened dashboard in browser: ${url}`));
    } catch (error) {
      console.log(
        chalk.yellow(`Could not open browser automatically. Visit: ${url}`),
      );
    }
  }

  stop() {
    if (this.httpServer) {
      this.httpServer.close();
      console.log(chalk.gray("Hooks dashboard server stopped"));
    }
  }
}

async function runHooksDashboard(options = {}) {
  const dashboard = new HooksDashboard(options);

  try {
    console.log(chalk.blue("🔄 Initializing hooks dashboard..."));
    await dashboard.initialize();

    console.log(chalk.blue("🚀 Starting hooks dashboard server..."));
    await dashboard.startServer();
    await dashboard.openBrowser();

    // Keep process alive
    process.on("SIGINT", () => {
      console.log(chalk.yellow("\n👋 Shutting down hooks dashboard..."));
      dashboard.stop();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log(chalk.yellow("\n👋 Shutting down hooks dashboard..."));
      dashboard.stop();
      process.exit(0);
    });

    // Keep the process running
    await new Promise(() => {});
  } catch (error) {
    console.error(
      chalk.red("❌ Error starting hooks dashboard:"),
      error.message,
    );
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

module.exports = { HooksDashboard, runHooksDashboard };
