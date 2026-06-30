import { type SupportedChain } from "@/types/vault";

// Minimal, monochrome chain glyphs that inherit `currentColor`, so a chip can
// tint them with the active/inactive text color. Shapes are simplified but kept
// visually distinct (diamond / hexagon / triangle / ring …) rather than
// pixel-perfect brand marks.
export default function ChainIcon({ chain, size = 16 }: { chain: SupportedChain; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 16 16", fill: "currentColor" as const };

  switch (chain) {
    case "eth-mainnet":
      return (
        <svg {...common} aria-hidden>
          <path d="M8 1.5 3.4 8 8 5.6Z" opacity={0.6} />
          <path d="M8 1.5 12.6 8 8 5.6Z" />
          <path d="M8 10.4 3.4 8.9 8 14.5Z" opacity={0.6} />
          <path d="M8 10.4 12.6 8.9 8 14.5Z" />
        </svg>
      );
    case "base-mainnet":
      return (
        <svg {...common} aria-hidden>
          <circle cx="8" cy="8" r="6.5" />
        </svg>
      );
    case "matic-mainnet":
      return (
        <svg {...common} aria-hidden>
          <path d="M8 1.3 13.8 4.7v6.6L8 14.7 2.2 11.3V4.7Z" fillRule="evenodd" opacity={0.9} />
          <path d="M8 4 11 5.8v3.6L8 11.2 5 9.4V5.8Z" fill="var(--surface, #161616)" />
        </svg>
      );
    case "arbitrum-mainnet":
      return (
        <svg {...common} aria-hidden>
          <circle cx="8" cy="8" r="6.5" opacity={0.9} />
          <path d="M8 4 11 12H8.8L8 9.6 7.2 12H5Z" fill="var(--surface, #161616)" />
        </svg>
      );
    case "optimism-mainnet":
      return (
        <svg {...common} aria-hidden>
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2.4" />
        </svg>
      );
    case "avalanche-mainnet":
      return (
        <svg {...common} aria-hidden>
          <path d="M8 2 14.5 13.5H1.5Z" />
        </svg>
      );
    case "bsc-mainnet":
      return (
        <svg {...common} aria-hidden>
          <path d="M8 2 10 4 8 6 6 4Z M4 6 6 8 4 10 2 8Z M12 6 14 8 12 10 10 8Z M8 8 10 10 8 12 6 10Z M8 10 10 12 8 14 6 12Z" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden>
          <circle cx="8" cy="8" r="6.5" />
        </svg>
      );
  }
}
