import { GET_SEO_SETTINGS, AGENT_PROPERTIES } from '@/api/apiEndpoints';
import MetaData from '@/components/meta/MetaData';
import axios from 'axios';
import AgentDetailsPage from '@/components/pagescomponents/AgentDetailsPage';
import { fetchSeoData } from '@/utils/serverFetch';

const fetchDataFromSeo = async () => {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_SEO_SETTINGS}?page=agent-details`
        );

        const SEOData = response.data;

        return SEOData;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
};

const index = ({ seoData, pageName, initialData }) => {
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
            <AgentDetailsPage initialData={initialData} />
        </div>
    )
}

let serverSidePropsFunction = null;
if (process.env.NEXT_PUBLIC_SEO === "true") {
    serverSidePropsFunction = async (context) => {
        const { params, query } = context; // Extract query and request object from context
        // Accessing the slug property
        const slugValue = params?.slug;
        const lang = query?.lang || 'es'; // Get lang from query params, default to 'es'
        const pageName = `/agent-details/${slugValue}/?lang=${lang}`;

        const isAdmin = query?.is_admin === "true" ? "1" : "";

        const [seoData, agentData] = await Promise.all([
            fetchDataFromSeo(),
            fetchSeoData(AGENT_PROPERTIES, {
                slug_id: slugValue,
                is_projects: "",
                is_admin: isAdmin,
                limit: 8,
                offset: 0,
            }, lang),
        ]);

        let initialData = null;
        if (agentData && !agentData.error && agentData?.data?.customer_data) {
            initialData = {
                agent: {
                    ...agentData.data.customer_data,
                    is_admin: query?.is_admin === "true",
                },
                featureAvailable: agentData.data.feature_available,
                premiumPropertiesCount: agentData.data.premium_properties_count,
            };
        }

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
