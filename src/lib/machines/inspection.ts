import type { PublicImageCandidate } from "./publicInventory";

export type InspectionImageGroup = { id: string; title: string; images: PublicImageCandidate[] };

const groups = [
  { id: "exterior", title: "Exterior", categories: ["general-exterior", "side-view-1", "side-view-2", "front-view", "rear-view"] },
  { id: "cabin", title: "Cabin", categories: ["cabin-interior"] },
  { id: "engine", title: "Engine", categories: ["engine"] },
  { id: "undercarriage", title: "Undercarriage", categories: ["undercarriage-tracks"] },
  { id: "bucket-arm", title: "Boom, arm & bucket", categories: ["boom-arm-bucket"] },
  { id: "meter-identification", title: "Meters & identification", categories: ["hour-meter", "chassis-serial-number"] },
  { id: "additional-photos", title: "Additional photos", categories: ["other-details"] },
] as const;

export function buildInspectionImageGroups(images: readonly PublicImageCandidate[]): InspectionImageGroup[] {
  const knownCategories = new Set(groups.flatMap((group) => group.categories));
  const result: InspectionImageGroup[] = groups.map((group) => ({
    id: group.id,
    title: group.title,
    images: images.filter((image) => group.categories.includes(image.category as never)),
  })).filter((group) => group.images.length > 0);

  const uncategorized = images.filter((image) => !image.category || !knownCategories.has(image.category as typeof groups[number]["categories"][number]));
  if (uncategorized.length) result.push({ id: "other-photos", title: "Other photos", images: uncategorized });
  return result;
}

export function buildPassportGroups(machine: {
  hgrId: string; brand?: string; model?: string; year?: number; hours?: number; engine?: string;
  operatingWeight?: string; condition?: string; countryOfOrigin?: string; machineOriginStatus?: string;
  registrationDate?: string; serialNumber?: string;
}) {
  const all = [
    { id: "identity", title: "Machine identity", fields: [
      ["Reference", machine.hgrId], ["Brand", machine.brand], ["Model", machine.model], ["Year of manufacture", machine.year?.toString()],
    ] },
    { id: "operation", title: "Operating details", fields: [
      ["Hours", machine.hours?.toLocaleString("en-MY")], ["Condition recorded by HGR", machine.condition?.replaceAll("-", " ")],
    ] },
    { id: "power-weight", title: "Power & weight", fields: [
      ["Engine", machine.engine], ["Operating weight", machine.operatingWeight],
    ] },
    { id: "origin", title: "Origin & registration", fields: [
      ["Country of origin", machine.countryOfOrigin], ["Machine origin / registration status", machine.machineOriginStatus], ["Registration date", machine.registrationDate],
    ] },
    { id: "serial", title: "Serial number", fields: [["Serial number", machine.serialNumber]] },
  ];
  return all.map((group) => ({ ...group, fields: group.fields.filter((field): field is [string, string] => Boolean(field[1])) }))
    .filter((group) => group.fields.length > 0);
}
