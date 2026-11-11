# Strata

> Tus entornos, proyectos y tareas en capas claras.

[![Descargar para Windows](https://img.shields.io/badge/Windows-Descargar_.exe-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/EdsenxX/Strata/releases/latest/download/Strata-Setup-x64.exe)
[![Descargar para Ubuntu (.deb)](https://img.shields.io/badge/Ubuntu-Descargar_.deb-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)](https://github.com/EdsenxX/Strata/releases/latest/download/Strata-x64.deb)
[![Descargar AppImage](https://img.shields.io/badge/Linux-Descargar_AppImage-333333?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/EdsenxX/Strata/releases/latest/download/Strata-x64.AppImage)

Strata es una aplicación de escritorio para **Windows** y **Ubuntu** que organiza el trabajo en capas:

```
Entorno  →  Proyecto  →  Fase  →  Tarea
GGTech      TFT Hub      Desarrollo   Conectar socket de partidas
```

El nombre viene de _strata_ (estratos): cada nivel es una capa que envuelve a la siguiente.

## Funcionalidades

- **Cuentas de usuario**: registro con nombre(s), apellido paterno, apellido materno, correo, usuario y
  contraseña robusta con checklist en vivo; inicio de sesión con correo o usuario; sesión recordada de forma cifrada.
- **Entornos**: crear, renombrar y eliminar (en cascada). Guardan fecha de creación, edición y su usuario.
- **Proyectos**: tabla ordenada por fecha de creación (ascendente/descendente), con descripción y avance de tareas.
- **Fases**: etapas dentro del proyecto para agrupar tareas.
- **Tareas**:
  - Título y contenido en Markdown con editor de bloques estilo Notion (escribe `/` para insertar bloques).
  - Imágenes en el contenido: pégalas, arrástralas o súbelas; redimensiónalas, agrégales leyenda y muévelas.
  - Estados: Pendiente, En progreso, En pausa, Completada.
  - Tiempo invertido con cronómetro (iniciar/pausar, sobrevive a cierres de la app) o captura manual.
- **Diseño neumórfico** con tema claro, oscuro o el del sistema (a elección, se recuerda por equipo) y fuentes locales (Plus Jakarta Sans, JetBrains Mono).
- **Configuración**: tema claro, oscuro o del sistema, y actualizaciones.
- **Actualizaciones automáticas**: busca versiones nuevas al abrir y cada pocas horas; se pueden descargar en
  automático o a mano e instalar con un clic (**Actualizar ahora**), o activar **Actualizar al iniciar** para que se
  instalen al abrir la app. Solo se reinicia Strata, nunca el equipo.
- **Versión visible** siempre en la interfaz.

## Descargas

Los instaladores de la última versión siempre están en
[**Releases**](https://github.com/EdsenxX/Strata/releases/latest):

| Sistema                    | Archivo                                                                                                   | Instalación                                 |
| -------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Windows 10/11 (x64)        | [`Strata-Setup-x64.exe`](https://github.com/EdsenxX/Strata/releases/latest/download/Strata-Setup-x64.exe) | Ejecuta el instalador.                      |
| Ubuntu / Debian (x64)      | [`Strata-x64.deb`](https://github.com/EdsenxX/Strata/releases/latest/download/Strata-x64.deb)             | `sudo apt install ./Strata-x64.deb`         |
| Otras distribuciones Linux | [`Strata-x64.AppImage`](https://github.com/EdsenxX/Strata/releases/latest/download/Strata-x64.AppImage)   | `chmod +x Strata-x64.AppImage` y ejecútalo. |

Notas:

- **Windows**: el instalador aún no está firmado, así que SmartScreen puede advertir. Elige
  _Más información → Ejecutar de todas formas_.
- **Ubuntu 24.04 o superior**: usa el `.deb`. Instala un perfil de AppArmor para el sandbox de Chromium; el
  AppImage no puede hacerlo y no arranca con la restricción de _user namespaces_ de Ubuntu.
- Tras instalar, configura la conexión a MongoDB (ver [Instalación de la app empaquetada](#instalación-de-la-app-empaquetada)).

## Requisitos (desarrollo)

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

## Versionado y releases

Semantic Versioning (`MAJOR.MINOR.PATCH`). La versión se define únicamente en `package.json` y se muestra en
la interfaz. Cada release lleva su etiqueta `vX.Y.Z` en git (skill [`versioning`](.agents/skills/versioning/SKILL.md)).

Al subir una etiqueta `vX.Y.Z`, el workflow [`release.yml`](.github/workflows/release.yml) compila los instaladores
en Windows y Ubuntu y los publica en GitHub Releases con las notas de `CHANGELOG.md`. Los nombres de archivo no
llevan versión, así que los enlaces de este README siempre descargan la última release.
