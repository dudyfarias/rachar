import { File as ExpoFile } from 'expo-file-system';

import { createId } from '../../lib/id';
import { isSupabaseConfigured, supabase } from '../../lib/supabase/client';
import type { ReceiptImage, ReceiptWarning } from '../../types/receipt';

type UploadReceiptImageInput = {
  image: ReceiptImage;
  userId?: string | null;
};

export type UploadReceiptImageResult = {
  image: ReceiptImage;
  warnings: ReceiptWarning[];
};

const DEFAULT_RECEIPT_BUCKET = 'receipts';

function extensionForMimeType(mimeType?: string | null) {
  if (mimeType?.includes('png')) {
    return 'png';
  }

  return 'jpg';
}

export async function uploadReceiptImage({ image, userId }: UploadReceiptImageInput): Promise<UploadReceiptImageResult> {
  const bucket = process.env.EXPO_PUBLIC_SUPABASE_RECEIPT_BUCKET || DEFAULT_RECEIPT_BUCKET;

  if (!isSupabaseConfigured || !userId || userId === 'demo-user') {
    return {
      image,
      warnings: [
        {
          code: 'UPLOAD_SKIPPED',
          message: 'Upload remoto indisponivel. A imagem foi processada localmente no modo demo.',
          severity: 'info',
        },
      ],
    };
  }

  const extension = extensionForMimeType(image.mimeType);
  const path = `${userId}/${Date.now()}-${createId('receipt')}.${extension}`;
  const file = new ExpoFile(image.uri);
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: image.mimeType ?? 'image/jpeg',
    upsert: false,
  });

  if (error) {
    throw new Error(`Nao foi possivel enviar a imagem da conta: ${error.message}`);
  }

  const SIGNED_URL_EXPIRY_SECONDS = 3600;
  const { data: signedData, error: signedError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(data.path, SIGNED_URL_EXPIRY_SECONDS);

  if (signedError || !signedData?.signedUrl) {
    throw new Error(`Nao foi possivel gerar URL assinada: ${signedError?.message ?? 'resposta vazia'}`);
  }

  return {
    image: {
      ...image,
      storageBucket: bucket,
      storagePath: data.path,
      uploadedUrl: signedData.signedUrl,
    },
    warnings: [],
  };
}
