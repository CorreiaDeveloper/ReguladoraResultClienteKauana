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
    { title: 'Seguro Fiança: por que a clareza na comunicação também reduz riscos', category: 'Regulação', date: '21 jul 2026', status: 'Publicado' },
    { title: 'O papel do atendimento humanizado em jornadas de sinistro', category: 'Experiência', date: '14 jul 2026', status: 'Publicado' },
    { title: 'Documentação organizada: a base para decisões mais seguras', category: 'Gestão', date: '08 jul 2026', status: 'Rascunho' }
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
