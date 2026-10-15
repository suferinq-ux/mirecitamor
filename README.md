# 💞 Nuestro Universo Secreto · 100 Citas

Un rincón privado del internet que **solo existe para dos personas**: tú y tu enamorada.
Inicia sesión, exploran sus **100 citas** (¡incluida la de plastilina! 🎨), marcan las que ya
vivieron, escriben notas secretas y dejan que el destino elija la siguiente aventura.

---

## ✨ Características

- 🔐 **Login para exactamente dos personas** — contraseñas hasheadas con `scrypt` en el servidor,
  sesión firmada con HMAC-SHA256 en cookie `httpOnly`.
- 💯 **Las 100 citas** de su lista, con emoji, categoría y un tip romántico cada una.
  La cita **#100 es la cita mágica de plastilina** ✨.
- 🫀 **Animaciones 3D** — corazones extruidos en Three.js (react-three-fiber) que laten y flotan,
  partículas, pétalos cayendo, explosiones de corazones al completar citas.
- 💫 **Ruleta "Sorpréndeme"** — el destino elige la próxima cita entre las pendientes.
- 📔 **Notas secretas** por cita + muro de "momentos vividos".
- 💞 Contador de **días juntos** (configurable por fecha de aniversario).
- 📱 Progreso guardado **localmente en el dispositivo de cada uno** (privado, sin bases de datos).

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

## 🔒 Seguridad implementada

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
    page.tsx            → portada / login
    amor/page.tsx       → panel privado (protegido)
    api/login|logout    → autenticación serverless
    middleware.ts       → candado del panel
  components/
    Scene3D.tsx         → corazones 3D (Three.js)
    LoginForm.tsx       → acceso de dos llaves
    Dashboard.tsx       → las 100 citas, ruleta, momentos
    Petals.tsx          → lluvia de pétalos
  lib/
    dates.ts            → las 100 citas 💌
    auth.ts / session.ts / store.ts
scripts/                → generadores de hash y secreto
```

Hecho con amor infinito. 💞
