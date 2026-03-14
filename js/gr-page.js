(function renderGRPage() {
    const timeline = document.getElementById('grTimeline');
    const milestones = Array.isArray(window.GR_CONTENT) ? window.GR_CONTENT : [];

    if (!timeline || milestones.length === 0) {
        return;
    }

    const escapeHtml = (value) => String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

    const renderResource = (resource) => {
        const label = escapeHtml(resource.label);
        const type = escapeHtml(resource.type || 'Resource');

        if (!resource.url) {
            return `
                <li class="gr-resource-item is-missing">
                    <span class="resource-main">${label}</span>
                    <span class="resource-meta">${type}</span>
                    <span class="resource-status">Coming soon</span>
                </li>
            `;
        }

        return `
            <li class="gr-resource-item">
                <a href="${resource.url}" target="_blank" rel="noopener" class="resource-link">
                    <span class="resource-main">${label}</span>
                    <span class="resource-meta">${type}</span>
                    <span class="resource-status">Open</span>
                </a>
            </li>
        `;
    };

    const renderMedia = (media) => {
        if (!media || media.length === 0) {
            return `
                <div class="gr-media-placeholder">
                    <p>Primary artifacts are listed above.</p>
                </div>
            `;
        }

        return media.map((item) => {
            const title = escapeHtml(item.title || 'Embedded media');

            if (item.type === 'figma') {
                return `
                    <figure class="gr-media-card gr-media-card-figma">
                        <iframe src="${item.embedUrl}" allowfullscreen title="${title}"></iframe>
                        <figcaption>${title}</figcaption>
                    </figure>
                `;
            }

            if (item.type === 'video') {
                return `
                    <figure class="gr-media-card gr-media-card-video">
                        <iframe src="${item.embedUrl}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${title}"></iframe>
                        <figcaption>${title}</figcaption>
                    </figure>
                `;
            }

            return `
                <figure class="gr-media-card">
                    <iframe src="${item.embedUrl}" title="${title}"></iframe>
                    <figcaption>${title}</figcaption>
                </figure>
            `;
        }).join('');
    };

    timeline.innerHTML = milestones.map((item) => `
        <article id="${item.id}" class="gr-milestone${item.status === 'coming-soon' ? ' is-coming-soon' : ''}">
            <div class="gr-milestone-head">
                <button
                    type="button"
                    class="gr-milestone-toggle"
                    id="${item.id}-toggle"
                    aria-expanded="true"
                    aria-controls="${item.id}-panel"
                >
                    <span class="gr-pill">${escapeHtml(item.number)}</span>
                    <span class="gr-toggle-copy">
                        <span class="gr-toggle-title">${escapeHtml(item.title)}</span>
                        <span class="gr-toggle-subtitle">${escapeHtml(item.subtitle || '')}</span>
                    </span>
                    <span class="gr-toggle-icon" aria-hidden="true"></span>
                </button>
                <p class="gr-milestone-summary">${escapeHtml(item.summary || '')}</p>
            </div>
            <div class="gr-milestone-panel" id="${item.id}-panel" role="region" aria-labelledby="${item.id}-toggle">
                <div class="gr-milestone-body">
                <div class="gr-resources-panel">
                    <h3>Deliverables</h3>
                    <ul class="gr-resources-list">
                        ${item.resources.map(renderResource).join('')}
                    </ul>
                </div>
                <div class="gr-media-panel">
                    ${renderMedia(item.media)}
                </div>
            </div>
            </div>
        </article>
    `).join('');

    const milestoneEls = Array.from(timeline.querySelectorAll('.gr-milestone'));
    const mobileAccordionQuery = window.matchMedia('(max-width: 900px)');

    const getMilestoneById = (id) => milestoneEls.find((milestone) => milestone.id === id);
    const getMilestoneParts = (milestone) => ({
        toggle: milestone.querySelector('.gr-milestone-toggle'),
        panel: milestone.querySelector('.gr-milestone-panel')
    });
    const getHashId = () => window.location.hash.replace(/^#/, '');
    const setMilestoneExpanded = (milestone, expanded) => {
        const { toggle, panel } = getMilestoneParts(milestone);
        if (!toggle || !panel) {
            return;
        }
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        panel.hidden = !expanded;
    };

    const expandMilestoneById = (id) => {
        const target = getMilestoneById(id);
        if (!target) {
            return;
        }

        milestoneEls.forEach((milestone) => {
            setMilestoneExpanded(milestone, milestone === target);
        });
    };

    const syncMode = () => {
        const isAccordionMode = mobileAccordionQuery.matches;
        timeline.classList.toggle('is-accordion-mode', isAccordionMode);

        milestoneEls.forEach((milestone) => {
            const { toggle } = getMilestoneParts(milestone);
            if (!toggle) {
                return;
            }
            toggle.disabled = !isAccordionMode;
            toggle.setAttribute('aria-disabled', String(!isAccordionMode));
        });

        if (!isAccordionMode) {
            milestoneEls.forEach((milestone) => setMilestoneExpanded(milestone, true));
            return;
        }

        const preferredId = getHashId() || milestoneEls[0]?.id;
        if (preferredId) {
            expandMilestoneById(preferredId);
        }
    };

    milestoneEls.forEach((milestone) => {
        const { toggle } = getMilestoneParts(milestone);
        if (!toggle) {
            return;
        }

        toggle.addEventListener('click', () => {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                setMilestoneExpanded(milestone, false);
                return;
            }

            expandMilestoneById(milestone.id);
        });
    });

    window.addEventListener('hashchange', () => {
        const hashId = getHashId();
        if (!hashId) {
            return;
        }
        if (mobileAccordionQuery.matches) {
            expandMilestoneById(hashId);
        }
    });

    if (typeof mobileAccordionQuery.addEventListener === 'function') {
        mobileAccordionQuery.addEventListener('change', syncMode);
    } else if (typeof mobileAccordionQuery.addListener === 'function') {
        mobileAccordionQuery.addListener(syncMode);
    }

    syncMode();
})();
