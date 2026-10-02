"use client";

import { useEffect } from "react";
import {
  analyticsEventType,
  createConsentAwareTagController,
  parseAnalyticsConsent,
  type AnalyticsEvent,
} from "../../lib/analytics/events.ts";

type AnalyticsProviderProps = {
  enabled: boolean;
  containerId?: string;
  localReview: boolean;
  children: React.ReactNode;
};

type AnalyticsWindow = Window & { dataLayer?: unknown[] };
const consentStorageKey = "hgr-measurement-consent-v1";
const consentChangeEvent = "hgr:consent-change";

export function AnalyticsProvider({ enabled, containerId, localReview, children }: AnalyticsProviderProps) {
  useEffect(() => {
    const browser = window as AnalyticsWindow;
    const loadTag = (request: { url: string; referrerPolicy: "no-referrer" }) => {
      const dataLayer: unknown[] = [];
      browser.dataLayer = dataLayer;
      dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      const script = document.createElement("script");
      script.async = true;
      script.src = request.url;
      script.referrerPolicy = request.referrerPolicy;
      script.dataset.hgrAnalytics = "true";
      document.head.appendChild(script);
      return () => {
        script.remove();
        dataLayer.length = 0;
        if (browser.dataLayer === dataLayer) delete browser.dataLayer;
      };
    };
    const controller = createConsentAwareTagController(
      { enabled, containerId, localReview },
      loadTag,
      (event) => browser.dataLayer?.push(event),
    );

    function storedConsent() {
      try {
        return parseAnalyticsConsent(window.localStorage.getItem(consentStorageKey));
      } catch {
        return parseAnalyticsConsent(null);
      }
    }
    const onAnalyticsEvent = (event: Event) => controller.track((event as CustomEvent<AnalyticsEvent>).detail);
    const onConsentChange = (event: Event) => controller.setConsent((event as CustomEvent).detail);
    const onStorageChange = (event: StorageEvent) => {
      if (event.key === consentStorageKey) controller.setConsent(storedConsent());
    };

    window.addEventListener(analyticsEventType(), onAnalyticsEvent);
    window.addEventListener(consentChangeEvent, onConsentChange);
    window.addEventListener("storage", onStorageChange);
    controller.setConsent(storedConsent());

    return () => {
      window.removeEventListener(analyticsEventType(), onAnalyticsEvent);
      window.removeEventListener(consentChangeEvent, onConsentChange);
      window.removeEventListener("storage", onStorageChange);
      controller.dispose();
    };
  }, [enabled, containerId, localReview]);

  return children;
}

export function TrackAnalyticsEvent({ event }: { event: AnalyticsEvent }) {
  const eventKey = JSON.stringify(event);
  useEffect(() => {
    if (eventKey) {
      window.dispatchEvent(new CustomEvent(analyticsEventType(), { detail: event }));
    }
  }, [eventKey]);
  return null;
}
