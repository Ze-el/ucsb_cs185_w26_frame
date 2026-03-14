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
        const isVideoResource = Boolean(resource.streamUrl || resource.downloadUrl || resource.type === 'Video' || resource.type === 'MP4');
        const externalUrl = resource.externalUrl ? escapeHtml(resource.externalUrl) : '';
        const hasExternalUrl = Boolean(externalUrl);

        if (!resource.url) {
            return `
                <li class="gr-resource-item is-missing">
                    <span class="resource-main">${label}</span>
                </li>
            `;
        }

        if (isVideoResource) {
            const streamUrl = resource.streamUrl ? escapeHtml(resource.streamUrl) : '';
            const downloadUrl = resource.downloadUrl ? escapeHtml(resource.downloadUrl) : escapeHtml(resource.url);
            const hasDownload = Boolean(downloadUrl);
            const hasStream = Boolean(streamUrl);
            return `
                <li class="gr-resource-item gr-resource-item-video">
                    <div class="resource-link resource-link-video">
                        <span class="resource-main">${label}</span>
                        <span class="resource-actions">
                            ${hasDownload ? `
                                <a
                                    href="${downloadUrl}"
                                    target="_blank"
                                    rel="noopener"
                                    download
                                    class="resource-icon-link"
                                    aria-label="Download ${label}"
                                    title="Download video"
                                >
                                    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                                        <path d="M10 2.2a1 1 0 0 1 1 1v7.03l2.06-2.06a1 1 0 0 1 1.41 1.42l-3.77 3.76a1 1 0 0 1-1.4 0L5.53 9.6a1 1 0 0 1 1.42-1.42L9 10.23V3.2a1 1 0 0 1 1-1Z"></path>
                                        <path d="M4.2 14.1a1 1 0 0 1 1 1v1.22h9.6V15.1a1 1 0 1 1 2 0v2.22a1 1 0 0 1-1 1H4.2a1 1 0 0 1-1-1V15.1a1 1 0 0 1 1-1Z"></path>
                                    </svg>
                                </a>
                            ` : ''}
                            ${hasStream ? `
                                <a
                                    href="${streamUrl}"
                                    target="_blank"
                                    rel="noopener"
                                    class="resource-icon-link"
                                    aria-label="Open ${label} on Vimeo"
                                    title="Open on Vimeo"
                                >
                                    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                                        <path d="M6.2 13.8a.9.9 0 0 1 0-1.27l6.02-6.03H8.1a.9.9 0 0 1 0-1.8h6.3a.9.9 0 0 1 .9.9v6.3a.9.9 0 1 1-1.8 0V7.76l-6.03 6.02a.9.9 0 0 1-1.27 0Z"></path>
                                    </svg>
                                </a>
                            ` : ''}
                        </span>
                    </div>
                </li>
            `;
        }

        if (hasExternalUrl) {
            return `
                <li class="gr-resource-item">
                    <div class="resource-link resource-link-with-action">
                        <a href="${resource.url}" target="_blank" rel="noopener" class="resource-main-link">
                            <span class="resource-main">${label}</span>
                        </a>
                        <span class="resource-actions">
                            <a
                                href="${externalUrl}"
                                target="_blank"
                                rel="noopener"
                                class="resource-icon-link"
                                aria-label="Open ${label} external link"
                                title="Open external link"
                            >
                                <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                                    <path d="M6.2 13.8a.9.9 0 0 1 0-1.27l6.02-6.03H8.1a.9.9 0 0 1 0-1.8h6.3a.9.9 0 0 1 .9.9v6.3a.9.9 0 1 1-1.8 0V7.76l-6.03 6.02a.9.9 0 0 1-1.27 0Z"></path>
                                </svg>
                            </a>
                        </span>
                    </div>
                </li>
            `;
        }

        return `
            <li class="gr-resource-item">
                <a href="${resource.url}" target="_blank" rel="noopener" class="resource-link">
                    <span class="resource-main">${label}</span>
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
            const embedUrl = escapeHtml(item.embedUrl || '');

            if (item.type === 'image') {
                return `
                    <figure class="gr-media-card gr-media-card-image">
                        <img src="${embedUrl}" alt="${title}" loading="lazy">
                        <figcaption>${title}</figcaption>
                    </figure>
                `;
            }

            if (item.type === 'figma') {
                return `
                    <figure class="gr-media-card gr-media-card-figma">
                        <iframe src="${embedUrl}" allowfullscreen title="${title}"></iframe>
                        <figcaption>${title}</figcaption>
                    </figure>
                `;
            }

            if (item.type === 'video') {
                const isLocalVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(item.embedUrl || '');

                if (isLocalVideo) {
                    return `
                        <figure class="gr-media-card gr-media-card-video">
                            <video controls preload="metadata" playsinline title="${title}">
                                <source src="${embedUrl}">
                                Your browser does not support the video tag.
                            </video>
                            <figcaption>${title}</figcaption>
                        </figure>
                    `;
                }

                return `
                    <figure class="gr-media-card gr-media-card-video">
                        <iframe src="${embedUrl}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${title}"></iframe>
                        <figcaption>${title}</figcaption>
                    </figure>
                `;
            }

            return `
                <figure class="gr-media-card">
                    <iframe src="${embedUrl}" title="${title}"></iframe>
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
