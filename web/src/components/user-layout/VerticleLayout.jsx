"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "../context/TranslationContext";
import { useRouter } from "next/router";
import UserHeader from "./UserHeader";
import UserFooter from "./UserFooter";
import UserSidebar from "./UserSidebar";
import { getWebSetting, getLanguageData, updateNotificationLanguageApi } from "@/api/apiRoutes";
import { setWebSettings } from "@/redux/slices/webSettingSlice";
import { logout } from "@/redux/slices/authSlice";
import {
    setActiveLanguage,
    setCurrentLanguage,
    setIsFetched,
    setIsLanguageLoaded,
} from "@/redux/slices/languageSlice";
import FirebaseData from "@/utils/Firebase";
import Swal from "sweetalert2";
import withAuth from "../HOC/withAuth";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";

const VerticleLayout = ({ children }) => {
    const { signOut } = FirebaseData();
    const t = useTranslation();
    const router = useRouter();
    const dispatch = useDispatch();

    const webSettings = useSelector((state) => state.WebSetting?.data);
    const {
        current_language: currentLang,
        languages: availableLanguages,
        default_language: defaultLanguage,
        active_language: activeLanguage,
        isLanguageLoaded,
    } = useSelector((state) => state.LanguageSettings);

    const [isMobile, setIsMobile] = useState(false);

    // Apply language settings to HTML
    const applyLanguageToHtml = (langCode, isRtl) => {
        if (typeof document === "undefined") return;

        document.documentElement.lang = langCode || "en";
        document.documentElement.dir = isRtl ? "rtl" : "ltr";
    };

    const changeNotificationLanguage = async (language_code) => {
        try {
            const res = await updateNotificationLanguageApi({ language_code });
            return res?.data;
        } catch (error) {
            console.error('Failed to update notification language:', error);
            return null;
        }
    }

    // Fetch and apply language data
    const handleLanguageChange = async (localeCode) => {
        if (!localeCode || localeCode === activeLanguage) return;

        try {
            const response = await getLanguageData({
                language_code: localeCode,
                web_language_file: 1,
            });

            const isRtl = response?.data?.rtl === 1;
            applyLanguageToHtml(localeCode, isRtl);
            await changeNotificationLanguage(localeCode);
            dispatch(setActiveLanguage({ data: localeCode }));
            dispatch(setCurrentLanguage({ data: response.data }));
            dispatch(setIsFetched({ data: true }));
            dispatch(setIsLanguageLoaded({ data: true }));
        } catch (error) {
            console.error(`Language fetch failed for ${localeCode}:`, error);
        }
    };

    // Handle account deactivation
    const handleAccountDeactivation = async () => {
        if (webSettings?.is_active !== false) return;

        const result = await Swal.fire({
            title: t("opps"),
            text: t("yourAccountDeactivated"),
            icon: "warning",
            allowOutsideClick: false,
            confirmButtonText: t("logout"),
            customClass: { confirmButton: "Swal-confirm-buttons" },
        });

        if (result.isConfirmed) {
            dispatch(logout());
            signOut();
        }
    };

    // Fetch web settings and apply theme
    const fetchWebSettings = async () => {
        try {
            const res = await getWebSetting();
            if (res?.error) return;

            dispatch(setWebSettings({ data: res.data }));

            // Apply CSS custom properties
            const root = document.documentElement;
            root.style.setProperty("--primary-color", res.data?.system_color);
            root.style.setProperty("--primary-category-background", res.data?.category_background);
        } catch (error) {
            console.error("Failed to fetch web settings:", error);
        }
    };

    // Handle URL language parameter
    useEffect(() => {
        if (!router.isReady || !availableLanguages?.length) return;

        const { lang } = router.query;
        const isValidLang = availableLanguages.some((l) => l.code === lang);
        const langToUse = isValidLang ? lang : (defaultLanguage || "en");
        applyLanguageToHtml(langToUse, currentLang?.rtl === 1);

        if (langToUse !== lang) {
            router.replace(
                { pathname: router.pathname, query: { ...router.query, lang: langToUse } },
                undefined,
                { shallow: true }
            );
        }

        handleLanguageChange(langToUse);
    }, [router.isReady, router.query.lang, availableLanguages, defaultLanguage]);

    // Handle responsive design
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Handle account deactivation effect
    useEffect(() => {
        handleAccountDeactivation();
    }, [webSettings?.is_active]);

    // Fetch settings when language is loaded
    useEffect(() => {
        if (isLanguageLoaded) {
            fetchWebSettings();
        }
    }, [isLanguageLoaded]);

    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden">
                <Sidebar
                    side={currentLang?.rtl === 1 ? "right" : "left"}
                    variant="sidebar"
                    collapsible="icon"
                    className="border-r border-gray-200 bg-white flex-shrink-0"
                >
                    <UserSidebar isMobile={isMobile} />
                </Sidebar>

                <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    <header className="border-b">
                        <UserHeader isMobile={isMobile} />
                    </header>

                    <main className="flex-1 min-h-0 overflow-y-auto primaryBackgroundBg">
                        <div className="w-full max-w-full p-2 md:p-4 lg:p-6">
                            {children}
                        </div>
                    </main>

                    <footer className="border-t">
                        <UserFooter isMobile={isMobile} />
                    </footer>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default withAuth(VerticleLayout);