/**
 * Format the setup check results as a readable report.
 */
export function setupReport({ available, version, auth }) {
  const lines = [];

  if (available) {
    lines.push(`[ok] copilot CLI v${version ?? "unknown"}`);
  } else {
    lines.push("[missing] copilot CLI not found");
    lines.push("");
    lines.push("Install Copilot CLI:");
    lines.push("  npm install -g @github/copilot");
    lines.push("  # or");
    lines.push("  brew install copilot-cli");
    lines.push("  # or");
    lines.push('  curl -fsSL https://gh.io/copilot-install | bash');
    return lines.join("\n");
  }

  if (auth?.loggedIn) {
    lines.push("[ok] Authenticated with GitHub");
  } else {
    lines.push("[auth] Not logged in");
    lines.push("");
    lines.push("Run `!copilot login` to authenticate.");
  }

  if (available && auth?.loggedIn) {
    lines.push("");
    lines.push("Copilot CLI is ready.");
  }

  return lines.join("\n");
}

/**
 * Wrap command output in a labeled fenced block.
 */
export function wrapOutput(label, content) {
  const trimmed = (content ?? "").trim();
  if (!trimmed) return `**${label}**: (no output)`;
  return `**${label}**\n\n${trimmed}`;
}

/**
 * Format an error for display.
 */
export function errorBlock(message) {
  return `**Error**: ${message}`;
}
