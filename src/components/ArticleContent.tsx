import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ArticleContentProps {
  content: string;
  className?: string;
}

/**
 * Renders Markdown article content (NIP-23 kind 30023) with proper
 * typography, code blocks, links, images, and nostr: links.
 */
export function ArticleContent({ content, className }: ArticleContentProps) {
  return (
    <div className={cn('prose max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Render links, handling nostr: links specially
          a({ href, children }) {
            if (!href) return <>{children}</>;

            // Handle nostr: links
            if (href.startsWith('nostr:')) {
              const id = href.slice(6);
              return (
                <Link to={`/${id}`} className="text-primary hover:underline">
                  {children}
                </Link>
              );
            }

            // External links
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {children}
              </a>
            );
          },
          // Images
          img({ src, alt }) {
            if (!src) return null;
            return (
              <img
                src={src}
                alt={alt ?? ''}
                className="rounded-lg w-full h-auto my-6"
                loading="lazy"
              />
            );
          },
          // Code blocks
          pre({ children }) {
            return (
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm my-6">
                {children}
              </pre>
            );
          },
          code({ className: codeClass, children }) {
            // Inline vs block: react-markdown passes a `inline` prop in older versions,
            // but in v10 we check if we're inside a <pre> by absence of a language class
            const isBlock = codeClass?.includes('language-') || String(children).includes('\n');
            if (isBlock) {
              return <code className={codeClass}>{children}</code>;
            }
            return (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
                {children}
              </code>
            );
          },
          // Blockquotes
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/40 pl-4 my-6 italic text-muted-foreground">
                {children}
              </blockquote>
            );
          },
          // Headings
          h1({ children }) {
            return <h1 className="text-3xl font-bold mt-10 mb-4">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-2xl font-bold mt-8 mb-3">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-xl font-semibold mt-6 mb-2">{children}</h3>;
          },
          p({ children }) {
            return <p className="leading-relaxed my-4 text-foreground/90">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-6 my-4 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-6 my-4 space-y-1">{children}</ol>;
          },
          // Internal links for hashtags
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
