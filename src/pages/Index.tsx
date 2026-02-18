import { useState, useCallback, useEffect, useRef } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlatformPreview from '@/components/PlatformPreview';

// Импорты всех кастомных карточек
import AvatarCard from '@/components/AvatarCard';
import CurrencyIconCard from '@/components/CurrencyIconCard';
import ThanksIconCard from '@/components/ThanksIconCard';
import ThanksLeaderIconCard from '@/components/ThanksLeaderIconCard';
import LogoCard from '@/components/LogoCard';
import MobileBannerSection from '@/components/MobileBannerSection';

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

const generateDefaultAvatarSVG = (tokens: ColorTokens, size: number = 24): string => {
  const bgColor = getColor(tokens.icons.primary);
  const iconColor = getColor(tokens.icons['primary-inverse']);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="${bgColor}" />
    <g clipPath="url(#clip0_avatar)">
      <path fillRule="evenodd" clipRule="evenodd" d="M6.72591 7.39876C8.05646 5.87571 9.97773 5 12.0009 5C15.8604 5 18.999 8.14047 18.999 12C18.999 13.8647 18.2649 15.5632 17.0702 16.8202C15.7982 18.1356 13.9713 19 12.0009 19C8.14139 19 5.00092 15.8595 5.00092 12C5.00092 10.3279 5.60108 8.71043 6.69005 7.44217C6.69571 7.42518 6.72591 7.39876 6.72591 7.39876ZM12.6925 11.182L13.4078 8.93049C13.4078 8.93049 13.521 8.6021 13.2474 8.3945C13.0341 8.23219 12.802 8.29259 12.6642 8.37751C12.6075 8.41179 12.5536 8.45251 12.5005 8.4926C12.4776 8.5099 12.4548 8.5271 12.4321 8.5436C12.3415 8.60871 12.2513 8.67429 12.1612 8.73987C12.0711 8.80543 11.981 8.87107 11.8904 8.93616C11.7192 9.05955 11.549 9.18388 11.3784 9.30848C11.3064 9.36106 11.2341 9.41385 11.1619 9.46649L10.3692 10.044C10.2465 10.1337 10.1238 10.2229 10.0011 10.3121C9.87848 10.4012 9.75583 10.4904 9.63318 10.58C9.48789 10.6867 9.3426 10.7923 9.1964 10.8986L9.07643 10.9858C9.05526 11.0011 9.03384 11.0163 9.01244 11.0315C8.81829 11.1691 8.62537 11.3058 8.62537 11.5727C8.62537 11.6048 8.62725 11.6331 8.63291 11.6614C8.66689 11.8747 8.82542 11.9955 9.01981 12.0559C9.07077 12.0719 9.12173 12.0884 9.17269 12.1049C9.22359 12.1214 9.27465 12.138 9.32555 12.154C9.47654 12.2021 9.62799 12.2507 9.77945 12.2993C9.93091 12.3479 10.0824 12.3965 10.2333 12.4446L11.227 12.7627C11.2161 12.7976 11.2055 12.8325 11.1949 12.8674C11.1841 12.9033 11.1732 12.9391 11.1619 12.975L10.5808 14.8508C10.5673 14.8963 10.5966 14.8046 10.5808 14.8508C10.548 14.9465 10.5147 15.0436 10.4995 15.1416C10.4844 15.236 10.4938 15.336 10.5334 15.4247C10.5731 15.5134 10.6429 15.5851 10.7259 15.638C10.9826 15.7984 11.2166 15.6512 11.428 15.4964C11.507 15.4391 11.5855 15.3817 11.664 15.3244L11.6648 15.3238C11.7436 15.2662 11.8224 15.2086 11.9017 15.151C12.1225 14.9906 12.3415 14.8302 12.5623 14.6679C12.6859 14.5773 12.81 14.4867 12.9341 14.3961C13.0582 14.3055 13.1823 14.2149 13.3059 14.1243L14.6213 13.1637L14.9856 12.8995C15.1667 12.7674 15.3989 12.5881 15.3725 12.3333C15.3406 12.0175 15.0142 11.9185 14.7445 11.8367C14.7112 11.8266 14.6787 11.8167 14.6477 11.8067C14.3665 11.7161 14.091 11.6293 13.8136 11.5425L12.6925 11.1877V11.182Z" fill="${iconColor}"/>
    </g>
    <defs>
      <clipPath id="clip0_avatar">
        <rect width="24" height="24" rx="12" fill="white"/>
      </clipPath>
    </defs>
  </svg>`;
};

const generateDefaultCurrencySVG = (tokens: ColorTokens, size: number = 24): string => {
  const color = getColor(tokens.icons.primary);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_currency)">
      <path fillRule="evenodd" clipRule="evenodd" d="M2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12ZM13.043 10.78L14.108 7.45C14.108 7.45 14.273 6.968 13.867 6.652C13.55 6.41 13.204 6.501 13.008 6.622C12.9572 6.65283 12.9098 6.68714 12.8624 6.72145L12.834 6.742L12.8128 6.75753C12.7638 6.79352 12.7144 6.82979 12.662 6.863C12.39 7.058 12.118 7.254 11.862 7.45C11.681 7.578 11.5 7.71 11.32 7.842C11.139 7.974 10.958 8.106 10.777 8.234L9.602 9.093C9.319 9.304 9.038 9.507 8.749 9.714L8.502 9.892C8.22659 10.0943 7.95025 10.2953 7.673 10.495L7.605 10.543C7.309 10.752 7.01 10.963 7.01 11.368C7.01 11.414 7.01 11.459 7.025 11.504C7.07 11.821 7.311 12.002 7.598 12.092C7.748 12.137 7.899 12.183 8.05 12.243C8.23084 12.303 8.41169 12.3605 8.59253 12.4179L8.728 12.461L8.84097 12.4969C9.02931 12.5568 9.21766 12.6167 9.406 12.68L10.009 12.876L10.0906 12.9022C10.2627 12.9575 10.4357 13.0131 10.611 13.071C10.688 13.097 10.763 13.122 10.848 13.148C10.819 13.248 10.79 13.348 10.747 13.448C10.71 13.576 10.668 13.704 10.626 13.832C10.6135 13.8722 10.6007 13.9124 10.5879 13.9527C10.56 14.0408 10.5321 14.1292 10.506 14.217C10.4681 14.3299 10.4328 14.4427 10.3975 14.5556L10.3617 14.6698L10.3577 14.6825L10.355 14.691C10.306 14.85 10.257 15.008 10.205 15.166L9.933 16.026C9.913 16.096 9.89 16.166 9.866 16.236L9.86101 16.2513C9.81664 16.3872 9.77228 16.5231 9.753 16.658C9.73047 16.8002 9.746 16.9458 9.798 17.08C9.85978 17.2114 9.95936 17.3215 10.084 17.396C10.461 17.638 10.807 17.412 11.124 17.186C11.2344 17.1103 11.3406 17.0313 11.4472 16.9519L11.478 16.929L11.5267 16.8932C11.6275 16.819 11.7286 16.7445 11.832 16.673C11.998 16.553 12.16 16.432 12.322 16.311C12.484 16.19 12.646 16.07 12.812 15.95C12.9603 15.838 13.112 15.7266 13.2642 15.6148L13.362 15.543L13.4149 15.5042C13.5816 15.382 13.7492 15.259 13.912 15.136C14.0919 15.0075 14.2702 14.8768 14.447 14.744C14.624 14.612 14.801 14.48 14.982 14.352C15.133 14.247 15.28 14.138 15.426 14.028C15.573 13.919 15.721 13.81 15.871 13.704C15.9419 13.6512 16.0134 13.6003 16.0851 13.5493L16.143 13.508C16.233 13.444 16.323 13.38 16.413 13.313C16.685 13.117 17.031 12.845 16.986 12.469C16.9331 12.0033 16.4586 11.8548 16.0691 11.733L16.066 11.732L15.916 11.685C15.713 11.617 15.506 11.553 15.298 11.489C15.091 11.425 14.884 11.361 14.68 11.293L13.233 10.841C13.171 10.82 13.107 10.8 13.043 10.78Z" fill="${color}"/>
    </g>
    <defs>
      <clipPath id="clip0_currency">
        <rect width="24" height="24" rx="12" fill="white"/>
      </clipPath>
    </defs>
  </svg>`;
};

const generateDefaultThanksSVG = (tokens: ColorTokens, size: number = 24): string => {
  const color = getColor(tokens.icons.primary);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.675 9.864c-1.13 0-2.14.55-2.77 1.39a3.466 3.466 0 0 0-2.77-1.39c-1.91 0-3.46 1.56-3.46 3.48 0 .74.12 1.43.32 2.06.98 3.11 4.02 4.98 5.52 5.49.21.07.56.07.77 0 1.5-.51 4.54-2.37 5.52-5.49.21-.64.32-1.32.32-2.06a3.457 3.457 0 0 0-3.45-3.48Z" fill="${color}"/>
    <path d="M20.625 8.294c0 .23-.23.38-.45.32a4.81 4.81 0 0 0-3.95.74c-.22.16-.52.16-.73 0a4.65 4.65 0 0 0-2.76-.9c-2.58 0-4.68 2.11-4.68 4.71 0 2.82 1.35 4.93 2.71 6.34.07.07.01.19-.08.15-2.73-.93-8.81-4.79-8.81-11.36 0-2.9 2.33-5.24 5.21-5.24 1.71 0 3.22.82 4.17 2.09a5.218 5.218 0 0 1 4.17-2.09c2.87 0 5.2 2.34 5.2 5.24Z" fill="${color}"/>
  </svg>`;
};

const generateDefaultThanksLeaderSVG = (tokens: ColorTokens, size: number = 24): string => {
  const color = getColor(tokens.icons.primary);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M14.22 2.537A3.832 3.832 0 0 1 17.281 1a3.822 3.822 0 0 1 3.814 3.848 7.23 7.23 0 0 1-.353 2.277c-1.084 3.45-4.445 5.507-6.104 6.07a1.59 1.59 0 0 1-.851 0c-1.659-.563-5.02-2.63-6.103-6.07a7.505 7.505 0 0 1-.354-2.277C7.33 2.725 9.045 1 11.156 1c1.25 0 2.367.608 3.063 1.537ZM20.38 12.98c.144-.12.47-.281.64-.315a1.546 1.546 0 0 1 1.781 1.103c.085.315.027.786-.132 1.085-.069.128-.95 1.19-1.545 1.86-.128.145-1.05 1.217-1.15 1.337-.052.063-.426.499-.83.968-.406.47-.774.898-.818.952-.264.32-.64.73-.793.866-.468.413-1.012.688-1.676.845-.19.045-.478.05-4.079.057l-3.874.009L6.665 23l-.622-.51a1744.09 1744.09 0 0 0-2.025-1.657c-2.534-2.07-2.86-2.339-2.86-2.356 0-.016 1.866-1.862 2.962-2.93.7-.682 1.112-.988 1.767-1.311a5.832 5.832 0 0 1 2.526-.635 5.894 5.894 0 0 1 2.28.357l.194.07h2.042c1.704.001 2.07.008 2.213.041a1.468 1.468 0 0 1 1.113 1.55c-.057.58-.429 1.046-.997 1.25-.177.063-.181.064-1.91.077-1.54.012-1.74.019-1.813.059a.495.495 0 0 0-.053.83l.104.08h4.013l.224-.09c.225-.091.464-.248.625-.41.077-.076.286-.312.84-.945l.371-.423c.114-.128.647-.736 1.186-1.35l1.194-1.364c.119-.135.273-.293.342-.352Z" fill="${color}"/>
  </svg>`;
};

const generateDefaultLogoSVG = (tokens: ColorTokens, width: number = 128, height: number = 40): string => {
  const color = getColor(tokens.icons.primary);
  return `<svg width="${width}" height="${height}" viewBox="0 0 119 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M56.917 10.93c-1.666 0-3.042.574-4.116 1.727-1.074 1.153-1.618 2.613-1.618 4.384 0 1.77.535 3.248 1.605 4.34 1.07 1.091 2.485 1.639 4.238 1.639 1.316 0 2.446-.337 3.398-1.017.95-.68 1.604-1.63 1.96-2.858h-3.012c-.443 1.109-1.219 1.661-2.324 1.661-.841 0-1.495-.258-1.96-.776-.464-.517-.705-1.27-.718-2.257h8.193v-.311c0-2.008-.509-3.6-1.526-4.77-1.017-1.17-2.393-1.762-4.116-1.762h-.004Zm-2.547 4.848c.088-.797.364-1.424.82-1.88.456-.456 1.034-.688 1.727-.688.736 0 1.315.24 1.727.718.412.478.657 1.096.732 1.85H54.37ZM74.872 14.647c0-2.48-1.662-3.717-4.98-3.717-3.318 0-5.115 1.284-5.29 3.853h2.945c.105-.649.324-1.104.666-1.363.338-.259.873-.386 1.596-.386 1.372 0 2.06.509 2.06 1.526 0 .442-.188.745-.565.907-.377.162-1.118.316-2.227.465a17.03 17.03 0 0 0-1.175.166c-.28.053-.649.128-1.109.233-.456.105-.815.236-1.074.399-.259.162-.53.368-.82.618a2.07 2.07 0 0 0-.618.929 4.066 4.066 0 0 0-.188 1.284c0 1.079.36 1.925 1.082 2.534.724.614 1.719.92 2.99.92 1.504 0 2.74-.477 3.695-1.437.044.443.119.81.22 1.109h3.186c-.267-.618-.398-1.653-.398-3.1v-4.935l.004-.005Zm-3.034 3.766c0 .798-.254 1.42-.762 1.872-.509.451-1.184.675-2.025.675-.548 0-.97-.136-1.272-.408-.302-.272-.456-.644-.456-1.118 0-.473.163-.872.487-1.153.28-.219.885-.407 1.815-.552 1.109-.175 1.845-.377 2.213-.596v1.284-.004ZM80.584 6.92H77.44v15.763h3.143V6.919ZM98.56 12.854h-6.443V6.92h-3.454v15.768h3.454v-6.799h6.444v6.799h3.454V6.919h-3.454v5.936ZM118.041 22.196a3.557 3.557 0 0 1-.197-.82c-.044-.324-.083-.6-.11-.828a18.89 18.89 0 0 1-.087-.92 12.655 12.655 0 0 1-.044-.69c-.193-2.169-.969-3.392-2.323-3.672a3.654 3.654 0 0 0 1.836-1.473c.443-.689.667-1.486.667-2.403 0-1.503-.496-2.625-1.482-3.366-.986-.741-2.266-1.11-3.831-1.11h-7.838v15.773h3.432V16.51h3.077c1.11 0 1.881.215 2.315.64.434.43.71 1.197.829 2.302 0 .057.021.372.065.942s.097 1.035.154 1.394c.057.36.149.662.267.899h3.586c-.119-.105-.224-.268-.311-.487l-.005-.004Zm-4.462-8.645c-.539.303-1.289.456-2.249.456h-3.279V9.646h3.432c.886 0 1.592.149 2.113.442.522.294.785.855.785 1.684 0 .885-.267 1.481-.807 1.784l.005-.004ZM38.103 9.865h4.734v12.822h3.476V9.865h4.739V6.919h-12.95v2.946ZM17.554 12.482l3.083-9.722s.49-1.413-.69-2.318C19.022-.262 18.021 0 17.431.368c-.35.214-.674.476-1.006.717a454.89 454.89 0 0 0-2.34 1.697c-1.05.76-2.099 1.522-3.144 2.287L7.518 7.562c-1.059.77-2.117 1.543-3.175 2.313l-2.401 1.75C1.028 12.292 0 12.878 0 14.16c0 .135.009.262.03.38.145.923.836 1.44 1.676 1.701.441.136.879.28 1.316.42l3.918 1.255 3.486 1.116c.27.087.542.174.813.258h-.004l-.289.927-.695 2.247c-.284.923-.569 1.846-.857 2.769-.258.826-.512 1.657-.77 2.484-.184.603-.45 1.22-.547 1.845-.06.411-.026.84.145 1.22.17.38.472.696.83.919 1.107.69 2.117.052 3.031-.612L27.438 19.88c.787-.573 1.784-1.343 1.675-2.445-.154-1.535-1.912-1.884-3.127-2.27l-7.789-2.47-.444-.148-.199-.066Z" fill="${color}"/>
  </svg>`;
};

// ==============================================
//   ОСНОВНОЙ КОМПОНЕНТ
// ==============================================

const Index = () => {
  const [primaryColor, setPrimaryColor] = useState('#009B65');
  const [textPrimaryColor, setTextPrimaryColor] = useState('#14140F');
  const [statusColors, setStatusColors] = useState<StatusColors>({ ...DEFAULT_STATUS });
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('default');
  const [tokens, setTokens] = useState<ColorTokens | null>(null);
  const [companyName, setCompanyName] = useState('');

  const [bannerData, setBannerData] = useState<string>();
  const [avatarData, setAvatarData] = useState<string>();
  const [currencyIconData, setCurrencyIconData] = useState<string>();
  const [thanksData, setThanksData] = useState<string>();
  const [thanksLeaderData, setThanksLeaderData] = useState<string>();
  const [logoData, setLogoData] = useState<string>();
  const [bannerMobileData, setBannerMobileData] = useState<string | null>(null); // ✅ добавлено
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
    
    // Создаём глубокую копию токенов, чтобы не мутировать оригинал
    const tokensCopy = JSON.parse(JSON.stringify(tokens));
    
    // Удаляем поля, которые не должны попадать в JSON
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
    setAvatarData(undefined);
    setCurrencyIconData(undefined);
    setThanksData(undefined);
    setThanksLeaderData(undefined);
    setLogoData(undefined);
    setBannerMobileData(null);
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
          case 'bannerMobile': setBannerMobileData(e.target.result as string); break; // ✅ добавлено
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

  // ==============================================
  //   УНИВЕРСАЛЬНЫЕ ОБРАБОТЧИКИ ДЛЯ HEX-ПОЛЕЙ
  // ==============================================

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

  // ==============================================
  //   ЭКСПОРТ ПРОЕКТА (ZIP)
  // ==============================================

  const handleExportAll = async () => {
    if (!tokens) return;

    const zip = new JSZip();
    const safeName = sanitizeFileName(companyName);
    const nameSuffix = safeName ? `-${safeName}` : '';

    // 1. JSON с токенами (без accent-rgb полей)
    const tokensForExport = JSON.parse(JSON.stringify(tokens));
    if (tokensForExport.background) {
      delete tokensForExport.background['accent-rgb'];
      delete tokensForExport.background['accent-secondary-rgb'];
    }
    const jsonFileName = safeName ? `tokens-${safeName}.json` : 'tokens.json';
    zip.file(jsonFileName, JSON.stringify(tokensForExport, null, 2));

    // 2. Конфигурация атрибутов (имена БЕЗ суффикса)
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
        // дефолтный баннер НЕ экспортируем
      },
      {
        key: 'bannerMobile',
        data: bannerMobileData,
        svgWidth: 328,
        svgHeight: 364,
        pngWidth: 656,
        pngHeight: 728,
        fileNameBase: `bannerMobile`,
        // дефолтного нет
      },
    ];

    for (const asset of assets) {
      // Пропускаем баннеры, если они не загружены
      if ((asset.key === 'banner' || asset.key === 'bannerMobile') && !asset.data) continue;

      try {
        // ЗАГРУЖЕННЫЙ ФАЙЛ
        if (asset.data && asset.data.startsWith('data:image/')) {
          const dataUrl = asset.data.trim();
          const blob = await dataURLToBlob(dataUrl);
          const ext = getFileExtension(dataUrl);

          if (ext === 'svg+xml' || ext === 'svg') {
            // Сохраняем оригинальный SVG
            try {
              const base64 = dataUrl.split(',')[1];
              if (!base64) throw new Error('No base64 data');
              const svgString = atob(base64);
              zip.file(`${asset.fileNameBase}.svg`, svgString);
            } catch (svgError) {
              console.error(`Ошибка декодирования SVG для ${asset.key}:`, svgError);
            }
          } else {
            // PNG/JPG → ресайзим до целевого размера
            const pngBlob = await resizeImageBlob(blob, asset.pngWidth, asset.pngHeight);
            zip.file(`${asset.fileNameBase}.png`, pngBlob);
          }
        }
        // ДЕФОЛТНЫЙ АТРИБУТ (SVG)
        else if (asset.defaultGenerator) {
          const svgString = asset.defaultGenerator(tokens);
          zip.file(`${asset.fileNameBase}.svg`, svgString);
        }
      } catch (error) {
        console.error(`Ошибка обработки ${asset.key}:`, error);
      }
    }

    // 3. ZIP-архив
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
    <div className="min-h-screen bg-muted/30">
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
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm w-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {tokens && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  <Download size={16} />
                  Скачать JSON
                </button>
                <button
                  onClick={handleExportAll}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customize">Кастомизация</TabsTrigger>
              <TabsTrigger value="preview">Превью платформы</TabsTrigger>
            </TabsList>
            <TabsContent value="customize">
              <div className="space-y-6">
                {/* Баннер */}
                <BannerSection
                  ref={bannerRef}
                  tokens={tokens}
                  bannerData={bannerData}
                  onUpload={(file) => handleFileUpload('banner', file)}
                  onRemove={() => setBannerData(undefined)}
                />

                {/* Двухколоночный макет с левой панелью и правым контентом */}
                <div className="flex flex-col gap-6 lg:flex-row">
                  {/* Левая панель — управление */}
                  <div className="w-full space-y-6 lg:w-80 lg:shrink-0">
                    {/* Primary цвет */}
                    <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Primary цвет
                      </h2>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="h-12 w-12 cursor-pointer rounded-lg border-0 p-0"
                        />
                        <input
                          type="text"
                          value={primaryColor.toUpperCase()}
                          onChange={handleHexChange(setPrimaryColor, primaryColor)}
                          onPaste={handleHexPaste(setPrimaryColor)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground"
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
                        <input
                          type="color"
                          value={textPrimaryColor}
                          onChange={(e) => setTextPrimaryColor(e.target.value)}
                          className="h-12 w-12 cursor-pointer rounded-lg border-0 p-0"
                        />
                        <input
                          type="text"
                          value={textPrimaryColor.toUpperCase()}
                          onChange={handleHexChange(setTextPrimaryColor, textPrimaryColor)}
                          onPaste={handleHexPaste(setTextPrimaryColor)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground"
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
                          return (
                            <div key={key} className="flex items-center gap-3">
                              <input
                                type="color"
                                value={statusColors[key]}
                                onChange={(e) => setStatusColor(e.target.value)}
                                className="h-8 w-8 cursor-pointer rounded border-0 p-0"
                              />
                              <span className="text-sm capitalize text-foreground">{key}</span>
                              <input
                                type="text"
                                value={statusColors[key].toUpperCase()}
                                onChange={handleHexChange(setStatusColor, statusColors[key])}
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
                      <select
                        value={algorithm}
                        onChange={(e) => setAlgorithm(e.target.value as AlgorithmType)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="default">✨ Default (эталонные токены)</option>
                        <option value="monochromatic">Monochromatic</option>
                        <option value="saturation">Saturation Scale</option>
                      </select>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Monochromatic → светлые оттенки с 10% насыщенности.
                      </p>
                    </div>

                    {/* Ручная коррекция токенов */}
                    {tokens && (
                      <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                        <TokenEditor tokens={flattenTokens(tokens)} onTokenChange={handleTokenChange} />
                      </div>
                    )}
                  </div>

                  {/* Правая панель — контент (превью токенов и карточки) */}
                  <div className="min-w-0 flex-1">
                    <div className="space-y-6">
                      <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
                        <TokenPreview tokens={tokens} onReset={handleReset} />
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <AvatarCard
                          tokens={tokens}
                          fileData={avatarData}
                          onUpload={handleFileUpload}
                          onRemove={() => setAvatarData(undefined)}
                        />
                        <CurrencyIconCard
                          tokens={tokens}
                          fileData={currencyIconData}
                          onUpload={handleFileUpload}
                          onRemove={() => setCurrencyIconData(undefined)}
                        />
                        <ThanksIconCard
                          tokens={tokens}
                          fileData={thanksData}
                          onUpload={handleFileUpload}
                          onRemove={() => setThanksData(undefined)}
                        />
                        <ThanksLeaderIconCard
                          tokens={tokens}
                          fileData={thanksLeaderData}
                          onUpload={handleFileUpload}
                          onRemove={() => setThanksLeaderData(undefined)}
                        />
                        <LogoCard
                          tokens={tokens}
                          fileData={logoData}
                          onUpload={handleFileUpload}
                          onRemove={() => setLogoData(undefined)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Мобильный баннер и кнопка "Очистить всё" */}
              <div className="mt-4">
                <MobileBannerSection
                  tokens={tokens}
                  fileData={bannerMobileData ?? undefined}
                  onUpload={(key, file) => handleFileUpload('bannerMobile', file)}
                  onRemove={() => setBannerMobileData(null)}
                />
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <RotateCcw size={16} />
                  Очистить всё
                </button>
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
                    bannerMobile: bannerMobileData, // ✅ добавлено
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