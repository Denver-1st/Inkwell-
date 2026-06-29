import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { isValidArticle } from '@/hooks/useArticles';

interface UseArticleParams {
  pubkey?: string;
  identifier?: string;
}

/**
 * Fetches a single kind 30023 article by author pubkey + d-tag identifier.
 */
export function useArticle({ pubkey, identifier }: UseArticleParams) {
  const { nostr } = useNostr();

  return useQuery<NostrEvent | undefined, Error>({
    queryKey: ['nostr', 'article', pubkey, identifier],
    queryFn: async (c) => {
      if (!pubkey || !identifier) return undefined;
      const signal = c.signal ?? AbortSignal.timeout(8000);
      const [event] = await nostr.query(
        [{ kinds: [30023], authors: [pubkey], '#d': [identifier], limit: 1 }],
        { signal },
      );
      if (event && !isValidArticle(event)) return undefined;
      return event;
    },
    enabled: !!pubkey && !!identifier,
    retry: 2,
  });
}
