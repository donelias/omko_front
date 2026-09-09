"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BiSave, BiSearch, BiTrash } from "react-icons/bi";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "../context/TranslationContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getSavedSearchesApi,
  updateSavedSearchApi,
  deleteSavedSearchApi,
} from "@/api/apiRoutes";
import { buildFiltersQueryParams } from "@/utils/helperFunction";

const savedFiltersToInternal = (filters = {}) => {
  const amens = Array.isArray(filters.amenities)
    ? filters.amenities.map((a) => (typeof a === "object" && a !== null ? a.id : a))
    : [];
  return {
    property_type: filters.property_type === "Sell" ? "Sell" : filters.property_type === "Rent" ? "Rent" : "",
    category_id: filters.category_id || "",
    category_slug_id: filters.category_slug_id || "",
    city: filters.city || "",
    state: filters.state || "",
    country: filters.country || "",
    min_price: filters.min_price || "",
    max_price: filters.max_price || "",
    posted_since: filters.posted_since || "",
    promoted: filters.promoted === true || filters.promoted === "1",
    keywords: filters.keywords || "",
    amenities: amens,
    is_premium: filters.is_premium === true || filters.is_premium === "1",
    nearbyPlaces: filters.nearbyPlaces || filters.nearby_places || [],
  };
};

const frequencyLabel = (frequency, fallback) => {
  const map = {
    instant: fallback("instant") || "Instantánea",
    daily: fallback("daily") || "Diaria",
    weekly: fallback("weekly") || "Semanal",
  };
  return map[frequency] || frequency;
};

export default function UserSavedSearches() {
  const t = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const lang = router?.query?.lang;
  const [editTarget, setEditTarget] = useState(null);
  const [editName, setEditName] = useState("");
  const [editFrequency, setEditFrequency] = useState("instant");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const searchesQuery = useQuery({
    queryKey: ["userSavedSearches"],
    queryFn: async () => {
      const response = await getSavedSearchesApi();
      if (!response || response.error) {
        throw new Error((response && response.message) || "No se pudo cargar las búsquedas");
      }
      return response;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const searches = searchesQuery.data?.data || [];
  const isLoading = searchesQuery.isLoading || searchesQuery.isFetching;

  const invalidateList = () => {
    queryClient.invalidateQueries({ queryKey: ["userSavedSearches"] });
  };

  const handleToggleActive = async (item) => {
    setUpdatingId(item.id);
    try {
      const res = await updateSavedSearchApi({
        id: item.id,
        is_active: item.is_active ? 0 : 1,
      });
      if (res?.error) {
        toast.error(res?.message || "No se pudo actualizar");
      } else {
        toast.success(res?.message || "Búsqueda actualizada");
        invalidateList();
      }
    } catch (error) {
      toast.error(error?.message || "No se pudo actualizar");
    } finally {
      setUpdatingId(null);
    }
  };

  const openEdit = (item) => {
    setEditTarget(item);
    setEditName(item.name || "");
    setEditFrequency(item.frequency || "instant");
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      toast.error("Ingresa un nombre para la búsqueda");
      return;
    }
    setUpdatingId(editTarget.id);
    try {
      const res = await updateSavedSearchApi({
        id: editTarget.id,
        name: editName.trim(),
        frequency: editFrequency,
      });
      if (res?.error) {
        toast.error(res?.message || "No se pudo actualizar");
      } else {
        toast.success(res?.message || "Búsqueda actualizada");
        setEditTarget(null);
        invalidateList();
      }
    } catch (error) {
      toast.error(error?.message || "No se pudo actualizar");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("¿Eliminar esta búsqueda guardada?")) return;
    setDeletingId(item.id);
    try {
      const res = await deleteSavedSearchApi({ id: item.id });
      if (res?.error) {
        toast.error(res?.message || "No se pudo eliminar");
      } else {
        toast.success(res?.message || "Búsqueda eliminada");
        invalidateList();
      }
    } catch (error) {
      toast.error(error?.message || "No se pudo eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewResults = (item) => {
    const internal = savedFiltersToInternal(item.filters || {});
    const query = buildFiltersQueryParams(internal, { sortBy: "" });
    if (lang) query.lang = lang;
    const search = new URLSearchParams(query).toString();
    router.push({
      pathname: "/search/",
      query,
    }, `/search/?${search}`);
  };

  return (
    <div className="flex flex-col rounded-xl md:rounded-2xl border w-full newBorderColor bg-white">
      <div className="flex items-center justify-between border-b p-4 newBorderColor">
        <h1 className="text-base md:text-xl font-bold brandColor">
          {t("savedSearches") || "Búsquedas guardadas"}
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <BiSave className="w-5 h-5" />
          <span>{searches.length}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && searches.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed newBorderColor py-14 text-center">
            <BiSearch className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500">
              {t("noSavedSearches") || "Aún no tienes búsquedas guardadas"}
            </span>
            <span className="text-xs text-gray-400">
              {t("saveSearchHint") || "Usa el botón Guardar búsqueda en la página de resultados"}
            </span>
          </div>
        )}

        {!isLoading &&
          searches.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border newBorderColor p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-base brandColor truncate max-w-full">
                    {item.name}
                  </span>
                  <Badge
                    variant={item.is_active ? "default" : "secondary"}
                    className="text-[11px] px-2 py-0.5"
                  >
                    {item.is_active ? (t("active") || "Activa") : (t("inactive") || "Inactiva")}
                  </Badge>
                </div>
                <span className="text-xs sm:text-sm text-gray-500">
                  {frequencyLabel(item.frequency, t)}
                  {" · "}
                  {item.matching_properties_count !== undefined
                    ? `${item.matching_properties_count ?? 0} ${t("matchingProperties") || "propiedades"}`
                    : t("alertsActive") || "Alertas activas"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewResults(item)}
                  className="flex items-center gap-1.5"
                >
                  <BiSearch className="w-4 h-4" />
                  <span>{t("viewResults") || "Ver resultados"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updatingId === item.id}
                  onClick={() => handleToggleActive(item)}
                >
                  {item.is_active ? (t("deactivate") || "Desactivar") : (t("activate") || "Activar")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(item)}
                >
                  {t("edit") || "Editar"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deletingId === item.id}
                  onClick={() => handleDelete(item)}
                  className="text-red-500 hover:text-red-600"
                >
                  <BiTrash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
      </div>

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-[420px] rounded-2xl !z-[10000]" overlayClassName="!z-[10000]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold md:text-lg">
              {t("editSearch") || "Editar búsqueda"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium">{t("name") || "Nombre"}</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium">
                {t("alertFrequency") || "Frecuencia de alertas"}
              </Label>
              <Select value={editFrequency} onValueChange={setEditFrequency}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">{t("instant") || "Instantánea"}</SelectItem>
                  <SelectItem value="daily">{t("daily") || "Diaria"}</SelectItem>
                  <SelectItem value="weekly">{t("weekly") || "Semanal"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              {t("cancel") || "Cancelar"}
            </Button>
            <Button onClick={handleSaveEdit} disabled={updatingId === editTarget?.id} className="primaryBg text-white">
              {t("save") || "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}