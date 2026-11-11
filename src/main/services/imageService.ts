/**
 * Imágenes del contenido de las tareas: guardado en MongoDB y entrega por `strata-media://`.
 */
import { isValidObjectId } from 'mongoose'
import {
  ERROR_CODES,
  IMAGE_MIME_TYPE_VALUES,
  IMAGE_UPLOAD,
  MEDIA_PROTOCOL,
  buildImageUrl,
  type ImageMimeType
} from '@shared/constants'
import { ensureDatabaseConnection } from '../database/connection'
import { TaskModel } from '../database/models/Task'
import { TaskImageModel } from '../database/models/TaskImage'
import { AppError } from '../errors/AppError'
import { requireUserId } from '../session/sessionStore'
import { requireFound, requireObject, requireObjectId } from '../utils/inputGuards'

const HTTP_STATUS = { NOT_FOUND: 404, UNAUTHORIZED: 401 } as const

const isImageMimeType = (value: unknown): value is ImageMimeType =>
  IMAGE_MIME_TYPE_VALUES.includes(value as ImageMimeType)

export async function uploadImage(raw: unknown): Promise<{ url: string }> {
  const userId = requireUserId()
  const data = requireObject(raw)
  if (!isImageMimeType(data.mimeType)) throw new AppError(ERROR_CODES.IMAGE_TYPE_NOT_ALLOWED)
  if (!(data.data instanceof Uint8Array) || data.data.byteLength === 0) {
    throw new AppError(ERROR_CODES.VALIDATION_FAILED)
  }
  if (data.data.byteLength > IMAGE_UPLOAD.MAX_BYTES) throw new AppError(ERROR_CODES.IMAGE_TOO_LARGE)

  const task = requireFound(
    await TaskModel.findOne({ _id: requireObjectId(data.taskId), userId }).lean()
  )
  const image = await TaskImageModel.create({
    userId,
    environmentId: task.environmentId,
    projectId: task.projectId,
    phaseId: task.phaseId,
    taskId: task._id,
    mimeType: data.mimeType,
    size: data.data.byteLength,
    data: Buffer.from(data.data)
  })
  return { url: buildImageUrl(image._id.toString()) }
}

/**
 * Manejador del protocolo `strata-media://images/<id>`.
 * Solo entrega imágenes del usuario con sesión; cualquier otra petición responde 404/401.
 */
export async function handleMediaRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const imageId = url.pathname.replace(/^\//, '')
  if (url.hostname !== MEDIA_PROTOCOL.IMAGES_HOST || !isValidObjectId(imageId)) {
    return new Response(null, { status: HTTP_STATUS.NOT_FOUND })
  }
  try {
    const userId = requireUserId()
    await ensureDatabaseConnection()
    // Sin .lean(): así `data` llega como Buffer (con lean sería un Binary del driver).
    const image = await TaskImageModel.findOne({ _id: imageId, userId }).select({
      data: 1,
      mimeType: 1
    })
    if (!image) return new Response(null, { status: HTTP_STATUS.NOT_FOUND })
    return new Response(new Uint8Array(image.data), {
      headers: { 'content-type': image.mimeType, 'cache-control': IMAGE_UPLOAD.CACHE_CONTROL }
    })
  } catch (error) {
    if (error instanceof AppError) return new Response(null, { status: HTTP_STATUS.UNAUTHORIZED })
    console.error('[media] image request failed', error)
    return new Response(null, { status: HTTP_STATUS.NOT_FOUND })
  }
}
