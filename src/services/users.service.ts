import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types/entities.types';
import type { PaginatedResult, QueryParams } from '@/types/common.types';

const TABLE = 'profiles';

export interface UserFilters extends QueryParams {
  role?: UserRole | '';
  is_active?: boolean;
  /** إخفاء مستخدم معين من القائمة (لإخفاء الأدمن الرئيسي) */
  excludeEmail?: string;
}

export interface UpdateUserInput {
  full_name?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
  shop_name?: string | null;
  manager_name?: string | null;
  shop_phone?: string | null;
  shop_landline?: string | null;
  shop_address?: string | null;
}

export interface CreateManagerInput {
  email: string;
  password: string;
  full_name: string;
  phone?: string | null;
}

export const usersService = {
  /** جلب المستخدمين مع بحث وفلترة بالدور والحالة وترقيم. */
  async getAll(params: UserFilters = {}): Promise<PaginatedResult<Profile>> {
    const {
      search = '',
      role = '',
      is_active,
      excludeEmail,
      page = 1,
      pageSize = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from(TABLE).select('*', { count: 'exact' });

    if (search.trim()) {
      const term = search.trim();
      query = query.or(
        `email.ilike.%${term}%,full_name.ilike.%${term}%,phone.ilike.%${term}%,shop_name.ilike.%${term}%`
      );
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (typeof is_active === 'boolean') {
      query = query.eq('is_active', is_active);
    }

    if (excludeEmail) {
      query = query.neq('email', excludeEmail);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data ?? [], count: count ?? 0 };
  },

  /** جلب مستخدم واحد. */
  async getById(id: string): Promise<Profile> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  /** تحديث بيانات المستخدم (الحقول العامة وحقول المتجر). */
  async update(id: string, input: UpdateUserInput): Promise<Profile> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** تغيير دور المستخدم. */
  async updateRole(id: string, role: UserRole): Promise<Profile> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ role })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** تفعيل/تعطيل الحساب. */
  async toggleActive(id: string, is_active: boolean): Promise<Profile> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * حذف مستخدم نهائياً من auth.users + profiles.
   * يتطلب service_role عبر Edge Function.
   */
  async deleteUser(id: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: { action: 'delete_user', payload: { userId: id } },
    });
    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || 'فشل الحذف');
  },

  /**
   * إنشاء مدير جديد للوحة التحكم.
   * يستدعي Edge Function آمنة (تستخدم service_role) لإنشاء الحساب في auth.users
   * ثم ضبط الدور 'admin' في profiles.
   */
  async createManager(input: CreateManagerInput): Promise<Profile> {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: { action: 'create_manager', payload: input },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data.profile as Profile;
  },

  /**
   * إعادة تعيين كلمة مرور مستخدم.
   * تتطلب صلاحيات service_role عبر Edge Function.
   */
  async resetPassword(id: string, newPassword: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: {
        action: 'reset_password',
        payload: { userId: id, newPassword },
      },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
  },
};
