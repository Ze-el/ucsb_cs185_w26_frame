// Smooth scroll for same-page anchor links.
const nav = document.getElementById('nav');
const getStickyOffset = () => {
    const cssOffset = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--scroll-offset')
    );
    if (Number.isFinite(cssOffset)) {
        return cssOffset;
    }

    if (nav) {
        return Math.ceil(nav.getBoundingClientRect().bottom) + 18;
    }

    return 0;
};

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') {
            return;
        }

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const offset = getStickyOffset();
            const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({
                top: Math.max(targetTop, 0),
                behavior: 'smooth'
            });
        }
    });
});

// Active nav link highlighting (current section/page).
const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
const primaryNavLinks = navLinks.filter((link) => !link.closest('.nav-submenu'));
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

const pageSectionLinks = primaryNavLinks
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

    let navSpyRaf = null;
    const getProbeY = () => {
        const stickyOffset = getStickyOffset();
        const viewportDepth = Math.min(window.innerHeight * 0.22, 220);
        return stickyOffset + Math.max(viewportDepth, 36);
    };
    const updateActiveSection = () => {
        const probeY = getProbeY();
        let active = null;

        observedSections.forEach((item) => {
            const rect = item.section.getBoundingClientRect();
            if (rect.top <= probeY && rect.bottom > probeY) {
                active = item;
            }
        });

        if (!active) {
            const firstTop = observedSections[0]?.section.getBoundingClientRect().top;
            if (typeof firstTop === 'number' && firstTop > probeY) {
                setActiveNavLink(null);
                navSpyRaf = null;
                return;
            }

            active = observedSections[observedSections.length - 1];
        }

        setActiveNavLink(active ? active.link : null);
        navSpyRaf = null;
    };
    const scheduleNavSpyUpdate = () => {
        if (navSpyRaf !== null) {
            return;
        }
        navSpyRaf = window.requestAnimationFrame(updateActiveSection);
    };

    const scrollSpyObserver = new IntersectionObserver(scheduleNavSpyUpdate, {
        threshold: [0, 0.1, 0.25, 0.5]
    });
    observedSections.forEach((item) => scrollSpyObserver.observe(item.section));
    window.addEventListener('scroll', scheduleNavSpyUpdate, { passive: true });
    window.addEventListener('resize', scheduleNavSpyUpdate);
    window.addEventListener('load', scheduleNavSpyUpdate);
    scheduleNavSpyUpdate();
} else {
    const currentPageLink = primaryNavLinks.find((link) => getUrlPath(link.getAttribute('href') || '') === currentPagePath);
    setActiveNavLink(currentPageLink || null);
}

// Nav scroll effect.
if (nav) {
    const isHomePage = Boolean(document.querySelector('.hero'));
    const updateNavMetrics = () => {
        const navBottom = Math.ceil(nav.getBoundingClientRect().bottom);
        document.documentElement.style.setProperty('--primary-nav-bottom', `${navBottom}px`);

        const grSubnav = document.querySelector('.gr-subnav-shell');
        if (grSubnav) {
            const grSubnavHeight = Math.ceil(grSubnav.getBoundingClientRect().height);
            document.documentElement.style.setProperty('--gr-subnav-height', `${grSubnavHeight}px`);
            document.documentElement.style.setProperty('--scroll-offset', `${navBottom + grSubnavHeight + 18}px`);
            return;
        }

        document.documentElement.style.removeProperty('--gr-subnav-height');
        document.documentElement.style.setProperty('--scroll-offset', `${navBottom + 18}px`);
    };

    const updateNavState = () => {
        nav.classList.toggle('scrolled', window.scrollY > 100);
        nav.classList.toggle('brand-revealed', !isHomePage || window.scrollY > 40);
        updateNavMetrics();
    };

    window.addEventListener('scroll', updateNavState, { passive: true });
    window.addEventListener('load', updateNavState);
    window.addEventListener('resize', updateNavState);
    updateNavState();
}

// Mobile nav toggle.
const navToggle = document.querySelector('.nav-toggle');
const navLinksList = document.querySelector('.nav-links');
if (nav && navToggle && navLinksList) {
    const researchSubmenuToggle = nav.querySelector('.nav-submenu-toggle');
    const researchSubmenu = nav.querySelector('.nav-submenu');
    const researchSubmenuParent = researchSubmenu ? researchSubmenu.closest('.nav-item-has-submenu') : null;
    let submenuTransitionCleanup = null;

    const clearSubmenuTransition = () => {
        if (typeof submenuTransitionCleanup === 'function') {
            submenuTransitionCleanup();
            submenuTransitionCleanup = null;
        }
    };

    const setSubmenuExpanded = (expanded) => {
        if (!researchSubmenuToggle || !researchSubmenu || !researchSubmenuParent) {
            return;
        }

        researchSubmenuToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        researchSubmenuParent.classList.toggle('is-expanded', expanded);
    };

    const openResearchSubmenu = (animated = true) => {
        if (!researchSubmenu) {
            return;
        }

        clearSubmenuTransition();
        setSubmenuExpanded(true);
        researchSubmenu.hidden = false;

        const endHeight = researchSubmenu.scrollHeight;
        if (!animated) {
            researchSubmenu.style.height = 'auto';
            researchSubmenu.style.opacity = '1';
            researchSubmenu.style.transform = 'translateY(0)';
            return;
        }

        researchSubmenu.style.height = '0px';
        researchSubmenu.style.opacity = '0';
        researchSubmenu.style.transform = 'translateY(-6px)';
        void researchSubmenu.offsetHeight;
        researchSubmenu.style.height = `${endHeight}px`;
        researchSubmenu.style.opacity = '1';
        researchSubmenu.style.transform = 'translateY(0)';

        const onTransitionEnd = (event) => {
            if (event.target !== researchSubmenu || event.propertyName !== 'height') {
                return;
            }
            researchSubmenu.style.height = 'auto';
            researchSubmenu.removeEventListener('transitionend', onTransitionEnd);
            submenuTransitionCleanup = null;
        };
        researchSubmenu.addEventListener('transitionend', onTransitionEnd);
        submenuTransitionCleanup = () => {
            researchSubmenu.removeEventListener('transitionend', onTransitionEnd);
        };
    };

    const closeResearchSubmenu = () => {
        if (!researchSubmenuToggle || !researchSubmenu) {
            return;
        }

        clearSubmenuTransition();
        setSubmenuExpanded(false);

        if (researchSubmenu.hidden) {
            return;
        }

        const startHeight = researchSubmenu.scrollHeight;
        researchSubmenu.style.height = `${startHeight}px`;
        researchSubmenu.style.opacity = '1';
        researchSubmenu.style.transform = 'translateY(0)';
        void researchSubmenu.offsetHeight;
        researchSubmenu.style.height = '0px';
        researchSubmenu.style.opacity = '0';
        researchSubmenu.style.transform = 'translateY(-6px)';

        const onTransitionEnd = (event) => {
            if (event.target !== researchSubmenu || event.propertyName !== 'height') {
                return;
            }
            researchSubmenu.hidden = true;
            researchSubmenu.style.height = '';
            researchSubmenu.style.opacity = '';
            researchSubmenu.style.transform = '';
            researchSubmenu.removeEventListener('transitionend', onTransitionEnd);
            submenuTransitionCleanup = null;
        };
        researchSubmenu.addEventListener('transitionend', onTransitionEnd);
        submenuTransitionCleanup = () => {
            researchSubmenu.removeEventListener('transitionend', onTransitionEnd);
        };
    };

    const closeNavMenu = () => {
        nav.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
        closeResearchSubmenu();
    };

    navToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (!isOpen) {
            closeResearchSubmenu();
        }
    });

    navLinksList.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeNavMenu);
    });

    if (researchSubmenuToggle && researchSubmenu) {
        researchSubmenuToggle.addEventListener('click', (event) => {
            event.preventDefault();
            const isExpanded = researchSubmenuToggle.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                closeResearchSubmenu();
            } else {
                openResearchSubmenu(true);
            }
        });
    }

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
        if (window.innerWidth > 1180) {
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
