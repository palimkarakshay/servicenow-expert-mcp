/**
 * The servicenow-mcp tool registry: offline platform knowledge + BYO-credential
 * live Table API tools. Live tools funnel through `live()`, which returns the
 * exact offline payload when no instance is configured (honesty invariant).
 * Knowledge tools work regardless of credentials.
 *
 * Descriptions follow the mcp-kit rubric: verb-first snake_case name, an
 * explicit "Use this when …", explicit non-goals, every parameter described,
 * an example.
 */
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { getKnowledge, listTopics, searchKnowledge } from "./knowledge.js";
import {
  connectionStatus,
  credentialsConfigured,
  offlineResult,
  snowFetch,
  tableQuery,
} from "./snow/session.js";
import type { AnyToolSpec } from "./tool.js";
import { defineTool, jsonResult } from "./tool.js";

async function live(fn: () => Promise<unknown>): Promise<CallToolResult> {
  if (!credentialsConfigured()) return jsonResult(offlineResult());
  return jsonResult({ mode: "live", data: await fn() });
}

const READ = { readOnlyHint: true, openWorldHint: true } as const;
const WRITE = { readOnlyHint: false, openWorldHint: true } as const;

export const snowConnectionStatus = defineTool({
  name: "snow_connection_status",
  title: "Check ServiceNow connection",
  description:
    "Report whether this server is connected to a live ServiceNow instance. Returns mode=live when " +
    "SNOW_INSTANCE_URL / SNOW_USER / SNOW_PASSWORD are set, otherwise mode=offline plus which vars " +
    "are present (never their values). Use this FIRST when asked anything that needs a real instance, " +
    "so you can tell the user honestly whether you can reach one. Makes no network call. " +
    "Example: snow_connection_status({}).",
  inputSchema: {},
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: () => jsonResult(connectionStatus()),
});

export const snowReference = defineTool({
  name: "snow_reference",
  title: "Get ServiceNow platform reference",
  description:
    "Return curated ServiceNow platform knowledge (core tables, encoded queries, Table API, " +
    "GlideRecord, Business Rules vs Flow, ACLs, update sets, PDIs). With no topic it lists the " +
    "available topic ids; with a topic id it returns that entry. Use this when answering ServiceNow " +
    "platform / scripting / admin questions — it works offline, no instance required. It is curated " +
    "reference, not live data (use snow_query_table for records). " +
    'Example: snow_reference({ "topic": "encoded-query" }).',
  inputSchema: {
    topic: z
      .string()
      .optional()
      .describe('Topic id from the list (e.g. "core-tables", "table-api"); omit to list all topics.'),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: ({ topic }) => {
    if (topic === undefined) return jsonResult({ topics: listTopics() });
    const entry = getKnowledge(topic);
    if (entry === undefined) {
      return jsonResult({ error: "unknown topic", topics: listTopics() });
    }
    return jsonResult(entry);
  },
});

export const snowSearchKnowledge = defineTool({
  name: "snow_search_knowledge",
  title: "Search ServiceNow knowledge",
  description:
    "Full-text search the curated ServiceNow knowledge for entries matching a query, returning the " +
    "matching reference entries. Use this when you are not sure which reference topic covers a " +
    "question (e.g. 'how do I filter on priority'). Works offline. Searches the curated kit only, " +
    "not a live instance's knowledge base. " +
    'Example: snow_search_knowledge({ "query": "filter incidents by priority" }).',
  inputSchema: {
    query: z.string().min(1).describe("Words to search for across titles, tags and bodies."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: ({ query }) => jsonResult({ results: searchKnowledge(query) }),
});

export const snowQueryTable = defineTool({
  name: "snow_query_table",
  title: "Query a ServiceNow table",
  description:
    "Read records from any ServiceNow table via the Table API, filtered by an encoded query. " +
    "Use this when the user wants real records from their instance (incidents, changes, CIs, users …). " +
    "Pass an encoded query (see snow_reference topic 'encoded-query'). Returns mode=offline if no " +
    "instance is configured. It reads only — use snow_create_record / snow_update_record to change data. " +
    'Example: snow_query_table({ "table": "incident", "query": "active=true^priority=1", "fields": ["number","short_description","state"], "limit": 10 }).',
  inputSchema: {
    table: z.string().min(1).describe('Table name, e.g. "incident", "change_request", "sys_user".'),
    query: z
      .string()
      .optional()
      .describe('Encoded query, e.g. "active=true^priority=1". Omit for no filter.'),
    fields: z
      .array(z.string())
      .optional()
      .describe("Field names to return (sysparm_fields); omit for all fields."),
    limit: z.number().int().positive().max(1000).default(20).describe("Max rows (1–1000)."),
    displayValue: z
      .boolean()
      .default(true)
      .describe("true returns human labels, false raw values/sys_ids."),
  },
  annotations: READ,
  handler: ({ table, query, fields, limit, displayValue }) =>
    live(() =>
      snowFetch(
        `/api/now/table/${encodeURIComponent(table)}${tableQuery({ query, fields, limit, displayValue })}`,
      ),
    ),
});

export const snowGetRecord = defineTool({
  name: "snow_get_record",
  title: "Get one ServiceNow record",
  description:
    "Fetch a single record by sys_id from a table. Use this when you already have a record's sys_id " +
    "(e.g. from snow_query_table) and want its full detail. Returns mode=offline if no instance is " +
    "configured. " +
    'Example: snow_get_record({ "table": "incident", "sys_id": "a1b2c3...", "fields": ["number","description"] }).',
  inputSchema: {
    table: z.string().min(1).describe("Table name."),
    sys_id: z.string().min(1).describe("The record's sys_id."),
    fields: z.array(z.string()).optional().describe("Field names to return; omit for all."),
    displayValue: z.boolean().default(true).describe("true = human labels, false = raw values."),
  },
  annotations: READ,
  handler: ({ table, sys_id, fields, displayValue }) =>
    live(() =>
      snowFetch(
        `/api/now/table/${encodeURIComponent(table)}/${encodeURIComponent(sys_id)}${tableQuery({ fields, displayValue })}`,
      ),
    ),
});

export const snowListIncidents = defineTool({
  name: "snow_list_incidents",
  title: "List incidents",
  description:
    "Convenience read of the incident table with an optional encoded query — equivalent to " +
    "snow_query_table on 'incident'. Use this for the common 'show me incidents …' ask. " +
    "Returns mode=offline if no instance is configured. " +
    'Example: snow_list_incidents({ "query": "active=true^assignment_group.name=Network", "limit": 25 }).',
  inputSchema: {
    query: z.string().optional().describe('Encoded query, e.g. "active=true^priority=1".'),
    limit: z.number().int().positive().max(1000).default(25).describe("Max rows (1–1000)."),
  },
  annotations: READ,
  handler: ({ query, limit }) =>
    live(() =>
      snowFetch(
        `/api/now/table/incident${tableQuery({
          query,
          limit,
          fields: ["number", "short_description", "state", "priority", "assigned_to", "sys_created_on"],
          displayValue: true,
        })}`,
      ),
    ),
});

export const snowCreateRecord = defineTool({
  name: "snow_create_record",
  title: "Create a ServiceNow record",
  description:
    "Create a record in a table from a field map (POST to the Table API). Use this ONLY when the user " +
    "explicitly asks to create a record (e.g. open an incident) and has confirmed the field values. " +
    "This WRITES to the instance. Returns mode=offline if no instance is configured. " +
    'Example: snow_create_record({ "table": "incident", "fields": { "short_description": "VPN down", "urgency": "1" } }).',
  inputSchema: {
    table: z.string().min(1).describe("Table to create the record in."),
    fields: z
      .record(z.string(), z.unknown())
      .describe("Field name → value map for the new record."),
  },
  annotations: WRITE,
  handler: ({ table, fields }) =>
    live(() =>
      snowFetch(`/api/now/table/${encodeURIComponent(table)}`, {
        method: "POST",
        body: JSON.stringify(fields),
      }),
    ),
});

export const snowUpdateRecord = defineTool({
  name: "snow_update_record",
  title: "Update a ServiceNow record",
  description:
    "Update fields on an existing record by sys_id (PATCH to the Table API). Use this ONLY when the " +
    "user explicitly asks to change a record and has confirmed the new values. This WRITES to the " +
    "instance. Returns mode=offline if no instance is configured. " +
    'Example: snow_update_record({ "table": "incident", "sys_id": "a1b2c3...", "fields": { "state": "6", "close_notes": "Resolved" } }).',
  inputSchema: {
    table: z.string().min(1).describe("Table the record is in."),
    sys_id: z.string().min(1).describe("The record's sys_id."),
    fields: z.record(z.string(), z.unknown()).describe("Field name → new value map."),
  },
  annotations: WRITE,
  handler: ({ table, sys_id, fields }) =>
    live(() =>
      snowFetch(`/api/now/table/${encodeURIComponent(table)}/${encodeURIComponent(sys_id)}`, {
        method: "PATCH",
        body: JSON.stringify(fields),
      }),
    ),
});

export const ALL_TOOLS: readonly AnyToolSpec[] = [
  snowConnectionStatus,
  snowReference,
  snowSearchKnowledge,
  snowQueryTable,
  snowGetRecord,
  snowListIncidents,
  snowCreateRecord,
  snowUpdateRecord,
];
