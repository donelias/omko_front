"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "../context/TranslationContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSavedSearchApi, previewSavedSearchApi } from "@/api/apiRoutes";

const buildSavedFilters = (filterParams = {}) => {
  const saved = { ...filterParams };
  // Flat key consumed by SavedSearchApiController::countMatches
  saved.propery_type =
    filterParams?.property_type === "Rent"
      ? "1"
      : filterParams?.property_type === "Sell"
        ? "0"
        : "";
  return saved;
};

const SaveSearchModal = ({
  open,
  onOpenChange,
  filters = {},
  onSaved,
}) => {
  const t = useTranslation();
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("instant");
  const [matchingCount, setMatchingCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    previewSavedSearchApi({ filters: buildSavedFilters(filters) })
      .then((res) => {
        if (!res?.error) {
          setMatchingCount(res?.data?.matching_properties_count ?? null);
        }
      })
      .catch(() => setMatchingCount(null));
  }, [open, filters]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(t("pleaseEnterName") || "Por favor ingresa un nombre para la búsqueda");
      return;
    }
    setSaving(true);
    try {
      const res = await createSavedSearchApi({
        name: name.trim(),
        filters: buildSavedFilters(filters),
        frequency,
      });
      if (res?.error) {
        toast.error(res?.message || "No se pudo guardar la búsqueda");
      } else {
        toast.success(res?.message || "Búsqueda guardada correctamente");
        onOpenChange(false);
        onSaved?.(res?.data);
      }
    } catch (error) {
      toast.error(error?.message || "No se pudo guardar la búsqueda");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] rounded-2xl !z-[10000]" overlayClassName="!z-[10000]">
        <DialogHeader className="w-full space-y-2 text-center">
          <DialogTitle className="text-base font-semibold md:text-xl">
            {t("saveSearch") || "Guardar búsqueda"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-gray-500">
            {matchingCount !== null
              ? `${matchingCount} ${t("matchingProperties") || "propiedades coinciden"}`
              : t("searchWillNotify") || "Te avisaremos cuando haya propiedades nuevas"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 p-1">
          <div className="grid gap-2">
            <Label htmlFor="saved-search-name" className="text-sm font-medium">
              {t("name") || "Nombre"}
            </Label>
            <Input
              id="saved-search-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("searchNamePlaceholder") || "Ej: Apartamentos en Santo Domingo"}
              className="w-full"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="saved-search-frequency" className="text-sm font-medium">
              {t("alertFrequency") || "Frecuencia de alertas"}
            </Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="saved-search-frequency" className="w-full">
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

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            {t("cancel") || "Cancelar"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto primaryBg text-white"
          >
            {saving ? (t("saving") || "Guardando...") : (t("save") || "Guardar")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveSearchModal;