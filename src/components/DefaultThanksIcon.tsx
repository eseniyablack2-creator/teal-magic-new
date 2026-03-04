import { ColorTokens } from "@/lib/colorGenerator";
import { ThanksIcon } from "@/components/icons/ThanksIcon";

interface DefaultThanksIconProps {
  tokens: ColorTokens;
  size?: number;
}

export default function DefaultThanksIcon({
  tokens,
  size = 48,
}: DefaultThanksIconProps) {
  const icons = tokens.icons;

  const getColor = (val: { value: string | object }): string => {
    return typeof val.value === "string" ? val.value : "transparent";
  };

  return (
    <ThanksIcon size={size} color={getColor(icons.primary)} />
  );
}
