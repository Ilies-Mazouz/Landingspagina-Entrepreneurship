const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');
const sections = document.querySelectorAll('main .section');
const backToTopButton = document.querySelector('.back-to-top');

const navLinksById = new Map(
  Array.from(navLinks)
    .map((link) => {
      const href = link.getAttribute('href') || '';
      return href.startsWith('#') ? [href.slice(1), link] : null;
    })
    .filter(Boolean)
);

const setActiveNavLink = (sectionId) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${sectionId}`;
    link.classList.toggle('active', isActive);
  });
};

const toggleNavBlur = () => {
  if (window.scrollY > 18) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  if (backToTopButton) {
    backToTopButton.classList.toggle('visible', window.scrollY > 400);
  }
};

window.addEventListener('scroll', toggleNavBlur, { passive: true });
window.addEventListener('load', toggleNavBlur);

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('open');
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

if (backToTopButton) {
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if ('IntersectionObserver' in window) {
  document.body.classList.add('reveal-ready');

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  sections.forEach((section) => revealObserver.observe(section));

  // Active section observer (robust): use single threshold + explicit enter/leave handling
  const activeSectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const link = navLinksById.get(id);

        if (entry.intersectionRatio >= 0.3 && entry.isIntersecting) {
          // When a section meets the visibility threshold, activate its nav link
          navLinks.forEach((l) => l.classList.toggle('active', l === link));
        } else if (!entry.isIntersecting) {
          // If a section leaves the viewport remove its active state if present
          if (link && link.classList.contains('active')) {
            link.classList.remove('active');
          }
        }
      });
      // If no link is active (e.g., leaving a section), try to pick the most visible section
      const anyActive = Array.from(navLinks).some((l) => l.classList.contains('active'));
      if (!anyActive) {
        // compute intersection ratios for all observed sections and pick the largest
        let best = { id: null, ratio: 0 };
        sections.forEach((s) => {
          const rect = s.getBoundingClientRect();
          const visibleHeight = Math.max(0, Math.min(window.innerHeight, rect.bottom) - Math.max(0, rect.top));
          if (visibleHeight > best.ratio) {
            best = { id: s.id, ratio: visibleHeight };
          }
        });
        if (best.id) setActiveNavLink(best.id);
      }
    },
    {
      threshold: 0.3,
      rootMargin: '-20% 0px -60% 0px'
    }
  );

  sections.forEach((section) => activeSectionObserver.observe(section));
} else {
  sections.forEach((section) => section.classList.add('in-view'));
}

setActiveNavLink('hero');
