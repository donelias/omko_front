"use client"
import ProjectListing from '../project-listing/ProjectListing'
import Layout from '../layout/Layout'

const ProjectListingPage = ({ initialData }) => {
    return (
        <div>
            <Layout>
                <ProjectListing initialData={initialData} />
            </Layout>
        </div>
    )
}

export default ProjectListingPage