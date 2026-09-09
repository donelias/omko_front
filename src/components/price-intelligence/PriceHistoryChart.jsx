"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Line = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Line),
  { ssr: false }
);

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

import { formatPriceCompact } from "@/lib/priceIntelligenceUtils";

if (typeof window !== "undefined") {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
  );
}

const PriceHistoryChart = ({ data = [], currency = "DOP", height = 240 }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const labels = data.map((point) => point.label || point.date || "");
    const values = data.map((point) =>
      point.price !== undefined ? point.price : point.average_price
    );

    return {
      labels,
      datasets: [
        {
          label: "Precio",
          data: values,
          borderColor: "#0d9488",
          backgroundColor: "rgba(13, 148, 136, 0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: "#0d9488",
          borderWidth: 2,
        },
      ],
    };
  }, [data]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) =>
              ` ${formatPriceCompact(context.parsed.y, currency)}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 8, font: { size: 11 } } },
        y: {
          grid: { color: "rgba(0,0,0,0.06)" },
          ticks: {
            font: { size: 11 },
            callback: (value) => formatPriceCompact(value, currency),
          },
        },
      },
    }),
    [currency]
  );

  if (!chartData) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-gray-400">
        No data
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default PriceHistoryChart;