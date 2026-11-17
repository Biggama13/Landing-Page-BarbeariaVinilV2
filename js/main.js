(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tesouras (um único template reaproveitado)
  const tpl = $('#tpl-scissors');
  $$('[data-scissors]').forEach(el => el.appendChild(tpl.content.cloneNode(true)));

  // Abertura: a tesoura corta a tela ao meio e as metades se abrem
  const loader = $('#loader');
  const openPage = () => {
    loader.classList.add('go');
    setTimeout(() => loader.classList.add('gone'), 1300);
  };
  if (reduce) loader.classList.add('gone');
  else {
    let opened = false;
    const go = () => { if (!opened) { opened = true; setTimeout(openPage, 1400); } };
    addEventListener('load', go);
    setTimeout(go, 3500); // segurança
  }

  // Envolve o texto dos títulos para animar o corte sem esconder o próprio elemento
  $$('.cut-in').forEach(el => { const s = document.createElement('span'); s.innerHTML = el.innerHTML; el.replaceChildren(s); });

  // Revela títulos e divisores (corte) ao entrar na tela
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  }), { threshold: .15 });
  $$('.cut-in').forEach(el => io.observe(el));
  // Divisores: a tesoura corta em loop enquanto o divisor está visível
  const cutIO = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('in', e.isIntersecting)), { threshold: 0 });
  $$('[data-cut]').forEach(el => cutIO.observe(el));

  // Segurança: nada fica escondido se o observer falhar
  setTimeout(() => $$('.cut-in').forEach(el => el.classList.add('in')), 6000);

  // Menu mobile
  const burger = $('#burger'), menu = $('#menu');
  const toggle = open => {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  };
  burger.addEventListener('click', () => toggle(!menu.classList.contains('open')));
  menu.addEventListener('click', e => e.target.closest('a') && toggle(false));

  // Abas das unidades
  const tabs = $$('[role=tab]');
  const select = tab => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    tab.focus({ preventScroll: true });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) select(tabs[(i + k + tabs.length) % tabs.length]);
    });
  });

  // Aberto agora? (horário de Brasília: terça a sábado, 9h às 20h)
  const dot = $('#statusDot'), txt = $('#statusText');
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', hour12: false }).formatToParts(new Date());
  const wd = parts.find(p => p.type === 'weekday').value, h = +parts.find(p => p.type === 'hour').value % 24;
  const openDay = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(wd);
  if (openDay && h >= 9 && h < 20) { dot.classList.add('on'); txt.textContent = 'Aberto agora, até as 20h'; }
  else txt.textContent = 'Fechado agora. Abrimos de terça a sábado, das 9h às 20h';

  // Barra fixa de CTA no mobile
  const sticky = $('#sticky'), hero = $('.hero');
  new IntersectionObserver(([e]) => sticky.classList.toggle('show', !e.isIntersecting), { threshold: .15 }).observe(hero);

  $('#year').textContent = new Date().getFullYear();
})();
