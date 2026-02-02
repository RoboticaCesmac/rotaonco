#!/usr/bin/env bun
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const command = process.argv[2] || "up -d";
const args = command.split(" ");

try {
  const { stdout, stderr } = await execAsync(`docker compose ${command}`, {
    cwd: import.meta.dir,
    stdio: "inherit",
  });
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
} catch (error) {
  console.error("Error running docker compose:", error);
  process.exit(1);
}
