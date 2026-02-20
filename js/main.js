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
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
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
    .querySelectorAll('.problem-card, .flow-step, .step, .gr-card, .team-card')
    .forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
