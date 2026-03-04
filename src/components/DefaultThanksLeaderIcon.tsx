import { ColorTokens } from "@/lib/colorGenerator";
import { ThanksLeaderIcon } from "@/components/icons/ThanksLeaderIcon";

interface DefaultThanksLeaderIconProps {
  tokens: ColorTokens;
  size?: number;
}

export default function DefaultThanksLeaderIcon({
  tokens,
  size = 48,
}: DefaultThanksLeaderIconProps) {
  const icons = tokens.icons;

  const getColor = (val: { value: string | object }): string => {
    return typeof val.value === "string" ? val.value : "transparent";
  };

  return (
    <ThanksLeaderIcon size={size} color={getColor(icons.primary)} />
  );
}
