import { File as ExpoFile } from 'expo-file-system';
import { manipulateAsync, SaveFormat, type Action } from 'expo-image-manipulator';

import type { ReceiptImage } from '../../types/receipt';

type PrepareReceiptImageInput = {
  fileName?: string | null;
  height?: number;
  mimeType?: string | null;
  uri: string;
  width?: number;
};

const RECEIPT_ASPECT_RATIO = 0.72;
const MAX_IMAGE_WIDTH = 1400;

function createCenteredCrop(width?: number, height?: number): Action | null {
  if (!width || !height || width <= 0 || height <= 0) {
    return null;
  }

  const currentRatio = width / height;

  if (Math.abs(currentRatio - RECEIPT_ASPECT_RATIO) < 0.08) {
    return null;
  }

  if (currentRatio > RECEIPT_ASPECT_RATIO) {
    const cropWidth = Math.round(height * RECEIPT_ASPECT_RATIO);

    return {
      crop: {
        height,
        originX: Math.max(0, Math.round((width - cropWidth) / 2)),
        originY: 0,
        width: cropWidth,
      },
    };
  }

  const cropHeight = Math.round(width / RECEIPT_ASPECT_RATIO);

  return {
    crop: {
      height: cropHeight,
      originX: 0,
      originY: Math.max(0, Math.round((height - cropHeight) / 2)),
      width,
    },
  };
}

function createResize(width?: number): Action | null {
  if (!width || width <= MAX_IMAGE_WIDTH) {
    return null;
  }

  return { resize: { width: MAX_IMAGE_WIDTH } };
}

export async function prepareReceiptImage(input: PrepareReceiptImageInput): Promise<ReceiptImage> {
  const actions = [createCenteredCrop(input.width, input.height), createResize(input.width)].filter(Boolean) as Action[];
  const result = await manipulateAsync(input.uri, actions, {
    compress: 0.72,
    format: SaveFormat.JPEG,
  });
  const file = new ExpoFile(result.uri);
  const info = file.info();

  return {
    fileName: input.fileName ?? 'receipt.jpg',
    height: result.height,
    mimeType: 'image/jpeg',
    sizeInBytes: info.exists ? info.size : undefined,
    uri: result.uri,
    width: result.width,
  };
}
