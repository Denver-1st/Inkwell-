import { nip19 } from 'nostr-tools';
import { useParams, Link } from 'react-router-dom';
import { useAuthor } from '@/hooks/useAuthor';
import { useAuthorNotes } from '@/hooks/useAuthorNotes';
import { useEvent } from '@/hooks/useEvent';
import { useProfileUrl } from '@/hooks/useProfileUrl';
import { getDisplayName } from '@/lib/getDisplayName';
import { Header } from '@/components/Header';
import { NoteCard, NoteCardSkeleton } from '@/components/NoteCard';
import { NoteContent } from '@/components/NoteContent';
import { ProfileZapButton } from '@/components/ProfileZapButton';
import { ZapButton } from '@/components/ZapButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import NotFound from './NotFound';

// ─── Profile View ──────────────────────────────────────────────

function ProfileView({ pubkey, relays }: { pubkey: string; relays?: string[] }) {
  const author = useAuthor(pubkey);
  const { data: notes, isLoading } = useAuthorNotes(pubkey, 15);
  const profileUrl = useProfileUrl(pubkey, author.data?.metadata);
  const metadata = author.data?.metadata;
  const displayName = getDisplayName(metadata, pubkey);
  const picture = metadata?.picture;
  const about = metadata?.about;
  const lud16 = metadata?.lud16;
  const lud06 = metadata?.lud06;
  const website = metadata?.website;
  const npub = nip19.npubEncode(pubkey);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>

        {author.isLoading && !metadata ? (
          <Card>
            <CardContent className="pt-6 px-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mt-4" />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 px-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={picture} alt={displayName} />
                  <AvatarFallback className="text-xl">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold truncate">{displayName}</h1>
                  <p className="text-sm text-muted-foreground font-mono truncate">{npub.slice(0, 24)}…</p>
                  {website && (
                    <a
                      href={website.startsWith('http') ? website : `https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {website}
                    </a>
                  )}
                </div>
              </div>

              {about && (
                <p className="mt-4 text-sm text-foreground/90 whitespace-pre-wrap break-words">{about}</p>
              )}

              <div className="mt-4 flex items-center gap-2">
                {(lud16 || lud06) && (
                  <ProfileZapButton pubkey={pubkey} className="bg-primary/10 hover:bg-primary/20 rounded-full px-4 py-2 text-primary font-medium" />
                )}
                <span className="text-xs text-muted-foreground">
                  {(lud16 || lud06) ? `⚡ ${lud16 || lud06}` : 'No Lightning address'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Author's notes */}
        <h2 className="mt-8 mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Notes</h2>
        <div className="space-y-3">
          {isLoading ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => <NoteCardSkeleton key={i} />)}
            </>
          ) : notes && notes.length > 0 ? (
            notes.map((event) => <NoteCard key={event.id} event={event} />)
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 px-8 text-center">
                <p className="text-muted-foreground text-sm">No notes from this author yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Note / Event View ──────────────────────────────────────────

function NoteView({ eventId, authorHint, relays }: { eventId: string; authorHint?: string; relays?: string[] }) {
  const { data: event, isLoading, isError } = useEvent({ id: eventId });
  const author = useAuthor(event?.pubkey ?? authorHint);
  const metadata = author.data?.metadata;
  const displayName = getDisplayName(metadata, event?.pubkey ?? authorHint ?? '');
  const profileUrl = useProfileUrl(event?.pubkey ?? authorHint ?? '', metadata);
  const picture = metadata?.picture;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link to={profileUrl} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        {isLoading ? (
          <NoteCardSkeleton />
        ) : isError || !event ? (
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <p className="text-muted-foreground max-w-sm mx-auto">
                This note could not be found. It may not have been broadcast to your connected relays.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-4 px-4">
              <div className="flex items-start gap-3">
                <Link to={profileUrl}>
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={picture} alt={displayName} />
                    <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={profileUrl} className="font-medium hover:underline truncate block">
                    {displayName}
                  </Link>
                </div>
              </div>
              <div className="mt-3">
                <NoteContent event={event} className="text-base leading-relaxed" />
              </div>
            </CardContent>
            <CardFooter className="px-4 pb-3 pt-1 gap-1">
              <ZapButton target={event as unknown as import('nostr-tools').Event} className="text-xs" />
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}

// ─── Main NIP19 Router ──────────────────────────────────────────

export function NIP19Page() {
  const { nip19: identifier } = useParams<{ nip19: string }>();

  if (!identifier) {
    return <NotFound />;
  }

  let decoded;
  try {
    decoded = nip19.decode(identifier);
  } catch {
    return <NotFound />;
  }

  const { type } = decoded;

  switch (type) {
    case 'npub':
      return <ProfileView pubkey={(decoded.data as { data: string }).data} />;

    case 'nprofile':
      return <ProfileView pubkey={(decoded.data as { pubkey: string }).pubkey} relays={(decoded.data as { relays?: string[] }).relays} />;

    case 'note':
      return <NoteView eventId={(decoded.data as { data: string }).data} />;

    case 'nevent':
      return (
        <NoteView
          eventId={(decoded.data as { id: string }).id}
          authorHint={(decoded.data as { author?: string }).author}
          relays={(decoded.data as { relays?: string[] }).relays}
        />
      );

    case 'naddr': {
      const data = decoded.data as { kind: number; pubkey: string; identifier: string; relays?: string[] };
      return <AddressableView kind={data.kind} author={data.pubkey} identifier={data.identifier} />;
    }

    default:
      return <NotFound />;
  }
}

// ─── Addressable Event View ─────────────────────────────────────

function AddressableView({ kind, author: authorPubkey, identifier }: { kind: number; author: string; identifier: string }) {
  const { data: event, isLoading, isError } = useEvent({ kind, author: authorPubkey, identifier });
  const author = useAuthor(authorPubkey);
  const metadata = author.data?.metadata;
  const displayName = getDisplayName(metadata, authorPubkey);
  const profileUrl = useProfileUrl(authorPubkey, metadata);
  const picture = metadata?.picture;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>

        {isLoading ? (
          <NoteCardSkeleton />
        ) : isError || !event ? (
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <p className="text-muted-foreground max-w-sm mx-auto">
                This content could not be found on your connected relays.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-4 px-4">
              <div className="flex items-start gap-3">
                <Link to={profileUrl}>
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={picture} alt={displayName} />
                    <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={profileUrl} className="font-medium hover:underline truncate block">
                    {displayName}
                  </Link>
                </div>
              </div>
              <div className="mt-3">
                <NoteContent event={event} className="text-base leading-relaxed" />
              </div>
            </CardContent>
            <CardFooter className="px-4 pb-3 pt-1 gap-1">
              <ZapButton target={event as unknown as import('nostr-tools').Event} className="text-xs" />
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}
