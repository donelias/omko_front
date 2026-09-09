"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FiSave } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTranslation } from "../context/TranslationContext";
import { recordPriceHistoryApi } from "@/api/apiRoutes";

const RegisterPriceChange = ({ open, onOpenChange, property, onRegistered }) => {
  const t = useTranslation();
  const [price, setPrice] = useState(() =>
    property?.price ? String(property.price) : ""
  );
  const [status, setStatus] = useState("price_changed");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isRental =
    property?.property_type === "rent" || property?.property_type === "rented";
  const transactionType = isRental ? "rental" : "sale";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericPrice = Number(price);
    if (!numericPrice || numericPrice <= 0) {
      toast.error(t("newPrice") + " inválido");
      return;
    }

    try {
      setSubmitting(true);
      const res = await recordPriceHistoryApi({
        property_id: property?.id,
        price: numericPrice,
        status,
        transaction_type: transactionType,
        notes,
      });
      if (res && !res.error) {
        toast.success(t("priceRegisteredSuccessfully"));
        onOpenChange(false);
        if (onRegistered) onRegistered(res?.data);
      } else {
        toast.error(res?.message || t("opps"));
      }
    } catch (err) {
      toast.error(err?.message || t("opps"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="blackTextColor">{t("registerPriceChange")}</DialogTitle>
          <DialogDescription>
            {property?.title ? `${property.title} · ${t("priceIntelligence")}` : t("priceIntelligence")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              {t("newPrice")}
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={t("newPricePlaceholder")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              {t("priceChangeStatus")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus("price_changed")}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  status === "price_changed"
                    ? "border-primary primaryBgLight08 primaryColor"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {t("statusPriceChanged")}
              </button>
              <button
                type="button"
                onClick={() => setStatus("listed")}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  status === "listed"
                    ? "border-primary primaryBgLight08 primaryColor"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {t("statusListed")}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              {t("priceChangeNotes")}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("priceChangeNotesPlaceholder")}
              maxLength={1000}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="brandBg brandColor hover:text-white flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
            >
              <FiSave className="h-4 w-4" />
              {t("save")}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterPriceChange;