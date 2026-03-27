import React, { useCallback, useEffect, useState } from "react";
import Cropper, { Area, MediaSize } from "react-easy-crop";
import {
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const createCroppedImage = async (
  imageSrc: string,
  cropArea: Area,
  outputWidth?: number,
  outputHeight?: number,
): Promise<string> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const targetWidth = outputWidth ?? cropArea.width;
  const targetHeight = outputHeight ?? cropArea.height;
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Cannot get canvas context");
  }
  ctx.imageSmoothingEnabled = true;
  // @ts-expect-error - поддержка зависит от браузера
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    targetWidth,
    targetHeight,
  );

  // Сохраняем исходный растровый формат, чтобы не ломать ожидания по типу файла.
  // Для неизвестных/неподдерживаемых случаев используем PNG.
  const mimeMatch = imageSrc.match(/^data:(image\/[a-zA-Z0-9.+-]+);/);
  const sourceMime = mimeMatch?.[1]?.toLowerCase();
  const outputMime =
    sourceMime === "image/jpeg" ||
    sourceMime === "image/jpg" ||
    sourceMime === "image/webp" ||
    sourceMime === "image/png"
      ? sourceMime === "image/jpg"
        ? "image/jpeg"
        : sourceMime
      : "image/png";

  return canvas.toDataURL(
    outputMime,
    outputMime === "image/jpeg" || outputMime === "image/webp" ? 0.92 : undefined,
  );
};

const createResizedImage = async (
  imageSrc: string,
  outputWidth?: number,
  outputHeight?: number,
): Promise<string> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const targetWidth = outputWidth ?? image.naturalWidth;
  const targetHeight = outputHeight ?? image.naturalHeight;

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Cannot get canvas context");
  ctx.imageSmoothingEnabled = true;
  // @ts-expect-error - поддержка зависит от браузера
  ctx.imageSmoothingQuality = "high";

  // Пропорции уже подходят — можно просто привести к нужному размеру без обрезки.
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  const mimeMatch = imageSrc.match(/^data:(image\/[a-zA-Z0-9.+-]+);/);
  const sourceMime = mimeMatch?.[1]?.toLowerCase();
  const outputMime =
    sourceMime === "image/jpeg" ||
    sourceMime === "image/jpg" ||
    sourceMime === "image/webp" ||
    sourceMime === "image/png"
      ? sourceMime === "image/jpg"
        ? "image/jpeg"
        : sourceMime
      : "image/png";

  return canvas.toDataURL(
    outputMime,
    outputMime === "image/jpeg" || outputMime === "image/webp" ? 0.92 : undefined,
  );
};

type ImageCropDialogProps = {
  open: boolean;
  imageSrc: string | null;
  aspect: number;
  outputWidth?: number;
  outputHeight?: number;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => void;
};

export const ImageCropDialog: React.FC<ImageCropDialogProps> = ({
  open,
  imageSrc,
  aspect,
  outputWidth,
  outputHeight,
  onCancel,
  onConfirm,
}) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  // Даем пользователю почти "нулевое" отдаление, чтобы длинные логотипы
  // и широкие изображения можно было уменьшить без обрезки краев.
  const MIN_ZOOM = 0.01;
  const MAX_ZOOM = 3;
  const [zoomInput, setZoomInput] = useState("100");

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isAspectMatched, setIsAspectMatched] = useState(false);
  const [mediaNatural, setMediaNatural] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const alignVertical = useCallback((pos: "top" | "center" | "bottom") => {
    setCrop((prev) => ({
      ...prev,
      y: pos === "top" ? -50 : pos === "bottom" ? 50 : 0,
    }));
  }, []);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setZoomInput("100");
    setCroppedAreaPixels(null);
    setMediaNatural(null);
  }, [open, imageSrc, aspect]);

  useEffect(() => {
    setZoomInput(String(Math.round(zoom * 100)));
  }, [zoom]);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleMediaLoaded = useCallback(
    (mediaSize: MediaSize) => {
      // Берем natural размеры, чтобы проверка пропорций не зависела
      // от того, как изображение вписалось в область кроппера.
      const sourceWidth = mediaSize.naturalWidth || mediaSize.width;
      const sourceHeight = mediaSize.naturalHeight || mediaSize.height;
      setMediaNatural({ width: sourceWidth, height: sourceHeight });
      const ratio = sourceWidth / sourceHeight;
      const diff = Math.abs(ratio - aspect);
      setIsAspectMatched(diff < 0.02);
    },
    [aspect],
  );

  const handleConfirm = useCallback(async () => {
    if (!imageSrc) {
      onCancel();
      return;
    }
    try {
      // Если пропорции уже совпадают, даем возможность сохранить изображение без обрезки,
      // чтобы не было неожиданных потерь контента при "Применить".
      const dataUrl =
        isAspectMatched && mediaNatural
          ? await createResizedImage(imageSrc, outputWidth, outputHeight)
          : croppedAreaPixels
            ? await createCroppedImage(
                imageSrc,
                croppedAreaPixels,
                outputWidth,
                outputHeight,
              )
            : await createResizedImage(imageSrc, outputWidth, outputHeight);
      onConfirm(dataUrl);
    } catch (e) {
      console.error("Ошибка кропинга изображения", e);
      onCancel();
    }
  }, [
    croppedAreaPixels,
    imageSrc,
    isAspectMatched,
    mediaNatural,
    onCancel,
    onConfirm,
    outputHeight,
    outputWidth,
  ]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Кадрирование изображения</DialogTitle>
        </DialogHeader>
        <div className="relative h-80 w-full rounded-md bg-muted">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              objectFit="contain"
              restrictPosition={false}
              zoomWithScroll
              zoomSpeed={0.15}
              onMediaLoaded={handleMediaLoaded}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          ) : null}
        </div>
        {isAspectMatched && (
          <p className="mt-2 text-xs text-muted-foreground">
            Изображение уже в нужных пропорциях. Вы можете просто нажать
            «Применить», чтобы сохранить его без обрезки.
          </p>
        )}
        <DialogFooter className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-md border border-border bg-background">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => alignVertical("top")}
                  className="h-8 w-8 rounded-none"
                  aria-label="Выровнять по верхнему краю"
                  title="Сверху"
                >
                  <AlignVerticalJustifyStart size={16} />
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => alignVertical("center")}
                  className="h-8 w-8 rounded-none border-l border-border"
                  aria-label="Выровнять по вертикальному центру"
                  title="По центру"
                >
                  <AlignVerticalJustifyCenter size={16} />
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => alignVertical("bottom")}
                  className="h-8 w-8 rounded-none border-l border-border"
                  aria-label="Выровнять по нижнему краю"
                  title="Снизу"
                >
                  <AlignVerticalJustifyEnd size={16} />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
              variant="outline"
              type="button"
              onClick={() =>
                setZoom((z) => Math.max(MIN_ZOOM, Number((z - 0.1).toFixed(2))))
              }
              aria-label="Отдалить"
            >
              −
            </Button>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="min-w-[160px] flex-1"
            />
            <Button
              variant="outline"
              type="button"
              onClick={() =>
                setZoom((z) => Math.min(MAX_ZOOM, Number((z + 0.1).toFixed(2))))
              }
              aria-label="Приблизить"
            >
              +
            </Button>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={Math.round(MIN_ZOOM * 100)}
                max={Math.round(MAX_ZOOM * 100)}
                step={1}
                value={zoomInput}
                onChange={(e) => {
                  const raw = e.target.value;
                  setZoomInput(raw);
                  const parsed = Number(raw);
                  if (!Number.isFinite(parsed)) return;
                  const clamped = Math.min(
                    Math.round(MAX_ZOOM * 100),
                    Math.max(Math.round(MIN_ZOOM * 100), parsed),
                  );
                  setZoom(clamped / 100);
                }}
                onBlur={() => {
                  const parsed = Number(zoomInput);
                  if (!Number.isFinite(parsed)) {
                    setZoomInput(String(Math.round(zoom * 100)));
                    return;
                  }
                  const clamped = Math.min(
                    Math.round(MAX_ZOOM * 100),
                    Math.max(Math.round(MIN_ZOOM * 100), parsed),
                  );
                  setZoom(clamped / 100);
                  setZoomInput(String(clamped));
                }}
                className="h-8 w-16 rounded-md border border-border bg-background px-2 text-right text-xs text-foreground"
                aria-label="Масштаб в процентах"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={onCancel}>
              Отмена
            </Button>
            <Button type="button" onClick={handleConfirm}>
              Применить
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

