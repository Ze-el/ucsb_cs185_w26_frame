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

const pageSectionLinks = navLinks
    .map((link) => ({
        link,
        path: getUrlPath(link.getAttribute('href') || ''),
        hash: getUrlHash(link.getAttribute('href') || '')
    }))
    .filter((item) => item.path === currentPagePath && item.hash.startsWith('#') && document.querySelector(item.hash));

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

// Scroll-driven vertical dynamics for research cards.
const researchCardsContainer = document.querySelector('.gr-cards-container');
if (researchCardsContainer) {
    const researchCards = Array.from(researchCardsContainer.querySelectorAll('.gr-card'));
    let researchRaf = null;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const updateResearchCardMotion = () => {
        const containerRect = researchCardsContainer.getBoundingClientRect();
        const containerCenterX = containerRect.left + (containerRect.width / 2);
        const maxDistance = (containerRect.width / 2) + ((researchCards[0]?.getBoundingClientRect().width || 0) / 2);

        researchCards.forEach((card) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + (cardRect.width / 2);
            const normalizedDistance = clamp(Math.abs(cardCenterX - containerCenterX) / maxDistance, 0, 1);
            const verticalOffset = Math.round(Math.pow(normalizedDistance, 1.35) * 26);
            card.style.setProperty('--gr-scroll-offset', `${verticalOffset}px`);
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
    scheduleResearchMotionUpdate();
}
