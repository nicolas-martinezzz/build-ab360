# Bootcamp Zero × APCE Catalunya — /es/programa

## Objetivo
Aplicar en `/es/programa` los cambios de `ESPECIFICACION.md` (handoff en
`Downloads/bootcamp-zero-para-nico/handoff-nico/`) para la campaña Bootcamp
Zero del 22/10/2026 con APCE Catalunya. Probar todo en local antes de subir a
GitHub/producción.

## Por qué
Encargo de Juanjo. Fuente de verdad: `ESPECIFICACION.md` (si el mockup
`mockup-programa.html` y el documento difieren, manda el documento).

## Alcance y decisiones de producto (confirmadas con el usuario)
- Reorden y contenido nuevo (hero, jornada+form, programa, ponentes, intro
  OpenLab) **solo para `locale === "es"`**. `/en/program` y `/ca/programa`
  quedan exactamente como están hoy — sin tocar.
- Reversión del 22/10 en adelante: **manual, por PR aparte**. No se construye
  ningún mecanismo de fecha en el código.
- Banner verde sitewide: se traduce y actualiza en **los 3 idiomas** (es/en/ca).
- Todos los CTA "Solicita tu plaza / Únete al Bootcamp Zero" (banner, hero,
  journey, logos-strip) se repuntan a un destino fijo
  `/es/programa#bootcamp-formulario` (hardcodeado a `/es`, igual que el
  comportamiento actual de `/reserva-plaza` que tampoco tiene versión en/ca).
  `/reserva-plaza` queda intacta en el código, solo sin tráfico nuevo durante
  la campaña.
- HubSpot: **no hay credenciales todavía** (confirmado con el usuario). Se
  implementa el formulario completo (incluidas las 2 preguntas nuevas) y se
  deja el envío a HubSpot aislado detrás de un chequeo de env var
  (`HUBSPOT_PRIVATE_APP_TOKEN`), sin romper el flujo actual que sigue
  guardando en MySQL (`bootcamp_leads`) + notificación interna. Cuando el
  usuario cree el Private App + propiedades, se activa solo.
- Email "solicitud recibida": lo dispara un **workflow de HubSpot** (no
  backend propio). No hay que escribir plantilla de email PHP para esto.
- i18n parity (`npm run check:i18n-parity`) exige mismas *keys* en los 3
  locales, no mismo contenido: las keys nuevas se agregan también a
  `en.json`/`ca.json` con el texto en español como relleno inerte (no se
  renderizan ahí porque el bloque está condicionado a `es`).

## Hallazgos relevantes (no se tocan en este cambio, solo anotados)
- `ProgramaBootcampSection.tsx` ya existía — resto de una campaña Bootcamp
  Zero anterior (julio) nunca revertida. Se reescribe su contenido.
- El banner sitewide todavía dice "Próximamente en julio" — bug previo que
  esta tarea corrige de paso.
- Transferencia del repo a la org `yutopias` + privado: pendiente, no
  relacionado a esta tarea.

## Tareas

- [x] T1 — Assets: copiados a `public/images/programa/bootcamp-zero/` y
  registrados en `SITE_ASSETS.programa.bootcampZero` (namespace nuevo, sin
  tocar `SITE_ASSETS.solution.ponentes`). Logo gris también en
  `SITE_ASSETS.programa.ecosystemApceCatalunya` para el bloque de ecosistema.
- [x] T2 — Rutas: `BOOTCAMP_ZERO_CTA_HREF = "/es/programa#bootcamp-formulario"`
  añadido en `src/config/routes.ts`. Falta usarlo en los componentes (parte
  de T3/T4/T5/T9).
- [x] T3 — Banner sitewide: `AnnouncementBar.tsx` reescrito para usar un `<a>`
  plano a `BOOTCAMP_ZERO_CTA_HREF` (el `Link` de next-intl duplicaría el
  prefijo de locale porque el href ya incluye `/es`). `LinkButton` ganó un
  prop `external` para el mismo motivo, reutilizado en T4/T5/T9.
  `nav.announcementText`/`announcementLinkLabel` traducidos de verdad en
  es/en/ca (bug de "Próximamente en julio" corregido de paso).
- [x] T4 — Hero de `/programa`: `ProgramaHeroSection.tsx` branchea en
  `locale === "es"` (copy Bootcamp Zero + logo APCE blanco, sin CTA propio ni
  `ProgramaHeroBottomBanner`) vs. el hero OpenLab actual intacto para en/ca.
  CTA de journey y logos-strip repuntados a `BOOTCAMP_ZERO_CTA_HREF` (vía
  `LinkButton external`) en los 3 locales, tal como decidido en T3.
- [x] T5 — `ProgramaBootcampSection.tsx` ahora exporta dos variantes internas
  (`...Es` nueva / `...Default` = contenido actual byte-a-byte) elegidas por
  `getLocale()`, porque el componente es compartido entre los 3 locales y
  en/ca deben seguir mostrando la agenda vieja de 12 ítems + los ponentes
  embebidos sin cambios. La variante es: fecha/venue (link a Google Maps)
  nuevos, sello APCE, 2 párrafos (el 1º sin cambios), tarjeta "Aprobación
  requerida" (icono SVG inline), 2 preguntas radio obligatorias nuevas
  (`BootcampLeadForm` las acepta como props opcionales — si no se pasan,
  renderiza exactamente igual que antes, por eso en/ca quedan intactos), y ya
  no embebe `ProgramaFormadoresSection`. Backend (`bootcamp-lead.php`):
  columnas `lunch`/`company_type` nuevas en MySQL (`scripts/db-setup-production.sql`
  actualizado con CREATE TABLE + ALTER TABLE documentado para DB ya
  existentes), validación estricta de los 2 campos nuevos pero solo cuando
  `locale` empieza por "es" (en/ca nunca los envían, así no se rompe su envío
  actual). Integración HubSpot aislada tras `getenv('HUBSPOT_PRIVATE_APP_TOKEN')`,
  con 2 TODOs marcados para confirmar los nombres internos de las propiedades
  custom.
- [ ] T6 — Nuevo bloque "Programa" (agenda 10:00/10:30/12:00/13:30):
  componente nuevo `ProgramaScheduleSection.tsx`, solo es.
- [ ] T7 — Ponentes (`ProgramaFormadoresSection.tsx`): reemplazar lista por
  los 9 de la especificación, fotos nuevas, quitar los 6 que ya no van.
- [ ] T8 — Nuevo bloque "Cómo funciona OpenLab": componente nuevo
  `ProgramaOpenLabIntroSection.tsx`, solo es.
- [ ] T9 — Reorden `ProgramaPageSections.tsx` condicionado a locale: orden
  Bootcamp Zero completo para `es`; orden actual intacto para en/ca. Logo
  APCE gris añadido al bloque de ecosistema (sin cambiar su texto).
- [ ] T10 — Verificación local: `npm run lint`, `npm run check:i18n-parity`,
  `npm run build`, y revisión visual en `http://localhost:3000/es/programa`
  contra `mockup-programa.html`.

## TDD / checks
No hay modo TDD configurado para este tipo de contenido de marketing (no hay
tests existentes sobre estas secciones). Checks aplicables: lint,
check:i18n-parity, build, y verificación visual manual en navegador local.

## Estrategia de entrega
`ask-on-risk` (default). Se commitea por tarea en una rama feature; push y PR
quedan para cuando el usuario confirme que lo probado en local está OK.

## Estado
En progreso. Explicación completa de hallazgos ya hecha. Próximo paso:
delegar implementación T1–T9 a un agente escritor único, luego T10 verificado
por el orquestador.
