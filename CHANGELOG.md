# Changelog

Todas as mudancas relevantes deste projeto serao documentadas aqui.

Formato baseado em Keep a Changelog e versionamento semantico.

## [Unreleased]

### Added

- Suite inicial de testes automatizados com Vitest para engine financeira e parser de recibos.
- Login local de teste configuravel por `EXPO_PUBLIC_TEST_ADMIN_EMAIL` e `EXPO_PUBLIC_TEST_ADMIN_PASSWORD`.

### Changed

- Alinhamento de dependencias do Expo SDK 56 e suporte ao alvo web com `react-dom` e `react-native-web`.
- Regra de fechamento de sprint documentada para validar, commitar e enviar o estado final ao repositorio remoto.
- Versao do pacote alinhada com o app em `0.4.0`.

### Fixed

- Tipos Supabase atualizados para o formato esperado pelo `supabase-js` atual.
- Sync social agora recebe o usuario autenticado ao finalizar rachas, salvar Pix e criar grupos.
- Links compartilhados enviam `x-share-token` e podem abrir a tela publica via deep link.
- Tela de racha compartilhado inclui taxa e desconto no total por pessoa.

## [0.4.0] - 2026-05-26

### Added

- Sprint 4A: persistencia social no Supabase.
- Sprint 4B: producao e escala.
- Cache em memoria + AsyncStorage com TTL (`src/lib/cache.ts`).
- Fila de requisicoes com retry exponencial e concorrencia limitada (`src/lib/queue.ts`).
- Logger com buffer, sink remoto plugavel e niveis debug/info/warn/error (`src/lib/logger.ts`).
- Rate limiter client-side com token bucket (`src/lib/rateLimiter.ts`).
- Validacao de uploads: MIME type, tamanho, magic bytes (`src/lib/security/uploadValidator.ts`).
- Sanitizacao de inputs: XSS, SQL injection, nomes, moeda (`src/lib/security/inputSanitizer.ts`).
- Antifraude: limites de valor, itens, pessoas, rate limiting por acao (`src/lib/security/antiFraud.ts`).
- Memoria de comandas com historico de itens e restaurantes (`src/services/receipts/receiptMemory.ts`).
- Reconhecimento de padroes de layout de recibos BR (`src/services/receipts/receiptPatterns.ts`).
- EAS Build com profiles development, staging e production (`eas.json`).
- CI/CD com GitHub Actions: lint, typecheck, test, build staging automatico (`ci.yml`).
- Workflow de producao: build e submit para App Store e Play Store (`production.yml`).
- Assets placeholder: icon, adaptive-icon, splash, favicon com cores do Rachae.
- Metadata de loja: descricao, keywords, privacidade, classificacao (`assets/store/metadata.json`).
- Script `generate-assets.js` para gerar PNGs placeholder.
- `app.json` atualizado para v0.4.0 com splash, icon, runtimeVersion, favicon, infoPlist.
- Migration `202605260001_sprint_4_social_and_invites.sql` com 6 novas tabelas.
- Tabelas: `pix_profiles`, `recurring_groups`, `recurring_group_members`, `recent_friends`, `restaurant_history`, `analytics_consents`.
- Campo `bills.share_token` para links publicos de compartilhamento.
- RLS para leitura publica de bills compartilhadas via header `x-share-token`.
- Repositorios Supabase: `billRepository.ts` e `socialRepository.ts`.
- Sync bidirecional no `socialStore` (local-first com write-through para Supabase).
- Acao `loadBillAsTemplate` no `billStore` para reabrir rachas antigos.
- Tela `BillHistoryScreen` com listagem, reabrir e compartilhar.
- Tela `SharedBillScreen` para visualizacao publica de conta compartilhada.
- Botao "Historico de rachas" na HomeScreen.
- Sync automatico de dados sociais no login via `App.tsx`.
- Tipos atualizados em `database.ts` para todas as novas tabelas.
- Rotas `BillHistory` e `SharedBill` no RootNavigator.

### Changed

- `socialStore.recordFinishedBill` agora recebe `userId` e persiste no Supabase em background.
- `socialStore.updatePixProfile` agora recebe `userId` e salva perfil Pix no Supabase.
- `socialStore` exclui `analyticsEvents` da persistencia AsyncStorage via `partialize`.
- `receiptUpload.ts` usa `createSignedUrl` em vez de `getPublicUrl` para proteger recibos.
- `authStore.initialize` registra listener antes de `getSession` para eliminar race condition.
- `pix.ts` remove campo `80` invalido da spec BRCode; description agora fica no bloco `62` sub-campo `08`.

### Fixed

- Race condition no `authStore` entre `getSession` e `onAuthStateChange`.
- Payload Pix com campo `80` fora da spec EMV/BRCode.
- Bucket de recibos expondo fotos publicamente (agora usa signed URLs).
- Analytics events acumulando no AsyncStorage e causando hidratacao lenta.

## [0.3.0] - 2026-05-26

### Added

- Camada social com tela Social e Pix.
- Compartilhamento de resumo por WhatsApp com fallback nativo.
- Gerador `src/services/social/generateWhatsAppSummary.ts`.
- Perfil Pix com copia de chave, QR Code e codigo copia e cola.
- Abstracao `PixGatewayProvider` para gateways Pix futuros.
- Historico avancado de rachas, amigos recentes e restaurantes.
- Grupos recorrentes automaticos e criacao manual.
- Avatares deterministicos para amigos e grupos.
- Eventos locais de analytics e retencao.

## [0.2.0] - 2026-05-22

### Added

- Fluxo OCR + IA para comandas.
- Telas Captura da Conta, Processamento e Conferencia Inteligente.
- Captura com `expo-camera` e galeria com `expo-image-picker`.
- Crop e compressao com `expo-image-manipulator`.
- Upload opcional de imagem para Supabase Storage.
- Parser `src/services/receipts/receiptParser.ts`.
- Abstracao de provider OCR para troca futura.
- Validacao de total e warnings de conferencia.

## [0.1.0] - 2026-05-22

### Added

- Fundacao Expo + React Native + TypeScript.
- NativeWind configurado com tokens visuais do Rachaê.
- Navegacao com React Navigation.
- Autenticacao Supabase com email/senha e modo demo local.
- Stores Zustand para app, auth e rascunho de conta.
- Telas: Onboarding, Login, Cadastro, Home, Nova Conta, Adicionar Pessoas, Adicionar Itens e Resultado Final.
- Componentes: Button, Input, Card, Header, Loading, Modal e BottomSheet.
- Engine financeira `calculateSplits.ts`.
- Migration Supabase com `users`, `bills`, `bill_people`, `bill_items` e `item_splits`.
- Documentacao inicial em `docs/`.
- Templates de GitHub para PR e issues.

### Changed

- Projeto inicial do Expo adaptado para produto Rachaê.

### Fixed

- Arredondamento financeiro tratado em centavos com distribuicao deterministica.

### Removed

- Tela padrao do template Expo.
