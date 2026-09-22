import dynamic from "next/dynamic";

const ClientScreeningForm = dynamic(
  () => import("@/components/client-screening/ClientScreeningForm"),
  { ssr: false }
);

const index = () => {
  return (
    <div>
      <ClientScreeningForm />
    </div>
  );
};

export default index;