// Smooth scroll for same-page anchor links.
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') {
            return;
        }

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Active nav link highlighting (current section/page).
const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
const currentPagePath = window.location.pathname.replace(/\/+$/, '');
const setActiveNavLink = (activeLink) => {
    navLinks.forEach((link) => link.classList.remove('active'));
    if (activeLink) {
        activeLink.classList.add('active');
    }
};

const getUrlPath = (href) => new URL(href, window.location.href).pathname.replace(/\/+$/, '');
const getUrlHash = (href) => new URL(href, window.location.href).hash;
const getActiveHashesForLink = (link) => {
    const configuredHashes = (link.dataset.activeSections || '')
        .split(',')
        .map((hash) => hash.trim())
        .filter((hash) => hash.startsWith('#'));

    if (configuredHashes.length > 0) {
        return configuredHashes;
    }

    const fallbackHash = getUrlHash(link.getAttribute('href') || '');
    return fallbackHash ? [fallbackHash] : [];
};

const pageSectionLinks = navLinks
    .flatMap((link) => {
        const path = getUrlPath(link.getAttribute('href') || '');
        if (path !== currentPagePath) {
            return [];
        }

        return getActiveHashesForLink(link).map((hash) => ({
            link,
            path,
            hash
        }));
    })
    .filter((item) => document.querySelector(item.hash));

if (pageSectionLinks.length > 0) {
    const observedSections = pageSectionLinks
        .map((item) => ({
            link: item.link,
            section: document.querySelector(item.hash)
        }))
        .filter((item) => item.section);

    const sectionToLink = new Map(observedSections.map((item) => [item.section, item.link]));
    const visibleRatios = new Map();

    const scrollSpyObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    visibleRatios.set(entry.target, entry.intersectionRatio);
                } else {
                    visibleRatios.delete(entry.target);
                }
            });

            let activeSection = null;
            let bestRatio = 0;

            visibleRatios.forEach((ratio, sectionEl) => {
                if (ratio > bestRatio) {
                    bestRatio = ratio;
                    activeSection = sectionEl;
                }
            });

            setActiveNavLink(activeSection ? sectionToLink.get(activeSection) : null);
        },
        { threshold: 0.6 }
    );

    observedSections.forEach((item) => scrollSpyObserver.observe(item.section));
} else {
    const currentPageLink = navLinks.find((link) => getUrlPath(link.getAttribute('href') || '') === currentPagePath);
    setActiveNavLink(currentPageLink || null);
}

// Nav scroll effect.
const nav = document.getElementById('nav');
if (nav) {
    const isHomePage = Boolean(document.querySelector('.hero'));

    const updateNavState = () => {
        nav.classList.toggle('scrolled', window.scrollY > 100);
        nav.classList.toggle('brand-revealed', !isHomePage || window.scrollY > 40);
    };

    window.addEventListener('scroll', updateNavState, { passive: true });
    window.addEventListener('load', updateNavState);
    updateNavState();
}

// Mobile nav toggle.
const navToggle = document.querySelector('.nav-toggle');
const navLinksList = document.querySelector('.nav-links');
if (nav && navToggle && navLinksList) {
    const closeNavMenu = () => {
        nav.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
    };

    navToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinksList.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeNavMenu);
    });

    document.addEventListener('click', (event) => {
        if (!nav.classList.contains('nav-open')) {
            return;
        }

        const clickedInsideNav = nav.contains(event.target);
        if (!clickedInsideNav) {
            closeNavMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 920) {
            closeNavMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeNavMenu();
        }
    });
}

// Intersection Observer for fade-in animations.
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document
    .querySelectorAll('.problem-card, .flow-step, .step, .team-card')
    .forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

// Scroll-driven horizontal dynamics for research cards.
const researchCardsContainer = document.querySelector('.gr-cards-container');
if (researchCardsContainer) {
    const researchCards = Array.from(researchCardsContainer.querySelectorAll('.gr-card'));
    let researchRaf = null;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const resetResearchCardMotion = () => {
        researchCards.forEach((card) => {
            card.style.setProperty('--gr-scroll-y', '0px');
            card.style.setProperty('--gr-scroll-tilt', '0deg');
            card.style.setProperty('--gr-scroll-scale', '1');
            card.style.setProperty('--gr-scroll-opacity', '1');
            card.style.setProperty('--gr-scroll-blur', '0px');
            card.style.setProperty('--gr-focus', '0');
        });
    };

    const updateResearchCardMotion = () => {
        if (reducedMotionQuery.matches) {
            resetResearchCardMotion();
            researchRaf = null;
            return;
        }

        const containerRect = researchCardsContainer.getBoundingClientRect();
        const containerCenterX = containerRect.left + (containerRect.width / 2);
        const maxDistance = Math.max((containerRect.width / 2) + ((researchCards[0]?.getBoundingClientRect().width || 0) / 2), 1);

        researchCards.forEach((card) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + (cardRect.width / 2);
            const normalizedOffset = clamp((cardCenterX - containerCenterX) / maxDistance, -1, 1);
            const distance = Math.abs(normalizedOffset);
            const edgeFactor = clamp((distance - 0.9) / 0.1, 0, 1);

            const verticalOffset = Math.round(Math.pow(edgeFactor, 1.2) * 18);
            const tilt = (normalizedOffset * -8.5 * edgeFactor).toFixed(2);
            const scale = (1 - (edgeFactor * 0.11)).toFixed(3);
            const opacity = (1 - (edgeFactor * 0.18)).toFixed(3);
            const blur = (edgeFactor * 0.28).toFixed(2);
            const focus = (1 - edgeFactor).toFixed(3);

            card.style.setProperty('--gr-scroll-y', `${verticalOffset}px`);
            card.style.setProperty('--gr-scroll-tilt', `${tilt}deg`);
            card.style.setProperty('--gr-scroll-scale', scale);
            card.style.setProperty('--gr-scroll-opacity', opacity);
            card.style.setProperty('--gr-scroll-blur', `${blur}px`);
            card.style.setProperty('--gr-focus', focus);
        });

        researchRaf = null;
    };

    const scheduleResearchMotionUpdate = () => {
        if (researchRaf !== null) {
            return;
        }
        researchRaf = window.requestAnimationFrame(updateResearchCardMotion);
    };

    researchCardsContainer.addEventListener('scroll', scheduleResearchMotionUpdate, { passive: true });
    window.addEventListener('resize', scheduleResearchMotionUpdate);
    window.addEventListener('load', scheduleResearchMotionUpdate);
    if (typeof reducedMotionQuery.addEventListener === 'function') {
        reducedMotionQuery.addEventListener('change', scheduleResearchMotionUpdate);
    } else if (typeof reducedMotionQuery.addListener === 'function') {
        reducedMotionQuery.addListener(scheduleResearchMotionUpdate);
    }
    scheduleResearchMotionUpdate();
}
