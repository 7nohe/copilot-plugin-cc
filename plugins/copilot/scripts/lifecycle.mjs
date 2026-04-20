#!/usr/bin/env node

/**
 * Session lifecycle hook for copilot-plugin-cc.
 *
 * SessionStart: verify copilot CLI availability and emit a short status line.
 * This is intentionally lightweight — no state to clean up on SessionEnd
 * because the plugin is stateless (no background jobs).
 */

import { copilotVersion } from "./lib/cli.mjs";

const event = process.argv[2];

if (event === "SessionStart") {
  const { available, version } = await copilotVersion();
  if (available) {
    console.log(`copilot CLI v${version} detected`);
  } else {
    console.log("copilot CLI not found — run /copilot:setup for installation instructions");
  }
}

// SessionEnd: nothing to clean up (stateless plugin)
