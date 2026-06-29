import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { nip19 } from 'nostr-tools';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || `article-${Date.now()}`;
}

export default function WriteArticle() {
  useSeoMeta({
    title: 'Write — Inkwell',
    description: 'Publish a new article on Nostr.',
  });

  const { user } = useCurrentUser();
  const { mutate: publishEvent, isPending } = useNostrPublish();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-6">
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">
                You need to log in with Nostr to publish articles.
              </p>
              <Button onClick={() => navigate('/')}>
                Back to home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const handlePublish = () => {
    if (!title.trim()) {
      toast({ title: 'Title required', description: 'Please enter a title for your article.', variant: 'destructive' });
      return;
    }
    if (!content.trim()) {
      toast({ title: 'Content required', description: 'Please write some content before publishing.', variant: 'destructive' });
      return;
    }

    const identifier = slugify(title);
    const now = Math.floor(Date.now() / 1000);

    const eventTags: string[][] = [
      ['d', identifier],
      ['title', title.trim()],
      ['published_at', String(now)],
    ];

    if (summary.trim()) {
      eventTags.push(['summary', summary.trim()]);
    }

    if (image.trim()) {
      eventTags.push(['image', image.trim()]);
    }

    // Parse comma-separated tags
    const tagList = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    for (const tag of tagList) {
      eventTags.push(['t', tag]);
    }

    publishEvent({
      kind: 30023,
      content,
      tags: eventTags,
    }, {
      onSuccess: (event) => {
        toast({ title: 'Article published!', description: 'Your article is now live on Nostr.' });
        const naddr = nip19.naddrEncode({
          kind: 30023,
          pubkey: event.pubkey,
          identifier,
        });
        navigate(`/${naddr}`);
      },
      onError: (error) => {
        toast({
          title: 'Publishing failed',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  // Tab-aware textarea: Tab inserts two spaces instead of moving focus
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = contentRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + '  ' + content.slice(end);
      setContent(newContent);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="text-2xl font-bold mb-6">Write a new article</h1>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="The title of your article"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary (optional)</Label>
            <Input
              id="summary"
              placeholder="A brief summary shown in the feed"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Cover image URL (optional)</Label>
            <Input
              id="image"
              placeholder="https://example.com/cover.jpg"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="bitcoin, nostr, lightning"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown)</Label>
            <Textarea
              ref={contentRef}
              id="content"
              placeholder="# My Article&#10;&#10;Write your article in Markdown format...&#10;&#10;## Subheading&#10;&#10;Supports **bold**, *italics*, [links](https://...), lists, code blocks, and more."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[400px] font-mono text-sm resize-y"
            />
            <p className="text-xs text-muted-foreground">
              Markdown supported: headings, bold, italics, links, lists, code blocks, images.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handlePublish}
              disabled={isPending || !title.trim() || !content.trim()}
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish article'
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/')}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
