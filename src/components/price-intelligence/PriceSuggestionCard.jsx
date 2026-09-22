"use client";

import { useCallback, useEffect, useState } from "react";
import { FiRefreshCw, FiBarChart2, FiTrendingUp, FiTrendingDown, FiMinus } from "react-icons/fi";
import { getPriceSuggestionApi } from "@/api/apiRoutes";
import {
  confidenceColor,
  confidenceLabelKey,
  recommendationConfig,
} from "@/lib/priceIntelligenceUtils";
import PriceDual from "./PriceDual";
import { useTranslation } from "../context/TranslationContext";
import { cn } from "@/lib/utils";

const PriceSuggestionSkeleton = () => (
  <div className="newBorder cardBg flex flex-col gap-3 rounded-2xl p-4">
    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
    <div className="grid grid-cols-2 gap-3">
      <div className="h-16 animate-pulse rounded bg-gray-100" />
      <div className="h-16 animate-pulse rounded bg-gray-100" />
    </div>
    <div className="h-8 animate-pulse rounded bg-gray-100" />
    <div className="h-9 animate-pulse rounded bg-gray-200" />
  </div>
);

const PriceSuggestionCard = ({ propertyId, currentPrice, currency = "DOP", onViewAnalysis }) => {
  const t = useTranslation();
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getPriceSuggestionApi({ propertyId, forceRefresh: false });
        if (!active) return;
        if (res && !res.error && res.data) {
          setSuggestion(res.data);
        } else {
          setError(res?.data || { notEnoughData: true });
        }
      } catch (err) {
        if (!active) return;
        setError({ notEnoughData: true });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [propertyId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setLoading(true);
    setError(null);
    try {
      const res = await getPriceSuggestionApi({ propertyId, forceRefresh: true });
      if (res && !res.error && res.data) {
        setSuggestion(res.data);
      } else {
        setError(res?.data || { notEnoughData: true });
      }
    } catch (err) {
      setError({ notEnoughData: true });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) return <PriceSuggestionSkeleton />;

  if (error || !suggestion) {
    return (
      <div className="cardBg newBorder rounded-2xl p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50">
            <FiBarChart2 className="h-4 w-4 text-amber-500" />
          </span>
          <h3 className="blackTextColor text-sm font-bold">{t("aiPriceSuggestion")}</h3>
        </div>
        <p className="text-sm text-gray-500">{t("notEnoughData")}</p>
        <button
          onClick={handleRefresh}
          className="brandColor brandBg hover:text-white mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
        >
          <FiRefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          {t("refereshSuggestion")}
        </button>
      </div>
    );
  }

  const config = recommendationConfig[suggestion?.recommendation] || recommendationConfig.review_required;
  const confidence = Number(suggestion?.confidence_score) || 0;
  const change = Number(suggestion?.price_change_percentage) || 0;
  const ChangeIcon = change > 0 ? FiTrendingUp : change < 0 ? FiTrendingDown : FiMinus;
  const changeColor = change > 0 ? "text-emerald-600" : change < 0 ? "text-red-600" : "text-sky-600";

  const trendKey = suggestion?.market_trend === "hot"
    ? "marketHot"
    : suggestion?.market_trend === "slow"
      ? "marketSlow"
      : "marketBalanced";

  const investment = suggestion?.investment_analysis;

  return (
    <div className="cardBg newBorder flex flex-col gap-4 rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="primaryBackgroundBg flex h-9 w-9 items-center justify-center rounded-full">
            <FiBarChart2 className="brandColor h-4 w-4" />
          </span>
          <div>
            <h3 className="blackTextColor text-sm font-bold leading-tight">{t("aiPriceSuggestion")}</h3>
            <p className="text-[11px] font-medium text-gray-500">{t(trendKey)}</p>
          </div>
        </div>
        <span className={cn("whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold", config.bg, config.color, config.border)}>
          {t(config.key)}
        </span>
      </div>

      {/* Price comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-[11px] font-medium text-gray-500">{t("currentPrice")}</p>
          <PriceDual
            value={currentPrice}
            currency={currency}
            valueClassName="blackTextColor break-words text-base font-bold"
          />
        </div>
        <div className={cn("rounded-xl p-3", config.bg)}>
          <p className={cn("text-[11px] font-medium", config.color)}>{t("suggestedPrice")}</p>
          <PriceDual
            value={suggestion?.suggested_price}
            currency={currency}
            valueClassName={cn("break-words text-base font-bold", config.color)}
            secondaryClassName="opacity-70"
          />
        </div>
      </div>

      {/* Price change indicator */}
      <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-200 px-3 py-2">
        <span className="text-[11px] font-medium text-gray-500">{t("priceChangePercentage")}</span>
        <span className={cn("flex items-center gap-1 text-sm font-bold", changeColor)}>
          <ChangeIcon className="h-4 w-4" />
          {change > 0 ? "+" : ""}{change.toFixed(1)}%
        </span>
      </div>

      {/* ROI compacto */}
      {investment ? (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50/60 px-3 py-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wide text-emerald-700/70">
              {t("investmentAnalysis")}
            </span>
            <span className="text-xs font-bold text-emerald-700">
              {investment?.net_yield_percent ?? "—"}% {t("roiYieldNet")}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-medium text-gray-400">{t("investmentPayback")}</span>
            {investment?.payback_years ? (
              <span className="text-xs font-bold text-gray-700">
                ~{investment.payback_years}a · {investment.payback_months}m
              </span>
            ) : (
              <span className="text-xs text-gray-400">{t("investmentPaybackNoData")}</span>
            )}
          </div>
        </div>
      ) : null}

      {/* Confidence */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-medium text-gray-500">{t("confidenceScore")}</span>
          <span className="text-xs font-semibold text-gray-700">
            {confidence.toFixed(1)}% · {t(confidenceLabelKey(confidence))}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(confidence, 100)}%`, backgroundColor: confidenceColor(confidence) }}
          />
        </div>
      </div>

      {/* Reasoning */}
      {suggestion?.reasoning && (
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="mb-1 text-[11px] font-semibold text-gray-500">
            {t("priceAnalysisOverview")} · {t("dataByAI")}
          </p>
          <p className="whitespace-pre-line text-xs leading-relaxed text-gray-600">
            {suggestion.reasoning}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center gap-2">
        <button
          onClick={onViewAnalysis}
          className="blackTextColor bg-white primaryBackgroundBg hover:bg-primary/10 flex-1 rounded-lg border px-3 py-2 text-center text-xs font-semibold"
        >
          {t("viewFullAnalysis")}
        </button>
        <button
          onClick={handleRefresh}
          title={t("refereshSuggestion")}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
        >
          <FiRefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
        </button>
      </div>
    </div>
  );
};

export default PriceSuggestionCard;