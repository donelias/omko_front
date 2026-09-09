"use client";

import { useEffect, useMemo, useState } from "react";
import { FiBarChart2, FiSearch } from "react-icons/fi";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import { useTranslation } from "../context/TranslationContext";
import { getAddedPropertiesApi, getBulkSuggestionsApi } from "@/api/apiRoutes";
import {
  confidenceColor,
  recommendationConfig,
} from "@/lib/priceIntelligenceUtils";
import PriceAnalysisModal from "../price-intelligence/PriceAnalysisModal";
import PriceDual from "../price-intelligence/PriceDual";
import { cn } from "@/lib/utils";

const StatCard = ({ label, value, icon: Icon, accent = "text-gray-900" }) => (
  <div className="cardBg flex items-center gap-3 rounded-2xl border border-gray-100 p-4 shadow-sm">
    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50">
      <Icon className={cn("h-5 w-5", accent)} />
    </div>
    <div>
      <p className="text-2xl leading-none font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-gray-500">{label}</p>
    </div>
  </div>
);

const RecommendationRow = ({ item, currency, onView }) => {
  const t = useTranslation();
  const config = recommendationConfig[item?.recommendation] || recommendationConfig.review_required;
  const confidence = Number(item?.confidence_score) || 0;
  const current = item?.price || 0;
  const suggested = item?.suggested_price;
  const change = suggested && current ? ((suggested - current) / current) * 100 : null;

  return (
    <div className="cardBg flex flex-col gap-3 rounded-2xl border border-gray-100 p-3 shadow-sm sm:flex-row sm:items-center">
      {/* Thumbnail */}
      <div className="relative h-20 w-full flex-shrink-0 overflow-hidden rounded-xl sm:w-28">
        {item?.title_image ? (
          <ImageWithPlaceholder
            src={item.title_image}
            alt={item?.title || "Property"}
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
            {t("noImagesFound")}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-bold text-gray-800">{item?.title || "—"}</p>
          <span className={cn("whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold", config.bg, config.color, config.border)}>
            {t(config.key)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-gray-500">
          {[item?.city, item?.state].filter(Boolean).join(", ") || "—"}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex flex-col text-xs text-gray-700">
            <span className="font-semibold">{t("currentPrice")}:</span>
            <PriceDual
              value={current}
              currency={currency}
              valueClassName="font-bold"
              secondaryClassName="text-[10px] text-gray-400"
            />
          </span>
          {suggested ? (
            <span className={cn("flex flex-col text-xs", change < 0 ? "text-red-600" : change > 0 ? "text-emerald-600" : "text-sky-600")}>
              <span className="font-bold">{t("suggestedPrice")}:{change !== null ? ` (${change > 0 ? "+" : ""}${change.toFixed(1)}%)` : ""}</span>
              <PriceDual
                value={suggested}
                currency={currency}
                valueClassName="font-bold"
                secondaryClassName="text-[10px] opacity-70"
              />
            </span>
          ) : (
            <span className="text-xs text-amber-600">{t("notEnoughData")}</span>
          )}
        </div>

        {suggested ? (
          <div className="mt-2 max-w-xs">
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>{t("confidenceScore")}</span>
              <span>{confidence.toFixed(1)}%</span>
            </div>
            <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full" style={{ width: `${Math.min(confidence, 100)}%`, backgroundColor: confidenceColor(confidence) }} />
            </div>
          </div>
        ) : null}
      </div>

      {/* Action */}
      <button
        onClick={() => onView(item)}
        className="brandColor brandBg hover:text-white flex flex-shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
      >
        <FiBarChart2 className="h-3.5 w-3.5" />
        {t("viewAnalysis")}
      </button>
    </div>
  );
};

const AgentPriceDashboard = () => {
  const t = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalState, setModalState] = useState({ open: false, property: null });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getAddedPropertiesApi({
          request_status: "approved",
          added_as: "agent",
          limit: "1000",
        });
        if (!active) return;
        const list = res?.data || [];
        if (list.length > 0) {
          const ids = list.map((p) => p.id);
          const bulk = await getBulkSuggestionsApi(ids);
          if (active) {
            const suggestionMap = {};
            (bulk?.data || []).forEach((s) => {
              suggestionMap[s.property_id] = s;
            });
            setRows(
              list.map((p) => ({
                ...p,
                suggested_price: suggestionMap[p.id]?.suggested_price,
                confidence_score: suggestionMap[p.id]?.confidence_score,
                recommendation: suggestionMap[p.id]?.recommendation,
              }))
            );
          }
        } else if (active) {
          setRows([]);
        }
      } catch (error) {
        if (!active) return;
        console.error("Error loading price dashboard:", error);
        setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const withSuggestion = rows.filter((r) => r.suggested_price);
    const confidences = withSuggestion.map((r) => Number(r.confidence_score) || 0);
    const avgConf =
      confidences.length > 0
        ? confidences.reduce((a, b) => a + b, 0) / confidences.length
        : 0;
    const byRecommendation = {
      increase: rows.filter((r) => r.recommendation === "increase").length,
      decrease: rows.filter((r) => r.recommendation === "decrease").length,
      maintain: rows.filter((r) => r.recommendation === "maintain").length,
      review_required: rows.filter(
        (r) => !r.suggested_price || r.recommendation === "review_required"
      ).length,
    };
    return { withSuggestion, avgConf, byRecommendation };
  }, [rows]);

  const filteredRows = useMemo(() => {
    let result = rows;
    if (filter !== "all") {
      if (filter === "review_required") {
        result = result.filter(
          (r) => !r.suggested_price || r.recommendation === "review_required"
        );
      } else {
        result = result.filter((r) => r.recommendation === filter);
      }
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          (r?.title || "").toLowerCase().includes(q) ||
          (r?.city || "").toLowerCase().includes(q) ||
          (r?.state || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [rows, filter, search]);

  const filters = [
    { key: "all", label: t("prFilterAll") },
    { key: "decrease", label: t("prFilterDecrease") },
    { key: "increase", label: t("prFilterIncrease") },
    { key: "maintain", label: t("prFilterMaintain") },
    { key: "review_required", label: t("prFilterReview") },
  ];

  const handleView = (item) => {
    setModalState({ open: true, property: item });
  };

  return (
    <div className="container mx-auto flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">{t("priceDashboard")}</h1>
        <p className="text-sm text-gray-500">{t("priceDashboardDescription")}</p>
      </div>

      {/* Stats */}
      {!loading && rows.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label={t("prAnalyzedProperties")} value={rows.length} icon={FiBarChart2} accent="text-teal-600" />
          <StatCard label={t("prPropertiesWithSuggestions")} value={stats.withSuggestion.length} icon={FiBarChart2} accent="text-sky-600" />
          <StatCard label={t("prAvgConfidence")} value={`${stats.avgConf.toFixed(1)}%`} icon={FiBarChart2} accent="text-emerald-600" />
          <StatCard label={t("prNoSuggestionCount")} value={stats.byRecommendation.review_required} icon={FiBarChart2} accent="text-amber-600" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              filter === f.key
                ? "border-primary primaryBgLight08 primaryColor"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            )}
          >
            {f.label}
          </button>
        ))}
        <div className="relative ml-auto w-full max-w-xs">
          <FiSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="w-full rounded-lg border border-gray-200 py-2 pr-3 pl-9 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex animate-pulse gap-3 rounded-2xl border border-gray-100 bg-white p-3">
              <div className="h-20 w-28 flex-shrink-0 rounded-xl bg-gray-100" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-1/3 rounded bg-gray-100" />
                <div className="h-3 w-1/4 rounded bg-gray-100" />
                <div className="h-2 w-1/2 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="cardBg flex flex-col items-center gap-2 rounded-2xl border border-gray-100 py-16 text-gray-400">
          <FiBarChart2 className="h-10 w-10" />
          <p className="text-sm font-medium">{t("noPropertiesFound")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredRows.map((item) => (
            <RecommendationRow
              key={item.id}
              item={item}
              currency={item?.currency || "DOP"}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Analysis Modal */}
      <PriceAnalysisModal
        open={modalState.open}
        onOpenChange={(open) => setModalState((prev) => ({ ...prev, open }))}
        propertyId={modalState.property?.id}
        property={modalState.property}
      />
    </div>
  );
};

export default AgentPriceDashboard;