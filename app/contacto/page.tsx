import { getContenido } from '@/app/actions/contenido';
import ContactoClient from '@/components/ContactoClient';
import { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contáctanos para consultas sobre nuestros productos de iluminación y diseño.',
};

export default async function ContactoPage() {
  const contenido = await getContenido();
  return <ContactoClient contenido={contenido} />;
}
