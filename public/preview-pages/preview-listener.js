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

    const DEFAULT_LOGO_SVG = '<svg width="119" height="32" fill="none" xmlns="http://www.w3.org/2000/svg" class="MG8TpAqyAtyymf3qmSFD FMTILl3l6wmDrr_PXwYL" viewBox="0 0 119 32"><path d="M56.917 10.93c-1.666 0-3.042.574-4.116 1.727-1.074 1.153-1.618 2.613-1.618 4.384 0 1.77.535 3.248 1.605 4.34 1.07 1.091 2.485 1.639 4.238 1.639 1.316 0 2.446-.337 3.398-1.017.95-.68 1.604-1.63 1.96-2.858h-3.012c-.443 1.109-1.219 1.661-2.324 1.661-.841 0-1.495-.258-1.96-.776-.464-.517-.705-1.27-.718-2.257h8.193v-.311c0-2.008-.509-3.6-1.526-4.77-1.017-1.17-2.393-1.762-4.116-1.762h-.004Zm-2.547 4.848c.088-.797.364-1.424.82-1.88.456-.456 1.034-.688 1.727-.688.736 0 1.315.24 1.727.718.412.478.657 1.096.732 1.85H54.37ZM74.872 14.647c0-2.48-1.662-3.717-4.98-3.717-3.318 0-5.115 1.284-5.29 3.853h2.945c.105-.649.324-1.104.666-1.363.338-.259.873-.386 1.596-.386 1.372 0 2.06.509 2.06 1.526 0 .442-.188.745-.565.907-.377.162-1.118.316-2.227.465a17.03 17.03 0 0 0-1.175.166c-.28.053-.649.128-1.109.233-.456.105-.815.236-1.074.399-.259.162-.53.368-.82.618a2.07 2.07 0 0 0-.618.929 4.066 4.066 0 0 0-.188 1.284c0 1.079.36 1.925 1.082 2.534.724.614 1.719.92 2.99.92 1.504 0 2.74-.477 3.695-1.437.044.443.119.81.22 1.109h3.186c-.267-.618-.398-1.653-.398-3.1v-4.935l.004-.005Zm-3.034 3.766c0 .798-.254 1.42-.762 1.872-.509.451-1.184.675-2.025.675-.548 0-.97-.136-1.272-.408-.302-.272-.456-.644-.456-1.118 0-.473.163-.872.487-1.153.28-.219.885-.407 1.815-.552 1.109-.175 1.845-.377 2.213-.596v1.284-.004ZM80.584 6.92H77.44v15.763h3.143V6.919ZM98.56 12.854h-6.443V6.92h-3.454v15.768h3.454v-6.799h6.444v6.799h3.454V6.919h-3.454v5.936ZM118.041 22.196a3.557 3.557 0 0 1-.197-.82c-.044-.324-.083-.6-.11-.828a18.89 18.89 0 0 1-.087-.92 12.655 12.655 0 0 1-.044-.69c-.193-2.169-.969-3.392-2.323-3.672a3.654 3.654 0 0 0 1.836-1.473c.443-.689.667-1.486.667-2.403 0-1.503-.496-2.625-1.482-3.366-.986-.741-2.266-1.11-3.831-1.11h-7.838v15.773h3.432V16.51h3.077c1.11 0 1.881.215 2.315.64.434.43.71 1.197.829 2.302 0 .057.021.372.065.942s.097 1.035.154 1.394c.057.36.149.662.267.899h3.586c-.119-.105-.224-.268-.311-.487l-.005-.004Zm-4.462-8.645c-.539.303-1.289.456-2.249.456h-3.279V9.646h3.432c.886 0 1.592.149 2.113.442.522.294.785.855.785 1.684 0 .885-.267 1.481-.807 1.784l.005-.004ZM38.103 9.865h4.734v12.822h3.476V9.865h4.739V6.919h-12.95v2.946ZM17.554 12.482l3.083-9.722s.49-1.413-.69-2.318C19.022-.262 18.021 0 17.431.368c-.35.214-.674.476-1.006.717a454.89 454.89 0 0 0-2.34 1.697c-1.05.76-2.099 1.522-3.144 2.287L7.518 7.562c-1.059.77-2.117 1.543-3.175 2.313l-2.401 1.75C1.028 12.292 0 12.878 0 14.16c0 .135.009.262.03.38.145.923.836 1.44 1.676 1.701.441.136.879.28 1.316.42l3.918 1.255 3.486 1.116c.27.087.542.174.813.258h-.004l-.289.927-.695 2.247c-.284.923-.569 1.846-.857 2.769-.258.826-.512 1.657-.77 2.484-.184.603-.45 1.22-.547 1.845-.06.411-.026.84.145 1.22.17.38.472.696.83.919 1.107.69 2.117.052 3.031-.612L27.438 19.88c.787-.573 1.784-1.343 1.675-2.445-.154-1.535-1.912-1.884-3.127-2.27l-7.789-2.47-.444-.148-.199-.066Z" fill="currentColor"></path></svg>';

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
        let elementWidth = rect.width;
        let elementHeight = rect.height;
        // Если элемент пустой (0×0), загруженная картинка будет невидимой — подставляем размеры по умолчанию для логотипа
        if (selector === '[data-testid="logo"]' && (elementWidth <= 0 || elementHeight <= 0)) {
          elementWidth = 119;
          elementHeight = 32;
        }

        const img = document.createElement('img');
        img.src = dataUrl;

        // Сохраняем data-testid, чтобы селектор не "пропадал" после замены
        const testId = element.getAttribute('data-testid');
        if (testId) img.setAttribute('data-testid', testId);

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
    // Логотип: на awards страница может прийти без дефолтного SVG или без плейсхолдера.
    // 1) если плейсхолдера нет — создаём его в "верхней панели" (как на других страницах), либо в header.
    if (!document.querySelector('[data-testid="logo"]')) {
      const topBar = document.querySelector('.awZ9rZllRG_3jP_n6suz .box.display-flex.gap-10');
      const placeholder = document.createElement('div');
      placeholder.setAttribute('data-testid', 'logo');
      placeholder.className = 'Kd4Kv8p1UU0KI7_LaCxl active';
      placeholder.style.color = 'var(--primary, var(--accent, var(--background-accent, #009B65)))';
      if (topBar) {
        topBar.appendChild(placeholder);
      } else {
        const header = document.querySelector('header.yqCbo5AhweWW3a27bZ0Q');
        if (header) {
          header.style.justifyContent = 'space-between';
          header.insertBefore(placeholder, header.firstChild);
        }
      }
    }

    // 2) Пустой плейсхолдер логотипа всегда заполняем дефолтным SVG — иначе при замене на картинку
    //    getBoundingClientRect() даёт 0×0 и загруженный логотип получает размер 0×0 (не виден).
    const logoEl = document.querySelector('[data-testid="logo"]');
    if (logoEl && logoEl.tagName !== 'IMG' && (!logoEl.innerHTML || logoEl.innerHTML.trim() === '')) {
      logoEl.innerHTML = DEFAULT_LOGO_SVG;
    }

    replaceWithImage('[data-testid="logo"]', assets.logo, { objectFit: 'contain' });
    replaceWithImage('[data-testid="company-avatar"]', assets.avatar, { objectFit: 'cover' });
    replaceWithImage('[data-testid="currency-icon"]', assets.currencyIcon, { objectFit: 'contain' });
    replaceWithImage('[data-testid="thanks-icon"]', assets.thanksIcon, { objectFit: 'contain' });
    replaceWithImage('[data-testid="thanks-leader-icon"]', assets.thanksLeaderIcon, { objectFit: 'contain' });
    replaceWithImage('[data-testid="banner"]', assets.banner, { objectFit: 'cover' });
    }
  }
});

// Сообщаем родителю, что iframe готов
window.parent.postMessage({ type: 'preview-ready' }, '*');
document.body.style.backgroundColor = '#ffffff';
console.log('✅ Preview listener загружен');