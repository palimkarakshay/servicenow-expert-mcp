import { afterEach, describe, expect, it } from "vitest";

import { listTopics, searchKnowledge } from "../knowledge.js";
import { buildServer } from "../server.js";
import {
  ALL_TOOLS,
  snowConnectionStatus,
  snowQueryTable,
  snowReference,
  snowUpdateRecord,
} from "../snow.tools.js";
import { connectionStatus, credentialsConfigured, ENV } from "../snow/session.js";

function clearEnv(): void {
  for (const k of [ENV.url, ENV.user, ENV.password]) delete process.env[k];
}
afterEach(clearEnv);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function body(result: any): any {
  return JSON.parse(result.content[0].text);
}

describe("honesty invariant", () => {
  it("is offline with no credentials", () => {
    clearEnv();
    expect(credentialsConfigured()).toBe(false);
    expect(connectionStatus().mode).toBe("offline");
  });

  it("reports live without leaking the secret when creds are set", () => {
    clearEnv();
    process.env[ENV.url] = "https://dev12345.service-now.com";
    process.env[ENV.user] = "admin";
    process.env[ENV.password] = "p@ss-secret";
    const s = connectionStatus();
    expect(s.mode).toBe("live");
    expect(JSON.stringify(s)).not.toContain("p@ss-secret");
  });
});

describe("offline knowledge always works", () => {
  it("search returns entries and topics are listed", () => {
    expect(listTopics().length).toBeGreaterThan(5);
    expect(searchKnowledge("priority filter incidents").length).toBeGreaterThan(0);
  });

  it("snow_reference returns a topic with no instance configured", () => {
    clearEnv();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = (snowReference.handler as any)({ topic: "encoded-query" });
    expect(body(r).id).toBe("encoded-query");
  });
});

describe("tool registry", () => {
  it("exposes 8 snow_ tools with unique snake_case names", () => {
    expect(ALL_TOOLS).toHaveLength(8);
    const names = ALL_TOOLS.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
    for (const n of names) expect(n).toMatch(/^snow_[a-z_]+$/);
  });

  it("every tool description carries an Example and is annotated", () => {
    for (const t of ALL_TOOLS) {
      expect(t.description).toContain("Example:");
      expect(t.annotations).toBeDefined();
    }
  });

  it("builds a server without throwing", () => {
    expect(() => buildServer()).not.toThrow();
  });
});

describe("offline short-circuit (no creds => no network)", () => {
  it("connection_status reports offline", async () => {
    clearEnv();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = await (snowConnectionStatus.handler as any)({});
    expect(body(r).mode).toBe("offline");
  });

  it("live tools return the exact offline payload", async () => {
    clearEnv();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = await (snowQueryTable.handler as any)({ table: "incident", limit: 5, displayValue: true });
    expect(body(q).mode).toBe("offline");
    expect(body(q).error).toBe("no ServiceNow credentials configured");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const u = await (snowUpdateRecord.handler as any)({ table: "incident", sys_id: "x", fields: { state: "6" } });
    expect(body(u).mode).toBe("offline");
  });
});
