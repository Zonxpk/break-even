import type { Service } from '../types/db';

export interface ServiceConfig {
  key: Service;
  title: string;
  catalogTitle: string;
  confirmCta: string;
  trackingNoun: string;
  accent: string;
}

export const SERVICE_CONFIGS: Record<Service, ServiceConfig> = {
  food: { key: 'food', title: 'สั่งอาหาร', catalogTitle: 'ร้านแนะนำ', confirmCta: 'สั่งเลย', trackingNoun: 'ไรเดอร์', accent: '#00B14F' },
  ride: { key: 'ride', title: 'เรียกรถ', catalogTitle: 'เลือกบริการ', confirmCta: 'เรียกรถ', trackingNoun: 'คนขับ', accent: '#1E88E5' },
  parcel: { key: 'parcel', title: 'ส่งพัสดุ', catalogTitle: 'เลือกบริการส่ง', confirmCta: 'ส่งพัสดุ', trackingNoun: 'เมสเซนเจอร์', accent: '#F4511E' },
  mart: { key: 'mart', title: 'มาร์ท', catalogTitle: 'สินค้าแนะนำ', confirmCta: 'สั่งซื้อ', trackingNoun: 'ไรเดอร์', accent: '#8E24AA' },
};
