import type { GlobalConfig } from "payload";

import { staffAccess } from "../lib/machines/access";
import { isGoogleMapsEmbedURL, safeGoogleMapsURL } from "../lib/siteContact";

const optionalHttpsURL = (value: unknown) => {
  if (value == null || value === "") return true;
  if (typeof value !== "string") return "Enter a valid HTTPS URL.";
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? true
      : "Enter a valid HTTPS URL without login details.";
  } catch {
    return "Enter a valid HTTPS URL.";
  }
};

const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

export const SiteContact: GlobalConfig = {
  slug: "site-contact",
  label: "Site Contact",
  access: {
    read: () => true,
    update: staffAccess,
  },
  fields: [
    {
      type: "collapsible",
      label: "Company",
      admin: { initCollapsed: false },
      fields: [
        { name: "companyName", label: "Company Name", type: "text", maxLength: 160 },
        { name: "registrationNumber", label: "Registration Number", type: "text", maxLength: 80 },
      ],
    },
    {
      type: "collapsible",
      label: "Contact",
      admin: { initCollapsed: false },
      fields: [
        { name: "phone", label: "Phone", type: "text", maxLength: 40 },
        { name: "whatsApp", label: "WhatsApp Number", type: "text", maxLength: 40 },
        { name: "email", label: "Sales Email", type: "email", admin: { description: "Controls the public email contact links. Form delivery remains configured separately by the site administrator." } },
        { name: "supportEmail", label: "Support Email", type: "email" },
      ],
    },
    {
      type: "collapsible",
      label: "Location",
      admin: { initCollapsed: false },
      fields: [
        { name: "officeAddress", label: "Office Address", type: "textarea", maxLength: 500 },
        { name: "yardLocation", label: "Yard Address", type: "textarea", maxLength: 500 },
        { name: "googleMapsURL", label: "Google Maps URL", type: "text", maxLength: 1000, validate: (value: unknown) => value == null || value === "" || safeGoogleMapsURL(value) ? true : "Enter an HTTPS Google Maps link." },
        { name: "googleMapsEmbedURL", label: "Google Maps Embed URL (optional)", type: "text", maxLength: 1000, validate: (value: unknown) => {
          const valid = optionalHttpsURL(value);
          if (valid !== true || value == null || value === "") return valid;
          try {
            return isGoogleMapsEmbedURL(value)
              ? true
              : "Use a Google Maps embed URL beginning with https://www.google.com/maps/embed.";
          } catch { return "Enter a valid Google Maps embed URL."; }
        } },
      ],
    },
    {
      type: "collapsible",
      label: "Hours",
      admin: { initCollapsed: false },
      fields: [
        { name: "weeklyHours", label: "Weekly Operating Hours", type: "array", fields: [
          { name: "day", label: "Day", type: "select", required: true, options: weekdays.map((day) => ({ label: day[0].toUpperCase() + day.slice(1), value: day })) },
          { name: "opens", label: "Opens (24-hour time)", type: "text", required: true, validate: (value: unknown) => typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value) ? true : "Use 24-hour time, such as 09:00." },
          { name: "closes", label: "Closes (24-hour time)", type: "text", required: true, validate: (value: unknown) => typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value) ? true : "Use 24-hour time, such as 17:30." },
        ], validate: (value: unknown) => {
          if (!Array.isArray(value)) return true;
          const days = value.map((entry) => entry && typeof entry === "object" ? (entry as { day?: unknown }).day : undefined);
          return new Set(days).size === days.length ? true : "Add each weekday only once.";
        } },
        { name: "appointmentOnly", label: "Appointment Only", type: "checkbox", admin: { description: "Select only if visits require an appointment. Leave weekdays without verified hours blank." } },
      ],
    },
    {
      type: "collapsible",
      label: "Social",
      admin: { initCollapsed: false },
      fields: [
        { name: "facebook", label: "Facebook URL", type: "text", maxLength: 500, validate: optionalHttpsURL },
        { name: "instagram", label: "Instagram URL", type: "text", maxLength: 500, validate: optionalHttpsURL },
        { name: "linkedin", label: "LinkedIn URL", type: "text", maxLength: 500, validate: optionalHttpsURL },
        { name: "youtube", label: "YouTube URL", type: "text", maxLength: 500, validate: optionalHttpsURL },
        { name: "tiktok", label: "TikTok URL", type: "text", maxLength: 500, validate: optionalHttpsURL },
      ],
    },
  ],
};
