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
    _history.push(JSON.stringify({ blocks: _blocks, pages: _pages, currentPageId: _currentPageId, meta: _meta }));
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
        emit('blocksChanged');
        emit('metaChanged');
        emit('pagesChanged', _pages);
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
        emit('blocksChanged');
        emit('metaChanged');
        emit('pagesChanged', _pages);
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

  function addPage(name) {
    const id = 'page_' + Math.random().toString(36).substr(2, 9);
    const filename = name.toLowerCase().replace(/\s+/g, '-') + '.html';
    const newPage = { id, name, filename, meta: { ..._meta } };
    _pages.push(newPage);
    _currentPageId = id;
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
    emit('pagesChanged', _pages);
    emit('blocksChanged');
    emit('selectionChanged', null);
  }

  function renamePage(id, newName) {
    const page = _pages.find(p => p.id === id);
    if (page) {
      page.name = newName;
      page.filename = newName.toLowerCase().replace(/\s+/g, '-') + '.html';
      pushHistory();
      emit('pagesChanged', _pages);
    }
  }

  function addBlock(blockDef, index = null) {
    const id = Math.random().toString(36).substr(2, 9);
    const newBlock = { ...blockDef, id: id, pageId: _currentPageId, parentId: blockDef.parentId || null };
    if (index === null) {
        _blocks.push(newBlock);
    } else {
        _blocks.splice(index, 0, newBlock);
    }
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
    const newId = Math.random().toString(36).substr(2, 9);
    
    // Shallow copy of main block
    const copy = JSON.parse(JSON.stringify(original));
    copy.id = newId;
    
    // Add to main blocks array immediately after original
    _blocks.splice(idx + 1, 0, copy);
    
    // If it's a container, we MUST also duplicate its child blocks
    const children = _blocks.filter(b => b.parentId === id);
    children.forEach(child => {
        const childCopy = JSON.parse(JSON.stringify(child));
        childCopy.id = Math.random().toString(36).substr(2, 9);
        childCopy.parentId = newId;
        _blocks.push(childCopy); // Position here doesn't matter much as they have parentId
    });

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
   * Helper: determine path type
   * - isDynamic: path ends with .cN or starts with cN (append-child)
   * - isRepeater: two-part dot path where second part is a pure number (e.g. items.0)
   */
  function _pathType(path) {
    if (/(?:^|\.)c\d+$/.test(path)) return 'dynamic';
    if (/^[a-zA-Z_]+\.\d+$/.test(path)) return 'repeater';
    return 'static';
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
        // Remove subStyle entries for the deleted child
        const childPrefix = path;
        Object.keys(block.props.subStyles).forEach(k => {
          if (k === childPrefix || k.startsWith(childPrefix + '.')) delete block.props.subStyles[k];
        });
      }
    } else if (type === 'repeater') {
      const [propName, idxStr] = path.split('.');
      const index = parseInt(idxStr);
      if (Array.isArray(block.props[propName])) {
        block.props[propName].splice(index, 1);
        Object.keys(block.props.subStyles).forEach(k => {
          if (k === path || k.startsWith(path + '.')) delete block.props.subStyles[k];
        });
      }
    } else {
      // Static template element - just clear its styles
      delete block.props.subStyles[path];
      Object.keys(block.props.subStyles).forEach(k => {
        if (k.startsWith(path + '.')) delete block.props.subStyles[k];
      });
    }

    pushHistory();
    emit('blockUpdated', blockId);
    setSelectedSubPath(null);
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

      // Swap subStyles
      const keyA = parentPath ? `${parentPath}.c${curIdx}` : `c${curIdx}`;
      const keyB = parentPath ? `${parentPath}.c${newIdx}` : `c${newIdx}`;
      const tmp = block.props.subStyles[keyA];
      block.props.subStyles[keyA] = block.props.subStyles[keyB];
      if (block.props.subStyles[keyA] === undefined) delete block.props.subStyles[keyA];
      block.props.subStyles[keyB] = tmp;
      if (block.props.subStyles[keyB] === undefined) delete block.props.subStyles[keyB];

      setSelectedSubPath(keyB);

    } else if (type === 'repeater') {
      const [propName, idxStr] = path.split('.');
      const curIdx = parseInt(idxStr);
      const newIdx = curIdx + delta;
      const arr = block.props[propName];
      if (!Array.isArray(arr) || newIdx < 0 || newIdx >= arr.length) return;

      // Swap array items
      [arr[curIdx], arr[newIdx]] = [arr[newIdx], arr[curIdx]];

      // Swap subStyles
      const keyA = `${propName}.${curIdx}`;
      const keyB = `${propName}.${newIdx}`;
      const tmp = block.props.subStyles[keyA];
      block.props.subStyles[keyA] = block.props.subStyles[keyB];
      if (block.props.subStyles[keyA] === undefined) delete block.props.subStyles[keyA];
      block.props.subStyles[keyB] = tmp;
      if (block.props.subStyles[keyB] === undefined) delete block.props.subStyles[keyB];

      setSelectedSubPath(keyB);
    }
    // Static template elements: no reordering supported

    pushHistory();
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

    // Move/rename subStyle entry
    const targetKey = targetParentPath ? `${targetParentPath}.c${adjIdx}` : `c${adjIdx}`;
    const srcStyle = block.props.subStyles[sourcePath];
    if (srcStyle) {
      block.props.subStyles[targetKey] = srcStyle;
      delete block.props.subStyles[sourcePath];
    }

    pushHistory();
    emit('blockUpdated', blockId);
    setSelectedSubPath(targetKey);
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
      parentStyle.children.splice(index + 1, 0, clone);

      const newKey = parentPath ? `${parentPath}.c${index + 1}` : `c${index + 1}`;
      const existingStyle = block.props.subStyles[path];
      if (existingStyle) block.props.subStyles[newKey] = JSON.parse(JSON.stringify(existingStyle));
      setSelectedSubPath(newKey);

    } else if (type === 'repeater') {
      const [propName, idxStr] = path.split('.');
      const index = parseInt(idxStr);
      const arr = block.props[propName];
      if (!Array.isArray(arr)) return;

      const clone = JSON.parse(JSON.stringify(arr[index]));
      arr.splice(index + 1, 0, clone);

      const newKey = `${propName}.${index + 1}`;
      const existingStyle = block.props.subStyles[path];
      if (existingStyle) block.props.subStyles[newKey] = JSON.parse(JSON.stringify(existingStyle));
      setSelectedSubPath(newKey);
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
    _blocks.splice(blockIdx, 1);
    block.parentId = parentId || null;
    
    if (index !== null && index >= 0) {
      const siblings = _blocks.filter(b => b && b.parentId === block.parentId);
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

  function setTheme(id) {
    _activeTheme = id;
    saveToLocal();
  }
  function getTheme() { return _activeTheme; }

  function updateMeta(meta) {
    Object.assign(_meta, meta);
    pushHistory();
    emit('metaChanged');
  }

  function importBlocks(blocks, meta = null, pages = null) {
    _blocks = (blocks || []).filter(b => !!b);
    if (meta) _meta = { ..._meta, ...meta };
    if (pages && pages.length > 0) {
      _pages = pages;
      _currentPageId = pages[0].id;
    } else {
      // If no pages, assume single page migration
      _pages = [{ id: 'page_index', name: 'Home', filename: 'index.html', meta: { ..._meta } }];
      _currentPageId = 'page_index';
      _blocks.forEach(b => { if (!b.pageId) b.pageId = 'page_index'; });
    }
    _selectedId = null;
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
    _history.push(JSON.stringify({ blocks: _blocks, meta: _meta }));
    _historyStep = 0;
  }, 0);

  return {
    on, emit,
    getBlocks, getAllBlocks, getBlock, getSelectedId, getSelectedSubPath, getDevice, getMeta, getActiveTheme,
    setSelected, setSelectedSubPath, setDevice, updateMeta, addBlock, removeBlock, duplicateBlock, moveBlock,
    updateBlockProps, updateBlockParent, removeSubElement, moveSubElement, moveSubElementToNewParent, duplicateSubElement, setTheme, getTheme, importBlocks, clearProject, getBlockIndex, undo, redo, sanitize,
    getPages, getCurrentPageId, addPage, removePage, switchPage, renamePage
  };
})();

