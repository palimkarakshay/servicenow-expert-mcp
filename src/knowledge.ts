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
  {
    id: "cmdb-ci",
    title: "CMDB and Configuration Items",
    tags: ["cmdb", "ci", "asset", "table", "infrastructure"],
    body: "The CMDB stores Configuration Items in tables extending `cmdb_ci` (e.g. `cmdb_ci_server`, `cmdb_ci_service`, `cmdb_ci_appl`, `cmdb_ci_database`). Relationships live in `cmdb_rel_ci` (parent / child / type). CIs link to work via fields like `cmdb_ci` on incident/change. Query a specific class table for its attributes or `cmdb_ci` for common fields (name, sys_class_name, operational_status). For imports use the Identification & Reconciliation Engine (IRE) so you upsert by identifier rules instead of creating duplicate CIs.",
  },
  {
    id: "users-groups-roles",
    title: "Users, groups and roles",
    tags: ["user", "group", "role", "itil", "assignment", "security"],
    body: "People are `sys_user`; teams are `sys_user_group`; membership is `sys_user_grmember`. Roles (`sys_user_role`, e.g. `itil`, `admin`, `catalog`) are granted to GROUPS (`sys_group_has_role`) and inherited by members — grant via groups, not directly, for maintainability. Work routes by `assignment_group` + `assigned_to`. `sys_user.user_name` is the login; `sys_id` is the stable key. `itil` is the standard fulfiller role; `admin` is all-powerful — never give it to an integration user.",
  },
  {
    id: "states-choices",
    title: "States, choices and the priority matrix",
    tags: ["state", "choice", "priority", "impact", "urgency", "field"],
    body: "`state` is an integer choice. Incident states are typically 1 New, 2 In Progress, 3 On Hold, 6 Resolved, 7 Closed, 8 Canceled (config-dependent; On Hold needs a hold_reason). Priority is DERIVED from Impact × Urgency via a Priority data-lookup (1 Critical … 5 Planning). Choice fields store a value (often a code/number) but display a label — always query and set by VALUE (`state=6`), never the label. Inspect allowed values in `sys_choice` or the field's dictionary entry.",
  },
  {
    id: "encoded-query-advanced",
    title: "Encoded queries — advanced operators",
    tags: ["query", "encoded", "filter", "date", "groupby"],
    body: "Beyond the basics: `fieldISEMPTY` / `fieldISNOTEMPTY`, `fieldIN a,b,c` / `fieldNOT INa,b`, `CONTAINS` / `DOES NOT CONTAIN`, `field BETWEEN x@y`. Dynamic values: `priorityINjavascript:gs.getProperty('x')`, `assigned_to=javascript:gs.getUserID()`. Relative dates: `sys_created_onONLast 7 days@javascript:...` (build these in the UI — hand-writing them is error-prone). Group with `GROUPBYfield`; sort with `^ORDERBYpriority^ORDERBYDESCsys_created_on`. Best practice: construct the filter in a list, then right-click the breadcrumb → Copy query.",
  },
  {
    id: "table-api-advanced",
    title: "Table API — performance and shaping",
    tags: ["rest", "api", "performance", "pagination", "integration"],
    body: "For fast, lean integrations always pass: `sysparm_fields=number,short_description` (return only needed columns), `sysparm_limit` + `sysparm_offset` for pagination (follow the `Link` response header for next/prev pages), `sysparm_exclude_reference_link=true` (drop reference link objects), and `sysparm_display_value=true|false|all`. Never fetch a full table to count — use the Aggregate API. `sysparm_view` applies a form view's field set. Filter on indexed fields in `sysparm_query` rather than post-filtering in your code.",
  },
  {
    id: "aggregate-api",
    title: "Counting and aggregating (Aggregate API / GlideAggregate)",
    tags: ["aggregate", "count", "sum", "glide", "performance"],
    body: "Counts/sums/grouping WITHOUT pulling rows. REST: `GET /api/now/stats/{table}?sysparm_count=true&sysparm_group_by=priority` (or sysparm_avg/sysparm_sum/sysparm_min/max). Server-side: `var ga = new GlideAggregate('incident'); ga.addQuery('active', true); ga.addAggregate('COUNT'); ga.groupBy('priority'); ga.query(); while (ga.next()) { gs.info(ga.getValue('priority') + ': ' + ga.getAggregate('COUNT')); }`. The DB does the count — never loop a GlideRecord just to tally rows.",
  },
  {
    id: "import-sets",
    title: "Import Sets and Transform Maps",
    tags: ["import", "transform", "etl", "integration", "data-load"],
    body: "Recurring/external data should land in a staging Import Set table via the Import Set API (`POST /api/now/import/{staging_table}`), scheduled import, or JDBC, THEN a Transform Map maps staging columns → a target table. Define coalesce field(s) so it inserts-or-updates (idempotent upserts), plus field maps and optional onBefore/onAfter transform scripts. This gives you error handling and re-runnability — far safer than an integration writing straight to production tables.",
  },
  {
    id: "business-rules-deep",
    title: "Business Rules — when/order, current/previous, abort",
    tags: ["business-rule", "server", "script", "automation"],
    body: "Runs server-side on a table DB op. `when`: BEFORE (change the same record pre-save — set fields on `current`, no .update() needed), AFTER (act on related records post-save), ASYNC (heavy/non-blocking work via the scheduler — CANNOT change `current`), DISPLAY (set `g_scratchpad` for client scripts). Order (lower first) sequences rules. Use `current`/`previous` and `current.operation()`; abort with `current.setAbortAction(true)` in a before rule. Keep rules thin + tightly Conditioned, and push real logic into Script Includes.",
  },
  {
    id: "script-include",
    title: "Script Includes (reusable server logic)",
    tags: ["script-include", "server", "reuse", "glideajax", "class"],
    body: "Reusable server-side code. Styles: a plain function, or a class via `Class.create()`. Make it client-callable by extending `AbstractAjaxProcessor` (then call it from a Client Script via GlideAjax). Example: `var IncidentUtils = Class.create(); IncidentUtils.prototype = { getOpenCount: function(group){ var ga = new GlideAggregate('incident'); ga.addQuery('assignment_group', group); ga.addQuery('active', true); ga.addAggregate('COUNT'); ga.query(); return ga.next() ? ga.getAggregate('COUNT') : 0; }, type: 'IncidentUtils' };`. Prefer one Script Include over the same logic copied into many Business Rules.",
  },
  {
    id: "client-scripts",
    title: "Client Scripts and UI Policies (form-side)",
    tags: ["client-script", "ui-policy", "g_form", "browser", "form"],
    body: "Browser-side behaviour: Client Scripts fire onLoad, onChange(control, oldValue, newValue, isLoading), onSubmit (`return false` to block save), onCellEdit (list inline). Use the `g_form` API: setValue/getValue, setMandatory, setVisible, setReadOnly, addErrorMessage, hideRelatedList. Do NOT run synchronous server queries from the client (no GlideRecord client-side) — use GlideAjax (async) or `g_scratchpad`. UI Policies are the no-code way to make fields mandatory/visible/read-only by condition — prefer them over scripts when possible.",
  },
  {
    id: "glideajax",
    title: "GlideAjax (client → server, async)",
    tags: ["glideajax", "client-script", "script-include", "async"],
    body: "Call server logic from a Client Script. Server: a 'Client callable' Script Include extending AbstractAjaxProcessor, method reads `this.getParameter('sysparm_x')` and returns a string. Client: `var ga = new GlideAjax('IncidentUtils'); ga.addParam('sysparm_name', 'getOpenCount'); ga.addParam('sysparm_group', g_form.getValue('assignment_group')); ga.getXMLAnswer(function(answer){ g_form.addInfoMessage('Open: ' + answer); });`. ALWAYS async (getXMLAnswer/getXML) — never the deprecated synchronous getXMLWait, which freezes the browser.",
  },
  {
    id: "glide-apis",
    title: "Key server Glide APIs (gs, GlideDateTime, dot-walk)",
    tags: ["glide", "gs", "date", "reference", "server"],
    body: "Beyond GlideRecord: `gs` (GlideSystem) — gs.info/warn/error (logs), gs.getUser()/getUserID(), gs.nowDateTime(), gs.eventQueue(), gs.addInfoMessage(), gs.getProperty(). `GlideDateTime`/`GlideDate` for date math (gdt.addDaysUTC(n), getNumericValue(), subtract()). On a GlideRecord: `gr.getValue('f')` (raw) vs `gr.getDisplayValue('f')` (label); `gr.field.getRefRecord()` dereferences a reference to its GlideRecord; dot-walk reads references (`gr.caller_id.email`). Use getValue/setValue to avoid implicit type/reference coercion bugs.",
  },
  {
    id: "flow-designer",
    title: "Flow Designer (modern low-code automation)",
    tags: ["flow", "automation", "subflow", "integrationhub", "approval"],
    body: "Trigger (record created/updated, scheduled, inbound REST/email) → Actions and Subflows (reusable), with Decision / For-each logic. Prefer it for approvals, notifications, integrations and orchestration: it's versioned, testable and observable (Flow execution details) — unlike scattered Business Rules. IntegrationHub spokes give pre-built actions for external systems. Drop to a Script Include only for logic Flow can't express, then call it from a Flow 'Script' action.",
  },
  {
    id: "service-catalog",
    title: "Service Catalog (items, RITMs, record producers)",
    tags: ["catalog", "request", "ritm", "sc_task", "variable"],
    body: "Self-service requests. A Catalog Item (`sc_cat_item`) has Variables (the form fields) + a fulfillment (flow/workflow). Submitting creates a Request (`sc_request`) → one Requested Item (`sc_req_item`, 'RITM') per item → Catalog Tasks (`sc_task`) for fulfillers. A Record Producer is a catalog form that creates a record on ANY table (e.g. an incident) instead of a RITM. Read variables in scripts via `current.variables.<name>`.",
  },
  {
    id: "notifications-events",
    title: "Notifications and events",
    tags: ["notification", "email", "event", "eventqueue", "async"],
    body: "Email Notifications (`sysevent_email_action`) send on a record condition or on a custom Event. Register events in `sysevent_register` and fire them from script: `gs.eventQueue('incident.escalated', current, gs.getUserID(), '');`. The event is processed asynchronously by the scheduler and can drive a notification or a Script Action. Use events to decouple 'something happened' from 'what to do', and to keep slow work out of an inline Business Rule.",
  },
  {
    id: "scheduled-jobs",
    title: "Scheduled jobs and background work",
    tags: ["scheduled", "job", "cron", "background", "scheduler"],
    body: "Recurring server work runs as a Scheduled Script Execution (`sysauto_script`): a schedule (daily/weekly/periodic) + a script that usually just calls a Script Include. Also scheduled: Reports, Data Imports, SLA/flow timers. Keep heavy/batch processing here — off the user request path — and guard against overlapping long runs. The same scheduler also processes async Business Rules and queued events. For ad-hoc server JS, use Scripts - Background.",
  },
  {
    id: "rest-integration",
    title: "Outbound and inbound REST integration",
    tags: ["rest", "integration", "oauth", "restmessage", "scripted-rest"],
    body: "Outbound: a REST Message (`sys_rest_message`) defines endpoint + methods; call it in script: `var r = new sn_ws.RESTMessageV2('MyMsg', 'get'); r.setStringParameterNoEscape('id', x); var resp = r.execute(); resp.getStatusCode(); resp.getBody();`. Store secrets in Connection & Credential aliases, never in script. Auth: Basic, OAuth2 (`oauth_entity`), or mutual-TLS. Inbound: expose a Scripted REST API (`sys_ws_definition`) or use the Table API directly. Always run integrations as a dedicated least-privilege integration user.",
  },
  {
    id: "scoped-apps",
    title: "Scoped applications vs Global",
    tags: ["scope", "application", "studio", "app-engine", "sys_scope"],
    body: "Build custom work in a scoped application (`sys_scope`, prefix `x_yourco_app`) via App Engine Studio / Studio — not in Global. Scopes sandbox tables (prefixed `x_...`), enforce cross-scope access rules, and package cleanly for pipelines/Store. Your current application + current Update Set determine where changes are captured. Global is for platform-wide config; new apps should be scoped for isolation and portability.",
  },
  {
    id: "performance-best-practices",
    title: "Performance best practices",
    tags: ["performance", "best-practice", "index", "query", "scale"],
    body: "Query only what you need: select specific fields, always setLimit()/paginate, and filter on INDEXED columns in the query — not in a JS loop. Use GlideAggregate for counts/sums (never iterate to tally). Avoid nested GlideRecord queries (the N+1 trap) — use a single dot-walked/encoded query instead. Move heavy work to async Business Rules / Scheduled Jobs. Watch the Slow Query log and add DB indexes for frequently-filtered columns. Avoid dot-walking in addQuery on very large tables when an indexed local field would do.",
  },
  {
    id: "debugging-troubleshooting",
    title: "Debugging and troubleshooting",
    tags: ["debug", "troubleshoot", "log", "acl", "background-script"],
    body: "Tools: Scripts - Background (run server JS ad hoc — ideal for testing GlideRecord); the Script Debugger (breakpoints); `gs.info()`/`gs.debug()` → System Logs > All (`syslog`); Session Debug (JavaScript, SQL, Business Rules, Security) from the gear menu; 'Debug Security Rules' to see which ACL denied access; Transaction + Slow Query logs for performance. Frequent gotchas: querying the parent `task` table instead of the child; dot-walking through an empty reference (null); an async Business Rule trying to modify `current` (it can't); an Update Set capturing config but NOT data.",
  },
  {
    id: "onboarding-learning-path",
    title: "Getting started / learning path",
    tags: ["onboarding", "learning", "developer", "pdi", "training"],
    body: "Start at developer.servicenow.com: create a free Personal Developer Instance (PDI), then follow Now Learning + the Developer 'Build' guided paths. A concept order that works: tables & the dictionary → lists, filters & encoded queries → forms, UI Policies & Client Scripts → Business Rules & Script Includes (GlideRecord) → Flow Designer → ACLs/security → Update Sets & scoped apps → integrations (Table/REST API). Build in Studio/App Engine, test REST in the API explorer, and keep your work in a scoped app.",
  },
  {
    id: "glossary",
    title: "Platform glossary (quick terms)",
    tags: ["glossary", "terms", "sys_id", "dictionary", "reference"],
    body: "sys_id — 32-char unique key on every record. Dictionary — the table/field definitions (`sys_dictionary`). Choice list — allowed values for a field (`sys_choice`); value vs label. Reference field — points to a record in another table (stores its sys_id). Dot-walk — traverse a reference (`caller_id.email`). Scope — an application boundary (`x_...`). ACL — access control rule. Update Set — a bundle of config changes moved between instances. RITM / sc_task — Requested Item / Catalog Task. CMDB — the database of Configuration Items.",
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
