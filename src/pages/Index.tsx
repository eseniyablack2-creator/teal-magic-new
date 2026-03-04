import React, { Suspense, useState, useCallback, useEffect, useRef } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  generateTokens,
  flattenTokens,
  setTokenValue,
  DEFAULT_STATUS,
  type ColorTokens,
  type StatusColors,
  type AlgorithmType,
} from "@/lib/colorGenerator";
import TokenPreview from "@/components/TokenPreview";
import TokenEditor from "@/components/TokenEditor";
import BannerSection from "@/components/BannerSection";
import MobileBannerSection from "@/components/MobileBannerSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const PlatformPreview = React.lazy(() => import("@/components/PlatformPreview"));

// Импорты карточек атрибутов
import AvatarCard from "@/components/AvatarCard";
import CurrencyIconCard from "@/components/CurrencyIconCard";
import ThanksIconCard from "@/components/ThanksIconCard";
import ThanksLeaderIconCard from "@/components/ThanksLeaderIconCard";
import LogoCard from "@/components/LogoCard";

// Для экспорта и иконок
import JSZip from "jszip";
import { Download, Package, RotateCcw } from "lucide-react";

// ==============================================
//   КОНСТАНТЫ И ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ЭКСПОРТА
// ==============================================

// Максимальный размер загружаемых файлов (10 МБ)
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

// Максимальный целевой размер экспортируемых файлов (3 МБ)
const MAX_EXPORT_SIZE_BYTES = 3 * 1024 * 1024;

const dataURLToBlob = async (dataURL: string): Promise<Blob> => {
  const res = await fetch(dataURL);
  return await res.blob();
};

const getFileExtension = (dataURL: string): string => {
  const match = dataURL.match(/^data:image\/([^;]+);/);
  if (match && match[1]) return match[1];
  return "png";
};

const renderSvgToPng = async (
  svgString: string,
  width: number,
  height: number,
): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      }, "image/png");
    };
    img.onerror = reject;
    img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
  });
};

const resizeImageBlob = async (
  blob: Blob,
  targetWidth: number,
  targetHeight: number,
): Promise<Blob> => {
  const img = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (targetWidth - w) / 2;
  const y = (targetHeight - h) / 2;

  ctx.clearRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(img, x, y, w, h);
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b!), "image/png");
  });
};

// Гарантирует, что экспортируемый PNG не превышает MAX_EXPORT_SIZE_BYTES,
// по необходимости немного уменьшая размеры, но без заметной потери качества
// на целевых размерах использования в интерфейсе.
const ensurePngUnderLimit = async (
  sourceBlob: Blob,
  targetWidth: number,
  targetHeight: number,
  minWidth: number,
  minHeight: number,
): Promise<Blob> => {
  let width = targetWidth;
  let height = targetHeight;
  let result = await resizeImageBlob(sourceBlob, width, height);

  while (
    result.size > MAX_EXPORT_SIZE_BYTES &&
    width > minWidth &&
    height > minHeight
  ) {
    width = Math.floor(width * 0.9);
    height = Math.floor(height * 0.9);
    result = await resizeImageBlob(sourceBlob, width, height);
  }

  return result;
};

// ==============================================
//   ФУНКЦИЯ НОРМАЛИЗАЦИИ HEX
// ==============================================
const normalizeHex = (input: string): string | null => {
  const hexOnly = input.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
  if (hexOnly.length === 3) {
    return (
      "#" +
      hexOnly
        .split("")
        .map((c) => c + c)
        .join("")
    );
  }
  if (hexOnly.length === 6) {
    return "#" + hexOnly;
  }
  return null;
};

// ==============================================
//   ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ЦВЕТА ИЗ ТОКЕНА
// ==============================================
const getColor = (val: { value: string | object }): string => {
  return typeof val.value === "string" ? val.value : "transparent";
};

// ==============================================
//   ФУНКЦИИ ГЕНЕРАЦИИ СТАНДАРТНЫХ SVG (СИНХРОННЫЕ)
// ==============================================
// ... (эти функции уже есть в вашем файле, оставьте их без изменений)

const Index = () => {
  const [primaryColor, setPrimaryColor] = useState("#009B65");
  const [textPrimaryColor, setTextPrimaryColor] = useState("#14140F");
  const [statusColors, setStatusColors] = useState<StatusColors>({
    ...DEFAULT_STATUS,
  });
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("default");
  const [tokens, setTokens] = useState<ColorTokens | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [currencyName, setCurrencyName] = useState("Teal");

  const [bannerData, setBannerData] = useState<string>();
  const [bannerMobileData, setBannerMobileData] = useState<string | null>(null);
  const [avatarData, setAvatarData] = useState<string>();
  const [currencyIconData, setCurrencyIconData] = useState<string>();
  const [thanksData, setThanksData] = useState<string>();
  const [thanksLeaderData, setThanksLeaderData] = useState<string>();
  const [logoData, setLogoData] = useState<string>();
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newTokens = generateTokens(
      primaryColor,
      statusColors,
      algorithm,
      textPrimaryColor,
    );
    setTokens(newTokens);
  }, [primaryColor, textPrimaryColor, statusColors, algorithm]);

  const handleTokenChange = useCallback((path: string, newValue: string) => {
    setTokens((prev) => (prev ? setTokenValue(prev, path, newValue) : prev));
  }, []);

  const sanitizeFileName = (name: string): string => {
    return name
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9а-яА-ЯёЁ_-]/g, "");
  };

  const handleDownload = () => {
    if (!tokens) return;
    const tokensCopy = JSON.parse(JSON.stringify(tokens));
    if (tokensCopy.background) {
      delete tokensCopy.background["accent-rgb"];
      delete tokensCopy.background["accent-secondary-rgb"];
    }
    let fileName = "tokens.json";
    if (companyName.trim() !== "") {
      const safeName = sanitizeFileName(companyName);
      if (safeName) {
        fileName = `tokens-${safeName}.json`;
      }
    }
    const blob = new Blob([JSON.stringify(tokensCopy, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setTokens(null);
    setPrimaryColor("#009B65");
    setTextPrimaryColor("#14140F");
    setStatusColors({ ...DEFAULT_STATUS });
    setAlgorithm("default");
    setCompanyName("");
    setBannerData(undefined);
    setBannerMobileData(null);
    setAvatarData(undefined);
    setCurrencyIconData(undefined);
    setThanksData(undefined);
    setThanksLeaderData(undefined);
    setLogoData(undefined);
  };

  /** Сброс только изменённых пользователем цветов (primary, text, status, algorithm). */
  const handleResetColors = () => {
    setPrimaryColor("#009B65");
    setTextPrimaryColor("#14140F");
    setStatusColors({ ...DEFAULT_STATUS });
    setAlgorithm("default");
  };

  const handleResetAttributes = () => {
    setAvatarData(undefined);
    setCurrencyIconData(undefined);
    setThanksData(undefined);
    setThanksLeaderData(undefined);
    setLogoData(undefined);
    setBannerData(undefined);
    setBannerMobileData(null);
  };

  const handleFileUpload = (key: string, file: File) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      alert("Файл слишком большой. Максимальный размер — 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        switch (key) {
          case "banner":
            setBannerData(e.target.result as string);
            break;
          case "bannerMobile":
            setBannerMobileData(e.target.result as string);
            break;
          case "avatar":
            setAvatarData(e.target.result as string);
            break;
          case "currency":
            setCurrencyIconData(e.target.result as string);
            break;
          case "thanks":
            setThanksData(e.target.result as string);
            break;
          case "thanksLeader":
            setThanksLeaderData(e.target.result as string);
            break;
          case "logo":
            setLogoData(e.target.result as string);
            break;
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHexChange =
    (setter: (value: string) => void, currentValue: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (!raw) return;
      const normalized = normalizeHex(raw);
      if (normalized) {
        setter(normalized);
      }
    };

  const handleHexPaste =
    (setter: (value: string) => void) =>
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text");
      const normalized = normalizeHex(pasted);
      if (normalized) {
        setter(normalized);
      }
    };

  const handleExportAll = async () => {
    if (!tokens) return;

    const zip = new JSZip();
    const safeName = sanitizeFileName(companyName);

    const tokensForExport = JSON.parse(JSON.stringify(tokens));
    if (tokensForExport.background) {
      delete tokensForExport.background["accent-rgb"];
      delete tokensForExport.background["accent-secondary-rgb"];
    }
    const jsonFileName = safeName ? `tokens-${safeName}.json` : "tokens.json";
    zip.file(jsonFileName, JSON.stringify(tokensForExport, null, 2));

    const assets: Array<{
      key: string;
      data: string | undefined;
      svgWidth: number;
      svgHeight: number;
      pngWidth: number;
      pngHeight: number;
      fileNameBase: string;
      defaultGenerator?: (tokens: ColorTokens) => string;
    }> = [
      {
        key: "avatar",
        data: avatarData,
        svgWidth: 24,
        svgHeight: 24,
        pngWidth: 1000,
        pngHeight: 1000,
        fileNameBase: `avatarCompany`,
      },
      {
        key: "currency",
        data: currencyIconData,
        svgWidth: 24,
        svgHeight: 24,
        pngWidth: 1000,
        pngHeight: 1000,
        fileNameBase: `tealBalanceIconCurrency`,
      },
      {
        key: "thanks",
        data: thanksData,
        svgWidth: 24,
        svgHeight: 24,
        pngWidth: 1000,
        pngHeight: 1000,
        fileNameBase: `thankBalanceIconCurrency`,
      },
      {
        key: "thanksLeader",
        data: thanksLeaderData,
        svgWidth: 24,
        svgHeight: 24,
        pngWidth: 1000,
        pngHeight: 1000,
        fileNameBase: `thankBalanceLeaderIconCurrency`,
      },
      {
        key: "logo",
        data: logoData,
        svgWidth: 128,
        svgHeight: 40,
        pngWidth: 128,
        pngHeight: 40,
        fileNameBase: `logo`,
      },
      {
        key: "banner",
        data: bannerData,
        svgWidth: 1200,
        svgHeight: 292,
        pngWidth: 2400,
        pngHeight: 584,
        fileNameBase: `bannerDesktop`,
      },
      {
        key: "bannerMobile",
        data: bannerMobileData,
        svgWidth: 328,
        svgHeight: 364,
        pngWidth: 656,
        pngHeight: 728,
        fileNameBase: `bannerMobile`,
      },
    ];

    for (const asset of assets) {
      if (
        (asset.key === "banner" || asset.key === "bannerMobile") &&
        !asset.data
      )
        continue;
      try {
        if (asset.data && asset.data.startsWith("data:image/")) {
          const dataUrl = asset.data.trim();
          const blob = await dataURLToBlob(dataUrl);
          const ext = getFileExtension(dataUrl);

          if (asset.key === "banner" || asset.key === "bannerMobile") {
            // Баннеры (desktop и mobile) всегда выгружаем в PNG,
            // даже если были загружены как SVG.
            const minWidth = Math.floor(asset.pngWidth * 0.6);
            const minHeight = Math.floor(asset.pngHeight * 0.6);

            const pngBlob = await ensurePngUnderLimit(
              blob,
              asset.pngWidth,
              asset.pngHeight,
              minWidth,
              minHeight,
            );
            zip.file(`${asset.fileNameBase}.png`, pngBlob);
          } else if (ext === "svg+xml" || ext === "svg") {
            try {
              const base64 = dataUrl.split(",")[1];
              if (!base64) throw new Error("No base64 data");
              const svgString = atob(base64);
              zip.file(`${asset.fileNameBase}.svg`, svgString);
            } catch (svgError) {
              console.error(
                `Ошибка декодирования SVG для ${asset.key}:`,
                svgError,
              );
            }
          } else {
            // Для остальных растровых изображений при экспорте
            // дополнительно следим за тем, чтобы итоговый файл
            // был не тяжелее 3 МБ, по необходимости немного
            // уменьшая разрешение.
            const minWidth = Math.min(512, asset.pngWidth);
            const minHeight = Math.min(512, asset.pngHeight);

            const pngBlob = await ensurePngUnderLimit(
              blob,
              asset.pngWidth,
              asset.pngHeight,
              minWidth,
              minHeight,
            );
            zip.file(`${asset.fileNameBase}.png`, pngBlob);
          }
        } else if (asset.defaultGenerator) {
          const svgString = asset.defaultGenerator(tokens);
          zip.file(`${asset.fileNameBase}.svg`, svgString);
        }
      } catch (error) {
        console.error(`Ошибка обработки ${asset.key}:`, error);
      }
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipFileName = safeName ? `project-${safeName}.zip` : "project.zip";
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = zipFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="min-h-screen bg-muted/30"
      style={
        {
          "--island-inner": tokens
            ? getColor(tokens.background["island-inner"])
            : "#EBF8F3",
        } as React.CSSProperties
      }
    >
      <header className="border-b border-border bg-background px-6 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-start gap-1">
            <svg
              width="119"
              height="32"
              viewBox="0 0 119 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M56.9168 10.9301C55.2511 10.9301 53.8746 11.5044 52.8007 12.6573C51.7267 13.8101 51.1831 15.2699 51.1831 17.0408C51.1831 18.8118 51.7179 20.2891 52.7875 21.3806C53.8571 22.4721 55.273 23.02 57.0264 23.02C58.3415 23.02 59.4724 22.6825 60.4237 22.003C61.3749 21.3236 62.0281 20.3723 62.3831 19.1449H59.3716C58.9289 20.254 58.153 20.8063 57.0483 20.8063C56.2067 20.8063 55.5535 20.5477 55.0889 20.0304C54.6242 19.5132 54.3831 18.7592 54.37 17.7729H62.5629V17.4617C62.5629 15.454 62.0544 13.8628 61.0374 12.6923C60.0204 11.5219 58.6439 10.9301 56.9212 10.9301H56.9168ZM54.37 15.7784C54.4576 14.9806 54.7338 14.3537 55.1897 13.8978C55.6456 13.4419 56.2242 13.2096 56.9168 13.2096C57.6533 13.2096 58.2319 13.4507 58.6439 13.9285C59.056 14.4063 59.3015 15.0244 59.376 15.7784H54.37Z"
                fill="#009B65"
              />
              <path
                d="M74.8719 14.6474C74.8719 12.1663 73.2105 10.9301 69.8922 10.9301C66.5738 10.9301 64.7765 12.2145 64.6012 14.7833H67.547C67.6522 14.1345 67.8713 13.6786 68.2133 13.42C68.5508 13.1614 69.0856 13.0343 69.8089 13.0343C71.1809 13.0343 71.8692 13.5427 71.8692 14.5597C71.8692 15.0025 71.6807 15.3049 71.3037 15.4671C70.9267 15.6293 70.1859 15.7827 69.0768 15.9318C68.5727 15.9888 68.1826 16.0458 67.902 16.0984C67.6215 16.151 67.2533 16.2255 66.793 16.3307C66.3371 16.4359 65.9776 16.5674 65.719 16.7296C65.4604 16.8918 65.1886 17.0978 64.8993 17.3477C64.61 17.5975 64.4039 17.9088 64.2812 18.277C64.1585 18.6452 64.0927 19.0748 64.0927 19.5614C64.0927 20.6397 64.4522 21.4858 65.1755 22.0951C65.8987 22.7088 66.8938 23.0156 68.165 23.0156C69.6686 23.0156 70.9048 22.5378 71.8604 21.5778C71.9042 22.0206 71.9787 22.3888 72.0796 22.6869H75.2664C74.999 22.0688 74.8675 21.0343 74.8675 19.5877V14.6518L74.8719 14.6474ZM71.8385 18.4129C71.8385 19.2107 71.5842 19.8332 71.0757 20.2847C70.5672 20.7362 69.8922 20.9597 69.0505 20.9597C68.5026 20.9597 68.0818 20.8238 67.7793 20.5521C67.4768 20.2803 67.3234 19.9077 67.3234 19.4343C67.3234 18.9608 67.4856 18.5619 67.81 18.2814C68.0905 18.0622 68.6955 17.8737 69.6248 17.7291C70.7338 17.5537 71.4703 17.3521 71.8385 17.1329V18.4173V18.4129Z"
                fill="#009B65"
              />
              <path
                d="M80.5837 6.91919H77.4407V22.6825H80.5837V6.91919Z"
                fill="#009B65"
              />
              <path
                d="M98.5607 12.8545H92.1168V6.91919H88.6626V22.6869H92.1168V15.888H98.5607V22.6869H102.015V6.91919H98.5607V12.8545Z"
                fill="#009B65"
              />
              <path
                d="M118.041 22.1959C117.954 21.9767 117.888 21.7006 117.844 21.3762C117.8 21.0518 117.761 20.7756 117.734 20.5477C117.704 20.3197 117.677 20.0129 117.647 19.6271C117.616 19.2414 117.603 19.0134 117.603 18.9389C117.41 16.7691 116.634 15.546 115.28 15.2655C116.06 14.9718 116.674 14.4808 117.116 13.7926C117.559 13.1044 117.783 12.3066 117.783 11.3904C117.783 9.88686 117.287 8.76467 116.301 8.02385C115.315 7.28302 114.035 6.91481 112.47 6.91481H104.632V22.6869H108.064V16.5104H111.141C112.251 16.5104 113.022 16.7252 113.456 17.1504C113.89 17.58 114.166 18.3471 114.285 19.4518C114.285 19.5088 114.306 19.8244 114.35 20.3943C114.394 20.9641 114.447 21.4288 114.504 21.7882C114.561 22.1477 114.653 22.4501 114.771 22.6869H118.357C118.238 22.5817 118.133 22.4195 118.046 22.2003L118.041 22.1959ZM113.579 13.5515C113.04 13.854 112.29 14.0074 111.33 14.0074H108.051V9.64576H111.483C112.369 9.64576 113.075 9.79481 113.596 10.0885C114.118 10.3822 114.381 10.9433 114.381 11.7718C114.381 12.6573 114.114 13.2534 113.574 13.5559L113.579 13.5515Z"
                fill="#009B65"
              />
              <path
                d="M38.1026 9.86494H42.8368V22.6869H46.313V9.86494H51.0516V6.91919H38.1026V9.86494Z"
                fill="#009B65"
              />
              <path
                d="M17.5541 12.4815L20.6373 2.7598C20.6373 2.7598 21.1271 1.34725 19.9463 0.441987C19.0235 -0.262102 18.0221 0.000291738 17.4317 0.367643C17.0818 0.581931 16.7582 0.844324 16.4258 1.08485C15.643 1.649 14.8646 2.21314 14.0862 2.78166C13.0366 3.5426 11.987 4.30355 10.9418 5.06886L7.51758 7.5616C6.45926 8.33129 5.40093 9.10535 4.34261 9.87503C3.54231 10.4567 2.74201 11.0427 1.94171 11.6243C1.02771 12.2934 0 12.8794 0 14.1608C0 14.2964 0.00874645 14.4232 0.0306126 14.5413C0.174929 15.464 0.865899 15.9801 1.70556 16.2425C2.14725 16.378 2.58458 16.5223 3.0219 16.6623L6.94031 17.9174C8.10359 18.2891 9.26249 18.6608 10.4258 19.0326C10.6969 19.12 10.9681 19.2075 11.2392 19.2906H11.2348C11.1386 19.6011 11.0424 19.9116 10.9462 20.2177L10.2508 22.4655C9.96658 23.3883 9.68232 24.3111 9.39369 25.2338C9.13567 26.0603 8.88202 26.8913 8.624 27.7178C8.44033 28.3213 8.17356 28.9379 8.07735 29.5633C8.01612 29.9744 8.05111 30.403 8.22167 30.7834C8.39222 31.1639 8.69397 31.4788 9.05258 31.7018C10.159 32.3928 11.1692 31.7543 12.0832 31.0896L27.4376 19.881C28.2248 19.3081 29.2219 18.5384 29.1126 17.4363C28.9595 15.9013 27.2015 15.5515 25.9857 15.1666L18.197 12.6958L17.7535 12.5479L17.5541 12.4815Z"
                fill="#009B65"
              />
            </svg>
            <div>
              <p className="text-xs font-medium text-foreground">
                Генератор цветовых токенов
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {tokens && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Download size={16} />
                  Скачать JSON
                </button>
                <button
                  onClick={handleExportAll}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Package size={16} />
                  Экспорт проекта
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-6">
        {!tokens ? (
          <div className="flex h-96 items-center justify-center rounded-xl border-2 border-dashed border-border">
            <p className="text-muted-foreground">
              Цвета генерируются автоматически
            </p>
          </div>
        ) : (
          <Tabs defaultValue="customize" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="customize">Кастомизация</TabsTrigger>
              <TabsTrigger value="preview">Превью платформы</TabsTrigger>
            </TabsList>

            <TabsContent value="customize" className="mt-6">
              <div className="space-y-6">
                {/* Плашка: Наименование компании и Наименование валюты */}
                <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="company-name"
                        className="text-sm font-medium text-muted-foreground"
                      >
                        Наименование компании
                      </label>
                      <input
                        id="company-name"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="например, teal hr"
                        className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="currency-name"
                        className="text-sm font-medium text-muted-foreground"
                      >
                        Наименование валюты
                      </label>
                      <input
                        id="currency-name"
                        type="text"
                        value={currencyName}
                        onChange={(e) => setCurrencyName(e.target.value)}
                        placeholder="например, Teal"
                        className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                </div>
                {/* Десктопный баннер */}
                <BannerSection
                  ref={bannerRef}
                  tokens={tokens}
                  bannerData={bannerData}
                  currencyName={currencyName}
                  onUpload={(file) => handleFileUpload("banner", file)}
                  onRemove={() => setBannerData(undefined)}
                />
                <div className="flex flex-col gap-6 lg:flex-row">
                  {/* Левая панель — управление */}
                  <div className="w-full space-y-6 lg:w-80 lg:shrink-0">
                    {/* Primary цвет */}
                    <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Primary цвет
                      </h2>
                      <div className="flex items-center gap-3">
                        {/* Цветной квадрат 32x32 с границей и скруглением */}
                        <div className="relative h-8 w-8 flex-shrink-0">
                          <div
                            className="absolute inset-0 rounded-lg border border-border/50"
                            style={{ backgroundColor: primaryColor }}
                          />
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        {/* Текстовый инпут такой же высоты 32px */}
                        <input
                          type="text"
                          value={primaryColor.toUpperCase()}
                          onChange={handleHexChange(
                            setPrimaryColor,
                            primaryColor,
                          )}
                          onPaste={handleHexPaste(setPrimaryColor)}
                          className="w-full h-8 rounded-lg border border-border bg-background px-3 py-0 font-mono text-sm text-foreground"
                          placeholder="#009B65"
                        />
                      </div>
                    </div>

                    {/* Цвет основного текста */}
                    <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Цвет текста (text.primary)
                      </h2>
                      <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 flex-shrink-0">
                          <div
                            className="absolute inset-0 rounded-lg border border-border/50"
                            style={{ backgroundColor: textPrimaryColor }}
                          />
                          <input
                            type="color"
                            value={textPrimaryColor}
                            onChange={(e) =>
                              setTextPrimaryColor(e.target.value)
                            }
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={textPrimaryColor.toUpperCase()}
                          onChange={handleHexChange(
                            setTextPrimaryColor,
                            textPrimaryColor,
                          )}
                          onPaste={handleHexPaste(setTextPrimaryColor)}
                          className="w-full h-8 rounded-lg border border-border bg-background px-3 py-0 font-mono text-sm text-foreground"
                          placeholder="#14140F"
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        От него строятся вторичный/третичный текст, граница,
                        модальное окно и инверсные цвета.
                      </p>
                    </div>

                    {/* Статусные цвета */}
                    <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Статусные цвета
                      </h2>
                      <div className="space-y-3">
                        {(["warning", "danger", "success"] as const).map(
                          (key) => {
                            const setStatusColor = (value: string) =>
                              setStatusColors((prev) => ({
                                ...prev,
                                [key]: value,
                              }));
                            const color = statusColors[key];
                            return (
                              <div
                                key={key}
                                className="flex items-center gap-3"
                              >
                                <div className="relative h-8 w-8 flex-shrink-0">
                                  <div
                                    className="absolute inset-0 rounded-lg border border-border/30"
                                    style={{ backgroundColor: color }}
                                  />
                                  <input
                                    type="color"
                                    value={color}
                                    onChange={(e) =>
                                      setStatusColor(e.target.value)
                                    }
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                </div>
                                <span className="text-sm capitalize text-foreground">
                                  {key}
                                </span>
                                <input
                                  type="text"
                                  value={color.toUpperCase()}
                                  onChange={handleHexChange(
                                    setStatusColor,
                                    color,
                                  )}
                                  onPaste={handleHexPaste(setStatusColor)}
                                  className="ml-auto w-28 rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-foreground"
                                />
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                    {/* Алгоритм генерации */}
                    <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Алгоритм генерации
                      </h2>
                      <Select
                        value={algorithm}
                        onValueChange={(value: AlgorithmType) =>
                          setAlgorithm(value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Выберите алгоритм" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">✨ Default</SelectItem>
                          <SelectItem value="monochromatic">
                            Monochromatic
                          </SelectItem>
                          <SelectItem value="saturation">
                            Saturation Scale
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {algorithm === "default" &&
                          "Default → эталонные токены"}
                        {algorithm === "monochromatic" &&
                          "Monochromatic → приглушает цвет, делает его мягче и пастельнее"}
                        {algorithm === "saturation" &&
                          "Saturation Scale → усиливает цвет, делает его ярче и насыщеннее"}
                      </div>
                    </div>

                    {/* Ручная коррекция токенов (accent-rgb не редактируем — считается от Primary с фиксированной прозрачностью) */}
                    {tokens && (
                      <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                        <TokenEditor
                          tokens={flattenTokens(tokens).filter(
                            (t) =>
                              t.path !== "background.accent-rgb" &&
                              t.path !== "background.accent-secondary-rgb"
                          )}
                          onTokenChange={handleTokenChange}
                        />
                      </div>
                    )}
                  </div>
                  {/* Правая панель — контент */}
                  <div className="min-w-0 flex-1">
                    <div className="space-y-6">
                      {/* Превью токенов */}
                      <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
                        <TokenPreview tokens={tokens} onReset={handleResetColors} />
                      </div>

                      {/* НОВАЯ ПЛАШКА С АТРИБУТАМИ */}
                      <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row items-stretch">
                          {/* Левая колонка: карточки атрибутов вертикально (растягиваются) */}
                          <div className="md:w-1/2 flex flex-col gap-4">
                            <div className="flex-1">
                              <AvatarCard
                                tokens={tokens}
                                fileData={avatarData}
                                onUpload={handleFileUpload}
                                onRemove={() => setAvatarData(undefined)}
                              />
                            </div>
                            <div className="flex-1">
                              <CurrencyIconCard
                                tokens={tokens}
                                fileData={currencyIconData}
                                onUpload={handleFileUpload}
                                onRemove={() => setCurrencyIconData(undefined)}
                              />
                            </div>
                            <div className="flex-1">
                              <ThanksIconCard
                                tokens={tokens}
                                fileData={thanksData}
                                onUpload={handleFileUpload}
                                onRemove={() => setThanksData(undefined)}
                              />
                            </div>
                            <div className="flex-1">
                              <ThanksLeaderIconCard
                                tokens={tokens}
                                fileData={thanksLeaderData}
                                onUpload={handleFileUpload}
                                onRemove={() => setThanksLeaderData(undefined)}
                              />
                            </div>
                          </div>

                          {/* Правая колонка: логотип и мобильный баннер */}
                          <div className="md:w-1/2 flex flex-col gap-4">
                            <LogoCard
                              tokens={tokens}
                              fileData={logoData}
                              onUpload={handleFileUpload}
                              onRemove={() => setLogoData(undefined)}
                            />
                            <MobileBannerSection
                              tokens={tokens}
                              fileData={bannerMobileData ?? undefined}
                              currencyName={currencyName}
                              onUpload={(key, file) =>
                                handleFileUpload("bannerMobile", file)
                              }
                              onRemove={() => setBannerMobileData(null)}
                            />
                          </div>
                        </div>

                        {/* Кнопка сброса атрибутов внизу плашки */}
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={handleResetAttributes}
                            className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                          >
                            <RotateCcw size={16} />
                            Сбросить атрибуты
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-6">
              <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
                <Suspense fallback={<div className="text-sm text-muted-foreground">Загрузка превью...</div>}>
                  <PlatformPreview
                    tokens={tokens}
                    companyName={companyName}
                    currencyName={currencyName}
                    brandAssets={{
                      logo: logoData,
                      avatar: avatarData,
                      currencyIcon: currencyIconData,
                      thanksIcon: thanksData,
                      thanksLeaderIcon: thanksLeaderData,
                      banner: bannerData,
                      bannerMobile: bannerMobileData,
                    }}
                  />
                </Suspense>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Index;
