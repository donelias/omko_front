import { useState } from "react";
import { useTranslation } from "../context/TranslationContext";
import { submitGuestLeadApi } from "@/api/apiRoutes";
import toast from "react-hot-toast";
import { getLeadTraffic } from "@/utils/utm";
import { trackLeadMetaEvent } from "@/utils/metaPixel";

/**
 * Formulario de lead para visitantes NO autenticados (guest-to-lead).
 * FASE 3 (T4): captura los datos del visitante sin forzarle a crear cuenta
 * o iniciar sesión. El lead se guarda en crm_leads (origin='formulario').
 */
const GuestLeadForm = ({ propertyId, agentId, pixelId }) => {
  const t = useTranslation();
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", notas: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setError(t("pleaseEnterName"));
      return;
    }
    if (!form.email.trim() && !form.telefono.trim()) {
      setError(t("contactRequired"));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await submitGuestLeadApi({
        property_id: propertyId,
        agent_id: agentId,
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        notas: form.notas,
        ...getLeadTraffic(),
      });
      const leadId = response?.data?.id;
      if (leadId) {
        toast.success(t("interestSubmitted"));
        if (pixelId) {
          trackLeadMetaEvent(pixelId, {
            leadId,
            propertyId,
            contentName: t("interestedInThisProperty"),
          });
        }
      }
      setSent(true);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error al enviar su interés. Intente de nuevo.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="newBorder rounded-xl p-4 text-center">
        <div className="secondaryTextColor mb-2 text-base font-semibold">
          {t("thankYou")}
        </div>
        <p className="secondaryTextColor text-sm">{t("interestSubmittedMessage")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="newBorder rounded-xl p-4">
      <div className="secondaryTextColor mb-3 text-base font-semibold">
        {t("interestedInThisProperty")}
      </div>
      <label className="mb-1 block text-sm font-medium secondaryTextColor">
        {t("name")} <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        placeholder={t("yourName")}
        className="primaryBackgroundBg w-full rounded-md border px-3 py-2 text-sm outline-none"
      />
      <label className="mb-1 mt-3 block text-sm font-medium secondaryTextColor">
        {t("email")}
      </label>
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder={t("yourEmail")}
        className="primaryBackgroundBg w-full rounded-md border px-3 py-2 text-sm outline-none"
      />
      <label className="mb-1 mt-3 block text-sm font-medium secondaryTextColor">
        {t("phone")}
      </label>
      <input
        type="tel"
        name="telefono"
        value={form.telefono}
        onChange={handleChange}
        placeholder={t("yourPhone")}
        className="primaryBackgroundBg w-full rounded-md border px-3 py-2 text-sm outline-none"
      />
      <label className="mb-1 mt-3 block text-sm font-medium secondaryTextColor">
        {t("message")}
      </label>
      <textarea
        name="notas"
        value={form.notas}
        onChange={handleChange}
        rows={3}
        placeholder={t("yourMessage")}
        className="primaryBackgroundBg w-full rounded-md border px-3 py-2 text-sm outline-none"
      />
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="primaryBg mt-4 w-full rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {submitting ? t("sending") : t("sendInterest")}
      </button>
    </form>
  );
};

export default GuestLeadForm;
