# Sprint 2 - Persistencia E Historico

## Objetivo Do Sprint

Persistir rachas no Supabase, permitir historico e transformar o fluxo manual em MVP utilizavel.

## Funcionalidades Planejadas

- Salvar conta no banco.
- Listar historico de contas.
- Reabrir conta finalizada.
- Editar pessoas e itens.
- Sincronizar dados do usuario autenticado.

## Decisoes Tecnicas

- Usar Supabase Data API com RLS.
- Manter engine financeira local e pura.
- Persistir valores ja calculados para auditoria.

## Bibliotecas Utilizadas

- Supabase JS
- Zustand
- React Navigation

## Problemas Encontrados

- Ainda nao iniciado.

## Melhorias Futuras

- Cache local offline.
- Sincronizacao otimista.
- Exportacao de comprovante.

## Pendencias

- Aplicar migration Sprint 1.
- Criar camada repository para bills.
- Testar RLS com usuarios diferentes.

## Checklist De Progresso

- [ ] Criar repository de bills.
- [ ] Persistir bill.
- [ ] Persistir people/items/splits.
- [ ] Criar historico.
- [ ] Criar edicao.
- [ ] Atualizar docs e changelog.

## Proximos Passos

Preparar dados para OCR e IA no Sprint 3.
