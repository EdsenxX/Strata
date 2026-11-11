/**
 * Editor de bloques estilo Notion basado en Milkdown Crepe.
 * Trabaja nativamente con Markdown: recibe el valor inicial y emite cada cambio.
 *
 * Es un componente no controlado: para cargar otro documento, cambia su `key`.
 */
import { useEffect, useRef } from 'react'
import { Crepe } from '@milkdown/crepe'
import { EDITOR_TEXTS, TASK_TEXTS } from '@shared/constants'
import '../../styles/editor.css'

/** Traducción al español del menú "/" (solo etiquetas; los iconos son los de Crepe). */
const SLASH_MENU_LABELS = {
  textGroup: {
    label: EDITOR_TEXTS.GROUP_TEXT,
    text: { label: EDITOR_TEXTS.TEXT },
    h1: { label: EDITOR_TEXTS.HEADING(1) },
    h2: { label: EDITOR_TEXTS.HEADING(2) },
    h3: { label: EDITOR_TEXTS.HEADING(3) },
    h4: { label: EDITOR_TEXTS.HEADING(4) },
    h5: { label: EDITOR_TEXTS.HEADING(5) },
    h6: { label: EDITOR_TEXTS.HEADING(6) },
    quote: { label: EDITOR_TEXTS.QUOTE },
    divider: { label: EDITOR_TEXTS.DIVIDER }
  },
  listGroup: {
    label: EDITOR_TEXTS.GROUP_LIST,
    bulletList: { label: EDITOR_TEXTS.BULLET_LIST },
    orderedList: { label: EDITOR_TEXTS.ORDERED_LIST },
    taskList: { label: EDITOR_TEXTS.TASK_LIST }
  },
  advancedGroup: {
    label: EDITOR_TEXTS.GROUP_ADVANCED,
    image: null,
    codeBlock: { label: EDITOR_TEXTS.CODE_BLOCK },
    table: { label: EDITOR_TEXTS.TABLE },
    math: null
  }
}

interface MarkdownEditorProps {
  initialValue: string
  onChange: (markdown: string) => void
}

export function MarkdownEditor({ initialValue, onChange }: MarkdownEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  // Refs para que el editor (creado una sola vez) use siempre los valores más recientes.
  const initialValueRef = useRef(initialValue)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const crepe = new Crepe({
      root,
      defaultValue: initialValueRef.current,
      features: {
        // Las imágenes subidas se guardarían como blobs temporales; por ahora se desactivan.
        [Crepe.Feature.ImageBlock]: false,
        [Crepe.Feature.Latex]: false
      },
      featureConfigs: {
        [Crepe.Feature.Placeholder]: { text: TASK_TEXTS.CONTENT_PLACEHOLDER },
        [Crepe.Feature.BlockEdit]: SLASH_MENU_LABELS,
        [Crepe.Feature.CodeMirror]: {
          searchPlaceholder: EDITOR_TEXTS.CODE_SEARCH_PLACEHOLDER,
          noResultText: EDITOR_TEXTS.CODE_NO_RESULTS,
          copyText: EDITOR_TEXTS.CODE_COPY
        }
      }
    })

    crepe.on((listener) => {
      listener.markdownUpdated((_ctx, markdown, previousMarkdown) => {
        if (markdown !== previousMarkdown) onChangeRef.current(markdown)
      })
    })

    const creation = crepe.create()
    return () => {
      void creation.then(() => crepe.destroy())
    }
  }, [])

  return <div ref={rootRef} className="strata-editor" />
}
