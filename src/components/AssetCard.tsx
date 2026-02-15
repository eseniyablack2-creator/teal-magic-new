import { Upload, X } from 'lucide-react';

interface AssetCardProps {
  assetKey: string;
  label: string;
  accept: string;
  description?: string;
  maxWidth?: number;
  maxHeight?: number;
  isCircle?: boolean;
  fileData?: string;
  onUpload: (key: string, file: File) => void;
  onRemove: (key: string) => void;
}

export default function AssetCard({
  assetKey,
  label,
  accept,
  description,
  maxWidth = 80,
  maxHeight = 60,
  isCircle = false,
  fileData,
  onUpload,
  onRemove,
}: AssetCardProps) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{label}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {!fileData ? (
          <label
            htmlFor={`upload-${assetKey}`}
            className="flex cursor-pointer items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20"
          >
            <Upload size={14} />
            Загрузить
          </label>
        ) : (
          <button
            onClick={() => onRemove(assetKey)}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            title="Удалить"
          >
            <X size={16} />
          </button>
        )}
        <input
          id={`upload-${assetKey}`}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(assetKey, file);
          }}
        />
      </div>

      {fileData && (
        <div className="flex items-center gap-3">
          <div
            className={`
              flex items-center justify-center overflow-hidden border border-border/50 bg-muted/30
              ${isCircle ? 'rounded-full' : 'rounded-md'}
            `}
            style={{ width: maxWidth, height: maxHeight }}
          >
            <img src={fileData} alt={label} className="h-full w-full object-contain" />
          </div>
          <span className="text-xs text-muted-foreground">✓ Загружено</span>
        </div>
      )}
    </div>
  );
}