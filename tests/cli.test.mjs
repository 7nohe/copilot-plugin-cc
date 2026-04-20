import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { copilotAvailable, copilotVersion } from "../plugins/copilot/scripts/lib/cli.mjs";

describe("copilotAvailable", () => {
  it("returns an object with available boolean", async () => {
    const result = await copilotAvailable();
    assert.equal(typeof result.available, "boolean");
  });

  it("includes raw output when available", async () => {
    const result = await copilotAvailable();
    if (!result.available) return; // CI: copilot not installed
    assert.ok(result.raw.length > 0);
  });
});

describe("copilotVersion", () => {
  it("returns available false when CLI not found", async () => {
    const result = await copilotVersion();
    if (result.available) return; // Local: copilot is installed
    assert.equal(result.available, false);
    assert.equal(result.version, null);
  });

  it("parses semver when CLI is present", async () => {
    const result = await copilotVersion();
    if (!result.available) return; // CI: copilot not installed
    assert.match(result.version, /^\d+\.\d+\.\d+/);
  });
});
