import { ColorTokens } from '@/lib/colorGenerator';

// Вспомогательная функция — достаёт строку цвета из токена
function getColor(val: { value: string | object }): string {
  return typeof val.value === 'string' ? val.value : 'transparent';
}

interface PlatformPreviewProps {
  tokens: ColorTokens;
}

export default function PlatformPreview({ tokens }: PlatformPreviewProps) {
  // Разбираем токены на группы
  const bg = tokens.background;
  const txt = tokens.text;
  const btn = tokens.buttons;
  const icons = tokens.icons;
  const status = tokens.status;

  return (
    <div
      className="rounded-xl border p-6 shadow-sm"
      style={{
        background: getColor(bg.globe),
        borderColor: getColor(bg.border)
      }}
    >
      {/* Шапка с логотипом и аватарками */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-lg"
            style={{ background: getColor(bg.accent) }}
          />
          <span
            className="text-lg font-semibold"
            style={{ color: getColor(txt.primary) }}
          >
            Teal HR
          </span>
        </div>
        <div className="flex gap-2">
          <div
            className="h-8 w-8 rounded-full"
            style={{ background: getColor(bg['island-inner']) }}
          />
          <div
            className="h-8 w-8 rounded-full"
            style={{ background: getColor(bg.accent) }}
          />
        </div>
      </div>

      {/* Навигация */}
      <div
        className="mb-6 flex gap-4 border-b pb-2"
        style={{ borderColor: getColor(bg.border) }}
      >
        {['Dashboard', 'Employees', 'Settings'].map((item) => (
          <span
            key={item}
            className="text-sm"
            style={{ color: getColor(txt.primary) }}
          >
            {item}
          </span>
        ))}
      </div>

      {/* Контент — карточка сотрудника и график */}
      <div className="grid grid-cols-3 gap-4">
        {/* Карточка сотрудника */}
        <div
          className="rounded-lg p-4"
          style={{
            background: getColor(bg.island),
            borderColor: getColor(bg.border)
          }}
        >
          <div className="mb-2 flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full"
              style={{ background: getColor(bg.accent) }}
            />
            <div>
              <p
                className="font-medium"
                style={{ color: getColor(txt.primary) }}
              >
                Анна Иванова
              </p>
              <p
                className="text-xs"
                style={{ color: getColor(txt.secondary) }}
              >
                HR-менеджер
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <span
              className="rounded-full px-2 py-0.5 text-xs text-white"
              style={{ background: getColor(status.success) }}
            >
              Активен
            </span>
          </div>
        </div>

        {/* График посещаемости */}
        <div
          className="col-span-2 rounded-lg p-4"
          style={{ background: getColor(bg['island-inner']) }}
        >
          <p
            className="mb-2 text-sm font-medium"
            style={{ color: getColor(txt.primary) }}
          >
            Заявки сегодня
          </p>
          <div className="flex h-16 items-end gap-2">
            {[40, 70, 30, 90, 50].map((h, i) => (
              <div
                key={i}
                className="w-6 rounded-t-md"
                style={{
                  height: `${h}%`,
                  background: getColor(bg.accent)
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="mt-6 flex gap-3">
        <button
          className="rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{
            background: getColor(btn.primary['fill-border-default'])
          }}
        >
          Создать отчёт
        </button>
        <button
          className="rounded-lg border-2 px-4 py-2 text-sm font-medium"
          style={{
            background: getColor(btn.outline.fill),
            borderColor: getColor(btn.outline['border-text-default']),
            color: getColor(btn.outline['border-text-default'])
          }}
        >
          Экспорт
        </button>
      </div>
    </div>
  );
}