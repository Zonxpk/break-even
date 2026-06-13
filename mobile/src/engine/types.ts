export type MoveMode = 'route_to_user' | 'wrong_turn' | 'wrong_direction';

export type TimelineEvent =
  | { t: number; type: 'eta'; minutes: number }
  | { t: number; type: 'move'; mode: MoveMode }
  | { t: number; type: 'chat'; text: string }
  | { t: number; type: 'incident'; kind: string; anchor?: string; eta_minutes?: number }
  | {
      t: number;
      type: 'sabotage';
      action: string;
      label: string;
      backfire: { chat?: string; move?: MoveMode; eta_minutes?: number };
    }
  | { t: number; type: 'finale'; kind: string; anchor?: string; status_text: string };

export interface GagScript {
  duration_s: number;
  events: TimelineEvent[];
}

export interface SabotageAction {
  action: string;
  atS: number;
}

export interface ChatMessage {
  text: string;
  atS: number;
}

export interface EngineState {
  phase: 'tracking' | 'failed';
  etaMinutes: number;
  chat: ChatMessage[];
  currentMove: MoveMode;
  incident: { kind: string; anchor?: string } | null;
  activeSabotage: { action: string; label: string } | null;
  finale: { kind: string; anchor?: string; statusText: string } | null;
  progress: number;
}
