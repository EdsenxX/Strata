# Changelog

Todos los cambios relevantes de Strata se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa
[Semantic Versioning](https://semver.org/lang/es/).

## [Sin publicar]

## [0.6.0] - 2026-11-11

### Agregado

- Tiempo total por fase (suma de sus tareas) en las pestañas de fases y en el encabezado de la fase.
- Tiempo total por proyecto (suma de sus fases) en el encabezado del proyecto y en una nueva columna **Tiempo** de
  la tabla de proyectos. Los totales avanzan en vivo mientras haya cronómetros en marcha.

## [0.5.0] - 2026-11-11

### Cambiado

- Todas las cargas de contenido usan skeletons con la forma de cada pantalla en lugar del indicador "Cargando…":
  arranque, entornos, proyectos, vista de proyecto, tareas, detalle de tarea, editor, estados y actualizaciones.

## [0.4.0] - 2026-11-11

### Agregado

- Página **Configuración** con dos secciones: apariencia (tema claro, oscuro o del sistema) y actualizaciones.
- Actualizaciones automáticas desde GitHub Releases: búsqueda al abrir y cada 6 horas, opción para descargarlas en
  automático, botón **Buscar actualizaciones** y aviso **Reiniciar e instalar** cuando hay una versión lista.

### Cambiado

- El selector de tema se movió de la barra lateral a Configuración (sigue en las pantallas de acceso).
- Las releases publican también `latest.yml`, `latest-linux.yml` y el `.blockmap` que usa el actualizador.

## [0.3.1] - 2026-11-11

### Cambiado

- La ventana abre al tamaño del layout (1440 × 960 de contenido), centrada en la pantalla del cursor, y maximizada si
  la pantalla es más chica. La ventana completa ya no hace scroll.
- Registro más compacto: nombre y apellidos en una sola fila.

## [0.3.0] - 2026-11-11

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
