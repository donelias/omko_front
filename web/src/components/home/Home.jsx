import * as api from "@/api/apiRoutes";
import {
    AgentSectionSkeleton,
    ArticleSectionSkeleton,
    CircularItemsSkeleton,
    CitiesSkeleton,
    FaqsSkeleton,
    FeaturedProjectsSkeleton,
    FeaturedPropertiesSkeleton,
    MainSwiperSkeleton,
    MapSkeleton,
    MostLikedSkeleton,
    MostViewedSkeleton,
    NearbyPropertiesSkeleton,
    PremiumPropertiesSkeleton,
    ProjectsSkeleton,
    PropertySectionSkeleton,
    UserRecommendationSkeleton
} from '@/components/skeletons/home/index';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { useTranslation } from '../context/TranslationContext';
import LocationSearchWithRadius from '../location-search/LocationSearchWithRadius';
import { useQuery } from "@tanstack/react-query";
// import AllPropertiesSection from "../homepagesections/AllPropertiesSection";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from "next/router";
const MainSwiper = dynamic(() => import('../mainswiper/MainSwiper'), { ssr: false, loading: () => <MainSwiperSkeleton /> });
const Faqs = dynamic(() => import('../faqs/Faqs'), { ssr: false, loading: () => <FaqsSkeleton /> });

// Specific Dynamic Components with specific Skeletons to prevent CLS
const NearbyPropertiesSection = dynamic(() => import('../homepagesections/HomeNewSectionOne'), { ssr: false, loading: () => <NearbyPropertiesSkeleton /> });
const MostViewedSection = dynamic(() => import('../homepagesections/HomeNewSectionTwo'), { ssr: false, loading: () => <MostViewedSkeleton /> });
const MostLikedSection = dynamic(() => import('../homepagesections/HomeNewSectionTwo'), { ssr: false, loading: () => <MostLikedSkeleton /> });
const FeaturedPropertiesSection = dynamic(() => import('../homepagesections/HomeNewSectionFour'), { ssr: false, loading: () => <FeaturedPropertiesSkeleton /> });
const PremiumPropertiesSection = dynamic(() => import('../homepagesections/PremiumPropertiesSection'), { ssr: false, loading: () => <PremiumPropertiesSkeleton /> });
const ProjectsSection = dynamic(() => import('../homepagesections/HomeNewSectionTwo'), { ssr: false, loading: () => <ProjectsSkeleton /> });
const FeaturedProjectsSection = dynamic(() => import('../homepagesections/PremiumPropertiesSection'), { ssr: false, loading: () => <FeaturedProjectsSkeleton /> });
const CitiesSection = dynamic(() => import('../homepagesections/HomeNewSectionTwo'), { ssr: false, loading: () => <CitiesSkeleton /> });
const AgentsSection = dynamic(() => import('../homepagesections/AgentSwiperSection'), { ssr: false, loading: () => <AgentSectionSkeleton /> });
const ArticlesSection = dynamic(() => import('../homepagesections/HomeNewSectionOne'), { ssr: false, loading: () => <ArticleSectionSkeleton /> });
const CategoriesSection = dynamic(() => import('../homepagesections/HomeNewSectionOne'), { ssr: false, loading: () => <CircularItemsSkeleton /> });
const UserRecommendationsSection = dynamic(() => import('../homepagesections/HomeNewSectionOne'), { ssr: false, loading: () => <UserRecommendationSkeleton /> });
const MapSection = dynamic(() => import('../homepagesections/HomePropertiesOnMap'), { ssr: false, loading: () => <MapSkeleton /> });
const AllPropertiesSection = dynamic(() => import('../homepagesections/AllPropertiesSection'), { ssr: false, loading: () => <PropertySectionSkeleton /> });

// Mapping section types to API response keys
const SECTION_TYPE_TO_KEY_MAP = {
    // Property sections
    'nearby_properties_section': 'nearby_properties',
    'featured_properties_section': 'featured_properties',
    'most_viewed_properties_section': 'most_viewed_properties',
    'most_liked_properties_section': 'most_liked_properties',
    'premium_properties_section': 'premium_properties',
    // Project sections
    'projects_section': 'projects',
    'featured_projects_section': 'featured_projects',
    // Other sections
    'categories_section': 'categories',
    'agents_list_section': 'agents',
    'articles_section': 'articles',
    'user_recommendations_section': 'user_recommendations',
    'faqs_section': 'faqs',
    'slider_section': 'slider'
};

// Property section types for mapping
const PROPERTY_SECTION_TYPES = [
    'nearby_properties_section',
    'featured_properties_section',
    'most_viewed_properties_section',
    'most_liked_properties_section',
    'premium_properties_section'
];

// Project section types for mapping
const PROJECT_SECTION_TYPES = [
    'projects_section',
    'featured_projects_section'
];

// Other section types for mapping
const OTHER_SECTION_TYPES = [
    'categories_section',
    'agents_list_section',
    'articles_section',
    'user_recommendations_section',
    'faqs_section',
    'slider_section'
];


const Home = () => {
    const t = useTranslation();
    const router = useRouter();

    // --- Use the custom hook to get reactive login status ---
    const isUserLoggedIn = useAuthStatus();

    const userSelectedLocation = useSelector(state => state.location);
    const languageCode = useSelector(state => state.LanguageSettings?.current_language?.code);
    const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
    const settings = useSelector(state => state.WebSetting?.data);
    const isHomePageLocationAlertEnabled = settings?.homepage_location_alert_status === "1";
    const [isHomepageDataAvailable, setIsHomepageDataAvailable] = useState(false);
    const activeLanguage = useSelector(state => state.LanguageSettings?.current_language?.code);

    // Location params for API calls
    const locationParams = {
        latitude: userSelectedLocation?.latitude || "",
        longitude: userSelectedLocation?.longitude || "",
        radius: userSelectedLocation?.radius || ""
    };

    // 1. Fetch Homepage Sections (order/structure)
    const sectionsQuery = useQuery({
        queryKey: ['homepageSections', activeLanguage],
        queryFn: async () => {
            const response = await api.getHomepageSectionsApi({});
            return response?.data || [];
        },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });

    // 2. Fetch Property Sections (nearby, featured, most_viewed, most_liked, premium)
    const propertySectionsQuery = useQuery({
        queryKey: ['homepagePropertySections', locationParams.latitude, locationParams.longitude, locationParams.radius, isUserLoggedIn, activeLanguage],
        queryFn: async () => {
            const response = await api.getHomepagePropertiesSectionApi(locationParams);
            // Check location data availability
            if (response?.data?.location_based_data === false && isHomePageLocationAlertEnabled) {
                handleLocationAlert();
            }
            setIsHomepageDataAvailable(response?.data?.location_based_data);
            return response?.data || {};
        },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });


    // 3. Fetch Project Sections (projects, featured_projects)
    const projectSectionsQuery = useQuery({
        queryKey: ['homepageProjectSections', locationParams.latitude, locationParams.longitude, locationParams.radius, activeLanguage],
        queryFn: async () => {
            const response = await api.getHomepageProjectsSectionApi(locationParams);
            return response?.data || {};
        },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });

    // 4. Fetch Other Sections (categories, agents, articles, user_recommendations, faqs, slider)
    const otherSectionsQuery = useQuery({
        queryKey: ['homepageOtherSections', locationParams.latitude, locationParams.longitude, locationParams.radius, isUserLoggedIn, activeLanguage],
        queryFn: async () => {
            const response = await api.getHomepageOtherSectionsApi(locationParams);
            return response?.data || {};
        },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });

    // 5. Fetch Map Section Data
    const mapQuery = useQuery({
        queryKey: ['homePageMap', locationParams.latitude, locationParams.longitude, locationParams.radius, activeLanguage],
        queryFn: async () => {
            const response = await api.getHomepagePropertiesOnMapSectionApi({});
            return response?.data?.data ?? [];
        },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });

    // 6. Fetch Cities Section Data
    const citiesQuery = useQuery({
        queryKey: ['homePageCities', activeLanguage],
        queryFn: async () => {
            const response = await api.getHomepagePropertyByCitiesSectionApi();
            return {
                data: response?.data?.data,
                with_image: response?.data?.with_image
            } ?? [];
        },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });

    // 7. Fetch Ad Banners
    const addBannersQuery = useQuery({
        queryKey: ['homeAdBanners'],
        queryFn: async () => {
            const response = await api.getAdBannerApi({
                page: "homepage",
                platform: "web"
            });
            return response?.data || [];
        },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });

    // Handle location alert
    const handleLocationAlert = () => {
        Swal.fire({
            title: t("locationDataNotAvailable"),
            text: t("pleaseChangeLocationOrContinue"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: t("changeLocation"),
            cancelButtonText: t("continue"),
            customClass: {
                confirmButton: "Swal-confirm-buttons",
                cancelButton: "Swal-cancel-buttons",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                setIsLocationPopupOpen(true);
            }
        });
    };

    // Helper function to get section data from the appropriate query
    const getSectionDataFromQueries = (sectionType) => {
        const dataKey = SECTION_TYPE_TO_KEY_MAP[sectionType];

        // Property sections
        if (PROPERTY_SECTION_TYPES.includes(sectionType)) {
            return propertySectionsQuery.data?.[dataKey]?.data || [];
        }

        // Project sections
        if (PROJECT_SECTION_TYPES.includes(sectionType)) {
            return projectSectionsQuery.data?.[dataKey]?.data || [];
        }

        // Other sections
        if (OTHER_SECTION_TYPES.includes(sectionType)) {
            return otherSectionsQuery.data?.[dataKey]?.data || [];
        }

        // Map section
        if (sectionType === 'properties_on_map_section') {
            return mapQuery.data || [];
        }

        // Cities section
        if (sectionType === 'properties_by_cities_section') {
            return citiesQuery.data?.data || [];
        }

        return [];
    };

    // Helper function to get translated title from sections query (titles come from main sections API)
    const getSectionTranslatedTitle = (sectionType) => {
        const sections = sectionsQuery.data || [];
        const section = sections.find(s => s.type === sectionType);
        return section?.translated_title || "";
    };

    // Helper function to get section title from sections query
    const getSectionTitle = (sectionType) => {
        const sections = sectionsQuery.data || [];
        const section = sections.find(s => s.type === sectionType);
        return section?.title || "";
    };

    // Merge sections with their data based on the order from sectionsQuery
    const mergedSections = sectionsQuery.data?.map(section => {
        const sectionType = section.type;
        const data = getSectionDataFromQueries(sectionType);
        const translated_title = getSectionTranslatedTitle(sectionType);
        const title = getSectionTitle(sectionType);

        // Special handling for cities section to include with_image
        if (sectionType === 'properties_by_cities_section') {
            return {
                ...section,
                data,
                translated_title,
                title,
                with_image: citiesQuery.data?.with_image
            };
        }

        return {
            ...section,
            data,
            translated_title,
            title
        };
    }) || [];

    // Get slider data from other sections
    const sliderData = otherSectionsQuery.data?.slider?.data || [];

    // Check if all main queries are loading
    const isMainDataLoading = sectionsQuery.isFetching ||
        propertySectionsQuery.isFetching ||
        projectSectionsQuery.isFetching ||
        otherSectionsQuery.isFetching;


    const getSectionInfo = (type) => {
        switch (type) {
            case "nearby_properties_section":
                return { Component: NearbyPropertiesSection, style: null, buttonText: "exploreMoreListings" };
            case "most_viewed_properties_section":
                return { Component: MostViewedSection, style: null, label: "checkOutMostViewed" };
            case "most_liked_properties_section":
                return { Component: MostLikedSection, style: null, label: "seeMostLiked" };
            case "properties_by_cities_section":
                return { Component: CitiesSection, style: "style_2", label: "exploreCities" };
            case "featured_projects_section":
                return { Component: FeaturedProjectsSection, style: "style_1", buttonLink: "/projects/featured-projects", buttonText: "browseFeaturedProjects" };
            case "user_recommendations_section":
                return { Component: UserRecommendationsSection, style: "style_1", buttonText: "exploreMoreListings" };
            case "categories_section":
                return { Component: CategoriesSection, style: "style_1", buttonLink: "/all/categories", buttonText: "exploreCategories" };
            case "agents_list_section":
                return { Component: AgentsSection, style: null };
            case "articles_section":
                return { Component: ArticlesSection, style: "style_3", buttonLink: "/all/articles", buttonText: "readMoreInsights" };
            case "projects_section":
                return { Component: ProjectsSection, style: "style_4", label: "exploreProjects" };
            case "faqs_section":
                return { Component: Faqs, style: null };
            case "featured_properties_section":
                return { Component: FeaturedPropertiesSection, style: null, buttonText: "seeFeaturedProperties" };
            case "premium_properties_section":
                return { Component: PremiumPropertiesSection, style: null, buttonText: "seeAllPremiumProperties" };
            case "properties_on_map_section":
                return { Component: MapSection, style: null, label: "exploreOnMap" };
            default:
                console.warn("Unknown section type:", type);
                return { Component: null, style: null };
        }
    };

    // --- Define a typical order for skeleton sections ---
    const SKELETON_SECTION_ORDER = [
        'featured_properties_section',
        'categories_section',
        'nearby_properties_section',
        'most_viewed_properties_section',
        'most_liked_properties_section',
        'properties_by_cities_section',
        'agents_list_section',
        'projects_section',
        'articles_section',
        'premium_properties_section',
        'user_recommendations_section',
        'featured_projects_section',
        'properties_on_map_section',
    ];

    // --- Helper to get the correct skeleton component based on type ---
    const getSkeletonForType = (type) => {
        switch (type) {
            case "nearby_properties_section":
                return NearbyPropertiesSkeleton;
            case "most_viewed_properties_section":
                return MostViewedSkeleton;
            case "most_liked_properties_section":
                return MostLikedSkeleton;
            case "featured_properties_section":
                return FeaturedPropertiesSkeleton;
            case "user_recommendations_section":
                return UserRecommendationSkeleton;
            case "properties_by_cities_section":
                return CitiesSkeleton;
            case "categories_section":
                return CircularItemsSkeleton;
            case "agents_list_section":
                return AgentSectionSkeleton;
            case "articles_section":
                return ArticleSectionSkeleton;
            case "projects_section":
                return ProjectsSkeleton;
            case "premium_properties_section":
                return PremiumPropertiesSkeleton;
            case "featured_projects_section":
                return FeaturedProjectsSkeleton;
            case "properties_on_map_section":
                return MapSkeleton;
            // FaqsSkeleton is handled separately at the end
            default:
                return PropertySectionSkeleton; // Fallback to a default skeleton
        }
    };


    const belowSliderAdBanner = addBannersQuery?.data?.find((banner) => banner.placement === "below_slider");
    const aboveFooterAdBanner = addBannersQuery?.data?.find((banner) => banner.placement === "above_footer");

    // Using external skeleton components imported from @/components/skeletons/home

    return (
        <section className=''>
            {isMainDataLoading ? (
                // Skeleton UI during loading
                <>
                    <MainSwiperSkeleton />
                    <div className="w-full h-[350px]" />
                    <div className='flex flex-col'>
                        {sectionsQuery?.data?.map((section, index) => {
                            const SkeletonComponent = getSkeletonForType(section?.type);
                            return <SkeletonComponent key={index} title={`Loading Section ${index + 1}...`} />;
                        })}
                    </div>
                    <FaqsSkeleton />
                </>
            ) : (
                // Actual content when data is loaded
                <>
                    <h1 className="sr-only hidden">{process.env.NEXT_PUBLIC_APPLICATION_NAME}</h1>
                    <MainSwiper slides={sliderData} />
                    {addBannersQuery?.isFetching ? (
                        // Show skeleton while banners are being fetched to avoid CLS
                        <div className="container mx-auto mb-[60px]">
                            <Skeleton className="w-full h-[350px] rounded-2xl" />
                        </div>
                    ) : belowSliderAdBanner ? (
                        <div
                            className="container mx-auto my-4 px-2 lg:mb-4 lg:px-0 max-h-[350px]"
                            onClick={() => {
                                if (belowSliderAdBanner?.external_link_url) {
                                    window.open(belowSliderAdBanner?.external_link_url, '_blank');
                                } else if (belowSliderAdBanner?.property?.slug_id) {
                                    router.push(`/property-details/${belowSliderAdBanner?.property?.slug_id}/?lang=${languageCode}`);
                                }
                            }}
                        >
                            <ImageWithPlaceholder
                                src={belowSliderAdBanner?.image}
                                alt="Ad Below Slider"
                                className={`w-full h-[350px] ${belowSliderAdBanner?.external_link_url || belowSliderAdBanner?.property?.slug_id ? 'cursor-pointer' : ''}`}
                                imageClassName="rounded-lg lg:rounded-2xl"
                                loading="lazy"
                            />
                        </div>
                    ) : null}
                    <div className='flex flex-col'>
                        {mergedSections?.map((apiSection, index) => {
                            const { Component, style, label, buttonLink, buttonText } = getSectionInfo(apiSection.type);
                            if (Component) {
                                // Special case for properties_nearby_cities which uses a different data source
                                const sectionData = apiSection.data;
                                // Make sure data is not empty or null before rendering
                                if (apiSection.type === 'properties_by_cities_section') {
                                    return (
                                        <Component
                                            translated_title={apiSection?.translated_title}
                                            title={apiSection.title} data={sectionData}
                                            key={index}
                                            index={index}
                                            name={apiSection.type}
                                            label={label}
                                            type={apiSection.type}
                                            with_image={apiSection?.with_image}
                                        />
                                    );
                                }
                                if (apiSection.type === 'faqs_section') {
                                    if (sectionData && Array.isArray(sectionData) && sectionData.length > 0) {
                                        return (
                                            <Component
                                                translated_title={apiSection?.translated_title}
                                                faqs={sectionData}
                                                key={index}
                                            />
                                        );
                                    }
                                } else if (apiSection.type === 'featured_properties_section') {
                                    if (sectionData && Array.isArray(sectionData) && sectionData.length > 0) {
                                        return (
                                            <Component
                                                translated_title={apiSection?.translated_title}
                                                title={apiSection.title}
                                                data={sectionData}
                                                key={index}
                                                index={index}
                                                name={apiSection.type}
                                                buttonLink={buttonLink}
                                                buttonText={buttonText}
                                                passLocationFilter={isHomepageDataAvailable}
                                            />
                                        );
                                    }
                                } else if (apiSection.type === 'properties_on_map_section') {
                                    return (
                                        <Component
                                            translated_title={apiSection?.translated_title}
                                            title={apiSection.title}
                                            data={sectionData}
                                            key={index}
                                            index={index}
                                            name={apiSection.type}
                                            passLocationFilter={isHomepageDataAvailable}
                                        />
                                    );
                                } else if (sectionData && (!Array.isArray(sectionData) || sectionData.length > 0)) {
                                    return (
                                        <Component
                                            translated_title={apiSection?.translated_title}
                                            title={apiSection.title}
                                            data={sectionData}
                                            key={index}
                                            index={index}
                                            name={apiSection.type}
                                            label={label}
                                            type={apiSection.type}
                                            buttonLink={buttonLink}
                                            buttonText={buttonText}
                                            passLocationFilter={isHomepageDataAvailable}
                                        />
                                    );
                                }
                            }
                            return null; // Don't render if no component found or data is empty
                        })}

                        {/* All Properties Section */}
                        <AllPropertiesSection />
                    </div>
                </>
            )}

            {/* Above Footer Ad Banner*/}
            {aboveFooterAdBanner && (
                <div
                    className="container mx-auto mb-4 px-2 lg:px-0 lg:mb-[60px]"
                    onClick={() => {
                        if (aboveFooterAdBanner?.external_link_url) {
                            window.open(aboveFooterAdBanner?.external_link_url, '_blank');
                        } else if (aboveFooterAdBanner?.property?.slug_id) {
                            router.push(`/property-details/${aboveFooterAdBanner?.property?.slug_id}/?lang=${languageCode}`);
                        }
                    }}
                >
                    <ImageWithPlaceholder
                        src={aboveFooterAdBanner?.image}
                        alt="Ad Above Footer"
                        className={`w-full h-[350px] ${aboveFooterAdBanner?.external_link_url || aboveFooterAdBanner?.property?.slug_id ? 'cursor-pointer' : ''}`}
                        imageClassName="rounded-lg lg:rounded-2xl"
                        loading="lazy"
                    />
                </div>
            )}

            {/* Location Search Popup */}
            {isLocationPopupOpen && (
                <LocationSearchWithRadius
                    isOpen={isLocationPopupOpen}
                    onClose={() => setIsLocationPopupOpen(false)}
                />
            )}
        </section>
    );
};

export default Home;