import create from 'zustand'

type User = { id: string; email?: string; role?: string } | null
type UserState = {
  user: User
  setUser: (u: User) => void
  logout: () => void
}

export const useUser = create<UserState>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
  logout: () => set({ user: null })
}))
