import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

interface UseEventOptions {
  id?: string;
  kind?: number;
  author?: string;
  identifier?: string;
  relays?: string[];
}

/**
 * Fetches a single event by ID (for note1/nevent1) or by
 * kind+author+identifier (for naddr1).
 */
export function useEvent(opts: UseEventOptions) {
  const { nostr } = useNostr();

  return useQuery<NostrEvent | undefined, Error>({
    queryKey: ['nostr', 'event', opts.id ?? `${opts.kind}:${opts.author}:${opts.identifier}`],
    queryFn: async (c) => {
      const signal = c.signal ?? AbortSignal.timeout(5000);

      if (opts.id) {
        const [event] = await nostr.query(
          [{ ids: [opts.id], limit: 1 }],
          { signal },
        );
        return event;
      }

      if (opts.kind !== undefined && opts.author && opts.identifier !== undefined) {
        const [event] = await nostr.query(
          [{ kinds: [opts.kind], authors: [opts.author], '#d': [opts.identifier], limit: 1 }],
          { signal },
        );
        return event;
      }

      return undefined;
    },
    enabled: !!(opts.id || (opts.kind !== undefined && opts.author && opts.identifier !== undefined)),
    retry: 2,
  });
}
