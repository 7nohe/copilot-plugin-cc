---
name: copilot-cli-runtime
description: "Internal helper contract for calling the copilot CLI from Claude Code"
user-invocable: false
---

# Copilot CLI runtime contract

This skill is the internal contract used by the `copilot-rescue` subagent.
It is not user-invocable.

## Invocation

The copilot CLI is called via the hub dispatcher:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/hub.mjs" <subcommand> [args...]
```

Available subcommands: `setup`, `ask`, `explore`, `plan`, `github`, `multi-model`.

## Rules

- Only invoke the `ask` subcommand from the subagent.
- Pass the full prompt as positional arguments after `ask`.
- Return stdout verbatim — do not paraphrase or add commentary.
- If copilot CLI is missing or fails, report the error and stop.
