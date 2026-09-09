import MetaData from "@/components/meta/MetaData";
import ViewAllPropertyListingPage from "@/components/pagescomponents/ViewAllPropertyListingPage";
import React from "react";
import axios from "axios";
import { GET_SEO_SETTINGS } from "@/api/apiEndpoints";
import { GET_CITYS_DATA } from "@/api/apiEndpoints";
import { fetchSeoData, fetchServerSidePropertyList, parseFiltersFromQuery } from "@/utils/serverFetch";

// Utility function to split and capitalize words in a slug

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
      <ViewAllPropertyListingPage initialData={initialData} />
    </div>
  );
};
let serverSidePropsFunction = null;
if (process.env.NEXT_PUBLIC_SEO === "true") {
  serverSidePropsFunction = async ({ params, query }) => {
    let { slug } = params;
    const lang = query?.lang || 'en';
    const seoPage = slug === "most-favourite-properties" ? "most-favorite-properties" : slug;
    const pageName = `/properties/${slug}/?lang=${lang}`;
    const seoData = await fetchDataFromSeo(seoPage);

    // SSR the first page of results so crawlers see real property cards.
    let initialData = null;
    try {
      if (slug === "properties-nearby-city") {
        const cityData = await fetchSeoData(GET_CITYS_DATA, { limit: 12, offset: 0 }, lang);
        if (cityData && !cityData.error) {
          initialData = {
            properties: cityData?.data || [],
            total: cityData?.total || 0,
            hasMore: (cityData?.total || 0) > (cityData?.data?.length || 0),
            cityTextOnly: cityData?.with_image === false,
            filters: parseFiltersFromQuery(query, {}),
          };
        }
      } else {
        const baseFilters = parseFiltersFromQuery(query, {});
        if (slug === "featured-properties") {
          baseFilters.promoted = true;
          baseFilters.most_viewed = "";
          baseFilters.most_liked = "";
        } else if (slug === "most-viewed-properties") {
          baseFilters.most_viewed = "1";
          baseFilters.promoted = false;
          baseFilters.most_liked = "";
        } else if (slug === "most-favourite-properties") {
          baseFilters.most_liked = "1";
          baseFilters.promoted = false;
          baseFilters.most_viewed = "";
        }
        initialData = await fetchServerSidePropertyList({
          filters: baseFilters,
          options: { limit: 12, offset: 0 },
          lang,
        });
      }
    } catch (error) {
      console.error("Error fetching SSR listing data:", error);
    }

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