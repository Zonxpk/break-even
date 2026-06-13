import { fetchRoute, fallbackRoute } from '../route';

afterEach(() => jest.restoreAllMocks());

const FROM = { lat: 13.70, lng: 100.50 };
const TO = { lat: 13.75, lng: 100.55 };

test('parses OSRM geojson into latlng list', async () => {
  jest.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({
      routes: [{ geometry: { coordinates: [[100.50, 13.70], [100.52, 13.72], [100.55, 13.75]] } }],
    }),
  } as Response);
  const route = await fetchRoute(FROM, TO);
  expect(route).toEqual([
    { lat: 13.70, lng: 100.50 },
    { lat: 13.72, lng: 100.52 },
    { lat: 13.75, lng: 100.55 },
  ]);
});

test('falls back when OSRM errors', async () => {
  jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('down'));
  const route = await fetchRoute(FROM, TO);
  expect(route.length).toBeGreaterThanOrEqual(2);
  expect(route[0]).toEqual(FROM);
  expect(route[route.length - 1]).toEqual(TO);
});

test('falls back on non-ok response', async () => {
  jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false } as Response);
  const route = await fetchRoute(FROM, TO);
  expect(route[0]).toEqual(FROM);
});

test('fallbackRoute is deterministic and wandery', () => {
  const a = fallbackRoute(FROM, TO, 42);
  const b = fallbackRoute(FROM, TO, 42);
  expect(a).toEqual(b);
  expect(a.length).toBeGreaterThan(4);
});
