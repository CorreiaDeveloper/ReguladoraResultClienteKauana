# Alinhamento com briefing da cliente

## Posicionamento confirmado

- A Result é uma empresa terceirizada contratada por seguradoras.
- Sua especialidade é o **Seguro Fiança**.
- A operação possui duas frentes principais:
  1. cobrança;
  2. análise documental para apoio aos pagamentos.
- Imobiliárias, corretores e inquilinos não são os contratantes principais, mas precisam encontrar informações de contato e validar a legitimidade da empresa.
- A atuação é nacional.
- O diferencial institucional é o atendimento humanizado, especialmente em situações sensíveis de inadimplência.
- A Result possui cerca de 10 colaboradores; a operação conjunta com outra empresa familiar possui cerca de 22 pessoas. A outra empresa não deve ser vinculada publicamente à Result devido a contratos de exclusividade.

## Decisões aplicadas no site

- A página `Quem somos` agora descreve a Result como parceira terceirizada de seguradoras e explicita as frentes de cobrança e análise documental.
- `Como atuamos` deixa claro o fluxo: acionamento pela seguradora, análise documental, cobrança/tratativas e conclusão.
- A página `Serviços` passou a apresentar cobrança especializada, análise documental e pagamento, atendimento aos públicos envolvidos e acompanhamento operacional.
- O painel administrativo continua **integralmente demonstrativo**: login, indicadores, formulários, artigos e uploads são simulados e não armazenam dados.

## Informações pendentes antes da publicação

1. **Parceiros/seguradoras**
   - Inserir logos e nomes somente após autorização formal das seguradoras.
   - A transcrição menciona “Tchul Seguros” e “Toco Marini”; confirmar a grafia comercial e o direito de uso. É possível que sejam nomes transcritos incorretamente.

2. **Contato e formulários**
   - Confirmar e-mail de destino para contato, SAC, sugestões, parcerias e currículo.
   - Definir se haverá um telefone/WhatsApp institucional do responsável para publicação.

3. **Dados institucionais**
   - Confirmar nome, cargo, foto e biografia que poderão ser publicados para o responsável operacional.
   - Confirmar CNPJ, razão social, política de privacidade, termos e endereço definitivo.

4. **Prova social e indicadores**
   - Publicar somente depoimentos autorizados, preferencialmente identificados por cargo/empresa quando permitido.
   - O possível indicador de resolvibilidade acima de 80% deve ser calculado mensalmente e aprovado antes de aparecer no site público.
   - Não divulgar índices por seguradora, sinistralidade ou qualquer dado coberto por confidencialidade.

5. **Marca**
   - A marca atual foi criada internamente e precisa de uma versão vetorial final, com regras de uso e variações de contraste.
   - O azul deve permanecer como cor central; o dourado pode ser substituído por um metálico discreto na identidade definitiva.

## Recomendações para a evolução de produção

- Substituir os dados em `mocks/cms.js` por endpoints de API.
- Integrar o envio dos formulários ao e-mail definido pela empresa, sem expor o endereço na interface.
- Habilitar autenticação real e persistência apenas após a aprovação da proposta.
- Instalar analytics e monitoramento de conversão somente com política de privacidade definitiva e consentimento adequado.
