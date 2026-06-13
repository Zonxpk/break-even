import {
  cartLineTotal,
  cartSubtotal,
  validateModifierSelection,
  buildFoodOrderPayload,
  type CartLineInput,
  type ModifierGroupInput,
} from '../cartMath';

const line: CartLineInput = {
  lineId: '1',
  menuItemId: 'm1',
  restaurantId: 'r1',
  restaurantName: 'ครัวป้าแมว',
  name: 'กะเพรา',
  unitPrice: 65,
  quantity: 2,
  modifiers: [{ groupId: 'g1', groupName: 'ระดับความเผ็ด', optionId: 'o1', optionName: 'เผ็ดน้อย', priceDelta: 0 }],
  notes: 'ไม่ใส่ผักชี',
};

test('cartLineTotal includes modifiers and quantity', () => {
  expect(cartLineTotal(line)).toBe(130);
});

test('cartSubtotal sums lines', () => {
  expect(cartSubtotal([line])).toBe(130);
});

test('validateModifierSelection rejects under min', () => {
  const groups: ModifierGroupInput[] = [{ id: 'g1', min_select: 1, max_select: 1, options: [{ id: 'o1' }] }];
  expect(validateModifierSelection({}, groups).ok).toBe(false);
});

test('validateModifierSelection accepts valid radio', () => {
  const groups: ModifierGroupInput[] = [{ id: 'g1', min_select: 1, max_select: 1, options: [{ id: 'o1' }, { id: 'o2' }] }];
  expect(validateModifierSelection({ g1: ['o1'] }, groups).ok).toBe(true);
});

test('validateModifierSelection rejects over max', () => {
  const groups: ModifierGroupInput[] = [{ id: 'g1', min_select: 0, max_select: 1, options: [{ id: 'o1' }, { id: 'o2' }] }];
  expect(validateModifierSelection({ g1: ['o1', 'o2'] }, groups).ok).toBe(false);
});

test('buildFoodOrderPayload shape', () => {
  const payload = buildFoodOrderPayload([line]);
  expect(payload[0]).toMatchObject({
    restaurant_id: 'r1',
    menu_item_id: 'm1',
    quantity: 2,
    modifiers: [{ group: 'ระดับความเผ็ด', option: 'เผ็ดน้อย' }],
    notes: 'ไม่ใส่ผักชี',
    line_total: 130,
  });
});
