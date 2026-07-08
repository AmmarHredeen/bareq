import { supabase } from '@/lib/supabase';
import type {
  Product,
  ProductWithRelations,
  ProductStatus,
} from '@/types/entities.types';

import type { PaginatedResult, QueryParams } from '@/types/common.types';

const TABLE = 'products';

// الأعمدة مع العلاقات (نجلب اسم الفئة/العلامة/الذاكرة)
const SELECT_WITH_RELATIONS = `
  *,
  category:categories(id, name),
  brand:brands(id, name),
  storage_option:storage_options(id, label)
`;

export interface ProductInput {
  name: string;
  category_id: string;
  brand_id: string;
  storage_option_id: string;
  price: number;
  wholesale_price: number;
  description?: string | null;
  status: ProductStatus;
  show_in_app: boolean;
  show_in_newsletter: boolean;
}

export interface ProductFilters extends QueryParams {
  category_id?: string;
  brand_id?: string;
  status?: ProductStatus | '';
  /** true = يعرض فقط ما يظهر في التطبيق (وحالته نشط) */
  show_in_app?: boolean;
  /** true = يعرض فقط ما يظهر في النشرة (وحالته نشط) */
  show_in_newsletter?: boolean;
}

export const productsService = {
  /** جلب المنتجات مع العلاقات والبحث والفلترة والترقيم. */
  async getAll(
    params: ProductFilters = {}
  ): Promise<PaginatedResult<ProductWithRelations>> {
    const {
      search = '',
      category_id = '',
      brand_id = '',
      status = '',
      show_in_app,
      show_in_newsletter,
      page = 1,
      pageSize = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(TABLE)
      .select(SELECT_WITH_RELATIONS, { count: 'exact' })
      .is('deleted_at', null); // استبعاد المحذوف ناعماً

    // بحث في الاسم/الموديل/اللون
        // بحث في الاسم/الموديل
    if (search.trim()) {
      const s = search.trim();
      query = query.or(`name.ilike.%${s}%,model.ilike.%${s}%`);
    }


    if (category_id) query = query.eq('category_id', category_id);
    if (brand_id) query = query.eq('brand_id', brand_id);
    if (status) query = query.eq('status', status);

    // فلتر الظهور في التطبيق — مع تطبيق قاعدة "غير نشط لا يظهر"
    // (في المنتجات، "نشط" = status === 'active')
    if (show_in_app) {
      query = query.eq('show_in_app', true).eq('status', 'active');
    }

    // فلتر الظهور في النشرة — مع تطبيق قاعدة "غير نشط لا يظهر"
    if (show_in_newsletter) {
      query = query.eq('show_in_newsletter', true).eq('status', 'active');
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: (data as unknown as ProductWithRelations[]) ?? [],
      count: count ?? 0,
    };
  },

  async create(input: ProductInput): Promise<Product> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, input: ProductInput): Promise<Product> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** حذف ناعم (soft delete) — لا يُحذف فعلياً. */
  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },
};
