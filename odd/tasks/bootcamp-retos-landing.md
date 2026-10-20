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

## Revisión 20/10/2026 — maquetas del cliente

El cliente entregó tres maquetas HTML exportadas de su herramienta de diseño
(`Prototipo interactivo`, `Maqueta 1 · sin contacto`, `Maqueta 2 · con
contacto`: el mismo artboard de 390 px con tres estados). Son **referencia de
diseño**, no código: los valores viven en los `style=` en línea y se replican
con los tokens del proyecto, no se copian.

### Qué cambia
- **Los seis retos llevan tres líneas**: título, el problema en palabras del
  asistente y lo que querría conseguir (`Quiero: …`). Antes era una etiqueta
  plana por reto. Las **claves no cambian** (`predictive`, `deviations`,
  `objectives`, `eu_taxonomy`, `dashboards`), así que el contrato con el
  endpoint y los datos ya guardados siguen siendo válidos.
- **"Otro reto" es la sexta tarjeta** y abre su `textarea` dentro de la propia
  tarjeta al marcarla.
- **El contacto pasa de dos radios (Sí/No) a una sola casilla.** Marcarla
  despliega el bloque de datos (nombre, empresa, correo) y el consentimiento.
- **Se aceptan respuestas anónimas.** Sin esa casilla no se piden —ni se
  guardan— datos personales. La maqueta lo deja explícito: los campos están
  dentro del bloque condicional, bajo "Para contactarte necesitamos tus datos",
  y el agradecimiento sin contacto dice que los retos sirven igual. Es menos
  dato personal por respuesta, que para un QR en una sala es lo correcto.
- **La pantalla de gracias cambia según el contacto** y ofrece volver al
  formulario.

### Decisiones
- **Columnas NOT NULL intactas.** Una respuesta anónima guarda cadena vacía en
  `full_name`, `email` y `company`. El `CREATE TABLE IF NOT EXISTS` no altera
  una tabla ya creada, así que relajarlas a NULL habría exigido una migración
  manual el día del evento. El panel muestra `(anonimo)` en esas celdas.
- **`privacy_accepted` deja de ser un `1` fijo** y refleja el consentimiento
  real: 0 en las respuestas anónimas, que no lo piden.
- **El servidor borra los datos personales que lleguen sin la casilla**, por si
  un cliente modificado los envía igualmente.
- **Se mantiene la validación de formato del correo**, que la maqueta no tiene:
  quitarla sería perder una comprobación que ya existía.
- **El error se pinta en `green-600`**, no en el `#A2401E` de la maqueta: ese
  color no está en la paleta del proyecto y `lint:palette` lo rechaza. Añadir
  un color de error al sistema es una decisión de diseño aparte.
- **`CHALLENGE_KEYS` vive en `challenges.ts`**, no en el componente. Al
  importarlo un Server Component desde un módulo `"use client"` se convierte en
  una referencia de cliente y el prerender rompe con
  `CHALLENGE_KEYS.map is not a function`.
- **Fondo de la página `surface-light`** (antes `green-50`), siguiendo el
  `#F6F7F4` de la maqueta.

### Verificación hecha
- RED observado: las 8 pruebas nuevas de `BootcampRetosForm.test.tsx` fallan
  contra el componente anterior; GREEN con el nuevo.
- `npm run verify` completo en verde (lint, palette, BOM, paridad i18n, 177
  pruebas, build). Sólo quedan los 3 warnings previos, en otros archivos.
- `php -l` en el endpoint y en `admin/index.php`.
- Endpoint contra `php -S` con credenciales falsas, para pasar del chequeo de
  configuración y llegar a la validación:
  anónimo con un reto → pasa; anónimo sólo con "otro" → pasa; contacto sin
  datos → 400; contacto sin consentimiento → 400; contacto con correo inválido
  → 400; contacto completo → pasa; sin ningún reto → 400; reto fuera de la
  lista blanca → 400.
- Build: `/es/bootcamp-retos` sigue con `noindex, nofollow` y es la única
  página del build que menciona la ruta.
- Navegador a 390 px y a 1150 px: sin desbordamiento horizontal, tarjetas y
  bloque de contacto correctos en ambos.

## Pendiente
- Confirmar la URL definitiva con el cliente antes de imprimir el QR.
- Subir `public/admin/index.php` por SFTP: el workflow no lo despliega.
