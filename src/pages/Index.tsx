import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ArticleCard, ArticleCardSkeleton } from '@/components/ArticleCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, PenLine, Sparkles, Wallet } from 'lucide-react';
import { useArticles } from '@/hooks/useArticles';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const Index = () => {
  useSeoMeta({
    title: 'Inkwell — Nostr blogging with Lightning zaps',
    description: 'A Nostr blogging platform where you can publish articles and support creators with Bitcoin Lightning zaps. No account needed to send tips.',
  });

  const { data: articles, isLoading, isError, refetch } = useArticles(30);
  const { user } = useCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-2">
            <Zap className="h-8 w-8 text-primary" fill="currentColor" />
            Inkwell
          </h1>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            A Nostr publishing platform. Read articles, zap creators with Bitcoin Lightning.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {user && (
              <Button asChild size="sm">
                <Link to="/write">
                  <PenLine className="h-4 w-4 mr-1" />
                  Write
                </Link>
              </Button>
            )}
          </div>
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

        {/* Article Feed */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </>
          ) : isError ? (
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                  Could not load articles. Please check your relay connections.
                </p>
                <Button variant="outline" onClick={() => refetch()}>
                  Try again
                </Button>
              </CardContent>
            </Card>
          ) : articles && articles.length > 0 ? (
            articles.map((event) => <ArticleCard key={event.id} event={event} />)
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                  No articles found yet. {user ? 'Be the first to publish!' : 'Try again in a moment.'}
                </p>
                {user && (
                  <Button asChild>
                    <Link to="/write">
                      <PenLine className="h-4 w-4 mr-1" />
                      Write an article
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
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
