import { supabase } from '@/lib/supabase';
import type { Category } from '@/types/entities.types';
import type { PaginatedResult, QueryParams } from '@/types/common.types';
import { generateSlug } from '@/utils/slug';

export interface CategoryInput {
  name: string;
  description?: string | null;
  is_active: boolean;
  show_in_app: boolean;
  show_in_newsletter: boolean;
}

/** معاملات جلب الفئات (تمدّد QueryParams بفلاتر خاصة بالفئات). */
export interface CategoryQueryParams extends QueryParams {
  /** true = نشط فقط، false = غير نشط فقط، undefined = الكل */
  is_active?: boolean;
  /** true = يعرض فقط ما يظهر في التطبيق (ونشط) */
  show_in_app?: boolean;
  /** true = يعرض فقط ما يظهر في النشرة (ونشط) */
  show_in_newsletter?: boolean;
}

export const categoriesService = {
  /** جلب الفئات مع بحث وفلاتر وترقيم وترتيب. */
  async getAll(
    params: CategoryQueryParams = {}
  ): Promise<PaginatedResult<Category>> {
    const {
      search = '',
      page = 1,
      pageSize = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
      is_active,
      show_in_app,
      show_in_newsletter,
    } = params;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('categories').select('*', { count: 'exact' });

    if (search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    // فلتر الحالة (نشط / غير نشط)
    if (typeof is_active === 'boolean') {
      query = query.eq('is_active', is_active);
    }

    // فلتر الظهور في التطبيق — مع تطبيق قاعدة "غير نشط لا يظهر"
    if (show_in_app) {
      query = query.eq('show_in_app', true).eq('is_active', true);
    }

    // فلتر الظهور في النشرة — مع تطبيق قاعدة "غير نشط لا يظهر"
    if (show_in_newsletter) {
      query = query.eq('show_in_newsletter', true).eq('is_active', true);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data ?? [], count: count ?? 0 };
  },

  /** جلب كل الفئات النشطة (للقوائم المنسدلة). */
  async getActive(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async create(input: CategoryInput): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...input, slug: generateSlug(input.name) })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, input: CategoryInput): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update({ ...input, slug: generateSlug(input.name) })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },
};
