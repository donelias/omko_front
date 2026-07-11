import React, { useMemo, useState } from 'react';
import { BiCheckShield } from "react-icons/bi";
import { BiSolidCheckCircle, BiSolidXCircle } from "react-icons/bi";
import { FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { useTranslation } from '../context/TranslationContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const BecomeAgentHeader = () => {
    const router = useRouter();
    const t = useTranslation();
    const [showIncludedFeatures, setShowIncludedFeatures] = useState(false);
    const selectedPackage = useSelector((state) => state.cacheData?.selectedPackage);
    const currencySymbol = useSelector((state) => state.WebSetting?.data?.currency_symbol || "$");
    const hasSelectedPackage = Boolean(selectedPackage);

    const selectedPackageName = selectedPackage?.translated_name || selectedPackage?.name || t("noPlanSelected");
    const selectedPackageDescription = selectedPackage?.translated_description || selectedPackage?.description || "";
    const durationHours = Number(selectedPackage?.duration) || 0;
    const isPaidPlan = selectedPackage?.package_type === "paid";
    const isLongTermPlan = isPaidPlan && durationHours > 24 * 30;
    const durationDays = durationHours ? Math.ceil(durationHours / 24) : 0;
    const durationMonths = Math.max(1, Math.round(durationDays / 30));
    const durationLabel = durationHours
        ? isLongTermPlan
            ? `${durationMonths} ${t("months")}`
            : `${durationDays} ${t("days")}`
        : t("noPlanSelected");

    const priceValue = Number(selectedPackage?.price || 0);
    const monthlyPrice = isLongTermPlan && durationHours
        ? priceValue / (durationHours / (24 * 30))
        : priceValue;

    const selectedFeatures = Array.isArray(selectedPackage?.features) ? selectedPackage.features : [];
    const featureCatalog = Array.isArray(selectedPackage?.allFeatures) ? selectedPackage.allFeatures : [];

    const featureRows = useMemo(() => {
        return featureCatalog.map((feature) => {
            const assignedFeature = selectedFeatures.find(
                (item) => item?.id?.toString() === feature?.id?.toString(),
            );

            return {
                id: feature?.id,
                name: feature?.translated_name || feature?.name,
                assignedFeature,
            };
        });
    }, [featureCatalog, selectedFeatures]);

    return (
        <div className='primaryBackgroundBg'>
            <div className="w-full py-8 px-4 md:px-0 flex flex-col gap-6 container">
                <div className="flex justify-between items-start w-full gap-2">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="w-[56px] h-[56px] md:w-[72px] md:h-[72px] shrink-0 rounded-[12px] primaryBg flex items-center justify-center text-white">
                            <BiCheckShield className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-[20px] md:text-[24px] leading-[26px] md:leading-[29px] font-bold brandColor mb-1">{t("becomeAgent")}</h1>
                            <p className="text-[14px] leading-[18px] font-medium leadColor">
                                {t("becomeAgentDescription")}<br className="hidden md:block" />
                                {t("becomeAgentDescription2")}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] shrink-0 border-2 bg-white border-gray-200 rounded-lg flex items-center justify-center leadColor hover:bg-gray-50 transition-colors"
                    >
                        <FiX className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>
                {/* <div className='newBorder'></div>

                <div className="w-full">
                    <h2 className="text-xl font-bold mb-3">{t("selectedPlan")}</h2>
                    <Collapsible open={showIncludedFeatures} onOpenChange={setShowIncludedFeatures} className="w-full overflow-hidden rounded-2xl border newBorderColor bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                        <div className={`flex flex-col gap-4 px-4 py-4 flex-wrap lg:flex-nowrap md:flex-row md:items-center md:justify-between md:px-6 md:py-5 ${showIncludedFeatures ? 'border-b' : ''}`}>
                            <div className="flex w-full flex-wrap items-start gap-4 md:flex-nowrap md:items-center">
                                <div className="flex shrink-0 items-center justify-center gap-2 rounded-full primaryBackgroundBg px-6 py-3 text-md font-bold leadColor">
                                    <span>{selectedPackageName}</span>
                                </div>
                                <div className="shrink-0 min-w-0">
                                    <div className="text-xl font-bold brandColor">{durationLabel}</div>
                                    <div className="text-base brandColor opacity-[66%]">
                                        {selectedPackageDescription || ""}
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-end gap-1 md:border-l md:border-gray-200 md:pl-8">
                                    <span className="text-[28px] font-bold brandColor">
                                        {hasSelectedPackage ? `${currencySymbol}${(isLongTermPlan ? monthlyPrice : priceValue).toFixed(2)}` : `${currencySymbol}0`}
                                    </span>
                                    <span className="mb-1 text-md font-medium brandColor opacity-[66%]">
                                        {hasSelectedPackage
                                            ? isLongTermPlan
                                                ? t("perMonth")
                                                : selectedPackage?.package_type === "free"
                                                    ? t("foreverFree")
                                                    : t("priceOnRequest")
                                            : t("priceOnRequest")}
                                    </span>
                                </div>
                            </div>

                            {hasSelectedPackage ? (
                                <CollapsibleTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex shrink-0 items-center gap-2 self-start text-[15px] font-medium brandColor transition-colors hover:opacity-80 md:self-center"
                                        aria-expanded={showIncludedFeatures}
                                    >
                                        {showIncludedFeatures ? t("hideIncludedFeatures") : t("seeWhatsIncluded")}
                                        {showIncludedFeatures ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
                                    </button>
                                </CollapsibleTrigger>
                            ) : null}
                        </div>

                        <CollapsibleContent className="px-4 py-4 md:px-6 md:py-5">
                            {hasSelectedPackage ? (
                                <div>
                                    {featureRows.length > 0 ? (
                                        <div className="max-h-80 overflow-y-auto pr-1">
                                            <div className="flex flex-col gap-4">
                                                {featureRows.map((feature) => {
                                                    const isIncluded = Boolean(feature.assignedFeature);

                                                    return (
                                                        <div className="flex items-center gap-4 text-[16px] font-medium text-gray-600" key={feature.id}>
                                                            <span className="flex-shrink-0">
                                                                {isIncluded ? (
                                                                    <BiSolidCheckCircle size={22} className="primaryColor" />
                                                                ) : (
                                                                    <BiSolidXCircle size={22} className="text-[#DB3D26]" />
                                                                )}
                                                            </span>
                                                            <span className="line-clamp-2 break-words leading-[24px]">
                                                                {feature.name}
                                                                {isIncluded ? (
                                                                    <>
                                                                        {": "}
                                                                        {feature.assignedFeature?.limit_type === "limited"
                                                                            ? feature.assignedFeature?.limit
                                                                            : t("unlimited")}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {": "}
                                                                        {t("notIncluded")}
                                                                    </>
                                                                )}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm leadColor">{t("noPlanSelected")}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm font-medium leadColor">{t("noPlanSelected")}</p>
                            )}
                        </CollapsibleContent>
                    </Collapsible>
                </div> */}
            </div>
        </div>
    );
};

export default BecomeAgentHeader;
