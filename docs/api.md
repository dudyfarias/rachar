# API

## Estado Atual

No Sprint 1, o app usa Supabase diretamente pelo cliente mobile para autenticacao. Persistencia de contas esta preparada pelo schema, mas ainda nao conectada ao fluxo.

## Supabase Auth

Operacoes previstas:

- `signInWithPassword`
- `signUp`
- `signOut`
- `getSession`
- `onAuthStateChange`

## Supabase Data API Futuro

Repositorios planejados:

- `createBill`
- `updateBill`
- `listBills`
- `getBillById`
- `deleteBill`
- `saveBillPeople`
- `saveBillItems`
- `saveItemSplits`

## Sprint 2 - OCR E IA

O cliente mobile chama endpoints configuraveis para OCR e IA. Em desenvolvimento sem backend, o app usa providers demo/fallback.

Variaveis:

```bash
EXPO_PUBLIC_RECEIPT_OCR_ENDPOINT=
EXPO_PUBLIC_RECEIPT_AI_ENDPOINT=
EXPO_PUBLIC_SUPABASE_RECEIPT_BUCKET=receipts
```

### OCR

Endpoint esperado:

```text
POST EXPO_PUBLIC_RECEIPT_OCR_ENDPOINT
```

Payload:

```json
{
  "image": {
    "uri": "file://...",
    "uploadedUrl": "https://...",
    "storageBucket": "receipts",
    "storagePath": "user/file.jpg",
    "mimeType": "image/jpeg",
    "width": 1200,
    "height": 1600
  }
}
```

Resposta:

```json
{
  "provider": "google-vision",
  "rawText": "texto extraido",
  "confidence": 0.93,
  "warnings": []
}
```

### Parser De IA

Endpoint esperado:

```text
POST EXPO_PUBLIC_RECEIPT_AI_ENDPOINT
```

Payload:

```json
{
  "ocrText": "texto extraido",
  "imageUrl": "https://...",
  "schema": {}
}
```

Resposta normalizada:

```json
{
  "restaurantName": "Restaurante Exemplo",
  "items": [
    {
      "name": "Hamburguer",
      "quantity": 2,
      "unitPriceInCents": 3800,
      "totalInCents": 7600
    }
  ],
  "serviceFeeInCents": 1020,
  "discountInCents": 500,
  "subtotalInCents": 10200,
  "totalInCents": 10720,
  "warnings": []
}
```

O cliente tambem aceita resposta embrulhada em `receipt` ou `data` e blocos markdown `json`, para facilitar integracao com LLMs.

## Contrato De Entrada Do Calculo

```ts
type BillDraft = {
  title: string;
  place: string;
  serviceFeeInCents: number;
  discountInCents: number;
  people: BillPerson[];
  items: BillItem[];
};
```

## Contrato De Saida Do Calculo

```ts
type SplitSummary = {
  subtotalInCents: number;
  serviceFeeInCents: number;
  discountInCents: number;
  totalInCents: number;
  people: PersonSplit[];
};
```

## OCR Futuro

Endpoint/Edge Function planejada:

```text
POST /functions/v1/receipt-ocr
```

Responsabilidade:

- Receber imagem.
- Executar OCR.
- Retornar texto estruturado.
- Nunca expor chave OCR no cliente.

## IA Futuro

Endpoint/Edge Function planejada:

```text
POST /functions/v1/receipt-assistant
```

Responsabilidade:

- Normalizar itens.
- Sugerir categorias.
- Sugerir inconsistencias.
- Gerar explicacao do calculo.

## Erros

Padrao desejado:

```ts
type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};
```

## Documentacao Continua

Qualquer nova API deve atualizar:

- `docs/api.md`
- `docs/architecture.md`
- sprint correspondente
- `CHANGELOG.md`
