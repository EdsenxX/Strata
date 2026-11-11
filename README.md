# Strata

> Tus entornos, proyectos y tareas en capas claras.

Strata es una aplicación de escritorio para **Windows** y **Ubuntu** que organiza el trabajo en capas:

```
Entorno  →  Proyecto  →  Fase  →  Tarea
GGTech      TFT Hub      Desarrollo   Conectar socket de partidas
```

El nombre viene de _strata_ (estratos): cada nivel es una capa que envuelve a la siguiente.

## Funcionalidades (v0.1.0)

- **Cuentas de usuario**: registro con nombre(s), apellido paterno, apellido materno, correo, usuario y
  contraseña robusta con checklist en vivo; inicio de sesión con correo o usuario; sesión recordada de forma cifrada.
- **Entornos**: crear, renombrar y eliminar (en cascada). Guardan fecha de creación, edición y su usuario.
- **Proyectos**: tabla ordenada por fecha de creación (ascendente/descendente), con descripción y avance de tareas.
- **Fases**: etapas dentro del proyecto para agrupar tareas.
- **Tareas**:
  - Título y contenido en Markdown con editor de bloques estilo Notion (escribe `/` para insertar bloques).
  - Estados: Pendiente, En progreso, En pausa, Completada.
  - Tiempo invertido con cronómetro (iniciar/pausar, sobrevive a cierres de la app) o captura manual.
- **Diseño neumórfico** con tema claro/oscuro automático y fuentes locales (Plus Jakarta Sans, JetBrains Mono).
- **Versión visible** siempre en la interfaz.

## Requisitos

- Node.js 22 o superior y npm 10.
- Un cluster de MongoDB (por ejemplo MongoDB Atlas) y su cadena de conexión.

## Puesta en marcha

```bash
npm install
cp .env.example .env    # y completa MONGODB_URI y MONGODB_DB_NAME
npm run dev
```

Variables de entorno (`.env`):

| Variable          | Descripción                                              |
| ----------------- | -------------------------------------------------------- |
| `MONGODB_URI`     | Cadena de conexión al cluster (`mongodb+srv://…`).       |
| `MONGODB_DB_NAME` | Base de datos dentro del cluster (por defecto `strata`). |

> En MongoDB Atlas recuerda permitir tu IP en _Network Access_.

## Scripts

| Comando              | Qué hace                                    |
| -------------------- | ------------------------------------------- |
| `npm run dev`        | Inicia la app en modo desarrollo.           |
| `npm run start`      | Previsualiza el build de producción.        |
| `npm run typecheck`  | Verifica tipos de todos los procesos.       |
| `npm run lint`       | Ejecuta ESLint.                             |
| `npm run format`     | Formatea el código con Prettier.            |
| `npm run build`      | Verifica tipos y genera el build en `out/`. |
| `npm run dist:linux` | Genera AppImage y `.deb` en `dist/`.        |
| `npm run dist:win`   | Genera el instalador NSIS en `dist/`.       |

## Instalación de la app empaquetada

El instalador **no incluye** el `.env` (los secretos nunca se empaquetan). Tras instalar, crea el archivo en:

- **Linux**: `~/.config/Strata/.env`
- **Windows**: `%APPDATA%\Strata\.env`

o junto al ejecutable. Si falta, la app muestra un aviso con las rutas buscadas.

## Documentación

- [AGENTS.md](AGENTS.md): arquitectura, convenciones y reglas para agentes de IA.
- [DESIGN.md](DESIGN.md): sistema de diseño neumórfico, tokens y componentes.
- [CHANGELOG.md](CHANGELOG.md): historial de versiones.
- Skills de agentes en [`.agents/skills/`](.agents/skills/).

## Versionado

Semantic Versioning (`MAJOR.MINOR.PATCH`). La versión se define únicamente en `package.json` y se muestra en
la interfaz. Cada release lleva su etiqueta `vX.Y.Z` en git.
