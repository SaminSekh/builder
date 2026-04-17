// ============================================================
// app.js – Main application entry point
// Wires all modules together and handles UI events
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

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
    function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

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
        btn.addEventListener('click', () => closeModal(btn.dataset.modal));
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.add('hidden');
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
            robots: document.getElementById('meta-robots').value
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

                doc.addEventListener('click', (e) => {
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

                    const normalizedHref = rawHref.split('#')[0].split('?')[0];
                    const targetPage = (State.getPages?.() || []).find((page) => page?.filename === normalizedHref);
                    if (!targetPage) return;

                    e.preventDefault();
                    e.stopPropagation();

                    frame.srcdoc = Exporter.getPreviewHTML(targetPage.id);
                }, true);
            } catch (err) {
                console.warn('Preview navigation wiring failed', err);
            }
        };
    }

    document.getElementById('previewBtn').addEventListener('click', () => {
        try {
            const html = Exporter.getPreviewHTML();
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
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

        if (e.key === 'Delete' || e.key === 'Backspace') {
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
    });

    // Global Shortcuts
    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
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
});
