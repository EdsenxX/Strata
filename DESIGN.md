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

El usuario elige **Claro**, **Oscuro** o **Sistema** con `ThemeSwitcher` (barra lateral y pantallas de acceso).
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

| Componente                                             | Descripción                                                                                                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Button`                                               | Variantes `BUTTON_VARIANTS` (`neutral`, `primary`, `danger`, `ghost`), tamaños `BUTTON_SIZES`, `icon`, `iconOnly` (requiere `aria-label`) y `loading`. |
| `Card`                                                 | Superficie elevada con `rounded-neu` y `p-6`.                                                                                                          |
| `TextField` / `TextArea`                               | Campo hundido con etiqueta, error, pista y contenido a la derecha (`trailing`). `insetFieldClasses` para inputs sueltos.                               |
| `FieldLabel` / `RequiredFieldsNote`                    | Etiqueta con `*` rojo para campos `required` y leyenda "\* Campos obligatorios" bajo los campos.                                                       |
| `PasswordField`                                        | `TextField` con botón mostrar/ocultar.                                                                                                                 |
| `PasswordChecklist`                                    | Checklist en vivo de `evaluatePassword()`.                                                                                                             |
| `Modal`                                                | Diálogo con overlay; cierra con Escape o clic fuera.                                                                                                   |
| `ConfirmDialog`                                        | Confirmación de acciones destructivas con manejo de error.                                                                                             |
| `StatusBadge`                                          | Insignia de estado de tarea; exporta `TASK_STATUS_COLORS`.                                                                                             |
| `ProgressBar`                                          | Pista hundida con relleno `success`.                                                                                                                   |
| `EmptyState`, `LoadingState`, `ErrorBanner`, `Spinner` | Estados vacíos, de carga y de error.                                                                                                                   |
| `VersionBadge`                                         | Versión de la app (`__APP_VERSION__`).                                                                                                                 |
| `ThemeSwitcher`                                        | Selector de tema (claro, oscuro, sistema) con la opción activa hundida.                                                                                |

### Composición

| Carpeta   | Componentes                                                                               |
| --------- | ----------------------------------------------------------------------------------------- |
| `layout`  | `AppShell` (barra lateral + contenido), `AuthLayout`, `PageHeader`, `Breadcrumbs`, `Logo` |
| `forms`   | `NameFormModal` (entornos y fases), `ProjectFormModal`                                    |
| `tasks`   | `TimerButton`, `ElapsedTime`, `StatusSelector`, `ManualTimeModal`                         |
| `editor`  | `MarkdownEditor` (Milkdown Crepe adaptado en `styles/editor.css`)                         |
| `routing` | `ProtectedRoute`, `PublicOnlyRoute`                                                       |

## Patrones

- **Listas clicables**: filas `shadow-neu-sm` que suben a `shadow-neu` en hover; acciones secundarias con
  `stopPropagation`.
- **Selección**: el elemento activo se hunde (`shadow-neu-inset`) y toma `text-accent` (fases, filtros, navegación,
  estados).
- **Campos obligatorios**: pasa `required` a `TextField`/`TextArea`/`PasswordField`; la etiqueta muestra un `*`
  en `text-danger` (`FieldLabel`). Todo formulario con al menos un campo obligatorio cierra sus campos con
  `RequiredFieldsNote` ("\* Campos obligatorios"). Nunca marques los opcionales con "(opcional)". Los formularios usan
  `noValidate` y muestran el error de campo vacío (`VALIDATION_TEXTS.REQUIRED`) debajo del campo.
- **Acciones destructivas**: siempre con `ConfirmDialog` y variante `danger`.
- **Guardado automático**: el editor muestra "Guardando…/Guardado" en `text-muted`; error en `text-danger`.
- **Diseño responsivo**: ventana mínima 960 × 640; el detalle de tarea pasa a una columna en anchos menores a `lg`.

## Accesibilidad

- Botones solo con icono llevan `aria-label` y `title`.
- Grupos de selección usan `role="radiogroup"`/`aria-pressed`; la tabla usa `aria-sort` en la columna ordenada.
- Errores con `role="alert"` y estados de guardado con `aria-live="polite"`.
