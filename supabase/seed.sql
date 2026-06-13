-- Seed content for local dev and first deploy. All editable later in Studio.

-- Bangkok gag anchors (approximate coordinates; mood over accuracy)
insert into public.gag_anchors (type, name, lat, lng) values
 ('canal',        'คลองแสนแสบ (ประตูน้ำ)',   13.7494, 100.5396),
 ('canal',        'คลองเปรมประชากร',          13.8530, 100.5320),
 ('canal',        'คลองบางซื่อ',               13.8060, 100.5380),
 ('seven_eleven', '7-11 สาขาซอยลึกลับ',       13.7563, 100.5018),
 ('seven_eleven', '7-11 สาขาตรงข้าม 7-11',    13.7650, 100.5380),
 ('temple',       'วัดอรุณฯ',                  13.7437, 100.4889),
 ('market',       'ตลาดนัดจตุจักร',            13.7999, 100.5503);

-- Brands
insert into public.brands (id, name, logo_url, contact, status) values
 ('11111111-1111-1111-1111-111111111101', 'น้ำพริกแม่ประนอม (ตัวอย่าง)', null, 'demo@example.com', 'active'),
 ('11111111-1111-1111-1111-111111111102', 'ชานมไข่มุกพี่หมีโต (ตัวอย่าง)', null, 'demo2@example.com', 'active');

-- Catalog (fake but plausible; one product-placed item)
insert into public.catalog_items (service, name, photo_url, price, rating, tie_in_brand_id, sort) values
 ('food', 'ข้าวกะเพราไก่ไข่ดาว — ครัวป้าแมว',  null, 65.00, 4.8, null, 1),
 ('food', 'ก๋วยเตี๋ยวเรือเข้มข้น — เจ๊ติ๋มท่าน้ำ', null, 50.00, 4.6, null, 2),
 ('mart', 'น้ำพริกแม่ประนอม 90g',               null, 35.00, 4.9, '11111111-1111-1111-1111-111111111101', 1),
 ('mart', 'บะหมี่กึ่งสำเร็จรูปรสต้มยำ (แพ็ค 6)',  null, 42.00, 4.7, null, 2),
 ('ride', 'มอเตอร์ไซค์รับจ้าง', null, 45.00, 4.5, null, 1),
 ('parcel', 'ส่งด่วนภายใน 1 ชม. (เคลม)', null, 39.00, 4.2, null, 1);

-- Gag scripts: one full food run, one date ghosting
insert into public.gag_scripts (service, timeline, weight, active) values
 ('food', '{
    "duration_s": 240,
    "events": [
      {"t": 0,   "type": "eta",      "minutes": 14},
      {"t": 0,   "type": "move",     "mode": "route_to_user"},
      {"t": 40,  "type": "move",     "mode": "wrong_turn"},
      {"t": 45,  "type": "chat",     "text": "พี่ขับผ่านซอยไปนิดนึงครับ เดี๋ยวกลับรถ"},
      {"t": 90,  "type": "incident", "kind": "sleepy", "anchor": "seven_eleven", "eta_minutes": 45},
      {"t": 90,  "type": "sabotage", "action": "call", "label": "โทรปลุกไรเดอร์",
                 "backfire": {"chat": "ใกล้ถึงแล้วครับพี่", "move": "wrong_direction", "eta_minutes": 87}},
      {"t": 210, "type": "finale",   "kind": "canal", "anchor": "canal",
                 "status_text": "ไรเดอร์ตกคลองแสนแสบ ขออภัยในความไม่สะดวก"}
    ]}', 1, true),
 ('date', '{
    "duration_s": 180,
    "events": [
      {"t": 0,   "type": "eta",      "minutes": 10},
      {"t": 0,   "type": "move",     "mode": "route_to_user"},
      {"t": 30,  "type": "chat",     "text": "กำลังไปนะ แต่งตัวนานไปหน่อย ขอโทษที 🥺"},
      {"t": 80,  "type": "incident", "kind": "lost", "anchor": "market", "eta_minutes": 30},
      {"t": 80,  "type": "sabotage", "action": "send_location", "label": "ส่งพิกัดให้",
                 "backfire": {"chat": "อ้าว นี่มันอีกฝั่งของเมืองนี่", "move": "wrong_direction", "eta_minutes": 60}},
      {"t": 150, "type": "finale",   "kind": "canal", "anchor": "canal",
                 "status_text": "เดทของคุณตกคลอง ระหว่างทางมาหาคุณ 💔"}
    ]}', 1, true);

-- Personas
insert into public.personas (id, name, bio, rarity, system_prompt, beats, brand_id, active) values
 ('33333333-3333-3333-3333-333333333301',
  'น้องใบเตย', 'เจ้าของร้านชานมไข่มุก ชอบแมว 🐱', 'common',
  'คุณคือใบเตย อายุ 23 เจ้าของร้านชานม ร่าเริง ขี้เล่น ตอบเป็นภาษาไทยเสมอ เนื้อหาเหมาะกับทุกวัย คุณจะตกลงนัดเดทเสมอ แต่จะมีเหตุให้ไปไม่ถึงทุกครั้ง',
  '[{"id": "b1", "at_affection": 8, "scene": "แมวที่ร้านกระโดดมานั่งบนเคาน์เตอร์ ใบเตยถ่ายรูปส่งให้คุณดู", "choices": [{"text": "น่ารักมาก! ขอดูอีก", "affection": 5}, {"text": "แมวนี้ทำลายลางไหม", "affection": -2}]},
   {"id": "b2", "at_affection": 15, "scene": "ใบเตยถามว่าคุณชอบชานมรสไหน — เธอบอกว่าทำพิเศษให้ได้", "choices": [{"text": "ชาไทยหวานน้อยครับ", "affection": 4}, {"text": "อะไรก็ได้ที่ไม่มีไข่มุก (แพ้)", "affection": -1}]},
   {"id": "b3", "at_affection": 22, "scene": "แมวตัวใหญ่แย่งโต๊ะลูกค้า ใบเตยขอคำปรึกษาว่าจะทำยังไง", "choices": [{"text": "ตั้งป้ายว่าแมวเจ้าของร้าน", "affection": 6}, {"text": "ไล่แมวออกไปสิ", "affection": -3}]},
   {"id": "b4", "at_affection": 28, "scene": "ใบเตยบอกว่าอยากเจอตัวจริง — ร้านเงียบช่วงบ่ายสอง", "choices": [{"text": "ไปหาได้เลย อยากลองชานมฝีมือเธอ", "affection": 7}, {"text": "รอแมวอนุมัติก่อนนะ", "affection": 2}]},
   {"id": "b5", "at_affection": 35, "scene": "หลังนัดเดท (หรือก่อนนัด) ใบเตยส่งรูปแมวนอนทับโทรศัพท์", "choices": [{"text": "แมวนี่คือเหตุผลที่เธอไม่ตอบใช่ไหม", "affection": 3}, {"text": "น่ารักจนลืมโกรธไม่ได้", "affection": 5}]}]',
  null, true),
 ('33333333-3333-3333-3333-333333333302',
  'พี่ภูผา', 'วิศวกรไฟฟ้า เงียบขรึม จริงจัง (กับการหลงทาง)', 'rare',
  'คุณคือภูผา อายุ 29 วิศวกร พูดน้อยแต่จริงใจ ตอบเป็นภาษาไทยเสมอ เนื้อหาเหมาะกับทุกวัย คุณจะตกลงนัดเดทเสมอ แต่จะมีเหตุให้ไปไม่ถึงทุกครั้ง',
  '[{"id": "b1", "at_affection": 8, "scene": "ภูผาส่งรูป GPS หมุนไม่หยุด — เขาบอกว่ากำลังหาทางไปหาคุณ", "choices": [{"text": "ไม่เป็นไร รอได้ ขับรถดีๆ นะ", "affection": 4}, {"text": "เปิด Google Maps สิพี่", "affection": -2}]},
   {"id": "b2", "at_affection": 15, "scene": "ภูผาเล่าเรื่องไซต์งานที่ต้องเดินสายไฟบนหลังคา", "choices": [{"text": "เท่มาก ขอฟังต่อ", "affection": 5}, {"text": "อันตรายไหมเนี่ย", "affection": 2}]},
   {"id": "b3", "at_affection": 22, "scene": "ภูผาสารภาพว่าเลี้ยวผิดซอยมาสามรอบแล้ว แต่ไม่อยากยอมแพ้", "choices": [{"text": "ความพยายามน่ารักนะ", "affection": 6}, {"text": "กลับบ้านก่อนดีกว่า", "affection": -4}]},
   {"id": "b4", "at_affection": 28, "scene": "ภูผาพิมพ์ช้าๆ ว่าอยากเห็นหน้าจริง — ไม่เก่งคำพูดแต่จริงใจ", "choices": [{"text": "ผมก็อยากเจอพี่เหมือนกัน", "affection": 8}, {"text": "พิมพ์มาก่อนก็พอ", "affection": 1}]},
   {"id": "b5", "at_affection": 35, "scene": "ภูผาบอกว่าจะไม่หลงทางในวันนัดเดท (โกหกตัวเอง)", "choices": [{"text": "เชื่อพี่ครับ (ไม่เชื่อ)", "affection": 3}, {"text": "ส่งพิกัดมาก่อนนะ", "affection": 4}]}]',
  null, true),
 ('33333333-3333-3333-3333-333333333303',
  'คุณหมีโต', 'มาสคอตชานมไข่มุก ตัวนุ่มมาก หายากมาก ✨', 'legendary',
  'คุณคือหมีโต มาสคอตร้านชานม พูดลงท้ายว่า ครับโต ตอบเป็นภาษาไทยเสมอ เนื้อหาเหมาะกับทุกวัย คุณจะตกลงนัดเดทเสมอ แต่จะมีเหตุให้ไปไม่ถึงทุกครั้ง',
  '[{"id": "b1", "at_affection": 8, "scene": "หมีโตทักมาว่าเพิ่งลงจากบูธมาสคอต — ยังร้อนในชุดครับโต", "choices": [{"text": "เกียรติมากที่มาทัก!", "affection": 6}, {"text": "ไม่ร้อนเหรอ", "affection": 1}]},
   {"id": "b2", "at_affection": 15, "scene": "หมีโตอวดบัตรสะสมแต้มชานมที่เต็มแล้ว", "choices": [{"text": "สุดยอด ขอดูบัตรหน่อย", "affection": 5}, {"text": "ผมมีแค่บัตรรถไฟฟ้า", "affection": 2}]},
   {"id": "b3", "at_affection": 22, "scene": "แฟนคลับมาขอถ่ายรูปกลางแชท — หมีโตขอโทษที่หายไปสักพัก", "choices": [{"text": "เข้าใจครับ ดังมีราคา", "affection": 4}, {"text": "ผมหึงแฟนคลับนะ", "affection": -2}]},
   {"id": "b4", "at_affection": 28, "scene": "หมีโตถอดหัวมาสคอตครึ่งนึง (ไม่เห็นหน้า) บอกว่าอยากเจอแบบจริงจัง", "choices": [{"text": "เจอกันได้เลยครับโต", "affection": 7}, {"text": "ใส่หัวมาก่อนค่อยคุย", "affection": -1}]},
   {"id": "b5", "at_affection": 35, "scene": "หมีโตสัญญาว่าจะมาให้ถึง (ประวัติศาสตร์พิสูจน์แล้วว่าไม่เคยตรงเวลา)", "choices": [{"text": "รออยู่นะครับโต", "affection": 5}, {"text": "ถ้าไม่มาจะ unfollow", "affection": 2}]}]',
  '11111111-1111-1111-1111-111111111102', true);

-- Campaigns: one targeted, one canal-exclusive, one evergreen fallback.
-- NOTE: paid campaigns must set per_user_max and/or cooldown_hours (spam brakes);
-- the fallback's cooldown bounds consolation-mint rate per user.
insert into public.voucher_campaigns
  (brand_id, title, terms, code_mode, trigger_event, conditions,
   quota_total, per_user_max, cooldown_hours, status, priority, weight, is_fallback) values
 ('11111111-1111-1111-1111-111111111101',
  'คูปองน้ำพริก 20฿ — สัปดาห์อาหารไม่ถึง', 'ใช้ที่ร้านค้าที่ร่วมรายการ', 'unique',
  'order_failed', '{"service": "food"}', 1000, 2, null, 'active', 10, 1, false),
 ('11111111-1111-1111-1111-111111111102',
  'ชานมแก้วฟรี — เฉพาะผู้ตกคลอง', 'แสดงโค้ดที่ร้าน', 'unique',
  'order_failed', '{"finale_type": "canal"}', 500, 1, null, 'active', 20, 1, false),
 (null,
  'คูปองปลอบใจ เมื่อไหร่จะถึง', 'คูปองกำลังใจ ใช้แทนเงินสดไม่ได้ (และไม่มีอะไรใช้ได้)', 'unique',
  'order_failed', '{}', null, null, 1, 'active', 0, 1, true);

-- Demo pop-up shop (opens Friday evenings in June 2026)
insert into public.shops (id, brand_id, name, schedule, status) values
 ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111102',
  'หมีโต Pop-up Drop',
  '{"windows": [{"from": "2026-06-01", "to": "2026-06-30", "days_of_week": [5], "open": "18:00", "close": "22:00"}]}',
  'active');

insert into public.merch_items
  (shop_id, name, description, voucher_price, stock, redemption_instructions, active) values
 ('22222222-2222-2222-2222-222222222201', 'เสื้อยืด "ตกคลอง"',
  'เสื้อที่ระลึกสำหรับผู้รอคอย', 5, 100, 'แสดง QR ที่บูธงาน', true),
 ('22222222-2222-2222-2222-222222222201', 'หมวกไรเดอร์หลงทาง',
  'หมวกรุ่นลิมิเต็ด', 3, 30, 'แสดง QR ที่บูธงาน', true);
