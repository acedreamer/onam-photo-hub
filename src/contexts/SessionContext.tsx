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
      try {
        // Domain restriction check
        if (event === 'SIGNED_IN' && session?.user) {
          const userEmail = session.user.email;
          const allowedDomain = 'cekottarakkara.ac.in';
          if (userEmail && !userEmail.endsWith(`@${allowedDomain}`)) {
            await supabase.auth.signOut();
            showError(`Access is restricted to @${allowedDomain} emails.`);
            setSession(null);
            setUser(null);
            setIsAdmin(false);
            // Clear hash immediately after sign out due to domain restriction
            if (window.location.hash.includes('access_token')) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
            return;
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle(); // Using maybeSingle() to gracefully handle no role found
          
          if (error) {
            console.error("Error fetching user role:", error);
          }
          setIsAdmin(data?.role === 'admin');
        } else {
          setIsAdmin(false);
        }

        // Clear hash after successful session processing (SIGNED_IN or INITIAL_SESSION)
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && window.location.hash.includes('access_token')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

      } catch (error: any) {
        console.error("Error in onAuthStateChange:", error);
        showError(error.message || "An unexpected authentication error occurred.");
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

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
      {children} {/* Always render children, ProtectedRoute handles loading */}
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