export interface TieinRequest {
  company: string;
  contact: string;
  merch_desc: string;
  budget_range: string;
}

type Result =
  | { ok: true; data: TieinRequest }
  | { ok: false; error: string };

const FIELDS = ["company", "contact", "merch_desc", "budget_range"] as const;
const MAX_LEN: Record<(typeof FIELDS)[number], number> = {
  company: 200,
  contact: 200,
  merch_desc: 2000,
  budget_range: 100,
};

export function validateTiein(body: unknown): Result {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "invalid body" };
  }
  const b = body as Record<string, unknown>;
  const data = {} as TieinRequest;
  for (const f of FIELDS) {
    const v = b[f];
    if (typeof v !== "string" || v.trim().length === 0) {
      return { ok: false, error: `${f} is required` };
    }
    if (v.length > MAX_LEN[f]) {
      return { ok: false, error: `${f} too long` };
    }
    data[f] = v.trim();
  }
  return { ok: true, data };
}
