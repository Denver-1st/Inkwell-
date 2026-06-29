import { Link } from 'react-router-dom';
import type { NostrEvent } from '@nostrify/nostrify';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthor } from '@/hooks/useAuthor';
import { useProfileUrl } from '@/hooks/useProfileUrl';
import { getDisplayName } from '@/lib/getDisplayName';
import { NoteContent } from '@/components/NoteContent';
import { ZapButton } from '@/components/ZapButton';
import { nip19 } from 'nostr-tools';

interface NoteCardProps {
  event: NostrEvent;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function NoteCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-4 px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}

export function NoteCard({ event }: NoteCardProps) {
  const author = useAuthor(event.pubkey);
  const profileUrl = useProfileUrl(event.pubkey, author.data?.metadata);
  const metadata = author.data?.metadata;
  const displayName = getDisplayName(metadata, event.pubkey);
  const noteNaddr = nip19.noteEncode(event.id);

  const picture = metadata?.picture;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="pt-4 px-4">
        <div className="flex items-start gap-3">
          <Link to={profileUrl}>
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={picture} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-sm">
              <Link to={profileUrl} className="font-medium hover:underline truncate">
                {displayName}
              </Link>
              <span className="text-muted-foreground text-xs shrink-0">
                {formatTime(event.created_at)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <Link to={`/${noteNaddr}`}>
            <NoteContent event={event} className="text-sm leading-relaxed" />
          </Link>
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-3 pt-1 gap-1">
        <ZapButton target={event as unknown as import('nostr-tools').Event} className="text-xs" />
      </CardFooter>
    </Card>
  );
}
