import type { Database } from './database.types';

export type OrderStatus = Database['public']['Enums']['order_status'];
export type OrderFulfillmentType = Database['public']['Enums']['order_fulfillment_type'];



/** نتيجة مرقّمة من قاعدة البيانات. */
export interface PaginatedResult<T> {
  data: T[];
  count: number;
}

/** معطيات الاستعلام المشتركة (بحث، ترقيم، ترتيب). */
export interface QueryParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
