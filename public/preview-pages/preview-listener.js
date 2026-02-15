// Слушаем сообщения от родительского окна (генератора токенов)
window.addEventListener('message', (event) => {
  console.log('📥 iframe получил сообщение:', event.data);
  if (event.data && typeof event.data === 'object') {
    const root = document.documentElement;
    Object.entries(event.data).forEach(([key, value]) => {
      const cssVar = key.startsWith('--') ? key : `--${key}`;
      root.style.setProperty(cssVar, value);
    });
  }
});
window.parent.postMessage({ type: 'preview-ready' }, '*');
console.log('✅ Preview listener загружен');