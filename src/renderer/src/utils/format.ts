/**
 * Formateadores de presentación (fechas y nombres).
 */
import { APP_LOCALE } from '@shared/constants'
import type { UserDto } from '@shared/types'

const dateFormatter = new Intl.DateTimeFormat(APP_LOCALE, { dateStyle: 'medium' })
const dateTimeFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  dateStyle: 'medium',
  timeStyle: 'short'
})

export const formatDate = (iso: string): string => dateFormatter.format(new Date(iso))

export const formatDateTime = (iso: string): string => dateTimeFormatter.format(new Date(iso))

export const getDisplayName = (user: UserDto): string =>
  `${user.firstNames} ${user.paternalLastName}`

export const getInitials = (user: UserDto): string =>
  `${user.firstNames.charAt(0)}${user.paternalLastName.charAt(0)}`.toUpperCase()
