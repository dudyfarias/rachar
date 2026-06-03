# Sprint 3 - Social, Compartilhamento E Pix

## Objetivo Do Sprint

Adicionar camada social ao Rachae com compartilhamento de resumo, Pix, historico avancado, grupos recorrentes e primeiros eventos de analytics/retencao.

## Funcionalidades Implementadas

- Compartilhamento do resultado por WhatsApp com fallback para `Share`.
- Geracao de resumo em `src/services/social/generateWhatsAppSummary.ts`.
- Perfil Pix com chave, recebedor e cidade.
- Copia de chave Pix com `expo-clipboard`.
- QR Code Pix e codigo copia e cola com provider local.
- Historico avancado de rachas finalizados.
- Grupos recorrentes automaticos e criacao manual.
- Avatares deterministicos para amigos recentes e grupos.
- Historico de restaurantes com visitas, total e ticket medio.
- Store social persistida em `src/stores/socialStore.ts`.
- Eventos locais de analytics e retencao.

## Decisoes Tecnicas

- Valores monetarios continuam em centavos.
- Pix fica atras de `PixGatewayProvider` para permitir troca por gateway real no futuro.
- QR Code Pix e copia e cola sao gerados localmente pela implementacao `StaticPixGatewayProvider`.
- Analytics usa sink local configuravel, sem enviar dados para terceiros neste sprint.
- Historico social fica em Zustand persistido enquanto a modelagem definitiva do banco nao entra no produto.
- Compartilhamento usa intents nativas do dispositivo, sem backend.

## Bibliotecas Utilizadas

- `expo-clipboard`
- `react-native-qrcode-svg`

## Eventos De Analytics

- `bill_finished`
- `group_created`
- `history_opened`
- `pix_key_copied`
- `pix_qr_viewed`
- `retention_return_home`
- `restaurant_revisited`
- `whatsapp_summary_shared`

## Problemas Encontrados

- A instalacao de dependencias exigiu desabilitar verificacao SSL do npm no ambiente local por causa de certificado, sem alterar configuracao do app.
- Pix real ainda precisa de gateway homologado, consentimento e revisao juridica antes de producao.

## Melhorias Futuras

- Persistir historico social no Supabase com RLS.
- Adicionar gateway Pix real com webhooks e status de pagamento.
- Criar convites por link para participantes.
- Enviar analytics para backend proprio com opt-in e politica de privacidade.
- Permitir reabrir rachas antigos como templates.

## Pendencias

- Definir parceiro/gateway Pix.
- Definir schema de banco para amigos, grupos, restaurantes e eventos.
- Criar politica de privacidade para analytics.
- Definir estrategia de compartilhamento por links.

## Checklist De Progresso

- [x] Criar resumo WhatsApp.
- [x] Compartilhar resultado.
- [x] Copiar chave Pix.
- [x] Gerar QR Code Pix.
- [x] Criar historico avancado.
- [x] Criar grupos recorrentes.
- [x] Criar eventos de analytics/retencao.
- [x] Atualizar docs e changelog.

## Proximos Passos

No Sprint 4, transformar a camada local em beta colaborativo com persistencia social, convites e preparacao para gateway Pix real.
