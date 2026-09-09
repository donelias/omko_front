"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaRegCalendarAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useTranslation } from "../context/TranslationContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import {
  getMyShortTermReservationsApi,
  cancelShortTermReservationApi,
} from "@/api/apiRoutes";

const statusBadge = (status, t) => {
  const map = {
    pending: { label: t("pending") || "Pendiente", cls: "bg-amber-100 text-amber-700" },
    confirmed: { label: t("confirmed") || "Confirmada", cls: "bg-green-100 text-green-700" },
    cancelled: { label: t("cancelled") || "Cancelada", cls: "bg-red-100 text-red-700" },
    completed: { label: t("completed") || "Completada", cls: "bg-blue-100 text-blue-700" },
  };
  const item = map[status] || { label: status, cls: "bg-gray-100 text-gray-600" };
  return <Badge className={`text-[11px] px-2 py-0.5 ${item.cls}`}>{item.label}</Badge>;
};

const formatPrice = (value, currency) => {
  if (value === null || value === undefined) return "";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(Number(value));
  } catch (error) {
    return `${currency || ""} ${value}`;
  }
};

export default function UserShortTermReservations() {
  const t = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState(null);

  const reservationsQuery = useQuery({
    queryKey: ["myShortTermReservations"],
    queryFn: async () => {
      const response = await getMyShortTermReservationsApi();
      if (!response || response.error) {
        throw new Error((response && response.message) || "No se pudieron cargar las reservas");
      }
      return response;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const reservations = reservationsQuery.data?.data || [];
  const isLoading = reservationsQuery.isLoading || reservationsQuery.isFetching;

  const handleCancel = async (item) => {
    if (!window.confirm("¿Cancelar esta reserva?")) return;
    setCancellingId(item.id);
    try {
      const res = await cancelShortTermReservationApi({ id: item.id });
      if (res?.error) {
        toast.error(res?.message || "No se pudo cancelar la reserva");
      } else {
        toast.success(res?.message || "Reserva cancelada");
        queryClient.invalidateQueries({ queryKey: ["myShortTermReservations"] });
      }
    } catch (error) {
      toast.error(error?.message || "No se pudo cancelar la reserva");
    } finally {
      setCancellingId(null);
    }
  };

  const goToProperty = (slugId) => {
    router.push(`/property-details/${slugId}?lang=${router?.query?.lang || "es"}`);
  };

  return (
    <div className="flex flex-col rounded-xl md:rounded-2xl border w-full newBorderColor bg-white">
      <div className="flex items-center justify-between border-b p-4 newBorderColor">
        <h1 className="text-base md:text-xl font-bold brandColor">
          {t("myReservations") || "Mis reservas"}
        </h1>
        <FaRegCalendarAlt className="w-5 h-5 text-gray-400" />
      </div>

      <div className="flex flex-col gap-3 p-4">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && reservations.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed newBorderColor py-14 text-center">
            <FaRegCalendarAlt className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500">
              {t("noReservations") || "Aún no tienes reservas"}
            </span>
            <span className="text-xs text-gray-400">
              {t("bookFromPropertyDetail") || "Usa el widget Disponibilidad por fechas en un alquiler"}
            </span>
          </div>
        )}

        {!isLoading &&
          reservations.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border newBorderColor p-4 sm:flex-row"
            >
              <div
                className="relative h-28 w-full overflow-hidden rounded-lg sm:h-auto sm:w-32 sm:flex-shrink-0 cursor-pointer"
                onClick={() => goToProperty(item.property?.slug_id)}
              >
                <ImageWithPlaceholder
                  src={item.property?.title_image}
                  alt={item.property?.title}
                  width={160}
                  height={120}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className="cursor-pointer truncate text-sm font-semibold brandColor hover:underline"
                    onClick={() => goToProperty(item.property?.slug_id)}
                  >
                    {item.property?.title || `#${item.property_id}`}
                  </span>
                  {statusBadge(item.status, t)}
                </div>
                <span className="text-xs text-gray-500">
                  {item.property?.city || ""}{" "}
                  {formatPrice(item.total_price, item.property?.currency)}
                </span>
                <span className="text-xs sm:text-sm">
                  {t("checkIn") || "Entrada"}: <b>{item.check_in}</b> · {t("checkOut") || "Salida"}: <b>{item.check_out}</b> · {item.nights} {t("nights") || "noches"}
                </span>
                {item.notes && (
                  <span className="truncate text-xs text-gray-400">{item.notes}</span>
                )}
                {!["cancelled", "completed"].includes(item.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cancellingId === item.id}
                    onClick={() => handleCancel(item)}
                    className="mt-1 self-start text-red-500 hover:text-red-600"
                  >
                    {t("cancelReservation") || "Cancelar reserva"}
                  </Button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}