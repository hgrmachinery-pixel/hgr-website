"use client";

import { useActionState } from "react";
import { sendEnquiry, type EnquiryFormState } from "../../app/(site)/contact/actions";
import type { EnquiryKind } from "../../lib/enquiries/submit.ts";

const initialState: EnquiryFormState = { status: "idle" };

export function EnquiryForm({ kind, machineSlug }: { kind: EnquiryKind; machineSlug?: string }) {
  const [state, action, pending] = useActionState(sendEnquiry.bind(null, kind, machineSlug), initialState);
  const values = state.values ?? {};
  const field = (name: string, label: string, required = false, type = "text", area = false) => (
    <label className="enquiry-form__field" key={name}>{label}{required && <span aria-hidden="true"> *</span>}
      {area ? <textarea name={name} required={required} maxLength={name === "message" ? 4000 : 500} defaultValue={values[name]} /> : <input name={name} type={type} required={required} maxLength={name === "email" ? 254 : 200} defaultValue={values[name]} />}
    </label>
  );
  return <form key={state.status === "idle" ? "idle" : JSON.stringify({ status: state.status, values })} className="enquiry-form" action={action}>
    <label className="enquiry-form__trap" aria-hidden="true">Leave this field empty<input tabIndex={-1} autoComplete="off" name="website" /></label>
    {field("name", "Name", true)}{field("company", "Company")}{field("phone", "Phone", true, "tel")}{field("email", "Email", false, "email")}
    {kind === "rental" && <>{field("projectLocation", "Project location", true)}{field("projectTiming", "Project timing")}{field("machineInterest", "Machine or type of work")}{field("application", "Application")}{field("message", "Project details", false, "text", true)}</>}
    {kind === "service" && <>{field("machineLocation", "Machine location", true)}{field("message", "Issue or message", true, "text", true)}</>}
    {kind === "lubricant" && <>{field("product", "Product of interest")}{field("application", "Application")}{field("quantity", "Quantity")}{field("message", "Message", false, "text", true)}</>}
    {(kind === "general" || kind === "machine") && <>{kind === "general" && field("machineInterest", "Machine of interest")}{field("message", "Message", true, "text", true)}</>}
    {kind === "machine" && <>{field("viewingPreference", "Preferred viewing date or time")}<p className="enquiry-form__hint">Please confirm this machine's current location with HGR before travelling.</p></>}
    {state.errors && <ul className="enquiry-form__errors" role="alert">{state.errors.map((error) => <li key={error}>{error}</li>)}</ul>}
    {state.message && <p className={`enquiry-form__notice enquiry-form__notice--${state.status}`} role="status">{state.message}</p>}
    <button className="button button--primary" type="submit" disabled={pending}>{pending ? "Sending…" : "Send enquiry"}</button>
  </form>;
}
