"use client";

import {
  campaignFromSearch,
  createAnalyticsEvent,
  trackAnalyticsEvent,
  type ContactChannel,
  type SupportingPageGroup,
} from "../../lib/analytics/events.ts";

export function TrackedContactLink({
  href,
  channel,
  machineReference,
  pageGroup,
  className,
  target,
  rel,
  children,
}: {
  href: string;
  channel: ContactChannel;
  machineReference?: string;
  pageGroup?: SupportingPageGroup;
  className?: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}) {
  return <a
    href={href}
    className={className}
    target={target}
    rel={rel}
    onClick={() => trackAnalyticsEvent(createAnalyticsEvent({
      name: "contact_intent",
      contactChannel: channel,
      machineReference,
      pageGroup,
      campaign: campaignFromSearch(window.location.search),
    }))}
  >{children}</a>;
}
