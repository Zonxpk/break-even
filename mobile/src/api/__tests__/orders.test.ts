import { buildFailContext, failOrder, placeOrder } from '../orders';

jest.mock('../../lib/supabase', () => ({
  supabase: { rpc: jest.fn(), from: jest.fn() },
}));

import { supabase } from '../../lib/supabase';

const mockRpc = supabase.rpc as jest.Mock;
const mockFrom = supabase.from as jest.Mock;

beforeEach(() => {
  mockRpc.mockReset();
  mockFrom.mockClear();
});

test('fail context carries service, finale kind, and nth_fail', () => {
  const ctx = buildFailContext({ service: 'food', finaleKind: 'canal', priorFailCount: 4 });
  expect(ctx).toEqual({ service: 'food', finale_type: 'canal', nth_fail: 5 });
});
test('nth_fail counts THIS failure (prior + 1)', () => {
  expect(buildFailContext({ service: 'mart', finaleKind: 'lost', priorFailCount: 0 }).nth_fail).toBe(1);
});

test('placeOrder uses trusted create_order RPC without direct table writes', async () => {
  const order = { id: 'o1', service: 'food', status: 'tracking' };
  mockRpc.mockResolvedValueOnce({ data: order, error: null });

  await expect(placeOrder({ service: 'food', items: [] })).resolves.toBe(order);
  expect(mockRpc).toHaveBeenCalledWith('create_order', { p_service: 'food', p_items: [] });
  expect(mockFrom).not.toHaveBeenCalled();
});

test('failOrder uses trusted complete_order_failure RPC without direct table writes', async () => {
  const voucher = { id: 'v1' };
  mockRpc.mockResolvedValueOnce({ data: { voucher, rate_limited: false }, error: null });

  await expect(failOrder({ id: 'o1', status: 'tracking' })).resolves.toEqual({ voucher, rateLimited: false });
  expect(mockRpc).toHaveBeenCalledWith('complete_order_failure', { p_order_id: 'o1' });
  expect(mockFrom).not.toHaveBeenCalled();
});
