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
- ~~Todos los CTA "Solicita tu plaza / Únete al Bootcamp Zero" (banner, hero,
  journey, logos-strip) se repuntan a un destino fijo
  `/es/programa#bootcamp-formulario` (hardcodeado a `/es`, igual que el
  comportamiento actual de `/reserva-plaza` que tampoco tiene versión en/ca).~~
  — decisión SUPERSEDIDA (06/10/2026): el usuario reportó en producción que
  un visitante en inglés o catalán era arrastrado a la versión española sin
  aviso. Nueva decisión: cada CTA lleva a la página de programa DEL IDIOMA
  DEL VISITANTE con scroll a su formulario — `/es/programa#bootcamp-formulario`
  (campaña completa), `/en/program#bootcamp-formulario` y
  `/ca/programa#bootcamp-formulario` (página OpenLab existente, cuyo bloque de
  jornada ya contiene un formulario funcional que guarda en la misma tabla).
  No se traduce nada. Implementado en la rama `fix/bootcamp-cta-locale`:
  `BOOTCAMP_ZERO_CTA_HREF` y el prop `external` de `LinkButton` eliminados
  (ya sin call sites); los CTA usan el `Link` de `@/i18n/navigation` con
  `${getProgramaPathByLocale(locale)}#bootcamp-formulario`, y la variante
  default de `ProgramaBootcampSection` (en/ca) ganó `id="bootcamp-formulario"`
  como único cambio (contenido intacto).
  `/reserva-plaza` queda intacta en el código, solo sin tráfico nuevo durante
  la campaña.
- HubSpot: **no hay credenciales todavía** (confirmado con el usuario). Se
  implementa el formulario completo (incluidas las 2 preguntas nuevas) y se
  deja el envío a HubSpot aislado detrás de un chequeo de env var
  (`HUBSPOT_PRIVATE_APP_TOKEN`), sin romper el flujo actual que sigue
  guardando en MySQL (`bootcamp_leads`) + notificación interna. Cuando el
  usuario cree el Private App + propiedades, se activa solo.
- Email "solicitud recibida": ~~lo dispara un workflow de HubSpot~~ —
  decisión SUPERSEDIDA por el usuario (06/10/2026): se envía por el **SMTP
  propio del servidor** desde `bootcamp-lead.php` (mismo patrón
  `yutopias_mail()` que `diagnostic.php`), solo para envíos con `locale`
  "es*". Ver sección Pendiente.
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
- [x] T6 — `ProgramaScheduleSection.tsx` nuevo (namespace
  `programaPage.schedule`, texto literal del programa enviado a APCE). Todavía
  no está cableado en `ProgramaPageSections.tsx` — eso es parte de T9. No
  tiene contraparte en/ca porque nunca se renderiza para esos locales.
- [x] T7 — `ProgramaFormadoresSection.tsx` gana props opcionales `speakers`/
  `headline` en vez de mutar el array `Formador[]` global: verifiqué que este
  componente SOLO se usa embebido dentro de `ProgramaBootcampSection.tsx`
  (grep confirmó que no hay otro call site), pero como ese embed sigue vivo
  para en/ca con la lista vieja de 11, no podía reemplazar el array por
  defecto sin romperlos. Sin `speakers`, el comportamiento es idéntico a
  hoy (en/ca). La lista nueva de 9 ponentes (con los 6 antiguos quitados:
  Ramón Martín, Paco Gómez, Tere Trepat, Xavier Baño, Genís Roca, Lurdes
  Mochales) se construye y se pasa como `speakers` en T9, donde el bloque se
  monta como sección propia para es.
- [x] T8 — `ProgramaOpenLabIntroSection.tsx` nuevo (namespace
  `programaPage.openlabIntro`): fondo blanco, dos columnas, deliberadamente
  compacto (sin imagen de fondo) para no leerse como un segundo hero. Todavía
  no cableado en `ProgramaPageSections.tsx` (T9).
- [x] T9 — `ProgramaPageSections` ahora recibe `locale` como prop (pasado
  desde `src/app/[locale]/(site)/programa/page.tsx` Y también desde
  `src/app/[locale]/(site)/program/page.tsx` — este segundo call site no
  estaba en el enunciado pero también renderiza `ProgramaPageSections` y
  habría roto el build de no actualizarlo). Orden verificado ANTES de
  tocar nada (`git show` del archivo original): Hero → LogosStrip →
  EcosystemSection (las 8 claves) → InnovationEcosystemSection (ecosistema +
  logos) → JourneySection (tarjetas T1–T6) → QuoteBanner (co-crear el
  sistema) → BootcampSection (jornada, antes al final) → PartnersBanner
  (cierre). Para `es`: Hero (Bootcamp Zero) → BootcampSection (jornada+form)
  → ScheduleSection (programa) → ponentes (`ProgramaFormadoresSection` con
  `speakers`/`headline` de T7 construidos aquí mismo con los 9 nuevos) →
  OpenLabIntroSection → el resto de los 6 bloques en el MISMO orden relativo
  de hoy (LogosStrip, EcosystemSection, InnovationEcosystemSection,
  JourneySection, QuoteBanner, PartnersBanner). Para en/ca: orden idéntico al
  original, sin tocar.
  "ProgramaInnovationEcosystemSection.tsx" confirmado como "el bloque de
  ecosistema" correcto (headline "Forma parte del ecosistema de Innovación
  de la edificación.", grid de logos La Salle R&D/ACCIÓ/GBCe/ITeC/etc. —
  `ProgramaEcosystemSection.tsx` es en realidad "las 8 claves", nombre
  engañoso ya existente en el código). Logo APCE gris añadido ahí como
  tile `wide` destacado, primero en el grid, antes de La Salle R&D — este
  cambio aplica a los 3 locales (no es contenido de campaña).
  `npm run build` completo corrido localmente (no solo lint/parity) para
  confirmar que compila y que `/es/programa`, `/ca/programa` y
  `/en/program` generan estáticamente sin errores.
- [x] T10 — Verificación local, en curso. Dos bugs reales encontrados durante
  la revisión visual con el usuario (ninguno de los dos estaba en el alcance
  original, ambos preexistentes expuestos por este trabajo) y ya arreglados:
  1. `html { scroll-behavior: smooth }` (preexistente, global) rompía el
     salto al ancla `#bootcamp-formulario` en navegaciones entre páginas —
     aterrizaba en un punto intermedio, dejando un hueco en blanco antes de
     "Ponentes". Fix: `data-scroll-behavior="smooth"` en `<html>`
     (`src/app/[locale]/layout.tsx`), recomendado por el propio warning de
     Next.js.
  2. El `<script dangerouslySetInnerHTML>` del intro-shield (preexistente)
     tiraba un error fatal de React ("Encountered a script tag while
     rendering React component") al cambiar de idioma desde el selector,
     porque `LocaleLayout` se re-renderiza del lado del cliente al cruzar el
     segmento `[locale]`, y React no soporta un `<script>` crudo en ese
     caso. Fix intentado (`de3b2c4`): migrado a `next/script` con
     `strategy="beforeInteractive"` — NO alcanzó, mismo crash (el motivo:
     `[locale]/layout.tsx` sigue re-renderizándose en cliente, y eso rompe
     cualquier `<script>`, crudo o `next/script`, que viva ahí).
     Fix definitivo (`e9fba09`): la lógica se movió a
     `src/instrumentation-client.ts` (convención de Next.js 15.3+, corre una
     vez por carga completa de documento, después de parsear el HTML y antes
     de hidratar, fuera del árbol de componentes de React — sobrevive a los
     cambios de locale porque el módulo ya está cargado, no se re-renderiza).
     Se probó primero mover el `<Script>` al layout raíz estático
     (`src/app/layout.tsx`) tal como se había diseñado, pero introducía una
     regresión nueva: un `console.error` de React ("Cannot render a sync or
     defer <script> outside the main document...") en TODA carga de página,
     porque ese `layout.tsx` no renderiza `<html>` él mismo (lo hace
     `[locale]/layout.tsx`, que no se tocó). Se descartó ese approach por
     esa regresión y se usó `instrumentation-client.ts` en su lugar.
     Test de regresión nuevo: `tests/e2e/locale-switch.spec.ts` — reproduce
     el cambio de idioma real vía el selector del header (navegación
     client-side) en los 6 pares de locale dirigidos, verificado que falla
     con el texto exacto del crash contra el código pre-fix y pasa contra el
     fix. `intro-local`, `navigation`, lint y `check:i18n-parity` siguen en
     verde (la única falla, preexistente y no relacionada, es
     `intro-local.spec.ts` › "body has inline background:#000" — el body
     usa `background: var(--color-black)` desde antes de este trabajo, el
     test espera literalmente `#000`/`rgb(0,0,0)`; confirmado que ya fallaba
     en `de3b2c4` sin ninguno de mis cambios).
  Confirmado por el usuario: cambio de idioma funciona en los 3 locales.

## Hallazgos de la code review del PR #1

Los 5 bloqueantes, arreglados en esta rama (archivos:
`public/api/bootcamp-lead.php`, `private/smtp_mailer.php`):

- [x] F1 — Inyección de comandos SMTP: el dot-stuffing de `yutopias_mail()`
  no tenía el modificador `/m` (solo escapaba un punto al inicio del body
  entero). Fix: `'/^\./m'` + normalización del body a CRLF (RFC 5321) antes
  del dot-stuffing. Verificado con harness contra un fake SMTP local que el
  body con `"\n.\n"` ya no produce una línea "." sola. Revisados todos los
  callers de `yutopias_mail` (diagnostic, reserva-plaza, newsletter,
  ebook-lead, bootcamp-lead): todos componen bodies texto/HTML con `\n`;
  la normalización CRLF es segura e idempotente para todos.
- [x] F2 — Mail-bombing: el email "solicitud recibida" salía en cada POST.
  Ahora se gatea con `$isNewLead` derivado de `rowCount()` del upsert
  (`INSERT ... ON DUPLICATE KEY UPDATE`: 1 = insert nuevo, 2 = update,
  0 = sin cambios) — solo un INSERT nuevo dispara el email al solicitante.
  La notificación interna sigue saliendo en cada envío (el staff ve los
  reintentos). Verificado por lectura (sin MySQL local no se puede ejercitar
  el rowCount real).
- [x] F3 — Validación esquivable por `locale`: `lunch`/`companyType` ahora
  se validan contra el allow-list SIEMPRE que vengan presentes (presentes e
  inválidos → 400, en cualquier locale); el locale solo decide la
  obligatoriedad (es* los exige) y el email al solicitante. Cinturón: los
  valores que llegan al INSERT/HubSpot/notificación se re-derivan del
  allow-list (`$lunchDb`/`$companyTypeDb`), nunca del input crudo — esto
  elimina también el 500 por overflow de VARCHAR(16).
- [x] F4 — Datos falsos hacia staff/HubSpot: las líneas de almuerzo/tipo de
  empresa en la notificación y las 2 propiedades custom de HubSpot solo se
  incluyen cuando los campos vinieron presentes y válidos; nunca un
  "No"/"No asociada" fabricado para envíos en/ca que no fueron preguntados.
- [x] F5 — Name sin sanear en emails: nueva `$emailSafe()` (control chars y
  saltos de línea → espacio, truncado igual que el INSERT) aplicada a
  name/role/company/locale en AMBOS cuerpos de email; `htmlspecialchars`
  sobre la versión saneada en el HTML al solicitante. Verificado con harness
  que un name con `"\n.\nMAIL FROM:<x>"` queda aplanado a una sola línea.

No bloqueantes anotados como follow-up (no se tocan en esta rama):
- Boilerplate de headers CORS/validación triplicado entre endpoints.
- Fecha y venue del bootcamp hardcodeados en el email PHP (22/10/2026,
  Hub BStartup) — duplican el contenido de las traducciones.
- Envíos de email síncronos antes de responder al cliente (latencia).
- Riesgo de email duplicado si algún día se arma un workflow de email en
  HubSpot: NO debe armarse ese workflow — el PHP ya envía este email.
- Entidades HTML (`&aacute;` etc.) mezcladas con UTF-8 en el cuerpo del
  email al solicitante.

## Pendiente (follow-up, fuera de esta rama)
- HubSpot: queda explícitamente pendiente a pedido del usuario. El código ya
  está preparado (aislado tras `HUBSPOT_PRIVATE_APP_TOKEN`, ver T5) — falta
  que el usuario cree el Private App + las 2 propiedades custom en el portal
  y confirme sus nombres internos exactos (hoy son placeholders marcados con
  TODO en `public/api/bootcamp-lead.php`). No bloquea el resto del cambio.
  IMPORTANTE: el email de "solicitud recibida" al solicitante ya NO depende
  de HubSpot — se envía desde `bootcamp-lead.php` por el SMTP propio del
  servidor (`yutopias_mail()`, mismo patrón que `diagnostic.php`), solo
  cuando el `locale` del envío empieza por "es" (el form viejo en/ca no lo
  dispara), y su fallo nunca rompe la respuesta del endpoint (la función
  devuelve `false` sin lanzar; solo se registra en `error_log`). Lo único
  que queda en HubSpot es el upsert de contacto con sus propiedades
  (estándar + las 2 custom) detrás del token. La notificación interna a
  `NEWSLETTER_NOTIFY_TO` incluye además las 2 respuestas nuevas (almuerzo de
  networking Sí/No y tipo de empresa Asociada a APCE / No asociada) cuando
  vienen en el payload.

## Campaña extendida a en/ca (07/10/2026) — supersede el alcance es-only

Decisión del usuario (07/10/2026): el alcance es-only original (sección
"Alcance y decisiones de producto") queda SUPERSEDIDO. La campaña Bootcamp
Zero × APCE Catalunya debe estar COMPLETA también en `/en/program` y
`/ca/programa`: hero de campaña, jornada + formulario (con las 2 preguntas
obligatorias), agenda "Programa", los 9 ponentes, sección "Cómo funciona
OpenLab" y el orden de secciones de campaña. Implementado en la rama
`feature/bootcamp-en-ca`.

Qué se tradujo (en/ca, registro profesional neutro, fiel al es que es la
fuente de verdad; en.json 54 keys, ca.json 49 keys):
- `programaPage.hero.bootcamp*` (eyebrow, subtitle, body, collaboration).
- `programaPage.bootcamp.*` keys de campaña (dateLine con la fecha nueva —
  en: "Thursday, October 22, 2026 · 10:00 to 13:30"; ca: "Dijous 22
  d'octubre de 2026 · 10:00 a 13:30" —, apceBadge*, formTitle,
  approval* ("Approval required"/"Aprovació requerida"), noCostLine,
  lunch*, companyType*, ctaCardCta) Y ADEMÁS las keys compartidas con la
  variante vieja que la variante Es ahora renderiza en en/ca y que tenían
  traducciones obsoletas (dateLine decía "July 2026", paragraph2 y
  value1–4Body eran el copy pre-campaña, ctaCardCta decía "Request
  diagnosis..."). Las keys SOLO de la variante Default (agenda1–12*,
  entryCard*, paragraph3, ctaCardHeadline/Subhead/Body, body, entryTitle)
  no se tocaron: no se renderizan y conservan su traducción vieja para el
  revert.
- `programaPage.schedule.*`, `programaPage.openlabIntro.*` y
  `programaPage.bootcampSpeakers.*` completos (nombres propios, marcas de
  cargo CEO/COO/CiNO, "Bootcamp Zero", "OpenLab", "SimuLab Beta", entidades
  y LinkedIn URLs sin traducir).
- `nav.announcementText` ya estaba traducido — no se tocó.

Cambios de código (mínimo diff, pensados para el revert):
- `ProgramaHeroSection.tsx`: `isBootcampZeroHero = true` (antes
  `locale === "es"`); el branch del hero OpenLab queda intacto.
- `ProgramaBootcampSection.tsx`: siempre renderiza la variante Es;
  `ProgramaBootcampSectionDefault` se conserva (supresión de no-usado con
  `void` + comentario).
- `ProgramaPageSections.tsx`: constante `CAMPAIGN_ACTIVE = true`
  documentada; el orden de campaña aplica a los 3 locales, el branch viejo
  se conserva como rama else.
- `public/api/bootcamp-lead.php`: `lunch`/`companyType` ahora OBLIGATORIOS
  para todos los locales (el allow-list ya aplicaba siempre); el email
  "solicitud recibida" al solicitante se envía en los 3 locales con asunto
  y cuerpo según el `locale` recibido (en: "We've received your
  application · Bootcamp Zero"; ca: "Hem rebut la teva sol·licitud ·
  Bootcamp Zero"; es fallback). Guards `$isNewLead`, `$emailSafe` y patrón
  de headers UTF-8 intactos. `$isEsSubmission` eliminado (ya sin usos).

Verificación (07/10/2026): lint 0 errores; i18n-parity 989 keys OK; build
estático OK; texto renderizado de `out/es/programa/index.html` comparado
IDÉNTICO contra una build del main pre-cambio; greps de out/en y out/ca
confirman h1 "Bootcamp Zero", fechas localizadas, "Approval
required"/"Aprovació requerida", las 2 preguntas radio y los 9 ponentes;
Playwright locale-switch + navigation (chromium) 8/8; endpoint ejercitado
con `php -S` + curl: en/ca válidos pasan validación (500 al conectar PDO
sin MySQL local, esperado), payload sin lunch o sin companyType → 400 en
cualquier locale, valor fuera del allow-list → 400.

REVERT POST-22/10 (actualizado): ahora incluye además (1) restaurar
`locale === "es"` en `ProgramaHeroSection`, (2) restaurar el selector
`getLocale()` en `ProgramaBootcampSection`, (3) `CAMPAIGN_ACTIVE = false`
en `ProgramaPageSections`, (4) decidir qué hacer con la obligatoriedad
universal y el email localizado en `bootcamp-lead.php` (si en/ca vuelven
al form viejo sin las 2 preguntas, la obligatoriedad universal rompería
sus envíos — revertir a la condición por locale o retirar el form viejo).

## Eliminación de /reserva-plaza (07/10/2026)

Decisión del usuario (07/10/2026): la página "Únete al Bootcamp Zero / Tres
pasos para entrar" (`/es/reserva-plaza`, `/en/book-your-spot`,
`/ca/reserva-placa`) se ELIMINA del proyecto. Motivo: un solo formulario de
inscripción — el de la campaña en la página de programa de cada idioma
(`getProgramaPathByLocale(locale) + "#bootcamp-formulario"`). Implementado en
la rama `feat/remove-reserva-plaza`.

Qué se eliminó:
- Las 3 rutas bajo `src/app/[locale]/(site)/` (reserva-plaza, book-your-spot,
  reserva-placa) y `src/components/reserva-plaza/ReservaPlazaForm.tsx`.
- `public/api/reserva-plaza.php` (el deploy ahora además borra el archivo
  stale del servidor con `rm -f`).
- `SITE_PATHS.reservaPlaza`, `LOCALIZED_SLUGS.reserva` y
  `getBootcampPathByLocale` en `src/config/routes.ts`; las 3 entradas de
  reserva en `src/i18n/slug-map.ts`.
- Namespace `reservaPlazaPage` completo en es/en/ca, y las keys del modo
  bootcamp de `diagnosticPage.prelead` (infoBoxBootcamp, submitBootcamp,
  bootcampLeft*, bootcampStep*) — ese modo del wizard era código muerto del
  funnel de reserva-plaza (ningún call site pasaba `mode="bootcamp"`); se
  eliminó el prop `mode` de DiagnosticWizard/StepPrelead y el parámetro
  `source` de `initSession`.
- Tests: el describe "Reserva plaza form" de `forms.spec.ts` y las secciones
  3/5/8 de `production-audit.spec.ts` reemplazados por checks de redirect 301
  (página) y 404/410 (API); sección ReservaPlaza de `test-forms-prod.mjs`
  eliminada.

Call sites repuntados a `${getProgramaPathByLocale(locale)}#bootcamp-formulario`
(mismo patrón del fix de locale del 06/10): SiteFooter (link "Únete al
Bootcamp Zero"), SiteHeader (prop bootcampPath → drawer móvil),
PartnersCtaBanner, AboutCtaBannerSection, ChallengeFinalCtaSection,
PartnersBootcampCtaSection, SolutionOpenlabSection (2 CTAs), OpenlabSection
del home (3 CTAs).

Redirects 301 en `public/.htaccess` (la URL vieja circuló públicamente, el
banner de julio apuntaba ahí): es/reserva-plaza → /es/programa/,
en/book-your-spot → /en/program/, ca/reserva-placa → /ca/programa/, con y sin
trailing slash, con fragmento #bootcamp-formulario y flag [NE]. La
verificación real del 301 es POST-DEPLOY (next dev no lee .htaccess).

La tabla MySQL `reserva_plaza_leads` NO se toca (datos históricos): se
conserva en `scripts/db-setup-production.sql` con comentario LEGACY, y el
admin (`public/admin/api.php`, `export.php`) sigue leyéndola. El allow-list
de `source` en `public/api/diagnostic.php` conserva "reserva-plaza" a
propósito (valor histórico válido en sesiones ya guardadas).

## TDD / checks
No hay modo TDD configurado para este tipo de contenido de marketing (no hay
tests existentes sobre estas secciones). Checks aplicables: lint,
check:i18n-parity, build, y verificación visual manual en navegador local.

## Estrategia de entrega
`ask-on-risk` (default). Se commitea por tarea en una rama feature; push y PR
quedan para cuando el usuario confirme que lo probado en local está OK.

## Estado
T1–T10 completas y commiteadas en `feature/bootcamp-zero-programa`. Probado
en local por el usuario, incluidos los 2 bugs de locale-switch/scroll
encontrados y arreglados durante la prueba. HubSpot queda pendiente a
propósito (ver sección arriba). Próximo paso: push de la rama + abrir PR,
pendiente de confirmación explícita del usuario.
