import React from "react";
import axios from "axios";
import { GET_SEO_SETTINGS } from "@/utils/api";
import Meta from "@/Components/Seo/Meta";
// import City from "@/Components/Properties/City";
import dynamic from 'next/dynamic'

const City = dynamic(
  () => import('@/Components/Properties/City'),
  { ssr: false })

// Fetch all cities for static generation
export async function getStaticPaths() {
  try {
    // Try to get list of all available cities from your API
    // If you have a GET_CITIES endpoint, use it here
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_SEO_SETTINGS}?page=properties-nearby-city`
    );

    const cities = response.data?.data || [];
    
    // Generate paths for each city
    const paths = cities.map((city) => ({
      params: { slug: city.slug_id || city.id.toString() },
    }));

    return {
      paths,
      fallback: 'blocking'
    };
  } catch (error) {
    console.error("Error fetching cities for static paths:", error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
}

// Fetch data for specific city slug
export async function getStaticProps({ params }) {
  try {
    const { slug } = params;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_SEO_SETTINGS}?page=properties-nearby-city`
    );

    const seoData = response.data || {};
    const currentURL = `${process.env.NEXT_PUBLIC_WEB_URL}/properties/city/${slug}/`;

    return {
      props: {
        seoData,
        currentURL,
        citySlug: slug,
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error("Error fetching city data:", error);
    return {
      notFound: true,
      revalidate: 60,
    };
  }
}

const Index = ({ seoData, currentURL, citySlug }) => {
    const replaceCityPlaceholder = (str) => {
        // Use a generic placeholder that represents where the city name should be inserted
        const placeholder = "[City]";

        // Check if the placeholder is present in the string
        if (str.includes(placeholder)) {
            // Replace the placeholder with the actual city slug
            return str.replace(placeholder, citySlug);
        } else {
            // If no placeholder is found, simply append the city slug to the end
            return `${str} ${citySlug}`;
        }
    };

    return (
        <>
            <Meta
                title={seoData?.data && seoData.data.length > 0 && seoData.data[0].meta_title}
                description={seoData?.data && seoData.data.length > 0 && seoData.data[0].meta_description}
                keywords={seoData?.data && seoData.data.length > 0 && seoData.data[0].meta_keywords}
                ogImage={seoData?.data && seoData.data.length > 0 && seoData.data[0].meta_image}
                pathName={currentURL}
            />
            <City />
        </>
    );
};

export default Index;
