// Content store da demonstração Result.
// Camada de persistência local (localStorage) que alimenta o site público e o
// painel administrativo. Em produção, substituir por chamadas de API.
// Nada aqui é dado real de cliente — tudo é conteúdo editável de demonstração.

const STORAGE_KEY = 'result:content:v2';

// Conteúdo padrão (fallback). O painel administrativo grava alterações sobre
// esta estrutura no localStorage; "Restaurar padrão" volta para estes valores.
export const DEFAULTS = {
  home: {
    heroEyebrow: 'Especialistas em Seguro Fiança',
    heroTitle: 'Processos bem conduzidos. <em>Pessoas tratadas com respeito.</em>',
    heroCopy: 'A Result é parceira operacional de seguradoras na condução de sinistros de Seguro Fiança, com cobrança especializada, análise documental e atendimento humanizado.',
    heroPrimaryLabel: 'Conheça nossa atuação',
    heroSecondaryLabel: 'Falar com a Result',
    heroCardItem: 'Cobrança e análise documental em Seguro Fiança',
    introTitle: 'Precisão não precisa ser distante.',
    introCopy: 'Em um mercado que exige consistência e velocidade de resposta, escolhemos não abrir mão do que torna cada processo mais justo: uma análise cuidadosa e uma comunicação que considera quem está do outro lado.',
    servicesIntro: 'Apoiamos seguradoras desde o acionamento do sinistro até o encaminhamento de cobrança, análise documental e pagamento.',
    services: [
      { number: '01 / COBRANÇA', title: 'Cobrança especializada', text: 'Tratativas responsáveis e objetivas para casos de inadimplência em contratos de Seguro Fiança.' },
      { number: '02 / DOCUMENTOS', title: 'Análise documental', text: 'Documentação organizada e avaliada com atenção para apoiar decisões e processos de pagamento.' },
      { number: '03 / RELACIONAMENTO', title: 'Atendimento aos envolvidos', text: 'Uma jornada clara para seguradoras, imobiliárias, corretores e inquilinos.' }
    ],
    steps: [
      { title: 'Acionamento', text: 'A seguradora nos aciona e organizamos o contexto inicial.' },
      { title: 'Análise documental', text: 'Avaliamos documentos e particularidades do caso.' },
      { title: 'Cobrança', text: 'Conduzimos as tratativas com clareza e responsabilidade.' },
      { title: 'Encaminhamento', text: 'Concluímos o processo com registro, orientação e acompanhamento.' }
    ]
  },
  proof: {
    metrics: [
      { value: '10', label: 'profissionais dedicados à operação Result' },
      { value: 'Brasil', label: 'atuação em operações de Seguro Fiança' },
      { value: '80%+', label: 'meta de resolutividade acompanhada mensalmente' },
      { value: '2', label: 'parcerias seguradoras em operação' }
    ],
    leaderName: 'Cauê Trindade',
    leaderRole: 'Liderança operacional',
    leaderBio: 'Responsável operacional da Result. Perfil e formação podem ser complementados após aprovação do material institucional.',
    quote: 'Clareza e respeito em cada contato tornam o processo mais seguro para todos.'
  },
  partners: [
    { name: 'Seguradora parceira', visible: true },
    { name: 'Seguradora parceira', visible: true },
    { name: 'Tokio Marine', visible: false },
    { name: 'Too Seguros', visible: false }
  ],
  testimonials: [
    { author: 'Garantida Jussara', quote: 'Atendimento humanizado, fui tratada com gentileza, empatia, respeito e prestatividade.', visible: true },
    { author: 'Garantido George', quote: 'Profissionais proativos e interessados em resolver os assuntos.', visible: true },
    { author: 'Corretora', quote: 'Todo processo foi realizado com muita rapidez, digno de elogios aos envolvidos.', visible: true }
  ],
  indicators: {
    target: '80%+',
    team: '10',
    reach: 'Nacional'
  },
  images: {
    institutional: '',
    leader: ''
  },
  articles: [
    {
      title: 'Seguro Fiança: por que a clareza na comunicação também reduz riscos',
      category: 'Regulação',
      date: '21 jul 2026',
      status: 'Publicado',
      featured: true,
      summary: 'Como uma comunicação transparente entre seguradora, inquilino e imobiliária reduz conflitos e acelera a resolução de sinistros de Seguro Fiança.',
      content: 'Em processos de Seguro Fiança, a maior parte dos conflitos não nasce do mérito do caso, mas da falta de clareza sobre o que está acontecendo e por quê. Um inquilino que não entende o motivo de uma cobrança tende a resistir a ela. Uma imobiliária que não recebe retorno sobre o andamento de um processo perde confiança na condução. Comunicação técnica bem-feita não é apenas cortesia: é redução de risco operacional.\n\nA Result estrutura cada etapa da cobrança e da análise documental para que as partes envolvidas saibam, a qualquer momento, em que estágio o processo está e o que é esperado delas. Isso significa evitar jargão desnecessário, explicar prazos com antecedência e documentar cada decisão de forma rastreável.\n\nO resultado prático é mensurável: processos com comunicação clara desde o início tendem a ser resolvidos mais rápido e com menos reclamações formais. Clareza não substitui rigor técnico — ela é o que permite que o rigor técnico seja compreendido e aceito por quem está do outro lado da mesa.'
    },
    {
      title: 'O papel do atendimento humanizado em jornadas de sinistro',
      category: 'Experiência',
      date: '14 jul 2026',
      status: 'Publicado',
      summary: 'Por trás de cada processo de cobrança existe uma pessoa. Entenda como a Result equilibra rigor técnico e cuidado humano nas jornadas de sinistro.',
      content: 'Um sinistro de Seguro Fiança quase sempre está associado a um momento difícil na vida de alguém: perda de renda, mudança de endereço, uma relação com o locador que já não é a mesma. Tratar cada contato apenas como um número de processo ignora esse contexto — e, na prática, torna a cobrança menos eficaz, não mais.\n\nAtendimento humanizado, para a Result, não significa flexibilizar critérios técnicos. Significa ouvir antes de decidir, explicar o motivo de cada exigência documental e reconhecer que negociações bem conduzidas preservam relações que vão continuar existindo depois que o processo se encerra — entre inquilino e imobiliária, entre corretor e seguradora.\n\nEssa combinação de critério técnico com escuta ativa é o que sustenta uma taxa de resolutividade consistente sem custo reputacional para as seguradoras parceiras. Regulação bem feita não é apenas seguir o processo certo; é conduzir pessoas por ele com respeito.'
    },
    {
      title: 'Documentação organizada: a base para decisões mais seguras',
      category: 'Gestão',
      date: '08 jul 2026',
      status: 'Rascunho',
      summary: 'Uma análise documental bem estruturada é o que sustenta decisões rápidas e seguras em processos de Seguro Fiança.',
      content: 'Decisões rápidas em regulação de sinistros não vêm de atalhos — vêm de documentação organizada desde o primeiro contato. Quando cada documento recebido é catalogado, validado e vinculado corretamente ao contrato de origem, a análise deixa de depender de retrabalho e passa a ser previsível.\n\nA Result trata a organização documental como parte central da operação, não como uma etapa administrativa secundária. Isso reduz o tempo entre o acionamento do sinistro e uma resposta conclusiva, e diminui a chance de reabertura de casos por documentação incompleta.\n\nEste texto ainda está em rascunho e será revisado antes da publicação.'
    },
    {
      title: 'Cinco perguntas que toda imobiliária deve fazer antes de acionar um sinistro',
      category: 'Gestão',
      date: '28 jun 2026',
      status: 'Publicado',
      summary: 'Um roteiro simples para organizar informações antes do acionamento e evitar atrasos na condução do processo de Seguro Fiança.',
      content: 'O tempo entre o acionamento de um sinistro e sua resolução costuma depender menos da complexidade do caso e mais da qualidade das informações enviadas logo no início. Reunir o essencial antes de abrir o processo evita idas e vindas que atrasam a análise para todos os envolvidos.\n\nAntes de acionar, vale confirmar: o contrato de locação está atualizado e assinado por todas as partes? Há registro claro do período de inadimplência? Os dados de contato do inquilino e do fiador estão corretos? Existe algum acordo informal em andamento que precise ser documentado? A imobiliária tem os comprovantes de tentativa de contato prévio?\n\nNenhuma dessas perguntas exige um esforço grande — mas juntas, elas reduzem exigências de complementação documental, que é a causa mais comum de atraso em processos de Seguro Fiança. Um acionamento bem preparado é o primeiro passo para uma condução mais rápida.'
    },
    {
      title: 'Seguro Fiança em números: o que os dados de resolutividade realmente mostram',
      category: 'Institucional',
      date: '30 mai 2026',
      status: 'Publicado',
      summary: 'Indicadores de resolutividade dizem mais sobre processo do que sobre sorte. Entenda o que está por trás de uma boa taxa de resolução.',
      content: 'É comum tratar a taxa de resolutividade como um número isolado — um índice a ser perseguido. Mas por trás de qualquer indicador consistente existe uma estrutura: método de análise, comunicação padronizada e critérios de decisão que não mudam de caso para caso.\n\nQuando uma operação de Seguro Fiança mantém resolutividade estável mês a mês, isso normalmente indica que o processo é replicável — não que os casos ficaram mais fáceis. Times que dependem de esforço individual para "destravar" processos tendem a apresentar resultados instáveis, mesmo quando pontualmente bons.\n\nPara seguradoras avaliando parceiros de regulação, olhar a consistência do indicador ao longo do tempo diz mais do que o valor absoluto em um único mês. Processo bem desenhado é o que sustenta resultado bom de forma repetida.'
    }
  ],
  contacts: [
    { person: 'Mariana Costa', subject: 'Solicitação de informações institucionais', type: 'Parceria', status: 'Novo', date: 'Hoje, 10:42' },
    { person: 'André Ribeiro', subject: 'Currículo — Analista de Sinistros', type: 'Trabalhe conosco', status: 'Em análise', date: 'Hoje, 09:18' },
    { person: 'Imobiliária Horizonte', subject: 'Dúvida sobre documentação', type: 'SAC', status: 'Concluído', date: 'Ontem, 16:04' }
  ],
  settings: {
    phone: '(11) 4040-0547',
    phoneHref: '+551140400547',
    address: 'Av. Melchert, 1324 – Vila Matilde<br>São Paulo/SP',
    email: 'kauana@mtreguladora.com.br',
    whatsapp: ''
  }
};

function deepClone(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

// Mescla defaults com o conteúdo salvo, garantindo que novos campos apareçam
// mesmo em dados persistidos por versões anteriores.
function merge(base, saved) {
  if (Array.isArray(base)) return Array.isArray(saved) ? saved : deepClone(base);
  if (base && typeof base === 'object') {
    const result = {};
    for (const key of Object.keys(base)) {
      result[key] = merge(base[key], saved ? saved[key] : undefined);
    }
    return result;
  }
  return saved === undefined ? base : saved;
}

let cache = null;

export function getContent() {
  if (cache) return cache;
  let saved = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) saved = JSON.parse(raw);
  } catch (error) {
    console.warn('Não foi possível ler o conteúdo salvo. Usando padrão.', error);
  }
  cache = merge(DEFAULTS, saved);
  return cache;
}

export function saveContent(content) {
  cache = content;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    return true;
  } catch (error) {
    console.error('Não foi possível salvar o conteúdo.', error);
    return false;
  }
}

// Atualiza uma parte do conteúdo e persiste. `updater` recebe o rascunho atual.
export function updateContent(updater) {
  const draft = deepClone(getContent());
  updater(draft);
  return saveContent(draft);
}

export function resetContent() {
  cache = deepClone(DEFAULTS);
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Não foi possível limpar o conteúdo salvo.', error);
  }
  return cache;
}

export function hasCustomContent() {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}

// Lê um arquivo de imagem e devolve uma Data URL (base64) para preview/persistência.
export function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
