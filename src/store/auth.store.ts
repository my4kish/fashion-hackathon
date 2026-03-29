import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Profile, UserRole } from '../types';
import { useCatalogStore } from './catalog.store';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<Profile | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        set({ session });
        useCatalogStore.getState().resetForUser(session.user.id);
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        set({ profile: data as Profile | null, initialized: true });
      } else {
        useCatalogStore.getState().resetForUser(null);
        set({ initialized: true });
      }

      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          set({ session: null, profile: null });
          useCatalogStore.getState().resetForUser(null);
          return;
        }
        set({ session });
        if (session) {
          useCatalogStore.getState().resetForUser(session.user.id);
          get().fetchProfile();
        }
      });
    } catch {
      set({ initialized: true });
    }
  },

  fetchProfile: async () => {
    const { session } = get();
    if (!session) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!error && data) {
      set({ profile: data as Profile });
      return data as Profile;
    }
    return null;
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await get().fetchProfile();
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, fullName, phone) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, phone } },
      });
      if (error) throw error;
      if (data.session) {
        set({ session: data.session });
      }
      await new Promise((r) => setTimeout(r, 500));
      await get().fetchProfile();
    } finally {
      set({ loading: false });
    }
  },

  setRole: async (role) => {
    let userId = get().session?.user?.id;
    if (!userId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        set({ session });
        userId = session.user.id;
      }
    }
    if (!userId) return;

    const fullName = get().profile?.full_name || '';
    const initials = fullName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || fullName.slice(0, 2).toUpperCase();

    await supabase
      .from('profiles')
      .update({ role, avatar_initials: initials })
      .eq('id', userId);

    await get().fetchProfile();
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    useCatalogStore.getState().resetForUser(null);
    set({ session: null, profile: null, initialized: true });
  },
}));
