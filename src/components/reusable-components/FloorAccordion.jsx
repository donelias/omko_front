"use client";

import { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "../context/TranslationContext";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";

const FloorAccordion = ({ plans, featureParameters = [] }) => {
  const t = useTranslation();
  const [activeKey, setActiveKey] = useState(null);

  const handleAccordionToggle = (key) => {
    setActiveKey(activeKey === key ? null : key);
  };

  if (!plans || plans.length === 0) {
    return null;
  }

  return (
    <div className="cardBg newBorder mb-7 flex flex-col rounded-2xl">
      <div className="blackTextColor border-b p-5 text-base font-bold md:text-xl">
        {t("floorPlans")}
      </div>

      <div className={`p-5`}>
        <Accordion
          type="single"
          collapsible
          value={activeKey}
          className="w-full transition-all duration-500 hover:cursor-pointer"
        >
          {plans.map((plan, index) => {
            const planId = plan?.id || `${index}`;
            return (
              <AccordionItem
                key={planId}
                value={planId}
                className="mb-2 rounded-lg newBorder primaryBackgroundBg"
              >
                <div
                  className={`flex w-full items-center justify-between p-4 ${activeKey === planId ? "" : ""}`}
                  onClick={() => handleAccordionToggle(planId)}
                >
                  <AccordionTrigger className="flex-1 text-base font-medium hover:no-underline">
                    {plan?.title}
                  </AccordionTrigger>
                  <div className="brandBg flex h-8 w-8 items-center justify-center rounded">
                    {activeKey === planId ? (
                      <FaMinus className="text-xs text-white" />
                    ) : (
                      <FaPlus className="text-xs text-white" />
                    )}
                  </div>
                </div>
                <AccordionContent className="p-4 transition-all duration-300 ease-in-out">
                  <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border p-3 md:grid-cols-4">
                    <div>
                      <div className="text-xs opacity-70">{t("price")}</div>
                      <div className="font-semibold">
                        {plan?.price !== undefined && plan?.price !== null && plan?.price !== ""
                          ? `${plan?.currency || "USD"} ${plan?.price}`
                          : "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs opacity-70">{t("currency")}</div>
                      <div className="font-semibold">{plan?.currency || "USD"}</div>
                    </div>
                    <div>
                      <div className="text-xs opacity-70">Available</div>
                      <div className="font-semibold">{plan?.available_units ?? "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs opacity-70">Status</div>
                      <div className="font-semibold">{plan?.unit_status || "-"}</div>
                    </div>
                  </div>

                  {featureParameters.length > 0 && plan?.features && Object.keys(plan.features).length > 0 && (
                    <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border p-3 md:grid-cols-4">
                      {featureParameters.map((param) => {
                        const fieldName = `param_${param.id}`;
                        const value = plan.features[fieldName];
                        if (!value || value === "") return null;
                        return (
                          <div key={param.id}>
                            <div className="text-xs opacity-70">{param.translated_name || param.name}</div>
                            <div className="font-semibold">{value}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="w-full h-[500px]">
                    <ImageWithPlaceholder
                      src={plan?.document}
                      alt={plan?.title || "Floor Plan"}
                      className="h-full w-full object-cover rounded-2xl transition-opacity duration-300 ease-in-out"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

export default FloorAccordion;
