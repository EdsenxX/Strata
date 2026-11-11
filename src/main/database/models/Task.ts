import { Schema, model, models, type InferSchemaType, type Model, type Types } from 'mongoose'
import { COLLECTION_NAMES, FIELD_LIMITS, MODEL_NAMES } from '@shared/constants'

const taskSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.USER, required: true },
    environmentId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.ENVIRONMENT, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.PROJECT, required: true },
    phaseId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.PHASE, required: true },
    // Estado configurable del usuario (colección task_statuses).
    statusId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.TASK_STATUS, required: true },
    title: { type: String, required: true, trim: true, maxlength: FIELD_LIMITS.TASK_TITLE_MAX },
    // Contenido en Markdown editado con el editor de bloques.
    content: { type: String, default: '', maxlength: FIELD_LIMITS.TASK_CONTENT_MAX },
    // Segundos acumulados en pausas anteriores (no incluye el tramo en curso).
    timeSpentSeconds: { type: Number, default: 0, min: 0 },
    // Inicio del cronómetro activo; null cuando está detenido.
    timerStartedAt: { type: Date, default: null }
  },
  { timestamps: true, collection: COLLECTION_NAMES.TASKS }
)

taskSchema.index({ userId: 1, phaseId: 1, createdAt: -1 })
taskSchema.index({ userId: 1, projectId: 1 })
taskSchema.index({ userId: 1, statusId: 1 })

export type TaskRecord = InferSchemaType<typeof taskSchema> & { _id: Types.ObjectId }

export const TaskModel =
  (models[MODEL_NAMES.TASK] as Model<TaskRecord> | undefined) ??
  model<TaskRecord>(MODEL_NAMES.TASK, taskSchema)
