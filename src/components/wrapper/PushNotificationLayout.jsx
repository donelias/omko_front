"use client";
import React, { useEffect, useRef, useState } from "react";
import FirebaseData from "@/utils/Firebase";
import { useSelector } from "react-redux";

const PushNotificationLayout = ({ children, onNotificationReceived }) => {
  const [userToken, setUserToken] = useState(null);
  const [, setTokenFound] = useState(false);
  const [, setFcmToken] = useState("");
  const { fetchToken, onMessageListener } = FirebaseData();
  const onNotificationReceivedRef = useRef(onNotificationReceived);

  const fcmTokenFromRedux = useSelector((state) => state.WebSetting?.fcmToken);

  const buildNotificationUrl = (payload) => {
    const targetOrigin = window.location.origin;
    let clickAction = targetOrigin;

    if (payload?.data?.chat_message_type) {
      clickAction += `user/chat?propertyId=${payload.data.property_id}&userId=${payload.data.sender_id}`;
    }

    return clickAction;
  };

  const showForegroundNotification = async (payload) => {
    if (
      typeof window === "undefined" ||
      document.visibilityState !== "visible" ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    const title = payload.notification?.title || "Notification";
    const notificationOptions = {
      body: payload.notification?.body,
      icon: payload.data?.icon || "/favicon.ico",
      image: payload.notification?.image || payload.data?.image,
      requireInteraction: true,
      data: {
        url: buildNotificationUrl(payload),
      },
    };

    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, notificationOptions);
        return;
      }

      new Notification(title, notificationOptions);
    } catch (error) {
      console.error("Error showing foreground notification:", error);
    }
  };

  const handleFetchToken = async () => {
    await fetchToken(setTokenFound, setFcmToken);
  };

  useEffect(() => {
    handleFetchToken();
  }, []);

  useEffect(() => {
    if (typeof window !== undefined) {
      setUserToken(fcmTokenFromRedux);
    }
  }, [userToken]);

  useEffect(() => {
    onNotificationReceivedRef.current = onNotificationReceived;
  }, [onNotificationReceived]);

  useEffect(() => {
    let unsubscribe;

    const subscribeToForegroundMessages = async () => {
      try {
        unsubscribe = await onMessageListener((payload) => {
          if (
            payload?.data &&
            typeof document !== "undefined" &&
            document.visibilityState === "visible"
          ) {
            onNotificationReceivedRef.current?.(payload.data);
            void showForegroundNotification(payload);
          }
        });
      } catch (err) {
        console.error("Error handling foreground notification:", err);
      }
    };

    subscribeToForegroundMessages();

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // Simply render children without modification
  return <>{children}</>;
};

export default PushNotificationLayout;