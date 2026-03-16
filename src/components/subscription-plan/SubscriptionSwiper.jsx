"use client";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
} from "@/components/ui/carousel";
import { useRouter } from "next/router";
import { useTranslation } from "../context/TranslationContext";
import SubscriptionCard from "./SubscriptionCard";
import SubscriptionSkeletonCard from "./SubscriptionSkeletonCard";
import {
  assignFreePackageApi, getPackagesApi,
  getPaymentSettingsApi,
  getWebSetting
} from "@/api/apiRoutes";
import { useDispatch, useSelector } from "react-redux";
import LoginModal from "../modal/LoginModal";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import NewBreadcrumb from "../breadcrumb/NewBreadCrumb";
import PaymentHandlers from "./PaymentHandlers";
import PaymentSelectionModal from "./PaymentSelectionModal";
import { isRTL } from "@/utils/helperFunction";
import NoDataFound from "../no-data-found/NoDataFound";
import { setWebSettings } from "@/redux/slices/webSettingSlice";
import { setLanguages } from "@/redux/slices/languageSlice";

const SubscriptionSwiper = () => {
  const t = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const lang = router?.query?.lang;

  const [packagedata, setPackageData] = useState([]);
  const [allFeatures, setAllFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [paymentSettingsdata, setPaymentSettingsData] = useState([]);
  const [priceData, setPriceData] = useState("");
  const [stripeformModal, setStripeFormModal] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [showPaypalModal, setShowPaypal] = useState(false);
  const [showFlutterwaveModal, setShowFlutterwaveModal] = useState(false);
  const [showCashfree, setShowCashfree] = useState(false);
  const [showPhonepe, setShowPhonepe] = useState(false);
  const [showMidtrans, setShowMidtrans] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);

  const user = useSelector((state) => state.User?.data);
  const webSettings = useSelector((state) => state.WebSetting?.data);
  const token = useSelector((state) => state.User?.jwtToken);
  const language = useSelector((state) => state.LanguageSettings?.active_language);
  const currentLanguage = useSelector((state) => state.LanguageSettings?.current_language);

  const isUserLoggedIn = token ? true : false;

  // Safe array check - ensure paymentSettingsdata is always an array
  const paymentDataArray = Array.isArray(paymentSettingsdata) ? paymentSettingsdata : [];

  // Check if Stripe gateway is active
  const stripeActive = paymentDataArray.some(
    (item) => item.type === "stripe_gateway" && item.data === "1",
  );

  // Check if Razorpay gateway is active
  const razorpayActive = paymentDataArray.some(
    (item) => item.type === "razorpay_gateway" && item.data === "1",
  );

  // Check if PayStack gateway is active
  const payStackActive = paymentDataArray.some(
    (item) => item.type === "paystack_gateway" && item.data === "1",
  );

  // Check if PayPal gateway is active
  const payPalActive = paymentDataArray.some(
    (item) => item.type === "paypal_gateway" && item.data === "1",
  );

  // Check if Flutterwave gateway is active
  const FlutterwaveActive = paymentDataArray.some(
    (item) => item.type === "flutterwave_status" && item.data === "1",
  );

  // Check if Bank Transfer is active - you may need to adjust this based on your actual settings
  const bankTransferActive = paymentDataArray.some(
    (item) => item.type === "bank_transfer_status" && item.data === "1",
  );

  // Check if Cashfree gateway is active
  const cashFreeActive = paymentDataArray.some(
    (item) => item.type === "cashfree_gateway" && item.data === "1",
  );

  // Check if Midtrans gateway is active
  const midtransActive = paymentDataArray.some(
    (item) => item.type === "midtrans_gateway" && item.data === "1",
  );

  // Check if Phonepe gateway is active
  const phonepeActive = paymentDataArray.some(
    (item) => item.type === "phonepe_gateway" && item.data === "1",
  );

  // Sample bank details - you should fetch this from your backend or settings
  const bankDetails = webSettings?.bank_details;

  // Carousel options for responsive behavior
  const carouselOptions = {
    dragFree: true,
    loop: false,
    slidesToScroll: "auto",
    direction: isRTL() ? "rtl" : "ltr",
  };

  const fetchWebSettings = async () => {
    try {
      const res = await getWebSetting();
      if (!res?.error) {
        dispatch(setWebSettings({ data: res.data }));
        dispatch(setLanguages({ data: res.data.languages }));
        document.documentElement.lang = currentLanguage?.code;
        document.dir = currentLanguage?.rtl === 1 ? "rtl" : "ltr";
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch packages data
  useEffect(() => {
    fetchPackages();
    fetchWebSettings();
  }, [isUserLoggedIn, language]);

  // Fetch payment settings data
  useEffect(() => {
    if (isUserLoggedIn) {
      fetchPaymentSettings();
    }
  }, [isUserLoggedIn]);

  const fetchPaymentSettings = async () => {
    try {
      const res = await getPaymentSettingsApi();
      if (!res?.error) {
        // Ensure data is always an array
        const paymentData = Array.isArray(res?.data) ? res?.data : [];
        setPaymentSettingsData(paymentData);
      } else {
        console.error("Error fetching payment settings:", res?.message);
        setPaymentSettingsData([]);
      }
    } catch (err) {
      console.error("Error fetching payment settings:", err);
      setPaymentSettingsData([]);
    }
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setLoadingError(null);
      const res = await getPackagesApi();
      
      if (!res?.error) {
        const packageData = Array.isArray(res?.data) ? res?.data : [];
        const allFeatures = Array.isArray(res?.all_features) ? res?.all_features : [];
        const allActivePackages = Array.isArray(res?.active_packages) ? res?.active_packages : [];

        // Combine both lists (active packages + all packages)
        const combinedPackages = [...allActivePackages, ...packageData];

        // Sort to ensure active packages (is_active === 1) appear first
        const sortedPackages = combinedPackages.sort((a, b) => {
          const getPriority = (pkg) => {
            if (pkg.is_active) return 3;
            if (pkg.package_status === "review") return 2;
            if (pkg.package_status === "rejected") return 1;
            return 0;
          };
          return getPriority(b) - getPriority(a);
        });

        // Set final sorted data
        setPackageData(sortedPackages.length > 0 ? sortedPackages : []);
        setAllFeatures(allFeatures);
      } else {
        const errorMsg = res?.message || "Failed to fetch packages";
        console.error("Error fetching packages:", errorMsg);
        setLoadingError(errorMsg);
        setPackageData([]);
        setAllFeatures([]);
      }
      setLoading(false);
    } catch (err) {
      const errorMsg = err?.message || "Error fetching packages";
      console.error("Error fetching packages:", err);
      setLoadingError(errorMsg);
      setPackageData([]);
      setAllFeatures([]);
      setLoading(false);
    }
  };

  // Handle Payment Modal
  const subscribePayment = (e, data) => {
    e.preventDefault();

    if (!isUserLoggedIn) {
      Swal.fire({
        title: t("oops"),
        text: "You need to login!",
        icon: "warning",
        allowOutsideClick: false,
        showCancelButton: false,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        confirmButtonText: t("ok"),
      }).then((result) => {
        if (result.isConfirmed) {
          setShowModal(true);
        }
      });
      return false;
    }

    if (webSettings.demo_mode && user?.is_demo_user) {
      Swal.fire({
        title: t("oops"),
        text: t("notAllowdDemo"),
        icon: "warning",
        showCancelButton: false,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        confirmButtonText: t("ok"),
      });
      return false;
    }

    setPriceData(data);

    // Handle free packages
    if (data?.package_type === "free") {
      // Confirm before assigning free package
      Swal.fire({
        title: t("areYouSure"),
        text: t("areYouSureToBuyThisFreePackage"),
        icon: "warning",
        showCancelButton: true,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        cancelButtonColor: "#d33",
        confirmButtonText: t("yes"),
        cancelButtonText: t("no"),
      }).then((result) => {
        if (result.isConfirmed) {
          handleFreePackage(data);
        }
      });
      return;
    }

    // Handle paid packages based on active payment methods
    if (isUserLoggedIn) {
      const hasOnlinePayment = hasActiveOnlinePayment();

      if (hasOnlinePayment && bankTransferActive) {
        setShowPaymentSelection(true);
      } else if (hasOnlinePayment) {
        setShowPaymentSelection(true);
      } else if (bankTransferActive) {
        setShowPaymentSelection(true);
      } else {
        Swal.fire({
          title: t("oops"),
          text: t("noPaymentActive") || "No payment method is active",
          icon: "warning",
          showCancelButton: false,
          customClass: {
            confirmButton: "Swal-confirm-buttons",
            cancelButton: "Swal-cancel-buttons",
          },
          confirmButtonText: t("ok"),
        }).then(() => {
          router.push(`/contact-us/?lang=${lang}`);
        });
      }
    }
  };

  // Handle free package assignment
  const handleFreePackage = async (data) => {
    try {
      const res = await assignFreePackageApi({
        package_id: data?.id,
      });
      if (!res?.error) {
        router.push(`/?lang=${lang}`);
        toast.success(t(res?.message));
      } else {
        console.error("Error Assigning Free Package:", res?.message);
        toast.error(t(res?.message) || t("errorOccurred"));
      }
    } catch (error) {
      console.error("Error Assigning Free Package:", error);
      toast.error(t(error?.message) || t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  // Handle online payment selection with specific gateway
  const handleOnlinePayment = (selectedGateway) => {
    setShowPaymentSelection(false);

    switch (selectedGateway) {
      case "stripe":
        if (stripeActive) setStripeFormModal(true);
        break;
      case "razorpay":
        if (razorpayActive) setShowRazorpayModal(true);
        break;
      case "paystack":
        if (payStackActive) setShowPaystackModal(true);
        break;
      case "paypal":
        if (payPalActive) setShowPaypal(true);
        break;
      case "flutterwave":
        if (FlutterwaveActive) setShowFlutterwaveModal(true);
        break;
      case "cashfree":
        if (cashFreeActive) setShowCashfree(true);
        break;
      case "phonepe":
        if (phonepeActive) setShowPhonepe(true);
        break;
      case "midtrans":
        if (midtransActive) setShowMidtrans(true);
        break;
      default:
        console.error("Unknown payment gateway:", selectedGateway);
    }
  };

  // Close payment selection modal
  const handleClosePaymentSelection = () => {
    setShowPaymentSelection(false);
  };

  // Payment handlers
  const {
    handleRazorpayPayment,
    handlePayStackPayment,
    handlePaypalPayment,
    handleFlutterwavePayment,
    createPaymentIntent,
    handleCashfreePayment,
    handlePhonepePayment,
    handleMidtransPayment
  } = PaymentHandlers({
    priceData,
    setShowRazorpayModal,
    setLoading,
    router,
    setShowPaystackModal,
    setShowPaypal,
    setShowFlutterwaveModal,
    setShowStripeModal: setStripeFormModal,
    setShowCashfree,
    setShowPhonepe,
    setShowMidtrans
  });


  // useEffect to open Razorpay Modal
  // Effects for payment handling
  useEffect(() => {
    if (stripeformModal) {
      createPaymentIntent();
    }
  }, [stripeformModal]);

  useEffect(() => {
    if (showRazorpayModal) {
      handleRazorpayPayment();
    }
  }, [showRazorpayModal]);

  useEffect(() => {
    if (showPaystackModal) {
      handlePayStackPayment();
    }
    if (showPaypalModal) {
      handlePaypalPayment();
    }
    if (showFlutterwaveModal) {
      handleFlutterwavePayment();
    }
    if (showCashfree) {
      handleCashfreePayment()
    }
    if (showPhonepe) {
      handlePhonepePayment()
    }
    if (showMidtrans) {
      handleMidtransPayment()
    }
  }, [showPaystackModal, showPaypalModal, showFlutterwaveModal, showCashfree, showPhonepe, showMidtrans]);

  // Generate skeleton cards while loading
  const renderSkeletonCards = () => {
    return [...Array(4)].map((_, index) => (
      <CarouselItem key={`skeleton-${index}`} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
        <SubscriptionSkeletonCard />
      </CarouselItem>
    ));
  };

  // Function to check if any online payment gateway is active
  const hasActiveOnlinePayment = () => {
    return (
      stripeActive ||
      razorpayActive ||
      payStackActive ||
      payPalActive ||
      FlutterwaveActive ||
      cashFreeActive ||
      phonepeActive ||
      midtransActive
    );
  };

  // Empty state when no packages are available
  const renderEmptyState = () => (
    <div className="flex w-full flex-col items-center justify-center px-4 py-16">
      <NoDataFound />
    </div>
  );

  return (
    <div>
      <NewBreadcrumb
        title={t("subscriptionPlan")}
        items={[{ href: "/subscription-plan", label: t("subscriptionPlan") }]}
      />
      <section id="subscription" className="my-5 px-2">
        <div className="container mx-auto">
          {packagedata && packagedata.length > 0 && (
            <div className="mb-4 p-3 text-base font-bold md:text-3xl lg:text-[40px]">
              {t("chooseSubscription")}
            </div>
          )}
          {loading ? (
            <Carousel
              opts={carouselOptions}
              className="w-full"
            >
              <CarouselContent>
                {renderSkeletonCards()}
              </CarouselContent>
              <CarouselDots className="mt-4" />
            </Carousel>
          ) : packagedata && packagedata.length > 0 ? (
            <Carousel
              opts={carouselOptions}
              className="w-full"
            >
              <CarouselContent>
                {packagedata.map((data, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <SubscriptionCard
                      data={data}
                      index={index + 1}
                      allFeatures={allFeatures}
                      subscribePayment={subscribePayment}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselDots className="mt-4 p-3 justify-center [&>div]:flex-wrap mr-1" />
            </Carousel>
          ) : (
            renderEmptyState()
          )}
        </div>
      </section>

      {showModal && (
        <LoginModal showLogin={showModal} setShowLogin={setShowModal} />
      )}
      {showPaymentSelection && (
        <PaymentSelectionModal
          isOpen={showPaymentSelection}
          onClose={handleClosePaymentSelection}
          onOnlinePayment={handleOnlinePayment}
          stripeActive={stripeActive}
          razorpayActive={razorpayActive}
          payStackActive={payStackActive}
          payPalActive={payPalActive}
          flutterwaveActive={FlutterwaveActive}
          cashFreeActive={cashFreeActive}
          phonepeActive={phonepeActive}
          midtransActive={midtransActive}
          bankDetails={bankDetails}
          bankTransferActive={bankTransferActive}
          hasOnlinePayment={hasActiveOnlinePayment()}
          packageId={priceData?.id}
        />
      )}
    </div>
  );
};

export default SubscriptionSwiper;
