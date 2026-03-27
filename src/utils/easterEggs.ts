/* ================================================================
   Easter Eggs — Magnatas Atlética
   Ativados somente nas páginas públicas (nunca em /admin).
   ================================================================ */

const QUOTES = [
  { text: 'A riqueza das nações está no trabalho de seus homens.', author: 'Adam Smith' },
  { text: 'No longo prazo, todos estaremos mortos.', author: 'John Maynard Keynes' },
  { text: 'A inflação é a forma de tributação que pode ser imposta sem legislação.', author: 'Milton Friedman' },
  { text: 'O mercado pode permanecer irracional por mais tempo do que você pode permanecer solvente.', author: 'John Maynard Keynes' },
  { text: 'A concorrência é o único método pelo qual as necessidades de pessoas que não se conhecem podem ser satisfeitas.', author: 'Friedrich Hayek' },
  { text: 'O trabalho é o pai da riqueza e a terra é sua mãe.', author: 'William Petty' },
  { text: 'Não é da benevolência do açougueiro, do cervejeiro ou do padeiro que esperamos nosso jantar, mas do cuidado que eles têm com seu próprio interesse.', author: 'Adam Smith' },
  { text: 'A história de toda sociedade até nossos dias é a história da luta de classes.', author: 'Karl Marx' },
  { text: 'O capital é trabalho morto que, como um vampiro, só se anima sugando trabalho vivo.', author: 'Karl Marx' },
  { text: 'Oferta e demanda regulam tudo no mundo capitalista.', author: 'David Ricardo' },
  { text: 'Uma expansão monetária não cria riqueza real, apenas redistribui o que já existe.', author: 'Murray Rothbard' },
  { text: 'O desemprego é resultado de salários acima do nível de equilíbrio do mercado.', author: 'Friedrich Hayek' },
  { text: 'Os mercados financeiros são movidos mais pela psicologia do que pela lógica.', author: 'George Soros' },
  { text: 'Poupar é o começo de toda riqueza.', author: 'Benjamin Franklin' },
  { text: 'A economia é a ciência que estuda como os homens tomam decisões em um mundo de escassez.', author: 'Paul Samuelson' },
  { text: 'O livre comércio é a melhor política econômica para o crescimento de uma nação.', author: 'David Ricardo' },
  { text: 'Quando o governo viola as leis do mercado, o mercado viola as leis do governo.', author: 'Ludwig von Mises' },
  { text: 'A pobreza não é apenas falta de dinheiro, é não ter o direito de ser tratado como alguém que importa.', author: 'Amartya Sen' },
  { text: 'O desenvolvimento é a remoção de privações de liberdade que limitam as escolhas das pessoas.', author: 'Amartya Sen' },
  { text: 'A economia comportamental mostra que os humanos são previsíveis em seus erros.', author: 'Richard Thaler' },
  { text: 'As crises financeiras são inevitáveis enquanto houver seres humanos tomando decisões coletivas.', author: 'Hyman Minsky' },
  { text: 'O protecionismo gera monopólios internos e ineficiência crônica.', author: 'Frédéric Bastiat' },
  { text: 'Tudo que o governo toca vira ouro... para o governo.', author: 'Milton Friedman' },
  { text: 'A desigualdade é o preço do progresso mal distribuído.', author: 'Simon Kuznets' },
  { text: 'Não existe almoço grátis.', author: 'Milton Friedman' },
  { text: 'O capitalismo sem falência é como o cristianismo sem inferno.', author: 'Frank Borman' },
  { text: 'A economia global é um jogo de soma positiva quando as regras são justas.', author: 'Joseph Stiglitz' },
  { text: 'Inflação é sempre e em todo lugar um fenômeno monetário.', author: 'Milton Friedman' },
  { text: 'A renda não comprada não tem valor. O valor nasce da troca.', author: 'Jean-Baptiste Say' },
  { text: 'Quem controla o dinheiro controla o mundo.', author: 'Henry Kissinger' },
];

// ----------------------------------------------------------------
// EE1 — Cursor cifrão ao passar no mascote
// ----------------------------------------------------------------
function initMascoteCursor(): () => void {
  const SELECTORS = [
    'img.hero-mascote-fallback',
    'video.hero-mascote-video',
    '.institutional-video-bg',
    'img[src*="magnatas"]',
    'img[src*="mascote"]',
    'img[src*="Mascote"]',
    'img[src*="squirrel"]',
  ];

  function applyClass() {
    for (const sel of SELECTORS) {
      document.querySelectorAll<Element>(sel).forEach((el) => {
        el.classList.add('mascote-cursor');
      });
    }
  }

  applyClass();

  const observer = new MutationObserver(applyClass);
  observer.observe(document.body, { childList: true, subtree: true });

  return () => observer.disconnect();
}

// ----------------------------------------------------------------
// EE2 — Tooltip com citação ao passar em "Economia"
// ----------------------------------------------------------------
function initEconomiaTooltip(): () => void {
  // Singleton tooltip element
  const tooltip = document.createElement('div');
  tooltip.setAttribute('data-ee', 'economia');
  tooltip.style.cssText = [
    'position:fixed',
    'background:#0d1117',
    'color:#fff',
    'font-size:12px',
    'line-height:1.55',
    'width:240px',
    'border:1px solid #c0392b',
    'border-radius:8px',
    'padding:10px 14px 12px',
    'pointer-events:none',
    'z-index:99999',
    'opacity:0',
    'transition:opacity 0.2s',
    'box-shadow:0 4px 20px rgba(0,0,0,0.45)',
  ].join(';');
  document.body.appendChild(tooltip);

  const arrow = document.createElement('div');
  arrow.style.cssText = [
    'position:absolute',
    'bottom:-6px',
    'width:0',
    'height:0',
    'border-left:6px solid transparent',
    'border-right:6px solid transparent',
    'border-top:6px solid #c0392b',
  ].join(';');
  tooltip.appendChild(arrow);

  let hideTimer: ReturnType<typeof setTimeout> | null = null;
  let lastQuoteIndex = -1;

  function pickQuote() {
    let idx;
    do {
      idx = Math.floor(Math.random() * QUOTES.length);
    } while (idx === lastQuoteIndex && QUOTES.length > 1);
    lastQuoteIndex = idx;
    return QUOTES[idx];
  }

  function showTooltip(anchor: HTMLElement) {
    if (hideTimer) clearTimeout(hideTimer);

    const quote = pickQuote();
    // Re-build content then re-append arrow (innerHTML nukes it)
    tooltip.innerHTML = `<em style="display:block;margin-bottom:6px;">"${quote.text}"</em><span style="color:#c0392b;font-size:11px;">— ${quote.author}</span>`;
    tooltip.appendChild(arrow);

    const rect = anchor.getBoundingClientRect();
    const tipW = 240;
    const tipH = tooltip.offsetHeight || 72;

    let top = rect.top - tipH - 10;
    let flipBelow = false;
    if (top < 8) {
      top = rect.bottom + 10;
      flipBelow = true;
    }

    let left = rect.left + rect.width / 2 - tipW / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tipW - 8));

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.opacity = '1';

    // Arrow position
    const arrowCenterX = rect.left + rect.width / 2 - left;
    const clampedX = Math.max(10, Math.min(arrowCenterX, tipW - 10));
    arrow.style.left = `${clampedX}px`;
    if (flipBelow) {
      arrow.style.bottom = 'auto';
      arrow.style.top = '-6px';
      arrow.style.borderTop = 'none';
      arrow.style.borderBottom = '6px solid #c0392b';
    } else {
      arrow.style.top = 'auto';
      arrow.style.bottom = '-6px';
      arrow.style.borderBottom = 'none';
      arrow.style.borderTop = '6px solid #c0392b';
    }
  }

  function hideTooltip() {
    hideTimer = setTimeout(() => {
      tooltip.style.opacity = '0';
    }, 120);
  }

  const SKIP_SELECTORS = ['nav', 'footer', '[data-ee]', '.admin', '[data-ee-skip]'];

  function isInSkipZone(node: Node): boolean {
    let el: Element | null = node instanceof Element ? node : node.parentElement;
    while (el) {
      for (const sel of SKIP_SELECTORS) {
        try {
          if (el.matches(sel)) return true;
        } catch {
          // ignore invalid selector
        }
      }
      el = el.parentElement;
    }
    return false;
  }

  function wrapEconomia() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.textContent?.match(/economia/i)) return NodeFilter.FILTER_SKIP;
        if (isInSkipZone(node)) return NodeFilter.FILTER_SKIP;
        if ((node.parentElement as Element | null)?.matches('.ee-economia-word'))
          return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
      nodes.push(current as Text);
      current = walker.nextNode();
    }

    for (const node of nodes) {
      const text = node.textContent ?? '';
      const parts = text.split(/(economia)/i);
      if (parts.length < 2) continue;
      if (!node.parentNode) continue;

      const fragment = document.createDocumentFragment();
      for (const part of parts) {
        if (/^economia$/i.test(part)) {
          const span = document.createElement('span');
          span.className = 'ee-economia-word';
          span.textContent = part;
          span.style.cssText =
            'cursor:help;text-decoration:underline dotted;text-decoration-color:#c0392b;text-underline-offset:3px;';
          span.addEventListener('mouseenter', () => showTooltip(span));
          span.addEventListener('mouseleave', hideTooltip);
          fragment.appendChild(span);
        } else {
          fragment.appendChild(document.createTextNode(part));
        }
      }
      node.parentNode.replaceChild(fragment, node);
    }
  }

  const timer = setTimeout(wrapEconomia, 500);

  return () => {
    clearTimeout(timer);
    if (hideTimer) clearTimeout(hideTimer);
    tooltip.remove();
  };
}

// ----------------------------------------------------------------
// EE3 — Toast ao dar duplo clique no preço
// ----------------------------------------------------------------
function initPrecoDoubleClick(): () => void {
  let toastEl: HTMLDivElement | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  function showToast() {
    if (toastEl) return;

    const el = document.createElement('div');
    el.setAttribute('data-ee', 'toast');
    el.textContent = '📈 Inflação não, isso é preço justo 📈';
    el.style.cssText = [
      'position:fixed',
      'bottom:24px',
      'right:24px',
      'background:#0d1117',
      'color:#fff',
      'font-size:14px',
      'font-weight:500',
      'border-left:4px solid #c0392b',
      'border-radius:8px',
      'padding:12px 20px',
      'box-shadow:0 4px 20px rgba(0,0,0,0.3)',
      'z-index:99998',
      'transform:translateX(120%)',
      'transition:transform 0.3s ease,opacity 0.3s ease',
      'opacity:0',
      'max-width:320px',
    ].join(';');
    document.body.appendChild(el);
    toastEl = el;

    // Trigger animation on next paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transform = 'translateX(0)';
        el.style.opacity = '1';
      });
    });

    hideTimer = setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(120%)';
      setTimeout(() => {
        el.remove();
        toastEl = null;
      }, 350);
    }, 3000);
  }

  function onDblClick(event: MouseEvent) {
    let el: HTMLElement | null = event.target as HTMLElement;
    let depth = 0;
    while (el && depth < 4) {
      if (el.textContent?.includes('R$')) {
        showToast();
        return;
      }
      el = el.parentElement;
      depth++;
    }
  }

  document.addEventListener('dblclick', onDblClick);

  return () => {
    document.removeEventListener('dblclick', onDblClick);
    if (hideTimer) clearTimeout(hideTimer);
    toastEl?.remove();
    toastEl = null;
  };
}

// ================================================================
// EE4 — Sistema de Conquistas
// ================================================================

type AchievementId =
  | 'explorador'
  | 'consumidor'
  | 'dedicado'
  | 'fiel'
  | 'curioso'
  | 'institucionalista';

const ACHIEVEMENTS: Record<AchievementId, { emoji: string; name: string; desc: string }> = {
  explorador: { emoji: '🗺️', name: 'Explorador', desc: 'Você conhece a Magnatas' },
  consumidor: { emoji: '🛒', name: 'Consumidor consciente', desc: 'Adam Smith aprovaria sua escolha' },
  dedicado: { emoji: '⏱️', name: 'Dedicado', desc: 'Keynes diria que seu tempo tem valor' },
  fiel: { emoji: '📅', name: 'Fiel torcedor', desc: 'A Magnatas conta com você' },
  curioso: { emoji: '🔍', name: 'Curioso', desc: 'Todo economista começa assim' },
  institucionalista: { emoji: '🏛️', name: 'Institucionalista', desc: 'Você acredita em transparência' },
};

// Module-level state — persiste entre trocas de rota na mesma sessão
const sessionPagesVisited = new Set<string>();
const sessionEventFiltersClicked = new Set<string>();
const achievementQueue: AchievementId[] = [];
let isShowingAchievement = false;
let dedicadoTrackerStarted = false;
let sessionCartWasEmptyAtStart: boolean | null = null;

function getStoredAchievements(): AchievementId[] {
  try {
    const val = localStorage.getItem('magnatas_achievements');
    return val ? (JSON.parse(val) as AchievementId[]) : [];
  } catch {
    return [];
  }
}

function isAchievementUnlocked(id: AchievementId): boolean {
  return getStoredAchievements().includes(id);
}

function unlockAchievement(id: AchievementId) {
  if (isAchievementUnlocked(id)) return;
  const stored = getStoredAchievements();
  stored.push(id);
  try {
    localStorage.setItem('magnatas_achievements', JSON.stringify(stored));
  } catch {}
  achievementQueue.push(id);
  if (!isShowingAchievement) processAchievementQueue();
}

function processAchievementQueue() {
  if (!achievementQueue.length) {
    isShowingAchievement = false;
    return;
  }
  isShowingAchievement = true;
  const id = achievementQueue.shift()!;
  showAchievementToast(id, () => setTimeout(processAchievementQueue, 500));
}

function showAchievementToast(id: AchievementId, onDone: () => void) {
  const a = ACHIEVEMENTS[id];

  const toast = document.createElement('div');
  toast.setAttribute('data-ee', 'achievement');
  toast.style.cssText = [
    'position:fixed',
    'bottom:24px',
    'left:24px',
    'background:linear-gradient(135deg,#1a3a5c,#0d1117)',
    'border:1px solid #c0392b',
    'border-radius:10px',
    'padding:14px 18px 18px',
    'min-width:280px',
    'max-width:320px',
    'box-shadow:0 8px 32px rgba(0,0,0,0.4)',
    'z-index:99997',
    'overflow:hidden',
    'transform:translateX(-120%)',
    'transition:transform 0.4s cubic-bezier(.22,.68,0,1.2)',
    'font-family:inherit',
  ].join(';');

  toast.innerHTML = [
    `<p style="font-size:10px;font-weight:700;letter-spacing:.1em;color:#c0392b;text-transform:uppercase;margin:0 0 6px">🏆 Conquista desbloqueada</p>`,
    `<p style="font-size:15px;font-weight:600;color:#fff;margin:0 0 4px">${a.emoji} ${a.name}</p>`,
    `<p style="font-size:12px;color:rgba(255,255,255,0.6);margin:0 0 10px">${a.desc}</p>`,
    `<div style="height:3px;background:rgba(255,255,255,0.1);border-radius:99px;overflow:hidden">`,
    `  <div style="height:100%;background:#c0392b;border-radius:99px;width:100%;animation:ee-timer-shrink 5s linear forwards"></div>`,
    `</div>`,
  ].join('');

  document.body.appendChild(toast);

  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
    })
  );

  setTimeout(() => {
    toast.style.transform = 'translateX(-120%)';
    setTimeout(() => {
      toast.remove();
      onDone();
    }, 450);
  }, 5000);
}

// Dedicado — rastreamento de atividade contínua
function startActivityTracking(onComplete: () => void): () => void {
  let activityTimer: ReturnType<typeof setTimeout> = setTimeout(onComplete, 5 * 60 * 1000);
  let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  const INACTIVITY_MS = 2 * 60 * 1000;

  function onActivity() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      clearTimeout(activityTimer);
      activityTimer = setTimeout(onComplete, 5 * 60 * 1000);
    }, INACTIVITY_MS);
  }

  const evts = ['mousemove', 'keydown', 'scroll', 'touchstart'] as const;
  for (const evt of evts) window.addEventListener(evt, onActivity, { passive: true });

  return () => {
    clearTimeout(activityTimer);
    if (inactivityTimer) clearTimeout(inactivityTimer);
    for (const evt of evts) window.removeEventListener(evt, onActivity);
  };
}

// Fiel torcedor — visitas em dias distintos
function checkFielTorcedor() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const stored: string[] = JSON.parse(
      localStorage.getItem('magnatas_visit_dates') || '[]'
    );
    if (!stored.includes(today)) {
      stored.push(today);
      localStorage.setItem('magnatas_visit_dates', JSON.stringify(stored));
    }
    if (stored.length >= 3) unlockAchievement('fiel');
  } catch {}
}

// Consumidor consciente — aparecimento do badge de carrinho
function initConsumidorListener(): () => void {
  if (isAchievementUnlocked('consumidor')) return () => {};

  if (sessionCartWasEmptyAtStart === null) {
    sessionCartWasEmptyAtStart = !document.querySelector('.cart-badge');
  }
  if (!sessionCartWasEmptyAtStart) return () => {};

  const observer = new MutationObserver(() => {
    if (document.querySelector('.cart-badge')) {
      unlockAchievement('consumidor');
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

// Curioso — todos os filtros de eventos clicados
function initCuriosoListener(): () => void {
  if (isAchievementUnlocked('curioso')) return () => {};

  let removeListener: (() => void) | null = null;

  function setupListener(): boolean {
    const container = document.querySelector('.filters');
    if (!container) return false;
    const chips = container.querySelectorAll('.chip');
    if (!chips.length) return false;
    const total = chips.length;

    function onClick(e: Event) {
      const chip = (e.target as HTMLElement).closest('.chip');
      if (!chip) return;
      sessionEventFiltersClicked.add(chip.textContent?.trim() ?? '');
      if (sessionEventFiltersClicked.size >= total) {
        unlockAchievement('curioso');
        container.removeEventListener('click', onClick);
        removeListener = null;
      }
    }

    container.addEventListener('click', onClick);
    removeListener = () => container.removeEventListener('click', onClick);
    return true;
  }

  if (!setupListener()) {
    const observer = new MutationObserver(() => {
      if (setupListener()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      removeListener?.();
    };
  }

  return () => removeListener?.();
}

function initAchievements(pathname: string): () => void {
  // Explorador — páginas únicas visitadas nesta sessão
  const pageKey = pathname.replace(/^\//, '').split('/')[0] || 'home';
  sessionPagesVisited.add(pageKey);
  if (sessionPagesVisited.size >= 3) unlockAchievement('explorador');

  // Institucionalista
  if (pathname.includes('diretoria')) unlockAchievement('institucionalista');

  // Fiel torcedor
  checkFielTorcedor();

  // Dedicado — inicia apenas uma vez por sessão (não limpa na troca de rota)
  if (!dedicadoTrackerStarted && !isAchievementUnlocked('dedicado')) {
    dedicadoTrackerStarted = true;
    startActivityTracking(() => unlockAchievement('dedicado'));
  }

  const cleanups: Array<() => void> = [initConsumidorListener()];

  if (pathname === '/eventos' || pathname.startsWith('/eventos/')) {
    cleanups.push(initCuriosoListener());
  }

  return () => cleanups.forEach((fn) => fn());
}

// ================================================================
// EE5 — Easter Eggs de Horário
// ================================================================

function initMadrugador() {
  if (sessionStorage.getItem('magnatas_night_shown')) return;
  const h = new Date().getHours();
  if (h >= 4) return;

  sessionStorage.setItem('magnatas_night_shown', '1');

  function insert() {
    const footer = document.querySelector('footer');
    if (!footer) {
      setTimeout(insert, 300);
      return;
    }
    if (footer.querySelector('[data-ee="night"]')) return;
    const banner = document.createElement('div');
    banner.setAttribute('data-ee', 'night');
    banner.style.cssText = [
      'background:rgba(255,255,255,0.04)',
      'border-top:1px solid rgba(255,255,255,0.08)',
      'padding:10px 24px',
      'text-align:center',
      'font-size:12px',
      'color:rgba(255,255,255,0.45)',
      'font-family:inherit',
    ].join(';');
    banner.textContent = '😴 Ainda acordado? Todo economista sabe que sono é capital humano.';
    footer.insertBefore(banner, footer.firstChild);
  }

  setTimeout(insert, 800);
}

function initHorarioAula() {
  if (sessionStorage.getItem('magnatas_aula_shown')) return;

  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const dow = now.getDay();
  const isClassTime =
    dow >= 1 &&
    dow <= 5 &&
    (h === 19 || h === 20 || (h === 21 && m <= 29));

  if (!isClassTime) return;

  function attach() {
    const brandEl = document.querySelector<HTMLElement>('a.brand');
    if (!brandEl) {
      setTimeout(attach, 300);
      return;
    }
    if (brandEl.dataset.eeAula) return;
    brandEl.dataset.eeAula = '1';

    function onMouseEnter() {
      if (sessionStorage.getItem('magnatas_aula_shown')) return;
      sessionStorage.setItem('magnatas_aula_shown', '1');
      brandEl.removeEventListener('mouseenter', onMouseEnter);

      const tooltip = document.createElement('div');
      tooltip.setAttribute('data-ee', 'aula-tooltip');

      const arrow = document.createElement('div');
      arrow.style.cssText = [
        'position:absolute',
        'top:-6px',
        'width:0',
        'height:0',
        'border-left:6px solid transparent',
        'border-right:6px solid transparent',
        'border-bottom:6px solid #c0392b',
      ].join(';');

      tooltip.style.cssText = [
        'position:fixed',
        'visibility:hidden',
        'background:#0d1117',
        'border:1px solid #c0392b',
        'border-radius:8px',
        'padding:8px 14px',
        'font-size:12px',
        'color:#fff',
        'pointer-events:none',
        'z-index:99999',
        'opacity:0',
        'transition:opacity 0.2s',
        'white-space:nowrap',
        'font-family:inherit',
      ].join(';');
      tooltip.textContent = 'Não deveria estar em aula? 👀';
      tooltip.appendChild(arrow);
      document.body.appendChild(tooltip);

      const tipW = tooltip.offsetWidth || 220;
      const rect = brandEl.getBoundingClientRect();
      let left = rect.left + rect.width / 2 - tipW / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - tipW - 8));
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${rect.bottom + 10}px`;
      tooltip.style.visibility = '';

      const arrowX = rect.left + rect.width / 2 - left;
      arrow.style.left = `${Math.max(6, Math.min(arrowX, tipW - 6))}px`;
      arrow.style.transform = 'none';

      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          tooltip.style.opacity = '1';
        })
      );

      setTimeout(() => {
        tooltip.style.opacity = '0';
        setTimeout(() => tooltip.remove(), 300);
      }, 4000);
    }

    brandEl.addEventListener('mouseenter', onMouseEnter);
  }

  setTimeout(attach, 800);
}

// ----------------------------------------------------------------
// Ponto de entrada — chamar por página pública
// ----------------------------------------------------------------
export function initEasterEggs(): () => void {
  if (window.location.pathname.startsWith('/admin')) {
    return () => {};
  }

  const pathname = window.location.pathname;
  const isTouchOnly = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  const cleanups: Array<() => void> = [
    initPrecoDoubleClick(),
    initAchievements(pathname),
  ];

  if (!isTouchOnly) {
    cleanups.push(initMascoteCursor());
    cleanups.push(initEconomiaTooltip());
  }

  // EE5 — stateful, sem cleanup necessário (sessionStorage garante 1x por sessão)
  initMadrugador();
  initHorarioAula();

  return () => cleanups.forEach((fn) => fn());
}
