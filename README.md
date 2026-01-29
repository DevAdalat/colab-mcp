# Colab MCP Client (TypeScript)

A high-performance Model Context Protocol (MCP) server for controlling Google Colab instances via a reverse proxy (ngrok, serveo, etc.).

## Features
- `connect_to_colab`: Link to your running Colab instance.
- `run_colab_shell`: Execute shell commands.
- `run_colab_python`: Run persistent Python code.
- `get_colab_system_info`: Monitor CPU/GPU/RAM.

## Quick Start (No Install)

You can run this MCP server directly from the GitHub release using Bun:

```bash
bun run https://github.com/DevAdalat/colab-mcp/releases/download/v1.0.0/colab-bridge.js
```

## Adding to MCP Agents (Claude Desktop, etc.)

To add this to your agent configuration, use the following setup:

### Claude Desktop
Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "colab-bridge": {
      "command": "bun",
      "args": [
        "run",
        "https://github.com/DevAdalat/colab-mcp/releases/download/v1.0.0/colab-bridge.js"
      ]
    }
  }
}
```

## Manual Installation

If you want to run it locally:

1. **Install Dependencies:**
   ```bash
   bun install
   ```

2. **Run Server:**
   ```bash
   bun run index.ts
   ```

## Requirements
- [Bun](https://bun.sh) runtime installed.
- A running Google Colab instance with the bridge script active.
