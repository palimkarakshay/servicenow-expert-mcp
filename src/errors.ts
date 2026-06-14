/**
 * Structured tool failure. Pattern adapted from @mcp-kit/core
 * (github.com/palimkarakshay/mcp-kit, MIT).
 */
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export type ToolErrorCode = "invalid_input" | "not_found" | "auth" | "system" | "internal";

export class McpToolError extends Error {
  constructor(
    public readonly code: ToolErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "McpToolError";
  }
}

export function invalidInput(message: string, details?: Record<string, unknown>): McpToolError {
  return new McpToolError("invalid_input", message, details);
}

/** A live ServiceNow REST call failed (auth, network, or the instance rejected it). */
export function systemError(message: string, details?: Record<string, unknown>): McpToolError {
  return new McpToolError("system", message, details);
}

/** Convert any thrown value into a structured MCP error result (text only). */
export function errorResult(err: unknown): CallToolResult {
  const e =
    err instanceof McpToolError
      ? err
      : new McpToolError("internal", err instanceof Error ? err.message : String(err));
  // No structuredContent on errors — strict clients validate it against the success
  // outputSchema and reject the whole result with -32602 otherwise.
  return {
    isError: true,
    content: [{ type: "text", text: `${e.code}: ${e.message}` }],
  };
}
