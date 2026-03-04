import { ColorTokens } from "@/lib/colorGenerator";
import { CurrencyCircleIcon } from "@/components/icons/CurrencyCircleIcon";

interface DefaultCurrencyIconProps {
  tokens: ColorTokens;
  size?: number;
}

export default function DefaultCurrencyIcon({
  tokens,
  size = 48,
}: DefaultCurrencyIconProps) {
  const icons = tokens.icons;

  const getColor = (val: { value: string | object }): string => {
    return typeof val.value === "string" ? val.value : "transparent";
  };

  return (
    <CurrencyCircleIcon size={size} color={getColor(icons.primary)} />
  );
}
