import React from 'react'
import Layout from '../layout/Layout'
import Search from '../search/Search'

const SearchPage = ({ initialData }) => {
    return (
        <Layout>
            <Search initialData={initialData} />
        </Layout>
    )
}

export default SearchPage