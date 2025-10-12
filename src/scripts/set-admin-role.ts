import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setAdminRole() {
  const userId = 'fac39a39-d318-4b41-b573-55a5b55795e7';
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role: 'admin' }
  });
  if (error) {
    console.error('Error actualizando el rol:', error.message);
  } else {
    console.log('Rol actualizado correctamente:', data);
  }
}

setAdminRole();
