"use client";

import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import { useTranslation } from "../context/TranslationContext";
import PriceDual from "./PriceDual";
import { cn } from "@/lib/utils";

const similarityBadge = {
  high: { key: "similarityHigh", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  medium: { key: "similarityMedium", cls: "bg-sky-50 text-sky-600 border-sky-200" },
  low: { key: "similarityLow", cls: "bg-gray-100 text-gray-500 border-gray-200" },
};

const ComparableCard = ({ item, currency }) => {
  const t = useTranslation();
  const badge = similarityBadge[item?.similarity] || similarityBadge.low;

  return (
    <div className="cardBg newBorder overflow-hidden rounded-xl">
      <div className="relative h-32 w-full">
        {item?.image ? (
          <ImageWithPlaceholder
            src={item.image}
            alt={item?.title || "Comparable property"}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
            {t("noImagesFound")}
          </div>
        )}
        <span className={cn("absolute top-2 left-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold backdrop-blur", badge.cls)}>
          {t(badge.key)}
        </span>
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className="line-clamp-1 text-xs font-semibold text-gray-700">
          {item?.title || "—"}
        </p>
        <PriceDual
          value={item?.price}
          currency={item?.currency || currency}
          valueClassName="blackTextColor text-sm font-bold"
        />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-medium text-gray-500">
          {item?.price_per_sqm ? (
            <span>
              <PriceDual
                value={item.price_per_sqm}
                currency={item?.currency || currency}
                valueClassName="font-semibold"
                secondaryClassName="text-[9px]"
              />
              {t("perSqm")}
            </span>
          ) : null}
          {item?.area ? <span>{item.area} m²</span> : null}
          {item?.bedrooms ? <span>{item.bedrooms} bd</span> : null}
          {item?.bathrooms ? <span>{item.bathrooms} ba</span> : null}
        </div>
        {item?.location ? (
          <p className="truncate text-[11px] text-gray-400">{item.location}</p>
        ) : null}
      </div>
    </div>
  );
};

const ComparablesGrid = ({ comparables = [], currency = "DOP", limit = 9 }) => {
  const t = useTranslation();
  const visible = Array.isArray(comparables) ? comparables.slice(0, limit) : [];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="blackTextColor text-sm font-bold">{t("comparableProperties")}</h4>
          <p className="text-[11px] text-gray-500">{t("comparablePropertiesSubtitle")}</p>
        </div>
        {comparables?.length > 0 && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
            {comparables.length}
          </span>
        )}
      </div>
      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">{t("noPropertiesFound")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {visible.map((item, idx) => (
            <ComparableCard key={item?.id || idx} item={item} currency={currency} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ComparablesGrid;