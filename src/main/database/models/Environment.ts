import { Schema, model, models, type InferSchemaType, type Model, type Types } from 'mongoose'
import { COLLECTION_NAMES, FIELD_LIMITS, MODEL_NAMES } from '@shared/constants'

const environmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.USER, required: true },
    name: { type: String, required: true, trim: true, maxlength: FIELD_LIMITS.ENTITY_NAME_MAX }
  },
  { timestamps: true, collection: COLLECTION_NAMES.ENVIRONMENTS }
)

environmentSchema.index({ userId: 1, createdAt: -1 })

export type EnvironmentRecord = InferSchemaType<typeof environmentSchema> & { _id: Types.ObjectId }

export const EnvironmentModel =
  (models[MODEL_NAMES.ENVIRONMENT] as Model<EnvironmentRecord> | undefined) ??
  model<EnvironmentRecord>(MODEL_NAMES.ENVIRONMENT, environmentSchema)
