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
        State.on('deviceChanged', (d) => {
            const frame = document.getElementById('canvasFrame');
            frame.classList.remove('tablet', 'mobile');
            if (d === 'tablet') frame.classList.add('tablet');
            if (d === 'mobile') frame.classList.add('mobile');
        });
    }

    function getDragAfterElement(container, x, y) {
        const blocks = [...container.querySelectorAll(':scope > .canvas-block:not(.dragging)')];
        
        return blocks.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const centerX = box.left + box.width / 2;
            const centerY = box.top + box.height / 2;

            // Simplified Flow Detection:
            // 1. If cursor is significantly above the center, it's "before" this block.
            // 2. If cursor is roughly on the same vertical line, check X position.
            
            const verticalThreshold = box.height / 2;
            const dy = y - centerY;
            const dx = x - centerX;

            let isAfterPoint = false;
            
            if (dy < -verticalThreshold) {
                // Definitely above
                isAfterPoint = false;
            } else if (dy > verticalThreshold) {
                // Definitely below
                isAfterPoint = true;
            } else {
                // Same "row" - check X
                isAfterPoint = dx > 0;
            }

            if (!isAfterPoint) {
                // We want the first element where we are "before" it
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < closest.distance) {
                    return { distance: distance, element: child };
                }
            }
            
            return closest;
        }, { distance: Number.POSITIVE_INFINITY }).element;
    }

    function getBlockIndexFromEl(el) {
        const canvas = document.getElementById('canvas');
        const blocks = [...canvas.querySelectorAll('.canvas-block')];
        return blocks.indexOf(el);
    }

    function renderAll() {
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
        
        // Ensure inner element fills the wrapper but keeps its other styles
        const firstChild = content.firstElementChild;
        if (firstChild) {
            firstChild.style.width = '100%';
            // If it's a block with sub-details (like video), don't force 100% height on root content
            if (block.type !== 'video') {
                firstChild.style.height = '100%';
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

        content.addEventListener('click', (e) => {
            // Only handle if structure view is ON or if user is clicking a sub-element
            if (!document.body.classList.contains('structure-view')) return;
            
            const target = e.target;
            if (target === content) return; // Ignore click on the wrapper itself
            
            e.stopPropagation();
            const path = target.getAttribute('data-sf-path');
            if (path) {
                State.setSelected(block.id);
                showPenTool(target, block.id, path);
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
                    const children = State.getBlocks(block.id);
                    let index = children.length; // Default to end
                    if (afterEl) {
                        const childId = afterEl.dataset.id;
                        index = children.findIndex(c => c.id === childId);
                    }

                    if (draggedBlockId) {
                        // Re-parenting existing block with index
                        State.updateBlockParent(draggedBlockId, block.id, index);
                        State.setSelected(draggedBlockId);
                        return;
                    }

                    const type = e.dataTransfer.getData('text/plain');
                    if (!type || !BlockTypes[type]) return;

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

        // --- Inline Editing ---
        // Find all text elements that should be editable
        const textElements = content.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a.nav-link, a.nav-btn');
        textElements.forEach(el => {
            el.contentEditable = "true";
            el.style.pointerEvents = "auto"; // Re-enable pointer events for these
            el.style.cursor = "text";
            el.style.outline = "none";

            // Prevent selection from triggering drag or click-away
            el.addEventListener('click', (e) => e.stopPropagation());

            // Sync changes back to State
            el.addEventListener('blur', () => {
                const newText = el.innerText.trim();
                // We need to figure out which prop this maps to. 
                // This is slightly tricky since different blocks use different prop names (title, subtitle, brand, etc.)
                // For now, we'll try to match the initial text content to the prop value.
                const props = block.props;
                const updatedProps = {};

                for (let key in props) {
                    if (typeof props[key] === 'string' && props[key] === el.dataset.initialValue) {
                        updatedProps[key] = newText;
                    }
                }

                // If we didn't find a match via dataset, we'll use a more heuristic approach
                // (This would be improved by having render functions tag elements with data-prop="title")
                if (Object.keys(updatedProps).length > 0) {
                    State.updateBlockProps(block.id, updatedProps);
                }
            });
        });

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
            if (subStyles[path]) {
                const s = subStyles[path];
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

                // Behavior / Content
                const isContentTag = ['P', 'SPAN', 'A', 'BUTTON', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'FIGCAPTION', 'LABEL', 'I'].includes(el.tagName);
                if (s.text !== undefined && (el.children.length === 0 || isContentTag)) {
                    el.innerText = s.text;
                }
                if (s.customId) el.id = s.customId;
                if (s.customClass) el.className = s.customClass;
            }

            Array.from(el.children).forEach((child, i) => {
                recurse(child, path + '.' + i);
            });
        }

        Array.from(container.children).forEach((child, i) => {
            recurse(child, i.toString());
        });
    }

    let currentPenTool = null;

    function showPenTool(target, blockId, path) {
        hidePenTool();

        // Visual selection on target
        target.classList.add('sf-sub-selected');
        
        const rect = target.getBoundingClientRect();
        const pen = document.createElement('button');
        pen.className = 'sf-pen-tool';
        pen.innerHTML = '<i class="fa-solid fa-pen"></i>';
        pen.title = 'Edit this element';
        pen.style.cssText = `
            position: fixed;
            top: ${rect.top - 12}px;
            left: ${rect.right - 12}px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: var(--accent);
            color: #fff;
            border: 2px solid #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 3000;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content:center;
            font-size: 0.8rem;
            transition: transform 0.2s;
        `;
        
        pen.onmouseover = () => pen.style.transform = 'scale(1.1)';
        pen.onmouseout = () => pen.style.transform = 'scale(1)';
        
        pen.onclick = (e) => {
            e.stopPropagation();
            State.setSelectedSubPath(path);
            showToast('Editing sub-element properties...', 'success');
        };

        document.body.appendChild(pen);
        currentPenTool = { el: pen, target: target, path: path };
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
