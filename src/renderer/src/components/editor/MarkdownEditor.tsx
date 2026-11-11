/**
 * Editor de bloques estilo Notion basado en Milkdown Crepe.
 * Trabaja nativamente con Markdown: recibe el valor inicial y emite cada cambio.
 *
 * Imágenes: se insertan con "/" → Imagen, pegándolas (Ctrl+V) o arrastrándolas. Se pueden
 * redimensionar con el asa inferior, agregar leyenda y mover con el asa de bloque (⋮⋮).
 * `onUploadImage` las guarda y devuelve la URL que queda en el Markdown.
 *
 * Es un componente no controlado: para cargar otro documento, cambia su `key`.
 */
import { useEffect, useRef, useState } from 'react'
import { Crepe } from '@milkdown/crepe'
import { uploadConfig, type Uploader } from '@milkdown/kit/plugin/upload'
import type { Node as ProseNode } from '@milkdown/kit/prose/model'
import { Decoration } from '@milkdown/kit/prose/view'
import { EDITOR_TEXTS, TASK_TEXTS } from '@shared/constants'
import { EditorSkeleton } from '../skeletons/EditorSkeleton'
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
    image: { label: EDITOR_TEXTS.IMAGE },
    codeBlock: { label: EDITOR_TEXTS.CODE_BLOCK },
    table: { label: EDITOR_TEXTS.TABLE },
    math: null
  }
}

/** Nodo de Crepe para imágenes de bloque (redimensionables y con leyenda). */
const IMAGE_BLOCK_NODE = 'image-block'
const IMAGE_MIME_PREFIX = 'image/'

/** Aviso que se ve en el lugar de la imagen mientras se sube. */
function createUploadingWidget(): HTMLElement {
  const element = document.createElement('span')
  element.className = 'strata-upload-widget'
  element.textContent = EDITOR_TEXTS.IMAGE_UPLOADING
  return element
}

interface MarkdownEditorProps {
  initialValue: string
  onChange: (markdown: string) => void
  onUploadImage: (file: File) => Promise<string>
}

export function MarkdownEditor({ initialValue, onChange, onUploadImage }: MarkdownEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  // Crepe se inicializa de forma asíncrona; mientras tanto se muestra un skeleton.
  const [ready, setReady] = useState(false)
  // Refs para que el editor (creado una sola vez) use siempre los valores más recientes.
  const initialValueRef = useRef(initialValue)
  const onChangeRef = useRef(onChange)
  const onUploadImageRef = useRef(onUploadImage)

  useEffect(() => {
    onChangeRef.current = onChange
    onUploadImageRef.current = onUploadImage
  }, [onChange, onUploadImage])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const crepe = new Crepe({
      root,
      defaultValue: initialValueRef.current,
      features: {
        [Crepe.Feature.Latex]: false
      },
      featureConfigs: {
        [Crepe.Feature.Placeholder]: { text: TASK_TEXTS.CONTENT_PLACEHOLDER },
        [Crepe.Feature.BlockEdit]: SLASH_MENU_LABELS,
        [Crepe.Feature.ImageBlock]: {
          onUpload: (file) => onUploadImageRef.current(file).catch(() => ''),
          blockUploadButton: EDITOR_TEXTS.IMAGE_UPLOAD_BUTTON,
          blockUploadPlaceholderText: EDITOR_TEXTS.IMAGE_UPLOAD_PLACEHOLDER,
          blockCaptionPlaceholderText: EDITOR_TEXTS.IMAGE_CAPTION_PLACEHOLDER,
          blockConfirmButton: EDITOR_TEXTS.IMAGE_CONFIRM,
          inlineUploadButton: EDITOR_TEXTS.IMAGE_UPLOAD_BUTTON,
          inlineUploadPlaceholderText: EDITOR_TEXTS.IMAGE_UPLOAD_PLACEHOLDER
        },
        [Crepe.Feature.CodeMirror]: {
          searchPlaceholder: EDITOR_TEXTS.CODE_SEARCH_PLACEHOLDER,
          noResultText: EDITOR_TEXTS.CODE_NO_RESULTS,
          copyText: EDITOR_TEXTS.CODE_COPY
        }
      }
    })

    // Si la subida falla, devuelve '' para que el editor no inserte nada (el error ya se mostró).
    const safeUpload = async (file: File): Promise<string> => {
      try {
        return await onUploadImageRef.current(file)
      } catch {
        return ''
      }
    }

    // Reemplaza el subidor de Crepe (pegar/arrastrar) para omitir las imágenes fallidas y
    // mostrar el aviso de carga en español.
    const uploader: Uploader = async (files, schema) => {
      const nodeType = schema.nodes[IMAGE_BLOCK_NODE]
      if (!nodeType) return []
      const images = Array.from(files).filter((file) => file.type.startsWith(IMAGE_MIME_PREFIX))
      const nodes: ProseNode[] = []
      for (const file of images) {
        const src = await safeUpload(file)
        const node = src ? nodeType.createAndFill({ src }) : null
        if (node) nodes.push(node)
      }
      return nodes
    }
    crepe.editor.config((ctx) => {
      ctx.update(uploadConfig.key, (previous) => ({
        ...previous,
        uploader,
        uploadWidgetFactory: (pos, spec) => Decoration.widget(pos, createUploadingWidget, spec)
      }))
    })

    crepe.on((listener) => {
      listener.markdownUpdated((_ctx, markdown, previousMarkdown) => {
        if (markdown !== previousMarkdown) onChangeRef.current(markdown)
      })
    })

    const creation = crepe.create()
    void creation.then(() => setReady(true))
    return () => {
      void creation.then(() => crepe.destroy())
    }
  }, [])

  return (
    <>
      {!ready && <EditorSkeleton />}
      <div ref={rootRef} className="strata-editor" />
    </>
  )
}
