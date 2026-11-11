/**
 * Catálogo de estados de tarea del usuario (viene de MongoDB).
 * Se carga al entrar al área autenticada y se actualiza tras cada cambio.
 */
import { create } from 'zustand'
import type { CreateStatusInput, TaskStatusDto, UpdateStatusInput } from '@shared/types'
import { api, getErrorMessage, unwrap } from '../api/client'

interface StatusState {
  statuses: TaskStatusDto[] | null
  error: string | null
  load: () => Promise<void>
  create: (input: CreateStatusInput) => Promise<void>
  update: (input: UpdateStatusInput) => Promise<void>
  remove: (id: string) => Promise<void>
  reorder: (ids: string[]) => Promise<void>
}

export const useStatusStore = create<StatusState>((set, get) => ({
  statuses: null,
  error: null,

  load: async () => {
    try {
      set({ statuses: await unwrap(api.statuses.list()), error: null })
    } catch (error) {
      set({ error: getErrorMessage(error) })
    }
  },

  create: async (input) => {
    const created = await unwrap(api.statuses.create(input))
    set({ statuses: [...(get().statuses ?? []), created] })
  },

  update: async (input) => {
    const updated = await unwrap(api.statuses.update(input))
    set({
      statuses: (get().statuses ?? []).map((status) =>
        status.id === updated.id ? updated : status
      )
    })
  },

  // Al eliminar, las tareas cambian de estado en el servidor: se recarga para tener los conteos reales.
  remove: async (id) => {
    await unwrap(api.statuses.remove(id))
    await get().load()
  },

  reorder: async (ids) => {
    const previous = get().statuses
    const byId = new Map((previous ?? []).map((status) => [status.id, status]))
    set({ statuses: ids.flatMap((id) => byId.get(id) ?? []) })
    try {
      set({ statuses: await unwrap(api.statuses.reorder({ ids })) })
    } catch (error) {
      set({ statuses: previous })
      throw error
    }
  }
}))

/** Busca un estado por id dentro del catálogo cargado. */
export function useStatus(statusId: string): TaskStatusDto | undefined {
  return useStatusStore((state) => state.statuses?.find((status) => status.id === statusId))
}
