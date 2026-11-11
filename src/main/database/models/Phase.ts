import { Schema, model, models, type InferSchemaType, type Model, type Types } from 'mongoose'
import { COLLECTION_NAMES, FIELD_LIMITS, MODEL_NAMES } from '@shared/constants'

const phaseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.USER, required: true },
    environmentId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.ENVIRONMENT, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.PROJECT, required: true },
    name: { type: String, required: true, trim: true, maxlength: FIELD_LIMITS.ENTITY_NAME_MAX },
    order: { type: Number, required: true, min: 0 }
  },
  { timestamps: true, collection: COLLECTION_NAMES.PHASES }
)

phaseSchema.index({ userId: 1, projectId: 1, order: 1 })

export type PhaseRecord = InferSchemaType<typeof phaseSchema> & { _id: Types.ObjectId }

export const PhaseModel =
  (models[MODEL_NAMES.PHASE] as Model<PhaseRecord> | undefined) ??
  model<PhaseRecord>(MODEL_NAMES.PHASE, phaseSchema)
