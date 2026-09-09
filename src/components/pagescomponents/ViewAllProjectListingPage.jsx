import React from "react";
import Layout from "@/components/layout/Layout";
import ViewAllProjectListing from "../view-all-project-listing/ViewAllProjectListing";

const ViewAllProjectListingPage = ({ initialData }) => {
  return (
    <Layout>
      <ViewAllProjectListing initialData={initialData} />
    </Layout>
  );
};

export default ViewAllProjectListingPage;
