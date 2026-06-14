# servicenow-mcp

MCP server for **ServiceNow**: offline platform **knowledge** (always available) + **BYO-credential**
live **Table API** tools (incidents, records, queries, create/update). Live tools return
`{"mode":"offline"}` without credentials — the same honesty invariant as abap-enclave-mcp / anaplan-kit.

- **Lumivara product line:** Labs (the Anna-pattern, for ServiceNow). PRIVATE for now.
- Dependency-light: MCP SDK + zod only; live calls use Node's built-in `fetch` (basic auth).

## Package manager: npm — Node >= 20

## Commands (authoritative)
- `npm install`
- `npm run check` — typecheck + vitest + build = **the gate**
- `node dist/cli.js` — run the stdio MCP server
- Inspect: `npx @modelcontextprotocol/inspector --cli node dist/cli.js --method tools/list`

## BYO-credential
Env-only: `SNOW_INSTANCE_URL` / `SNOW_USER` / `SNOW_PASSWORD` (basic auth). None set ⇒ offline,
no network (tested). A free Personal Developer Instance (developer.servicenow.com) supplies all
three and full REST access. See `.env.example`. Credentials are never logged or returned.

## Layout
- `src/snow/session.ts` — env credential read, `connectionStatus()`, `snowFetch()` (basic-auth
  REST), `tableQuery()`, the single `offlineResult()` payload.
- `src/knowledge.ts` — curated offline ServiceNow reference (core tables, encoded queries, Table
  API, GlideRecord, Business Rules vs Flow, ACLs, update sets, PDIs) + search. Grow this over time.
- `src/snow.tools.ts` — 8 ToolSpecs: connection_status, reference, search_knowledge, query_table,
  get_record, list_incidents, create_record, update_record. Live calls funnel through `live()`.
- `src/tool.ts`, `src/errors.ts` — vendored mcp-kit patterns (text-only error results).
- `src/server.ts` / `src/cli.ts` / `src/index.ts`.

## Deploy: none hosted — runs as a local stdio MCP server (wired into the ServiceNow bot / OpenClaw).

## Gotchas / invariants
- stdout is the JSON-RPC channel — human-facing text goes to **stderr**.
- Offline-without-creds is TESTED (`src/__tests__/snow.test.ts`); the `live()` wrapper gates every
  Table API call on `credentialsConfigured()`. Knowledge tools never gate.
- `create_record` / `update_record` WRITE to the instance — they carry write annotations; keep them.
- Knowledge is curated reference, NOT live instance data — never present it as records.
