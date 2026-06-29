import { Zap, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoginArea } from '@/components/auth/LoginArea';
import { WalletModal } from '@/components/WalletModal';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Zap className="h-5 w-5 text-primary" fill="currentColor" />
          <span>Inkwell</span>
        </Link>
        <div className="flex items-center gap-2">
          {user && (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/write">
                  <PenLine className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Write</span>
                </Link>
              </Button>
              <WalletModal />
            </>
          )}
          <LoginArea className="max-w-40" />
        </div>
      </div>
    </header>
  );
}
