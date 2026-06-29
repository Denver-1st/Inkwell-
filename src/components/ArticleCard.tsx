import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthor } from '@/hooks/useAuthor';
import { useProfileUrl } from '@/hooks/useProfileUrl';
import { getDisplayName } from '@/lib/getDisplayName';
import { ZapButton } from '@/components/ZapButton';
import { sanitizeUrl } from '@/lib/sanitizeUrl';

interface ArticleCardProps {
  event: NostrEvent;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

export function ArticleCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-5 px-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-3/4 mt-4" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-5/6 mt-1" />
      </CardContent>
    </Card>
  );
}

export function ArticleCard({ event }: ArticleCardProps) {
  const author = useAuthor(event.pubkey);
  const metadata = author.data?.metadata;
  const displayName = getDisplayName(metadata, event.pubkey);
  const profileUrl = useProfileUrl(event.pubkey, metadata);
  const picture = metadata?.picture;

  const title = event.tags.find(([n]) => n === 'title')?.[1] ?? 'Untitled';
  const summary = event.tags.find(([n]) => n === 'summary')?.[1];
  const image = event.tags.find(([n]) => n === 'image')?.[1];
  const publishedAt = event.tags.find(([n]) => n === 'published_at')?.[1];
  const timestamp = publishedAt ? parseInt(publishedAt) : event.created_at;
  const identifier = event.tags.find(([n]) => n === 'd')?.[1] ?? '';

  // Build naddr for the article
  const naddr = nip19.naddrEncode({
    kind: 30023,
    pubkey: event.pubkey,
    identifier,
  });

  const safeImage = image ? sanitizeUrl(image) : undefined;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      {safeImage && (
        <Link to={`/${naddr}`}>
          <div className="aspect-[16/9] overflow-hidden bg-muted">
            <img
              src={safeImage}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </Link>
      )}
      <CardContent className="pt-4 px-5">
        {/* Author row */}
        <div className="flex items-center gap-2 mb-3">
          <Link to={profileUrl}>
            <Avatar className="h-7 w-7">
              <AvatarImage src={picture} alt={displayName} />
              <AvatarFallback className="text-xs">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <Link to={profileUrl} className="text-sm font-medium hover:underline truncate">
            {displayName}
          </Link>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {formatTime(timestamp)}
          </span>
        </div>

        {/* Title */}
        <Link to={`/${naddr}`}>
          <h2 className="text-xl font-bold leading-snug hover:text-primary transition-colors">
            {title}
          </h2>
        </Link>

        {/* Summary */}
        {summary && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
            {summary}
          </p>
        )}

        {/* Meta */}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{readingTime(event.content)}</span>
        </div>
      </CardContent>
      <CardFooter className="px-5 pb-3 pt-0 gap-1">
        <ZapButton target={event as unknown as import('nostr-tools').Event} className="text-xs" />
      </CardFooter>
    </Card>
  );
}
