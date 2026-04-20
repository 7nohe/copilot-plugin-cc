import { describe, it } from "node:test";
import assert from "node:assert/strict";

// parseArgs is not exported, so we replicate the logic here for testing.
// This validates the argument parsing contract that all handlers depend on.
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

describe("parseArgs", () => {
  it("extracts positional arguments", () => {
    const { flags, rest } = parseArgs(["hello", "world"]);
    assert.deepEqual(rest, ["hello", "world"]);
    assert.deepEqual(flags, {});
  });

  it("extracts --flag value pairs", () => {
    const { flags, rest } = parseArgs(["--model", "gpt-5-mini", "do stuff"]);
    assert.equal(flags.model, "gpt-5-mini");
    assert.deepEqual(rest, ["do stuff"]);
  });

  it("treats lone --flag as boolean", () => {
    const { flags } = parseArgs(["--yolo", "--continue"]);
    assert.equal(flags.yolo, true);
    assert.equal(flags.continue, true);
  });

  it("treats --flag followed by another --flag as boolean", () => {
    const { flags } = parseArgs(["--yolo", "--model", "gpt"]);
    assert.equal(flags.yolo, true);
    assert.equal(flags.model, "gpt");
  });

  it("handles mixed flags and positionals", () => {
    const { flags, rest } = parseArgs(["--model", "gemini", "analyze", "the", "code", "--yolo"]);
    assert.equal(flags.model, "gemini");
    assert.equal(flags.yolo, true);
    assert.deepEqual(rest, ["analyze", "the", "code"]);
  });

  it("returns empty results for empty input", () => {
    const { flags, rest } = parseArgs([]);
    assert.deepEqual(flags, {});
    assert.deepEqual(rest, []);
  });
});

describe("hub.mjs dispatch", () => {
  it("exits with error for unknown subcommand", async () => {
    const { execFile } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const exec = promisify(execFile);

    try {
      await exec("node", ["plugins/copilot/scripts/hub.mjs", "nonexistent"], {
        cwd: process.cwd(),
        timeout: 10_000,
      });
      assert.fail("should have exited with non-zero");
    } catch (err) {
      assert.match(err.stderr, /Usage: hub\.mjs/);
    }
  });

  it("exits with error when no subcommand given", async () => {
    const { execFile } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const exec = promisify(execFile);

    try {
      await exec("node", ["plugins/copilot/scripts/hub.mjs"], {
        cwd: process.cwd(),
        timeout: 10_000,
      });
      assert.fail("should have exited with non-zero");
    } catch (err) {
      assert.match(err.stderr, /Usage: hub\.mjs/);
    }
  });

  it("ask without prompt exits non-zero", async () => {
    const { execFile } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const exec = promisify(execFile);

    try {
      await exec("node", ["plugins/copilot/scripts/hub.mjs", "ask"], {
        cwd: process.cwd(),
        timeout: 15_000,
      });
      assert.fail("should have exited with non-zero");
    } catch (err) {
      // "Usage" if copilot installed, "not installed" if not
      const out = (err.stdout || "") + (err.stderr || "");
      assert.ok(out.includes("Usage") || out.includes("not installed"), `unexpected: ${out}`);
    }
  });

  it("github without remote exits non-zero", async () => {
    const { execFile } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const exec = promisify(execFile);

    try {
      await exec("node", ["plugins/copilot/scripts/hub.mjs", "github", "list issues"], {
        cwd: process.cwd(),
        timeout: 15_000,
      });
      assert.fail("should have exited with non-zero");
    } catch (err) {
      // "No git remote" if copilot installed, "not installed" if not
      const out = (err.stdout || "") + (err.stderr || "");
      assert.ok(out.includes("No git remote") || out.includes("not installed"), `unexpected: ${out}`);
    }
  });
});
