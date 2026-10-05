import { getProductosAdmin } from '@/app/actions/productos';
import { getCategoriasAdmin } from '@/app/actions/categorias';
import { getUserRole } from '@/app/actions/pedidos';
import AdminProductosClient from '@/components/admin/AdminProductosClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = { title: 'Productos — Admin OrLamps' };

export default async function AdminProductosPage() {
  const [{ data: productos }, { data: categorias }, role] = await Promise.all([
    getProductosAdmin(),
    getCategoriasAdmin(),
    getUserRole(),
  ]);

  return (
    <AdminProductosClient
      productos={(productos || []) as any[]}
      categorias={(categorias || []) as any[]}
      role={role}
    />
  );
}
