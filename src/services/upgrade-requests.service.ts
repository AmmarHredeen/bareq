import { supabase } from '@/lib/supabase';
import type { UpgradeRequest } from '@/types/upgrade-request.types';
import type { Profile } from '@/types/entities.types';

// جدول upgrade_requests ليس في الأنواع المولّدة
const tb = () => (supabase as any).from('upgrade_requests');

export const upgradeRequestsService = {
  async getAll(): Promise<UpgradeRequest[]> {
    const { data, error } = await tb()
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const requests: any[] = data ?? [];

    const userIds = [
      ...new Set(requests.map((r: any) => r.user_id).filter(Boolean)),
    ];
    const reviewerIds = [
      ...new Set(requests.map((r: any) => r.reviewed_by).filter(Boolean)),
    ];
    const allIds: string[] = [...new Set([...userIds, ...reviewerIds])];

    if (allIds.length === 0) return requests as unknown as UpgradeRequest[];

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', allIds);

    if (profileError) throw profileError;

    const profileMap = new Map<string, Profile>(
      (profiles ?? []).map((p) => [p.id, p])
    );

    return requests.map((r: any) => ({
      ...r,
      user: profileMap.get(r.user_id) ?? null,
      reviewer: r.reviewed_by ? (profileMap.get(r.reviewed_by) ?? null) : null,
    })) as unknown as UpgradeRequest[];
  },

  async approve(
    id: string,
    reviewedBy: string
  ): Promise<void> {
    const { data: request, error: fetchError } = await tb()
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    const req = request as any;
    if (req.status !== 'pending') throw new Error('الطلب ليس في حالة انتظار');

    const { error: updateRoleError } = await supabase
      .from('profiles')
      .update({ role: 'wholesaler' as any })
      .eq('id', req.user_id);

    if (updateRoleError) throw updateRoleError;

    const { error: updateError } = await tb()
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
    const { error } = await tb()
      .update({
        status: 'rejected',
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', id);

    if (error) throw error;
  },


  async countPending(): Promise<number> {
    const { count, error } = await tb()
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    if (error) throw error;
    return count ?? 0;
  },

};
