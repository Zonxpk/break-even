import { assertEquals } from "jsr:@std/assert@1";
import { validateTiein } from "./validate.ts";

Deno.test("accepts a complete request", () => {
  const r = validateTiein({
    company: "ACME จำกัด",
    contact: "line: @acme",
    merch_desc: "หมวกไรเดอร์ limited 100 ใบ",
    budget_range: "50k-100k",
  });
  assertEquals(r.ok, true);
});

Deno.test("rejects missing fields", () => {
  const r = validateTiein({ company: "ACME" });
  assertEquals(r.ok, false);
});

Deno.test("rejects blank strings", () => {
  const r = validateTiein({
    company: "  ", contact: "x", merch_desc: "x", budget_range: "x",
  });
  assertEquals(r.ok, false);
});

Deno.test("rejects oversized fields", () => {
  const r = validateTiein({
    company: "a".repeat(201), contact: "x", merch_desc: "x", budget_range: "x",
  });
  assertEquals(r.ok, false);
});

Deno.test("rejects non-object bodies", () => {
  assertEquals(validateTiein(null).ok, false);
  assertEquals(validateTiein("hi").ok, false);
});
