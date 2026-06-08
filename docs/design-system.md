# Design System

## Direcao Visual

O Rachaê deve parecer uma fintech brasileira moderna: rapido, confiavel, claro e com energia de produto financeiro simples.

## Principios

- Clareza acima de decoracao.
- Numeros financeiros sempre em destaque.
- CTA primario evidente.
- Cards compactos e escaneaveis.
- Feedback visual para selecoes.

## Cores

Paleta inicial:

- Brand: `#00A676`
- Brand dark: `#047857`
- Money: `#B6F000`
- Ink: `#0F172A`
- Muted: `#64748B`
- Background: `#F6F8F7`
- Danger: `#EF4444`

## Componentes

### Button

Variantes:

- `primary`
- `secondary`
- `ghost`
- `danger`

### Input

Inclui:

- label
- helper
- error
- suporte a teclado numerico

### Card

Usado para:

- resumos
- formularios
- listas de pessoas e itens

Variantes:

- `default`: superficies neutras.
- `soft`: avisos leves e rascunhos.
- `dark`: paineis de captura, totais e destaques escuros.
- `brand`: destaque financeiro principal.

Evite aplicar classes `bg-*` diretamente em `Card`; use uma variante para impedir conflito de fundo.

### FlowStepHeader

Usado para:

- orientar etapas do racha manual.
- orientar etapas de scan, conferencia, pessoas, itens e resultado.
- reduzir copy explicativa repetida no topo das telas.

### Header

Inclui:

- titulo
- eyebrow
- botao voltar
- acao opcional a direita

### Loading

Estado global de preparacao do app.

### Modal

Feedbacks e confirmacoes.

### BottomSheet

Explicacoes contextuais e acoes futuras.

## NativeWind

Tokens customizados ficam em `tailwind.config.js`.

## Regras

- Evitar cards dentro de cards.
- Manter raio visual consistente.
- Botoes de fluxo no rodape.
- Usar icones Lucide quando fizer sentido.
- Nao criar paletas novas sem atualizar este arquivo.
- Telas com muitos blocos devem usar abas ou seções progressivas antes de virar dashboard longo.

## Screenshots

Evolucao visual deve ser salva em `docs/screenshots/`.
