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
    const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
      console.log("SessionContext: Auth state change event:", event, "Session:", currentSession);

      if (event === 'SIGNED_IN' && currentSession?.user) {
        const userEmail = currentSession.user.email;
        const allowedDomain = 'cekottarakkara.ac.in';
        if (userEmail && !userEmail.endsWith(`@${allowedDomain}`)) {
          console.warn("SessionContext: Unauthorized email domain. Signing out.");
          await supabase.auth.signOut();
          showError(`Access is restricted to @${allowedDomain} emails.`);
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }
      }
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        try {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', currentSession.user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine if not an admin
            console.error("SessionContext: Error fetching user role:", error);
          }
          setIsAdmin(data?.role === 'admin');
        } catch (error) {
          console.error("SessionContext: Unexpected error during admin role check:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
      console.log("SessionContext: Auth state change handled, loading set to false.");
    };

    const setupInitialSession = async () => {
      console.log("SessionContext: Starting initial session setup.");
      try {
        const { data: { session: initialSession }, error: getSessionError } = await supabase.auth.getSession();
        if (getSessionError) {
          console.error("SessionContext: Error getting initial session:", getSessionError);
          showError("Failed to load initial session.");
        }
        await handleAuthStateChange('INITIAL_SESSION', initialSession);
      } catch (error) {
        console.error("SessionContext: Unexpected error during initial session setup:", error);
        showError("An unexpected error occurred during session setup.");
      } finally {
        // Ensure loading is set to false even if there's an error
        setLoading(false);
        console.log("SessionContext: Initial setup complete, loading set to false.");
      }
    };

    setupInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

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
      {children}
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