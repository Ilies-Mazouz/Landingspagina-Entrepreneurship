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

  const activeSectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const matchingLink = navLinksById.get(entry.target.id);
        if (matchingLink) {
          setActiveNavLink(entry.target.id);
        }
      });
    },
    {
      threshold: 0.38,
      rootMargin: '-30% 0px -55% 0px'
    }
  );

  sections.forEach((section) => activeSectionObserver.observe(section));
} else {
  sections.forEach((section) => section.classList.add('in-view'));
}

setActiveNavLink('hero');
