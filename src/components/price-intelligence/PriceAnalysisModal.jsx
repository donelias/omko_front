"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getPriceAnalysisApi, getPriceTrendsApi } from "@/api/apiRoutes";
import { useTranslation } from "../context/TranslationContext";
import {
  confidenceColor,
  formatPriceValue,
  marketConditionKey,
  marketTrendToKey,
  recommendationConfig,
  trendConfig,
} from "@/lib/priceIntelligenceUtils";
import PriceHistoryChart from "./PriceHistoryChart";
import ComparablesGrid from "./ComparablesGrid";
import PriceDual from "./PriceDual";
import { cn } from "@/lib/utils";
import { FiTrendingUp, FiTrendingDown, FiMinus } from "react-icons/fi";

const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
      active
        ? "primaryBackgroundBg brandColor"
        : "text-gray-500 hover:bg-gray-50"
    )}
  >
    {label}
  </button>
);

const OverviewTab = ({ data, currency }) => {
  const t = useTranslation();
  const suggestion = data?.suggestion;
  const market = data?.market_analysis;
  const investment = data?.investment_analysis;
  const position = data?.market_position;

  if (!suggestion) {
    return <p className="py-8 text-center text-sm text-gray-400">{t("noSuggestion")}</p>;
  }

  const config = recommendationConfig[suggestion?.recommendation] || recommendationConfig.review_required;
  const confidence = Number(suggestion?.confidence_score) || 0;
  const change = Number(suggestion?.price_change_percentage) || 0;
  const ChangeIcon = change > 0 ? FiTrendingUp : change < 0 ? FiTrendingDown : FiMinus;
  const changeColor = change > 0 ? "text-emerald-600" : change < 0 ? "text-red-600" : "text-sky-600";

  const demand = Number(market?.market_demand) || null;
  const marketCondition = demand === null ? "balanced" : demand >= 80 ? "hot" : demand <= 40 ? "slow" : "balanced";
  const priceRange = market
    ? {
        min: Math.max(0, Number(market?.average_price) - Number(market?.std_deviation || 0) * 1.5),
        max: Number(market?.average_price) + Number(market?.std_deviation || 0) * 1.5,
      }
    : null;

  const percentile = Number(position?.price_percentile);
  const hasPercentile = !isNaN(percentile) && position?.price_percentile !== null;
  const appreciation = Number(position?.annual_appreciation_percent) || 0;
  const appreciationColor = appreciation >= 0 ? "text-emerald-600" : "text-red-600";
  const avgDays = Number(market?.avg_days_on_market);

  return (
    <div className="flex flex-col gap-4">
      {/* Suggestion summary */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500">
            {t("aiPriceSuggestion")}
          </h4>
          <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", config.bg, config.color, config.border)}>
            {t(config.key)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] text-gray-500">{t("currentPrice")}</p>
            <PriceDual
              value={data?.property?.price}
              currency={currency}
              valueClassName="text-base font-bold text-gray-800"
            />
          </div>
          <div>
            <p className={cn("text-[11px]", config.color)}>{t("suggestedPrice")}</p>
            <PriceDual
              value={suggestion?.suggested_price}
              currency={currency}
              valueClassName={cn("text-base font-bold", config.color)}
              secondaryClassName="opacity-70"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
          <span className="text-[11px] font-medium text-gray-500">{t("priceChangePercentage")}</span>
          <span className={cn("flex items-center gap-1 text-sm font-bold", changeColor)}>
            <ChangeIcon className="h-4 w-4" />
            {change > 0 ? "+" : ""}{change.toFixed(1)}%
          </span>
        </div>

        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[11px]">
            <span className="text-gray-500">{t("confidenceScore")}</span>
            <span className="font-semibold text-gray-700">{confidence.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full" style={{ width: `${Math.min(confidence, 100)}%`, backgroundColor: confidenceColor(confidence) }} />
          </div>
        </div>

        {suggestion?.reasoning && (
          <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-gray-600">
            {suggestion.reasoning}
          </p>
        )}
      </div>

      {/* Market analysis */}
      {market ? (
        <div className="rounded-xl border border-gray-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500">
              {t("marketAnalysis")}
            </h4>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
              {t(marketConditionKey(marketCondition))}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat
              label={t("averagePrice")}
              value={
                <PriceDual
                  value={market?.average_price}
                  currency={currency}
                  valueClassName="text-sm font-bold text-gray-800"
                />
              }
            />
            <Stat
              label={t("medianPrice")}
              value={
                <PriceDual
                  value={market?.median_price}
                  currency={currency}
                  valueClassName="text-sm font-bold text-gray-800"
                />
              }
            />
            <Stat
              label={t("pricePerSqm")}
              value={
                <PriceDual
                  value={market?.price_per_sqm}
                  currency={currency}
                  valueClassName="text-sm font-bold text-gray-800"
                />
              }
            />
            <Stat
              label={t("priceRange")}
              value={`${formatPriceValue(priceRange?.min, currency)} – ${formatPriceValue(priceRange?.max, currency)}`}
            />
            <Stat label={t("marketDemand")} value={demand !== null ? `${demand}%` : "—"} />
            <Stat
              label={t("daysOnMarketLabel")}
              value={!isNaN(avgDays) && avgDays > 0 ? `${avgDays} d` : "—"}
            />
            <Stat label={t("sampleCount")} value={market?.sample_count || "—"} />
          </div>
        </div>
      ) : null}

      {/* Investment analysis (ROI) */}
      {investment ? (
        <div className="rounded-xl border border-gray-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500">
              {t("investmentAnalysis")}
            </h4>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
              {investment.gross_yield_percent}% {t("roiYield")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat
              label={t("estimatedMonthlyRent")}
              value={
                <PriceDual
                  value={investment?.estimated_monthly_rent}
                  currency={currency}
                  valueClassName="text-sm font-bold text-gray-800"
                />
              }
            />
            <Stat
              label={t("estimatedAnnualRent")}
              value={
                <PriceDual
                  value={investment?.estimated_annual_rent}
                  currency={currency}
                  valueClassName="text-sm font-bold text-gray-800"
                />
              }
            />
            <Stat label={t("roiYieldNet")} value={`${investment?.net_yield_percent ?? "—"}%`} />
            <Stat
              label={t("netAnnualIncome")}
              value={
                <PriceDual
                  value={investment?.net_annual_income}
                  currency={currency}
                  valueClassName="text-sm font-bold text-gray-800"
                />
              }
            />
            <Stat label={t("estimatedAnnualExpenses")} value={investment?.estimated_annual_expenses ? formatPriceValue(investment.estimated_annual_expenses, currency) : "—"} />
            <Stat
              label={t("investmentPayback")}
              value={
                investment?.payback_years
                  ? t("investmentPaybackYears").replace("%", investment.payback_years).replace("%", investment.payback_months)
                  : t("investmentPaybackNoData")
              }
            />
          </div>

          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-400">
            {Object.entries(investment?.expense_rates || {}).map(([key, value]) => (
              <span key={key}>
                {t(`expense${key[0].toUpperCase()}${key.slice(1)}`)}: {value}%
              </span>
            ))}
            <span>· {t("estimatedOn")} {t("estimatedOnSuggestedPrice")}</span>
          </p>
        </div>
      ) : null}

      {/* Market position */}
      {position ? (
        <div className="rounded-xl border border-gray-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500">
              {t("marketPosition")}
            </h4>
            {hasPercentile && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                P{percentile} · {t("pricePercentile")}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat
              label={t("annualAppreciation")}
              value={appreciation !== 0 ? `${appreciation > 0 ? "+" : ""}${appreciation}%` : "0%"}
            />
            <Stat
              label={t("projectedPriceYearly")}
              value={
                <PriceDual
                  value={position?.projected_price_1y}
                  currency={currency}
                  valueClassName="text-sm font-bold text-gray-800"
                />
              }
            />
            <Stat
              label={t("projectedPriceFiveYears")}
              value={
                <PriceDual
                  value={position?.projected_price_5y}
                  currency={currency}
                  valueClassName="text-sm font-bold text-gray-800"
                />
              }
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="rounded-lg bg-gray-50 p-2.5">
    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
    <p className="mt-0.5 text-sm font-bold text-gray-800">{value}</p>
  </div>
);

const HistoryTab = ({ data, currency }) => {
  const t = useTranslation();
  const history = (data?.price_history || []).map((h) => ({
    label: String(h?.created_at || "").slice(0, 10),
    price: Number(h?.price),
  }));

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500">{t("tabPriceHistory")}</h4>
      {history.length > 0 ? (
        <PriceHistoryChart data={history} currency={currency} />
      ) : (
        <p className="py-8 text-center text-sm text-gray-400">{t("noHistoryData") || "No price history available."}</p>
      )}
    </div>
  );
};

const TrendsTab = ({ location, propertyType, currency }) => {
  const t = useTranslation();
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchTrends = async () => {
      try {
        const res = await getPriceTrendsApi({ location: location || "", days: 90 });
        if (active && res && !res.error) setTrends(res?.data || null);
      } catch (err) {
        /* noop */
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchTrends();
    return () => {
      active = false;
    };
  }, [location, propertyType]);

  const points = (trends?.trends || []).map((point) => ({
    label: String(point?.date || "").slice(0, 10),
    average_price: Number(point?.average_price) || 0,
  }));

  const change = Number(trends?.price_change_percentage) || 0;
  const trendKey = change > 2 ? "increasing" : change < -2 ? "decreasing" : "stable";
  const tc = trendConfig[trendKey];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500">
          {t("tabMarketTrends")} · {location || "—"}
        </h4>
        {!loading && trends && (
          <span className={cn("flex items-center gap-1 text-sm font-bold", tc.color)}>
            <TrendArrow trend={trendKey} />
            {change > 0 ? "+" : ""}{change.toFixed(1)}%
          </span>
        )}
      </div>
      {loading ? (
        <div className="flex h-[240px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
        </div>
      ) : points.length > 0 ? (
        <PriceHistoryChart data={points} currency={currency} />
      ) : (
        <p className="py-8 text-center text-sm text-gray-400">{t("noHistoryData") || "No trend data available."}</p>
      )}
    </div>
  );
};

const TrendArrow = ({ trend }) => {
  if (trend === "increasing") return <FiTrendingUp className="h-4 w-4" />;
  if (trend === "decreasing") return <FiTrendingDown className="h-4 w-4" />;
  return <FiMinus className="h-4 w-4" />;
};

const PriceAnalysisModal = ({ open, onOpenChange, propertyId, property }) => {
  const t = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState(null);

  const currency = property?.currency || "DOP";
  const location = property?.state || property?.city || "";
  const propertyType = property?.property_type || "";

  const handleOpenChange = (openVal) => {
    if (openVal) setActiveTab("overview");
    onOpenChange(openVal);
  };

  useEffect(() => {
    if (!open || !propertyId) return;

    let active = true;
    const loadAnalysis = async () => {
      const res = await getPriceAnalysisApi(propertyId);
      if (!active) return;
      setData(res && !res.error ? res?.data || null : null);
    };

    loadAnalysis();
    return () => {
      active = false;
    };
  }, [open, propertyId]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="blackTextColor">{t("priceAnalysis")}</DialogTitle>
          <DialogDescription className="flex items-center gap-1">
            {data?.property?.title || property?.title || ""} · {t("aiPriceSuggestion")}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="scrollbar-thin mt-1 flex gap-1 overflow-x-auto border-b border-gray-100 pb-2">
          <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label={t("priceAnalysisOverview")} />
          <TabButton active={activeTab === "comparables"} onClick={() => setActiveTab("comparables")} label={t("tabComparables")} />
          <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")} label={t("tabPriceHistory")} />
          <TabButton active={activeTab === "trends"} onClick={() => setActiveTab("trends")} label={t("tabMarketTrends")} />
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-1">
          {!data ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
            </div>
          ) : activeTab === "overview" ? (
            <OverviewTab data={data} currency={currency} />
          ) : activeTab === "comparables" ? (
            <ComparablesGrid comparables={data?.comparable_properties} currency={currency} />
          ) : activeTab === "history" ? (
            <HistoryTab data={data} currency={currency} />
          ) : (
            <TrendsTab location={location} propertyType={propertyType} currency={currency} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PriceAnalysisModal;