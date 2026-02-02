"use client";
import { TranslationProvider } from "@/components/context/TranslationContext";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import FullScreenSpinLoader from "@/components/ui/loaders/FullScreenSpinLoader";
import { store } from "@/redux/store";
import "@/styles/globals.css";
import { getCurrentLocationData } from "@/utils/helperFunction";
import Head from "next/head";
import { Router, useRouter } from "next/router";
import Script from "next/script";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Suspense, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "react-phone-input-2/lib/style.css";
import PushNotificationLayout from "@/components/wrapper/PushNotificationLayout";

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: parseInt(process.env.NEXT_PUBLIC_API_STALE_TIME) || 0,
        refetchOnWindowFocus: false,
      }
    }
  })) // 👈 stable client

  useEffect(() => {
    const start = () => NProgress.start();
    const end = () => NProgress.done();

    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeError", end);
    Router.events.on("routeChangeComplete", end);

    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeError", end);
      Router.events.off("routeChangeComplete", end);
    };
  }, []);

  // Function to request location permission
  const requestLocationPermission = async () => {
    if ("geolocation" in navigator) {
      // Use getCurrentLocationData with proper callbacks
      getCurrentLocationData(
        (locationData) => {
        },
        (error) => {
          // Error callback
          console.error("Error getting location:", error);
        },
      );
    } else {
      // Geolocation is not supported
      console.error("Geolocation is not supported by this browser");
    }
  };

  const router = useRouter();
  const [needsPannellum, setNeedsPannellum] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Check if the current page needs Pannellum (property or project detail pages)
  useEffect(() => {
    const path = router.asPath;
    const isPannellumNeeded = path.includes('/property-details/') ||
      path.includes('/project-details/') ||
      path.includes('/my-property/') ||
      path.includes('/my-project/');

    setNeedsPannellum(isPannellumNeeded);
  }, [router.asPath]);

  return (
    <>
      {needsPannellum && (
        <>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"
          />
          <Script
            src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"
            strategy="afterInteractive"
          />
        </>
      )}
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <TranslationProvider>
              <PushNotificationLayout>


                <Suspense fallback={<FullScreenSpinLoader />}>
                  <Component {...pageProps} />
                </Suspense>
              </PushNotificationLayout>
              <Toaster />
            </TranslationProvider>
          </Provider>
        </QueryClientProvider>
      </ErrorBoundary>
    </>
  );
}
