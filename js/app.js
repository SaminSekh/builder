// ============================================================
// app.js – Main application entry point
// Wires all modules together and handles UI events
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // Inject border animation keyframes globally
    const borderAnimStyle = document.createElement('style');
    borderAnimStyle.id = 'sf-border-anims';
    borderAnimStyle.textContent = `
@keyframes sf-border-rainbow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes sf-border-spin{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
@keyframes sf-border-pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 currentColor}50%{opacity:0.85;box-shadow:0 0 12px 2px currentColor}}
@property --rainbow-angle{syntax:'<angle>';initial-value:0deg;inherits:false}
@keyframes sf-rainbow-rotate{0%{--rainbow-angle:0deg}100%{--rainbow-angle:360deg}}
@keyframes sf-shine{0%{left:-100%}50%{left:100%}100%{left:100%}}
@keyframes sf-bg-gradient-shift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes sf-bg-gradient-rotate{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
@keyframes sf-bg-color-pulse{0%,100%{opacity:1}50%{opacity:0.7}}
@keyframes sf-bg-hue-rotate{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
`;
    document.head.appendChild(borderAnimStyle);

    let renderLayersTimeout = null;
    let scrollAnimObserver = null;

    function getScrollAnimInitial(preset) {
        switch (preset) {
            case 'fade-up':
                return { opacity: '0', transform: 'translate3d(0, 36px, 0)' };
            case 'fade-in':
                return { opacity: '0', transform: 'none' };
            case 'zoom-in':
                return { opacity: '0', transform: 'scale(0.92)' };
            case 'slide-right':
                return { opacity: '0', transform: 'translate3d(-42px, 0, 0)' };
            default:
                return { opacity: '', transform: '' };
        }
    }

    function initScrollAnimations(root = document) {
        const targets = root.querySelectorAll('[data-sf-anim]');
        if (!targets.length) return;

        if (!scrollAnimObserver) {
            scrollAnimObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target;
                    const preset = el.dataset.sfAnim;
                    const duration = Math.max(0.2, parseFloat(el.dataset.sfAnimDuration || '0.8') || 0.8);
                    const delay = Math.max(0, parseFloat(el.dataset.sfAnimDelay || '0') || 0);
                    el.style.animation = `sf-anim-${preset} ${duration}s ease both`;
                    el.style.animationDelay = `${delay}s`;
                    el.style.opacity = '';
                    el.style.transform = '';
                    scrollAnimObserver.unobserve(el);
                });
            }, { threshold: 0.18 });
        }

        targets.forEach((el) => {
            const preset = el.dataset.sfAnim;
            if (!preset) return;
            const initial = getScrollAnimInitial(preset);
            el.style.opacity = initial.opacity;
            el.style.transform = initial.transform;
            el.style.willChange = 'transform, opacity';
            scrollAnimObserver.observe(el);
        });
    }

    // ---- Initialize modules ----
    Palette.init();
    Canvas.init();
    Canvas.initContextMenu();
    Properties.init();
    initScrollAnimations(document);

    // ---- Sidebar Tabs ----
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.remove('hidden');
        });
    });

    // ---- History ----
    document.getElementById('undoBtn').addEventListener('click', () => {
        if (State.undo()) showToast('Undo successful', 'info');
    });
    document.getElementById('redoBtn').addEventListener('click', () => {
        if (State.redo()) showToast('Redo successful', 'info');
    });

    function renderLayers() {
        // Delegate to enhanced LayerPanel if available
        if (typeof LayerPanel !== 'undefined') {
            LayerPanel.render();
            return;
        }
        // Fallback: basic layer rendering
        if (renderLayersTimeout) clearTimeout(renderLayersTimeout);
        renderLayersTimeout = setTimeout(() => {
            const list = document.getElementById('layersList');
            if (!list) return;
            list.innerHTML = '';

            function renderItem(block, depth = 0) {
                const item = document.createElement('div');
                item.className = 'layer-item' + (State.getSelectedId() === block.id ? ' selected' : '');
                
                // Indent
                if (depth > 0) {
                    item.style.paddingLeft = (15 + depth * 12) + 'px';
                }

                const icon = document.createElement('i');
                const def = BlockTypes[block.type];
                icon.className = (def ? def.icon : 'fa-solid fa-cube') + ' fa-fw';
                icon.style.marginRight = '8px';
                icon.style.fontSize = '0.8rem';
                icon.style.opacity = '0.7';
                item.appendChild(icon);

                const label = document.createElement('span');
                label.textContent = def ? def.label : block.type;
                item.appendChild(label);

                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    State.setSelected(block.id);
                });
                list.appendChild(item);

                // Nested
                const children = State.getBlocks(block.id);
                children.forEach(child => renderItem(child, depth + 1));
            }

            const rootBlocks = State.getBlocks();
            if (rootBlocks.length === 0) {
                list.innerHTML = '<div class="prop-empty"><p>No blocks yet</p></div>';
                return;
            }
            rootBlocks.forEach(block => renderItem(block));
        }, 10);
    }

    State.on('blocksChanged', renderLayers);
    State.on('selectionChanged', renderLayers);
    State.on('blocksChanged', () => {
        setTimeout(() => initScrollAnimations(document.getElementById('canvas') || document), 20);
        // Re-apply site text styles after canvas re-renders
        setTimeout(() => { if (typeof SiteText !== 'undefined') SiteText.applyToCanvas(); }, 30);
    });

    // ---- Themes ----
    function initThemes() {
        const allThemes = Themes.getAll();
        const grids = { solid: 'themeGridSolid', gradient: 'themeGridGradient', blob: 'themeGridBlob' };

        Object.entries(grids).forEach(([type, gridId]) => {
            const grid = document.getElementById(gridId);
            if (!grid) return;
            allThemes.filter(t => t.type === type).forEach(theme => {
                const card = document.createElement('div');
                card.className = 'theme-card';
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
                    showToast('🎨 Theme applied: ' + theme.name, 'success');
                });
                grid.appendChild(card);
            });
        });

        document.getElementById('themeBtn').addEventListener('click', () => {
            Properties.openThemesPanel();
        });
        document.getElementById('siteTextBtn').addEventListener('click', () => {
            if (typeof SiteText !== 'undefined') SiteText.openPanel();
        });
        const clearThemeBtn = document.getElementById('clearThemeBtn');
        if (clearThemeBtn) {
            clearThemeBtn.addEventListener('click', () => {
                Themes.clear();
                showToast('Theme cleared', 'info');
            });
        }

        // Restore theme from saved state
        const savedTheme = State.getTheme();
        if (savedTheme) {
            Themes.restore(savedTheme);
        }

        // Also restore after blocks load (since state loads async)
        State.on('blocksChanged', () => {
            const t = State.getTheme();
            if (t && Themes.getActiveId() !== t) Themes.restore(t);
        });
    }

    // ---- Device toggle ----
    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            State.setDevice(btn.dataset.device);
        });
    });

    // ---- Modal open/close ----
    function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
    function closeModal(id) {
        document.getElementById(id).classList.add('hidden');
        // Restore block-actions visibility when any modal closes
        if (id === 'previewModal') {
            document.querySelectorAll('.block-actions').forEach(el => el.style.display = '');
            if (window._originalPreviewPageId && State.getCurrentPageId() !== window._originalPreviewPageId) {
                State.switchPage(window._originalPreviewPageId);
            }
        }
    }

    // ---- Confirmation Helper ----
    let currentConfirmCallback = null;
    window.askConfirm = function(title, message, callback) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        currentConfirmCallback = callback;
        openModal('confirmModal');
    };

    document.getElementById('confirmBtn').addEventListener('click', () => {
        if (currentConfirmCallback) currentConfirmCallback();
        closeModal('confirmModal');
        currentConfirmCallback = null;
    });

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            closeModal(modalId);
        });
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            // Only close if clicking directly on the dark backdrop, not on modal content
            if (e.target === overlay) {
                closeModal(overlay.id);
            }
        });
        // Prevent any pointer events inside modals from reaching the canvas
        overlay.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
        });
        overlay.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
    });
    // Prevent clicks inside .modal from bubbling to overlay
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // ---- Site Settings ----
    document.getElementById('metaBtn').addEventListener('click', () => {
        const meta = State.getMeta();
        document.getElementById('meta-title').value = meta.title || '';
        document.getElementById('meta-desc').value = meta.description || '';
        document.getElementById('meta-keywords').value = meta.keywords || '';
        document.getElementById('meta-favicon').value = meta.favicon || '';
        document.getElementById('meta-scripts').value = meta.scripts || '';
        document.getElementById('meta-fonts').value = meta.fonts || '';
        document.getElementById('meta-url').value = meta.url || '';
        document.getElementById('meta-robots').value = meta.robots || '';
        document.getElementById('meta-cartTitle').value = meta.cartTitle || 'Your Basket';
        document.getElementById('meta-currency').value = meta.currency || '₹';
        document.getElementById('meta-whatsapp').value = meta.whatsapp || '';
        document.getElementById('meta-telegram').value = meta.telegram || '';
        document.getElementById('meta-checkoutText').value = meta.checkoutText || 'Place Order';
        document.getElementById('meta-cartAccent').value = meta.cartAccent || '#6c63ff';
        openModal('metaModal');
    });

    document.getElementById('saveMetaBtn').addEventListener('click', () => {
        State.updateMeta({
            title: document.getElementById('meta-title').value,
            description: document.getElementById('meta-desc').value,
            keywords: document.getElementById('meta-keywords').value,
            favicon: document.getElementById('meta-favicon').value,
            scripts: document.getElementById('meta-scripts').value,
            fonts: document.getElementById('meta-fonts').value,
            url: document.getElementById('meta-url').value,
            robots: document.getElementById('meta-robots').value,
            cartTitle: document.getElementById('meta-cartTitle').value,
            currency: document.getElementById('meta-currency').value,
            whatsapp: document.getElementById('meta-whatsapp').value,
            telegram: document.getElementById('meta-telegram').value,
            checkoutText: document.getElementById('meta-checkoutText').value,
            cartAccent: document.getElementById('meta-cartAccent').value
        });
        closeModal('metaModal');
        showToast('✅ Site settings saved!', 'success');
    });

    // ---- Structure Toggle ----
    document.getElementById('structureToggle').addEventListener('click', (e) => {
        const isActive = document.body.classList.toggle('structure-view');
        const btn = e.currentTarget;
        if (isActive) {
            btn.classList.replace('secondary', 'primary');
            btn.innerHTML = '<i class="fa-solid fa-border-none"></i> Hide Structure';
            showToast('🔍 Visual structure enabled (green borders)', 'info');
        } else {
            btn.classList.replace('primary', 'secondary');
            btn.innerHTML = '<i class="fa-solid fa-border-all"></i> Show Structure';
            State.setSelectedSubPath(null);
        }
    });

    // ---- Preview ----
    function wirePreviewNavigation(frame) {
        if (!frame) return;
        frame.onload = () => {
            try {
                const doc = frame.contentDocument || frame.contentWindow?.document;
                if (!doc) return;

                doc.addEventListener('click', async (e) => {
                    const link = e.target.closest?.('a[href]');
                    if (!link) return;
                    const rawHref = (link.getAttribute('href') || '').trim();
                    if (!rawHref) return;

                    if (rawHref.startsWith('#')) {
                        const targetId = rawHref.slice(1);
                        const targetEl = doc.getElementById(targetId);
                        if (!targetEl) return;
                        e.preventDefault();
                        e.stopPropagation();
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        return;
                    }

                    if (/^[a-z]+:/i.test(rawHref) || rawHref.startsWith('//')) return;

                    const getBasename = (p) => {
                        if (!p) return '';
                        const clean = p.split('#')[0].split('?')[0];
                        return clean.substring(clean.lastIndexOf('/') + 1);
                    };
                    const targetBasename = getBasename(rawHref);
                    const targetPage = (State.getPages?.() || []).find((page) => getBasename(page?.filename) === targetBasename);
                    if (!targetPage) return;

                    e.preventDefault();
                    e.stopPropagation();

                    // Render the target page HTML.
                    const html = await Exporter.getPreviewHTML(targetPage.id);
                    frame.srcdoc = html;
                    // onload will re-wire navigation for the newly loaded page automatically
                }, true);
            } catch (err) {
                console.warn('Preview navigation wiring failed', err);
            }
        };
    }

    document.getElementById('previewBtn').addEventListener('click', async () => {
        try {
            // Hide floating editor elements before preview
            document.querySelectorAll('.block-actions').forEach(el => el.style.display = 'none');

            // Track original page ID to restore it when modal closes
            window._originalPreviewPageId = State.getCurrentPageId();

            const html = await Exporter.getPreviewHTML();
            const frame = document.getElementById('previewFrame');
            if (frame) {
                wirePreviewNavigation(frame);
                frame.srcdoc = html;
                openModal('previewModal');
            } else {
                showToast('⚠️ Preview frame not found!', 'error');
            }
        } catch (err) {
            console.error('Preview Generation Error:', err);
            showToast('⚠️ Could not generate preview. Please check for corrupted blocks.', 'error');
        }
    });

    // ---- Clear Actions ----
    const clearSelectedBtn = document.getElementById('clearSelectedBtn');
    if (clearSelectedBtn) clearSelectedBtn.addEventListener('click', () => {
        const id = State.getSelectedId();
        if (id) {
            State.removeBlock(id);
            showToast('🗑️ Element removed', 'success');
        } else {
            showToast('⚠️ Please select an element first', 'info');
        }
    });

    document.getElementById('clearAllBtn').addEventListener('click', () => {
        if (State.getAllBlocks().length === 0) {
            showToast('ℹ️ Canvas is already empty', 'info');
            return;
        }
        window.askConfirm(
            'Clear Canvas', 
            'Are you sure you want to clear the entire canvas? This cannot be undone (except via Undo).', 
            () => {
                State.clearProject();
                showToast('🧹 Canvas cleared', 'success');
            }
        );
    });

    // ---- Export ----
    document.getElementById('exportBtn').addEventListener('click', () => {
        if (State.getAllBlocks().length === 0) {
            showToast('⚠️ Add some blocks to your canvas first!', 'error');
            return;
        }
        Exporter.exportZIP();
    });

    // ---- Assets ----
    document.getElementById('assetsBtn').addEventListener('click', () => {
        if (typeof AssetManager !== 'undefined') {
            AssetManager.open();
        }
    });

    // ---- Image Search ----
    document.getElementById('imgSearchBtn').addEventListener('click', () => {
        if (typeof ImageSearch !== 'undefined') {
            ImageSearch.open();
        }
    });

    // ---- Import ----
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importPaste').value = '';
        document.getElementById('importFile').value = '';
        document.getElementById('importZip').value = '';
        document.getElementById('importFolder').value = '';
        openModal('importModal');
    });

    document.getElementById('importFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            document.getElementById('importPaste').value = ev.target.result;
        };
        reader.readAsText(file);
    });

    document.getElementById('doImportBtn').addEventListener('click', async () => {
        const zipFile = document.getElementById('importZip').files[0];
        const folderFiles = document.getElementById('importFolder').files;
        const htmlFile = document.getElementById('importFile').files[0];
        const pastedCode = document.getElementById('importPaste').value.trim();

        // 1. Handle Project ZIP
        if (zipFile) {
            try {
                const zip = await JSZip.loadAsync(zipFile);
                const projectFile = zip.file('project.json');
                if (!projectFile) throw new Error('No project.json found in ZIP.');
                
                const content = await projectFile.async('text');
                const data = JSON.parse(content);
                State.importBlocks(data.blocks, data.meta, data.pages, data.theme);
                closeModal('importModal');
                showToast('✅ Project restored from ZIP!', 'success');
                return;
            } catch (err) {
                showToast('❌ Failed to import ZIP: ' + err.message, 'error');
                return;
            }
        }

        // 2. Handle Folder Upload
        if (folderFiles && folderFiles.length > 0) {
            const projectFile = Array.from(folderFiles).find(f => f.name === 'project.json');
            if (projectFile) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const data = JSON.parse(ev.target.result);
                        State.importBlocks(data.blocks, data.meta, data.pages, data.theme);
                        closeModal('importModal');
                        showToast('✅ Website folder imported!', 'success');
                    } catch(err) {
                        showToast('❌ Failed to parse project.json', 'error');
                    }
                };
                reader.readAsText(projectFile);
                return;
            }
        }

        // 3. Handle HTML File or Paste
        if (pastedCode) {
            try {
                const data = JSON.parse(pastedCode);
                if (data.blocks) {
                    State.importBlocks(data.blocks, data.meta, data.pages, data.theme);
                } else {
                    State.importBlocks(data);
                }
                closeModal('importModal');
                showToast('✅ Project imported!', 'success');
            } catch (err) {
                // Not JSON? Add as raw HTML box
                State.addBlock({ type: 'box', props: { customHtml: pastedCode } });
                closeModal('importModal');
                showToast('✅ HTML added as block', 'success');
            }
        } else if (htmlFile) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const html = ev.target.result;
                State.addBlock({ type: 'box', props: { customHtml: html } });
                closeModal('importModal');
                showToast('✅ HTML added as block', 'success');
            };
            reader.readAsText(htmlFile);
        }
    });

    // ---- Toast notification ----
    window.showToast = function (message, type = '') {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.className = type ? `show ${type}` : 'show';
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.className = toast.className.replace('show', '').trim();
        }, 3200);
    };

    // ---- Keyboard shortcuts ----
    document.addEventListener('keydown', (e) => {
        const selected = State.getSelectedId();
        if (!selected) return;
        // Skip if focus is in any editable element
        const ae = document.activeElement;
        if (ae && (['INPUT', 'TEXTAREA', 'SELECT'].includes(ae.tagName) || ae.isContentEditable || ae.closest('[contenteditable="true"]'))) return;
        // Skip if inline editing is active
        if (typeof InlineEditor !== 'undefined' && InlineEditor.isActive()) return;

        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (typeof LayerPanel !== 'undefined' && LayerPanel.isLocked(selected)) {
                showToast('Block is locked', 'info');
                return;
            }
            State.removeBlock(selected);
        }
        if (e.key === 'ArrowUp' && !e.shiftKey) {
            e.preventDefault();
            State.moveBlock(selected, 'up');
        }
        if (e.key === 'ArrowDown' && !e.shiftKey) {
            e.preventDefault();
            State.moveBlock(selected, 'down');
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            State.duplicateBlock(selected);
            showToast('Block duplicated', 'success');
        }
        // Copy block (Ctrl+C)
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && !e.shiftKey) {
            e.preventDefault();
            if (typeof Clipboard !== 'undefined' && Clipboard.copyBlock(selected)) {
                showToast('✅ Block copied! Switch pages and press Ctrl+V to paste.', 'success');
                // Show floating paste hint
                if (typeof Canvas !== 'undefined' && Canvas._showPasteHint) {
                    Canvas._showPasteHint();
                }
            }
        }

        // Copy style only (Ctrl+Shift+C)
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && e.shiftKey) {
            e.preventDefault();
            if (typeof Clipboard !== 'undefined' && Clipboard.copyStyle(selected)) {
                showToast('Style copied', 'info');
            }
        }
        // Paste (Ctrl+V)
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
            e.preventDefault();
            if (typeof Clipboard !== 'undefined' && Clipboard.hasContent()) {
                if (Clipboard.isStyleCopy()) {
                    Clipboard.pasteStyle(selected);
                    showToast('Style pasted', 'success');
                } else {
                    // Paste as sibling of selected block (or at root if nothing selected)
                    const block = selected ? State.getBlock(selected) : null;
                    Clipboard.pasteBlock(block ? block.parentId : null);
                    showToast('✅ Block pasted!', 'success');
                    // Dismiss paste hint
                    if (typeof Canvas !== 'undefined' && Canvas._hidePasteHint) Canvas._hidePasteHint();
                }
            }
        }


    });

    // Global Shortcuts

    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
        if (typeof InlineEditor !== 'undefined' && InlineEditor.isActive()) return;
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
            e.preventDefault();
            if (State.undo()) showToast('Undo', 'info');
        }
        if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
            e.preventDefault();
            if (State.redo()) showToast('Redo', 'info');
        }
    });

    // ====== PREVIEW MODAL RESIZE ======
    const previewResizer = document.getElementById('previewResizer');
    const previewFrame = document.getElementById('previewFrame');
    const previewSizeDisplay = document.getElementById('previewSizeDisplay');
    const previewDeviceBtns = document.querySelectorAll('.preview-dev-btn');
    const previewModalBody = previewFrame?.parentElement;
    let isResizing = false;

    function updatePreviewSizeDisplay(width) {
        if (!previewSizeDisplay) return;
        const w = (width === '100%' || width === '100vw') ? window.innerWidth + 'px' : width;
        previewSizeDisplay.textContent = w;
    }

    previewDeviceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const w = btn.dataset.width;
            previewFrame.style.width = w;
            previewFrame.style.maxWidth = '100%';
            previewFrame.style.margin = 'auto';
            previewFrame.style.display = 'block';
            previewDeviceBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updatePreviewSizeDisplay(w);
        });
    });

    if (previewResizer) {
        previewResizer.addEventListener('mousedown', () => { isResizing = true; document.body.style.cursor = 'ew-resize'; });
        window.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const rect = previewModalBody.getBoundingClientRect();
            let newWidth = e.clientX - rect.left;
            if (newWidth > 320 && newWidth <= rect.width) {
                previewFrame.style.width = newWidth + 'px';
                updatePreviewSizeDisplay(newWidth + 'px');
                previewDeviceBtns.forEach(b => b.classList.remove('active'));
            }
        });
        window.addEventListener('mouseup', () => { isResizing = false; document.body.style.cursor = ''; });
    }
    // Stop other videos when one starts
    window.stopOtherMedia = (current) => {
        const allowsMultiple = (node) => {
            if (!node || typeof node.getAttribute !== 'function') return false;
            return node.getAttribute('data-allow-multiple') === 'true';
        };
        const forceStopIframe = (iframe) => {
            if (!iframe || allowsMultiple(iframe)) return;
            try {
                const src = iframe.getAttribute('src');
                if (!src) return;
                iframe.setAttribute('src', src);
            } catch (err) {}
        };
        if (allowsMultiple(current)) return;
        // 1. Native media
        const players = document.querySelectorAll('video, audio');
        players.forEach(p => {
            if (p !== current && !allowsMultiple(p)) p.pause();
        });
        
        // 2. Generic Iframes (YT, Vimeo, Drive)
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            if (iframe !== current && iframe.contentWindow !== current && !allowsMultiple(iframe)) {
                try {
                    // Try YouTube stop signal
                    if (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be')) {
                        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                    }
                    // Try Vimeo stop signal
                    if (iframe.src.includes('vimeo.com')) {
                        iframe.contentWindow.postMessage('{"method":"pause"}', '*');
                    }
                } catch(err) {}
                // Fallback: force-reset embed source so stubborn players stop.
                if (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be') || iframe.src.includes('vimeo.com')) {
                    setTimeout(() => forceStopIframe(iframe), 120);
                }
            }
        });

        // 3. Forced reset for non-API iframes (Google Drive, etc.)
        document.querySelectorAll('[data-active-video="true"]').forEach(function(c){
            if (c !== current && c.contentWindow !== current && !allowsMultiple(c)) {
                if (c.getAttribute('data-original-html')) {
                    c.innerHTML = c.getAttribute('data-original-html');
                    c.removeAttribute('data-active-video');
                }
            }
        });
    };
    document.addEventListener('play', (e) => {
        if (e.target?.getAttribute?.('data-allow-multiple') === 'true') return;
        window.stopOtherMedia(e.target);
    }, true);

    window.addEventListener('message', (e) => {
        try {
            let data = e.data;
            if (typeof data === 'string') {
                if (data.includes('onStateChange') || data.includes('"event":"play"')) {
                    data = JSON.parse(data);
                } else { return; }
            }
            const sourceFrame = Array.from(document.querySelectorAll('iframe')).find((iframe) => iframe.contentWindow === e.source);
            if (sourceFrame?.getAttribute?.('data-allow-multiple') === 'true') return;
            if (data.event === 'onStateChange' && (data.info === 1 || data.info === '1')) {
                window.stopOtherMedia(sourceFrame || e.source);
            }
            if (data.event === 'play' || (data.method === 'onEvent' && data.event === 'play')) {
                window.stopOtherMedia(sourceFrame || e.source);
            }
        } catch(err) {}
    });

    // ---- Final Initialization ----
    renderLayers();
    initThemes();
    Canvas.renderAll();

    // ---- Architecture Initialization ----
    // Sync legacy BlockTypes into the registry
    if (typeof BlockRegistry !== 'undefined') {
        BlockRegistry.syncFromBlockTypes();
    }

    // Initialize enhanced layer panel
    if (typeof LayerPanel !== 'undefined') {
        LayerPanel.init();
    }

    // Initialize inline text editing
    if (typeof InlineEditor !== 'undefined') {
        InlineEditor.init();
    }

    // Enable dev assertions in debug mode
    if (window.SOCOX_DEBUG && typeof DevAssertions !== 'undefined') {
        DevAssertions.enable();
        // Run initial integrity check
        const result = DevAssertions.checkStateIntegrity();
        if (!result.ok) {
            console.warn('[Init] State integrity issues:', result.issues);
        }
    }
});
