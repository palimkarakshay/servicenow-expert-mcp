/**
 * BYO-credential ServiceNow session. Same honesty invariant as abap-enclave-mcp:
 * the live Table API tools touch an instance ONLY when credentials are present in
 * the environment; with none set, they return `{ mode: "offline" }` and make no
 * network call. The offline knowledge tools work regardless.
 *
 * Credentials are env-only, never logged, never returned. A buyer points this at
 * THEIR ServiceNow instance (e.g. a free Personal Developer Instance) by setting
 * these vars in their own environment.
 */
import { systemError } from "../errors.js";

export const ENV = {
  url: "SNOW_INSTANCE_URL",
  user: "SNOW_USER",
  password: "SNOW_PASSWORD",
} as const;

export const NO_CREDENTIALS = "no ServiceNow credentials configured";

export interface OfflineResult {
  mode: "offline";
  error: string;
  hint: string;
}

export function offlineResult(): OfflineResult {
  return {
    mode: "offline",
    error: NO_CREDENTIALS,
    hint: `Set ${ENV.url}, ${ENV.user} and ${ENV.password} in the environment to connect to a live ServiceNow instance.`,
  };
}

function env(name: string): string | undefined {
  const v = process.env[name];
  return v !== undefined && v.length > 0 ? v : undefined;
}

export function credentialsConfigured(): boolean {
  return Boolean(env(ENV.url) && env(ENV.user) && env(ENV.password));
}

function baseUrl(): string {
  return (env(ENV.url) ?? "").replace(/\/+$/, "");
}

export interface ConnectionStatus {
  mode: "live" | "offline";
  instanceConfigured: boolean;
  configured: Record<string, boolean>;
  note: string;
}

/** Report configured-ness WITHOUT any network call. */
export function connectionStatus(): ConnectionStatus {
  return {
    mode: credentialsConfigured() ? "live" : "offline",
    instanceConfigured: Boolean(env(ENV.url)),
    configured: {
      [ENV.url]: Boolean(env(ENV.url)),
      [ENV.user]: Boolean(env(ENV.user)),
      [ENV.password]: Boolean(env(ENV.password)),
    },
    note: "Credential values are never revealed. Without the instance URL/user/password the live tools return mode=offline and never contact an instance.",
  };
}

interface SnowFetchOptions {
  method?: string;
  body?: string;
}

/**
 * Call the ServiceNow REST API with basic auth. Throws systemError on non-2xx.
 * Performs no work unless credentials are configured (callers gate via live()).
 */
export async function snowFetch(path: string, options: SnowFetchOptions = {}): Promise<unknown> {
  const auth =
    "Basic " + Buffer.from(`${env(ENV.user) ?? ""}:${env(ENV.password) ?? ""}`).toString("base64");
  const init: { method: string; headers: Record<string, string>; body?: string } = {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: auth,
    },
  };
  if (options.body !== undefined) init.body = options.body;

  const res = await fetch(baseUrl() + path, init);
  const text = await res.text();
  let parsed: unknown = text;
  try {
    parsed = text.length > 0 ? JSON.parse(text) : undefined;
  } catch {
    // leave parsed as raw text
  }
  if (!res.ok) {
    throw systemError(`ServiceNow ${res.status} ${res.statusText}`, { body: parsed });
  }
  return parsed;
}

/** Build a Table API querystring from common params. */
export function tableQuery(params: {
  query?: string | undefined;
  fields?: string[] | undefined;
  limit?: number | undefined;
  displayValue?: boolean | undefined;
}): string {
  const sp = new URLSearchParams();
  if (params.query) sp.set("sysparm_query", params.query);
  if (params.fields && params.fields.length > 0) sp.set("sysparm_fields", params.fields.join(","));
  if (params.limit !== undefined) sp.set("sysparm_limit", String(params.limit));
  sp.set("sysparm_display_value", params.displayValue ? "true" : "false");
  const qs = sp.toString();
  return qs.length > 0 ? `?${qs}` : "";
}
