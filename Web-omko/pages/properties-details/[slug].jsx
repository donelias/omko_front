import React from 'react'
// import PropertyDetails from '@/Components/PropertyDetails/PropertyDetails'

import axios from "axios";
import { GET_PROPETRES } from "@/utils/api";
import Meta from "@/Components/Seo/Meta";
import dynamic from 'next/dynamic'

const PropertyDetails = dynamic(
  () => import('@/Components/PropertyDetails/PropertyDetails'),
  { ssr: false })

// Fetch all property slugs for static generation
export async function getStaticPaths() {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_PROPETRES}`
    );

    const properties = response.data?.data || [];
    
    // Generate paths for each property
    const paths = properties.map((property) => ({
      params: { slug: property.slug_id || property.id.toString() },
    }));

    return {
      paths,
      fallback: 'blocking'
    };
  } catch (error) {
    console.error("Error fetching properties for static paths:", error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
}

// Fetch data for specific property slug
export async function getStaticProps({ params }) {
  try {
    const { slug } = params;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_PROPETRES}?slug_id=${slug}`
    );

    const seoData = response.data || {};
    const currentURL = `${process.env.NEXT_PUBLIC_WEB_URL}/properties-details/${slug}/`;

    return {
      props: {
        seoData,
        currentURL,
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error("Error fetching property data:", error);
    return {
      notFound: true,
      revalidate: 60,
    };
  }
}

const index = ({ seoData, currentURL }) => {

    return (
        <>
            <Meta
                title={seoData?.data && seoData.data.length > 0 && seoData.data[0].meta_title}
                description={seoData?.data && seoData.data.length > 0 && seoData.data[0].meta_description}
                keywords={seoData?.data && seoData.data.length > 0 && seoData.data[0].meta_keywords}
                ogImage={seoData?.data && seoData.data.length > 0 && seoData.data[0].meta_image}
                pathName={currentURL}
            />
            <PropertyDetails />
        </>
    )
}

export default index