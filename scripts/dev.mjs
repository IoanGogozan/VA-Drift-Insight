import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const npmCommand = "npm";
const dockerCommand = "docker";

const children = [];

function run(command, args, options = {}) {
  const spawnCommand = isWindows ? process.env.ComSpec ?? "cmd.exe" : command;
  const spawnArgs = isWindows ? ["/d", "/s", "/c", quoteCommand([command, ...args])] : args;
  const child = spawn(spawnCommand, spawnArgs, {
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
    ...options
  });

  child.stdout?.on("data", (chunk) => {
    process.stdout.write(chunk);
  });
  child.stderr?.on("data", (chunk) => {
    process.stderr.write(chunk);
  });

  children.push(child);

  return child;
}

function quoteCommand(parts) {
  const [command, ...args] = parts;

  return [command, ...args.map(quoteArg)].join(" ");
}

function quoteArg(part) {
  const value = String(part);

  if (!/[\s"]/u.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '\\"')}"`;
}

function runAndWait(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = run(command, args, options);

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function main() {
  console.log("Starting PostgreSQL/PostGIS...");
  await runAndWait(dockerCommand, ["compose", "up", "-d", "postgres"]);

  console.log("Building shared package...");
  await runAndWait(npmCommand, ["run", "build", "--workspace", "@va-drift-insight/shared"]);

  const commonEnv = {
    ...process.env,
    DATABASE_URL:
      process.env.DATABASE_URL ?? "postgresql://va_demo:va_demo@localhost:5433/va_drift_insight",
    API_PORT: process.env.API_PORT ?? "3001",
    API_VERSION: process.env.API_VERSION ?? "0.1.0",
    API_CORS_ORIGINS: process.env.API_CORS_ORIGINS ?? "http://localhost:3000",
    DEMO_API_KEY: process.env.DEMO_API_KEY ?? "local-demo-key",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
  };

  console.log("Starting API on http://localhost:3001");
  run(npmCommand, ["run", "dev", "--workspace", "@va-drift-insight/api"], {
    env: commonEnv
  });

  console.log("Starting web on http://localhost:3000");
  run(npmCommand, ["run", "dev", "--workspace", "@va-drift-insight/web"], {
    env: commonEnv
  });

  console.log("VA Drift Insight dev environment is starting. Press Ctrl+C to stop.");
}

function shutdown(signal) {
  console.log(`\nReceived ${signal}. Stopping dev processes...`);

  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }

  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

main().catch((error) => {
  console.error(error);
  shutdown("error");
});
