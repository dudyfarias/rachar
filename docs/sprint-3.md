# Sprint 3 - OCR E IA

## Objetivo Do Sprint

Adicionar captura/leitura de nota fiscal e usar IA para sugerir itens, categorias e participantes.

## Funcionalidades Planejadas

- Upload/captura de imagem.
- OCR com Google Vision ou alternativa.
- Normalizacao de itens.
- Revisao humana antes de salvar.
- Sugestoes de divisao por IA.

## Decisoes Tecnicas

- Processamento sensivel deve rodar em backend/Edge Function.
- Cliente mobile nao deve expor chaves de OCR ou IA.
- Manter confirmacao humana antes de gerar cobrancas.

## Bibliotecas Utilizadas

- A definir conforme prova tecnica.

## Problemas Encontrados

- Ainda nao iniciado.

## Melhorias Futuras

- Aprendizado por usuario.
- Deteccao de duplicidade.
- Suporte a cupons fiscais diferentes.

## Pendencias

- Definir provedor OCR.
- Definir estrategia de custo.
- Documentar prompts/schemas.

## Checklist De Progresso

- [ ] Criar fluxo de upload.
- [ ] Criar Edge Function OCR.
- [ ] Criar parser de itens.
- [ ] Criar tela de revisao.
- [ ] Atualizar docs e changelog.

## Proximos Passos

Preparar cobranca e compartilhamento no Sprint 4.
