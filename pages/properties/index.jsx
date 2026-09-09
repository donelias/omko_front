import PropertyList from '@/components/pagescomponents/PropertyList';
import MetaData from '@/components/meta/MetaData';
import axios from 'axios';
import { GET_SEO_SETTINGS } from '@/api/apiEndpoints';
import { fetchSeoData, fetchServerSidePropertyList, parseFiltersFromQuery } from '@/utils/serverFetch';

const fetchDataFromSeo = async () => {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_SEO_SETTINGS}?page=all-properties`
        );

        const SEOData = response.data;


        return SEOData;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
};

const index = ({ seoData, pageName = "/properties/", initialData, lang = "es" }) => {
    return (
        <div>
            <MetaData
                title={seoData?.data?.[0]?.title}
                description={seoData?.data?.[0]?.description}
                keywords={seoData?.data?.[0]?.keywords}
                ogImage={seoData?.data?.[0]?.image}
                pageName={pageName}
                structuredData={seoData?.data?.[0]?.schema_markup}
            />
            <PropertyList initialData={initialData} />
        </div>
    )
}

let serverSidePropsFunction = null;
if (process.env.NEXT_PUBLIC_SEO === "true") {
    serverSidePropsFunction = async (context) => {
        const { query } = context; // Extract query and request object from context

        const lang = query?.lang || 'en'; // Get lang from query params, default to 'en'
        const pageName = `/properties/?lang=${lang}`;
        const seoData = await fetchDataFromSeo();

        const filters = parseFiltersFromQuery(query, {});
        const initialData = await fetchServerSidePropertyList({
            filters,
            options: { limit: 9, offset: 0 },
            lang,
        });

        return {
            props: {
                seoData,
                pageName,
                initialData,
                lang,
            },
        };
    };
}

export const getServerSideProps = serverSidePropsFunction;
export default index