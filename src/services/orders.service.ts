import { supabase } from '@/lib/supabase';
import type {
  Order,
  OrderWithRelations,
  OrderStatus,
  OrderFulfillmentType,
} from '@/types/database.types';
import type { PaginatedResult, QueryParams } from '@/types/common.types';

const TABLE = 'orders';

// الأعمدة مع العميل (من profiles) وعناصر الطلب
const SELECT_WITH_RELATIONS = `
  *,
  customer:profiles!orders_user_id_profiles_fkey(id, full_name, email, phone, shop_name),
  items:order_items(*)
`;


export interface OrderFilters extends QueryParams {
  status?: OrderStatus | '';
  fulfillment_type?: OrderFulfillmentType | '';
}

export const ordersService = {
  /** جلب الطلبات مع العميل والعناصر + بحث/فلترة/ترقيم. */
  async getAll(
    params: OrderFilters = {}
  ): Promise<PaginatedResult<OrderWithRelations>> {
    const {
      search = '',
      status = '',
      fulfillment_type = '',
      page = 1,
      pageSize = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(TABLE)
      .select(SELECT_WITH_RELATIONS, { count: 'exact' });

    // بحث برقم الطلب أو هاتف التوصيل
    if (search.trim()) {
      const s = search.trim();
      query = query.or(
        `order_number.ilike.%${s}%,delivery_phone.ilike.%${s}%`
      );
    }

    if (status) query = query.eq('status', status);
    if (fulfillment_type)
      query = query.eq('fulfillment_type', fulfillment_type);

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: (data as unknown as OrderWithRelations[]) ?? [],
      count: count ?? 0,
    };
  },

  /** جلب طلب واحد بالتفصيل. */
  async getById(id: string): Promise<OrderWithRelations> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_WITH_RELATIONS)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as unknown as OrderWithRelations;
  },

  /** تأكيد الطلب. */
  async confirm(id: string): Promise<Order> {
    return updateStatus(id, {
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    });
  },
  async countPending(): Promise<number> {
  const { count, error } = await supabase
    .from(TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');
  if (error) throw error;
  return count ?? 0;
},


  /** تسليم الطلب. */
 async deliver(id: string, fulfillmentType: OrderFulfillmentType): Promise<Order> {
  return updateStatus(id, {
    status: 'delivered',
    fulfillment_type: fulfillmentType,
    delivered_at: new Date().toISOString(),
  });
},


  /** رفض الطلب مع سبب. */
  async reject(id: string, reason: string): Promise<Order> {
    return updateStatus(id, {
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      reject_reason: reason,
    });
  },

  /** إلغاء الطلب مع سبب. */
  async cancel(id: string, reason: string): Promise<Order> {
    return updateStatus(id, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason,
    });
  },
};

// دالة داخلية موحّدة لتحديث الحالة
async function updateStatus(
  id: string,
  patch: Partial<Order>
): Promise<Order> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
