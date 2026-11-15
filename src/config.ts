/**
 * Single configuration point for owner-verified links and contact details.
 *
 * Official App Store and Google Play URLs. Download buttons across the site
 * read these values and open the store pages in a new tab.
 */
export const siteConfig = {
  /** Official App Store URL. */
  appStoreUrl: "https://apps.apple.com/az/app/oyna-i-nternet-klub-rezervi/id6815271415" as string,
  /** Official Google Play URL. */
  googlePlayUrl: "https://play.google.com/store/apps/details?id=com.oynaaz.app" as string,
  /**
   * Support email. Found in the Flutter app's own privacy-policy text
   * (lib/l10n/app_az.arb -> privacyPolicyContent), so it is product-source
   * verified. Owner should still confirm it is monitored.
   */
  supportEmail: "support@oyna.site",
} as const;

export const hasStoreLinks =
  siteConfig.appStoreUrl.length > 0 && siteConfig.googlePlayUrl.length > 0;
