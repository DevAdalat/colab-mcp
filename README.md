# Colab MCP Client (TypeScript)

A high-performance Model Context Protocol (MCP) server for controlling Google Colab instances via a reverse proxy (ngrok, serveo, etc.).

## Features
- `connect_to_colab`: Link to your running Colab instance.
- `run_colab_shell`: Execute shell commands.
- `run_colab_python`: Run persistent Python code.
- `get_colab_system_info`: Monitor CPU/GPU/RAM.

## Quick Start (No Install)

You can run this MCP server directly using Bun:

```bash
bun https://github.com/DevAdalat/colab-mcp/releases/download/v1.0.0/colab-bridge.js
```

## Adding to MCP Agents (Claude Desktop, etc.)

For a stable setup, it is recommended to download the file locally:

1. **Download the binary/script:**
   ```bash
   curl -LO https://github.com/DevAdalat/colab-mcp/releases/download/v1.0.0/colab-bridge.js
   ```

2. **Add to Claude Desktop:**
   Update your `claude_desktop_config.json` (usually at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "colab-bridge": {
      "command": "bun",
      "args": [
        "/absolute/path/to/colab-bridge.js"
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
