import dynamic from "next/dynamic";

const ScreeningPropertyPicker = dynamic(
  () => import("@/components/client-screening/ScreeningPropertyPicker"),
  { ssr: false }
);

const index = () => {
  return (
    <div>
      <ScreeningPropertyPicker />
    </div>
  );
};

export default index;