---
name: multi-model
description: "Run a task with a specific AI model (GPT, Gemini, etc.) via Copilot CLI's multi-model access. Use when the user wants to try GPT-5, Gemini, or another model, says 'GPT で試して', 'Gemini に聞いて', 'use a different model', or wants to compare outputs across AI models."
argument-hint: "--model <model-name> <prompt>"
context: fork
allowed-tools: Bash(node:*)
---

Use GitHub Copilot CLI to run a prompt with a specific AI model.
This leverages Copilot's multi-model access to get perspectives from GPT, Gemini, or other models.

Raw user request:
$ARGUMENTS

Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/hub.mjs" multi-model "$ARGUMENTS"
```

Operating rules:

- Return the model's output verbatim.
- If model or prompt is missing, show usage with available model names.
- Do not add commentary or compare with Claude's own answer.
