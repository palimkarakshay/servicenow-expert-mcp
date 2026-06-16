# servicenow-expert-mcp

**The ServiceNow MCP server that ships built-in platform expertise.**

Most ServiceNow MCP servers are pure API plumbing — they hand an LLM a REST connection and stop
there. This one pairs **30 curated offline reference topics** (the kind of platform knowledge a senior
ServiceNow developer carries in their head) with **BYO-credential live Table API tools** — so the
agent can both *reason correctly* about ServiceNow and *act* on your instance.

It is built on one hard rule: **it never fabricates instance data.** With no credentials, the live
tools return `{"mode":"offline"}` and make zero network calls — the agent answers from knowledge and
tells you to connect an instance, rather than inventing records.

[![MCP](https://img.shields.io/badge/MCP-server-blue)](https://modelcontextprotocol.io)
![Node](https://img.shields.io/badge/node-%3E%3D20-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## Why this one

| | This server | Typical OSS SN MCP | ServiceNow native MCP (Zurich+) |
|---|---|---|---|
| **Built-in platform knowledge** | ✅ 30 curated topics | ❌ API only | ❌ |
| **Refuses to fabricate records** | ✅ tested invariant | ⚠️ varies | ✅ |
| **Works without an instance** | ✅ knowledge offline | ❌ | ❌ |
| **Any SN version / any AI model** | ✅ Table API (Tokyo+) | ✅ | ❌ Zurich+ & Now Assist only |
| **Zero entitlements** | ✅ | ✅ | ❌ requires Now Assist |
| **Dependency footprint** | MCP SDK + zod only | varies | platform |

If you want a connector, there are good free ones. If you want an agent that actually *understands*
ServiceNow — encoded-query syntax, GlideRecord pitfalls, Business-Rule-vs-Flow decisions, ACL
evaluation order, update-set hygiene — that's what this adds.

## Built-in knowledge (always on, no instance needed)

30 topics covering: core tables · encoded queries (basic + advanced) · Table API (+ advanced) ·
GlideRecord · Aggregate API · import sets · Business Rules (incl. deep) vs Flow Designer ·
Script Includes · client scripts · GlideAjax · Glide APIs · Flow Designer · Service Catalog ·
notifications & events · scheduled jobs · REST integration · ACLs & security · update sets ·
scoped apps · CMDB/CI · users/groups/roles · states & choices · performance best practices ·
debugging & troubleshooting · a guided onboarding learning path · and a glossary.

## Tools (8)

**Knowledge (always on):**
`snow_reference` · `snow_search_knowledge` · `snow_connection_status`

**Live Table API (only with credentials):**
`snow_query_table` · `snow_get_record` · `snow_list_incidents` · `snow_create_record` · `snow_update_record`

## Bring your own instance

A free **Personal Developer Instance** from [developer.servicenow.com](https://developer.servicenow.com)
gives you a full instance with REST access. Set env vars (basic auth):

| Var | Required |
|---|---|
| `SNOW_INSTANCE_URL` | ✅ e.g. `https://dev12345.service-now.com` |
| `SNOW_USER` | ✅ |
| `SNOW_PASSWORD` | ✅ |

Credentials stay in your environment — never logged, never returned. With none set, every live tool
is offline and inert.

## Quickstart

```bash
npm install servicenow-expert-mcp     # or clone + npm install && npm run build
servicenow-mcp                        # offline: knowledge works, live tools say mode:offline
```

### Use it from Claude Desktop / Claude Code / any MCP client

```jsonc
{
  "mcpServers": {
    "servicenow": {
      "command": "npx",
      "args": ["-y", "servicenow-expert-mcp"],
      "env": {
        "SNOW_INSTANCE_URL": "https://dev12345.service-now.com",
        "SNOW_USER": "admin",
        "SNOW_PASSWORD": "..."
      }
    }
  }
}
```

Omit the `env` block to run knowledge-only (no instance, no network from live tools).

## Who it's for

ServiceNow developers, consultants, and SI teams who want an AI pair that reasons like a platform
expert and can safely touch a real instance — in their IDE, in Claude, or behind a chat bot.

## Roadmap

- OAuth 2.1 + PKCE (in addition to basic auth)
- More live surfaces (CMDB walk, update-set review skill, ATC-style script checks)
- Packaged multi-channel assistant (the hosted **Nova** bot)

## Author & services

Built by **Akshay Palimkar** — SAP & ServiceNow × AI specialist. Need ServiceNow + AI wired into your
practice (custom knowledge packs, governed agents, MID-server/on-prem deployment)? Reach out via the
repository.

## License

MIT
