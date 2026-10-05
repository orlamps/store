import { getCategoriasAdmin } from '@/app/actions/categorias';
import { getUserRole } from '@/app/actions/pedidos';
import AdminCategoriasClientWrapper from '@/components/admin/AdminCategoriasClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = { title: 'Categorías — Admin OrLamps' };

export default async function AdminCategoriasPage() {
  const [{ data: categorias }, role] = await Promise.all([
    getCategoriasAdmin(),
    getUserRole(),
  ]);
  return <AdminCategoriasClientWrapper categorias={(categorias || []) as any[]} role={role} />;
}
