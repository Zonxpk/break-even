export interface CartLineInput {
  lineId: string;
  menuItemId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  unitPrice: number;
  quantity: number;
  modifiers: Array<{
    groupId: string;
    groupName: string;
    optionId: string;
    optionName: string;
    priceDelta: number;
  }>;
  notes: string | null;
}

export interface ModifierGroupInput {
  id: string;
  min_select: number;
  max_select: number;
  options: Array<{ id: string }>;
}

export function cartLineTotal(line: CartLineInput): number {
  const modifierSum = line.modifiers.reduce((s, m) => s + m.priceDelta, 0);
  return (line.unitPrice + modifierSum) * line.quantity;
}

export function cartSubtotal(lines: CartLineInput[]): number {
  return lines.reduce((s, l) => s + cartLineTotal(l), 0);
}

export function validateModifierSelection(
  selected: Record<string, string[]>,
  groups: ModifierGroupInput[],
): { ok: boolean; message?: string } {
  for (const g of groups) {
    const picks = selected[g.id] ?? [];
    if (picks.length < g.min_select) {
      return { ok: false, message: `เลือก${g.min_select}ตัวเลือกในกลุ่ม` };
    }
    if (picks.length > g.max_select) {
      return { ok: false, message: `เลือกได้ไม่เกิน${g.max_select}ตัวเลือก` };
    }
    const validIds = new Set(g.options.map((o) => o.id));
    if (picks.some((id) => !validIds.has(id))) {
      return { ok: false, message: 'ตัวเลือกไม่ถูกต้อง' };
    }
  }
  return { ok: true };
}

export function buildFoodOrderPayload(lines: CartLineInput[]) {
  return lines.map((l) => ({
    restaurant_id: l.restaurantId,
    restaurant_name: l.restaurantName,
    menu_item_id: l.menuItemId,
    name: l.name,
    quantity: l.quantity,
    modifiers: l.modifiers.map((m) => ({ group: m.groupName, option: m.optionName })),
    notes: l.notes,
    line_total: cartLineTotal(l),
  }));
}
