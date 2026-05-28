# Web — Politica de Privacidade e Termos de Uso

Paginas estaticas HTML prontas para hospedagem. Necessarias para submissao na App Store e Play Store.

## Arquivos

- `privacidade.html` — Politica de Privacidade (LGPD)
- `termos.html` — Termos de Uso

## Como publicar via GitHub Pages

1. No repositorio `dudyfarias/rachar`, va em **Settings > Pages**.
2. Em "Source", selecione **Deploy from a branch**.
3. Escolha a branch `main` e a pasta `/web`.
4. Salve. Em alguns minutos, as paginas estarao disponíveis em:
   - `https://dudyfarias.github.io/rachar/privacidade`
   - `https://dudyfarias.github.io/rachar/termos`
5. Atualize `assets/store/metadata.json` com as URLs finais se o dominio for diferente.

## Dominio proprio (opcional)

Se voce registrar `rachae.app`, configure um CNAME apontando para `dudyfarias.github.io`
e atualize as URLs em `metadata.json`.
