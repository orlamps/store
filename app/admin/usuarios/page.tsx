import { redirect } from 'next/navigation';
import { getUsuariosAdmin } from '@/app/actions/usuarios';
import AdminUsuariosClient from '@/components/admin/AdminUsuariosClient';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function AdminUsuariosPage() {
  // Solo el propietario puede entrar a esta página
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: perfil } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (perfil?.role !== 'propietario') redirect('/admin');

  const { data: usuarios, error } = await getUsuariosAdmin();

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>
      <AdminUsuariosClient usuarios={usuarios} />
    </div>
  );
}
