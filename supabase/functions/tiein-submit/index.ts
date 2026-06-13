import { createClient } from "npm:@supabase/supabase-js@2";
import { validateTiein } from "./validate.ts";

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const v = validateTiein(body);
  if (!v.ok) return json({ error: v.error }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { error } = await supabase.from("tiein_requests").insert(v.data);
  if (error) return json({ error: "storage failed" }, 500);

  // Discord ping is best-effort: a dead webhook must not lose the lead
  // (the row is already stored).
  const hook = Deno.env.get("DISCORD_WEBHOOK_URL");
  if (hook) {
    await fetch(hook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        content:
          `🤝 **คำขอ tie-in ใหม่**\n` +
          `บริษัท: ${v.data.company}\n` +
          `งบ: ${v.data.budget_range}\n` +
          `สินค้า: ${v.data.merch_desc}\n` +
          `ติดต่อ: ${v.data.contact}`,
      }),
    }).catch(() => {});
  }

  return json({ ok: true }, 201);
});
