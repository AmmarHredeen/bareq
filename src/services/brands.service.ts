import { supabase } from '@/lib/supabase';
import type { Brand } from '@/types/database.types';
import type { PaginatedResult, QueryParams } from '@/types/common.types';
import { generateSlug } from '@/utils/slug';

const TABLE = 'brands';

export interface BrandInput {
  name: string;
  description?: string | null;
  is_active: boolean;
  show_in_app: boolean;
  show_in_newsletter: boolean;
}

/** معاملات جلب العلامات (تمدّد QueryParams بفلاتر خاصة). */
export interface BrandQueryParams extends QueryParams {
  /** true = نشط فقط، false = غير نشط فقط، undefined = الكل */
  is_active?: boolean;
  /** true = يعرض فقط ما يظهر في التطبيق (ونشط) */
  show_in_app?: boolean;
  /** true = يعرض فقط ما يظهر في النشرة (ونشط) */
  show_in_newsletter?: boolean;
}

export const brandsService = {
  /** جلب العلامات مع بحث وفلاتر وترقيم وترتيب. */
  async getAll(params: BrandQueryParams = {}): Promise<PaginatedResult<Brand>> {
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

    let query = supabase.from(TABLE).select('*', { count: 'exact' });

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

  /** جلب العلامات النشطة (للقوائم المنسدلة في فورم المنتج). */
  async getActive(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async create(input: BrandInput): Promise<Brand> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ ...input, slug: generateSlug(input.name) })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, input: BrandInput): Promise<Brand> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ ...input, slug: generateSlug(input.name) })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw error;
  },
};
