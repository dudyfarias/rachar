import type { ReceiptImage, ReceiptOcrResult, ReceiptWarning } from '../../types/receipt';

type ExtractReceiptTextInput = {
  image: ReceiptImage;
};

type ReceiptOcrProvider = {
  extractText: (input: ExtractReceiptTextInput) => Promise<ReceiptOcrResult>;
  name: string;
};

const DEMO_OCR_TEXT = `Restaurante Rachae
2x Hamburguer Artesanal 38,00 76,00
1x Refrigerante 8,00
1x Sobremesa 18,00
Taxa de servico 10,20
Desconto 5,00
Total 107,20`;

function normalizeWarnings(value: unknown): ReceiptWarning[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((warning) => {
      if (!warning || typeof warning !== 'object') {
        return null;
      }

      const candidate = warning as Partial<ReceiptWarning>;

      return {
        code: String(candidate.code || 'OCR_WARNING'),
        message: String(candidate.message || 'Aviso do OCR.'),
        severity: candidate.severity === 'error' || candidate.severity === 'info' ? candidate.severity : 'warning',
      };
    })
    .filter(Boolean) as ReceiptWarning[];
}

class DemoReceiptOcrProvider implements ReceiptOcrProvider {
  name = 'demo-ocr';

  async extractText(): Promise<ReceiptOcrResult> {
    return {
      confidence: 0.72,
      provider: this.name,
      rawText: DEMO_OCR_TEXT,
      warnings: [
        {
          code: 'OCR_DEMO_PROVIDER',
          message: 'OCR real ainda nao configurado. Resultado gerado com texto demo para validar o fluxo.',
          severity: 'info',
        },
      ],
    };
  }
}

class RemoteReceiptOcrProvider implements ReceiptOcrProvider {
  name = 'remote-ocr';

  constructor(private readonly endpoint: string) {}

  async extractText({ image }: ExtractReceiptTextInput): Promise<ReceiptOcrResult> {
    const response = await fetch(this.endpoint, {
      body: JSON.stringify({
        image: {
          height: image.height,
          mimeType: image.mimeType,
          storageBucket: image.storageBucket,
          storagePath: image.storagePath,
          uploadedUrl: image.uploadedUrl,
          uri: image.uri,
          width: image.width,
        },
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`OCR falhou com status ${response.status}.`);
    }

    const payload = (await response.json()) as {
      confidence?: number;
      provider?: string;
      rawText?: string;
      text?: string;
      warnings?: unknown;
    };
    const rawText = payload.rawText || payload.text;

    if (!rawText) {
      throw new Error('OCR nao retornou texto para a conta.');
    }

    return {
      confidence: payload.confidence,
      provider: payload.provider || this.name,
      rawText,
      warnings: normalizeWarnings(payload.warnings),
    };
  }
}

function createReceiptOcrProvider(): ReceiptOcrProvider {
  const endpoint = process.env.EXPO_PUBLIC_RECEIPT_OCR_ENDPOINT;

  if (endpoint) {
    return new RemoteReceiptOcrProvider(endpoint);
  }

  return new DemoReceiptOcrProvider();
}

export async function extractReceiptText(input: ExtractReceiptTextInput) {
  return createReceiptOcrProvider().extractText(input);
}
