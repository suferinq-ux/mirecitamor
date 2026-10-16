# 💞 Nuestro Universo Secreto · 100 Citas

Un rincón privado del internet que **solo existe para dos personas**: tú y tu enamorada.
Inicia sesión, exploran sus **100 citas** (¡incluida la de plastilina! 🎨), marcan las que ya
vivieron, escriben notas secretas y dejan que el destino elija la siguiente aventura.

---

## ✨ Características

- 🔐 **Login para exactamente dos personas** — contraseñas hasheadas con `scrypt` en el servidor,
  sesión firmada con HMAC-SHA256 en cookie `httpOnly`.
- 🧭 **Cinco apartados** — Inicio, Citas, Cartas, Fotos y Música; navegación lateral en
  escritorio y barra inferior en el celular.
- 💯 **Las 100 citas** de su lista con buscador instantáneo (ignora acentos), filtros por
  estado y categoría, ruleta "Sorpréndeme" y notas privadas por cita.
  La cita **#100 es la cita mágica de plastilina** ✨.
- 💌 **Cartas de amor** entre ustedes, escritas sobre papel y guardadas en el servidor.
- 📷 **Galería privada** — las fotos se comprimen en el navegador y no viven en ninguna nube ajena.
- 🎵 **Nuestras canciones** — suban audio y suena con el reproductor integrado.
- ☁️ **Todo sincronizado entre los dos** — progreso, cartas, fotos y música viven en el
  servidor (archivo local en dev / Vercel KV en producción), no en el navegador.
- 💞 Contador de **días juntos** (configurable por fecha de aniversario).
- 🫀 **3D refinado** — corazones de cristal extruidos en Three.js, tarjetas con inclinación
  3D al pasar el cursor, pétalos sutiles.

## 🧰 Tecnologías

| Capa      | Tecnología                                            |
| --------- | ----------------------------------------------------- |
| Framework | Next.js 15 (App Router) + TypeScript                   |
| UI        | React 19, Tailwind CSS, Framer Motion                  |
| 3D        | Three.js + @react-three/fiber + @react-three/drei      |
| Seguridad | scrypt, HMAC-SHA256, cookies httpOnly, CSP, HSTS       |
| Deploy    | Vercel                                                 |

---

## 🚀 Correr en local

```bash
npm install
npm run dev
```

Con el `.env.local` incluido puedes entrar de inmediato:

- Cuentas: **José** / **Mireya** (ya configuradas en el `.env.local`)
- Contraseña demo de ambas: `amor123`

> En producción ese aviso demo desaparece solo.

## 🔑 Configurar SUS credenciales reales

1. Nombres visibles:

   ```env
   NEXT_PUBLIC_NAME_1=TuNombre
   NEXT_PUBLIC_NAME_2=SuNombre
   NEXT_PUBLIC_ANNIVERSARY=2024-02-14   # opcional, para el contador de días
   ```

2. Contraseña de cada uno (pregunta interactiva, nunca se guarda en texto plano):

   ```bash
   npm run password   # → pega el resultado en PASS_HASH_1
   npm run password   # → pega el resultado en PASS_HASH_2
   ```

3. Secreto de sesión:

   ```bash
   npm run secret     # → pega el resultado en SESSION_SECRET
   ```

## ☁️ Desplegar en Vercel

1. Sube este proyecto a un repositorio de GitHub (o usa `npx vercel` directamente).
2. En [vercel.com](https://vercel.com) → **Add New… → Project** → importa el repo
   (Next.js se detecta solo, no necesitas `vercel.json`).
3. En **Settings → Environment Variables** agrega (Production + Preview):

   | Variable                  | Valor                              |
   | ------------------------- | ---------------------------------- |
   | `NEXT_PUBLIC_NAME_1`      | Tu nombre                          |
   | `NEXT_PUBLIC_NAME_2`      | Su nombre                          |
   | `NEXT_PUBLIC_ANNIVERSARY` | (opcional) `AAAA-MM-DD`            |
   | `PASS_HASH_1`             | hash generado con `npm run password` |
   | `PASS_HASH_2`             | hash generado con `npm run password` |
   | `SESSION_SECRET`          | salida de `npm run secret`         |

4. **Deploy**. Listo: `https://tu-proyecto.vercel.app` será su universo privado. 💫

> ⚠️ Nunca subas tu `.env.local` a git ni copies los hashes demo a Vercel:
> genera hashes y secreto nuevos para producción.

## ☁️ Dónde vive todo

Progreso, cartas, fotos y música se guardan en la **bóveda del servidor** (`src/lib/vault-store.ts`):

| Entorno          | Almacenamiento                                        |
| ---------------- | ----------------------------------------------------- |
| Desarrollo local | Archivos en `data/` (gitignoreado)                    |
| Vercel           | **Upstash Redis (KV)** — ver abajo                    |
| Sin KV en Vercel | Memoria de la instancia (⚠️ se pierde al redeplegar)  |

**Para producción (recomendado, 1 minuto):** en Vercel → **Storage → Create Database →
Upstash (Redis)** → conecta el database a tu proyecto. Vercel inyecta solo las variables
`UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`. Con eso, todo lo que José y Mireya
vivan queda guardado para siempre y sincronizado entre sus celulares. 💞

Límites de subida: 3.5 MB por archivo (las fotos se comprimen solas a ~300 KB en el navegador).

##  Seguridad implementada

- Contraseñas **nunca en texto plano**: hash `scrypt` (N=16384) comparado con `timingSafeEqual`.
- Sesión = cookie `httpOnly` + `Secure` + `SameSite=Strict`, firmada con **HMAC-SHA256** y expiración.
- **Middleware Edge** que bloquea `/amor` sin sesión válida (no es solo UI oculta).
- **Rate limiting** de intentos de login por IP en servidor + bloqueo temporal en cliente.
- Cabeceras duras: **CSP**, **HSTS**, `X-Frame-Options: DENY`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-*`.
- Sin bases de datos ni terceros: los recuerdos viven solo en el navegador de ustedes.
- React escapa todo el contenido renderizado (sin `dangerouslySetInnerHTML`, sin `eval`).

## 🗂️ Estructura

```
src/
  app/
    page.tsx              → portada / login
    amor/page.tsx         → panel privado (protegido por middleware)
    api/login|logout      → autenticación
    api/progress          → citas vividas (GET/PUT)
    api/letters           → cartas (GET/POST/DELETE)
    api/media, media/[id] → fotos y música (subida, listado, bytes)
  components/
    Scene3D.tsx           → corazones de cristal (Three.js)
    LoginForm.tsx         → acceso de dos llaves
    Dashboard.tsx         → shell con los cinco apartados
    ui.tsx                → iconos SVG, modales, tilt 3D
    sections/             → Home, Dates, Letters, Gallery, Music
  lib/
    dates.ts              → las 100 citas 💌
    auth.ts · session.ts  → scrypt + HMAC
    vault-store.ts        → bóveda (KV / archivo / memoria)
scripts/                  → generadores de hash y secreto
```

Hecho con amor infinito. 💞
