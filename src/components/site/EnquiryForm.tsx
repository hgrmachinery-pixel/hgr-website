"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { sendEnquiry, type EnquiryFormState } from "../../app/(site)/contact/actions";
import type { EnquiryKind } from "../../lib/enquiries/submit.ts";
import { campaignFromSearch, createEnquiryEventGate, createAnalyticsEvent, trackAnalyticsEvent } from "../../lib/analytics/events.ts";

const initialState: EnquiryFormState = { status: "idle" };
const fieldLimits: Record<string, number> = { name: 160, company: 160, phone: 40, email: 254, message: 4000, projectLocation: 200, machineRequired: 160, startDate: 10, rentalDuration: 120, needOperator: 10, brand: 100, model: 100, problemDescription: 4000, machineLocation: 200, urgent: 10, machineBrand: 100, machineModel: 100, lubricantRequired: 160, quantity: 80, subject: 40, machineInterest: 200, purchaseTimeline: 80, budget: 80, tradeIn: 10, tradeInBrand: 100, tradeInModel: 100, tradeInYear: 4, preferredContact: 20, referrer: 500, utmSource: 200, utmMedium: 200, utmCampaign: 200, utmTerm: 200, utmContent: 200 };

type Choice = { value: string; label: string };

export function EnquiryForm({ kind, machineSlug, machineName = "", machineReference = "" }: { kind: EnquiryKind; machineSlug?: string; machineName?: string; machineReference?: string }) {
  const [state, action, pending] = useActionState(sendEnquiry.bind(null, kind, machineSlug), initialState);
  const values = state.values ?? {};
  const [tradeIn, setTradeIn] = useState(values.tradeIn ?? "no");
  const [preferredContact, setPreferredContact] = useState(values.preferredContact ?? "whatsapp");
  const [crm, setCrm] = useState<Record<string, string>>({});
  const eventGate = useRef<ReturnType<typeof createEnquiryEventGate> | null>(null);
  const formStarted = useRef(false);
  const viewingIntentSent = useRef(false);
  if (!eventGate.current) eventGate.current = createEnquiryEventGate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCrm({
      referrer: document.referrer.slice(0, 500),
      utmSource: params.get("utm_source")?.slice(0, 200) ?? "",
      utmMedium: params.get("utm_medium")?.slice(0, 200) ?? "",
      utmCampaign: params.get("utm_campaign")?.slice(0, 200) ?? "",
      utmTerm: params.get("utm_term")?.slice(0, 200) ?? "",
      utmContent: params.get("utm_content")?.slice(0, 200) ?? "",
    });
  }, []);

  useEffect(() => {
    const acceptedEvent = eventGate.current?.settle(state, campaignFromSearch(window.location.search));
    if (acceptedEvent) trackAnalyticsEvent(acceptedEvent);
  }, [state]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!eventGate.current?.begin()) {
      event.preventDefault();
      return;
    }
  };

  const onFormFocus = () => {
    if (formStarted.current) return;
    formStarted.current = true;
    trackAnalyticsEvent(createAnalyticsEvent({ name: "enquiry_start", enquiryKind: kind, machineReference, campaign: campaignFromSearch(window.location.search) }));
  };

  const onViewingFocus = () => {
    if (viewingIntentSent.current) return;
    viewingIntentSent.current = true;
    trackAnalyticsEvent(createAnalyticsEvent({ name: "viewing_intent", machineReference, campaign: campaignFromSearch(window.location.search) }));
  };

  const field = (name: string, label: string, options: { required?: boolean; type?: string; area?: boolean; choices?: Choice[]; hint?: string; readOnly?: boolean; value?: string } = {}) => {
    const error = state.fieldErrors?.[name as keyof NonNullable<EnquiryFormState["fieldErrors"]>];
    const errorId = `${name}-error`;
    const hintId = options.hint ? `${name}-hint` : undefined;
    const descriptionIds = [hintId, error ? errorId : undefined].filter(Boolean).join(" ") || undefined;
    const maxLength = fieldLimits[name];
    const common = {
      id: name,
      name,
      required: options.required,
      defaultValue: options.value ?? values[name] ?? "",
      maxLength,
      readOnly: options.readOnly,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": descriptionIds,
      onFocus: name === "viewingPreference" ? onViewingFocus : undefined,
    };
    return <div className="enquiry-form__field" key={name}>
      <label htmlFor={name}>{label}{options.required && <span aria-hidden="true"> *</span>}</label>
      {options.choices
        ? <select {...common}><option value="">Select an option</option>{options.choices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}</select>
        : options.area
          ? <textarea {...common} />
          : <input {...common} type={options.type ?? "text"} inputMode={options.type === "tel" ? "tel" : undefined}
              onBlur={name === "email" ? (event) => { event.currentTarget.value = event.currentTarget.value.trim().toLowerCase(); } : name === "name" ? (event) => { event.currentTarget.value = titleCaseName(event.currentTarget.value); } : name === "phone" ? (event) => { event.currentTarget.value = event.currentTarget.value.replace(/[\s()-]/g, ""); } : undefined} />}
      {options.hint && <p className="enquiry-form__hint" id={hintId}>{options.hint}</p>}
      {error && <p className="enquiry-form__field-error" id={errorId}>{error}</p>}
    </div>;
  };

  const yesNo: Choice[] = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
  return <form key={`${state.status}-${JSON.stringify(values)}`} className="enquiry-form" action={action} onSubmit={onSubmit} onFocusCapture={onFormFocus}>
    <label className="enquiry-form__trap" aria-hidden="true">Leave this field empty<input tabIndex={-1} autoComplete="off" name="website" /></label>
    {Object.entries(crm).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
    {field("name", "Name", { required: true })}
    {field("company", "Company")}
    <div className="enquiry-form__field">
      <label htmlFor="phone">Phone number <span aria-hidden="true">*</span></label>
      <div className="enquiry-form__phone"><span className="enquiry-form__country" aria-label="Malaysia, country code plus 60">🇲🇾 +60 <span aria-hidden="true">|</span></span><input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="12 345 6789" maxLength={40} required defaultValue={values.phone} aria-invalid={state.fieldErrors?.phone ? true : undefined} aria-describedby={state.fieldErrors?.phone ? "phone-error" : "phone-hint"} onBlur={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/[\s()[\]-]/g, ""); }} /></div>
      <p className="enquiry-form__hint" id="phone-hint">Malaysian mobile number</p>
      {state.fieldErrors?.phone && <p className="enquiry-form__field-error" id="phone-error">{state.fieldErrors.phone}</p>}
    </div>
    {field("email", "Email", { type: "email", required: preferredContact === "email", hint: "Required when Email is your preferred contact method." })}
    <fieldset className="enquiry-form__choice-group" id="preferredContact" aria-describedby={state.fieldErrors?.preferredContact ? "preferredContact-error" : undefined}><legend>Preferred contact</legend>
      {[{ value: "whatsapp", label: "WhatsApp" }, { value: "phone", label: "Phone Call" }, { value: "email", label: "Email" }].map((choice) => <label key={choice.value}><input type="radio" name="preferredContact" value={choice.value} checked={preferredContact === choice.value} onChange={() => setPreferredContact(choice.value)} /> {choice.label}</label>)}
      {state.fieldErrors?.preferredContact && <p className="enquiry-form__field-error" id="preferredContact-error">{state.fieldErrors.preferredContact}</p>}
    </fieldset>

    {kind === "machine" && <>
      {field("machineName", "Machine name", { readOnly: true, value: machineName })}
      {field("machineReference", "HGR Reference", { readOnly: true, value: machineReference })}
      {field("purchaseTimeline", "Purchase timeline", { choices: ["Immediately", "Within 1 month", "Within 3 months", "Just researching"].map((value) => ({ value, label: value })) })}
      {field("budget", "Budget", { hint: "Optional, for example RM 100,000" })}
      <div className="enquiry-form__field"><label htmlFor="tradeIn">Trade-in</label><select id="tradeIn" name="tradeIn" value={tradeIn} onChange={(event) => setTradeIn(event.currentTarget.value)}><option value="no">No</option><option value="yes">Yes</option></select></div>
      {tradeIn === "yes" && <div className="enquiry-form__conditional">{field("tradeInBrand", "Trade-in brand", { required: true })}{field("tradeInModel", "Trade-in model", { required: true })}{field("tradeInYear", "Trade-in year", { required: true, type: "number" })}</div>}
      {field("viewingPreference", "Preferred viewing date or time", { hint: "Please confirm this machine's current location with HGR before travelling." })}
      {field("message", "Message", { required: true, area: true })}
    </>}
    {kind === "general" && <>{field("subject", "Subject", { required: true, choices: ["General", "Sales", "Parts", "Rental", "Service", "Others"].map((value) => ({ value, label: value })) })}{field("machineInterest", "Machine of interest")}{field("message", "Message", { required: true, area: true })}</>}
    {kind === "rental" && <>{field("machineRequired", "Machine required", { required: true })}{field("startDate", "Start date", { required: true, type: "date" })}{field("rentalDuration", "Rental duration", { required: true, hint: "For example, 2 weeks or 3 months" })}{field("projectLocation", "Project location", { required: true })}{field("needOperator", "Need operator?", { required: true, choices: yesNo })}{field("message", "Project details", { area: true })}</>}
    {kind === "service" && <>{field("brand", "Brand", { required: true })}{field("model", "Model", { required: true })}{field("problemDescription", "Problem description", { required: true, area: true })}{field("machineLocation", "Machine location", { required: true })}{field("urgent", "Urgent?", { required: true, choices: yesNo })}</>}
    {kind === "lubricant" && <>{field("machineBrand", "Machine brand", { required: true })}{field("machineModel", "Machine model", { required: true })}{field("lubricantRequired", "Lubricant required", { required: true })}{field("quantity", "Quantity", { required: true })}{field("message", "Message", { area: true })}</>}

    {state.fieldErrors && Object.keys(state.fieldErrors).length > 0
      ? <div className="enquiry-form__errors" role="alert" aria-labelledby="enquiry-error-summary-title"><p id="enquiry-error-summary-title">Please correct the following fields:</p><ul>{Object.entries(state.fieldErrors).map(([name, error]) => <li key={name}><a href={`#${name}`}>{name}: {error}</a></li>)}</ul></div>
      : state.errors && <ul className="enquiry-form__errors" role="alert">{state.errors.map((error) => <li key={error}>{error}</li>)}</ul>}
    {state.message && <p className={`enquiry-form__notice enquiry-form__notice--${state.status}`} role="status">{state.message}</p>}
    <button className="button button--primary" type="submit" disabled={pending}>{pending ? "Sending…" : "Send enquiry"}</button>
  </form>;
}

function titleCaseName(value: string): string {
  return value.replace(/\s+/g, " ").toLocaleLowerCase("en-MY").replace(/(^|[\s'-])\p{L}/gu, (letter) => letter.toLocaleUpperCase("en-MY"));
}
