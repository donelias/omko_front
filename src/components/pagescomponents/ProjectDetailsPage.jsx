import React from 'react'
import ProjectDetails from '../project-details/ProjectDetails'
import Layout from '../layout/Layout'

const ProjectDetailsPage = ({ initialData, seoData }) => {
    return (
        <Layout>
            <ProjectDetails initialData={initialData} seoData={seoData} />
        </Layout>
    )
}

export default ProjectDetailsPage