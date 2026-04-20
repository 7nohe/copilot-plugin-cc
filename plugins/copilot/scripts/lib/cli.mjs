import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const COPILOT = "copilot";
const DEFAULT_TIMEOUT = 300_000; // 5 minutes

/**
 * Check if the copilot binary exists in PATH.
 */
export async function copilotAvailable() {
  try {
    const { stdout } = await execFileAsync(COPILOT, ["version"], {
      timeout: 10_000,
    });
    return { available: true, raw: stdout.trim() };
  } catch {
    return { available: false };
  }
}

/**
 * Parse version string from `copilot version` output.
 */
export async function copilotVersion() {
  const { available, raw } = await copilotAvailable();
  if (!available) return { available: false, version: null };
  // Typical output: "copilot version 1.x.x" or just "1.x.x"
  const match = raw.match(/(\d+\.\d+\.\d+[\w.-]*)/);
  return { available: true, version: match ? match[1] : raw };
}

/**
 * Check Copilot CLI authentication status.
 * Uses `copilot auth status` (lightweight, no AI inference).
 * Falls back to checking `copilot version` output for auth hints.
 */
export async function copilotAuth() {
  // Try the dedicated auth subcommand first
  try {
    const { stdout, stderr } = await execFileAsync(COPILOT, ["auth", "status"], {
      timeout: 10_000,
    });
    const out = (stdout || stderr).trim();
    if (/logged in|authenticated|active/i.test(out)) {
      return { loggedIn: true };
    }
    if (/not logged in|not authenticated|no account/i.test(out)) {
      return { loggedIn: false, authError: true, message: out };
    }
    // Ambiguous output — assume logged in if exit was clean
    return { loggedIn: true };
  } catch (err) {
    const msg = (err.stderr || err.stdout || err.message || "").trim();
    // If the subcommand doesn't exist, fall back to a version check
    if (/unknown command|not found|invalid/i.test(msg)) {
      return copilotAuthFallback();
    }
    return { loggedIn: false, authError: true, message: msg };
  }
}

async function copilotAuthFallback() {
  // `copilot version` often prints auth info alongside the version
  try {
    const { stdout } = await execFileAsync(COPILOT, ["version"], {
      timeout: 10_000,
    });
    const out = stdout.trim();
    if (/not logged in|not authenticated/i.test(out)) {
      return { loggedIn: false, authError: true, message: out };
    }
    // If version runs fine, assume auth is OK (best-effort)
    return { loggedIn: true };
  } catch (err) {
    return { loggedIn: false, authError: true, message: err.message };
  }
}

/**
 * Run `copilot -p <prompt>` with optional flags.
 *
 * @param {string} prompt - The prompt to send.
 * @param {object} opts
 * @param {string} [opts.model] - Model name (e.g. "gpt-5.3-codex", "gemini-3-pro").
 * @param {boolean} [opts.yolo] - Skip all permission prompts.
 * @param {boolean} [opts.continue] - Resume the most recent Copilot session.
 * @param {string} [opts.cwd] - Working directory.
 * @param {number} [opts.timeout] - Timeout in ms.
 * @returns {Promise<{exitCode: number, stdout: string, stderr: string}>}
 */
export function copilotRun(prompt, opts = {}) {
  const args = ["-p", prompt];

  if (opts.model) {
    args.push("--model", opts.model);
  }
  if (opts.yolo) {
    args.push("--yolo");
  }
  if (opts.continue) {
    args.push("--continue");
  }

  return new Promise((resolve, reject) => {
    const child = spawn(COPILOT, args, {
      cwd: opts.cwd ?? process.cwd(),
      env: { ...process.env },
      timeout: opts.timeout ?? DEFAULT_TIMEOUT,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("error", reject);
    child.on("close", (exitCode) => {
      resolve({ exitCode, stdout, stderr });
    });
  });
}
