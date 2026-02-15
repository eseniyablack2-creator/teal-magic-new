import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ColorTokens } from '@/lib/colorGenerator';

interface PlatformPreviewProps {
  tokens: ColorTokens;
}

// Преобразует путь вида "background.globe" в CSS-переменную "--background-globe"
const pathToCssVar = (path: string): string => {
  return '--' + path.replace(/\./g, '-');
};

// Собирает плоский объект всех CSS-переменных из токенов
const collectCssVariables = (tokens: ColorTokens): Record<string, string> => {
  const result: Record<string, string> = {};
  
  const flatten = (obj: any, prefix = '') => {
    for (const key in obj) {
      const value = obj[key];
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && 'value' in value) {
        // это листовой токен
        const cssVar = pathToCssVar(fullPath);
        result[cssVar] = value.value;
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

  // При изменении токенов отправляем новые переменные в iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const cssVars = collectCssVariables(tokens);
    // Ждём, пока iframe загрузится, и отправляем сообщение
    const sendVars = () => {
      iframe.contentWindow?.postMessage(cssVars, '*');
    };

    // Если iframe уже загружен, отправляем сразу
    if (iframe.contentDocument?.readyState === 'complete') {
      sendVars();
    } else {
      // Иначе ждём события load
      iframe.addEventListener('load', sendVars, { once: true });
    }
  }, [tokens, currentPage]); // перезапускаем при смене страницы или токенов

  return (
    <div className="flex flex-col h-full">
      <Tabs value={currentPage} onValueChange={setCurrentPage} className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          {pages.map(page => (
            <TabsTrigger key={page.id} value={page.id}>
              {page.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {pages.map(page => (
          <TabsContent key={page.id} value={page.id} className="flex-1">
            <iframe
              ref={iframeRef}
              src={page.path}
              className="w-full h-full border-0 rounded-md"
              title={page.label}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}