/**
 * Curated, offline ServiceNow platform knowledge. Intentionally small and
 * high-signal — grow it over time (the analog of anaplan-kit's bundled docs).
 * Verified against ServiceNow's published platform behaviour.
 */
export interface KnowledgeEntry {
  id: string;
  title: string;
  tags: string[];
  body: string;
}

export const KNOWLEDGE: readonly KnowledgeEntry[] = [
  {
    id: "core-tables",
    title: "Core ITSM tables and the task hierarchy",
    tags: ["table", "itsm", "incident", "problem", "change", "task"],
    body: "Most ITSM records extend the base table `task`. Key tables: `incident` (unplanned interruptions), `problem` (root cause), `change_request` (planned changes), `sc_request`/`sc_req_item`/`sc_task` (Service Catalog), `cmdb_ci` (configuration items), `sys_user`/`sys_user_group` (people & groups). Because they extend `task`, they share fields like number, short_description, assignment_group, assigned_to, state, priority. Query a child table directly (e.g. `incident`) to get its specific fields.",
  },
  {
    id: "encoded-query",
    title: "Encoded queries (sysparm_query)",
    tags: ["query", "encoded", "filter", "table-api"],
    body: "ServiceNow filters are 'encoded queries'. Operators: `=` `!=` `>` `<`, `LIKE`/`STARTSWITH`/`ENDSWITH` for text, `IN` for lists. Chain with `^` (AND), `^OR` (OR), `^NQ` (new query). Examples: `active=true^priority=1` (P1 and active), `state=1^ORstate=2`, `assigned_toISEMPTY`, `short_descriptionLIKEvpn`. Dot-walk references: `assignment_group.name=Network`. Sort with `^ORDERBYpriority` / `^ORDERBYDESCsys_created_on`. Build them in a list filter then right-click the breadcrumb → 'Copy query'.",
  },
  {
    id: "table-api",
    title: "REST Table API basics",
    tags: ["rest", "api", "integration", "table-api"],
    body: "CRUD over any table: GET `/api/now/table/{table}` (list, with sysparm_query/sysparm_fields/sysparm_limit/sysparm_display_value), GET `/api/now/table/{table}/{sys_id}` (one record), POST `/api/now/table/{table}` (create, JSON body of field:value), PATCH `/api/now/table/{table}/{sys_id}` (update), DELETE same path. Auth: Basic or OAuth2. Use `sysparm_display_value=true` to get human labels instead of sys_ids/codes, `false` for raw values, `all` for both. Responses wrap rows in a `result` array/object.",
  },
  {
    id: "gliderecord",
    title: "GlideRecord (server-side scripting)",
    tags: ["script", "glide", "server", "business-rule"],
    body: "Server-side data access: `var gr = new GlideRecord('incident'); gr.addQuery('active', true); gr.addEncodedQuery('priority=1'); gr.orderByDesc('sys_created_on'); gr.setLimit(10); gr.query(); while (gr.next()) { gs.info(gr.getValue('number')); }`. Use getValue()/setValue() (not gr.field) to avoid reference/display quirks. Update with gr.update(); insert with gr.insert(); delete with gr.deleteRecord(). For aggregates use GlideAggregate. Prefer addEncodedQuery for complex filters.",
  },
  {
    id: "business-rule-vs-flow",
    title: "Business Rules vs Flow Designer",
    tags: ["automation", "business-rule", "flow", "scripting"],
    body: "Business Rules are server-side scripts that run on DB operations (before/after/async/display) on a table — powerful but code-heavy. Flow Designer is the modern low-code automation (triggers, actions, subflows) and is preferred for new automation, approvals and integrations. Rule of thumb: use Flow Designer first; drop to a Business Rule (or Script Include for reusable logic) only when you need fine-grained server logic Flow can't express. Client Scripts/UI Policies handle form-side behaviour in the browser.",
  },
  {
    id: "acl-security",
    title: "ACLs and the security model",
    tags: ["security", "acl", "roles", "permissions"],
    body: "Access Control Lists (ACLs) gate every record/field operation by operation (read/write/create/delete) + required role(s) + an optional condition + an optional script — ALL must pass. Roles (e.g. itil, admin) are granted via groups. Debug with the Security Debug ('Debug Security Rules') to see which ACL denied access. Field-level ACLs override table-level for that field. Never grant admin to integrations — create a dedicated integration user with the least roles needed.",
  },
  {
    id: "update-sets",
    title: "Update Sets and moving changes",
    tags: ["alm", "update-set", "deploy", "release"],
    body: "Configuration changes are captured in Update Sets (the ServiceNow analog of a transport). Set your current Update Set before making changes, then move it across instances (dev→test→prod) by marking it Complete and retrieving/previewing/committing it on the target. Data and some artifacts (e.g. certain Flow/CMDB data) are NOT captured by update sets — move those separately. For larger shops, use the official deployment pipeline / Source Control (Git) integration instead of manual update-set XML.",
  },
  {
    id: "pdi",
    title: "Personal Developer Instance (free)",
    tags: ["pdi", "free", "developer", "instance"],
    body: "A Personal Developer Instance (PDI) is a free, full ServiceNow instance from developer.servicenow.com (sign up, 'Request Instance'). It includes full REST/Table API access and admin, so it is ideal for building and testing integrations. It hibernates after ~10 days idle and can be reclaimed after longer inactivity — wake it from the developer portal. Use a PDI's URL/admin creds as SNOW_INSTANCE_URL/USER/PASSWORD to take this server's live tools out of offline mode.",
  },
];

export function searchKnowledge(query: string): KnowledgeEntry[] {
  const q = query.toLowerCase().trim();
  if (q.length === 0) return [...KNOWLEDGE];
  const terms = q.split(/\s+/);
  return KNOWLEDGE.filter((e) => {
    const hay = `${e.title} ${e.tags.join(" ")} ${e.body}`.toLowerCase();
    return terms.some((t) => hay.includes(t));
  });
}

export function getKnowledge(id: string): KnowledgeEntry | undefined {
  return KNOWLEDGE.find((e) => e.id === id);
}

export function listTopics(): Array<{ id: string; title: string }> {
  return KNOWLEDGE.map((e) => ({ id: e.id, title: e.title }));
}
