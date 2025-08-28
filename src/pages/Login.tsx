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
            appearance={{
              theme: ThemeSupa,
              extend: true,
              variables: {
                default: {
                  colors: {
                    brand: '#006400', // dark-leaf-green for primary buttons
                    brandAccent: '#FAFAF5', // ivory for primary button text
                    
                    // Onam theming for social provider buttons (e.g., Google)
                    defaultButtonBackground: '#FAFAF5', // ivory
                    defaultButtonBackgroundHover: '#FFD700', // bright-gold
                    defaultButtonBorder: '#006400', // dark-leaf-green
                    defaultButtonText: '#006400', // dark-leaf-green

                    inputBackground: '#FFFFFF', // white for input background
                    inputBorder: '#E5E7EB', // light gray for input border
                    inputBorderHover: '#D1D5DB', // slightly darker gray on hover
                    inputBorderFocus: '#006400', // dark-leaf-green on focus
                    inputText: '#333333', // neutral gray for input text
                    inputPlaceholder: '#6B7280', // gray for placeholder text
                    text: '#333333', // neutral gray for general text
                    textAccent: '#006400', // dark-leaf-green for links/accents
                    textLink: '#006400', // dark-leaf-green for links
                    textLinkHover: '#004d00', // slightly darker green for link hover
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    borderRadiusInput: '0.5rem',
                  },
                },
              },
              styles: {
                button: {
                  backgroundColor: '#006400', // dark-leaf-green for primary button
                  color: '#FAFAF5', // ivory for primary button text
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  '&:hover': {
                    backgroundColor: '#004d00', // Slightly darker green for hover
                    color: '#FAFAF5',
                  },
                },
                input: {
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                  '&:focus': {
                    borderColor: 'hsl(var(--ring))',
                    boxShadow: '0 0 0 2px rgba(0, 100, 0, 0.2)', // Green shadow
                  },
                },
                label: {
                  color: 'hsl(var(--foreground))',
                },
                anchor: {
                  color: '#006400', // dark-leaf-green
                  '&:hover': {
                    color: '#004d00', // Slightly darker green for hover
                  },
                },
              },
            }}
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