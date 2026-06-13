import type { EngineState, GagScript, SabotageAction, TimelineEvent } from './types';

interface EngineInput {
  script: GagScript;
  elapsedS: number;
  sabotageLog: SabotageAction[];
}

export function engineStateAt({ script, elapsedS, sabotageLog }: EngineInput): EngineState {
  const state: EngineState = {
    phase: 'tracking',
    etaMinutes: 0,
    chat: [],
    currentMove: 'route_to_user',
    incident: null,
    activeSabotage: null,
    finale: null,
    progress: Math.min(elapsedS / script.duration_s, 1),
  };

  const sabotageDefs = new Map(
    script.events
      .filter((e): e is Extract<TimelineEvent, { type: 'sabotage' }> => e.type === 'sabotage')
      .map((e) => [e.action, e]),
  );

  type Step =
    | { atS: number; kind: 'event'; event: TimelineEvent }
    | { atS: number; kind: 'backfire'; action: string };

  const steps: Step[] = [
    ...script.events.filter((e) => e.t <= elapsedS).map((e) => ({ atS: e.t, kind: 'event' as const, event: e })),
    ...sabotageLog.filter((s) => s.atS <= elapsedS).map((s) => ({ atS: s.atS, kind: 'backfire' as const, action: s.action })),
  ].sort((a, b) => a.atS - b.atS);

  for (const step of steps) {
    if (state.phase === 'failed') break;
    if (step.kind === 'event') {
      const ev = step.event;
      switch (ev.type) {
        case 'eta':
          state.etaMinutes = ev.minutes;
          break;
        case 'move':
          state.currentMove = ev.mode;
          break;
        case 'chat':
          state.chat.push({ text: ev.text, atS: ev.t });
          break;
        case 'incident':
          state.incident = { kind: ev.kind, anchor: ev.anchor };
          if (ev.eta_minutes != null) state.etaMinutes = ev.eta_minutes;
          break;
        case 'sabotage':
          state.activeSabotage = { action: ev.action, label: ev.label };
          break;
        case 'finale':
          state.finale = { kind: ev.kind, anchor: ev.anchor, statusText: ev.status_text };
          state.phase = 'failed';
          state.activeSabotage = null;
          break;
      }
    } else {
      const def = sabotageDefs.get(step.action);
      if (!def) continue;
      if (def.backfire.chat) state.chat.push({ text: def.backfire.chat, atS: step.atS });
      if (def.backfire.move) state.currentMove = def.backfire.move;
      if (def.backfire.eta_minutes != null) state.etaMinutes = def.backfire.eta_minutes;
      if (state.activeSabotage?.action === step.action) state.activeSabotage = null;
    }
  }

  return state;
}
