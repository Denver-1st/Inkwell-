import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Fetches a feed of kind 1 (text) notes from relays.
 */
export function useTimeline(limit = 20) {
  const { nostr } = useNostr();

  return useQuery<NostrEvent[], Error>({
    queryKey: ['nostr', 'timeline', limit],
    queryFn: async (c) => {
      const signal = c.signal ?? AbortSignal.timeout(5000);
      const events = await nostr.query(
        [{ kinds: [1], limit }],
        { signal },
      );
      // Sort by created_at descending (newest first)
      return events.sort((a, b) => b.created_at - a.created_at);
    },
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
