---
name: versioning
description: Gestiona la versión semántica de Strata (MAJOR.MINOR.PATCH, formato 0.0.0) — calcula el siguiente número a partir de los commits, actualiza package.json y CHANGELOG.md, crea el commit de release y la etiqueta git. Úsala cuando el usuario pida versionar, liberar, hacer release o subir la versión.
---

# Skill: versionar la app

Strata usa **Semantic Versioning 2.0.0** con el formato `MAJOR.MINOR.PATCH` (por ejemplo `0.3.1`).
La versión vive en **un solo lugar**: `package.json` → `version`. La interfaz la muestra automáticamente
(se inyecta como `__APP_VERSION__` en `electron.vite.config.ts`), así que **nunca** la escribas a mano en el código.

## Cuándo sube cada número

| Cambio desde la última versión                                   | Fase 0.x (actual)    | Desde 1.0.0          |
| ---------------------------------------------------------------- | -------------------- | -------------------- |
| `BREAKING CHANGE` o `!`                                          | MINOR                | MAJOR                |
| `feat`                                                           | MINOR                | MINOR                |
| `fix`, `perf`                                                    | PATCH                | PATCH                |
| Solo `docs`, `refactor`, `style`, `test`, `build`, `ci`, `chore` | PATCH (o no liberar) | PATCH (o no liberar) |

- Mientras la versión sea `0.x.y`, la API se considera inestable: los cambios incompatibles suben MINOR.
- El salto a `1.0.0` solo ocurre cuando el usuario lo pide explícitamente.
- Al subir MINOR, PATCH vuelve a 0; al subir MAJOR, MINOR y PATCH vuelven a 0.

## Procedimiento

1. **Precondiciones**
   - Árbol limpio: `git status --porcelain` debe estar vacío (si no, usa primero la skill [`commit`](../commit/SKILL.md)).
   - Rama correcta (por defecto `main`, o la que indique el usuario).
   - `npm run lint` y `npm run build` pasan.
2. **Encuentra la última versión**: `git describe --tags --abbrev=0 --match "v*"`. Si no hay etiquetas, toma todo el historial.
3. **Lista los cambios**: `git log <ultima-etiqueta>..HEAD --pretty=format:"%h %s%n%b"`.
4. **Calcula el tipo de salto** con la tabla anterior (el cambio de mayor impacto manda). Si el usuario indicó un tipo o número, respétalo.
5. **Actualiza la versión** sin que npm cree commit ni etiqueta:
   ```bash
   npm version <major|minor|patch> --no-git-tag-version
   ```
   Esto actualiza `package.json` y `package-lock.json`.
6. **Actualiza `CHANGELOG.md`** (formato _Keep a Changelog_, en español): agrega una sección nueva debajo de `## [Sin publicar]`:
   ```markdown
   ## [0.2.0] - AAAA-MM-DD

   ### Agregado

   - … (de `feat`)

   ### Cambiado

   - … (de `refactor`, `perf` o cambios de comportamiento)

   ### Corregido

   - … (de `fix`)

   ### Eliminado

   - …
   ```
   Redacta para personas (no copies los mensajes de commit tal cual) y omite secciones vacías.
   Actualiza también los enlaces de comparación al final del archivo si existen.
7. **Commit de release**:
   ```bash
   git add package.json package-lock.json CHANGELOG.md
   git commit -m "chore(release): v<X.Y.Z>"
   ```
8. **Etiqueta anotada**:
   ```bash
   git tag -a v<X.Y.Z> -m "Strata v<X.Y.Z>"
   ```
9. **Reporta** la versión anterior, la nueva, el tipo de salto y el resumen del changelog.
   No hagas `git push` ni `git push --tags` salvo que el usuario lo pida.
10. **Publicación** (solo si el usuario pidió subir la versión): `git push origin main` y luego
    `git push origin v<X.Y.Z>`. La etiqueta dispara `.github/workflows/release.yml`, que verifica que coincida con
    `package.json`, compila los instaladores de Windows y Ubuntu y crea la release con la sección del `CHANGELOG.md`.
    Sigue la ejecución con `gh run list --workflow release.yml` / `gh run watch` y confirma los archivos con
    `gh release view v<X.Y.Z>`.

## Verificación

- `node -p "require('./package.json').version"` devuelve la nueva versión.
- `git tag --list "v*" --sort=-v:refname | head -n 1` muestra la nueva etiqueta.
- En la app, la insignia de versión (barra lateral y pantallas de acceso) muestra `vX.Y.Z` tras `npm run dev` o `npm run build`.
