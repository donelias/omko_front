import AgentDetails from "@/components/agent-details/AgentDetails"
import Layout from "../layout/Layout"

const AgentDetailsPage = ({ initialData }) => {
    return (
        <Layout>
            <AgentDetails initialData={initialData} />
        </Layout>
    )
}

export default AgentDetailsPage