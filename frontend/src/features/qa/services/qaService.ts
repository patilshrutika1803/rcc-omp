import type { QAActivity } from "../types/qa";

// ─────────────────────────────────────────────────────────────────────────────
// DATA ACCESS LAYER (currently local state — swap for REST/AWS calls later)
// ─────────────────────────────────────────────────────────────────────────────
// These functions intentionally mirror the shape of a real API client so
// that connecting to an AWS backend (API Gateway + Lambda, Supabase/Postgres)
// later only requires replacing the function bodies below with real
// `fetch`/`axios` calls against REST endpoints, e.g.:
//   GET    /api/qa-activities
//   POST   /api/qa-activities
//   PATCH  /api/qa-activities/:id
//   DELETE /api/qa-activities/:id
//
// This module is intended to be the ONLY place that communicates with the
// backend (AWS / Supabase / S3) once that integration is wired up.

export async function apiFetchQAActivities(): Promise<QAActivity[]> {
  // TODO: Replace with real API call, e.g.
  // const res = await fetch("/api/qa-activities");
  // return res.json();
  return Promise.resolve([]);
}

export async function apiCreateQAActivity(
  payload: Omit<QAActivity, "id" | "createdAt" | "updatedAt">
): Promise<QAActivity> {
  // TODO: Replace with real API call, e.g.
  // const res = await fetch("/api/qa-activities", { method: "POST", body: JSON.stringify(payload) });
  // return res.json();
  const now = new Date().toISOString();
  return Promise.resolve({
    ...payload,
    id: `QMS-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  });
}

export async function apiUpdateQAActivity(updated: QAActivity): Promise<QAActivity> {
  // TODO: Replace with real API call, e.g.
  // const res = await fetch(`/api/qa-activities/${updated.id}`, { method: "PATCH", body: JSON.stringify(updated) });
  // return res.json();
  return Promise.resolve({ ...updated, updatedAt: new Date().toISOString() });
}

export async function apiDeleteQAActivity(id: string): Promise<void> {
  // TODO: Replace with real API call, e.g.
  // await fetch(`/api/qa-activities/${id}`, { method: "DELETE" });
  return Promise.resolve();
}
