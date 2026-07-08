import type { Database } from './database.types';

type Tables = Database['public']['Tables'];

// ===== أنواع الصفوف الأساسية =====
export type Profile = Tables['profiles']['Row'];
export type Brand = Tables['brands']['Row'];
export type Category = Tables['categories']['Row'];
export type Product = Tables['products']['Row'];
export type StorageOption = Tables['storage_options']['Row'];
export type OrderItem = Tables['order_items']['Row'];

// ===== أنواع الـ Enums =====
export type UserRole = Database['public']['Enums']['user_role'];
export type ProductStatus = Database['public']['Enums']['product_status'];

// ===== أنواع مركّبة =====
export interface ProductWithRelations extends Product {
  category: { id: string; name: string } | null;
  brand: { id: string; name: string } | null;
  storage_option: { id: string; label: string } | null;
}

export interface DashboardStats {
  total_products: number;
  active_products: number;
  in_app: number;
  in_newsletter: number;
  total_categories: number;
  total_brands: number;
}
