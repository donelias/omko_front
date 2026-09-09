import { GET_PROJECTS, GET_PROJECT_DETAILS } from '@/api/apiEndpoints';
import MetaData from '@/components/meta/MetaData';
import ProjectDetailsPage from '@/components/pagescomponents/ProjectDetailsPage';
import { fetchSeoData } from '@/utils/serverFetch';

const fetchDataFromSeo = async (slug) => {
    const response = await fetchSeoData(GET_PROJECTS, { slug_id: slug });
    return response;
};

const index = ({ seoData, projectData, pageName, lang = 'es' }) => {
    const project = projectData?.data;
    const seoMeta = seoData?.data?.[0];

    const fallbackTitle = project?.title
        ? `${project.title} | ${process.env.NEXT_PUBLIC_APPLICATION_NAME || 'Omko'}`
        : undefined;
    const fallbackDescription = project?.description || undefined;

    return (
        <div>
            <MetaData
                title={seoMeta?.meta_title || fallbackTitle}
                description={seoMeta?.meta_description || fallbackDescription}
                keywords={seoMeta?.meta_keywords}
                ogImage={seoMeta?.meta_image || project?.title_image}
                pageName={pageName}
                structuredData={seoMeta?.schema_markup}
                languages={['es', 'en']}
                defaultLang="es"
                language={lang}
            />
            <ProjectDetailsPage initialData={projectData} />
        </div>
    )
}
let serverSidePropsFunction = null;
if (process.env.NEXT_PUBLIC_SEO === "true") {
    serverSidePropsFunction = async (context) => {
        const { query, params } = context; // Extract query and request object from context
        const slugValue = params?.slug;
        const lang = query?.lang || 'es'; // Get lang from query params, default to 'es'
        const pageName = `/project-details/${slugValue}/?lang=${lang}`;

        const [seoData, projectData] = await Promise.all([
            fetchSeoData(GET_PROJECTS, { slug_id: slugValue }, lang),
            fetchSeoData(GET_PROJECT_DETAILS, { slug_id: slugValue, get_similar: "1" }, lang),
        ]);

        return {
            props: {
                seoData,
                projectData,
                pageName,
                lang,
            },
        };
    };
}
export const getServerSideProps = serverSidePropsFunction;
export default index