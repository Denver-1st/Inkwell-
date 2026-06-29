import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthor } from '@/hooks/useAuthor';
import { useAuthorNotes } from '@/hooks/useAuthorNotes';
import { useProfileUrl } from '@/hooks/useProfileUrl';
import { getDisplayName } from '@/lib/getDisplayName';
import { ArticleContent } from '@/components/ArticleContent';
import { ArticleCard, ArticleCardSkeleton } from '@/components/ArticleCard';
import { ZapButton } from '@/components/ZapButton';
import { ProfileZapButton } from '@/components/ProfileZapButton';
import { sanitizeUrl } from '@/lib/sanitizeUrl';
import { ArrowLeft, ExternalLink, Calendar, Clock } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

// ─── Article Detail View ──────────────────────────────────────

export function ArticleView({ event }: { event: NostrEvent }) {
  const author = useAuthor(event.pubkey);
  const { data: authorNotes } = useAuthorNotes(event.pubkey, 5);
  const metadata = author.data?.metadata;
  const displayName = getDisplayName(metadata, event.pubkey);
  const profileUrl = useProfileUrl(event.pubkey, metadata);
  const picture = metadata?.picture;

  const title = event.tags.find(([n]) => n === 'title')?.[1] ?? 'Untitled';
  const summary = event.tags.find(([n]) => n === 'summary')?.[1];
  const image = event.tags.find(([n]) => n === 'image')?.[1];
  const publishedAt = event.tags.find(([n]) => n === 'published_at')?.[1];
  const timestamp = publishedAt ? parseInt(publishedAt) : event.created_at;
  const tagList = event.tags.filter(([n]) => n === 't').map(([, v]) => v);

  const safeImage = image ? sanitizeUrl(image) : undefined;
  const safeAbout = metadata?.about;
  const safeWebsite = metadata?.website ? sanitizeUrl(metadata.website.startsWith('http') ? metadata.website : `https://${metadata.website}`) : undefined;

  // Other articles by this author (excluding current)
  const otherArticles = (authorNotes ?? []).filter(a => a.id !== event.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          {/* Author */}
          <div className="flex items-center gap-3 mb-6">
            <Link to={profileUrl}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={picture} alt={displayName} />
                <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0">
              <Link to={profileUrl} className="font-medium hover:underline block truncate">
                {displayName}
              </Link>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatTime(timestamp)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {readingTime(event.content)}
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{title}</h1>

          {/* Summary */}
          {summary && (
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{summary}</p>
          )}

          {/* Cover Image */}
          {safeImage && (
            <div className="mt-6 aspect-[16/9] overflow-hidden rounded-xl bg-muted">
              <img src={safeImage} alt={title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Tags */}
          {tagList.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tagList.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Article Content */}
        <article className="mb-10">
          <ArticleContent content={event.content} />
        </article>

        {/* Zap Section */}
        <div className="my-8 border-t border-b py-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Enjoyed this article? Support {displayName} with a Lightning zap.
          </p>
          <div className="flex items-center justify-center gap-3">
            <ZapButton target={event as unknown as import('nostr-tools').Event} className="bg-primary/10 hover:bg-primary/20 rounded-full px-5 py-2 text-primary font-medium" />
            <ProfileZapButton pubkey={event.pubkey} className="bg-muted hover:bg-muted/80 rounded-full px-5 py-2 text-foreground font-medium" />
          </div>
        </div>

        {/* Author Bio */}
        <Card className="mb-8">
          <CardContent className="pt-5 px-5">
            <div className="flex items-start gap-4">
              <Link to={profileUrl}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={picture} alt={displayName} />
                  <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={profileUrl} className="font-medium hover:underline">
                  {displayName}
                </Link>
                {safeAbout && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{safeAbout}</p>
                )}
                {safeWebsite && (
                  <a href={safeWebsite} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                    <ExternalLink className="h-3 w-3" />
                    {metadata?.website}
                  </a>
                )}
              </div>
              <ProfileZapButton pubkey={event.pubkey} className="text-xs" />
            </div>
          </CardContent>
        </Card>

        {/* More from this author */}
        {otherArticles.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              More from {displayName}
            </h3>
            <div className="space-y-4">
              {otherArticles.map((article) => (
                <ArticleCard key={article.id} event={article} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Loading / Error States ────────────────────────────────────

export function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Skeleton className="h-4 w-24 mb-6" />
      <Skeleton className="h-8 w-8 rounded-full mb-6" />
      <Skeleton className="h-10 w-3/4 mb-4" />
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-5/6 mb-8" />
      <Skeleton className="h-48 w-full rounded-xl mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
