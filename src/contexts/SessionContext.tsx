import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

interface SessionContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  user: null,
  loading: true,
  isAdmin: false,
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userEmail = session.user.email;
        const allowedDomain = 'cekottarakkara.ac.in';
        if (userEmail && !userEmail.endsWith(`@${allowedDomain}`)) {
          supabase.auth.signOut();
          showError(`Access is restricted to @${allowedDomain} emails.`);
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }
      }
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        setIsAdmin(data?.role === 'admin');
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    loading,
    isAdmin,
  };

  return (
    <SessionContext.Provider value={value}>
      {!loading && children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};