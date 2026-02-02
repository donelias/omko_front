import React from 'react'
import axios from "axios";
import { GET_AGENTS } from "@/utils/api";
import Meta from "@/Components/Seo/Meta";
import dynamic from 'next/dynamic'

const AgentDetails = dynamic(
  () => import('@/Components/Agents/AgentDetails'),
  { ssr: false })

export async function getStaticPaths() {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_AGENTS}`
    );
    const agents = response.data?.data || [];
    const paths = agents.map((agent) => ({
      params: { slug: agent.slug_id || agent.id.toString() },
    }));
    return { paths, fallback: 'blocking' };
  } catch (error) {
    console.error("Error fetching agents:", error);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  try {
    const { slug } = params;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_AGENTS}?slug_id=${slug}`
    );
    const seoData = response.data || {};
    const currentURL = `${process.env.NEXT_PUBLIC_WEB_URL}/agent-details/${slug}/`;
    return {
      props: { seoData, currentURL },
      revalidate: 3600,
    };
  } catch (error) {
    console.error("Error fetching agent data:", error);
    return { notFound: true, revalidate: 60 };
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
            <AgentDetails />
        </>
    )
}

export default index
