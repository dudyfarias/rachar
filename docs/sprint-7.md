# Sprint 7 - PWA e Vercel

## Objetivo

Preparar o Rachae para distribuicao web como PWA instalavel e para deploy estatico no Vercel.

## Entregas

- Template `public/index.html` customizado pelo Expo com manifest e registro de service worker.
- `public/manifest.json` com nome, tema, escopo, modo standalone e icones instalaveis.
- `public/sw.js` com cache leve para shell, navegacao e assets estaticos.
- `scripts/generate-pwa-assets.js` para gerar `pwa-192.png` e `pwa-512.png`.
- `npm run build:web` para gerar `dist/` via `expo export --platform web`.
- `vercel.json` com `npm ci`, `npm run build:web`, `outputDirectory: dist`, fallback SPA e headers.
- `.vercelignore` para evitar upload de dependencias locais e artefatos temporarios.

## Validacao

Rodar antes de publicar:

```bash
npm test
npm run typecheck
npm run ui:check
npm run docs:check
npm run build:web
```

Depois do deploy, conferir:

- `/manifest.json` responde 200.
- `/sw.js` responde 200 com `Service-Worker-Allowed: /`.
- A home abre em modo standalone/installable no Chrome ou Edge.
- Rotas internas recarregadas diretamente voltam para `/index.html`.
- Sem variaveis Supabase, app abre em modo demo.

## Riscos

- Service workers podem manter cache antigo no navegador. Por isso o cache tem versao explicita e `sw.js` usa `max-age=0`.
- Assets atuais ainda sao placeholders; antes de loja/producao, substituir por icones finais da marca.
- Deploy real depende de autenticacao no Vercel e, para dados reais, variaveis de ambiente no dashboard.
