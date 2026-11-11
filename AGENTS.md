# AGENTS.md

Guía para agentes de IA (Claude Code, Codex, Cursor, Gemini CLI…) que trabajan en **Strata**.
Léela completa antes de modificar el proyecto.

## Proyecto

Strata es una app de escritorio (Windows y Ubuntu) para gestionar tareas organizadas en capas:

```
Usuario → Entorno → Proyecto → Fase → Tarea
```

- **Entorno**: agrupador de alto nivel (empresa, cliente, área personal). Ej.: GGTech, Proyectos personales.
- **Proyecto**: vive en un entorno; se lista en tabla ordenada por fecha de creación.
- **Fase**: etapa del proyecto que agrupa tareas (Descubrimiento, Desarrollo, Lanzamiento…).
- **Tarea**: título, contenido en Markdown (editor de bloques estilo Notion), estado y tiempo invertido
  (manual o con cronómetro).

## Stack

| Capa                | Tecnología                                                         |
| ------------------- | ------------------------------------------------------------------ |
| Shell de escritorio | Electron 45 + electron-vite 6                                      |
| Lenguaje            | TypeScript (estricto)                                              |
| Interfaz            | React 19, React Router 8 (`HashRouter`), Zustand                   |
| Estilos             | Tailwind CSS 4 con tokens neumórficos (ver [DESIGN.md](DESIGN.md)) |
| Editor              | Milkdown Crepe (Markdown nativo, menú `/`)                         |
| Base de datos       | MongoDB (cluster) vía Mongoose 9, solo desde el proceso principal  |
| Empaquetado         | electron-builder (NSIS para Windows, AppImage/deb para Linux)      |

## Comandos

```bash
npm run dev          # App en modo desarrollo con recarga
npm run typecheck    # Tipos del proceso principal/preload y de la interfaz
npm run lint         # ESLint
npm run format       # Prettier (format:check solo verifica)
npm run build        # typecheck + build de producción en out/
npm run dist:linux   # Instaladores AppImage y deb en dist/
npm run dist:win     # Instalador NSIS en dist/ (idealmente desde Windows)
```

Antes de dar por terminado un cambio: `npm run format:check && npm run lint && npm run build`.

## Arquitectura

```
src/
├── shared/            # Código común a todos los procesos (sin dependencias de Node ni DOM)
│   ├── constants/     # TODAS las constantes y textos (ver "Sin magic strings")
│   ├── types/         # DTOs, inputs y contrato de la API (StrataApi)
│   ├── validation/    # Contraseña robusta y registro (interfaz + proceso principal)
│   └── utils/         # Utilidades puras (duraciones)
├── main/              # Proceso principal de Electron (Node)
│   ├── config/        # Carga de .env
│   ├── database/      # Conexión Mongoose y modelos
│   ├── services/      # Lógica de negocio por dominio
│   ├── ipc/           # Registro de canales IPC
│   ├── session/       # Sesión en memoria + persistencia cifrada (safeStorage)
│   ├── services/preferencesService.ts  # Preferencias locales (tema) en userData/preferences.json
│   └── utils/         # Validaciones defensivas de entrada
├── preload/           # Puente seguro: expone window.strata
└── renderer/          # Interfaz React
    └── src/
        ├── api/       # Cliente de window.strata (unwrap, errores)
        ├── components/{ui,layout,forms,tasks,editor,routing}
        ├── hooks/     # useAsyncData, useElapsedSeconds, useDebouncedSave
        ├── pages/     # Una página por ruta
        ├── stores/    # Zustand (auth)
        ├── styles/    # globals.css (tokens), fonts.css, editor.css
        └── assets/fonts/  # Fuentes de Google Fonts descargadas (woff2)
```

### Flujo de datos

1. La interfaz llama a `api.<dominio>.<acción>()` (`src/renderer/src/api/client.ts`) y usa `unwrap()`.
2. El preload reenvía con `ipcRenderer.invoke(IPC_CHANNELS.X, input)`.
3. `src/main/ipc/registerIpcHandlers.ts` asegura la conexión a MongoDB, ejecuta el servicio y devuelve
   `ApiResult<T>` (`{ ok: true, data }` o `{ ok: false, error: ErrorCode }`). Nunca se lanzan excepciones por IPC.
4. Los servicios obtienen el usuario con `requireUserId()` y **siempre** filtran por `userId`.

### Reglas de seguridad

- La interfaz no tiene acceso a Node: `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`.
- Todo input que llega por IPC se valida otra vez en el proceso principal (`utils/inputGuards.ts`).
- Mongoose usa `sanitizeFilter` para bloquear inyección de operadores.
- Las contraseñas se guardan con bcrypt (`BCRYPT_SALT_ROUNDS`); nunca se devuelven al renderer.
- Los secretos solo viven en `.env` (ignorado por git). Nunca los subas ni los copies a código o documentación.
- Borrados en cascada: entorno → proyectos → fases → tareas, siempre filtrados por `userId`.

### Estados de tarea (configurables)

- Viven en la colección `task_statuses`, **por usuario** (`statusService.ts`); la tarea guarda `statusId`.
- Cada estado tiene nombre, color (`STATUS_COLORS`), orden y una **categoría** fija (`STATUS_CATEGORIES`:
  `pending`, `in_progress`, `paused`, `completed`). El código nunca decide por nombre, solo por categoría.
- El estado por defecto de una categoría es el primero según `order` (tareas nuevas ⇒ `pending`).
- Cada categoría conserva al menos un estado (`STATUS_LAST_IN_CATEGORY`). Al eliminar un estado, sus tareas
  pasan al primer estado restante de la misma categoría.
- `ensureDefaultStatuses()` siembra `DEFAULT_TASK_STATUSES` al iniciar sesión y migra tareas antiguas que tenían
  `status` como texto (usa el driver nativo porque el esquema ya no conoce ese campo).
- La interfaz carga el catálogo en `statusStore` (Zustand) desde `AppShell`; `StatusBadge` y `StatusSelector` lo leen.
- Con `sanitizeFilter` activo, los operadores en filtros (`$ne`, `$in`…) deben envolverse en `mongoose.trusted()`.

### Cronómetro de tareas

- `timeSpentSeconds`: tiempo acumulado de tramos cerrados.
- `timerStartedAt`: inicio del tramo en curso (`null` si está detenido).
- Iniciar ⇒ primer estado de categoría `in_progress` (salvo que ya esté en esa categoría).
- Pausar ⇒ suma el tramo y pasa al primer estado de categoría `paused`.
- Cambiar a un estado de otra categoría detiene el cronómetro y acumula.
- La edición manual del tiempo no se permite con el cronómetro en marcha (`TIMER_RUNNING`).
- La interfaz calcula el tiempo vivo con `computeElapsedSeconds()`; el valor sobrevive a cierres de la app.

## Convenciones

### Idioma

- **Código en inglés**: nombres de variables, funciones, tipos, archivos, ramas.
- **Comentarios y documentación en español**: JSDoc, comentarios, README, AGENTS, DESIGN, CHANGELOG.
- **Textos de la interfaz en español**, siempre desde `src/shared/constants/texts.ts`.

### Sin magic strings

Ninguna cadena o número con significado de negocio va suelto en el código:

| Necesitas…              | Usa                                                                             |
| ----------------------- | ------------------------------------------------------------------------------- |
| Texto visible           | `src/shared/constants/texts.ts` (`*_TEXTS`, `ERROR_MESSAGES`, etiquetas)        |
| Estados de tarea        | `STATUS_CATEGORIES`, `STATUS_COLORS`, `DEFAULT_TASK_STATUSES` (`taskStatus.ts`) |
| Canales IPC             | `IPC_CHANNELS` (`ipcChannels.ts`)                                               |
| Rutas                   | `ROUTES`, `buildRoute`, `QUERY_PARAMS` (`routes.ts`)                            |
| Límites y regex         | `FIELD_LIMITS`, `PATTERNS`, `PASSWORD_POLICY` (`validation.ts`)                 |
| Colecciones/modelos/env | `MODEL_NAMES`, `COLLECTION_NAMES`, `ENV_KEYS` (`database.ts`)                   |
| Códigos de error        | `ERROR_CODES` (`errorCodes.ts`)                                                 |
| Tiempos y UI            | `UI_TIMINGS`, `SAVE_STATUS`, `ASYNC_STATUS`, `KEYS` (`ui.ts`)                   |
| Tema y preferencias     | `THEME_MODES`, `THEME_MODE_VALUES`, `PREFERENCES_FILE_NAME` (`preferences.ts`)  |
| Seguridad/sesión        | `BCRYPT_SALT_ROUNDS`, `SESSION_CONFIG`, `AUTH_STATUS` (`security.ts`)           |

- Importa desde `@shared/constants` (barril `index.ts`).
- Si un dominio nuevo necesita constantes, crea un archivo nuevo en `src/shared/constants/` y expórtalo en `index.ts`.
- Las variantes visuales de un componente (por ejemplo `BUTTON_VARIANTS`) se declaran como constantes junto al componente.
- Las clases de Tailwind no se consideran magic strings.

### Estilo de código

- TypeScript estricto, sin `any`. Prettier: sin punto y coma, comillas simples, 100 columnas.
- Componentes React como funciones nombradas exportadas (`export function X`).
- Alias: `@shared/*` (todos los procesos) y `@renderer/*` (interfaz).
- Reutiliza los componentes de `components/ui` antes de crear otros (ver catálogo en [DESIGN.md](DESIGN.md)).

### Añadir una operación nueva (checklist)

1. Constante del canal en `ipcChannels.ts`.
2. Tipos de entrada/salida en `src/shared/types/` y método en `StrataApi` (`api.ts`).
3. Servicio en `src/main/services/` (valida input, filtra por `userId`).
4. Registro en `registerIpcHandlers.ts` y método en `src/preload/index.ts`.
5. Textos nuevos en `texts.ts`.
6. Consumo en la interfaz con `unwrap(api.…)`.

## Versionado

- Formato **SemVer `MAJOR.MINOR.PATCH`** (`0.0.0`). Fuente única: `version` de `package.json`.
- La interfaz muestra la versión siempre (barra lateral y pantallas de acceso) vía `__APP_VERSION__`.
- Cada release: commit `chore(release): vX.Y.Z` + etiqueta anotada `vX.Y.Z` + entrada en `CHANGELOG.md`.
- Usa la skill [`versioning`](.agents/skills/versioning/SKILL.md); nunca edites la versión a mano.
- Subir una etiqueta `vX.Y.Z` dispara [`.github/workflows/release.yml`](.github/workflows/release.yml): compila en
  Windows y Ubuntu y publica `Strata-Setup-x64.exe`, `Strata-x64.deb` y `Strata-x64.AppImage` en GitHub Releases.
  Los nombres no llevan versión porque el README enlaza a `releases/latest/download/<archivo>`; no los cambies en
  `electron-builder.yml` sin actualizar el README.

## Skills

Las skills viven en `.agents/skills/<nombre>/SKILL.md` (convención abierta de Agent Skills).
`.claude/skills` es un enlace simbólico a esa carpeta para que Claude Code también las cargue.

| Skill        | Ubicación                                                                  | Descripción                                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commit`     | [`.agents/skills/commit/SKILL.md`](.agents/skills/commit/SKILL.md)         | Crea commits con Conventional Commits (tipo/scope en inglés, descripción en español): revisa el diff, protege secretos, agrupa por intención y ejecuta lint + typecheck antes de confirmar. |
| `versioning` | [`.agents/skills/versioning/SKILL.md`](.agents/skills/versioning/SKILL.md) | Gestiona la versión SemVer `0.0.0`: calcula el salto desde los commits, actualiza `package.json` y `CHANGELOG.md`, crea el commit `chore(release)` y la etiqueta `vX.Y.Z`.                  |

## Configuración y entorno

- Copia `.env.example` a `.env` y define `MONGODB_URI` y `MONGODB_DB_NAME`.
- En desarrollo se lee `.env` de la raíz. En la app instalada se busca en la carpeta de datos del usuario
  (`~/.config/Strata/.env` en Linux, `%APPDATA%\Strata\.env` en Windows) o junto al ejecutable.
- Si falta configuración, la app muestra un diálogo con las rutas buscadas y se cierra.

## Gotchas

- La app desktop se conecta **directamente** al cluster: quien tenga el `.env` tiene acceso a la base de datos.
  Para distribuirla a terceros conviene poner una API intermedia.
- El tema se aplica con `nativeTheme.themeSource` desde el proceso principal; el CSS reacciona vía
  `prefers-color-scheme`. Las preferencias no requieren MongoDB (`handle(..., { requiresDatabase: false })`).
- `HashRouter` es obligatorio: en producción la interfaz se carga desde `file://`.
- El editor Crepe es no controlado: para cargar otro documento cambia su `key`, no su valor.
- La sesión persistente usa `safeStorage`; en Linux sin llavero (`basic_text`) la sesión no se guarda en disco.
- Si `npm install` no descarga el binario de Electron, ejecuta `node node_modules/electron/install.js`.
- ESLint usa `eslint-plugin-react-hooks` 7 (reglas del React Compiler): evita `setState` síncrono dentro de efectos.
