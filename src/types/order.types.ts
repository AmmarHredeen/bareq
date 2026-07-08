import type { Database } from './database.types';

// النوع الأساسي للطلب (صف من جدول orders)
export type Order = Database['public']['Tables']['orders']['Row'];

// نوع صف عنصر الطلب
export type OrderItem = Database['public']['Tables']['order_items']['Row'];

// أنواع الحالات (Enums من قاعدة البيانات)
export type OrderStatus = Database['public']['Enums']['order_status'];
export type OrderPaymentStatus = Database['public']['Enums']['order_payment_status'];
export type OrderFulfillmentType = Database['public']['Enums']['order_fulfillment_type'];

// نوع العميل المختصر (من جدول profiles عبر العلاقة)
export type OrderCustomer = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  shop_name: string | null;
};

// الطلب مع العلاقات (العميل + العناصر)
export type OrderWithRelations = Order & {
  customer: OrderCustomer | null;
  items: OrderItem[];
};
