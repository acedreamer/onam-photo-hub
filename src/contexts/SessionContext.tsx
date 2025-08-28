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
  const isMounted = useRef(true); // To prevent state updates on unmounted component

  const handleAuthSession = async (currentSession: Session | null) => {
    if (!isMounted.current) return;

    // Clear the timeout as soon as any auth state change event is received or initial session is processed
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setConnectionError(false); // Reset connection error if an event comes through

    if (currentSession?.user) {
      const userEmail = currentSession.user.email;
      const allowedDomain = 'cekottarakkara.ac.in';
      if (userEmail && !userEmail.endsWith(`@${allowedDomain}`)) {
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
        
        if (error && error.code !== 'PGRST116') { // PGRST116 means "No rows found"
          console.error("Error fetching user roles:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.role === 'admin');
        }
      } catch (roleError) {
        console.error("Unhandled error fetching user roles:", roleError);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    isMounted.current = true;

    // Initial session check
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        await handleAuthSession(initialSession);
      } catch (err: any) {
        console.error("Error getting initial session:", err);
        if (isMounted.current) {
          setConnectionError(true);
          setLoading(false);
          showError("Failed to connect to authentication services. Please check your network.");
        }
      }
    };

    getInitialSession();

    // Set up the timeout for connection error if initial session takes too long
    timeoutRef.current = setTimeout(() => {
      if (isMounted.current && loading) {
        setConnectionError(true);
        setLoading(false);
        showError("Connection failed. Please check your network or ad blocker settings.");
      }
    }, 7000);

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthSession(session);
    });

    return () => {
      isMounted.current = false;
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