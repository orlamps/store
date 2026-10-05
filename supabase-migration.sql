-- ==========================================
-- ORLAMPS STORE - SUPABASE MIGRATION
-- Copia y pega esto en el SQL Editor de Supabase
-- ==========================================

-- 1. Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Crear Tablas

-- Tabla perfiles (conectada a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text,
  apellido text,
  email text,
  role text DEFAULT 'usuario',
  created_at timestamptz DEFAULT now()
);

-- Tabla categorias
CREATE TABLE IF NOT EXISTS public.categorias (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  slug text UNIQUE NOT NULL,
  descripcion text,
  orden integer DEFAULT 0,
  activa boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabla productos
CREATE TABLE IF NOT EXISTS public.productos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  slug text UNIQUE NOT NULL,
  descripcion text,
  contenido text,
  precio numeric(10,2) NOT NULL,
  precio_oferta numeric(10,2),
  imagen_url text,
  imagenes text[],
  categoria_id uuid REFERENCES public.categorias(id) ON DELETE SET NULL,
  stock integer DEFAULT 0,
  disponible boolean DEFAULT true,
  destacado boolean DEFAULT false,
  orden integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla pedidos
CREATE TABLE IF NOT EXISTS public.pedidos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero text UNIQUE,
  cliente_nombre text,
  cliente_email text,
  cliente_telefono text,
  cliente_direccion text,
  items jsonb,
  total numeric(10,2),
  metodo_pago text DEFAULT 'whatsapp',
  estado text DEFAULT 'pendiente',
  referencia_pago text,
  notas text,
  created_at timestamptz DEFAULT now()
);

-- Tabla visitas (Analytics)
CREATE TABLE IF NOT EXISTS public.visitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  pagina text,
  pais text,
  ciudad text,
  referrer text,
  user_agent text,
  activo boolean DEFAULT true,
  ultimo_ping timestamptz DEFAULT now(),
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duracion_seg numeric,
  created_at timestamptz DEFAULT now()
);

-- Tabla contenido estático
CREATE TABLE IF NOT EXISTS public.contenido_sitio (
  clave text PRIMARY KEY,
  valor text,
  updated_at timestamptz DEFAULT now()
);

-- 3. Triggers para updated_at y perfiles automáticos

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_productos_updated_at ON public.productos;
CREATE TRIGGER update_productos_updated_at
  BEFORE UPDATE ON public.productos
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre)
  VALUES (new.id, new.email, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Inserción de Contenido Base Inicial (con datos de Ecuador / info@orlamps.site)
INSERT INTO public.contenido_sitio (clave, valor)
VALUES 
  ('hero_titulo', 'ORLAMPS'),
  ('hero_subtitulo', 'Iluminación & Diseño de Interiores'),
  ('hero_descripcion', 'Descubre nuestra colección de lámparas exclusivas, diseñadas para transformar tus espacios con elegancia y estilo.'),
  ('quienes_somos_titulo', 'Nuestra Historia'),
  ('quienes_somos_texto', 'Somos ORLAMPS, especialistas en iluminación y diseño de interiores. Creamos y seleccionamos piezas únicas que aportan carácter a cada ambiente.'),
  ('quienes_somos_mision', 'Iluminar hogares y negocios con diseños excepcionales, ofreciendo calidad garantizada y atención personalizada.'),
  ('contacto_telefono', ''),
  ('contacto_whatsapp', '593958941977'),
  ('contacto_email', 'info@orlamps.site'),
  ('contacto_direccion', 'Quito, Ecuador'),
  ('contacto_instagram', '@orlamps'),
  ('contacto_facebook', 'facebook.com/orlamps'),
  ('contacto_tiktok', '@orlamps'),
  ('contacto_pinterest', 'pinterest.com/orlamps'),
  ('iva_porcentaje', '15'),
  ('precios_incluyen_iva', 'si'),
  ('payphone_recargo_porcentaje', '6.1')
ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor;

-- 5. Configurar Storage (Imágenes de productos)
INSERT INTO storage.buckets (id, name, public) VALUES ('orlamps', 'orlamps', true) ON CONFLICT DO NOTHING;

-- 6. Row Level Security (RLS)

-- Activar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contenido_sitio ENABLE ROW LEVEL SECURITY;

-- Políticas Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas Categorías
CREATE POLICY "Categorias visibles para todos" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Categorias modificables por admin" ON public.categorias USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('propietario', 'administrador')));

-- Políticas Productos
CREATE POLICY "Productos visibles para todos" ON public.productos FOR SELECT USING (true);
CREATE POLICY "Productos modificables por admin" ON public.productos USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('propietario', 'administrador')));

-- Políticas Pedidos
CREATE POLICY "Pedidos insertables por cualquiera" ON public.pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Pedidos modificables por admin" ON public.pedidos USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('propietario', 'administrador')));

-- Políticas Visitas
CREATE POLICY "Visitas insertables por cualquiera" ON public.visitas FOR INSERT WITH CHECK (true);
CREATE POLICY "Visitas actualizables por cualquiera" ON public.visitas FOR UPDATE USING (true);
CREATE POLICY "Visitas visibles por admin" ON public.visitas FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('propietario', 'administrador')));

-- Políticas Contenido
CREATE POLICY "Contenido visible por todos" ON public.contenido_sitio FOR SELECT USING (true);
CREATE POLICY "Contenido modificable por admin" ON public.contenido_sitio USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('propietario', 'administrador')));

-- Políticas Storage
CREATE POLICY "Imágenes visibles por todos" ON storage.objects FOR SELECT USING (bucket_id = 'orlamps');
CREATE POLICY "Imágenes modificables por admin" ON storage.objects USING (bucket_id = 'orlamps' AND auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('propietario', 'administrador')));
