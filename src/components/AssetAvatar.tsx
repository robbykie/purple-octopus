import type { AssetClass } from "@/lib/types";

/** Tint pool for holding avatars — stable per symbol, so a ticker keeps its colour. */
const TINTS = [
  { bg: "#f2ded9", fg: "#b4614f" },
  { bg: "#f6e3cd", fg: "#b1702f" },
  { bg: "#dfeae2", fg: "#4f7b64" },
  { bg: "#e2e7ef", fg: "#5a6d8c" },
  { bg: "#e9e2f0", fg: "#6f5d8c" },
  { bg: "#e6ece9", fg: "#4c6b60" },
];

function tintFor(symbol: string) {
  let hash = 0;
  for (let i = 0; i < symbol.length; i += 1) hash = (hash * 31 + symbol.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length];
}

export function AssetAvatar({
  symbol,
  size = 38,
  assetClass,
}: {
  symbol: string;
  size?: number;
  assetClass?: AssetClass;
}) {
  const tint = tintFor(symbol);
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-medium"
      style={{
        width: size,
        height: size,
        backgroundColor: tint.bg,
        color: tint.fg,
        fontSize: size * 0.4,
      }}
      title={assetClass}
      aria-hidden
    >
      {symbol.charAt(0)}
    </span>
  );
}
