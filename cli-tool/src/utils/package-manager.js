const { spawn } = require("child_process");
const chalk = require("chalk");

/**
 * Package Manager Detection Utility
 * Detects available package managers (Bun, npm) and provides fallback mechanism
 */

/**
 * Get version of a command
 * @param {string} command - Command to check (e.g., 'bun', 'npm')
 * @returns {Promise<string|null>} Version string or null if command not available
 */
function getVersion(command) {
  return new Promise((resolve) => {
    const child = spawn(command, ["--version"], {
      stdio: ["ignore", "pipe", "ignore"],
      shell: process.platform === "win32",
    });

    let output = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        resolve(null);
      }
    });

    child.on("error", () => {
      resolve(null);
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      child.kill();
      resolve(null);
    }, 5000);
  });
}

/**
 * Check if Bun is available
 * @returns {Promise<Object|null>} Bun configuration or null
 */
async function checkBun() {
  const version = await getVersion("bun");

  if (version) {
    return {
      name: "bun",
      installCmd: "bun",
      addCmd: "bun add",
      execCmd: "bunx",
      runCmd: "bun run",
      version: version,
      displayName: "Bun",
    };
  }

  return null;
}

/**
 * Check if npm is available
 * @returns {Promise<Object|null>} npm configuration or null
 */
async function checkNpm() {
  const version = await getVersion("npm");

  if (version) {
    return {
      name: "npm",
      installCmd: "npm",
      addCmd: "npm install",
      execCmd: "npx",
      runCmd: "npm run",
      version: version,
      displayName: "npm",
    };
  }

  return null;
}

/**
 * Detect available package manager with fallback
 * Priority: Bun > npm
 * @param {Object} options - Detection options
 * @param {boolean} options.verbose - Enable verbose logging
 * @param {boolean} options.preferNpm - Prefer npm even if Bun is available
 * @returns {Promise<Object>} Package manager configuration
 */
async function detectPackageManager(options = {}) {
  const { verbose = false, preferNpm = false } = options;

  // If user prefers npm, use it directly
  if (preferNpm) {
    if (verbose) {
      console.log(chalk.gray("User preference: npm"));
    }

    const npm = await checkNpm();
    if (npm) {
      if (verbose) {
        console.log(chalk.green(`✓ Detected npm ${npm.version}`));
      }
      return npm;
    }
  }

  // Try Bun first (best performance)
  if (verbose) {
    console.log(chalk.gray("Checking for Bun..."));
  }

  const bun = await checkBun();
  if (bun) {
    if (verbose) {
      console.log(chalk.green(`✓ Detected Bun ${bun.version}`));
      console.log(chalk.blue("💨 Using Bun for faster performance"));
    }
    return bun;
  }

  if (verbose) {
    console.log(chalk.gray("Bun not found, falling back to npm..."));
  }

  // Fallback to npm
  const npm = await checkNpm();
  if (npm) {
    if (verbose) {
      console.log(chalk.green(`✓ Detected npm ${npm.version}`));
    }
    return npm;
  }

  // No package manager found - this should rarely happen
  throw new Error(
    "No package manager found. Please install npm or Bun.\n" +
      "npm: https://nodejs.org/\n" +
      "Bun: https://bun.sh/",
  );
}

/**
 * Get install command for a package
 * @param {Object} pm - Package manager object from detectPackageManager
 * @param {string} packageName - Package name to install
 * @param {Object} options - Install options
 * @param {boolean} options.dev - Install as dev dependency
 * @param {boolean} options.global - Install globally
 * @returns {Array<string>} Command and arguments array
 */
function getInstallCommand(pm, packageName, options = {}) {
  const { dev = false, global = false } = options;

  if (pm.name === "bun") {
    const args = ["add", packageName];
    if (dev) args.push("--dev");
    if (global) args.push("--global");
    return [pm.installCmd, ...args];
  }

  // npm
  const args = ["install", packageName];
  if (dev) args.push("--save-dev");
  if (global) args.unshift("-g");
  return [pm.installCmd, ...args];
}

/**
 * Get exec command for a package
 * @param {Object} pm - Package manager object from detectPackageManager
 * @param {string} packageName - Package name to execute
 * @param {Array<string>} args - Arguments to pass to the package
 * @returns {Array<string>} Command and arguments array
 */
function getExecCommand(pm, packageName, args = []) {
  return [pm.execCmd, packageName, ...args];
}

/**
 * Format package manager info for display
 * @param {Object} pm - Package manager object from detectPackageManager
 * @returns {string} Formatted display string
 */
function formatPackageManagerInfo(pm) {
  return `${pm.displayName} ${chalk.gray(`v${pm.version}`)}`;
}

module.exports = {
  detectPackageManager,
  getInstallCommand,
  getExecCommand,
  formatPackageManagerInfo,
  getVersion,
  checkBun,
  checkNpm,
};
