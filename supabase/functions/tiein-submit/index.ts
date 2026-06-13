import { createClient } from "npm:@supabase/supabase-js@2";
import { validateTiein } from "./validate.ts";

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Fix 4: hoist createClient to module scope — pure service-role client
// carries no per-request state.
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  // Fix 2: verify_jwt guarantees a valid signature; require a signed-in user,
  // not the bare anon key that ships inside the app binary (cheap spam
  // control, and submissions become attributable). RN-only caller, no CORS
  // by design.
  const token = req.headers.get("authorization")?.replace(/^Bearer /i, "") ?? "";
  let role = "";
  try {
    role = JSON.parse(atob(token.split(".")[1])).role ?? "";
  } catch {
    return json({ error: "unauthorized" }, 401);
  }
  if (role !== "authenticated") return json({ error: "sign in required" }, 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const v = validateTiein(body);
  if (!v.ok) return json({ error: v.error }, 400);

  const { error } = await supabase.from("tiein_requests").insert(v.data);
  if (error) {
    // Fix 3: log insert failures for observability.
    console.error("tiein insert failed:", error.message);
    return json({ error: "storage failed" }, 500);
  }

  // Discord ping is best-effort: a dead webhook must not lose the lead
  // (the row is already stored).
  const hook = Deno.env.get("DISCORD_WEBHOOK_URL");
  if (hook) {
    // Fix 3: log Discord webhook failures instead of silently swallowing them.
    await fetch(hook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        // Fix 1: disable all mention parsing so content can never trigger
        // @everyone / @here / role pings.
        allowed_mentions: { parse: [] },
        content:
          `🤝 **คำขอ tie-in ใหม่**\n` +
          `บริษัท: ${v.data.company}\n` +
          `งบ: ${v.data.budget_range}\n` +
          `สินค้า: ${v.data.merch_desc}\n` +
          `ติดต่อ: ${v.data.contact}`,
      }),
    })
      .then((res) => {
        if (!res.ok) console.error("discord webhook failed:", res.status);
      })
      .catch((e) => console.error("discord webhook error:", e?.message ?? e));
  }

  return json({ ok: true }, 201);
});
