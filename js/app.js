// ============================================================
// app.js – Main application entry point
// Wires all modules together and handles UI events
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ---- Initialize modules ----
    Palette.init();
    Canvas.init();
    Canvas.initContextMenu();
    Properties.init();
    renderLayers();
    initThemes();

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

    // ---- Layers Panel ----
    function renderLayers() {
        const list = document.getElementById('layersList');
        if (!list) return;
        list.innerHTML = '';

        function renderItem(block, depth = 0) {
            const item = document.createElement('div');
            item.className = 'layer-item' + (State.getSelectedId() === block.id ? ' selected' : '');
            
            // Indent
            for (let i = 0; i < depth; i++) {
                const indent = document.createElement('div');
                indent.className = 'layer-indent';
                item.appendChild(indent);
            }

            const icon = document.createElement('i');
            const def = BlockTypes[block.type];
            icon.className = def ? def.icon : 'fa-solid fa-cube';
            item.appendChild(icon);

            const label = document.createElement('span');
            label.textContent = def ? def.label : block.type;
            item.appendChild(label);

            item.addEventListener('click', () => State.setSelected(block.id));
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
    }

    State.on('blocksChanged', renderLayers);
    State.on('selectionChanged', renderLayers);

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
                card.addEventListener('click', () => {
                    Themes.apply(theme.id);
                    showToast('🎨 Theme applied: ' + theme.name, 'success');
                });
                grid.appendChild(card);
            });
        });

        document.getElementById('themeBtn').addEventListener('click', () => openModal('themeModal'));
        document.getElementById('clearThemeBtn').addEventListener('click', () => {
            Themes.clear();
            showToast('Theme cleared', 'info');
        });

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
        }
    });

    // ---- Preview ----
    document.getElementById('previewBtn').addEventListener('click', () => {
        try {
            const html = Exporter.getPreviewHTML();
            const frame = document.getElementById('previewFrame');
            if (frame) {
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
    document.getElementById('clearSelectedBtn').addEventListener('click', () => {
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
        if (confirm('Are you sure you want to clear the entire canvas? This cannot be undone (except via Undo).')) {
            State.clearProject();
            showToast('🧹 Canvas cleared', 'success');
        }
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
                State.importBlocks(data.blocks, data.meta, data.pages);
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
                        State.importBlocks(data.blocks, data.meta, data.pages);
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
                    State.importBlocks(data.blocks, data.meta, data.pages);
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
});
