import { supabase } from '@/lib/supabase';
import type { StorageOption } from '@/types/entities.types';
import type { PaginatedResult, QueryParams } from '@/types/common.types';
import { buildStorageLabel } from '@/utils/storage';

const TABLE = 'storage_options';

export interface StorageInput {
  ram_gb: number;
  storage_gb: number;
  is_active: boolean;
}

/** معاملات جلب خيارات الذاكرة (تمدّد QueryParams بفلتر الحالة). */
export interface StorageQueryParams extends QueryParams {
  /** true = نشط فقط، false = غير نشط فقط، undefined = الكل */
  is_active?: boolean;
}

export const storageService = {
  /** جلب خيارات الذاكرة مع بحث وفلتر الحالة وترقيم. */
  async getAll(
    params: StorageQueryParams = {}
  ): Promise<PaginatedResult<StorageOption>> {
    const {
      search = '',
      page = 1,
      pageSize = 10,
      sortBy = 'ram_gb',
      sortOrder = 'asc',
      is_active,
    } = params;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from(TABLE).select('*', { count: 'exact' });

    if (search.trim()) {
      query = query.ilike('label', `%${search.trim()}%`);
    }

    // فلتر الحالة (نشط / غير نشط)
    if (typeof is_active === 'boolean') {
      query = query.eq('is_active', is_active);
    }

    // ترتيب ثانوي بالتخزين لضمان ترتيب منطقي
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .order('storage_gb', { ascending: true })
      .range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data ?? [], count: count ?? 0 };
  },

  /** جلب الخيارات النشطة (لفورم المنتج). */
  async getActive(): Promise<StorageOption[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('is_active', true)
      .order('ram_gb', { ascending: true })
      .order('storage_gb', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async create(input: StorageInput): Promise<StorageOption> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        ...input,
        label: buildStorageLabel(input.ram_gb, input.storage_gb),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, input: StorageInput): Promise<StorageOption> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        ...input,
        label: buildStorageLabel(input.ram_gb, input.storage_gb),
      })
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
