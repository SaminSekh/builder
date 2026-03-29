// ============================================================
// state.js â€“ Global application state
// ============================================================

const State = (() => {
  let _blocks = [];
  let _pages = [{ id: 'page_index', name: 'Home', filename: 'index.html', meta: null }];
  let _currentPageId = 'page_index';
  let _selectedId = null;
  let _selectedSubPath = null; // Path to sub-element inside the selected block
  let _device = 'desktop';
  let _activeTheme = null;
  let _meta = {
    title: 'My Website',
    description: '',
    keywords: '',
    favicon: '',
    scripts: '',
    fonts: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    robots: 'User-agent: *\nAllow: /'
  };

  const _listeners = {};
  let _history = [];
  let _historyStep = -1;

  function snapshot() {
    return JSON.stringify({
      blocks: _blocks,
      pages: _pages,
      currentPageId: _currentPageId,
      meta: _meta,
      theme: _activeTheme
    });
  }

  function buildPageFilename(name) {
    const slug = String(name || 'page')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'page';
    return `${slug}.html`;
  }

  function on(event, cb) {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(cb);
  }
  function emit(event, data) {
    (_listeners[event] || []).forEach(cb => cb(data));
  }

  // --- Persistence & History ---
  function saveToLocal() {
    const data = { 
      blocks: _blocks.filter(b => !!b), 
      pages: _pages,
      currentPageId: _currentPageId,
      meta: _meta, 
      theme: _activeTheme 
    };
    localStorage.setItem('sf_project_autosave', JSON.stringify(data));
  }

  function loadFromLocal() {
    const saved = localStorage.getItem('sf_project_autosave');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            _blocks = (data.blocks || []).filter(b => !!b && b.id && b.type);
            
            // Migration for older projects (single page)
            if (!data.pages || data.pages.length === 0) {
              _pages = [{ id: 'page_index', name: 'Home', filename: 'index.html', meta: { ...data.meta } }];
              _currentPageId = 'page_index';
              // Move all existing blocks to the new index page
              _blocks.forEach(b => { if (!b.pageId) b.pageId = 'page_index'; });
            } else {
              _pages = data.pages;
              _currentPageId = data.currentPageId || _pages[0].id;
            }

            _meta = data.meta || _meta;
            if (data.theme) _activeTheme = data.theme;
            sanitize();
            if (_blocks.length > 0) {
                emit('blocksChanged');
            }
            emit('pagesChanged', _pages);
        } catch(e) {
            console.warn('sf: failed to load autosave, starting fresh.', e);
            localStorage.removeItem('sf_project_autosave');
        }
    }
  }

  function pushHistory() {
    // Remove future steps if we are in the middle of a stack
    if (_historyStep < _history.length - 1) {
        _history = _history.slice(0, _historyStep + 1);
    }
    _history.push(snapshot());
    if (_history.length > 50) _history.shift(); // Limit to 50 steps
    _historyStep = _history.length - 1;
    saveToLocal();
  }

  function undo() {
    if (_historyStep > 0) {
        _historyStep--;
        const data = JSON.parse(_history[_historyStep]);
        _blocks = data.blocks;
        _pages = data.pages;
        _currentPageId = data.currentPageId;
        _meta = data.meta;
        _activeTheme = data.theme || null;
        _selectedId = null;
        _selectedSubPath = null;
        emit('blocksChanged');
        emit('metaChanged');
        emit('pagesChanged', _pages);
        emit('selectionChanged', null);
        saveToLocal();
        return true;
    }
    return false;
  }

  function redo() {
    if (_historyStep < _history.length - 1) {
        _historyStep++;
        const data = JSON.parse(_history[_historyStep]);
        _blocks = data.blocks;
        _pages = data.pages;
        _currentPageId = data.currentPageId;
        _meta = data.meta;
        _activeTheme = data.theme || null;
        _selectedId = null;
        _selectedSubPath = null;
        emit('blocksChanged');
        emit('metaChanged');
        emit('pagesChanged', _pages);
        emit('selectionChanged', null);
        saveToLocal();
        return true;
    }
    return false;
  }

  function getBlocks(parentId = null) {
    return _blocks.filter(b => b && b.pageId === _currentPageId && (b.parentId === parentId || (parentId === null && !b.parentId)));
  }
  function getAllBlocks(pageId = null) { 
    if (pageId === 'all') return _blocks.filter(b => !!b);
    const pid = pageId || _currentPageId;
    return _blocks.filter(b => !!b && b.pageId === pid); 
  }
  function getBlock(id) { return _blocks.find(b => b && b.id === id); }

  function sanitize() {
    let changed = false;
    try {
      _blocks.forEach(b => {
        if (b && b.parentId && !getBlock(b.parentId)) {
          console.warn(`State: Sanitized orphan block ${b.id} (type: ${b.type}). Moved to root.`);
          b.parentId = null;
          changed = true;
        }
        if (b && !b.pageId) {
          b.pageId = 'page_index';
          changed = true;
        }
      });
    } catch(e) {
      console.error("Sanitize failed:", e);
    }
    if (changed) {
        saveToLocal();
    }
    return changed;
  }
  function getSelectedId() { return _selectedId; }
  function getSelectedSubPath() { return _selectedSubPath; }
  function getDevice() { return _device; }
  function getMeta() { 
    const currentPage = _pages.find(p => p.id === _currentPageId);
    return currentPage?.meta || _meta; 
  }
  function getActiveTheme() { return _activeTheme; }
  
  function getPages() { return _pages; }
  function getCurrentPageId() { return _currentPageId; }

  function addPage(name, options = {}) {
    const cloneCurrentPage = options.cloneCurrentPage === true;
    const sourcePageId = _currentPageId;
    const id = 'page_' + Math.random().toString(36).substr(2, 9);
    const filename = buildPageFilename(name);
    const newPage = { id, name, filename, meta: { ..._meta } };
    _pages.push(newPage);
    _currentPageId = id;

    if (cloneCurrentPage) {
      const sourceBlocks = _blocks.filter(b => b && b.pageId === sourcePageId);
      if (sourceBlocks.length > 0) {
        const idMap = new Map();
        const clones = sourceBlocks.map((block) => {
          const copy = JSON.parse(JSON.stringify(block));
          const nextId = Math.random().toString(36).substr(2, 9);
          idMap.set(block.id, nextId);
          copy.id = nextId;
          copy.pageId = id;
          return copy;
        });

        clones.forEach((copy) => {
          const originalParentId = copy.parentId;
          copy.parentId = originalParentId ? (idMap.get(originalParentId) || null) : null;
        });

        _blocks.push(...clones);
      }
    }

    pushHistory();
    emit('pagesChanged', _pages);
    emit('blocksChanged');
    emit('selectionChanged', null);
    return id;
  }

  function removePage(id) {
    if (_pages.length <= 1) return; // Cannot delete last page
    _pages = _pages.filter(p => p.id !== id);
    _blocks = _blocks.filter(b => b.pageId !== id);
    if (_currentPageId === id) {
      _currentPageId = _pages[0].id;
    }
    pushHistory();
    emit('pagesChanged', _pages);
    emit('blocksChanged');
    emit('selectionChanged', null);
  }

  function switchPage(id) {
    if (_currentPageId === id) return;
    _currentPageId = id;
    _selectedId = null;
    _selectedSubPath = null;
    saveToLocal();
    emit('pagesChanged', _pages);
    emit('blocksChanged');
    emit('selectionChanged', null);
  }

  function renamePage(id, newName) {
    const page = _pages.find(p => p.id === id);
    if (page) {
      page.name = newName;
      page.filename = buildPageFilename(newName);
      pushHistory();
      emit('pagesChanged', _pages);
    }
  }

  function addBlock(blockDef, index = null) {
    const id = Math.random().toString(36).substr(2, 9);
    const newBlock = { ...blockDef, id: id, pageId: _currentPageId, parentId: blockDef.parentId || null };
    
    let globalIdx = _blocks.length;
    if (index !== null) {
      const siblings = _blocks.filter(b => b && b.pageId === _currentPageId && b.parentId === newBlock.parentId);
      if (index < siblings.length) {
        globalIdx = _blocks.indexOf(siblings[index]);
      }
    }
    
    _blocks.splice(globalIdx, 0, newBlock);

    pushHistory();
    emit('blocksChanged');
    return id;
  }

  function removeBlock(id) {
    // 1. Find all blocks on current page
    const pageBlocks = _blocks.filter(b => b.pageId === _currentPageId);
    
    // 2. Remove specified block and its children
    _blocks = _blocks.filter(b => b.id !== id && b.parentId !== id);
    
    // 3. Clean up children recursively (if any)
    const removeRecursive = (parentId) => {
        const children = _blocks.filter(b => b.parentId === parentId);
        children.forEach(c => {
            _blocks = _blocks.filter(b => b.id !== c.id);
            removeRecursive(c.id);
        });
    };
    removeRecursive(id);

    if (_selectedId === id) _selectedId = null;
    pushHistory();
    emit('blocksChanged');
    emit('selectionChanged', null);
  }

  function duplicateBlock(id) {
    const idx = _blocks.findIndex(b => b.id === id);
    if (idx === -1) return;
    
    const original = _blocks[idx];
    const clones = [];

    const cloneTree = (sourceId, newParentId) => {
      const source = getBlock(sourceId);
      if (!source) return;

      const copy = JSON.parse(JSON.stringify(source));
      copy.id = Math.random().toString(36).substr(2, 9);
      copy.parentId = newParentId;
      clones.push(copy);

      _blocks
        .filter(b => b && b.pageId === source.pageId && b.parentId === sourceId)
        .forEach(child => cloneTree(child.id, copy.id));
    };

    cloneTree(id, original.parentId || null);
    _blocks.splice(idx + 1, 0, ...clones);

    pushHistory();
    emit('blocksChanged');
  }

  function moveBlock(id, direction) {
    // 1. Only consider siblings (same parent and same page)
    const block = _blocks.find(b => b.id === id);
    if (!block) return;
    
    const siblings = _blocks.filter(b => b.pageId === block.pageId && b.parentId === block.parentId);
    const sibIdx = siblings.findIndex(b => b.id === id);
    
    if (direction === 'up' && sibIdx > 0) {
        const other = siblings[sibIdx - 1];
        const realIdx1 = _blocks.indexOf(block);
        const realIdx2 = _blocks.indexOf(other);
        [_blocks[realIdx1], _blocks[realIdx2]] = [_blocks[realIdx2], _blocks[realIdx1]];
        pushHistory();
        emit('blocksChanged');
    } else if (direction === 'down' && sibIdx < siblings.length - 1) {
        const other = siblings[sibIdx + 1];
        const realIdx1 = _blocks.indexOf(block);
        const realIdx2 = _blocks.indexOf(other);
        [_blocks[realIdx1], _blocks[realIdx2]] = [_blocks[realIdx2], _blocks[realIdx1]];
        pushHistory();
        emit('blocksChanged');
    }
  }

  function updateBlockProps(id, props) {
    const block = _blocks.find(b => b.id === id);
    if (!block) return;
    
    if (_selectedSubPath) {
      if (!block.props.subStyles) block.props.subStyles = {};
      if (!block.props.subStyles[_selectedSubPath]) block.props.subStyles[_selectedSubPath] = {};
      Object.assign(block.props.subStyles[_selectedSubPath], props);
    } else {
      Object.assign(block.props, props);
    }
    pushHistory();
    emit('blockUpdated', id);
  }


  /**
   * Helper: Get a property from a deep path (e.g. "ctas.0.segments")
   */
  function _getDeepProp(obj, path) {
    if (!path) return obj;
    const parts = path.split('.');
    let curr = obj;
    for (const p of parts) {
      if (curr === undefined || curr === null) return undefined;
      curr = curr[p];
    }
    return curr;
  }

  /**
   * Helper: determine path type
   * - isDynamic: path ends with .cN or starts with cN (append-child)
   * - isRepeater: path ends with .N
   */
  function _pathType(path) {
    if (/(?:^|\.)c\d+$/.test(path)) return 'dynamic';
    if (/(?:^|\.)t\d+$/.test(path)) return 'template';
    if (/\.\d+$/.test(path)) return 'repeater';
    return 'static';
  }

  function _recursiveRenameSubStyles(block, oldPrefix, newPrefix) {
    if (!block.props.subStyles) return;
    const keys = Object.keys(block.props.subStyles);
    const updates = {};
    keys.forEach(key => {
      if (key === oldPrefix) {
        updates[newPrefix] = block.props.subStyles[key];
      } else if (key.startsWith(oldPrefix + '.')) {
        const newKey = newPrefix + key.substring(oldPrefix.length);
        updates[newKey] = block.props.subStyles[key];
      }
    });
    // Remove old keys
    keys.forEach(key => {
      if (key === oldPrefix || key.startsWith(oldPrefix + '.')) {
        delete block.props.subStyles[key];
      }
    });
    // Apply new keys
    Object.assign(block.props.subStyles, updates);
  }

  function _recursiveCopySubStyles(block, srcPrefix, tgtPrefix) {
    if (!block.props.subStyles) return;
    const updates = {};
    Object.keys(block.props.subStyles).forEach(key => {
      if (key === srcPrefix) {
        updates[tgtPrefix] = JSON.parse(JSON.stringify(block.props.subStyles[key]));
      } else if (key.startsWith(srcPrefix + '.')) {
        const newKey = tgtPrefix + key.substring(srcPrefix.length);
        updates[newKey] = JSON.parse(JSON.stringify(block.props.subStyles[key]));
      }
    });
    Object.assign(block.props.subStyles, updates);
  }

  function _extractSubStyleTree(block, prefix) {
    if (!block.props.subStyles) return {};
    const extracted = {};
    Object.keys(block.props.subStyles).forEach(key => {
      if (key === prefix || key.startsWith(prefix + '.')) {
        extracted[key.substring(prefix.length)] = JSON.parse(JSON.stringify(block.props.subStyles[key]));
        delete block.props.subStyles[key];
      }
    });
    return extracted;
  }

  function _applySubStyleTree(block, prefix, tree) {
    if (!block.props.subStyles) block.props.subStyles = {};
    Object.entries(tree || {}).forEach(([suffix, value]) => {
      block.props.subStyles[prefix + suffix] = value;
    });
  }

  function _recursiveSwapSubStyles(block, prefixA, prefixB) {
    if (!block.props.subStyles) return;
    const stylesA = {};
    const stylesB = {};
    Object.keys(block.props.subStyles).forEach(k => {
      if (k === prefixA || k.startsWith(prefixA + '.')) {
        stylesA[k] = block.props.subStyles[k];
        delete block.props.subStyles[k];
      } else if (k === prefixB || k.startsWith(prefixB + '.')) {
        stylesB[k] = block.props.subStyles[k];
        delete block.props.subStyles[k];
      }
    });
    Object.keys(stylesA).forEach(k => {
      const newKey = prefixB + k.substring(prefixA.length);
      block.props.subStyles[newKey] = stylesA[k];
    });
    Object.keys(stylesB).forEach(k => {
      const newKey = prefixA + k.substring(prefixB.length);
      block.props.subStyles[newKey] = stylesB[k];
    });
  }

  /**
   * Get the parent style object for a dynamic child path
   */
  function _getDynamicParent(block, path) {
    const parts = path.split('.');
    parts.pop(); // remove last segment (the cN part)
    const parentPath = parts.join('.');
    if (parentPath === '') return block.props.subStyles; // root level
    return block.props.subStyles[parentPath] || null;
  }

  /**
   * Removes a sub-element
   */
  function removeSubElement(blockId, path) {
    const block = getBlock(blockId);
    if (!block) return;
    if (!block.props.subStyles) block.props.subStyles = {};
    const type = _pathType(path);

    if (type === 'dynamic') {
      const parts = path.split('.');
      const lastPart = parts.pop();
      const parentPath = parts.join('.');
      const index = parseInt(lastPart.substring(1)); // strip 'c'
      const parentStyle = parentPath === '' ? block.props.subStyles : block.props.subStyles[parentPath];
      if (parentStyle && Array.isArray(parentStyle.children)) {
        parentStyle.children.splice(index, 1);
        
        // Remove subStyle entries for the deleted child and ALL its descendants
        Object.keys(block.props.subStyles).forEach(k => {
          if (k === path || k.startsWith(path + '.')) delete block.props.subStyles[k];
        });

        // SHIFT remaining siblings' subStyles down
        for (let i = index + 1; i <= parentStyle.children.length + 1; i++) {
            const oldPrefix = parentPath ? `${parentPath}.c${i}` : `c${i}`;
            const newPrefix = parentPath ? `${parentPath}.c${i-1}` : `c${i-1}`;
            _recursiveRenameSubStyles(block, oldPrefix, newPrefix);
        }
        pushHistory();
        emit('blockUpdated', blockId);
        setSelectedSubPath(null);
        return true;
      }
    } else if (type === 'repeater') {
      const parts = path.split('.');
      const index = parseInt(parts.pop());
      const parentPath = parts.join('.');
      const arr = _getDeepProp(block.props, parentPath);
      if (Array.isArray(arr)) {
        arr.splice(index, 1);
        
        // Remove subStyle entries for the deleted item and descendants
        Object.keys(block.props.subStyles).forEach(k => {
          if (k === path || k.startsWith(path + '.')) delete block.props.subStyles[k];
        });

        // SHIFT remaining siblings
        for (let i = index + 1; i <= arr.length + 1; i++) {
            _recursiveRenameSubStyles(block, `${parentPath}.${i}`, `${parentPath}.${i-1}`);
        }
        pushHistory();
        emit('blockUpdated', blockId);
        setSelectedSubPath(null);
        return true;
      }
    } else {
      // Static template element - Hide it!
      if (!block.props.subStyles[path]) block.props.subStyles[path] = {};
      block.props.subStyles[path].display = 'none';
      window.showToast('Template element hidden. You can reset it from the properties panel.', 'info');
      pushHistory();
      emit('blockUpdated', blockId);
      setSelectedSubPath(null);
      return true;
    }
    return false;
  }

  /**
   * Moves a sub-element up or down
   */
  function moveSubElement(blockId, path, target) {
    const block = getBlock(blockId);
    if (!block) return;
    if (!block.props.subStyles) block.props.subStyles = {};
    const type = _pathType(path);
    const delta = target === 'up' ? -1 : 1;

    if (type === 'dynamic') {
      const parts = path.split('.');
      const lastPart = parts.pop();
      const parentPath = parts.join('.');
      const curIdx = parseInt(lastPart.substring(1));
      const newIdx = curIdx + delta;
      
      const parentStyle = parentPath === '' ? block.props.subStyles : block.props.subStyles[parentPath];
      if (!parentStyle || !Array.isArray(parentStyle.children)) return;
      if (newIdx < 0 || newIdx >= parentStyle.children.length) return;

      // Swap children array entries
      [parentStyle.children[curIdx], parentStyle.children[newIdx]] = [parentStyle.children[newIdx], parentStyle.children[curIdx]];

      // Swap subStyles (Recursive)
      const keyA = parentPath ? `${parentPath}.c${curIdx}` : `c${curIdx}`;
      const keyB = parentPath ? `${parentPath}.c${newIdx}` : `c${newIdx}`;
      _recursiveSwapSubStyles(block, keyA, keyB);

      setSelectedSubPath(keyB);

    } else if (type === 'repeater') {
      const parts = path.split('.');
      const curIdx = parseInt(parts.pop());
      const parentPath = parts.join('.');
      const newIdx = curIdx + delta;
      const arr = _getDeepProp(block.props, parentPath);
      if (!Array.isArray(arr) || newIdx < 0 || newIdx >= arr.length) return;

      // Swap array items
      [arr[curIdx], arr[newIdx]] = [arr[newIdx], arr[curIdx]];

      // Swap subStyles (Recursive)
      const keyA = `${parentPath}.${curIdx}`;
      const keyB = `${parentPath}.${newIdx}`;
      _recursiveSwapSubStyles(block, keyA, keyB);

      setSelectedSubPath(keyB);
    } else {
        // Fallback or handle as segments
        return;
    }

    pushHistory();
    emit('blockUpdated', blockId);
  }

  /**
   * Updates sub-styles for a specific element within a block
   */
  function updateSubStyle(blockId, path, updates) {
    const block = getBlock(blockId);
    if (!block) return;
    if (!block.props.subStyles) block.props.subStyles = {};
    if (!block.props.subStyles[path]) block.props.subStyles[path] = {};
    
    Object.assign(block.props.subStyles[path], updates);

    pushHistory();
    emit('blockUpdated', blockId);
  }

  function appendSubElement(blockId, parentPath, childData, childStyle = null) {
    const block = getBlock(blockId);
    if (!block) return null;
    if (!block.props.subStyles) block.props.subStyles = {};

    const parent = parentPath === ''
      ? block.props.subStyles
      : (block.props.subStyles[parentPath] = block.props.subStyles[parentPath] || {});

    if (!Array.isArray(parent.children)) parent.children = [];
    const insertIndex = parent.children.length;
    parent.children.push(JSON.parse(JSON.stringify(childData)));

    const childPath = parentPath ? `${parentPath}.c${insertIndex}` : `c${insertIndex}`;
    if (childStyle && Object.keys(childStyle).length > 0) {
      block.props.subStyles[childPath] = JSON.parse(JSON.stringify(childStyle));
    }

    pushHistory();
    emit('blockUpdated', blockId);
    return childPath;
  }

  function hideSubElement(blockId, path) {
    const block = getBlock(blockId);
    if (!block) return false;
    if (!block.props.subStyles) block.props.subStyles = {};
    if (!block.props.subStyles[path]) block.props.subStyles[path] = {};
    block.props.subStyles[path].display = 'none';
    pushHistory();
    emit('blockUpdated', blockId);
    return true;
  }

  /**
   * Reorders a sub-element to a specific index within its parent
   */
  function reorderSubElement(blockId, path, newIndex) {
    const block = getBlock(blockId);
    if (!block) return;
    const type = _pathType(path);
    const parts = path.split('.');
    const lastPart = parts.pop();
    const parentPath = parts.join('.');
    const curIdx = parseInt(lastPart.replace(/^[c]/, ''));
    const propName = parts[0];

    if (curIdx === newIndex) return;

    if (type === 'dynamic') {
        const parent = parentPath === '' ? block.props.subStyles : block.props.subStyles[parentPath];
        if (!parent || !Array.isArray(parent.children)) return;
        const [item] = parent.children.splice(curIdx, 1);
        parent.children.splice(newIndex, 0, item);
        const newKey = parentPath ? `${parentPath}.c${newIndex}` : `c${newIndex}`;
        _recursiveSwapSubStyles(block, path, newKey);
    } else if (type === 'repeater') {
        const arr = _getDeepProp(block.props, parentPath);
        if (!Array.isArray(arr)) return;
        const [item] = arr.splice(curIdx, 1);
        arr.splice(newIndex, 0, item);
        const newKey = `${parentPath}.${newIndex}`;
        _recursiveSwapSubStyles(block, path, newKey);
    }

    pushHistory();
    emit('blockUpdated', blockId);
  }

  /**
   * Promotes static template children to a dynamic list in subStyles.
   * This is called by canvas.js when a user tries to move/duplicate a .t path.
   */
  function promoteTemplateChildren(blockId, parentPath, children) {
    const block = getBlock(blockId);
    if (!block) return;

    if (!block.props.subStyles) block.props.subStyles = {};
    const parent = parentPath === '' ? block.props.subStyles : (block.props.subStyles[parentPath] || (block.props.subStyles[parentPath] = {}));
    
    // Set the dynamic children list
    parent.children = children;
    // Mark the template part as "Promoted" so we don't render it twice
    parent.templatePromoted = true;

    emit('blockUpdated', blockId);
  }

  /**
   * Moves a dynamic child to a new parent container
   */
  function moveSubElementToNewParent(blockId, sourcePath, targetParentPath, newIndex) {
    const block = getBlock(blockId);
    if (!block) return;
    if (!block.props.subStyles) block.props.subStyles = {};
    if (_pathType(sourcePath) !== 'dynamic') return;

    const srcParts = sourcePath.split('.');
    const srcLast = srcParts.pop();
    const srcParentPath = srcParts.join('.');
    const srcIdx = parseInt(srcLast.substring(1));

    const srcParent = srcParentPath === '' ? block.props.subStyles : block.props.subStyles[srcParentPath];
    if (!srcParent || !Array.isArray(srcParent.children)) return;

    const item = srcParent.children.splice(srcIdx, 1)[0];
    if (!item) return;

    const tgtParent = targetParentPath === ''
      ? block.props.subStyles
      : (block.props.subStyles[targetParentPath] = block.props.subStyles[targetParentPath] || {});
    if (!Array.isArray(tgtParent.children)) tgtParent.children = [];

    let adjIdx = newIndex;
    if (srcParentPath === targetParentPath && srcIdx < newIndex) adjIdx--;
    tgtParent.children.splice(adjIdx, 0, item);

    // Recursive Rename
    const targetKey = targetParentPath ? `${targetParentPath}.c${adjIdx}` : `c${adjIdx}`;
    _recursiveRenameSubStyles(block, sourcePath, targetKey);
    
    // Also Shift siblings of source
    for (let i = srcIdx + 1; i <= srcParent.children.length + 1; i++) {
        const oldSib = srcParentPath ? `${srcParentPath}.c${i}` : `c${i}`;
        const newSib = srcParentPath ? `${srcParentPath}.c${i-1}` : `c${i-1}`;
        _recursiveRenameSubStyles(block, oldSib, newSib);
    }

    pushHistory();
    emit('blockUpdated', blockId);
    setSelectedSubPath(targetKey);
  }

  function moveSubElementBetweenBlocks(sourceBlockId, sourcePath, targetBlockId, targetParentPath, newIndex = null) {
    if (sourceBlockId === targetBlockId) {
      return moveSubElementToNewParent(sourceBlockId, sourcePath, targetParentPath, newIndex ?? 0);
    }

    const sourceBlock = getBlock(sourceBlockId);
    const targetBlock = getBlock(targetBlockId);
    if (!sourceBlock || !targetBlock) return false;
    if (!sourceBlock.props.subStyles) sourceBlock.props.subStyles = {};
    if (!targetBlock.props.subStyles) targetBlock.props.subStyles = {};
    if (_pathType(sourcePath) !== 'dynamic') return false;

    const srcParts = sourcePath.split('.');
    const srcLast = srcParts.pop();
    const srcParentPath = srcParts.join('.');
    const srcIdx = parseInt(srcLast.substring(1), 10);
    const srcParent = srcParentPath === '' ? sourceBlock.props.subStyles : sourceBlock.props.subStyles[srcParentPath];
    if (!srcParent || !Array.isArray(srcParent.children) || !srcParent.children[srcIdx]) return false;

    const item = srcParent.children.splice(srcIdx, 1)[0];
    const styleTree = _extractSubStyleTree(sourceBlock, sourcePath);

    for (let i = srcIdx + 1; i <= srcParent.children.length + 1; i++) {
      const oldSib = srcParentPath ? `${srcParentPath}.c${i}` : `c${i}`;
      const newSib = srcParentPath ? `${srcParentPath}.c${i-1}` : `c${i-1}`;
      _recursiveRenameSubStyles(sourceBlock, oldSib, newSib);
    }

    const targetParent = targetParentPath === ''
      ? targetBlock.props.subStyles
      : (targetBlock.props.subStyles[targetParentPath] = targetBlock.props.subStyles[targetParentPath] || {});
    if (!Array.isArray(targetParent.children)) targetParent.children = [];

    const insertAt = newIndex === null ? targetParent.children.length : Math.max(0, Math.min(newIndex, targetParent.children.length));
    for (let i = targetParent.children.length - 1; i >= insertAt; i--) {
      const oldPrefix = targetParentPath ? `${targetParentPath}.c${i}` : `c${i}`;
      const newPrefix = targetParentPath ? `${targetParentPath}.c${i+1}` : `c${i+1}`;
      _recursiveRenameSubStyles(targetBlock, oldPrefix, newPrefix);
    }

    targetParent.children.splice(insertAt, 0, item);
    const targetKey = targetParentPath ? `${targetParentPath}.c${insertAt}` : `c${insertAt}`;
    _applySubStyleTree(targetBlock, targetKey, styleTree);

    pushHistory();
    emit('blockUpdated', sourceBlockId);
    emit('blockUpdated', targetBlockId);
    setSelected(targetBlockId);
    setSelectedSubPath(targetKey);
    return true;
  }

  /**
   * Duplicates a sub-element
   */
  function duplicateSubElement(blockId, path) {
    const block = getBlock(blockId);
    if (!block) return;
    if (!block.props.subStyles) block.props.subStyles = {};
    const type = _pathType(path);

    if (type === 'dynamic') {
      const parts = path.split('.');
      const lastPart = parts.pop();
      const parentPath = parts.join('.');
      const index = parseInt(lastPart.substring(1));
      const parentStyle = parentPath === '' ? block.props.subStyles : block.props.subStyles[parentPath];
      if (!parentStyle || !Array.isArray(parentStyle.children)) return;

      const clone = JSON.parse(JSON.stringify(parentStyle.children[index]));
      
      // Shift subsequent siblings' subStyles UP to make room
      for (let i = parentStyle.children.length - 1; i > index; i--) {
          const oldPrefix = parentPath ? `${parentPath}.c${i}` : `c${i}`;
          const newPrefix = parentPath ? `${parentPath}.c${i+1}` : `c${i+1}`;
          _recursiveRenameSubStyles(block, oldPrefix, newPrefix);
      }
      
      parentStyle.children.splice(index + 1, 0, clone);

      // Copy recursive subStyles from original to new
      const newKey = parentPath ? `${parentPath}.c${index + 1}` : `c${index + 1}`;
      _recursiveCopySubStyles(block, path, newKey);
      
      setSelectedSubPath(newKey);

    } else if (type === 'repeater') {
      const parts = path.split('.');
      const index = parseInt(parts.pop());
      const parentPath = parts.join('.');
      const arr = _getDeepProp(block.props, parentPath);
      if (!Array.isArray(arr)) return;

      const clone = JSON.parse(JSON.stringify(arr[index]));
      
      // Shift siblings
      for (let i = arr.length - 1; i > index; i--) {
          _recursiveRenameSubStyles(block, `${parentPath}.${i}`, `${parentPath}.${i+1}`);
      }
      
      arr.splice(index + 1, 0, clone);

      const newKey = `${parentPath}.${index + 1}`;
      _recursiveCopySubStyles(block, path, newKey);
      
      setSelectedSubPath(newKey);
    } else {
        window.showToast('Template elements cannot be duplicated directly. Use "Append Child Element" to add more items.', 'info');
        return;
    }

    pushHistory();
    emit('blockUpdated', blockId);
  }

  function setSelected(id) {
    if (_selectedId !== id) {
      _selectedId = id;
      _selectedSubPath = null;
      emit('selectionChanged', id);
    }
  }

  function setSelectedSubPath(path) {
    _selectedSubPath = path;
    emit('subSelectionChanged', path);
  }

  function updateBlockParent(id, parentId, index = null) {
    const blockIdx = _blocks.findIndex(b => b.id === id);
    if (blockIdx === -1) return;
    const block = _blocks[blockIdx];

    if (parentId === id) return;
    let ancestorId = parentId || null;
    while (ancestorId) {
      if (ancestorId === id) return;
      const ancestor = _blocks.find(b => b.id === ancestorId);
      ancestorId = ancestor ? ancestor.parentId : null;
    }

    _blocks.splice(blockIdx, 1);
    block.parentId = parentId || null;
    
    if (index !== null && index >= 0) {
      const siblings = _blocks.filter(b => b && b.pageId === block.pageId && b.parentId === block.parentId);
      if (index < siblings.length) {
        const targetSibling = siblings[index];
        const globalIdx = _blocks.indexOf(targetSibling);
        _blocks.splice(globalIdx, 0, block);
      } else {
        _blocks.push(block);
      }
    } else {
      _blocks.push(block);
    }
    pushHistory();
    emit('blocksChanged');
  }

  function setDevice(device) {
    _device = device;
    emit('deviceChanged', device);
  }

  function setTheme(id, shouldTrackHistory = false) {
    _activeTheme = id;
    if (shouldTrackHistory) pushHistory();
    else saveToLocal();
  }
  function getTheme() { return _activeTheme; }

  function applyThemeToProject(themeVars, shouldTrackHistory = true) {
    if (!themeVars || typeof themeVars !== 'object') return;

    const sectionBg = themeVars['--sf-section-bg'] || themeVars['--sf-bg'] || '';
    const headerBg = themeVars['--sf-header-bg'] || sectionBg;
    const footerBg = themeVars['--sf-footer-bg'] || sectionBg;
    const textColor = themeVars['--sf-text'] || '';
    const mutedText = themeVars['--sf-text-muted'] || textColor;
    const accentColor = themeVars['--sf-accent'] || '';
    const buttonBg = themeVars['--sf-btn-bg'] || accentColor || sectionBg;
    const buttonText = themeVars['--sf-btn-text'] || textColor;
    const cardBg = themeVars['--sf-card-bg'] || sectionBg;
    const borderColor = themeVars['--sf-border'] || '';
    const linkColor = themeVars['--sf-link-color'] || accentColor || textColor;
    const headingColor = themeVars['--sf-heading-color'] || textColor;

    const buttonLikeTypes = new Set(['button']);
    const headerTypes = new Set(['navbar']);
    const footerTypes = new Set(['footer']);
    const cardLikeTypes = new Set(['box', 'container', 'text', 'image', 'video', 'divider', 'accordion', 'table', 'word', 'motionPopup']);
    const accentHeavyTypes = new Set(['hero', 'services', 'contact', 'cta', 'pricing', 'products', 'roadmap', 'videoCarousel', 'testimonials', 'stats', 'accordion', 'table', 'word', 'motionPopup']);
    const lightSurfaceTypes = new Set(['about', 'services', 'testimonials', 'pricing', 'products', 'contact', 'videoCarousel', 'roadmap', 'accordion', 'table', 'word', 'motionPopup']);

    const applyThemeToStyleObject = (styleObj, bgValue, localTextColor = textColor) => {
      if (!styleObj || typeof styleObj !== 'object') return;
      if ('color' in styleObj) styleObj.color = localTextColor;
      if ('textColor' in styleObj) styleObj.textColor = localTextColor;
      if ('background' in styleObj) styleObj.background = bgValue;
      if ('bgColor' in styleObj) styleObj.bgColor = bgValue;
      if ('backgroundColor' in styleObj) styleObj.backgroundColor = bgValue;
      if ('borderColor' in styleObj) styleObj.borderColor = borderColor;
      if ('accentColor' in styleObj) styleObj.accentColor = accentColor;
      if ('buttonColor' in styleObj) styleObj.buttonColor = buttonBg;
      if ('cardBg' in styleObj) styleObj.cardBg = cardBg;
      if ('cardBorder' in styleObj) styleObj.cardBorder = borderColor;
      if ('fill' in styleObj) styleObj.fill = accentColor;
      if ('stroke' in styleObj) styleObj.stroke = accentColor;
    };

    _blocks.forEach((block) => {
      if (!block || !block.props) return;

      let blockBg = sectionBg;
      let blockText = textColor;
      let innerSurface = cardBg;

      if (headerTypes.has(block.type)) blockBg = headerBg;
      else if (footerTypes.has(block.type)) blockBg = footerBg;
      else if (buttonLikeTypes.has(block.type)) blockBg = buttonBg;
      else if (cardLikeTypes.has(block.type)) blockBg = cardBg;

      if (buttonLikeTypes.has(block.type)) blockText = buttonText;
      if (!lightSurfaceTypes.has(block.type) && block.type !== 'footer') innerSurface = cardBg;

      if ('bgColor' in block.props) block.props.bgColor = blockBg;
      if ('background' in block.props) block.props.background = blockBg;
      if ('textColor' in block.props) block.props.textColor = blockText;
      if ('color' in block.props) block.props.color = blockText;
      if ('accentColor' in block.props) block.props.accentColor = accentColor;
      if ('headingColor' in block.props) block.props.headingColor = headingColor;
      if ('buttonColor' in block.props) block.props.buttonColor = buttonBg;
      if ('buttonTextColor' in block.props) block.props.buttonTextColor = buttonText;
      if ('cardBg' in block.props) block.props.cardBg = innerSurface;
      if ('cardBorder' in block.props) block.props.cardBorder = borderColor;
      if ('border' in block.props && typeof block.props.border === 'string' && block.props.border.trim()) {
        block.props.border = block.props.border.replace(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g, borderColor || '$&');
      }
      if ('borderColor' in block.props) block.props.borderColor = borderColor;
      if ('linkColor' in block.props) block.props.linkColor = linkColor;
      if ('fontColor' in block.props) block.props.fontColor = blockText;

      // Common nested data structures used by several blocks
      if (Array.isArray(block.props.items)) {
        block.props.items.forEach((item) => {
          if (!item || typeof item !== 'object') return;
          if ('bgColor' in item) item.bgColor = innerSurface;
          if ('background' in item) item.background = innerSurface;
          if ('textColor' in item) item.textColor = blockText;
          if ('accentColor' in item) item.accentColor = accentColor;
          if ('color' in item) item.color = blockText;
          if ('borderColor' in item) item.borderColor = borderColor;
        });
      }
      if (Array.isArray(block.props.plans)) {
        block.props.plans.forEach((plan) => {
          if (!plan || typeof plan !== 'object') return;
          if ('bgColor' in plan) plan.bgColor = plan.popular ? accentColor : innerSurface;
          if ('cardBg' in plan) plan.cardBg = plan.popular ? accentColor : innerSurface;
          if ('textColor' in plan) plan.textColor = plan.popular ? buttonText : blockText;
          if ('accentColor' in plan) plan.accentColor = accentColor;
          if ('borderColor' in plan) plan.borderColor = borderColor;
        });
      }
      if (Array.isArray(block.props.links)) {
        block.props.links.forEach((link) => {
          if (!link || typeof link !== 'object') return;
          if ('color' in link) link.color = linkColor;
          if ('textColor' in link) link.textColor = linkColor;
        });
      }

      if (block.props.subStyles && typeof block.props.subStyles === 'object') {
        Object.entries(block.props.subStyles).forEach(([path, styleObj]) => {
          if (!styleObj || typeof styleObj !== 'object' || Array.isArray(styleObj)) return;
          let subBg = sectionBg;
          let subText = blockText;
          if (/(\.|^)items\./.test(path) || /(\.|^)plans\./.test(path) || /(\.|^)cards\./.test(path) || /(\.|^)children\./.test(path) || /(\.|^)info\./.test(path)) {
            subBg = innerSurface;
          }
          if (/(\.|^)(badge|cta|button|submit|price|icon)(\.|$)/.test(path) || accentHeavyTypes.has(block.type) && /(\.|^)(cta|badge|button|icon)(\.|$)/.test(path)) {
            subBg = buttonBg;
            subText = buttonText;
          }
          if (/(\.|^)(name|title|subtitle|desc|text|role|date|label|num|val|per)(\.|$)/.test(path) && subBg === buttonBg) {
            subBg = innerSurface;
            subText = blockText;
          }
          applyThemeToStyleObject(styleObj, subBg, subText);
        });
      }
    });

    if (shouldTrackHistory) pushHistory();
    else saveToLocal();
    emit('blocksChanged');
    if (_selectedId) emit('blockUpdated', _selectedId);
  }

  function updateMeta(meta) {
    Object.assign(_meta, meta);
    const currentPage = _pages.find(p => p.id === _currentPageId);
    if (currentPage && currentPage.meta) {
      Object.assign(currentPage.meta, meta);
    }
    pushHistory();
    emit('metaChanged');
  }

  function importBlocks(blocks, meta = null, pages = null, theme = null) {
    if (!Array.isArray(blocks)) {
        console.warn('Import failed: blocks is not an array. Falling back to empty project.');
        blocks = [];
    }
    _blocks = blocks.filter(b => b && typeof b === 'object' && b.id && b.type);
    
    if (meta && typeof meta === 'object') {
        _meta = { ..._meta, ...meta };
    }

    _activeTheme = theme || null;
    
    if (Array.isArray(pages) && pages.length > 0) {
      _pages = pages.filter(p => p && p.id && p.name && p.filename);
      if (_pages.length > 0) {
          _currentPageId = _pages[0].id;
      }
    } 
    
    if (!Array.isArray(pages) || pages.length === 0 || _pages.length === 0) {
      // If no valid pages, assume single page migration
      _pages = [{ id: 'page_index', name: 'Home', filename: 'index.html', meta: { ..._meta } }];
      _currentPageId = 'page_index';
      _blocks.forEach(b => { if (!b.pageId) b.pageId = 'page_index'; });
    }
    
    _selectedId = null;
    _selectedSubPath = null;
    pushHistory();
    emit('pagesChanged', _pages);
    emit('blocksChanged');
    emit('selectionChanged', null);
  }

  function clearProject() {
      _blocks = [];
      _selectedId = null;
      pushHistory();
      emit('blocksChanged');
      emit('selectionChanged', null);
  }

  function getBlockIndex(id) { return _blocks.findIndex(b => b.id === id); }

  // Initial load
  setTimeout(() => {
    loadFromLocal();
    _history = [snapshot()];
    _historyStep = 0;
  }, 0);

  return {
    on, emit,
    getBlocks, getAllBlocks, getBlock, getSelectedId, getSelectedSubPath, getDevice, getMeta, getActiveTheme,
    setSelected, setSelectedSubPath, setDevice, updateMeta, addBlock, removeBlock, duplicateBlock, moveBlock,
    updateBlockProps, updateBlockParent, updateSubStyle, appendSubElement, hideSubElement, removeSubElement, moveSubElement, moveSubElementToNewParent, moveSubElementBetweenBlocks, duplicateSubElement, promoteTemplateChildren, reorderSubElement, setTheme, getTheme, applyThemeToProject, importBlocks, clearProject, getBlockIndex, undo, redo, sanitize, _pathType,
    getPages, getCurrentPageId, addPage, removePage, switchPage, renamePage
  };
})();

