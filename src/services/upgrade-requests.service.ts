import { supabase } from '@/lib/supabase';
import type { UpgradeRequest } from '@/types/upgrade-request.types';
import type { Profile } from '@/types/database.types';

const TABLE = 'upgrade_requests';

export const upgradeRequestsService = {
  async getAll(): Promise<UpgradeRequest[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const requests = data ?? [];

    const userIds = [
      ...new Set(requests.map((r) => r.user_id).filter(Boolean)),
    ];
    const reviewerIds = [
      ...new Set(requests.map((r) => r.reviewed_by).filter(Boolean)),
    ];
    const allIds = [...new Set([...userIds, ...reviewerIds])];

    if (allIds.length === 0) return requests as unknown as UpgradeRequest[];

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', allIds);

    if (profileError) throw profileError;

    const profileMap = new Map<string, Profile>(
      (profiles ?? []).map((p) => [p.id, p])
    );

    return requests.map((r) => ({
      ...r,
      user: profileMap.get(r.user_id) ?? null,
      reviewer: r.reviewed_by ? (profileMap.get(r.reviewed_by) ?? null) : null,
    })) as unknown as UpgradeRequest[];
  },

  async approve(
    id: string,
    reviewedBy: string
  ): Promise<void> {
    const { data: request, error: fetchError } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (request.status !== 'pending') throw new Error('الطلب ليس في حالة انتظار');

    const { error: updateRoleError } = await supabase
      .from('profiles')
      .update({ role: 'wholesaler' })
      .eq('id', request.user_id);

    if (updateRoleError) throw updateRoleError;

    const { error: updateError } = await supabase
      .from(TABLE)
      .update({
        status: 'approved',
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) throw updateError;
  },

  async reject(
    id: string,
    reviewedBy: string,
    reason: string
  ): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .update({
        status: 'rejected',
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', id);

    if (error) throw error;
  },
};
