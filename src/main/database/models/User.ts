import { Schema, model, models, type InferSchemaType, type Model, type Types } from 'mongoose'
import { COLLECTION_NAMES, FIELD_LIMITS, MODEL_NAMES } from '@shared/constants'

const userSchema = new Schema(
  {
    firstNames: {
      type: String,
      required: true,
      trim: true,
      maxlength: FIELD_LIMITS.PERSON_NAME_MAX
    },
    paternalLastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: FIELD_LIMITS.PERSON_NAME_MAX
    },
    maternalLastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: FIELD_LIMITS.PERSON_NAME_MAX
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: FIELD_LIMITS.EMAIL_MAX
    },
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: FIELD_LIMITS.USERNAME_MAX
    },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true, collection: COLLECTION_NAMES.USERS }
)

export type UserRecord = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId }

export const UserModel =
  (models[MODEL_NAMES.USER] as Model<UserRecord> | undefined) ??
  model<UserRecord>(MODEL_NAMES.USER, userSchema)
