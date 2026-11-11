---
name: commit
description: Crea commits en Strata siguiendo Conventional Commits (tipo y scope en inglés, descripción en español). Úsala cuando el usuario pida hacer commit, guardar cambios en git o preparar un commit.
---

# Skill: crear commits

Crea commits pequeños, atómicos y verificados siguiendo **Conventional Commits 1.0.0**.

## Formato

```
<type>(<scope>): <descripción en español, imperativo, minúsculas, sin punto final>

<cuerpo opcional en español: qué cambia y por qué, líneas ≤ 100 caracteres>

<footers opcionales: BREAKING CHANGE: …, Refs: #123>
```

- **Encabezado** ≤ 72 caracteres.
- `type` y `scope` en inglés (vocabulario estándar); la descripción y el cuerpo en español.
- Imperativo: "agrega", "corrige", "elimina" (no "agregado", "agregando").

### Tipos permitidos

| Tipo       | Uso                                                                       | Impacto en versión |
| ---------- | ------------------------------------------------------------------------- | ------------------ |
| `feat`     | Nueva funcionalidad visible para el usuario                               | MINOR              |
| `fix`      | Corrección de un error                                                    | PATCH              |
| `perf`     | Mejora de rendimiento                                                     | PATCH              |
| `refactor` | Cambio interno sin alterar comportamiento                                 | —                  |
| `style`    | Formato o estilos de código (no CSS de la UI)                             | —                  |
| `docs`     | Documentación (README, AGENTS, DESIGN, comentarios)                       | —                  |
| `test`     | Pruebas                                                                   | —                  |
| `build`    | Dependencias, empaquetado, electron-builder, Vite                         | —                  |
| `ci`       | Integración continua                                                      | —                  |
| `chore`    | Mantenimiento; `chore(release)` está reservado para la skill `versioning` | —                  |

Un cambio incompatible agrega `!` tras el tipo/scope (`feat(tasks)!: …`) y un footer `BREAKING CHANGE: <explicación>`.

### Scopes sugeridos

`auth`, `environments`, `projects`, `phases`, `tasks`, `timer`, `editor`, `ui`, `design`, `db`, `ipc`, `main`, `preload`, `constants`, `deps`, `agents`, `release`.

## Procedimiento

1. **Revisa el estado**: `git status` y `git diff` (más `git diff --staged` si ya hay algo preparado).
2. **Protege secretos**: nunca agregues `.env` ni archivos con credenciales. Si aparece en el diff, detente y avisa.
3. **Agrupa por intención**: si el diff mezcla cambios no relacionados, divídelos en varios commits (`git add <rutas>` por grupo). No uses `git add -A` a ciegas.
4. **Verifica antes de confirmar**:
   ```bash
   npm run format:check
   npm run lint
   npm run typecheck
   ```
   Si fallan, corrige o informa al usuario; no hagas commit con errores.
5. **Redacta el mensaje** con el formato anterior y confírmalo con un HEREDOC para respetar saltos de línea:
   ```bash
   git commit -F - <<'MSG'
   feat(tasks): agrega cronómetro con pausa a las tareas

   El tiempo se acumula al pausar y sobrevive a reinicios de la app.
   MSG
   ```
6. **Comprueba** con `git log --oneline -n 3` y reporta el hash y el encabezado.

## Reglas

- No modifiques la versión ni el `CHANGELOG.md` aquí: eso lo hace la skill [`versioning`](../versioning/SKILL.md).
- No hagas `push`, `rebase`, `--amend` ni `--no-verify` salvo que el usuario lo pida explícitamente.
- Si el usuario pide "commit y versión", primero esta skill y después `versioning`.

## Ejemplos

```
feat(auth): agrega checklist de contraseña robusta en el registro
fix(timer): evita tiempo negativo cuando el reloj del sistema cambia
docs(agents): documenta la tabla de skills
build(deps): actualiza electron a 45.3.0
refactor(constants)!: renombra IPC_CHANNELS de tareas

BREAKING CHANGE: los canales `task:*` ahora son `tasks:*`.
```
