---
mode: agent
description: Evoluir o site da Result Reguladora mantendo a arquitetura SPA e as regras de conformidade.
---

# Evolução do site Result Reguladora

Você vai evoluir o site institucional da **Result Reguladora de Sinistros**
(SPA vanilla; `app.js` + `services/store.js` com persistência em localStorage;
painel em `/admin`). Leia [.github/instructions/result.instructions.md](../instructions/result.instructions.md)
antes de começar.

## Tarefa
${input:tarefa:Descreva a mudança desejada (ex.: adicionar seção de FAQ, novo tipo de formulário, editar textos)}

## Regras obrigatórias
- Manter **vanilla JS/HTML/CSS**, sem framework nem build.
- Todo conteúdo editável deve passar por `services/store.js` (defaults + localStorage + reset).
- O site público lê do store; o painel `/admin` grava no store.
- Escapar texto do usuário com `esc()` ao injetar HTML.
- Preservar acessibilidade (aria, foco, reduced-motion) e SEO existentes.
- **Conformidade:** sem logos/nomes de seguradoras não autorizados; sem dados por
  seguradora ou de sinistralidade; depoimentos só com consentimento; e-mail de
  formulário não exposto na interface.
- Nada de dados reais de terceiros — tudo permanece demonstrativo e reversível.

## Entregáveis
1. Código implementado e sem erros (validar com o servidor `npx serve . -l 3000 --single`).
2. Se criar conteúdo editável novo, adicioná-lo ao `DEFAULTS` e a uma tela do painel.
3. Resumo curto do que mudou e do que ficou pendente de dados reais da cliente.
