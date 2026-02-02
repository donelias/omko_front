#!/usr/bin/env python3
import os

base_path = '/Users/mac/Documents/Omko/omko/En produccion/Web-omko/pages'

# Fix project-details
project_content = '''import React from 'react'
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
'''

# Fix agent-details
agent_content = '''import React from 'react'
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
'''

# Fix article-details
article_content = '''import React from 'react'
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
'''

files = {
    'project-details/[slug].jsx': project_content,
    'agent-details/[slug].jsx': agent_content,
    'article-details/[slug].jsx': article_content,
}

for filepath, content in files.items():
    full_path = os.path.join(base_path, filepath)
    with open(full_path, 'w') as f:
        f.write(content)
    print(f"✓ Fixed: {filepath}")

print("\nAll routes with getStaticPaths added!")
