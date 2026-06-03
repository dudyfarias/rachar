# Sprint 2 - OCR E Conferencia Inteligente

## Objetivo Do Sprint

Implementar leitura automatica de comandas usando captura de imagem, OCR e parser assistido por IA.

Fluxo principal:

```text
Foto -> crop/compressao -> upload -> OCR -> IA -> JSON estruturado -> conferencia
```

## Funcionalidades Implementadas

- Captura de comanda com `expo-camera`.
- Selecao de imagem da galeria com `expo-image-picker`.
- Crop central e compressao JPEG com `expo-image-manipulator`.
- Upload opcional para Supabase Storage via bucket configuravel.
- Abstracao de OCR trocavel em `receiptOcr.ts`.
- Parser de IA em `receiptParser.ts`.
- Parser local de fallback para modo demo sem backend.
- Validacao de subtotal e total com warnings.
- Store dedicada para estado de processamento de recibos.
- Telas: Captura da Conta, Processamento e Conferencia Inteligente.
- Importacao do resultado conferido para o fluxo manual de pessoas/itens.

## JSON Estruturado Da IA

O parser normaliza a resposta para:

```ts
type ParsedReceipt = {
  restaurantName: string | null;
  items: Array<{
    name: string;
    quantity: number;
    unitPriceInCents: number;
    totalInCents: number;
  }>;
  serviceFeeInCents: number;
  discountInCents: number;
  subtotalInCents: number;
  totalInCents: number;
  warnings: Array<{
    code: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
  }>;
};
```

## Arquitetura Criada

- `src/types/receipt.ts`: contratos compartilhados de OCR, imagem, warnings e recibo estruturado.
- `src/services/receipts/receiptImage.ts`: crop e compressao.
- `src/services/receipts/receiptUpload.ts`: upload para Supabase Storage ou skip em modo demo.
- `src/services/receipts/receiptOcr.ts`: provider OCR remoto ou demo.
- `src/services/receipts/receiptParser.ts`: parser IA remoto, extracao de JSON e fallback local.
- `src/services/receipts/receiptProcessing.ts`: orquestracao do pipeline completo.
- `src/stores/receiptStore.ts`: estado do fluxo OCR/IA.

## Variaveis De Ambiente

```bash
EXPO_PUBLIC_SUPABASE_RECEIPT_BUCKET=receipts
EXPO_PUBLIC_RECEIPT_OCR_ENDPOINT=
EXPO_PUBLIC_RECEIPT_AI_ENDPOINT=
```

As chaves `OPENAI_API_KEY` e `GOOGLE_VISION_API_KEY` continuam fora do cliente mobile e devem ser usadas apenas em backend/Edge Functions.

## Decisoes Tecnicas

- O cliente mobile nao chama OpenAI ou Google Vision diretamente.
- OCR e IA ficam atras de endpoints configuraveis para facilitar troca de provedor.
- Sem endpoints, o app usa modo demo para validar UX e contrato de dados.
- Valores monetarios continuam em centavos.
- Warnings acompanham OCR, upload e parser para conferencia humana.

## Problemas Encontrados

- OCR real depende de backend ainda nao implementado.
- Bucket `receipts` precisa existir no Supabase para upload real.
- Validacao visual ainda precisa ser testada em dispositivo fisico.

## Melhorias Futuras

- Edge Function `receipt-ocr`.
- Edge Function `receipt-assistant`.
- Crop manual com handles.
- Reprocessamento de item individual.
- Edicao inline de itens na conferencia.
- Testes automatizados do parser.

## Checklist De Progresso

- [x] Captura da camera.
- [x] Upload de imagem.
- [x] Crop e compressao.
- [x] OCR abstrato.
- [x] Parser de IA.
- [x] `receiptParser.ts`.
- [x] JSON estruturado.
- [x] Tela Captura da Conta.
- [x] Tela Processamento.
- [x] Tela Conferencia Inteligente.
- [x] Estados de loading.
- [x] Tratamento de erro.
- [x] Validacao de total.
- [x] Arquitetura para trocar OCR futuramente.
- [ ] Backend OCR real.
- [ ] Backend IA real.
- [ ] Testes em camera real.

## Proximos Passos

Conectar OCR/IA reais via Supabase Edge Functions e evoluir a conferencia para edicao inline antes de salvar rachas no historico.
