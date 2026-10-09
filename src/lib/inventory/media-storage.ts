import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { buildStoragePathData } from "@payloadcms/plugin-cloud-storage/utilities";

export type InventoryStoredFile = {
  filename: string;
  prefix?: string | null;
  objectKey?: string | null;
};

/** Storage boundary for inventory files. Uploads use Payload adapters; reads use this boundary. */
export interface InventoryObjectStorageProvider {
  read(file: InventoryStoredFile): Promise<Buffer>;
}

function objectKey(file: InventoryStoredFile) {
  return buildStoragePathData({ collectionPrefix: "", docPrefix: [file.prefix, file.objectKey].filter(Boolean).join("/"), filename: file.filename }).storageFilePath;
}

class R2InventoryStorage implements InventoryObjectStorageProvider {
  async read(file: InventoryStoredFile) {
    const endpoint = process.env.R2_ENDPOINT;
    const bucket = process.env.R2_BUCKET;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) throw new Error("R2 inventory storage is not configured");
    const client = new S3Client({ endpoint, region: "auto", forcePathStyle: true, credentials: { accessKeyId, secretAccessKey } });
    const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: objectKey(file) }));
    if (!object.Body) throw new Error("Stored inventory image is unavailable");
    return Buffer.from(await object.Body.transformToByteArray());
  }
}

export function inventoryObjectStorage(): InventoryObjectStorageProvider {
  return new R2InventoryStorage();
}
