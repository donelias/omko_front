"use client";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  BiBuildingHouse,
  BiClipboard,
  BiLoaderAlt,
  BiCheckCircle,
  BiXCircle,
  BiErrorCircle,
} from "react-icons/bi";
import { getMyScreeningsApi, getScreeningDetailApi, decideScreeningApi } from "@/api/apiRoutes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const statusMeta = {
  pendiente: { label: "Pendiente", className: "bg-amber-100 text-amber-700" },
  en_evaluacion: { label: "En evaluación", className: "bg-sky-100 text-sky-700" },
  aprobado: { label: "Aprobado", className: "bg-green-100 text-green-700" },
  rechazado: { label: "Rechazado", className: "bg-red-100 text-red-700" },
};

const nivelMeta = {
  alto: { label: "Perfil alto", className: "bg-green-100 text-green-700" },
  medio: { label: "Perfil medio", className: "bg-amber-100 text-amber-700" },
  bajo: { label: "Perfil bajo", className: "bg-red-100 text-red-700" },
};

const riesgoMeta = {
  bajo: { label: "Riesgo bajo", className: "bg-green-100 text-green-700" },
  medio: { label: "Riesgo medio", className: "bg-amber-100 text-amber-700" },
  alto: { label: "Riesgo alto", className: "bg-red-100 text-red-700" },
};

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function UserClientEvaluations() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [detailId, setDetailId] = useState(null);
  const [notas, setNotas] = useState("");
  const [pendingDecisionId, setPendingDecisionId] = useState(null);

  const listQuery = useQuery({
    queryKey: ["myScreenings", statusFilter],
    queryFn: async () => {
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await getMyScreeningsApi(params);
      if (!res || res.error) {
        throw new Error((res && res.message) || "No se pudieron cargar las evaluaciones");
      }
      return res;
    },
    staleTime: 20 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const paginator = listQuery.data?.data;
  const screenings = paginator?.data || listQuery.data?.data || listQuery.data || [];
  const isLoading = listQuery.isLoading || listQuery.isFetching;

  const detailQuery = useQuery({
    queryKey: ["screeningDetail", detailId],
    queryFn: async () => {
      const res = await getScreeningDetailApi(detailId);
      if (!res || res.error) throw new Error((res && res.message) || "No se pudo cargar el detalle");
      return res.data;
    },
    enabled: !!detailId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const screeningsList = Array.isArray(screenings) ? screenings : [];

  const decideMutation = useMutation({
    mutationFn: async ({ id, decision }) => {
      const res = await decideScreeningApi({ id, decision, notas: notas.trim() || undefined });
      if (!res || res.error) throw new Error((res && res.message) || "No se pudo registrar la decisión");
      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Decisión registrada");
      setNotas("");
      setDetailId(null);
      queryClient.invalidateQueries({ queryKey: ["myScreenings"] });
    },
    onError: (err) => {
      toast.error(err?.message || "No se pudo registrar la decisión");
    },
  });

  const handleDecide = async (id, decision) => {
    if (decision === "rechazado" && !notas.trim()) {
      toast.error("Indique una nota explicando el rechazo.");
      return;
    }
    setPendingDecisionId(id);
    try {
      await decideMutation.mutateAsync({ id, decision });
    } finally {
      setPendingDecisionId(null);
    }
  };

  const ia = detailQuery.data?.ia_metadata?.ia || null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl md:rounded-2xl border w-full newBorderColor bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-base md:text-xl font-bold brandColor">Evaluación de clientes</h1>
          <span className="text-xs text-gray-500">
            Formularios de depuración enviados por clientes interesados en tus propiedades.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { value: "", label: "Todas" },
            { value: "pendiente", label: "Pendientes" },
            { value: "en_evaluacion", label: "En evaluación" },
            { value: "aprobado", label: "Aprobadas" },
            { value: "rechazado", label: "Rechazadas" },
          ].map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={statusFilter === opt.value ? "default" : "outline"}
              onClick={() => setStatusFilter(opt.value)}
              className="text-xs"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && screeningsList.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed newBorderColor bg-white py-14 text-center">
            <BiClipboard className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500">No hay formularios de depuración.</span>
            <span className="text-xs text-gray-400">
              Cuando un cliente complete el cuestionario de tus propiedades lo verás aquí.
            </span>
          </div>
        )}

        {!isLoading &&
          screeningsList.map((item) => {
            const status = statusMeta[item.status] || statusMeta.pendiente;
            const nivel = nivelMeta[item.nivel] || null;
            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border newBorderColor bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-semibold text-base brandColor truncate max-w-full">
                      {item.customer_name}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      {item.property && (
                        <span className="inline-flex items-center gap-1 truncate max-w-[220px]">
                          <BiBuildingHouse className="w-3.5 h-3.5 shrink-0" />
                          {item.property.title || item.property.name}
                        </span>
                      )}
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.score != null && (
                      <Badge className="text-[11px] px-2 py-0.5">
                        Score: {item.score}
                      </Badge>
                    )}
                    {nivel && (
                      <Badge variant="outline" className={`text-[11px] px-2 py-0.5 ${nivel.className}`}>
                        {nivel.label}
                      </Badge>
                    )}
                    <Badge className={`text-[11px] px-2 py-0.5 ${status.className}`}>
                      {status.label}
                    </Badge>
                  </div>
                </div>

                {item.recomendacion_ia && (
                  <p className="rounded-lg primaryBgLight08 px-3 py-2 text-xs text-gray-600">
                    {item.recomendacion_ia}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setDetailId(item.id)}>
                    Ver detalle
                  </Button>
                </div>
              </div>
            );
          })}
      </div>

      <Dialog open={!!detailId} onOpenChange={(open) => { if (!open) setDetailId(null); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BiClipboard className="h-5 w-5" />
              Detalle de evaluación
            </DialogTitle>
          </DialogHeader>

          {detailQuery.isLoading && (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          )}

          {!detailQuery.isLoading && detailQuery.data && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 rounded-xl border newBorderColor p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-800">{detailQuery.data.customer_name}</span>
                  <Badge className={`text-[11px] px-2 py-0.5 ${(statusMeta[detailQuery.data.status] || statusMeta.pendiente).className}`}>
                    {(statusMeta[detailQuery.data.status] || statusMeta.pendiente).label}
                  </Badge>
                  <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                    Score: {detailQuery.data.score}
                  </Badge>
                  {nivelMeta[detailQuery.data.nivel] && (
                    <Badge variant="outline" className={`text-[11px] px-2 py-0.5 ${nivelMeta[detailQuery.data.nivel].className}`}>
                      {nivelMeta[detailQuery.data.nivel].label}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-3">
                  <span>Email: {detailQuery.data.customer_email || "—"}</span>
                  <span>Teléfono: {detailQuery.data.customer_phone || "—"}</span>
                  <span>Origen: {detailQuery.data.origin || "link"}</span>
                </div>
                {detailQuery.data.property && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <BiBuildingHouse className="w-3.5 h-3.5 shrink-0" />
                    {detailQuery.data.property.title || detailQuery.data.property.name} —{" "}
                    {detailQuery.data.property.city || "N/A"}
                  </span>
                )}
              </div>

              {ia && (
                <div className="flex flex-col gap-2 rounded-xl border border-dashed primaryBgLight08 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">Recomendación IA:</span>
                    {ia.recomendacion && (
                      <Badge variant="outline" className={`text-[11px] px-2 py-0.5 ${
                        ia.recomendacion === "recomendar"
                          ? "bg-green-100 text-green-700"
                          : ia.recomendacion === "no_recomendar"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {ia.recomendacion === "recomendar"
                          ? "Recomendar"
                          : ia.recomendacion === "no_recomendar"
                          ? "No recomendar"
                          : "Revisar"}
                      </Badge>
                    )}
                    {ia.nivel_riesgo && riesgoMeta[ia.nivel_riesgo] ? (
                      <Badge variant="outline" className={`text-[11px] px-2 py-0.5 ${riesgoMeta[ia.nivel_riesgo].className}`}>
                        {riesgoMeta[ia.nivel_riesgo].label}
                      </Badge>
                    ) : null}
                  </div>
                  {ia.resumen && <p className="text-xs text-gray-700">{ia.resumen}</p>}
                  {ia.observaciones && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-600">Observaciones: </span>
                      {ia.observaciones}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-gray-700">Respuestas del cliente</span>
                <div className="flex flex-col gap-2">
                  {(detailQuery.data.responses || []).map((resp) => (
                    <div key={resp.id} className="rounded-lg border newBorderColor px-3 py-2">
                      <div className="text-xs font-medium text-gray-700">
                        {resp.question ? resp.question.question_text : `Pregunta #${resp.question_id}`}
                      </div>
                      <div className="text-sm text-gray-600">{resp.value || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {detailQuery.data.status === "pendiente" || detailQuery.data.status === "en_evaluacion" ? (
                <div className="flex flex-col gap-3 rounded-xl border newBorderColor p-4">
                  <span className="text-xs font-semibold text-gray-700">Decisión del agente</span>
                  <Textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Notas para el cliente (obligatorio si rechaza)"
                    rows={3}
                  />
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pendingDecisionId === detailQuery.data.id}
                      onClick={() => handleDecide(detailQuery.data.id, "rechazado")}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <BiXCircle className="h-4 w-4" /> Rechazar
                    </Button>
                    <Button
                      size="sm"
                      disabled={pendingDecisionId === detailQuery.data.id}
                      onClick={() => handleDecide(detailQuery.data.id, "aprobado")}
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      <BiCheckCircle className="h-4 w-4" /> Aprobar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <BiErrorCircle className="h-4 w-4" />
                  {detailQuery.data.status === "aprobado"
                    ? "Solicitud aprobada. El cliente fue notificado."
                    : "Solicitud rechazada. El cliente fue notificado."}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}