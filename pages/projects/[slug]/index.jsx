import MetaData from "@/components/meta/MetaData";
import ViewAllProjectListingPage from "@/components/pagescomponents/ViewAllProjectListingPage";
import React from "react";
import axios from "axios";
import { GET_SEO_SETTINGS } from "@/api/apiEndpoints";
import { fetchServerSideProjectList, parseProjectFiltersFromQuery } from "@/utils/serverFetch";

const fetchDataFromSeo = async (page) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_SEO_SETTINGS}?page=${page}`
    );

    const SEOData = response.data;

    return SEOData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

const getSlugFlags = (currentSlug) => {
  switch (currentSlug) {
    case "featured-projects":
      return { promoted: 1, most_viewed: 0, most_liked: 0 };
    case "most-viewed-projects":
      return { promoted: 0, most_viewed: 1, most_liked: 0 };
    case "most-favourite-projects":
      return { promoted: 0, most_viewed: 0, most_liked: 1 };
    default:
      return { promoted: 0, most_viewed: 0, most_liked: 0 };
  }
};

const index = ({ slug, seoData, pageName, initialData }) => {
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
      <ViewAllProjectListingPage initialData={initialData} />
    </div>
  );
};

let serverSidePropsFunction = null;
if (process.env.NEXT_PUBLIC_SEO === "true") {
  serverSidePropsFunction = async ({ params, query }) => {
    let { slug } = params;
    const lang = query?.lang || 'es';
    const pageName = `/projects/${slug}/?lang=${lang}&filters=${query?.filters || ''}`;
    const seoData = await fetchDataFromSeo(slug);

    const slugFlags = getSlugFlags(slug);
    const filters = parseProjectFiltersFromQuery(query, { flagsNumeric: true });
    const snapshotFilters = {
      ...filters,
      most_viewed: slugFlags.most_viewed,
      most_liked: slugFlags.most_liked,
      promoted: slug === "featured-projects" ? 1 : (filters.promoted || 0),
    };

    const initialData = await fetchServerSideProjectList({
      filters: snapshotFilters,
      query,
      slugFlags,
      lang,
      limit: 12,
      offset: 0,
    });

    return {
      props: {
        seoData,
        slug,
        pageName,
        initialData,
      },
    };
  };
}

export const getServerSideProps = serverSidePropsFunction;
export default index;