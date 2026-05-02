import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const npmCommand = "npm";
const dockerCommand = "docker";

const children = [];
const devPorts = [3000, 3001];

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
  await stopDevPortListeners();

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

async function stopDevPortListeners() {
  if (process.env.DEV_SKIP_PORT_CLEANUP === "true") {
    return;
  }

  const pids = isWindows ? await getWindowsPortPids(devPorts) : await getUnixPortPids(devPorts);

  if (pids.length === 0) {
    return;
  }

  console.log(`Stopping existing dev processes on ports ${devPorts.join(", ")}: ${pids.join(", ")}`);

  for (const pid of pids) {
    if (pid === process.pid) {
      continue;
    }

    await killPid(pid);
  }
}

async function getWindowsPortPids(ports) {
  const output = await capture("netstat", ["-ano", "-p", "tcp"]);
  const pids = new Set();

  for (const line of output.split(/\r?\n/u)) {
    const normalized = line.trim().replace(/\s+/gu, " ");

    if (!normalized.includes("LISTENING")) {
      continue;
    }

    const parts = normalized.split(" ");
    const localAddress = parts[1] ?? "";
    const pid = Number(parts.at(-1));

    if (ports.some((port) => localAddress.endsWith(`:${port}`)) && Number.isInteger(pid)) {
      pids.add(pid);
    }
  }

  return [...pids];
}

async function getUnixPortPids(ports) {
  const pids = new Set();

  for (const port of ports) {
    try {
      const output = await capture("lsof", ["-ti", `tcp:${port}`]);

      for (const value of output.split(/\s+/u)) {
        const pid = Number(value);

        if (Number.isInteger(pid)) {
          pids.add(pid);
        }
      }
    } catch {
      // lsof is not always installed. In that case, skip automatic cleanup.
    }
  }

  return [...pids];
}

function capture(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      shell: false,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }

      reject(new Error(stderr || `${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

function killPid(pid) {
  if (isWindows) {
    return runAndWait("taskkill", ["/PID", String(pid), "/F", "/T"]);
  }

  try {
    process.kill(pid, "SIGTERM");
  } catch {
    // Process may already be gone.
  }

  return Promise.resolve();
}
