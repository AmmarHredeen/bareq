import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { upgradeRequestsKeys } from './useUpgradeRequests';

export function useUpgradeRequestsNotifier() {
  const qc = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/notification.wav');
    audioRef.current.volume = 0.6;
  }, []);

  const playSound = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  useEffect(() => {
    const channel = supabase
      .channel('upgrade-requests-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'upgrade_requests' },
        (payload) => {
          const request = payload.new as { shop_name?: string; manager_name?: string };

          playSound();

          toast.success(
            `طلب ترقية جديد من ${request.shop_name || request.manager_name || 'أحد العملاء'}`,
            { duration: 6000, icon: '🔔' }
          );

          qc.invalidateQueries({ queryKey: upgradeRequestsKeys.all });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
