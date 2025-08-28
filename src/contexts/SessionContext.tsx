import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

interface SessionContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  connectionError: boolean;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  user: null,
  loading: true,
  isAdmin: false,
  connectionError: false,
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Start a timeout to detect connection issues if onAuthStateChange doesn't fire
    timeoutRef.current = setTimeout(() => {
      if (loading) { // Only set error if still in loading state
        setConnectionError(true);
        setLoading(false);
        showError("Connection failed. Please check your network or ad blocker settings.");
      }
    }, 7000); // 7 seconds timeout

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Clear the timeout as soon as any auth state change event is received
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setConnectionError(false); // Reset connection error if an event comes through

      if (event === 'SIGNED_IN' && session?.user) {
        const userEmail = session.user.email;
        const allowedDomain = 'cekottarakkara.ac.in';
        if (userEmail && !userEmail.endsWith(`@${allowedDomain}`)) {
          await supabase.auth.signOut();
          showError(`Access is restricted to @${allowedDomain} emails.`);
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setLoading(false); // Ensure loading is false after handling restricted access
          return;
        }
      }
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') { // PGRST116 means "No rows found"
            console.error("Error fetching user roles:", error);
            setIsAdmin(false); // Default to not admin on error
          } else {
            setIsAdmin(data?.role === 'admin');
          }
        } catch (roleError) {
          console.error("Unhandled error fetching user roles:", roleError);
          setIsAdmin(false); // Default to not admin on unhandled error
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false); // Always set loading to false after processing an auth state change
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []); // Empty dependency array to run once on mount

  const value = {
    session,
    user,
    loading,
    isAdmin,
    connectionError,
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