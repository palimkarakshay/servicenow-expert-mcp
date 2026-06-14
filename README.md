# servicenow-mcp

An MCP server that gives an AI agent **ServiceNow** expertise and (optionally) live access to a
ServiceNow instance. It pairs curated **offline platform knowledge** with **BYO-credential** live
**Table API** tools — the ServiceNow analog of the abap-mcp / anaplan-kit pattern.

- **Offline knowledge** (always on): core ITSM tables, encoded queries, the Table API, GlideRecord,
  Business Rules vs Flow Designer, ACLs, update sets, Personal Developer Instances.
- **Live tools** (only when you provide credentials): query any table, get/create/update records,
  list incidents. With no credentials they return `{"mode":"offline"}` and make no network call.

## Bring your own instance

Set env vars (basic auth) — a free **Personal Developer Instance** from developer.servicenow.com
gives you a full instance with REST access:

| Var | Required |
|---|---|
| `SNOW_INSTANCE_URL` | ✅ e.g. `https://dev12345.service-now.com` |
| `SNOW_USER` | ✅ |
| `SNOW_PASSWORD` | ✅ |

Credentials stay in your environment, are never logged or returned.

## Tools
`snow_connection_status` · `snow_reference` · `snow_search_knowledge` · `snow_query_table` ·
`snow_get_record` · `snow_list_incidents` · `snow_create_record` · `snow_update_record`

## Quickstart
```bash
npm install && npm run build
node dist/cli.js          # offline: knowledge works, live tools say mode:offline
# live: set SNOW_INSTANCE_URL/USER/PASSWORD first, then run again
```

Private to Lumivara.
