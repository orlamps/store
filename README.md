# ORLAMPS — Tienda Virtual

Tienda online completa para ORLAMPS, especialistas en iluminación & diseño.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS v4 · Supabase · Resend

---

## 🚀 Instalación

### Paso 1 — Instalar dependencias

Abre una terminal **en la carpeta `orlamps-store`** y ejecuta:

```bash
npm install
```

### Paso 2 — Configurar variables de entorno

Copia el archivo de ejemplo y rellena tus credenciales:

```bash
cp .env.example .env.local
```

Edita `.env.local` con:

| Variable | Dónde obtenerla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | [supabase.com](https://supabase.com) → tu proyecto → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Mismo lugar → `anon public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Mismo lugar → `service_role` (secreto) |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys |
| `RESEND_FROM_EMAIL` | Tu email verificado en Resend |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Tu número con código de país, sin espacios |

### Paso 3 — Crear las tablas en Supabase

1. Entra a tu proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor**
3. Copia y pega todo el contenido del archivo `supabase-migration.sql`
4. Haz click en **Run**

### Paso 4 — Crear el usuario administrador

En Supabase:
1. Ve a **Authentication → Users → Add user**
2. Crea tu usuario con email y contraseña
3. Ve a **Table Editor → profiles**
4. Edita tu fila y cambia el campo `role` a `propietario`

### Paso 5 — Arrancar la aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 📋 Páginas

| URL | Descripción |
|---|---|
| `/` | Inicio — Hero, categorías y productos destacados |
| `/tienda` | Catálogo completo con filtro por categoría |
| `/tienda/[slug]` | Página individual de cada producto |
| `/quienes-somos` | Quiénes somos |
| `/contacto` | Formulario de contacto + datos |
| `/login` | Acceso al panel admin |
| `/admin` | Dashboard del panel admin |
| `/admin/productos` | Gestionar productos |
| `/admin/categorias` | Gestionar categorías |
| `/admin/pedidos` | Ver y gestionar pedidos |
| `/admin/visitas` | Visitas en tiempo real |
| `/admin/contenido` | Editar textos del sitio |

---

## ✏️ Editar el contenido del sitio

Todo el contenido editable (textos de inicio, quiénes somos, datos de contacto) se gestiona desde:

**`/admin/contenido`**

Sin tocar el código. Los cambios se publican al instante.

---

## 🛍️ Agregar productos

1. Ve a `/login` e inicia sesión como administrador
2. En el panel, ve a **Productos → Nuevo Producto**
3. Completa el formulario (igual que agregar un post de blog)
4. Marca como **Destacado** para que aparezca en la portada

---

## 💳 Pasarelas de pago

Por defecto la tienda usa:
- **WhatsApp** — el cliente escribe al número y coordinan el pago manualmente
- **Formulario de pedido** — el cliente llena sus datos y el admin lo gestiona

Para agregar **PayPal** o **Stripe** en el futuro, ya están las dependencias instaladas. Consúltame y lo integramos.

---

## 📁 Estructura del proyecto

```
orlamps-store/
├── app/
│   ├── actions/          # Server actions (productos, categorias, pedidos...)
│   ├── admin/            # Panel de administración
│   ├── tienda/           # Catálogo y páginas de productos
│   ├── quienes-somos/
│   ├── contacto/
│   └── login/
├── components/
│   ├── admin/            # Sidebar, modals, tablas admin
│   └── tienda/           # Componentes del catálogo
├── lib/
│   └── supabase/         # Clientes server/browser/middleware
├── public/               # Logo y favicon
└── supabase-migration.sql  # SQL para crear las tablas
```

---

## 🎨 Colores ORLAMPS

| Variable CSS | Valor | Uso |
|---|---|---|
| `--gold` | `#9B6F2F` | Acento dorado principal |
| `--gold-light` | `#C49A4A` | Hover dorado |
| `--black` | `#1A1A1A` | Fondo oscuro / negro del logo |
| `--gold-bg` | `#FBF6EE` | Fondo dorado suave |
