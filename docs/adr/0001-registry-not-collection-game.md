# 1. Ghost-dex is a passive Registry, not a collection game

Date: 2026-06-28
Status: Accepted

## Context

The V1 dating-sim prototype ("Ghost-dex") first framed the dex as a Pokédex-style
**collection game**: a completion stat bar ("เห็นแล้ว 47 / เดทสำเร็จ 0"), locked
mystery slots to unlock, a manual "save to dex" button, and a "นักล่าผีตัวจริง"
(true ghost-hunter) completion payoff.

Play-testing the concept, that framing fought the product's intent. geemong is a
parody **dating app** whose core gag is that dates never arrive. Turning ghosting
into a score to grind made the app read as a creature-collector wearing a dating
skin — it gamified heartbreak into a checklist and lost the melancholy that makes
the gag land.

## Decision

The dex is a **Registry** (ทะเบียน): a *passive, permanent* record of every Persona
the player matched with — a side feature of a dating app, not its goal.

- **No completion mechanics.** No "X / N", no percentage, no completion bar, no
  locked mystery roster, no "hunter" identity. You cannot 100% heartbreak.
- **Nothing is ever deleted** — not on ghosting, not on no-show, not even when the
  player unmatches (state `เลิกแมตช์`). The Registry is permanent.
- **Entries are automatic** — no manual "keep" action.
- **Progress is per-entry discovery, not completion** — a fresh terminal entry
  arrives obscured and is *revealed* once; an honest tally may be shown as a fact,
  never as a target.
- **Feedback lives in floating parody Achievements** fired on lifecycle *state
  transitions only* (matched, date unlocked, ghosted, no-showed, unmatched) — never
  on affection % milestones. These replace the completion payoff screen.
- **Division of labor:** the live **Matches** list holds active relationships (you
  chat from there); the Registry/Ghost-dex is the quiet archive (browse-only, never
  updates live inside the chat screen).

See the lifecycle states and term definitions in [`CONTEXT.md`](../../CONTEXT.md).

## Consequences

- The dex stops competing with the dating loop for "the point of the app"; the
  dating loop stays primary and the Registry is emotional texture.
- We forgo the retention pull of a visible completion meter. The bet is that the
  discovery moment + wry achievements provide enough delight without a grind, and
  better fit the brand's self-aware tone.
- A permanent, never-deleted Registry implies entries accumulate without bound and
  carry an explicit lifecycle `state`; the current `MatchRow` model
  (`mobile/src/types/db.ts`) has no `state`/`ended` field and would need one if this
  is built. Today this is prototype-only (`prototypes/dating-sim/`).
- "เดทสำเร็จ" (Dated) remains a permanently-empty aspirational slot — the gag is
  load-bearing, not a bug to fix later.
