import MetaData from '@/components/meta/MetaData'
import dynamic from 'next/dynamic'
const BecomeAgentFormPage = dynamic(() => import('@/components/pagescomponents/BecomeAgentFormPage'), { ssr: false })

const index = () => {
    return (
        <div>
            <MetaData
                title='Become an Agent Form - omko'
                description='Join omko as an agent and unlock a world of opportunities in the real estate market. Connect with clients, access exclusive listings, and grow your business with our powerful platform.'
                keywords='become an agent, real estate agent, join omko, real estate opportunities, agent platform'
                author={process.env.NEXT_PUBLIC_APPLICATION_NAME}
                pageName='/become-agent-form/?lang=en'
            />
            <BecomeAgentFormPage />
        </div>
    )
}

export default index