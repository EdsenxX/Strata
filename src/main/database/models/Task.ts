import { Schema, model, models, type InferSchemaType, type Model, type Types } from 'mongoose'
import {
  COLLECTION_NAMES,
  DEFAULT_TASK_STATUS,
  FIELD_LIMITS,
  MODEL_NAMES,
  TASK_STATUS_VALUES,
  type TaskStatus
} from '@shared/constants'

const taskSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.USER, required: true },
    environmentId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.ENVIRONMENT, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.PROJECT, required: true },
    phaseId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.PHASE, required: true },
    title: { type: String, required: true, trim: true, maxlength: FIELD_LIMITS.TASK_TITLE_MAX },
    // Contenido en Markdown editado con el editor de bloques.
    content: { type: String, default: '', maxlength: FIELD_LIMITS.TASK_CONTENT_MAX },
    status: {
      type: String,
      enum: TASK_STATUS_VALUES,
      default: DEFAULT_TASK_STATUS,
      required: true
    },
    // Segundos acumulados en pausas anteriores (no incluye el tramo en curso).
    timeSpentSeconds: { type: Number, default: 0, min: 0 },
    // Inicio del cronómetro activo; null cuando está detenido.
    timerStartedAt: { type: Date, default: null }
  },
  { timestamps: true, collection: COLLECTION_NAMES.TASKS }
)

taskSchema.index({ userId: 1, phaseId: 1, createdAt: -1 })
taskSchema.index({ userId: 1, projectId: 1 })

export type TaskRecord = Omit<InferSchemaType<typeof taskSchema>, 'status'> & {
  _id: Types.ObjectId
  status: TaskStatus
}

export const TaskModel =
  (models[MODEL_NAMES.TASK] as Model<TaskRecord> | undefined) ??
  model<TaskRecord>(MODEL_NAMES.TASK, taskSchema)
