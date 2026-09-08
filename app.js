import { getContent, updateContent, resetContent, hasCustomContent, readImageAsDataUrl } from './services/store.js';

const app = document.querySelector('#app');

const icons = {
  arrow: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  grid: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg>',
  file: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6zM14 3v5h5M9 13h6M9 17h4"/></svg>',
  inbox: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM4 14h5l2 3h2l2-3h5"/></svg>',
  users: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20c.4-4 2.5-6 6-6s5.6 2 6 6M15 15c2.8.1 4.6 1.7 5 4"/></svg>',
  chart: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5M4 19h16M8 16v-4M12 16V7M16 16v-7"/></svg>',
  image: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-7 7"/></svg>',
  gear: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-3v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H5v-3h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L8.5 6l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V4.5h3v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v3h-.2a1.7 1.7 0 0 0-1.6 1Z"/></svg>',
  trash: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 4h4M9 7v12M15 7v12M6 7l1 13h10l1-13"/></svg>',
  phone: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5c0 8 7 15 15 15l0-3.5-4-1.5-2 2c-2.5-1.3-4.7-3.5-6-6l2-2-1.5-4L4 5Z"/></svg>',
  pin: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21c4-4.5 7-8 7-11a7 7 0 0 0-14 0c0 3 3 6.5 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  chat: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5Z"/></svg>',
  star: '<svg class="icon icon--star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L12 3Z"/></svg>'
};

// Escapa texto para injeção segura em HTML (campos editados no painel).
function esc(value = '') {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(word => word[0] || '').join('').toUpperCase() || 'RA';
}

function plainAddress(value = '') {
  return String(value)
    .replace(/<br\s*\/?>/gi, ', ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function appBasePath() {
  const segments = location.pathname.split('/').filter(Boolean);
  return segments.length > 1 ? `/${segments[0]}` : '';
}

function stripBasePath(pathname = location.pathname) {
  const base = appBasePath();
  const safePath = pathname || '/';
  if (!base || base === '/') return safePath;
  if (safePath.startsWith(`${base}/`)) return safePath.slice(base.length) || '/';
  if (safePath === base) return '/';
  return safePath;
}

function normalizeRouteHref(href = '.') {
  if (!href || href === '/' || href === './') return '.';
  if (/^(https?:|mailto:|tel:|#|\?)/i.test(href)) return href;
  const cleaned = String(href).replace(/^\/+/, '');
  return cleaned ? `./${cleaned}` : '.';
}

function normalizePageLinks(root = app) {
  if (!root) return;
  root.querySelectorAll('[data-route],[href^="/"],[src^="/"]').forEach(el => {
    const attr = el.hasAttribute('href') ? 'href' : el.hasAttribute('src') ? 'src' : null;
    if (!attr) return;
    const value = el.getAttribute(attr);
    if (!value) return;
    el.setAttribute(attr, normalizeRouteHref(value));
  });
}

// Gera um slug de URL a partir de um texto (título de artigo). Remove
// acentos e pontuação, mantém só letras/números separados por hífen.
function slugify(text) {
  return String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
// Anexa a cada artigo um slug estável (desempata títulos repetidos com o
// índice) — usada tanto para montar os links quanto para resolver a rota
// /conteudos/<slug> de volta ao artigo correspondente.
function articlesWithSlugs(articles) {
  const seen = {};
  return articles.map((article, index) => {
    const base = slugify(article.title) || `artigo-${index}`;
    let slug = base;
    if (seen[base]) { seen[base]++; slug = `${base}-${index}`; } else { seen[base] = 1; }
    return { ...article, index, slug };
  });
}

// Alternância de tema visual (site público). Mesma marca, três camadas de
// apresentação: "current" (padrão), "tech" (mais tecnológica) e "classic"
// (institucional tradicional). Persistido em localStorage como o restante
// do conteúdo (ver services/store.js). O botão CICLA entre as três a cada
// clique, em vez de alternar em binário.
const THEME_KEY = 'result:theme';
const THEME_ORDER = ['current', 'tech', 'classic'];
const THEME_LABELS = { current: 'Atual', tech: 'Tech', classic: 'Clássico' };
function getTheme() {
  try { const v = localStorage.getItem(THEME_KEY); return THEME_ORDER.includes(v) ? v : 'current'; } catch { return 'current'; }
}
function setTheme(theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* localStorage indisponível */ }
}
function themeToggle() {
  const theme = getTheme();
  const dots = THEME_ORDER.map(t => `<span class="theme-toggle__dot${t === theme ? ' is-active' : ''}"></span>`).join('');
  return `<button type="button" class="theme-toggle" data-theme-toggle aria-label="Versão exibida: ${THEME_LABELS[theme]}. Clique para ver a próxima versão."><span class="theme-toggle__dots">${dots}</span><span class="theme-toggle__label">${THEME_LABELS[theme]}</span></button>`;
}

// Anima um número (ex.: métricas institucionais) contando até o valor alvo
// quando o elemento entra em viewport. Usado só pelo Modo Tech.
function animateCountUp(el) {
  const target = Number(el.dataset.countupTarget);
  if (!Number.isFinite(target)) return;
  const suffix = el.dataset.countupSuffix || '';
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = target + suffix; return; }
  const duration = 900;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * progress) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Componentes exclusivos do Modo Tech (home()/proofSection()). Reaproveitam
// os mesmos dados de getContent() — só muda a composição visual, nunca o
// conteúdo, para manter as duas versões consistentes.
function visiblePartners(c) {
  const list = (c.partners || []).filter(partner => partner.visible && partner.name.trim());
  return list.length ? list : [{ name: 'Seguradora parceira' }, { name: 'Seguradora parceira' }];
}
function proofMetrics(p) {
  const items = p.metrics.map(m => {
    const match = String(m.value).match(/^(\d+)(.*)$/);
    if (match) return `<div class="proof-metric"><strong data-countup-target="${match[1]}" data-countup-suffix="${esc(match[2])}">0${esc(match[2])}</strong><span>${esc(m.label)}</span></div>`;
    return `<div class="proof-metric"><strong>${esc(m.value)}</strong><span>${esc(m.label)}</span></div>`;
  }).join('');
  return `<div class="proof-metrics-nova reveal">${items}</div>`;
}
function proofBento(c, p) {
  const leaderMark = c.images.leader ? `<span class="leader-mark leader-mark--photo"><img src="${c.images.leader}" alt="Foto de ${esc(p.leaderName)}" /></span>` : `<span class="leader-mark">${esc(initials(p.leaderName))}</span>`;
  const partnerPlates = visiblePartners(c).map(partner => `<span>${esc(partner.name)}</span>`).join('');
  const visibleTestimonials = (c.testimonials || []).filter(t => t.visible && t.quote.trim());
  const testimonialSource = visibleTestimonials.length ? visibleTestimonials : [{ quote: p.quote, author: '' }];
  const testimonialCells = testimonialSource.map((t, i) => `<article class="bento-cell bento-cell--testimonial${i === 0 ? ' bento-cell--feature' : ''} reveal"><span class="testimonial-card__mark" aria-hidden="true">“</span><blockquote>${esc(t.quote)}</blockquote>${t.author ? `<cite class="testimonial-card__author">${esc(t.author)}</cite>` : ''}</article>`).join('');
  return `<div class="bento-grid" aria-label="Depoimentos e parcerias"><article class="bento-cell bento-cell--leader reveal">${leaderMark}<div><span class="eyebrow">${esc(p.leaderRole)}</span><h3>${esc(p.leaderName)}</h3><p>${esc(p.leaderBio)}</p></div></article><article class="bento-cell bento-cell--partners reveal"><span class="eyebrow">Parcerias</span><h3>Presença que reforça legitimidade.</h3><div class="partner-plates">${partnerPlates}</div><small>Marcas serão inseridas após aprovação das parceiras.</small></article>${testimonialCells}</div>`;
}

// Arquitetura de página do Modo Tech: cabeçalho mínimo + overlay de menu em
// tela cheia + rodapé enxuto substituem header()/footer() em TODAS as
// páginas públicas (não só a home). Nenhum elemento aqui simula software —
// sem ticker, sem marquee, sem cartão com "dots" de janela — só tipografia,
// geometria abstrata e os dados reais de getContent().
function techHeader() {
  const route = currentRoute();
  const link = (href, group, label) => `<a href="/${href}" data-route class="${navGroups[group].includes(route) ? 'is-active' : ''}"${navGroups[group].includes(route) ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<header class="tech-header"><div class="container tech-header__inner">${logo()}<button class="menu-button" aria-label="Abrir menu" aria-expanded="false"><svg class="icon" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button><nav class="nav-links tech-nav" aria-label="Navegação principal">${link('quem-somos', 'quem-somos', 'Empresa')}${link('servicos', 'servicos', 'Serviços')}${link('seguro-fianca', 'seguro-fianca', 'Seguro Fiança')}${link('conteudos', 'conteudos', 'Conteúdos')}<a href="/contato" data-route class="btn btn--primary">Fale com a Result</a></nav></div></header>`;
}
function consoleFooter() {
  const s = getContent().settings;
  return `<footer class="console-footer"><div class="console-footer__brand">${logo()}<span>Regulação de sinistros especializada em Seguro Fiança.</span></div><div class="console-footer__links"><a data-route href="/contato">Fale com a Result</a><a data-route href="/politica-de-privacidade">Privacidade</a><a data-route href="/termos">Termos</a><a data-route href="/admin">Painel (demo)</a><a href="#top">Voltar ao topo ↑</a></div><span class="console-footer__meta">© ${new Date().getFullYear()} Result · ${esc(s.phone)}</span></footer>`;
}
function wrapTech(bodyHtml) {
  return `<div class="tech-shell">${techHeader()}<main id="main-content">${bodyHtml}</main>${consoleFooter()}</div>`;
}
function heroTech(h) {
  return `<section class="hero hero--nova" id="top"><div class="container hero-nova"><span class="eyebrow reveal">${esc(h.heroEyebrow)}</span><h1 class="hero-title hero-title--xl reveal">${h.heroTitle}</h1><p class="hero-copy reveal">${esc(h.heroCopy)}</p><div class="hero-actions reveal"><a class="btn btn--dark" href="/para-seguradoras" data-route>${esc(h.heroPrimaryLabel)} ${icons.arrow}</a><a class="btn btn--ghost" href="/contato" data-route>${esc(h.heroSecondaryLabel)}</a></div><p class="hero-nova__tag reveal"><span class="dot"></span>${esc(h.heroCardItem)}</p></div></section>`;
}
function pipelineSection(h, services, steps) {
  return `<section class="section pipeline-section"><div class="container"><div class="pipeline"><div class="pipeline__stage reveal"><div class="pipeline__node">01</div><div class="pipeline__body"><span class="eyebrow">O que entregamos</span><h2 class="display">Uma operação que dá visibilidade a cada etapa.</h2><p class="copy">${esc(h.servicesIntro)}</p><div class="carousel">${services}</div></div></div><div class="pipeline__stage reveal"><div class="pipeline__node">02</div><div class="pipeline__body"><span class="eyebrow">Método Result</span><h2 class="display">Um fluxo claro de acompanhar.</h2><p class="copy">Método não é burocracia. É o que permite que todos saibam onde estão, o que acontece agora e qual é o próximo passo.</p><div class="timeline">${steps}</div></div></div></div></div></section>`;
}

// Arquitetura do Modo Clássico: institucional tradicional (serifada,
// simétrica, seções numeradas em algarismos romanos, tom "casa
// estabelecida"), inspirado em escritórios de advocacia e seguradoras
// tradicionais. Header/footer próprios aplicados a TODAS as páginas
// públicas via wrapClassic(), igual ao padrão já usado pelo Modo Tech.
function classicHeader() {
  const route = currentRoute();
  const link = (href, group, label) => `<a href="/${href}" data-route class="${navGroups[group].includes(route) ? 'is-active' : ''}"${navGroups[group].includes(route) ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<header class="classic-header"><div class="container classic-header__inner">${logo()}<button class="menu-button" aria-label="Abrir menu" aria-expanded="false"><svg class="icon" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button><nav class="nav-links classic-nav" aria-label="Navegação principal">${link('quem-somos', 'quem-somos', 'Empresa')}${link('servicos', 'servicos', 'Serviços')}${link('seguro-fianca', 'seguro-fianca', 'Seguro Fiança')}${link('conteudos', 'conteudos', 'Conteúdos')}<a href="/contato" data-route class="btn btn--classic-primary">Fale com a Result</a></nav></div></header>`;
}
function classicFooter() {
  const s = getContent().settings;
  return `<footer class="classic-footer"><div class="container"><div class="classic-footer__grid"><div class="classic-footer__brand">${logo()}<p>Regulação de sinistros especializada em Seguro Fiança. Critério técnico e cuidado em cada relação.</p></div><div class="classic-footer__col"><h3>Institucional</h3><a data-route href="/quem-somos">Quem somos</a><a data-route href="/nossa-historia">Nossa história</a><a data-route href="/como-atuamos">Como atuamos</a><a data-route href="/servicos">Serviços</a></div><div class="classic-footer__col"><h3>Para o mercado</h3><a data-route href="/para-seguradoras">Seguradoras</a><a data-route href="/para-imobiliarias">Imobiliárias</a><a data-route href="/para-corretores">Corretores</a><a data-route href="/trabalhe-conosco">Trabalhe conosco</a></div><div class="classic-footer__col"><h3>Contato</h3><p>${s.address}</p><a href="tel:+${esc(s.phoneHref)}">${esc(s.phone)}</a>${s.whatsapp ? `<a href="https://wa.me/${esc(s.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a>` : ''}<a data-route href="/politica-de-privacidade">Privacidade</a><a data-route href="/termos">Termos de uso</a><a data-route href="/admin">Área administrativa (demo)</a></div></div><div class="classic-footer__bottom"><span>© ${new Date().getFullYear()} Result Reguladora de Sinistros.</span><a href="#top">Voltar ao topo ↑</a></div></div></footer>`;
}
function wrapClassic(bodyHtml) {
  return `<div class="classic-shell">${classicHeader()}<main id="main-content">${bodyHtml}</main>${classicFooter()}</div>`;
}
function wrapByTheme(body) {
  const theme = getTheme();
  if (theme === 'tech') return wrapTech(body);
  if (theme === 'classic') return wrapClassic(body);
  return `${header()}<main id="main-content">${body}</main>${footer()}`;
}
function heroClassic(h) {
  return `<section class="classic-hero" id="top"><span class="classic-hero__bg" aria-hidden="true">Result</span><div class="container classic-hero__inner reveal"><span class="classic-eyebrow">${esc(h.heroEyebrow)}</span><h1 class="classic-hero__title">${h.heroTitle}</h1><p class="classic-hero__copy">${esc(h.heroCopy)}</p><div class="classic-hero__actions"><a class="btn btn--classic-primary" href="/para-seguradoras" data-route>${esc(h.heroPrimaryLabel)}</a><a class="btn btn--classic-ghost" href="/contato" data-route>${esc(h.heroSecondaryLabel)}</a></div></div></section>`;
}
function classicSectionHead(numeral, eyebrow, title) {
  return `<div class="classic-section__head"><span class="classic-section__num">${numeral}</span><span class="classic-eyebrow">${esc(eyebrow)}</span><h2 class="classic-section__title">${title}</h2></div>`;
}
function classicList(items) {
  return `<div class="classic-list">${items.map(item => `<div class="classic-list-item"><span class="classic-list-item__num">${esc(item.num)}</span><div><h3>${esc(item.title)}</h3>${item.text ? `<p>${esc(item.text)}</p>` : ''}</div></div>`).join('')}</div>`;
}
function classicProof(c, p) {
  const partners = visiblePartners(c).map(x => esc(x.name)).join(' · ');
  const visibleTestimonials = (c.testimonials || []).filter(t => t.visible && t.quote.trim());
  const testimonialSource = visibleTestimonials.length ? visibleTestimonials : [{ quote: p.quote, author: '' }];
  const quotes = testimonialSource.map(t => `<figure class="classic-quote reveal"><blockquote>“${esc(t.quote)}”</blockquote>${t.author ? `<figcaption>${esc(t.author)}</figcaption>` : ''}</figure>`).join('');
  const metrics = p.metrics.map(m => {
    const match = String(m.value).match(/^(\d+)(.*)$/);
    if (match) return `<div class="classic-metric"><strong data-countup-target="${match[1]}" data-countup-suffix="${esc(match[2])}">0${esc(match[2])}</strong><span>${esc(m.label)}</span></div>`;
    return `<div class="classic-metric"><strong>${esc(m.value)}</strong><span>${esc(m.label)}</span></div>`;
  }).join('');
  const leaderMark = c.images.leader ? `<span class="leader-mark leader-mark--photo"><img src="${c.images.leader}" alt="Foto de ${esc(p.leaderName)}" /></span>` : `<span class="leader-mark">${esc(initials(p.leaderName))}</span>`;
  return `<div class="classic-metrics reveal">${metrics}</div><div class="classic-quotes">${quotes}</div><div class="classic-leader reveal">${leaderMark}<div><span class="classic-eyebrow">${esc(p.leaderRole)}</span><h3>${esc(p.leaderName)}</h3><p>${esc(p.leaderBio)}</p></div></div><p class="classic-partners"><span class="classic-eyebrow">Parcerias</span><br>${partners}</p>`;
}

const pageData = {
  'quem-somos': { eyebrow: 'A Result', title: 'Rigor técnico. Escuta ativa. Relações que permanecem.', lead: 'A Result é uma empresa terceirizada de seguradoras, dedicada exclusivamente à condução de sinistros de Seguro Fiança. Atuamos com cobrança, análise documental e apoio aos pagamentos, sem perder de vista as pessoas envolvidas em cada processo.', sections: [['Um olhar especializado', 'Seguro Fiança exige repertório, contexto e uma leitura cuidadosa das relações envolvidas. Por isso, concentramos nossa operação nessa especialidade: para que cada encaminhamento seja tecnicamente sólido, claro e responsável.'], ['Duas frentes, uma experiência integrada', 'Nossa operação reúne as áreas de cobrança e análise documental para pagamento. Em ambas, trabalhamos com processos organizados, comunicação objetiva e cuidado para conduzir situações sensíveis.'], ['Princípios que orientam decisões', 'Clareza na comunicação, consistência na análise e atendimento humanizado não são etapas acessórias. São o padrão pelo qual sustentamos cada relação com seguradoras, imobiliárias, corretores e inquilinos.'], ['Nossa cultura', 'Somos uma empresa familiar e próxima. Acreditamos que resultados sustentáveis também dependem de entender contextos, respeitar histórias e oferecer apoio quando ele é necessário.']] },
  'nossa-historia': { eyebrow: 'Nossa história', title: 'Uma empresa criada para tornar a condução de sinistros mais próxima e mais clara.', lead: 'A Result nasce da convicção de que processos de Seguro Fiança podem ser conduzidos com precisão sem perder de vista as pessoas que estão em torno deles.', sections: [['O começo', 'Estruturamos nossa atuação para apoiar seguradoras na condução de sinistros de Seguro Fiança, com uma operação que combina cobrança, análise documental e apoio aos pagamentos.'], ['A escolha pela especialização', 'Escolhemos profundidade em vez de dispersão. Ao concentrar nossa experiência em Seguro Fiança, criamos uma operação preparada para compreender as particularidades de cada demanda.'], ['O que continua nos movendo', 'Acreditamos que o melhor resultado é aquele sustentado por uma análise justa, uma comunicação compreensível e relações preservadas ao longo de toda a jornada.']] },
  'como-atuamos': { eyebrow: 'Como atuamos', title: 'Método para decisões seguras. Sensibilidade para conduzir cada caso.', lead: 'Transformamos informações complexas em uma jornada organizada, transparente e fácil de acompanhar para seguradoras, imobiliárias, corretores e inquilinos.', sections: [['1. Acionamento pela seguradora', 'Recebemos a demanda e organizamos as informações iniciais para compreender o caso e seus envolvidos.'], ['2. Análise documental', 'Avaliamos documentos e particularidades do contrato para apoiar o encaminhamento e, quando aplicável, o pagamento.'], ['3. Cobrança e tratativas', 'Conduzimos a negociação com clareza, respeito e atenção ao contexto de quem está em uma situação de inadimplência.'], ['4. Conclusão e retorno', 'Encaminhamos a finalização com registro claro, orientação e suporte durante toda a jornada.']] },
  'servicos': { eyebrow: 'Serviços', title: 'Uma operação especializada nas etapas decisivas do Seguro Fiança.', lead: 'Atuamos como extensão operacional das seguradoras, dando consistência à cobrança, à análise documental e aos processos de pagamento.', sections: [['Cobrança especializada', 'Condução de tratativas de inadimplência com responsabilidade, clareza e atenção ao contexto de cada inquilino.'], ['Análise documental e pagamento', 'Avaliação organizada da documentação necessária para apoiar a regulação e os processos de pagamento.'], ['Atendimento aos públicos envolvidos', 'Comunicação orientada para imobiliárias, corretores e inquilinos, sem perder unidade, histórico ou qualidade de informação.'], ['Acompanhamento operacional', 'Registros e retornos que dão visibilidade à seguradora e previsibilidade ao processo.']] },
  'seguro-fianca': { eyebrow: 'Seguro Fiança', title: 'A especialidade que orienta cada detalhe da nossa operação.', lead: 'Conhecimento de produto não é apenas domínio de processos. É entender o impacto de cada decisão para seguradoras, imobiliárias, corretores e inquilinos.', sections: [['Complexidade com clareza', 'O Seguro Fiança conecta interesses legítimos de diferentes públicos. Nosso papel é conduzir essa jornada com informação precisa, linguagem acessível e decisões bem fundamentadas.'], ['Especialização aplicada', 'Do recebimento à conclusão, nossa equipe atua com uma visão prática sobre contratos, documentação, negociação e relacionamento.'], ['Uma experiência mais confiável', 'Quando o processo é claro e o atendimento é respeitoso, a operação ganha previsibilidade. É essa experiência que buscamos entregar em cada contato.']] },
  'para-seguradoras': { eyebrow: 'Para seguradoras', title: 'Uma extensão técnica, cuidadosa e transparente da sua operação.', lead: 'A Result apoia seguradoras que buscam uma regulação especializada em Seguro Fiança, sem abrir mão de visibilidade, método e qualidade de relacionamento.', sections: [['Governança de ponta a ponta', 'Fluxos claros, registros consistentes e comunicação que facilita o acompanhamento do processo e a tomada de decisão.'], ['Especialização que reduz ruído', 'Nossa concentração em Seguro Fiança torna a leitura dos casos mais contextualizada e os encaminhamentos mais precisos.'], ['Marca preservada em cada contato', 'O atendimento humanizado representa também a experiência da seguradora. Por isso, cada interação é conduzida com respeito e clareza.']] },
  'para-imobiliarias': { eyebrow: 'Para imobiliárias', title: 'Um processo que respeita a relação construída com cada locação.', lead: 'Apoiamos imobiliárias com comunicação objetiva e uma condução organizada de situações que exigem atenção e segurança.', sections: [['Informação compreensível', 'Explicamos caminhos, documentos e próximos passos sem burocratizar a conversa.'], ['Acompanhamento próximo', 'Cada caso recebe atenção individual, com retornos consistentes durante toda a jornada.'], ['Relações preservadas', 'Acreditamos que uma condução respeitosa também contribui para a continuidade de boas relações no mercado imobiliário.']] },
  'para-corretores': { eyebrow: 'Para corretores', title: 'Parceiros bem informados fortalecem a jornada de todos.', lead: 'Corretores são parte essencial da cadeia do Seguro Fiança. Por isso, oferecemos uma experiência de atendimento clara, orientada e respeitosa.', sections: [['Orientação sem ruído', 'Ajudamos a tornar cada etapa mais compreensível para você e seus clientes.'], ['Retornos estruturados', 'Informações objetivas ajudam a reduzir incertezas e facilitam o acompanhamento.'], ['Relação de longo prazo', 'Nossa atuação é pautada por diálogo profissional e cuidado com a experiência de quem confia em nosso trabalho.']] }
};

function logo() { return `<a class="logo" href="${normalizeRouteHref('/')}" data-route aria-label="Result Reguladora de Sinistros — início"><img src="./resultlogo.png" alt="Result Reguladora de Sinistros" /></a>`; }
const navGroups = {
  'quem-somos': ['quem-somos', 'nossa-historia', 'como-atuamos'],
  'servicos': ['servicos', 'para-seguradoras', 'para-imobiliarias', 'para-corretores'],
  'seguro-fianca': ['seguro-fianca'],
  'conteudos': ['conteudos']
};

function currentRoute() {
  const raw = stripBasePath(location.pathname).replace(/^\/+|\/+$/g, '').replace(/^[A-Za-z]:\/?/, '');
  return !raw || raw.endsWith('index.html') ? 'home' : raw.split('/')[0];
}

function header() { const route = currentRoute(); const link = (href, group, label) => `<a href="${normalizeRouteHref(href)}" data-route${navGroups[group].includes(route) ? ' class="is-active" aria-current="page"' : ''}>${label}</a>`; return `<header class="site-header"><div class="container nav">${logo()}<button class="menu-button" aria-label="Abrir menu" aria-expanded="false"><svg class="icon" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button><nav class="nav-links" aria-label="Navegação principal">${link('quem-somos','quem-somos','Empresa')}${link('servicos','servicos','Serviços')}${link('seguro-fianca','seguro-fianca','Seguro Fiança')}${link('conteudos','conteudos','Conteúdos')}<a href="${normalizeRouteHref('contato')}" data-route class="btn btn--primary">Fale com a Result ${icons.arrow}</a></nav></div></header>`; }
function footer() { const s = getContent().settings; return `<footer class="site-footer"><div class="container"><div class="footer-grid"><div class="footer-brand">${logo()}<p>Regulação de sinistros especializada em Seguro Fiança. Critério técnico e cuidado em cada relação.</p></div><div class="footer-col"><h3>Institucional</h3><a data-route href="${normalizeRouteHref('quem-somos')}">Quem somos</a><a data-route href="${normalizeRouteHref('nossa-historia')}">Nossa história</a><a data-route href="${normalizeRouteHref('como-atuamos')}">Como atuamos</a><a data-route href="${normalizeRouteHref('servicos')}">Serviços</a></div><div class="footer-col"><h3>Para o mercado</h3><a data-route href="${normalizeRouteHref('para-seguradoras')}">Seguradoras</a><a data-route href="${normalizeRouteHref('para-imobiliarias')}">Imobiliárias</a><a data-route href="${normalizeRouteHref('para-corretores')}">Corretores</a><a data-route href="${normalizeRouteHref('trabalhe-conosco')}">Trabalhe conosco</a></div><div class="footer-col"><h3>Contato</h3><p>${s.address}</p><a href="tel:+${esc(s.phoneHref)}">${esc(s.phone)}</a>${s.whatsapp ? `<a href="https://wa.me/${esc(s.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a>` : ''}<a data-route href="${normalizeRouteHref('politica-de-privacidade')}">Privacidade</a><a data-route href="${normalizeRouteHref('termos')}">Termos de uso</a><a data-route href="${normalizeRouteHref('admin')}">Área administrativa (demo)</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Result Reguladora de Sinistros.</span><a href="#top">Voltar ao topo ↑</a></div></div></footer>`; }

function home() {
  const c = getContent();
  const h = c.home;
  const theme = getTheme();
  const artImage = c.images.institutional ? `<img class="art-photo" src="${c.images.institutional}" alt="Imagem institucional Result" />` : '';
  const services = h.services.map(card => `<article class="service-card reveal"><span class="service-card__number">${esc(card.number)}</span><h3>${esc(card.title)}</h3><p>${esc(card.text)}</p><span class="arrow">↗</span></article>`).join('');
  const steps = h.steps.map((step, i) => `<div class="step reveal"><div class="step__num">0${i + 1}</div><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></div>`).join('');
  const insights = articlesWithSlugs(c.articles).filter(a => a.status === 'Publicado');
  const featured = insights.find(a => a.featured) || insights[0];
  const secondary = insights.filter(a => a.slug !== featured?.slug).slice(0, 2);
  const featuredBlock = featured
    ? `<a class="insight-large" href="/conteudos/${featured.slug}" data-route><span>Em destaque · ${esc(featured.category)}</span><h3>${esc(featured.title)}</h3></a>`
    : `<article class="insight-large"><span>Em destaque</span><h3>Novos conteúdos em breve.</h3></article>`;
  const insightList = secondary.length
    ? secondary.map(a => `<a class="insight-item" href="/conteudos/${a.slug}" data-route><span class="insight-date">${esc(a.date)}</span><h3>${esc(a.title)}</h3></a>`).join('')
    : '<article class="insight-item"><span class="insight-date">—</span><h3>Novos conteúdos em breve.</h3></article>';
  const insightsSection = `<section class="section section--soft insights-section"><div class="container"><span class="eyebrow">Perspectivas</span><h2 class="display">Conhecimento para relações de seguro mais seguras.</h2><div class="insight-grid reveal">${featuredBlock}<div class="insight-list">${insightList}</div></div></div></section>`;
  const trustStrip = `<div class="container trust-strip reveal"><div class="trust-grid"><div class="trust-item"><span class="trust-no">01</span><div><strong>Especialização concentrada</strong><small>Profundidade em Seguro Fiança.</small></div></div><div class="trust-item"><span class="trust-no">02</span><div><strong>Duas áreas integradas</strong><small>Cobrança e análise documental.</small></div></div><div class="trust-item"><span class="trust-no">03</span><div><strong>Atendimento humano</strong><small>Relações tratadas com respeito.</small></div></div><div class="trust-item"><span class="trust-no">04</span><div><strong>Atuação nacional</strong><small>Uma experiência consistente onde for preciso.</small></div></div></div></div>`;

  if (theme === 'tech') {
    const introTech = `<section class="section intro-tech"><div class="container intro-tech__inner reveal"><span class="eyebrow">A Result</span><h2 class="display">${esc(h.introTitle)}</h2><p class="copy">${esc(h.introCopy)}</p>${artImage ? `<div class="intro-tech__frame">${artImage}</div>` : ''}</div></section>`;
    const body = `${heroTech(h)}${trustStrip}${introTech}${pipelineSection(h, services, steps)}${insightsSection}${proofSection(c)}<section class="cta cta--tech"><div class="container cta-inner"><div><span class="eyebrow">Vamos conversar</span><h2 class="display glitch-text">Sua operação merece uma regulação à altura das relações que protege.</h2></div><a class="btn btn--dark" data-route href="/contato">Entrar em contato ${icons.arrow}</a></div></section>`;
    return wrapTech(body);
  }

  if (theme === 'classic') {
    const serviceItems = h.services.map(s => ({ num: s.number, title: s.title, text: s.text }));
    const stepItems = h.steps.map((s, i) => ({ num: `0${i + 1}`, title: s.title, text: s.text }));
    const insightItems = [featured, ...secondary].map(a => ({ num: a.date || a.category || '—', title: a.title }));
    const body = `${heroClassic(h)}${trustStrip}
      <section class="classic-section"><div class="container classic-section__inner">${classicSectionHead('I', 'A Result', esc(h.introTitle))}<p class="classic-copy">${esc(h.introCopy)}</p>${artImage ? `<div class="classic-frame">${artImage}</div>` : ''}</div></section>
      <section class="classic-section classic-section--soft"><div class="container classic-section__inner">${classicSectionHead('II', 'O que entregamos', 'Uma operação que dá visibilidade a cada etapa.')}<p class="classic-copy">${esc(h.servicesIntro)}</p>${classicList(serviceItems)}</div></section>
      <section class="classic-section"><div class="container classic-section__inner">${classicSectionHead('III', 'Método Result', 'Um fluxo claro de acompanhar.')}${classicList(stepItems)}</div></section>
      <section class="classic-section classic-section--soft"><div class="container classic-section__inner">${classicSectionHead('IV', 'Perspectivas', 'Conhecimento para relações de seguro mais seguras.')}${classicList(insightItems)}</div></section>
      <section class="classic-section"><div class="container classic-section__inner">${classicSectionHead('V', 'Confiança', 'Estrutura para apoiar relações que não podem parar.')}${classicProof(c, c.proof)}</div></section>
      <section class="classic-cta"><div class="container classic-cta__inner"><h2>Sua operação merece uma regulação à altura das relações que protege.</h2><a class="btn btn--classic-invert" data-route href="/contato">Entrar em contato</a></div></section>`;
    return wrapClassic(body);
  }

  return `${header()}<main id="main-content"><section class="hero" id="top"><div class="container hero-grid"><div class="reveal"><span class="eyebrow">${esc(h.heroEyebrow)}</span><h1 class="hero-title">${h.heroTitle}</h1><p class="hero-copy">${esc(h.heroCopy)}</p><div class="hero-actions"><a class="btn btn--dark" href="/para-seguradoras" data-route>${esc(h.heroPrimaryLabel)} ${icons.arrow}</a><a class="btn btn--ghost" href="/contato" data-route>${esc(h.heroSecondaryLabel)}</a></div></div><aside class="hero-card reveal" aria-label="Compromisso Result"><span class="hero-card__kicker">Nosso compromisso</span><h2>Decisões bem conduzidas começam por uma escuta cuidadosa.</h2><p>Em cada processo, técnica e proximidade trabalham juntas para construir clareza.</p><div class="hero-card__rule"></div><div class="hero-card__item"><span class="dot"></span> ${esc(h.heroCardItem)}</div></aside></div><div class="hero-scroll"><i></i> role para explorar</div></section>${trustStrip}<section class="section"><div class="container split"><div class="art-panel reveal" aria-label="Representação da precisão e proximidade Result">${artImage}<div class="art-caption"><b>Processos com contexto.</b>Porque cada sinistro envolve muito mais do que documentação.</div></div><div class="reveal"><span class="eyebrow">A Result</span><h2 class="display">${esc(h.introTitle)}</h2><p class="copy">${esc(h.introCopy)}</p></div></div></section><section class="section dark-section"><div class="container"><div class="reveal"><span class="eyebrow">O que entregamos</span><h2 class="display">Uma operação que dá visibilidade a cada etapa.</h2><p class="copy">${esc(h.servicesIntro)}</p></div><div class="cards">${services}</div></div></section><section class="section"><div class="container"><div class="process-head reveal"><div><span class="eyebrow">Método Result</span><h2 class="display">Um fluxo claro de acompanhar.</h2></div><p class="copy">Método não é burocracia. É o que permite que todos saibam onde estão, o que acontece agora e qual é o próximo passo.</p></div><div class="timeline">${steps}</div></div></section>${insightsSection}${proofSection(c)}<section class="cta"><div class="container cta-inner"><div><span class="eyebrow">Vamos conversar</span><h2 class="display">Sua operação merece uma regulação à altura das relações que protege.</h2></div><a class="btn btn--dark" data-route href="/contato">Entrar em contato ${icons.arrow}</a></div></section></main>${footer()}`;
}

function proofSection(c) {
  const p = c.proof;
  if (getTheme() === 'tech') {
    return `<section class="section proof-section proof-section--tech"><div class="container"><div class="proof-intro reveal"><span class="eyebrow">Confiança que se constrói no processo</span><h2 class="display">Estrutura para apoiar relações que não podem parar.</h2><p class="copy">A Result combina uma operação especializada, presença nacional e uma cultura de atendimento próxima.</p></div>${proofMetrics(p)}${proofBento(c, p)}</div></section>`;
  }
  const metrics = p.metrics.map(m => `<article><strong>${esc(m.value)}</strong><span>${esc(m.label)}</span></article>`).join('');
  const leaderMark = c.images.leader ? `<span class="leader-mark leader-mark--photo"><img src="${c.images.leader}" alt="Foto de ${esc(p.leaderName)}" /></span>` : `<span class="leader-mark">${esc(initials(p.leaderName))}</span>`;
  const partnerPlates = visiblePartners(c).map(partner => `<span>${esc(partner.name)}</span>`).join('');
  const visibleTestimonials = (c.testimonials || []).filter(t => t.visible && t.quote.trim());
  const testimonialSource = visibleTestimonials.length ? visibleTestimonials : [{ quote: p.quote, author: '' }];
  const testimonialCards = testimonialSource.map(t => `<article class="testimonial-card reveal"><span class="testimonial-card__mark" aria-hidden="true">“</span><blockquote>${esc(t.quote)}</blockquote>${t.author ? `<cite class="testimonial-card__author">${esc(t.author)}</cite>` : ''}</article>`).join('');
  const testimonialsBlock = `<div class="proof-testimonials-head reveal"><span class="eyebrow">Experiência</span><h3 class="display">O que dizem sobre a Result</h3></div><div class="proof-testimonials reveal" aria-label="Depoimentos">${testimonialCards}</div>`;
  return `<section class="section section--soft proof-section"><div class="container"><div class="proof-intro reveal"><span class="eyebrow">Confiança que se constrói no processo</span><h2 class="display">Estrutura para apoiar relações que não podem parar.</h2><p class="copy">A Result combina uma operação especializada, presença nacional e uma cultura de atendimento próxima. Os indicadores abaixo são apresentados como modelo de acompanhamento para esta demonstração.</p></div><div class="proof-metrics reveal" aria-label="Indicadores institucionais demonstrativos">${metrics}</div><div class="proof-grid"><section class="proof-card reveal"><span class="eyebrow">Parcerias</span><h3>Uma presença que reforça legitimidade.</h3><p>Espaço preparado para apresentar seguradoras parceiras após autorização formal de uso de marca.</p><div class="partner-plates">${partnerPlates}</div><small>Marcas serão inseridas após aprovação das parceiras.</small></section><article class="proof-card leader-card leader-card--panel reveal">${leaderMark}<div><span class="eyebrow">${esc(p.leaderRole)}</span><h3>${esc(p.leaderName)}</h3><p>${esc(p.leaderBio)}</p></div></article></div>${testimonialsBlock}</div></section>`;
}

function interior(slug) { const data = pageData[slug]; if (!data) return notFound(); const sections = data.sections.map(([title,text]) => `<section id="${title.toLowerCase().replaceAll(' ','-').replaceAll('.','')}"><h2>${title}</h2><p>${text}</p></section>`).join(''); const body = `<header class="page-hero"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a data-route href="/">Início</a><span>/</span><span>${data.eyebrow}</span></nav><span class="eyebrow">${data.eyebrow}</span><h1 class="display">${data.title}</h1><p class="copy">${data.lead}</p></div></header><section class="section"><div class="container content-grid"><article class="article reveal">${sections}</article><aside class="side-nav"><strong>Nesta página</strong>${data.sections.map(([title])=>`<a href="#${title.toLowerCase().replaceAll(' ','-').replaceAll('.','')}">${title}</a>`).join('')}</aside></div></section><section class="cta"><div class="container cta-inner"><div><span class="eyebrow">Atendimento Result</span><h2 class="display">Conheça uma regulação feita para dar segurança ao mercado.</h2></div><a class="btn btn--dark" data-route href="/contato">Fale conosco ${icons.arrow}</a></div></section>`; return wrapByTheme(body); }

function contactPage(type = 'Contato geral') {
  const meta = {
    'Contato geral': { icon: icons.chat, hint: 'Dúvidas e informações institucionais', subtitle: 'Conte com quem entende de regulação de sinistros. Retornamos em até um dia útil.' },
    'Trabalhe conosco': { icon: icons.users, hint: 'Faça parte da equipe Result', subtitle: 'Envie seu currículo e conte um pouco sobre você. Vamos adorar conhecer seu trabalho.' },
    'SAC': { icon: icons.inbox, hint: 'Atendimento ao cliente', subtitle: 'Registre sua solicitação ou acompanhe um atendimento em andamento.' },
    'Sugestões': { icon: icons.file, hint: 'Elogios, críticas e ideias', subtitle: 'Sua opinião ajuda a Result a melhorar. Fale abertamente com a gente.' },
    'Parcerias': { icon: icons.grid, hint: 'Propostas e negócios', subtitle: 'Seguradoras, imobiliárias e corretores: vamos construir uma parceria de valor.' }
  };
  const options = Object.keys(meta);
  const { settings } = getContent();
  const mapsAddress = plainAddress(settings.address);
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsAddress)}`;
  const active = meta[type] || meta['Contato geral'];
  let fields = '';
  if (type === 'Trabalhe conosco') {
    fields = '<div class="admin-form__grid"><div class="field"><label for="name">Nome</label><input id="name" required placeholder="Seu nome" /></div><div class="field"><label for="linkedin">LinkedIn</label><input id="linkedin" type="url" required placeholder="https://www.linkedin.com/in/seu-perfil" /></div></div><div class="field"><label for="role">Área de interesse</label><select id="role" required><option value="">Selecione uma área</option><option>Regulação de sinistros</option><option>Atendimento</option><option>Operações</option></select></div><label class="upload-box" for="resume">Clique para selecionar seu currículo (simulação)<input id="resume" type="file" accept=".pdf,.doc,.docx" required></label>';
  } else if (type === 'SAC' || type === 'Sugestões') {
    fields = '<div class="admin-form__grid"><div class="field"><label for="name">Nome</label><input id="name" required placeholder="Seu nome" /></div><div class="field"><label for="email">E-mail</label><input id="email" type="email" required placeholder="nome@empresa.com" /></div></div><div class="field"><label for="message">Como podemos ajudar?</label><textarea id="message" required placeholder="Descreva brevemente sua necessidade"></textarea></div>';
  } else {
    fields = '<div class="admin-form__grid"><div class="field"><label for="name">Nome</label><input id="name" required placeholder="Seu nome" /></div><div class="field"><label for="email">E-mail</label><input id="email" type="email" required placeholder="nome@empresa.com" /></div></div><div class="field"><label for="company">Empresa</label><input id="company" placeholder="Nome da empresa" /></div><div class="field"><label for="message">Como podemos ajudar?</label><textarea id="message" required placeholder="Descreva brevemente sua necessidade"></textarea></div>';
  }
  const whatsapp = settings.whatsapp
    ? `<a class="contact-aside__row" href="https://wa.me/${esc(settings.whatsapp)}" target="_blank" rel="noopener"><span class="contact-aside__ico">${icons.chat}</span><span><strong>WhatsApp</strong><small>Atendimento rápido</small></span></a>`
    : '';
  const body = `<header class="page-hero"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a data-route href="/">Início</a><span>/</span><span>Contato</span></nav><span class="eyebrow">Fale com a Result</span><h1 class="display">Toda boa relação começa por uma conversa clara.</h1><p class="copy">Escolha o assunto para que sua mensagem siga o caminho mais adequado. Nesta demonstração, os envios são simulados.</p></div></header><section class="section"><div class="container form-shell"><aside class="form-side"><div class="form-tabs" role="tablist" aria-label="Tipo de atendimento">${options.map(option=>`<button class="form-tab ${option === type ? 'is-active':''}" role="tab" aria-selected="${option === type}" data-contact-type="${option}"><span class="form-tab__ico">${meta[option].icon}</span><span class="form-tab__text"><strong>${option}</strong><small>${meta[option].hint}</small></span></button>`).join('')}</div><div class="contact-aside"><h3 class="contact-aside__title">Canais diretos</h3><a class="contact-aside__row" href="tel:+${esc(settings.phoneHref)}"><span class="contact-aside__ico">${icons.phone}</span><span><strong>${esc(settings.phone)}</strong><small>Seg. a sex., 9h às 18h</small></span></a>${whatsapp}<a class="contact-aside__row" href="${mapsHref}" target="_blank" rel="noopener" aria-label="Abrir endereço do escritório no Google Maps"><span class="contact-aside__ico">${icons.pin}</span><span><strong>Escritório</strong><small>${settings.address}</small></span></a></div></aside><form id="contact-form"><header class="form-head"><h2 class="form-title">${type}</h2><p class="form-subtitle">${active.subtitle}</p></header>${fields}<button class="btn btn--primary" type="submit">Enviar mensagem ${icons.arrow}</button><p class="form-note">Ao enviar, você concorda com nossa Política de Privacidade. Nenhuma informação será enviada nesta demonstração.</p></form></div></section>`;
  return wrapByTheme(body);
}

function blog() {
  const published = articlesWithSlugs(getContent().articles).filter(a => a.status === 'Publicado');
  const cards = published.map((a, i) => i === 0
    ? `<a class="insight-large reveal" href="/conteudos/${a.slug}" data-route><span>${esc(a.category)} · ${esc(a.date)}</span><h3>${esc(a.title)}</h3></a>`
    : `<a class="insight-item reveal" href="/conteudos/${a.slug}" data-route><span class="insight-date">${esc(a.date)}</span><h3>${esc(a.title)}</h3></a>`
  ).join('') || '<p class="insight-empty">Novos conteúdos em breve.</p>';
  const body = `<header class="page-hero"><div class="container"><span class="eyebrow">Conteúdos Result</span><h1 class="display">Perspectivas para um mercado de seguros mais informado.</h1><p class="copy">Análises e conteúdos institucionais sobre Seguro Fiança, regulação e experiência em jornadas de sinistro.</p></div></header><section class="section"><div class="container"><div class="insight-grid">${cards}</div></div></section>`;
  return wrapByTheme(body);
}
function articlePage(slug) {
  const c = getContent();
  const withSlugs = articlesWithSlugs(c.articles);
  const found = withSlugs.find(a => a.slug === slug && a.status === 'Publicado');
  if (!found) return notFound();
  const publishedOthers = withSlugs.filter(a => a.slug !== slug && a.status === 'Publicado');
  const featuredOther = publishedOthers.find(a => a.featured);
  const others = (featuredOther ? [featuredOther] : []).concat(publishedOthers.filter(a => a.slug !== featuredOther?.slug)).slice(0, 4);
  const paragraphs = String(found.content || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('') || (found.summary ? `<p>${esc(found.summary)}</p>` : '');
  const othersList = others.length
    ? others.map(a => `<a class="article-aside__item${a.featured ? ' is-featured' : ''}" href="/conteudos/${a.slug}" data-route>${a.featured ? `<span class="article-aside__star">${icons.star} Destaque</span>` : ''}<span class="article-aside__date">${esc(a.date)}</span><h3>${esc(a.title)}</h3>${a.summary ? `<p>${esc(a.summary)}</p>` : ''}</a>`).join('')
    : '<p class="article-aside__empty">Novos conteúdos em breve.</p>';
  const body = `<header class="page-hero"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a data-route href="/">Início</a><span>/</span><a data-route href="/conteudos">Conteúdos</a><span>/</span><span>${esc(found.category)}</span></nav><span class="eyebrow">${esc(found.category)} · ${esc(found.date)}</span><h1 class="display">${esc(found.title)}</h1>${found.summary ? `<p class="copy">${esc(found.summary)}</p>` : ''}</div></header><section class="section"><div class="container content-grid"><article class="article article--post reveal">${paragraphs}</article><aside class="side-nav article-aside"><div class="article-aside__head"><strong>Outros artigos</strong><a class="article-aside__all" href="/conteudos" data-route>Ver todos</a></div>${othersList}</aside></div></section><section class="cta"><div class="container cta-inner"><div><span class="eyebrow">Atendimento Result</span><h2 class="display">Conheça uma regulação feita para dar segurança ao mercado.</h2></div><a class="btn btn--dark" data-route href="/contato">Fale conosco ${icons.arrow}</a></div></section>`;
  return wrapByTheme(body);
}
function legal(title) { const body = `<header class="page-hero"><div class="container"><span class="eyebrow">Institucional</span><h1 class="display">${title}</h1><p class="copy">Versão demonstrativa para apresentação comercial. O documento definitivo deverá ser revisado e aprovado pelas áreas responsáveis.</p></div></header><section class="section"><div class="container content-grid"><article class="article"><h2>Compromisso com transparência</h2><p>Esta página apresenta uma estrutura preparada para receber o conteúdo jurídico definitivo. A Result valoriza o tratamento responsável de dados e a clareza nas relações com todos os públicos.</p><h2>Aplicação futura</h2><p>Na versão de produção, este documento deverá conter as informações completas, data de vigência, canais de contato e demais disposições aplicáveis.</p></article></div></section>`; return wrapByTheme(body); }
function notFound() { const body = `<section class="page-hero"><div class="container"><span class="eyebrow">Erro 404</span><h1 class="display">O caminho que você procura não está disponível.</h1><p class="copy">Talvez a página tenha sido atualizada ou o endereço não exista. Vamos ajudar você a voltar ao ponto certo.</p><div class="hero-actions"><a data-route href="/" class="btn btn--dark">Voltar para o início ${icons.arrow}</a></div></div></section>`; return wrapByTheme(body); }

/* ---------- Painel administrativo (demonstração funcional com localStorage) ---------- */

function adminNav(active) { const items = [['dashboard','Visão geral','grid'],['site','Textos & imagens','image'],['artigos','Conteúdos','file'],['formularios','Formulários','inbox'],['parceiros','Parceiros','users'],['depoimentos','Depoimentos','file'],['indicadores','Indicadores','chart'],['equipe','Equipe','users'],['configuracoes','Configurações','gear']]; return `<aside class="admin-sidebar">${logo()}<nav class="admin-nav" aria-label="Navegação administrativa">${items.map(([id,label,icon])=>`<button data-admin-view="${id}" class="${active===id?'is-active':''}">${icons[icon]}<span>${label}</span></button>`).join('')}</nav><div class="admin-sidebar__bottom"><small>AMBIENTE DE DEMONSTRAÇÃO</small><button data-admin-reset>Restaurar conteúdo padrão</button><button data-admin-logout>Sair do painel</button></div></aside>`; }
function metric(label, value, change) { return `<article class="metric"><span>${label}</span><strong>${value}</strong><small>${change}</small></article>`; }

function dashboard() { const c = getContent(); const published = c.articles.filter(a=>a.status==='Publicado').length; const drafts = c.articles.length - published; return `<section class="admin-content"><div class="admin-banner">Ambiente de demonstração — todas as alterações ficam salvas apenas neste navegador (localStorage). Use “Restaurar conteúdo padrão” para reverter.</div><div class="admin-head"><div><h1>Visão geral</h1><p>Painel demonstrativo · Conteúdo editável e persistente neste navegador.</p></div><div class="admin-actions"><a class="btn btn--line" data-route href="/" target="_blank">Ver site</a><button class="btn btn--primary" data-admin-view="site">Editar site</button></div></div><div class="metric-grid">${metric('Formulários recebidos', String(c.contacts.length),'Dados de demonstração')}${metric('Artigos publicados', String(published), drafts?`${drafts} em rascunho`:'Tudo publicado')}${metric('Indicador de resolutividade', c.indicators.target,'Editável em Indicadores')}${metric('Equipe Result', c.indicators.team,'Dado institucional')}</div><div class="admin-grid"><section class="admin-card"><div class="admin-card__head"><h2>Últimos formulários</h2><button class="text-link" data-admin-view="formularios">Gerenciar</button></div>${contactTable(c.contacts.slice(0,2))}</section><section class="admin-card"><div class="admin-card__head"><h2>Conteúdo em destaque</h2><button class="text-link" data-admin-view="artigos">Editar</button></div><div class="activity"><div class="activity-item"><span class="avatar">R</span><p><strong>${esc(c.articles[0]?.title || '—')}</strong><small>${esc(c.articles[0]?.date || '')}</small></p></div></div></section><section class="admin-card"><div class="admin-card__head"><h2>Atalhos</h2></div><div class="activity"><div class="activity-item"><span class="avatar">TX</span><p><strong>Textos & imagens</strong><small>Editar home, serviços e imagens.</small></p></div><div class="activity-item"><span class="avatar">EQ</span><p><strong>Equipe</strong><small>Atualizar liderança e foto.</small></p></div></div></section></div></section>`; }
function statusClass(status) { return status === 'Novo' ? 'new' : status === 'Concluído' ? 'done' : 'progress'; }
function contactRows(data) { return data.length ? data.map(row=>`<tr><td><strong>${esc(row.person)}</strong><br><small>${esc(row.date)}</small></td><td>${esc(row.subject)}</td><td>${esc(row.type)}</td><td><span class="status status--${statusClass(row.status)}">${esc(row.status)}</span></td></tr>`).join('') : '<tr class="table-empty"><td colspan="4">Nenhum registro encontrado para os filtros selecionados.</td></tr>'; }
function contactTable(data) { return `<table class="table"><thead><tr><th>Contato</th><th>Assunto</th><th>Tipo</th><th>Status</th></tr></thead><tbody>${contactRows(data)}</tbody></table>`; }

function imageField(id, key, label, current) { const preview = current ? `<img class="upload-preview" data-image-preview="${key}" src="${current}" alt="" />` : `<span class="upload-empty" data-image-preview="${key}">Nenhuma imagem selecionada</span>`; return `<div class="field"><label for="${id}">${label}</label><label class="upload-box" for="${id}">${preview}<span class="upload-hint">Clique para selecionar uma imagem</span><input id="${id}" type="file" accept="image/*" data-image-key="${key}"></label></div>`; }

function siteView() { const c = getContent(); const h = c.home; const svc = h.services.map((card,i)=>`<fieldset class="admin-fieldset"><legend>Serviço ${i+1}</legend><div class="admin-form__grid"><div class="field"><label>Rótulo</label><input data-svc="${i}.number" value="${esc(card.number)}"></div><div class="field"><label>Título</label><input data-svc="${i}.title" value="${esc(card.title)}"></div></div><div class="field"><label>Descrição</label><textarea data-svc="${i}.text">${esc(card.text)}</textarea></div></fieldset>`).join(''); const steps = h.steps.map((step,i)=>`<fieldset class="admin-fieldset"><legend>Etapa ${i+1}</legend><div class="field"><label>Título</label><input data-step="${i}.title" value="${esc(step.title)}"></div><div class="field"><label>Descrição</label><textarea data-step="${i}.text">${esc(step.text)}</textarea></div></fieldset>`).join(''); return `<section class="admin-content"><div class="admin-head"><div><h1>Textos &amp; imagens do site</h1><p>Edite os principais textos da página inicial e troque as imagens. As alterações aparecem imediatamente no site.</p></div><div class="admin-actions"><a class="btn btn--line" data-route href="/" target="_blank">Ver site</a></div></div><form class="admin-form admin-form--wide" id="site-form"><h2 class="form-title">Seção principal (topo)</h2><div class="admin-form__grid"><div class="field"><label for="s-eyebrow">Selo (linha fina)</label><input id="s-eyebrow" data-home="heroEyebrow" value="${esc(h.heroEyebrow)}"></div><div class="field"><label for="s-carditem">Destaque do cartão</label><input id="s-carditem" data-home="heroCardItem" value="${esc(h.heroCardItem)}"></div></div><div class="field"><label for="s-title">Título principal <small>(pode usar &lt;em&gt;destaque&lt;/em&gt;)</small></label><input id="s-title" data-home="heroTitle" value="${esc(h.heroTitle)}"></div><div class="field"><label for="s-copy">Texto de apoio</label><textarea id="s-copy" data-home="heroCopy">${esc(h.heroCopy)}</textarea></div><div class="admin-form__grid"><div class="field"><label for="s-primary">Botão principal</label><input id="s-primary" data-home="heroPrimaryLabel" value="${esc(h.heroPrimaryLabel)}"></div><div class="field"><label for="s-secondary">Botão secundário</label><input id="s-secondary" data-home="heroSecondaryLabel" value="${esc(h.heroSecondaryLabel)}"></div></div><h2 class="form-title">Seção “A Result”</h2><div class="field"><label for="s-introtitle">Título</label><input id="s-introtitle" data-home="introTitle" value="${esc(h.introTitle)}"></div><div class="field"><label for="s-introcopy">Texto</label><textarea id="s-introcopy" data-home="introCopy">${esc(h.introCopy)}</textarea></div>${imageField('img-institutional','institutional','Imagem institucional (seção “A Result”)', c.images.institutional)}<h2 class="form-title">O que entregamos</h2><div class="field"><label for="s-svcintro">Texto de introdução</label><textarea id="s-svcintro" data-home="servicesIntro">${esc(h.servicesIntro)}</textarea></div>${svc}<h2 class="form-title">Método (etapas)</h2>${steps}<button class="btn btn--primary" type="submit">Salvar alterações</button></form></section>`; }

function articlesView() { const articles = getContent().articles; return `<section class="admin-content"><div class="admin-head"><div><h1>Conteúdos</h1><p>Gerencie os artigos exibidos na página “Conteúdos” e nos destaques da home. A estrela define qual artigo fica fixado em destaque na home e no topo de “Outros artigos” — só um por vez.</p></div><div class="admin-actions"><button class="btn btn--primary" data-admin-new-article>Novo artigo</button></div></div><section class="admin-card"><div class="admin-card__head"><h2>Artigos</h2></div><table class="table"><thead><tr><th></th><th>Título</th><th>Categoria</th><th>Data</th><th>Status</th><th></th></tr></thead><tbody>${articles.map((a,i)=>`<tr><td><button type="button" class="star-toggle${a.featured?' is-active':''}" data-admin-toggle-featured="${i}" aria-pressed="${!!a.featured}" aria-label="${a.featured?'Remover destaque da home':'Destacar na home'}">${icons.star}</button></td><td><strong>${esc(a.title)}</strong></td><td>${esc(a.category)}</td><td>${esc(a.date)}</td><td><span class="status status--${a.status==='Publicado'?'done':'draft'}">${esc(a.status)}</span></td><td class="table-actions"><button class="text-link" data-admin-edit-article="${i}">Editar</button><button class="text-link text-link--danger" data-admin-del-article="${i}">Excluir</button></td></tr>`).join('')}</tbody></table></section></section>`; }

function articleEditView(index) { const articles = getContent().articles; const isNew = index === null || index === undefined || Number.isNaN(index) || !articles[index]; const a = isNew ? { title:'', category:'Institucional', date:'', status:'Rascunho', summary:'', content:'' } : articles[index]; const cats = ['Institucional','Regulação','Experiência','Gestão']; const slugPreview = a.title ? slugify(a.title) : ''; return `<section class="admin-content"><div class="admin-head"><div><h1>${isNew?'Novo artigo':'Editar artigo'}</h1><p>As alterações são salvas neste navegador e refletem no site imediatamente.</p></div><div class="admin-actions">${!isNew ? `<button type="button" class="star-toggle star-toggle--labeled${a.featured?' is-active':''}" data-admin-toggle-featured="${index}" aria-pressed="${!!a.featured}">${icons.star}<span>${a.featured?'Destacado na home':'Destacar na home'}</span></button>` : ''}<button class="btn btn--line" data-admin-view="artigos">Cancelar</button></div></div><form class="admin-form" id="article-form" data-index="${isNew?'':index}"><div class="field"><label for="a-title">Título</label><input id="a-title" required value="${esc(a.title)}" placeholder="Insira um título"></div>${!isNew ? `<p class="form-note" style="margin:-10px 0 18px">URL pública: /conteudos/${esc(slugPreview)}</p>` : ''}<div class="admin-form__grid"><div class="field"><label for="a-category">Categoria</label><select id="a-category">${cats.map(cat=>`<option ${cat===a.category?'selected':''}>${cat}</option>`).join('')}</select></div><div class="field"><label for="a-status">Status</label><select id="a-status"><option ${a.status==='Publicado'?'selected':''}>Publicado</option><option ${a.status==='Rascunho'?'selected':''}>Rascunho</option></select></div></div><div class="admin-form__grid"><div class="field"><label for="a-date">Data (texto)</label><input id="a-date" value="${esc(a.date)}" placeholder="ex.: 21 jul 2026"></div></div><div class="field"><label for="a-summary">Resumo</label><textarea id="a-summary" placeholder="Introdução objetiva para a publicação.">${esc(a.summary||'')}</textarea></div><div class="field"><label for="a-content">Conteúdo completo</label><textarea id="a-content" style="min-height:220px" placeholder="Escreva o corpo do artigo. Separe parágrafos com uma linha em branco.">${esc(a.content||'')}</textarea></div><button class="btn btn--primary" type="submit">Salvar artigo</button></form></section>`; }

function formsView() { const contacts = getContent().contacts; const types = [...new Set(contacts.map(c=>c.type).filter(Boolean))].sort(); const statuses = [...new Set(contacts.map(c=>c.status).filter(Boolean))].sort(); const count = s => contacts.filter(c=>c.status===s).length; const summary = [['Total', contacts.length],['Novos', count('Novo')],['Em análise', count('Em análise')],['Concluídos', count('Concluído')]]; return `<section class="admin-content"><div class="admin-head"><div><h1>Formulários</h1><p>Central de solicitações recebidas pelo site institucional.</p></div><div class="admin-actions"><button class="btn btn--line" data-admin-demo>Exportar dados</button></div></div><div class="forms-summary">${summary.map(([label,value])=>`<article class="forms-summary__item"><strong>${value}</strong><span>${label}</span></article>`).join('')}</div><section class="admin-card"><div class="admin-card__head"><h2>Todos os recebimentos</h2><span class="admin-tag">Demonstrativo</span></div><div class="forms-filters"><div class="field field--search"><label for="forms-search">Buscar</label><input id="forms-search" type="search" data-forms-search placeholder="Nome ou assunto..."></div><div class="field"><label for="forms-type">Tipo</label><select id="forms-type" data-forms-type><option value="">Todos os tipos</option>${types.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('')}</select></div><div class="field"><label for="forms-status">Status</label><select id="forms-status" data-forms-status><option value="">Todos os status</option>${statuses.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join('')}</select></div><button type="button" class="btn btn--line" data-forms-clear>Limpar filtros</button></div><p class="forms-count" data-forms-count>${contacts.length} registro(s)</p><div data-forms-table>${contactTable(contacts)}</div></section></section>`; }
function teamView() { const c = getContent(); const p = c.proof; const metricRows = p.metrics.map((m,i)=>`<fieldset class="admin-fieldset"><legend>Métrica ${i+1}</legend><div class="admin-form__grid"><div class="field"><label>Número / destaque</label><input data-metric="${i}.value" value="${esc(m.value)}"></div><div class="field"><label>Descrição</label><input data-metric="${i}.label" value="${esc(m.label)}"></div></div></fieldset>`).join(''); return `<section class="admin-content"><div class="admin-head"><div><h1>Equipe &amp; destaques</h1><p>Responsável operacional, depoimento em destaque e as 4 métricas da vitrine da home.</p></div><div class="admin-actions"><a class="btn btn--line" data-route href="/" target="_blank">Ver site</a></div></div><form class="admin-form admin-form--wide" id="team-form"><h2 class="form-title">Liderança operacional</h2><div class="admin-form__grid"><div class="field"><label for="t-name">Nome</label><input id="t-name" data-team="leaderName" value="${esc(p.leaderName)}"></div><div class="field"><label for="t-role">Cargo / rótulo</label><input id="t-role" data-team="leaderRole" value="${esc(p.leaderRole)}"></div></div><div class="field"><label for="t-bio">Descrição / biografia</label><textarea id="t-bio" data-team="leaderBio">${esc(p.leaderBio)}</textarea></div>${imageField('img-leader','leader','Foto do responsável', c.images.leader)}<h2 class="form-title">Depoimento em destaque (fallback)</h2><div class="field"><label for="t-quote">Frase usada quando não há depoimentos publicados</label><textarea id="t-quote" data-team="quote">${esc(p.quote)}</textarea></div><h2 class="form-title">Métricas da vitrine (home)</h2><p class="form-note" style="margin:0 0 14px">Os 4 números grandes exibidos na seção “Confiança que se constrói no processo”.</p>${metricRows}<button class="btn btn--primary" type="submit">Salvar informações</button></form></section>`; }

function partnersView() { const partners = getContent().partners || []; const rows = partners.map((partner,i)=>`<fieldset class="admin-fieldset admin-fieldset--card"><div class="admin-fieldset__head"><legend>Parceiro ${i+1}</legend><button type="button" class="btn-remove" data-remove-partner="${i}">${icons.trash}<span>Excluir</span></button></div><div class="admin-form__grid"><div class="field"><label>Nome exibido</label><input data-partner="${i}.name" value="${esc(partner.name)}"></div><div class="field"><label>Exibir no site</label><select data-partner="${i}.visible"><option value="true" ${partner.visible?'selected':''}>Sim</option><option value="false" ${!partner.visible?'selected':''}>Não</option></select></div></div></fieldset>`).join('') || '<div class="empty">Nenhum parceiro cadastrado. Adicione o primeiro.</div>'; return `<section class="admin-content"><div class="admin-head"><div><h1>Parceiros</h1><p>Seguradoras exibidas na home. Publique apenas após autorização formal de uso de marca.</p></div><div class="admin-actions"><button class="btn btn--line" data-add-partner>Adicionar parceiro</button><a class="btn btn--line" data-route href="/" target="_blank">Ver site</a></div></div><div class="admin-banner">Enquanto não houver autorização, use “Seguradora parceira” como nome genérico. Não publique logos/nomes reais sem aprovação.</div><form class="admin-form admin-form--wide" id="partners-form">${rows}<button class="btn btn--primary" type="submit">Salvar parceiros</button></form></section>`; }

function testimonialsView() { const items = getContent().testimonials || []; const rows = items.map((t,i)=>`<fieldset class="admin-fieldset"><legend>Depoimento ${i+1}</legend><div class="admin-form__grid"><div class="field"><label>Autor / rótulo (pode ser anônimo)</label><input data-testimonial="${i}.author" value="${esc(t.author)}" placeholder="Ex.: Imobiliária parceira"></div><div class="field"><label>Publicar no site (requer consentimento)</label><select data-testimonial="${i}.visible"><option value="true" ${t.visible?'selected':''}>Sim</option><option value="false" ${!t.visible?'selected':''}>Não</option></select></div></div><div class="field"><label>Depoimento</label><textarea data-testimonial="${i}.quote">${esc(t.quote)}</textarea></div><button type="button" class="text-link text-link--danger" data-remove-testimonial="${i}">Remover depoimento</button></fieldset>`).join('') || '<div class="empty">Nenhum depoimento cadastrado. Adicione o primeiro.</div>'; return `<section class="admin-content"><div class="admin-head"><div><h1>Depoimentos</h1><p>O primeiro depoimento publicado aparece em destaque na home. Publique apenas com consentimento.</p></div><div class="admin-actions"><button class="btn btn--line" data-add-testimonial>Adicionar depoimento</button><a class="btn btn--line" data-route href="/" target="_blank">Ver site</a></div></div><div class="admin-banner">Somente depoimentos com consentimento formal devem ser publicados. É possível ocultar nome/empresa usando um rótulo genérico.</div><form class="admin-form admin-form--wide" id="testimonials-form">${rows}<button class="btn btn--primary" type="submit">Salvar depoimentos</button></form></section>`; }

function indicatorsView() { const ind = getContent().indicators; return `<section class="admin-content"><div class="admin-head"><div><h1>Indicadores</h1><p>Dados institucionais gerais. Usados apenas no painel — não são exibidos no site público.</p></div><div class="admin-actions"><a class="btn btn--line" data-route href="/" target="_blank">Ver site</a></div></div><div class="admin-banner">Não publicar dados por seguradora, índices de sinistralidade ou métricas confidenciais. Use apenas dados gerais aprovados.</div><form class="admin-form admin-form--wide" id="indicators-form"><h2 class="form-title">Dados institucionais</h2><div class="admin-form__grid"><div class="field"><label for="ind-target">Rótulo da meta</label><input id="ind-target" data-ind-meta="target" value="${esc(ind.target)}"></div><div class="field"><label for="ind-team">Tamanho da equipe</label><input id="ind-team" data-ind-meta="team" value="${esc(ind.team)}"></div><div class="field"><label for="ind-reach">Abrangência</label><input id="ind-reach" data-ind-meta="reach" value="${esc(ind.reach)}"></div></div><button class="btn btn--primary" type="submit">Salvar indicadores</button></form></section>`; }

function settingsView() { const s = getContent().settings; return `<section class="admin-content"><div class="admin-head"><div><h1>Configurações</h1><p>Informações de contato exibidas no site. O e-mail de destino dos formulários não é exibido publicamente.</p></div></div><form class="admin-form" id="settings-form"><h2 class="form-title">Contato público</h2><div class="admin-form__grid"><div class="field"><label for="c-phone">Telefone (exibido)</label><input id="c-phone" data-set="phone" value="${esc(s.phone)}"></div><div class="field"><label for="c-phonehref">Telefone (só dígitos, com DDI)</label><input id="c-phonehref" data-set="phoneHref" value="${esc(s.phoneHref)}" placeholder="5511..."></div></div><div class="field"><label for="c-address">Endereço (use &lt;br&gt; para quebra)</label><input id="c-address" data-set="address" value="${esc(s.address)}"></div><div class="admin-form__grid"><div class="field"><label for="c-whats">WhatsApp (só dígitos, opcional)</label><input id="c-whats" data-set="whatsapp" value="${esc(s.whatsapp)}" placeholder="5511..."></div><div class="field"><label for="c-email">E-mail de destino dos formulários (privado)</label><input id="c-email" type="email" data-set="email" value="${esc(s.email)}" placeholder="contato@resultreguladora.com.br"></div></div><p class="form-note">Em produção, o e-mail acima recebe os formulários sem ser exibido na interface pública.</p><button class="btn btn--primary" type="submit">Salvar configurações</button></form></section>`; }

function adminApp(view='dashboard', param) { if (!sessionStorage.getItem('resultAdmin')) return login(); let body; switch(view){ case 'site': body=siteView(); break; case 'artigos': body=articlesView(); break; case 'novo-artigo': body=articleEditView(null); break; case 'editar-artigo': body=articleEditView(Number(param)); break; case 'formularios': body=formsView(); break; case 'parceiros': body=partnersView(); break; case 'depoimentos': body=testimonialsView(); break; case 'indicadores': body=indicatorsView(); break; case 'equipe': body=teamView(); break; case 'configuracoes': body=settingsView(); break; default: body=dashboard(); } const navActive = ['novo-artigo','editar-artigo'].includes(view) ? 'artigos' : view; return `<main class="admin"><div class="admin-layout">${adminNav(navActive)}<div class="admin-main"><header class="admin-top"><div class="admin-top__context"><strong>Result CMS</strong>Administração institucional</div><div class="admin-user"><span>Olá, Administração</span><i class="avatar">RA</i></div></header>${body}</div></div></main><div class="toast" role="status" aria-live="polite"></div>`; }
function login() { return `<main class="login"><form class="login-card" id="login-form">${logo()}<h1>Área administrativa</h1><p>Acesse o ambiente demonstrativo da Result.</p><div class="field"><label for="login-email">E-mail</label><input id="login-email" type="email" required placeholder="admin@result.com" /></div><div class="field"><label for="login-password">Senha</label><input id="login-password" type="password" required placeholder="••••••" /></div><button class="btn btn--dark" type="submit">Acessar painel ${icons.arrow}</button><p class="login-help">Credenciais de demonstração:<br><strong>admin@result.com</strong> · <strong>123456</strong></p></form><div class="toast" role="status" aria-live="polite"></div></main>`; }

/* ---------- Roteamento e interações ---------- */

let lastRenderedPath = null;
function getInitialRoute() {
  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect') || params.get('p');
  if (redirect) {
    const cleaned = redirect.replace(/^\/+/, '');
    return cleaned || 'home';
  }
  const rawRoute = stripBasePath(location.pathname).replace(/^\/+|\/+$/g, '').replace(/^[A-Za-z]:\/?/, '');
  return !rawRoute || rawRoute.endsWith('index.html') ? 'home' : rawRoute;
}

function render() {
  lastRenderedPath = location.pathname;
  const route = getInitialRoute();
  const segments = route.split('/');
  const isAdminRoute = segments[0] === 'admin';
  let html;
  if(isAdminRoute) html = adminApp(segments[1] || 'dashboard', segments[2]); else if(route === 'home') html=home(); else if(route==='contato') html=contactPage(); else if(route==='trabalhe-conosco') html=contactPage('Trabalhe conosco'); else if(route==='conteudos') html=blog(); else if(segments[0]==='conteudos' && segments[1]) html=articlePage(segments[1]); else if(route==='politica-de-privacidade') html=legal('Política de Privacidade'); else if(route==='termos') html=legal('Termos de Uso'); else html=interior(route);
  app.innerHTML = html;
  normalizePageLinks(app);
  app.dataset.section = isAdminRoute ? 'admin' : 'public';
  document.documentElement.dataset.theme = getTheme();
  if(!isAdminRoute) app.insertAdjacentHTML('beforeend', themeToggle());
  bindInteractions();
  window.scrollTo({top:0,behavior:'instant'});
}
function navigate(href) {
  const nextHref = normalizeRouteHref(href || '.');
  history.pushState({}, '', nextHref);
  render();
}
function toast(message) { const el=document.querySelector('.toast'); if(!el) return; el.textContent=message; el.classList.add('is-visible'); clearTimeout(window.toastTimeout); window.toastTimeout=setTimeout(()=>el.classList.remove('is-visible'),3200); }

// Imagens selecionadas mas ainda não salvas (por chave), reiniciadas a cada render.
let draftImages = {};

function bindInteractions() {
  draftImages = {};
  document.querySelectorAll('[data-route]').forEach(link=>link.addEventListener('click',event=>{ if(link.target === '_blank') return; event.preventDefault(); navigate(link.getAttribute('href')); }));
  const menu=document.querySelector('.menu-button'); const nav=document.querySelector('.nav-links'); if(menu) menu.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menu.setAttribute('aria-expanded',String(open));});
  const themeBtn=document.querySelector('[data-theme-toggle]'); if(themeBtn) themeBtn.addEventListener('click',()=>{ const next=THEME_ORDER[(THEME_ORDER.indexOf(getTheme())+1)%THEME_ORDER.length]; setTheme(next); const y=window.scrollY; render(); window.scrollTo({top:y,behavior:'instant'}); });
  const siteHeader=document.querySelector('.site-header'); if(siteHeader){const sync=()=>siteHeader.classList.toggle('is-scrolled',scrollY>16);sync();addEventListener('scroll',sync,{passive:true});}
  const heroNova=document.querySelector('.hero--nova');
  if(heroNova && window.matchMedia && matchMedia('(pointer: fine)').matches){ heroNova.addEventListener('mousemove',event=>{ const r=heroNova.getBoundingClientRect(); heroNova.style.setProperty('--mx',`${((event.clientX-r.left)/r.width*100).toFixed(1)}%`); heroNova.style.setProperty('--my',`${((event.clientY-r.top)/r.height*100).toFixed(1)}%`); }); }
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');e.target.querySelectorAll('[data-countup-target]').forEach(animateCountUp);observer.unobserve(e.target);}}),{threshold:.12}); document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  document.querySelectorAll('[data-contact-type]').forEach(button=>button.addEventListener('click',()=>{ const type=button.dataset.contactType; app.innerHTML=contactPage(type); bindInteractions(); }));
  const contactForm=document.querySelector('#contact-form'); if(contactForm) contactForm.addEventListener('submit',event=>{event.preventDefault();toast('Mensagem registrada na demonstração. Em produção, ela seguirá o fluxo selecionado.');contactForm.reset();});
  const loginForm=document.querySelector('#login-form'); if(loginForm) loginForm.addEventListener('submit',event=>{event.preventDefault(); const email=document.querySelector('#login-email').value;const password=document.querySelector('#login-password').value;if(email==='admin@result.com'&&password==='123456'){sessionStorage.setItem('resultAdmin','true');navigate('/admin');}else toast('Use as credenciais de demonstração informadas abaixo.');});

  // Navegação do painel
  document.querySelectorAll('[data-admin-view]').forEach(button=>button.addEventListener('click',()=>navigate(`/admin/${button.dataset.adminView === 'dashboard' ? '' : button.dataset.adminView}`)));
  document.querySelectorAll('[data-admin-new-article]').forEach(button=>button.addEventListener('click',()=>navigate('/admin/novo-artigo')));
  document.querySelectorAll('[data-admin-edit-article]').forEach(button=>button.addEventListener('click',()=>navigate(`/admin/editar-artigo/${button.dataset.adminEditArticle}`)));
  document.querySelectorAll('[data-admin-del-article]').forEach(button=>button.addEventListener('click',()=>{ if(!confirm('Excluir este artigo da demonstração?')) return; const idx=Number(button.dataset.adminDelArticle); updateContent(c=>{c.articles.splice(idx,1);}); render(); toast('Artigo excluído.'); }));
  document.querySelectorAll('[data-admin-demo]').forEach(button=>button.addEventListener('click',()=>toast('Ação demonstrativa. Será habilitada na versão de produção.')));
  const logout=document.querySelector('[data-admin-logout]'); if(logout) logout.addEventListener('click',()=>{sessionStorage.removeItem('resultAdmin');navigate('/admin');});
  const reset=document.querySelector('[data-admin-reset]'); if(reset) reset.addEventListener('click',()=>{ if(!confirm('Restaurar todo o conteúdo para o padrão? As edições desta demonstração serão perdidas.')) return; resetContent(); render(); toast('Conteúdo restaurado para o padrão.'); });

  // Adicionar/remover parceiros e depoimentos (preserva edições não salvas no formulário)
  const addPartner=document.querySelector('[data-add-partner]'); if(addPartner) addPartner.addEventListener('click',()=>{ updateContent(c=>{ c.partners=readPartnersForm(); c.partners.push({name:'Seguradora parceira', visible:false}); }); render(); });
  document.querySelectorAll('[data-remove-partner]').forEach(button=>button.addEventListener('click',()=>{ if(!confirm('Excluir este parceiro da demonstração?')) return; const idx=Number(button.dataset.removePartner); updateContent(c=>{ c.partners=readPartnersForm(); c.partners.splice(idx,1); }); render(); toast('Parceiro removido.'); }));
  const addTestimonial=document.querySelector('[data-add-testimonial]'); if(addTestimonial) addTestimonial.addEventListener('click',()=>{ updateContent(c=>{ c.testimonials=readTestimonialsForm(); c.testimonials.push({author:'', quote:'', visible:false}); }); render(); });
  document.querySelectorAll('[data-remove-testimonial]').forEach(button=>button.addEventListener('click',()=>{ const idx=Number(button.dataset.removeTestimonial); updateContent(c=>{ c.testimonials=readTestimonialsForm(); c.testimonials.splice(idx,1); }); render(); toast('Depoimento removido.'); }));

  // Filtros da tela de Formulários
  const formsTable=document.querySelector('[data-forms-table]');
  if(formsTable){
    const searchInput=document.querySelector('[data-forms-search]');
    const typeSelect=document.querySelector('[data-forms-type]');
    const statusSelect=document.querySelector('[data-forms-status]');
    const countEl=document.querySelector('[data-forms-count]');
    const applyFormsFilter=()=>{
      const term=(searchInput?.value||'').trim().toLowerCase();
      const type=typeSelect?.value||'';
      const status=statusSelect?.value||'';
      const filtered=getContent().contacts.filter(c=>
        (!type || c.type===type) &&
        (!status || c.status===status) &&
        (!term || `${c.person} ${c.subject}`.toLowerCase().includes(term))
      );
      const tbody=formsTable.querySelector('tbody');
      if(tbody) tbody.innerHTML=contactRows(filtered);
      if(countEl) countEl.textContent=`${filtered.length} registro(s)`;
    };
    searchInput?.addEventListener('input',applyFormsFilter);
    typeSelect?.addEventListener('change',applyFormsFilter);
    statusSelect?.addEventListener('change',applyFormsFilter);
    document.querySelector('[data-forms-clear]')?.addEventListener('click',()=>{ if(searchInput) searchInput.value=''; if(typeSelect) typeSelect.value=''; if(statusSelect) statusSelect.value=''; applyFormsFilter(); });
  }

  // Uploads de imagem (guardam Data URL em draftImages e atualizam o preview)
  document.querySelectorAll('input[type="file"][data-image-key]').forEach(input=>input.addEventListener('change', async ()=>{ const file=input.files && input.files[0]; if(!file) return; try { const dataUrl=await readImageAsDataUrl(file); const key=input.dataset.imageKey; draftImages[key]=dataUrl; const preview=document.querySelector(`[data-image-preview="${key}"]`); if(preview){ const img=document.createElement('img'); img.className='upload-preview'; img.src=dataUrl; img.alt=''; img.setAttribute('data-image-preview',key); preview.replaceWith(img); } } catch { toast('Não foi possível carregar a imagem.'); } }));

  bindAdminForms();
}

function bindAdminForms() {
  const siteForm=document.querySelector('#site-form');
  if(siteForm) siteForm.addEventListener('submit',event=>{event.preventDefault(); updateContent(c=>{ siteForm.querySelectorAll('[data-home]').forEach(el=>{ c.home[el.dataset.home]=el.value; }); siteForm.querySelectorAll('[data-svc]').forEach(el=>{ const [i,field]=el.dataset.svc.split('.'); c.home.services[Number(i)][field]=el.value; }); siteForm.querySelectorAll('[data-step]').forEach(el=>{ const [i,field]=el.dataset.step.split('.'); c.home.steps[Number(i)][field]=el.value; }); if('institutional' in draftImages) c.images.institutional=draftImages.institutional; }); toast('Site atualizado. As alterações já estão publicadas na demonstração.'); });

  const articleForm=document.querySelector('#article-form');
  if(articleForm) articleForm.addEventListener('submit',event=>{event.preventDefault(); const raw=articleForm.dataset.index; const entry={ title:document.querySelector('#a-title').value.trim(), category:document.querySelector('#a-category').value, date:document.querySelector('#a-date').value.trim()||'—', status:document.querySelector('#a-status').value, summary:document.querySelector('#a-summary').value.trim(), content:document.querySelector('#a-content').value.trim() }; if(!entry.title){ toast('Informe um título para o artigo.'); return; } updateContent(c=>{ if(raw==='' || raw===undefined){ c.articles.unshift(entry); } else { entry.featured=!!c.articles[Number(raw)].featured; c.articles[Number(raw)]=entry; } }); navigate('/admin/artigos'); toast('Artigo salvo.'); });
  document.querySelectorAll('[data-admin-toggle-featured]').forEach(button=>button.addEventListener('click',()=>{ const idx=Number(button.dataset.adminToggleFeatured); const wasFeatured=!!getContent().articles[idx].featured; updateContent(c=>{ c.articles.forEach(article=>{ article.featured=false; }); if(!wasFeatured) c.articles[idx].featured=true; }); render(); toast(wasFeatured?'Destaque removido.':'Artigo destacado na home.'); }));

  const indForm=document.querySelector('#indicators-form');
  if(indForm) indForm.addEventListener('submit',event=>{event.preventDefault(); updateContent(c=>{ indForm.querySelectorAll('[data-ind-meta]').forEach(el=>{ c.indicators[el.dataset.indMeta]=el.value; }); }); navigate('/admin/indicadores'); toast('Indicadores atualizados.'); });

  const teamForm=document.querySelector('#team-form');
  if(teamForm) teamForm.addEventListener('submit',event=>{event.preventDefault(); updateContent(c=>{ teamForm.querySelectorAll('[data-team]').forEach(el=>{ c.proof[el.dataset.team]=el.value; }); teamForm.querySelectorAll('[data-metric]').forEach(el=>{ const [i,field]=el.dataset.metric.split('.'); c.proof.metrics[Number(i)][field]=el.value; }); if('leader' in draftImages) c.images.leader=draftImages.leader; }); toast('Informações da equipe e métricas salvas.'); });

  // Parceiros (lista editável)
  const partnersForm=document.querySelector('#partners-form');
  if(partnersForm) partnersForm.addEventListener('submit',event=>{event.preventDefault(); updateContent(c=>{ c.partners=readPartnersForm(); }); render(); toast('Parceiros salvos.'); });

  // Depoimentos (lista editável)
  const testimonialsForm=document.querySelector('#testimonials-form');
  if(testimonialsForm) testimonialsForm.addEventListener('submit',event=>{event.preventDefault(); updateContent(c=>{ c.testimonials=readTestimonialsForm(); }); render(); toast('Depoimentos salvos.'); });

  const settingsForm=document.querySelector('#settings-form');
  if(settingsForm) settingsForm.addEventListener('submit',event=>{event.preventDefault(); updateContent(c=>{ settingsForm.querySelectorAll('[data-set]').forEach(el=>{ c.settings[el.dataset.set]=el.value.trim(); }); }); toast('Configurações salvas.'); });
}

// Lê o estado atual do formulário de parceiros a partir do DOM.
function readPartnersForm() {
  const map = {};
  document.querySelectorAll('[data-partner]').forEach(el => {
    const [i, field] = el.dataset.partner.split('.');
    map[i] = map[i] || {};
    map[i][field] = field === 'visible' ? el.value === 'true' : el.value;
  });
  return Object.keys(map).sort((a, b) => a - b).map(k => ({ name: (map[k].name || '').trim(), visible: !!map[k].visible }));
}

// Lê o estado atual do formulário de depoimentos a partir do DOM.
function readTestimonialsForm() {
  const map = {};
  document.querySelectorAll('[data-testimonial]').forEach(el => {
    const [i, field] = el.dataset.testimonial.split('.');
    map[i] = map[i] || {};
    map[i][field] = field === 'visible' ? el.value === 'true' : el.value;
  });
  return Object.keys(map).sort((a, b) => a - b).map(k => ({ author: (map[k].author || '').trim(), quote: (map[k].quote || '').trim(), visible: !!map[k].visible }));
}

// Compat: mantém referência exportada usada por versões anteriores.
void hasCustomContent;

// popstate também dispara para âncoras de página (ex.: "Nesta página",
// "Voltar ao topo") já que são navegações de fragmento no mesmo documento.
// Se o caminho não mudou, é uma âncora — deixa o navegador rolar até o
// elemento normalmente em vez de re-renderizar e resetar o scroll pro topo.
addEventListener('popstate',()=>{ if(location.pathname===lastRenderedPath) return; render(); });
render();
