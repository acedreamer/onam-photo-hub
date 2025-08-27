import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { Navigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { showError } from '@/utils/toast';

const Login = () => {
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
          <h1 className="text-3xl font-bold text-foreground font-serif">Welcome Back!</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to continue your celebration.
          </p>
        </div>
        
        <div className="p-8 bg-card rounded-2xl shadow-lg border dark:border-bright-gold/20">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
            redirectTo={window.location.origin}
            view="sign_in"
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
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Only @cekottarakkara.ac.in emails are allowed
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;