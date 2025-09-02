import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react'; // Added import for Loader2

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
    console.log("SessionProvider useEffect: Setting up auth state listener.");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log(`Auth State Change Event: ${event}`);
      console.log("Current Session:", currentSession);

      if (event === 'SIGNED_IN' && currentSession?.user) {
        const userEmail = currentSession.user.email;
        const allowedDomain = 'cekottarakkara.ac.in';
        if (userEmail && !userEmail.endsWith(`@${allowedDomain}`)) {
          console.warn(`Unauthorized domain detected: ${userEmail}. Signing out.`);
          await supabase.auth.signOut(); // Ensure this is awaited
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
      console.log("Session and User state updated.");

      if (currentSession?.user) {
        console.log("Fetching user roles for:", currentSession.user.id);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', currentSession.user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine if no role is assigned
          console.error("Error fetching user role:", error);
        }
        setIsAdmin(data?.role === 'admin');
        console.log("Is Admin:", data?.role === 'admin');
      } else {
        setIsAdmin(false);
        console.log("User not logged in, isAdmin set to false.");
      }

      setLoading(false);
      console.log("Loading state set to false.");
    });

    return () => {
      console.log("SessionProvider useEffect cleanup: Unsubscribing from auth state listener.");
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
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-ivory">
          <Loader2 className="h-12 w-12 animate-spin text-dark-leaf-green" />
        </div>
      ) : (
        children
      )}
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