"use client"

import React from "react";
// import IntrestedUsers from '@/Components/User/IntrestedUsers.jsx'
import Meta from "@/Components/Seo/Meta";
import dynamic from 'next/dynamic'

const IntrestedUsers = dynamic(
  () => import('@/Components/User/IntrestedUsers.jsx'),
  { ssr: false })

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {},
    revalidate: 60,
  };
}

const Index = () => {

    return (
        <> 
        <Meta
        title=""
        description=""
        keywords=""
        ogImage=""
        pathName=""
    />
            <IntrestedUsers />
        </>
    );
};

export default Index;
