"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { useTranslation } from "../context/TranslationContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getPropertyListApi,
  reserveProjectUnitApi,
} from "@/api/apiRoutes";
import { showLoginSwal } from "@/utils/helperFunction";

const unitStatusBadge = (status, t) => {
  const map = {
    available: { label: t("unitAvailable") || "Disponible", cls: "bg-green-100 text-green-700" },
    low_stock: { label: t("unitLowStock") || "Últimas unidades", cls: "bg-amber-100 text-amber-700" },
    sold_out: { label: t("unitSoldOut") || "Agotado", cls: "bg-red-100 text-red-700" },
    inactive: { label: t("unitInactive") || "Inactivo", cls: "bg-gray-100 text-gray-600" },
  };
  const item = map[status] || { label: status || "", cls: "bg-gray-100 text-gray-600" };
  return <Badge className={`text-[11px] px-2 py-0.5 ${item.cls}`}>{item.label}</Badge>;
};

const formatPrice = (value, currency) => {
  if (!value) return "";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(Number(value));
  } catch (error) {
    return `${currency || ""} ${value}`;
  }
};

const UnitCard = ({ unit, onReserved, t }) => {
  const userToken = useSelector((state) => state.User?.jwtToken);
  const [reserving, setReserving] = useState(false);

  const total = Number(unit.total_units) || 0;
  const available = Number(unit.available_units) || 0;
  const reserved = Number(unit.reserved_units) || 0;
  const sold = Number(unit.sold_units) || 0;
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;

  const handleReserve = async () => {
    if (!userToken) {
      showLoginSwal("oops", "plzLoginFirstToBook", () => {}, t);
      return;
    }
    setReserving(true);
    try {
      const res = await reserveProjectUnitApi({
        property_id: unit.id,
        delta_units: 1,
        notes: "",
      });
      if (res?.error) {
        toast.error(res?.message || "No se pudo reservar la unidad");
      } else {
        toast.success(res?.message || "Unidad reservada");
        onReserved?.();
      }
    } catch (error) {
      toast.error(error?.message || "No se pudo reservar la unidad");
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border newBorderColor bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold brandColor">{unit.unit_code || unit.title}</span>
          <span className="text-xs text-gray-500">
            {formatPrice(unit.price, unit.currency)}
          </span>
        </div>
        {unitStatusBadge(unit.unit_status, t)}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <span>{t("unitProgress") || "Disponibilidad"}</span>
          <span>{available} / {total}</span>
        </div>
        <Progress value={pct} className="h-2" />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
        <span className="rounded-md bg-green-50 px-2 py-0.5 text-green-700">
          {t("available") || "Disponibles"}: {available}
        </span>
        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-amber-700">
          {t("reserved") || "Reservadas"}: {reserved}
        </span>
        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-blue-700">
          {t("sold") || "Vendidas"}: {sold}
        </span>
      </div>

      <Button
        onClick={handleReserve}
        disabled={reserving || available < 1 || unit.unit_status === "sold_out"}
        className="w-full primaryBg text-white disabled:opacity-50"
      >
        {reserving
          ? (t("reserving") || "Reservando...")
          : available < 1 || unit.unit_status === "sold_out"
            ? (t("soldOut") || "Agotado")
            : (t("reserveUnit") || "Reservar unidad")}
      </Button>
    </div>
  );
};

const ProjectInventoryWidget = ({ project }) => {
  const t = useTranslation();
  const [reload, setReload] = useState(false);

  const projectId = project?.id;

  const [units, setUnits] = useState(null);
  const loading = units === null;

  useEffect(() => {
    if (!projectId) return;
    getPropertyListApi({
      project_id: projectId,
      is_project_unit: 1,
      limit: 50,
    })
      .then((res) => setUnits(res?.data || []))
      .catch(() => setUnits([]));
  }, [projectId, reload]);

  return (
    <div className="mb-7 flex flex-col gap-4 rounded-2xl border newBorderColor bg-white p-4">
      <div className="flex flex-col gap-1">
        <h3 className="brandColor text-base font-bold">{t("onPlanUnits") || "Unidades On-Plan"}</h3>
        <p className="text-xs sm:text-sm text-gray-500">
          {t("onPlanUnitsSubtitle") || "Inventario en preventa disponible para reservar"}
        </p>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!loading && units?.length > 0 && (
        <div className="flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-1">
          {units.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              t={t}
              onReserved={() => setReload((v) => !v)}
            />
          ))}
        </div>
      )}

      {!loading && units?.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed newBorderColor py-10 text-center">
          <span className="text-sm text-gray-500">
            {t("noOnPlanUnits") || "No hay unidades on-plan disponibles en este proyecto"}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProjectInventoryWidget;