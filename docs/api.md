# API

## Estado Atual

O app usa Supabase diretamente pelo cliente mobile para autenticacao e persistencia de dados do usuario. O modo demo continua disponivel quando Supabase nao esta configurado.

Camadas implementadas:

- `authStore`: login, cadastro, logout, sessao persistida e modo demo.
- `billRepository.ts`: cria contas, lista historico, reabre templates e carrega links compartilhados.
- `socialRepository.ts`: sincroniza Pix, amigos recentes, restaurantes, grupos recorrentes e consentimento de analytics.
- `receiptUpload.ts`: envia imagens de recibo para Supabase Storage com URLs assinadas.

## Supabase Auth

Operacoes usadas:

- `signInWithPassword`
- `signUp`
- `signOut`
- `getSession`
- `onAuthStateChange`

## Supabase Data API

### Contas

Servico: `src/lib/supabase/billRepository.ts`

Funcoes:

- `createBill(ownerId, draft, result)`: salva `bills`, `bill_people`, `bill_items` e `item_splits`.
- `listBills(ownerId)`: lista as 30 contas mais recentes com `people_count`.
- `getBillById(billId)`: carrega conta completa para reabrir como template.
- `generateShareToken(billId)`: gera token publico para deep link.
- `getBillByShareToken(token)`: carrega conta compartilhada usando header `x-share-token`.

Observacoes:

- Pessoas e itens sao persistidos por IDs internos do dominio, nao por nome.
- Valores monetarios continuam sempre em centavos.
- Links compartilhados dependem das policies RLS criadas no Sprint 4.

### Social

Servico: `src/lib/supabase/socialRepository.ts`

Funcoes:

- `upsertRecentFriend` / `listRecentFriends`
- `upsertRestaurant` / `listRestaurants`
- `upsertRecurringGroup` / `listRecurringGroups`
- `loadPixProfile` / `savePixProfile`
- `loadAnalyticsConsent` / `saveAnalyticsConsent`

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

## Sprint 3 - Social, WhatsApp E Pix

O Sprint 3 nao adiciona endpoint remoto. A camada social funciona localmente e deixa contratos prontos para APIs futuras.

### Resumo WhatsApp

Servico:

```ts
generateWhatsAppSummary({
  draft,
  result,
  pixKey,
  pixCopyPaste,
});
```

Saida: texto formatado para WhatsApp contendo restaurante, total, valor por pessoa, subtotal, taxa, desconto e dados Pix quando configurados.

### Pix

Contrato de provider:

```ts
type PixGatewayProvider = {
  name: string;
  createCharge: (input: PixChargeInput) => Promise<PixCharge>;
};
```

Entrada:

```ts
type PixChargeInput = {
  amountInCents: number;
  description: string;
  profile: PixProfile;
};
```

Saida:

```ts
type PixCharge = {
  amountInCents: number;
  copyPaste: string;
  provider: string;
  qrValue: string;
};
```

Implementacao atual: `StaticPixGatewayProvider`, que gera Pix copia e cola/QR Code localmente. Um gateway real deve manter o mesmo contrato e adicionar status de cobranca no backend.

### Analytics Local

Eventos persistidos no cliente:

```ts
type AnalyticsEvent = {
  id: string;
  name: AnalyticsEventName;
  properties?: Record<string, string | number | boolean | null>;
  timestamp: string;
};
```

Antes de enviar eventos para backend, definir consentimento, retencao de dados e filtragem de informacoes sensiveis.

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
