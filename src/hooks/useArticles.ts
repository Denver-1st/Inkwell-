import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Validates that a kind 30023 event has the required fields.
 */
export function isValidArticle(event: NostrEvent): boolean {
  const d = event.tags.find(([n]) => n === 'd')?.[1];
  const title = event.tags.find(([n]) => n === 'title')?.[1];
  return Boolean(d && title && event.content);
}

/**
 * Fetches a feed of kind 30023 long-form articles from relays.
 */
export function useArticles(limit = 30) {
  const { nostr } = useNostr();

  return useQuery<NostrEvent[], Error>({
    queryKey: ['nostr', 'articles', limit],
    queryFn: async (c) => {
      const signal = c.signal ?? AbortSignal.timeout(8000);
      const events = await nostr.query(
        [{ kinds: [30023], limit }],
        { signal },
      );
      // Filter invalid articles and sort by created_at descending
      return events
        .filter(isValidArticle)
        .sort((a, b) => b.created_at - a.created_at);
    },
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
