"use client";

import { Audit } from "./types";

const KEY = "designcheck.audits.v1";
const PLAN_KEY = "designcheck.plan.v1";

export function getAudits(): Audit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Audit[]) : [];
  } catch {
    return [];
  }
}

export function saveAudit(audit: Audit) {
  const audits = getAudits();
  audits.unshift(audit);
  // keep max 50, and drop bulky screenshots from older entries
  const trimmed = audits.slice(0, 50).map((a, i) =>
    i > 4 ? { ...a, screenshotDataUrl: undefined } : a
  );
  try {
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // storage full — retry without any screenshots
    try {
      window.localStorage.setItem(
        KEY,
        JSON.stringify(trimmed.map((a) => ({ ...a, screenshotDataUrl: undefined })))
      );
    } catch {
      /* give up silently */
    }
  }
}

export function getAudit(id: string): Audit | undefined {
  return getAudits().find((a) => a.id === id);
}

export function deleteAudit(id: string) {
  const audits = getAudits().filter((a) => a.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(audits));
}

export type Plan = "free" | "pro" | "agency";

export function getPlan(): Plan {
  if (typeof window === "undefined") return "free";
  return (window.localStorage.getItem(PLAN_KEY) as Plan) || "free";
}

export function setPlan(plan: Plan) {
  window.localStorage.setItem(PLAN_KEY, plan);
}
