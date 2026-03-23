import { ColorTokens } from "@/lib/colorGenerator";
import { RotateCcw } from "lucide-react";
import { useState } from "react";
interface Props {
  tokens: ColorTokens;
  onReset: () => void;
}

function getColor(val?: { value: string | object }): string {
  if (!val || !val.value) return "transparent";
  return typeof val.value === "string" ? val.value : "transparent";
}

// ----- ИКОНКА «ЗВЕЗДА» (ПОЛНОЕ ОПРЕДЕЛЕНИЕ) -----
const IconStar = ({ color }: { color: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ color }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12ZM14.1078 7.45033L13.0428 10.7803C13.1068 10.8006 13.1705 10.8208 13.2338 10.8411L14.6805 11.2931C14.8839 11.361 15.0911 11.425 15.2983 11.4891C15.5056 11.5531 15.7128 11.6172 15.9162 11.685C15.9637 11.7008 16.0139 11.7164 16.0655 11.7325C16.4564 11.8543 16.9329 12.0027 16.9862 12.4686C17.0314 12.8454 16.6848 13.1166 16.4135 13.3125C16.3231 13.3803 16.2327 13.4444 16.1423 13.5084C16.0518 13.5725 15.9614 13.6365 15.871 13.7043C15.7203 13.8098 15.5734 13.9191 15.4264 14.0284C15.2795 14.1376 15.1326 14.2469 14.9819 14.3524C14.801 14.4805 14.6239 14.6123 14.4469 14.7442C14.2698 14.8761 14.0927 15.0079 13.9119 15.136C13.7311 15.2716 13.5462 15.4075 13.3616 15.5431C13.1771 15.6786 12.9926 15.8142 12.8118 15.9498C12.646 16.0703 12.484 16.1909 12.322 16.3114C12.16 16.432 11.998 16.5526 11.8322 16.6731C11.7117 16.756 11.5949 16.8427 11.4781 16.9293C11.3613 17.016 11.2445 17.1026 11.124 17.1855C10.8075 17.4116 10.4609 17.6376 10.0841 17.3965C9.96357 17.3211 9.85808 17.2157 9.7978 17.08C9.73752 16.9444 9.73751 16.7937 9.75258 16.6581C9.77268 16.5174 9.81956 16.3768 9.86645 16.2361C9.88989 16.1658 9.91333 16.0955 9.93343 16.0251L10.2047 15.1661C10.2574 15.0079 10.3064 14.8497 10.3554 14.6914C10.4044 14.5332 10.4533 14.375 10.5061 14.2167C10.5438 14.0886 10.5852 13.9605 10.6266 13.8324C10.6681 13.7044 10.7095 13.5763 10.7472 13.4482C10.7902 13.3479 10.8195 13.2476 10.8482 13.1474C10.7634 13.122 10.6875 13.0967 10.6115 13.0714C10.4082 13.0036 10.2082 12.9395 10.0086 12.8755C9.80898 12.8115 9.60934 12.7474 9.40594 12.6796C9.17992 12.6043 8.95382 12.5327 8.7278 12.4611C8.50175 12.3895 8.27569 12.3179 8.04964 12.2426C7.89894 12.1823 7.74824 12.1371 7.59754 12.0919C7.31121 12.0015 7.07009 11.8206 7.02488 11.5042C7.00981 11.4589 7.00981 11.4137 7.00981 11.3685C7.00981 10.9628 7.30851 10.7519 7.60451 10.5429C7.62737 10.5268 7.65021 10.5107 7.67289 10.4945C7.80853 10.3965 7.94793 10.2948 8.08733 10.1931C8.22672 10.0913 8.36611 9.98962 8.50174 9.89167C8.58469 9.83195 8.66695 9.77293 8.74859 9.71434C9.03777 9.50685 9.31981 9.30449 9.60185 9.09296L10.7773 8.23397C10.9581 8.10588 11.139 7.97401 11.3198 7.84215C11.5007 7.71029 11.6815 7.57842 11.8623 7.45033C12.1185 7.25444 12.3898 7.05849 12.6611 6.8626C12.7213 6.82493 12.7779 6.78347 12.8344 6.74203C12.8909 6.70059 12.9474 6.65915 13.0077 6.62148C13.2036 6.50092 13.5502 6.4105 13.8667 6.65162C14.2735 6.96809 14.1078 7.45033 14.1078 7.45033Z"
      fill="currentColor"
    />
  </svg>
);

// ----- ИКОНКА «СЕРДЦЕ» (ПОЛНОЕ ОПРЕДЕЛЕНИЕ) -----
const IconHeart = ({ color }: { color: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ color }}
  >
    <path
      d="M18.675 9.86365C17.545 9.86365 16.535 10.4137 15.905 11.2537C15.275 10.4137 14.265 9.86365 13.135 9.86365C11.225 9.86365 9.67498 11.4237 9.67498 13.3437C9.67498 14.0837 9.79498 14.7737 9.99498 15.4037C10.975 18.5136 14.015 20.3836 15.515 20.8937C15.725 20.9636 16.075 20.9636 16.285 20.8937C17.785 20.3836 20.825 18.5237 21.805 15.4037C22.015 14.7637 22.125 14.0837 22.125 13.3437C22.135 11.4237 20.585 9.86365 18.675 9.86365Z"
      fill="currentColor"
    />
    <path
      d="M20.625 8.29365C20.625 8.52365 20.395 8.67365 20.175 8.61365C18.825 8.26365 17.345 8.55365 16.225 9.35365C16.005 9.51365 15.705 9.51365 15.495 9.35365C14.705 8.77365 13.745 8.45365 12.735 8.45365C10.155 8.45365 8.05498 10.5637 8.05498 13.1637C8.05498 15.9837 9.40498 18.0936 10.765 19.5036C10.835 19.5736 10.775 19.6937 10.685 19.6537C7.95498 18.7236 1.87498 14.8637 1.87498 8.29365C1.87498 5.39365 4.20498 3.05365 7.08498 3.05365C8.79498 3.05365 10.305 3.87365 11.255 5.14365C12.215 3.87365 13.725 3.05365 15.425 3.05365C18.295 3.05365 20.625 5.39365 20.625 8.29365Z"
      fill="currentColor"
    />
  </svg>
);

export default function TokenPreview({ tokens, onReset }: Props) {
  const bg = tokens.background;
  const txt = tokens.text;
  const btn = tokens.buttons;
  const icons = tokens.icons;
  const status = tokens.status;

  const [buttonStates, setButtonStates] = useState<
    Record<string, "default" | "hover" | "active">
  >({
    primary: "default",
    outline: "default",
    inverse: "default",
  });

  const getButtonStyle = (type: "primary" | "outline" | "inverse") => {
    const state = buttonStates[type];
    let key: string;
    if (state === "active") {
      key =
        type === "primary"
          ? "fill-border-active"
          : type === "outline"
            ? "border-text-active"
            : "text-active";
    } else if (state === "hover") {
      key =
        type === "primary"
          ? "fill-border-hover"
          : type === "outline"
            ? "border-text-hover"
            : "text-hover";
    } else {
      key =
        type === "primary"
          ? "fill-border-default"
          : type === "outline"
            ? "border-text-default"
            : "text-default";
    }

    if (type === "primary") {
      return {
        background: getColor(btn.primary[key as keyof typeof btn.primary]),
        color: getColor(btn.primary.text),
      };
    }
    if (type === "outline") {
      return {
        background: getColor(btn.outline.fill),
        borderColor: getColor(btn.outline[key as keyof typeof btn.outline]),
        color: getColor(btn.outline[key as keyof typeof btn.outline]),
      };
    }
    return {
      background: getColor(btn.inverse.fill),
      color: getColor(btn.inverse[key as keyof typeof btn.inverse]),
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Кастомизация цветов
        </h2>
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50"
          style={{
            borderColor: getColor(bg.border),
            color: getColor(txt.primary),
          }}
        >
          <RotateCcw size={14} /> Сбросить цвета
        </button>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <h3 className="mb-3 text-base font-semibold text-foreground">Фоны</h3>
        <div className="grid grid-cols-2 gap-3">
          <Swatch label="Globe" color={getColor(bg.globe)} />
          <Swatch label="Island" color={getColor(bg.island)} border />
          <Swatch label="Island Inner" color={getColor(bg["island-inner"])} />
          <Swatch label="Accent" color={getColor(bg.accent)} />
          <Swatch label="Border" color={getColor(bg.border)} />
          <Swatch label="Modal" color={getColor(bg.modal)} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <h3 className="mb-4 text-base font-semibold text-foreground">Кнопки</h3>
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Primary</p>
          <div className="flex flex-wrap items-center gap-2">
            <button className="h-9 min-w-[80px] rounded-md px-4 text-sm font-medium" style={{ background: getColor(btn.primary["fill-border-default"]), color: getColor(btn.primary.text) }}>Default</button>
            <button className="h-9 min-w-[80px] rounded-md px-4 text-sm font-medium" style={{ background: getColor(btn.primary["fill-border-hover"]), color: getColor(btn.primary.text) }}>Hover</button>
            <button className="h-9 min-w-[80px] rounded-md px-4 text-sm font-medium" style={{ background: getColor(btn.primary["fill-border-active"]), color: getColor(btn.primary.text) }}>Active</button>
            <button className="h-9 min-w-[80px] rounded-md px-4 text-sm font-medium opacity-50" style={{ background: getColor(btn.primary["fill-border-disabled"]), color: getColor(btn.primary.text) }}>Disabled</button>
            <div className="ml-4 flex items-center gap-2 border-l border-border pl-4">
              <button className="h-9 min-w-[120px] rounded-md px-4 text-sm font-medium transition-colors" style={getButtonStyle("primary")} onMouseEnter={() => setButtonStates((prev) => ({ ...prev, primary: "hover" }))} onMouseLeave={() => setButtonStates((prev) => ({ ...prev, primary: "default" }))} onMouseDown={() => setButtonStates((prev) => ({ ...prev, primary: "active" }))} onMouseUp={() => setButtonStates((prev) => ({ ...prev, primary: "hover" }))}>Интерактивный пример кнопки</button>
              <span className="min-w-[90px] text-xs text-muted-foreground">{buttonStates.primary === "default" ? "По умолчанию" : buttonStates.primary === "hover" ? "При наведении" : "При нажатии"}</span>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Outline</p>
          <div className="flex flex-wrap items-center gap-2">
            <button className="h-9 min-w-[80px] rounded-md border px-4 text-sm font-medium" style={{ background: getColor(btn.outline.fill), borderColor: getColor(btn.outline["border-text-default"]), color: getColor(btn.outline["border-text-default"]) }}>Default</button>
            <button className="h-9 min-w-[80px] rounded-md border px-4 text-sm font-medium" style={{ background: getColor(btn.outline.fill), borderColor: getColor(btn.outline["border-text-hover"]), color: getColor(btn.outline["border-text-hover"]) }}>Hover</button>
            <button className="h-9 min-w-[80px] rounded-md border px-4 text-sm font-medium" style={{ background: getColor(btn.outline.fill), borderColor: getColor(btn.outline["border-text-active"]), color: getColor(btn.outline["border-text-active"]) }}>Active</button>
            <button className="h-9 min-w-[80px] rounded-md border px-4 text-sm font-medium opacity-50" style={{ background: getColor(btn.outline.fill), borderColor: getColor(btn.outline["border-text-disabled"]), color: getColor(btn.outline["border-text-disabled"]) }}>Disabled</button>
            <div className="ml-4 flex items-center gap-2 border-l border-border pl-4">
              <button className="h-9 min-w-[120px] rounded-md border px-4 text-sm font-medium transition-colors" style={getButtonStyle("outline")} onMouseEnter={() => setButtonStates((prev) => ({ ...prev, outline: "hover" }))} onMouseLeave={() => setButtonStates((prev) => ({ ...prev, outline: "default" }))} onMouseDown={() => setButtonStates((prev) => ({ ...prev, outline: "active" }))} onMouseUp={() => setButtonStates((prev) => ({ ...prev, outline: "hover" }))}>Интерактивный пример кнопки</button>
              <span className="min-w-[90px] text-xs text-muted-foreground">{buttonStates.outline === "default" ? "По умолчанию" : buttonStates.outline === "hover" ? "При наведении" : "При нажатии"}</span>
            </div>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Inverse</p>
          <div className="flex flex-wrap items-center gap-2">
            <button className="h-9 min-w-[80px] rounded-md px-4 text-sm font-medium" style={{ background: getColor(btn.inverse.fill), color: getColor(btn.inverse["text-default"]) }}>Default</button>
            <button className="h-9 min-w-[80px] rounded-md px-4 text-sm font-medium" style={{ background: getColor(btn.inverse.fill), color: getColor(btn.inverse["text-hover"]) }}>Hover</button>
            <button className="h-9 min-w-[80px] rounded-md px-4 text-sm font-medium" style={{ background: getColor(btn.inverse.fill), color: getColor(btn.inverse["text-active"]) }}>Active</button>
            <button className="h-9 min-w-[80px] rounded-md px-4 text-sm font-medium opacity-50" style={{ background: getColor(btn.inverse.fill), color: getColor(btn.inverse["text-disabled"]) }}>Disabled</button>
            <div className="ml-4 flex items-center gap-2 border-l border-border pl-4">
              <button className="h-9 min-w-[120px] rounded-md px-4 text-sm font-medium transition-colors" style={getButtonStyle("inverse")} onMouseEnter={() => setButtonStates((prev) => ({ ...prev, inverse: "hover" }))} onMouseLeave={() => setButtonStates((prev) => ({ ...prev, inverse: "default" }))} onMouseDown={() => setButtonStates((prev) => ({ ...prev, inverse: "active" }))} onMouseUp={() => setButtonStates((prev) => ({ ...prev, inverse: "hover" }))}>Интерактивный пример кнопки</button>
              <span className="min-w-[90px] text-xs text-muted-foreground">{buttonStates.inverse === "default" ? "По умолчанию" : buttonStates.inverse === "hover" ? "При наведении" : "При нажатии"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <h3 className="mb-3 text-base font-semibold text-foreground">Текст</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 rounded-lg p-4" style={{ background: getColor(bg.island) }}>
            <p className="text-xs font-medium text-muted-foreground">Primary</p>
            <p style={{ color: getColor(txt.primary) }} className="text-sm font-medium">Основной текст</p>
            <p style={{ color: getColor(txt.secondary) }} className="text-sm">Дополнительный текст</p>
            <p style={{ color: getColor(txt.teritary) }} className="text-sm">Третичный текст</p>
            <a href="#" style={{ color: getColor(txt.link) }} className="text-sm underline">Ссылка</a>
          </div>
          <div className="space-y-2 rounded-lg p-4" style={{ background: getColor(bg.accent) }}>
            <p className="text-xs font-medium" style={{ color: getColor(txt["primary-inverse"]) }}>Inverse</p>
            <p style={{ color: getColor(txt["primary-inverse"]) }} className="text-sm font-medium">Основной текст</p>
            <p style={{ color: getColor(txt["secondary-inverse"]) }} className="text-sm">Дополнительный текст</p>
            <p style={{ color: getColor(txt["teritary-inverse"]) }} className="text-sm">Третичный текст</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 rounded-xl border border-border bg-background p-4">
          <h3 className="mb-3 text-base font-semibold text-foreground">Иконки</h3>
          <div className="flex gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium opacity-60">Primary</span>
              <div className="flex items-center gap-1 rounded-lg p-1.5" style={{ background: getColor(bg.island) }}>
                <IconStar color={getColor(icons.primary)} />
                <IconHeart color={getColor(icons.primary)} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium opacity-60">Inverse</span>
              <div className="flex items-center gap-1 rounded-lg p-3" style={{ background: getColor(bg.accent) }}>
                <IconStar color={getColor(icons["primary-inverse"])} />
                <IconHeart color={getColor(icons["primary-inverse"])} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 rounded-xl border border-border bg-background p-4">
          <h3 className="mb-6 text-base font-semibold text-foreground">Статусы</h3>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge label="Warning" color={getColor(status.warning)} />
            <StatusBadge label="Danger" color={getColor(status.danger)} />
            <StatusBadge label="Success" color={getColor(status.success)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Swatch({
  label,
  color,
  light,
  border,
}: {
  label: string;
  color: string;
  light?: boolean;
  border?: boolean;
}) {
  const textColor = light ? "#ffffff" : "#000000";
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-10 shrink-0 rounded-lg"
        style={{
          background: color,
          border: border ? "1px solid #e5e5e5" : undefined,
        }}
      />
      <div>
        <p className="text-xs font-medium" style={{ color: textColor }}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground font-mono">{color}</p>
      </div>
    </div>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white"
      style={{ background: color }}
    >
      {label}
    </span>
  );
}
