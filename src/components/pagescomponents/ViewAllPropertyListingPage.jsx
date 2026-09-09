import React from "react";
import Layout from "@/components/layout/Layout";
import ViewAllPropertyListing from "../view-all-featured-listing/ViewAllPropertyListing";

const FeatureDetailsPage = ({ initialData }) => {
  return (
    <Layout>
      <ViewAllPropertyListing initialData={initialData} />
    </Layout>
  );
};

export default FeatureDetailsPage;
