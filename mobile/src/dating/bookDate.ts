import { placeOrder } from '../api/orders';
import type { GagAnchor } from '../types/db';

export async function placeDateOrder(opts: {
  matchId: string;
  personaId: string;
  personaName: string;
  spot: GagAnchor;
}) {
  return placeOrder({
    service: 'date',
    items: [{
      match_id: opts.matchId,
      persona_id: opts.personaId,
      persona_name: opts.personaName,
      spot: opts.spot.name,
    }],
  });
}
