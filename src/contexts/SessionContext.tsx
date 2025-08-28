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
  const [loading, setLoading] = useState(true); // Initial state is true

  useEffect(() => {
    const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
      console.log("Auth state change event:", event, "Session:", currentSession);

      if (event === 'SIGNED_IN' && currentSession?.user) {
        const userEmail = currentSession.user.email;
        const allowedDomain = 'cekottarakkara.ac.in';
        if (userEmail && !userEmail.endsWith(`@${allowedDomain}`)) {
          console.warn("Unauthorized email domain. Signing out.");
          await supabase.auth.signOut();
          showError(`Access is restricted to @${allowedDomain} emails.`);
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setLoading(false); // Ensure loading is false even after sign out
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
            console.error("Error fetching user role:", error);
            // Don't throw, just log and proceed with isAdmin = false
          }
          setIsAdmin(data?.role === 'admin');
        } catch (error) {
          console.error("Unexpected error during admin role check:", error);
          setIsAdmin(false); // Default to not admin on error
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false); // Always set loading to false at the end of the process
      console.log("SessionContext loading set to false.");
    };

    // Initial session check and listener setup
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleAuthStateChange('INITIAL_SESSION', initialSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this runs once on mount

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