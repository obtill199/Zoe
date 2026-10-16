(() => {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    document.documentElement.classList.add('reveal-ready');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Header + mobile book bar ---------- */
  const header = $('[data-header]');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  const mobileBook = $('[data-mobile-book]');
  const hero = $('.hero');
  if (mobileBook && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      mobileBook.classList.toggle('is-visible', !entry.isIntersecting);
    }).observe(hero);
  }

  /* ---------- Mobile menu ---------- */
  const toggle = $('.menu-toggle');
  const nav = $('#site-nav');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- Service tabs ---------- */
  const tablist = $('[data-tabs]');
  if (tablist) {
    const tabs = $$('[data-tab]', tablist);
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));

    const select = (i, focus) => {
      tabs.forEach((tab, j) => {
        const on = i === j;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
      });
      if (focus) tabs[i].focus();
    };

    tablist.setAttribute('role', 'tablist');
    tabs.forEach((tab, i) => {
      tab.setAttribute('role', 'tab');
      panels[i].setAttribute('role', 'tabpanel');
      panels[i].setAttribute('aria-labelledby', tab.id);
      tab.addEventListener('click', () => select(i));
      tab.addEventListener('keydown', (e) => {
        const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in keys)) return;
        e.preventDefault();
        select((keys[e.key] + tabs.length) % tabs.length, true);
      });
    });

    tablist.hidden = false;
    document.documentElement.classList.add('tabs-ready');
    select(0);
  }

  /* ---------- Results lightbox ---------- */
  const dialog = $('[data-lightbox]');
  const results = $$('[data-result]');
  if (dialog && results.length && typeof dialog.showModal === 'function') {
    const img = $('img', dialog);
    const count = $('[data-lightbox-count]', dialog);
    let index = 0;

    const show = (i) => {
      index = (i + results.length) % results.length;
      const thumb = $('img', results[index]);
      img.src = thumb.currentSrc || thumb.src;
      img.alt = thumb.alt;
      count.textContent = `${index + 1} / ${results.length}`;
    };

    results.forEach((link, i) => link.addEventListener('click', (e) => {
      e.preventDefault();
      show(i);
      dialog.showModal();
    }));
    $('[data-lightbox-prev]', dialog).addEventListener('click', () => show(index - 1));
    $('[data-lightbox-next]', dialog).addEventListener('click', () => show(index + 1));
    $('[data-lightbox-close]', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === 'ArrowLeft') show(index - 1);
    });
    dialog.addEventListener('close', () => results[index].focus());
  }

  /* ---------- Reviews carousel ---------- */
  const track = $('[data-review-track]');
  const prev = $('[data-review-prev]');
  const next = $('[data-review-next]');
  if (track && prev && next) {
    const step = () => {
      const card = $('.review', track);
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    };
    const behavior = reduceMotion ? 'auto' : 'smooth';
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior }));
    track.addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  }

  /* ---------- Hours: highlight today + open status (Wichita time) ---------- */
  // [open, close] in 24h decimal hours; null = closed. Keep in sync with the hours table.
  const HOURS = { 0: null, 1: null, 2: [11, 19], 3: [12, 19], 4: [9, 14], 5: [9, 15], 6: [9, 13.5] };
  const DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const fmt = (h) => {
    const hr = Math.floor(h);
    const min = Math.round((h - hr) * 60);
    const suffix = hr >= 12 ? 'PM' : 'AM';
    const h12 = ((hr + 11) % 12) + 1;
    return min ? `${h12}:${String(min).padStart(2, '0')} ${suffix}` : `${h12} ${suffix}`;
  };

  try {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
      }).formatToParts(new Date()).map((p) => [p.type, p.value])
    );
    const day = DAYS[parts.weekday];
    const now = (Number(parts.hour) % 24) + Number(parts.minute) / 60;
    const today = HOURS[day];

    const row = $(`.hours tr[data-day="${day}"]`);
    if (row) row.classList.add('is-today');

    const status = $('[data-open-status]');
    if (status) {
      if (today && now >= today[0] && now < today[1]) {
        status.textContent = `Open now · until ${fmt(today[1])}`;
        status.classList.add('is-open');
      } else if (today && now < today[0]) {
        status.textContent = `Opens today at ${fmt(today[0])}`;
      } else {
        status.textContent = 'Closed now';
      }
    }
  } catch (_) {
    /* Intl/timeZone unsupported: the static hours table still shows everything */
  }

  /* ---------- Footer year ---------- */
  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
