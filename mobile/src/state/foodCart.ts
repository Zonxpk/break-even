import { create } from 'zustand';
import type { CartLineInput } from '../food/cartMath';
import { cartSubtotal, buildFoodOrderPayload } from '../food/cartMath';

interface FoodCartState {
  restaurantId: string | null;
  restaurantName: string | null;
  deliveryFee: number;
  lines: CartLineInput[];
  setRestaurant: (id: string, name: string, deliveryFee: number) => void;
  addLine: (line: CartLineInput) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
  lineCount: () => number;
  subtotal: () => number;
  orderPayload: () => ReturnType<typeof buildFoodOrderPayload>;
}

export const useFoodCart = create<FoodCartState>((set, get) => ({
  restaurantId: null,
  restaurantName: null,
  deliveryFee: 0,
  lines: [],

  setRestaurant: (id, name, deliveryFee) => set({ restaurantId: id, restaurantName: name, deliveryFee }),

  addLine: (line) =>
    set((s) => {
      if (s.restaurantId && s.restaurantId !== line.restaurantId) return s;
      return {
        restaurantId: line.restaurantId,
        restaurantName: line.restaurantName,
        deliveryFee: s.deliveryFee || get().deliveryFee,
        lines: [...s.lines, line],
      };
    }),

  updateQuantity: (lineId, quantity) =>
    set((s) => ({
      lines:
        quantity <= 0
          ? s.lines.filter((l) => l.lineId !== lineId)
          : s.lines.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)),
    })),

  removeLine: (lineId) => set((s) => ({ lines: s.lines.filter((l) => l.lineId !== lineId) })),

  clear: () => set({ restaurantId: null, restaurantName: null, deliveryFee: 0, lines: [] }),

  lineCount: () => get().lines.reduce((n, l) => n + l.quantity, 0),
  subtotal: () => cartSubtotal(get().lines),
  orderPayload: () => buildFoodOrderPayload(get().lines),
}));

export function canAddToCart(restaurantId: string): boolean {
  const { restaurantId: current, lines } = useFoodCart.getState();
  return lines.length === 0 || current === restaurantId;
}
