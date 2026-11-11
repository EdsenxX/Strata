import { Schema, model, models, type InferSchemaType, type Model, type Types } from 'mongoose'
import {
  COLLECTION_NAMES,
  IMAGE_MIME_TYPE_VALUES,
  IMAGE_UPLOAD,
  MODEL_NAMES
} from '@shared/constants'

/** Imagen incrustada en el contenido de una tarea (los bytes viven en el documento). */
const taskImageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.USER, required: true },
    environmentId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.ENVIRONMENT, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.PROJECT, required: true },
    phaseId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.PHASE, required: true },
    taskId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.TASK, required: true },
    mimeType: { type: String, enum: IMAGE_MIME_TYPE_VALUES, required: true },
    size: { type: Number, required: true, min: 1, max: IMAGE_UPLOAD.MAX_BYTES },
    data: { type: Buffer, required: true }
  },
  { timestamps: true, collection: COLLECTION_NAMES.TASK_IMAGES }
)

taskImageSchema.index({ userId: 1, taskId: 1 })

export type TaskImageRecord = InferSchemaType<typeof taskImageSchema> & { _id: Types.ObjectId }

export const TaskImageModel =
  (models[MODEL_NAMES.TASK_IMAGE] as Model<TaskImageRecord> | undefined) ??
  model<TaskImageRecord>(MODEL_NAMES.TASK_IMAGE, taskImageSchema)
