# PWA e Vercel

## Estrutura

Arquivos PWA:

- `public/index.html`: template web do Expo com manifest e registro do service worker.
- `public/manifest.json`: metadados de instalacao.
- `public/sw.js`: cache leve para app shell, navegacao e assets.
- `public/pwa-192.png` e `public/pwa-512.png`: icones instalaveis gerados por `npm run assets:pwa`.

Config Vercel:

- `vercel.json`: build, output, fallback SPA e headers.
- `.vercelignore`: remove artefatos locais do pacote enviado.

## Build local

```bash
npm run build:web
```

O resultado fica em `dist/`. O Expo copia os arquivos de `public/` para esse diretorio durante o export.

## Deploy manual

```bash
npm exec -- vercel
npm exec -- vercel --prod
```

Na primeira execucao, vincule ou crie o projeto no Vercel. O arquivo `vercel.json` ja informa:

- Install Command: `npm ci`
- Build Command: `npm run build:web`
- Output Directory: `dist`

## Fechamento de sprint

Sempre que um sprint for fechado:

```bash
npm test
npm run typecheck
npm run ui:check
npm run docs:check
npm run build:web
git add .
git commit -m "feat: ..."
git push origin main
npm exec -- vercel --prod
```

## Variaveis de ambiente

Para usar Supabase real no deploy:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SUPABASE_RECEIPT_BUCKET=receipts
EXPO_PUBLIC_RECEIPT_OCR_ENDPOINT=
EXPO_PUBLIC_RECEIPT_AI_ENDPOINT=
```

Sem `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`, o app abre em modo demo.

## Checklist pos-deploy

- Abrir a URL `.vercel.app`.
- Confirmar que `/manifest.json` carrega.
- Confirmar que `/sw.js` carrega.
- Recarregar uma rota interna e verificar fallback SPA.
- Abrir DevTools > Application > Manifest e verificar instalabilidade.
- Testar onboarding, login demo, fluxo manual e resultado.
