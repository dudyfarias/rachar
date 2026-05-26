# Sprint 4 - Beta Colaborativo E Persistencia Social

## Objetivo Do Sprint

Preparar o app para beta fechado com persistencia social, convites e base para gateway Pix real.

## Funcionalidades Planejadas

- Persistir historico social no Supabase.
- Salvar grupos recorrentes por usuario.
- Criar links/convites para participantes.
- Reabrir rachas antigos como templates.
- Sincronizar rachas entre dispositivos.
- Definir eventos de analytics com consentimento.
- Preparar gateway Pix real com status de cobranca.

## Decisoes Tecnicas

- Pix deve continuar atras de `PixGatewayProvider`.
- Analytics nao pode registrar dados sensiveis sem consentimento.
- Compartilhamento deve funcionar mesmo sem conta para participantes.
- Novas tabelas precisam de RLS e atualizacao em `docs/database.md`.

## Bibliotecas Utilizadas

- A definir conforme persistencia, analytics e gateway escolhidos.

## Problemas Encontrados

- Ainda nao iniciado.

## Melhorias Futuras

- Split payment real.
- Plano premium.
- Push notifications.
- Webhooks Pix.

## Pendencias

- Definir parceiro Pix.
- Definir schema de banco para historico social.
- Criar politica de privacidade.
- Definir estrategia de links publicos.

## Checklist De Progresso

- [ ] Modelar historico social no banco.
- [ ] Criar convites.
- [ ] Reabrir rachas antigos.
- [ ] Definir analytics remoto.
- [ ] Preparar gateway Pix real.
- [ ] Atualizar docs e changelog.

## Proximos Passos

Planejar versao 1.0 e operacao do produto.
