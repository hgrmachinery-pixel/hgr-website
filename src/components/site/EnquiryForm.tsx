"use client";

import { useActionState } from "react";
import { sendEnquiry, type EnquiryFormState } from "../../app/(site)/contact/actions";
import type { EnquiryKind } from "../../lib/enquiries/submit.ts";

const initialState: EnquiryFormState = { status: "idle" };

export function EnquiryForm({ kind, machineSlug }: { kind: EnquiryKind; machineSlug?: string }) {
  const [state, action, pending] = useActionState(sendEnquiry.bind(null, kind, machineSlug), initialState);
  const values = state.values ?? {};
  const field = (name: string, label: string, required = false, type = "text", area = false, hintId?: string) => {
    const error = state.fieldErrors?.[name as keyof typeof state.fieldErrors];
    const errorId = `${name}-error`;
    const descriptionIds = [hintId, error ? errorId : undefined].filter(Boolean).join(" ") || undefined;
    return <div className="enquiry-form__field" key={name}>
      <label htmlFor={name}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      {area
        ? <textarea id={name} name={name} required={required} maxLength={name === "message" ? 4000 : 500} defaultValue={values[name]} aria-invalid={error ? true : undefined} aria-describedby={descriptionIds} />
        : <input id={name} name={name} type={type} required={required} maxLength={name === "email" ? 254 : 200} defaultValue={values[name]} aria-invalid={error ? true : undefined} aria-describedby={descriptionIds} />}
      {error && <p className="enquiry-form__field-error" id={errorId}>{error}</p>}
    </div>;
  };
  return <form key={state.status === "idle" ? "idle" : JSON.stringify({ status: state.status, values })} className="enquiry-form" action={action}>
    <label className="enquiry-form__trap" aria-hidden="true">Leave this field empty<input tabIndex={-1} autoComplete="off" name="website" /></label>
    {field("name", "Name", true)}{field("company", "Company")}{field("phone", "Phone", true, "tel")}{field("email", "Email", false, "email")}
    {kind === "rental" && <>{field("projectLocation", "Project location", true)}{field("projectTiming", "Project timing")}{field("machineInterest", "Machine or type of work")}{field("application", "Application")}{field("message", "Project details", false, "text", true)}</>}
    {kind === "service" && <>{field("machineLocation", "Machine location", true)}{field("message", "Issue or message", true, "text", true)}</>}
    {kind === "lubricant" && <>{field("product", "Product of interest")}{field("application", "Application")}{field("quantity", "Quantity")}{field("message", "Message", false, "text", true)}</>}
    {(kind === "general" || kind === "machine") && <>{kind === "general" && field("machineInterest", "Machine of interest")}{field("message", "Message", true, "text", true)}</>}
    {kind === "machine" && <>{field("viewingPreference", "Preferred viewing date or time", false, "text", false, "viewingPreference-hint")}<p className="enquiry-form__hint" id="viewingPreference-hint">Please confirm this machine's current location with HGR before travelling.</p></>}
    {state.fieldErrors && Object.keys(state.fieldErrors).length > 0
      ? <div className="enquiry-form__errors" role="alert" aria-labelledby="enquiry-error-summary-title">
          <p id="enquiry-error-summary-title">Please correct the following fields:</p>
          <ul>{Object.entries(state.fieldErrors).map(([name, error]) => <li key={name}><a href={`#${name}`}>{name}: {error}</a></li>)}</ul>
        </div>
      : state.errors && <ul className="enquiry-form__errors" role="alert">{state.errors.map((error) => <li key={error}>{error}</li>)}</ul>}
    {state.message && <p className={`enquiry-form__notice enquiry-form__notice--${state.status}`} role="status">{state.message}</p>}
    <button className="button button--primary" type="submit" disabled={pending}>{pending ? "Sending…" : "Send enquiry"}</button>
  </form>;
}
