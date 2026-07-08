import { createClient } from '@supabase/supabase-js';
const supabase = createClient('http://localhost', 'key');
supabase.from('foo').insert({ id: '1' });
