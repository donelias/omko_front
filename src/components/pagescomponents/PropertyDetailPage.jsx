import React from 'react'
import Layout from '../layout/Layout'
import PropertyDetails from '../property-detail/PropertyDetails'

const PropertyDetailPage = ({ initialData, seoData }) => {
    return (
        <Layout>
            <PropertyDetails initialData={initialData} seoData={seoData} />
        </Layout>
    )
}

export default PropertyDetailPage