"use client"
import React from 'react'
import dynamic from "next/dynamic.js";
const PaymentCheck = dynamic(() => import('@/Components/SubcriptionPlan/PaymentCheck'), { ssr: false })

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

const index = () => {
    return (
        <>
            <PaymentCheck />
        </>
    )
}

export default index
