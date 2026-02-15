import { FlatToken, rgbStringToHex } from '@/lib/colorGenerator';
import { useState } from 'react';

interface Props {
  tokens: FlatToken[];
  onTokenChange: (path: string, newRgb: string) => void;
}

export default function TokenEditor({ tokens, onTokenChange }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const groups: Record<string, FlatToken[]> = {};
  tokens.forEach(t => {
    const group = t.path.split('.').slice(0, 2).join('.');
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
            <span className="text-muted-foreground">{expanded === group ? '−' : '+'}</span>
          </button>
          {expanded === group && (
            <div className="space-y-1 border-t border-border px-3 py-2">
              {items.map(t => (
                <TokenRow key={t.path} token={t} onChange={onTokenChange} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TokenRow({ token, onChange }: { token: FlatToken; onChange: (path: string, val: string) => void }) {
  const isRgba = token.value.startsWith('rgba');
  const hex = rgbStringToHex(token.value);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    const r = parseInt(newHex.slice(1, 3), 16);
    const g = parseInt(newHex.slice(3, 5), 16);
    const b = parseInt(newHex.slice(5, 7), 16);
    if (isRgba) {
      const alphaMatch = token.value.match(/,\s*([\d.]+)\)$/);
      const alpha = alphaMatch ? alphaMatch[1] : '1';
      onChange(token.path, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    } else {
      onChange(token.path, `rgb(${r}, ${g}, ${b})`);
    }
  };

  const label = token.path.split('.').slice(2).join('.') || token.path.split('.').pop() || '';

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={hex}
        onChange={handleColorChange}
        className="h-6 w-6 shrink-0 cursor-pointer rounded border-0 p-0"
      />
      <span className="min-w-0 flex-1 truncate text-xs">{label}</span>
      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{token.value}</span>
    </div>
  );
}
