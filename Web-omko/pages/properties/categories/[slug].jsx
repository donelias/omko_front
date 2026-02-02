import React from "react";
// import Categories from "@/Components/Properties/Categories";
import { GET_CATEGORES } from "@/utils/api";
import Meta from "@/Components/Seo/Meta";
import axios from "axios";
import dynamic from 'next/dynamic'

const Categories = dynamic(
  () => import('@/Components/Properties/Categories'),
  { ssr: false })

// Fetch all category slugs for static generation
export async function getStaticPaths() {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_CATEGORES}`
    );

    const categories = response.data?.data || [];
    
    // Generate paths for each category
    const paths = categories.map((category) => ({
      params: { slug: category.slug_id || category.id.toString() },
    }));

    return {
      paths,
      fallback: 'blocking' // Regenerate at request time if not pre-generated
    };
  } catch (error) {
    console.error("Error fetching categories for static paths:", error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
}

// Fetch data for specific category slug
export async function getStaticProps({ params }) {
  try {
    const { slug } = params;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_CATEGORES}?slug_id=${slug}`
    );

    const seoData = response.data || {};
    const currentURL = `${process.env.NEXT_PUBLIC_WEB_URL}/properties/categories/${slug}/`;

    return {
      props: {
        seoData,
        currentURL,
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error("Error fetching category data:", error);
    return {
      notFound: true, // Return 404 if data fetch fails
      revalidate: 60, // Try again in 1 minute
    };
  }
}

const Index = ({ seoData, currentURL }) => {

    return (
        <>
            <Meta
                title={seoData?.data && seoData.data.length > 0 && seoData.data[0].meta_title}
                description={seoData?.data && seoData.data.length > 0 && seoData.data[0].meta_description}
                keywords={seoData?.data && seoData.data.length > 0 && seoData.data[0].meta_keywords}
                ogImage={seoData?.data && seoData.data.length > 0 && seoData.data[0].meta_image}
                pathName={currentURL}
            />
            <Categories />
        </>
    );
};

export default Index
