// supabase/functions/admin-users/index.ts
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE = Deno.env.get('SERVICE_ROLE_KEY')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

    // 1) التحقق من هوية المستدعي عبر الـ JWT المرفق
    const authHeader = req.headers.get('Authorization') ?? '';
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser();

    if (callerError || !caller) {
      return json({ error: 'غير مصرّح' }, 401);
    }

    // 2) التأكد أن المستدعي مدير (admin)
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: callerProfile } = await admin
      .from('profiles')
      .select('role, is_active')
      .eq('id', caller.id)
      .single();

    if (!callerProfile || callerProfile.role !== 'admin' || !callerProfile.is_active) {
      return json({ error: 'صلاحيات غير كافية' }, 403);
    }

    const { action, payload } = await req.json();

    // 3) تنفيذ الإجراء المطلوب
    if (action === 'create_manager') {
      const { email, password, full_name, phone } = payload;

      const { data: created, error: createErr } =
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name },
        });

      if (createErr || !created.user) {
        return json({ error: createErr?.message ?? 'تعذّر إنشاء الحساب' }, 400);
      }

      // ضبط الدور والبيانات في profiles (قد يُنشأ الصف تلقائيًا عبر trigger)
      const { data: profile, error: upErr } = await admin
        .from('profiles')
        .upsert(
          {
            id: created.user.id,
            email,
            full_name,
            phone: phone ?? null,
            role: 'admin',
            is_active: true,
          },
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (upErr) {
        return json({ error: upErr.message }, 400);
      }

      return json({ profile }, 200);
    }

    if (action === 'delete_user') {
      const { userId } = payload;

      if (!userId) {
        return json({ success: false, error: 'معرّف المستخدم مطلوب' });
      }

      const { error: upgradeErr } = await admin
        .from('upgrade_requests')
        .delete()
        .eq('user_id', userId);
      if (upgradeErr) {
        return json({ success: false, error: `upgrade_requests: ${upgradeErr.message}` });
      }

      const { error: ordersErr } = await admin
        .from('orders')
        .delete()
        .eq('user_id', userId);
      if (ordersErr) {
        return json({ success: false, error: `orders: ${ordersErr.message}` });
      }

      const { error: profileErr } = await admin
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (profileErr) {
        return json({ success: false, error: `profiles: ${profileErr.message}` });
      }

      const { error: authErr } = await admin.auth.admin.deleteUser(userId);
      if (authErr) {
        return json({ success: false, error: `auth: ${authErr.message}` });
      }

      return json({ success: true });
    }

    if (action === 'reset_password') {
      const { userId, newPassword } = payload;

      const { error: pwErr } = await admin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (pwErr) {
        return json({ error: pwErr.message }, 400);
      }

      return json({ success: true }, 200);
    }

    return json({ error: 'إجراء غير معروف' }, 400);
  } catch (e) {
    return json({ error: `خطأ داخلي: ${(e as Error).message}` }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
