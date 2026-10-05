import { getPedidosAdmin, getUserRole } from '@/app/actions/pedidos';
import AdminPedidosClient from '@/components/admin/AdminPedidosClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = { title: 'Pedidos — Admin OrLamps' };

export default async function AdminPedidosPage() {
  const [{ data: pedidos }, role] = await Promise.all([
    getPedidosAdmin(),
    getUserRole()
  ]);
  return <AdminPedidosClient pedidos={(pedidos || []) as any[]} role={role} />;
}
