# copilot-plugin-cc

A Claude Code plugin that integrates GitHub Copilot CLI — bringing multi-model AI access, codebase exploration, and implementation planning directly into your Claude Code sessions.

## What this plugin does

This plugin wraps the standalone `copilot` CLI to let you:

- **Ask** — Send any question or task to Copilot CLI
- **Explore** — Delegate codebase analysis to Copilot's built-in Explore agent
- **Plan** — Get a second-opinion implementation plan from a different AI
- **GitHub** — Query issues, PRs, and Actions using Copilot's built-in GitHub MCP
- **Multi-model** — Run prompts with GPT, Gemini, or other models available through Copilot

## Prerequisites

- [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) (`copilot` command)
- Active GitHub Copilot subscription
- Node.js 18.18.0 or later

## Installation

```
/plugin install 7nohe@copilot-plugin-cc
```

Then verify the setup:

```
/copilot:setup
```

## Commands

| Command | Description |
|---------|-------------|
| `/copilot:setup` | Check copilot CLI installation and authentication |
| `/copilot:ask <prompt>` | Send a question or task to Copilot CLI |
| `/copilot:explore <topic>` | Analyze the codebase using Copilot's Explore agent |
| `/copilot:plan <task>` | Get an implementation plan as a second opinion |
| `/copilot:github <query>` | Query issues, PRs, Actions via Copilot's GitHub MCP |
| `/copilot:multi-model --model <name> <prompt>` | Run a prompt with a specific AI model |

### Options

- `--model <name>` — Choose a specific model (available on `ask`, `plan`, `multi-model`)
- `--yolo` — Skip Copilot's permission prompts (available on `ask`, `multi-model`)

### GitHub query examples

```
/copilot:github List open issues labeled bug
/copilot:github Summarize PR #42 and its review comments
/copilot:github Why did the last CI run fail?
/copilot:github Who is assigned to issue #10?
```

### Model examples

```
/copilot:multi-model --model gpt-5.3-codex Explain the auth middleware
/copilot:multi-model --model gemini-3-pro Suggest improvements for the API layer
```

## Architecture

This plugin is intentionally simple and stateless:

- **No SDK dependency** — Calls `copilot -p` directly via shell execution
- **No background jobs** — All commands run in the foreground
- **No persistent state** — No job tracking or session management
- **Handler registry** — Clean Map-based dispatch in `hub.mjs`

## How it differs from other Copilot plugins

This plugin focuses on leveraging Copilot CLI's unique strengths:

1. **Built-in GitHub MCP** — Query issues, PRs, and Actions without separate `gh` CLI setup
2. **Multi-model access** — Use GPT, Gemini, and other models Copilot supports
3. **Independent context** — Copilot runs in its own context with its own file access
4. **Second opinions** — Get a different AI's perspective on architecture, plans, or code
5. **Lightweight** — No SDK, no state, no background processes

## License

Apache-2.0
