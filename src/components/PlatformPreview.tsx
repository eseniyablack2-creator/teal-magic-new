import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ColorTokens } from '@/lib/colorGenerator';

interface PlatformPreviewProps {
  tokens: ColorTokens;
}

const IFRAME_WIDTH = 1500;          // ширина для десктопного меню
const MAX_CONTAINER_HEIGHT = 2000;  // максимальная высота контейнера

const pathToCssVar = (path: string): string => '--' + path.replace(/\./g, '-');

const collectCssVariables = (tokens: ColorTokens): Record<string, string> => {
  const result: Record<string, string> = {};
  const flatten = (obj: any, prefix = '') => {
    for (const key in obj) {
      const value = obj[key];
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && 'value' in value) {
        result[pathToCssVar(fullPath)] = value.value;
      } else if (value && typeof value === 'object') {
        flatten(value, fullPath);
      }
    }
  };
  flatten(tokens);
  return result;
};

const pages = [
  { id: 'home', label: 'Главная', path: '/preview-pages/home.html' },
  { id: 'shop', label: 'Магазин', path: '/preview-pages/shop.html' },
  { id: 'awards', label: 'Витрина наград', path: '/preview-pages/awards.html' },
  { id: 'leaderboard', label: 'Доска лидеров', path: '/preview-pages/leaderboard.html' },
  { id: 'profile', label: 'Мой профиль', path: '/preview-pages/profile.html' },
];

export default function PlatformPreview({ tokens }: PlatformPreviewProps) {
  const [currentPage, setCurrentPage] = useState('home');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [wrapperHeight, setWrapperHeight] = useState(800);
  const [isIframeReady, setIsIframeReady] = useState(false); // готов ли скрипт внутри iframe

  // ResizeObserver для масштабирования
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      const newScale = Math.min(1, width / IFRAME_WIDTH);
      setScale(newScale);
      const availableHeight = Math.min(height, MAX_CONTAINER_HEIGHT);
      const newWrapperHeight = newScale > 0 ? availableHeight / newScale : availableHeight;
      setWrapperHeight(newWrapperHeight);
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Функция отправки цветов в iframe
  const sendColorsToIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !isIframeReady) return;
    const cssVars = collectCssVariables(tokens);
    console.log('📤 Отправляем переменные в iframe:', cssVars);
    iframe.contentWindow?.postMessage(cssVars, '*');
  }, [tokens, isIframeReady]);

  // Отправляем цвета при изменении токенов (если iframe готов)
  useEffect(() => {
    sendColorsToIframe();
  }, [sendColorsToIframe]);

  // Слушаем сообщение 'preview-ready' от iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return; // сообщение только от нашего iframe
      if (event.data?.type === 'preview-ready') {
        console.log(`🎯 iframe готов к приёму: ${currentPage}`);
        setIsIframeReady(true);
        // Немедленно отправляем цвета после готовности
        sendColorsToIframe();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentPage, sendColorsToIframe]);

  // При смене страницы сбрасываем флаг готовности
  useEffect(() => {
    setIsIframeReady(false);
  }, [currentPage]);

  // Обработчик загрузки iframe (теперь только для логов и установки белого фона)
  const handleIframeLoad = () => {
    console.log(`✅ iframe загружен (HTML): ${currentPage}`);
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Белый фон (на случай, если страница не имеет своего)
    const iframeDoc = iframe.contentDocument;
    if (iframeDoc) {
      iframeDoc.body.style.backgroundColor = '#ffffff';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap gap-2 mb-4">
        {pages.map(page => (
          <Button
            key={page.id}
            variant={currentPage === page.id ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => setCurrentPage(page.id)}
          >
            {page.label}
          </Button>
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
            transformOrigin: 'top left',
            margin: '0 auto',
          }}
        >
          <iframe
            ref={iframeRef}
            key={currentPage} // принудительное пересоздание при смене страницы
            src={pages.find(p => p.id === currentPage)?.path}
            width={IFRAME_WIDTH}
            height={wrapperHeight}
            style={{
              border: 0,
              display: 'block',
              width: '100%',
              height: '100%',
              backgroundColor: '#ffffff',
            }}
            title={pages.find(p => p.id === currentPage)?.label}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    </div>
  );
}