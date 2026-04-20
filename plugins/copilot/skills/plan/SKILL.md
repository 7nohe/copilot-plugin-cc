---
name: plan
description: "Get an implementation plan from Copilot CLI as a second opinion. Use when the user wants to compare approaches, says 'Copilot の意見も聞きたい', 'get Copilot's plan', or wants a different AI's take on how to implement a feature or fix."
argument-hint: "[--model <model>] <feature or task description>"
context: fork
allowed-tools: Bash(node:*)
---

Request an implementation plan from GitHub Copilot CLI.
This provides a second opinion from a different AI on how to approach a task.

Raw user request:
$ARGUMENTS

Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/hub.mjs" plan "$ARGUMENTS"
```

Operating rules:

- Return Copilot's plan verbatim to the user.
- Do not modify, merge, or reinterpret the plan.
- The user can compare this with Claude Code's own plan to make a decision.
- If no task was described, ask the user what they want Copilot to plan.
