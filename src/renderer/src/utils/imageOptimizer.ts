/**
 * Prepara una imagen antes de subirla: valida el formato y, si es grande, la reduce a
 * IMAGE_UPLOAD.MAX_DIMENSION px y la recomprime en WebP. Los GIF se conservan tal cual
 * para no perder la animación.
 */
import {
  ERROR_CODES,
  IMAGE_MIME_TYPE_VALUES,
  IMAGE_UPLOAD,
  type ImageMimeType
} from '@shared/constants'
import { ApiError } from '../api/client'

export interface OptimizedImage {
  mimeType: ImageMimeType
  data: Uint8Array
}

const isSupported = (type: string): type is ImageMimeType =>
  IMAGE_MIME_TYPE_VALUES.includes(type as ImageMimeType)

async function toBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer())
}

export async function optimizeImage(file: File): Promise<OptimizedImage> {
  if (!isSupported(file.type)) throw new ApiError(ERROR_CODES.IMAGE_TYPE_NOT_ALLOWED)

  let result: OptimizedImage = { mimeType: file.type, data: await toBytes(file) }

  if (!IMAGE_UPLOAD.KEEP_ORIGINAL.includes(file.type)) {
    const bitmap = await createImageBitmap(file)
    const longestSide = Math.max(bitmap.width, bitmap.height)
    const needsResize = longestSide > IMAGE_UPLOAD.MAX_DIMENSION
    if (needsResize || file.size > IMAGE_UPLOAD.COMPRESS_THRESHOLD_BYTES) {
      const scale = needsResize ? IMAGE_UPLOAD.MAX_DIMENSION / longestSide : 1
      const canvas = new OffscreenCanvas(
        Math.round(bitmap.width * scale),
        Math.round(bitmap.height * scale)
      )
      canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      const blob = await canvas.convertToBlob({
        type: IMAGE_UPLOAD.OUTPUT_MIME,
        quality: IMAGE_UPLOAD.OUTPUT_QUALITY
      })
      // Solo se usa la versión optimizada si de verdad pesa menos.
      if (blob.size < file.size)
        result = { mimeType: IMAGE_UPLOAD.OUTPUT_MIME, data: await toBytes(blob) }
    }
    bitmap.close()
  }

  if (result.data.byteLength > IMAGE_UPLOAD.MAX_BYTES)
    throw new ApiError(ERROR_CODES.IMAGE_TOO_LARGE)
  return result
}
