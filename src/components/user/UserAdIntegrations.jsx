"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "../context/TranslationContext";
import { getAdIntegrationApi, saveAdIntegrationApi, testAdIntegrationApi } from "@/api/apiRoutes";

const defaultState = () => ({
  pixel_id: "",
  ad_account_id: "",
  capi_access_token: "",
  capi_test_event_code: "",
  whatsapp_mode: "mock",
  whatsapp_token: "",
  whatsapp_phone_id: "",
  whatsapp_sender_number: "",
});

export default function UserAdIntegrations() {
  const t = useTranslation();
  const [form, setForm] = useState(defaultState());
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    getAdIntegrationApi()
      .then((res) => {
        const d = res?.data?.data || res?.data || {};
        setSaved({
          pixel_id: d.pixel_id,
          capi_token_configured: !!d.capi_token_configured,
          whatsapp_token_configured: !!d.whatsapp_token_configured,
          capi_access_token: d.capi_access_token || null,
          whatsapp_token: d.whatsapp_token || null,
          whatsapp_mode: d.whatsapp_mode || "mock",
          capi_test_event_code: d.capi_test_event_code || "",
          whatsapp_phone_id: d.whatsapp_phone_id || "",
          whatsapp_sender_number: d.whatsapp_sender_number || "",
          ad_account_id: d.ad_account_id || "",
        });
        setForm((f) => ({
          ...f,
          pixel_id: d.pixel_id || "",
          ad_account_id: d.ad_account_id || "",
          capi_test_event_code: d.capi_test_event_code || "",
          whatsapp_mode: d.whatsapp_mode || "mock",
          whatsapp_phone_id: d.whatsapp_phone_id || "",
          whatsapp_sender_number: d.whatsapp_sender_number || "",
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (testResult) setTestResult(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Solamente se envían los campos que el agente llenó; si deja vacío un token
      // ya guardado, el backend conserva el anterior (no lo borra).
      const res = await saveAdIntegrationApi(form);
      setSaved({
        pixel_id: res?.data?.data?.pixel_id || form.pixel_id,
        capi_token_configured: res?.data?.data?.capi_token_configured,
        whatsapp_token_configured: res?.data?.data?.whatsapp_token_configured,
        capi_access_token: res?.data?.data?.capi_access_token || null,
        whatsapp_token: res?.data?.data?.whatsapp_token || null,
        whatsapp_mode: res?.data?.data?.whatsapp_mode || form.whatsapp_mode,
        capi_test_event_code: form.capi_test_event_code,
        whatsapp_phone_id: form.whatsapp_phone_id,
        whatsapp_sender_number: form.whatsapp_sender_number,
        ad_account_id: form.ad_account_id,
      });
      toast.success(t("integrationSaved") || "Integración guardada. Todos tus leads de esta propiedad se reportarán a tu Meta Pixel.");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Error al guardar la integración.");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testAdIntegrationApi({ test_event_code: form.capi_test_event_code });
      setTestResult({
        ok: true,
        message: res?.data?.message || "Evento de prueba enviado. Revisa tu Events Manager.",
        detail: res?.data?.data || null,
      });
    } catch (err) {
      setTestResult({
        ok: false,
        message: err?.response?.data?.message || err?.message || "No se pudo enviar el evento de prueba.",
      });
    } finally {
      setTesting(false);
    }
  };

  const inputCls =
    "primaryBackgroundBg w-full rounded-md border px-3 py-2 text-sm outline-none";

  return (
    <div className="rounded-2xl border newBorderColor bg-white p-5">
      <h2 className="blackTextColor mb-1 text-lg font-bold">
        {t("marketing") || "Marketing / Publicidad"}
      </h2>
      <p className="secondaryTextColor mb-5 text-sm">
        {t("activateAdsTracking") ||
          "Conecta tu Meta Pixel para que cada lead que capture esta página se reporte a tus anuncios de Facebook/Instagram. Los tokens se guardan cifrados y solo se muestran enmascarados."}
      </p>

      {loading ? (
        <p className="secondaryTextColor text-sm">Cargando…</p>
      ) : (
        <div className="grid gap-4">
          {/* Meta Pixel / Conversions API */}
          <section className="newBorder rounded-lg p-4">
            <h3 className="blackTextColor mb-3 text-base font-semibold">
              {t("metaPixelTitle") || "Meta Pixel + Conversions API"}
            </h3>

            <label className="mb-1 block text-sm font-medium secondaryTextColor">
              {t("metaPixelId") || "Pixel ID"} *
            </label>
            <input
              type="text"
              name="pixel_id"
              value={form.pixel_id}
              onChange={handleChange}
              placeholder={saved?.pixel_id || "0"}
              className={inputCls}
            />

            <label className="mb-1 mt-3 block text-sm font-medium secondaryTextColor">
              {t("adAccountId") || "Ad Account ID"} ({t("optional") || "opcional"})
            </label>
            <input
              type="text"
              name="ad_account_id"
              value={form.ad_account_id}
              onChange={handleChange}
              placeholder={saved?.ad_account_id || "act_000000000000000"}
              className={inputCls}
            />

            <label className="mb-1 mt-3 block text-sm font-medium secondaryTextColor">
              {t("capiAccessToken") || "Access Token (Conversions API)"} ({t("optional") || "opcional"})
            </label>
            <input
              type="password"
              name="capi_access_token"
              value={form.capi_access_token}
              onChange={handleChange}
              placeholder={
                saved?.capi_token_configured
                  ? (saved?.capi_access_token || "•••••••••• (configurado)")
                  : "EAAAAU..."
              }
              className={inputCls}
            />

            <label className="mb-1 mt-3 block text-sm font-medium secondaryTextColor">
              {t("testEventCode") || "Test Event Code"} ({t("optional") || "opcional"})
            </label>
            <input
              type="text"
              name="capi_test_event_code"
              value={form.capi_test_event_code}
              onChange={handleChange}
              placeholder={saved?.capi_test_event_code || "TEST…"}
              className={inputCls}
            />
          </section>

          {/* WhatsApp */}
          <section className="newBorder rounded-lg p-4">
            <h3 className="blackTextColor mb-3 text-base font-semibold">
              {t("whatsappTitle") || "WhatsApp Business (notificaciones de leads)"}
            </h3>

            <label className="mb-1 block text-sm font-medium secondaryTextColor">
              {t("whatsappSenderNumber") || "Tu número (receptor de notificaciones de leads)"}
            </label>
            <input
              type="text"
              name="whatsapp_sender_number"
              value={form.whatsapp_sender_number}
              onChange={handleChange}
              placeholder={saved?.whatsapp_sender_number || "18091234567"}
              className={inputCls}
            />

            <label className="mb-1 mt-3 block text-sm font-medium secondaryTextColor">
              {t("whatsappMode") || "Modo"}
            </label>
            <select
              name="whatsapp_mode"
              value={form.whatsapp_mode}
              onChange={handleChange}
              className={inputCls}
            >
              <option value="mock">{t("whatsappModeMock") || "Mock (sin envío real)"}</option>
              <option value="live">{t("whatsappModeLive") || "Live (envío real)"}</option>
            </select>

            <label className="mb-1 mt-3 block text-sm font-medium secondaryTextColor">
              {t("whatsappPhoneId") || "Phone Number ID"} ({t("optional") || "opcional"})
            </label>
            <input
              type="text"
              name="whatsapp_phone_id"
              value={form.whatsapp_phone_id}
              onChange={handleChange}
              placeholder={saved?.whatsapp_phone_id || "000000000000000"}
              className={inputCls}
            />

            <label className="mb-1 mt-3 block text-sm font-medium secondaryTextColor">
              {t("whatsappToken") || "Token de WhatsApp Cloud API"} ({t("optional") || "opcional"})
            </label>
            <input
              type="password"
              name="whatsapp_token"
              value={form.whatsapp_token}
              onChange={handleChange}
              placeholder={
                saved?.whatsapp_token_configured
                  ? (saved?.whatsapp_token || "•••••••••• (configurado)")
                  : "EAA…"
              }
              className={inputCls}
            />
          </section>

          <div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="primaryBg rounded-lg px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? (t("saving") || "Guardando…") : (t("save") || "Guardar integración")}
            </button>
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !form.pixel_id}
              className="newBorder secondaryTextColor ml-3 rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {testing ? t("sending") : (t("sendTestEvent") || "Enviar evento de prueba a Meta")}
            </button>
          </div>

          {testResult && (
            <div
              className={`rounded-lg border p-3 text-sm ${
                testResult.ok ? "border-green-300 bg-green-50 text-green-800" : "border-red-300 bg-red-50 text-red-800"
              }`}
            >
              <p className="font-semibold">{testResult.message}</p>
              {testResult.detail && (
                <pre className="mt-2 max-h-40 overflow-auto text-xs">{JSON.stringify(testResult.detail, null, 2)}</pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}