import { supabase } from '@/lib/supabase';
import type {
  DashboardStats,
  ProductWithRelations,
} from '@/types/database.types';

export const dashboardService = {
  /**
   * جلب الإحصائيات عبر عدّات count مباشرة من الجداول
   * (بدون دالة RPC). كل استعلام يجلب العدد فقط دون بيانات (head: true).
   */
  async getStats(): Promise<DashboardStats> {
    const [
      totalProducts,
      activeProducts,
      inApp,
      inNewsletter,
      totalCategories,
      totalBrands,
    ] = await Promise.all([
      // إجمالي المنتجات (غير المحذوفة)
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null),

      // المنتجات النشطة
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .eq('status', 'active'),

      // الظاهرة في التطبيق
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .eq('show_in_app', true),

      // الظاهرة في النشرة
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .eq('show_in_newsletter', true),

      // الفئات
      supabase.from('categories').select('*', { count: 'exact', head: true }),

      // العلامات التجارية
      supabase.from('brands').select('*', { count: 'exact', head: true }),
    ]);

    // في حال فشل أي استعلام، ارمِ الخطأ الأول الموجود
    const firstError =
      totalProducts.error ||
      activeProducts.error ||
      inApp.error ||
      inNewsletter.error ||
      totalCategories.error ||
      totalBrands.error;
    if (firstError) throw firstError;

    return {
      total_products: totalProducts.count ?? 0,
      active_products: activeProducts.count ?? 0,
      in_app: inApp.count ?? 0,
      in_newsletter: inNewsletter.count ?? 0,
      total_categories: totalCategories.count ?? 0,
      total_brands: totalBrands.count ?? 0,
    };
  },

  /** جلب آخر المنتجات المضافة. */
  async getRecentProducts(limit = 5): Promise<ProductWithRelations[]> {
    const { data, error } = await supabase
      .from('products')
      .select(
        `*, category:categories(id, name), brand:brands(id, name), storage_option:storage_options(id, label)`
      )
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as unknown as ProductWithRelations[]) ?? [];
  },
};
