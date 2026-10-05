import { getContenido } from '@/app/actions/contenido';
import AdminContenidoClient from '@/components/admin/AdminContenidoClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = { title: 'Editar Contenido — Admin OrLamps' };

export default async function AdminContenidoPage() {
  const contenido = await getContenido();
  return <AdminContenidoClient contenido={contenido} />;
}
