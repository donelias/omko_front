import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import * as api from "@/api/apiRoutes";
import { checkPackageAvailable } from "@/utils/checkPackages/checkPackage";
import { PackageTypes } from "@/utils/checkPackages/packageTypes";
import OwnerDetailsCard from "../owner-details-card/OwnerDetailsCard";
import PropertyGallery from "./PropertyGallery";
import AboutProperty from "./AboutProperty";
import MortgageLoanCalculator from "./MortgageLoanCalculator";
import PropertyAddress from "./PropertyAddress";
import FeaturesAmenities from "./FeatureAmenities";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useTranslation } from "../context/TranslationContext";
import PriceSuggestionCard from "../price-intelligence/PriceSuggestionCard";
import PriceAnalysisModal from "../price-intelligence/PriceAnalysisModal";
import FileAttachments from "../project-details/FileAttachments";
import { setCacheChat } from "@/redux/slices/cacheSlice";
import toast from "react-hot-toast";
import ReportModal from "./ReportModal";
import LoginModal from "../modal/LoginModal";
import NewBreadcrumb from "../breadcrumb/NewBreadCrumb";
import PropertyInfoBanner from "./PropertyInfoBanner";
import ShareDialog from "../reusable-components/ShareDialog";
import { BiSolidErrorAlt } from "react-icons/bi";
import SimilarPropertySlider from "./SimilarPropertySlider";
import { PropertyDetailSkeleton } from "../skeletons/property-skeletons";
import { isSupported } from "firebase/messaging";
import { capitalizeFirstLetter, showLoginSwal } from "@/utils/helperFunction";
import LightBox from "./LightBox";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBottomSheet from "../mobile-bottom-sheet/MobileBottomSheet";
import { AppointmentScheduleModal } from "../appointment-modal";
import NoDataFound from "../no-data-found/NoDataFound";
import { useQuery } from "@tanstack/react-query";
import AdBanner from "./AdBanner";
import VirtualTour360 from "./VirtualTour360";
import { trackEvent } from "@/utils/analytics";
import { initMetaPixel, trackMeta } from "@/utils/metaPixel";
import { getFbclid } from "@/utils/utm";
import AvailabilityBookingWidget from "./AvailabilityBookingWidget";

const PropertyDetails = ({ initialData, seoData }) => {
  const t = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const query = router.query;
  const { lang } = router.query;
  const [isMessagingSupported, setIsMessagingSupported] = useState(false);
  const [notificationPermissionGranted, setNotificationPermissionGranted] =
    useState(false);

  const currentUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/property-details/${query.slug}?share=true&lang=${lang}`;
  const slug = query?.slug;

  const isShare = query?.share === "true";
  const isMobile = useIsMobile();

  // When getServerSideProps delivered the property data, render it immediately
  // (this is what search engines see) and skip the duplicate client fetch.
  const initialProperty = initialData?.data?.[0] || null;
  const hasServerData = initialData?.data?.length > 0;

  const [propertyDetails, setPropertyDetails] = useState(initialProperty);
  const [similarProperties, setSimilarProperties] = useState(initialData?.similar_properties || []);
  const [imageURL, setImageURL] = useState(initialProperty?.three_d_image);
  const [showMap, setShowMap] = useState(false);
  const [isReportModal, setIsReportModal] = useState(false);
  const [interested, setInterested] = useState(initialProperty?.is_interested || false);
  const [isFavourite, setIsFavourite] = useState(Boolean(initialProperty?.is_favourite));
  const [isReported, setIsReported] = useState(initialProperty?.is_reported || false);
  const [showChat, setShowChat] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!hasServerData);
  const [showReport, setShowReport] = useState(true);
  // Lightbox states
  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [chatData, setChatData] = useState({
    property_id: "",
    title: "",
    title_image: "",
    user_id: "",
    name: "",
    profile: "",
  });

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(2);
  const [isPropertyFound, setIsPropertyFound] = useState(true);
  const trackedPropertyIdRef = useRef(null);

  const webSettings = useSelector((state) => state.WebSetting?.data);
  const userData = useSelector((state) => state.User?.data);
  const language = useSelector((state) => state.LanguageSettings?.active_language);
  const DistanceSymbol = webSettings?.distance_option;
  const [isPremiumUser, setIsPremiumUser] = useState(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const isPremiumProperty = propertyDetails && propertyDetails?.is_premium;
  const PlaceHolderImg = webSettings?.web_placeholder_logo;
  const userCurrentId = userData?.id;

  const showExactLocation = webSettings?.show_exact_location === "1";
  const userCompleteData = [
    "name",
    "email",
    "mobile",
    "profile",
    "address",
  ].every((key) => userData?.[key]);

  // Function to open lightbox
  const openLightbox = (index) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  };

  const handleReportModal = () => {
    setIsReportModal(!isReportModal);
  };

  useEffect(() => {
    const checkMessagingSupport = async () => {
      try {
        const supported = await isSupported();
        setIsMessagingSupported(supported);

        if (supported) {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            setNotificationPermissionGranted(true);
          }
        }
      } catch (error) {
        console.error("Error checking messaging support:", error);
      }
    };

    checkMessagingSupport();
  }, [notificationPermissionGranted, isMessagingSupported]);

  const getProperDetailsBySlug = async () => {
    try {
      setIsLoading(true); // Set loading to true when starting API call
      const response = await api.getPropertyDetails({ slug_id: query.slug });
      if (response?.data?.length === 0) {
        setIsLoading(false);
        setIsPropertyFound(false);
        return;
      }
      const property = response?.data?.[0];
      setIsReported(property?.is_reported);
      setPropertyDetails(property);
      setImageURL(property?.three_d_image);
      setSimilarProperties(response?.similar_properties);
      setInterested(property?.is_interested);
      setIsFavourite(Boolean(property?.is_favourite));

      if (property?.id && trackedPropertyIdRef.current !== property.id) {
        trackedPropertyIdRef.current = property.id;
        trackEvent('view_item', {
          item_id: property.id,
          item_category: 'property',
          item_variant: property?.property_type,
          price: property?.price,
          city: property?.city,
        });
      }
    } catch (error) {
      console.error("error", error);
    } finally {
      setIsLoading(false); // Always set loading to false when done
    }
  };

  // Meta Ads: inicializa el pixel del agente dueño de la propiedad y dispara
  // ViewContent. El pixel_id viene de la integración del agente (frontend).
  const metaPixelEventRef = useRef(null);

  useEffect(() => {
    if (!propertyDetails?.id) return;

    const ownerPixel = propertyDetails?.pixel_id ?? propertyDetails?.customer?.pixel_id;

    if (ownerPixel) {
      initMetaPixel(ownerPixel);
      setTimeout(() => {
        if (metaPixelEventRef.current !== `${ownerPixel}:${propertyDetails.id}`) {
          metaPixelEventRef.current = `${ownerPixel}:${propertyDetails.id}`;
          trackMeta("ViewContent", {
            content_name: propertyDetails?.title || query?.slug,
            content_id: String(propertyDetails.id),
            content_category: "realestate",
            value: propertyDetails?.price != null ? Number(propertyDetails.price) : undefined,
            currency: propertyDetails?.currency || "USD",
          });
        }
      }, 300);
    }
  }, [propertyDetails?.id]);

  // SSR-aware data load:
  // - On mount with server data for the current slug: keep it, no refetch.
  // - On slug change (SPA navigation): sync from the new server props or fetch.
  useEffect(() => {
    if (!query.slug || query.slug === "") return;

    const serverProperty = initialData?.data?.[0];
    if (serverProperty && serverProperty.slug_id === query.slug) {
      setPropertyDetails(serverProperty);
      setIsReported(serverProperty?.is_reported);
      setImageURL(serverProperty?.three_d_image);
      setSimilarProperties(initialData?.similar_properties || []);
      setInterested(serverProperty?.is_interested);
      setIsFavourite(Boolean(serverProperty?.is_favourite));
      setIsPropertyFound(true);
      setIsLoading(false);
      return;
    }

    getProperDetailsBySlug();
  }, [query.slug, initialData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Property Address Details Section
  const details = [
    { label: t("address"), value: propertyDetails?.address },
    { label: t("country"), value: propertyDetails?.country },
    { label: t("city"), value: propertyDetails?.city },
    { label: t("zipCode"), value: propertyDetails?.zip_code },
    { label: t("state"), value: propertyDetails?.state },
  ];

  useEffect(() => {
    if (propertyDetails && propertyDetails?.three_d_image) {
      setImageURL(propertyDetails?.three_d_image); // Set Panorama Image
    }
  }, [propertyDetails]);

  const handleShowMap = () => {
    if (isPremiumProperty) {
      if (!userCurrentId) {
        showLoginSwal("oops", "plzLoginFirstToViewMap", () => {
          setShowLoginModal(true);
        }, t);
        return;
      }
      if (isPremiumUser) {
        setShowMap(true);
      } else {
        Swal.fire({
          title: t("opps"),
          text: t("itsPrivatePrperty"),
          icon: "warning",
          allowOutsideClick: true,
          showCancelButton: false,
          customClass: {
            confirmButton: "Swal-confirm-buttons",
            cancelButton: "Swal-cancel-buttons",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            router.push(`/subscription-plan?lang=${lang}`);
          }
        });
      }
    } else {
      setShowMap(true);
    }
  };

  const handleOpenGoogleMap = () => {

    if (isPremiumProperty) {
      if (!userCurrentId) {
        showLoginSwal("oops", "plzLoginFirstToViewMap", () => {
          setShowLoginModal(true);
        }, t);
        return;
      }
      if (isPremiumUser) {
        router.push(
          `https://www.google.com/maps?q=${propertyDetails?.latitude},${propertyDetails?.longitude}`,
        );
      } else {
        Swal.fire({
          title: t("opps"),
          text: t("itsPrivatePrperty"),
          icon: "warning",
          allowOutsideClick: true,
          showCancelButton: false,
          customClass: {
            confirmButton: "Swal-confirm-buttons",
            cancelButton: "Swal-cancel-buttons",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            router.push(`/subscription-plan?lang=${lang}`);
          }
        });
      }
    } else {
      router.push(
        `https://www.google.com/maps?q=${propertyDetails?.latitude},${propertyDetails?.longitude}`,
      );
    }
  };

  const videoLink = propertyDetails && propertyDetails.video_link;

  const videoId = videoLink
    ? videoLink.includes("youtu.be")
      ? videoLink.split("/").pop().split("?")[0]
      : (videoLink.split("v=")[1]?.split("&")[0] ?? null)
    : null;

  const backgroundImageUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/sddefault.jpg`
    : PlaceHolderImg;

  const handleNotInterested = async (e) => {
    e.preventDefault();
    try {
      const res = await api.interestedPropertyApi({
        property_id: propertyDetails?.id,
        type: "0",
      });
      if (!res?.error) {
        setInterested(false);
        toast.success(t(res?.message));
      }
    } catch (error) {
      toast.error(t(error?.message));
      console.error("Error while toggling interested property:", error);
    }
  };

  const handleInterested = async (e) => {
    e.preventDefault();
    if (userCurrentId) {
      try {
        const res = await api.interestedPropertyApi({
          property_id: propertyDetails?.id,
          type: "1",
        });
        if (!res?.error) {
          setInterested(true);
          toast.success(t(res?.message));
          trackEvent(
            'generate_lead',
            { lead_source: 'interested', item_id: propertyDetails?.id },
            { clarity: true }
          );
        }
      } catch (error) {
        toast.error(t(error?.message));
        console.error("Error while toggling interested property:", error);
      }
    } else {
      Swal.fire({
        title: t("plzLogFirstIntrest"),
        icon: "warning",
        allowOutsideClick: false,
        showCancelButton: false,
        allowOutsideClick: true,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        confirmButtonText: t("ok"),
      }).then((result) => {
        if (result.isConfirmed) {
          setShowLoginModal(true);
        }
      });
    }
  };

  const handleRemoveFavourite = async (e) => {
    e.preventDefault();
    if (!userCurrentId) return;

    try {
      const res = await api.addFavouritePropertyApi({
        property_id: propertyDetails?.id,
        type: "0",
      });
      if (!res?.error) {
        setIsFavourite(false);
        toast.success(t(res?.message));
      } else {
        toast.error(t(res?.message));
      }
    } catch (error) {
      toast.error(t(error?.message));
      console.error("Error while removing favourite property:", error);
    }
  };

  const handleAddFavourite = async (e) => {
    e.preventDefault();
    if (userCurrentId) {
      try {
        const res = await api.addFavouritePropertyApi({
          property_id: propertyDetails?.id,
          type: "1",
        });
        if (!res?.error) {
          setIsFavourite(true);
          toast.success(t(res?.message));
        } else {
          toast.error(t(res?.message));
        }
      } catch (error) {
        toast.error(t(error?.message));
        console.error("Error while adding favourite property:", error);
      }
    } else {
      Swal.fire({
        title: t("plzLogFirst"),
        icon: "warning",
        allowOutsideClick: true,
        showCancelButton: false,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        confirmButtonText: t("ok"),
      }).then((result) => {
        if (result.isConfirmed) {
          setShowLoginModal(true);
        }
      });
    }
  };

  const handleReportProperty = (e) => {
    e.preventDefault();
    if (userCurrentId) {
      setIsReportModal(true);
    } else {
      Swal.fire({
        title: t("plzLogFirsttoAccess"),
        icon: "warning",
        allowOutsideClick: false,
        showCancelButton: false,
        allowOutsideClick: true,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        confirmButtonText: t("ok"),
      }).then((result) => {
        if (result.isConfirmed) {
          setShowLoginModal(true);
        }
      });
    }
  };

  const handleChat = (e) => {
    e.preventDefault();
    if (userCurrentId) {
      const searchParams = new URLSearchParams();
      searchParams.set("propertyId", propertyDetails?.id);
      searchParams.set("userId", propertyDetails?.added_by);
      const data = {
        property_id: propertyDetails?.id,
        user_id: propertyDetails?.added_by,
        title: propertyDetails?.title,
        title_image: propertyDetails?.title_image,
        name: propertyDetails?.customer_name,
        profile: propertyDetails?.profile,
        is_blocked_by_me: propertyDetails?.is_blocked_by_me,
        is_blocked_by_user: propertyDetails?.is_blocked_by_user,
        date: new Date().toISOString(),
      };
      dispatch(setCacheChat(data));
      router.push(`/user/chat?${searchParams.toString()}&lang=${lang}`);
    } else {
      Swal.fire({
        title: t("plzLogFirsttoAccess"),
        icon: "warning",
        allowOutsideClick: false,
        showCancelButton: false,
        allowOutsideClick: true,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        confirmButtonText: t("ok"),
      }).then((result) => {
        if (result.isConfirmed) {
          setShowLoginModal(true);
        }
      });
      setShowChat(true);
    }
  };

  const handleCheckPremiumUserAgent = (e) => {
    e.preventDefault();
    router.push(
      `/agent-details/${propertyDetails?.customer_slug_id}?lang=${lang}`,
    );
  };

  const galleryPhotos = propertyDetails?.gallery;

  const checkPremiumProperty = () => {
    if (isPremiumProperty && isPremiumUser === false) {
      Swal.fire({
        title: t("oops"),
        text: t("premiumPropertiesLimitOrPackageNotAvailable"),
        icon: "warning",
        allowOutsideClick: false,
        showCancelButton: false,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          router.push(`/subscription-plan?lang=${lang}`);
        }
      });
    }
  };

  useEffect(() => {
    if (!isPremiumProperty) return; // only check for premium properties

    const runPremiumCheck = async () => {
      const hasAccess = await checkPackageAvailable(PackageTypes.PREMIUM_PROPERTIES);
      setIsPremiumUser(hasAccess);
    };

    runPremiumCheck();
  }, [isPremiumProperty]);

  useEffect(() => {
    // Only fire once the API has responded (isPremiumUser is no longer null)
    if (isPremiumProperty && isPremiumUser !== null) {
      checkPremiumProperty();
    }
  }, [isPremiumProperty, isPremiumUser]);


  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  const handleBookStepPrev = () => {
    if (currentStep >= 2) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBookingStep = (step) => {
    if (step === 1) {
      return;
    } else {
      setCurrentStep(step);
    }
  }

  // Function to fetch Ad Banners for Property Detail Page
  const fetchPropertyDetailAdBanners = async () => {
    try {
      const response = await api.getAdBannerApi({
        page: "property_detail",
        platform: "web",
      })
      return response?.data || [];
    } catch (error) {
      console.error("Error fetching ad banners in property detail:", error);
      return [];
    }
  }

  const detailsAdBanner = useQuery({
    queryKey: ['propertyDetailAdBanners'],
    queryFn: fetchPropertyDetailAdBanners,
    staleTime: 0,
  })


  const aboveBreadcrumbAdBanner = detailsAdBanner?.data?.find(banner => banner?.placement === 'above_breadcrumb');
  const belowMortgageAdBanner = detailsAdBanner?.data?.find(banner => banner?.placement === 'sidebar_below_mortgage_loan_calculator');
  const aboveSimilarPropertiesAdBanner = detailsAdBanner?.data?.find(banner => banner?.placement === 'above_footer');

  // Show skeleton while loading
  if (isLoading) {
    return <PropertyDetailSkeleton />;
  }

  if (!isLoading && !isPropertyFound) {
    return (<NoDataFound title={t("propertyNotFound")} description={t("propertyNotFoundDescription")} />);
  }

  return (
    <section className={`${isPremiumProperty && !isPremiumUser ? "blur-md" : ""}`}>
      <div className="primaryBackgroundBg">
        <div className="container mx-auto px-3 pb-8">
          {aboveBreadcrumbAdBanner && (
            <AdBanner
              banner={aboveBreadcrumbAdBanner}
              width={1920}
              height={350}
              aspectClass="aspect-[1920/350]"
              wrapperClassName="pt-12"
              imgClassName="rounded-lg lg:rounded-2xl"
              router={router}
              lang={lang}
            />
          )}
          {/* Main Content */}
          <NewBreadcrumb
            items={[
              {
                label: t("propertyDetails"),
                href: `/property-details/${propertyDetails?.slug_id}`,
                disable: true
              },
              {
                label: capitalizeFirstLetter(propertyDetails?.title),
                href: `/property-details/${propertyDetails?.slug_id}`,
              },
            ]}
            layout="reverse"
            showLike={true}
            setIsShareModalOpen={setIsShareModalOpen}
            handleInterested={handleAddFavourite}
            handleNotInterested={handleRemoveFavourite}
            interested={isFavourite}
          />
          <div className="grid grid-cols-12 items-center justify-center gap-3">
            <div className="col-span-12">
              {/* Property Gallery */}
              {galleryPhotos && (
                <PropertyGallery
                  galleryPhotos={galleryPhotos}
                  titleImage={propertyDetails?.title_image}
                  blurDataURL={propertyDetails?.low_quality_title_image}
                  PlaceholderImage={PlaceHolderImg}
                  onImageClick={openLightbox}
                  videoLink={propertyDetails?.video_link}
                  videoType={propertyDetails?.video_type}
                />
              )}
            </div>
          </div>

          {/* Property Info Banner */}
          {propertyDetails && <PropertyInfoBanner property={propertyDetails} />}
        </div>
      </div>
      <div className="bg-white">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-12 gap-3">
            {/* Property Gallery */}
            <div className="col-span-12 h-full w-full rounded-lg xl:col-span-9">
              {/* About Property */}
              {propertyDetails && propertyDetails?.description && (
                <AboutProperty description={propertyDetails?.translated_description || propertyDetails?.description} />
              )}

              {/* Features & Amenities */}
              <FeaturesAmenities
                data={propertyDetails}
                DistanceSymbol={DistanceSymbol}
                themeEnabled={webSettings?.svg_clr === "1"}
              />

              {/* Property Address */}
              {propertyDetails &&
                propertyDetails?.latitude &&
                propertyDetails?.longitude && (
                  <PropertyAddress
                    latitude={propertyDetails?.latitude}
                    longitude={propertyDetails?.longitude}
                    handleShowMap={handleShowMap}
                    handleOpenGoogleMap={handleOpenGoogleMap}
                    isPremiumProperty={isPremiumProperty}
                    isPremiumUser={isPremiumUser}
                    details={details}
                    showMap={showMap}
                    showExactLocation={showExactLocation}
                  />
                )}

              {/* 360degree Virtual Tour */}
              <VirtualTour360 imageURL={imageURL} />

              {/* Video */}
              {/* {propertyDetails && propertyDetails?.video_link && (
                <Video
                  bgImageUrl={backgroundImageUrl}
                  videoLink={propertyDetails?.video_link}
                />
              )} */}

              {propertyDetails &&
                propertyDetails?.documents &&
                propertyDetails.documents.length > 0 && (
                  <FileAttachments
                    files={propertyDetails.documents}
                    projectCategory={propertyDetails.category?.category}
                    isProperty={true}
                  />
                )}
            </div>

            {/* Sidebar */}
            <div className="col-span-12 h-full w-full xl:col-span-3">
              {/* Property Owner */}
              {propertyDetails && (
                <OwnerDetailsCard
                  ownerData={propertyDetails}
                  showChat={showChat}
                  userCurrentId={userCurrentId}
                  interested={interested}
                  isReported={isReported}
                  handleInterested={handleInterested}
                  handleNotInterested={handleNotInterested}
                  isMessagingSupported={isMessagingSupported}
                  notificationPermissionGranted={notificationPermissionGranted}
                  handleChat={handleChat}
                  handleReportProperty={handleReportModal}
                  placeholderImage={PlaceHolderImg}
                  handleCheckPremiumUserAgent={handleCheckPremiumUserAgent}
                  setShowAppointmentModal={setShowAppointmentModal}
                />
              )}

              {/* Short-term availability & booking (rental properties) */}
              {propertyDetails && propertyDetails?.property_type === "rent" && (
                <AvailabilityBookingWidget
                  property={propertyDetails}
                  showLoginModal={showLoginModal}
                  setShowLoginModal={setShowLoginModal}
                />
              )}

              {handleReportProperty &&
                userCurrentId !== propertyDetails?.added_by &&
                !isReported && showReport && (
                  <div className="newBorder mb-7 flex flex-col justify-between gap-2  p-3 md:flex-row rounded-2xl">
                    <button
                      className="flex items-center gap-2 py-2 text-sm font-medium text-red-500"
                      onClick={handleReportProperty}
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 p-2">
                        <BiSolidErrorAlt className="h-7 w-7 text-red-500" />
                      </div>
                      <span className="brandColor text-start text-sm font-medium">
                        {t("reportPropertyPlaceholder")}
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      <div
                        className="border brandBorder hover:brandBg flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium hover:text-white hover:cursor-pointer"
                        onClick={handleReportProperty}
                      >
                        {t("yes")}
                      </div>
                      <button className="brandColor flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium"
                        onClick={() => setShowReport(false)}>
                        {t("no")}
                      </button>
                    </div>
                  </div>
                )}

              {/* Price Intelligence (registered users only) */}
              {userCurrentId && propertyDetails?.request_status === "approved" && (
                <div className="mb-7">
                  <PriceSuggestionCard
                    propertyId={propertyDetails?.id}
                    currentPrice={propertyDetails?.price}
                    currency={propertyDetails?.currency || "DOP"}
                    onViewAnalysis={() => setIsAnalysisOpen(true)}
                  />
                </div>
              )}

              {/* Mortgage Loan Calculator */}
              {propertyDetails?.property_type === "sell" && (
                <MortgageLoanCalculator propertyDetails={propertyDetails}
                  showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />
              )}
              {belowMortgageAdBanner && (
                <AdBanner
                  banner={belowMortgageAdBanner}
                  width={387}
                  height={587}
                  aspectClass="aspect-[387/587]"
                  wrapperClassName="mt-6"
                  imgClassName="rounded-2xl"
                  router={router}
                  lang={lang}
                />
              )}
            </div>
          </div>
          {aboveSimilarPropertiesAdBanner && (
            <AdBanner
              banner={aboveSimilarPropertiesAdBanner}
              width={1920}
              height={350}
              aspectClass="aspect-[1920/350]"
              wrapperClassName="mt-10 mb-4 lg:mb-8"
              imgClassName="rounded-lg lg:rounded-2xl"
              router={router}
              lang={lang}
              alt="Ad Below Breadcrumb"
            />
          )}
        </div>
      </div>
      <div className="primaryBackgroundBg">
        <div className="container mx-auto px-3 py-8">

          {/* Similar Properties Section */}
          <SimilarPropertySlider
            data={similarProperties}
            isLoading={false}
            isUserProperty={false}
            currentPropertyId={propertyDetails?.id}
          />
        </div>
      </div>
      {isMobile && isShare && <MobileBottomSheet isShare={true} />}
      {isReportModal && (
        <ReportModal
          open={isReportModal}
          handleReportModal={handleReportModal}
          propertyId={propertyDetails?.id}
          setIsReported={setIsReported}
        />
      )}
      {showLoginModal && (
        <LoginModal
          showLogin={showLoginModal}
          setShowLogin={setShowLoginModal}
        />
      )}
      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareDialog
          title={t("sharePropertyTitle")}
          pageUrl={currentUrl}
          open={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          subtitle={t("sharePropertySubtitle")}
          slug={slug}
        />
      )}

      {/* Price Intelligence Modal */}
      <PriceAnalysisModal
        open={isAnalysisOpen}
        onOpenChange={setIsAnalysisOpen}
        propertyId={propertyDetails?.id}
        property={{
          id: propertyDetails?.id,
          title: propertyDetails?.title,
          price: propertyDetails?.price,
          currency: propertyDetails?.currency,
          state: propertyDetails?.state,
          city: propertyDetails?.city,
          property_type: propertyDetails?.property_type,
        }}
      />

      {/* LightBox Component */}
      <LightBox
        photos={propertyDetails?.gallery || []}
        viewerIsOpen={viewerIsOpen}
        currentImage={currentImage}
        onClose={() => setViewerIsOpen(false)}
        title_image={propertyDetails?.title_image}
        setCurrentImage={setCurrentImage}
      />

      {showAppointmentModal && (
        <AppointmentScheduleModal
          isOpen={showAppointmentModal}
          handlePrev={handleBookStepPrev}
          onClose={() => setShowAppointmentModal(false)}
          selectedProperty={propertyDetails}
          userData={userData}
          currentStep={currentStep}
          totalSteps={3}
          onContinue={handleNextStep}
          handleBookingStep={handleBookingStep}
          isBookingFromProperty={true}
        />
      )}
    </section>
  );
};

export default PropertyDetails;
