import MetaData from '@/components/meta/MetaData'
import dynamic from 'next/dynamic'
const BecomeAgentPage = dynamic(() => import('@/components/pagescomponents/BecomeAgentPage'), { ssr: false })

const index = () => {
    return (
        <div>
            <MetaData
                title='Become an Agent - eBroker'
                description='Join eBroker as an agent and unlock a world of opportunities in the real estate market. Connect with clients, access exclusive listings, and grow your business with our powerful platform.'
                keywords='become an agent, real estate agent, join eBroker, real estate opportunities, agent platform'
                author={process.env.NEXT_PUBLIC_APPLICATION_NAME}
                pageName='/become-agent/?lang=en'
            />
            <BecomeAgentPage />
        </div>
    )
}

export default index
