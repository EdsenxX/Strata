/**
 * Imágenes dentro del contenido de las tareas.
 *
 * Se guardan en MongoDB (colección `task_images`) y el Markdown solo contiene una URL del
 * protocolo propio `strata-media://images/<id>`, que el proceso principal resuelve verificando
 * que la imagen pertenezca al usuario con sesión.
 */
export const MEDIA_PROTOCOL = {
  SCHEME: 'strata-media',
  IMAGES_HOST: 'images'
} as const

/** Construye la URL que se guarda en el Markdown. */
export const buildImageUrl = (imageId: string): string =>
  `${MEDIA_PROTOCOL.SCHEME}://${MEDIA_PROTOCOL.IMAGES_HOST}/${imageId}`

export const IMAGE_MIME_TYPES = {
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  WEBP: 'image/webp',
  GIF: 'image/gif'
} as const

export type ImageMimeType = (typeof IMAGE_MIME_TYPES)[keyof typeof IMAGE_MIME_TYPES]

export const IMAGE_MIME_TYPE_VALUES: readonly ImageMimeType[] = Object.values(IMAGE_MIME_TYPES)

export const IMAGE_UPLOAD = {
  /** Tamaño máximo guardado por imagen (bytes), ya optimizada. */
  MAX_BYTES: 5 * 1024 * 1024,
  /** Lado mayor máximo; las imágenes más grandes se reducen antes de subir. */
  MAX_DIMENSION: 2000,
  /** Solo se recomprimen imágenes que superen este tamaño o la dimensión máxima. */
  COMPRESS_THRESHOLD_BYTES: 1024 * 1024,
  OUTPUT_MIME: IMAGE_MIME_TYPES.WEBP,
  OUTPUT_QUALITY: 0.85,
  /** Los GIF no se recomprimen para conservar la animación. */
  KEEP_ORIGINAL: [IMAGE_MIME_TYPES.GIF] as readonly string[],
  /** Las imágenes no cambian una vez guardadas: el visor puede cachearlas. */
  CACHE_CONTROL: 'private, max-age=31536000, immutable'
} as const
