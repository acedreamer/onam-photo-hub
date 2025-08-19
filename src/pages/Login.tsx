import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const { session } = useSession();

  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-dark-leaf-green">Welcome!</h1>
          <p className="text-neutral-gray mt-2">Sign in to share your Onam moments.</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          theme="light"
          socialLayout="horizontal"
        />
      </div>
    </div>
  );
};

export default Login;