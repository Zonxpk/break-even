import type { FoodRestaurant } from '../types/db';

export function filterRestaurants(
  restaurants: FoodRestaurant[],
  query: string,
  tags: string[],
): FoodRestaurant[] {
  const q = query.trim().toLowerCase();
  return restaurants.filter((r) => {
    const matchesQuery =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.cuisine_tags.some((t) => t.toLowerCase().includes(q));
    const matchesTags = tags.length === 0 || tags.some((t) => r.cuisine_tags.includes(t));
    return matchesQuery && matchesTags;
  });
}

export function allCuisineTags(restaurants: FoodRestaurant[]): string[] {
  const set = new Set<string>();
  for (const r of restaurants) for (const t of r.cuisine_tags) set.add(t);
  return [...set].sort();
}
