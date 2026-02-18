import { useState, useCallback, useEffect, useRef } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  generateTokens,
  flattenTokens,
  setTokenValue,
  DEFAULT_STATUS,
  type ColorTokens,
  type StatusColors,
  type AlgorithmType,
} from '@/lib/colorGenerator';
import TokenPreview from '@/components/TokenPreview';
import TokenEditor from '@/components/TokenEditor';
import BannerSection from '@/components/BannerSection';
import MobileBannerSection from '@/components/MobileBannerSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlatformPreview from '@/components/PlatformPreview';

// Импорты карточек атрибутов
import AvatarCard from '@/components/AvatarCard';
import CurrencyIconCard from '@/components/CurrencyIconCard';
import ThanksIconCard from '@/components/ThanksIconCard';
import ThanksLeaderIconCard from '@/components/ThanksLeaderIconCard';
import LogoCard from '@/components/LogoCard';

// Для экспорта и иконок
import JSZip from 'jszip';
import { Download, Package, RotateCcw } from 'lucide-react';

// ==============================================
//   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ЭКСПОРТА
// ==============================================

const dataURLToBlob = async (dataURL: string): Promise<Blob> => {
  const res = await fetch(dataURL);
  return await res.blob();
};

const getFileExtension = (dataURL: string): string => {
  const match = dataURL.match(/^data:image\/([^;]+);/);
  if (match && match[1]) return match[1];
  return 'png';
};

const renderSvgToPng = async (
  svgString: string,
  width: number,
  height: number
): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/png');
    };
    img.onerror = reject;
    img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
  });
};

const resizeImageBlob = async (
  blob: Blob,
  targetWidth: number,
  targetHeight: number
): Promise<Blob> => {
  const img = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (targetWidth - w) / 2;
  const y = (targetHeight - h) / 2;

  ctx.clearRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(img, x, y, w, h);
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/png');
  });
};

// ==============================================
//   ФУНКЦИЯ НОРМАЛИЗАЦИИ HEX
// ==============================================
const normalizeHex = (input: string): string | null => {
  const hexOnly = input.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  if (hexOnly.length === 3) {
    return '#' + hexOnly.split('').map(c => c + c).join('');
  }
  if (hexOnly.length === 6) {
    return '#' + hexOnly;
  }
  return null;
};

// ==============================================
//   ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ЦВЕТА ИЗ ТОКЕНА
// ==============================================
const getColor = (val: { value: string | object }): string => {
  return typeof val.value === 'string' ? val.value : 'transparent';
};

// ==============================================
//   ФУНКЦИИ ГЕНЕРАЦИИ СТАНДАРТНЫХ SVG (СИНХРОННЫЕ)
// ==============================================
// ... (эти функции уже есть в вашем файле, оставьте их без изменений)

const Index = () => {
  const [primaryColor, setPrimaryColor] = useState('#009B65');
  const [textPrimaryColor, setTextPrimaryColor] = useState('#14140F');
  const [statusColors, setStatusColors] = useState<StatusColors>({ ...DEFAULT_STATUS });
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('default');
  const [tokens, setTokens] = useState<ColorTokens | null>(null);
  const [companyName, setCompanyName] = useState('');

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
      textPrimaryColor
    );
    setTokens(newTokens);
  }, [primaryColor, textPrimaryColor, statusColors, algorithm]);

  const handleTokenChange = useCallback((path: string, newValue: string) => {
    setTokens((prev) => (prev ? setTokenValue(prev, path, newValue) : prev));
  }, []);

  const sanitizeFileName = (name: string): string => {
    return name
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9а-яА-ЯёЁ_\-]/g, '');
  };

  const handleDownload = () => {
    if (!tokens) return;
    const tokensCopy = JSON.parse(JSON.stringify(tokens));
    if (tokensCopy.background) {
      delete tokensCopy.background['accent-rgb'];
      delete tokensCopy.background['accent-secondary-rgb'];
    }
    let fileName = 'tokens.json';
    if (companyName.trim() !== '') {
      const safeName = sanitizeFileName(companyName);
      if (safeName) {
        fileName = `tokens-${safeName}.json`;
      }
    }
    const blob = new Blob([JSON.stringify(tokensCopy, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setTokens(null);
    setPrimaryColor('#009B65');
    setTextPrimaryColor('#14140F');
    setStatusColors({ ...DEFAULT_STATUS });
    setAlgorithm('default');
    setCompanyName('');
    setBannerData(undefined);
    setBannerMobileData(null);
    setAvatarData(undefined);
    setCurrencyIconData(undefined);
    setThanksData(undefined);
    setThanksLeaderData(undefined);
    setLogoData(undefined);
  };

  const handleResetAttributes = () => {
    setAvatarData(undefined);
    setCurrencyIconData(undefined);
    setThanksData(undefined);
    setThanksLeaderData(undefined);
    setLogoData(undefined);
    setBannerMobileData(null);
    // bannerData не сбрасываем
  };

  const handleFileUpload = (key: string, file: File) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Файл слишком большой. Максимальный размер — 3MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        switch (key) {
          case 'banner': setBannerData(e.target.result as string); break;
          case 'bannerMobile': setBannerMobileData(e.target.result as string); break;
          case 'avatar': setAvatarData(e.target.result as string); break;
          case 'currency': setCurrencyIconData(e.target.result as string); break;
          case 'thanks': setThanksData(e.target.result as string); break;
          case 'thanksLeader': setThanksLeaderData(e.target.result as string); break;
          case 'logo': setLogoData(e.target.result as string); break;
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHexChange = (
    setter: (value: string) => void,
    currentValue: string
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw) return;
    const normalized = normalizeHex(raw);
    if (normalized) {
      setter(normalized);
    }
  };

  const handleHexPaste = (
    setter: (value: string) => void
  ) => (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
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
      delete tokensForExport.background['accent-rgb'];
      delete tokensForExport.background['accent-secondary-rgb'];
    }
    const jsonFileName = safeName ? `tokens-${safeName}.json` : 'tokens.json';
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
        key: 'avatar',
        data: avatarData,
        svgWidth: 24,
        svgHeight: 24,
        pngWidth: 1000,
        pngHeight: 1000,
        fileNameBase: `avatarCompany`,
        defaultGenerator: (tokens) => generateDefaultAvatarSVG(tokens, 24),
      },
      {
        key: 'currency',
        data: currencyIconData,
        svgWidth: 24,
        svgHeight: 24,
        pngWidth: 1000,
        pngHeight: 1000,
        fileNameBase: `tealBalanceIconCurrency`,
        defaultGenerator: (tokens) => generateDefaultCurrencySVG(tokens, 24),
      },
      {
        key: 'thanks',
        data: thanksData,
        svgWidth: 24,
        svgHeight: 24,
        pngWidth: 1000,
        pngHeight: 1000,
        fileNameBase: `thankBalanceIconCurrency`,
        defaultGenerator: (tokens) => generateDefaultThanksSVG(tokens, 24),
      },
      {
        key: 'thanksLeader',
        data: thanksLeaderData,
        svgWidth: 24,
        svgHeight: 24,
        pngWidth: 1000,
        pngHeight: 1000,
        fileNameBase: `thankBalanceLeaderIconCurrency`,
        defaultGenerator: (tokens) => generateDefaultThanksLeaderSVG(tokens, 24),
      },
      {
        key: 'logo',
        data: logoData,
        svgWidth: 128,
        svgHeight: 40,
        pngWidth: 128,
        pngHeight: 40,
        fileNameBase: `logo`,
        defaultGenerator: (tokens) => generateDefaultLogoSVG(tokens, 128, 40),
      },
      {
        key: 'banner',
        data: bannerData,
        svgWidth: 1200,
        svgHeight: 292,
        pngWidth: 2400,
        pngHeight: 584,
        fileNameBase: `bannerDesktop`,
      },
      {
        key: 'bannerMobile',
        data: bannerMobileData,
        svgWidth: 328,
        svgHeight: 364,
        pngWidth: 656,
        pngHeight: 728,
        fileNameBase: `bannerMobile`,
      },
    ];

    for (const asset of assets) {
      if ((asset.key === 'banner' || asset.key === 'bannerMobile') && !asset.data) continue;
      try {
        if (asset.data && asset.data.startsWith('data:image/')) {
          const dataUrl = asset.data.trim();
          const blob = await dataURLToBlob(dataUrl);
          const ext = getFileExtension(dataUrl);
          if (ext === 'svg+xml' || ext === 'svg') {
            try {
              const base64 = dataUrl.split(',')[1];
              if (!base64) throw new Error('No base64 data');
              const svgString = atob(base64);
              zip.file(`${asset.fileNameBase}.svg`, svgString);
            } catch (svgError) {
              console.error(`Ошибка декодирования SVG для ${asset.key}:`, svgError);
            }
          } else {
            const pngBlob = await resizeImageBlob(blob, asset.pngWidth, asset.pngHeight);
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

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFileName = safeName ? `project-${safeName}.zip` : 'project.zip';
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
  className="min-h-screen bg-muted/30" 
  style={{ '--island-inner': tokens ? getColor(tokens.background['island-inner']) : '#EBF8F3' } as any}
>
      <header className="border-b border-border bg-background px-6 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">🎨 Генератор цветовых токенов</h1>
            <p className="text-sm text-muted-foreground">
              Введите цвета → скачайте готовый JSON
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="flex items-center gap-2">
              <label htmlFor="company-name" className="text-sm font-medium whitespace-nowrap">
                Компания:
              </label>
              <input
                id="company-name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="например teal hr"
                className="rounded-md border border-border bg-background px-3 py-2.5 text-sm w-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

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
            <p className="text-muted-foreground">Цвета генерируются автоматически</p>
          </div>
        ) : (
          <Tabs defaultValue="customize" className="w-full">
<TabsList className="grid w-full grid-cols-2 bg-muted">
  <TabsTrigger value="customize">Кастомизация</TabsTrigger>
  <TabsTrigger value="preview">Превью платформы</TabsTrigger>
</TabsList>

            <TabsContent value="customize">
              <div className="space-y-6">
                {/* Десктопный баннер */}
                <BannerSection
                  ref={bannerRef}
                  tokens={tokens}
                  bannerData={bannerData}
                  onUpload={(file) => handleFileUpload('banner', file)}
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
        onChange={handleHexChange(setPrimaryColor, primaryColor)}
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
          onChange={(e) => setTextPrimaryColor(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
      <input
        type="text"
        value={textPrimaryColor.toUpperCase()}
        onChange={handleHexChange(setTextPrimaryColor, textPrimaryColor)}
        onPaste={handleHexPaste(setTextPrimaryColor)}
        className="w-full h-8 rounded-lg border border-border bg-background px-3 py-0 font-mono text-sm text-foreground"
        placeholder="#14140F"
      />
    </div>
    <p className="mt-2 text-xs text-muted-foreground">
      От него строятся вторичный/третичный текст, граница, модальное окно и инверсные цвета.
    </p>
  </div>
  
  {/* Статусные цвета */}
  <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
      Статусные цвета
    </h2>
    <div className="space-y-3">
      {(['warning', 'danger', 'success'] as const).map((key) => {
        const setStatusColor = (value: string) =>
          setStatusColors((prev) => ({ ...prev, [key]: value }));
        const color = statusColors[key];
        return (
          <div key={key} className="flex items-center gap-3">
            <div className="relative h-8 w-8 flex-shrink-0">
              <div className="absolute inset-0 rounded-lg border border-border/30" style={{ backgroundColor: color }} />
              <input
                type="color"
                value={color}
                onChange={(e) => setStatusColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-sm capitalize text-foreground">{key}</span>
            <input
              type="text"
              value={color.toUpperCase()}
              onChange={handleHexChange(setStatusColor, color)}
              onPaste={handleHexPaste(setStatusColor)}
              className="ml-auto w-28 rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-foreground"
            />
          </div>
        );
      })}
    </div>
  </div>
                    {/* Алгоритм генерации */}
<div className="rounded-xl border border-border bg-background p-5 shadow-sm">
  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
    Алгоритм генерации
  </h2>
  <Select value={algorithm} onValueChange={(value: AlgorithmType) => setAlgorithm(value)}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Выберите алгоритм" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="default">✨ Default</SelectItem>
      <SelectItem value="monochromatic">Monochromatic</SelectItem>
      <SelectItem value="saturation">Saturation Scale</SelectItem>
    </SelectContent>
  </Select>
  <div className="mt-2 text-xs text-muted-foreground">
    {algorithm === 'default' && 'Default → эталонные токены'}
    {algorithm === 'monochromatic' && 'Monochromatic → приглушает цвет, делает его мягче и пастельнее'}
    {algorithm === 'saturation' && 'Saturation Scale → усиливает цвет, делает его ярче и насыщеннее'}
  </div>
</div>

 {/* Ручная коррекция токенов */}
  {tokens && (
    <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
      <TokenEditor tokens={flattenTokens(tokens)} onTokenChange={handleTokenChange} />
    </div>
  )}
</div>
                  {/* Правая панель — контент */}
                  <div className="min-w-0 flex-1">
                    <div className="space-y-6">
                      {/* Превью токенов */}
                      <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
                        <TokenPreview tokens={tokens} onReset={handleReset} />
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
        onUpload={(key, file) => handleFileUpload('bannerMobile', file)}
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

            <TabsContent value="preview">
              <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
                <PlatformPreview
                  tokens={tokens}
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
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Index;