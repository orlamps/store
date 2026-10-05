import { getContenido } from '@/app/actions/contenido';
import AdminLegalClient from '@/components/admin/AdminLegalClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata = { title: 'Textos Legales — Admin OrLamps' };

export default async function AdminLegalPage() {
  const contenido = await getContenido();
  return <AdminLegalClient contenido={contenido} />;
}
