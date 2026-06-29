import { useSeoMeta } from '@unhead/react';
import { Header } from '@/components/Header';
import { NoteCard, NoteCardSkeleton } from '@/components/NoteCard';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Sparkles, Wallet } from 'lucide-react';
import { useTimeline } from '@/hooks/useTimeline';

const Index = () => {
  useSeoMeta({
    title: 'Inkwell — Zap creators on Nostr',
    description: 'A Nostr client where you can zap creators with Bitcoin Lightning. No Nostr account required to send tips.',
  });

  const { data: notes, isLoading, isError, refetch } = useTimeline(30);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Hero */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
            <Zap className="h-7 w-7 text-primary" fill="currentColor" />
            Inkwell
          </h1>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Support Nostr creators with Bitcoin Lightning zaps. No account needed — just a Lightning wallet.
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Nostr native zaps
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5" />
              Guest tipping
            </span>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-3">
          {isLoading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <NoteCardSkeleton key={i} />
              ))}
            </>
          ) : isError ? (
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                  Could not load notes. Please check your relay connections.
                </p>
                <button
                  onClick={() => refetch()}
                  className="text-sm text-primary hover:underline"
                >
                  Try again
                </button>
              </CardContent>
            </Card>
          ) : notes && notes.length > 0 ? (
            notes.map((event) => <NoteCard key={event.id} event={event} />)
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <p className="text-muted-foreground max-w-sm mx-auto">
                  No notes found. Try again in a moment.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <a
            href="https://shakespeare.diy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Vibed with Shakespeare
          </a>
        </div>
      </main>
    </div>
  );
};

export default Index;
