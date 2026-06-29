import { ZapButton } from '@/components/ZapButton';
import type { Event } from 'nostr-tools';

interface ProfileZapButtonProps {
  pubkey: string;
  className?: string;
}

/**
 * A ZapButton for zapping a user's profile directly (not tied to a specific note).
 * Creates a synthetic kind-0 event that the useZaps hook recognises as a profile zap
 * (queries receipts by #p tag, creates zap requests without an e tag).
 */
export function ProfileZapButton({ pubkey, className }: ProfileZapButtonProps) {
  const syntheticEvent: Event = {
    id: '',
    kind: 0,
    pubkey,
    content: '',
    tags: [],
    created_at: 0,
    sig: '',
  };

  return <ZapButton target={syntheticEvent} className={className} showCount={false} />;
}
