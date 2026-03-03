import { useTranslation } from "react-i18next";
import cs from "classnames";
import { BannerDtoType } from "common/types/server-api-dtos";
import { useCustomizationStore } from "common/services/customizations-service/service-store/service-store";
import { customizationsServiceBannersSelector } from "common/services/customizations-service/service-store/selectors";
import { Paper } from "ui-kit/paper";
import { Box } from "ui-kit/box";
import { Typography } from "ui-kit/typography";
import { LazyImage } from "ui-kit/lazy-image";
import { Icon } from "ui-kit/icon";
import { CoinsIcon } from "./icons";
import { TextWithCurrencyName } from "common/components/text-with-currency-name";
import { CurrencyIcon } from "common/components/currency-icon";
import { useBreakpoints } from "common/hooks/use-breakpoints";
import { checkEqual } from "common/helpers/checkEqual";
import { openNewTab } from "common/helpers/open-new-tab";
import { FILE_END_POINT } from "common/constants/common";
import styles from "./banner.module.scss";

const openLinkHandler = (link: string | null) =>
  link ? () => openNewTab(link) : undefined;

const DefaultBanner = () => {
  const { t } = useTranslation();

  return (
    <Paper className={styles.defaultBanner}>
      <div className={styles.textBlock}>
        <Typography className={styles.title} variant="h0" component="h1">
          {t("banner.title")}
        </Typography>
        <TextWithCurrencyName
          className={styles.subtitle}
          variant="h5"
          variantLg="h3"
          component="p"
          translationKey={t("banner.subtitle")}
        />
        <TextWithCurrencyName
          variant="body-s"
          variantLg="body-l"
          translationKey={t("banner.description")}
        />
      </div>

      <div className={styles.iconWrapper}>
        <Icon
          className={styles.icon}
          customWidth="100%"
          customHeight="100%"
          viewBox="0 0 474 259"
          component={CoinsIcon}
        />
        <div className={styles.currencyIconWrapper}>
          <CurrencyIcon width={4.25} color="contrast" />
        </div>
      </div>
    </Paper>
  );
};

type BannerProps = {
  banner: BannerDtoType;
};

const CustomBanner = ({ banner }: BannerProps) => {
  return (
    <Paper
      className={cs(styles.customBanner, {
        [styles.overlay]: banner.overlayEnabled,
        [styles.link]: !!banner.link,
      })}
      style={{
        backgroundImage: banner.backgroundImage
          ? `url("${FILE_END_POINT}/${banner.backgroundImage.fullPath}")`
          : undefined,
      }}
      onClick={openLinkHandler(banner.link)}
    >
      <div className={styles.content}>
        {banner.title?.text && (
          <Typography
            className={styles.title}
            variant="h2"
            variantMd="h0"
            component="h1"
            style={{ color: banner.title?.color || undefined }}
          >
            {`${banner.title.text}`}
          </Typography>
        )}
        {banner.body?.text && (
          <Typography
            className={cs({ [styles.textMarginTop]: banner.title?.text })}
            variant="body-s"
            variantMd="body-l"
            style={{ color: banner?.body?.color || undefined }}
          >
            {`${banner.body.text}`}
          </Typography>
        )}
      </div>

      {banner.mainImage && (
        <Box className={styles.mainImageWrapper} position="relative">
          <LazyImage
            className={styles.mainImage}
            src={`${FILE_END_POINT}/${banner.mainImage.fullPath}`}
          />
        </Box>
      )}
    </Paper>
  );
};

const ImageBanner = ({ banner }: BannerProps) => {
  const { isSmallMobile } = useBreakpoints("small-mobile");

  return (
    <LazyImage
      className={cs(styles.imageBanner, {
        [styles.notMobileImage]: !isSmallMobile,
        [styles.link]: !!banner.link,
      })}
      src={`${FILE_END_POINT}/${isSmallMobile ? banner.mobileImage?.fullPath : banner.backgroundImage?.fullPath}`}
      onClick={openLinkHandler(banner.link)}
    />
  );
};

export const Banner = () => {
  const banners = useCustomizationStore(
    customizationsServiceBannersSelector,
    checkEqual,
  );

  if (!banners.length) return <DefaultBanner />;

  const bannerToDisplay = banners[0];

  const isImageBanner =
    bannerToDisplay.mobileImage && bannerToDisplay.backgroundImage;

  return isImageBanner ? (
    <ImageBanner banner={bannerToDisplay} />
  ) : (
    <CustomBanner banner={bannerToDisplay} />
  );
};
