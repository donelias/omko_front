import {
  createAllPaymentIntentApi
} from "@/api/apiRoutes";
import { useTranslation } from "../context/TranslationContext";
import toast from "react-hot-toast";

const PaymentHandlers = ({
  priceData,
  setShowRazorpayModal,
  setLoading,
  router,
  setShowPaystackModal,
  setShowPaypal,
  setShowFlutterwaveModal,
  setShowStripeModal,
  setShowCashfree,
  setShowPhonepe,
  setShowMidtrans
}) => {
  const t = useTranslation();
  const lang = router?.query?.lang;

  // Create Payment Intent Function
  const createPaymentIntent = async () => {
    try {
      // create payment api
      const res = await createAllPaymentIntentApi({
        package_id: priceData?.id,
        platform_type: "web",
        payment_method: "stripe"
      });
      if (!res?.error) {
        const paymentData = res?.data;
        window.open(paymentData?.payment_intent?.payment_url, "_parent")
      } else {
        console.error("Error creating payment intent:", res?.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("An error occurred during payment submission:", error);
      // Set loading state to false in case of an exception
      toast.error(error?.message || t("unexpectedErrorOccurred"));
      setShowStripeModal(false);
      setLoading(false);
    }
  };

  // paystack payment method
  const handlePayStackPayment = async () => {
    try {
      // // Open the payment iframe
      // handler.openIframe();
      const res = await createAllPaymentIntentApi({
        package_id: priceData?.id,
        platform_type: "web",
        payment_method: "paystack",
      });
      if (!res?.error) {
        const payStackLink =
          res?.data?.payment_intent?.payment_gateway_response?.data
            ?.authorization_url;
        if (payStackLink) {
          // Open payStackLink in new tab
          window.location.href = payStackLink;
        } else {
          console.error("No paystack payment link found : ", res?.message);
          setShowPaystackModal?.(false);
          toast.error(t("paymentLinkNotFound") || "Payment link not found");
        }
      } else {
        console.error("Paystack API error:", res?.message);
        setShowPaystackModal?.(false);
        toast.error(t("unexpectedErrorOccurred"));
      }
    } catch (error) {
      // Handle unexpected errors
      console.error(
        "An error occurred while processing paystack payment:",
        error,
      );
      setShowPaystackModal?.(false);
      toast.error(t("unexpectedErrorOccurred"));
    }
  };

  // paypal payment method
  const handlePaypalPayment = async () => {
    try {
      // await new Promise(async (resolve, reject) => {
      //   const res = await paypalApi({
      //     amount: priceData?.price,
      //     package_id: priceData?.id,
      //   });
      //   if (!res?.error) {
      //     // Create a temporary DOM element to parse the HTML
      //     const parser = new DOMParser();
      //     const doc = parser.parseFromString(res, "text/html");
      //     // Find the form
      //     const form = doc.querySelector('form[name="paypal_auto_form"]');
      //     if (form) {
      //       // Get the form action URL
      //       const paypalUrl = form.action;
      //       // Collect form data
      //       const formData = new FormData(form);
      //       const urlParams = new URLSearchParams(formData);
      //       // Redirect to PayPal with the form data
      //       window.location.href = `${paypalUrl}?${urlParams.toString()}`;
      //     } else {
      //       setShowPaypal?.(false);
      //       reject(new Error("PayPal form not found in the response"));
      //     }
      //   } else {
      //     console.error("error", res?.message);
      //     setShowPaypal?.(false);
      //     reject(new Error("PayPal API error: " + res?.message));
      //   }
      // });
      const res = await createAllPaymentIntentApi({
        package_id: priceData?.id,
        platform_type: "web",
        payment_method: "paypal",
      });
      if (!res?.error) {
        const paypalLink = res?.data?.payment_intent?.payment_url;
        if (paypalLink) {
          window.location.href = paypalLink;
        } else {
          console.error("Error in PayPal api:", res?.message);
          setShowPaypal?.(false);
          toast.error(t("paypalPaymentLinkNotFound"));
        }
      }
    } catch (err) {
      console.error("PayPal payment error:", err);
      setShowPaypal?.(false);
      toast.error(err.message);
    }
  };

  // flutterwave payment method
  const handleFlutterwavePayment = async () => {
    try {
      const res = await createAllPaymentIntentApi({
        package_id: priceData?.id,
        platform_type: "web",
        payment_method: "flutterwave",
      });
      if (!res?.error) {
        const flutterWaveLink = res?.data?.payment_intent?.payment_url;
        if (flutterWaveLink) {
          window.location.href = flutterWaveLink;
        } else {
          console.error("Error in flutterwave api:", res?.message);
          setShowFlutterwaveModal?.(false);
        }
      } else {
        console.error("Flutterwave API error:", res?.message);
        setShowFlutterwaveModal?.(false);
        toast.error(t("unexpectedErrorOccurred"));
      }
    } catch (error) {
      console.error("Flutterwave payment error:", error);
      setShowFlutterwaveModal?.(false);
      toast.error(error?.message);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      const res = await createAllPaymentIntentApi({
        package_id: priceData?.id,
        platform_type: "web",
        payment_method: "razorpay",
      });
      if (!res?.error) {
        const paymentUrl = res?.data?.payment_intent?.payment_url;
        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          console.error("No Razorpay payment link found : ", res?.message);
          setShowRazorpayModal?.(false);
          toast.error(t("razorpayPaymentLinkNotFound"));
        }
      }
    } catch (error) {
      console.error(error);
      setShowRazorpayModal?.(false);
    }
  };

  const handleCashfreePayment = async () => {
    try {
      const res = await createAllPaymentIntentApi({
        package_id: priceData?.id,
        platform_type: "web",
        payment_method: "cashfree",
      });
      if (!res?.error) {
        const cashfreeLink = res?.data?.payment_intent?.payment_url;
        if (cashfreeLink) {
          window.location.href = cashfreeLink;
        } else {
          console.error("Error in Cashfree api:", res?.message);
          setShowCashfree?.(false);
        }
      } else {
        console.error("Cashfree API error:", res?.message);
        setShowCashfree?.(false);
        toast.error(res?.message);
      }
    } catch (error) {
      console.error("Cashfree payment error:", error);
      setShowCashfree?.(false);
      toast.error(error?.message);
    }
  }

  const handlePhonepePayment = async () => {
    try {
      const res = await createAllPaymentIntentApi({
        package_id: priceData?.id,
        platform_type: "web",
        payment_method: "phonepe",
      });
      if (!res?.error) {
        const phonepeLink = res?.data?.payment_intent?.payment_url;
        if (phonepeLink) {
          window.location.href = phonepeLink;
        } else {
          console.error("Error in Phonepe api:", res?.message);
          setShowPhonepe?.(false);
        }
      } else {
        console.error("Phonepe API error:", res?.message);
        setShowPhonepe?.(false);
        toast.error(res?.message);
      }
    } catch (error) {
      console.error("Phonepe payment error:", error);
      setShowPhonepe?.(false);
      toast.error(error?.message);
    }
  }

  const handleMidtransPayment = async () => {
    try {
      const res = await createAllPaymentIntentApi({
        package_id: priceData?.id,
        platform_type: "web",
        payment_method: "midtrans",
      });
      if (!res?.error) {
        const midtransLink = res?.data?.payment_intent?.payment_url;
        if (midtransLink) {
          window.location.href = midtransLink;
        } else {
          console.error("Error in Midtrans api:", res?.message);
          setShowMidtrans?.(false);
        }
      } else {
        console.error("Midtrans API error:", res?.message);
        setShowMidtrans?.(false);
        toast.error(res?.message);
      }
    } catch (error) {
      console.error("Midtrans payment error:", error);
      setShowMidtrans?.(false);
      toast.error(error?.message);
    }
  }
  return {
    createPaymentIntent,
    handlePayStackPayment,
    handlePaypalPayment,
    handleFlutterwavePayment,
    handleRazorpayPayment,
    handleCashfreePayment,
    handlePhonepePayment,
    handleMidtransPayment
  };
};

export default PaymentHandlers;
