import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isInitialized: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: any | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      profile: null,
      isInitialized: false,

      setSession: (session) => {
        set({ 
          session, 
          user: session?.user ?? null 
        });
      },

      setProfile: (profile) => set({ profile }),

      initialize: async () => {
        if (get().isInitialized) return;

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          set({ session, user: session.user, profile, isInitialized: true });
        } else {
          set({ isInitialized: true });
        }

        // Listener para mudanças de estado (ex: expiração de token)
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
            set({ session: null, user: null, profile: null });
            // Força redirecionamento se necessário via window ou router
          } else if (session) {
            set({ session, user: session.user });
            // Otimização: busca perfil apenas se não tiver ou se o user mudou
            const currentProfile = get().profile;
            if (!currentProfile || currentProfile.id !== session.user.id) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              set({ profile });
            }
          }
        });
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null, profile: null });
      },
    }),
    {
      name: 'diamond-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ session: state.session, profile: state.profile }),
    }
  )
);