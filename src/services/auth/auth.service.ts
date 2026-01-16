import { supabase } from '../supabaseClient';
import { Role } from './roles';

export type User = {
  id: string;
  email?: string;
  name?: string;
  roles?: Role[];
};

const hasSupabase = (supabase as any) && typeof (supabase as any).auth === 'object';

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    if (!hasSupabase) {
      return null;
    }
    const { data: { user } = { user: null } } = await (supabase as any).auth.getUser().catch(() => ({ data: { user: null } }));
    if (!user) return null;
    return {
      id: user.id,
      email: (user as any).email,
      name: (user as any).user_metadata?.name,
      roles: (user as any).user_metadata?.roles || [],
    } as User;
  },

  hasRole(user: User | null, role: Role): boolean {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  },

  async signInWithEmail(email: string, password: string): Promise<User | null> {
    if (!hasSupabase) {
      return null;
    }
    const { data, error } = await (supabase as any).auth.signInWithPassword({ email, password }).catch((e: any) => ({ data: null, error: e }));
    if (error) {
      return null;
    }
    if (!data?.user) return null;
    return { id: data.user.id, email: data.user.email } as User;
  },
};

export default authService;
