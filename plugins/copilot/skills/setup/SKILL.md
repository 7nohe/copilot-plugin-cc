---
name: setup
description: "Check whether copilot CLI is installed and authenticated. Use this when the user mentions Copilot setup, installation, login issues, or when any other /copilot command reports that the CLI is missing."
allowed-tools: Bash(node:*), Bash(npm:*), Bash(brew:*), Bash(curl:*), AskUserQuestion
---

Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/hub.mjs" setup "$ARGUMENTS"
```

If the result says copilot CLI is missing:
- Use `AskUserQuestion` exactly once to ask whether to install copilot CLI now.
- Options:
  - `Install via npm (Recommended)`
  - `Install via Homebrew`
  - `Skip for now`
- If the user chooses npm:

```bash
npm install -g @github/copilot
```

- If the user chooses Homebrew:

```bash
brew install copilot-cli
```

- Then rerun:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/hub.mjs" setup "$ARGUMENTS"
```

If copilot CLI is installed but not authenticated:
- Preserve the guidance to run `!copilot login`.

Output rules:
- Present the final setup output to the user.
- If installation was skipped, present the original setup output.
