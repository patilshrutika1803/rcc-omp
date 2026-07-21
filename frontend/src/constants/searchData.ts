// ─────────────────────────────────────────────────────────────────────────────
// Global search dataset
// All entries are populated at runtime from live service data.
// No hardcoded/mock records here.
// ─────────────────────────────────────────────────────────────────────────────

// Search overlay runs synchronously; entries are populated by the
// GlobalSearch hook once backend data is available.
export const SEARCH_ITEMS: {
  type: string;
  label: string;
  sub: string;
  status: string;
  pmId?: string;
}[] = [];

export const RECENT_SEARCHES: string[] = [];
