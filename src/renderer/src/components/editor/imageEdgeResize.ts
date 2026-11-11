/**
 * Redimensionado de imágenes desde los bordes (izquierdo, derecho y esquinas), estilo Notion.
 *
 * Crepe solo trae un asa en el borde inferior. Aquí se detecta el puntero cerca de los bordes de la
 * imagen, se muestra el cursor de flechas y, al arrastrar, se cambia el tamaño en vivo conservando el
 * aspecto. Al soltar se guarda la misma proporción que usa Crepe (`ratio` = alto / alto original),
 * así que es compatible con su asa inferior y con el Markdown existente.
 */
import type { EditorView } from '@milkdown/kit/prose/view'
import { IMAGE_RESIZE } from '@shared/constants'

const SELECTORS = {
  BLOCK: '.milkdown-image-block',
  IMAGE: '.milkdown-image-block > .image-wrapper img'
} as const

/** Atributo que activa el resaltado del borde en `editor.css`. */
const EDGE_ATTRIBUTE = 'data-resize-edge'
const RATIO_ATTRIBUTE = 'ratio'
const BUTTON_PRIMARY = 0

const EDGES = {
  LEFT: 'left',
  RIGHT: 'right',
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right'
} as const

type Edge = (typeof EDGES)[keyof typeof EDGES]

const EDGE_CURSORS: Record<Edge, string> = {
  [EDGES.LEFT]: 'ew-resize',
  [EDGES.RIGHT]: 'ew-resize',
  [EDGES.TOP_LEFT]: 'nwse-resize',
  [EDGES.BOTTOM_RIGHT]: 'nwse-resize',
  [EDGES.TOP_RIGHT]: 'nesw-resize',
  [EDGES.BOTTOM_LEFT]: 'nesw-resize'
}

const LEFT_EDGES: readonly Edge[] = [EDGES.LEFT, EDGES.TOP_LEFT, EDGES.BOTTOM_LEFT]

/** Borde bajo el puntero, o null si está lejos de los bordes laterales y las esquinas. */
function detectEdge(image: HTMLImageElement, x: number, y: number): Edge | null {
  const rect = image.getBoundingClientRect()
  const threshold = IMAGE_RESIZE.EDGE_THRESHOLD_PX
  const nearLeft = x - rect.left <= threshold
  const nearRight = rect.right - x <= threshold
  const nearTop = y - rect.top <= threshold
  const nearBottom = rect.bottom - y <= threshold
  if (nearLeft) return nearTop ? EDGES.TOP_LEFT : nearBottom ? EDGES.BOTTOM_LEFT : EDGES.LEFT
  if (nearRight) return nearTop ? EDGES.TOP_RIGHT : nearBottom ? EDGES.BOTTOM_RIGHT : EDGES.RIGHT
  return null
}

function findImage(target: EventTarget | null): HTMLImageElement | null {
  return target instanceof Element ? target.closest<HTMLImageElement>(SELECTORS.IMAGE) : null
}

/** Guarda la nueva proporción en el nodo de ProseMirror que corresponde al bloque. */
function commitRatio(view: EditorView, block: Element, ratio: number): void {
  const positions: number[] = []
  view.state.doc.descendants((_node, pos) => {
    if (view.nodeDOM(pos) === block) positions.push(pos)
    return positions.length === 0
  })
  const [pos] = positions
  const node = pos === undefined ? null : view.state.doc.nodeAt(pos)
  if (pos === undefined || !node) return
  view.dispatch(
    view.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, [RATIO_ATTRIBUTE]: ratio })
  )
}

/** Activa el redimensionado por bordes dentro de `root`. Devuelve la función para desactivarlo. */
export function enableImageEdgeResize(root: HTMLElement, getView: () => EditorView): () => void {
  let hovered: HTMLImageElement | null = null

  const clearHover = () => {
    if (!hovered) return
    hovered.style.cursor = ''
    hovered.removeAttribute(EDGE_ATTRIBUTE)
    hovered = null
  }

  const onPointerMove = (event: PointerEvent) => {
    if (event.buttons !== 0) return
    const image = findImage(event.target)
    if (image !== hovered) clearHover()
    if (!image) return
    const edge = detectEdge(image, event.clientX, event.clientY)
    hovered = image
    image.style.cursor = edge ? EDGE_CURSORS[edge] : ''
    if (edge) image.setAttribute(EDGE_ATTRIBUTE, edge)
    else image.removeAttribute(EDGE_ATTRIBUTE)
  }

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== BUTTON_PRIMARY) return
    const image = findImage(event.target)
    const block = image?.closest(SELECTORS.BLOCK)
    const edge = image ? detectEdge(image, event.clientX, event.clientY) : null
    if (!image || !block || !edge || !image.naturalWidth) return

    // Se toma el control del arrastre antes que Crepe/ProseMirror (que lo tomarían como mover el bloque).
    event.preventDefault()
    event.stopPropagation()

    const aspect = image.naturalHeight / image.naturalWidth
    const startX = event.clientX
    const startWidth = image.getBoundingClientRect().width
    const maxWidth = block.getBoundingClientRect().width
    const direction = LEFT_EDGES.includes(edge) ? -1 : 1
    const originHeight = Number(image.dataset.origin)
    let height = image.getBoundingClientRect().height

    document.body.style.cursor = EDGE_CURSORS[edge]
    document.body.style.userSelect = 'none'

    const onDrag = (moveEvent: PointerEvent) => {
      // La imagen está centrada: ambos bordes se mueven, así que el ancho cambia el doble del desplazamiento.
      const width = Math.min(maxWidth, startWidth + 2 * direction * (moveEvent.clientX - startX))
      height = Math.max(IMAGE_RESIZE.MIN_HEIGHT_PX, width * aspect)
      image.style.height = `${height.toFixed(IMAGE_RESIZE.RATIO_DECIMALS)}px`
      image.dataset.height = height.toFixed(IMAGE_RESIZE.RATIO_DECIMALS)
    }

    const onDrop = () => {
      window.removeEventListener('pointermove', onDrag)
      window.removeEventListener('pointerup', onDrop)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      if (!originHeight) return
      const ratio = Number((height / originHeight).toFixed(IMAGE_RESIZE.RATIO_DECIMALS))
      if (Number.isFinite(ratio) && ratio > 0) commitRatio(getView(), block, ratio)
    }

    window.addEventListener('pointermove', onDrag)
    window.addEventListener('pointerup', onDrop)
  }

  root.addEventListener('pointermove', onPointerMove)
  root.addEventListener('pointerleave', clearHover)
  // Fase de captura: se decide antes que los manejadores del bloque (arrastrar para mover).
  root.addEventListener('pointerdown', onPointerDown, true)

  return () => {
    clearHover()
    root.removeEventListener('pointermove', onPointerMove)
    root.removeEventListener('pointerleave', clearHover)
    root.removeEventListener('pointerdown', onPointerDown, true)
  }
}
