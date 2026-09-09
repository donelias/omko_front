import { GET_PROPETRES } from '@/api/apiEndpoints';
import MetaData from '@/components/meta/MetaData';
import PropertyDetailPage from '@/components/pagescomponents/PropertyDetailPage.jsx';
import { fetchSeoData } from '@/utils/serverFetch';
import { buildPropertySchema, buildBreadcrumbSchema } from '@/utils/helperFunction';

export const getServerSideProps = async (context) => {
    const { query, params } = context;
    const slugValue = params?.slug;
    const lang = (query?.lang || 'es').toLowerCase();
    const pageName = `/property-details/${slugValue}/?lang=${lang}`;

    const [seoData, propertyData] = await Promise.all([
        fetchSeoData(GET_PROPETRES, { slug_id: slugValue, with_seo: 1 }, lang),
        fetchSeoData(GET_PROPETRES, { slug_id: slugValue }, lang),
    ]);

    return {
        props: {
            seoData,
            propertyData,
            pageName,
            lang,
        },
    };
};

const index = ({ seoData, propertyData, pageName, lang = 'es' }) => {
    const property = propertyData?.data?.[0];
    const seoMeta = seoData?.data?.[0];

    // Fall back to the property content when the admin SEO settings are empty.
    const fallbackTitle = property?.title
        ? `${property.title} | ${process.env.NEXT_PUBLIC_APPLICATION_NAME || 'Omko'}`
        : undefined;
    const fallbackDescription = property?.description || undefined;

    const siteUrl = (process.env.NEXT_PUBLIC_WEB_URL || '').replace(/\/$/, '');
    const langSuffix = `?lang=${lang}`;
    const canonicalUrl = `${siteUrl}/property-details/${property?.slug_id || ''}/${langSuffix}`;

    // Structured data: keep admin schema_markup if set, then append the
    // property RealEstateListing and a BreadcrumbList for richer SERP results.
    const structuredDataList = [];
    if (seoMeta?.schema_markup) {
        let parsedSeo = seoMeta.schema_markup;
        if (typeof parsedSeo === 'string') {
            try {
                parsedSeo = JSON.parse(parsedSeo);
            } catch (error) {
                parsedSeo = null;
            }
        }
        if (parsedSeo) structuredDataList.push(parsedSeo);
    }
    const propertySchema = buildPropertySchema(property, { url: canonicalUrl });
    if (propertySchema) structuredDataList.push(propertySchema);
    const breadcrumbSchema = buildBreadcrumbSchema([
        { name: lang === 'es' ? 'Inicio' : 'Home', url: `${siteUrl}/${langSuffix}` },
        { name: property?.translated_title || property?.title || 'Propiedades', url: canonicalUrl },
    ]);
    if (breadcrumbSchema) structuredDataList.push(breadcrumbSchema);

    return (
        <div>
            <MetaData
                title={seoMeta?.meta_title || fallbackTitle}
                description={seoMeta?.meta_description || fallbackDescription}
                keywords={seoMeta?.meta_keywords}
                ogImage={seoMeta?.meta_image || property?.title_image}
                pageName={pageName}
                structuredData={structuredDataList.length ? structuredDataList : undefined}
                languages={['es', 'en']}
                defaultLang="es"
                language={lang}
            />
            <PropertyDetailPage initialData={propertyData} />
        </div>
    )
}

export default index