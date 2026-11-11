/**
 * Genera los íconos de la app a partir de build/icon.svg usando el propio Electron,
 * así no hace falta instalar herramientas de conversión. Uso: `npm run icon`.
 *
 * - build/icon.png (1024×1024): ventana de la app y origen del .ico de Windows.
 * - build/icons/<N>x<N>.png: tamaños estándar para Linux (lanzador, dock, barra de tareas).
 * Cada tamaño se renderiza directamente desde el SVG para que se vea nítido.
 */
const { app, BrowserWindow } = require('electron')
const { mkdirSync, readFileSync, writeFileSync } = require('node:fs')
const { join } = require('node:path')

const BUILD_DIR = join(__dirname, '..', 'build')
const SOURCE = join(BUILD_DIR, 'icon.svg')
const MAIN_ICON = join(BUILD_DIR, 'icon.png')
const LINUX_ICONS_DIR = join(BUILD_DIR, 'icons')
const MAIN_SIZE = 1024
const LINUX_SIZES = [16, 24, 32, 48, 64, 128, 256, 512, 1024]
const RENDER_DELAY_MS = 300

app.commandLine.appendSwitch('force-device-scale-factor', '1')
app.disableHardwareAcceleration()

/** Una sola ventana de 1024×1024: en cada tamaño se reemplaza el SVG y se captura su área. */
async function createRenderer() {
  const window = new BrowserWindow({
    width: MAIN_SIZE,
    height: MAIN_SIZE,
    show: false,
    useContentSize: true,
    transparent: true,
    frame: false,
    webPreferences: { offscreen: true }
  })
  await window.loadURL(
    'data:text/html;charset=utf-8,<body style="margin:0;background:transparent"></body>'
  )
  return {
    async render(svg, size) {
      const sized = svg.replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`)
      await window.webContents.executeJavaScript(
        `document.body.innerHTML = ${JSON.stringify(sized)}`
      )
      await new Promise((resolve) => setTimeout(resolve, RENDER_DELAY_MS))
      const image = await window.webContents.capturePage({ x: 0, y: 0, width: size, height: size })
      return image.toPNG()
    },
    close: () => window.destroy()
  }
}

app.whenReady().then(async () => {
  const svg = readFileSync(SOURCE, 'utf-8')
  const renderer = await createRenderer()
  writeFileSync(MAIN_ICON, await renderer.render(svg, MAIN_SIZE))
  mkdirSync(LINUX_ICONS_DIR, { recursive: true })
  for (const size of LINUX_SIZES) {
    writeFileSync(join(LINUX_ICONS_DIR, `${size}x${size}.png`), await renderer.render(svg, size))
  }
  renderer.close()
  console.log(
    `Íconos generados: ${MAIN_ICON} y ${LINUX_SIZES.length} tamaños en ${LINUX_ICONS_DIR}`
  )
  app.quit()
})
