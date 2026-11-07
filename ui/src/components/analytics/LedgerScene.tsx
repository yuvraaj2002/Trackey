/** Soft interactive ledger illustration for the analytics hero. */
export function LedgerScene({ accentRatio = 0.62 }: { accentRatio?: number }) {
  const fill = Math.max(8, Math.min(100, accentRatio * 100));

  return (
    <div className="ledger-scene" aria-hidden="true">
      <svg viewBox="0 0 280 160" className="ledger-scene-svg">
        <defs>
          <linearGradient id="inkWash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e3eeeb" />
            <stop offset="100%" stopColor="#f5f2ea" />
          </linearGradient>
        </defs>
        <rect x="12" y="18" width="180" height="124" rx="14" fill="url(#inkWash)" stroke="#e5e0d4" />
        <rect x="28" y="38" width="96" height="8" rx="4" fill="#c9c3b5" opacity="0.7" />
        <rect x="28" y="58" width="148" height="6" rx="3" fill="#e5e0d4" />
        <rect x="28" y="74" width="128" height="6" rx="3" fill="#e5e0d4" />
        <rect x="28" y="90" width="140" height="6" rx="3" fill="#e5e0d4" />
        <rect x="28" y="112" width={`${fill * 1.4}`} height="10" rx="5" fill="#2f6b66" className="ledger-pulse" />

        <g className="ledger-coin" transform="translate(210 42)">
          <circle cx="28" cy="28" r="26" fill="#2f6b66" opacity="0.92" />
          <circle cx="28" cy="28" r="18" fill="#e3eeeb" opacity="0.35" />
          <text
            x="28"
            y="34"
            textAnchor="middle"
            fill="#fffefb"
            fontSize="16"
            fontFamily="Georgia, serif"
            fontWeight="600"
          >
            ₹
          </text>
        </g>
        <g className="ledger-coin delay" transform="translate(198 88)">
          <circle cx="20" cy="20" r="18" fill="#4a8f88" />
          <text
            x="20"
            y="25"
            textAnchor="middle"
            fill="#fffefb"
            fontSize="12"
            fontFamily="Georgia, serif"
            fontWeight="600"
          >
            ₹
          </text>
        </g>
      </svg>
    </div>
  );
}
