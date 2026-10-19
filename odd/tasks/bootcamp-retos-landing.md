# Landing oculta de retos — Bootcamp Zero (22/10/2026)

## Objetivo
Recoger, mediante un QR impreso en el evento, qué retos quiere resolver cada
asistente. Encargo del cliente en 9 puntos, recibido el 15/10/2026.

## URL
`https://yutopias.com/es/bootcamp-retos/` — **el QR ya está generado con esta
URL**. Cambiarla obliga a regenerar el QR (y a dejar un redirect si ya se
imprimió).

## Decisiones
- **Solo español.** El cliente pidió la URL en `/es`. Las claves i18n se
  añaden igualmente en `en.json`/`ca.json` con el texto español como relleno
  inerte, porque `check:i18n-parity` exige los mismos paths en los 3 locales.
  Si hiciera falta catalán (evento con APCE Catalunya), es añadir el locale a
  `generateStaticParams` y traducir el bloque.
- **Oculta**: `robots: noindex, nofollow`, fuera de `src/app/sitemap.ts` (que
  usa lista explícita) y sin enlaces desde nav, footer ni ninguna página.
  Verificado sobre el build: `grep -rl bootcamp-retos out --include=*.html`
  devuelve solo la propia página.
- **Todo el copy en i18n** (`bootcampRetosPage`): el cliente avisó de que el
  texto de los retos aún podía cambiar.
- **Sin email al asistente ni notificación interna.** No se pidió, y 60
  escaneos simultáneos generarían 60 correos. Añadirlo es trivial si se quiere.
- **La tabla se auto-crea** en el primer envío (patrón de
  `openlab-contact.php`), para no depender de una migración manual el día del
  evento. También queda documentada en `scripts/db-setup-production.sql`.
- **Sin UNIQUE por email**: en un evento se quieren todas las respuestas, no un
  upsert como en `bootcamp_leads`.
- **Límite por IP = 200/hora**, no 5 como en `openlab-contact.php`: los
  asistentes comparten el WiFi de la sede y salen todos con la misma IP
  pública. Un límite bajo habría bloqueado a la mayoría.
- **Honeypot llamado `contact_ref`, no `website`**: hay sospecha fundada de que
  el autorrelleno de Chrome rellena el campo `website` de `BootcampLeadForm` y
  provoca rechazos silenciosos de envíos legítimos (incidencia reportada por
  Juanjo el 15/10; el servidor no registró ni un POST suyo).
- Los retos viajan como **claves** (`predictive`, `deviations`, `objectives`,
  `eu_taxonomy`, `dashboards`), validadas contra lista blanca en el servidor;
  el panel las traduce a etiquetas al mostrarlas. El cliente nunca puede meter
  texto arbitrario en esa columna.

## Piezas
- `src/app/[locale]/(site)/bootcamp-retos/page.tsx` — ruta, metadatos, textos.
- `src/components/sections/bootcamp-retos/BootcampRetosForm.tsx` — formulario.
- `public/api/bootcamp-challenges.php` — endpoint (PHP 7.2 compatible, que es
  la versión del servidor).
- `public/admin/{index,api,export}.php` — sección "Retos" con grilla y CSV.
- `scripts/make-qr.mjs` + `qrcode` (devDependency) — generación local del QR,
  sin enviar la URL a ningún servicio externo. La salida (`/qr/`) no se
  versiona.

## Verificación hecha
- `lint`, `lint:palette`, `check:i18n-parity`, `check:json-bom`, `build`: verde.
- `php -l` en el endpoint y en los 3 archivos del panel.
- Endpoint ejercitado con curl contra `php -S`: envío válido pasa validación y
  corta en PDO (sin MySQL local, esperado); sin consentimiento, sin ningún
  reto, reto fuera de lista blanca, sin empresa y email inválido → 400;
  honeypot relleno y envío instantáneo → 200 silencioso; sin Origin → 403;
  GET → 405.
- QR decodificado con `jsqr` → coincide exactamente con la URL esperada.

## Despliegue
1. Merge a `main`: el workflow sube `out/` y `public/api/` (landing + endpoint).
2. **El panel admin va aparte, por SFTP** (`scripts/deploy-production.js`):
   hay que subir `index.php`, `api.php` y `export.php`.
3. La tabla se crea sola con el primer envío; no hay migración que ejecutar.
4. Prueba en producción: enviar una respuesta y verla en el panel.

## Pendiente
- Confirmar la URL definitiva con el cliente antes de imprimir el QR.
- Textos finales de los retos (el cliente los estaba esperando).
