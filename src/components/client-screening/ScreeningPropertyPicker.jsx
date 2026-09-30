"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { BiBuildingHouse, BiLoaderAlt, BiMapPin } from "react-icons/bi";
import { getPropertyListApi } from "@/api/apiRoutes";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Selector de propiedad para el flujo de calificación de clientes.
 * Se muestra en /screening (sin id) y permite elegir una propiedad
 * para continuar con el formulario en /screening/[propertyId].
 */
export default function ScreeningPropertyPicker() {
  const router = useRouter();
  const lang = router.query.lang || "en";

  const propertiesQuery = useQuery({
    queryKey: ["screeningProperties", lang],
    queryFn: async () => {
      const res = await getPropertyListApi({ limit: 30, offset: 0 });
      if (!res || res.error) {
        throw new Error((res && res.message) || "No se pudieron cargar las propiedades");
      }
      const data = res.data;
      return Array.isArray(data) ? data : data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const properties = propertiesQuery.data || [];

  const goToForm = (id) => {
    router.push({ pathname: `/screening/${id}`, query: { lang } });
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === "") return "";
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(price));
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 md:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl primaryBg text-white">
            <BiBuildingHouse className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-bold brandColor">
              {router.locale === "es" || lang === "es" ? "Calificación de inquilinos" : "Tenant qualification"}
            </h1>
            <span className="text-xs text-gray-500">
              {router.locale === "es" || lang === "es"
                ? "Seleccione la propiedad y complete el breve cuestionario de calificación."
                : "Select the property and complete the short qualification questionnaire."}
            </span>
          </div>
        </div>

        {propertiesQuery.isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {!propertiesQuery.isLoading && properties.length === 0 && (
          <div className="rounded-2xl border border-dashed newBorderColor bg-white p-8 text-center text-sm text-gray-500">
            {router.locale === "es" || lang === "es"
              ? "No hay propiedades disponibles."
              : "There are no properties available."}
          </div>
        )}

        {!propertiesQuery.isLoading && properties.length > 0 && (
          <div className="flex flex-col gap-3">
            {properties.map((p) => (
              <div
                key={p.id}
                className="flex cursor-pointer flex-col gap-3 rounded-2xl border newBorderColor bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                onClick={() => goToForm(p.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl primaryBgLight08 text-gray-500">
                    <BiBuildingHouse className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">{p.title || p.name || "Propiedad"}</h3>
                    {p.city && (
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                        <BiMapPin className="h-3.5 w-3.5" /> {p.city}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">{p.property_type || "Property"}</span>
                  {p.price != null && (
                    <span className="text-sm font-bold text-gray-800">
                      {formatPrice(p.price)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}