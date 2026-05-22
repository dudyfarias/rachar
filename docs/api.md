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
