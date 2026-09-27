/**
 * Single configuration point for owner-verified links and contact details.
 *
 * Store URLs are NOT yet verified — they are intentionally empty. When the
 * owner provides the official App Store / Google Play links, fill them in here
 * and the download buttons across the site will activate automatically.
 * Until then the buttons render honestly as "Tezliklə" (coming soon).
 */
export const siteConfig = {
  /** Official App Store URL. Empty = not verified yet. */
  appStoreUrl: "",
  /** Official Google Play URL. Empty = not verified yet. */
  googlePlayUrl: "",
  /**
   * Support email. Found in the Flutter app's own privacy-policy text
   * (lib/l10n/app_az.arb -> privacyPolicyContent), so it is product-source
   * verified. Owner should still confirm it is monitored.
   */
  supportEmail: "support@oyna.app",
} as const;

export const hasStoreLinks =
  siteConfig.appStoreUrl.length > 0 && siteConfig.googlePlayUrl.length > 0;
