import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { Order } from '@/types/database.types';

interface Options {
  onNewOrder?: (order: Order) => void;
  soundEnabled?: boolean;
}

export function useNewOrdersNotifier({
  onNewOrder,
  soundEnabled = true,
}: Options = {}) {
  const qc = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

useEffect(() => {
  audioRef.current = new Audio('/notification.wav');
  audioRef.current.volume = 0.6;
}, []);


  // 2) تفعيل الصوت بعد أول تفاعل من المستخدم (لتجاوز سياسة المتصفح)
  useEffect(() => {
    const unlock = () => {
      audioRef.current
        ?.play()
        .then(() => {
          audioRef.current!.pause();
          audioRef.current!.currentTime = 0;
        })
        .catch(() => {});
      window.removeEventListener('click', unlock);
    };
    window.addEventListener('click', unlock);
    return () => window.removeEventListener('click', unlock);
  }, []);

  const playSound = () => {
    if (!soundEnabled || !audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      /* المتصفح قد يمنع التشغيل قبل أول تفاعل */
    });
  };

  // 3) الاشتراك في الطلبات الجديدة عبر Realtime
  useEffect(() => {
    const channel = supabase
      .channel('orders-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const order = payload.new as Order;

          playSound();

          toast.success(`طلب جديد: ${order.order_number ?? ''}`, {
            duration: 6000,
            icon: '🔔',
          });

          qc.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
          qc.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });

          onNewOrder?.(order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundEnabled]);
}
