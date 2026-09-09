import { GET_SEO_SETTINGS } from '@/api/apiEndpoints';
import MetaData from '@/components/meta/MetaData';
import ProjectListingPage from '@/components/pagescomponents/ProjectListingPage';
import axios from 'axios';
import { fetchServerSideProjectList, parseProjectFiltersFromQuery } from '@/utils/serverFetch';

const fetchDataFromSeo = async () => {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_SEO_SETTINGS}?page=all-projects`
        );

        const SEOData = response.data;


        return SEOData;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
};

const index = ({ seoData, pageName = "/projects/", initialData, lang = "es" }) => {
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
            <ProjectListingPage initialData={initialData} />
        </div>
    )
}

let serverSidePropsFunction = null;
if (process.env.NEXT_PUBLIC_SEO === "true") {
    serverSidePropsFunction = async (context) => {
        const { query, params } = context;
        const slugValue = params?.slug;
        const lang = query?.lang || 'es'; // Get lang from query params, default to 'es'
        const pageName = `/projects/?lang=${lang}`;

        const seoData = await fetchDataFromSeo(slugValue);

        const filters = parseProjectFiltersFromQuery(query, {});
        const initialData = await fetchServerSideProjectList({
            filters,
            query,
            lang,
            limit: 9,
            offset: 0,
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