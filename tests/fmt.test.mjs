import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { setupReport, wrapOutput, errorBlock } from "../plugins/copilot/scripts/lib/fmt.mjs";

describe("setupReport", () => {
  it("shows install instructions when CLI is missing", () => {
    const out = setupReport({ available: false, version: null, auth: {} });
    assert.match(out, /\[missing\]/);
    assert.match(out, /npm install/);
    assert.match(out, /brew install/);
  });

  it("shows ready when CLI installed and authenticated", () => {
    const out = setupReport({ available: true, version: "1.2.3", auth: { loggedIn: true } });
    assert.match(out, /\[ok\] copilot CLI v1\.2\.3/);
    assert.match(out, /\[ok\] Authenticated/);
    assert.match(out, /ready/);
  });

  it("shows auth guidance when not logged in", () => {
    const out = setupReport({ available: true, version: "1.0.0", auth: { loggedIn: false } });
    assert.match(out, /\[ok\] copilot CLI v1\.0\.0/);
    assert.match(out, /\[auth\] Not logged in/);
    assert.match(out, /copilot login/);
    assert.ok(!out.includes("ready"));
  });

  it("handles null version gracefully", () => {
    const out = setupReport({ available: true, version: null, auth: { loggedIn: true } });
    assert.match(out, /unknown/);
  });
});

describe("wrapOutput", () => {
  it("wraps content with a label", () => {
    const out = wrapOutput("Test", "hello world");
    assert.equal(out, "**Test**\n\nhello world");
  });

  it("trims whitespace from content", () => {
    const out = wrapOutput("Label", "  spaced  \n");
    assert.equal(out, "**Label**\n\nspaced");
  });

  it("returns no-output message for empty content", () => {
    assert.match(wrapOutput("X", ""), /no output/);
    assert.match(wrapOutput("X", null), /no output/);
    assert.match(wrapOutput("X", undefined), /no output/);
  });
});

describe("errorBlock", () => {
  it("formats error message", () => {
    assert.equal(errorBlock("something broke"), "**Error**: something broke");
  });
});
