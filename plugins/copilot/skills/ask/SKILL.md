---
name: ask
description: "Send a question or task to GitHub Copilot CLI for a second opinion or to leverage a different AI. Use this whenever the user says 'ask Copilot', 'Copilot に聞いて', wants a second opinion from another AI, or explicitly wants to use GitHub Copilot. Also use when the user wants to continue a previous Copilot session with --continue."
argument-hint: "[--model <model>] [--continue] <prompt>"
context: fork
allowed-tools: Bash(node:*)
---

Send a prompt to GitHub Copilot CLI using its programmatic mode.

Raw user request:
$ARGUMENTS

Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/hub.mjs" ask "$ARGUMENTS"
```

Operating rules:

- Return Copilot's output verbatim to the user.
- Do not paraphrase, summarize, or add commentary.
- If the companion reports copilot CLI is missing, tell the user to run `/copilot:setup`.
- If no prompt was provided, ask the user what to send to Copilot.
- `--continue` resumes the most recent Copilot session, carrying over context from a previous call.
