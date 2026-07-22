// Compatibilidade retroativa.
// Os dados de demonstração agora vivem em `services/store.js`, que persiste as
// edições do painel no localStorage. Este arquivo apenas reexporta os padrões
// para não quebrar imports antigos. Em produção, substituir por API.
import { DEFAULTS } from '../services/store.js';

export const articles = DEFAULTS.articles;
export const contacts = DEFAULTS.contacts;
