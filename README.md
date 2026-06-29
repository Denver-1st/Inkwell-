# Inkwell

A Nostr blogging platform where you can publish long-form articles and support creators with Bitcoin Lightning zaps. No Nostr account required to send tips — just a Lightning wallet.

[![Edit with Shakespeare](https://shakespeare.diy/badge.svg)](https://shakespeare.diy/clone?url=https%3A%2F%2Fgithub.com%2FDenver-1st%2FInkwell-.git)

## Features

### Article Publishing
- Write and publish long-form articles using **NIP-23** (kind 30023) on Nostr
- Full Markdown support — headings, bold/italics, links, lists, code blocks, blockquotes, tables, images
- Article metadata: title, summary, cover image, tags, publication date
- Editable articles (addressable events — publish updates with the same `d` tag)

### Article Feed
- Homepage displays a feed of articles from across Nostr relays
- Each article card shows cover image, author, title, summary, and reading time
- Skeleton loading states and graceful error/empty states

### Rich Reading Experience
- Article detail pages with clean, distraction-free typography
- Author info, tags, cover images
- "More from this author" section
- Author bio card with website link

### Lightning Zaps
Zap creators directly with Bitcoin Lightning. Two modes:

- **Nostr Native Zap** (logged-in users) — Full NIP-57 flow: signs a zap request event, fetches a BOLT11 invoice from the author's LNURL endpoint, and pays via NWC → WebLN → QR fallback. A kind 9735 zap receipt is published, contributing to visible zap totals.

- **Guest Tipping** (logged-out users) — Plain LNURL-pay with no Nostr signature required. An optional "Your Lightning address" field lets the sender identify themselves in the payment comment. Payment happens via WebLN or QR code scanning.

**Payment methods (in priority order):**
1. **NWC** (Nostr Wallet Connect) — automatic in-app payment
2. **WebLN** — browser extension wallets (Alby, etc.)
3. **Manual/QR** — scan a QR code or copy the invoice to any Lightning wallet

### Profile Pages
- View any Nostr user's profile (`/:npub` or `/:nprofile`)
- Avatar, display name, bio, website, Lightning address
- Profile zap button for direct tipping
- Lists the author's recent articles

## Tech Stack

- **React 19** with concurrent rendering
- **Vite** for dev server and production bundling
- **TailwindCSS 4** for styling
- **shadcn/ui** (Radix UI) for accessible components
- **Nostrify** (`@nostrify/react`) for Nostr protocol integration
- **TanStack Query** for data fetching and caching
- **react-markdown** + **remark-gfm** for Markdown rendering
- **@getalby/sdk** for Nostr Wallet Connect
- **qrcode** for invoice QR code generation

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Nostr Protocol

Inkwell uses the following Nostr NIPs:

| NIP | Description |
|-----|-------------|
| [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md) | Basic protocol, kind 0 profile metadata |
| [NIP-19](https://github.com/nostr-protocol/nips/blob/master/19.md) | bech32-encoded entities (npub, note, naddr, nevent) |
| [NIP-23](https://github.com/nostr-protocol/nips/blob/master/23.md) | Long-form content (kind 30023) |
| [NIP-57](https://github.com/nostr-protocol/nips/blob/master/57.md) | Lightning Zaps |
| [NIP-47](https://github.com/nostr-protocol/nips/blob/master/47.md) | Nostr Wallet Connect |
| [NIP-65](https://github.com/nostr-protocol/nips/blob/master/65.md) | Relay list metadata |

## Project Structure

```
src/
├── components/
│   ├── ArticleCard.tsx       # Article card for feed
│   ├── ArticleContent.tsx   # Markdown renderer
│   ├── ArticleView.tsx       # Article detail page
│   ├── Header.tsx            # App header with login + wallet
│   ├── NoteCard.tsx          # Short-form note card
│   ├── NoteContent.tsx       # Note content renderer
│   ├── ZapButton.tsx         # Zap trigger button
│   ├── ZapDialog.tsx         # Zap dialog (amount, comment, QR)
│   ├── WalletModal.tsx       # NWC wallet connection settings
│   └── ui/                   # shadcn/ui primitives
├── hooks/
│   ├── useArticles.ts        # Fetch article feed (kind 30023)
│   ├── useArticle.ts         # Fetch single article
│   ├── useZaps.ts            # Zap functionality (NWC/WebLN/QR)
│   ├── useWallet.ts          # Unified wallet status
│   ├── useNWC.ts             # Nostr Wallet Connect management
│   └── ...
├── pages/
│   ├── Index.tsx             # Homepage — article feed
│   ├── WriteArticle.tsx      # Article composer
│   ├── NIP19Page.tsx         # Handles /:npub, /:note, /:naddr, etc.
│   └── NotFound.tsx
└── contexts/
    └── NWCContext.tsx        # NWC provider
```

## Vibed with Shakespeare

This project was built with [Shakespeare](https://shakespeare.diy) — the AI-powered website builder.
