# Changelog

Todos los cambios relevantes de Strata se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa
[Semantic Versioning](https://semver.org/lang/es/).

## [Sin publicar]

### Agregado

- Estados de tarea configurables por usuario, guardados en MongoDB: pantalla **Estados** para crear, editar
  (nombre, color y categoría), reordenar y eliminar estados.
- Categorías de estado (Por hacer, En curso, En pausa, Terminada) que definen el comportamiento del cronómetro y
  del avance del proyecto.

### Cambiado

- Las tareas guardan `statusId` en lugar de un estado fijo. Las tareas existentes se migran automáticamente al
  iniciar sesión.
- Los errores de campo obligatorio desaparecen en cuanto se escribe en el campo.

## [0.2.0] - 2026-11-11

### Agregado

- Selector de tema claro, oscuro o del sistema; la elección se recuerda en el equipo.
- Asterisco rojo en los campos obligatorios y leyenda "\* Campos obligatorios" en los formularios.
- Instaladores para Windows (`.exe`) y Ubuntu (`.deb` y AppImage) publicados automáticamente en GitHub Releases
  y descargables desde el README.

### Cambiado

- Los campos opcionales ya no se marcan con "(opcional)".

## [0.1.0] - 2026-11-11

### Agregado

- Aplicación de escritorio con Electron, React y TypeScript para Windows y Ubuntu.
- Registro con nombre(s), apellidos, correo, usuario y contraseña robusta con checklist en vivo.
- Inicio de sesión con correo o usuario y sesión recordada cifrada con el llavero del sistema.
- Entornos: crear, renombrar y eliminar en cascada.
- Proyectos en tabla ordenada por fecha de creación, con descripción y avance de tareas.
- Fases dentro de cada proyecto.
- Tareas con editor Markdown de bloques estilo Notion, estados y tiempo invertido con cronómetro o captura manual.
- Sistema de diseño neumórfico con tema claro/oscuro y fuentes locales.
- Versión visible en la interfaz.
- Skills de agentes `commit` y `versioning`.

<!-- Agrega aquí los enlaces de comparación cuando el repositorio tenga remoto. -->
