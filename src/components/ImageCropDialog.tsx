import React, { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ImageCropDialogProps = {
  open: boolean;
  imageSrc: string | null;
  aspect: number;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => void;
};

const createCroppedImage = async (
  imageSrc: string,
  cropArea: Area,
): Promise<string> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;
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
    cropArea.width,
    cropArea.height,
  );

  return canvas.toDataURL("image/png");
};

export const ImageCropDialog: React.FC<ImageCropDialogProps> = ({
  open,
  imageSrc,
  aspect,
  onCancel,
  onConfirm,
}) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) {
      onCancel();
      return;
    }
    try {
      const dataUrl = await createCroppedImage(imageSrc, croppedAreaPixels);
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
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          ) : null}
        </div>
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

