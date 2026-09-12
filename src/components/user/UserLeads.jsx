"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BiBuildingHouse, BiLockAlt, BiSearch, BiUserPlus, BiEditAlt } from "react-icons/bi";
import { toast } from "react-hot-toast";
import { useTranslation } from "../context/TranslationContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getMyLeadsApi, unlockLeadApi } from "@/api/apiRoutes";

const statusLabel = (status, fallback) => {
  const map = {
    nuevo: fallback("new") || "Nuevo",
    contactado: fallback("contacted") || "Contactado",
    calificado: fallback("qualified") || "Calificado",
    cerrado: fallback("closed") || "Cerrado",
    perdido: fallback("lost") || "Perdido",
  };
  return map[status] || status;
};

const originLabel = (origin, fallback) => {
  const map = {
    formulario: fallback("form") || "Formulario",
    telefono: fallback("phone") || "Teléfono",
    whatsapp: "WhatsApp",
    email: "Email",
    pagina: fallback("webPage") || "Página web",
    meta: "Meta Ads",
  };
  return map[origin] || origin;
};

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function UserLeads() {
  const t = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const lang = router?.query?.lang;

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [unlockingId, setUnlockingId] = useState(null);

  const leadsQuery = useQuery({
    queryKey: ["agentLeads", appliedSearch],
    queryFn: async () => {
      const params = { limit: 50 };
      if (appliedSearch.trim()) params.search = appliedSearch.trim();
      const response = await getMyLeadsApi(params);
      if (!response || response.error) {
        throw new Error((response && response.message) || "No se pudieron cargar los leads");
      }
      return response;
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const leads = leadsQuery.data?.data || [];
  const access = leadsQuery.data?.contact_access || { available: false, unlimited: false, remaining: 0 };
  const isLoading = leadsQuery.isLoading || leadsQuery.isFetching;

  const goToPlans = () => {
    router.push({ pathname: "/user/my-subscriptions", query: { ...(lang ? { lang } : {}), userType: "agencia" } }, `/user/my-subscriptions?${new URLSearchParams({ ...(lang ? { lang } : {}), userType: "agencia" }).toString()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
  };

  const handleUnlock = async (lead) => {
    setUnlockingId(lead.id);
    try {
      const res = await unlockLeadApi({ lead_id: lead.id });
      if (res?.error) {
        if (res?.code === "plan_required") {
          toast.error(res?.message || "Necesitas un plan con acceso a contactos");
          goToPlans();
          return;
        }
        toast.error(res?.message || "No se pudo desbloquear el contacto");
        return;
      }
      toast.success(res?.message || "Contacto desbloqueado");
      queryClient.invalidateQueries({ queryKey: ["agentLeads"] });
    } catch (error) {
      toast.error(error?.message || "No se pudo desbloquear el contacto");
    } finally {
      setUnlockingId(null);
    }
  };

  const renderContact = (lead) => {
    if (!lead.contact_hidden) {
      return (
        <div className="flex flex-col gap-1 min-w-0">
          {lead.has_email && <span className="text-sm brandColor truncate">{lead.email}</span>}
          {lead.has_telefono && <span className="text-sm text-gray-600 truncate">{lead.telefono}</span>}
          {lead.has_whatsapp && lead.whatsapp !== lead.telefono && (
            <span className="text-sm text-gray-600 truncate">WhatsApp: {lead.whatsapp}</span>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1.5 min-w-0">
        {lead.has_email && <span className="text-sm text-gray-500 truncate">{lead.email}</span>}
        {lead.has_telefono && <span className="text-sm text-gray-500 truncate">{lead.telefono}</span>}
        {lead.has_whatsapp && <span className="text-sm text-gray-500 truncate">{lead.whatsapp}</span>}
        <Button
          variant="outline"
          size="sm"
          disabled={unlockingId === lead.id}
          onClick={() => handleUnlock(lead)}
          className="flex w-fit items-center gap-1.5"
        >
          <BiLockAlt className="w-4 h-4" />
          <span>{t("unlockContact") || "Desbloquear contacto"}</span>
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col rounded-xl md:rounded-2xl border w-full newBorderColor bg-white">
      <div className="flex flex-col gap-3 border-b p-4 newBorderColor sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base md:text-xl font-bold brandColor">
            {t("myLeads") || "Mis leads"}
          </h1>
          <span className="text-xs text-gray-500">
            {access.available
              ? access.unlimited
                ? t("leadAccessUnlimited") || "Acceso ilimitado a contactos"
                : `${t("leadCredits") || "Créditos de contacto disponibles"}: ${access.remaining}`
              : t("noLeadCredits") || "Sin créditos de contacto"}
          </span>
        </div>
        <form onSubmit={handleSearch} className="flex w-full items-center gap-2 sm:w-auto">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("searchLeads") || "Buscar por nombre o teléfono"}
            className="h-9 w-full sm:w-56"
          />
          <Button type="submit" variant="outline" size="icon" className="h-9 w-9" aria-label={t("search")}>
            <BiSearch className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {!access.available && (
        <div className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed newBorderColor bg-amber-50 px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{t("leadsUpsellTitle") || "Los contactos están ocultos"}</span>
            <span className="text-xs text-gray-500">
              {t("leadsUpsellText") || "Agrega un plan Agencia para desbloquear contactos individuales"}
            </span>
          </div>
          <Button size="sm" className="primaryBg text-white shrink-0" onClick={goToPlans}>
            {t("viewPlans") || "Ver planes"}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 p-4">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && leads.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed newBorderColor py-14 text-center">
            <BiUserPlus className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500">
              {t("noLeads") || "Aún no tienes leads de contacto"}
            </span>
            <span className="text-xs text-gray-400">
              {t("noLeadsHint") || "Los leads se generan cuando un visitante solicita información de una propiedad tuya"}
            </span>
          </div>
        )}

        {!isLoading &&
          leads.map((lead) => (
            <div
              key={lead.id}
              className="flex flex-col gap-3 rounded-xl border newBorderColor p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-semibold text-base brandColor truncate max-w-full">{lead.nombre}</span>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {lead.property && (
                      <span className="inline-flex items-center gap-1 truncate max-w-[220px]">
                        <BiBuildingHouse className="w-3.5 h-3.5 shrink-0" />
                        {lead.property.title}
                      </span>
                    )}
                    <span>{formatDate(lead.created_at)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
                    {originLabel(lead.origin, t)}
                  </Badge>
                  <Badge className="text-[11px] px-2 py-0.5">
                    {statusLabel(lead.status, t)}
                  </Badge>
                  {lead.score != null && (
                    <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                      {t("score") || "Score"}: {lead.score}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg primaryBgLight08 px-3 py-2.5">
                {renderContact(lead)}
                {lead.notas && (
                  <span className="hidden md:inline-flex items-center gap-1 text-xs text-gray-500 truncate max-w-[200px]">
                    <BiEditAlt className="w-3.5 h-3.5 shrink-0" />
                    {lead.notas}
                  </span>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}