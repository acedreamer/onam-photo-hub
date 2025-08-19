import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

interface SessionContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  user: null,
  loading: true,
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange fires immediately with the session if it exists in storage.
    // This handles both initial page loads and subsequent auth events like sign-in/sign-out.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // This logic restricts logins to a specific email domain.
      if (event === 'SIGNED_IN' && session?.user) {
        const userEmail = session.user.email;
        const allowedDomain = 'cekottarakkara.ac.in';
        if (userEmail && !userEmail.endsWith(`@${allowedDomain}`)) {
          supabase.auth.signOut();
          showError(`Access is restricted to @${allowedDomain} emails.`);
          setSession(null);
          setUser(null);
          setLoading(false); // Stop loading even on error
          return;
        }
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      // The first time this callback runs, we know the session state is resolved.
      setLoading(false);
    });

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    loading,
  };

  return (
    <SessionContext.Provider value={value}>
      {/* We wait until the initial loading is false before rendering children */}
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