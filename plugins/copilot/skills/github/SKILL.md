---
name: github
description: "Query GitHub issues, PRs, and Actions using Copilot CLI's built-in GitHub MCP integration — no gh CLI required. Use whenever the user asks about issues, pull requests, CI/CD status, Actions failures, contributors, or any GitHub repository data through Copilot. Triggers on: 'issue 一覧', 'PR の状況', 'CI が落ちた', 'Copilot で GitHub 確認', 'what issues are open', 'why did CI fail'."
argument-hint: "<query — e.g. 'list open bugs', 'summarize PR #42', 'why did CI fail?'>"
context: fork
allowed-tools: Bash(node:*)
---

Leverage Copilot CLI's built-in GitHub MCP server to query repository data.
Unlike `gh` CLI, Copilot can interpret and summarize GitHub data in natural language.

Raw user request:
$ARGUMENTS

Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/hub.mjs" github "$ARGUMENTS"
```

Operating rules:

- Return Copilot's GitHub query results verbatim.
- Do not supplement with your own `gh` CLI calls — the point is to use Copilot's integrated GitHub context.
- If no query was provided, ask the user what they want to know about the repository.
