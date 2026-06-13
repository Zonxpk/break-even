-- Patch: rich story beats for all personas (content polish slice)
-- Safe to re-run on cloud — updates by fixed persona id.

update public.personas set
  bio = 'เจ้าของร้านชานมไข่มุก ชอบแมว 🐱',
  beats = '[{"id": "b1", "at_affection": 8, "scene": "แมวที่ร้านกระโดดมานั่งบนเคาน์เตอร์ ใบเตยถ่ายรูปส่งให้คุณดู", "choices": [{"text": "น่ารักมาก! ขอดูอีก", "affection": 5}, {"text": "แมวนี้ทำลายลางไหม", "affection": -2}]},
   {"id": "b2", "at_affection": 15, "scene": "ใบเตยถามว่าคุณชอบชานมรสไหน — เธอบอกว่าทำพิเศษให้ได้", "choices": [{"text": "ชาไทยหวานน้อยครับ", "affection": 4}, {"text": "อะไรก็ได้ที่ไม่มีไข่มุก (แพ้)", "affection": -1}]},
   {"id": "b3", "at_affection": 22, "scene": "แมวตัวใหญ่แย่งโต๊ะลูกค้า ใบเตยขอคำปรึกษาว่าจะทำยังไง", "choices": [{"text": "ตั้งป้ายว่าแมวเจ้าของร้าน", "affection": 6}, {"text": "ไล่แมวออกไปสิ", "affection": -3}]},
   {"id": "b4", "at_affection": 28, "scene": "ใบเตยบอกว่าอยากเจอตัวจริง — ร้านเงียบช่วงบ่ายสอง", "choices": [{"text": "ไปหาได้เลย อยากลองชานมฝีมือเธอ", "affection": 7}, {"text": "รอแมวอนุมัติก่อนนะ", "affection": 2}]},
   {"id": "b5", "at_affection": 35, "scene": "หลังนัดเดท (หรือก่อนนัด) ใบเตยส่งรูปแมวนอนทับโทรศัพท์", "choices": [{"text": "แมวนี่คือเหตุผลที่เธอไม่ตอบใช่ไหม", "affection": 3}, {"text": "น่ารักจนลืมโกรธไม่ได้", "affection": 5}]}]'::jsonb
where id = '33333333-3333-3333-3333-333333333301';

update public.personas set
  beats = '[{"id": "b1", "at_affection": 8, "scene": "ภูผาส่งรูป GPS หมุนไม่หยุด — เขาบอกว่ากำลังหาทางไปหาคุณ", "choices": [{"text": "ไม่เป็นไร รอได้ ขับรถดีๆ นะ", "affection": 4}, {"text": "เปิด Google Maps สิพี่", "affection": -2}]},
   {"id": "b2", "at_affection": 15, "scene": "ภูผาเล่าเรื่องไซต์งานที่ต้องเดินสายไฟบนหลังคา", "choices": [{"text": "เท่มาก ขอฟังต่อ", "affection": 5}, {"text": "อันตรายไหมเนี่ย", "affection": 2}]},
   {"id": "b3", "at_affection": 22, "scene": "ภูผาสารภาพว่าเลี้ยวผิดซอยมาสามรอบแล้ว แต่ไม่อยากยอมแพ้", "choices": [{"text": "ความพยายามน่ารักนะ", "affection": 6}, {"text": "กลับบ้านก่อนดีกว่า", "affection": -4}]},
   {"id": "b4", "at_affection": 28, "scene": "ภูผาพิมพ์ช้าๆ ว่าอยากเห็นหน้าจริง — ไม่เก่งคำพูดแต่จริงใจ", "choices": [{"text": "ผมก็อยากเจอพี่เหมือนกัน", "affection": 8}, {"text": "พิมพ์มาก่อนก็พอ", "affection": 1}]},
   {"id": "b5", "at_affection": 35, "scene": "ภูผาบอกว่าจะไม่หลงทางในวันนัดเดท (โกหกตัวเอง)", "choices": [{"text": "เชื่อพี่ครับ (ไม่เชื่อ)", "affection": 3}, {"text": "ส่งพิกัดมาก่อนนะ", "affection": 4}]}]'::jsonb
where id = '33333333-3333-3333-3333-333333333302';

update public.personas set
  beats = '[{"id": "b1", "at_affection": 8, "scene": "หมีโตทักมาว่าเพิ่งลงจากบูธมาสคอต — ยังร้อนในชุดครับโต", "choices": [{"text": "เกียรติมากที่มาทัก!", "affection": 6}, {"text": "ไม่ร้อนเหรอ", "affection": 1}]},
   {"id": "b2", "at_affection": 15, "scene": "หมีโตอวดบัตรสะสมแต้มชานมที่เต็มแล้ว", "choices": [{"text": "สุดยอด ขอดูบัตรหน่อย", "affection": 5}, {"text": "ผมมีแค่บัตรรถไฟฟ้า", "affection": 2}]},
   {"id": "b3", "at_affection": 22, "scene": "แฟนคลับมาขอถ่ายรูปกลางแชท — หมีโตขอโทษที่หายไปสักพัก", "choices": [{"text": "เข้าใจครับ ดังมีราคา", "affection": 4}, {"text": "ผมหึงแฟนคลับนะ", "affection": -2}]},
   {"id": "b4", "at_affection": 28, "scene": "หมีโตถอดหัวมาสคอตครึ่งนึง (ไม่เห็นหน้า) บอกว่าอยากเจอแบบจริงจัง", "choices": [{"text": "เจอกันได้เลยครับโต", "affection": 7}, {"text": "ใส่หัวมาก่อนค่อยคุย", "affection": -1}]},
   {"id": "b5", "at_affection": 35, "scene": "หมีโตสัญญาว่าจะมาให้ถึง (ประวัติศาสตร์พิสูจน์แล้วว่าไม่เคยตรงเวลา)", "choices": [{"text": "รออยู่นะครับโต", "affection": 5}, {"text": "ถ้าไม่มาจะ unfollow", "affection": 2}]}]'::jsonb
where id = '33333333-3333-3333-3333-333333333303';
