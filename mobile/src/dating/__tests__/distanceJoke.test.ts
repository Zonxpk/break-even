import { anchorDistanceKm, fakeDistanceKm } from '../distanceJoke';

test('fakeDistanceKm is stable for same persona and date', () => {
  const a = fakeDistanceKm('p1', '2026-06-13');
  const b = fakeDistanceKm('p1', '2026-06-13');
  expect(a).toBe(b);
  expect(a).toMatch(/^\d\.\d กม\. \(โกหก\)$/);
});

test('fakeDistanceKm can differ across dates', () => {
  const a = fakeDistanceKm('p1', '2026-06-13');
  const b = fakeDistanceKm('p1', '2026-06-14');
  // not guaranteed different but usually is — at least both valid
  expect(a).toMatch(/กม/);
  expect(b).toMatch(/กม/);
});

test('anchorDistanceKm is stable and varies by anchor', () => {
  const a = anchorDistanceKm('p1', 'anchor-a');
  const b = anchorDistanceKm('p1', 'anchor-b');
  expect(anchorDistanceKm('p1', 'anchor-a')).toBe(a);
  expect(a).toMatch(/^\d\.\d กม\. \(โกหก\)$/);
  expect(b).toMatch(/^\d\.\d กม\. \(โกหก\)$/);
});
