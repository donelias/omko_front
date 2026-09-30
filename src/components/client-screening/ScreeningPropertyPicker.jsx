"use client";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { BiBuildingHouse, BiLoaderAlt, BiMapPin, BiSearch } from "react-icons/bi";
import { getPropertyListApi } from "@/api/apiRoutes";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 20;

/**
 * Selector de propiedad para el flujo de calificación de clientes.
 * Se muestra en /screening (sin id) y permite elegir una propiedad
 * para continuar con el formulario en /screening/[propertyId].
 */
export default function ScreeningPropertyPicker() {
  const router = useRouter();
  const lang = router.query.lang || "en";
  const isEs = router.locale === "es" || lang === "es";

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [extra, setExtra] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const onSearchChange = (value) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value.trim()), 400);
  };

  const propertiesQuery = useQuery({
    queryKey: ["screeningProperties", lang, search],
    queryFn: async () => {
      const res = await getPropertyListApi({ limit: PAGE_SIZE, offset: 0, search });
      if (!res || res.error) {
        throw new Error((res && res.message) || "No se pudieron cargar las propiedades");
      }
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.data || [];
      const total = res.total || (Array.isArray(data) ? data.length : data?.data?.length || 0);
      return { list, total };
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setExtra([]);
    setLoadingMore(false);
  }, [search]);

  const baseList = propertiesQuery.data?.list || [];
  const total = propertiesQuery.data?.total || baseList.length;
  const properties = search ? baseList : [...baseList, ...extra];

  const goToForm = (id) => {
    router.push({ pathname: `/screening/${id}`, query: { lang } });
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await getPropertyListApi({
        limit: PAGE_SIZE,
        offset: baseList.length + extra.length,
        search,
      });
      const data = res.data;
      const rows = Array.isArray(data) ? data : data?.data || [];
      if (rows.length) {
        setExtra((prev) => [...prev, ...rows]);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoadingMore(false);
    }
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
              {isEs ? "Calificación de inquilinos" : "Tenant qualification"}
            </h1>
            <span className="text-xs text-gray-500">
              {isEs
                ? "Seleccione la propiedad y complete el breve cuestionario de calificación."
                : "Select the property and complete the short qualification questionnaire."}
            </span>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex items-center gap-2 rounded-xl border newBorderColor bg-white px-3 py-2.5 shadow-sm">
            <BiSearch className="h-5 w-5 shrink-0 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isEs ? "Buscar por título, dirección o ciudad..." : "Search by title, address or city..."}
              className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
            {searchInput && (
              <button
                onClick={() => onSearchChange("")}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600"
              >
                {isEs ? "Limpiar" : "Clear"}
              </button>
            )}
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
            {isEs ? "No hay propiedades disponibles." : "There are no properties available."}
          </div>
        )}

        {!propertiesQuery.isLoading && properties.length > 0 && (
          <>
            <p className="mb-3 text-xs text-gray-500">
              {isEs ? `${total} propiedades` : `${total} properties`}
            </p>
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
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                      {p.property_type || "Property"}
                    </span>
                    {p.price != null && (
                      <span className="text-sm font-bold text-gray-800">{formatPrice(p.price)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {properties.length < total && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border newBorderColor bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:shadow-md disabled:opacity-60"
              >
                {loadingMore ? (
                  <BiLoaderAlt className="h-4 w-4 animate-spin" />
                ) : (
                  isEs ? "Cargar más" : "Load more"
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}