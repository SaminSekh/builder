// ============================================================
// canvas.js – Canvas rendering and drag-and-drop handling
// ============================================================

const Canvas = (() => {
    let dropIndex = null;
    let draggedBlockId = null;

    function init() {
        const canvas = document.getElementById('canvas');

        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            canvas.classList.add('drag-over');

            // Only handle drops at the root Level (not into containers) here
            // If dragging over a container, the container's own listener handles it
            if (e.target === canvas || e.target.id === 'canvas-empty-state') {
                const afterEl = getDragAfterElement(canvas, e.clientX, e.clientY);
                dropIndex = afterEl ? getBlockIndexFromEl(afterEl) : null;
            }
        });

        canvas.addEventListener('dragleave', (e) => {
            if (!canvas.contains(e.relatedTarget)) {
                canvas.classList.remove('drag-over');
            }
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            canvas.classList.remove('drag-over');

            if (draggedBlockId) {
                // Re-parenting existing block to root
                State.updateBlockParent(draggedBlockId, null, dropIndex);
                State.setSelected(draggedBlockId);
                return;
            }

            const type = e.dataTransfer.getData('text/plain');
            if (!type || !BlockTypes[type]) return;
            const def = BlockTypes[type];
            const id = State.addBlock({ type, props: JSON.parse(JSON.stringify(def.defaultProps)) }, dropIndex);
            State.setSelected(id);
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

        // ---- State listeners ----
        State.on('blocksChanged', renderAll);
        State.on('blockUpdated', (id) => renderBlock(id));
        State.on('selectionChanged', updateSelection);
        State.on('subSelectionChanged', (path) => {
            if (!path) {
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

    function renderAll() {
        State.sanitize();
        const canvas = document.getElementById('canvas');
        canvas.innerHTML = '';
        const rootBlocks = State.getBlocks(null); // Get blocks with no parent

        const empty = document.createElement('div');
        empty.id = 'canvas-empty-state';
        empty.innerHTML = `<i class="fa-solid fa-hand-pointer fa-2xl"></i><p>Drag components from the left panel<br/>and drop them here to start building.</p>`;

        if (State.getAllBlocks().length === 0) {
            canvas.appendChild(empty);
            return;
        }

        rootBlocks.forEach(block => {
            canvas.appendChild(createBlockEl(block));
        });
        // Re-establish selection outline
        updateSelection(State.getSelectedId());
    }

    function renderBlock(id) {
        const el = document.getElementById('block_' + id);
        if (!el) { renderAll(); return; }
        const block = State.getBlock(id);
        if (!block) return;
        const newEl = createBlockEl(block);
        el.replaceWith(newEl);
        if (State.getSelectedId() === id) newEl.classList.add('selected');
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
      <button class="block-action-btn drag-handle" title="Drag to reorder" data-id="${block.id}"><i class="fa-solid fa-grip-vertical"></i></button>
      <button class="block-action-btn move-up" title="Move Up" data-id="${block.id}"><i class="fa-solid fa-arrow-up"></i></button>
      <button class="block-action-btn move-down" title="Move Down" data-id="${block.id}"><i class="fa-solid fa-arrow-down"></i></button>
      <button class="block-action-btn dup-btn" title="Duplicate" data-id="${block.id}"><i class="fa-solid fa-copy"></i></button>
      <button class="block-action-btn del-btn" title="Delete" data-id="${block.id}"><i class="fa-solid fa-trash"></i></button>
    `;

        // Render preview HTML
        const content = document.createElement('div');
        content.className = 'block-content';
        content.style.pointerEvents = 'auto'; // Enable pointer events for sub-selection
        content.innerHTML = def.render(block.props);

        // Execute any scripts within the rendered HTML (since innerHTML does not run scripts)
        const scripts = content.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            newScript.textContent = oldScript.textContent;
            document.body.appendChild(newScript);
            setTimeout(() => newScript.remove(), 500);
        });

        // Ensure inner element fills the wrapper but keeps its other styles
        const firstChild = content.firstElementChild;
        if (firstChild) {
            firstChild.style.width = '100%';
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

        content.addEventListener('click', (e) => {
            // Only handle if structure view is ON or if user is clicking a sub-element
            if (!document.body.classList.contains('structure-view')) return;

            // Find the closest element that has a structure path BUT IS NOT an internal wrapper
            const target = e.target.closest('.sf-sub-selected') || e.target.closest('[data-sf-path]:not(.sf-internal)');
            if (!target || target === content) return;

            e.stopPropagation();
            const path = target.getAttribute('data-sf-path');
            if (path) {
                State.setSelected(block.id);
                showPenTool(target, block.id, path, e);
                State.setSelectedSubPath(path); // Open properties panel immediately
            }
        });

        // --- Recursive Rendering for Containers & Boxes ---
        if (block.type === 'container' || block.type === 'box') {
            const inner = content.querySelector('.container-inner');
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

                // Make the inner container a drop zone
                inner.style.pointerEvents = 'auto'; // Enable pointer events for drop zone
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

                    // Calculate drop index within this container
                    const afterEl = getDragAfterElement(inner, e.clientX, e.clientY);
                    const siblings = State.getBlocks(block.id);
                    let index = siblings.length; // Default to end
                    if (afterEl) {
                        const childId = afterEl.dataset.id;
                        index = siblings.findIndex(c => c.id === childId);
                    }

                    const type = e.dataTransfer.getData('text/plain') || (draggedBlockId ? State.getBlock(draggedBlockId).type : null);
                    if (!type || !BlockTypes[type]) return;

                    // Restriction: Don't allow sections or navbars to be nested inside containers
                    const targetDef = BlockTypes[type];
                    if (targetDef.category === 'Sections' || targetDef.category === 'Navigation') {
                        // Redirect to root level
                        if (draggedBlockId) {
                            State.updateBlockParent(draggedBlockId, null, null);
                        } else {
                            const newId = State.addBlock({
                                type,
                                props: JSON.parse(JSON.stringify(targetDef.defaultProps))
                            }, null);
                            State.setSelected(newId);
                        }
                        showToast(`ℹ️ ${targetDef.label} must be at the root level (not nested).`, 'info');
                        return;
                    }

                    if (draggedBlockId) {
                        // Re-parenting existing block with index
                        State.updateBlockParent(draggedBlockId, block.id, index);
                        State.setSelected(draggedBlockId);
                        return;
                    }

                    // Add block as child of this container at specific index
                    const def = BlockTypes[type];
                    const id = State.addBlock({
                        type,
                        props: JSON.parse(JSON.stringify(def.defaultProps)),
                        parentId: block.id
                    }, index);
                    State.setSelected(id);
                });
            }
        }


        // Resize handles
        const resizeHandleV = document.createElement('div');
        resizeHandleV.className = 'resize-handle-v';
        resizeHandleV.title = 'Drag to resize height';
        resizeHandleV.style.cssText = 'position:absolute; bottom:-6px; left:50%; transform:translateX(-50%); width:60px; height:12px; background:var(--accent); border-radius:6px; cursor:ns-resize; display:none; z-index:1001; border: 2px solid #fff;';

        const resizeHandleH = document.createElement('div');
        resizeHandleH.className = 'resize-handle-h';
        resizeHandleH.title = 'Drag to resize width';
        resizeHandleH.style.cssText = 'position:absolute; right:-6px; top:50%; transform:translateY(-50%); width:12px; height:60px; background:var(--accent); border-radius:6px; cursor:ew-resize; display:none; z-index:1001; border: 2px solid #fff;';

        const resizeHandleBoth = document.createElement('div');
        resizeHandleBoth.className = 'resize-handle-both';
        resizeHandleBoth.title = 'Drag to resize both width and height';
        resizeHandleBoth.style.cssText = 'position:absolute; right:-8px; bottom:-8px; width:20px; height:20px; background:var(--accent); border-radius:4px; cursor:nwse-resize; display:none; z-index:1002; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);';

        wrapper.appendChild(toolbar);
        wrapper.appendChild(actions);
        wrapper.appendChild(content);
        wrapper.appendChild(resizeHandleV);
        wrapper.appendChild(resizeHandleH);
        wrapper.appendChild(resizeHandleBoth);

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
            e.stopPropagation();
            State.setSelected(block.id);
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
            // Only intercept for block-to-block reordering, not palette drags
            if (!draggedBlockId || draggedBlockId === block.id) return;
            e.preventDefault();
            e.stopPropagation();

            const rect = wrapper.getBoundingClientRect();
            // Determine if we are on the first half (top or left) of the block
            const isFirstHalf = (e.clientY < rect.top + rect.height / 2 && e.clientX < rect.right) || (e.clientX < rect.left + rect.width / 2);

            if (isFirstHalf) {
                wrapper.style.borderTop = '3px solid #6c63ff';
                wrapper.style.borderLeft = '3px solid #6c63ff';
                wrapper.style.borderBottom = '';
                wrapper.style.borderRight = '';
            } else {
                wrapper.style.borderBottom = '3px solid #6c63ff';
                wrapper.style.borderRight = '3px solid #6c63ff';
                wrapper.style.borderTop = '';
                wrapper.style.borderLeft = '';
            }
        });
        wrapper.addEventListener('dragleave', () => {
            wrapper.style.borderTop = '';
            wrapper.style.borderBottom = '';
            wrapper.style.borderLeft = '';
            wrapper.style.borderRight = '';
        });
        wrapper.addEventListener('drop', (e) => {
            wrapper.style.borderTop = '';
            wrapper.style.borderBottom = '';
            wrapper.style.borderLeft = '';
            wrapper.style.borderRight = '';

            // Only handle block-to-block reordering here
            if (!draggedBlockId || draggedBlockId === block.id) return;
            e.preventDefault();
            e.stopPropagation();

            const rect = wrapper.getBoundingClientRect();
            const fromIdx = State.getBlockIndex(draggedBlockId);
            const toIdx = State.getBlockIndex(block.id);

            const insertAfter = (e.clientY >= rect.top + rect.height / 2) || (e.clientX >= rect.left + rect.width / 2);
            reorderBlocks(fromIdx, toIdx, insertAfter);
        });


        // Action button events
        actions.querySelector('.move-up').addEventListener('click', (e) => {
            e.stopPropagation(); State.moveBlock(block.id, 'up');
        });
        actions.querySelector('.move-down').addEventListener('click', (e) => {
            e.stopPropagation(); State.moveBlock(block.id, 'down');
        });
        actions.querySelector('.dup-btn').addEventListener('click', (e) => {
            e.stopPropagation(); State.duplicateBlock(block.id);
        });
        actions.querySelector('.del-btn').addEventListener('click', (e) => {
            e.stopPropagation(); State.removeBlock(block.id);
        });

        return wrapper;
    }


    function reorderBlocks(fromIdx, toIdx, insertAfter) {
        if (fromIdx === -1 || toIdx === -1) return;
        const blocks = State.getAllBlocks();
        const moved = blocks[fromIdx];
        if (!moved) return;

        blocks.splice(fromIdx, 1);

        let newIdx = toIdx;
        if (fromIdx < toIdx && !insertAfter) newIdx = toIdx - 1;
        if (fromIdx > toIdx && insertAfter) newIdx = toIdx + 1;

        blocks.splice(Math.max(0, Math.min(newIdx, blocks.length)), 0, moved);
        State.importBlocks(blocks);
        State.setSelected(moved.id);
    }

    function updateSelection(id) {
        document.querySelectorAll('.canvas-block').forEach(el => el.classList.remove('selected'));
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
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
    }

    function hideContextMenu() {
        document.getElementById('contextMenu').classList.add('hidden');
        ctxTarget = null;
    }

    function initContextMenu() {
        document.addEventListener('click', hideContextMenu);
        document.getElementById('ctxMoveUp').addEventListener('click', () => { if (ctxTarget) State.moveBlock(ctxTarget, 'up'); });
        document.getElementById('ctxMoveDown').addEventListener('click', () => { if (ctxTarget) State.moveBlock(ctxTarget, 'down'); });
        document.getElementById('ctxDuplicate').addEventListener('click', () => { if (ctxTarget) State.duplicateBlock(ctxTarget); });
        document.getElementById('ctxDelete').addEventListener('click', () => { if (ctxTarget) State.removeBlock(ctxTarget); });
    }

    // ---- Sub-element Helpers ----
    function assignPathsAndStyles(container, block) {
        const subStyles = block.props.subStyles || {};

        function recurse(el, path) {
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
                if (s.color) el.style.setProperty('color', clean(s.color), 'important');
                if (s.fontSize) el.style.setProperty('font-size', clean(s.fontSize), 'important');
                if (s.fontWeight) el.style.setProperty('font-weight', clean(s.fontWeight), 'important');
                if (s.fontFamily) el.style.setProperty('font-family', clean(s.fontFamily), 'important');
                if (s.lineHeight) el.style.setProperty('line-height', clean(s.lineHeight), 'important');
                if (s.letterSpacing) el.style.setProperty('letter-spacing', clean(s.letterSpacing), 'important');
                if (s.textAlign) el.style.setProperty('text-align', clean(s.textAlign), 'important');

                // Visuals
                if (s.bgColor) el.style.setProperty('background-color', clean(s.bgColor), 'important');
                if (s.background) el.style.setProperty('background', clean(s.background), 'important');
                if (s.opacity) el.style.setProperty('opacity', clean(s.opacity), 'important');
                if (s.zIndex) el.style.setProperty('z-index', clean(s.zIndex), 'important');
                if (s.boxShadow) el.style.setProperty('box-shadow', clean(s.boxShadow), 'important');
                if (s.borderRadius) el.style.setProperty('border-radius', clean(s.borderRadius), 'important');
                if (s.border) el.style.setProperty('border', clean(s.border), 'important');
                if (s.borderWidth) el.style.setProperty('border-width', clean(s.borderWidth), 'important');
                if (s.borderStyle) el.style.setProperty('border-style', clean(s.borderStyle), 'important');
                if (s.borderColor) el.style.setProperty('border-color', clean(s.borderColor), 'important');

                // Effects
                if (s.opacity !== undefined) el.style.setProperty('opacity', clean(s.opacity), 'important');
                if (s.blur) el.style.setProperty('filter', `blur(${clean(s.blur)}px)`, 'important');

                // Visual Guide (Editor Only)
                if (s.visualGuide && s.visualGuide !== 'none') {
                    const color = s.visualGuide === 'red' ? '#ff4d4d' : '#2ecc71';
                    el.style.setProperty('outline', `3px dashed ${color}`, 'important');
                    el.style.setProperty('outline-offset', '-3px', 'important');
                }

                // Flexbox (Sub-elements)
                if (s.flexGrow !== undefined) el.style.setProperty('flex-grow', clean(s.flexGrow), 'important');
                if (s.flexShrink !== undefined) el.style.setProperty('flex-shrink', clean(s.flexShrink), 'important');

                // Behavior / Content
                const isContentTag = ['P', 'SPAN', 'A', 'BUTTON', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'FIGCAPTION', 'LABEL', 'I'].includes(el.tagName);
                if (s.text !== undefined && (el.children.length === 0 || isContentTag)) {
                    el.innerText = s.text;
                }
                if (s.customId) el.id = s.customId;
                if (s.customClass) el.className = s.customClass;
            }


            // 1. Existing children (from template)
            Array.from(el.children).forEach((child, i) => {
                recurse(child, path + '.' + i);
            });

            // 2. Dynamic children (added via Nesting feature)
            if (s.children && s.children.length > 0) {
                s.children.forEach((childData, i) => {
                    const childPath = path + '.c' + i;
                    const cs = subStyles[childPath] || {}; // Child's own sub-style overrides
                    let childEl;

                    if (childData.type === 'img') {
                        childEl = document.createElement('img');
                        childEl.src = cs.src || childData.props.src || '';
                        childEl.style.maxWidth = '100%';
                    } else if (childData.type === 'video') {
                        const container = document.createElement('div');
                        container.className = 'video-container';
                        container.style.position = 'relative';
                        container.style.paddingBottom = '56.25%';
                        container.style.height = '0';
                        container.style.overflow = 'hidden';

                        const iframe = document.createElement('iframe');
                        iframe.style.position = 'absolute';
                        iframe.style.top = '0'; iframe.style.left = '0';
                        iframe.style.width = '100%'; iframe.style.height = '100%';
                        iframe.style.border = '0';
                        const videoSrc = cs.src || childData.props.src || '';
                        iframe.src = VideoHelper.getEmbedUrl(videoSrc);

                        container.appendChild(iframe);
                        childEl = container;
                    } else if (childData.type === 'button') {
                        childEl = document.createElement('button');
                        childEl.className = 'nav-btn'; // Generic btn class
                        childEl.innerText = cs.text || childData.props.text || 'Button';
                        childEl.style.padding = '10px 20px';
                        childEl.style.background = 'var(--accent)';
                        childEl.style.color = '#fff';
                        childEl.style.border = 'none';
                        childEl.style.borderRadius = '6px';
                    } else if (childData.type === 'add-to-cart') {
                        childEl = document.createElement('button');
                        childEl.className = 'sf-add-to-cart';
                        childEl.innerText = cs.text || childData.props.text || 'Add to Cart';
                        childEl.style.padding = '10px 20px';
                        childEl.style.background = 'var(--accent, #6c63ff)';
                        childEl.style.color = '#fff';
                        childEl.style.border = 'none';
                        childEl.style.borderRadius = '6px';
                    } else if (childData.type === 'div') {
                        childEl = document.createElement('div');
                        childEl.style.minHeight = '50px';
                        childEl.style.width = '100%';
                        childEl.style.background = 'rgba(0,0,0,0.02)';
                        childEl.style.border = '1px dashed #ccc';
                        childEl.style.padding = '10px';
                        childEl.style.display = 'flex';
                        childEl.style.flexDirection = 'column';
                        childEl.style.gap = '10px';
                        childEl.style.boxSizing = 'border-box';
                    } else {
                        childEl = document.createElement('p');
                        childEl.innerText = cs.text || childData.props.text || 'New text...';
                    }

                    // Apply layout defaults for dynamic children so they aren't invisible
                    childEl.style.margin = '10px 0';
                    childEl.style.display = 'block';

                    // --- Sub-element Drag & Drop ---
                    if (document.body.classList.contains('structure-view')) {
                        childEl.draggable = true;
                        childEl.addEventListener('dragstart', (e) => {
                            e.stopPropagation();
                            e.dataTransfer.setData('application/sf-sub-path', childPath);
                            e.dataTransfer.setData('application/sf-block-id', block.id);
                            childEl.classList.add('sf-sub-dragging');
                        });
                        childEl.addEventListener('dragend', () => {
                            childEl.classList.remove('sf-sub-dragging');
                        });
                    }

                    // For containers (div), add drop zones
                    if (childData.type === 'div') {
                        childEl.addEventListener('dragover', (e) => {
                            if (e.dataTransfer.types.includes('application/sf-sub-path')) {
                                e.preventDefault();
                                e.stopPropagation();
                                childEl.classList.add('sf-sub-drop-zone');
                            }
                        });
                        childEl.addEventListener('dragleave', () => {
                            childEl.classList.remove('sf-sub-drop-zone');
                        });
                        childEl.addEventListener('drop', (e) => {
                            const sourcePath = e.dataTransfer.getData('application/sf-sub-path');
                            const sourceBlockId = e.dataTransfer.getData('application/sf-block-id');
                            if (sourcePath && sourceBlockId === block.id) {
                                e.preventDefault();
                                e.stopPropagation();
                                childEl.classList.remove('sf-sub-drop-zone');

                                // Calculate index within this target container
                                const afterEl = getDragAfterElement(childEl, e.clientX, e.clientY, '[data-sf-path]');
                                const targetChildren = (block.props.subStyles?.[childPath]?.children) || [];
                                let index = targetChildren.length;
                                if (afterEl) {
                                    const afterId = afterEl.getAttribute('data-sf-path');
                                    if (afterId && afterId.startsWith(childPath + '.c')) {
                                        const lastPart = afterId.split('.').pop();
                                        index = parseInt(lastPart.substring(1));
                                    }
                                }

                                State.moveSubElementToNewParent(block.id, sourcePath, childPath, index);
                                window.showToast('Moved to container', 'success');
                            }
                        });
                    }

                    el.appendChild(childEl);
                    recurse(childEl, childPath);
                });
            }

            // Add drop support to any element that can receive children
            // In this simple version, we stick to the main content area of the block
            if (path === '0' || path === '1' || !path.includes('.')) {
                el.addEventListener('dragover', (e) => {
                    if (e.dataTransfer.types.includes('application/sf-sub-path')) {
                        e.preventDefault();
                        e.stopPropagation();
                        el.style.boxShadow = 'inset 0 0 10px rgba(108, 99, 255, 0.2)';
                    }
                });
                el.addEventListener('dragleave', (e) => {
                    el.style.boxShadow = '';
                });
                el.addEventListener('drop', (e) => {
                    const sourcePath = e.dataTransfer.getData('application/sf-sub-path');
                    const sourceBlockId = e.dataTransfer.getData('application/sf-block-id');
                    if (sourcePath && sourceBlockId === block.id) {
                        e.preventDefault();
                        e.stopPropagation();
                        el.style.boxShadow = '';

                        // We target the path 'path' as the new parent
                        const targetParentPath = path;
                        const afterEl = getDragAfterElement(el, e.clientX, e.clientY, '[data-sf-path]');
                        const targetChildren = (block.props.subStyles?.[targetParentPath]?.children) || [];
                        let index = targetChildren.length;

                        if (afterEl) {
                            const afterId = afterEl.getAttribute('data-sf-path');
                            if (afterId && afterId.startsWith(targetParentPath + '.c')) {
                                const lastPart = afterId.split('.').pop();
                                index = parseInt(lastPart.substring(1));
                            }
                        }

                        State.moveSubElementToNewParent(block.id, sourcePath, targetParentPath, index);
                        window.showToast('Moved to block roof', 'success');
                    }
                });
            }
        }

        Array.from(container.children).forEach((child, i) => {
            recurse(child, i.toString());
        });

        // 3. Dynamic children at the root (parallel to fixed ones)
        if (subStyles.children && subStyles.children.length > 0) {
            subStyles.children.forEach((childData, i) => {
                const childPath = 'c' + i; // Path is just c0, c1 etc.
                const cs = subStyles[childPath] || {};

                // We use a simplified version of the logic inside recurse
                // But wait, there is NO 'el' yet. 
                // Let's create it and then call recurse on it!

                let childEl = createDynamicElement(childData, cs, block);
                container.appendChild(childEl);
                recurse(childEl, childPath);
            });
        }
    }

    // Helper to create dynamic elements (to avoid duplication with recurse)
    function createDynamicElement(childData, cs, block) {
        let childEl;
        if (childData.type === 'img') {
            childEl = document.createElement('img');
            childEl.src = cs.src || childData.props.src || '';
            childEl.style.maxWidth = '100%';
        } else if (childData.type === 'video') {
            const cont = document.createElement('div');
            cont.className = 'video-container';
            cont.style.cssText = 'position:relative;padding-bottom:56.25%;height:0;overflow:hidden;';
            const iframe = document.createElement('iframe');
            iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;';
            iframe.src = VideoHelper.getEmbedUrl(cs.src || childData.props.src || '');
            cont.appendChild(iframe);
            childEl = cont;
        } else if (childData.type === 'button' || childData.type === 'add-to-cart') {
            childEl = document.createElement('button');
            childEl.className = childData.type === 'add-to-cart' ? 'sf-add-to-cart' : 'nav-btn';
            childEl.innerText = cs.text || childData.props.text || (childData.type === 'add-to-cart' ? 'Add to Cart' : 'Button');
            childEl.style.cssText = 'padding:10px 20px;background:var(--accent);color:#fff;border:none;border-radius:6px;';
        } else if (childData.type === 'div') {
            childEl = document.createElement('div');
            childEl.style.cssText = 'min-height:50px;width:100%;background:rgba(0,0,0,0.02);border:1px dashed #ccc;padding:10px;display:flex;flex-direction:column;gap:10px;box-sizing:border-box;';
        } else {
            childEl = document.createElement('p');
            childEl.innerText = cs.text || childData.props.text || 'New text...';
        }
        childEl.style.margin = '10px 0';
        childEl.style.display = 'block';
        return childEl;
    }

    let currentPenTool = null;

    function showPenTool(target, blockId, path, e = null) {
        hidePenTool();

        // Visual selection on target
        target.classList.add('sf-sub-selected');

        const rect = target.getBoundingClientRect();
        
        let topPos = rect.top - 12;
        let leftPos = rect.right - 12; // Fallback to right edge for small things
        
        // If we have mouse coordinates, use them (much better for wide blocks)
        if (e) {
            topPos = e.clientY - 45;
            leftPos = e.clientX - 15;
        }
        
        // Clamp to ensure the popup stays fully on-screen
        topPos = Math.max(10, topPos);
        leftPos = Math.min(window.innerWidth - 200, Math.max(10, leftPos));

        // Create container for buttons
        const container = document.createElement('div');
        container.className = 'sf-pen-tool-container';
        container.style.cssText = `
            position: fixed;
            top: ${topPos}px;
            left: ${leftPos}px;
            display: flex;
            gap: 4px;
            z-index: 3000;
            pointer-events: auto;
            background: black;
            
            border-radius: 12px;
            
        `;

        const isDynamic = path.includes('c'); // Path contains c (e.g. 0.c0 or c0)

        // Helper to create buttons
        const createBtn = (icon, title, color, onClick) => {
            const btn = document.createElement('button');
            btn.className = 'sf-pen-tool';
            btn.innerHTML = `<i class="fa-solid ${icon}"></i>`;
            btn.title = title;
            btn.style.cssText = `
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: ${color};
                color: #fff;
                border: 2px solid #fff;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content:center;
                font-size: 0.8rem;
                transition: transform 0.2s;
            `;
            btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
            btn.onmouseout = () => btn.style.transform = 'scale(1)';
            btn.onclick = (e) => {
                e.stopPropagation();
                onClick();
            };
            return btn;
        };

        // 1. Up Button
        container.appendChild(createBtn('fa-arrow-up', 'Move Up', '#6c63ff', () => {
            State.moveSubElement(blockId, path, 'up');
            window.showToast('Moved up', 'info');
        }));

        // 2. Down Button
        container.appendChild(createBtn('fa-arrow-down', 'Move Down', '#6c63ff', () => {
            State.moveSubElement(blockId, path, 'down');
            window.showToast('Moved down', 'info');
        }));

        // 3. Copy Button
        container.appendChild(createBtn('fa-copy', 'Duplicate', '#2ecc71', () => {
            State.duplicateSubElement(blockId, path);
            window.showToast('Duplicated', 'success');
        }));

        // 4. Edit Button (for ALL)
        container.appendChild(createBtn('fa-pen', 'Edit this element', 'var(--accent)', () => {
            State.setSelectedSubPath(path);
            showToast('Editing sub-element properties...', 'success');
        }));

        // 5. Delete Button (for ALL)
        container.appendChild(createBtn('fa-trash', 'Delete this element', '#ff4d4d', () => {
            if (confirm('Delete this element?')) {
                State.removeSubElement(blockId, path);
                showToast('Element deleted.', 'info');
            }
        }));

        document.body.appendChild(container);

        currentPenTool = { el: container, target: target, path: path };
    }

    // Reposition pen tool on scroll/resize or re-render
    function updatePenToolPosition() {
        if (currentPenTool && currentPenTool.target) {
            const rect = currentPenTool.target.getBoundingClientRect();
            currentPenTool.el.style.top = `${rect.top - 12}px`;
            currentPenTool.el.style.left = `${rect.right - 12}px`;
        }
    }

    window.addEventListener('scroll', updatePenToolPosition, true);
    window.addEventListener('resize', updatePenToolPosition);
    State.on('blockUpdated', () => setTimeout(updatePenToolPosition, 0)); // Delay slightly to ensure DOM is ready

    function hidePenTool() {
        if (currentPenTool) {
            currentPenTool.el.remove();
            if (currentPenTool.target) currentPenTool.target.classList.remove('sf-sub-selected');
            currentPenTool = null;
        }
    }

    return { init, renderAll, initContextMenu };
})();
