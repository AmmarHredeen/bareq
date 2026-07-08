import { supabase } from '@/lib/supabase';
import type { Material } from '@/types/database.types';
import type { PaginatedResult, QueryParams } from '@/types/common.types';
import { generateSlug } from '@/utils/slug';

const TABLE = 'materials';

export interface MaterialInput {
  name: string;
  description?: string | null;
  is_active: boolean;
}

export const materialsService = {
  /** جلب الخامات مع بحث وترقيم وترتيب. */
  async getAll(params: QueryParams = {}): Promise<PaginatedResult<Material>> {
    const {
      search = '',
      page = 1,
      pageSize = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from(TABLE).select('*', { count: 'exact' });

    if (search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data ?? [], count: count ?? 0 };
  },

  /** جلب الخامات النشطة (لفورم المنتج). */
  async getActive(): Promise<Material[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async create(input: MaterialInput): Promise<Material> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ ...input, slug: generateSlug(input.name) })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, input: MaterialInput): Promise<Material> {
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
