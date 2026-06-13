import { claimMerchItem, ShopError } from '../shop';

jest.mock('../../lib/supabase', () => ({
  supabase: { rpc: jest.fn() },
}));

import { supabase } from '../../lib/supabase';

describe('claimMerchItem', () => {
  const rpc = supabase.rpc as jest.Mock;

  beforeEach(() => rpc.mockReset());

  test('maps INSUFFICIENT_VOUCHERS', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'INSUFFICIENT_VOUCHERS' } });
    await expect(claimMerchItem('x')).rejects.toBeInstanceOf(ShopError);
    await expect(claimMerchItem('x')).rejects.toMatchObject({ code: 'INSUFFICIENT_VOUCHERS' });
  });

  test('returns claim on success', async () => {
    const claim = { id: 'c1', redemption_code: 'WHEN-ABC' };
    rpc.mockResolvedValue({ data: claim, error: null });
    await expect(claimMerchItem('item')).resolves.toEqual(claim);
  });
});
