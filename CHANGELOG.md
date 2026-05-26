# Changelog

Todas as mudancas relevantes deste projeto serao documentadas aqui.

Formato baseado em Keep a Changelog e versionamento semantico.

## [Unreleased]

### Added

- Suite inicial de testes automatizados com Vitest para engine financeira e parser de recibos.

### Changed

- Alinhamento de dependencias do Expo SDK 56 e suporte ao alvo web com `react-dom` e `react-native-web`.
- Regra de fechamento de sprint documentada para validar, commitar e enviar o estado final ao repositorio remoto.

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
