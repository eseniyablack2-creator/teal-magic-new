window.addEventListener('message', (event) => {
  console.log('📥 iframe получил сообщение:', event.data);

  // Обработка цветов
  if (event.data && typeof event.data === 'object' && !event.data.type) {
    const root = document.documentElement;
    Object.entries(event.data).forEach(([key, value]) => {
      const cssVar = key.startsWith('--') ? key : `--${key}`;
      root.style.setProperty(cssVar, value);
    });
  }

  // Обработка изображений бренда, названия компании и наименования валюты
  if (event.data?.type === 'BRAND_ASSETS') {
    const assets = event.data.assets;
    const companyName = event.data.companyName;
    const currencyName = event.data.currencyName;
    console.log('🖼️ Получены атрибуты бренда:', assets, 'название компании:', companyName, 'валюта:', currencyName);

    // Название компании: подставляем во все h3 с текстом "Teal HR" (страница Главная)
    if (companyName !== undefined) {
      var nameToShow = companyName != null && String(companyName).trim() !== '' ? String(companyName).trim() : 'Teal HR';
      document.querySelectorAll('h3').forEach(function (h) {
        var t = h.textContent && h.textContent.trim();
        if (t === 'Teal HR' || h.getAttribute('data-preview-company') === 'true') {
          h.textContent = nameToShow;
          h.setAttribute('data-preview-company', 'true');
        }
      });
    }

    // Наименование валюты: заменяем слово "Teal" на переданное значение (не трогаем "Teal HR")
    if (currencyName != null && String(currencyName).trim() !== '') {
      var currencyToShow = String(currencyName).trim();
      var selector = 'h2, h3, h4, p, span, button';
      document.querySelectorAll(selector).forEach(function (el) {
        if (el.textContent && el.textContent.indexOf('Teal') !== -1) {
          el.textContent = el.textContent.replace(/\bTeal(?!\s*HR\b)/g, currencyToShow);
        }
      });
    }

    function replaceWithImage(selector, dataUrl, options = {}) {
      if (!dataUrl) return;
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`⚠️ Элементы ${selector} не найдены`);
        return;
      }

      elements.forEach((element) => {
        console.log(`✅ Найден элемент ${selector}, заменяем на изображение`);

        // Получаем точные размеры элемента до замены (уже в пикселях, с учётом всех CSS)
        const rect = element.getBoundingClientRect();
        const elementWidth = rect.width;
        const elementHeight = rect.height;

        const img = document.createElement('img');
        img.src = dataUrl;

        // Копируем классы (теперь правильно)
        const classStr = element.getAttribute('class');
        if (classStr) img.className = classStr;

        // Копируем инлайн-стили (если есть)
        if (element.style.cssText) {
          img.style.cssText = element.style.cssText;
        }

        // Принудительно устанавливаем точные размеры в пикселях
        img.style.width = elementWidth + 'px';
        img.style.height = elementHeight + 'px';
        img.style.objectFit = options.objectFit || 'contain';

        // Заменяем элемент
        element.replaceWith(img);
      });
    }

    // Применяем для всех типов атрибутов (только если передан объект assets)
    if (assets) {
    replaceWithImage('[data-testid="logo"]', assets.logo, { objectFit: 'contain' });
    replaceWithImage('[data-testid="company-avatar"]', assets.avatar, { objectFit: 'cover' });
    replaceWithImage('[data-testid="currency-icon"]', assets.currencyIcon, { objectFit: 'contain' });
    replaceWithImage('[data-testid="thanks-icon"]', assets.thanksIcon, { objectFit: 'contain' });
    replaceWithImage('[data-testid="thanks-leader-icon"]', assets.thanksLeaderIcon, { objectFit: 'contain' });
    replaceWithImage('[data-testid="banner"]', assets.banner, { objectFit: 'cover' });

    // Запасной вариант для логотипа (если data-testid="logo" отсутствует)
    if (assets.logo && !document.querySelector('[data-testid="logo"]')) {
      const logoLink = document.querySelector('a[href*="teal-hr"]');
      if (logoLink) {
        const svg = logoLink.querySelector('svg');
        if (svg) {
          const rect = svg.getBoundingClientRect();
          const classStr = svg.getAttribute('class');
          const img = document.createElement('img');
          img.src = assets.logo;
          if (classStr) img.className = classStr;
          img.style.width = rect.width + 'px';
          img.style.height = rect.height + 'px';
          img.style.objectFit = 'contain';
          svg.replaceWith(img);
          console.log('✅ Логотип заменён (запасной селектор)');
        }
      }
    }
    }
  }
});

// Сообщаем родителю, что iframe готов
window.parent.postMessage({ type: 'preview-ready' }, '*');
document.body.style.backgroundColor = '#ffffff';
console.log('✅ Preview listener загружен');