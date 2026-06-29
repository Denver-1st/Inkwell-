import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoginArea } from '@/components/auth/LoginArea';
import { WalletModal } from '@/components/WalletModal';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Zap className="h-5 w-5 text-primary" fill="currentColor" />
          <span>Inkwell</span>
        </Link>
        <div className="flex items-center gap-2">
          <WalletModal />
          <LoginArea className="max-w-40" />
        </div>
      </div>
    </header>
  );
}
