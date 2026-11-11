import { Schema, model, models, type InferSchemaType, type Model, type Types } from 'mongoose'
import { COLLECTION_NAMES, FIELD_LIMITS, MODEL_NAMES } from '@shared/constants'

const projectSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.USER, required: true },
    environmentId: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.ENVIRONMENT, required: true },
    name: { type: String, required: true, trim: true, maxlength: FIELD_LIMITS.ENTITY_NAME_MAX },
    description: { type: String, default: '', trim: true, maxlength: FIELD_LIMITS.DESCRIPTION_MAX }
  },
  { timestamps: true, collection: COLLECTION_NAMES.PROJECTS }
)

projectSchema.index({ userId: 1, environmentId: 1, createdAt: -1 })

export type ProjectRecord = InferSchemaType<typeof projectSchema> & { _id: Types.ObjectId }

export const ProjectModel =
  (models[MODEL_NAMES.PROJECT] as Model<ProjectRecord> | undefined) ??
  model<ProjectRecord>(MODEL_NAMES.PROJECT, projectSchema)
