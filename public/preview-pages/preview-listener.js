// Слушаем сообщения от родительского окна (генератора токенов)
window.addEventListener('message', (event) => {
  // Проверяем, что сообщение содержит объект с переменными
  if (event.data && typeof event.data === 'object') {
    // Обновляем CSS-переменные в корневом элементе
    const root = document.documentElement;
    Object.entries(event.data).forEach(([key, value]) => {
      // Убеждаемся, что ключ начинается с '--'
      const cssVar = key.startsWith('--') ? key : `--${key}`;
      root.style.setProperty(cssVar, value);
    });
  }
});

// Сообщаем родителю, что скрипт загружен и готов
window.parent.postMessage({ type: 'preview-ready' }, '*');