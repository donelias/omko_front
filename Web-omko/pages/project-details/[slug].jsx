import React from 'react'
// import ProjectDetails from '@/Components/ProjectDetails/ProjectDetails'
import axios from "axios";
import { GET_PROJECTS } from "@/utils/api";
import Meta from "@/Components/Seo/Meta";
import dynamic from 'next/dynamic'

const ProjectDetails = dynamic(
  () => import('@/Components/ProjectDetails/ProjectDetails'),
  { ssr: false })

export async function getStaticPaths() {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_PROJECTS}`
    );
    const projects = response.data?.data || [];
    const paths = projects.map((project) => ({
      params: { slug: project.slug_id || project.id.toString() },
    }));
    return { paths, fallback: 'blocking' };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  try {
    const { slug } = params;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_PROJECTS}?slug_id=${slug}`
    );
    const seoData = response.data || {};
    const currentURL = `${process.env.NEXT_PUBLIC_WEB_URL}/project-details/${slug}/`;
    return {
      props: { seoData, currentURL },
      revalidate: 3600,
    };
  } catch (error) {
    console.error("Error fetching project data:", error);
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
            <ProjectDetails />
        </>
    )
}

export default index
