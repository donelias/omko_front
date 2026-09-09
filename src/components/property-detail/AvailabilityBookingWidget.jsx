"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "../context/TranslationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getShortTermAvailabilityApi,
  createShortTermReservationApi,
} from "@/api/apiRoutes";
import { trackEvent } from "@/utils/analytics";

const formatTotal = (value, currency) => {
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

const AvailabilityBookingWidget = ({ property, showLoginModal, setShowLoginModal }) => {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const userToken = useSelector((state) => state.User?.jwtToken);

  const propertyId = property?.id;
  const currency = property?.currency || "DOP";

  const today = new Date().toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheck = async () => {
    if (!checkIn || !checkOut) {
      toast.error(t("selectDates") || "Selecciona las fechas de entrada y salida");
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.error(t("checkOutAfterCheckIn") || "La fecha de salida debe ser posterior a la de entrada");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await getShortTermAvailabilityApi({ property_id: propertyId, check_in: checkIn, check_out: checkOut });
      if (res?.error) {
        toast.error(res?.message || "No se pudo consultar la disponibilidad");
      } else {
        setResult(res?.data || null);
        trackEvent("check_availability", { item_id: propertyId });
      }
    } catch (error) {
      toast.error(error?.message || "No se pudo consultar la disponibilidad");
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!userToken) {
      setShowLoginModal(true);
      return;
    }
    setReserving(true);
    try {
      const res = await createShortTermReservationApi({
        property_id: propertyId,
        check_in: checkIn,
        check_out: checkOut,
        guests: guests || 1,
        notes,
      });
      if (res?.error) {
        toast.error(res?.message || "No se pudo crear la reserva");
      } else {
        toast.success(res?.message || "Reserva creada correctamente");
        queryClient.invalidateQueries({ queryKey: ["myShortTermReservations"] });
        trackEvent("book_short_term", { item_id: propertyId, nights: result?.nights });
        setResult(null);
        setCheckIn("");
        setCheckOut("");
        setGuests(1);
        setNotes("");
      }
    } catch (error) {
      toast.error(error?.message || "No se pudo crear la reserva");
    } finally {
      setReserving(false);
    }
  };

  const estimatedNightly = property?.price ? Number(property.price) / 30 : 0;

  return (
    <div className="mb-7 flex flex-col gap-4 rounded-2xl border newBorderColor bg-white p-4">
      <div className="flex flex-col gap-1">
        <h3 className="brandColor text-base font-bold">{t("availabilityTitle") || "Disponibilidad por fechas"}</h3>
        <p className="text-xs sm:text-sm text-gray-500">
          {t("availabilitySubtitle") || "Consulta fechas disponibles y reserva tu estancia"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label className="text-xs font-medium">{t("checkIn") || "Entrada"}</Label>
          <Input
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => { setCheckIn(e.target.value); setResult(null); }}
            className="w-full"
          />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs font-medium">{t("checkOut") || "Salida"}</Label>
          <Input
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => { setCheckOut(e.target.value); setResult(null); }}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label className="text-xs font-medium">{t("guests") || "Huéspedes"}</Label>
          <Input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value) || 1)}
            className="w-full"
          />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs font-medium">{t("checkAvailability") || "Consultar"}</Label>
          <Button
            onClick={handleCheck}
            disabled={loading}
            className="w-full primaryBg text-white"
          >
            {loading ? (t("checking") || "Consultando...") : (t("checkAvailability") || "Consultar disponibilidad")}
          </Button>
        </div>
      </div>

      {result && (
        <div
          className={`flex flex-col gap-2 rounded-xl border p-3 text-sm ${
            result.available
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">
              {result.available
                ? (t("available") || "Disponible")
                : (t("notAvailable") || "No disponible")}
            </span>
            <span className="text-xs opacity-80">
              {result.nights} {t("nights") || "noches"}
            </span>
          </div>
          {!result.available && (
            <ul className="list-disc pl-5 text-xs opacity-90">
              {result.reasons?.existing_reservation && (
                <li>{t("reasonExistingReservation") || "Ya existe una reserva en ese rango"}</li>
              )}
              {result.reasons?.blocked_slot && (
                <li>{t("reasonBlockedSlot") || "El propietario bloqueó esas fechas"}</li>
              )}
            </ul>
          )}
          {result.available && (
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span>{t("estimatedTotal") || "Total estimado"}</span>
                <span className="font-bold">
                  {formatTotal(estimatedNightly * result.nights, currency)}
                </span>
              </div>
              {!userToken ? (
                <Button
                  onClick={() => setShowLoginModal(true)}
                  className="w-full primaryBg text-white"
                >
                  {t("loginToBook") || "Inicia sesión para reservar"}
                </Button>
              ) : (
                <>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("bookingNotes") || "Notas (opcional)"}
                    className="w-full text-xs"
                  />
                  <Button
                    onClick={handleReserve}
                    disabled={reserving}
                    className="w-full primaryBg text-white"
                  >
                    {reserving ? (t("reserving") || "Reservando...") : (t("bookNow") || "Reservar ahora")}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailabilityBookingWidget;