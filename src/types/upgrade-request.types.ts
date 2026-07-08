import type { Profile } from '@/types/database.types';

export type UpgradeRequestStatus = 'pending' | 'approved' | 'rejected';

export interface UpgradeRequest {
  id: string;
  user_id: string;
  shop_name: string;
  manager_name: string;
  shop_phone: string;
  shop_landline: string | null;
  shop_address: string;
  status: UpgradeRequestStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  user: Profile | null;
  reviewer: Profile | null;
}
