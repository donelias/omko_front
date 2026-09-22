"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { BiCheckCircle, BiMailSend, BiLoaderAlt } from "react-icons/bi";
import { getScreeningFormApi, submitScreeningApi } from "@/api/apiRoutes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const fieldTypes = ["number", "text", "select", "radio"];

/**
 * Formulario público de depuración/calificación de clientes.
 * Se monta en /screening/[propertyId] y consume GET screening/form/{id} +
 * POST screening/submit del backend Omko-Admin.
 */
export default function ClientScreeningForm() {
  const router = useRouter();
  const propertyId = router?.query?.propertyId;

  const [contact, setContact] = useState({ customer_name: "", customer_email: "", customer_phone: "" });
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const questionsQuery = useQuery({
    queryKey: ["screeningForm", propertyId],
    queryFn: async () => {
      const res = await getScreeningFormApi({ propertyId });
      if (!res || res.error) {
        throw new Error((res && res.message) || "No se pudo cargar el formulario");
      }
      return res.data;
    },
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const questions = questionsQuery.data?.questions || [];

  const handleContact = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const isValid = () => {
    if (!contact.customer_name.trim()) return false;
    return questions.every((q) => {
      if (!q.is_required) return true;
      const value = answers[q.question_key];
      return !(value === undefined || value === null || String(value).trim() === "");
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) {
      toast.error("Por favor complete los campos obligatorios.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitScreeningApi({
        property_id: propertyId,
        customer_name: contact.customer_name,
        customer_email: contact.customer_email,
        customer_phone: contact.customer_phone,
        origin: "link",
        answers,
      });
      if (!res || res.error) {
        toast.error((res && res.message) || "No se pudo enviar el formulario");
        return;
      }
      setSent(true);
      toast.success(res?.message || "Formulario enviado correctamente");
    } catch (err) {
      const message = err?.message || "Error al enviar el formulario. Intente de nuevo.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!propertyId) {
    return <div className="min-h-screen bg-gray-50 px-4 py-14" />;
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 md:py-16">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl border newBorderColor bg-white p-8 text-center shadow-sm">
          <BiCheckCircle className="h-14 w-14 text-green-500" />
          <h1 className="text-xl font-bold brandColor">¡Formulario enviado!</h1>
          <p className="text-sm text-gray-500">
            Su solicitud de depuración fue registrada. Un agente de Omko revisará sus respuestas y le
            contactará pronto por los medios que indicó.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 md:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl primaryBg text-white">
            <BiMailSend className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-bold brandColor">Depuración de cliente</h1>
            <span className="text-xs text-gray-500">
              Complete este breve cuestionario para evaluar su solicitud de alquiler.
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-2xl border newBorderColor bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700">Datos de contacto</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-1">
                <label className="text-xs font-medium text-gray-600">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <Input
                  name="customer_name"
                  value={contact.customer_name}
                  onChange={handleContact}
                  placeholder="Ej: María García"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Email</label>
                <Input
                  name="customer_email"
                  value={contact.customer_email}
                  onChange={handleContact}
                  placeholder="Ej: maria@correo.com"
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-gray-600">Teléfono / WhatsApp</label>
                <Input
                  name="customer_phone"
                  value={contact.customer_phone}
                  onChange={handleContact}
                  placeholder="Ej: 809-000-0000"
                />
              </div>
            </div>
          </div>

          {questionsQuery.isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          )}

          {!questionsQuery.isLoading && questions.length === 0 && (
            <div className="rounded-2xl border border-dashed newBorderColor bg-white p-8 text-center text-sm text-gray-500">
              No hay cuestionario configurado para esta propiedad.
            </div>
          )}

          {!questionsQuery.isLoading &&
            questions.length > 0 &&
            questions.map((q, index) => (
              <div
                key={q.id || q.question_key}
                className="rounded-2xl border newBorderColor bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    {index + 1}. {q.question_text}
                    {q.is_required && <span className="text-red-500"> *</span>}
                  </label>
                  {q.field_type !== "radio" && (
                    <span className="shrink-0 rounded-full primaryBgLight08 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                      {q.field_type}
                    </span>
                  )}
                </div>

                {!fieldTypes.includes(q.field_type) && <span />}

                {q.field_type === "select" && (
                  <select
                    className="h-10 w-full rounded-lg border newBorderColor bg-white px-3 text-sm text-gray-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    value={answers[q.question_key] || ""}
                    onChange={(e) => handleAnswer(q.question_key, e.target.value)}
                  >
                    <option value="">Seleccione una opción…</option>
                    {(q.options || []).map((opt, i) => (
                      <option key={i} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {q.field_type === "radio" && (
                  <div className="flex flex-wrap gap-3">
                    {(q.options || []).map((opt, i) => {
                      const checked = answers[q.question_key] === opt.value;
                      return (
                        <label
                          key={i}
                          className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                            checked
                              ? "border-primary bg-primary/10 font-medium text-primary"
                              : "newBorderColor text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            className="accent-primary"
                            name={q.question_key}
                            value={opt.value}
                            checked={checked}
                            onChange={() => handleAnswer(q.question_key, opt.value)}
                          />
                          {opt.label}
                        </label>
                      );
                    })}
                  </div>
                )}

                {(q.field_type === "number" || q.field_type === "text") && (
                  <Input
                    type={q.field_type === "number" ? "number" : "text"}
                    value={answers[q.question_key] || ""}
                    onChange={(e) => handleAnswer(q.question_key, e.target.value)}
                    placeholder={q.placeholder || "Escriba su respuesta…"}
                  />
                )}
              </div>
            ))}

          <Button
            type="submit"
            disabled={submitting || questionsQuery.isLoading || questions.length === 0}
            className="primaryBg text-white"
            size="lg"
          >
            {submitting ? (
              <>
                <BiLoaderAlt className="h-4 w-4 animate-spin" /> Enviando…
              </>
            ) : (
              "Enviar solicitud"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}