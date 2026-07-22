---
applyTo: '**'
---

# Projeto Result Reguladora — instruções para agentes

## Contexto do produto
Site institucional (demonstração pré-venda) da **Result Reguladora de Sinistros**,
empresa terceirizada contratada por seguradoras, especialista em **Seguro Fiança**.
Duas frentes: cobrança e análise documental para pagamento. Atuação nacional,
cultura familiar e **atendimento humanizado** como principal diferencial.

## Arquitetura
- SPA em **HTML/CSS/JavaScript vanilla**, sem framework nem build.
- Roteamento por `history.pushState` em [app.js](../../app.js); páginas são funções que retornam strings HTML.
- Conteúdo editável fica em [services/store.js](../../services/store.js), persistido em `localStorage`
  (chave `result:content:v2`), com fallback para `DEFAULTS` e função `resetContent`.
- O site público lê do store; o painel `/admin` grava no store.
- Assets referenciados por caminho **root-absoluto** (`/app.js`, `/styles.css`) para deep links.

## Convenções de código
- Manter vanilla JS; não introduzir dependências, bundlers ou frameworks.
- Todo texto/imagem editável deve passar pelo store (nunca “hardcode” novo conteúdo na home).
- Escapar texto vindo do usuário com `esc()` ao injetar em HTML (exceção: `heroTitle`, que aceita `<em>`).
- Preservar acessibilidade existente: `aria-label`, foco visível, `prefers-reduced-motion`, `skip-link`.
- Imagens do painel são convertidas em Data URL (base64) e salvas no store.

## Regras de conformidade (não violar)
- **Não** publicar logos/nomes de seguradoras sem autorização — usar “Seguradora parceira”.
- **Não** divulgar dados por seguradora nem índices de sinistralidade (confidencial).
- Depoimentos só com consentimento; permitir ocultar nome/empresa.
- Formulários enviam para e-mail interno **sem** expor o endereço na interface.
- Confirmar antes de publicar: grafia “Cauê” vs “Kauê” Trindade e nomes reais das seguradoras.

## Fatos ainda pendentes de confirmação da cliente
- E-mail de destino dos formulários; se haverá WhatsApp institucional.
- Nome/cargo/foto/bio do responsável operacional e razão social/CNPJ.
- Marca vetorial definitiva (azul central; dourado apenas como acento).

## Como rodar
- Servir a pasta como estático: `npx serve . -l 3000 --single`.
- Painel demo: `/admin` · credenciais `admin@result.com` / `123456` (apenas demonstração).
