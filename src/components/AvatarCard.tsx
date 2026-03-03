import { ColorTokens } from "@/lib/colorGenerator";
import { Upload, X } from "lucide-react";
import DefaultAvatar from "./DefaultAvatar";

interface AvatarCardProps {
  tokens: ColorTokens;
  fileData?: string;
  onUpload: (key: string, file: File) => void;
  onRemove: (key: string) => void;
}

export default function AvatarCard({
  tokens,
  fileData,
  onUpload,
  onRemove,
}: AvatarCardProps) {
  const assetKey = "avatar"; // фиксированный ключ для аватара

  return (
    <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Аватар компании</p>
          <p className="text-xs text-muted-foreground">
            SVG: 24×24px | PNG: 1000×1000px
          </p>
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
          accept="image/png, image/jpeg, image/jpg, image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(assetKey, file);
          }}
        />
      </div>

      {/* Превью: по умолчанию 24px, загруженное — 48px */}
      <div className="flex items-center gap-3">
        {fileData ? (
          <>
            <div
              className="flex items-center justify-center overflow-hidden rounded-full border border-border/50 bg-muted/30"
              style={{ width: 48, height: 48 }}
            >
              <img
                src={fileData}
                alt="Аватар компании"
                className="h-full w-full object-cover" // ← ИСПРАВЛЕНО
              />
            </div>
            <span className="text-xs text-muted-foreground">✓ Загружено</span>
          </>
        ) : (
          <>
            <DefaultAvatar tokens={tokens} size={48} />
            <span className="text-xs text-muted-foreground">
              Стандартный аватар
            </span>
          </>
        )}
      </div>
    </div>
  );
}
