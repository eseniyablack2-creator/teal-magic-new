import React, { useCallback, useState } from "react";
import Cropper, { Area, MediaSize } from "react-easy-crop";

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

  return canvas.toDataURL("image/png");
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
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isAspectMatched, setIsAspectMatched] = useState(false);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleMediaLoaded = useCallback(
    (mediaSize: MediaSize) => {
      const ratio = mediaSize.width / mediaSize.height;
      const diff = Math.abs(ratio - aspect);
      setIsAspectMatched(diff < 0.01);
    },
    [aspect],
  );

  const handleConfirm = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) {
      onCancel();
      return;
    }
    try {
      const dataUrl = await createCroppedImage(
        imageSrc,
        croppedAreaPixels,
        outputWidth,
        outputHeight,
      );
      onConfirm(dataUrl);
    } catch (e) {
      console.error("Ошибка кропинга изображения", e);
      onCancel();
    }
  }, [croppedAreaPixels, imageSrc, onCancel, onConfirm]);

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
        <DialogFooter className="mt-4 flex justify-between gap-2">
          <div className="flex-1">
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
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

