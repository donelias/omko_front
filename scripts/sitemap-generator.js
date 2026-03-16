const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

// Validate essential environment variables
const validateEnvironment = () => {
  const requiredVars = [
    'NEXT_PUBLIC_WEB_URL',
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_END_POINT'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate URL format
  try {
    new URL(process.env.NEXT_PUBLIC_WEB_URL);
    new URL(process.env.NEXT_PUBLIC_API_URL);
  } catch (error) {
    throw new Error(`Invalid URL format in environment variables: ${error.message}`);
  }
}

/**
 * Static routes configuration with SEO metadata
 * Priority levels: 1.0 (highest) -> 0.1 (lowest)
 * Change frequency: always, hourly, daily, weekly, monthly, yearly, never
 */
const staticRoutes = [
  // Core pages - Highest priority
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/properties/', priority: 0.9, changefreq: 'daily' },
  { path: '/projects/', priority: 0.9, changefreq: 'daily' },
  { path: '/search/', priority: 0.9, changefreq: 'daily' },

  // Secondary pages - High priority
  { path: '/projects/featured-projects/', priority: 0.8, changefreq: 'weekly' },
  { path: '/properties-on-map/', priority: 0.8, changefreq: 'weekly' },
  { path: '/all/categories/', priority: 0.8, changefreq: 'weekly' },
  { path: '/all/agents/', priority: 0.8, changefreq: 'weekly' },
  { path: '/all/articles/', priority: 0.8, changefreq: 'weekly' },

  // Informational pages - Medium priority
  { path: '/about-us/', priority: 0.7, changefreq: 'monthly' },
  { path: '/contact-us/', priority: 0.7, changefreq: 'monthly' },
  { path: '/subscription-plan/', priority: 0.7, changefreq: 'monthly' },
  { path: '/faqs/', priority: 0.6, changefreq: 'monthly' },

  // Legal pages - Lower priority
  { path: '/privacy-policy/', priority: 0.5, changefreq: 'yearly' },
  { path: '/terms-and-conditions/', priority: 0.5, changefreq: 'yearly' }
];

// This will be set after fetching settings
let defaultLanguageCode = '';
let defaultLanguageId = '';

/**
 * Generates optimized XML URL entry with hreflang alternate links
 * @param {string} path - URL path without domain
 * @param {number} priority - Priority value (0.0 - 1.0)
 * @param {string} changefreq - Change frequency
 * @param {Date} lastmod - Last modification date (optional)
 * @param {Array} languages - Array of language objects from settings
 * @returns {string} XML URL entry with hreflang alternates
 */
const generateUrlEntry = (path, priority = 0.5, changefreq = 'weekly', lastmod = null, languages = []) => {
  // Normalize path - remove leading slash if present
  const normalizedPath = path ? path.replace(/^\/+/, '') : '';

  // Build base URL with path
  const baseUrl = normalizedPath
    ? `${process.env.NEXT_PUBLIC_WEB_URL}/${normalizedPath}`
    : `${process.env.NEXT_PUBLIC_WEB_URL}`;

  // ✅ Encode the entire URL to handle Unicode characters
  const encodeUrl = (url) => {
    try {
      // Split URL into parts to encode path while preserving structure
      const urlObj = new URL(url);
      // Encode pathname (handles Hindi/Unicode characters)
      urlObj.pathname = urlObj.pathname
        .split('/')
        .map(segment => encodeURIComponent(decodeURIComponent(segment)))
        .join('/');
      return urlObj.toString();
    } catch (error) {
      // Fallback: encode entire URL
      return encodeURI(url);
    }
  };

  // Escape special XML characters helper
  const escapeXml = (url) => url
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Add query-based language parameter for canonical URL (default language)
  const canonicalUrl = `${baseUrl}?lang=${defaultLanguageCode}`;
  // ✅ First encode Unicode, then escape XML characters
  const escapedCanonicalUrl = escapeXml(encodeUrl(canonicalUrl));

  // Use provided lastmod or current date
  const lastModified = lastmod ? lastmod.toISOString() : new Date().toISOString();

  // Validate priority range
  const validPriority = Math.max(0.0, Math.min(1.0, priority)).toFixed(1);

  // Generate hreflang alternate links for all languages
  const uniqueLanguages = languages
    .filter(lang => lang.code && lang.code.trim() !== '')
    .filter((lang, index, self) =>
      index === self.findIndex(l => l.code === lang.code)
    );

  const hreflangs = uniqueLanguages
    .map(lang => {
      const langUrl = `${baseUrl}?lang=${lang.code}`;
      // ✅ Encode and escape each language URL
      const escapedLangUrl = escapeXml(encodeUrl(langUrl));

      return `    <xhtml:link rel="alternate" hreflang="${lang.code}" href="${escapedLangUrl}" />`;
    })
    .join('\n');

  // Add x-default pointing to default language
  const xDefaultUrl = `${baseUrl}?lang=${defaultLanguageCode}`;
  const escapedXDefaultUrl = escapeXml(encodeUrl(xDefaultUrl));

  return `  <url>
    <loc>${escapedCanonicalUrl}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${validPriority}</priority>
${hreflangs}
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapedXDefaultUrl}" />
  </url>`;
}

const fetchSettings = async () => {
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}web-settings`;
    const response = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw new Error(`Failed to fetch settings: ${error.message}`);
  }
}

/**
 * Fetches all pages from paginated API
 * @param {string} endpoint - API endpoint
 * @param {object} headers - Request headers
 * @param {number} limit - Items per page
 * @returns {Promise<Array>} All items from all pages
 */
const fetchAllPages = async (endpoint, headers = {}, limit = 100) => {
  let allItems = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await axios.get(endpoint, {
        params: { limit, offset },
        headers
      });

      const data = response.data?.data || response.data;

      if (Array.isArray(data) && data.length > 0) {
        allItems = [...allItems, ...data];
        offset += limit;

        // Check if we got fewer items than requested (last page)
        if (data.length < limit) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(`Error fetching page at offset ${offset}:`, error.message);
      hasMore = false;
    }
  }

  return allItems;
}

/**
 * Dynamic route configurations with SEO metadata
 */
const getDynamicRouteConfigs = () => [
  {
    name: 'Properties',
    route: '/property-details/[slug]/',
    apiEndpoint: `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-property-list`,
    pathExtractor: (item) => item?.slug_id,
    priority: 0.8,
    changefreq: 'weekly'
  },
  // {
  //   name: 'Projects',
  //   route: '/project-details/[slug]/',
  //   apiEndpoint: `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-projects`,
  //   pathExtractor: (item) => item?.slug_id,
  //   priority: 0.8,
  //   changefreq: 'weekly'
  // },
  {
    name: 'Articles',
    route: '/article-details/[slug]/',
    apiEndpoint: `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get_articles`,
    pathExtractor: (item) => item?.slug_id,
    priority: 0.7,
    changefreq: 'monthly'
  },
  {
    name: 'Agents',
    route: '/agent-details/[slug]/',
    apiEndpoint: `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}agent-list`,
    pathExtractor: (item) => item?.slug_id,
    priority: 0.7,
    changefreq: 'monthly'
  }
];

// Function to fetch dynamic routes from APIs
const fetchDynamicRoutes = async () => {
  const allRoutes = [];

  for (const config of getDynamicRouteConfigs()) {
    try {
      console.log(`Fetching ${config.name}...`);

      const allItems = await fetchAllPages(config.apiEndpoint);

      if (allItems.length === 0) {
        console.warn(`⚠️  No items found for ${config.name}`);
        continue;
      }

      allItems.forEach(item => {
        const slug = config.pathExtractor(item);
        if (!slug) return;

        const fullPath = config.route.replace('[slug]', slug);

        // ✅ Use actual last modified date from API
        const lastModified = item.updated_at
          ? new Date(item.updated_at)
          : (item.created_at ? new Date(item.created_at) : new Date());

        allRoutes.push({
          path: fullPath,
          priority: config.priority,
          changefreq: config.changefreq,
          lastmod: lastModified  // ✅ Real date instead of current time
        });
      });

      console.log(`✓ Added ${allItems.length} ${config.name}`);
    } catch (error) {
      console.error(`❌ Error fetching ${config.name}:`, error.message);
    }
  }

  return allRoutes;
};

/**
 * Generates the complete sitemap.xml file with hreflang support
 */
const generateSitemap = async () => {
  try {
    console.log('=================================');
    console.log('Starting Sitemap Generation');
    console.log('=================================\n');

    // Validate environment variables
    validateEnvironment();
    console.log('✓ Environment variables validated\n');

    // Fetch settings to get the language code
    console.log('Fetching website settings...');
    const settings = await fetchSettings();

    if (!settings || !settings.data) {
      throw new Error('Failed to fetch settings or invalid settings data');
    }

    // Set global defaultLanguageCode for use in URL generation
    defaultLanguageCode = settings.data?.default_language || 'en-new';
    const availableLanguages = settings.data?.languages || [];

    if (!defaultLanguageCode) {
      throw new Error('No default language code found in settings');
    }

    console.log(`✓ Using default language: ${defaultLanguageCode}`);
    console.log(`✓ Available languages: ${availableLanguages.map(l => l.code).join(', ')}\n`);

    // Initialize sitemap entries array
    const sitemapEntries = [];

    // Add static routes with hreflang
    console.log('Adding static routes with hreflang...');
    staticRoutes.forEach(({ path, priority, changefreq }) => {
      const normalizedPath = path === '/' ? '' : path.replace(/^\/+/, '');
      sitemapEntries.push(
        generateUrlEntry(normalizedPath, priority, changefreq, null, availableLanguages)
      );
    });
    console.log(`✓ Added ${staticRoutes.length} static routes with ${availableLanguages.length} language alternates each\n`);

    // Fetch and add dynamic routes
    const dynamicRoutes = await fetchDynamicRoutes();

    if (dynamicRoutes.length === 0) {
      console.warn('⚠️  Warning: No dynamic routes were found from the APIs\n');
    } else {
      dynamicRoutes.forEach(({ path, priority, changefreq, lastmod }) => {
        const normalizedPath = path.replace(/^\/+/, '');
        sitemapEntries.push(
          generateUrlEntry(normalizedPath, priority, changefreq, lastmod, availableLanguages)
        );
      });
    }

    // Generate XML with proper namespaces for hreflang
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${sitemapEntries.join('\n')}
</urlset>`;

    // Ensure the public directory exists
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public', { recursive: true });
    }

    // Write sitemap to file
    fs.writeFileSync('public/sitemap.xml', sitemap);

    // Get file size for reporting
    const stats = fs.statSync('public/sitemap.xml');
    const fileSizeInKB = (stats.size / 1024).toFixed(2);

    console.log('=================================');
    console.log('✓ Sitemap Generation Complete');
    console.log('=================================');
    console.log(`Total URLs: ${sitemapEntries.length}`);
    console.log(`Languages: ${availableLanguages.length}`);
    console.log(`Hreflang alternates per URL: ${availableLanguages.length + 1} (including x-default)`);
    console.log(`File size: ${fileSizeInKB} KB`);
    console.log(`Location: public/sitemap.xml\n`);

    // Validate sitemap size
    if (sitemapEntries.length > 50000) {
      console.warn('⚠️  WARNING: Sitemap contains more than 50,000 URLs. Consider splitting into multiple sitemaps.');
    }

    if (stats.size > 50 * 1024 * 1024) {
      console.warn('⚠️  WARNING: Sitemap exceeds 50MB. Consider compressing or splitting into multiple sitemaps.');
    }

  } catch (error) {
    console.error('\n=================================');
    console.error('❌ Error generating sitemap');
    console.error('=================================');
    console.error(error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Execute sitemap generation
generateSitemap();
