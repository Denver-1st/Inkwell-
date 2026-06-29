import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Fetches recent kind 1 notes from a specific author.
 */
export function useAuthorNotes(pubkey: string | undefined, limit = 10) {
  const { nostr } = useNostr();

  return useQuery<NostrEvent[], Error>({
    queryKey: ['nostr', 'author-notes', pubkey ?? '', limit],
    queryFn: async (c) => {
      if (!pubkey) return [];
      const signal = c.signal ?? AbortSignal.timeout(5000);
      const events = await nostr.query(
        [{ kinds: [1], authors: [pubkey], limit }],
        { signal },
      );
      return events.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!pubkey,
    staleTime: 60_000,
  });
}
