import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ColorTokens } from "@/lib/colorGenerator";

interface PlatformPreviewProps {
  tokens: ColorTokens;
  companyName?: string;
  currencyName?: string;
  brandAssets?: Record<string, string>;
}

const IFRAME_WIDTH = 1500;
const MAX_CONTAINER_HEIGHT = 900;

const pathToCssVar = (path: string): string => "--" + path.replace(/\./g, "-");

const collectCssVariables = (tokens: ColorTokens): Record<string, string> => {
  const result: Record<string, string> = {};
  const flatten = (obj: any, prefix = "") => {
    for (const key in obj) {
      const value = obj[key];
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === "object" && "value" in value) {
        if (value.type === "boxShadow" && typeof value.value === "object") {
          const shadow = value.value;
          const shadowString = `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
          result[pathToCssVar(fullPath)] = shadowString;
        } else {
          result[pathToCssVar(fullPath)] = value.value;
        }
      } else if (value && typeof value === "object") {
        flatten(value, fullPath);
      }
    }
  };
  flatten(tokens);
  return result;
};

const pages = [
  { id: "home", label: "Главная", path: "/preview-pages/home.html" },
  { id: "shop", label: "Магазин", path: "/preview-pages/shop.html" },
  { id: "awards", label: "Витрина наград", path: "/preview-pages/awards.html" },
  {
    id: "leaderboard",
    label: "Доска лидеров",
    path: "/preview-pages/leaderboard.html",
  },
  { id: "profile", label: "Мой профиль", path: "/preview-pages/profile.html" },
];

export default function PlatformPreview({
  tokens,
  companyName,
  currencyName = "Teal",
  brandAssets,
}: PlatformPreviewProps) {
  const [currentPage, setCurrentPage] = useState("home");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [wrapperHeight, setWrapperHeight] = useState(800);
  const [isIframeReady, setIsIframeReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const newScale = Math.min(1, width / IFRAME_WIDTH);
      setScale(newScale);
      const availableHeight = Math.min(height, MAX_CONTAINER_HEIGHT);
      const newWrapperHeight =
        newScale > 0 ? availableHeight / newScale : availableHeight;
      setWrapperHeight(newWrapperHeight);
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const sendColorsToIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !isIframeReady) return;
    const cssVars = collectCssVariables(tokens);
    console.log("📤 Отправляем переменные в iframe:", cssVars);
    iframe.contentWindow?.postMessage(cssVars, "*");
  }, [tokens, isIframeReady]);

  useEffect(() => {
    sendColorsToIframe();
  }, [sendColorsToIframe]);

  // Отправка атрибутов бренда, названия компании и наименования валюты
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !isIframeReady) return;
    const hasAnyAsset = brandAssets && Object.values(brandAssets).some((v) => v);
    const hasCompanyName = companyName != null && companyName.trim() !== "";
    const displayCurrencyName = currencyName != null && currencyName.trim() !== "" ? currencyName.trim() : "Teal";

    const payload: { type: string; assets?: Record<string, string>; companyName?: string; currencyName: string } = {
      type: "BRAND_ASSETS",
      ...(brandAssets && { assets: brandAssets }),
      ...(hasCompanyName && { companyName: companyName!.trim() }),
      currencyName: displayCurrencyName,
    };
    console.log("📤 Отправляем атрибуты бренда, название компании и валюту в iframe:", payload);
    iframe.contentWindow?.postMessage(payload, "*");
  }, [brandAssets, companyName, currencyName, isIframeReady, currentPage]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === "preview-ready") {
        console.log(`🎯 iframe готов к приёму: ${currentPage}`);
        setIsIframeReady(true);
        sendColorsToIframe();
        const hasAnyAsset = brandAssets && Object.values(brandAssets).some((v) => v);
        const hasCompanyName = companyName != null && companyName.trim() !== "";
        const displayCurrencyName = currencyName != null && currencyName.trim() !== "" ? currencyName.trim() : "Teal";
        const payload: { type: string; assets?: Record<string, string>; companyName?: string; currencyName: string } = {
          type: "BRAND_ASSETS",
          ...(brandAssets && { assets: brandAssets }),
          ...(hasCompanyName && { companyName: companyName!.trim() }),
          currencyName: displayCurrencyName,
        };
        iframeRef.current?.contentWindow?.postMessage(payload, "*");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentPage, sendColorsToIframe, brandAssets, companyName, currencyName]);

  useEffect(() => {
    setIsIframeReady(false);
  }, [currentPage]);

  const sendColorsAndBrandToIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    const cssVars = collectCssVariables(tokens);
    iframe.contentWindow.postMessage(cssVars, "*");
    const displayCurrencyName = currencyName != null && currencyName.trim() !== "" ? currencyName.trim() : "Teal";
    const payload: { type: string; assets?: Record<string, string>; companyName?: string; currencyName: string } = {
      type: "BRAND_ASSETS",
      ...(brandAssets && { assets: brandAssets }),
      ...(companyName != null && companyName.trim() !== "" && { companyName: companyName.trim() }),
      currencyName: displayCurrencyName,
    };
    iframe.contentWindow.postMessage(payload, "*");
  }, [tokens, brandAssets, companyName, currencyName]);

  const handleIframeLoad = () => {
    console.log(`✅ iframe загружен (HTML): ${currentPage}`);
    const iframe = iframeRef.current;
    if (!iframe) return;
    const iframeDoc = iframe.contentDocument;
    if (iframeDoc) {
      iframeDoc.body.style.backgroundColor = "#ffffff";
    }
    // Сразу отправляем цвета и атрибуты — не ждём preview-ready, чтобы не было долгой подсветки дефолта
    sendColorsAndBrandToIframe();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap gap-2 mb-4">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setCurrentPage(page.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              currentPage === page.id
                ? "bg-primary text-white"
                : "border border-border bg-background text-foreground hover:bg-island-inner"
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-gray-100 rounded-md"
        style={{ maxHeight: MAX_CONTAINER_HEIGHT }}
      >
        <div
          style={{
            width: IFRAME_WIDTH,
            height: wrapperHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            margin: "0 auto",
          }}
        >
          <iframe
            ref={iframeRef}
            key={currentPage}
            src={pages.find((p) => p.id === currentPage)?.path}
            width={IFRAME_WIDTH}
            height={wrapperHeight}
            style={{
              border: 0,
              display: "block",
              width: "100%",
              height: "100%",
              backgroundColor: "#ffffff",
            }}
            title={pages.find((p) => p.id === currentPage)?.label}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    </div>
  );
}
