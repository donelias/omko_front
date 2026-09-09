import { GET_SEO_SETTINGS } from '@/api/apiEndpoints';
import MetaData from '@/components/meta/MetaData';
import SearchPage from '@/components/pagescomponents/SearchPage';
import axios from 'axios';
import { fetchServerSidePropertyList, parseFiltersFromQuery } from '@/utils/serverFetch';


const fetchDataFromSeo = async () => {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_SEO_SETTINGS}?page=search`
        );

        const SEOData = response.data;


        return SEOData;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
};

const index = ({ seoData, pageName = "/search/", initialData }) => {
    return (
        <div>
            <MetaData
                title={seoData?.data?.[0]?.title}
                description={seoData?.data?.[0]?.description}
                keywords={seoData?.data?.[0]?.keywords}
                ogImage={seoData?.data?.[0]?.image}
                pageName={seoData?.data?.[0]?.page || pageName}
                structuredData={seoData?.data?.[0]?.schema_markup}
            />
            <SearchPage initialData={initialData} />
        </div>
    )
}

let serverSidePropsFunction = null;
if (process.env.NEXT_PUBLIC_SEO === "true") {
    serverSidePropsFunction = async (context) => {
        const { query } = context;

        const lang = query?.lang || 'es'; // Get lang from query params, default to 'es'
        const pageName = `/search/?lang=${lang}`;

        const seoData = await fetchDataFromSeo();

        const filters = parseFiltersFromQuery(query, {});
        const initialData = await fetchServerSidePropertyList({
            filters,
            options: { limit: 12, offset: 0 },
            lang,
        });

        return {
            props: {
                seoData,
                pageName,
                initialData,
            },
        };
    };
}

export const getServerSideProps = serverSidePropsFunction;
export default index