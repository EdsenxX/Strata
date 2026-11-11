# DESIGN.md — Sistema de diseño de Strata

Strata usa **neumorfismo** (_soft UI_): los elementos parecen moldeados en la misma superficie del fondo y se
distinguen solo por luz y sombra. Este documento define los tokens, las reglas y el catálogo de componentes.

## Principios

1. **Una sola superficie.** Fondo, tarjetas, botones y campos comparten el color `--neu-bg`. Nunca uses
   fondos blancos o grises distintos para "separar" bloques: sepáralos con sombra.
2. **Elevado = interactivo o contenedor; hundido = entrada o estado activo.**
   - _Raised_ (`shadow-neu*`): tarjetas, botones, elementos clicables.
   - _Inset_ (`shadow-neu-inset*`): campos de texto, pista de progreso, elemento seleccionado, botón presionado.
3. **El color es escaso.** Solo el acento (`accent`) y los colores de estado llevan color; el resto es tinta
   y tinta atenuada. Así el usuario identifica de inmediato lo importante.
4. **Contraste suficiente.** El neumorfismo puro tiene poco contraste: compensamos con texto `ink` oscuro,
   foco visible (`:focus-visible` con anillo de acento) y estados con color + texto, nunca solo sombra.
5. **Movimiento suave y corto** (`transition-all duration-200`) y respeto a `prefers-reduced-motion`.

## Tokens

Definidos en [`src/renderer/src/styles/globals.css`](src/renderer/src/styles/globals.css). Los componentes
solo consumen las utilidades de Tailwind generadas a partir de ellos.

### Color

| Variable CSS            | Utilidad Tailwind           | Claro      | Oscuro     | Uso                            |
| ----------------------- | --------------------------- | ---------- | ---------- | ------------------------------ |
| `--neu-bg`              | `bg-base`                   | `#e7ebf1`  | `#262a33`  | Superficie única               |
| `--neu-shadow-dark`     | —                           | `#c4cad4`  | `#1a1d23`  | Sombra inferior derecha        |
| `--neu-shadow-light`    | —                           | `#ffffff`  | `#323743`  | Luz superior izquierda         |
| `--neu-text`            | `text-ink`                  | `#2d3546`  | `#e3e7ef`  | Texto principal                |
| `--neu-text-muted`      | `text-muted`                | `#6c7689`  | `#9aa3b5`  | Texto secundario               |
| `--neu-accent`          | `bg-accent` / `text-accent` | `#5b6cf0`  | `#8292ff`  | Acción primaria, selección     |
| `--neu-accent-contrast` | `text-accent-contrast`      | `#ffffff`  | `#10131a`  | Texto sobre acento             |
| `--neu-success`         | `text-success`              | `#23996f`  | `#4cc79a`  | Completada, requisito cumplido |
| `--neu-warning`         | `text-warning`              | `#d48a1c`  | `#f0b252`  | En pausa                       |
| `--neu-danger`          | `text-danger`               | `#dc4a5a`  | `#f07583`  | Errores, eliminar              |
| `--neu-info`            | `text-info`                 | `#3f86d8`  | `#6fb0f5`  | En progreso, cronómetro activo |
| `--neu-overlay`         | `bg-overlay`                | tinta 25 % | negro 45 % | Fondo de modales               |

### Tema claro / oscuro

El usuario elige **Claro**, **Oscuro** o **Sistema** con `ThemeSwitcher` (página Configuración y pantallas de acceso).
La elección se aplica en el proceso principal con `nativeTheme.themeSource`, que hace que Chromium cambie
`prefers-color-scheme`. Por eso el CSS solo define los tokens oscuros bajo `@media (prefers-color-scheme: dark)`:
no uses clases `dark:` ni atributos de tema en componentes; basta con consumir los tokens.

### Sombras

| Utilidad              | Uso                                                                    |
| --------------------- | ---------------------------------------------------------------------- |
| `shadow-neu-sm`       | Botones, filas, chips en reposo                                        |
| `shadow-neu`          | Tarjetas; hover de botones                                             |
| `shadow-neu-lg`       | Modales; hover de tarjetas                                             |
| `shadow-neu-inset-sm` | Insignias, chips activos, botón presionado (`active:`)                 |
| `shadow-neu-inset`    | Campos de texto, elemento de navegación activo, display del cronómetro |

### Radios

| Utilidad         | Valor    | Uso                      |
| ---------------- | -------- | ------------------------ |
| `rounded-neu`    | 1.25rem  | Tarjetas y modales       |
| `rounded-neu-sm` | 0.875rem | Botones, campos, filas   |
| `rounded-full`   | —        | Insignias, chips, avatar |

### Tipografía

Fuentes descargadas de Google Fonts y servidas localmente desde
[`src/renderer/src/assets/fonts/`](src/renderer/src/assets/fonts/) (subconjuntos latin y latin-ext, licencia SIL OFL).

| Familia                              | Utilidad                  | Uso                             |
| ------------------------------------ | ------------------------- | ------------------------------- |
| Plus Jakarta Sans (variable 200–800) | `font-sans` (por defecto) | Toda la interfaz                |
| JetBrains Mono (variable 100–800)    | `font-mono`               | Cronómetro, versión, contadores |

Escala: título de página `text-3xl font-extrabold`, título de tarjeta `text-lg font-bold`, cuerpo `text-sm`,
etiquetas de sección `text-xs font-bold uppercase tracking-wider text-muted`.

## Componentes

Todos en [`src/renderer/src/components/`](src/renderer/src/components/). Reutilízalos antes de crear otros.

### UI base (`components/ui`)

| Componente                          | Descripción                                                                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Button`                            | Variantes `BUTTON_VARIANTS` (`neutral`, `primary`, `danger`, `ghost`), tamaños `BUTTON_SIZES`, `icon`, `iconOnly` (requiere `aria-label`) y `loading`. |
| `Card`                              | Superficie elevada con `rounded-neu` y `p-6`.                                                                                                          |
| `TextField` / `TextArea`            | Campo hundido con etiqueta, error, pista y contenido a la derecha (`trailing`). `insetFieldClasses` para inputs sueltos.                               |
| `FieldLabel` / `RequiredFieldsNote` | Etiqueta con `*` rojo para campos `required` y leyenda "\* Campos obligatorios" bajo los campos.                                                       |
| `PasswordField`                     | `TextField` con botón mostrar/ocultar.                                                                                                                 |
| `PasswordChecklist`                 | Checklist en vivo de `evaluatePassword()`.                                                                                                             |
| `Modal`                             | Diálogo con overlay; cierra con Escape o clic fuera.                                                                                                   |
| `ConfirmDialog`                     | Confirmación de acciones destructivas con manejo de error.                                                                                             |
| `StatusBadge`                       | Insignia de un estado del catálogo del usuario (`statusId`). Colores en `statusColors.ts` (`STATUS_COLOR_CLASSES`).                                    |
| `ProgressBar`                       | Pista hundida con relleno `success`.                                                                                                                   |
| `EmptyState`, `ErrorBanner`         | Estados vacíos y de error.                                                                                                                             |
| `Skeleton`, `SkeletonGroup`         | Bloque de carga neumórfico (hundido, con pulso) y su contenedor accesible (`role="status"`, anuncia una sola vez aunque se aniden).                    |
| `Spinner`                           | Solo para el estado `loading` de `Button` (acción en curso), nunca para cargar contenido.                                                              |
| `VersionBadge`                      | Versión de la app (`__APP_VERSION__`).                                                                                                                 |
| `ThemeSwitcher`                     | Selector de tema con la opción activa hundida. Variantes `THEME_SWITCHER_VARIANTS`: `compact` (iconos) y `cards` (tarjetas con texto).                 |
| `Toggle`                            | Interruptor (`role="switch"`) con etiqueta y pista: pista hundida y perilla elevada que se vuelve de acento al activarse.                              |

### Composición

| Carpeta     | Componentes                                                                                                                                                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `layout`    | `AppShell` (barra lateral + contenido), `AuthLayout`, `PageHeader`, `Breadcrumbs`, `Logo`, `UpdateBanner` (aviso flotante de actualización lista)                                                                                        |
| `forms`     | `NameFormModal` (entornos y fases), `ProjectFormModal`, `StatusFormModal` (nombre, color y categoría)                                                                                                                                    |
| `tasks`     | `TimerButton`, `ElapsedTime`, `StatusSelector`, `ManualTimeModal`                                                                                                                                                                        |
| `editor`    | `MarkdownEditor` (Milkdown Crepe adaptado en `styles/editor.css`)                                                                                                                                                                        |
| `routing`   | `ProtectedRoute`, `PublicOnlyRoute`                                                                                                                                                                                                      |
| `skeletons` | `AppSkeleton` (arranque), `PageHeaderSkeleton`, `EnvironmentsGridSkeleton`, `ProjectsTableSkeleton`, `ProjectDetailSkeleton`, `TaskRowsSkeleton`, `TaskDetailSkeleton`, `EditorSkeleton`, `StatusRowsSkeleton`, `UpdatesSectionSkeleton` |

## Patrones

- **Listas clicables**: filas `shadow-neu-sm` que suben a `shadow-neu` en hover; acciones secundarias con
  `stopPropagation`.
- **Selección**: el elemento activo se hunde (`shadow-neu-inset`) y toma `text-accent` (fases, filtros, navegación,
  estados).
- **Campos obligatorios**: pasa `required` a `TextField`/`TextArea`/`PasswordField`; la etiqueta muestra un `*`
  en `text-danger` (`FieldLabel`). Todo formulario con al menos un campo obligatorio cierra sus campos con
  `RequiredFieldsNote` ("\* Campos obligatorios"). Nunca marques los opcionales con "(opcional)". Los formularios usan
  `noValidate` y muestran el error de campo vacío (`VALIDATION_TEXTS.REQUIRED`) debajo del campo.
- **Colores de estado**: los estados guardan una clave de `STATUS_COLORS`; se pintan con `STATUS_COLOR_CLASSES`.
  Los colores semánticos (gris, azul, ámbar, verde, violeta, rojo) usan los tokens del tema; turquesa y rosa usan la
  paleta 500 de Tailwind, legible en ambos temas.
- **Carga de contenido: siempre skeletons, nunca spinners ni textos "Cargando…"**. Cada pantalla tiene un skeleton
  que imita su forma real (mismas tarjetas, filas y columnas) para que no haya saltos al llegar los datos. Una
  pantalla nueva debe traer su skeleton en `components/skeletons/`, compuesto con `Skeleton` dentro de un
  `SkeletonGroup`. Las partes estáticas (encabezados con texto fijo) se muestran de inmediato; solo los datos usan
  skeleton. Los componentes que dependen del catálogo de estados (`StatusBadge`, `StatusSelector`) muestran su
  propio skeleton mientras llega.
- **Acciones destructivas**: siempre con `ConfirmDialog` y variante `danger`.
- **Guardado automático**: el editor muestra "Guardando…/Guardado" en `text-muted`; error en `text-danger`.
- **Tamaño de ventana y scroll**: la ventana abre con un área de contenido de 1440 × 960 (`MAIN_WINDOW`), el alto
  que necesitan las pantallas más altas (registro y detalle de tarea) para verse sin scroll; si la pantalla es más
  chica, abre maximizada. `html` y `body` nunca hacen scroll: la zona desplazable es el `main` de `AppShell` o el
  contenedor de `AuthLayout`. Si una pantalla nueva necesita más de 960 px de alto, compáctala o ajusta `MAIN_WINDOW`.
- **Diseño responsivo**: ventana mínima 1024 × 640; el detalle de tarea pasa a una columna en anchos menores a `lg`.

## Accesibilidad

- Botones solo con icono llevan `aria-label` y `title`.
- Grupos de selección usan `role="radiogroup"`/`aria-pressed`; la tabla usa `aria-sort` en la columna ordenada.
- Errores con `role="alert"` y estados de guardado con `aria-live="polite"`.
