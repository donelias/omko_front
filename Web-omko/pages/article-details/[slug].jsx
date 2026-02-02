import React from 'react'
import axios from "axios";
import { GET_ARTICLES } from "@/utils/api";
import Meta from "@/Components/Seo/Meta";
import dynamic from 'next/dynamic'

const ArticleDetails = dynamic(
  () => import('@/Components/ArticleDetails/ArticleDetails'),
  { ssr: false })

export async function getStaticPaths() {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_ARTICLES}`
    );
    const articles = response.data?.data || [];
    const paths = articles.map((article) => ({
      params: { slug: article.slug_id || article.id.toString() },
    }));
    return { paths, fallback: 'blocking' };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  try {
    const { slug } = params;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${GET_ARTICLES}?slug_id=${slug}`
    );
    const seoData = response.data || {};
    const currentURL = `${process.env.NEXT_PUBLIC_WEB_URL}/article-details/${slug}/`;
    return {
      props: { seoData, currentURL },
      revalidate: 3600,
    };
  } catch (error) {
    console.error("Error fetching article data:", error);
    return { notFound: true, revalidate: 60 };
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
            <ArticleDetails />
        </>
    )
}

export default Index
