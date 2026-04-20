---
name: explore
description: "Delegate codebase analysis to GitHub Copilot CLI's Explore agent for an independent perspective. Use this when the user wants a second opinion on code architecture, wants Copilot to investigate the project structure, or says things like 'Copilot で調べて', 'have Copilot analyze this', 'get another perspective on the codebase'."
argument-hint: "<what to analyze — architecture, patterns, dependencies, etc.>"
context: fork
allowed-tools: Bash(node:*)
---

Delegate codebase analysis to GitHub Copilot CLI.
Copilot runs in its own context with its own file access, giving an independent perspective.

Raw user request:
$ARGUMENTS

Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/hub.mjs" explore "$ARGUMENTS"
```

Operating rules:

- Return Copilot's analysis verbatim.
- Do not add your own analysis or commentary on top.
- This is useful for getting a second opinion on code structure, architecture, or patterns.
- If no topic was provided, ask the user what they want Copilot to explore.
