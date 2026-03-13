(function renderGRPage() {
    const timeline = document.getElementById('grTimeline');
    const quickJump = document.getElementById('grQuickJump');
    const milestones = Array.isArray(window.GR_CONTENT) ? window.GR_CONTENT : [];

    if (!timeline || !quickJump || milestones.length === 0) {
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

    quickJump.innerHTML = milestones.map((item) => `
        <a href="#${item.id}" class="gr-jump-link${item.status === 'coming-soon' ? ' is-muted' : ''}">${escapeHtml(item.number)}</a>
    `).join('');

    timeline.innerHTML = milestones.map((item) => `
        <article id="${item.id}" class="gr-milestone${item.status === 'coming-soon' ? ' is-coming-soon' : ''}">
            <div class="gr-milestone-head">
                <span class="gr-pill">${escapeHtml(item.number)}</span>
                <h2>${escapeHtml(item.title)}</h2>
                <p class="gr-milestone-subtitle">${escapeHtml(item.subtitle || '')}</p>
                <p class="gr-milestone-summary">${escapeHtml(item.summary || '')}</p>
            </div>
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
        </article>
    `).join('');
})();
