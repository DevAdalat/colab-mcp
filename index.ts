import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Initialize FastMCP server equivalent
const server = new McpServer({
  name: "Colab Bridge Client",
  version: "1.0.0",
});

// Global state to store the connected Colab URL
const connectionState = {
  baseUrl: null as string | null,
  isConnected: false,
};

interface ColabExecResult {
  return_code: number;
  stdout: string;
  stderr: string;
  error?: string;
}

interface ColabConnectionResponse {
  system: string;
}

async function makeRequest<T = unknown>(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  payload?: Record<string, unknown>
): Promise<T> {
  const baseUrl = connectionState.baseUrl;
  if (!baseUrl) {
    throw new Error(
      "Not connected to Colab. Please run 'connect_to_colab' first."
    );
  }

  // Ensure URL doesn't have trailing slash for clean joining
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const url = `${cleanBaseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: payload ? JSON.stringify(payload) : undefined,
      signal: AbortSignal.timeout(120000), // 120s timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Communication error with Colab: ${errorMessage}`);
  }
}

server.tool(
  "connect_to_colab",
  {
    url: z.string().describe("The public URL provided by the Colab script (e.g., 'https://xxxx.ngrok-free.app' or 'https://...serveousercontent.com')"),
  },
  async ({ url }) => {
    // Normalize URL
    let normalizedUrl = url;
    if (!normalizedUrl.startsWith("http")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    if (normalizedUrl.endsWith("/")) {
      normalizedUrl = normalizedUrl.slice(0, -1);
    }

    // Test connection
    try {
      const response = await fetch(`${normalizedUrl}/`, {
        method: "GET",
        headers: { "ngrok-skip-browser-warning": "true" },
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      if (response.ok) {
        connectionState.baseUrl = normalizedUrl;
        connectionState.isConnected = true;
        const data = (await response.json()) as ColabConnectionResponse;
        return {
          content: [
            {
              type: "text",
              text: `Successfully connected to Colab at ${normalizedUrl}. System: ${data.system}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `Failed to connect. Status code: ${response.status}`,
            },
          ],
        };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to connect to ${normalizedUrl}. Error: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "run_colab_shell",
  {
    command: z.string().describe("The shell command to run (e.g., 'ls -la', 'pip install pandas')"),
  },
  async ({ command }) => {
    try {
      const result = await makeRequest<ColabExecResult>("/exec/shell", "POST", { command });
      let output = `Exit Code: ${result.return_code}\n`;
      if (result.stdout) {
        output += `--- STDOUT ---\n${result.stdout}\n`;
      }
      if (result.stderr) {
        output += `--- STDERR ---\n${result.stderr}`;
      }
      if (result.error) {
        output += `\n--- ERROR ---\n${result.error}`;
      }
      return {
        content: [{ type: "text", text: output }],
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error executing shell command: ${errorMessage}` }],
      };
    }
  }
);

server.tool(
  "run_colab_python",
  {
    code: z.string().describe("The Python code to execute"),
  },
  async ({ code }) => {
    try {
      const result = await makeRequest<ColabExecResult>("/exec/python", "POST", { code });
      let output = "";
      if (result.stdout) {
        output += `--- STDOUT ---\n${result.stdout}\n`;
      }
      if (result.stderr) {
        output += `--- STDERR ---\n${result.stderr}`;
      }
      if (!output) {
        output = "Code executed successfully (no output).";
      }
      return {
        content: [{ type: "text", text: output }],
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error executing Python code: ${errorMessage}` }],
      };
    }
  }
);

server.tool(
  "get_colab_system_info",
  {},
  async () => {
    try {
      const info = await makeRequest<unknown>("/info/system", "GET");
      return {
        content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error fetching system info: ${errorMessage}` }],
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
