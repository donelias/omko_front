import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getDefaultSchemaMarkup } from '@/utils/helperFunction';
import { store } from '@/redux/store';

// Map language codes to Open Graph locale codes
// This ensures social media platforms display the correct language
// Note: Open Graph requires specific locale formats (e.g., hi_IN, ur_PK)
// This mapping can be extended as new languages are added
const getLocaleFromLangCode = (langCode) => {
  if (!langCode) return 'en_US';

  const langLower = langCode.toLowerCase();

  // Common locale mappings for Open Graph
  // These follow the pattern: languageCode_COUNTRYCODE
  const localeMap = {
    'en': 'en_US',
    'hi': 'hi_IN',
    'ur': 'ur_PK',
    'ky': 'ky_KG',
    'ru': 'ru_RU',
    'ar': 'ar_SA'
    // Add more languages as needed - this is dynamic and can be extended
  };

  // If we have a mapping, use it
  if (localeMap[langLower]) {
    return localeMap[langLower];
  }

  // For unknown languages, try to create a locale code
  // Default pattern: langCode + '_US' (can be customized per language)
  // This makes it flexible for new languages without hardcoding
  return `${langLower}_US`;
};

const MetaData = ({
  // Basic SEO
  title = process.env.NEXT_PUBLIC_META_TITLE,
  description = process.env.NEXT_PUBLIC_META_DESCRIPTION,
  keywords = process.env.NEXT_PUBLIC_META_KEYWORD,
  author = process.env.NEXT_PUBLIC_APPLICATION_NAME, // Using app name as author
  language = 'es',
  pageName = '',

  // Open Graph / Facebook - Using same as basic meta for consistency
  ogTitle = title,
  ogDescription = description,
  ogImage = '/favicon.ico', // Using favicon as default OG image
  ogUrl = null,
  siteName = process.env.NEXT_PUBLIC_META_TITLE,

  // Twitter
  twitterCard = 'summary_large_image',
  twitterTitle = null, // Will default to translated title if not provided
  twitterDescription = null, // Will default to translated description if not provided
  twitterImage = '/favicon.ico',
  twitterSite = `@${process.env.NEXT_PUBLIC_META_TITLE}`,
  twitterCreator = `@${process.env.NEXT_PUBLIC_META_TITLE}`,

  // Additional SEO
  canonicalUrl = null,
  robots = 'index, follow',
  themeColor = '#000000',

  // Structured Data
  structuredData = null,

  // Multi-language: list of supported lang codes for hreflang alternates
  languages = null,
  defaultLang = 'es',

  // PWA
  manifestUrl = '/manifest.json',
  appleTouchIcon = '/apple-touch-icon.png',
  favicon = null, // Custom favicon from SEO settings
}) => {
  // Get router to access language parameter from URL
  // This works on both client and server side in Next.js
  const router = useRouter();

  // Detect language from URL parameter (?lang=) or use provided language prop
  const detectedLang = router?.query?.lang || language || 'es';
  const langCode = typeof detectedLang === 'string' ? detectedLang.toLowerCase() : 'es';

  // Get Open Graph locale based on detected language
  const ogLocale = getLocaleFromLangCode(langCode);

  // Ensure all values are strings and not undefined/null for proper SSR
  const state = store.getState()?.WebSetting;
  const serverFavicon = state.data?.web_favicon;
  const webFavicon = serverFavicon || '/favicon.ico';

  // Ensure all string values are properly set (no undefined/null)
  const safeTitle = title || process.env.NEXT_PUBLIC_META_TITLE || 'Omko';
  const safeDescription = description || process.env.NEXT_PUBLIC_META_DESCRIPTION || '';
  const safeKeywords = keywords || process.env.NEXT_PUBLIC_META_KEYWORD || '';
  const safeAuthor = author || process.env.NEXT_PUBLIC_APPLICATION_NAME || 'Omko';

  // For Open Graph and Twitter: Use translated title/description if ogTitle/ogDescription not explicitly provided
  const safeOgTitle = ogTitle !== null ? (ogTitle || safeTitle) : safeTitle;
  const safeOgDescription = ogDescription !== null ? (ogDescription || safeDescription) : safeDescription;
  const safeOgImage = ogImage || '/favicon.ico';

  // Build URL with language parameter for proper social media sharing
  const baseUrl = (process.env.NEXT_PUBLIC_WEB_URL || '').replace(/\/$/, '');

  // Normalize the path: strip any leading/trailing slash and remove the ?lang= param.
  const rawPath = (pageName || '').trim();
  const pathWithQuery = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  const [cleanPath, existingQuery] = pathWithQuery.split('?');
  const pathSegments = cleanPath.split('/').filter(Boolean).join('/');
  const normalizedPageName = pathSegments ? `/${pathSegments}` : '/';

  // Build a language-tagged URL for a given lang code.
  const buildLangUrl = (lang) => {
    const params = new URLSearchParams(existingQuery || '');
    params.set('lang', lang);
    return `${baseUrl}${normalizedPageName}?${params.toString()}`;
  };

  // Canonical: always the current-language, absolute URL (unique per language variant).
  const safeCanonicalUrl = canonicalUrl || buildLangUrl(langCode);

  // og:url — always the current-language absolute URL (no SEO flag gating).
  const safeOgUrl = ogUrl || buildLangUrl(langCode);

  // hreflang alternates — every supported language + x-default.
  const supportedLangs = languages && languages.length
    ? languages
    : Array.from(new Set([langCode, defaultLang, 'es', 'en'])).filter(Boolean);
  const xDefaultLang = supportedLangs.includes(defaultLang) ? defaultLang : supportedLangs[0];
  const hreflangAlternates = supportedLangs.map((lang) => buildLangUrl(lang));

  const safeSiteName = siteName || process.env.NEXT_PUBLIC_META_TITLE || 'Omko';

  // Twitter tags should match Open Graph tags for consistency
  const safeTwitterTitle = twitterTitle !== null ? (twitterTitle || safeOgTitle) : safeOgTitle;
  const safeTwitterDescription = twitterDescription !== null ? (twitterDescription || safeOgDescription) : safeOgDescription;
  const safeTwitterImage = twitterImage || safeOgImage;

  // Parse structured data if it's a string
  // Handle both server-side (object) and client-side (string) cases
  let parsedStructuredData = structuredData;
  if (typeof structuredData === 'string') {
    try {
      parsedStructuredData = JSON.parse(structuredData);
    } catch (error) {
      console.error('Error parsing structured data:', error);
      parsedStructuredData = getDefaultSchemaMarkup();
    }
  }

  // Serialize JSON-LD with the standard Next.js-safe escaping so that a literal
  // `</script>` inside any string value cannot close the script tag early and
  // enable a stored-XSS injection via an unsanitized `schema_markup` field.
  // The unicode escapes are equivalent to the literal characters in JSON, so
  // search engines still parse the structured data correctly.
  const serializeJsonLd = (obj) =>
    JSON.stringify(obj)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026');

  return (
    <Head>
      {/* Basic SEO - Always render with safe values for SSR */}
      <title>{safeTitle}</title>
      <meta name="description" content={safeDescription} />
      <meta name="keywords" content={safeKeywords} />
      <meta name="author" content={safeAuthor} />
      <meta name="robots" content={robots} />
      <meta name="language" content={language} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={safeOgTitle} />
      <meta property="og:description" content={safeOgDescription} />
      <meta property="og:image" content={safeOgImage} />
      <meta property="og:url" content={safeOgUrl} />
      <meta property="og:site_name" content={safeSiteName} />
      {/* Dynamic locale based on detected language - ensures social media shows correct language */}
      <meta property="og:locale" content={ogLocale} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={safeTwitterTitle} />
      <meta name="twitter:description" content={safeTwitterDescription} />
      <meta name="twitter:image" content={safeTwitterImage} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:creator" content={twitterCreator} />

      {/* Canonical URL */}
      <link rel="canonical" href={safeCanonicalUrl} />

      {/* hreflang alternates — one per supported language + x-default */}
      {supportedLangs.map((lang) => (
        <link
          key={`hreflang-${lang}`}
          rel="alternate"
          hreflang={lang}
          href={buildLangUrl(lang)}
        />
      ))}
      <link rel="alternate" hreflang="x-default" href={buildLangUrl(xDefaultLang)} />

      {/* Theme Color */}
      <meta name="theme-color" content={themeColor} />

      {/* PWA */}
      <link rel="manifest" href={manifestUrl} />
      <link rel="apple-touch-icon" href={appleTouchIcon} />
      <link rel="icon" href={webFavicon} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={safeTitle} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Structured Data */}
      {parsedStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(parsedStructuredData) }}
          key="structured-data"
        />
      )}
    </Head>
  );
};

export default MetaData;
