(() => {
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  const themeToggle = document.getElementById('themeToggle');
  const yearEl = document.getElementById('year');
  const worksGrid = document.getElementById('worksGrid');
  const worksMoreBtn = document.getElementById('worksMoreBtn');

  if (worksGrid) {
    const INITIAL_COUNT = 6;
    const cards = Array.from(worksGrid.querySelectorAll('.work-card'));
    const filterBtns = Array.from(document.querySelectorAll('.works__filter-btn'));
    const countEl = document.getElementById('worksCount');
    const moreText = worksMoreBtn && worksMoreBtn.querySelector('.works__more-text');
    let category = 'all';
    let expanded = false;

    const matches = (card) =>
      category === 'all' || card.dataset.category.split(' ').includes(category);

    const render = (animateFrom) => {
      const visible = cards.filter(matches);
      cards.forEach((card) => {
        card.classList.remove('is-revealing');
        card.style.animationDelay = '';
      });

      cards.forEach((card) => {
        const index = visible.indexOf(card);
        const shown = index !== -1 && (expanded || index < INITIAL_COUNT);
        card.classList.toggle('is-filtered', index === -1);
        card.classList.toggle('is-hidden-extra', index !== -1 && !shown);
        if (shown && animateFrom !== undefined && index >= animateFrom) {
          card.classList.add('is-revealing');
          card.style.animationDelay = Math.min((index - animateFrom) * 0.08, 0.8) + 's';
        }
      });

      if (countEl) {
        const shownCount = expanded ? visible.length : Math.min(INITIAL_COUNT, visible.length);
        countEl.textContent = `全 ${visible.length} 件中 ${shownCount} 件を表示`;
      }

      if (worksMoreBtn) {
        const needsToggle = visible.length > INITIAL_COUNT;
        worksMoreBtn.parentElement.hidden = !needsToggle;
        worksMoreBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        if (moreText) {
          moreText.textContent = expanded ? '閉じる' : `もっと見る（残り ${visible.length - INITIAL_COUNT} 件）`;
        }
      }
    };

    if (worksMoreBtn) {
      worksMoreBtn.addEventListener('click', () => {
        expanded = !expanded;
        render(expanded ? INITIAL_COUNT : undefined);
        if (!expanded) {
          worksGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        category = btn.dataset.filter;
        expanded = false;
        filterBtns.forEach((b) => {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        render(0);
      });
    });

    render();
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('theme', next);
      } catch (e) {
        /* localStorage unavailable */
      }
    });
  }

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (navToggle && nav) {
    const closeNav = () => {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    nav.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) closeNav();
    });
  }

  /* 現在表示中のセクションをナビゲーションに反映する（表示のみ・リンク先は変更しない） */
  const navLinks = Array.from(document.querySelectorAll('.nav__link[href^="#"]'));
  if (navLinks.length && 'IntersectionObserver' in window) {
    const linkById = new Map();
    navLinks.forEach((link) => {
      const id = link.getAttribute('href').slice(1);
      const section = id && document.getElementById(id);
      if (section) linkById.set(section, link);
    });

    if (linkById.size) {
      const setActive = (link) => {
        navLinks.forEach((l) => l.classList.toggle('is-active', l === link));
      };

      const spy = new IntersectionObserver(
        (entries) => {
          const hit = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (hit) setActive(linkById.get(hit.target));
        },
        { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
      );
      linkById.forEach((_link, section) => spy.observe(section));
    }
  }

  const revealTargets = document.querySelectorAll(
    '.section__title, .section__label, .about, .skill-group, .work-card, .timeline__item, .contact__list, .hero__greeting, .hero__name, .hero__title, .hero__lead, .hero__actions'
  );

  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }
})();
