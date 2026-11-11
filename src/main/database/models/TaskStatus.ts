import { Schema, model, models, type InferSchemaType, type Model, type Types } from 'mongoose'
import {
  COLLECTION_NAMES,
  FIELD_LIMITS,
  MODEL_NAMES,
  STATUS_CATEGORY_VALUES,
  STATUS_COLOR_VALUES,
  type StatusCategory,
  type StatusColor
} from '@shared/constants'

const taskStatusSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.USER, required: true },
    name: { type: String, required: true, trim: true, maxlength: FIELD_LIMITS.STATUS_NAME_MAX },
    color: { type: String, enum: STATUS_COLOR_VALUES, required: true },
    // La categoría define el comportamiento (cronómetro, avance); ver taskStatus.ts.
    category: { type: String, enum: STATUS_CATEGORY_VALUES, required: true },
    order: { type: Number, required: true, min: 0 }
  },
  { timestamps: true, collection: COLLECTION_NAMES.TASK_STATUSES }
)

taskStatusSchema.index({ userId: 1, order: 1 })

export type TaskStatusRecord = Omit<
  InferSchemaType<typeof taskStatusSchema>,
  'color' | 'category'
> & {
  _id: Types.ObjectId
  color: StatusColor
  category: StatusCategory
}

export const TaskStatusModel =
  (models[MODEL_NAMES.TASK_STATUS] as Model<TaskStatusRecord> | undefined) ??
  model<TaskStatusRecord>(MODEL_NAMES.TASK_STATUS, taskStatusSchema)
