// ============================================================
// properties.js – Right sidebar properties panel
// ============================================================

const Properties = (() => {
    let _currentTab = 'design';
    let _panelMode = 'properties';
    let _foldSections = false;
    const _panelScrollPositions = {};
    let _pendingPanelFocus = null;
    const ROOT_CASCADE_KEYS = new Set(['textColor', 'fontSize', 'fontFamily', 'lineHeight', 'letterSpacing']);
    const ROOT_BACKGROUND_KEYS = new Set(['bgColor', 'background']);
    const SECTION_STYLE_TYPES = new Set([
        'navbar', 'hero', 'about', 'services', 'contact', 'footer', 'testimonials',
        'stats', 'container', 'box', 'video', 'image', 'pricing', 'videoCarousel',
        'products', 'roadmap', 'cta', 'carousel', 'promoCarousel',
        'casinoHero', 'casinoNavbar', 'casinoFooter', 'partnerCards',
        'videoRecommendations', 'gameCarousel', 'faqAccordion', 'seoContent',
        'animatedBg', 'goldHeading', 'promoBadgeCard', 'lightboxVideo',
        'gameCard', 'scrollAnimSection'
    ]);
    let _skipAutoRenderOnce = false;
    const TEXT_OPTIONS = {
        fontSize: ['10px', '11px', '12px', '13px', '14px', '15px', '16px', '18px', '20px', '22px', '24px', '28px', '32px', '36px', '40px', '48px', '56px', '64px', '72px', '80px', '96px', 'clamp(1.5rem, 4vw, 3rem)'],
        fontFamily: [
            'inherit',
            'Inter, sans-serif',
            'Poppins, sans-serif',
            'Montserrat, sans-serif',
            'Roboto, sans-serif',
            'Open Sans, sans-serif',
            'Lato, sans-serif',
            'Nunito, sans-serif',
            'Raleway, sans-serif',
            'Playfair Display, serif',
            'Merriweather, serif',
            'Georgia, serif',
            '"Times New Roman", serif',
            '"Courier New", monospace',
            'monospace',
            'system-ui, sans-serif'
        ],
        lineHeight: ['0.9', '1', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '2', '2.2', '2.5', 'normal'],
        letterSpacing: ['-2px', '-1px', '-0.5px', '0', '0.25px', '0.5px', '0.75px', '1px', '1.5px', '2px', '3px', '4px', '0.05em', '0.1em'],
        width: ['auto', 'fit-content', 'max-content', 'min-content', '25%', '33.33%', '50%', '66.66%', '75%', '80%', '90%', '100%', '120px', '160px', '200px', '240px', '280px', '320px', '400px', '480px', '600px', '768px', '960px', '1200px', '100vw'],
        height: ['auto', 'fit-content', '40px', '60px', '80px', '100px', '120px', '160px', '200px', '240px', '320px', '400px', '480px', '560px', '640px', '100%', '50vh', '75vh', '100vh'],
        minWidth: ['0', '80px', '120px', '160px', '200px', '240px', '280px', '320px', '400px', '480px', '50%', '100%'],
        minHeight: ['0', '40px', '60px', '80px', '100px', '120px', '160px', '200px', '240px', '320px', '50vh', '100vh'],
        maxWidth: ['none', '160px', '240px', '320px', '400px', '480px', '600px', '768px', '960px', '1140px', '1200px', '1400px', '100%'],
        maxHeight: ['none', '80px', '120px', '160px', '200px', '240px', '320px', '400px', '480px', '560px', '640px', '80vh', '100vh'],
        margin: ['0', '2px', '4px', '6px', '8px', '10px', '12px', '16px', '20px', '24px', '32px', '40px', '48px', '64px', '0 auto', 'auto'],
        padding: ['0', '2px', '4px', '6px', '8px', '10px', '12px', '16px', '20px', '24px', '32px', '40px', '48px', '64px'],
        gap: ['0', '2px', '4px', '6px', '8px', '10px', '12px', '16px', '20px', '24px', '32px', '40px', '48px', '64px'],
        borderRadius: ['0', '2px', '4px', '6px', '8px', '10px', '12px', '16px', '20px', '24px', '32px', '40px', '50%', '999px'],
        borderWidth: ['0', '1px', '2px', '3px', '4px', '5px', '6px', '8px', '10px'],
        top: ['auto', '0', '2px', '4px', '8px', '12px', '16px', '20px', '24px', '32px', '40px', '50%', '100%'],
        bottom: ['auto', '0', '2px', '4px', '8px', '12px', '16px', '20px', '24px', '32px', '40px', '50%', '100%'],
        left: ['auto', '0', '2px', '4px', '8px', '12px', '16px', '20px', '24px', '32px', '40px', '50%', '100%'],
        right: ['auto', '0', '2px', '4px', '8px', '12px', '16px', '20px', '24px', '32px', '40px', '50%', '100%'],
        background: ['transparent', 'none', '#ffffff', '#f8fafc', '#e2e8f0', '#111827', '#000000',
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            'linear-gradient(135deg, #BF953F, #FCF6BA, #B38728)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #43e97b, #38f9d7)',
            'linear-gradient(135deg, #fa709a, #fee140)',
            'linear-gradient(135deg, #a18cd1, #fbc2eb)',
            'linear-gradient(to right, #ff0000, #ff8000, #ffff00, #00ff00, #0080ff, #8000ff)',
            'radial-gradient(circle, #ffffff 0%, #e2e8f0 100%)',
            'radial-gradient(circle, #BF953F 0%, transparent 70%)',
            'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #00ff00, #0080ff, #8000ff, #ff0080, #ff0000)'],
        boxShadow: ['none', '0 1px 2px rgba(0,0,0,0.08)', '0 2px 8px rgba(0,0,0,0.12)', '0 4px 16px rgba(0,0,0,0.14)', '0 8px 24px rgba(0,0,0,0.18)', '0 12px 40px rgba(0,0,0,0.22)', '0 20px 60px rgba(0,0,0,0.28)', 'inset 0 1px 2px rgba(0,0,0,0.12)'],
        zIndex: ['0', '1', '2', '5', '10', '20', '50', '100', '500', '1000', '9999'],
        blur: ['0', '2px', '4px', '6px', '8px', '12px', '16px', '20px'],
        opacity: ['0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1'],
        flexGrow: ['0', '1', '2', '3', '4', '5'],
        flexShrink: ['0', '1', '2', '3', '4', '5'],
        gridTemplateColumns: [
            '1fr', '1fr 1fr', '1fr 1fr 1fr', '1fr 1fr 1fr 1fr',
            'repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(4, 1fr)',
            'repeat(auto-fit, minmax(200px, 1fr))', 'repeat(auto-fit, minmax(250px, 1fr))',
            'repeat(auto-fit, minmax(300px, 1fr))', 'repeat(auto-fill, minmax(200px, 1fr))',
            '2fr 1fr', '1fr 2fr', '1fr 3fr', '3fr 1fr',
            'auto 1fr', '1fr auto', 'auto 1fr auto'
        ],
        gridTemplateRows: ['auto', '1fr', '1fr 1fr', 'auto 1fr', 'auto 1fr auto', 'min-content auto', '100px auto'],
        columnGap: ['0', '4px', '8px', '12px', '16px', '20px', '24px', '32px', '40px', '48px'],
        rowGap: ['0', '4px', '8px', '12px', '16px', '20px', '24px', '32px', '40px', '48px'],
        flexBasis: ['auto', '0', '25%', '33.33%', '50%', '66.66%', '75%', '100%', '120px', '200px', '300px'],
        borderGradient: [
            'linear-gradient(135deg, #BF953F, #FCF6BA, #B38728)',
            'linear-gradient(90deg, #ff0000, #ff8000, #ffff00, #00ff00, #0080ff, #8000ff, #ff0080)',
            'linear-gradient(135deg, #667eea, #764ba2)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #43e97b, #38f9d7)',
            'linear-gradient(135deg, #fa709a, #fee140)',
            'linear-gradient(135deg, #a18cd1, #fbc2eb)',
            'linear-gradient(135deg, #ffd700, #ff8c00, #ff0080)',
            'linear-gradient(135deg, #00c6ff, #0072ff)',
            'linear-gradient(var(--rainbow-angle,0deg), #ff0000, #ff8000, #ffff00, #00ff00, #0080ff, #8000ff, #ff0080)',
            'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #00ff00, #0080ff, #8000ff, #ff0080, #ff0000)'
        ],
        hoverShadow: [
            'none',
            '0 4px 15px rgba(0,0,0,0.2)',
            '0 8px 25px rgba(0,0,0,0.3)',
            '0 12px 40px rgba(0,0,0,0.4)',
            '0 0 20px rgba(191,149,63,0.6)',
            '0 0 30px rgba(191,149,63,0.8)',
            '0 0 25px rgba(255,230,172,1)',
            '0 0 20px rgba(99,102,241,0.6)',
            '0 0 20px rgba(239,68,68,0.6)',
            '0 0 20px rgba(16,185,129,0.6)',
            '0 0 30px rgba(96,165,250,0.6)',
            '0 20px 60px rgba(0,0,0,0.5)'
        ],
        hoverScale: ['1.02', '1.03', '1.05', '1.08', '1.1', '1.15', '0.98', '0.95'],
        hoverBorderColor: ['#BF953F', '#ffd700', '#ff0080', '#00ff88', '#60a5fa', '#a855f7', '#ef4444', '#ffffff', 'transparent']
    };

    function getScrollKey(block = null) {
        const activeBlock = block || State.getBlock(State.getSelectedId());
        const blockPart = activeBlock ? activeBlock.id : 'none';
        const subPart = State.getSelectedSubPath() || 'root';
        return `${_panelMode}:${blockPart}:${subPart}:${_currentTab}`;
    }

    function saveCurrentScrollPosition() {
        const body = document.querySelector('#propPanelContent .prop-body');
        if (!body) return;
        _panelScrollPositions[getScrollKey()] = body.scrollTop;
    }

    function restoreScrollPosition(block, body) {
        if (!body) return;
        const key = getScrollKey(block);
        const savedTop = _panelScrollPositions[key];
        body.scrollTop = typeof savedTop === 'number' ? savedTop : 0;
        body.addEventListener('scroll', () => {
            _panelScrollPositions[key] = body.scrollTop;
        }, { passive: true });
    }

    function applySectionWideChange(blockId, key, value) {
        const block = State.getBlock(blockId);
        const blockEl = document.getElementById('block_' + blockId);
        if (!block || !blockEl) {
            State.updateBlockProps(blockId, { [key]: value });
            return;
        }

        const nextSubStyles = JSON.parse(JSON.stringify(block.props.subStyles || {}));
        const rootUpdates = { [key]: value, subStyles: nextSubStyles };

        const paths = new Set();
        blockEl.querySelectorAll('[data-sf-path]').forEach((el) => {
            const path = el.getAttribute('data-sf-path');
            if (path) paths.add(path);
        });

        paths.forEach((path) => {
            if (!nextSubStyles[path]) nextSubStyles[path] = {};
            const styleKey = key === 'textColor' ? 'color' : key;
            nextSubStyles[path][styleKey] = value;
        });

        if (key === 'textColor' && block.props.textColor !== undefined) {
            rootUpdates.textColor = value;
        }
        if (key === 'fontFamily' && block.props.fontFamily !== undefined) {
            rootUpdates.fontFamily = value;
        }

        State.updateBlockProps(blockId, rootUpdates);
    }

    function init() {
        State.on('selectionChanged', (id) => {
            if (_panelMode !== 'properties') return;
            saveCurrentScrollPosition();
            if (id) renderPanel(State.getBlock(id));
            else renderEmpty();
        });
        State.on('subSelectionChanged', () => {
            if (_panelMode !== 'properties') return;
            saveCurrentScrollPosition();
            const id = State.getSelectedId();
            if (id) renderPanel(State.getBlock(id));
        });
        State.on('blockUpdated', (id) => {
            if (_panelMode !== 'properties') return;
            if (id === State.getSelectedId()) {
                if (_skipAutoRenderOnce) {
                    _skipAutoRenderOnce = false;
                    return;
                }
                const panelEl = document.getElementById('propPanelContent');
                if (panelEl && panelEl.contains(document.activeElement)) {
                    return;
                }
                saveCurrentScrollPosition();
                renderPanel(State.getBlock(id));
            }
        });
    }

    function renderEmpty() {
        _panelMode = 'properties';
        saveCurrentScrollPosition();
        document.getElementById('propPanelContent').innerHTML = `
      <div class="prop-empty">
        <i class="fa-solid fa-arrow-pointer"></i>
        <p>Click any element on the canvas to edit its properties.</p>
      </div>`;
    }

    function renderPanel(block) {
        if (!block) { renderEmpty(); return; }
        _panelMode = 'properties';
        const def = BlockTypes[block.type];
        const panel = document.getElementById('propPanelContent');
        saveCurrentScrollPosition();
        panel.innerHTML = '';

        // --- Header ---
        const header = document.createElement('div');
        header.className = 'prop-header';
        
        const subPath = State.getSelectedSubPath();
        const headerTitle = subPath ? `Sub-element` : def.label;
        
        const titleWrap = document.createElement('div');
        titleWrap.className = 'prop-title';
        titleWrap.style.cssText = 'display:flex;align-items:center;gap:4px;';
        
        if (subPath) {
            const backBtn = document.createElement('button');
            backBtn.className = 'btn-icon';
            backBtn.style.cssText = 'margin-right:4px;font-size:0.85rem;opacity:0.7;padding:4px 6px;border-radius:4px;';
            backBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
            backBtn.title = 'Back to block properties';
            backBtn.onclick = () => State.setSelectedSubPath(null);
            titleWrap.appendChild(backBtn);
        }
        
        const titleContent = document.createElement('span');
        titleContent.innerHTML = `<i class="${def.icon}"></i> ${headerTitle}`;
        titleWrap.appendChild(titleContent);
        header.appendChild(titleWrap);

        // Fold/Unfold toggle
        const foldLabel = document.createElement('label');
        foldLabel.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer;font-size:0.68rem;color:var(--text3);margin-left:auto;margin-right:8px;user-select:none;';
        const foldCheck = document.createElement('input');
        foldCheck.type = 'checkbox';
        foldCheck.checked = !!_foldSections;
        foldCheck.style.cssText = 'width:14px;height:14px;cursor:pointer;accent-color:var(--accent);';
        const foldText = document.createElement('span');
        foldText.textContent = 'Fold';
        foldLabel.appendChild(foldCheck);
        foldLabel.appendChild(foldText);
        header.appendChild(foldLabel);
        
        panel.appendChild(header);

        // --- Tabs ---
        const tabs = document.createElement('div');
        tabs.className = 'prop-tabs';
        ['design', 'content', 'advanced'].forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'tab-btn' + (_currentTab === t ? ' active' : '');
            btn.textContent = t.charAt(0).toUpperCase() + t.slice(1);
            btn.onclick = () => {
                saveCurrentScrollPosition();
                _currentTab = t;
                renderPanel(block);
            };
            tabs.appendChild(btn);
        });
        panel.appendChild(tabs);

        // --- Body ---
        const body = document.createElement('div');
        body.className = 'prop-body';
        
        const sections = buildFields(block, _currentTab);
        sections.forEach(sec => {
            const secEl = document.createElement('div');
            secEl.className = 'prop-section';
            if (sec.title) {
                const secHeader = document.createElement('h4');
                secHeader.textContent = sec.title;
                secHeader.style.cssText = 'cursor:pointer;user-select:none;display:flex;align-items:center;justify-content:space-between;color:#ffffff;font-size:0.78rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;padding:10px 0 6px;margin:0;border-bottom:1px solid rgba(255,255,255,0.08);';
                const arrow = document.createElement('i');
                arrow.className = _foldSections ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-down';
                arrow.style.cssText = 'font-size:0.55rem;opacity:0.5;transition:transform 0.2s;';
                secHeader.appendChild(arrow);
                
                const secBody = document.createElement('div');
                secBody.style.display = _foldSections ? 'none' : 'block';
                sec.fields.forEach(fieldEl => secBody.appendChild(fieldEl));
                
                secHeader.onclick = () => {
                    const isHidden = secBody.style.display === 'none';
                    secBody.style.display = isHidden ? 'block' : 'none';
                    arrow.className = isHidden ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right';
                };
                
                secEl.appendChild(secHeader);
                secEl.appendChild(secBody);
            } else {
                sec.fields.forEach(fieldEl => secEl.appendChild(fieldEl));
            }
            body.appendChild(secEl);
        });
        panel.appendChild(body);

        // Wire fold checkbox
        foldCheck.onchange = () => {
            _foldSections = foldCheck.checked;
            renderPanel(block);
        };

        restoreScrollPosition(block, body);
        if (_pendingPanelFocus && _pendingPanelFocus.blockId === block.id && _pendingPanelFocus.tab === _currentTab) {
            const selector = _pendingPanelFocus.selector;
            _pendingPanelFocus = null;
            requestAnimationFrame(() => {
                const target = body.querySelector(selector);
                if (target && typeof target.scrollIntoView === 'function') {
                    target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    const firstInput = target.querySelector('input, textarea, select');
                    if (firstInput && typeof firstInput.focus === 'function') firstInput.focus();
                }
            });
        }
    }

    function closeThemePanel() {
        _panelMode = 'properties';
        const selectedId = State.getSelectedId();
        if (selectedId) renderPanel(State.getBlock(selectedId));
        else renderEmpty();
    }

    function renderThemesPanel() {
        _panelMode = 'themes';
        saveCurrentScrollPosition();
        const panel = document.getElementById('propPanelContent');
        panel.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'prop-header';

        const titleWrap = document.createElement('div');
        titleWrap.className = 'prop-title';
        titleWrap.innerHTML = `<i class="fa-solid fa-palette"></i> <span>Themes</span>`;
        header.appendChild(titleWrap);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn-icon';
        closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        closeBtn.title = 'Close themes panel';
        closeBtn.onclick = closeThemePanel;
        header.appendChild(closeBtn);
        panel.appendChild(header);

        const body = document.createElement('div');
        body.className = 'prop-body';

        const intro = document.createElement('p');
        intro.className = 'info-text';
        intro.textContent = 'Pick a theme and watch it update the website live on the canvas.';
        body.appendChild(intro);

        const actionsRow = document.createElement('div');
        actionsRow.style.display = 'flex';
        actionsRow.style.gap = '8px';
        actionsRow.style.marginBottom = '16px';

        const clearBtn = document.createElement('button');
        clearBtn.className = 'tb-btn secondary';
        clearBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Clear Theme';
        clearBtn.onclick = () => {
            Themes.clear();
            renderThemesPanel();
            if (window.showToast) window.showToast('Theme cleared', 'info');
        };
        actionsRow.appendChild(clearBtn);
        body.appendChild(actionsRow);

        const allThemes = Themes.getAll();
        ['solid', 'gradient', 'blob'].forEach((type) => {
            const label = document.createElement('div');
            label.className = 'theme-type-label';
            label.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            body.appendChild(label);

            const grid = document.createElement('div');
            grid.className = 'theme-grid';

            allThemes.filter((theme) => theme.type === type).forEach((theme) => {
                const card = document.createElement('div');
                card.className = 'theme-card' + (Themes.getActiveId() === theme.id ? ' active' : '');
                card.dataset.themeId = theme.id;
                card.innerHTML = `
                    <div class="theme-preview" style="background: ${theme.preview}"></div>
                    <div class="theme-info">
                        <span class="theme-name">${theme.name}</span>
                        <span class="theme-type-badge">${theme.type}</span>
                    </div>
                    <div class="theme-check"><i class="fa-solid fa-check"></i></div>
                `;
                card.addEventListener('pointerdown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    Themes.apply(theme.id);
                    renderThemesPanel();
                    if (window.showToast) window.showToast('Theme applied: ' + theme.name, 'success');
                });
                grid.appendChild(card);
            });

            body.appendChild(grid);
        });

        panel.appendChild(body);
        restoreScrollPosition(null, body);
    }

    function buildAppendChildSection(block, subPath = null) {
        const voidElements = ['IMG', 'VIDEO', 'SOURCE', 'IFRAME', 'HR', 'BR', 'INPUT', 'TEXTAREA', 'SELECT', 'OPTION'];
        if (subPath) {
            const blockEl = document.getElementById('block_' + block.id);
            const el = blockEl?.querySelector?.(`[data-sf-path="${subPath}"]`);
            const tagName = el?.tagName?.toUpperCase?.();
            if (!tagName || voidElements.includes(tagName)) return null;
        }

        const appendSec = {
            title: 'Append Child Element',
            fields: []
        };
        const types = [
            { label: 'Text (P)', icon: 'fa-solid fa-paragraph', type: 'p' },
            { label: 'H1', icon: 'fa-solid fa-heading', type: 'h1' },
            { label: 'H2', icon: 'fa-solid fa-heading', type: 'h2' },
            { label: 'H3', icon: 'fa-solid fa-heading', type: 'h3' },
            { label: 'H4', icon: 'fa-solid fa-heading', type: 'h4' },
            { label: 'H5', icon: 'fa-solid fa-heading', type: 'h5' },
            { label: 'H6', icon: 'fa-solid fa-heading', type: 'h6' },
            { label: 'Link', icon: 'fa-solid fa-link', type: 'a' },
            { label: 'Line Break', icon: 'fa-solid fa-turn-down', type: 'br' },
            { label: 'Divider', icon: 'fa-solid fa-minus', type: 'hr' },
            { label: 'Marquee', icon: 'fa-solid fa-forward', type: 'marquee' },
            { label: 'Image', icon: 'fa-solid fa-image', type: 'img' },
            { label: 'Video', icon: 'fa-solid fa-video', type: 'video' },
            { label: 'Read More', icon: 'fa-solid fa-book-open', type: 'read-more' },
            { label: 'Button', icon: 'fa-solid fa-rectangle-ad', type: 'button' },
            { label: 'Add to Cart', icon: 'fa-solid fa-cart-plus', type: 'add-to-cart' },
            { label: 'Flex Container', icon: 'fa-solid fa-box', type: 'div' }
        ];

        const btnGrid = document.createElement('div');
        btnGrid.className = 'append-btn-grid';
        btnGrid.style.display = 'grid';
        btnGrid.style.gridTemplateColumns = '1fr 1fr';
        btnGrid.style.gap = '8px';
        btnGrid.style.marginTop = '10px';

        types.forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'tb-btn secondary';
            btn.style.fontSize = '0.8rem';
            btn.style.padding = '8px';
            btn.innerHTML = `<i class="${t.icon}"></i> ${t.label}`;
            btn.onclick = () => {
                // Flex Container: add as a real nested block (same as palette component)
                if (t.type === 'div' && t.label === 'Flex Container') {
                    const containerProps = JSON.parse(JSON.stringify(BlockTypes['container'].defaultProps));
                    const parentId = subPath ? null : block.id;
                    // If we're inside a sub-element path, add to the root block
                    const targetParentId = block.id;
                    const newId = State.addBlock({ type: 'container', props: containerProps, parentId: targetParentId });
                    State.setSelected(newId);
                    if (window.showToast) window.showToast('Added Flex Container as nested block', 'success');
                    renderPanel(State.getBlock(newId));
                    return;
                }

                const newChild = { type: t.type, props: {}, styles: {} };
                if (t.type === 'p') newChild.props.text = 'New paragraph text...';
                if (/^h[1-6]$/.test(t.type)) newChild.props.text = `${t.type.toUpperCase()} Heading`;
                if (t.type === 'a') {
                    newChild.props.text = 'Link Text';
                    newChild.props.href = '#';
                }
                if (t.type === 'br') newChild.props.text = '';
                if (t.type === 'hr') newChild.props.text = '';
                if (t.type === 'marquee') {
                    newChild.props.text = 'Scrolling marquee text...';
                    newChild.props.html = 'Scrolling marquee text...';
                }
                if (t.type === 'img') newChild.props.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop';
                if (t.type === 'video') newChild.props.src = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';
                if (t.type === 'read-more') {
                    newChild.props.text = 'Read More';
                    newChild.props.popupTitle = 'More Details';
                    newChild.props.popupText = 'Add your full read more text here from the Content tab.';
                    newChild.props.popupVariant = 'centered';
                }
                if (t.type === 'button') {
                    newChild.props.text = 'Click Me';
                    newChild.props.actionType = 'link';
                    newChild.props.href = '#';
                }
                if (t.type === 'add-to-cart') {
                    newChild.props.text = 'Add to Cart';
                    newChild.props.price = '99.00';
                    newChild.props.name = 'Product Name';
                    newChild.props.image = '';
                }

                if (subPath) {
                    const currentChildren = (block.props.subStyles?.[subPath]?.children) || [];
                    State.updateSubStyle(block.id, subPath, { children: [...currentChildren, newChild] });
                    if (window.showToast) window.showToast(`Added ${t.label} to div`, 'success');
                } else {
                    const currentChildrenList = block.props.subStyles?.children || [];
                    const subStyles = { ...(block.props.subStyles || {}) };
                    subStyles.children = [...currentChildrenList, newChild];
                    State.updateBlockProps(block.id, { subStyles });
                    if (window.showToast) window.showToast(`Added ${t.label} to component`, 'success');
                }
                renderPanel(State.getBlock(block.id));
            };
            btnGrid.appendChild(btn);
        });

        appendSec.fields.push(btnGrid);
        return appendSec;
    }

    function inferVariantId(block) {
        const type = block?.type;
        const props = block?.props || {};
        if (!type) return '';
        if (props.variantId) return props.variantId;
        if ((type === 'video' || type === 'image' || type === 'text' || type === 'box') && Array.isArray(props.items) && props.items.length) {
            const count = Math.max(1, Math.min(Number(props.columns) || props.items.length, 6));
            return `${type}-${count}`;
        }
        return `${type}-1`;
    }

    function buildVariantSwitcher(block) {
        if (!block || !['video', 'image', 'text'].includes(block.type)) return null;
        if (typeof Palette === 'undefined' || typeof Palette.getVariantsForType !== 'function' || typeof Palette.buildBlockFromVariant !== 'function') return null;

        const variants = Palette.getVariantsForType(block.type) || [];
        if (!variants.length) return null;

        const wrap = document.createElement('div');
        wrap.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = 'Layout Variant';
        wrap.appendChild(label);

        const sel = document.createElement('select');
        const currentVariantId = inferVariantId(block);
        variants.forEach((variant) => {
            const opt = document.createElement('option');
            opt.value = variant.id;
            opt.textContent = variant.label;
            if (variant.id === currentVariantId) opt.selected = true;
            sel.appendChild(opt);
        });

        sel.addEventListener('change', () => {
            const nextVariantId = sel.value;
            const built = Palette.buildBlockFromVariant(block.type, nextVariantId);
            if (!built?.props) return;

            const currentBlock = State.getBlock(block.id);
            const currentProps = currentBlock?.props || {};
            const nextProps = { ...built.props };

            if (Array.isArray(currentProps.items) && currentProps.items.length) nextProps.items = currentProps.items;
            if (currentProps.subStyles) nextProps.subStyles = currentProps.subStyles;

            if (block.type === 'video') {
                nextProps.url = currentProps.url ?? nextProps.url;
                nextProps.thumb = currentProps.thumb ?? nextProps.thumb;
                nextProps.title = currentProps.title ?? nextProps.title;
                nextProps.description = currentProps.description ?? nextProps.description;
                nextProps.rating = currentProps.rating ?? nextProps.rating;
                nextProps.autoplay = currentProps.autoplay ?? nextProps.autoplay;
                nextProps.showDetails = currentProps.showDetails ?? nextProps.showDetails;
                nextProps.showShare = currentProps.showShare ?? nextProps.showShare;
                nextProps.shareButtonText = currentProps.shareButtonText ?? nextProps.shareButtonText;
                nextProps.allowMultiplePlayback = currentProps.allowMultiplePlayback ?? nextProps.allowMultiplePlayback;
            } else if (block.type === 'image') {
                nextProps.src = currentProps.src ?? nextProps.src;
                nextProps.alt = currentProps.alt ?? nextProps.alt;
                nextProps.caption = currentProps.caption ?? nextProps.caption;
                nextProps.description = currentProps.description ?? nextProps.description;
                nextProps.rating = currentProps.rating ?? nextProps.rating;
                nextProps.showDetails = currentProps.showDetails ?? nextProps.showDetails;
            } else if (block.type === 'text') {
                nextProps.badge = currentProps.badge ?? nextProps.badge;
                nextProps.title = currentProps.title ?? nextProps.title;
                nextProps.text = currentProps.text ?? nextProps.text;
                nextProps.html = currentProps.html ?? nextProps.html;
                nextProps.align = currentProps.align ?? nextProps.align;
            }

            State.updateBlockProps(block.id, nextProps);
            if (window.showToast) window.showToast(`${BlockTypes[block.type].label} layout updated`, 'success');
        });

        wrap.appendChild(sel);
        return wrap;
    }

    function getDynamicChildConfig(block, path) {
        if (!block || !path || State._pathType(path) !== 'dynamic') return null;
        const parts = path.split('.');
        let child = null;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!/^c\d+$/.test(part)) continue;
            const parentPath = parts.slice(0, i).join('.');
            const parentStyle = parentPath ? block.props.subStyles?.[parentPath] : block.props.subStyles;
            const currentChildren = parentStyle?.children || [];
            const idx = parseInt(part.slice(1), 10);
            child = currentChildren[idx] || null;
            if (!child) return null;
        }
        return child;
    }

    function buildFields(block, currentTab) {
        const subPath = State.getSelectedSubPath();
        const subStyle = subPath ? (block.props.subStyles?.[subPath] || {}) : null;
        const p = subStyle || block.props;
        const sections = [];

        const isDesign = currentTab === 'design';
        const isContent = currentTab === 'content';
        const isAdvanced = currentTab === 'advanced';

        if (isAdvanced) {
            sections.push({
                title: 'Identifiers',
                fields: [
                    field('Custom ID', text('customId', p.customId, block.id)).fields[0],
                    field('Custom Class', text('customClass', p.customClass, block.id)).fields[0]
                ]
            });
            if (!subPath) {
                sections.push({
                    title: 'Animation',
                    fields: [
                        field('Animation Type', select2('animationPreset', p.animationPreset || 'none', ['none', 'fade-up', 'fade-in', 'zoom-in', 'slide-right'], block.id)).fields[0],
                        field('Trigger', select2('animationTrigger', p.animationTrigger || 'load', ['load', 'scroll'], block.id)).fields[0],
                        field('Duration (sec)', text('animationDuration', p.animationDuration || '0.8', block.id)).fields[0],
                        field('Delay (sec)', text('animationDelay', p.animationDelay || '0', block.id)).fields[0],
                        field('BG Animation', select2('bgAnimation', p.bgAnimation || 'none', ['none', 'gradient-shift', 'gradient-rotate', 'color-pulse', 'hue-rotate'], block.id)).fields[0],
                        field('BG Anim Speed (s)', text('bgAnimSpeed', p.bgAnimSpeed || '5', block.id)).fields[0]
                    ]
                });
            }
            // Sub-element image controls in Advanced tab
            if (subPath) {
                const blockEl = document.getElementById('block_' + block.id);
                const el = blockEl ? blockEl.querySelector(`[data-sf-path="${subPath}"]`) : null;
                const tagName = el ? el.tagName : '';

                // Text Animation (continuous) for text elements
                const textTags = ['P', 'SPAN', 'A', 'BUTTON', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'LABEL', 'FIGCAPTION'];
                if (textTags.includes(tagName)) {
                    sections.push({
                        title: 'Text Animation',
                        fields: [
                            field('Effect', select2('textAnim', p.textAnim || 'none', [
                                'none',
                                'color-cycle',
                                'gradient-flow',
                                'glow-pulse',
                                'flicker',
                                'typing',
                                'bounce',
                                'shake',
                                'pulse-scale',
                                'float'
                            ], block.id)).fields[0],
                            field('Speed (sec)', text('textAnimSpeed', p.textAnimSpeed || '3', block.id)).fields[0],
                            field('Color 1', color('textAnimColor1', p.textAnimColor1 || '#6366f1', block.id)).fields[0],
                            field('Color 2', color('textAnimColor2', p.textAnimColor2 || '#ec4899', block.id)).fields[0],
                            field('Color 3', color('textAnimColor3', p.textAnimColor3 || '#14b8a6', block.id)).fields[0]
                        ]
                    });
                }

                if (tagName === 'IMG') {
                    sections.push({
                        title: 'Image Controls',
                        fields: [
                            field('Source URL', text('src', p.src || (el ? el.src : ''), block.id)).fields[0],
                            field('Alt Text', text('alt', p.alt || (el ? el.getAttribute('alt') : '') || '', block.id)).fields[0],
                            field('Width', text('width', p.width || '', block.id)).fields[0],
                            field('Height', text('height', p.height || '', block.id)).fields[0],
                            field('Max Width', text('maxWidth', p.maxWidth || '100%', block.id)).fields[0],
                            field('Object Fit', select2('objectFit', p.objectFit || 'cover', ['cover', 'contain', 'fill', 'none', 'scale-down'], block.id)).fields[0],
                            field('Object Position', select2('objectPosition', p.objectPosition || 'center', ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'], block.id)).fields[0],
                            field('Border Radius', text('borderRadius', p.borderRadius || '0', block.id)).fields[0],
                            field('Opacity', range('opacity', p.opacity !== undefined ? p.opacity : 1, 0, 1, 0.05, block.id)).fields[0],
                            field('Box Shadow', text('boxShadow', p.boxShadow || 'none', block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Image Filters',
                        fields: [
                            field('Blur (px)', range('blur', p.blur || 0, 0, 20, 1, block.id)).fields[0],
                            field('Brightness', range('brightness', p.brightness !== undefined ? p.brightness : 1, 0, 2, 0.05, block.id)).fields[0],
                            field('Contrast', range('contrast', p.contrast !== undefined ? p.contrast : 1, 0, 2, 0.05, block.id)).fields[0],
                            field('Saturate', range('saturate', p.saturate !== undefined ? p.saturate : 1, 0, 3, 0.1, block.id)).fields[0],
                            field('Grayscale', range('grayscale', p.grayscale || 0, 0, 1, 0.05, block.id)).fields[0]
                        ]
                    });
                }
            }
            const appendSec = buildAppendChildSection(block, subPath);
            if (appendSec) sections.push(appendSec);
            return sections;
        }

        if (subPath) {
            if (isContent && block.type === 'video') {
                sections.push({
                    title: 'Playback',
                    fields: [
                        field('Play Multiple Together', toggle('allowMultiplePlayback', block.props.allowMultiplePlayback === true, block.id)).fields[0]
                    ]
                });
            }
            const getSubDefaults = () => {
                const blockEl = document.getElementById('block_' + block.id);
                if (!blockEl) return {};
                const el = blockEl.querySelector(`[data-sf-path="${subPath}"]`);
                if (!el) return {};
                
                const getStyle = (prop) => {
                    const val = el.style.getPropertyValue(prop) || window.getComputedStyle(el).getPropertyValue(prop);
                    let cleanVal = (val || '').replace(' !important', '').trim();
                    if (prop.includes('color')) {
                        return rgbToHex(cleanVal);
                    }
                    return cleanVal;
                };

                const isContentTag = ['P', 'SPAN', 'A', 'BUTTON', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'FIGCAPTION', 'LABEL', 'I'].includes(el.tagName);

                return {
                    text: (el.children.length === 0 || isContentTag) ? el.innerText.trim() : '',
                    display: getStyle('display'),
                    width: getStyle('width'),
                    height: getStyle('height'),
                    minWidth: getStyle('min-width'),
                    minHeight: getStyle('min-height'),
                    maxWidth: getStyle('max-width'),
                    maxHeight: getStyle('max-height'),
                    margin: getStyle('margin'),
                    padding: getStyle('padding'),
                    color: getStyle('color'),
                    fontSize: getStyle('font-size'),
                    fontWeight: getStyle('font-weight'),
                    fontFamily: getStyle('font-family'),
                    lineHeight: getStyle('line-height'),
                    letterSpacing: getStyle('letter-spacing'),
                    textAlign: getStyle('text-align'),
                    bgColor: getStyle('background-color'),
                    background: getStyle('background'),
                    opacity: getStyle('opacity'),
                    zIndex: getStyle('z-index'),
                    boxShadow: getStyle('box-shadow'),
                    borderRadius: getStyle('border-radius'),
                    borderWidth: getStyle('border-width'),
                    borderStyle: getStyle('border-style'),
                    borderColor: getStyle('border-color'),
                    direction: getStyle('flex-direction'),
                    justify: getStyle('justify-content'),
                    align: getStyle('align-items'),
                    gap: getStyle('gap'),
                    flexGrow: getStyle('flex-grow'),
                    flexShrink: getStyle('flex-shrink'),
                    alignSelf: getStyle('align-self')
                };
            };
            const d = getSubDefaults();

            if (isDesign) {
                // Visual Guide (Editor Only) - HIGH VISIBILITY
                sections.push({
                    title: 'Visual Guides',
                    fields: [
                        field('Highlight Layer', select2('visualGuide', p.visualGuide || 'none', ['none', 'red', 'green'], block.id)).fields[0]
                    ]
                });

                // Layout & Spacing
                const layoutFields = [
                    field('Display', select2('display', p.display || d.display || 'block', ['block', 'inline-block', 'flex', 'inline-flex', 'grid', 'none'], block.id)).fields[0],
                    field('Width', text('width', p.width || d.width || '', block.id)).fields[0],
                    field('Height', text('height', p.height || d.height || '', block.id)).fields[0],
                    field('Min Width', text('minWidth', p.minWidth || '', block.id)).fields[0],
                    field('Min Height', text('minHeight', p.minHeight || '', block.id)).fields[0],
                    field('Max Width', text('maxWidth', p.maxWidth || '', block.id)).fields[0],
                    field('Max Height', text('maxHeight', p.maxHeight || '', block.id)).fields[0],
                    field('Margin', text('margin', p.margin || d.margin || '', block.id)).fields[0],
                    field('Padding', text('padding', p.padding || d.padding || '', block.id)).fields[0]
                ];
                
                // Flexbox Contextual
                const blockEl = document.getElementById('block_' + block.id);
                const currentEl = blockEl ? blockEl.querySelector(`[data-sf-path="${subPath}"]`) : null;
                const parentEl = currentEl ? currentEl.parentElement : null;
                const isParentFlex = parentEl && window.getComputedStyle(parentEl).display.includes('flex');

                if (isParentFlex) {
                    layoutFields.push(
                        field('Flex Grow', text('flexGrow', p.flexGrow || '', block.id)).fields[0],
                        field('Flex Shrink', text('flexShrink', p.flexShrink || '', block.id)).fields[0],
                        field('Align Self', select2('alignSelf', p.alignSelf || '', ['auto', 'flex-start', 'center', 'flex-end', 'stretch'], block.id)).fields[0]
                    );
                }

                if ((p.display || d.display || '').includes('flex')) {
                    layoutFields.push(
                        field('Flex Direction', select2('direction', p.direction || 'row', ['row', 'column'], block.id)).fields[0],
                        field('Flex Wrap', select2('wrap', p.wrap || 'wrap', ['nowrap', 'wrap', 'wrap-reverse'], block.id)).fields[0],
                        field('Justify', select2('justify', p.justify || 'center', ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'], block.id)).fields[0],
                        field('Align', select2('align', p.align || 'center', ['flex-start', 'center', 'flex-end', 'stretch'], block.id)).fields[0],
                        field('Gap', text('gap', p.gap || '', block.id)).fields[0]
                    );
                }
                sections.push({ title: 'Layout & Spacing', fields: layoutFields });

                // Typography
                sections.push({
                    title: 'Typography',
                    fields: [
                        field('Text Color', color('color', p.color || d.color, block.id)).fields[0],
                        field('Font Size', text('fontSize', p.fontSize || d.fontSize, block.id)).fields[0],
                        field('Font Weight', select2('fontWeight', p.fontWeight || d.fontWeight || 'normal', ['normal', 'bold', '100', '300', '400', '500', '600', '700', '800', '900'], block.id)).fields[0],
                        field('Font Family', text('fontFamily', p.fontFamily || d.fontFamily, block.id)).fields[0],
                        field('Line Height', text('lineHeight', p.lineHeight || '', block.id)).fields[0],
                        field('Letter Spacing', text('letterSpacing', p.letterSpacing || '', block.id)).fields[0],
                        field('Text Align', select2('textAlign', p.textAlign || d.textAlign || 'inherit', ['inherit', 'left', 'center', 'right', 'justify'], block.id)).fields[0]
                    ]
                });

                // Visuals
                sections.push({
                    title: 'Visuals',
                    fields: [
                        field('BG Color', color('bgColor', p.bgColor || d.bgColor, block.id)).fields[0],
                        field('BG Image URL', text('bgImage', p.bgImage || '', block.id)).fields[0],
                        field('BG Size', select2('bgSize', p.bgSize || 'cover', ['cover', 'contain', 'auto', '100% 100%'], block.id)).fields[0],
                        field('BG Position', select2('bgPosition', p.bgPosition || 'center', ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'], block.id)).fields[0],
                        field('Gradient BG', text('background', p.background || '', block.id)).fields[0],
                        field('Opacity', range('opacity', p.opacity !== undefined ? p.opacity : 1, 0, 1, 0.05, block.id)).fields[0],
                        field('Z-index', text('zIndex', p.zIndex || '', block.id)).fields[0],
                        field('Box Shadow', text('boxShadow', p.boxShadow || '', block.id)).fields[0],
                        field('Overflow', select2('overflow', p.overflow || 'visible', ['visible', 'hidden', 'auto', 'scroll'], block.id)).fields[0]
                    ]
                });

                // Animation
                sections.push({
                    title: 'Animation',
                    fields: [
                        field('Preset', select2('animationPreset', p.animationPreset || '', ['', 'fade-up', 'fade-in', 'zoom-in', 'slide-right'], block.id)).fields[0],
                        field('Trigger', select2('animationTrigger', p.animationTrigger || 'load', ['load', 'scroll'], block.id)).fields[0],
                        field('Duration (s)', text('animationDuration', p.animationDuration || '0.8', block.id)).fields[0],
                        field('Delay (s)', text('animationDelay', p.animationDelay || '0', block.id)).fields[0],
                        field('BG Animation', select2('bgAnimation', p.bgAnimation || 'none', ['none', 'gradient-shift', 'gradient-rotate', 'color-pulse', 'hue-rotate'], block.id)).fields[0],
                        field('BG Anim Speed (s)', text('bgAnimSpeed', p.bgAnimSpeed || '5', block.id)).fields[0]
                    ]
                });

                // Filters
                sections.push({
                    title: 'Filters',
                    fields: [
                        field('Blur (px)', range('blur', p.blur || 0, 0, 20, 1, block.id)).fields[0],
                        field('Brightness', range('brightness', p.brightness !== undefined ? p.brightness : 1, 0, 2, 0.05, block.id)).fields[0],
                        field('Contrast', range('contrast', p.contrast !== undefined ? p.contrast : 1, 0, 2, 0.05, block.id)).fields[0],
                        field('Saturate', range('saturate', p.saturate !== undefined ? p.saturate : 1, 0, 3, 0.1, block.id)).fields[0],
                        field('Grayscale', range('grayscale', p.grayscale || 0, 0, 1, 0.05, block.id)).fields[0],
                        field('Hue Rotate (deg)', range('hueRotate', p.hueRotate || 0, 0, 360, 5, block.id)).fields[0],
                        field('Sepia', range('sepia', p.sepia || 0, 0, 1, 0.05, block.id)).fields[0]
                    ]
                });

                // Borders
                sections.push({
                    title: 'Borders',
                    fields: [
                        field('Border Radius', text('borderRadius', p.borderRadius || '', block.id)).fields[0],
                        field('Border Width', text('borderWidth', p.borderWidth || '', block.id)).fields[0],
                        field('Border Style', select2('borderStyle', p.borderStyle || 'none', ['none', 'solid', 'dashed', 'dotted', 'double', 'gradient'], block.id)).fields[0],
                        field('Border Color', color('borderColor', p.borderColor || '#000000', block.id)).fields[0],
                        field('Gradient Border', text('borderGradient', p.borderGradient || '', block.id)).fields[0],
                        field('Border Mode', select2('borderMode', p.borderMode || 'always', ['always', 'hover'], block.id)).fields[0],
                        field('Border Animation', select2('borderAnimation', p.borderAnimation || 'none', ['none', 'rainbow', 'spin', 'pulse'], block.id)).fields[0],
                        field('Animation Speed (s)', text('borderAnimSpeed', p.borderAnimSpeed || '3', block.id)).fields[0],
                        field('Hover Shadow', text('hoverShadow', p.hoverShadow || '', block.id)).fields[0],
                        field('Hover Scale', text('hoverScale', p.hoverScale || '', block.id)).fields[0],
                        field('Hover Border Color', text('hoverBorderColor', p.hoverBorderColor || '', block.id)).fields[0]
                    ]
                });

                // Effects
                sections.push({
                    title: 'Effects',
                    fields: [
                        field('Opacity', range('opacity', p.opacity !== undefined ? p.opacity : 1, 0, 1, 0.01, block.id)).fields[0],
                        field('Blur (px)', range('blur', p.blur || 0, 0, 20, 1, block.id)).fields[0]
                    ]
                });
            }
            if (isContent) {
                const blockEl = document.getElementById('block_' + block.id);
                const el = blockEl ? blockEl.querySelector(`[data-sf-path="${subPath}"]`) : null;
                const tagName = el ? el.tagName : '';
                const dynamicChild = getDynamicChildConfig(block, subPath);
                const isReadMoreLike = !!(
                    dynamicChild && (
                        dynamicChild.type === 'read-more' ||
                        dynamicChild.props?.popupTitle !== undefined ||
                        dynamicChild.props?.popupText !== undefined ||
                        dynamicChild.props?.popupVariant !== undefined
                    )
                );
                const isReadMore = isReadMoreLike ||
                    p?.popupTitle !== undefined ||
                    p?.popupText !== undefined ||
                    p?.popupVariant !== undefined ||
                    el?.classList?.contains('sf-read-more-child');

                // 1. Existing Content
                if (isReadMore) {
                    sections.push({
                        title: 'Read More Content',
                        fields: [
                            field('Button Text', text('text', p.text || dynamicChild?.props?.text || 'Read More', block.id)).fields[0],
                            field('Popup Title', text('popupTitle', p.popupTitle || dynamicChild?.props?.popupTitle || 'More Details', block.id)).fields[0],
                            field('Popup Text', wordPasteEditor('popupText', p.popupText || dynamicChild?.props?.popupText || '', block.id)).fields[0],
                            field('Popup Variant', select2('popupVariant', p.popupVariant || dynamicChild?.props?.popupVariant || 'centered', ['centered', 'side-panel', 'minimal', 'full-screen'], block.id)).fields[0]
                        ]
                    });
                } else if (['IMG', 'VIDEO', 'SOURCE', 'IFRAME'].includes(tagName)) {
                    sections.push({
                        title: 'Media Settings',
                        fields: [
                            field('Source URL', text('src', p.src || (el ? el.src || el.getAttribute('src') : ''), block.id)).fields[0],
                            field('Alt Text', text('alt', p.alt || (el ? el.getAttribute('alt') : '') || '', block.id)).fields[0]
                        ]
                    });
                    if (tagName === 'IMG') {
                        sections.push({
                            title: 'Image Style',
                            fields: [
                                field('Width', text('width', p.width || '', block.id)).fields[0],
                                field('Height', text('height', p.height || '', block.id)).fields[0],
                                field('Max Width', text('maxWidth', p.maxWidth || '100%', block.id)).fields[0],
                                field('Object Fit', select2('objectFit', p.objectFit || 'cover', ['cover', 'contain', 'fill', 'none', 'scale-down'], block.id)).fields[0],
                                field('Object Position', select2('objectPosition', p.objectPosition || 'center', ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'], block.id)).fields[0],
                                field('Border Radius', text('borderRadius', p.borderRadius || '0', block.id)).fields[0],
                                field('Opacity', range('opacity', p.opacity !== undefined ? p.opacity : 1, 0, 1, 0.05, block.id)).fields[0],
                                field('Box Shadow', text('boxShadow', p.boxShadow || 'none', block.id)).fields[0],
                                field('Filter Blur (px)', range('blur', p.blur || 0, 0, 20, 1, block.id)).fields[0],
                                field('Filter Brightness', range('brightness', p.brightness !== undefined ? p.brightness : 1, 0, 2, 0.05, block.id)).fields[0],
                                field('Filter Contrast', range('contrast', p.contrast !== undefined ? p.contrast : 1, 0, 2, 0.05, block.id)).fields[0],
                                field('Filter Saturate', range('saturate', p.saturate !== undefined ? p.saturate : 1, 0, 3, 0.1, block.id)).fields[0],
                                field('Filter Grayscale', range('grayscale', p.grayscale || 0, 0, 1, 0.05, block.id)).fields[0]
                            ]
                        });
                    }
                } else if (el && el.classList.contains('sf-add-to-cart')) {
                    sections.push({
                        title: 'Product Details',
                        fields: [
                            field('Button Text', text('text', p.text || 'Add to Cart', block.id)).fields[0],
                            field('Button Link (optional)', url('href', p.href || '', block.id)).fields[0],
                            field('Product Name', text('name', p.name || '', block.id)).fields[0],
                            field('Price', text('price', p.price || '0.00', block.id)).fields[0],
                            field('Image URL', url('image', p.image || '', block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Button Style',
                        fields: [
                            field('BG Color', color('bgColor', p.bgColor || '#6c63ff', block.id)).fields[0],
                            field('Text Color', color('color', p.color || p.textColor || '#ffffff', block.id)).fields[0],
                            field('Font Size', text('fontSize', p.fontSize || '1rem', block.id)).fields[0],
                            field('Font Weight', select2('fontWeight', p.fontWeight || '700', ['400', '500', '600', '700', '800', '900'], block.id)).fields[0],
                            field('Padding', text('padding', p.padding || '10px 20px', block.id)).fields[0],
                            field('Border Radius', text('borderRadius', p.borderRadius || '6px', block.id)).fields[0],
                            field('Width', text('width', p.width || 'auto', block.id)).fields[0]
                        ]
                    });
                } else if (tagName === 'BUTTON' || (el && el.classList.contains('sf-button')) || (el && el.classList.contains('nav-btn'))) {
                    sections.push({
                        title: 'Button Settings',
                        fields: [
                            field('Button Text', text('text', p.text || el.innerText.trim(), block.id)).fields[0],
                            field('Action Type', select2('actionType', p.actionType || 'link', ['link', 'cart'], block.id)).fields[0]
                        ]
                    });
                    if (p.actionType === 'cart') {
                        sections.push({
                            title: 'Cart Connection',
                            fields: [
                                field('Product Name', text('cartItemName', p.cartItemName || '', block.id)).fields[0],
                                field('Product Price', text('cartItemPrice', p.cartItemPrice || '', block.id)).fields[0],
                                field('Product Image', url('cartItemImage', p.cartItemImage || '', block.id)).fields[0]
                            ]
                        });
                    } else {
                        sections.push({
                            title: 'Link Connection',
                            fields: [
                                field('Target URL / #', url('href', p.href || el.getAttribute('href') || '#', block.id)).fields[0]
                            ]
                        });
                    }
                    // Button Style (BG Color + Text Color)
                    sections.push({
                        title: 'Button Style',
                        fields: [
                            field('BG Color', color('bgColor', p.bgColor || d.bgColor || '#6c63ff', block.id)).fields[0],
                            field('Text Color', color('color', p.color || d.color || '#ffffff', block.id)).fields[0],
                            field('Border Radius', text('borderRadius', p.borderRadius || d.borderRadius || '', block.id)).fields[0],
                            field('Padding', text('padding', p.padding || d.padding || '', block.id)).fields[0]
                        ]
                    });
                } else if (tagName === 'A') {
                    sections.push({
                        title: 'Link Settings',
                        fields: [
                            field('Link Text', text('text', p.text || el.innerText.trim(), block.id)).fields[0],
                            field('URL (href)', text('href', p.href || el.getAttribute('href'), block.id)).fields[0]
                        ]
                    });
                    // Link/Button Style
                    sections.push({
                        title: 'Button Style',
                        fields: [
                            field('BG Color', color('bgColor', p.bgColor || d.bgColor || '', block.id)).fields[0],
                            field('Text Color', color('color', p.color || d.color || '', block.id)).fields[0],
                            field('Border Radius', text('borderRadius', p.borderRadius || d.borderRadius || '', block.id)).fields[0],
                            field('Padding', text('padding', p.padding || d.padding || '', block.id)).fields[0]
                        ]
                    });
                } else {
                    sections.push({
                        title: 'Text Content',
                        fields: [
                            field('Edit Text', textarea('text', p.text || d.text, block.id)).fields[0]
                        ]
                    });
                }

                    // --- Link / Navigation Section (for ALL text elements) ---
                    if (!['IMG', 'VIDEO', 'SOURCE', 'IFRAME', 'HR', 'BR', 'INPUT', 'TEXTAREA', 'SELECT'].includes(tagName)) {
                        const currentHref = p.href || (el ? el.getAttribute('href') || el.closest('a')?.getAttribute('href') : '') || '';
                        const linkFields = [
                            field('Link URL', text('href', currentHref, block.id)).fields[0]
                        ];
                        
                        // Page selector (always show)
                        const pages = State.getPages();
                            const pageSelect = document.createElement('select');
                            pageSelect.style.cssText = 'width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:6px;background:var(--surface2);color:var(--text1);font-size:0.8rem;';
                            const defaultOpt = document.createElement('option');
                            defaultOpt.value = '';
                            defaultOpt.textContent = '— Link to page —';
                            pageSelect.appendChild(defaultOpt);
                            pages.forEach(pg => {
                                const opt = document.createElement('option');
                                opt.value = pg.filename;
                                opt.textContent = pg.name;
                                if (currentHref === pg.filename) opt.selected = true;
                                pageSelect.appendChild(opt);
                            });
                            pageSelect.addEventListener('change', () => {
                                if (pageSelect.value) {
                                    State.updateSubStyle(block.id, subPath, { href: pageSelect.value });
                                    setTimeout(() => renderPanel(State.getBlock(block.id)), 50);
                                }
                            });
                            linkFields.push(field('Link to Page', pageSelect).fields[0]);
                        
                        // Open in new tab toggle
                        const targetCheck = document.createElement('div');
                        targetCheck.style.cssText = 'display:flex;align-items:center;gap:8px;';
                        const targetInput = document.createElement('input');
                        targetInput.type = 'checkbox';
                        targetInput.checked = p.target === '_blank';
                        targetInput.style.cssText = 'width:14px;height:14px;cursor:pointer;';
                        targetInput.addEventListener('change', () => {
                            State.updateSubStyle(block.id, subPath, { target: targetInput.checked ? '_blank' : '' });
                        });
                        const targetLabel = document.createElement('span');
                        targetLabel.style.cssText = 'font-size:0.78rem;color:var(--text2);';
                        targetLabel.textContent = 'Open in new tab';
                        targetCheck.appendChild(targetInput);
                        targetCheck.appendChild(targetLabel);
                        linkFields.push(targetCheck);
                        
                        sections.push({ title: 'Link / Navigation', fields: linkFields });
                    }

                    // 2. Nesting (Append Child) - Allow for ALL elements except void elements (img, video, iframe, etc.)
                    const voidElements = ['IMG', 'VIDEO', 'SOURCE', 'IFRAME', 'HR', 'BR', 'INPUT', 'TEXTAREA', 'SELECT', 'OPTION'];
                    if (!voidElements.includes(tagName)) {
                        const currentRef = block.props.subStyles?.[subPath] || {};
                        const currentChildren = currentRef.children || [];

                        // 3. Current Children (Structure List)
                        if (currentChildren.length > 0) {
                            const structSec = { title: 'Inside Structure', fields: [] };
                            const list = document.createElement('div');
                            list.className = 'struct-list';
                            list.style.cssText = 'display:flex; flex-direction:column; gap:4px; margin-bottom:12px;';

                            currentChildren.forEach((child, cIdx) => {
                                const childPath = `${subPath}.c${cIdx}`;
                                const item = document.createElement('div');
                                item.className = 'struct-item' + (State.getSelectedSubPath() === childPath ? ' active' : '');
                                item.style.cssText = 'display:flex; align-items:center; justify-content:space-between; background:var(--surface2); padding:6px 10px; border-radius:6px; cursor:pointer; font-size:0.8rem;';
                                if (State.getSelectedSubPath() === childPath) item.style.border = '1px solid var(--accent)';

                                const label = document.createElement('span');
                                label.innerHTML = `<i class="fa-solid fa-cube" style="margin-right:6px; color:var(--accent);"></i> ${child.type}`;
                                item.appendChild(label);

                                const acts = document.createElement('div');
                                acts.style.display = 'flex'; acts.style.gap = '4px';

                                const abtn = (icon, color, onClick) => {
                                    const b = document.createElement('button');
                                    b.innerHTML = `<i class="fa-solid ${icon}"></i>`;
                                    b.style.cssText = `border:none; background:none; cursor:pointer; font-size:0.75rem; color:${color}; padding:2px;`;
                                    b.onclick = (e) => { e.stopPropagation(); onClick(); };
                                    return b;
                                };

                                acts.appendChild(abtn('fa-arrow-up', 'var(--text3)', () => { State.moveSubElement(block.id, childPath, 'up'); setTimeout(() => renderPanel(State.getBlock(block.id)), 50); }));
                                acts.appendChild(abtn('fa-arrow-down', 'var(--text3)', () => { State.moveSubElement(block.id, childPath, 'down'); setTimeout(() => renderPanel(State.getBlock(block.id)), 50); }));
                                acts.appendChild(abtn('fa-copy', 'var(--success)', () => { State.duplicateSubElement(block.id, childPath); setTimeout(() => renderPanel(State.getBlock(block.id)), 50); }));
                                acts.appendChild(abtn('fa-trash', 'var(--danger)', () => { State.removeSubElement(block.id, childPath); setTimeout(() => renderPanel(State.getBlock(block.id)), 50); }));

                                item.appendChild(acts);
                                item.onclick = () => State.setSelectedSubPath(childPath);
                                list.appendChild(item);
                            });
                            structSec.fields.push(list);
                            sections.push(structSec);
                        }

                        const appendSec = {
                            title: 'Append Child Element',
                            fields: []
                        };
                        
                        const types = [
                            { label: 'Text (P)', icon: 'fa-solid fa-paragraph', type: 'p' },
                            { label: 'Image', icon: 'fa-solid fa-image', type: 'img' },
                            { label: 'Video', icon: 'fa-solid fa-video', type: 'video' },
                            { label: 'Button', icon: 'fa-solid fa-rectangle-ad', type: 'button' },
                            { label: 'Add to Cart', icon: 'fa-solid fa-cart-plus', type: 'add-to-cart' },
                            { label: 'Flex Container', icon: 'fa-solid fa-box', type: 'div' }
                        ];

                        const btnGrid = document.createElement('div');
                        btnGrid.className = 'append-btn-grid'; 
                        btnGrid.style.display = 'grid';
                        btnGrid.style.gridTemplateColumns = '1fr 1fr';
                        btnGrid.style.gap = '8px';
                        btnGrid.style.marginTop = '10px';

                        types.forEach(t => {
                            const btn = document.createElement('button');
                            btn.className = 'tb-btn secondary';
                            btn.style.fontSize = '0.8rem';
                            btn.style.padding = '8px';
                            btn.innerHTML = `<i class="${t.icon}"></i> ${t.label}`;
                            btn.onclick = () => {
                                // Flex Container: add as a real nested block (same as palette component)
                                if (t.type === 'div' && t.label === 'Flex Container') {
                                    const containerProps = JSON.parse(JSON.stringify(BlockTypes['container'].defaultProps));
                                    const newId = State.addBlock({ type: 'container', props: containerProps, parentId: block.id });
                                    State.setSelected(newId);
                                    if (window.showToast) window.showToast('Added Flex Container as nested block', 'success');
                                    renderPanel(State.getBlock(newId));
                                    return;
                                }

                                const currentChildren = (block.props.subStyles?.[subPath]?.children) || [];
                                const newChild = { type: t.type, props: {}, styles: {} };
                                if (t.type === 'p') newChild.props.text = 'New paragraph text...';
                                if (t.type === 'img') newChild.props.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop';
                                if (t.type === 'video') newChild.props.src = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';
                                if (t.type === 'button') newChild.props.text = 'Click Me';
                                if (t.type === 'add-to-cart') {
                                    newChild.props.text = 'Add to Cart';
                                    newChild.props.price = '99.00';
                                    newChild.props.name = 'Product Name';
                                    newChild.props.image = '';
                                }
                                State.updateSubStyle(block.id, subPath, { children: [...currentChildren, newChild] });
                                if (window.showToast) window.showToast(`Added ${t.label} to div`, 'success');
                                renderPanel(State.getBlock(block.id));
                            };
                            btnGrid.appendChild(btn);
                        });
                        
                        appendSec.fields.push(btnGrid);
                    }
                const resetBtn = document.createElement('button');
                resetBtn.innerText = 'Reset to Default';
                resetBtn.className = 'tb-btn danger';
                resetBtn.style.width = '100%';
                resetBtn.onclick = () => {
                    const subStyles = { ...block.props.subStyles };
                    delete subStyles[subPath];
                    State.setSelectedSubPath(null); // Must deselect path so updateBlockProps targets root props
                    State.updateBlockProps(block.id, { subStyles });
                    renderPanel(State.getBlock(block.id));
                };
                sections.push({ title: 'Actions', fields: [resetBtn] });
            }
            return sections;
        }

        if (isDesign) {
            // --- Size ---
            sections.push({
                title: 'Size',
                fields: [
                    field('Width', text('width', p.width || '100%', block.id)).fields[0],
                    field('Min Width', text('minWidth', p.minWidth || '', block.id)).fields[0],
                    field('Max Width', text('maxWidth', p.maxWidth || '', block.id)).fields[0],
                    field('Height', text('height', p.height || 'auto', block.id)).fields[0],
                    field('Min Height', text('minHeight', p.minHeight || '', block.id)).fields[0],
                    field('Max Height', text('maxHeight', p.maxHeight || '', block.id)).fields[0]
                ]
            });

            // --- Spacing ---
            sections.push({
                title: 'Spacing',
                fields: [
                    field('Margin', text('margin', p.margin || '0px', block.id)).fields[0],
                    field('Padding', text('padding', p.padding || '0px', block.id)).fields[0],
                    field('Gap', text('gap', p.gap || '0px', block.id)).fields[0]
                ]
            });

            // --- Layout ---
            const layoutFields = [
                field('Display', select2('display', p.display || 'block', ['block', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'none'], block.id)).fields[0],
                field('Overflow', select2('overflow', p.overflow || 'visible', ['visible', 'hidden', 'auto', 'scroll'], block.id)).fields[0],
                field('Align Self', select2('alignSelf', p.alignSelf || 'auto', ['auto', 'flex-start', 'center', 'flex-end', 'stretch', 'baseline'], block.id)).fields[0],
                field('Flex Grow', range('flexGrow', p.flexGrow !== undefined ? p.flexGrow : 0, 0, 10, 1, block.id)).fields[0],
                field('Flex Shrink', range('flexShrink', p.flexShrink !== undefined ? p.flexShrink : 1, 0, 10, 1, block.id)).fields[0]
            ];
            if (!subPath) {
                const variantSwitcher = buildVariantSwitcher(block);
                if (variantSwitcher) layoutFields.unshift(variantSwitcher);
            }
            if (p.display === 'flex' || p.display === 'inline-flex') {
                layoutFields.push(
                    field('Direction', select2('direction', p.direction || 'row', ['row', 'row-reverse', 'column', 'column-reverse'], block.id)).fields[0],
                    field('Wrap', select2('wrap', p.wrap || 'wrap', ['nowrap', 'wrap', 'wrap-reverse'], block.id)).fields[0],
                    field('Justify', select2('justify', p.justify || 'flex-start', ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'], block.id)).fields[0],
                    field('Align Items', select2('align', p.align || 'stretch', ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'], block.id)).fields[0]
                );
            }
            if (p.display === 'grid' || p.display === 'inline-grid') {
                layoutFields.push(
                    field('Grid Columns', text('gridTemplateColumns', p.gridTemplateColumns || 'repeat(auto-fit, minmax(250px, 1fr))', block.id)).fields[0],
                    field('Grid Rows', text('gridTemplateRows', p.gridTemplateRows || 'auto', block.id)).fields[0],
                    field('Column Gap', text('columnGap', p.columnGap || '16px', block.id)).fields[0],
                    field('Row Gap', text('rowGap', p.rowGap || '16px', block.id)).fields[0],
                    field('Justify Items', select2('justifyItems', p.justifyItems || 'stretch', ['start', 'center', 'end', 'stretch'], block.id)).fields[0],
                    field('Place Content', select2('placeContent', p.placeContent || 'start', ['start', 'center', 'end', 'stretch', 'space-between', 'space-around', 'space-evenly'], block.id)).fields[0]
                );
            }
            sections.push({ title: 'Layout', fields: layoutFields });

            // --- Colors ---
            switch(block.type) {
                case 'navbar': 
                case 'hero':
                case 'about':
                case 'services':
                case 'contact':
                case 'footer':
                case 'testimonials':
                case 'stats':
                case 'container':
                case 'box':
                case 'video':
                case 'image':
                case 'pricing':
                case 'videoCarousel':
                case 'products':
                case 'roadmap':
                case 'carousel':
                case 'promoCarousel':
                case 'button':
                case 'text':
                case 'accordion':
                case 'table':
                case 'popup':
                case 'form':
                case 'cta':
                case 'divider':
                case 'html':
                case 'word':
                case 'motionPopup':
                default:
                    sections.push({
                        title: 'Colors',
                        fields: [
                            field('BG Color', color('bgColor', p.bgColor, block.id)).fields[0],
                            field('Text Color', color('textColor', p.textColor, block.id)).fields[0],
                            field('Accent Color', color('accentColor', p.accentColor || '', block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Typography',
                        fields: [
                            field('Font Size', text('fontSize', p.fontSize || '', block.id)).fields[0],
                            field('Font Family', text('fontFamily', p.fontFamily || '', block.id)).fields[0],
                            field('Line Height', text('lineHeight', p.lineHeight || '', block.id)).fields[0],
                            field('Letter Spacing', text('letterSpacing', p.letterSpacing || '', block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Background Image',
                        fields: [
                            field('Image URL', text('bgImage', p.bgImage || '', block.id)).fields[0],
                            field('Overlay Opacity', range('bgOverlayOpacity', p.bgOverlayOpacity !== undefined ? p.bgOverlayOpacity : 0.4, 0, 1, 0.05, block.id)).fields[0],
                            field('Overlay Color (R,G,B)', text('bgOverlayColor', p.bgOverlayColor || '0,0,0', block.id)).fields[0],
                            field('Size', select2('bgSize', p.bgSize || 'cover', ['cover', 'contain', 'auto', '100% 100%'], block.id)).fields[0],
                            field('Position', select2('bgPosition', p.bgPosition || 'center', ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'], block.id)).fields[0],
                            field('Blur (px)', range('bgBlur', p.bgBlur || 0, 0, 20, 1, block.id)).fields[0],
                            field('Gradient', text('background', p.background || '', block.id)).fields[0]
                        ]
                    });
                    break;
            }

            // --- Border ---
            sections.push({
                title: 'Border',
                fields: [
                    field('Radius', text('borderRadius', p.borderRadius || '0', block.id)).fields[0],
                    field('Width', text('borderWidth', p.borderWidth || '', block.id)).fields[0],
                    field('Style', select2('borderStyle', p.borderStyle || 'none', ['none', 'solid', 'dashed', 'dotted', 'double', 'gradient'], block.id)).fields[0],
                    field('Color', color('borderColor', p.borderColor || '', block.id)).fields[0],
                    field('Gradient Border', text('borderGradient', p.borderGradient || '', block.id)).fields[0],
                    field('Border Mode', select2('borderMode', p.borderMode || 'always', ['always', 'hover'], block.id)).fields[0],
                    field('Border Animation', select2('borderAnimation', p.borderAnimation || 'none', ['none', 'rainbow', 'spin', 'pulse'], block.id)).fields[0],
                    field('Animation Speed (s)', text('borderAnimSpeed', p.borderAnimSpeed || '3', block.id)).fields[0],
                    field('Box Shadow', text('boxShadow', p.boxShadow || 'none', block.id)).fields[0],
                    field('Hover Shadow', text('hoverShadow', p.hoverShadow || '', block.id)).fields[0],
                    field('Hover Scale', text('hoverScale', p.hoverScale || '', block.id)).fields[0],
                    field('Hover Border Color', text('hoverBorderColor', p.hoverBorderColor || '', block.id)).fields[0]
                ]
            });

            // --- Effects ---
            sections.push({
                title: 'Effects',
                fields: [
                    field('Opacity', range('opacity', p.opacity !== undefined ? p.opacity : 1, 0, 1, 0.01, block.id)).fields[0],
                    field('Blur (px)', range('blur', p.blur || 0, 0, 20, 1, block.id)).fields[0]
                ]
            });

            // --- Actions (Root) ---
            const actions = [];
            if (block.parentId) {
                const unnestBtn = document.createElement('button');
                unnestBtn.innerText = '📤 Move to Root Level';
                unnestBtn.className = 'tb-btn secondary';
                unnestBtn.style.width = '100%';
                unnestBtn.onclick = () => {
                    State.updateBlockParent(block.id, null);
                    showToast('✅ Moved to root level', 'success');
                };
                actions.push(unnestBtn);
            }
            if (actions.length > 0) {
                sections.push({ title: 'Actions', fields: actions });
            }
        }

        if (isContent) {
            switch (block.type) {
                case 'navbar':
                    sections.push({
                        title: 'Branding',
                        fields: [
                            field('Navbar Type', select2('navStyle', p.navStyle || 'classic', ['classic', 'editorial', 'app'], block.id)).fields[0],
                            field('Brand Name', text('brand', p.brand, block.id)).fields[0],
                            field('Logo URL', url('logo', p.logo, block.id)).fields[0],
                            field('Position Type', select2('navPosition', p.navPosition || (p.sticky === false ? 'static' : 'sticky'), ['static', 'fixed', 'sticky', 'absolute'], block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Navigation Links', 'links', p.links, block.id, [
                        { key: 'label', type: 'text', label: 'Label' },
                        { key: 'href', type: 'url', label: 'Link' },
                        { key: 'childrenText', type: 'textarea', label: 'Dropdown Items (one per line: Label | URL)' }
                    ]));
                    sections.push({
                        title: 'CTA Button',
                        fields: [
                            field('Show Button', toggle('showButton', p.showButton, block.id)).fields[0],
                            field('Button Text', text('buttonText', p.buttonText, block.id)).fields[0],
                            field('Button Link', url('buttonHref', p.buttonHref, block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Cart Settings',
                        fields: [
                            field('Show Cart Icon', toggle('showCart', p.showCart, block.id)).fields[0],
                            field('WhatsApp Number (+)', text('whatsapp', p.whatsapp, block.id)).fields[0],
                            field('Telegram (@)', text('telegram', p.telegram, block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'APK Button',
                        fields: [
                            field('Show APK Button', toggle('showApk', p.showApk !== false, block.id)).fields[0],
                            field('Show on Desktop', toggle('apkShowDesktop', p.apkShowDesktop !== false, block.id)).fields[0],
                            field('Show on Mobile', toggle('apkShowMobile', p.apkShowMobile !== false, block.id)).fields[0]
                        ]
                    });
                    break;
                case 'hero':
                    sections.push({
                        title: 'Main Content',
                        fields: [
                            field('Title', text('title', p.title, block.id)).fields[0],
                            field('Subtitle', textarea('subtitle', p.subtitle, block.id)).fields[0]
                        ]
                    });
                    // Dynamic CTA buttons — show ALL buttons from ctas array
                    const heroCtas = p.ctas && p.ctas.length > 0 ? p.ctas : [
                        { text: p.ctaText || '', href: p.ctaHref || '#', primary: true },
                        ...(p.cta2Text ? [{ text: p.cta2Text, href: p.cta2Href || '#', primary: false }] : [])
                    ];
                    const ctaFields = [];
                    heroCtas.forEach((cta, ci) => {
                        const label = ci === 0 ? 'Primary' : ci === 1 ? 'Secondary' : `Button ${ci + 1}`;
                        // Create inputs that update the ctas array directly
                        const textInput = document.createElement('input');
                        textInput.type = 'text';
                        textInput.value = cta.text || '';
                        textInput.addEventListener('input', () => {
                            _skipAutoRenderOnce = true;
                            const blk = State.getBlock(block.id);
                            if (!blk) return;
                            const updatedCtas = (blk.props.ctas || [...heroCtas]).map((c, idx) => idx === ci ? { ...c, text: textInput.value } : { ...c });
                            const updates = { ctas: updatedCtas };
                            if (ci === 0) updates.ctaText = textInput.value;
                            if (ci === 1) updates.cta2Text = textInput.value;
                            State.updateBlockProps(block.id, updates, { forceRoot: true });
                        });
                        ctaFields.push(field(`${label} Text`, textInput).fields[0]);

                        const hrefInput = document.createElement('input');
                        hrefInput.type = 'text';
                        hrefInput.value = cta.href || '#';
                        hrefInput.addEventListener('input', () => {
                            _skipAutoRenderOnce = true;
                            const blk = State.getBlock(block.id);
                            if (!blk) return;
                            const updatedCtas = (blk.props.ctas || [...heroCtas]).map((c, idx) => idx === ci ? { ...c, href: hrefInput.value } : { ...c });
                            const updates = { ctas: updatedCtas };
                            if (ci === 0) updates.ctaHref = hrefInput.value;
                            if (ci === 1) updates.cta2Href = hrefInput.value;
                            State.updateBlockProps(block.id, updates, { forceRoot: true });
                        });
                        ctaFields.push(field(`${label} Link`, hrefInput).fields[0]);
                    });
                    sections.push({ title: `Actions (${heroCtas.length} buttons)`, fields: ctaFields });
                    break;
                case 'about':
                    sections.push({
                        title: 'About Details',
                        fields: [
                            field('Badge', text('badge', p.badge, block.id)).fields[0],
                            field('Title', text('title', p.title, block.id)).fields[0],
                            field('Text', textarea('text', p.text, block.id)).fields[0],
                            field('Image URL', url('image', p.image, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Features', 'features', p.features, block.id, [
                        { key: 'icon', type: 'icon', label: 'Icon' },
                        { key: 'text', type: 'text', label: 'Text' }
                    ]));
                    break;
                case 'services':
                    sections.push({
                        title: 'Header',
                        fields: [
                            field('Badge', text('badge', p.badge, block.id)).fields[0],
                            field('Title', text('title', p.title, block.id)).fields[0],
                            field('Subtitle', textarea('subtitle', p.subtitle, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Service Cards', 'items', p.items, block.id, [
                        { key: 'icon', type: 'icon', label: 'Icon' },
                        { key: 'title', type: 'text', label: 'Title' },
                        { key: 'desc', type: 'textarea', label: 'Description' }
                    ]));
                    break;
                case 'testimonials':
                    sections.push({
                        title: 'Header',
                        fields: [
                            field('Badge', text('badge', p.badge, block.id)).fields[0],
                            field('Title', text('title', p.title, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Testimonial Cards', 'items', p.items, block.id, [
                        { key: 'name', type: 'text', label: 'Name' },
                        { key: 'role', type: 'text', label: 'Role' },
                        { key: 'avatar', type: 'url', label: 'Avatar URL' },
                        { key: 'text', type: 'textarea', label: 'Quote' }
                    ]));
                    break;
                case 'pricing':
                    sections.push({
                        title: 'Header',
                        fields: [
                            field('Badge', text('badge', p.badge, block.id)).fields[0],
                            field('Title', text('title', p.title, block.id)).fields[0],
                            field('Subtitle', textarea('subtitle', p.subtitle, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Pricing Plans', 'plans', p.plans, block.id, [
                        { key: 'name', type: 'text', label: 'Plan Name' },
                        { key: 'price', type: 'text', label: 'Price' },
                        { key: 'period', type: 'text', label: 'Period (e.g. /mo)' },
                        { key: 'featured', type: 'toggle', label: 'Highlighted?' },
                        { key: 'features', type: 'textarea', label: 'Features (one per line, will be split)' },
                        { key: 'cta', type: 'text', label: 'Button Text' }
                    ]));
                    break;
                case 'stats':
                    sections.push(repeater('Stats', 'items', p.items, block.id, [
                        { key: 'icon', type: 'icon', label: 'Icon' },
                        { key: 'number', type: 'text', label: 'Number' },
                        { key: 'label', type: 'text', label: 'Label' }
                    ]));
                    break;
                case 'image':
                    if (Array.isArray(p.items) && p.items.length) {
                        sections.push(repeater('Image Items', 'items', p.items, block.id, [
                            { key: 'src', type: 'url', label: 'Image URL' },
                            { key: 'alt', type: 'text', label: 'Alt Text' },
                            { key: 'caption', type: 'text', label: 'Caption' },
                            { key: 'description', type: 'textarea', label: 'Description' },
                            { key: 'rating', type: 'number', label: 'Rating (0-5)' }
                        ]));
                        sections.push({
                            title: 'Shared Details',
                            fields: [
                                field('Show Details', toggle('showDetails', p.showDetails, block.id)).fields[0],
                                field('Allow Multi Play', toggle('allowMultiplePlayback', p.allowMultiplePlayback === true, block.id)).fields[0]
                            ]
                        });
                    } else {
                        sections.push({
                            title: 'Source & Caption',
                            fields: [
                                field('Image URL', url('src', p.src, block.id)).fields[0],
                                field('Alt Text', text('alt', p.alt, block.id)).fields[0],
                                field('Caption', text('caption', p.caption, block.id)).fields[0]
                            ]
                        });
                        sections.push({
                            title: 'Review Details',
                            fields: [
                                field('Show Details', toggle('showDetails', p.showDetails, block.id)).fields[0],
                                field('Description', textarea('description', p.description, block.id)).fields[0],
                                field('Rating (0-5)', number('rating', p.rating, block.id)).fields[0]
                            ]
                        });
                    }
                    break;
                case 'video':
                    if (Array.isArray(p.items) && p.items.length) {
                        sections.push(repeater('Video Items', 'items', p.items, block.id, [
                            { key: 'url', type: 'url', label: 'Video URL' },
                            { key: 'thumb', type: 'url', label: 'Thumbnail URL' },
                            { key: 'title', type: 'text', label: 'Title' },
                            { key: 'description', type: 'textarea', label: 'Description' },
                            { key: 'rating', type: 'number', label: 'Rating (0-5)' },
                            { key: 'autoplay', type: 'toggle', label: 'Autoplay' }
                        ]));
                        sections.push({
                            title: 'Playback & Details',
                            fields: [
                                field('Show Details', toggle('showDetails', p.showDetails, block.id)).fields[0],
                                field('Play Multiple Together', toggle('allowMultiplePlayback', p.allowMultiplePlayback === true, block.id)).fields[0],
                                field('Show Share Button', toggle('showShare', p.showShare === true, block.id)).fields[0],
                                field('Share Button Text', text('shareButtonText', p.shareButtonText || 'Share', block.id)).fields[0]
                            ]
                        });
                    } else {
                        sections.push({
                            title: 'Source',
                            fields: [
                                field('Video URL', url('url', p.url, block.id)).fields[0],
                                field('Thumbnail URL', url('thumb', p.thumb || '', block.id)).fields[0],
                                field('Title', text('title', p.title, block.id)).fields[0],
                                field('Autoplay', toggle('autoplay', p.autoplay, block.id)).fields[0]
                            ]
                        });
                        sections.push({
                            title: 'Playback',
                            fields: [
                                field('Play Multiple Together', toggle('allowMultiplePlayback', p.allowMultiplePlayback === true, block.id)).fields[0],
                                field('Show Share Button', toggle('showShare', p.showShare === true, block.id)).fields[0],
                                field('Share Button Text', text('shareButtonText', p.shareButtonText || 'Share', block.id)).fields[0]
                            ]
                        });
                        sections.push({
                            title: 'Review Details',
                            fields: [
                                field('Show Details', toggle('showDetails', p.showDetails, block.id)).fields[0],
                                field('Description', textarea('description', p.description, block.id)).fields[0],
                                field('Rating (0-5)', number('rating', p.rating, block.id)).fields[0]
                            ]
                        });
                    }
                    break;
                case 'html':
                    sections.push({
                        title: 'Embed Code',
                        fields: [field('HTML Code', htmlEditor('code', p.code, block.id)).fields[0]]
                    });
                    break;
                case 'word':
                    sections.push({
                        title: 'Section Header',
                        fields: [
                            field('Title', text('title', p.title || '', block.id)).fields[0],
                            field('Subtitle', textarea('subtitle', p.subtitle || '', block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Word Content Box',
                        fields: [field('Paste From Word', wordPasteEditor('contentHtml', p.contentHtml || '', block.id)).fields[0]]
                    });
                    break;
                case 'motionPopup':
                    sections.push({
                        title: 'Popup Manager',
                        fields: [
                            field('Title', text('title', p.title || '', block.id)).fields[0],
                            field('Subtitle', textarea('subtitle', p.subtitle || '', block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Popup Content',
                        fields: [
                            field('Popup Title', text('popupTitle', p.popupTitle || '', block.id)).fields[0],
                            field('Popup Text', textarea('popupText', p.popupText || '', block.id)).fields[0],
                            field('Button Text', text('popupButtonText', p.popupButtonText || '', block.id)).fields[0],
                            field('Button Link', text('popupButtonHref', p.popupButtonHref || '#', block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Popup Style',
                        fields: [
                            field('BG Color', color('popupBgColor', p.popupBgColor || '#ffffff', block.id)).fields[0],
                            field('BG Image URL', text('popupBgImage', p.popupBgImage || '', block.id)).fields[0],
                            field('Text Color', color('popupTextColor', p.popupTextColor || '#0f172a', block.id)).fields[0],
                            field('Width', text('popupWidth', p.popupWidth || '460px', block.id)).fields[0],
                            field('Padding', text('popupPadding', p.popupPadding || '28px', block.id)).fields[0],
                            field('Radius', text('popupRadius', p.popupRadius || '24px', block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Popup Behavior',
                        fields: [
                            field('Enable Popup', toggle('popupEnabled', p.popupEnabled !== false, block.id)).fields[0],
                            field('Delay (ms)', text('popupDelay', p.popupDelay || '3000', block.id)).fields[0],
                            field('Auto Close', toggle('popupAutoClose', p.popupAutoClose === true, block.id)).fields[0]
                        ]
                    });
                    break;
                case 'text':
                    if (Array.isArray(p.items) && p.items.length) {
                        sections.push(repeater('Text Items', 'items', p.items, block.id, [
                            { key: 'badge', type: 'text', label: 'Badge' },
                            { key: 'title', type: 'text', label: 'Title' },
                            { key: 'text', type: 'textarea', label: 'Text' }
                        ]));
                    } else {
                        const parsed = extractTextBlockFields(p.html || '');
                        sections.push({
                            title: 'Content',
                            fields: [
                                field('Badge', text('badge', p.badge !== undefined ? p.badge : parsed.badge, block.id)).fields[0],
                                field('Title', text('title', p.title !== undefined ? p.title : parsed.title, block.id)).fields[0],
                                field('Text', textarea('text', p.text !== undefined ? p.text : parsed.text, block.id)).fields[0]
                            ]
                        });
                    }
                    break;
                case 'box':
                    if (Array.isArray(p.items) && p.items.length) {
                        sections.push(repeater('Box Items', 'items', p.items, block.id, [
                            { key: 'title', type: 'text', label: 'Title' },
                            { key: 'text', type: 'textarea', label: 'Text' },
                            { key: 'buttonText', type: 'text', label: 'Button Text' },
                            { key: 'buttonHref', type: 'url', label: 'Button Link' }
                        ]));
                    }
                    break;
                case 'divider':
                    sections.push({
                        title: 'Line Style',
                        fields: [
                            field('Style', select2('style', p.style || 'solid', ['solid', 'dashed', 'dotted'], block.id)).fields[0],
                            field('Thickness', text('thickness', p.thickness || '1px', block.id)).fields[0],
                            field('Color', color('color', p.color || '#e5e7eb', block.id)).fields[0]
                        ]
                    });
                    break;
                case 'cta':
                    sections.push({
                        title: 'Content',
                        fields: [
                            field('Title', text('title', p.title, block.id)).fields[0],
                            field('Subtitle', textarea('subtitle', p.subtitle, block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Action',
                        fields: [
                            field('Button Text', text('buttonText', p.buttonText, block.id)).fields[0],
                            field('Button Link', url('buttonHref', p.buttonHref, block.id)).fields[0]
                        ]
                    });
                    break;
                case 'footer':
                    sections.push({
                        title: 'Basic Info',
                        fields: [
                            field('Brand Name', text('brand', p.brand, block.id)).fields[0],
                            field('Tagline', text('tagline', p.tagline, block.id)).fields[0],
                            field('Copyright', text('copyright', p.copyright, block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Socials',
                        fields: [
                            field('Show Socials', toggle('showSocials', p.showSocials, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Social Links', 'socials', p.socials, block.id, [
                        { key: 'icon', type: 'icon', label: 'Icon' },
                        { key: 'href', type: 'url', label: 'URL' }
                    ]));
                    sections.push(repeater('Quick Links', 'links', p.links, block.id, [
                        { key: 'label', type: 'text', label: 'Label' },
                        { key: 'href', type: 'url', label: 'URL' }
                    ]));
                    break;
                case 'carousel':
                    sections.push({
                        title: 'Settings',
                        fields: [
                            field('Layout', select2('carouselLayout', p.carouselLayout || 'hero', ['hero', 'editorial', 'card'], block.id)).fields[0],
                            field('Image Fit', select2('objectFit', p.objectFit || 'cover', ['cover', 'contain', 'stretch', 'fill'], block.id)).fields[0],
                            field('Autoplay', toggle('autoplay', p.autoplay, block.id)).fields[0],
                            field('Interval (ms)', number('interval', p.interval || 4000, block.id)).fields[0],
                            field('Show Dots', toggle('showDots', p.showDots, block.id)).fields[0],
                            field('Show Arrows', toggle('showArrows', p.showArrows, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Slides', 'slides', p.slides, block.id, [
                        { key: 'image', type: 'url', label: 'Image URL' },
                        { key: 'title', type: 'text', label: 'Title' },
                        { key: 'subtitle', type: 'textarea', label: 'Subtitle' },
                        { key: 'objectFit', type: 'select', label: 'Image Fit', options: ['cover', 'contain', 'fill', 'none', 'scale-down'] },
                        { key: 'objectPosition', type: 'select', label: 'Image Position', options: ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right'] }
                    ]));
                    break;
                case 'videoCarousel':
                    sections.push({
                        title: 'Section Header',
                        fields: [
                            field('Section Title', text('sectionTitle', p.sectionTitle, block.id)).fields[0],
                            field('Subtitle', text('sectionSubtitle', p.sectionSubtitle, block.id)).fields[0],
                            field('Layout', select2('videoCarouselLayout', p.videoCarouselLayout || 'standard', ['standard', 'editorial', 'spotlight'], block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Carousel Settings',
                        fields: [
                            field('Cards Per Row', number('cardsPerView', p.cardsPerView || 3, block.id)).fields[0],
                            field('Show Arrows', toggle('showArrows', p.showArrows, block.id)).fields[0],
                            field('Show Dots', toggle('showDots', p.showDots, block.id)).fields[0],
                            field('Autoplay', toggle('autoplay', p.autoplay, block.id)).fields[0],
                            field('Interval (ms)', number('interval', p.interval || 4000, block.id)).fields[0],
                            field('Play Multiple Together', toggle('allowMultiplePlayback', p.allowMultiplePlayback === true, block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Theme Colors',
                        fields: [
                            field('Background', color('bgColor', p.bgColor || '#0d1117', block.id)).fields[0],
                            field('Text Color', color('textColor', p.textColor || '#ffffff', block.id)).fields[0],
                            field('Accent Color', color('accentColor', p.accentColor || '#f5a623', block.id)).fields[0],
                            field('Card Background', color('cardBg', p.cardBg || '#161b22', block.id)).fields[0],
                            field('Card Border', color('cardBorder', p.cardBorder || '#30363d', block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Video Cards', 'videos', p.videos, block.id, [
                        { key: 'url', type: 'url', label: 'Video URL (YouTube/etc.)' },
                        { key: 'title', type: 'text', label: 'Card Title' },
                        { key: 'views', type: 'text', label: 'View Count (e.g. 1.2M views)' },
                        { key: 'thumb', type: 'url', label: 'Custom Thumbnail URL (optional)' }
                    ]));
                    break;
                case 'promoCarousel':
                    sections.push({
                        title: 'Promo Slider',
                        fields: [
                            field('Layout', select2('promoLayout', p.promoLayout || 'banner', ['banner', 'card', 'filmstrip'], block.id)).fields[0],
                            field('Image Fit', select2('objectFit', p.objectFit || 'cover', ['cover', 'contain', 'stretch', 'fill'], block.id)).fields[0],
                            field('Autoplay', toggle('autoplay', p.autoplay, block.id)).fields[0],
                            field('Interval (ms)', number('interval', p.interval || 4000, block.id)).fields[0],
                            field('Show Dots', toggle('showDots', p.showDots !== false, block.id)).fields[0],
                            field('Show Arrows', toggle('showArrows', p.showArrows, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Promo Slides', 'slides', p.slides, block.id, [
                        { key: 'image', type: 'url', label: 'Image URL' },
                        { key: 'title', type: 'text', label: 'Title' },
                        { key: 'subtitle', type: 'text', label: 'Subtitle' },
                        { key: 'objectFit', type: 'select', label: 'Image Fit', options: ['cover', 'contain', 'fill', 'none', 'scale-down'] },
                        { key: 'objectPosition', type: 'select', label: 'Image Position', options: ['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right'] }
                    ]));
                    break;
                case 'contact':
                    sections.push({
                        title: 'Section Content',
                        fields: [
                            field('Badge', text('badge', p.badge, block.id)).fields[0],
                            field('Title', text('title', p.title, block.id)).fields[0],
                            field('Subtitle', textarea('subtitle', p.subtitle, block.id)).fields[0],
                            field('Phone', text('phone', p.phone, block.id)).fields[0],
                            field('Email', text('email', p.email, block.id)).fields[0],
                            field('Address', text('address', p.address, block.id)).fields[0]
                        ]
                    });

                    // --- Form Fields Editor ---
                    const formFieldsSec = { title: 'Form Fields', fields: [] };
                    const formFields = p.formFields || [
                        { type: 'text', name: 'name', label: 'Your Name', placeholder: 'Your Name', required: true },
                        { type: 'email', name: 'email', label: 'Your Email', placeholder: 'Your Email', required: true },
                        { type: 'text', name: 'subject', label: 'Subject', placeholder: 'Subject', required: false },
                        { type: 'textarea', name: 'message', label: 'Message', placeholder: 'Your message…', required: true }
                    ];

                    // Render each form field as an editable row
                    const fieldsList = document.createElement('div');
                    fieldsList.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-bottom:12px;';

                    formFields.forEach((ff, fi) => {
                        const row = document.createElement('div');
                        row.style.cssText = 'background:var(--surface2);padding:8px 10px;border-radius:6px;font-size:0.78rem;';

                        // Top row: badge + label + actions
                        const topRow = document.createElement('div');
                        topRow.style.cssText = 'display:flex;align-items:center;gap:6px;';

                        // Type badge
                        const typeBadge = document.createElement('span');
                        typeBadge.style.cssText = 'background:var(--accent);color:#fff;padding:2px 6px;border-radius:4px;font-size:0.65rem;font-weight:700;text-transform:uppercase;flex-shrink:0;';
                        typeBadge.textContent = ff.type === 'textarea' ? 'msg' : ff.type;
                        topRow.appendChild(typeBadge);

                        // Editable label
                        const labelInput = document.createElement('input');
                        labelInput.type = 'text';
                        labelInput.value = ff.label || ff.name || '';
                        labelInput.style.cssText = 'flex:1;border:none;background:transparent;color:var(--text1);font-size:0.78rem;outline:none;min-width:60px;';
                        labelInput.placeholder = 'Field label';
                        labelInput.addEventListener('change', () => {
                            const blk = State.getBlock(block.id);
                            const arr = [...(blk?.props?.formFields || formFields)];
                            arr[fi] = { ...arr[fi], label: labelInput.value, placeholder: labelInput.value };
                            State.updateBlockProps(block.id, { formFields: arr }, { forceRoot: true });
                        });
                        topRow.appendChild(labelInput);

                        // Required toggle
                        const reqBtn = document.createElement('button');
                        reqBtn.style.cssText = 'border:none;background:none;cursor:pointer;font-size:0.7rem;padding:2px 4px;border-radius:3px;' + (ff.required ? 'color:var(--danger,#ef4444);font-weight:700;' : 'color:var(--text3);');
                        reqBtn.textContent = ff.required ? 'REQ' : 'opt';
                        reqBtn.title = ff.required ? 'Required (click to make optional)' : 'Optional (click to make required)';
                        reqBtn.onclick = (e) => {
                            e.stopPropagation();
                            const blk = State.getBlock(block.id);
                            const arr = [...(blk?.props?.formFields || formFields)];
                            arr[fi] = { ...arr[fi], required: !arr[fi].required };
                            State.updateBlockProps(block.id, { formFields: arr }, { forceRoot: true });
                            setTimeout(() => renderPanel(State.getBlock(block.id)), 50);
                        };
                        topRow.appendChild(reqBtn);

                        // Move up
                        const upBtn = document.createElement('button');
                        upBtn.style.cssText = 'border:none;background:none;cursor:pointer;font-size:0.7rem;color:var(--text3);padding:2px;';
                        upBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
                        upBtn.onclick = (e) => { e.stopPropagation(); if (fi > 0) { const blk = State.getBlock(block.id); const arr = [...(blk?.props?.formFields || formFields)]; [arr[fi-1], arr[fi]] = [arr[fi], arr[fi-1]]; State.updateBlockProps(block.id, { formFields: arr }, { forceRoot: true }); setTimeout(() => renderPanel(State.getBlock(block.id)), 50); } };
                        topRow.appendChild(upBtn);

                        // Move down
                        const downBtn = document.createElement('button');
                        downBtn.style.cssText = 'border:none;background:none;cursor:pointer;font-size:0.7rem;color:var(--text3);padding:2px;';
                        downBtn.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
                        downBtn.onclick = (e) => { e.stopPropagation(); if (fi < formFields.length - 1) { const blk = State.getBlock(block.id); const arr = [...(blk?.props?.formFields || formFields)]; [arr[fi], arr[fi+1]] = [arr[fi+1], arr[fi]]; State.updateBlockProps(block.id, { formFields: arr }, { forceRoot: true }); setTimeout(() => renderPanel(State.getBlock(block.id)), 50); } };
                        topRow.appendChild(downBtn);

                        // Delete
                        const delBtn = document.createElement('button');
                        delBtn.style.cssText = 'border:none;background:none;cursor:pointer;font-size:0.7rem;color:var(--danger,#ef4444);padding:2px;';
                        delBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                        delBtn.onclick = (e) => { e.stopPropagation(); const blk = State.getBlock(block.id); const arr = (blk?.props?.formFields || formFields).filter((_, idx) => idx !== fi); State.updateBlockProps(block.id, { formFields: arr }, { forceRoot: true }); setTimeout(() => renderPanel(State.getBlock(block.id)), 50); };
                        topRow.appendChild(delBtn);

                        row.appendChild(topRow);

                        // Dropdown options editor (only for select type)
                        if (ff.type === 'select') {
                            const optsWrap = document.createElement('div');
                            optsWrap.style.cssText = 'margin-top:6px;padding-top:6px;border-top:1px solid var(--border);';
                            
                            const optsLabel = document.createElement('div');
                            optsLabel.style.cssText = 'font-size:0.68rem;color:var(--text3);margin-bottom:4px;';
                            optsLabel.textContent = 'Options (one per line):';
                            optsWrap.appendChild(optsLabel);
                            
                            const optsTextarea = document.createElement('textarea');
                            optsTextarea.style.cssText = 'width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:4px;background:var(--surface1,#1a1a2e);color:var(--text1);font-size:0.75rem;resize:vertical;min-height:50px;';
                            optsTextarea.value = (ff.options || []).join('\n');
                            optsTextarea.placeholder = 'Option 1\nOption 2\nOption 3';
                            optsTextarea.addEventListener('change', () => {
                                const blk = State.getBlock(block.id);
                                const arr = [...(blk?.props?.formFields || formFields)];
                                arr[fi] = { ...arr[fi], options: optsTextarea.value.split('\n').map(o => o.trim()).filter(o => o) };
                                State.updateBlockProps(block.id, { formFields: arr }, { forceRoot: true });
                            });
                            optsWrap.appendChild(optsTextarea);
                            row.appendChild(optsWrap);
                        }

                        fieldsList.appendChild(row);
                    });
                    formFieldsSec.fields.push(fieldsList);

                    // Add new field controls
                    const addRow = document.createElement('div');
                    addRow.style.cssText = 'display:flex;gap:6px;align-items:center;flex-wrap:wrap;';

                    const fieldTypes = [
                        { value: 'text', label: 'Text' },
                        { value: 'email', label: 'Email' },
                        { value: 'tel', label: 'Phone' },
                        { value: 'number', label: 'Number' },
                        { value: 'url', label: 'URL' },
                        { value: 'textarea', label: 'Message' },
                        { value: 'select', label: 'Dropdown' },
                        { value: 'file', label: 'File Upload' },
                        { value: 'date', label: 'Date' },
                        { value: 'checkbox', label: 'Checkbox' }
                    ];

                    const typeSelect = document.createElement('select');
                    typeSelect.style.cssText = 'padding:6px 10px;border:1px solid var(--border);border-radius:6px;background:var(--surface2);color:var(--text1);font-size:0.78rem;flex:1;';
                    fieldTypes.forEach(ft => {
                        const opt = document.createElement('option');
                        opt.value = ft.value;
                        opt.textContent = ft.label;
                        typeSelect.appendChild(opt);
                    });
                    addRow.appendChild(typeSelect);

                    const addBtn = document.createElement('button');
                    addBtn.className = 'tb-btn secondary';
                    addBtn.style.cssText = 'font-size:0.75rem;padding:6px 12px;white-space:nowrap;';
                    addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Field';
                    addBtn.onclick = () => {
                        const newType = typeSelect.value;
                        const labelMap = { text: 'Text Field', email: 'Email', tel: 'Phone', number: 'Number', url: 'Website', textarea: 'Message', select: 'Select Option', file: 'File Upload', date: 'Date', checkbox: 'I agree to terms' };
                        const newField = {
                            type: newType,
                            name: newType + '_' + Date.now().toString(36).slice(-4),
                            label: labelMap[newType] || 'Field',
                            placeholder: labelMap[newType] || 'Enter value',
                            required: false
                        };
                        if (newType === 'select') newField.options = ['Option 1', 'Option 2', 'Option 3'];
                        const currentBlock = State.getBlock(block.id);
                        const currentFields = currentBlock?.props?.formFields || [...formFields];
                        const arr = [...currentFields, newField];
                        State.updateBlockProps(block.id, { formFields: arr }, { forceRoot: true });
                        setTimeout(() => renderPanel(State.getBlock(block.id)), 50);
                    };
                    addRow.appendChild(addBtn);
                    formFieldsSec.fields.push(addRow);

                    sections.push(formFieldsSec);
                    // Form Backend Integration UI
                    if (typeof FormIntegrations !== 'undefined') {
                        const providers = FormIntegrations.getProviders();
                        const currentProvider = p.formProvider || 'none';
                        const currentConfig = p.formConfig || {};

                        const formSection = { title: 'Form Backend', fields: [] };

                        // Provider selector
                        const providerSelect = select2('formProvider', currentProvider, providers.map(pr => pr.id), block.id);
                        // Override display labels
                        Array.from(providerSelect.options).forEach((opt, i) => {
                            opt.textContent = providers[i]?.name || opt.value;
                        });
                        formSection.fields.push(field('Provider', providerSelect).fields[0]);

                        // Provider info box with description + setup instructions
                        const provider = FormIntegrations.getProvider(currentProvider);
                        const infoBox = document.createElement('div');
                        infoBox.style.cssText = 'background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:12px;margin:4px 0 12px;font-size:0.78rem;line-height:1.5;color:var(--text2);';
                        
                        const providerInfoMap = {
                            none: '<strong>Demo Mode</strong><br>Form shows an alert on submit. No data is sent anywhere. Select a provider to connect your form to a real backend.',
                            formspree: '<strong>Formspree</strong><br>1. Go to <a href="https://formspree.io" target="_blank" style="color:var(--accent);">formspree.io</a> and create a free account<br>2. Create a new form<br>3. Copy the Form ID (e.g. <code>xrgbkwyz</code>)<br>4. Paste it below',
                            netlify: '<strong>Netlify Forms</strong><br>1. Deploy your exported site to Netlify<br>2. Forms are auto-detected — no extra setup needed<br>3. View submissions in Netlify dashboard → Forms',
                            emailjs: '<strong>EmailJS</strong><br>1. Go to <a href="https://emailjs.com" target="_blank" style="color:var(--accent);">emailjs.com</a> and create account<br>2. Add an email service (Gmail, Outlook, etc.)<br>3. Create an email template<br>4. Copy your Public Key, Service ID, and Template ID below',
                            webhook: '<strong>Webhook</strong><br>1. Create a webhook URL from Zapier, Make, n8n, or your own API<br>2. Paste the URL below<br>3. Form data will be sent as JSON POST on submit',
                            googleSheets: (() => {
                                // Generate dynamic Apps Script code based on current form fields
                                const fields = p.formFields || [
                                    { name: 'name' }, { name: 'email' }, { name: 'subject' }, { name: 'message' }
                                ];
                                const fieldNames = fields.map(f => f.name || f.type);
                                const sheetHeaders = fieldNames.join(' | ') + ' | timestamp';
                                const appendRowCode = fieldNames.map(n => '    data.' + n + ' || ""').join(',\n');
                                
                                return '<strong>Google Sheets</strong><br>' +
                                '1. Create a Google Sheet with headers: <code>' + sheetHeaders + '</code><br>' +
                                '2. Go to Extensions → Apps Script<br>' +
                                '3. Delete existing code, paste this:<br>' +
                                '<div style="background:#0f172a;color:#e2e8f0;padding:10px;border-radius:6px;margin:8px 0;font-family:monospace;font-size:0.7rem;white-space:pre-wrap;cursor:text;user-select:all;">' +
                                'function doPost(e) {\n' +
                                '  var sheet = SpreadsheetApp\n' +
                                '    .getActiveSpreadsheet()\n' +
                                '    .getActiveSheet();\n' +
                                '  var data = e.parameter;\n' +
                                '  sheet.appendRow([\n' +
                                appendRowCode + ',\n' +
                                '    new Date().toISOString()\n' +
                                '  ]);\n' +
                                '  return ContentService\n' +
                                '    .createTextOutput(\n' +
                                '      JSON.stringify({status:"success"})\n' +
                                '    )\n' +
                                '    .setMimeType(\n' +
                                '      ContentService.MimeType.JSON\n' +
                                '    );\n' +
                                '}</div>' +
                                '4. Click <strong>Deploy → New deployment</strong><br>' +
                                '5. Type: <strong>Web app</strong> | Execute as: <strong>Me</strong> | Access: <strong>Anyone</strong><br>' +
                                '6. Click Deploy and copy the Web App URL below';
                            })()
                        };
                        
                        infoBox.innerHTML = providerInfoMap[currentProvider] || (provider?.description || 'Select a form backend provider.');
                        formSection.fields.push(infoBox);

                        // Provider-specific config fields
                        if (currentProvider !== 'none') {
                            const providerFields = FormIntegrations.getProviderFields(currentProvider);
                            providerFields.forEach(pf => {
                                const input = document.createElement('input');
                                input.type = 'text';
                                input.value = currentConfig[pf.key] || '';
                                input.placeholder = pf.placeholder || '';
                                input.style.cssText = 'width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:6px;background:var(--surface2);color:var(--text1);font-size:0.82rem;';
                                input.addEventListener('change', () => {
                                    const newConfig = { ...(State.getBlock(block.id)?.props?.formConfig || {}), [pf.key]: input.value };
                                    State.updateBlockProps(block.id, { formConfig: newConfig }, { immediate: true });
                                });
                                formSection.fields.push(field(pf.label + (pf.required ? ' *' : ''), input).fields[0]);
                            });
                        }

                        sections.push(formSection);
                    }
                    break;
                case 'products':
                    sections.push({
                        title: 'Header Content',
                        fields: [
                            field('Badge', text('badge', p.badge, block.id)).fields[0],
                            field('Title', text('title', p.title, block.id)).fields[0],
                            field('Subtitle', textarea('subtitle', p.subtitle, block.id)).fields[0],
                            field('Accent Color', color('accentColor', p.accentColor || '#6c63ff', block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Products List', 'items', p.items, block.id, [
                        { key: 'images', type: 'textarea', label: 'Image URLs (comma-separated for multiple)' },
                        { key: 'name', type: 'text', label: 'Product Name' },
                        { key: 'price', type: 'text', label: 'Price' },
                        { key: 'desc', type: 'textarea', label: 'Description' },
                        { key: 'cta', type: 'text', label: 'Button Text' },
                        { key: 'link', type: 'url', label: 'Button Link (optional)' }
                    ]));
                    break;
                case 'roadmap':
                    sections.push({
                        title: 'Roadmap Header',
                        fields: [
                            field('Badge', text('badge', p.badge, block.id)).fields[0],
                            field('Title', text('title', p.title, block.id)).fields[0],
                            field('Subtitle', textarea('subtitle', p.subtitle, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Roadmap Milestones', 'items', p.items, block.id, [
                        { key: 'date', type: 'text', label: 'Date/Phase' },
                        { key: 'title', type: 'text', label: 'Title' },
                        { key: 'desc', type: 'textarea', label: 'Description' },
                        { key: 'status', type: 'select', label: 'Status', options: ['upcoming', 'current', 'completed'] },
                        { key: 'icon', type: 'icon', label: 'Icon (FA)' },
                        { key: 'link', type: 'url', label: 'Link URL (optional)' }
                    ]));
                    break;
                case 'accordion':
                    sections.push({
                        title: 'Section Header',
                        fields: [
                            field('Badge', text('badge', p.badge || '', block.id)).fields[0],
                            field('Title', text('title', p.title || '', block.id)).fields[0],
                            field('Subtitle', textarea('subtitle', p.subtitle || '', block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Expandable Items', 'items', p.items || [], block.id, [
                        { key: 'title', type: 'text', label: 'Title' },
                        { key: 'image', type: 'url', label: 'Image URL (optional)' },
                        { key: 'heading', type: 'text', label: 'Content Heading' },
                        { key: 'description', type: 'textarea', label: 'Description' },
                        { key: 'contentHtml', type: 'textarea', label: 'Custom HTML (advanced)' },
                        { key: 'open', type: 'toggle', label: 'Open by Default' }
                    ]));
                    break;
                case 'table':
                    {
                        const currentColumns = getTableColumnCount(p);
                        const addColumnWrap = document.createElement('div');
                        addColumnWrap.style.display = 'flex';
                        addColumnWrap.style.alignItems = 'center';
                        addColumnWrap.style.justifyContent = 'space-between';
                        addColumnWrap.style.gap = '12px';

                        const countInfo = document.createElement('div');
                        countInfo.style.cssText = 'font-size:0.85rem;color:var(--text2);';
                        countInfo.textContent = `Active columns: ${currentColumns}`;

                        const addColumnBtn = document.createElement('button');
                        addColumnBtn.type = 'button';
                        addColumnBtn.className = 'btn';
                        addColumnBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Column';
                        addColumnBtn.style.cssText = 'display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:0.84rem;font-weight:600;';
                        addColumnBtn.addEventListener('click', () => {
                            const liveBlock = State.getBlock(block.id);
                            const liveCount = getTableColumnCount(liveBlock?.props || {});
                            const nextCount = liveCount + 1;
                            const nextHeaderKey = `header${nextCount}`;
                            const nextRows = (liveBlock?.props?.rows || []).map((row) => ({
                                ...row,
                                [`col${nextCount}`]: row?.[`col${nextCount}`] || ''
                            }));
                            State.updateBlockProps(block.id, {
                                columnCount: String(nextCount),
                                [nextHeaderKey]: liveBlock?.props?.[nextHeaderKey] || `Column ${nextCount}`,
                                rows: nextRows
                            });
                            renderPanel(State.getBlock(block.id));
                        });

                        addColumnWrap.appendChild(countInfo);
                        addColumnWrap.appendChild(addColumnBtn);

                        sections.push({
                            title: 'Table Columns',
                            fields: [addColumnWrap]
                        });
                    }
                    sections.push({
                        title: 'Section Header',
                        fields: [
                            field('Badge', text('badge', p.badge || '', block.id)).fields[0],
                            field('Title', text('title', p.title || '', block.id)).fields[0],
                            field('Subtitle', textarea('subtitle', p.subtitle || '', block.id)).fields[0]
                        ]
                    });
                    {
                        const currentColumns = getTableColumnCount(p);
                        const headerFields = [];
                        for (let i = 1; i <= currentColumns; i += 1) {
                            headerFields.push(field(`Header ${i}`, text(`header${i}`, p[`header${i}`] || '', block.id)).fields[0]);
                        }
                        sections.push({
                            title: 'Column Headers',
                            fields: headerFields
                        });
                        const rowFieldDefs = [];
                        for (let i = 1; i <= currentColumns; i += 1) {
                            rowFieldDefs.push({ key: `col${i}`, type: 'text', label: `Column ${i}` });
                        }
                        sections.push(repeater('Table Rows', 'rows', p.rows || [], block.id, rowFieldDefs));
                    }
                    break;
                case 'button':
                    sections.push({
                        title: 'Button Settings',
                        fields: [
                            field('Button Text', text('text', p.text, block.id)).fields[0],
                            field('Action Type', select2('actionType', p.actionType || 'link', ['link', 'cart'], block.id)).fields[0]
                        ]
                    });
                    if (p.actionType === 'cart') {
                        sections.push({
                            title: 'Cart Connection',
                            fields: [
                                field('Product Name', text('cartItemName', p.cartItemName || '', block.id)).fields[0],
                                field('Product Price', text('cartItemPrice', p.cartItemPrice || '', block.id)).fields[0],
                                field('Product Image', url('cartItemImage', p.cartItemImage || '', block.id)).fields[0]
                            ]
                        });
                    } else {
                        sections.push({
                            title: 'Link Connection',
                            fields: [
                                field('Target URL / #', url('href', p.href || '#', block.id)).fields[0]
                            ]
                        });
                    }
                    // Button Style (BG Color + Text Color)
                    sections.push({
                        title: 'Button Style',
                        fields: [
                            field('BG Color', color('bgColor', p.bgColor || '#6c63ff', block.id)).fields[0],
                            field('Text Color', color('color', p.color || '#ffffff', block.id)).fields[0],
                            field('Border Radius', text('borderRadius', p.borderRadius || '', block.id)).fields[0],
                            field('Padding', text('padding', p.padding || '', block.id)).fields[0]
                        ]
                    });
                    break;
                case 'audioPlayer':
                    sections.push({
                        title: 'Audio Source',
                        fields: [
                            field('Audio URL (mp3)', text('src', p.src || '', block.id)).fields[0],
                            field('Track Title', text('title', p.title || '', block.id)).fields[0],
                            field('Artist', text('artist', p.artist || '', block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Playback',
                        fields: [
                            field('Autoplay', toggle('autoplay', p.autoplay === true, block.id)).fields[0],
                            field('Loop', toggle('loop', p.loop === true, block.id)).fields[0]
                        ]
                    });
                    break;
                case 'mapEmbed':
                    sections.push({
                        title: 'Embed Settings',
                        fields: [
                            field('Embed URL (iframe src)', text('embedUrl', p.embedUrl || '', block.id)).fields[0],
                            field('Height', text('height', p.height || '400px', block.id)).fields[0],
                            field('Border Radius', text('borderRadius', p.borderRadius || '16px', block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Header',
                        fields: [
                            field('Show Title', toggle('showTitle', p.showTitle === true, block.id)).fields[0],
                            field('Title', text('title', p.title || '', block.id)).fields[0]
                        ]
                    });
                    break;
                case 'backToTop':
                    sections.push({
                        title: 'Button Settings',
                        fields: [
                            field('Icon Class', text('icon', p.icon || 'fa-solid fa-arrow-up', block.id)).fields[0],
                            field('Size', text('size', p.size || '52px', block.id)).fields[0],
                            field('Border Radius', text('borderRadius', p.borderRadius || '50%', block.id)).fields[0],
                            field('Position', select2('position', p.position || 'bottom-right', ['bottom-right', 'bottom-left', 'bottom-center'], block.id)).fields[0],
                            field('Offset', text('offset', p.offset || '24px', block.id)).fields[0],
                            field('Show After (px scroll)', number('showAfter', p.showAfter || 300, block.id)).fields[0],
                            field('Smooth Scroll', toggle('smooth', p.smooth !== false, block.id)).fields[0]
                        ]
                    });
                    break;
                // ========== CASINO BLOCKS ==========
                case 'casinoHero':
                    sections.push({
                        title: 'Hero Content',
                        fields: [
                            field('Heading', text('heading', p.heading, block.id)).fields[0],
                            field('Subtitle', text('subtitle', p.subtitle, block.id)).fields[0],
                            field('Description', textarea('description', p.description, block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'CTA Button',
                        fields: [
                            field('Show CTA', toggle('showCta', p.showCta, block.id)).fields[0],
                            field('CTA Text', text('ctaText', p.ctaText, block.id)).fields[0],
                            field('CTA Link', url('ctaLink', p.ctaLink, block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Gold Gradient',
                        fields: [
                            field('Gradient Start', color('gradientStart', p.gradientStart, block.id)).fields[0],
                            field('Gradient Mid', color('gradientMid', p.gradientMid, block.id)).fields[0],
                            field('Gradient End', color('gradientEnd', p.gradientEnd, block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Effects',
                        fields: [
                            field('Show Blobs', toggle('showBlobs', p.showBlobs, block.id)).fields[0],
                            field('Font Family', text('fontFamily', p.fontFamily, block.id)).fields[0]
                        ]
                    });
                    break;
                case 'goldHeading':
                    sections.push({
                        title: 'Text Content',
                        fields: [
                            field('Heading Text', text('text', p.text, block.id)).fields[0],
                            field('Subtitle', text('subtitle', p.subtitle, block.id)).fields[0],
                            field('HTML Tag', select2('tag', p.tag || 'h1', ['h1', 'h2', 'h3', 'h4'], block.id)).fields[0],
                            field('Font Size', text('fontSize', p.fontSize, block.id)).fields[0],
                            field('Subtitle Size', text('subtitleSize', p.subtitleSize, block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Gold Gradient',
                        fields: [
                            field('Gradient Start', color('gradientStart', p.gradientStart, block.id)).fields[0],
                            field('Gradient Mid', color('gradientMid', p.gradientMid, block.id)).fields[0],
                            field('Gradient End', color('gradientEnd', p.gradientEnd, block.id)).fields[0],
                            field('Text Shadow', toggle('textShadow', p.textShadow, block.id)).fields[0]
                        ]
                    });
                    break;
                case 'casinoNavbar':
                    sections.push({
                        title: 'Branding',
                        fields: [
                            field('Brand Name', text('brand', p.brand, block.id)).fields[0],
                            field('Logo URL', url('logo', p.logo, block.id)).fields[0],
                            field('Sticky', toggle('sticky', p.sticky, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Nav Links', 'links', p.links, block.id, [
                        { key: 'label', type: 'text', label: 'Label' },
                        { key: 'href', type: 'url', label: 'Link' },
                        { key: 'childrenText', type: 'textarea', label: 'Dropdown Items (one per line: Label | URL)' }
                    ]));
                    sections.push({
                        title: 'CTA Button',
                        fields: [
                            field('Show Button', toggle('showButton', p.showButton, block.id)).fields[0],
                            field('Button Text', text('buttonText', p.buttonText, block.id)).fields[0],
                            field('Button Link', url('buttonHref', p.buttonHref, block.id)).fields[0]
                        ]
                    });
                    break;
                case 'partnerCards':
                    sections.push({
                        title: 'Section Settings',
                        fields: [
                            field('Button Text', text('btnText', p.btnText, block.id)).fields[0],
                            field('Show Rainbow Border', toggle('showRainbowBorder', p.showRainbowBorder, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Partner Cards', 'cards', p.cards, block.id, [
                        { key: 'name', type: 'text', label: 'Brand Name' },
                        { key: 'logo', type: 'url', label: 'Logo URL' },
                        { key: 'badge', type: 'select', label: 'Badge', options: ['favourite', 'hot', 'new', 'none'] },
                        { key: 'featured', type: 'toggle', label: 'Featured (rainbow)' },
                        { key: 'row1Label', type: 'text', label: 'Row 1 Label' },
                        { key: 'row1Value', type: 'text', label: 'Row 1 Value' },
                        { key: 'row2Label', type: 'text', label: 'Row 2 Label' },
                        { key: 'row2Value', type: 'text', label: 'Row 2 Value' },
                        { key: 'row3Label', type: 'text', label: 'Row 3 Label' },
                        { key: 'row3Value', type: 'text', label: 'Row 3 Value' },
                        { key: 'row4Label', type: 'text', label: 'Row 4 Label' },
                        { key: 'row4Value', type: 'text', label: 'Row 4 Value' },
                        { key: 'row5Label', type: 'text', label: 'Row 5 Label' },
                        { key: 'row5Value', type: 'text', label: 'Row 5 Value' },
                        { key: 'link', type: 'url', label: 'Play Now Link' }
                    ]));
                    break;
                case 'videoRecommendations':
                    sections.push({
                        title: 'Section Header',
                        fields: [
                            field('Heading', text('heading', p.heading, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Video Cards', 'videos', p.videos, block.id, [
                        { key: 'title', type: 'text', label: 'Brand Name' },
                        { key: 'thumb', type: 'url', label: 'Thumbnail URL' },
                        { key: 'logo', type: 'url', label: 'Logo URL' },
                        { key: 'videoUrl', type: 'url', label: 'Video URL (Vimeo/YouTube)' },
                        { key: 'featured', type: 'toggle', label: 'Featured (larger)' }
                    ]));
                    break;
                case 'gameCarousel':
                    sections.push({
                        title: 'Carousel Settings',
                        fields: [
                            field('Heading', text('heading', p.heading, block.id)).fields[0],
                            field('Show Fire Emoji', toggle('showFireEmoji', p.showFireEmoji, block.id)).fields[0],
                            field('Slides to Show', number('slidesToShow', p.slidesToShow || 5, block.id)).fields[0],
                            field('Autoplay', toggle('autoplay', p.autoplay, block.id)).fields[0],
                            field('Autoplay Speed (ms)', number('autoplaySpeed', p.autoplaySpeed || 3000, block.id)).fields[0],
                            field('Button Text', text('btnText', p.btnText, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Games', 'games', p.games, block.id, [
                        { key: 'name', type: 'text', label: 'Game Name' },
                        { key: 'thumb', type: 'url', label: 'Thumbnail URL' },
                        { key: 'waysToWin', type: 'text', label: 'Ways to Win' },
                        { key: 'link', type: 'url', label: 'Game Link' }
                    ]));
                    sections.push(repeater('Partner Links (random redirect)', 'partnerLinks', (p.partnerLinks || []).map(l => ({ url: l })), block.id, [
                        { key: 'url', type: 'url', label: 'Partner URL' }
                    ]));
                    break;
                case 'faqAccordion':
                    sections.push({
                        title: 'Section Header',
                        fields: [
                            field('Heading', text('heading', p.heading, block.id)).fields[0],
                            field('Subtitle', text('subtitle', p.subtitle || '', block.id)).fields[0],
                            field('Include Schema.org JSON-LD', toggle('includeSchema', p.includeSchema, block.id)).fields[0],
                            field('Single Open (close others)', toggle('singleOpen', p.singleOpen !== false, block.id)).fields[0],
                            field('Content Max Width', text('contentMaxWidth', p.contentMaxWidth || '900px', block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('FAQ Items', 'items', p.items, block.id, [
                        { key: 'question', type: 'text', label: 'Question' },
                        { key: 'answer', type: 'textarea', label: 'Answer' }
                    ]));
                    break;
                case 'seoContent':
                    sections.push(repeater('Content Sections', 'sections', p.sections, block.id, [
                        { key: 'heading', type: 'text', label: 'Heading (H2)' },
                        { key: 'content', type: 'textarea', label: 'Paragraph Text' }
                    ]));
                    break;
                case 'casinoFooter':
                    sections.push({
                        title: 'Footer Info',
                        fields: [
                            field('Brand Name', text('brand', p.brand, block.id)).fields[0],
                            field('Logo URL', url('logo', p.logo, block.id)).fields[0],
                            field('Description', textarea('description', p.description, block.id)).fields[0],
                            field('Partners Heading', text('partnersHeading', p.partnersHeading, block.id)).fields[0],
                            field('Copyright', text('copyright', p.copyright, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Partner Logos', 'partnerLogos', p.partnerLogos, block.id, [
                        { key: 'name', type: 'text', label: 'Name' },
                        { key: 'logo', type: 'url', label: 'Logo URL' },
                        { key: 'link', type: 'url', label: 'Link' }
                    ]));
                    break;
                case 'animatedBg':
                    sections.push({
                        title: 'Blob Colors',
                        fields: [
                            field('Color 1', color('color1', p.color1, block.id)).fields[0],
                            field('Color 2', color('color2', p.color2, block.id)).fields[0],
                            field('Color 3', color('color3', p.color3, block.id)).fields[0],
                            field('Color 4', color('color4', p.color4, block.id)).fields[0],
                            field('Color 5', color('color5', p.color5, block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Animation Settings',
                        fields: [
                            field('Blob Size (px)', number('blobSize', p.blobSize, block.id)).fields[0],
                            field('Speed (seconds)', number('animSpeed', p.animSpeed, block.id)).fields[0],
                            field('Blur Amount', number('blurAmount', p.blurAmount, block.id)).fields[0],
                            field('Opacity', text('opacity', p.opacity, block.id)).fields[0],
                            field('Fixed Position', toggle('fixed', p.fixed, block.id)).fields[0]
                        ]
                    });
                    break;
                case 'promoBadgeCard':
                    sections.push({
                        title: 'Settings',
                        fields: [
                            field('Button Text', text('btnText', p.btnText, block.id)).fields[0],
                            field('Rainbow Border', toggle('showRainbowBorder', p.showRainbowBorder, block.id)).fields[0],
                            field('Shine Effect', toggle('showShineEffect', p.showShineEffect, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Cards', 'items', p.items, block.id, [
                        { key: 'name', type: 'text', label: 'Brand Name' },
                        { key: 'logo', type: 'url', label: 'Logo URL' },
                        { key: 'badge', type: 'select', label: 'Badge', options: ['favourite', 'hot', 'new', 'none'] },
                        { key: 'featured', type: 'toggle', label: 'Featured (rainbow)' },
                        { key: 'row1Label', type: 'text', label: 'Row 1 Label' },
                        { key: 'row1Value', type: 'text', label: 'Row 1 Value' },
                        { key: 'row2Label', type: 'text', label: 'Row 2 Label' },
                        { key: 'row2Value', type: 'text', label: 'Row 2 Value' },
                        { key: 'row3Label', type: 'text', label: 'Row 3 Label' },
                        { key: 'row3Value', type: 'text', label: 'Row 3 Value' },
                        { key: 'row4Label', type: 'text', label: 'Row 4 Label' },
                        { key: 'row4Value', type: 'text', label: 'Row 4 Value' },
                        { key: 'row5Label', type: 'text', label: 'Row 5 Label' },
                        { key: 'row5Value', type: 'text', label: 'Row 5 Value' },
                        { key: 'link', type: 'url', label: 'Play Now Link' }
                    ]));
                    break;
                case 'lightboxVideo':
                    sections.push({
                        title: 'Settings',
                        fields: [
                            field('Button Text', text('btnText', p.btnText, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Video Cards', 'items', p.items, block.id, [
                        { key: 'title', type: 'text', label: 'Brand Name' },
                        { key: 'thumb', type: 'url', label: 'Thumbnail URL' },
                        { key: 'logo', type: 'url', label: 'Logo URL' },
                        { key: 'videoUrl', type: 'url', label: 'Video URL' },
                        { key: 'featured', type: 'toggle', label: 'Featured (larger)' }
                    ]));
                    break;
                case 'gameCard':
                    sections.push({
                        title: 'Settings',
                        fields: [
                            field('Button Text', text('btnText', p.btnText, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Partner Links (random redirect)', 'partnerLinks', (p.partnerLinks || []).map(l => typeof l === 'string' ? { url: l } : l), block.id, [
                        { key: 'url', type: 'url', label: 'Partner URL' }
                    ]));
                    sections.push(repeater('Game Cards', 'items', p.items, block.id, [
                        { key: 'name', type: 'text', label: 'Game Name' },
                        { key: 'thumb', type: 'url', label: 'Thumbnail URL' },
                        { key: 'waysToWin', type: 'text', label: 'Ways to Win' },
                        { key: 'link', type: 'url', label: 'Game Link' },
                        { key: 'showFire', type: 'toggle', label: 'Show Fire Emoji' }
                    ]));
                    break;
                case 'scrollAnimSection':
                    sections.push({
                        title: 'Animation Settings',
                        fields: [
                            field('Animation', select2('animation', p.animation || 'fadeInUp', ['fadeInUp', 'fadeInDown', 'fadeIn'], block.id)).fields[0],
                            field('Duration', text('duration', p.duration, block.id)).fields[0],
                            field('Delay', text('delay', p.delay, block.id)).fields[0],
                            field('Threshold (0-1)', text('threshold', String(p.threshold), block.id)).fields[0]
                        ]
                    });
                    break;
                case 'liveClock':
                    sections.push({
                        title: 'Format',
                        fields: [
                            field('Display Format', textarea('format', p.format, block.id)).fields[0],
                            field('Timezone (optional)', text('timezone', p.timezone || '', block.id)).fields[0],
                            field('Show Timezone Label', toggle('showTimezone', p.showTimezone, block.id)).fields[0],
                            field('Update Speed (ms)', number('updateInterval', p.updateInterval || 1000, block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Available Tokens',
                        fields: [(() => {
                            const info = document.createElement('div');
                            info.style.cssText = 'font-size:0.75rem;color:var(--text2);line-height:1.8;background:var(--surface2);padding:12px;border-radius:8px;';
                            info.innerHTML = '<b>Use these in Format:</b><br>{year} {month} {month-short} {month-num}<br>{date} {day} {day-short}<br>{hour} {minute} {second} {ms}<br>{time} {timezone}<br>{full-date} {iso-date}<br><br><b>Example:</b><br>© {year} All rights reserved<br>{day}, {month} {date} — {hour}:{minute}:{second}';
                            return info;
                        })()]
                    });
                    break;
            }
            
            // --- Root Block Append Child ---
            if (!subPath) {
                const currentChildren = block.props.subStyles?.children || [];

                if (currentChildren.length > 0) {
                    const structSec = { title: 'Inside Structure', fields: [] };
                    const list = document.createElement('div');
                    list.className = 'struct-list';
                    list.style.cssText = 'display:flex; flex-direction:column; gap:4px; margin-bottom:12px;';

                    currentChildren.forEach((child, cIdx) => {
                        const childPath = `c${cIdx}`;
                        const item = document.createElement('div');
                        item.className = 'struct-item' + (State.getSelectedSubPath() === childPath ? ' active' : '');
                        item.style.cssText = 'display:flex; align-items:center; justify-content:space-between; background:var(--surface2); padding:6px 10px; border-radius:6px; cursor:pointer; font-size:0.8rem;';
                        if (State.getSelectedSubPath() === childPath) item.style.border = '1px solid var(--accent)';

                        const label = document.createElement('span');
                        label.innerHTML = `<i class="fa-solid fa-cube" style="margin-right:6px; color:var(--accent);"></i> ${child.type}`;
                        item.appendChild(label);

                        const acts = document.createElement('div');
                        acts.style.display = 'flex'; acts.style.gap = '4px';

                        const abtn = (icon, color, onClick) => {
                            const b = document.createElement('button');
                            b.innerHTML = `<i class="fa-solid ${icon}"></i>`;
                            b.style.cssText = `border:none; background:none; cursor:pointer; font-size:0.75rem; color:${color}; padding:2px;`;
                            b.onclick = (e) => { e.stopPropagation(); onClick(); };
                            return b;
                        };

                        acts.appendChild(abtn('fa-arrow-up', 'var(--text3)', () => { State.moveSubElement(block.id, childPath, 'up'); setTimeout(() => renderPanel(State.getBlock(block.id)), 50); }));
                        acts.appendChild(abtn('fa-arrow-down', 'var(--text3)', () => { State.moveSubElement(block.id, childPath, 'down'); setTimeout(() => renderPanel(State.getBlock(block.id)), 50); }));
                        acts.appendChild(abtn('fa-copy', 'var(--success)', () => { State.duplicateSubElement(block.id, childPath); setTimeout(() => renderPanel(State.getBlock(block.id)), 50); }));
                        acts.appendChild(abtn('fa-trash', 'var(--danger)', () => { State.removeSubElement(block.id, childPath); setTimeout(() => renderPanel(State.getBlock(block.id)), 50); }));

                        item.appendChild(acts);
                        item.onclick = () => State.setSelectedSubPath(childPath);
                        list.appendChild(item);
                    });
                    structSec.fields.push(list);
                    sections.push(structSec);
                }

                const appendSec = {
                    title: 'Append Child Element',
                    fields: []
                };
                
                const types = [
                    { label: 'Text (P)', icon: 'fa-solid fa-paragraph', type: 'p' },
                    { label: 'Image', icon: 'fa-solid fa-image', type: 'img' },
                    { label: 'Video', icon: 'fa-solid fa-video', type: 'video' },
                    { label: 'Button', icon: 'fa-solid fa-rectangle-ad', type: 'button' },
                    { label: 'Add to Cart', icon: 'fa-solid fa-cart-plus', type: 'add-to-cart' },
                    { label: 'Flex Container', icon: 'fa-solid fa-box', type: 'div' }
                ];

                const btnGrid = document.createElement('div');
                btnGrid.className = 'append-btn-grid'; 
                btnGrid.style.display = 'grid';
                btnGrid.style.gridTemplateColumns = '1fr 1fr';
                btnGrid.style.gap = '8px';
                btnGrid.style.marginTop = '10px';

                types.forEach(t => {
                    const btn = document.createElement('button');
                    btn.className = 'tb-btn secondary';
                    btn.style.fontSize = '0.8rem';
                    btn.style.padding = '8px';
                    btn.innerHTML = `<i class="${t.icon}"></i> ${t.label}`;
                    btn.onclick = () => {
                        // Flex Container: add as a real nested block (same as palette component)
                        if (t.type === 'div' && t.label === 'Flex Container') {
                            const containerProps = JSON.parse(JSON.stringify(BlockTypes['container'].defaultProps));
                            const newId = State.addBlock({ type: 'container', props: containerProps, parentId: block.id });
                            State.setSelected(newId);
                            if (window.showToast) window.showToast('Added Flex Container as nested block', 'success');
                            renderPanel(State.getBlock(newId));
                            return;
                        }

                        const currentChildrenList = block.props.subStyles?.children || [];
                        const newChild = { type: t.type, props: {}, styles: {} };
                        if (t.type === 'p') newChild.props.text = 'New paragraph text...';
                        if (t.type === 'img') newChild.props.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop';
                        if (t.type === 'video') newChild.props.src = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';
                        if (t.type === 'button') newChild.props.text = 'Click Me';
                        if (t.type === 'add-to-cart') {
                            newChild.props.text = 'Add to Cart';
                            newChild.props.price = '99.00';
                            newChild.props.name = 'Product Name';
                            newChild.props.image = '';
                        }
                        
                        const subStyles = { ...(block.props.subStyles || {}) };
                        subStyles.children = [...currentChildrenList, newChild];
                        State.updateBlockProps(block.id, { subStyles });
                        
                        // Use global showToast 
                        if (window.showToast) window.showToast(`Added ${t.label} to component`, 'success');
                        renderPanel(State.getBlock(block.id));
                    };
                    btnGrid.appendChild(btn);
                });
                
                appendSec.fields.push(btnGrid);
            }
        }
        return sections;
    }

    function field(label, inputEl) {
        const wrap = document.createElement('div');
        wrap.className = 'form-group';
        const lbl = document.createElement('label');
        lbl.textContent = label;
        wrap.appendChild(lbl);
        if (inputEl) wrap.appendChild(inputEl);
        return { title: null, fields: [wrap] };
    }

    function extractTextBlockFields(html) {
        if (!html) return { badge: '', title: '', text: '' };
        const wrap = document.createElement('div');
        wrap.innerHTML = html;
        const badgeEl = wrap.querySelector('span, .badge, small');
        const titleEl = wrap.querySelector('h1, h2, h3, h4, h5, h6');
        const textEl = wrap.querySelector('p');
        return {
            badge: badgeEl ? badgeEl.innerText.trim() : '',
            title: titleEl ? titleEl.innerText.trim() : '',
            text: textEl ? textEl.innerText.trim() : wrap.innerText.trim()
        };
    }

    function commitChange(blockId, key, value) {
        _skipAutoRenderOnce = true;
        const subPath = State.getSelectedSubPath();
        const isRootSelection = !subPath && State.getSelectedId() === blockId;
        const block = State.getBlock(blockId);
        if (!block) return;

        if (isRootSelection && SECTION_STYLE_TYPES.has(block.type) && (ROOT_CASCADE_KEYS.has(key) || ROOT_BACKGROUND_KEYS.has(key))) {
            applySectionWideChange(blockId, key, value);
            return;
        }

        // --- Sub-element text routing fix ---
        // When editing a sub-element's "text" field, check if this sub-element
        // maps to a known root prop. If so, update the root prop directly
        // so the render function uses the new value (not a subStyle override).
        if (subPath && key === 'text') {
            const rootPropKey = _resolveSubPathToRootProp(block, subPath);
            if (rootPropKey) {
                // Update the root prop directly — bypass subPath routing
                State.updateBlockProps(blockId, { [rootPropKey]: value }, { forceRoot: true });
                return;
            }
        }

        State.updateBlockProps(blockId, { [key]: value });
    }

    /**
     * Resolves a sub-element path to its corresponding root prop key.
     * E.g., "segments.0" on a hero block → "title" (because segments[0].type === 'title')
     * Returns null if no root prop mapping exists.
     */
    function _resolveSubPathToRootProp(block, subPath) {
        if (!block || !block.props) return null;
        const props = block.props;

        // Check if the element at this path has a data-initial-value that matches a root prop
        const blockEl = document.getElementById('block_' + block.id);
        if (blockEl) {
            const el = blockEl.querySelector(`[data-sf-path="${subPath}"]`);
            if (el) {
                const initVal = el.getAttribute('data-initial-value');
                if (initVal !== null && initVal !== '') {
                    const textKeys = ['title','subtitle','text','brand','badge','buttonText','ctaText','cta2Text',
                        'tagline','sectionTitle','sectionSubtitle','description','phone','email','address',
                        'copyright','footerText','heading','subheading','label','name'];
                    for (const k of textKeys) {
                        if (props[k] === initVal) return k;
                    }
                }
                // Also try matching by current text content
                const currentText = el.textContent?.trim();
                if (currentText) {
                    const textKeys = ['title','subtitle','text','brand','badge','buttonText','ctaText','cta2Text',
                        'tagline','sectionTitle','sectionSubtitle','description','phone','email','address',
                        'copyright','footerText','heading','subheading','label','name'];
                    for (const k of textKeys) {
                        if (props[k] === currentText) return k;
                    }
                }
            }
        }

        // Heuristic: parse the path to guess the prop
        // "segments.0" where segments[0].type === 'title' → 'title'
        if (props.segments && Array.isArray(props.segments)) {
            const match = subPath.match(/^segments\.(\d+)$/);
            if (match) {
                const idx = parseInt(match[1]);
                const seg = props.segments[idx];
                if (seg) {
                    if (seg.type === 'title' && props.title !== undefined) return 'title';
                    if (seg.type === 'subtitle' && props.subtitle !== undefined) return 'subtitle';
                    if (seg.type === 'text' && props.text !== undefined) return 'text';
                    if (seg.type === 'badge' && props.badge !== undefined) return 'badge';
                }
            }
        }

        return null;
    }

    function getTableColumnCount(props) {
        const configured = Math.max(2, parseInt(props?.columnCount || '4', 10) || 4);
        const headerNumbers = Object.keys(props || {})
            .map((key) => /^header(\d+)$/.exec(key))
            .filter(Boolean)
            .map((match) => parseInt(match[1], 10));
        const rowNumbers = (props?.rows || []).flatMap((row) => Object.keys(row || {})
            .map((key) => /^col(\d+)$/.exec(key))
            .filter(Boolean)
            .map((match) => parseInt(match[1], 10)));
        return Math.max(configured, ...headerNumbers, ...rowNumbers, 2);
    }

    function getTextOptions(key) {
        return TEXT_OPTIONS[key] || [];
    }

    function stepCssValue(rawValue, delta) {
        const value = String(rawValue || '').trim();
        if (!value) return `${delta > 0 ? delta : 0}px`;
        return value.replace(/(-?\d*\.?\d+)(px|rem|em|%|vh|vw)?/g, (_, num, unit) => {
            const next = parseFloat(num || '0') + delta;
            const rounded = Math.abs(next % 1) < 0.001 ? Math.round(next) : Number(next.toFixed(2));
            return `${rounded}${unit || 'px'}`;
        });
    }

    function text(key, val, blockId) {
        const options = getTextOptions(key);
        const stepperKeys = new Set(['margin', 'padding', 'width', 'height', 'gap', 'fontSize', 'borderRadius', 'borderWidth', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'top', 'bottom', 'left', 'right', 'popupWidth', 'popupPadding', 'popupRadius']);
        const pxKeys = new Set(['margin', 'padding', 'width', 'height', 'gap', 'fontSize', 'borderRadius', 'borderWidth', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'top', 'bottom', 'left', 'right', 'popupWidth', 'popupPadding', 'popupRadius']);
        const el = document.createElement('input');
        el.type = 'text'; el.value = val || '';
        el.placeholder = options.length ? 'Type or choose a value' : '';

        const commitTextValue = () => {
            let v = el.value.trim();
            if (pxKeys.has(key)) {
                if (/^-?\d+$/.test(v)) v += 'px';
                el.value = v; // update UI so user sees the 'px'
            }
            commitChange(blockId, key, v);
            // Re-render panel when bgImage changes (to show/hide BG image settings)
            if (key === 'bgImage') {
                setTimeout(() => renderPanel(State.getBlock(blockId)), 50);
            }
        };

        el.addEventListener('change', commitTextValue);
        const wrap = document.createElement('div');
        wrap.style.display = 'flex';
        wrap.style.alignItems = 'stretch';
        wrap.style.gap = '8px';

        const inputWrap = document.createElement('div');
        inputWrap.style.display = 'flex';
        inputWrap.style.flexDirection = 'column';
        inputWrap.style.gap = '0';
        inputWrap.style.flex = '1';
        inputWrap.appendChild(el);

        if (options.length) {
            const listId = `prop_datalist_${key}_${blockId}_${Math.random().toString(36).slice(2, 9)}`;
            el.setAttribute('list', listId);
            const dataList = document.createElement('datalist');
            dataList.id = listId;
            options.forEach((opt) => {
                const optionEl = document.createElement('option');
                optionEl.value = opt;
                dataList.appendChild(optionEl);
            });
            inputWrap.appendChild(dataList);
        }

        wrap.appendChild(inputWrap);

        if (stepperKeys.has(key)) {
            const applyStep = (delta) => {
                el.value = stepCssValue(el.value, delta);
                commitTextValue();
            };

            el.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    applyStep(1);
                } else if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    applyStep(-1);
                }
            });

            const stepper = document.createElement('div');
            stepper.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
            const makeStepBtn = (label, delta) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-icon';
                btn.textContent = label;
                btn.style.cssText = 'width:28px;height:18px;border:1px solid var(--border);background:var(--surface2);color:var(--text);border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:700;line-height:1;';
                let holdTimeout = null;
                let holdInterval = null;
                const clearHold = () => {
                    if (holdTimeout) {
                        clearTimeout(holdTimeout);
                        holdTimeout = null;
                    }
                    if (holdInterval) {
                        clearInterval(holdInterval);
                        holdInterval = null;
                    }
                };
                btn.addEventListener('click', () => applyStep(delta));
                btn.addEventListener('pointerdown', (event) => {
                    event.preventDefault();
                    clearHold();
                    holdTimeout = window.setTimeout(() => {
                        holdInterval = window.setInterval(() => applyStep(delta), 90);
                    }, 320);
                });
                btn.addEventListener('pointerup', clearHold);
                btn.addEventListener('pointerleave', clearHold);
                btn.addEventListener('pointercancel', clearHold);
                btn.addEventListener('lostpointercapture', clearHold);
                return btn;
            };
            stepper.appendChild(makeStepBtn('▲', 1));
            stepper.appendChild(makeStepBtn('▼', -1));
            wrap.appendChild(stepper);
        }

        // --- Asset Picker for image-related keys ---
        const imageKeys = new Set(['bgImage', 'src', 'image', 'popupBgImage', 'cartItemImage', 'img', 'poster', 'thumbnail']);
        if (imageKeys.has(key)) {
            const assetBtns = document.createElement('div');
            assetBtns.style.cssText = 'display:flex;gap:4px;margin-top:0;';

            const uploadBtn = document.createElement('button');
            uploadBtn.type = 'button';
            uploadBtn.className = 'btn-icon';
            uploadBtn.title = 'Upload from device';
            uploadBtn.innerHTML = '<i class="fa-solid fa-upload"></i>';
            uploadBtn.style.cssText = 'width:28px;height:28px;border:1px solid var(--border);background:var(--surface2);color:var(--accent);border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.75rem;';
            uploadBtn.onclick = () => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.onchange = async (ev) => {
                    const file = ev.target.files[0];
                    if (!file) return;
                    if (typeof AssetManager !== 'undefined') {
                        const asset = await AssetManager.upload(file);
                        if (asset) {
                            el.value = asset.path;
                            commitTextValue();
                        }
                    }
                };
                fileInput.click();
            };

            const browseBtn = document.createElement('button');
            browseBtn.type = 'button';
            browseBtn.className = 'btn-icon';
            browseBtn.title = 'Browse media library';
            browseBtn.innerHTML = '<i class="fa-solid fa-images"></i>';
            browseBtn.style.cssText = 'width:28px;height:28px;border:1px solid var(--border);background:var(--surface2);color:var(--accent);border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.75rem;';
            browseBtn.onclick = () => {
                if (typeof AssetManager !== 'undefined') {
                    AssetManager.open((dataUrl, asset) => {
                        el.value = asset && asset.path ? asset.path : dataUrl;
                        commitTextValue();
                    });
                }
            };

            assetBtns.appendChild(uploadBtn);
            assetBtns.appendChild(browseBtn);
            wrap.appendChild(assetBtns);
        }

        return wrap;
    }
    function number(key, val, blockId) {
        const el = document.createElement('input');
        el.type = 'number'; el.value = val || 0;
        el.addEventListener('input', () => commitChange(blockId, key, Number(el.value)));
        return el;
    }
    function getLinkablePages() {
        const statePages = (State.getPages?.() || []).filter(Boolean);
        if (statePages.length > 0) return statePages;

        const pageTabs = Array.from(document.querySelectorAll('#pagesList .page-tab span'));
        return pageTabs.map((tab, idx) => {
            const name = (tab.textContent || `Page ${idx + 1}`).trim();
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'page';
            return {
                id: `fallback_${idx}`,
                name,
                filename: slug === 'home' ? 'index.html' : `${slug}.html`
            };
        });
    }
    function url(key, val, blockId) {
        const wrap = document.createElement('div');
        wrap.style.display = 'flex'; wrap.style.flexDirection = 'column'; wrap.style.gap = '5px';

        const el = document.createElement('input');
        el.type = 'text'; el.value = val || '';
        el.placeholder = 'https://… or select page';
        el.addEventListener('input', () => commitChange(blockId, key, el.value));
        wrap.appendChild(el);

        // Asset picker for image-related url fields
        const imageKeys = new Set(['image', 'cartItemImage', 'src', 'img', 'poster', 'thumbnail']);
        if (imageKeys.has(key)) {
            const assetRow = document.createElement('div');
            assetRow.style.cssText = 'display:flex;gap:6px;margin-top:2px;';

            const uploadBtn = document.createElement('button');
            uploadBtn.type = 'button';
            uploadBtn.innerHTML = '<i class="fa-solid fa-upload"></i> Upload';
            uploadBtn.style.cssText = 'flex:1;padding:6px 10px;border:1px solid var(--border);background:var(--surface2);color:var(--text2);border-radius:6px;cursor:pointer;font-size:0.75rem;display:flex;align-items:center;justify-content:center;gap:5px;';
            uploadBtn.onclick = () => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.onchange = async (ev) => {
                    const file = ev.target.files[0];
                    if (!file) return;
                    if (typeof AssetManager !== 'undefined') {
                        const asset = await AssetManager.upload(file);
                        if (asset) {
                            el.value = asset.path;
                            commitChange(blockId, key, asset.path);
                        }
                    }
                };
                fileInput.click();
            };

            const browseBtn = document.createElement('button');
            browseBtn.type = 'button';
            browseBtn.innerHTML = '<i class="fa-solid fa-images"></i> Browse';
            browseBtn.style.cssText = 'flex:1;padding:6px 10px;border:1px solid var(--border);background:var(--surface2);color:var(--text2);border-radius:6px;cursor:pointer;font-size:0.75rem;display:flex;align-items:center;justify-content:center;gap:5px;';
            browseBtn.onclick = () => {
                if (typeof AssetManager !== 'undefined') {
                    AssetManager.open((dataUrl, asset) => {
                        const val = asset && asset.path ? asset.path : dataUrl;
                        el.value = val;
                        commitChange(blockId, key, val);
                    });
                }
            };

            assetRow.appendChild(uploadBtn);
            assetRow.appendChild(browseBtn);
            wrap.appendChild(assetRow);
        }

        const pages = getLinkablePages();
        if (pages.length > 0 && !imageKeys.has(key)) {
            const pageLabel = document.createElement('div');
            pageLabel.textContent = 'Connect To Page';
            pageLabel.style.cssText = 'font-size:0.72rem;color:var(--text3);margin-top:4px;';
            wrap.appendChild(pageLabel);

            const sel = document.createElement('select');
            sel.style.cssText = 'font-size:0.78rem;';
            sel.innerHTML = `<option value="">-- Link to Page --</option>` + 
                pages.map(p => `<option value="${p.filename}" ${val === p.filename ? 'selected' : ''}>Page: ${p.name}</option>`).join('');
            sel.addEventListener('change', () => {
                if (sel.value) {
                    el.value = sel.value;
                    commitChange(blockId, key, sel.value);
                }
            });
            wrap.appendChild(sel);
        }
        return wrap;
    }
    function rgbToHex(rgb) {
        if (!rgb || rgb.startsWith('#')) return rgb || '#ffffff';
        const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        if (!match) return rgb;
        const r = parseInt(match[1]).toString(16).padStart(2, '0');
        const g = parseInt(match[2]).toString(16).padStart(2, '0');
        const b = parseInt(match[3]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }

    function color(key, val, blockId) {
        let initialVal = (val || '#ffffff').replace(' !important', '').trim();

        // Parse initial alpha
        let currentAlpha = 1;
        const rgbaMatch = initialVal.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
        if (rgbaMatch && rgbaMatch[4] !== undefined) currentAlpha = parseFloat(rgbaMatch[4]);

        // Convert to hex for the picker
        let hexVal = initialVal;
        if (hexVal.startsWith('rgb')) hexVal = rgbToHex(hexVal);
        if (!hexVal.startsWith('#')) hexVal = '#ffffff';

        // Build rgba helper
        function buildRgba(hex, alpha) {
            const h = hex.replace('#', '');
            const r = parseInt(h.substring(0, 2), 16) || 0;
            const g = parseInt(h.substring(2, 4), 16) || 0;
            const b = parseInt(h.substring(4, 6), 16) || 0;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;gap:6px;width:100%;';

        // Row 1: Color picker + text input
        const topRow = document.createElement('div');
        topRow.style.cssText = 'display:flex;gap:8px;align-items:center;';

        const picker = document.createElement('input');
        picker.type = 'color';
        picker.value = hexVal.substring(0, 7);
        picker.style.cssText = 'width:40px;height:32px;border-radius:6px;border:2px solid var(--border);cursor:pointer;padding:0;flex-shrink:0;';

        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.value = initialVal;
        textInput.placeholder = 'rgba(0, 0, 0, 1)';
        textInput.style.cssText = 'flex:1;min-width:0;';

        topRow.appendChild(picker);
        topRow.appendChild(textInput);

        // Row 2: Alpha slider
        const alphaRow = document.createElement('div');
        alphaRow.style.cssText = 'display:flex;gap:8px;align-items:center;padding:2px 0;';

        const alphaLabel = document.createElement('span');
        alphaLabel.style.cssText = 'font-size:0.7rem;color:var(--text3);width:38px;flex-shrink:0;';
        alphaLabel.textContent = 'Opacity';

        const alphaSlider = document.createElement('input');
        alphaSlider.type = 'range';
        alphaSlider.min = '0'; alphaSlider.max = '100'; alphaSlider.step = '1';
        alphaSlider.value = Math.round(currentAlpha * 100);
        alphaSlider.style.cssText = 'flex:1;height:6px;cursor:pointer;accent-color:var(--accent);';

        const alphaVal = document.createElement('span');
        alphaVal.style.cssText = 'font-size:0.72rem;color:var(--text2);width:30px;text-align:right;';
        alphaVal.textContent = Math.round(currentAlpha * 100) + '%';

        alphaRow.appendChild(alphaLabel);
        alphaRow.appendChild(alphaSlider);
        alphaRow.appendChild(alphaVal);

        // Events
        picker.addEventListener('input', () => {
            const alpha = parseInt(alphaSlider.value) / 100;
            const rgba = buildRgba(picker.value, alpha);
            textInput.value = rgba;
            commitChange(blockId, key, rgba);
        });

        alphaSlider.addEventListener('input', () => {
            const alpha = parseInt(alphaSlider.value) / 100;
            alphaVal.textContent = Math.round(alpha * 100) + '%';
            const rgba = buildRgba(picker.value, alpha);
            textInput.value = rgba;
            commitChange(blockId, key, rgba);
        });

        textInput.addEventListener('change', () => {
            const v = textInput.value.trim();
            if (v.startsWith('#') && v.length >= 7) picker.value = v.substring(0, 7);
            else if (v.startsWith('rgb')) {
                const m = v.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
                if (m) picker.value = '#' + [m[1],m[2],m[3]].map(n => parseInt(n).toString(16).padStart(2,'0')).join('');
                const a = v.match(/,\s*([\d.]+)\s*\)/);
                if (a) { alphaSlider.value = Math.round(parseFloat(a[1]) * 100); alphaVal.textContent = alphaSlider.value + '%'; }
            }
            commitChange(blockId, key, v);
        });

        wrapper.appendChild(topRow);
        wrapper.appendChild(alphaRow);
        return wrapper;
    }
    function textarea(key, val, blockId) {
        const el = document.createElement('textarea');
        el.rows = 3; el.value = val || '';
        el.addEventListener('input', () => commitChange(blockId, key, el.value));
        return el;
    }
    function htmlEditor(key, val, blockId) {
        const el = document.createElement('textarea');
        el.rows = 6; el.value = val || '';
        el.style.fontFamily = 'monospace'; el.style.fontSize = '0.78rem';
        el.addEventListener('input', () => commitChange(blockId, key, el.value));
        return el;
    }
    function wordPasteEditor(key, val, blockId) {
        const wrap = document.createElement('div');
        wrap.style.display = 'flex';
        wrap.style.flexDirection = 'column';
        wrap.style.gap = '10px';

        const hint = document.createElement('div');
        hint.style.cssText = 'font-size:0.8rem;color:var(--text2);line-height:1.6;';
        hint.textContent = 'Paste directly from Microsoft Word here. Rich formatting like bold text, colors, lists, and tables will be preserved.';

        const editor = document.createElement('div');
        editor.contentEditable = 'true';
        editor.innerHTML = val || '';
        editor.style.cssText = 'min-height:240px;max-height:420px;overflow:auto;padding:16px;border:1px solid var(--border);border-radius:12px;background:var(--surface2);color:var(--text);line-height:1.7;outline:none;';

        const commitEditor = () => {
            commitChange(blockId, key, editor.innerHTML);
        };

        editor.addEventListener('input', commitEditor);
        editor.addEventListener('blur', commitEditor);
        editor.addEventListener('paste', () => setTimeout(commitEditor, 0));

        const actions = document.createElement('div');
        actions.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;';

        const meta = document.createElement('span');
        meta.style.cssText = 'font-size:0.78rem;color:var(--text3);';
        meta.textContent = 'Source HTML stays editable below if you want to fine-tune pasted content.';

        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'btn';
        clearBtn.textContent = 'Clear Content';
        clearBtn.style.cssText = 'padding:8px 12px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--text);cursor:pointer;font-size:0.8rem;';
        clearBtn.addEventListener('click', () => {
            editor.innerHTML = '';
            commitEditor();
        });

        actions.appendChild(meta);
        actions.appendChild(clearBtn);

        const source = htmlEditor(key, val, blockId);
        source.rows = 8;
        source.addEventListener('input', () => {
            if (document.activeElement !== editor) editor.innerHTML = source.value;
        });
        editor.addEventListener('input', () => {
            if (document.activeElement !== source) source.value = editor.innerHTML;
        });

        wrap.appendChild(hint);
        wrap.appendChild(editor);
        wrap.appendChild(actions);
        wrap.appendChild(source);
        return wrap;
    }
    function select2(key, val, options, blockId) {
        const el = document.createElement('select');
        options.forEach(o => {
            const opt = document.createElement('option');
            opt.value = o; opt.textContent = o;
            if (o === val) opt.selected = true;
            el.appendChild(opt);
        });
        el.addEventListener('change', () => {
            commitChange(blockId, key, el.value);
            if (key === 'display' || key === 'navStyle' || key === 'formProvider') {
                renderPanel(State.getBlock(blockId));
            }
        });
        return el;
    }
    function toggle(key, val, blockId) {
        const row = document.createElement('div');
        row.style.display = 'flex'; row.style.alignItems = 'center'; row.style.gap = '8px';
        const el = document.createElement('input');
        el.type = 'checkbox'; el.checked = !!val;
        el.style.width = 'auto'; el.style.height = '16px'; el.style.cursor = 'pointer';
        el.addEventListener('change', () => commitChange(blockId, key, el.checked));
        const lbl = document.createElement('span');
        lbl.textContent = val ? 'On' : 'Off';
        lbl.style.fontSize = '0.8rem'; lbl.style.color = 'var(--text2)';
        el.addEventListener('change', () => { lbl.textContent = el.checked ? 'On' : 'Off'; });
        row.appendChild(el); row.appendChild(lbl);
        return row;
    }

    const ICON_LIB = [
        // --- Font Awesome Solid ---
        'fa-solid fa-house', 'fa-solid fa-user', 'fa-solid fa-check', 'fa-solid fa-download', 'fa-solid fa-magnifying-glass', 
        'fa-solid fa-envelope', 'fa-solid fa-star', 'fa-solid fa-heart', 'fa-solid fa-location-dot', 'fa-solid fa-xmark',
        'fa-solid fa-plus', 'fa-solid fa-minus', 'fa-solid fa-gear', 'fa-solid fa-bell', 'fa-solid fa-circle-question',
        'fa-solid fa-circle-info', 'fa-solid fa-circle-exclamation', 'fa-solid fa-circle-check', 'fa-solid fa-image',
        'fa-solid fa-phone', 'fa-solid fa-video', 'fa-solid fa-microphone', 'fa-solid fa-briefcase', 'fa-solid fa-chart-line',
        'fa-solid fa-chart-pie', 'fa-solid fa-chart-bar', 'fa-solid fa-credit-card', 'fa-solid fa-wallet', 'fa-solid fa-cart-shopping',
        'fa-solid fa-bag-shopping', 'fa-solid fa-truck', 'fa-solid fa-plane', 'fa-solid fa-car', 'fa-solid fa-train',
        'fa-solid fa-bus', 'fa-solid fa-ship', 'fa-solid fa-bicycle', 'fa-solid fa-motorcycle', 'fa-solid fa-clock',
        'fa-solid fa-calendar', 'fa-solid fa-camera', 'fa-solid fa-laptop', 'fa-solid fa-mobile-screen', 'fa-solid fa-desktop',
        'fa-solid fa-tablet-screen-button', 'fa-solid fa-tv', 'fa-solid fa-headphones', 'fa-solid fa-music', 'fa-solid fa-play',
        'fa-solid fa-pause', 'fa-solid fa-stop', 'fa-solid fa-forward', 'fa-solid fa-backward', 'fa-solid fa-volume-high',
        'fa-solid fa-volume-low', 'fa-solid fa-volume-off', 'fa-solid fa-volume-xmark', 'fa-solid fa-wifi', 'fa-solid fa-bluetooth',
        'fa-solid fa-battery-full', 'fa-solid fa-battery-half', 'fa-solid fa-battery-empty', 'fa-solid fa-plug', 'fa-solid fa-microchip',
        'fa-solid fa-server', 'fa-solid fa-database', 'fa-solid fa-code', 'fa-solid fa-code-merge', 'fa-solid fa-code-fork',
        'fa-solid fa-code-branch', 'fa-solid fa-terminal', 'fa-solid fa-cloud', 'fa-solid fa-cloud-arrow-up', 'fa-solid fa-cloud-arrow-down',
        'fa-solid fa-upload', 'fa-solid fa-print', 'fa-solid fa-copy', 'fa-solid fa-paste', 'fa-solid fa-trash', 'fa-solid fa-pen',
        'fa-solid fa-pen-to-square', 'fa-solid fa-eye', 'fa-solid fa-eye-slash', 'fa-solid fa-lock', 'fa-solid fa-unlock',
        'fa-solid fa-shield-halved', 'fa-solid fa-key', 'fa-solid fa-filter', 'fa-solid fa-list', 'fa-solid fa-grip',
        'fa-solid fa-bars', 'fa-solid fa-ellipsis', 'fa-solid fa-share-nodes', 'fa-solid fa-link', 'fa-solid fa-unlink',
        'fa-solid fa-paperclip', 'fa-solid fa-tag', 'fa-solid fa-tags', 'fa-solid fa-ticket', 'fa-solid fa-landmark',
        'fa-solid fa-building', 'fa-solid fa-hotel', 'fa-solid fa-shop', 'fa-solid fa-store', 'fa-solid fa-hospital',
        'fa-solid fa-school', 'fa-solid fa-graduation-cap', 'fa-solid fa-book', 'fa-solid fa-book-open', 'fa-solid fa-pencil',
        'fa-solid fa-palette', 'fa-solid fa-brush', 'fa-solid fa-utensils', 'fa-solid fa-mug-hot', 'fa-solid fa-coffee',
        'fa-solid fa-burger', 'fa-solid fa-pizza-slice', 'fa-solid fa-apple-whole', 'fa-solid fa-carrot', 'fa-solid fa-leaf',
        'fa-solid fa-tree', 'fa-solid fa-sun', 'fa-solid fa-moon', 'fa-solid fa-cloud-sun', 'fa-solid fa-umbrella',
        'fa-solid fa-snowflake', 'fa-solid fa-droplet', 'fa-solid fa-fire', 'fa-solid fa-bolt', 'fa-solid fa-mountain',
        'fa-solid fa-mountain-sun', 'fa-solid fa-earth-americas', 'fa-solid fa-earth-europe', 'fa-solid fa-earth-asia',
        'fa-solid fa-rocket', 'fa-solid fa-shuttle-space', 'fa-solid fa-ghost', 'fa-solid fa-skull', 'fa-solid fa-award',
        'fa-solid fa-medal', 'fa-solid fa-trophy', 'fa-solid fa-gem', 'fa-solid fa-hand-holding-dollar', 'fa-solid fa-coins',
        'fa-solid fa-money-bill', 'fa-solid fa-money-check', 'fa-solid fa-vault', 'fa-solid fa-piggy-bank', 'fa-solid fa-gift',
        'fa-solid fa-cake-candles', 'fa-solid fa-balloon', 'fa-solid fa-compass', 'fa-solid fa-map', 'fa-solid fa-flag',
        'fa-solid fa-anchor', 'fa-solid fa-compass-drafting', 'fa-solid fa-ruler', 'fa-solid fa-shapes', 'fa-solid fa-puzzle-piece',
        'fa-solid fa-brain', 'fa-solid fa-dna', 'fa-solid fa-microscope', 'fa-solid fa-stethoscope', 'fa-solid fa-heart-pulse',
        'fa-solid fa-pills', 'fa-solid fa-syringe', 'fa-solid fa-wheelchair', 'fa-solid fa-user-doctor', 'fa-solid fa-user-nurse',
        'fa-solid fa-users', 'fa-solid fa-user-group', 'fa-solid fa-address-book', 'fa-solid fa-id-card', 'fa-solid fa-newspaper',

        // --- Font Awesome Brands ---
        'fa-brands fa-facebook', 'fa-brands fa-facebook-f', 'fa-brands fa-facebook-messenger', 'fa-brands fa-twitter', 'fa-brands fa-x-twitter',
        'fa-brands fa-instagram', 'fa-brands fa-linkedin', 'fa-brands fa-linkedin-in', 'fa-brands fa-youtube', 'fa-brands fa-vimeo',
        'fa-brands fa-vimeo-v', 'fa-brands fa-github', 'fa-brands fa-gitlab', 'fa-brands fa-bitbucket', 'fa-brands fa-whatsapp',
        'fa-brands fa-telegram', 'fa-brands fa-tiktok', 'fa-brands fa-snapchat', 'fa-brands fa-pinterest', 'fa-brands fa-pinterest-p',
        'fa-brands fa-discord', 'fa-brands fa-slack', 'fa-brands fa-skype', 'fa-brands fa-zoom', 'fa-brands fa-google',
        'fa-brands fa-google-drive', 'fa-brands fa-google-play', 'fa-brands fa-apple', 'fa-brands fa-app-store', 'fa-brands fa-android',
        'fa-brands fa-chrome', 'fa-brands fa-edge', 'fa-brands fa-firefox', 'fa-brands fa-safari', 'fa-brands fa-amazon',
        'fa-brands fa-ebay', 'fa-brands fa-shopify', 'fa-brands fa-wordpress', 'fa-brands fa-wix', 'fa-brands fa-squarespace',
        'fa-brands fa-paypal', 'fa-brands fa-stripe', 'fa-brands fa-cc-visa', 'fa-brands fa-cc-mastercard', 'fa-brands fa-cc-amex',
        'fa-brands fa-cc-paypal', 'fa-brands fa-cc-discover', 'fa-brands fa-bitcoin', 'fa-brands fa-ethereum', 'fa-brands fa-medium',
        'fa-brands fa-reddit', 'fa-brands fa-reddit-alien', 'fa-brands fa-quora', 'fa-brands fa-stack-overflow', 'fa-brands fa-behance',
        'fa-brands fa-dribbble', 'fa-brands fa-figma', 'fa-brands fa-sketch', 'fa-brands fa-adobe', 'fa-brands fa-canva',
        'fa-brands fa-node-js', 'fa-brands fa-js', 'fa-brands fa-react', 'fa-brands fa-vuejs', 'fa-brands fa-angular',
        'fa-brands fa-html5', 'fa-brands fa-css3', 'fa-brands fa-sass', 'fa-brands fa-itunes', 'fa-brands fa-spotify',
        'fa-brands fa-soundcloud', 'fa-brands fa-twitch', 'fa-brands fa-xbox', 'fa-brands fa-playstation', 'fa-brands fa-steam',
        'fa-brands fa-unity', 'fa-brands fa-unreal-engine', 'fa-brands fa-microsoft', 'fa-brands fa-linux', 'fa-brands fa-ubuntu',
        'fa-brands fa-docker', 'fa-brands fa-aws', 'fa-brands fa-digital-ocean', 'fa-brands fa-python', 'fa-brands fa-php',
        'fa-brands fa-java', 'fa-brands fa-rust', 'fa-brands fa-golang', 'fa-brands fa-swift', 'fa-brands fa-kotlin',
        'fa-brands fa-strava', 'fa-brands fa-trello', 'fa-brands fa-asana', 'fa-brands fa-jira', 'fa-brands fa-confluence',

        // --- Bootstrap Icons ---
        'bi bi-activity', 'bi bi-alarm', 'bi bi-align-bottom', 'bi bi-align-center', 'bi bi-align-end', 'bi bi-align-middle', 'bi bi-align-start',
        'bi bi-align-top', 'bi bi-alt', 'bi bi-app', 'bi bi-app-indicator', 'bi bi-archive', 'bi bi-arrow-90deg-down', 'bi bi-arrow-90deg-left',
        'bi bi-arrow-90deg-right', 'bi bi-arrow-90deg-up', 'bi bi-arrow-bar-down', 'bi bi-arrow-bar-left', 'bi bi-arrow-bar-right', 'bi bi-arrow-bar-up',
        'bi bi-award', 'bi bi-back', 'bi bi-backspace', 'bi bi-bag', 'bi bi-bank', 'bi bi-bar-chart', 'bi bi-basket', 'bi bi-battery', 'bi bi-bell',
        'bi bi-bicycle', 'bi bi-book', 'bi bi-bookmark', 'bi bi-box', 'bi bi-briefcase', 'bi bi-broadcast', 'bi bi-browser-chrome', 'bi bi-box-arrow-in-right',
        'bi bi-box-arrow-right', 'bi bi-bug', 'bi bi-building', 'bi bi-bullseye', 'bi bi-calculator', 'bi bi-calendar', 'bi bi-camera', 'bi bi-car-front',
        'bi bi-cart', 'bi bi-cash', 'bi bi-chat', 'bi bi-check', 'bi bi-chevron-down', 'bi bi-chevron-left', 'bi bi-chevron-right', 'bi bi-chevron-up',
        'bi bi-circle', 'bi bi-clipboard', 'bi bi-clock', 'bi bi-cloud', 'bi bi-code', 'bi bi-collection', 'bi bi-columns', 'bi bi-command', 'bi bi-compass',
        'bi bi-cpu', 'bi bi-credit-card', 'bi bi-crop', 'bi bi-cup-hot', 'bi bi-currency-bitcoin', 'bi bi-currency-dollar', 'bi bi-currency-euro',
        'bi bi-cursor', 'bi bi-dash', 'bi bi-database', 'bi bi-desktop', 'bi bi-diagram-3', 'bi bi-display', 'bi bi-door-closed', 'bi bi-download',
        'bi bi-droplet', 'bi bi-earbuds', 'bi bi-easel', 'bi bi-egg', 'bi bi-envelope', 'bi bi-eraser', 'bi bi-ethernet', 'bi bi-exclamation', 'bi bi-eye',
        'bi bi-facebook', 'bi bi-file', 'bi bi-filter', 'bi bi-fingerprint', 'bi bi-fire', 'bi bi-flag', 'bi bi-flower1', 'bi bi-folder', 'bi bi-forward',
        'bi bi-fullscreen', 'bi bi-funnel', 'bi bi-gear', 'bi bi-gem', 'bi bi-gift', 'bi bi-github', 'bi bi-globe', 'bi bi-google', 'bi bi-graph-up',
        'bi bi-grid', 'bi bi-hammer', 'bi bi-hand-thumbs-up', 'bi bi-hash', 'bi bi-headphones', 'bi bi-heart', 'bi bi-house', 'bi bi-image', 'bi bi-inbox',
        'bi bi-infinity', 'bi bi-info-circle', 'bi bi-instagram', 'bi bi-journal', 'bi bi-key', 'bi bi-keyboard', 'bi bi-laptop', 'bi bi-layers',
        'bi bi-layout-sidebar', 'bi bi-lightning', 'bi bi-link', 'bi bi-linkedin', 'bi bi-list', 'bi bi-lock', 'bi bi-magic', 'bi bi-magnet', 'bi bi-mailbox',
        'bi bi-map', 'bi bi-mask', 'bi bi-megaphone', 'bi bi-messenger', 'bi bi-mic', 'bi bi-microsoft', 'bi bi-moon', 'bi bi-music-note', 'bi bi-newspaper',
        'bi bi-nut', 'bi bi-option', 'bi bi-palette', 'bi bi-paperclip', 'bi bi-pause', 'bi bi-paypal', 'bi bi-pc-display', 'bi bi-pencil', 'bi bi-pentagon',
        'bi bi-people', 'bi bi-person', 'bi bi-phone', 'bi bi-pie-chart', 'bi bi-pin', 'bi bi-play', 'bi bi-plus', 'bi bi-power', 'bi bi-printer', 'bi bi-puzzle',
        'bi bi-question-circle', 'bi bi-reception-4', 'bi bi-reddit', 'bi bi-reply', 'bi bi-robot', 'bi bi-rocket', 'bi bi-rss', 'bi bi-safe', 'bi bi-save',
        'bi bi-scissors', 'bi bi-search', 'bi bi-send', 'bi bi-server', 'bi bi-share', 'bi bi-shield', 'bi bi-shop', 'bi bi-shuffle', 'bi bi-sign-turn-right',
        'bi bi-signal', 'bi bi-slack', 'bi bi-sliders', 'bi bi-smartwatch', 'bi bi-snapchat', 'bi bi-snow', 'bi bi-speaker', 'bi bi-speedometer', 'bi bi-spotify',
        'bi bi-stack', 'bi bi-star', 'bi bi-stickies', 'bi bi-stop', 'bi bi-stopwatch', 'bi bi-suit-heart', 'bi bi-sun', 'bi bi-tags', 'bi bi-telegram',
        'bi bi-telephone', 'bi bi-terminal', 'bi bi-text-center', 'bi bi-text-left', 'bi bi-text-right', 'bi bi-three-dots', 'bi bi-thumbs-up', 'bi bi-ticket',
        'bi bi-tiktok', 'bi bi-toggle-on', 'bi bi-tools', 'bi bi-train-front', 'bi bi-trash', 'bi bi-tree', 'bi bi-trello', 'bi bi-trophy', 'bi bi-truck',
        'bi bi-tv', 'bi bi-twitch', 'bi bi-twitter-x', 'bi bi-umbrella', 'bi bi-unlock', 'bi bi-upload', 'bi bi-usb', 'bi bi-vector-pen', 'bi bi-vimeo',
        'bi bi-volume-up', 'bi bi-wallet', 'bi bi-watch', 'bi bi-water', 'bi bi-whatsapp', 'bi bi-wifi', 'bi bi-window', 'bi bi-wrench', 'bi bi-xbox',
        'bi bi-youtube', 'bi bi-zoom-in',

        // --- Boxicons (Solid & Regular) ---
        'bx bx-home', 'bx bx-user', 'bx bx-message', 'bx bx-notification', 'bx bx-cog', 'bx bx-search', 'bx bx-heart', 'bx bx-star',
        'bx bx-calendar', 'bx bx-time', 'bx bx-cart', 'bx bx-shopping-bag', 'bx bx-wallet', 'bx bx-credit-card', 'bx bx-briefcase',
        'bx bx-book', 'bx bx-bookmark', 'bx bx-image', 'bx bx-camera', 'bx bx-video', 'bx bx-microphone', 'bx bx-headset', 'bx bx-support',
        'bx bx-phone', 'bx bx-envelope', 'bx bx-map', 'bx bx-location-plus', 'bx bx-globe', 'bx bx-cloud', 'bx bx-wifi', 'bx bx-bluetooth',
        'bx bx-battery', 'bx bx-plug', 'bx bx-bolt', 'bx bx-sun', 'bx bx-moon', 'bx bx-cloud-lightning', 'bx bx-wind', 'bx bx-droplet',
        'bx bx-leaf', 'bx bx-tree', 'bx bx-rocket', 'bx bx-layer', 'bx bx-layout', 'bx bx-grid', 'bx bx-list-ul', 'bx bx-list-ol',
        'bx bx-link', 'bx bx-unlink', 'bx bx-paperclip', 'bx bx-attachment', 'bx bx-paper-plane', 'bx bx-share-alt', 'bx bx-upload', 'bx bx-download',
        'bx bx-refresh', 'bx bx-sync', 'bx bx-history', 'bx bx-archive', 'bx bx-folder', 'bx bx-file', 'bx bx-copy', 'bx bx-paste',
        'bx bx-trash', 'bx bx-edit', 'bx bx-pencil', 'bx bx-show', 'bx bx-hide', 'bx bx-lock', 'bx bx-lock-open', 'bx bx-key',
        'bx bx-shield', 'bx bx-flag', 'bx bx-tag', 'bx bx-label', 'bx bx-trophy', 'bx bx-medal', 'bx bx-award', 'bx bx-gift',
        'bx bx-party', 'bx bx-drink', 'bx bx-food-menu', 'bx bx-restaurant', 'bx bx-coffee', 'bx bx-beer', 'bx bx-wine', 'bx bx-cake',
        'bx bx-tv', 'bx bx-laptop', 'bx bx-mobile', 'bx bx-tablet', 'bx bx-desktop', 'bx bx-mouse', 'bx bx-keyboard', 'bx bx-printer',
        'bx bx-station', 'bx bx-car', 'bx bx-bus', 'bx bx-train', 'bx bx-plane', 'bx bx-ship', 'bx bx-walk', 'bx bx-run', 'bx bx-cycling',
        'bx bx-football', 'bx bx-basketball', 'bx bx-tennis-ball', 'bx bx-game', 'bx bx-joystick', 'bx bx-music', 'bx bx-headphone', 'bx bx-volume-full',
        'bx bxs-hot', 'bx bxs-flame', 'bx bxs-star', 'bx bxs-heart', 'bx bxs-smile', 'bx bxs-face', 'bx bxs-cool', 'bx bxs-medal',
        'bx bxs-trophy', 'bx bxs-crown', 'bx bxs-diamond', 'bx bxs-gem', 'bx bxs-zap', 'bx bxs-bolt', 'bx bxs-camera', 'bx bxs-video',
        'bx bxs-phone', 'bx bxs-envelope', 'bx bxs-chat', 'bx bxs-comment', 'bx bxs-user-detail', 'bx bxs-contact', 'bx bxs-id-card',
        'bx bxs-briefcase', 'bx bxs-bank', 'bx bxs-calculator', 'bx bxs-cloud-upload', 'bx bxs-cloud-download', 'bx bxs-file-pdf',
        'bx bxs-cog', 'bx bxs-wrench', 'bx bxs-magic-wand', 'bx bxs-palette', 'bx bxs-paint', 'bx bxs-component',

        // --- Remix Icon (Line & Fill) ---
        'ri-home-line', 'ri-home-fill', 'ri-user-line', 'ri-user-fill', 'ri-message-line', 'ri-message-fill', 'ri-notification-line',
        'ri-notification-fill', 'ri-settings-line', 'ri-settings-fill', 'ri-search-line', 'ri-heart-line', 'ri-heart-fill',
        'ri-star-line', 'ri-star-fill', 'ri-calendar-line', 'ri-time-line', 'ri-shopping-cart-line', 'ri-shopping-bag-line',
        'ri-wallet-line', 'ri-credit-card-line', 'ri-briefcase-line', 'ri-book-line', 'ri-bookmark-line', 'ri-image-line',
        'ri-camera-line', 'ri-video-line', 'ri-mic-line', 'ri-headset-line', 'ri-customer-service-line', 'ri-customer-service-2-line',
        'ri-phone-line', 'ri-mail-line', 'ri-map-pin-line', 'ri-globe-line', 'ri-cloud-line', 'ri-wifi-line', 'ri-bluetooth-line',
        'ri-battery-line', 'ri-plug-line', 'ri-flashlight-line', 'ri-sun-line', 'ri-moon-line', 'ri-cloud-windy-line', 'ri-leaf-line',
        'ri-temp-hot-line', 'ri-temp-cold-line', 'ri-fire-line', 'ri-water-flash-line', 'ri-rocket-line', 'ri-plane-line', 'ri-car-line',
        'ri-truck-line', 'ri-bicycle-line', 'ri-walk-line', 'ri-run-line', 'ri-football-line', 'ri-gamepad-line', 'ri-music-line',
        'ri-volume-up-line', 'ri-volume-down-line', 'ri-volume-mute-line', 'ri-mic-off-line', 'ri-video-off-line', 'ri-shield-line',
        'ri-shield-check-line', 'ri-lock-line', 'ri-lock-unlock-line', 'ri-key-line', 'ri-flag-line', 'ri-tag-line', 'ri-price-tag-line',
        'ri-award-line', 'ri-medal-line', 'ri-cup-line', 'ri-cake-line', 'ri-gift-line', 'ri-compass-line', 'ri-anchor-line',
        'ri-pencil-line', 'ri-edit-line', 'ri-delete-bin-line', 'ri-save-line', 'ri-file-line', 'ri-folder-line', 'ri-upload-line',
        'ri-download-line', 'ri-share-line', 'ri-links-line', 'ri-external-link-line', 'ri-refresh-line', 'ri-history-line',
        'ri-timer-line', 'ri-alarm-line', 'ri-at-line', 'ri-hashtag-line', 'ri-qr-code-line', 'ri-barcode-line', 'ri-computer-line',
        'ri-tablet-line', 'ri-smartphone-line', 'ri-tv-line', 'ri-dashboard-line', 'ri-pie-chart-line', 'ri-bar-chart-line',
        'ri-line-chart-line', 'ri-code-line', 'ri-terminal-line', 'ri-command-line', 'ri-database-line', 'ri-sever-line',
        'ri-customer-service-fill', 'ri-customer-service-2-fill', 'ri-service-line', 'ri-service-fill', 'ri-hand-heart-line',
        'ri-hand-coin-line', 'ri-shake-hands-line', 'ri-team-line', 'ri-group-line', 'ri-community-line'
    ];

    function icon(key, value, blockId, onUpdate) {
        const container = document.createElement('div');
        container.className = 'icon-picker-field';
        container.style.display = 'flex'; container.style.gap = '8px'; container.style.alignItems = 'center';

        const preview = document.createElement('div');
        preview.className = 'val-preview';
        preview.innerHTML = `<i class="${value || 'fa-solid fa-star'}"></i>`;
        
        const input = document.createElement('input');
        input.type = 'text'; input.value = value || '';
        input.placeholder = 'Icon class...';
        input.style.flex = '1';
        input.oninput = (e) => {
            const val = e.target.value;
            preview.innerHTML = `<i class="${val || 'fa-solid fa-question'}"></i>`;
            if (onUpdate) onUpdate(val);
            else commitChange(blockId, key, val);
        };

        const openBtn = document.createElement('button');
        openBtn.className = 'picker-btn';
        openBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
        openBtn.onclick = (e) => {
            e.stopPropagation();
            const existing = document.querySelector('.icon-picker-panel');
            if (existing) existing.remove();

            const rect = openBtn.getBoundingClientRect();
            const panel = document.createElement('div');
            panel.className = 'icon-picker-panel';
            panel.style.position = 'fixed';
            panel.style.top = Math.min(window.innerHeight - 420, rect.top) + 'px';
            panel.style.left = (rect.left - 310) + 'px'; // Position to the left of the button
            panel.style.width = '300px';
            panel.style.maxHeight = '400px';
            panel.style.backgroundColor = '#1a1d27'; // var(--surface) equivalent
            panel.style.border = '1px solid #2e3349'; // var(--border) equivalent
            panel.style.borderRadius = '12px';
            panel.style.boxShadow = '0 10px 40px rgba(0,0,0,0.5)';
            panel.style.zIndex = '10000'; // Very high z-index
            panel.style.display = 'flex';
            panel.style.flexDirection = 'column';
            panel.style.overflow = 'hidden';

            const searchWrap = document.createElement('div');
            searchWrap.style.padding = '12px';
            searchWrap.style.borderBottom = '1px solid #2e3349';
            const search = document.createElement('input');
            search.placeholder = 'Search icons...';
            search.style.width = '100%';
            search.style.padding = '8px';
            search.style.backgroundColor = '#0f1117'; // var(--bg) equivalent
            search.style.border = '1px solid #3d4266'; // var(--border2) equivalent
            search.style.borderRadius = '6px';
            search.style.color = '#e2e8f0'; // var(--text) equivalent
            searchWrap.appendChild(search);
            panel.appendChild(searchWrap);

            const grid = document.createElement('div');
            grid.className = 'icon-grid-scroll'; // Added class
            grid.style.padding = '10px';
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
            grid.style.gap = '8px';
            grid.style.overflowY = 'auto';
            grid.style.flex = '1';

            const renderGrid = (term = '') => {
                grid.innerHTML = '';
                const filtered = ICON_LIB.filter(ic => ic.toLowerCase().includes(term.toLowerCase()));
                filtered.forEach(ic => {
                    const btn = document.createElement('button');
                    btn.style.padding = '10px 0';
                    btn.style.background = 'rgba(255,255,255,0.05)';
                    btn.style.border = '1px solid rgba(255,255,255,0.1)';
                    btn.style.borderRadius = '8px';
                    btn.style.color = '#fff';
                    btn.style.cursor = 'pointer';
                    btn.title = ic;
                    btn.innerHTML = `<i class="${ic}" style="font-size:1.2rem;"></i>`;
                    btn.onclick = () => {
                        input.value = ic;
                        input.oninput({ target: input });
                        panel.remove();
                    };
                    btn.onmouseover = () => btn.style.background = 'rgba(108, 99, 255, 0.2)';
                    btn.onmouseout = () => btn.style.background = 'rgba(255,255,255,0.05)';
                    grid.appendChild(btn);
                });
            };

            search.oninput = (e) => renderGrid(e.target.value);
            renderGrid();

            panel.appendChild(grid);
            document.body.appendChild(panel);

            // Close on click outside
            const clickOutside = (ev) => {
                if (!panel.contains(ev.target) && ev.target !== openBtn) {
                    panel.remove();
                    document.removeEventListener('mousedown', clickOutside);
                }
            };
            setTimeout(() => document.addEventListener('mousedown', clickOutside), 10);
        };

        container.appendChild(preview);
        container.appendChild(input);
        container.appendChild(openBtn);
        return container;
    }

    function range(key, val, min, max, step, blockId) {
        const row = document.createElement('div');
        row.style.display = 'flex'; row.style.alignItems = 'center'; row.style.gap = '10px';
        const el = document.createElement('input');
        el.type = 'range'; el.min = min; el.max = max; el.step = step; el.value = val;
        el.style.flex = '1'; el.style.cursor = 'pointer';
        const lbl = document.createElement('span');
        lbl.textContent = val;
        lbl.style.fontSize = '0.8rem'; lbl.style.color = 'var(--text2)'; lbl.style.minWidth = '35px';
        el.addEventListener('input', () => {
            lbl.textContent = el.value;
            commitChange(blockId, key, Number(el.value));
        });
        row.appendChild(el); row.appendChild(lbl);
        return row;
    }

    function repeater(title, key, items, blockId, fieldDefs) {
        const sec = document.createElement('div');
        sec.className = 'prop-section';

        const updateRepeaterItem = (idx, itemKey, value, headerKey, headerEl) => {
            const arr = [...(State.getBlock(blockId).props[key] || [])];
            arr[idx] = { ...arr[idx], [itemKey]: value };
            State.updateBlockProps(blockId, { [key]: arr }, { forceRoot: true });
            if (itemKey === headerKey && headerEl) {
                headerEl.textContent = (String(value) || `Item ${idx + 1}`).substring(0, 20);
            }
        };

        const renderItems = (focusIndex = null) => {
            sec.querySelectorAll('.repeater-item').forEach(el => el.remove());
            sec.querySelector('.add-item-btn') && sec.querySelector('.add-item-btn').remove();

            const currentItems = State.getBlock(blockId).props[key] || [];

            currentItems.forEach((item, idx) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'repeater-item';
                itemEl.dataset.repeaterKey = key;
                itemEl.dataset.repeaterIndex = String(idx);
                const header = document.createElement('div');
                header.className = 'repeater-item-header';
                
                const firstKey = fieldDefs[0].key;
                let headerLabel = `Item ${idx + 1}`;
                if (item[firstKey] !== undefined) {
                     headerLabel = String(item[firstKey]) || `Item ${idx + 1}`;
                }
                header.innerHTML = `<span>${headerLabel.substring(0, 20)}</span>`;
                
                const btnWrap = document.createElement('div');
                btnWrap.style.display = 'flex'; btnWrap.style.gap = '6px'; btnWrap.style.alignItems = 'center';

                const createActBtn = (icon, title, color, onClick) => {
                    const b = document.createElement('button');
                    b.className = 'btn-icon';
                    b.innerHTML = `<i class="fa-solid ${icon}"></i>`;
                    b.title = title;
                    b.style.cssText = `border:none; background:none; cursor:pointer; font-size:0.8rem; color:${color}; padding:2px;`;
                    b.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
                    return b;
                };

                btnWrap.appendChild(createActBtn('fa-arrow-up', 'Move Up', 'var(--text3)', () => {
                    State.moveSubElement(blockId, `${key}.${idx}`, 'up');
                    renderPanel(State.getBlock(blockId));
                }));
                btnWrap.appendChild(createActBtn('fa-arrow-down', 'Move Down', 'var(--text3)', () => {
                    State.moveSubElement(blockId, `${key}.${idx}`, 'down');
                    renderPanel(State.getBlock(blockId));
                }));
                btnWrap.appendChild(createActBtn('fa-copy', 'Duplicate', 'var(--success)', () => {
                    State.duplicateSubElement(blockId, `${key}.${idx}`);
                    renderPanel(State.getBlock(blockId));
                }));
                btnWrap.appendChild(createActBtn('fa-xmark', 'Delete', 'var(--danger)', () => {
                    if (confirm('Delete this item?')) {
                        State.removeSubElement(blockId, `${key}.${idx}`);
                        renderPanel(State.getBlock(blockId));
                    }
                }));
                
                header.appendChild(btnWrap);

                const body = document.createElement('div');
                body.className = 'repeater-item-body';

                fieldDefs.forEach(def => {
                    const fg = document.createElement('div');
                    fg.className = 'form-group';
                    const lbl = document.createElement('label');
                    lbl.textContent = def.label;
                    fg.appendChild(lbl);

                    let inp;
                    if (def.type === 'toggle') {
                        // Inline toggle implementation without wrapper conflict
                        const tWrap = document.createElement('div');
                        tWrap.style.display = 'flex'; tWrap.style.gap = '8px'; tWrap.style.alignItems = 'center';
                        inp = document.createElement('input');
                        inp.type = 'checkbox';
                        inp.checked = !!item[def.key];
                        inp.style.width = 'auto'; inp.style.height = '16px'; inp.style.cursor = 'pointer';
                        const tLbl = document.createElement('span');
                        tLbl.textContent = item[def.key] ? 'On' : 'Off';
                        tLbl.style.fontSize = '0.8rem'; tLbl.style.color = 'var(--text2)';
                        inp.addEventListener('change', () => {
                            tLbl.textContent = inp.checked ? 'On' : 'Off';
                            const arr = [...(State.getBlock(blockId).props[key] || [])];
                            arr[idx] = { ...arr[idx], [def.key]: inp.checked };
                            State.updateBlockProps(blockId, { [key]: arr });
                        });
                        tWrap.appendChild(inp); tWrap.appendChild(tLbl);
                        fg.appendChild(tWrap);
                    } else if (def.type === 'textarea') {
                        inp = document.createElement('textarea');
                        inp.rows = 3;
                        inp.value = item[def.key] || '';
                    } else if (def.type === 'number') {
                        inp = document.createElement('input');
                        inp.type = 'number';
                        inp.value = item[def.key] || 0;
                    } else if (def.type === 'icon') {
                        inp = icon(def.key, item[def.key], blockId, (v) => {
                            const arr = [...(State.getBlock(blockId).props[key] || [])];
                            arr[idx] = { ...arr[idx], [def.key]: v };
                            State.updateBlockProps(blockId, { [key]: arr });
                            if (def.key === firstKey) { 
                                header.querySelector('span').textContent = (String(v) || `Item ${idx + 1}`).substring(0, 20); 
                            }
                        });
                    } else if (def.type === 'select') {
                        inp = document.createElement('select');
                        (def.options || []).forEach(opt => {
                            const o = document.createElement('option');
                            o.value = opt;
                            o.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
                            if (item[def.key] === opt) o.selected = true;
                            inp.appendChild(o);
                        });
                    } else if (def.type === 'range') {
                        inp = document.createElement('div');
                        inp.style.cssText = 'display:flex;align-items:center;gap:8px;';
                        const slider = document.createElement('input');
                        slider.type = 'range';
                        slider.min = def.min !== undefined ? def.min : '0';
                        slider.max = def.max !== undefined ? def.max : '1';
                        slider.step = def.step !== undefined ? def.step : '0.05';
                        slider.value = item[def.key] !== undefined ? item[def.key] : (def.defaultValue || slider.min);
                        slider.style.cssText = 'flex:1;height:5px;cursor:pointer;accent-color:var(--accent);';
                        const valLabel = document.createElement('span');
                        valLabel.style.cssText = 'font-size:0.7rem;color:var(--text2);width:32px;text-align:right;';
                        valLabel.textContent = slider.value;
                        slider.addEventListener('input', () => {
                            valLabel.textContent = slider.value;
                            updateRepeaterItem(idx, def.key, parseFloat(slider.value), firstKey, header.querySelector('span'));
                        });
                        inp.appendChild(slider);
                        inp.appendChild(valLabel);
                    } else if (def.type === 'url') {
                        inp = document.createElement('div');
                        inp.style.display = 'flex';
                        inp.style.flexDirection = 'column';
                        inp.style.gap = '5px';

                        const urlInput = document.createElement('input');
                        urlInput.type = 'text';
                        urlInput.value = item[def.key] || '';
                        urlInput.placeholder = 'https://... or select page';
                        urlInput.addEventListener('input', () => {
                            updateRepeaterItem(idx, def.key, urlInput.value, firstKey, header.querySelector('span'));
                        });
                        inp.appendChild(urlInput);

                        // Asset picker for image-related fields in repeater
                        const imageFieldKeys = new Set(['image', 'src', 'img', 'poster', 'thumbnail', 'bgImage', 'photo', 'avatar', 'cover', 'banner']);
                        if (imageFieldKeys.has(def.key) || (def.label && /image|photo|avatar|thumbnail|cover/i.test(def.label))) {
                            const assetRow = document.createElement('div');
                            assetRow.style.cssText = 'display:flex;gap:6px;margin-top:2px;';

                            const uploadBtn = document.createElement('button');
                            uploadBtn.type = 'button';
                            uploadBtn.innerHTML = '<i class="fa-solid fa-upload"></i> Upload';
                            uploadBtn.style.cssText = 'flex:1;padding:5px 8px;border:1px solid var(--border);background:var(--surface2);color:var(--text2);border-radius:6px;cursor:pointer;font-size:0.72rem;display:flex;align-items:center;justify-content:center;gap:4px;';
                            uploadBtn.onclick = (e) => {
                                e.stopPropagation();
                                const fileInput = document.createElement('input');
                                fileInput.type = 'file';
                                fileInput.accept = 'image/*';
                                fileInput.onchange = async (ev) => {
                                    const file = ev.target.files[0];
                                    if (!file) return;
                                    if (typeof AssetManager !== 'undefined') {
                                        const asset = await AssetManager.upload(file);
                                        if (asset) {
                                            urlInput.value = asset.path;
                                            updateRepeaterItem(idx, def.key, asset.path, firstKey, header.querySelector('span'));
                                        }
                                    }
                                };
                                fileInput.click();
                            };

                            const browseBtn = document.createElement('button');
                            browseBtn.type = 'button';
                            browseBtn.innerHTML = '<i class="fa-solid fa-images"></i> Browse';
                            browseBtn.style.cssText = 'flex:1;padding:5px 8px;border:1px solid var(--border);background:var(--surface2);color:var(--text2);border-radius:6px;cursor:pointer;font-size:0.72rem;display:flex;align-items:center;justify-content:center;gap:4px;';
                            browseBtn.onclick = (e) => {
                                e.stopPropagation();
                                if (typeof AssetManager !== 'undefined') {
                                    AssetManager.open((dataUrl, asset) => {
                                        const val = asset && asset.path ? asset.path : dataUrl;
                                        urlInput.value = val;
                                        updateRepeaterItem(idx, def.key, val, firstKey, header.querySelector('span'));
                                    });
                                }
                            };

                            assetRow.appendChild(uploadBtn);
                            assetRow.appendChild(browseBtn);
                            inp.appendChild(assetRow);
                        }

                        const pages = getLinkablePages();
                        if (pages.length > 0 && !imageFieldKeys.has(def.key) && !(def.label && /image|photo|avatar|thumbnail|cover/i.test(def.label))) {
                            const pageLabel = document.createElement('div');
                            pageLabel.textContent = 'Connect To Page';
                            pageLabel.style.cssText = 'font-size:0.72rem;color:var(--text3);margin-top:4px;';
                            inp.appendChild(pageLabel);

                            const sel = document.createElement('select');
                            sel.style.cssText = 'font-size:0.78rem;';
                            sel.innerHTML = `<option value="">-- Link to Page --</option>` +
                                pages.map(p => `<option value="${p.filename}" ${(item[def.key] || '') === p.filename ? 'selected' : ''}>Page: ${p.name}</option>`).join('');
                            sel.addEventListener('change', () => {
                                if (sel.value) {
                                    urlInput.value = sel.value;
                                    updateRepeaterItem(idx, def.key, sel.value, firstKey, header.querySelector('span'));
                                }
                            });
                            inp.appendChild(sel);
                        }
                    } else {
                        inp = document.createElement('input');
                        inp.type = def.type === 'url' ? 'url' : 'text';
                        inp.value = item[def.key] || '';
                    }

                    if (def.type !== 'toggle' && def.type !== 'icon' && def.type !== 'url') {
                        inp.addEventListener('input', () => {
                            let val = inp.value;
                            if (def.type === 'number') val = Number(val);
                            updateRepeaterItem(idx, def.key, val, firstKey, header.querySelector('span'));
                        });
                    }
                    if (def.type !== 'toggle') {
                        fg.appendChild(inp);
                    }

                    body.appendChild(fg);
                });

                itemEl.appendChild(header);
                itemEl.appendChild(body);
                sec.appendChild(itemEl);
            });

            const addBtn = document.createElement('button');
            addBtn.className = 'add-item-btn';
            addBtn.type = 'button';
            addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Item';
            addBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const block = State.getBlock(blockId);
                const arr = [...(State.getBlock(blockId).props[key] || [])];
                const emptyItem = {};
                fieldDefs.forEach(def => {
                    emptyItem[def.key] = def.type === 'toggle' ? false : (def.type === 'number' ? 0 : '');
                });
                arr.push(emptyItem);
                const updates = { [key]: arr };
                if (key === 'items' && (block?.type === 'video' || block?.type === 'image' || block?.type === 'text' || block?.type === 'box') && !block?.props?.columns) {
                    updates.columns = Math.max(1, arr.length - 1);
                }
                _pendingPanelFocus = {
                    blockId,
                    tab: 'content',
                    selector: `.repeater-item[data-repeater-key="${key}"][data-repeater-index="${arr.length - 1}"]`
                };
                State.updateBlockProps(blockId, updates);
                renderItems(arr.length - 1);
            });
            sec.appendChild(addBtn);

            if (focusIndex !== null) {
                requestAnimationFrame(() => {
                    const target = sec.querySelector(`.repeater-item[data-repeater-key="${key}"][data-repeater-index="${focusIndex}"]`);
                    if (!target) return;
                    target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    const firstInput = target.querySelector('input, textarea, select');
                    if (firstInput && typeof firstInput.focus === 'function') firstInput.focus();
                });
            }
        };

        renderItems();
        return { title: title, fields: [sec] };
    }

    return { 
        init, 
        openThemesPanel: renderThemesPanel, 
        closeThemesPanel: closeThemePanel,
        refresh() {
            const id = State.getSelectedId();
            if (id && _panelMode === 'properties') {
                saveCurrentScrollPosition();
                renderPanel(State.getBlock(id));
            }
        }
    };
})();
