import { CollectionCards as CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1 } from '@payloadcms/next/rsc'
import { GcsClientUploadHandler as GcsClientUploadHandler_06e62ca02c7c441053a9b643e5545934 } from '@payloadcms/storage-gcs/client'
import { MachinePhotoUploader as MachinePhotoUploader_55e30fb11f4d4828a697b55e9d919e5e } from '@/components/payload/MachinePhotoUploader'
import { MachineDocumentActions as MachineDocumentActions_41c9ef713b72be02 } from '@/components/payload/MachineDocumentActions'

/** @type import('payload').ImportMap */
export const importMap = {
  "@payloadcms/next/rsc#CollectionCards": CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1,
  "@payloadcms/storage-gcs/client#GcsClientUploadHandler": GcsClientUploadHandler_06e62ca02c7c441053a9b643e5545934,
  "@/components/payload/MachinePhotoUploader#MachinePhotoUploader": MachinePhotoUploader_55e30fb11f4d4828a697b55e9d919e5e,
  "@/components/payload/MachineDocumentActions#MachineDocumentActions": MachineDocumentActions_41c9ef713b72be02,
}
