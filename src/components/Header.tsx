import { useSession } from '@/contexts/SessionContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!session) return null;

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-30 p-4 flex justify-between items-center border-b">
      <div className="font-serif font-bold text-lg text-foreground">Onam Photo Hub</div>
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        Sign Out
        <LogOut className="h-4 w-4 ml-2" />
      </Button>
    </header>
  );
};

export default Header;