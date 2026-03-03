import { FlatToken, rgbStringToHex, normalizeHex } from "@/lib/colorGenerator";
import { useState } from "react";

interface Props {
  tokens: FlatToken[];
  onTokenChange: (path: string, newRgb: string) => void;
}

export default function TokenEditor({ tokens, onTokenChange }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const groups: Record<string, FlatToken[]> = {};
  tokens.forEach((t) => {
    const group = t.path.split(".").slice(0, 2).join(".");
    if (!groups[group]) groups[group] = [];
    groups[group].push(t);
  });

  return (
    <div className="space-y-1">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Ручная коррекция токенов
      </h3>
      {Object.entries(groups).map(([group, items]) => (
        <div key={group} className="rounded-lg border border-border">
          <button
            onClick={() => setExpanded(expanded === group ? null : group)}
            className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium hover:bg-muted/50"
          >
            <span>{group}</span>
            <span className="text-muted-foreground">
              {expanded === group ? "−" : "+"}
            </span>
          </button>
          {expanded === group && (
            <div className="space-y-1 border-t border-border px-3 py-2">
              {items.map((t) => (
                <TokenRow key={t.path} token={t} onChange={onTokenChange} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TokenRow({
  token,
  onChange,
}: {
  token: FlatToken;
  onChange: (path: string, val: string) => void;
}) {
  const isRgba = token.value.startsWith("rgba");
  const hex = rgbStringToHex(token.value) || "#000000";
  const [inputHex, setInputHex] = useState(hex);

  const getCurrentAlpha = (): number => {
    if (isRgba) {
      const match = token.value.match(/,\s*([\d.]+)\)$/);
      return match ? parseFloat(match[1]) : 1;
    }
    return 1;
  };

  const [alpha, setAlpha] = useState<number>(getCurrentAlpha());

  useState(() => {
    setInputHex(hex);
  }, [hex]);

  const applyHex = (newHex: string) => {
    const r = parseInt(newHex.slice(1, 3), 16);
    const g = parseInt(newHex.slice(3, 5), 16);
    const b = parseInt(newHex.slice(5, 7), 16);
    if (isRgba) {
      onChange(token.path, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    } else {
      onChange(token.path, `rgb(${r}, ${g}, ${b})`);
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setInputHex(newHex);
    applyHex(newHex);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputHex(raw);
    const normalized = normalizeHex(raw);
    if (normalized) {
      applyHex(normalized);
    }
  };

  const handleHexInputBlur = () => {
    setInputHex(hex);
  };

  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAlpha = parseFloat(e.target.value);
    setAlpha(newAlpha);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    onChange(token.path, `rgba(${r}, ${g}, ${b}, ${newAlpha})`);
  };

  const label =
    token.path.split(".").slice(2).join(".") ||
    token.path.split(".").pop() ||
    "";

  return (
    <div className="flex flex-col gap-1 py-1">
      <div className="flex items-center gap-2">
        {/* Кастомный скруглённый цветовой квадрат с границей */}
        <div className="relative h-6 w-6 shrink-0">
          <div
            className="absolute inset-0 rounded border border-border/50"
            style={{ backgroundColor: token.value }}
          />
          <input
            type="color"
            value={hex}
            onChange={handleColorPickerChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={inputHex}
          onChange={handleHexInputChange}
          onBlur={handleHexInputBlur}
          className="w-20 rounded border border-border bg-background px-1 py-0.5 text-xs font-mono"
          placeholder="#RRGGBB"
        />
        <span className="min-w-0 flex-1 truncate text-xs">{label}</span>
        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
          {token.value}
        </span>
      </div>
      {isRgba && (
        <div className="flex items-center gap-2 pl-8">
          <span className="text-xs text-muted-foreground">Прозрачность:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={alpha}
            onChange={handleAlphaChange}
            className="w-24 h-2"
          />
          <span className="text-xs font-mono text-muted-foreground w-12">
            {Math.round(alpha * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
