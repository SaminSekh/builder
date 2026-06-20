// ============================================================
// layers.js – Enhanced Layer Panel / Navigator
// Figma/Webflow-style tree view with collapse, drag reorder,
// rename, visibility toggle, and lock.
// ============================================================

const LayerPanel = (() => {
    const _collapsed = new Set();  // block IDs that are collapsed in the tree
    const _hidden = new Set();     // block IDs that are visually hidden
    const _locked = new Set();     // block IDs that are locked (non-editable)
    let _renaming = null;          // block ID currently being renamed
    let _draggedLayerId = null;    // layer being dragged
    let _renderTimeout = null;

    function init() {
        State.on('blocksChanged', scheduleRender);
        State.on('selectionChanged', scheduleRender);
        State.on('blockUpdated', scheduleRender);

        // Initial render
        scheduleRender();
    }

    function scheduleRender() {
        if (_renderTimeout) clearTimeout(_renderTimeout);
        _renderTimeout = setTimeout(render, 15);
    }

    function render() {
        const list = document.getElementById('layersList');
        if (!list) return;
        list.innerHTML = '';

        const rootBlocks = State.getBlocks(null);
        if (rootBlocks.length === 0) {
            list.innerHTML = '<div class="prop-empty" style="padding:30px 16px;"><i class="fa-solid fa-layer-group" style="font-size:1.5rem;opacity:0.3;margin-bottom:10px;display:block;"></i><p style="font-size:0.82rem;">No blocks yet. Drag components to the canvas.</p></div>';
            return;
        }

        rootBlocks.forEach(block => renderItem(list, block, 0));
    }

    function renderItem(container, block, depth) {
        const def = BlockTypes[block.type];
        const isSelected = State.getSelectedId() === block.id;
        const isCollapsed = _collapsed.has(block.id);
        const isHidden = _hidden.has(block.id);
        const isLocked = _locked.has(block.id);
        const children = State.getBlocks(block.id);
        const hasChildren = children.length > 0;

        const item = document.createElement('div');
        item.className = 'layer-item' + (isSelected ? ' selected' : '') + (isHidden ? ' layer-hidden' : '') + (isLocked ? ' layer-locked' : '');
        item.dataset.id = block.id;
        item.draggable = true;
        item.style.paddingLeft = (8 + depth * 16) + 'px';

        // Collapse toggle
        const collapseBtn = document.createElement('span');
        collapseBtn.className = 'layer-collapse';
        collapseBtn.style.cssText = 'width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;opacity:' + (hasChildren ? '0.7' : '0.2') + ';font-size:0.65rem;flex-shrink:0;';
        collapseBtn.innerHTML = hasChildren
            ? (isCollapsed ? '<i class="fa-solid fa-chevron-right"></i>' : '<i class="fa-solid fa-chevron-down"></i>')
            : '<i class="fa-solid fa-minus"></i>';
        if (hasChildren) {
            collapseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (_collapsed.has(block.id)) _collapsed.delete(block.id);
                else _collapsed.add(block.id);
                scheduleRender();
            });
        }
        item.appendChild(collapseBtn);

        // Icon
        const icon = document.createElement('i');
        icon.className = (def ? def.icon : 'fa-solid fa-cube') + ' fa-fw';
        icon.style.cssText = 'margin-right:6px;font-size:0.75rem;opacity:0.6;flex-shrink:0;';
        item.appendChild(icon);

        // Label (editable on double-click)
        const label = document.createElement('span');
        label.className = 'layer-label';
        label.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.78rem;';
        const customName = block.props._layerName;
        label.textContent = customName || (def ? def.label : block.type);
        if (customName) label.style.fontWeight = '600';

        label.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            _startRename(label, block);
        });
        item.appendChild(label);

        // Action buttons (visibility + lock)
        const actions = document.createElement('div');
        actions.className = 'layer-actions';
        actions.style.cssText = 'display:flex;gap:2px;align-items:center;opacity:0;transition:opacity 0.15s;flex-shrink:0;';

        // Visibility toggle
        const visBtn = document.createElement('button');
        visBtn.className = 'layer-action-btn';
        visBtn.style.cssText = 'width:20px;height:20px;border:none;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:4px;color:inherit;font-size:0.7rem;opacity:0.6;';
        visBtn.innerHTML = isHidden ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
        visBtn.title = isHidden ? 'Show' : 'Hide';
        visBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleVisibility(block.id);
        });
        actions.appendChild(visBtn);

        // Lock toggle
        const lockBtn = document.createElement('button');
        lockBtn.className = 'layer-action-btn';
        lockBtn.style.cssText = 'width:20px;height:20px;border:none;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:4px;color:inherit;font-size:0.7rem;opacity:0.6;';
        lockBtn.innerHTML = isLocked ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-lock-open"></i>';
        lockBtn.title = isLocked ? 'Unlock' : 'Lock';
        lockBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLock(block.id);
        });
        actions.appendChild(lockBtn);

        item.appendChild(actions);

        // Show actions on hover
        item.addEventListener('mouseenter', () => { actions.style.opacity = '1'; });
        item.addEventListener('mouseleave', () => { actions.style.opacity = '0'; });

        // Click to select
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            if (_renaming) return;
            State.setSelected(block.id);
        });

        // Drag to reorder
        item.addEventListener('dragstart', (e) => {
            _draggedLayerId = block.id;
            e.dataTransfer.effectAllowed = 'move';
            item.style.opacity = '0.5';
        });
        item.addEventListener('dragend', () => {
            _draggedLayerId = null;
            item.style.opacity = '1';
        });
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (_draggedLayerId && _draggedLayerId !== block.id) {
                item.style.borderTop = '2px solid var(--accent, #6c63ff)';
            }
        });
        item.addEventListener('dragleave', () => {
            item.style.borderTop = '';
        });
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.style.borderTop = '';
            if (_draggedLayerId && _draggedLayerId !== block.id) {
                // Move dragged block before this block
                const draggedBlock = State.getBlock(_draggedLayerId);
                const targetBlock = State.getBlock(block.id);
                if (draggedBlock && targetBlock && draggedBlock.pageId === targetBlock.pageId) {
                    State.updateBlockParent(_draggedLayerId, targetBlock.parentId || null);
                    // Reorder to be before target
                    const siblings = State.getBlocks(targetBlock.parentId || null);
                    const targetIdx = siblings.findIndex(b => b.id === block.id);
                    if (targetIdx >= 0) {
                        State.moveBlock(_draggedLayerId, 'up'); // simplified reorder
                    }
                }
                _draggedLayerId = null;
            }
        });

        container.appendChild(item);

        // Render children if not collapsed
        if (hasChildren && !isCollapsed) {
            children.forEach(child => renderItem(container, child, depth + 1));
        }
    }

    // --- Rename ---
    function _startRename(labelEl, block) {
        _renaming = block.id;
        const currentName = block.props._layerName || BlockTypes[block.type]?.label || block.type;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.style.cssText = 'width:100%;font-size:0.78rem;padding:2px 4px;border:1px solid var(--accent);border-radius:3px;background:var(--surface2);color:var(--text1);outline:none;';

        labelEl.textContent = '';
        labelEl.appendChild(input);
        input.focus();
        input.select();

        const commit = () => {
            const newName = input.value.trim();
            _renaming = null;
            if (newName && newName !== (BlockTypes[block.type]?.label || block.type)) {
                State.updateBlockProps(block.id, { _layerName: newName }, { immediate: true });
            } else {
                // Clear custom name (revert to default)
                State.updateBlockProps(block.id, { _layerName: undefined }, { immediate: true });
            }
            scheduleRender();
        };

        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
            if (e.key === 'Escape') { _renaming = null; scheduleRender(); }
        });
    }

    // --- Visibility ---
    function toggleVisibility(blockId) {
        if (_hidden.has(blockId)) {
            _hidden.delete(blockId);
            _showBlock(blockId);
        } else {
            _hidden.add(blockId);
            _hideBlock(blockId);
        }
        scheduleRender();
    }

    function _hideBlock(blockId) {
        const el = document.getElementById('block_' + blockId);
        if (el) el.style.display = 'none';
    }

    function _showBlock(blockId) {
        const el = document.getElementById('block_' + blockId);
        if (el) el.style.display = '';
    }

    // --- Lock ---
    function toggleLock(blockId) {
        if (_locked.has(blockId)) {
            _locked.delete(blockId);
        } else {
            _locked.add(blockId);
        }
        scheduleRender();
    }

    function isLocked(blockId) {
        return _locked.has(blockId);
    }

    function isHidden(blockId) {
        return _hidden.has(blockId);
    }

    // --- Collapse ---
    function collapseAll() {
        State.getBlocks(null).forEach(b => _collapsed.add(b.id));
        scheduleRender();
    }

    function expandAll() {
        _collapsed.clear();
        scheduleRender();
    }

    return {
        init,
        render: scheduleRender,
        toggleVisibility,
        toggleLock,
        isLocked,
        isHidden,
        collapseAll,
        expandAll
    };
})();

// Expose globally
if (typeof window !== 'undefined') {
    window.LayerPanel = LayerPanel;
}
