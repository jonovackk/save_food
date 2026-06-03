/**
 * moderation.js — filtro de conteúdo inapropriado
 * Normaliza o texto antes de checar para pegar variações simples
 * (l33tspeak, acentos, letras repetidas, etc.)
 */

const BAD_WORDS = [
  // Português — ofensas / palavrões comuns
  'porra','merda','bosta','foda','fodase','foder','fuder','fdp',
  'vsf','tnc','kct','qsf','vtnc','pqp','mds','oxe',
  'puta','putaquepariu','filhadaputa','filhodaputa','fdaputa',
  'viado','viadinho','bichinha','traveco',
  'cuzao','cuzinho','bct','buceta',
  'caralho','cacete','piroca','pinto','rola',
  'babaca','arrombado','safado','safada',
  'vadia','piranha','prostituta','vagabundo','vagabunda',
  'otario','otaria','corno','cornao','corna',
  'idiota','imbecil','retardado','mongoloide','deficiente',
  'desgraçado','desgraçada','lixo','escoria',
  'nazi','nazismo','fascismo','racismo',
  // Inglês
  'shit','fuck','fuckyou','bitch','asshole','bastard',
  'dick','cock','cunt','pussy','nigger','faggot','whore',
];

/**
 * Normaliza texto para detecção de variações:
 * - minúsculas
 * - remove acentos
 * - substitui leet speak comum
 * - colapsa letras repetidas (3+ vezes)
 * - remove espaços extras
 */
function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/[@4]/g, 'a')
    .replace(/[0]/g,  'o')
    .replace(/[1!|]/g,'i')
    .replace(/[3]/g,  'e')
    .replace(/[$5]/g, 's')
    .replace(/[7]/g,  't')
    .replace(/[+]/g,  't')
    .replace(/(.)\1{2,}/g, '$1') // "meeeerda" → "merda"
    .trim();
}

/**
 * Retorna a palavra bloqueada encontrada, ou null se limpo.
 */
function containsBadWord(text) {
  const norm = normalize(text);
  // versão sem espaços e sem pontuação (pega palavras coladas)
  const compact = norm.replace(/[^a-z0-9]/g, '');

  for (const word of BAD_WORDS) {
    const w = normalize(word);
    if (norm.includes(w) || compact.includes(w)) return word;
  }
  return null;
}

/**
 * Checa múltiplos campos de uma vez.
 * Retorna { field, word } se encontrar algo, ou null.
 */
function checkFields(fields) {
  for (const [field, value] of Object.entries(fields)) {
    if (!value) continue;
    const found = containsBadWord(String(value));
    if (found) return { field, word: found };
  }
  return null;
}

module.exports = { containsBadWord, checkFields };
