#!/usr/bin/env node
/**
 * Start the FastAPI backend, then launch the Tauri desktop shell.
 * Usage (from repo root): node scripts/desktop-dev.mjs
 * Or: cd ui && npm run desktop:dev
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ui = path.join(root, "ui");

const children = [];

function run(command, args, cwd, name) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });
  child.on("exit", (code, signal) => {
    if (signal) return;
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      shutdown(code);
    }
  });
  children.push(child);
  return child;
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log("Starting Trackey API on :8000…");
run("uv", ["run", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"], root, "api");

// Give the API a moment before the window loads data.
setTimeout(() => {
  console.log("Starting Trackey desktop (Tauri)…");
  const tauri = run("npm", ["run", "tauri", "--", "dev"], ui, "tauri");
  tauri.on("exit", (code) => shutdown(code ?? 0));
}, 1200);
