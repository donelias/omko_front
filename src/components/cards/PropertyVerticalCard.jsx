"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatPriceAbbreviated, getDisplayValueForOption, handlePackageCheck, truncate } from "@/utils/helperFunction";
import { useTranslation } from "../context/TranslationContext";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import PremiumIcon from "@/assets/premium.svg";
import { addFavouritePropertyApi } from "@/api/apiRoutes";
import React, { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { PackageTypes } from "@/utils/checkPackages/packageTypes";
import { useRouter } from "next/router";
import { ReactSVG } from "react-svg";

const PropertyVerticalCard = ({
  property, 
  handlePropertyLike = (propertyId, isLiked = false) => { },
}) => {
  const t = useTranslation();
  const router = useRouter();
  const { lang } = router?.query;
  const userData = useSelector((state) => state.User?.data);
  const exchangeRate = useSelector((state) => state?.exchangeRate?.rate) || 58.5;
  const [isFavourite, setIsFavourite] = useState(property?.is_favourite);

  const isUserProperty = property?.added_by == userData?.id;

  const validParameters = property?.parameters
    ?.filter((elem) => elem?.value !== "" && elem?.value !== "0")
    .slice(0, 3);

  // FUNCIÓN AUXILIAR BLINDADA CON EVALUACIÓN FLEXIBLE (DOP / RD$)
  const renderDualPrices = () => {
    const originalPrice = Number(property?.price || 0);
    // Limpieza total del string para evitar fallos por espacios o nomenclaturas híbridas
    const currency = property?.currency?.toUpperCase()?.trim() || "USD";
    const rate = Number(exchangeRate) > 0 ? Number(exchangeRate) : 58.5;

    const usdFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    const dopFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    let mainPriceString = "";
    let convertedPriceString = "";

    // CONDICIÓN FLEXIBLE UNIFICADA
    if (currency === "DOP" || currency === "RD$") {
      mainPriceString = dopFormatter.format(originalPrice).replace("DOP", "RD$");
      convertedPriceString = `≈ ${usdFormatter.format(originalPrice / rate)}`;
    } else {
      mainPriceString = usdFormatter.format(originalPrice);
      convertedPriceString = `≈ ${dopFormatter.format(originalPrice * rate).replace("DOP", "RD$")}`;
    }

    return (
      <div key={rate} className="flex flex-col justify-center leading-tight">
        {/* Precio principal original */}
        <span className="text-lg font-bold" itemProp="price" content={property?.price}>
          {mainPriceString}
          <span className="text-sm font-normal text-gray-500 ml-1">
            {property?.property_type === "rent" && property?.rentduration ? "/ " + t(property?.rentduration?.toLowerCase()) : ""}
          </span>
        </span>
        {/* Conversión aproximada secundaria reactiva al cambio de tasa */}
        <span className="text-[11px] font-medium text-gray-400 mt-0.5 tracking-wide">
          {convertedPriceString}
        </span>
      </div>
    );
  };

  const handleFavourite = async () => {
    try {
      const res = await addFavouritePropertyApi({
        property_id: property?.id,
        type: isFavourite ? "0" : "1"
      });
      if (!res?.error) {
        handlePropertyLike(property?.id, isFavourite ? false : true);
        setIsFavourite(!isFavourite);
        toast.success(t(res?.message));
      } else {
        toast.error(res?.message);
      }
    } catch (error) {
      console.error("Error", error);
      toast.error(t(error?.message));
    }
  };

  const handlePropertyClick = (e) => {
    e.preventDefault();
    if (property?.is_premium) {
      handlePackageCheck(e, PackageTypes.PREMIUM_PROPERTIES, router, property?.slug_id, property, isUserProperty, false, t);
    } else if (isUserProperty) {
      router?.push(`/my-property/${property.slug_id}?lang=${lang}`);
    } else {
      router.push(`/property-details/${property.slug_id}?lang=${lang}`);
    }
  };

  useEffect(() => {
    setIsFavourite(property?.is_favourite);
  }, [property?.is_favourite]);

  return (
    <div aria-label={`${property?.translated_title || property?.title} in ${property?.state}`} className="group w-full max-w-sm mx-auto">
      <article className="cardBg hover:shadow-lg transition-all duration-500 cardBorder overflow-hidden rounded-2xl flex flex-col h-full">
        {/* Image Section */}
        <figure className="relative w-full group-hover:cursor-pointer">
          <div className="aspect-[4/3] w-full" onClick={handlePropertyClick}>
            <ImageWithPlaceholder
              src={property?.title_image}
              alt={property?.translated_title || property?.title || "Property Image"}
              className="h-full w-full object-cover transition-all duration-300 group-hover:brightness-90"
              blurDataURL={property?.low_quality_title_image}
              loading="lazy"
            />
          </div>
          <button className="p-2 rounded-lg absolute top-2 right-2 bg-black/50 text-white z-10" aria-label="Add to favourites" onClick={handleFavourite}>
            {isFavourite ? <FaHeart /> : <FaRegHeart />}
          </button>
          <figcaption className="sr-only">{property?.translated_title || property?.title} {t("in")} {property?.state}</figcaption>
          {property?.promoted && (
            <span className="primaryTextColor absolute left-3 top-3 rounded-md bg-black px-3 py-1 text-sm font-semibold z-10">
              {t("featured")}
            </span>
          )}
        </figure>

        {/* Content Section */}
        <div className="w-full flex flex-col flex-grow p-4 gap-3 group-hover:cursor-pointer cardBg" onClick={handlePropertyClick}>
          <header className="flex flex-col gap-1">
            <div className="flex justify-between items-center mb-1">
              <span className="leadColor primaryBackgroundBg py-1.5 px-3 rounded-lg font-semibold text-xs flex items-center gap-2 max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">
                {property?.category?.image && (
                  <ReactSVG
                    src={property.category.image}
                    beforeInjection={(svg) => {
                      svg.setAttribute("style", `height: 100%; width: 100%;`);
                      svg.querySelectorAll("path").forEach((path) => {
                        path.setAttribute("style", `fill: var(--facilities-icon-color);`);
                      });
                    }}
                    className="w-4 h-4 flex items-center justify-center object-contain shrink-0"
                    alt="category icon"
                  />
                )}
                {truncate(property?.category?.translated_name || property?.category?.name, 16)}
              </span>
              <span className={`${property?.property_type === "sell" ? "primarySellBg primarySellText" : "primaryRentBg primaryRentText"} rounded-[100px] px-3 py-1 text-xs font-bold`}>
                {t(property?.property_type)}
              </span>
            </div>
            <h2 className="text-base font-bold line-clamp-1">{property?.translated_title || property?.title}</h2>
            <p className="text-xs text-gray-500 line-clamp-1">
              {`${property?.city ? property?.city + ", " : ""} ${property?.state ? property?.state + ", " : ""} ${property?.country ? property?.country : ""}`}
            </p>
          </header>

          <div className="mt-auto">
            <hr className="cardBorder -mx-4" />
            <div className="flex items-center justify-around py-3">
              {validParameters && validParameters.length > 0 ? (
                validParameters.map((parameter, index) => (
                  <React.Fragment key={index}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="!w-fit" asChild>
                          <div className="flex items-center gap-1.5 text-xs">
                            {parameter?.image && (
                              <ReactSVG
                                src={parameter.image}
                                beforeInjection={(svg) => {
                                  svg.setAttribute("style", `height: 14px; width: 14px;`);
                                  svg.querySelectorAll("path").forEach((path) => {
                                    path.setAttribute("style", `fill: var(--facilities-icon-color);`);
                                  });
                                }}
                                className="w-4 h-4 flex items-center justify-center object-contain shrink-0"
                                alt="parameter icon"
                              />
                            )}
                            <span className="font-semibold leadColor">
                              {getDisplayValueForOption(parameter)}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">{parameter?.translated_name || parameter?.name}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {index < validParameters.length - 1 && <div className="border-l cardBorder h-4" />}
                  </React.Fragment>
                ))
              ) : (
                <div className="h-4 opacity-0 text-xs">No params</div>
              )}
            </div>
            <hr className="cardBorder -mx-4" />
          </div>

          <footer className="flex items-center justify-between min-h-[48px] pt-1">
            {renderDualPrices()}

            {property?.is_premium && (
              <span className="rounded-[100px] primaryRentBg px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 shrink-0">
                <ImageWithPlaceholder src={PremiumIcon} alt="Premium Icon" className="w-5 h-5" priority={false} />
                {t("premium")}
              </span>
            )}
          </footer>
        </div>
      </article>
    </div>
  );
};

export default PropertyVerticalCard;