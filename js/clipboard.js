// ============================================================
// clipboard.js – Copy/Paste System & Inline Editing
// Provides Ctrl+C/V, cross-page paste, style copy/paste,
// and professional inline contenteditable editing on the canvas.
// ============================================================

const Clipboard = (() => {
    let _copiedBlock = null;
    let _copiedStyle = null;
    let _isStyleCopy = false;

    function copyBlock(blockId) {
        const id = blockId || State.getSelectedId();
        if (!id) return false;
        const block = State.getBlock(id);
        if (!block) return false;
        _copiedBlock = _deepCloneTree(id);
        _isStyleCopy = false;
        return true;
    }

    function copyStyle(blockId) {
        const id = blockId || State.getSelectedId();
        if (!id) return false;
        const block = State.getBlock(id);
        if (!block) return false;
        const p = block.props;
        _copiedStyle = {};
        const styleKeys = [
            'bgColor', 'background', 'textColor', 'accentColor', 'color',
            'fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign',
            'padding', 'margin', 'borderRadius', 'border', 'borderWidth', 'borderStyle', 'borderColor',
            'boxShadow', 'opacity', 'width', 'height', 'minWidth', 'maxWidth',
            'display', 'direction', 'justify', 'align', 'gap', 'wrap',
            'gridTemplateColumns', 'gridTemplateRows', 'columnGap', 'rowGap'
        ];
        styleKeys.forEach(key => { if (p[key] !== undefined && p[key] !== '') _copiedStyle[key] = p[key]; });
        _isStyleCopy = true;
        return true;
    }

    function pasteBlock(targetParentId) {
        if (_isStyleCopy && _copiedStyle) return pasteStyle();
        if (!_copiedBlock) return false;
        const parentId = targetParentId || null;
        const clones = _regenerateIds(_copiedBlock);
        clones.forEach(clone => { clone.pageId = State.getCurrentPageId(); if (!clone.parentId) clone.parentId = parentId; });
        const rootClone = clones.find(c => !c.parentId || c.parentId === parentId);
        if (!rootClone) return false;
        const rootId = State.addBlock({ type: rootClone.type, props: rootClone.props, parentId });
        const idMap = new Map();
        idMap.set(rootClone.id, rootId);
        const addChildren = (oldParentId, newParentId) => {
            clones.filter(c => c.parentId === oldParentId && c.id !== rootClone.id).forEach(child => {
                const childId = State.addBlock({ type: child.type, props: child.props, parentId: newParentId });
                idMap.set(child.id, childId);
                addChildren(child.id, childId);
            });
        };
        addChildren(rootClone.id, rootId);
        State.setSelected(rootId);
        return true;
    }

    function pasteStyle(blockId) {
        if (!_copiedStyle) return false;
        const id = blockId || State.getSelectedId();
        if (!id) return false;
        State.updateBlockProps(id, { ..._copiedStyle }, { immediate: true });
        return true;
    }

    function hasContent() { return !!_copiedBlock || !!_copiedStyle; }
    function isStyleCopy() { return _isStyleCopy; }

    function _deepCloneTree(blockId) {
        const blocks = State.getAllBlocks('all');
        const result = [];
        const collect = (id) => {
            const block = blocks.find(b => b.id === id);
            if (!block) return;
            result.push(JSON.parse(JSON.stringify(block)));
            blocks.filter(b => b.parentId === id).forEach(child => collect(child.id));
        };
        collect(blockId);
        return result;
    }

    function _regenerateIds(clones) {
        const idMap = new Map();
        const result = clones.map(block => {
            const copy = JSON.parse(JSON.stringify(block));
            const newId = State.generateId('b_');
            idMap.set(copy.id, newId);
            copy.id = newId;
            return copy;
        });
        result.forEach(copy => { if (copy.parentId && idMap.has(copy.parentId)) copy.parentId = idMap.get(copy.parentId); });
        return result;
    }

    return { copyBlock, copyStyle, pasteBlock, pasteStyle, hasContent, isStyleCopy };
})();

// ============================================================
// InlineEditor – Professional inline editing with nested block support
// Double-click ANY text/image at ANY nesting depth to edit directly.
// Integrates with structure mode and properties panel.
// ============================================================

const InlineEditor = (() => {
    let _activeElement = null;
    let _activeBlockId = null;
    let _activePropKey = null;
    let _activeSubPath = null;
    let _activeType = null; // 'text' or 'image'
    let _originalValue = '';

    const TEXT_TAGS = new Set(['H1','H2','H3','H4','H5','H6','P','SPAN','A','BUTTON','LABEL','FIGCAPTION','LI','TD','TH','BLOCKQUOTE','CITE','EM','STRONG','B','I','U','SMALL','MARK']);
    const IMAGE_TAGS = new Set(['IMG']);
    const SKIP_CLASSES = ['block-actions','block-toolbar','resize-handle-v','resize-handle-h','resize-handle-both','sf-pen-tool-container','sf-drop-hint','hamburger'];

    function init() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;

        // Single delegated dblclick — works at any nesting depth
        canvas.addEventListener('dblclick', _handleDblClick, true);

        // Click outside to commit (with dblclick protection)
        document.addEventListener('mousedown', (e) => {
            if (!_activeElement) return;
            if (_activeElement === e.target || _activeElement.contains(e.target)) return;
            // Delay commit slightly to allow dblclick to fire first
            // (prevents committing when user is double-clicking a new element)
            setTimeout(() => {
                if (_activeElement && !_activeElement.contains(document.activeElement)) {
                    commitEditing();
                }
            }, 150);
        });

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (!_activeElement) return;
            if (e.key === 'Escape') { cancelEditing(); e.preventDefault(); e.stopPropagation(); return; }
            if (e.key === 'Tab') { e.preventDefault(); commitEditing(); return; }
            if (e.key === 'Enter' && !e.shiftKey && _activeType === 'text') {
                const tag = _activeElement.tagName;
                if (/^(H[1-6]|SPAN|A|BUTTON|LABEL|LI|TD|TH|SMALL|MARK)$/.test(tag)) {
                    commitEditing(); e.preventDefault();
                }
            }
        }, true);

        // Prevent block selection while editing
        canvas.addEventListener('pointerdown', (e) => {
            if (!_activeElement) return;
            if (_activeElement === e.target || _activeElement.contains(e.target)) e.stopPropagation();
        }, true);
    }

    function _handleDblClick(e) {
        if (!e.target) return;
        if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;
        for (const cls of SKIP_CLASSES) { if (e.target.closest('.' + cls)) return; }

        const result = _resolveEditableAtPoint(e.target);
        if (!result) return;

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (result.type === 'text') startTextEditing(result.element, result.blockId, result.subPath);
        else if (result.type === 'image') startImageEditing(result.element, result.blockId, result.subPath);
    }

    function _resolveEditableAtPoint(target) {
        let el = target;
        const canvas = document.getElementById('canvas');
        while (el && el !== canvas) {
            // Skip UI chrome
            let skip = false;
            for (const cls of SKIP_CLASSES) { if (el.classList && el.classList.contains(cls)) { skip = true; break; } }
            if (skip) { el = el.parentElement; continue; }

            if (IMAGE_TAGS.has(el.tagName)) {
                const info = _findOwnerBlock(el);
                if (info) return { type: 'image', element: el, blockId: info.blockId, subPath: _getSubPath(el) };
            }
            if (TEXT_TAGS.has(el.tagName) && _hasDirectText(el)) {
                const info = _findOwnerBlock(el);
                if (info) return { type: 'text', element: el, blockId: info.blockId, subPath: _getSubPath(el) };
            }
            el = el.parentElement;
        }
        return null;
    }

    function _findOwnerBlock(el) {
        const w = el.closest('.canvas-block');
        return w ? { blockId: w.dataset.id } : null;
    }

    function _getSubPath(el) {
        let curr = el;
        while (curr) {
            const p = curr.getAttribute && curr.getAttribute('data-sf-path');
            if (p) return p;
            if (curr.classList && curr.classList.contains('block-content')) break;
            curr = curr.parentElement;
        }
        return null;
    }

    function _hasDirectText(el) {
        if (!el.childNodes || el.childNodes.length === 0) return false;
        for (const node of el.childNodes) { if (node.nodeType === 3 && node.textContent.trim()) return true; }
        if (el.textContent.trim() && el.children.length <= 4) return true;
        return false;
    }

    // --- Text Editing ---
    function startTextEditing(element, blockId, subPath) {
        if (_activeElement) commitEditing();
        _activeElement = element;
        _activeBlockId = blockId;
        _activeSubPath = subPath;
        _activeType = 'text';
        _originalValue = element.textContent;
        _activePropKey = _resolvePropKey(element, blockId);

        State.setSelected(blockId);
        if (subPath) State.setSelectedSubPath(subPath);

        element.contentEditable = 'true';
        element.style.outline = '2px solid var(--accent, #6c63ff)';
        element.style.outlineOffset = '3px';
        element.style.borderRadius = '3px';
        element.style.cursor = 'text';
        element.style.minWidth = '20px';
        element.style.minHeight = '1em';
        element.dataset.sfEditing = 'true';
        element.focus();
        try {
            const range = document.createRange();
            range.selectNodeContents(element);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } catch (err) {}
    }

    let _linkToolbar = null;
    
    function _showLinkToolbar(element, blockId, subPath) {
        _removeLinkToolbar();
        
        const toolbar = document.createElement('div');
        toolbar.className = 'sf-link-toolbar';
        toolbar.style.cssText = 'position:absolute;left:0;right:0;display:flex;align-items:center;gap:6px;padding:6px 10px;background:rgba(15,23,42,0.95);border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.3);z-index:3001;margin-top:6px;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1);';
        
        // Link icon
        const linkIcon = document.createElement('i');
        linkIcon.className = 'fa-solid fa-link';
        linkIcon.style.cssText = 'color:var(--accent,#6c63ff);font-size:0.75rem;flex-shrink:0;';
        toolbar.appendChild(linkIcon);
        
        // URL input
        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.placeholder = 'Paste URL or select page...';
        // Read existing href if element is a link
        const existingHref = element.getAttribute('href') || element.closest('a')?.getAttribute('href') || '';
        urlInput.value = existingHref;
        urlInput.style.cssText = 'flex:1;padding:4px 8px;border:1px solid rgba(255,255,255,0.15);border-radius:4px;background:rgba(255,255,255,0.08);color:#fff;font-size:0.75rem;outline:none;min-width:0;';
        urlInput.addEventListener('keydown', (e) => { e.stopPropagation(); }); // Prevent editor shortcuts
        urlInput.addEventListener('change', () => {
            _applyLink(element, blockId, subPath, urlInput.value);
        });
        toolbar.appendChild(urlInput);
        
        // Page selector dropdown
        const pages = State.getPages();
        if (pages.length > 1) {
            const pageSelect = document.createElement('select');
            pageSelect.style.cssText = 'padding:4px 6px;border:1px solid rgba(255,255,255,0.15);border-radius:4px;background:rgba(255,255,255,0.08);color:#fff;font-size:0.7rem;cursor:pointer;';
            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.textContent = 'Page...';
            pageSelect.appendChild(defaultOpt);
            pages.forEach(page => {
                const opt = document.createElement('option');
                opt.value = page.filename;
                opt.textContent = page.name;
                if (existingHref === page.filename) opt.selected = true;
                pageSelect.appendChild(opt);
            });
            pageSelect.addEventListener('change', () => {
                if (pageSelect.value) {
                    urlInput.value = pageSelect.value;
                    _applyLink(element, blockId, subPath, pageSelect.value);
                }
            });
            toolbar.appendChild(pageSelect);
        }
        
        // Remove link button
        if (existingHref) {
            const removeBtn = document.createElement('button');
            removeBtn.style.cssText = 'border:none;background:rgba(239,68,68,0.2);color:#ef4444;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:0.7rem;white-space:nowrap;';
            removeBtn.textContent = 'Remove';
            removeBtn.onclick = (e) => { e.stopPropagation(); _removeLink(element, blockId, subPath); urlInput.value = ''; };
            toolbar.appendChild(removeBtn);
        }
        
        // Position below the element
        element.style.position = element.style.position || 'relative';
        const wrapper = element.parentElement;
        if (wrapper) {
            wrapper.style.position = wrapper.style.position || 'relative';
            toolbar.style.position = 'absolute';
            const rect = element.getBoundingClientRect();
            const parentRect = wrapper.getBoundingClientRect();
            toolbar.style.top = (rect.bottom - parentRect.top + 4) + 'px';
            toolbar.style.left = (rect.left - parentRect.left) + 'px';
            toolbar.style.width = Math.max(280, rect.width) + 'px';
            wrapper.appendChild(toolbar);
        } else {
            element.after(toolbar);
        }
        
        _linkToolbar = toolbar;
    }
    
    function _applyLink(element, blockId, subPath, url) {
        if (!url) return;
        const block = State.getBlock(blockId);
        if (!block) return;
        
        // If element is already an <a>, update its href
        if (element.tagName === 'A') {
            element.setAttribute('href', url);
            if (subPath) State.updateSubStyle(blockId, subPath, { href: url });
            else {
                const propKey = _resolvePropKey(element, blockId);
                if (propKey && propKey.includes('Href')) State.updateBlockProps(blockId, { [propKey]: url }, { forceRoot: true });
            }
        } else {
            // Wrap text in a link or update the block's href prop
            if (subPath) {
                State.updateSubStyle(blockId, subPath, { href: url });
            }
            // Store href in the block props for export
            const hrefKey = _activePropKey ? _activePropKey.replace('Text', 'Href').replace('title', 'titleHref') : null;
            if (hrefKey && block.props[hrefKey] !== undefined) {
                State.updateBlockProps(blockId, { [hrefKey]: url }, { forceRoot: true });
            }
        }
        if (window.showToast) showToast('Link applied', 'success');
    }
    
    function _removeLink(element, blockId, subPath) {
        if (element.tagName === 'A') {
            element.removeAttribute('href');
        }
        if (subPath) State.updateSubStyle(blockId, subPath, { href: '' });
        if (window.showToast) showToast('Link removed', 'info');
    }
    
    function _removeLinkToolbar() {
        if (_linkToolbar) {
            _linkToolbar.remove();
            _linkToolbar = null;
        }
    }

    // --- Image Editing ---
    function startImageEditing(imgElement, blockId, subPath) {
        if (_activeElement) commitEditing();
        _activeElement = imgElement;
        _activeBlockId = blockId;
        _activeSubPath = subPath;
        _activeType = 'image';
        _originalValue = imgElement.src;

        State.setSelected(blockId);
        if (subPath) State.setSelectedSubPath(subPath);

        imgElement.style.outline = '3px solid var(--accent, #6c63ff)';
        imgElement.style.outlineOffset = '3px';
        imgElement.dataset.sfEditing = 'true';

        if (typeof AssetManager !== 'undefined') {
            AssetManager.open((newUrl) => {
                if (newUrl && newUrl !== _originalValue) { imgElement.src = newUrl; _commitImageChange(newUrl); }
                _cleanup(); _reset();
            });
        } else {
            const newUrl = prompt('Enter image URL:', imgElement.src);
            if (newUrl && newUrl !== _originalValue) { imgElement.src = newUrl; _commitImageChange(newUrl); }
            _cleanup(); _reset();
        }
    }

    function _commitImageChange(newUrl) {
        const block = State.getBlock(_activeBlockId);
        if (!block) return;
        const props = block.props;
        
        // Always try to update root props first (source of truth for render)
        // regardless of whether a subPath is selected
        if (props.src === _originalValue) {
            State.updateBlockProps(_activeBlockId, { src: newUrl }, { immediate: true, forceRoot: true });
        } else if (props.image === _originalValue) {
            State.updateBlockProps(_activeBlockId, { image: newUrl }, { immediate: true, forceRoot: true });
        } else if (props.bgImage === _originalValue) {
            State.updateBlockProps(_activeBlockId, { bgImage: newUrl }, { immediate: true, forceRoot: true });
        } else if (props.logo === _originalValue) {
            State.updateBlockProps(_activeBlockId, { logo: newUrl }, { immediate: true, forceRoot: true });
        } else {
            // Check items array
            let found = false;
            if (Array.isArray(props.items)) {
                const updatedItems = props.items.map(item => {
                    if (item.src === _originalValue) { found = true; return { ...item, src: newUrl }; }
                    if (item.image === _originalValue) { found = true; return { ...item, image: newUrl }; }
                    return item;
                });
                if (found) State.updateBlockProps(_activeBlockId, { items: updatedItems }, { immediate: true, forceRoot: true });
            }
            // Check slides array
            if (!found && Array.isArray(props.slides)) {
                const updatedSlides = props.slides.map(slide => {
                    if (slide.image === _originalValue || slide.src === _originalValue) {
                        found = true;
                        return { ...slide, image: newUrl, src: newUrl };
                    }
                    return slide;
                });
                if (found) State.updateBlockProps(_activeBlockId, { slides: updatedSlides }, { immediate: true, forceRoot: true });
            }
            // Last resort: save to subStyles (for dynamic children)
            if (!found && _activeSubPath) {
                State.updateSubStyle(_activeBlockId, _activeSubPath, { src: newUrl });
            } else if (!found) {
                State.updateBlockProps(_activeBlockId, { src: newUrl }, { immediate: true, forceRoot: true });
            }
        }
        Promise.resolve().then(() => { if (typeof Properties !== 'undefined' && Properties.refresh) Properties.refresh(); });
    }

    // --- Commit / Cancel ---
    function commitEditing() {
        if (!_activeElement || !_activeBlockId) return;
        if (_activeType === 'image') { _cleanup(); _reset(); return; }

        const newText = _activeElement.textContent.trim();
        const blockId = _activeBlockId;
        const propKey = _activePropKey;
        const subPath = _activeSubPath;
        const origVal = _originalValue;

        _cleanup(); _reset();
        if (newText === origVal) return;

        const block = State.getBlock(blockId);
        if (!block) return;

        let saved = false;
        if (propKey) { State.updateBlockProps(blockId, { [propKey]: newText }, { immediate: true, forceRoot: true }); saved = true; }
        else if (subPath) { State.updateSubStyle(blockId, subPath, { text: newText }); saved = true; }
        else {
            const matchedKey = _findPropByValue(block, origVal);
            if (matchedKey) { State.updateBlockProps(blockId, { [matchedKey]: newText }, { immediate: true }); saved = true; }
        }
        if (saved) { Promise.resolve().then(() => { if (typeof Properties !== 'undefined' && Properties.refresh) Properties.refresh(); }); }
    }

    function cancelEditing() {
        if (!_activeElement) return;
        if (_activeType === 'text') _activeElement.textContent = _originalValue;
        else if (_activeType === 'image') _activeElement.src = _originalValue;
        _cleanup(); _reset();
    }

    function isActive() { return !!_activeElement; }
    function getActiveBlockId() { return _activeBlockId; }

    function _cleanup() {
        if (!_activeElement) return;
        _activeElement.contentEditable = 'false';
        _activeElement.style.outline = '';
        _activeElement.style.outlineOffset = '';
        _activeElement.style.borderRadius = '';
        _activeElement.style.cursor = '';
        _activeElement.style.minWidth = '';
        _activeElement.style.minHeight = '';
        delete _activeElement.dataset.sfEditing;
        _removeLinkToolbar();
    }

    function _reset() {
        _activeElement = null; _activeBlockId = null; _activePropKey = null;
        _activeSubPath = null; _activeType = null; _originalValue = '';
    }

    function _resolvePropKey(element, blockId) {
        const block = State.getBlock(blockId);
        if (!block) return null;
        const props = block.props;
        const currentText = element.textContent.trim();

        // 1. data-initial-value (most reliable)
        const initVal = element.getAttribute('data-initial-value');
        if (initVal !== null && initVal !== '') {
            const keys = ['title','subtitle','text','brand','badge','buttonText','ctaText','cta2Text',
                'tagline','sectionTitle','sectionSubtitle','description','name','heading','subheading',
                'label','phone','email','address','copyright','footerText'];
            for (const k of keys) { if (props[k] === initVal) return k; }
        }

        // 2. Direct prop name from data-sf-path
        const sfPath = element.getAttribute('data-sf-path');
        if (sfPath && !sfPath.includes('.') && typeof props[sfPath] === 'string') return sfPath;

        // 3. Match current text to any string prop
        if (currentText) {
            const match = _findPropByValue(block, currentText);
            if (match) return match;
        }

        // 4. Tag heuristics
        const tag = element.tagName;
        if (tag === 'H1' || tag === 'H2') return props.title !== undefined ? 'title' : null;
        if (tag === 'H3' || tag === 'H4') return props.subtitle !== undefined ? 'subtitle' : (props.title !== undefined ? 'title' : null);
        if (tag === 'P') {
            if (props.subtitle !== undefined && block.type !== 'text') return 'subtitle';
            if (props.text !== undefined) return 'text';
            if (props.description !== undefined) return 'description';
        }
        if (tag === 'SPAN') {
            if (props.badge !== undefined && currentText === props.badge) return 'badge';
            if (props.brand !== undefined && currentText === props.brand) return 'brand';
        }
        if (tag === 'BUTTON' || tag === 'A') {
            if (props.buttonText !== undefined && currentText === props.buttonText) return 'buttonText';
            if (props.ctaText !== undefined && currentText === props.ctaText) return 'ctaText';
            if (props.cta2Text !== undefined && currentText === props.cta2Text) return 'cta2Text';
        }
        return null;
    }

    function _findPropByValue(block, text) {
        if (!block || !block.props || !text) return null;
        const skip = new Set(['id','customId','customClass','bgColor','textColor','accentColor','bgImage',
            'src','url','href','favicon','logo','formProvider','navStyle','footerStyle','layoutStyle',
            'navPosition','imagePosition','objectFit','display','direction','justify','align','wrap','overflow',
            'padding','margin','gap','width','height','minWidth','maxWidth','minHeight','maxHeight',
            'borderRadius','borderWidth','borderStyle','borderColor','gridTemplateColumns','gridTemplateRows']);
        for (const [key, value] of Object.entries(block.props)) {
            if (typeof value === 'string' && value === text && !skip.has(key)) return key;
        }
        return null;
    }

    return { init, startTextEditing, startImageEditing, commitEditing, cancelEditing, isActive, getActiveBlockId };
})();

// Expose globally
if (typeof window !== 'undefined') {
    window.Clipboard = Clipboard;
    window.InlineEditor = InlineEditor;
}
