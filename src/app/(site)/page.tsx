import config from "@payload-config";
import { getPayload } from "payload";

export const dynamic = "force-dynamic";

export default async function FoundationPage() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "foundation-fixtures",
    limit: 1,
    depth: 0,
    overrideAccess: false,
    sort: "-createdAt",
  });
  const fixture = docs[0];
  const image = fixture?.sizes?.card;

  return (
    <main
      style={{
        maxWidth: 800,
        margin: "2rem auto",
        padding: "1rem",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Application foundation test</h1>
      <p>
        Synthetic, disposable test content. This is not HGR machine inventory.
      </p>
      {fixture ? (
        <article>
          <h2>{fixture.title}</h2>
          {image?.url ? (
            <img
              src={image.url}
              alt="Generated geometric test image"
              width={image.width ?? 640}
              height={image.height ?? 400}
              style={{ maxWidth: "100%", height: "auto" }}
            />
          ) : (
            <p>The test image could not be loaded.</p>
          )}
        </article>
      ) : (
        <p>No synthetic test record has been added.</p>
      )}
    </main>
  );
}
