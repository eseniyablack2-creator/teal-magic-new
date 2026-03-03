import { ColorTokens } from "@/lib/colorGenerator";
import { Upload, X } from "lucide-react";
import DefaultLogo from "./DefaultLogo";

interface LogoCardProps {
  tokens: ColorTokens;
  fileData?: string;
  onUpload: (key: string, file: File) => void;
  onRemove: (key: string) => void;
}

export default function LogoCard({
  tokens,
  fileData,
  onUpload,
  onRemove,
}: LogoCardProps) {
  const assetKey = "logo";

  return (
    <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Логотип компании</p>
          <p className="text-xs text-muted-foreground">SVG, макс 128×40px</p>
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
          accept="image/png,image/jpeg,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(assetKey, file);
          }}
        />
      </div>

      {/* Превью: ограничено по ширине/высоте, с сохранением пропорций */}
      <div className="flex items-center gap-3">
        {fileData ? (
          <>
            <div
              className="flex items-center justify-center overflow-hidden border border-border/50 bg-muted/30"
              style={{ maxWidth: 128, maxHeight: 40 }}
            >
              <img
                src={fileData}
                alt="Логотип компании"
                className="h-auto w-auto max-h-10 max-w-[128px] object-contain"
              />
            </div>
            <span className="text-xs text-muted-foreground">✓ Загружено</span>
          </>
        ) : (
          <>
            <DefaultLogo tokens={tokens} width={119} height={32} />
            <span className="text-xs text-muted-foreground">
              Стандартный логотип
            </span>
          </>
        )}
      </div>
    </div>
  );
}
