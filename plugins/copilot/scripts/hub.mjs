#!/usr/bin/env node

/**
 * Copilot CLI Hub — handler-registry dispatcher for Claude Code.
 *
 * Architecture: a Map<string, handler> drives all routing.
 * Each handler receives (args: string[]) and writes to stdout.
 * No background jobs, no persistent state — every call is foreground.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  copilotAvailable,
  copilotVersion,
  copilotAuth,
  copilotRun,
} from "./lib/cli.mjs";
import { setupReport, wrapOutput, errorBlock } from "./lib/fmt.mjs";

const execFileAsync = promisify(execFile);

// ---------------------------------------------------------------------------
// Argument helpers
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const flags = {};
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
        flags[key] = argv[++i];
      } else {
        flags[key] = true;
      }
    } else {
      rest.push(a);
    }
  }
  return { flags, rest };
}

async function requireCopilot() {
  const { available } = await copilotAvailable();
  if (!available) {
    console.log(errorBlock("copilot CLI is not installed. Run /copilot:setup first."));
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Shared prompt runner — eliminates boilerplate across handlers
// ---------------------------------------------------------------------------

/**
 * Common flow: require copilot → parse args → build prompt → run → output.
 * Handles errors consistently: non-zero exit always reports, even if stderr is empty.
 */
async function runPromptHandler(args, { label, promptPrefix, requirePrompt = true, usageHint, defaultYolo = false }) {
  await requireCopilot();
  const { flags, rest } = parseArgs(args);
  const userInput = rest.join(" ").trim();

  if (!userInput && requirePrompt) {
    console.log(errorBlock(usageHint ?? `Usage: /copilot:${label.toLowerCase()} <prompt>`));
    process.exit(1);
  }

  const prompt = promptPrefix
    ? [promptPrefix, "", userInput].join("\n")
    : userInput;

  const result = await copilotRun(prompt, {
    model: flags.model,
    yolo: flags.yolo === true || flags.yolo === "true" || defaultYolo,
    continue: flags.continue === true || flags.continue === "true",
    timeout: flags.timeout ? Number(flags.timeout) : undefined,
  });

  if (result.exitCode !== 0) {
    const msg = (result.stderr || result.stdout || "").trim();
    console.log(errorBlock(msg || `copilot exited with code ${result.exitCode}`));
    process.exit(1);
  }

  console.log(wrapOutput(label, result.stdout));
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function handleSetup(_args) {
  const { available, version } = await copilotVersion();
  let auth = { loggedIn: false };

  if (available) {
    auth = await copilotAuth();
  }

  console.log(setupReport({ available, version, auth }));
}

function handleAsk(args) {
  return runPromptHandler(args, {
    label: "Copilot",
    usageHint: "Usage: /copilot:ask <question>",
  });
}

function handleExplore(args) {
  return runPromptHandler(args, {
    label: "Copilot Explore",
    promptPrefix:
      "Analyze the codebase and answer the following.\n" +
      "Be thorough: check file structure, key modules, dependencies, and patterns.\n" +
      "Provide concrete file paths and code references.",
    usageHint: "Usage: /copilot:explore <what to analyze>",
    defaultYolo: true,
  });
}

function handlePlan(args) {
  return runPromptHandler(args, {
    label: "Copilot Plan",
    promptPrefix:
      "Create a detailed implementation plan for the following task.\n" +
      "Include: files to modify/create, step-by-step approach, edge cases, and testing strategy.\n" +
      "Do NOT make any changes — only output the plan.",
    usageHint: "Usage: /copilot:plan <feature or task description>",
    defaultYolo: true,
  });
}

async function handleGithub(args) {
  await requireCopilot();
  const { flags, rest } = parseArgs(args);
  const query = rest.join(" ").trim();

  if (!query) {
    console.log(
      errorBlock(
        "Usage: /copilot:github <query>\n\n" +
        "Examples:\n" +
        "  /copilot:github List open issues labeled bug\n" +
        "  /copilot:github Summarize PR #42\n" +
        "  /copilot:github Why did the last Actions run fail?\n" +
        "  /copilot:github Who is assigned to issue #10?"
      )
    );
    process.exit(1);
  }

  // Detect the remote URL so Copilot targets the correct repository
  let repoHint = "";
  let hasRemote = false;
  try {
    const { stdout } = await execFileAsync("git", ["remote", "get-url", "origin"], {
      timeout: 5_000,
    });
    const url = stdout.trim();
    if (url) {
      repoHint = `\nThe repository remote (origin) is: ${url} — use ONLY this repository for GitHub API queries.`;
      hasRemote = true;
    }
  } catch {
    // No remote configured — abort with clear message
    console.log(
      errorBlock(
        "No git remote 'origin' found.\n" +
        "/copilot:github requires a GitHub remote to identify the correct repository.\n" +
        "Run `git remote add origin <url>` first."
      )
    );
    process.exit(1);
  }

  const prompt = [
    "Use your GitHub integration to answer the following query about this repository.",
    "Access issues, pull requests, Actions workflows, and other GitHub data as needed.",
    "Provide specific details: numbers, titles, authors, labels, statuses, and links.",
    "IMPORTANT: Do NOT search GitHub for repositories by name. Use ONLY the remote URL provided below to identify the repository.",
    repoHint,
    "",
    query,
  ].join("\n");

  const result = await copilotRun(prompt, {
    model: flags.model,
    yolo: true,
    continue: flags.continue === true || flags.continue === "true",
  });

  if (result.exitCode !== 0) {
    const msg = (result.stderr || result.stdout || "").trim();
    console.log(errorBlock(msg || `copilot exited with code ${result.exitCode}`));
    process.exit(1);
  }

  console.log(wrapOutput("Copilot GitHub", result.stdout));
}

function handleMultiModel(args) {
  return (async () => {
    await requireCopilot();
    const { flags, rest } = parseArgs(args);
    const model = flags.model;
    const prompt = rest.join(" ").trim();

    if (!model || !prompt) {
      console.log(
        errorBlock(
          "Usage: /copilot:multi-model --model <model-name> <prompt>\n\n" +
          "Available models (examples):\n" +
          "  gpt-5.3-codex    — OpenAI Codex\n" +
          "  gpt-5-mini       — GPT-5 Mini\n" +
          "  gpt-4.1          — GPT-4.1\n" +
          "  gemini-3-pro     — Google Gemini 3 Pro\n" +
          "  claude-opus-4-6  — Anthropic Claude Opus 4.6"
        )
      );
      process.exit(1);
    }

    const result = await copilotRun(prompt, {
      model,
      yolo: flags.yolo === true || flags.yolo === "true",
      continue: flags.continue === true || flags.continue === "true",
    });

    if (result.exitCode !== 0) {
      const msg = (result.stderr || result.stdout || "").trim();
      console.log(errorBlock(msg || `copilot exited with code ${result.exitCode}`));
      process.exit(1);
    }

    console.log(wrapOutput(`Copilot (${model})`, result.stdout));
  })();
}

// ---------------------------------------------------------------------------
// Registry & dispatch
// ---------------------------------------------------------------------------

const handlers = new Map([
  ["setup", handleSetup],
  ["ask", handleAsk],
  ["explore", handleExplore],
  ["plan", handlePlan],
  ["github", handleGithub],
  ["multi-model", handleMultiModel],
]);

async function main() {
  const [subcommand, ...args] = process.argv.slice(2);

  if (!subcommand || !handlers.has(subcommand)) {
    const available = [...handlers.keys()].join(", ");
    console.error(`Usage: hub.mjs <${available}> [args...]`);
    process.exit(1);
  }

  try {
    await handlers.get(subcommand)(args);
  } catch (err) {
    console.log(errorBlock(err.message));
    process.exit(1);
  }
}

main();
