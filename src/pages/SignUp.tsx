import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { showError } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';

const SignUp = () => {
  const { session } = useSession();
  const [authError, setAuthError] = useState<string | null>(null);

  if (session) {
    return <Navigate to="/" replace />;
  }

  const handleAuthError = (error: Error) => {
    setAuthError(error.message);
    showError(error.message);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-5 dark:opacity-[0.02]">
        <img 
          src="/pookalam-detailed.svg" 
          alt="" 
          className="w-full h-full object-cover blur-sm scale-125"
          aria-hidden="true"
        />
      </div>
      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <img 
            src="/pookalam-detailed.svg" 
            alt="Onam Pookalam" 
            className="w-24 h-24 mx-auto mb-4 animate-spin-slow"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; e.currentTarget.onerror = null; }}
          />
          <h1 className="text-3xl font-bold text-foreground font-serif">Create Your Account</h1>
          <p className="text-muted-foreground mt-2">
            Join the celebration and share your moments.
          </p>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Note:</span> Only @cekottarakkara.ac.in email addresses are allowed for registration.
            </p>
          </div>
        </div>
        
        <div className="p-8 bg-card rounded-2xl shadow-lg border dark:border-bright-gold/20">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              extend: true,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))', // Primary button background
                    brandAccent: 'hsl(var(--primary-foreground))', // Primary button text
                  },
                },
              },
              styles: {
                button: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  '&:hover': {
                    backgroundColor: 'hsl(var(--primary) / 0.9)',
                  },
                },
                input: {
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                  '&:focus': {
                    borderColor: 'hsl(var(--ring))',
                    boxShadow: '0 0 0 2px hsl(var(--ring) / 0.2)',
                  },
                },
                label: {
                  color: 'hsl(var(--foreground))',
                },
                anchor: {
                  color: 'hsl(var(--primary))',
                  '&:hover': {
                    color: 'hsl(var(--primary) / 0.8)',
                  },
                },
              },
            }}
            providers={['google']}
            redirectTo={window.location.origin}
            view="sign_up"
            theme="light"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Password',
                  email_input_placeholder: 'yourname@cekottarakkara.ac.in',
                  password_input_placeholder: '••••••••',
                  button_label: 'Sign In',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: 'Already have an account? Sign in',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Password',
                  email_input_placeholder: 'yourname@cekottarakkara.ac.in',
                  password_input_placeholder: '••••••••',
                  button_label: 'Sign Up',
                  social_provider_text: 'Sign up with {{provider}}',
                  link_text: 'Don\'t have an account? Sign up',
                },
                forgotten_password: {
                  email_label: 'Email',
                  email_input_placeholder: 'yourname@cekottarakkara.ac.in',
                  button_label: 'Send reset instructions',
                  link_text: 'Forgot your password?',
                },
                update_password: {
                  password_label: 'New Password',
                  password_input_placeholder: '••••••••',
                  button_label: 'Update Password',
                },
              },
            }}
            onError={handleAuthError}
          />
          {authError && (
            <p className="text-red-500 text-sm mt-4 text-center">{authError}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;