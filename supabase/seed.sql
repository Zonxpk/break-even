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

-- Food delivery CMS (see spec 2026-06-13-food-delivery-design)
insert into public.food_modifier_groups (id, name, min_select, max_select, sort) values
 ('f0000001-0000-4000-8000-000000000001', 'ระดับความเผ็ด', 1, 1, 1),
 ('f0000001-0000-4000-8000-000000000002', 'ท็อปปิ้ง', 0, 3, 2),
 ('f0000001-0000-4000-8000-000000000003', 'ระดับความหวาน', 1, 1, 1);

insert into public.food_modifier_options (group_id, name, price_delta, sort) values
 ('f0000001-0000-4000-8000-000000000001', 'เผ็ดน้อย', 0, 1),
 ('f0000001-0000-4000-8000-000000000001', 'ปกติ', 0, 2),
 ('f0000001-0000-4000-8000-000000000001', 'เผ็ดมาก', 0, 3),
 ('f0000001-0000-4000-8000-000000000002', 'ไข่ดาว', 10, 1),
 ('f0000001-0000-4000-8000-000000000002', 'ไม่ใส่ผักชี', 0, 2),
 ('f0000001-0000-4000-8000-000000000002', 'เพิ่มเนื้อ', 20, 3),
 ('f0000001-0000-4000-8000-000000000003', 'หวานน้อย', 0, 1),
 ('f0000001-0000-4000-8000-000000000003', 'หวานปกติ', 0, 2),
 ('f0000001-0000-4000-8000-000000000003', 'หวานมาก', 0, 3);

insert into public.food_restaurants
  (id, name, cuisine_tags, rating, review_count, delivery_fee, eta_minutes, promo_badge, tie_in_brand_id, sort) values
 ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'ครัวป้าแมว', '{อาหารตามสั่ง}', 4.8, 1240, 0, 25, 'โปร', null, 1),
 ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'เจ๊ติ๋มท่าน้ำ', '{ก๋วยเตี๋ยว}', 4.6, 890, 15, 30, null, null, 2),
 ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 'ส้มตำป้าแดง', '{อีสาน,ส้มตำ}', 4.7, 2100, 10, 28, 'ยอดนิยม', null, 3),
 ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 'ข้าวมันไก่เจ๊จู', '{ข้าวมันไก่}', 4.5, 560, 12, 22, null, null, 4),
 ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 'ปิ้งย่างซอยลับ', '{ปิ้งย่าง,เที่ยงคืน}', 4.4, 320, 20, 35, 'เปิดดึก', null, 5),
 ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 'ชานมไข่มุกพี่หมีโต', '{ชานม,ของหวาน}', 4.9, 3400, 0, 20, '1 แถม 0', '11111111-1111-1111-1111-111111111102', 6),
 ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa07', 'กะเพราถาดยักษ์', '{อาหารตามสั่ง}', 4.3, 780, 15, 32, null, null, 7),
 ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa08', 'ราเมนซอยหลังบ้าน', '{ญี่ปุ่น,ก๋วยเตี๋ยว}', 4.6, 410, 18, 27, null, null, 8);

insert into public.food_menu_categories (id, restaurant_id, name, sort) values
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0101', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'เมนูแนะนำ', 1),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0102', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'เครื่องดื่ม', 2),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0201', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'เมนูแนะนำ', 1),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0202', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'เครื่องดื่ม', 2),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0301', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 'เมนูแนะนำ', 1),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0302', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 'เครื่องดื่ม', 2),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0401', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 'เมนูแนะนำ', 1),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0402', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 'เครื่องดื่ม', 2),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0501', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 'เมนูแนะนำ', 1),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0502', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 'เครื่องดื่ม', 2),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0601', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 'เมนูแนะนำ', 1),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0602', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 'เครื่องดื่ม', 2),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0701', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa07', 'เมนูแนะนำ', 1),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0702', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa07', 'เครื่องดื่ม', 2),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0801', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa08', 'เมนูแนะนำ', 1),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0802', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa08', 'เครื่องดื่ม', 2);

insert into public.food_menu_items
  (id, restaurant_id, category_id, name, description, price, rating, sort) values
 -- ครัวป้าแมว
 ('cccccccc-cccc-cccc-cccc-cccccccc0101', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0101',
  'ข้าวกะเพราไก่ไข่ดาว', 'กะเพราไก่สับ ไข่ดาวกรอบ', 65.00, 4.8, 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0102', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0101',
  'ข้าวผัดกุ้ง', 'กุ้งตัวใหญ่ ผัดพริกแกง', 75.00, 4.7, 2),
 ('cccccccc-cccc-cccc-cccc-cccccccc0103', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0101',
  'ผัดไทยกุ้งสด', 'เส้นจันท์ กุ้งแม่น้ำ', 60.00, 4.6, 3),
 ('cccccccc-cccc-cccc-cccc-cccccccc0104', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0102',
  'ชาเย็น', 'ชาไทยเข้มข้น', 25.00, 4.5, 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0105', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0102',
  'น้ำมะนาว', 'สดชื่น หวานน้อย', 20.00, 4.4, 2),
 -- เจ๊ติ๋มท่าน้ำ
 ('cccccccc-cccc-cccc-cccc-cccccccc0201', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0201',
  'ก๋วยเตี๋ยวเรือเข้มข้น', 'น้ำต้มยำเข้มข้น หมูสับ', 50.00, 4.6, 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0202', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0201',
  'ก๋วยเตี๋ยวน้ำใส', 'น้ำซุปหมู รสกลมกล่อม', 45.00, 4.5, 2),
 ('cccccccc-cccc-cccc-cccc-cccccccc0203', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0201',
  'บะหมี่แห้ง', 'หมูกรอบ น้ำซุปแยก', 55.00, 4.4, 3),
 ('cccccccc-cccc-cccc-cccc-cccccccc0204', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0202',
  'น้ำส้มคั้น', 'สดใหม่ทุกแก้ว', 30.00, 4.3, 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0205', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0202',
  'ชาเขียวเย็น', 'หอมมัทฉะ', 25.00, 4.2, 2),
 -- ส้มตำป้าแดง
 ('cccccccc-cccc-cccc-cccc-cccccccc0301', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0301',
  'ส้มตำไทย', 'มะละกอสด ปลาร้า', 45.00, 4.7, 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0302', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0301',
  'ลาบหมู', 'หมูสับสด เครื่องเทศ', 55.00, 4.6, 2),
 ('cccccccc-cccc-cccc-cccc-cccccccc0303', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0301',
  'ไก่ย่างวิเชียรบุรี', 'ครึ่งตัว น้ำจิ้มแจ่ว', 80.00, 4.8, 3),
 ('cccccccc-cccc-cccc-cccc-cccccccc0304', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0302',
  'น้ำอ้อย', 'หวานเย็น', 20.00, 4.5, 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0305', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0302',
  'โอเลี้ยง', 'ชาดำเย็น', 15.00, 4.4, 2),
 -- ข้าวมันไก่เจ๊จู
 ('cccccccc-cccc-cccc-cccc-cccccccc0401', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0401',
  'ข้าวมันไก่ต้ม', 'ไก่นุ่ม น้ำจิ้มเจ๊จู', 50.00, 4.5, 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0402', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0401',
  'ข้าวมันไก่ทอด', 'หนังกรอบ เนื้อฉ่ำ', 55.00, 4.6, 2),
 ('cccccccc-cccc-cccc-cccc-cccccccc0403', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0401',
  'ข้าวมันไก่ผสม', 'ต้มทอดครึ่งครึ่ง', 55.00, 4.5, 3),
 ('cccccccc-cccc-cccc-cccc-cccccccc0404', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0402',
  'น้ำใบเตย', 'หอมใบเตย', 15.00, 4.3, 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0405', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0402',
  'ชาไทยเย็น', 'หวานน้อย', 20.00, 4.4, 2),
 -- ปิ้งย่างซอยลับ
 ('cccccccc-cccc-cccc-cccc-cccccccc0501', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0501',
  'หมูสามชั้นย่าง', 'หมักน้ำผึ้ง ย่างถ่าน', 89.00, 4.4, 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0502', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0501',
  'ไก่บ้านย่าง', 'ครึ่งตัว น้ำจิ้มแจ่ว', 120.00, 4.3, 2),
 ('cccccccc-cccc-cccc-cccc-cccccccc0503', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0501',
  'หมูปิ้ง', '10 ไม้ น้ำจิ้มถั่ว', 60.00, 4.5, 3),
 ('cccccccc-cccc-cccc-cccc-cccccccc0504', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0502',
  'เบียร์เย็น', 'ช้าง สิงห์ หรือลีโอ', 65.00, 4.2, 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0505', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0502',
  'โซดาปั่น', 'มะนาว หรือ สตรอว์เบอร์รี', 45.00, 4.1, 2),
 -- ชานมไข่มุกพี่หมีโต
 ('cccccccc-cccc-cccc-cccc-cccccccc0601', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0601',
  'ชานมไข่มุกคลาสสิก', 'ชาไทย ไข่มุกหนึบ', 45.00, 4.9, 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0602', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0601',
  'ชาเขียวไข่มุก', 'มัทฉะ ไข่มุกบราวน์ชูการ์', 50.00, 4.8, 2),
 ('cccccccc-cccc-cccc-cccc-cccccccc0603', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0601',
  'บิงซูชานม', 'นมสด ไข่มุก ครีมชีส', 89.00, 4.7, 3),
 ('cccccccc-cccc-cccc-cccc-cccccccc0604', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0602',
  'ชานมช็อกโกแลต', 'โกโก้เข้มข้น ไข่มุก', 55.00, 4.8, 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0605', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0602',
  'น้ำผึ้งมะนาว', 'สดชื่น ไม่มีไข่มุก', 35.00, 4.6, 2),
 -- กะเพราถาดยักษ์
 ('cccccccc-cccc-cccc-cccc-cccccccc0701', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa07', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0701',
  'กะเพราถาดยักษ์', 'เสิร์ฟถาดใหญ่ แชร์ได้', 199.00, 4.3, 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0702', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa07', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0701',
  'กะเพราหมูสับ', 'จานปกติ ไข่ดาว', 55.00, 4.2, 2),
 ('cccccccc-cccc-cccc-cccc-cccccccc0703', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa07', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0701',
  'กะเพราเนื้อ', 'เนื้อสับ รสจัด', 75.00, 4.4, 3),
 ('cccccccc-cccc-cccc-cccc-cccccccc0704', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa07', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0702',
  'โค้ก', 'เย็นจัด', 20.00, 4.0, 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0705', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa07', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0702',
  'น้ำเปล่า', 'ขวด 600ml', 10.00, null, 2),
 -- ราเมนซอยหลังบ้าน
 ('cccccccc-cccc-cccc-cccc-cccccccc0801', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa08', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0801',
  'ทงคัตสึราเมน', 'น้ำซุปหมูเข้มข้น ชาชู', 120.00, 4.6, 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0802', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa08', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0801',
  'มิโซะราเมน', 'น้ำซุปถั่วเหลือง หมูชาชู', 110.00, 4.5, 2),
 ('cccccccc-cccc-cccc-cccc-cccccccc0803', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa08', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0801',
  'กิวโระราเมน', 'น้ำซุปใส ไก่', 100.00, 4.4, 3),
 ('cccccccc-cccc-cccc-cccc-cccccccc0804', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa08', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0802',
  'ชาเขียวญี่ปุ่น', 'ร้อนหรือเย็น', 40.00, 4.3, 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0805', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa08', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0802',
  'รามูเน่', 'เบียร์ญี่ปุ่น', 90.00, 4.2, 2);

-- Spice on savory, sweetness on drinks, toppings optional on select savory
insert into public.food_item_modifier_groups (menu_item_id, group_id, sort) values
 -- ครัวป้าแมว savory
 ('cccccccc-cccc-cccc-cccc-cccccccc0101', 'f0000001-0000-4000-8000-000000000001', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0101', 'f0000001-0000-4000-8000-000000000002', 2),
 ('cccccccc-cccc-cccc-cccc-cccccccc0102', 'f0000001-0000-4000-8000-000000000001', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0102', 'f0000001-0000-4000-8000-000000000002', 2),
 ('cccccccc-cccc-cccc-cccc-cccccccc0103', 'f0000001-0000-4000-8000-000000000001', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0103', 'f0000001-0000-4000-8000-000000000002', 2),
 -- ครัวป้าแมว drinks
 ('cccccccc-cccc-cccc-cccc-cccccccc0104', 'f0000001-0000-4000-8000-000000000003', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0105', 'f0000001-0000-4000-8000-000000000003', 1),
 -- เจ๊ติ๋ม savory
 ('cccccccc-cccc-cccc-cccc-cccccccc0201', 'f0000001-0000-4000-8000-000000000001', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0201', 'f0000001-0000-4000-8000-000000000002', 2),
 ('cccccccc-cccc-cccc-cccc-cccccccc0202', 'f0000001-0000-4000-8000-000000000001', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0203', 'f0000001-0000-4000-8000-000000000001', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0203', 'f0000001-0000-4000-8000-000000000002', 2),
 -- เจ๊ติ๋ม drinks
 ('cccccccc-cccc-cccc-cccc-cccccccc0204', 'f0000001-0000-4000-8000-000000000003', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0205', 'f0000001-0000-4000-8000-000000000003', 1),
 -- ส้มตำ savory
 ('cccccccc-cccc-cccc-cccc-cccccccc0301', 'f0000001-0000-4000-8000-000000000001', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0302', 'f0000001-0000-4000-8000-000000000001', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0303', 'f0000001-0000-4000-8000-000000000001', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0303', 'f0000001-0000-4000-8000-000000000002', 2),
 -- ส้มตำ drinks
 ('cccccccc-cccc-cccc-cccc-cccccccc0304', 'f0000001-0000-4000-8000-000000000003', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0305', 'f0000001-0000-4000-8000-000000000003', 1),
 -- ข้าวมันไก่ savory
 ('cccccccc-cccc-cccc-cccc-cccccccc0401', 'f0000001-0000-4000-8000-000000000002', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0402', 'f0000001-0000-4000-8000-000000000002', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0403', 'f0000001-0000-4000-8000-000000000002', 1),
 -- ข้าวมันไก่ drinks
 ('cccccccc-cccc-cccc-cccc-cccccccc0404', 'f0000001-0000-4000-8000-000000000003', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0405', 'f0000001-0000-4000-8000-000000000003', 1),
 -- ปิ้งย่าง savory
 ('cccccccc-cccc-cccc-cccc-cccccccc0501', 'f0000001-0000-4000-8000-000000000001', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0502', 'f0000001-0000-4000-8000-000000000001', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0503', 'f0000001-0000-4000-8000-000000000001', 1),
 -- ปิ้งย่าง drinks
 ('cccccccc-cccc-cccc-cccc-cccccccc0504', 'f0000001-0000-4000-8000-000000000003', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0505', 'f0000001-0000-4000-8000-000000000003', 1),
 -- ชานม savory (desserts)
 ('cccccccc-cccc-cccc-cccc-cccccccc0601', 'f0000001-0000-4000-8000-000000000003', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0602', 'f0000001-0000-4000-8000-000000000003', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0603', 'f0000001-0000-4000-8000-000000000003', 1),
 -- ชานม drinks
 ('cccccccc-cccc-cccc-cccc-cccccccc0604', 'f0000001-0000-4000-8000-000000000003', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0605', 'f0000001-0000-4000-8000-000000000003', 1),
 -- กะเพราถาด savory
 ('cccccccc-cccc-cccc-cccc-cccccccc0701', 'f0000001-0000-4000-8000-000000000001', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0701', 'f0000001-0000-4000-8000-000000000002', 2),
 ('cccccccc-cccc-cccc-cccc-cccccccc0702', 'f0000001-0000-4000-8000-000000000001', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0702', 'f0000001-0000-4000-8000-000000000002', 2),
 ('cccccccc-cccc-cccc-cccc-cccccccc0703', 'f0000001-0000-4000-8000-000000000001', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0703', 'f0000001-0000-4000-8000-000000000002', 2),
 -- กะเพราถาด drinks
 ('cccccccc-cccc-cccc-cccc-cccccccc0704', 'f0000001-0000-4000-8000-000000000003', 1),
 -- ราเมน savory
 ('cccccccc-cccc-cccc-cccc-cccccccc0801', 'f0000001-0000-4000-8000-000000000001', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0801', 'f0000001-0000-4000-8000-000000000002', 2),
 ('cccccccc-cccc-cccc-cccc-cccccccc0802', 'f0000001-0000-4000-8000-000000000001', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0803', 'f0000001-0000-4000-8000-000000000001', 1),
 -- ราเมน drinks
 ('cccccccc-cccc-cccc-cccc-cccccccc0804', 'f0000001-0000-4000-8000-000000000003', 1),
 ('cccccccc-cccc-cccc-cccc-cccccccc0805', 'f0000001-0000-4000-8000-000000000003', 1);

insert into public.food_promos (title, subtitle, restaurant_id, badge_text, sort) values
 ('ส่งฟรีทุกออเดอร์*', '(*ส่งไม่ถึงอยู่ดี)', null, 'ส่งฟรี', 1),
 ('กะเพรา ฿49', 'เฉพาะครัวป้าแมว', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'โปร', 2),
 ('ชานม 1 แถม 0', 'พี่หมีโตใจดี', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', '1 แถม 0', 3);

-- Catalog (fake but plausible; one product-placed item)
insert into public.catalog_items (service, name, photo_url, price, rating, tie_in_brand_id, sort) values
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
