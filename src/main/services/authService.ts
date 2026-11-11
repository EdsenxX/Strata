/**
 * Registro, inicio de sesión y recuperación de sesión.
 */
import bcrypt from 'bcryptjs'
import { mongo } from 'mongoose'
import {
  BCRYPT_SALT_ROUNDS,
  ERROR_CODES,
  MONGO_DUPLICATE_KEY_CODE,
  PASSWORD_POLICY,
  REGISTER_FIELDS
} from '@shared/constants'
import type { LoginInput, RegisterInput, UserDto } from '@shared/types'
import { hasErrors, normalizeRegisterInput, validateRegistration } from '@shared/validation'
import { UserModel } from '../database/models/User'
import { AppError } from '../errors/AppError'
import { endSession, restoreSession, startSession } from '../session/sessionStore'
import { requireObject } from '../utils/inputGuards'
import { ensureDefaultStatuses } from './statusService'
import { toUserDto } from './mappers'

function readRegisterInput(raw: unknown): RegisterInput {
  const data = requireObject(raw)
  const fields = Object.values(REGISTER_FIELDS)
  if (!fields.every((field) => typeof data[field] === 'string')) {
    throw new AppError(ERROR_CODES.VALIDATION_FAILED)
  }
  return data as unknown as RegisterInput
}

function isDuplicateKeyError(error: unknown): error is mongo.MongoServerError {
  return error instanceof mongo.MongoServerError && error.code === MONGO_DUPLICATE_KEY_CODE
}

export async function register(raw: unknown): Promise<UserDto> {
  const rawInput = readRegisterInput(raw)
  if (hasErrors(validateRegistration(rawInput))) throw new AppError(ERROR_CODES.VALIDATION_FAILED)
  const input = normalizeRegisterInput(rawInput)

  const [emailTaken, usernameTaken] = await Promise.all([
    UserModel.exists({ email: input.email }),
    UserModel.exists({ username: input.username })
  ])
  if (emailTaken) throw new AppError(ERROR_CODES.EMAIL_TAKEN)
  if (usernameTaken) throw new AppError(ERROR_CODES.USERNAME_TAKEN)

  try {
    const user = await UserModel.create({
      firstNames: input.firstNames,
      paternalLastName: input.paternalLastName,
      maternalLastName: input.maternalLastName,
      email: input.email,
      username: input.username,
      passwordHash: await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS)
    })
    await startSession(user._id.toString())
    await ensureDefaultStatuses(user._id)
    return toUserDto(user.toObject())
  } catch (error) {
    // Carrera entre la verificación y la inserción: el índice único decide.
    if (isDuplicateKeyError(error)) {
      const field = Object.keys(error.keyPattern ?? {})[0]
      throw new AppError(
        field === REGISTER_FIELDS.EMAIL ? ERROR_CODES.EMAIL_TAKEN : ERROR_CODES.USERNAME_TAKEN
      )
    }
    throw error
  }
}

export async function login(raw: unknown): Promise<UserDto> {
  const data = requireObject(raw) as Partial<LoginInput>
  if (typeof data.identifier !== 'string' || typeof data.password !== 'string') {
    throw new AppError(ERROR_CODES.VALIDATION_FAILED)
  }
  const identifier = data.identifier.trim().toLowerCase()
  if (!identifier || !data.password || data.password.length > PASSWORD_POLICY.MAX_LENGTH) {
    throw new AppError(ERROR_CODES.INVALID_CREDENTIALS)
  }

  const user = await UserModel.findOne({
    $or: [{ email: identifier }, { username: identifier }]
  }).lean()
  const passwordMatches = user ? await bcrypt.compare(data.password, user.passwordHash) : false
  if (!user || !passwordMatches) throw new AppError(ERROR_CODES.INVALID_CREDENTIALS)

  await startSession(user._id.toString())
  await ensureDefaultStatuses(user._id)
  return toUserDto(user)
}

export async function logout(): Promise<null> {
  await endSession()
  return null
}

export async function getSession(): Promise<UserDto | null> {
  const userId = await restoreSession()
  if (!userId) return null
  const user = await UserModel.findById(userId).lean()
  if (!user) {
    await endSession()
    return null
  }
  await ensureDefaultStatuses(user._id)
  return toUserDto(user)
}
