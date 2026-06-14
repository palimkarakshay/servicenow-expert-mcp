#!/usr/bin/env node
/** stdio entry point. stdout is the JSON-RPC channel — human-facing text goes to stderr. */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { buildServer, SERVER_NAME, SERVER_VERSION } from "./server.js";
import { connectionStatus } from "./snow/session.js";

async function main(): Promise<void> {
  const server = buildServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`${SERVER_NAME} ${SERVER_VERSION} ready (mode: ${connectionStatus().mode})\n`);
}

main().catch((err: unknown) => {
  process.stderr.write(`${SERVER_NAME}: fatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
