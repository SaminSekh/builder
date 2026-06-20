// ============================================================
// canvas.js – Canvas rendering and drag-and-drop handling
// ============================================================

const Canvas = (() => {
    let dropIndex = null;
    let draggedBlockId = null;
    let draggedSubElement = null;
    let activeSubDrag = null;
    let activeSubDropTarget = null;
    let isInitialized = false;
    const floatingBlockActions = {};
    const floatingPenTools = {};

    function isVoidElement(el) {
        if (!el || !el.tagName) return true;
        return ['AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'].includes(el.tagName.toUpperCase());
    }

    function canHostSubElements(el) {
        if (!el || isVoidElement(el)) return false;
        return true;
    }

    function canHostBlocks(el) {
        if (!el || !el.tagName) return false;
        return ['DIV', 'SECTION', 'NAV', 'HEADER', 'FOOTER', 'MAIN', 'ARTICLE', 'ASIDE', 'FORM', 'UL', 'OL', 'LI', 'FIGURE'].includes(el.tagName.toUpperCase());
    }

    function isRootOnlyBlockType(type) {
        const def = type && BlockTypes[type];
        if (!def) return false;
        return def.category === 'Sections' || type === 'navbar' || type === 'footer';
    }

    function isDescendantBlock(blockId, potentialParentId) {
        if (!blockId || !potentialParentId) return false;
        if (blockId === potentialParentId) return true;
        let current = State.getBlock(potentialParentId);
        while (current) {
            if (current.parentId === blockId) return true;
            current = current.parentId ? State.getBlock(current.parentId) : null;
        }
        return false;
    }

    function getBlockChildHost(content) {
        if (!content) return null;
        const explicit = content.querySelector('.container-inner');
        if (explicit) return explicit;
        const root = content.firstElementChild;
        if (canHostBlocks(root)) return root;
        return null;
    }

    function resolveDraggedBlockData(rawPayload) {
        if (!rawPayload) return null;
        const resolved = typeof Palette !== 'undefined' && Palette.resolvePayload
            ? Palette.resolvePayload(rawPayload)
            : (BlockTypes[rawPayload] ? { type: rawPayload, variantId: null } : null);
        if (!resolved || !resolved.type || !BlockTypes[resolved.type]) return null;

        if (typeof Palette !== 'undefined' && Palette.buildBlockFromVariant) {
            return Palette.buildBlockFromVariant(resolved.type, resolved.variantId);
        }

        return {
            type: resolved.type,
            props: JSON.parse(JSON.stringify(BlockTypes[resolved.type].defaultProps))
        };
    }

    function init() {
        if (isInitialized) return;
        isInitialized = true;
        const canvas = document.getElementById('canvas');
        const canvasFrame = document.getElementById('canvasFrame');
        const canvasWrapper = document.getElementById('canvasWrapper');

        const handleInternalPageNavigation = (eventTarget) => {
            const linkEl = eventTarget?.closest?.('a[href]');
            if (!linkEl) return false;
            const rawHref = (linkEl.getAttribute('href') || '').trim();
            if (!rawHref || rawHref.startsWith('#') || /^[a-z]+:/i.test(rawHref) || rawHref.startsWith('//')) return false;

            const getBasename = (p) => {
                if (!p) return '';
                const clean = p.split('#')[0].split('?')[0];
                return clean.substring(clean.lastIndexOf('/') + 1);
            };
            const targetBasename = getBasename(rawHref);
            const targetPage = (State.getPages?.() || []).find((page) => getBasename(page?.filename) === targetBasename);
            if (!targetPage) return false;

            State.switchPage(targetPage.id);
            return true;
        };

        const handleInternalHashNavigation = (eventTarget) => {
            const linkEl = eventTarget?.closest?.('a[href]');
            if (!linkEl) return false;
            const rawHref = (linkEl.getAttribute('href') || '').trim();
            if (!rawHref.startsWith('#') || rawHref.length < 2) return false;

            const targetId = rawHref.slice(1);
            const targetEl = canvas.querySelector(`#${CSS.escape(targetId)}`);
            if (!targetEl) return false;

            const wrapperRect = canvasWrapper.getBoundingClientRect();
            const targetRect = targetEl.getBoundingClientRect();
            const nextTop = canvasWrapper.scrollTop + (targetRect.top - wrapperRect.top) - 24;
            canvasWrapper.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
            return true;
        };

        const handleRootDragOver = (e) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = draggedBlockId ? 'move' : 'copy';
            canvas.classList.add('drag-over');
            const afterEl = getDragAfterElement(canvas, e.clientX, e.clientY);
            dropIndex = afterEl ? getBlockIndexFromEl(afterEl) : null;
        };

        const handleRootDragLeave = (e) => {
            if (!canvas.contains(e.relatedTarget)) {
                canvas.classList.remove('drag-over');
            }
        };

        const handleRootDrop = (e) => {
            if (e.__sfHandledRootDrop) return;
            e.__sfHandledRootDrop = true;
            e.preventDefault();
            e.stopPropagation();
            canvas.classList.remove('drag-over');

            if (draggedBlockId) {
                // Re-parenting existing block to root
                State.updateBlockParent(draggedBlockId, null, dropIndex);
                State.setSelected(draggedBlockId);
                return;
            }

            const blockData = resolveDraggedBlockData(e.dataTransfer.getData('text/plain'));
            if (!blockData) return;
            const id = State.addBlock(blockData, dropIndex);
            if (typeof Palette !== 'undefined' && typeof Palette.finalizeAddedBlock === 'function') {
                Palette.finalizeAddedBlock(id, blockData);
            }
            State.setSelected(id);
        };

        [canvasWrapper, canvasFrame, canvas].forEach((rootTarget) => {
            if (!rootTarget) return;
            rootTarget.addEventListener('dragover', handleRootDragOver);
            rootTarget.addEventListener('dragleave', handleRootDragLeave);
            rootTarget.addEventListener('drop', handleRootDrop);
        });

        // Hide pen tool on click away
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.sf-pen-tool') && !e.target.closest('.block-content')) {
                hidePenTool();
            }
        });


        // ---- Click off to deselect ----
        canvas.addEventListener('click', (e) => {
            if (e.target === canvas) {
                State.setSelected(null);
            }
        });
        canvasWrapper.addEventListener('click', (e) => {
            if (e.target === canvasWrapper) {
                State.setSelected(null);
            }
        });

        // Ctrl+Click to open links in new tab (editor mode)
        canvas.addEventListener('click', (e) => {
            if (e.ctrlKey || e.metaKey) {
                const anchor = e.target.closest('a[href]');
                if (anchor && anchor.href) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(anchor.href, '_blank');
                    return;
                }
            }
            if (handleInternalPageNavigation(e.target)) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        canvas.addEventListener('click', (e) => {
            if (handleInternalHashNavigation(e.target)) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        // ---- Block default actions during structure view ----
        canvas.addEventListener('click', (e) => {
            if (document.body.classList.contains('structure-view') && e.target.closest('.block-content')) {
                const interactive = e.target.closest('a, button, input, textarea, select, label, form, iframe, video, audio, img, [onclick]');
                if (interactive) {
                    const blockContent = interactive.closest('.block-content');
                    const handled = blockContent && typeof blockContent._sfSelectStructureTarget === 'function'
                        ? blockContent._sfSelectStructureTarget(e)
                        : false;
                    if (!handled) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            }
        }, true);

        // ---- State listeners (via RenderScheduler) ----
        RenderScheduler.setCallbacks(renderAll, renderBlock, updateSelection);

        State.on('blocksChanged', () => RenderScheduler.scheduleFullRender('blocksChanged'));
        State.on('blockUpdated', (id) => RenderScheduler.scheduleBlockRender(id, 'blockUpdated'));
        State.on('selectionChanged', (id) => RenderScheduler.scheduleSelectionUpdate(id));
        State.on('subSelectionChanged', (path) => {
            if (!path || !document.body.classList.contains('structure-view')) {
                hidePenTool();
                return;
            }
            const blockId = State.getSelectedId();
            const blockEl = document.getElementById('block_' + blockId);
            if (blockEl) {
                const target = blockEl.querySelector(`[data-sf-path="${path}"]`);
                if (target) showPenTool(target, blockId, path);
            }
        });
        State.on('deviceChanged', (d) => {
            const frame = document.getElementById('canvasFrame');
            frame.classList.remove('tablet', 'mobile');
            if (d === 'tablet') frame.classList.add('tablet');
            if (d === 'mobile') frame.classList.add('mobile');
        });

        // ---- CENTRALIZED SELECTION SYSTEM ----
        // Single pointerdown on canvas root. Resolves deepest block from event.target.
        // No per-block listeners needed. State is the single source of truth.
        canvas.addEventListener('pointerdown', (e) => {
            // Skip ALL UI chrome — check the target and its ancestors
            if (e.target.closest('.block-actions') || 
                e.target.closest('.block-toolbar') || 
                e.target.closest('.resize-handle-v') || 
                e.target.closest('.resize-handle-h') || 
                e.target.closest('.resize-handle-both') || 
                e.target.closest('.sf-pen-tool-container') || 
                e.target.closest('.sf-sub-resize-handle') ||
                e.target.classList.contains('block-action-btn') ||
                e.target.closest('.block-action-btn')) {
                return;
            }
            // Skip if inline editing
            if (typeof InlineEditor !== 'undefined' && InlineEditor.isActive()) return;
            
            // Resolve the DEEPEST .canvas-block from the click target
            const deepestBlock = e.target.closest('.canvas-block');
            if (!deepestBlock) return;
            
            const blockId = deepestBlock.dataset.id;
            if (!blockId) return;
            
            // Verify block exists in state (not stale DOM)
            if (!State.getBlock(blockId)) return;
            
            State.setSelected(blockId);
        }, false);

        // ============================================================
        // SYSTEM 1: "block-actions" = CONTEXTUAL BLOCK TOOLBAR
        // Target: THE BLOCK IT BELONGS TO (its own wrapper)
        // Resolution: actionBtn.closest('.canvas-block').dataset.id
        // This toolbar is rendered INSIDE each .canvas-block wrapper.
        // It controls THAT block — move, duplicate, delete.
        // ============================================================
        document.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.block-action-btn');
            if (!actionBtn) return;
            if (actionBtn.classList.contains('bubble-trigger')) return;
            if (actionBtn.classList.contains('toolbar-move-handle')) return;
            if (actionBtn.classList.contains('drag-handle')) return;
            
            // Must be inside .block-actions (not pen tool)
            if (!e.target.closest('.block-actions')) return;
            
            e.stopPropagation();
            
            // Target: the block wrapper that CONTAINS this toolbar
            const blockEl = actionBtn.closest('.canvas-block');
            if (!blockEl) return;
            const blockId = blockEl.dataset.id;
            if (!blockId) return;
            
            // Validate in state
            const block = State.getBlock(blockId);
            if (!block) return;

            if (actionBtn.classList.contains('move-up')) {
                State.moveBlock(blockId, 'up');
            } else if (actionBtn.classList.contains('move-down')) {
                State.moveBlock(blockId, 'down');
            } else if (actionBtn.classList.contains('copy-btn')) {
                if (typeof Clipboard !== 'undefined' && Clipboard.copyBlock(blockId)) {
                    showToast('✅ Block copied! Switch to any page and press Ctrl+V to paste.', 'success');
                    _showPasteHint();
                }
            } else if (actionBtn.classList.contains('dup-btn')) {
                State.duplicateBlock(blockId);
                showToast('Duplicated', 'success');
            } else if (actionBtn.classList.contains('del-btn')) {
                State.removeBlock(blockId);
                showToast('Deleted', 'success');
            }
        });
    }

    // ---- Paste Hint Floating Button ----
    let _pasteHintEl = null;
    function _showPasteHint() {
        if (_pasteHintEl) return; // Already showing
        _pasteHintEl = document.createElement('div');
        _pasteHintEl.id = 'sf-paste-hint';
        _pasteHintEl.style.cssText = `
            position: fixed;
            bottom: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #6c63ff, #4f46e5);
            color: #fff;
            padding: 10px 20px;
            border-radius: 999px;
            font-family: 'Inter', sans-serif;
            font-size: 0.82rem;
            font-weight: 600;
            box-shadow: 0 6px 24px rgba(108,99,255,0.45);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            cursor: pointer;
            border: 1px solid rgba(255,255,255,0.2);
            backdrop-filter: blur(8px);
            animation: sf-paste-hint-in 0.3s cubic-bezier(0.175,0.885,0.32,1.275) both;
        `;
        _pasteHintEl.innerHTML = `
            <i class="fa-solid fa-clipboard-check" style="font-size:1rem;"></i>
            <span>Block copied — click to paste on this page</span>
            <span style="opacity:0.6;font-size:0.75rem;">or Ctrl+V</span>
            <button style="margin-left:6px;background:rgba(255,255,255,0.15);border:none;color:#fff;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:0.9rem;display:flex;align-items:center;justify-content:center;padding:0;" title="Dismiss">×</button>
        `;
        // Inject animation keyframes once
        if (!document.getElementById('sf-paste-hint-style')) {
            const style = document.createElement('style');
            style.id = 'sf-paste-hint-style';
            style.textContent = `
                @keyframes sf-paste-hint-in {
                    from { opacity: 0; transform: translateX(-50%) translateY(16px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
        document.body.appendChild(_pasteHintEl);

        // Click the hint itself = paste
        _pasteHintEl.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                // Dismiss button
                _hidePasteHint();
                return;
            }
            if (typeof Clipboard !== 'undefined' && Clipboard.hasContent() && !Clipboard.isStyleCopy()) {
                const block = State.getSelectedId() ? State.getBlock(State.getSelectedId()) : null;
                Clipboard.pasteBlock(block ? block.parentId : null);
                showToast('✅ Block pasted!', 'success');
                _hidePasteHint();
            }
        });

        // Auto-dismiss after 8 seconds
        setTimeout(_hidePasteHint, 8000);
    }

    function _hidePasteHint() {
        if (_pasteHintEl) {
            _pasteHintEl.remove();
            _pasteHintEl = null;
        }
    }

    // Re-show paste hint whenever page switches and clipboard has content
    if (typeof State !== 'undefined') {
        State.on('pagesChanged', () => {
            _hidePasteHint();
            if (typeof Clipboard !== 'undefined' && Clipboard.hasContent() && !Clipboard.isStyleCopy()) {
                setTimeout(_showPasteHint, 200);
            }
        });
    }

    function getDragAfterElement(container, x, y, selector = '.canvas-block') {

        const elements = [...container.querySelectorAll(`:scope > ${selector}:not(.dragging):not(.sf-sub-dragging)`)];

        return elements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const centerX = box.left + box.width / 2;
            const centerY = box.top + box.height / 2;

            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If we are to the left or above the center, we are "before" this element
            // But we actually want the element that is CLOSEST to us among those we are "before"
            // Wait, for reordering, it's better to find the closest element and check if we are on its left/right (or top/bottom)

            if (distance < closest.offset) {
                return { offset: distance, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.POSITIVE_INFINITY }).element;
    }

    function getBlockIndexFromEl(el) {
        const canvas = document.getElementById('canvas');
        const blocks = [...canvas.querySelectorAll('.canvas-block')];
        return blocks.indexOf(el);
    }

    function applyBlockActionsPosition(blockId, actionsEl) {
        const pos = floatingBlockActions[blockId];
        if (!actionsEl) return;
        if (pos && Number.isFinite(pos.left) && Number.isFinite(pos.top)) {
            actionsEl.classList.add('floating');
            actionsEl.style.left = pos.left + 'px';
            actionsEl.style.top = pos.top + 'px';
            actionsEl.style.right = 'auto';
        } else {
            actionsEl.classList.remove('floating');
            actionsEl.style.left = '';
            actionsEl.style.top = '';
            actionsEl.style.right = '';
        }
    }

    function clampFloatingPosition(left, top, el, pad = 10) {
        const width = el?.offsetWidth || 180;
        const height = el?.offsetHeight || 48;
        return {
            left: Math.min(window.innerWidth - width - pad, Math.max(pad, left)),
            top: Math.min(window.innerHeight - height - pad, Math.max(pad, top))
        };
    }

    function startFloatingToolbarDrag(startEvent, toolbarEl, getCurrentPosition, onCommit) {
        startEvent.preventDefault();
        startEvent.stopPropagation();
        const startLeft = parseFloat(getCurrentPosition().left) || 0;
        const startTop = parseFloat(getCurrentPosition().top) || 0;
        const originX = startEvent.clientX;
        const originY = startEvent.clientY;

        const onMove = (moveEvent) => {
            const next = clampFloatingPosition(
                startLeft + (moveEvent.clientX - originX),
                startTop + (moveEvent.clientY - originY),
                toolbarEl
            );
            toolbarEl.classList.add('floating');
            toolbarEl.style.left = next.left + 'px';
            toolbarEl.style.top = next.top + 'px';
            toolbarEl.style.right = 'auto';
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            onCommit({
                left: parseFloat(toolbarEl.style.left) || startLeft,
                top: parseFloat(toolbarEl.style.top) || startTop
            });
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }

    /**
     * Resolves asset paths (assets/img/...) to data URLs for canvas rendering.
     * This allows blocks to store clean paths while displaying actual images.
     */
    function resolveAssetPaths(el) {
        if (!el || typeof AssetManager === 'undefined' || typeof AssetManager.resolve !== 'function') return;
        
        // Resolve img src attributes
        el.querySelectorAll('img[src]').forEach(img => {
            const src = img.getAttribute('src');
            if (src && src.startsWith('assets/')) {
                const resolved = AssetManager.resolve(src);
                if (resolved !== src) img.src = resolved;
            }
        });
        
        // Resolve background-image in inline styles
        el.querySelectorAll('[style*="assets/img/"]').forEach(node => {
            const style = node.getAttribute('style');
            if (style) {
                const updated = style.replace(/url\((['"]?)(assets\/img\/[^)'"]+)\1\)/g, (match, quote, path) => {
                    const resolved = AssetManager.resolve(path);
                    return `url(${quote}${resolved}${quote})`;
                });
                if (updated !== style) node.setAttribute('style', updated);
            }
        });
    }

    function executeBlockScripts(el) {
        if (!el) return;
        // Resolve asset paths to data URLs for canvas display
        resolveAssetPaths(el);
        const scripts = el.querySelectorAll('script');
        scripts.forEach(oldScript => {
            // Security: Only execute scripts that originate from known builder blocks.
            // Skip any script that contains suspicious patterns (imported/pasted HTML).
            const content = oldScript.textContent || '';
            
            // Allow only scripts that configure known builder systems (Cart, APK modal, etc.)
            const isSafeBuilderScript = 
                content.includes('Cart.setConfig') ||
                content.includes('_sfShowApkInfo') ||
                content.includes('_sfTriggerInstall');
            
            if (!isSafeBuilderScript) return;
            
            // Deduplicate: don't re-execute if an equivalent script is already active
            const fingerprint = content.trim().substring(0, 80);
            const existing = document.querySelector(`script[data-sf-fingerprint="${CSS.escape(fingerprint)}"]`);
            if (existing) return;
            
            const newScript = document.createElement('script');
            newScript.textContent = content;
            newScript.dataset.sfFingerprint = fingerprint;
            document.body.appendChild(newScript);
        });
    }

    function renderAll() {
        State.sanitize();
        const canvas = document.getElementById('canvas');
        const rootBlocks = State.getBlocks(null); // Get blocks with no parent

        // --- Empty state ---
        if (State.getAllBlocks().length === 0) {
            canvas.innerHTML = '';
            const empty = document.createElement('div');
            empty.id = 'canvas-empty-state';
            empty.innerHTML = `<i class="fa-solid fa-hand-pointer fa-2xl"></i><p>Drag components from the left panel<br/>and drop them here to start building.</p>`;
            canvas.appendChild(empty);
            return;
        }

        // --- Incremental Reconciliation ---
        // Remove empty state if present
        const emptyState = canvas.querySelector('#canvas-empty-state');
        if (emptyState) emptyState.remove();

        // Build a map of existing DOM block elements
        const existingEls = new Map();
        canvas.querySelectorAll(':scope > .canvas-block').forEach(el => {
            existingEls.set(el.dataset.id, el);
        });

        // Reconcile: ensure DOM matches state order
        const desiredIds = rootBlocks.map(b => b.id);
        const desiredSet = new Set(desiredIds);

        // Remove blocks no longer in state
        existingEls.forEach((el, id) => {
            if (!desiredSet.has(id)) {
                el.remove();
                existingEls.delete(id);
            }
        });

        // Insert/reorder blocks to match desired order
        let prevEl = null;
        for (let i = 0; i < rootBlocks.length; i++) {
            const block = rootBlocks[i];
            let el = existingEls.get(block.id);

            if (!el) {
                // New block — create and insert
                try {
                    el = createBlockEl(block);
                    executeBlockScripts(el);
                } catch (e) {
                    console.error(`Error rendering block ${block.id}:`, e);
                    continue;
                }
                if (prevEl) {
                    prevEl.after(el);
                } else {
                    canvas.prepend(el);
                }
            } else {
                // Existing block — ensure correct position
                const currentPrev = el.previousElementSibling;
                const shouldBeAfter = prevEl;
                if (currentPrev !== shouldBeAfter) {
                    if (shouldBeAfter) {
                        shouldBeAfter.after(el);
                    } else {
                        canvas.prepend(el);
                    }
                }
                // Re-render content (block data may have changed)
                _rerenderBlockContent(el, block);
            }
            prevEl = el;
        }

        // Re-establish selection outline
        updateSelection(State.getSelectedId());
    }

    /**
     * Re-renders the content of an existing block element without destroying the wrapper.
     * Preserves the wrapper's position in the DOM tree.
     */
    function _rerenderBlockContent(wrapperEl, block) {
        const def = BlockTypes[block.type];
        if (!def) return;

        const content = wrapperEl.querySelector('.block-content');
        if (!content) return;

        // Re-render HTML content
        // Deep clone props before passing to render to prevent mutation of state
        const renderProps = JSON.parse(JSON.stringify(block.props));
        let newHtml = def.render(renderProps);
        
        // Inject hover attributes into the first element
        if (typeof BlockTypes !== 'undefined' && BlockTypes.applyHover) {
            const hoverAttrs = BlockTypes.applyHover(block.props);
            if (hoverAttrs) {
                newHtml = newHtml.replace(/^(\s*<\w+)/, `$1 ${hoverAttrs}`);
            }
        }

        // Inject background blur style for blocks that have bgBlur + bgImage
        if (block.props.bgImage && block.props.bgBlur && parseInt(block.props.bgBlur) > 0 && typeof generateBgBlurStyle === 'function') {
            const firstEl = newHtml.match(/id="([^"]+)"/);
            const elId = firstEl ? firstEl[1] : ('blk_' + block.id);
            if (!newHtml.includes('::before')) {
                newHtml = generateBgBlurStyle(elId, block.props) + newHtml;
            }
        }
        
        content.innerHTML = newHtml;

        // Re-apply first child width and animation attributes
        const firstChild = content.firstElementChild;
        if (firstChild) {
            firstChild.style.width = '100%';
            if (block.props.animationPreset && block.props.animationPreset !== 'none' && (block.props.animationTrigger || 'load') === 'scroll') {
                firstChild.dataset.sfAnim = block.props.animationPreset;
                firstChild.dataset.sfAnimDuration = block.props.animationDuration || '0.8';
                firstChild.dataset.sfAnimDelay = block.props.animationDelay || '0';
            }
        }

        // Re-apply layout styles to wrapper
        const p = block.props;
        wrapperEl.style.width = p.width || '100%';
        wrapperEl.style.height = 'auto';
        wrapperEl.style.margin = p.margin || '0';

        // Re-apply sub-element paths and styles
        assignPathsAndStyles(content, block);

        // Re-render nested child blocks
        const inner = getBlockChildHost(content);
        if (inner) {
            const hint = inner.querySelector('.sf-drop-hint');
            const children = State.getBlocks(block.id);
            if (children.length > 0) {
                if (hint) hint.style.display = 'none';
                children.forEach(child => {
                    try {
                        inner.appendChild(createBlockEl(child));
                    } catch (e) {
                        console.error(`Error rendering child block ${child.id}:`, e);
                    }
                });
            } else {
                if (hint) hint.style.display = 'flex';
            }
            // Re-attach drop zone listeners for the inner container
            _attachInnerDropZone(inner, block);
        }

        executeBlockScripts(wrapperEl);
    }

    /**
     * Attaches drag-drop listeners to an inner container (for nested blocks).
     * Extracted to avoid duplication.
     */
    function _attachInnerDropZone(inner, block) {
        inner.style.pointerEvents = 'auto';
        inner.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            inner.style.background = 'rgba(108, 99, 255, 0.05)';
            inner.style.border = '2px dashed var(--accent)';
        });
        inner.addEventListener('dragleave', () => {
            inner.style.background = '';
            inner.style.border = '';
        });
        inner.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            inner.style.background = '';
            inner.style.border = '';

            const afterEl = getDragAfterElement(inner, e.clientX, e.clientY);
            const siblings = State.getBlocks(block.id);
            let index = siblings.length;
            if (afterEl) {
                const childId = afterEl.dataset.id;
                index = siblings.findIndex(c => c.id === childId);
            }

            const rawPayload = e.dataTransfer.getData('text/plain');
            const blockData = resolveDraggedBlockData(rawPayload);
            const type = blockData?.type || (draggedBlockId ? State.getBlock(draggedBlockId)?.type : null);
            if (!type || !BlockTypes[type]) return;

            if (isRootOnlyBlockType(type)) {
                const targetDef = BlockTypes[type];
                showToast(`ℹ️ ${targetDef.label} must be at the root level (not nested).`, 'info');
                return;
            }

            if (draggedBlockId && isDescendantBlock(draggedBlockId, block.id)) {
                showToast('You cannot drop a block into one of its own child areas.', 'info');
                return;
            }

            if (draggedBlockId) {
                State.updateBlockParent(draggedBlockId, block.id, index);
                State.setSelected(draggedBlockId);
                return;
            }

            const id = State.addBlock({
                ...(blockData || { type, props: JSON.parse(JSON.stringify(BlockTypes[type].defaultProps)) }),
                parentId: block.id
            }, index);
            if (typeof Palette !== 'undefined' && typeof Palette.finalizeAddedBlock === 'function') {
                Palette.finalizeAddedBlock(id, blockData);
            }
            State.setSelected(id);
        });
    }

    function renderBlock(id) {
        const el = document.getElementById('block_' + id);
        if (!el) { 
            // Block not in DOM — need full render
            RenderScheduler.scheduleFullRender('blockNotInDOM');
            return; 
        }
        const block = State.getBlock(id);
        if (!block) return;

        // Preserve focus state
        const activeEl = document.activeElement;
        const hadFocus = el.contains(activeEl);
        const focusSelector = hadFocus ? _getFocusSelector(activeEl, el) : null;

        // Re-render content in place
        _rerenderBlockContent(el, block);

        // Restore selection class
        if (State.getSelectedId() === id) el.classList.add('selected');

        // Restore focus if it was inside this block
        if (focusSelector) {
            requestAnimationFrame(() => {
                const target = el.querySelector(focusSelector);
                if (target && target.focus) target.focus();
            });
        }
    }

    /**
     * Get a CSS selector that can re-find the focused element after re-render.
     */
    function _getFocusSelector(focusedEl, container) {
        if (!focusedEl || focusedEl === container) return null;
        // Try by ID
        if (focusedEl.id) return '#' + CSS.escape(focusedEl.id);
        // Try by data-sf-path
        const path = focusedEl.getAttribute('data-sf-path');
        if (path) return `[data-sf-path="${CSS.escape(path)}"]`;
        // Try by tag + nth-of-type within container
        const tag = focusedEl.tagName?.toLowerCase();
        if (tag) {
            const siblings = container.querySelectorAll(tag);
            const idx = Array.from(siblings).indexOf(focusedEl);
            if (idx >= 0) return `${tag}:nth-of-type(${idx + 1})`;
        }
        return null;
    }

    function createBlockEl(block) {
        const def = BlockTypes[block.type];
        if (!def) return document.createElement('div');

        const wrapper = document.createElement('div');
        wrapper.className = 'canvas-block';
        wrapper.id = 'block_' + block.id;
        wrapper.dataset.id = block.id;
        wrapper.dataset.type = block.type;

        // Block toolbar label
        const toolbar = document.createElement('div');
        toolbar.className = 'block-toolbar';
        toolbar.innerHTML = `<i class="${def.icon}" style="margin-right:4px;"></i>${def.label}`;

        // Block action buttons
        const actions = document.createElement('div');
        actions.className = 'block-actions';
        actions.innerHTML = `
      <button class="block-action-btn bubble-trigger" title="Toggle actions" data-id="${block.id}"><i class="fa-solid fa-ellipsis-vertical"></i></button>
      <button class="block-action-btn toolbar-move-handle" title="Move this toolbar" data-id="${block.id}"><i class="fa-solid fa-up-down-left-right"></i></button>
      <button class="block-action-btn drag-handle" title="Drag to reorder" data-id="${block.id}"><i class="fa-solid fa-grip-vertical"></i></button>
      <button class="block-action-btn move-up" title="Move Up" data-id="${block.id}"><i class="fa-solid fa-arrow-up"></i></button>
      <button class="block-action-btn move-down" title="Move Down" data-id="${block.id}"><i class="fa-solid fa-arrow-down"></i></button>
      <button class="block-action-btn copy-btn" title="Copy Block (Ctrl+C)" data-id="${block.id}"><i class="fa-solid fa-clipboard"></i></button>
      <button class="block-action-btn dup-btn" title="Duplicate" data-id="${block.id}"><i class="fa-solid fa-copy"></i></button>
      <button class="block-action-btn del-btn" title="Delete" data-id="${block.id}"><i class="fa-solid fa-trash"></i></button>
    `;
        // Bubble expand/collapse + drag
        const bubbleTrigger = actions.querySelector('.bubble-trigger');
        let bubbleDragStarted = false;
        bubbleTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (bubbleDragStarted) { bubbleDragStarted = false; return; }
            actions.classList.toggle('expanded');
        });
        // Make bubble draggable by holding the trigger
        bubbleTrigger.addEventListener('mousedown', (evt) => {
            if (evt.button !== 0) return;
            const startX = evt.clientX;
            const startY = evt.clientY;
            let moved = false;
            const onMove = (me) => {
                const dx = me.clientX - startX;
                const dy = me.clientY - startY;
                if (!moved && Math.abs(dx) + Math.abs(dy) > 5) {
                    moved = true;
                    bubbleDragStarted = true;
                    // Switch to floating mode
                    const rect = actions.getBoundingClientRect();
                    actions.classList.add('floating');
                    actions.style.left = rect.left + 'px';
                    actions.style.top = rect.top + 'px';
                    actions.style.right = 'auto';
                    floatingBlockActions[block.id] = { left: rect.left, top: rect.top };
                }
                if (moved) {
                    const pos = clampFloatingPosition(
                        (floatingBlockActions[block.id]?.left || 0) + (me.clientX - startX),
                        (floatingBlockActions[block.id]?.top || 0) + (me.clientY - startY),
                        actions
                    );
                    actions.style.left = pos.left + 'px';
                    actions.style.top = pos.top + 'px';
                }
            };
            const onUp = (ue) => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                if (moved) {
                    floatingBlockActions[block.id] = {
                        left: parseFloat(actions.style.left),
                        top: parseFloat(actions.style.top)
                    };
                }
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
        applyBlockActionsPosition(block.id, actions);

        // Render preview HTML
        const content = document.createElement('div');
        content.className = 'block-content';
        content.style.pointerEvents = 'auto'; // Enable pointer events for sub-selection
        // Deep clone props before passing to render to prevent mutation of state
        const createRenderProps = JSON.parse(JSON.stringify(block.props));
        let createHtml = def.render(createRenderProps);
        
        // Inject hover attributes into the first element
        if (typeof BlockTypes !== 'undefined' && BlockTypes.applyHover) {
            const createHoverAttrs = BlockTypes.applyHover(block.props);
            if (createHoverAttrs) {
                createHtml = createHtml.replace(/^(\s*<\w+)/, `$1 ${createHoverAttrs}`);
            }
        }
        
        // Inject background blur style
        if (block.props.bgImage && block.props.bgBlur && parseInt(block.props.bgBlur) > 0 && typeof generateBgBlurStyle === 'function') {
            const firstEl = createHtml.match(/id="([^"]+)"/);
            const elId = firstEl ? firstEl[1] : ('blk_' + block.id);
            if (!createHtml.includes('::before')) {
                createHtml = generateBgBlurStyle(elId, block.props) + createHtml;
            }
        }
        
        content.innerHTML = createHtml;

        // Ensure inner element fills the wrapper but keeps its other styles
        const firstChild = content.firstElementChild;
        if (firstChild) {
            firstChild.style.width = '100%';
            if (block.props.animationPreset && block.props.animationPreset !== 'none' && (block.props.animationTrigger || 'load') === 'scroll') {
                firstChild.dataset.sfAnim = block.props.animationPreset;
                firstChild.dataset.sfAnimDuration = block.props.animationDuration || '0.8';
                firstChild.dataset.sfAnimDelay = block.props.animationDelay || '0';
            }
        }

        // --- Apply Layout Styles to Wrapper ---
        // This ensures the selection outline matches the actual block size 
        // and allows side-by-side layouts when width < 100%
        const p = block.props;
        wrapper.style.width = p.width || '100%';
        // Root wrapper should ALMOST ALWAYS be auto-height to allow content (like text) to grow
        wrapper.style.height = 'auto';
        wrapper.style.margin = p.margin || '0';
        wrapper.style.display = 'block'; // Essential for layout containers to work correctly

        // --- Sub-element Selection & Styling ---
        assignPathsAndStyles(content, block);
        const selectStructureTarget = (e) => {
            if (!document.body.classList.contains('structure-view')) return;

            // Find the best target path (bubble up to nearest repeater/dynamic if possible)
            let curr = e.target;
            let bestTarget = null;
            let bestPath = null;
            
            while (curr && curr !== content) {
                const p = curr.getAttribute('data-sf-path');
                if (p) {
                    bestTarget = curr;
                    bestPath = p;
                    // In most cases, we want the innermost one.
                    break; 
                }
                curr = curr.parentElement;
            }

            if (bestTarget && bestPath) {
                e.preventDefault();
                e.stopPropagation();
                State.setSelected(block.id);
                showPenTool(bestTarget, block.id, bestPath, e);
                State.setSelectedSubPath(bestPath); // Open properties panel immediately
                return true;
            }
            return false;
        };
        content._sfSelectStructureTarget = selectStructureTarget;
        // Only attach click listener if structure view is likely to be used
        // Uses event delegation check inside the handler itself
        content.addEventListener('click', (e) => {
            if (!document.body.classList.contains('structure-view')) return;
            selectStructureTarget(e);
        });


        // --- Recursive Rendering for Nested Blocks ---
        const inner = getBlockChildHost(content);
        if (inner) {
                const hint = inner.querySelector('.sf-drop-hint');
                const children = State.getBlocks(block.id);
                if (children.length > 0) {
                    if (hint) hint.style.display = 'none';
                    children.forEach(child => {
                        inner.appendChild(createBlockEl(child));
                    });
                } else {
                    if (hint) hint.style.display = 'flex';
                }

                // Attach drop zone using shared helper
                _attachInnerDropZone(inner, block);
        }


        // Resize handles
        const resizeHandleV = document.createElement('div');
        resizeHandleV.className = 'resize-handle-v';
        resizeHandleV.title = 'Drag to resize height';
        resizeHandleV.style.cssText = 'position:absolute; bottom:-3px; left:50%; transform:translateX(-50%); width:84px; height:6px; background:var(--accent); border-radius:999px; cursor:ns-resize; display:none; z-index:1001; border: 1px solid #fff;';

        const resizeHandleH = document.createElement('div');
        resizeHandleH.className = 'resize-handle-h';
        resizeHandleH.title = 'Drag to resize width';
        resizeHandleH.style.cssText = 'position:absolute; right:-3px; top:50%; transform:translateY(-50%); width:6px; height:84px; background:var(--accent); border-radius:999px; cursor:ew-resize; display:none; z-index:1001; border: 1px solid #fff;';

        const resizeHandleBoth = document.createElement('div');
        resizeHandleBoth.className = 'resize-handle-both';
        resizeHandleBoth.title = 'Drag to resize both width and height';
        resizeHandleBoth.style.cssText = 'position:absolute; right:-6px; bottom:-6px; width:12px; height:12px; background:var(--accent); border-radius:999px; cursor:nwse-resize; display:none; z-index:1002; border: 1px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);';

        wrapper.appendChild(toolbar);
        wrapper.appendChild(actions);
        wrapper.appendChild(content);
        wrapper.appendChild(resizeHandleV);
        wrapper.appendChild(resizeHandleH);
        wrapper.appendChild(resizeHandleBoth);

        // Selection is handled by the centralized pointerdown handler in init()
        // No per-block selection listener needed.

        // Vertical Resize (Height)
        let isResizingV = false;
        let startY, startHeight;

        resizeHandleV.addEventListener('mousedown', (e) => {
            e.stopPropagation(); e.preventDefault();
            isResizingV = true;
            startY = e.clientY;

            // We want to resize the media/container, not the outer wrapper
            const inner = content.querySelector('figure, .video-container, hr, .sf-container-block .container-inner, .sf-box-block .container-inner') || content.firstElementChild || content.firstChild;
            if (!inner || !inner.style) return;
            startHeight = inner.offsetHeight;

            document.body.style.cursor = 'ns-resize';

            const onMove = (me) => {
                if (!isResizingV) return;
                const delta = me.clientY - startY;
                const newVal = Math.max(20, startHeight + delta);

                const videoCont = inner.querySelector('.video-container') || (inner.classList.contains('video-container') ? inner : null);
                if (videoCont) {
                    videoCont.style.paddingBottom = '0';
                    videoCont.style.height = newVal + 'px';
                } else {
                    inner.style.height = newVal + 'px';
                }
                inner.style.maxHeight = 'none';
            };
            const onUp = (ue) => {
                isResizingV = false;
                document.body.style.cursor = '';
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                const delta = ue.clientY - startY;
                const newVal = Math.max(20, startHeight + delta);

                State.updateBlockProps(block.id, { height: newVal + 'px', maxHeight: 'none', aspectRatio: '0' });
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        // Horizontal Resize (Width)
        let isResizingH = false;
        let startX, startWidth;

        resizeHandleH.addEventListener('mousedown', (e) => {
            e.stopPropagation(); e.preventDefault();
            isResizingH = true;
            startX = e.clientX;
            // Get the current width of the wrapper block
            startWidth = wrapper.offsetWidth;
            document.body.style.cursor = 'ew-resize';

            // Find elements that restrict width to remove their max-width
            const limiters = content.querySelectorAll('[style*="max-width"]');
            limiters.forEach(el => el.style.maxWidth = 'none');
            const inner = content.firstElementChild || content.firstChild;
            if (inner && inner.style) inner.style.maxWidth = 'none';

            const onMove = (me) => {
                if (!isResizingH) return;
                const delta = me.clientX - startX;

                const style = window.getComputedStyle(wrapper);
                const isMarginCentered = style.marginLeft !== '0px' && style.marginRight !== '0px' && style.marginLeft === style.marginRight;
                const multiplier = isMarginCentered ? 2 : 1;

                const newVal = Math.max(50, startWidth + delta * multiplier);

                // Change the wrapper width directly for smooth visual updates
                wrapper.style.width = newVal + 'px';
            };
            const onUp = (ue) => {
                isResizingH = false;
                document.body.style.cursor = '';
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);

                const delta = ue.clientX - startX;
                const style = window.getComputedStyle(wrapper);
                const isMarginCentered = style.marginLeft !== '0px' && style.marginRight !== '0px' && style.marginLeft === style.marginRight;
                const multiplier = isMarginCentered ? 2 : 1;
                const newVal = Math.max(50, startWidth + delta * multiplier);

                const containerWidth = wrapper.parentElement ? wrapper.parentElement.offsetWidth : 1200;
                let percent = Math.min(100, (newVal / containerWidth) * 100);
                percent = Math.max(5, percent); // prevent visually disappearing fully

                State.updateBlockProps(block.id, {
                    width: percent.toFixed(2) + '%',
                    maxWidth: 'none'
                });
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        // Dual Axis Resize (Width & Height)
        let isResizingBoth = false;
        let startBothX, startBothY, startBothWidth, startBothHeight;

        resizeHandleBoth.addEventListener('mousedown', (e) => {
            e.stopPropagation(); e.preventDefault();
            isResizingBoth = true;
            startBothX = e.clientX;
            startBothY = e.clientY;

            // Width tracks wrapper for smoothness
            startBothWidth = wrapper.offsetWidth;

            // Focus height purely on the media/inner content
            const inner = content.querySelector('figure, .video-container, hr, .sf-container-block .container-inner, .sf-box-block .container-inner') || content.firstElementChild || content.firstChild;
            if (!inner || !inner.style) return;
            startBothHeight = inner.offsetHeight;

            // Remove max-width constraints so drag feels smooth immediately
            const limiters = content.querySelectorAll('[style*="max-width"]');
            limiters.forEach(el => el.style.maxWidth = 'none');

            document.body.style.cursor = 'nwse-resize';

            const onMove = (me) => {
                if (!isResizingBoth) return;
                const deltaX = me.clientX - startBothX;
                const deltaY = me.clientY - startBothY;

                const style = window.getComputedStyle(wrapper);
                const isMarginCentered = style.marginLeft !== '0px' && style.marginRight !== '0px' && style.marginLeft === style.marginRight;
                const multiplier = isMarginCentered ? 2 : 1;

                const newWidth = Math.max(50, startBothWidth + deltaX * multiplier);
                const newHeight = Math.max(50, startBothHeight + deltaY);

                // Update wrapper width
                wrapper.style.width = newWidth + 'px';

                // Update INNER height specifically
                const videoCont = inner.querySelector('.video-container') || (inner.classList.contains('video-container') ? inner : null);
                if (videoCont) {
                    videoCont.style.paddingBottom = '0';
                    videoCont.style.height = newHeight + 'px';
                } else {
                    inner.style.height = newHeight + 'px';
                }
                inner.style.maxHeight = 'none';
            };
            const onUp = (ue) => {
                isResizingBoth = false;
                document.body.style.cursor = '';
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);

                const deltaX = ue.clientX - startBothX;
                const deltaY = ue.clientY - startBothY;

                const style = window.getComputedStyle(wrapper);
                const isMarginCentered = style.marginLeft !== '0px' && style.marginRight !== '0px' && style.marginLeft === style.marginRight;
                const multiplier = isMarginCentered ? 2 : 1;

                const newWidth = Math.max(50, startBothWidth + deltaX * multiplier);
                const newHeight = Math.max(50, startBothHeight + deltaY);

                const containerWidth = wrapper.parentElement ? wrapper.parentElement.offsetWidth : 1200;
                let percent = Math.min(100, (newWidth / containerWidth) * 100);
                percent = Math.max(5, percent);

                State.updateBlockProps(block.id, {
                    width: percent.toFixed(2) + '%',
                    height: newHeight + 'px',
                    maxWidth: 'none',
                    maxHeight: 'none',
                    aspectRatio: '0'
                });
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        // Events
        wrapper.addEventListener('click', (e) => {
            // Don't stop propagation for action buttons — they need to reach the document handler
            if (e.target.closest('.block-action-btn') || e.target.closest('.block-actions')) return;
            e.stopPropagation();
            // Selection already handled by pointerdown — only stop propagation here
        });

        wrapper.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            State.setSelected(block.id);
            showContextMenu(e.clientX, e.clientY, block.id);
        });

        // Drag handle for reordering
        const dragHandle = actions.querySelector('.drag-handle');
        dragHandle.addEventListener('mousedown', () => {
            wrapper.draggable = true;
            draggedBlockId = block.id;
        });
        const toolbarMoveHandle = actions.querySelector('.toolbar-move-handle');
        toolbarMoveHandle.addEventListener('mousedown', (evt) => {
            const rect = actions.getBoundingClientRect();
            startFloatingToolbarDrag(
                evt,
                actions,
                () => ({
                    left: floatingBlockActions[block.id]?.left ?? rect.left,
                    top: floatingBlockActions[block.id]?.top ?? rect.top
                }),
                (nextPos) => {
                    floatingBlockActions[block.id] = nextPos;
                }
            );
        });
        toolbarMoveHandle.addEventListener('dblclick', (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            delete floatingBlockActions[block.id];
            applyBlockActionsPosition(block.id, actions);
        });
        wrapper.addEventListener('dragstart', (e) => {
            if (!draggedBlockId) { e.preventDefault(); return; }
            wrapper.classList.add('dragging');
            e.dataTransfer.setData('text/plain', '');
            e.dataTransfer.effectAllowed = 'move';
        });
        wrapper.addEventListener('dragend', () => {
            wrapper.draggable = false;
            wrapper.classList.remove('dragging');
            draggedBlockId = null;
        });
        wrapper.addEventListener('dragover', (e) => {
            // Intercept for both block reordering AND palette drags
            if (draggedBlockId === block.id) return;
            e.preventDefault();
            e.stopPropagation();

            const rect = wrapper.getBoundingClientRect();
            // Determine if element sits in a horizontal row or vertical stack
            const isHorizontal = wrapper.parentElement ? window.getComputedStyle(wrapper.parentElement).flexDirection === 'row' : false;
            
            const isFirstHalf = isHorizontal 
                ? (e.clientX < rect.left + rect.width / 2)
                : (e.clientY < rect.top + rect.height / 2);

            if (isFirstHalf) {
                wrapper.style.boxShadow = isHorizontal ? 'inset 4px 0 0 #6c63ff' : 'inset 0 4px 0 #6c63ff';
            } else {
                wrapper.style.boxShadow = isHorizontal ? 'inset -4px 0 0 #6c63ff' : 'inset 0 -4px 0 #6c63ff';
            }
        });
        wrapper.addEventListener('dragleave', () => {
            wrapper.style.boxShadow = '';
        });
        wrapper.addEventListener('drop', (e) => {
            wrapper.style.boxShadow = '';

            if (draggedBlockId === block.id) return;
            e.preventDefault();
            e.stopPropagation();

            const rect = wrapper.getBoundingClientRect();
            const isHorizontal = wrapper.parentElement ? window.getComputedStyle(wrapper.parentElement).flexDirection === 'row' : false;
            const insertAfter = isHorizontal 
                ? (e.clientX >= rect.left + rect.width / 2)
                : (e.clientY >= rect.top + rect.height / 2);
            
            const toBlock = State.getBlock(block.id);
            const siblings = State.getBlocks(toBlock.parentId);
            let siblingIdx = siblings.findIndex(s => s.id === block.id);
            if (insertAfter) siblingIdx++;

            if (draggedBlockId) {
                if (isDescendantBlock(draggedBlockId, toBlock.parentId)) {
                    showToast('You cannot move a block into its own nested area.', 'info');
                    return;
                }
                State.updateBlockParent(draggedBlockId, toBlock.parentId, siblingIdx);
                State.setSelected(draggedBlockId);
            } else {
                const blockData = resolveDraggedBlockData(e.dataTransfer.getData('text/plain'));
                const type = blockData?.type;
                if (!type || !BlockTypes[type]) return;
                
                const targetDef = BlockTypes[type];
                if (toBlock.parentId && isRootOnlyBlockType(type)) {
                    showToast(`ℹ️ ${targetDef.label} must be at the root level (not nested).`, 'info');
                    return;
                }
                
                const newId = State.addBlock({
                    ...(blockData || {
                        type,
                        props: JSON.parse(JSON.stringify(targetDef.defaultProps))
                    }),
                    parentId: toBlock.parentId
                }, siblingIdx);
                State.setSelected(newId);
            }
        });


        // Action button events are handled by the delegated handler in init()
        // (no per-block handlers needed — prevents double-firing)

        return wrapper;
    }




    function updateSelection(id) {
        document.querySelectorAll('.canvas-block').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.block-actions').forEach((actionsEl) => {
            const blockId = actionsEl.closest('.canvas-block')?.dataset.id;
            if (!blockId) return;
            if (id && blockId === String(id)) applyBlockActionsPosition(blockId, actionsEl);
            else if (!floatingBlockActions[blockId]) applyBlockActionsPosition(blockId, actionsEl);
        });
        if (id) {
            const el = document.getElementById('block_' + id);
            if (el) el.classList.add('selected');
        }
    }

    // ---- Context Menu ----
    let ctxTarget = null;

    function showContextMenu(x, y, id) {
        ctxTarget = id;
        const menu = document.getElementById('contextMenu');
        menu.classList.remove('hidden');

        // Show paste item only if clipboard has a block
        const pasteItem = document.getElementById('ctxPaste');
        if (pasteItem) {
            const hasPasteable = typeof Clipboard !== 'undefined' && Clipboard.hasContent() && !Clipboard.isStyleCopy();
            pasteItem.style.display = hasPasteable ? '' : 'none';
        }

        // Position intelligently so menu doesn't go off screen
        menu.style.left = Math.min(x, window.innerWidth - menu.offsetWidth - 8) + 'px';
        menu.style.top = Math.min(y, window.innerHeight - menu.offsetHeight - 8) + 'px';
    }

    function hideContextMenu() {
        document.getElementById('contextMenu').classList.add('hidden');
        ctxTarget = null;
    }

    function initContextMenu() {
        document.addEventListener('click', hideContextMenu);
        document.getElementById('ctxCopy').addEventListener('click', () => {
            if (ctxTarget && typeof Clipboard !== 'undefined' && Clipboard.copyBlock(ctxTarget)) {
                showToast('✅ Block copied! Switch pages and press Ctrl+V or click the paste hint to paste.', 'success');
                _showPasteHint();
            }
        });
        document.getElementById('ctxPaste').addEventListener('click', () => {
            if (typeof Clipboard !== 'undefined' && Clipboard.hasContent() && !Clipboard.isStyleCopy()) {
                const block = ctxTarget ? State.getBlock(ctxTarget) : null;
                Clipboard.pasteBlock(block ? block.parentId : null);
                showToast('✅ Block pasted!', 'success');
                _hidePasteHint();
            }
        });
        document.getElementById('ctxMoveUp').addEventListener('click', () => { if (ctxTarget) State.moveBlock(ctxTarget, 'up'); });
        document.getElementById('ctxMoveDown').addEventListener('click', () => { if (ctxTarget) State.moveBlock(ctxTarget, 'down'); });
        document.getElementById('ctxDuplicate').addEventListener('click', () => { if (ctxTarget) State.duplicateBlock(ctxTarget); });
        document.getElementById('ctxDelete').addEventListener('click', () => { if (ctxTarget) State.removeBlock(ctxTarget); });
    }


    // ---- Text Animation System ----
    function applyTextAnimation(el, s) {
        const anim = s.textAnim;
        const speed = s.textAnimSpeed || '3';
        const c1 = s.textAnimColor1 || '#6366f1';
        const c2 = s.textAnimColor2 || '#ec4899';
        const c3 = s.textAnimColor3 || '#14b8a6';
        const uid = 'sfta_' + Math.random().toString(36).slice(2, 8);

        // Remove any previous animation style tag for this element
        const prev = el.querySelector('style[data-sf-text-anim]');
        if (prev) prev.remove();
        el.style.removeProperty('animation');
        el.style.removeProperty('background');
        el.style.removeProperty('-webkit-background-clip');
        el.style.removeProperty('-webkit-text-fill-color');
        // Clean up typing interval
        if (el._sfTypingInterval) {
            clearInterval(el._sfTypingInterval);
            el._sfTypingInterval = null;
            el._sfTypingActive = false;
        }
        el.removeAttribute('data-sf-typing');

        if (anim === 'none') return;

        el.classList.add(uid);
        let css = '';

        switch (anim) {
            case 'color-cycle':
                css = `
                    .${uid} { animation: sfColorCycle_${uid} ${speed}s ease infinite !important; }
                    @keyframes sfColorCycle_${uid} { 0%{color:${c1} !important; -webkit-text-fill-color:${c1} !important;} 33%{color:${c2} !important; -webkit-text-fill-color:${c2} !important;} 66%{color:${c3} !important; -webkit-text-fill-color:${c3} !important;} 100%{color:${c1} !important; -webkit-text-fill-color:${c1} !important;} }
                `;
                // Remove any inline color that would override the animation
                el.style.removeProperty('color');
                break;
            case 'gradient-flow':
                css = `
                    .${uid} { background:linear-gradient(90deg,${c1},${c2},${c3},${c1}); background-size:300% 100%; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:sfGradFlow_${uid} ${speed}s linear infinite; }
                    @keyframes sfGradFlow_${uid} { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
                `;
                break;
            case 'glow-pulse':
                css = `
                    .${uid} { animation: sfGlowPulse_${uid} ${speed}s ease-in-out infinite; }
                    @keyframes sfGlowPulse_${uid} { 0%,100%{text-shadow:0 0 5px ${c1}, 0 0 10px ${c1}} 50%{text-shadow:0 0 20px ${c2}, 0 0 40px ${c2}, 0 0 60px ${c3}} }
                `;
                break;
            case 'typing':
                css = `
                    .${uid} { border-right:2px solid ${c1}; animation: sfBlink_${uid} 0.7s step-end infinite; }
                    @keyframes sfBlink_${uid} { 50%{border-color:transparent} }
                `;
                // JS-based typing that doesn't break layout
                el.setAttribute('data-sf-typing', 'true');
                const originalText = el.textContent || '';
                if (!el._sfTypingActive) {
                    el._sfTypingActive = true;
                    let i = 0;
                    const typeSpeed = (parseFloat(speed) * 1000) / Math.max(originalText.length, 1);
                    el.textContent = '';
                    const typeInterval = setInterval(() => {
                        if (i <= originalText.length) {
                            el.textContent = originalText.substring(0, i);
                            i++;
                        } else {
                            // Reset and loop
                            setTimeout(() => { i = 0; el.textContent = ''; }, 1500);
                        }
                    }, typeSpeed);
                    el._sfTypingInterval = typeInterval;
                }
                break;
            case 'bounce':
                css = `
                    .${uid} { animation: sfBounce_${uid} ${speed}s ease infinite; transform-origin:center; }
                    @keyframes sfBounce_${uid} { 0%,100%{transform:translateY(0)} 25%{transform:translateY(-6px)} 50%{transform:translateY(0)} 75%{transform:translateY(-3px)} }
                `;
                break;
            case 'shake':
                css = `
                    .${uid} { animation: sfShake_${uid} ${speed}s ease infinite; }
                    @keyframes sfShake_${uid} { 0%,100%{transform:translateX(0)} 10%{transform:translateX(-3px)} 20%{transform:translateX(3px)} 30%{transform:translateX(-3px)} 40%{transform:translateX(3px)} 50%,100%{transform:translateX(0)} }
                `;
                break;
            case 'pulse-scale':
                css = `
                    .${uid} { animation: sfPulseScale_${uid} ${speed}s ease-in-out infinite; transform-origin:center; }
                    @keyframes sfPulseScale_${uid} { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
                `;
                break;
            case 'float':
                css = `
                    .${uid} { animation: sfFloat_${uid} ${speed}s ease-in-out infinite; }
                    @keyframes sfFloat_${uid} { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
                `;
                break;
            case 'flicker':
                css = `
                    .${uid} { animation: sfFlicker_${uid} ${speed}s linear infinite; }
                    @keyframes sfFlicker_${uid} { 0%,100%{opacity:1} 5%{opacity:0.4} 10%{opacity:1} 15%{opacity:0.6} 20%{opacity:1} 50%{opacity:1} 55%{opacity:0.3} 60%{opacity:1} }
                `;
                break;
        }

        if (css) {
            const style = document.createElement('style');
            style.setAttribute('data-sf-text-anim', anim);
            style.textContent = css;
            el.appendChild(style);
        }
    }

    // ---- Sub-element Helpers ----
    function assignPathsAndStyles(container, block) {
        const subStyles = block.props.subStyles || {};

        function recurse(el, requestedPath) {
            const existingPath = el.getAttribute('data-sf-path');
            const path = existingPath || requestedPath;
            el.setAttribute('data-sf-path', path);
            const s = subStyles[path] || {};

            // Re-apply selection class if this is the active sub-path
            if (State.getSelectedSubPath() === path) {
                el.classList.add('sf-sub-selected');
                // We might need to reposition the pen tool if it's already there
                if (currentPenTool && currentPenTool.target !== el) {
                    currentPenTool.target = el;
                }
            } else {
                el.classList.remove('sf-sub-selected');
            }

            if (!isVoidElement(el)) {
                // Keep sub-elements safe from accidental native HTML dragging.
                // Explicit moves still work through the pen-tool / toolbar drag actions.
                el.draggable = false;
            }

            if (canHostSubElements(el)) {
                el.addEventListener('dragover', (e) => {
                    if (!draggedSubElement) return;
                    e.preventDefault();
                    e.stopPropagation();
                    el.style.setProperty('outline', '2px dashed var(--accent)', 'important');
                    el.style.setProperty('outline-offset', '2px', 'important');
                });
                el.addEventListener('dragleave', () => {
                    if (!draggedSubElement) return;
                    if (s.visualGuide && s.visualGuide !== 'none') return;
                    el.style.removeProperty('outline');
                    el.style.removeProperty('outline-offset');
                });
                el.addEventListener('drop', (e) => {
                    if (!draggedSubElement) return;
                    e.preventDefault();
                    e.stopPropagation();
                    if (!(s.visualGuide && s.visualGuide !== 'none')) {
                        el.style.removeProperty('outline');
                        el.style.removeProperty('outline-offset');
                    }
                    handleSubElementDrop(block.id, path);
                });
            }

            // Apply sub-styles if any
            if (Object.keys(s).length > 0) {
                const clean = (val) => (val && typeof val === 'string') ? val.replace(' !important', '').trim() : val;
                // Layout
                if (s.display) el.style.setProperty('display', clean(s.display), 'important');
                if (s.width) el.style.setProperty('width', clean(s.width), 'important');
                if (s.height) el.style.setProperty('height', clean(s.height), 'important');
                if (s.minWidth) el.style.setProperty('min-width', clean(s.minWidth), 'important');
                if (s.minHeight) el.style.setProperty('min-height', clean(s.minHeight), 'important');
                if (s.maxWidth) el.style.setProperty('max-width', clean(s.maxWidth), 'important');
                if (s.maxHeight) el.style.setProperty('max-height', clean(s.maxHeight), 'important');
                if (s.margin) el.style.setProperty('margin', clean(s.margin), 'important');
                if (s.padding) el.style.setProperty('padding', clean(s.padding), 'important');
                if (s.gap) el.style.setProperty('gap', clean(s.gap), 'important');
                if (s.direction) el.style.setProperty('flex-direction', clean(s.direction), 'important');
                if (s.justify) el.style.setProperty('justify-content', clean(s.justify), 'important');
                if (s.align) el.style.setProperty('align-items', clean(s.align), 'important');
                if (s.flexGrow) el.style.setProperty('flex-grow', clean(s.flexGrow), 'important');
                if (s.flexShrink) el.style.setProperty('flex-shrink', clean(s.flexShrink), 'important');
                if (s.alignSelf) el.style.setProperty('align-self', clean(s.alignSelf), 'important');

                // Typography
                if (s.color && !(s.textAnim === 'color-cycle' || s.textAnim === 'gradient-flow')) el.style.setProperty('color', clean(s.color), 'important');
                if (s.fontSize) el.style.setProperty('font-size', clean(s.fontSize), 'important');
                if (s.fontWeight) el.style.setProperty('font-weight', clean(s.fontWeight), 'important');
                if (s.fontFamily) el.style.setProperty('font-family', clean(s.fontFamily), 'important');
                if (s.lineHeight) el.style.setProperty('line-height', clean(s.lineHeight), 'important');
                if (s.letterSpacing) el.style.setProperty('letter-spacing', clean(s.letterSpacing), 'important');
                if (s.textAlign) el.style.setProperty('text-align', clean(s.textAlign), 'important');

                // Visuals
                if (s.bgColor) el.style.setProperty('background-color', clean(s.bgColor), 'important');
                if (s.background) el.style.setProperty('background', clean(s.background), 'important');
                if (s.bgImage) {
                    el.style.setProperty('background-image', `url(${s.bgImage})`, 'important');
                    el.style.setProperty('background-size', clean(s.bgSize || 'cover'), 'important');
                    el.style.setProperty('background-position', clean(s.bgPosition || 'center'), 'important');
                    el.style.setProperty('background-repeat', 'no-repeat', 'important');
                }
                if (s.bgSize && !s.bgImage) el.style.setProperty('background-size', clean(s.bgSize), 'important');
                if (s.bgPosition && !s.bgImage) el.style.setProperty('background-position', clean(s.bgPosition), 'important');
                if (s.opacity !== undefined) el.style.setProperty('opacity', clean(s.opacity), 'important');
                if (s.zIndex) el.style.setProperty('z-index', clean(s.zIndex), 'important');
                if (s.boxShadow) el.style.setProperty('box-shadow', clean(s.boxShadow), 'important');
                if (s.borderRadius) el.style.setProperty('border-radius', clean(s.borderRadius), 'important');
                if (s.border) el.style.setProperty('border', clean(s.border), 'important');
                if (s.borderWidth) el.style.setProperty('border-width', clean(s.borderWidth), 'important');
                if (s.borderStyle) el.style.setProperty('border-style', clean(s.borderStyle), 'important');
                if (s.borderColor) el.style.setProperty('border-color', clean(s.borderColor), 'important');

                // Filters
                const filters = [];
                if (s.blur) filters.push(`blur(${clean(s.blur)}px)`);
                if (s.brightness !== undefined && s.brightness != 1) filters.push(`brightness(${clean(s.brightness)})`);
                if (s.contrast !== undefined && s.contrast != 1) filters.push(`contrast(${clean(s.contrast)})`);
                if (s.saturate !== undefined && s.saturate != 1) filters.push(`saturate(${clean(s.saturate)})`);
                if (s.grayscale) filters.push(`grayscale(${clean(s.grayscale)})`);
                if (s.hueRotate) filters.push(`hue-rotate(${clean(s.hueRotate)}deg)`);
                if (s.sepia) filters.push(`sepia(${clean(s.sepia)})`);
                if (filters.length > 0) el.style.setProperty('filter', filters.join(' '), 'important');
                
                // Image-specific properties
                if (s.objectFit) el.style.setProperty('object-fit', clean(s.objectFit), 'important');
                if (s.objectPosition) el.style.setProperty('object-position', clean(s.objectPosition), 'important');
                
                // Image src update
                if (s.src && el.tagName === 'IMG') el.src = s.src;
                if (s.alt && el.tagName === 'IMG') el.alt = s.alt;

                // Visual Guide (Editor Only)
                if (s.visualGuide && s.visualGuide !== 'none') {
                    const color = s.visualGuide === 'red' ? '#ff4d4d' : '#2ecc71';
                    el.style.setProperty('outline', `3px dashed ${color}`, 'important');
                    el.style.setProperty('outline-offset', '-3px', 'important');
                }

                // Text Animation (continuous)
                if (s.textAnim && s.textAnim !== 'none') {
                    applyTextAnimation(el, s);
                }

                if (el.classList && el.classList.contains('sf-read-more-child')) {
                    return;
                }

                // Flexbox (Sub-elements)
                if (s.flexGrow !== undefined) el.style.setProperty('flex-grow', clean(s.flexGrow), 'important');
                if (s.flexShrink !== undefined) el.style.setProperty('flex-shrink', clean(s.flexShrink), 'important');

                const tagName = el.tagName.toUpperCase();
                // Behavior / Content
                // TEXT is now resolved DURING render via resolveSubText().
                // Only apply text override here for dynamic children (not template elements).
                const isContentTag = ['P', 'SPAN', 'X', 'A', 'BUTTON', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'FIGCAPTION', 'LABEL', 'I'].includes(tagName);
                if (s.text !== undefined && (el.children.length === 0 || isContentTag)) {
                    // Only apply if this is a dynamic child (path contains .c) or has no data-initial-value
                    // Template elements with data-initial-value are handled by resolveSubText in render
                    const isDynamicChild = path.includes('.c');
                    const hasInitialValue = el.hasAttribute('data-initial-value');
                    if (isDynamicChild || !hasInitialValue) {
                        el.innerText = s.text;
                    }
                }
                if (s.customId) el.id = s.customId;
                if (s.customClass) el.className = s.customClass;

                // Add-to-cart buttons can optionally behave as links
                if (el.classList && el.classList.contains('sf-add-to-cart')) {
                    const rawHref = typeof s.href === 'string' ? s.href.trim() : '';
                    if (rawHref) {
                        el.onclick = (e) => {
                            if (document.getElementById('canvasFrame')) { e.stopPropagation(); return; }
                            window.location.href = rawHref;
                            e.stopPropagation();
                        };
                    } else {
                        const name = s.name !== undefined ? s.name : (el.getAttribute('data-name') || 'Product');
                        const price = s.price !== undefined ? s.price : (el.getAttribute('data-price') || '0.00');
                        const image = s.image !== undefined ? s.image : (el.getAttribute('data-image') || '');
                        el.setAttribute('data-name', name || 'Product');
                        el.setAttribute('data-price', price || '0.00');
                        el.setAttribute('data-image', image || '');
                        el.onclick = (e) => {
                            if (document.getElementById('canvasFrame')) { e.stopPropagation(); return; }
                            if (window.Cart) {
                                window.Cart.add({
                                    name: el.getAttribute('data-name'),
                                    price: el.getAttribute('data-price'),
                                    image: el.getAttribute('data-image')
                                }, el);
                            }
                            e.stopPropagation();
                        };
                    }
                }

                // Handle Actions (Link / Cart) — ONLY for buttons and links
                if (tagName === 'A' || tagName === 'BUTTON' || (el && el.classList.contains('sf-button')) || (el && el.classList.contains('nav-btn'))) {
                    if (s.actionType === 'cart') {
                        el.setAttribute('data-name', s.cartItemName || 'Product');
                        el.setAttribute('data-price', s.cartItemPrice || '0.00');
                        el.setAttribute('data-image', s.cartItemImage || '');
                        el.onclick = (e) => {
                            if (window.Cart) {
                                window.Cart.add({
                                    name: el.getAttribute('data-name'),
                                    price: el.getAttribute('data-price'),
                                    image: el.getAttribute('data-image')
                                }, el);
                            }
                            e.stopPropagation();
                        };
                    } else if (s.href !== undefined && tagName === 'A') {
                        el.href = s.href;
                    }
                }
            }


            // 1. Render Dynamic children (from subStyles)
            if (s.children && s.children.length > 0) {
                s.children.forEach((childData, i) => {
                    const childPath = path + '.c' + i;
                    const cs = subStyles[childPath] || {};
                    let childEl = createDynamicElement(childData, cs, block);
                    el.appendChild(childEl);
                    recurse(childEl, childPath);
                });
            }

            // 2. Assign paths to Template children (that weren't just added)
            const isPromoted = s.templatePromoted;
            Array.from(el.children).forEach((child, i) => {
                const existingPath = child.getAttribute('data-sf-path');
                if (existingPath && existingPath.includes('.c')) return;
                
                if (isPromoted) {
                    child.style.display = 'none'; // Hide the original template part
                    return;
                }
                
                recurse(child, path + '.t' + i);
            });
        }

        Array.from(container.children).forEach((child, i) => {
            recurse(child, i.toString());
        });

        // Root level dynamic children
        if (subStyles.children && subStyles.children.length > 0) {
            subStyles.children.forEach((childData, i) => {
                const childPath = 'c' + i;
                const cs = subStyles[childPath] || {};
                let childEl = createDynamicElement(childData, cs, block);
                container.appendChild(childEl);
                recurse(childEl, childPath);
            });
        }
    }

    function createDynamicElement(childData, cs, block) {
        let childEl;
        const type = childData.type;

        if (type === 'img') {
            childEl = document.createElement('img');
            childEl.src = cs.src || childData.props.src || '';
            childEl.style.maxWidth = '100%';
        } else if (type === 'br') {
            childEl = document.createElement('br');
        } else if (type === 'hr') {
            childEl = document.createElement('hr');
            childEl.style.cssText = 'width:100%;border:none;border-top:1px solid rgba(15,23,42,0.16);margin:12px 0;';
        } else if (type === 'marquee') {
            childEl = document.createElement('marquee');
            childEl.innerText = cs.text || childData.props.text || childData.props.html || 'Scrolling marquee text...';
            childEl.style.cssText = 'width:100%;padding:8px 0;';
        } else if (type === 'video') {
            const cont = document.createElement('div');
            cont.className = 'video-container';
            cont.style.cssText = 'position:relative;padding-bottom:56.25%;height:0;overflow:hidden;';
            const iframe = document.createElement('iframe');
            iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;';
            iframe.src = VideoHelper.getEmbedUrl(cs.src || childData.props.src || '');
            cont.appendChild(iframe);
            childEl = cont;
        } else if (type === 'button' || type === 'add-to-cart') {
            const actsLikeReadMore =
                type === 'button' &&
                (
                    cs.popupTitle !== undefined ||
                    cs.popupText !== undefined ||
                    cs.popupVariant !== undefined ||
                    childData.props.popupTitle !== undefined ||
                    childData.props.popupText !== undefined ||
                    childData.props.popupVariant !== undefined
                );
            if (actsLikeReadMore) {
                const popupId = `sf_rm_${Math.random().toString(36).slice(2, 10)}`;
                const buttonText = cs.text || childData.props.text || 'Read More';
                const popupTitle = cs.popupTitle || childData.props.popupTitle || 'More Details';
                const popupText = cs.popupText || childData.props.popupText || 'Add your read more content from the Content tab.';
                const popupVariant = cs.popupVariant || childData.props.popupVariant || 'centered';
                const overlayAlign = popupVariant === 'side-panel'
                    ? 'align-items:stretch;justify-content:flex-end;'
                    : popupVariant === 'minimal'
                        ? 'align-items:flex-start;justify-content:center;padding-top:min(12vh,96px);'
                        : popupVariant === 'full-screen'
                            ? 'align-items:stretch;justify-content:stretch;padding:18px;'
                            : 'align-items:center;justify-content:center;';
                const cardStyle = popupVariant === 'side-panel'
                    ? 'width:min(92vw,420px);height:100%;max-height:100vh;border-radius:24px 0 0 24px;display:flex;flex-direction:column;'
                    : popupVariant === 'minimal'
                        ? 'width:min(92vw,420px);max-height:min(78vh,720px);border-radius:18px;display:flex;flex-direction:column;'
                        : popupVariant === 'full-screen'
                            ? 'width:100%;height:100%;max-width:none;max-height:none;border-radius:28px;display:flex;flex-direction:column;'
                            : 'width:min(92vw,540px);max-height:min(82vh,760px);border-radius:24px;display:flex;flex-direction:column;';
                childEl = document.createElement('div');
                childEl.className = 'sf-read-more-child';
                childEl.style.cssText = 'display:inline-flex;position:relative;';
                childEl.innerHTML = `
                    <button type="button" style="display:inline-flex;align-items:center;gap:8px;padding:11px 16px;border:none;border-radius:999px;background:var(--accent);color:#fff;font-weight:700;cursor:pointer;box-shadow:0 10px 24px rgba(15,23,42,0.16);" onclick="if(document.getElementById('canvasFrame')){ return; } event.stopPropagation(); var modal=document.getElementById('${popupId}'); if(modal){ modal.style.display='flex'; document.body.style.overflow='hidden'; }">
                        <span>${buttonText}</span><i class="fa-solid fa-arrow-right-long"></i>
                    </button>
                    <div id="${popupId}" onclick="if(document.getElementById('canvasFrame')){ return; } if(event.target===this){this.style.display='none';document.body.style.overflow='';} event.stopPropagation();" style="display:none;position:fixed;inset:0;background:rgba(2,6,23,0.58);backdrop-filter:blur(10px);z-index:99999;padding:24px;${overlayAlign}">
                        <div onclick="event.stopPropagation()" style="position:relative;background:#fff;color:#0f172a;box-shadow:0 30px 90px rgba(15,23,42,0.24);padding:${popupVariant === 'minimal' ? '22px' : popupVariant === 'full-screen' ? '32px' : '28px'};${cardStyle}">
                            <button type="button" onclick="if(document.getElementById('canvasFrame')){ return; } var modal=document.getElementById('${popupId}'); if(modal){ modal.style.display='none'; document.body.style.overflow=''; } event.stopPropagation();" style="position:absolute;top:14px;right:14px;width:36px;height:36px;border:none;border-radius:50%;background:#eef2f7;color:#0f172a;font-size:1.2rem;cursor:pointer;">&times;</button>
                            <div style="font-size:${popupVariant === 'minimal' ? '1.15rem' : '1.5rem'};font-weight:800;line-height:1.15;margin-bottom:12px;padding-right:42px;flex:0 0 auto;">${popupTitle}</div>
                            <div style="font-size:0.96rem;line-height:1.8;color:#475569;overflow-y:auto;flex:1 1 auto;padding-right:6px;word-break:break-word;">${popupText}</div>
                        </div>
                    </div>
                `;
            } else {
            const resolvedActionType = cs.actionType || childData.props.actionType || 'link';
            const resolvedHref = cs.href || childData.props.href || '#';

            if (type === 'add-to-cart') {
                childEl = document.createElement('button');
                childEl.type = 'button';
                childEl.className = 'sf-add-to-cart';
                childEl.innerText = cs.text || childData.props.text || 'Add to Cart';
                const cartBg = cs.bgColor || childData.props.bgColor || 'var(--accent, #6c63ff)';
                const cartColor = cs.color || cs.textColor || childData.props.color || childData.props.textColor || '#fff';
                const cartPadding = cs.padding || childData.props.padding || '10px 20px';
                const cartRadius = cs.borderRadius || childData.props.borderRadius || '6px';
                const cartFontSize = cs.fontSize || childData.props.fontSize || '1rem';
                const cartFontWeight = cs.fontWeight || childData.props.fontWeight || '700';
                const cartWidth = cs.width || childData.props.width || 'auto';
                childEl.style.cssText = `padding:${cartPadding};background:${cartBg};color:${cartColor};border:none;border-radius:${cartRadius};cursor:pointer;font-size:${cartFontSize};font-weight:${cartFontWeight};width:${cartWidth};`;
                childEl.setAttribute('data-name', cs.name || childData.props.name || 'Product');
                childEl.setAttribute('data-price', cs.price || childData.props.price || '0');
                childEl.setAttribute('data-image', cs.image || childData.props.image || '');
            } else if (resolvedActionType === 'cart') {
                childEl = document.createElement('button');
                childEl.type = 'button';
                childEl.className = 'nav-btn';
                childEl.innerText = cs.text || childData.props.text || 'Button';
                const btnBg = cs.bgColor || childData.props.bgColor || 'var(--accent, #6c63ff)';
                const btnColor = cs.color || childData.props.color || '#fff';
                childEl.style.cssText = `padding:10px 20px;background:${btnBg};color:${btnColor};border:none;border-radius:6px;cursor:pointer;font-size:1rem;`;
            } else {
                childEl = document.createElement('a');
                childEl.className = 'nav-btn';
                childEl.href = resolvedHref;
                childEl.innerText = cs.text || childData.props.text || 'Button';
                const linkBg = cs.bgColor || childData.props.bgColor || 'var(--accent, #6c63ff)';
                const linkColor = cs.color || childData.props.color || '#fff';
                childEl.style.cssText = `padding:10px 20px;background:${linkBg};color:${linkColor};border:none;border-radius:6px;cursor:pointer;font-size:1rem;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;`;
            }
            }
        } else if (type === 'read-more') {
            const popupId = `sf_rm_${Math.random().toString(36).slice(2, 10)}`;
            const buttonText = cs.text || childData.props.text || 'Read More';
            const popupTitle = cs.popupTitle || childData.props.popupTitle || 'More Details';
            const popupText = cs.popupText || childData.props.popupText || 'Add your read more content from the Content tab.';
            const popupVariant = cs.popupVariant || childData.props.popupVariant || 'centered';
            const overlayAlign = popupVariant === 'side-panel'
                ? 'align-items:stretch;justify-content:flex-end;'
                : popupVariant === 'minimal'
                    ? 'align-items:flex-start;justify-content:center;padding-top:min(12vh,96px);'
                    : popupVariant === 'full-screen'
                        ? 'align-items:stretch;justify-content:stretch;padding:18px;'
                        : 'align-items:center;justify-content:center;';
            const cardStyle = popupVariant === 'side-panel'
                ? 'width:min(92vw,420px);height:100%;max-height:100vh;border-radius:24px 0 0 24px;display:flex;flex-direction:column;'
                : popupVariant === 'minimal'
                    ? 'width:min(92vw,420px);max-height:min(78vh,720px);border-radius:18px;display:flex;flex-direction:column;'
                    : popupVariant === 'full-screen'
                        ? 'width:100%;height:100%;max-width:none;max-height:none;border-radius:28px;display:flex;flex-direction:column;'
                        : 'width:min(92vw,540px);max-height:min(82vh,760px);border-radius:24px;display:flex;flex-direction:column;';
            childEl = document.createElement('div');
            childEl.className = 'sf-read-more-child';
            childEl.style.cssText = 'display:inline-flex;position:relative;';
            childEl.innerHTML = `
                <button type="button" style="display:inline-flex;align-items:center;gap:8px;padding:11px 16px;border:none;border-radius:999px;background:var(--accent);color:#fff;font-weight:700;cursor:pointer;box-shadow:0 10px 24px rgba(15,23,42,0.16);" onclick="if(document.getElementById('canvasFrame')){ return; } event.stopPropagation(); var modal=document.getElementById('${popupId}'); if(modal){ modal.style.display='flex'; document.body.style.overflow='hidden'; }">
                    <span>${buttonText}</span><i class="fa-solid fa-arrow-right-long"></i>
                </button>
                <div id="${popupId}" onclick="if(document.getElementById('canvasFrame')){ return; } if(event.target===this){this.style.display='none';document.body.style.overflow='';} event.stopPropagation();" style="display:none;position:fixed;inset:0;background:rgba(2,6,23,0.58);backdrop-filter:blur(10px);z-index:99999;padding:24px;${overlayAlign}">
                    <div onclick="event.stopPropagation()" style="position:relative;background:#fff;color:#0f172a;box-shadow:0 30px 90px rgba(15,23,42,0.24);padding:${popupVariant === 'minimal' ? '22px' : popupVariant === 'full-screen' ? '32px' : '28px'};${cardStyle}">
                        <button type="button" onclick="if(document.getElementById('canvasFrame')){ return; } var modal=document.getElementById('${popupId}'); if(modal){ modal.style.display='none'; document.body.style.overflow=''; } event.stopPropagation();" style="position:absolute;top:14px;right:14px;width:36px;height:36px;border:none;border-radius:50%;background:#eef2f7;color:#0f172a;font-size:1.2rem;cursor:pointer;">&times;</button>
                        <div style="font-size:${popupVariant === 'minimal' ? '1.15rem' : '1.5rem'};font-weight:800;line-height:1.15;margin-bottom:12px;padding-right:42px;flex:0 0 auto;">${popupTitle}</div>
                        <div style="font-size:0.96rem;line-height:1.8;color:#475569;overflow-y:auto;flex:1 1 auto;padding-right:6px;word-break:break-word;">${popupText}</div>
                    </div>
                </div>
            `;
        } else if (type === 'div' && !childData.props.html) {
            childEl = document.createElement('div');
            childEl.style.cssText = 'min-height:50px;width:100%;background:rgba(0,0,0,0.02);border:1px dashed #ccc;padding:10px;display:flex;flex-direction:column;gap:10px;box-sizing:border-box;';
        } else {
            // Generic html tag support (h2, p, a, div with html, etc)
            childEl = document.createElement(type || 'p');
            // Restore inner HTML or text
            if (childData.props.html) {
                childEl.innerHTML = childData.props.html;
            } else {
                childEl.innerText = cs.text || childData.props.text || 'New text...';
            }
            if (type === 'a' && childData.props.href) {
                childEl.href = childData.props.href;
            }
        }
        
        // Only apply default margins to components that aren't promoted from templates
        if (!childData.promoted) {
            childEl.style.margin = '10px 0';
            childEl.style.display = 'block';
        }
        
        return childEl;
    }

    function isDescendantPath(parentPath, childPath) {
        return !!parentPath && !!childPath && childPath.startsWith(parentPath + '.');
    }

    function getActionablePath(path) {
        const rawPath = String(path || '');
        const parts = rawPath.split('.');
        for (let i = parts.length; i > 0; i--) {
            const candidate = parts.slice(0, i).join('.');
            const candidateType = State._pathType(candidate);
            if (candidateType === 'repeater' || candidateType === 'dynamic') return candidate;
        }
        return rawPath;
    }

    function getRepeaterParentPath(path) {
        const parts = String(path || '').split('.');
        parts.pop();
        return parts.join('.');
    }

    function handleSubElementDrop(targetBlockId, targetPath) {
        if (!draggedSubElement) return;

        const sourceBlockId = draggedSubElement.blockId;
        const sourcePath = ensurePromoted(sourceBlockId, draggedSubElement.path);
        const normalizedTargetPath = ensurePromoted(targetBlockId, targetPath);
        if (!normalizedTargetPath) return;
        if (sourceBlockId === targetBlockId && (sourcePath === normalizedTargetPath || isDescendantPath(sourcePath, normalizedTargetPath))) {
            return;
        }

        const targetBlock = State.getBlock(targetBlockId);
        if (!targetBlock) return;
        if (!targetBlock.props.subStyles) targetBlock.props.subStyles = {};
        const targetParent = normalizedTargetPath === ''
            ? targetBlock.props.subStyles
            : (targetBlock.props.subStyles[normalizedTargetPath] = targetBlock.props.subStyles[normalizedTargetPath] || {});
        const insertIndex = Array.isArray(targetParent.children) ? targetParent.children.length : 0;

        if (sourceBlockId === targetBlockId) {
            State.moveSubElementToNewParent(targetBlockId, sourcePath, normalizedTargetPath, insertIndex);
        } else {
            State.moveSubElementBetweenBlocks(sourceBlockId, sourcePath, targetBlockId, normalizedTargetPath, insertIndex);
        }
    }

    function snapshotElementForMove(el) {
        if (!el || !el.tagName) return null;
        const tag = el.tagName.toLowerCase();
        const style = window.getComputedStyle(el);
        const childStyle = {
            display: style.display,
            margin: style.margin,
            padding: style.padding,
            color: style.color,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            background: style.background,
            borderRadius: style.borderRadius,
            border: style.border,
            width: el.style.width || '',
            height: el.style.height || ''
        };

        const props = {
            html: el.innerHTML,
            text: el.innerText,
            src: el.getAttribute('src') || '',
            href: el.getAttribute('href') || ''
        };

        if (tag === 'img') {
            return { childData: { type: 'img', props: { src: props.src } }, childStyle };
        }
        if (tag === 'iframe') {
            return { childData: { type: 'video', props: { src: el.getAttribute('src') || '' } }, childStyle };
        }
        if (tag === 'button') {
            return { childData: { type: 'button', props: { text: props.text } }, childStyle };
        }

        return { childData: { type: tag, props }, childStyle };
    }

    function clearSubDropTarget() {
        if (activeSubDropTarget) {
            activeSubDropTarget.classList.remove('sf-sub-drop-zone');
            activeSubDropTarget = null;
        }
    }

    function startToolbarSubDrag(blockId, path, sourceTarget, toolbarEl, startEvent) {
        const normalizedPath = ensurePromoted(blockId, path);
        draggedSubElement = { blockId, path: normalizedPath };
        State.setSelected(blockId);
        State.setSelectedSubPath(normalizedPath);

        const ghost = document.createElement('div');
        ghost.className = 'sf-drag-ghost';
        ghost.textContent = 'Moving element';
        ghost.style.cssText = `
            position: fixed;
            left: ${startEvent.clientX + 14}px;
            top: ${startEvent.clientY + 14}px;
            background: rgba(17, 24, 39, 0.95);
            color: #fff;
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 999px;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: 600;
            z-index: 5000;
            pointer-events: none;
            box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        `;
        document.body.appendChild(ghost);

        if (toolbarEl) toolbarEl.style.pointerEvents = 'none';
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';

        const onMove = (moveEvent) => {
            ghost.style.left = `${moveEvent.clientX + 14}px`;
            ghost.style.top = `${moveEvent.clientY + 14}px`;

            clearSubDropTarget();
            const el = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
            const candidate = el && el.closest ? el.closest('[data-sf-path]') : null;
            if (!candidate || !canHostSubElements(candidate)) return;

            const blockEl = candidate.closest('.canvas-block');
            if (!blockEl) return;
            const candidateBlockId = blockEl.dataset.id;
            const candidatePath = candidate.getAttribute('data-sf-path');
            if (!candidatePath) return;

            const sameElement = candidateBlockId === blockId && candidatePath === normalizedPath;
            const insideDragged = candidateBlockId === blockId && isDescendantPath(normalizedPath, candidatePath);
            if (sameElement || insideDragged) return;

            candidate.classList.add('sf-sub-drop-zone');
            activeSubDropTarget = candidate;
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            if (toolbarEl) toolbarEl.style.pointerEvents = '';
            ghost.remove();

            if (activeSubDropTarget) {
                const blockEl = activeSubDropTarget.closest('.canvas-block');
                const targetBlockId = blockEl?.dataset.id;
                const targetPath = activeSubDropTarget.getAttribute('data-sf-path');
                clearSubDropTarget();
                if (targetBlockId && targetPath) {
                    const snapshot = snapshotElementForMove(sourceTarget);
                    if (snapshot) {
                        const normalizedTargetPath = ensurePromoted(targetBlockId, targetPath);
                        const newPath = State.appendSubElement(targetBlockId, normalizedTargetPath, snapshot.childData, snapshot.childStyle);
                        if (newPath) {
                            State.hideSubElement(blockId, normalizedPath);
                            State.setSelected(targetBlockId);
                            State.setSelectedSubPath(newPath);
                        }
                    }
                }
            } else {
                clearSubDropTarget();
            }

            draggedSubElement = null;
            activeSubDrag = null;
        };

        activeSubDrag = { onMove, onUp, ghost };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }

    function startRepeaterToolbarDrag(blockId, path, sourceTarget, toolbarEl, startEvent) {
        const actionablePath = getActionablePath(path);
        const blockEl = document.getElementById('block_' + blockId);
        const sourceEl = blockEl?.querySelector?.(`[data-sf-path="${actionablePath}"]`) || sourceTarget;
        if (!sourceEl) return;

        State.setSelected(blockId);
        State.setSelectedSubPath(actionablePath);

        const ghost = document.createElement('div');
        ghost.className = 'sf-drag-ghost';
        ghost.textContent = 'Reordering layout item';
        ghost.style.cssText = `
            position: fixed;
            left: ${startEvent.clientX + 14}px;
            top: ${startEvent.clientY + 14}px;
            background: rgba(17, 24, 39, 0.95);
            color: #fff;
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 999px;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: 600;
            z-index: 5000;
            pointer-events: none;
            box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        `;
        document.body.appendChild(ghost);

        if (toolbarEl) toolbarEl.style.pointerEvents = 'none';
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';

        let activeCandidate = null;
        const clearCandidate = () => {
            if (!activeCandidate) return;
            activeCandidate.style.boxShadow = '';
            activeCandidate = null;
        };

        const onMove = (moveEvent) => {
            ghost.style.left = `${moveEvent.clientX + 14}px`;
            ghost.style.top = `${moveEvent.clientY + 14}px`;
            clearCandidate();
            const el = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
            const candidate = el?.closest?.('[data-sf-path]');
            if (!candidate) return;
            const candidateBlockId = candidate.closest('.canvas-block')?.dataset.id;
            const candidatePath = getActionablePath(candidate.getAttribute('data-sf-path'));
            if (candidateBlockId !== blockId || candidatePath === actionablePath) return;
            if (State._pathType(candidatePath) !== 'repeater') return;
            if (getRepeaterParentPath(candidatePath) !== getRepeaterParentPath(actionablePath)) return;

            const rect = candidate.getBoundingClientRect();
            const before = moveEvent.clientY < rect.top + rect.height / 2;
            candidate.style.boxShadow = before ? 'inset 0 4px 0 var(--accent)' : 'inset 0 -4px 0 var(--accent)';
            activeCandidate = candidate;
            activeCandidate.dataset.sfDropBefore = before ? 'true' : 'false';
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            if (toolbarEl) toolbarEl.style.pointerEvents = '';
            ghost.remove();

            if (activeCandidate) {
                const candidatePath = getActionablePath(activeCandidate.getAttribute('data-sf-path'));
                const targetIndex = parseInt(candidatePath.split('.').pop(), 10);
                const sourceIndex = parseInt(actionablePath.split('.').pop(), 10);
                let newIndex = targetIndex;
                if (activeCandidate.dataset.sfDropBefore !== 'true') {
                    newIndex = targetIndex + (sourceIndex < targetIndex ? 0 : 1);
                } else if (sourceIndex < targetIndex) {
                    newIndex = targetIndex - 1;
                }
                clearCandidate();
                if (Number.isFinite(newIndex)) {
                    State.reorderSubElement(blockId, actionablePath, newIndex);
                }
            } else {
                clearCandidate();
            }
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }

    let currentPenTool = null;
    function getPenToolKey(blockId, path) {
        return `${blockId}::${path}`;
    }

    function showPenTool(target, blockId, path, e = null) {
        if (!document.body.classList.contains('structure-view')) {
            hidePenTool();
            return;
        }
        hidePenTool();

        // Visual selection on target
        target.classList.add('sf-sub-selected');

        // Create Sub-element Resize Handles
        createSubResizeHandles(target, blockId, path);

        const rect = target.getBoundingClientRect();
        
        let topPos = rect.top - 12;
        let leftPos = rect.right - 12; // Fallback to right edge for small things
        
        // If we have mouse coordinates, use them (much better for wide blocks)
        if (e) {
            topPos = e.clientY - 45;
            leftPos = e.clientX - 15;
        }
        
        const savedPenPos = floatingPenTools[getPenToolKey(blockId, path)];

        // Create container for buttons
        const container = document.createElement('div');
        container.className = 'sf-pen-tool-container';
        container.style.cssText = `
            position: fixed;
            top: ${topPos}px;
            left: ${leftPos}px;
            display: flex;
            align-items: center;
            gap: 0;
            z-index: 3000;
            pointer-events: auto;
            background: rgba(15, 23, 42, 0.96);
            border: 1px solid rgba(255, 255, 255, 0.14);
            backdrop-filter: blur(10px);
            padding: 4px;
            border-radius: 999px;
            box-shadow: 0 14px 34px rgba(2, 6, 23, 0.34);
            overflow: hidden;
            transition: gap 0.2s ease;
        `;
        const initialPos = savedPenPos || clampFloatingPosition(leftPos, topPos, container, 10);
        container.style.top = `${initialPos.top}px`;
        container.style.left = `${initialPos.left}px`;

        // Bubble trigger for pen tool
        const penBubbleTrigger = document.createElement('button');
        penBubbleTrigger.className = 'sf-pen-tool sf-pen-bubble-trigger';
        penBubbleTrigger.innerHTML = '<i class="fa-solid fa-pen"></i>';
        penBubbleTrigger.title = 'Toggle pen tool actions';
        penBubbleTrigger.style.cssText = `
            width: 30px; height: 30px; border-radius: 10px;
            background: #6c63ff; color: #fff; border: none;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            font-size: 0.78rem; flex-shrink: 0; transition: transform 0.15s;
        `;
        let penExpanded = false;
        let penDragStarted = false;
        
        penBubbleTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (penDragStarted) { penDragStarted = false; return; }
            penExpanded = !penExpanded;
            container.style.gap = penExpanded ? '6px' : '0';
            container.querySelectorAll('.sf-pen-tool:not(.sf-pen-bubble-trigger)').forEach(btn => {
                btn.style.width = penExpanded ? '30px' : '0';
                btn.style.opacity = penExpanded ? '1' : '0';
                btn.style.padding = penExpanded ? '0' : '0';
                btn.style.overflow = 'hidden';
            });
        });
        
        // Drag the bubble by holding the trigger
        penBubbleTrigger.addEventListener('mousedown', (evt) => {
            if (evt.button !== 0) return;
            evt.preventDefault(); evt.stopPropagation();
            const startX = evt.clientX, startY = evt.clientY;
            const startLeft = parseFloat(container.style.left) || 0;
            const startTop = parseFloat(container.style.top) || 0;
            let moved = false;
            const onMove = (me) => {
                const dx = me.clientX - startX, dy = me.clientY - startY;
                if (!moved && Math.abs(dx) + Math.abs(dy) > 5) moved = true;
                if (moved) {
                    penDragStarted = true;
                    const pos = clampFloatingPosition(startLeft + dx, startTop + dy, container);
                    container.style.left = pos.left + 'px';
                    container.style.top = pos.top + 'px';
                }
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                if (moved) {
                    floatingPenTools[getPenToolKey(blockId, path)] = {
                        left: parseFloat(container.style.left),
                        top: parseFloat(container.style.top)
                    };
                    if (currentPenTool) currentPenTool.manualPosition = floatingPenTools[getPenToolKey(blockId, path)];
                }
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
        
        container.appendChild(penBubbleTrigger);

        const isDynamic = path.includes('c'); // Path contains c (e.g. 0.c0 or c0)

        // Helper to create buttons
        const createBtn = (icon, title, color, onClick) => {
            const btn = document.createElement('button');
            btn.className = 'sf-pen-tool';
            btn.innerHTML = `<i class="fa-solid ${icon}"></i>`;
            btn.title = title;
            btn.style.cssText = `
                width: 0;
                height: 30px;
                border-radius: 10px;
                background: #111111;
                color: #ffffff;
                border: 1px solid #111111;
                box-shadow: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content:center;
                font-size: 0.78rem;
                opacity: 0;
                overflow: hidden;
                flex-shrink: 0;
                transition: width 0.2s ease, opacity 0.2s ease, transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
            `;
            btn.onmouseenter = () => {
                btn.style.transform = 'translateY(-1px)';
                btn.style.borderColor = '#000000';
            };
            btn.onmouseleave = () => {
                btn.style.transform = 'translateY(0)';
                btn.style.borderColor = '#111111';
            };
            btn.onclick = (e) => {
                e.stopPropagation();
                onClick();
            };
            return btn;
        };

        // --- Manipulation Helpers ---
        function handleAction(actionFn) {
            const newPath = ensurePromoted(blockId, actionPath);
            actionFn(blockId, newPath || actionPath);
        }

        function selectPath(nextPath) {
            if (!nextPath) return;
            State.setSelected(blockId);
            State.setSelectedSubPath(nextPath);
        }

        function getParentPath() {
            const parentEl = target.parentElement?.closest?.('[data-sf-path]');
            return parentEl ? parentEl.getAttribute('data-sf-path') : null;
        }

        function getChildPath() {
            const childEl = target.querySelector?.('[data-sf-path]');
            return childEl ? childEl.getAttribute('data-sf-path') : null;
        }
        const actionPath = getActionablePath(path);
        const actionPathType = State._pathType(actionPath);
        const isLayoutItemAction = actionPath !== path && (actionPathType === 'repeater' || actionPathType === 'dynamic');

        // 1. Drag Button
        const toolbarMoveBtn = document.createElement('div');
        toolbarMoveBtn.className = 'sf-pen-tool sf-pen-tool-move';
        toolbarMoveBtn.innerHTML = '<i class="fa-solid fa-up-down-left-right"></i>';
        toolbarMoveBtn.title = 'Move this toolbar';
        toolbarMoveBtn.style.cssText = `
            width: 0;
            height: 30px;
            border-radius: 10px;
            background: #111111;
            color: #ffffff;
            border: 1px solid #111111;
            cursor: move;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            overflow: hidden;
            flex-shrink: 0;
            transition: width 0.2s ease, opacity 0.2s ease;
            font-size: 0.8rem;
            user-select: none;
        `;
        toolbarMoveBtn.onmouseenter = () => {
            toolbarMoveBtn.style.transform = 'translateY(-1px)';
            toolbarMoveBtn.style.borderColor = '#000000';
        };
        toolbarMoveBtn.onmouseleave = () => {
            toolbarMoveBtn.style.transform = 'translateY(0)';
            toolbarMoveBtn.style.borderColor = '#111111';
        };
        toolbarMoveBtn.addEventListener('mousedown', (evt) => {
            startFloatingToolbarDrag(
                evt,
                container,
                () => ({
                    left: floatingPenTools[getPenToolKey(blockId, path)]?.left ?? (parseFloat(container.style.left) || 10),
                    top: floatingPenTools[getPenToolKey(blockId, path)]?.top ?? (parseFloat(container.style.top) || 10)
                }),
                (nextPos) => {
                    floatingPenTools[getPenToolKey(blockId, path)] = nextPos;
                    if (currentPenTool) currentPenTool.manualPosition = nextPos;
                }
            );
        });
        toolbarMoveBtn.addEventListener('dblclick', (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            delete floatingPenTools[getPenToolKey(blockId, path)];
            if (currentPenTool) currentPenTool.manualPosition = null;
            updatePenToolPosition();
        });
        container.appendChild(toolbarMoveBtn);

        // 1. Drag Button
        const dragBtn = document.createElement('div');
        dragBtn.className = 'sf-pen-tool sf-pen-tool-drag';
        dragBtn.innerHTML = '<i class="fa-solid fa-grip-lines"></i>';
        dragBtn.title = 'Drag this element';
        dragBtn.style.cssText = `
            width: 0;
            height: 30px;
            border-radius: 10px;
            background: #111111;
            color: #fff;
            border: 1px solid #111111;
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            user-select: none;
            opacity: 0;
            overflow: hidden;
            flex-shrink: 0;
            transition: width 0.2s ease, opacity 0.2s ease;
        `;
        dragBtn.onmouseenter = () => {
            dragBtn.style.transform = 'translateY(-1px)';
            dragBtn.style.borderColor = '#000000';
        };
        dragBtn.onmouseleave = () => {
            dragBtn.style.transform = 'translateY(0)';
            dragBtn.style.borderColor = '#111111';
        };
        dragBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        dragBtn.addEventListener('mousedown', (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            if (actionPathType === 'repeater') {
                startRepeaterToolbarDrag(blockId, actionPath, target, container, evt);
                return;
            }
            startToolbarSubDrag(blockId, actionPath, target, container, evt);
        });
        container.appendChild(dragBtn);

        // 2. Up Button
        container.appendChild(createBtn('fa-arrow-up', 'Move Up', 'rgba(255,255,255,0.12)', () => {
            handleAction((bid, resolvedPath) => State.moveSubElement(bid, resolvedPath, 'up'));
        }));

        // 3. Down Button
        container.appendChild(createBtn('fa-arrow-down', 'Move Down', 'rgba(255,255,255,0.12)', () => {
            handleAction((bid, resolvedPath) => State.moveSubElement(bid, resolvedPath, 'down'));
        }));

        // 4. Copy Button
        container.appendChild(createBtn('fa-copy', 'Duplicate', 'rgba(255,255,255,0.12)', () => {
            handleAction((bid, resolvedPath) => State.duplicateSubElement(bid, resolvedPath));
        }));

        // 5. Parent Select Button
        container.appendChild(createBtn('fa-level-up-alt', 'Select parent element', 'rgba(255,255,255,0.12)', () => {
            const parentPath = getParentPath();
            if (!parentPath) {
                if (window.showToast) window.showToast('No parent element found for this selection.', 'info');
                return;
            }
            selectPath(parentPath);
        }));

        // 6. Child Select Button
        container.appendChild(createBtn('fa-level-down-alt', 'Select first child element', 'rgba(255,255,255,0.12)', () => {
            const childPath = getChildPath();
            if (!childPath) {
                if (window.showToast) window.showToast('No child element found inside this selection.', 'info');
                return;
            }
            selectPath(childPath);
        }));

        // 7. Delete Button (for ALL)
        container.appendChild(createBtn('fa-trash', 'Delete this element', 'rgba(239,68,68,0.18)', () => {
            if (confirm(isLayoutItemAction ? 'Delete this whole layout item?' : 'Delete this element?')) {
                handleAction((bid, resolvedPath) => State.removeSubElement(bid, resolvedPath));
                showToast(isLayoutItemAction ? 'Layout item deleted.' : 'Element deleted.', 'info');
            }
        }));

        if (isLayoutItemAction) {
            const infoPill = document.createElement('div');
            infoPill.style.cssText = `
                grid-column: 1 / -1;
                padding: 4px 2px 0;
                color: rgba(255,255,255,0.72);
                font-size: 10px;
                line-height: 1.4;
                text-align: left;
            `;
            infoPill.textContent = 'Actions apply to the whole layout item so the grid stays safe.';
            container.appendChild(infoPill);
        }

        document.body.appendChild(container);

        currentPenTool = { el: container, target: target, path: path, blockId, manualPosition: savedPenPos || null };
    }

    // Reposition pen tool on scroll/resize or re-render
    function updatePenToolPosition() {
        if (!document.body.classList.contains('structure-view')) {
            hidePenTool();
            return;
        }
        if (currentPenTool && currentPenTool.target) {
            if (currentPenTool.manualPosition) {
                const next = clampFloatingPosition(currentPenTool.manualPosition.left, currentPenTool.manualPosition.top, currentPenTool.el, 10);
                currentPenTool.el.style.top = `${next.top}px`;
                currentPenTool.el.style.left = `${next.left}px`;
                return;
            }
            const rect = currentPenTool.target.getBoundingClientRect();
            const next = clampFloatingPosition(rect.right - 12, rect.top - 12, currentPenTool.el, 10);
            currentPenTool.el.style.top = `${next.top}px`;
            currentPenTool.el.style.left = `${next.left}px`;
        }
    }

    window.addEventListener('scroll', updatePenToolPosition, true);
    window.addEventListener('resize', updatePenToolPosition);
    State.on('blockUpdated', () => setTimeout(updatePenToolPosition, 0)); // Delay slightly to ensure DOM is ready

    function hidePenTool() {
        if (currentPenTool) {
            currentPenTool.el.remove();
            if (currentPenTool.target) {
                currentPenTool.target.classList.remove('sf-sub-selected');
                // Remove resize handles
                const handles = currentPenTool.target.querySelectorAll('.sf-sub-resize-handle');
                handles.forEach(h => h.remove());
            }
            currentPenTool = null;
        }
    }

    function createSubResizeHandles(target, blockId, path) {
        if (!document.body.classList.contains('structure-view')) return;
        // Remove existing handles if any
        target.querySelectorAll('.sf-sub-resize-handle').forEach(h => h.remove());

        const createHandle = (type) => {
            const h = document.createElement('div');
            h.className = 'sf-sub-resize-handle sf-sub-resize-' + type;
            let style = 'position:absolute; background:var(--accent); z-index:2000; border:1px solid #fff; pointer-events:auto;';
            if (type === 'v') style += 'height:6px; left:0; right:0; bottom:-3px; cursor:ns-resize; border-radius:999px;';
            if (type === 'h') style += 'width:6px; top:0; bottom:0; right:-3px; cursor:ew-resize; border-radius:999px;';
            if (type === 'both') style += 'width:10px; height:10px; right:-5px; bottom:-5px; cursor:nwse-resize; border-radius:999px;';
            h.style.cssText = style;
            
            h.addEventListener('mousedown', (e) => {
                e.stopPropagation(); e.preventDefault();
                const startX = e.clientX;
                const startY = e.clientY;
                const rect = target.getBoundingClientRect();
                const startW = rect.width;
                const startH = rect.height;

                const onMove = (me) => {
                    const dx = me.clientX - startX;
                    const dy = me.clientY - startY;
                    if (type === 'h' || type === 'both') target.style.width = (startW + dx) + 'px';
                    if (type === 'v' || type === 'both') target.style.height = (startH + dy) + 'px';
                };
                const onUp = (ue) => {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                    const dx = ue.clientX - startX;
                    const dy = ue.clientY - startY;
                    const finalW = (startW + dx) + 'px';
                    const finalH = (startH + dy) + 'px';
                    
                    const updates = {};
                    if (type === 'h' || type === 'both') updates.width = finalW;
                    if (type === 'v' || type === 'both') updates.height = finalH;
                    
                    State.updateSubStyle(blockId, path, updates);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
            return h;
        };

        // Ensure target has relative/absolute position so handles work
        if (window.getComputedStyle(target).position === 'static') {
            target.style.position = 'relative';
        }

        target.appendChild(createHandle('v'));
        target.appendChild(createHandle('h'));
        target.appendChild(createHandle('both'));
    }

    function ensurePromoted(blockId, path) {
        const block = State.getBlock(blockId);
        if (!block) return path;

        if (/^\d+$/.test(path)) {
            const blockEl = document.getElementById('block_' + blockId);
            if (!blockEl) return path;

            const parentEl = blockEl.querySelector('.block-content');
            if (!parentEl) return path;

            const children = Array.from(parentEl.children).map(child => {
                const tagName = child.tagName.toLowerCase();
                return {
                    type: tagName,
                    promoted: true,
                    props: {
                        html: child.innerHTML,
                        src: child.src || '',
                        href: child.href || '',
                        text: child.innerText
                    }
                };
            });

            Array.from(parentEl.children).forEach((child, idx) => {
                const newChildPath = `c${idx}`;
                if (!block.props.subStyles) block.props.subStyles = {};
                const childStyleObj = block.props.subStyles[newChildPath] || {};
                const ds = window.getComputedStyle(child);
                if (!childStyleObj.color) childStyleObj.color = ds.color;
                if (!childStyleObj.fontSize) childStyleObj.fontSize = ds.fontSize;
                if (!childStyleObj.fontWeight) childStyleObj.fontWeight = ds.fontWeight;
                if (!childStyleObj.margin) childStyleObj.margin = ds.margin;
                if (!childStyleObj.padding) childStyleObj.padding = ds.padding;
                if (!childStyleObj.display) childStyleObj.display = ds.display;
                block.props.subStyles[newChildPath] = childStyleObj;
            });

            State.promoteTemplateChildren(blockId, '', children);
            return 'c' + path;
        }

        if (!path.includes('.t')) return path; // Already dynamic or repeater
        
        const parts = path.split('.');
        
        // Find the FIRST part that is a template index
        let tIdx = -1;
        for(let i=0; i<parts.length; i++) {
            if (parts[i].startsWith('t')) { tIdx = i; break; }
        }
        if (tIdx === -1) return path;

        const parentPath = parts.slice(0, tIdx).join('.');
        const blockEl = document.getElementById('block_' + blockId);
        if (!blockEl) return path;

        // Find the actual DOM element for the parent
        const parentEl = parentPath === '' 
            ? blockEl.querySelector('.block-content').firstElementChild 
            : blockEl.querySelector(`[data-sf-path="${parentPath}"]`);
        
        if (!parentEl) return path;

        // Extract all children from DOM to materialize them in state
        const children = Array.from(parentEl.children).map(child => {
            const tagName = child.tagName.toLowerCase();
            return {
                type: tagName,
                promoted: true,
                props: {
                    html: child.innerHTML,
                    src: child.src || '',
                    href: child.href || '',
                    text: child.innerText
                }
            };
        });

        // 2. Pre-fill subStyles so they retain their layout visually!
        Array.from(parentEl.children).forEach((child, idx) => {
            const newChildPath = parentPath ? `${parentPath}.c${idx}` : `c${idx}`;
            if (!block.props.subStyles) block.props.subStyles = {};
            const childStyleObj = block.props.subStyles[newChildPath] || {};
            
            // Extract core styles from the DOM to persist in state so it doesn't lose original template style
            const ds = window.getComputedStyle(child);
            if (!childStyleObj.color) childStyleObj.color = ds.color;
            if (!childStyleObj.fontSize) childStyleObj.fontSize = ds.fontSize;
            if (!childStyleObj.fontWeight) childStyleObj.fontWeight = ds.fontWeight;
            if (!childStyleObj.margin) childStyleObj.margin = ds.margin;
            if (!childStyleObj.padding) childStyleObj.padding = ds.padding;
            if (!childStyleObj.display) childStyleObj.display = ds.display;
            
            block.props.subStyles[newChildPath] = childStyleObj;
        });

        State.promoteTemplateChildren(blockId, parentPath, children);
        
        // Construct the new path: the first .tX becomes .cX
        const newParts = [...parts];
        newParts[tIdx] = 'c' + newParts[tIdx].substring(1);
        return newParts.join('.');
    }

    return { init, renderAll, initContextMenu, _showPasteHint, _hidePasteHint };

})();
