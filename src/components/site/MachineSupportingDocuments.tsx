export type PublicSupportingDocument = {
  title: string;
  href: string;
  kind: "brochure" | "inspection-report" | "maintenance-record" | "other";
};

function isSafePublicDocumentHref(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/** Presentation boundary for approved public document links; private originals never enter this component. */
export function MachineSupportingDocuments({ documents = [] }: { documents?: PublicSupportingDocument[] }) {
  return <section id="supporting-documents" className="machine-supporting-documents" data-inspection-area aria-labelledby="supporting-documents-title">
    <p className="eyebrow">Supporting information</p><h2 id="supporting-documents-title">Documents</h2>
    {documents.some((document) => isSafePublicDocumentHref(document.href)) ? <ul>{documents.filter((document) => isSafePublicDocumentHref(document.href)).map((document) => <li key={`${document.kind}-${document.href}`}><a href={document.href}>{document.title}</a><span>{document.kind.replaceAll("-", " ")}</span></li>)}</ul> : <p>No public supporting documents are listed for this machine.</p>}
  </section>;
}
