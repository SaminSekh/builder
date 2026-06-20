// ============================================================
// state.js â€“ Global application state
// ============================================================

const State = (() => {
  // --- Schema Version ---
  // Increment this when the data shape changes. Migrations handle upgrades.
  const SCHEMA_VERSION = 2;

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

  // --- ID Generation ---
  // Collision-resistant IDs using a counter + random suffix.
  let _idCounter = 0;
  function generateId(prefix) {
    _idCounter++;
    const rand = Math.random().toString(36).substr(2, 6);
    const ts = Date.now().toString(36).slice(-4);
    return (prefix || '') + ts + rand + _idCounter.toString(36);
  }

  function snapshot() {
    return JSON.stringify({
      version: SCHEMA_VERSION,
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
      version: SCHEMA_VERSION,
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
            let data = JSON.parse(saved);
            
            // --- Run migrations if needed ---
            data = migrateData(data);
            
            _blocks = validateBlocks(data.blocks || []);
            
            // Migration for older projects (single page)
            if (!data.pages || data.pages.length === 0) {
              _pages = [{ id: 'page_index', name: 'Home', filename: 'index.html', meta: { ...data.meta } }];
              _currentPageId = 'page_index';
              _blocks.forEach(b => { if (!b.pageId) b.pageId = 'page_index'; });
            } else {
              _pages = validatePages(data.pages);
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

  // --- Data Migration System ---
  function migrateData(data) {
    const version = data.version || 1;
    
    // v1 → v2: Add pageId to blocks, ensure props object exists
    if (version < 2) {
      if (Array.isArray(data.blocks)) {
        data.blocks.forEach(b => {
          if (b && !b.pageId) b.pageId = 'page_index';
          if (b && !b.props) b.props = {};
        });
      }
      data.version = 2;
    }
    
    // Future migrations go here:
    // if (version < 3) { ... data.version = 3; }
    
    return data;
  }

  // --- Block Validation ---
  // Ensures every block has required fields and valid structure.
  function validateBlocks(blocks) {
    if (!Array.isArray(blocks)) return [];
    
    const seenIds = new Set();
    const validated = [];
    
    for (const b of blocks) {
      // Must be a non-null object with id and type
      if (!b || typeof b !== 'object' || !b.id || !b.type) continue;
      
      // Type must be a known block type (if BlockTypes is available)
      if (typeof BlockTypes !== 'undefined' && !BlockTypes[b.type]) {
        console.warn(`State: Skipping block with unknown type "${b.type}" (id: ${b.id})`);
        continue;
      }
      
      // Deduplicate IDs — if collision, regenerate
      if (seenIds.has(b.id)) {
        console.warn(`State: Duplicate block ID "${b.id}" detected. Regenerating.`);
        b.id = generateId('blk_');
      }
      seenIds.add(b.id);
      
      // Ensure props is an object
      if (!b.props || typeof b.props !== 'object') {
        b.props = {};
      }
      
      // Ensure parentId is either null or a string
      if (b.parentId !== null && b.parentId !== undefined && typeof b.parentId !== 'string') {
        b.parentId = null;
      }
      
      // Ensure pageId is a string
      if (!b.pageId || typeof b.pageId !== 'string') {
        b.pageId = 'page_index';
      }
      
      validated.push(b);
    }
    
    return validated;
  }

  // --- Page Validation ---
  function validatePages(pages) {
    if (!Array.isArray(pages)) return [{ id: 'page_index', name: 'Home', filename: 'index.html', meta: null }];
    
    const seenIds = new Set();
    const seenFilenames = new Set();
    const validated = [];
    
    for (const p of pages) {
      if (!p || typeof p !== 'object' || !p.id || !p.name) continue;
      
      // Deduplicate page IDs
      if (seenIds.has(p.id)) {
        console.warn(`State: Duplicate page ID "${p.id}" detected. Regenerating.`);
        p.id = generateId('page_');
      }
      seenIds.add(p.id);
      
      // Ensure filename exists and is unique
      if (!p.filename) p.filename = buildPageFilename(p.name);
      if (seenFilenames.has(p.filename)) {
        p.filename = buildPageFilename(p.name + '-' + Math.random().toString(36).substr(2, 4));
      }
      seenFilenames.add(p.filename);
      
      validated.push(p);
    }
    
    // Must have at least one page
    if (validated.length === 0) {
      validated.push({ id: 'page_index', name: 'Home', filename: 'index.html', meta: null });
    }
    
    return validated;
  }

  let _historyDebounceTimer = null;

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

  /**
   * Debounced history push — coalesces rapid changes (e.g. typing) into a single undo step.
   * Immediate save to localStorage still happens for crash safety.
   */
  function pushHistoryDebounced(delay = 600) {
    saveToLocal();
    if (_historyDebounceTimer) clearTimeout(_historyDebounceTimer);
    _historyDebounceTimer = setTimeout(() => {
      _historyDebounceTimer = null;
      pushHistory();
    }, delay);
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
      // Collect all valid block IDs for reference checking
      const validIds = new Set(_blocks.filter(b => !!b).map(b => b.id));
      // Collect all valid page IDs
      const validPageIds = new Set(_pages.map(p => p.id));
      
      _blocks.forEach(b => {
        if (!b) return;
        
        // Fix orphaned parentId references
        if (b.parentId && !validIds.has(b.parentId)) {
          console.warn(`State: Sanitized orphan block ${b.id} (type: ${b.type}). Parent "${b.parentId}" not found, moved to root.`);
          b.parentId = null;
          changed = true;
        }
        
        // Fix invalid pageId references
        if (!b.pageId || !validPageIds.has(b.pageId)) {
          console.warn(`State: Block ${b.id} had invalid pageId "${b.pageId}". Assigned to first page.`);
          b.pageId = _pages[0]?.id || 'page_index';
          changed = true;
        }
        
        // Detect circular parent references
        if (b.parentId) {
          const visited = new Set([b.id]);
          let current = b.parentId;
          let depth = 0;
          while (current && depth < 50) {
            if (visited.has(current)) {
              console.warn(`State: Circular parent reference detected for block ${b.id}. Breaking cycle.`);
              b.parentId = null;
              changed = true;
              break;
            }
            visited.add(current);
            const parent = _blocks.find(x => x && x.id === current);
            current = parent ? parent.parentId : null;
            depth++;
          }
          if (depth >= 50) {
            console.warn(`State: Excessively deep nesting for block ${b.id}. Moving to root.`);
            b.parentId = null;
            changed = true;
          }
        }
        
        // Ensure props exists
        if (!b.props || typeof b.props !== 'object') {
          b.props = {};
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
    const id = generateId('page_');
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
          const nextId = generateId('b_');
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

  function duplicatePage(id) {
    const sourcePage = _pages.find(p => p.id === id);
    if (!sourcePage) return;

    const newId = generateId('page_');
    const newName = sourcePage.name + ' (Copy)';
    const filename = buildPageFilename(newName);
    
    const newPage = { 
      id: newId, 
      name: newName, 
      filename: filename, 
      meta: sourcePage.meta ? JSON.parse(JSON.stringify(sourcePage.meta)) : { ..._meta } 
    };
    
    _pages.push(newPage);

    const sourceBlocks = _blocks.filter(b => b && b.pageId === id);
    if (sourceBlocks.length > 0) {
      const idMap = new Map();
      const clones = sourceBlocks.map((block) => {
        const copy = JSON.parse(JSON.stringify(block));
        const nextId = generateId('b_');
        idMap.set(block.id, nextId);
        copy.id = nextId;
        copy.pageId = newId;
        return copy;
      });

      clones.forEach((copy) => {
        const originalParentId = copy.parentId;
        copy.parentId = originalParentId ? (idMap.get(originalParentId) || null) : null;
      });

      _blocks.push(...clones);
    }

    _currentPageId = newId;
    pushHistory();
    emit('pagesChanged', _pages);
    emit('blocksChanged');
    emit('selectionChanged', null);
    return newId;
  }

  function addBlock(blockDef, index = null) {
    const id = generateId('b_');
    // Deep clone the block definition to prevent shared object references
    const clonedProps = JSON.parse(JSON.stringify(blockDef.props || {}));
    const newBlock = { 
      type: blockDef.type, 
      props: clonedProps, 
      id: id, 
      pageId: _currentPageId, 
      parentId: blockDef.parentId || null 
    };
    
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
    // Collect the target block and ALL its descendants (deep)
    const toRemove = new Set([id]);
    let changed = true;
    while (changed) {
      changed = false;
      _blocks.forEach(b => {
        if (b && b.parentId && toRemove.has(b.parentId) && !toRemove.has(b.id)) {
          toRemove.add(b.id);
          changed = true;
        }
      });
    }

    _blocks = _blocks.filter(b => !toRemove.has(b.id));

    if (_selectedId && toRemove.has(_selectedId)) {
      _selectedId = null;
      _selectedSubPath = null;
    }
    pushHistory();
    emit('blocksChanged');
    emit('selectionChanged', _selectedId);
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
      copy.id = generateId('b_');
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

  function updateBlockProps(id, props, options) {
    const block = _blocks.find(b => b.id === id);
    if (!block) return;
    
    // If forceRoot is set, always update root props (bypass subPath routing)
    const forceRoot = options && options.forceRoot;
    
    if (_selectedSubPath && !forceRoot) {
      if (!block.props.subStyles) block.props.subStyles = {};
      if (!block.props.subStyles[_selectedSubPath]) block.props.subStyles[_selectedSubPath] = {};
      Object.assign(block.props.subStyles[_selectedSubPath], props);
    } else {
      Object.assign(block.props, props);
    }
    // Use debounced history for rapid changes (typing), immediate for discrete actions
    if (options && options.immediate) {
      pushHistory();
    } else {
      pushHistoryDebounced();
    }
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
   * Ensures a repeater array exists in block.props.
   * If missing, initializes it from known block-type defaults.
   * Returns the array (or null if can't be resolved).
   */
  function _ensureRepeaterArray(block, parentPath) {
    let arr = _getDeepProp(block.props, parentPath);
    if (Array.isArray(arr)) return arr;
    
    // Only initialize top-level arrays (not nested paths like "items.0.segments")
    if (parentPath.includes('.')) return null;
    
    if (parentPath === 'segments' && !block.props.segments) {
        const defaults = {
            hero: [{ type: 'title' }, { type: 'subtitle' }, { type: 'ctas' }],
            about: [{ type: 'badge' }, { type: 'title' }, { type: 'text' }, { type: 'features' }],
            services: [{ type: 'badge' }, { type: 'title' }, { type: 'subtitle' }, { type: 'items' }],
            contact: [{ type: 'header' }, { type: 'content' }],
            footer: [{ type: 'content' }, { type: 'copyright' }],
            testimonials: [{ type: 'badge' }, { type: 'title' }, { type: 'subtitle' }, { type: 'items' }],
            pricing: [{ type: 'badge' }, { type: 'title' }, { type: 'subtitle' }, { type: 'items' }],
            stats: [{ type: 'title' }, { type: 'subtitle' }, { type: 'items' }],
            cta: [{ type: 'title' }, { type: 'subtitle' }],
            accordion: [{ type: 'header' }, { type: 'items' }]
        };
        block.props.segments = defaults[block.type] || [{ type: 'title' }, { type: 'subtitle' }];
        return block.props.segments;
    }
    
    if (parentPath === 'ctas' && !block.props.ctas) {
        block.props.ctas = [];
        if (block.props.ctaText) block.props.ctas.push({ text: block.props.ctaText, href: block.props.ctaHref || '#', primary: true });
        if (block.props.cta2Text) block.props.ctas.push({ text: block.props.cta2Text, href: block.props.cta2Href || '#', primary: false });
        return block.props.ctas;
    }
    
    return block.props[parentPath] || null;
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
      const arr = _ensureRepeaterArray(block, parentPath);
      
      if (!Array.isArray(arr) || newIdx < 0 || newIdx >= arr.length) return;

      // Swap array items
      [arr[curIdx], arr[newIdx]] = [arr[newIdx], arr[curIdx]];

      // Swap subStyles (Recursive)
      const keyA = `${parentPath}.${curIdx}`;
      const keyB = `${parentPath}.${newIdx}`;
      _recursiveSwapSubStyles(block, keyA, keyB);

      setSelectedSubPath(keyB);
    } else if (type === 'template') {
      // Template paths like "segments.0.t1" — swap within parent's children
      const parts = path.split('.');
      const lastPart = parts.pop();
      const parentPath = parts.join('.');
      const curIdx = parseInt(lastPart.substring(1)); // strip 't'
      const newIdx = curIdx + delta;
      
      // Template children are rendered from DOM, not state arrays
      // We need to promote them first, then move
      // For now, show a message
      if (window.showToast) window.showToast('Use "Show Structure" panel to reorder template elements, or promote them first.', 'info');
      return;
    } else {
        // Static paths like "segments.0" — try to swap in the segments/items array
        const parts = path.split('.');
        if (parts.length >= 2) {
            const arrayKey = parts[0]; // e.g. "segments", "items", "features"
            const curIdx = parseInt(parts[1]);
            const newIdx = curIdx + delta;
            const arr = block.props[arrayKey];
            
            if (Array.isArray(arr) && !isNaN(curIdx) && newIdx >= 0 && newIdx < arr.length) {
                [arr[curIdx], arr[newIdx]] = [arr[newIdx], arr[curIdx]];
                
                // Swap subStyles
                const keyA = `${arrayKey}.${curIdx}`;
                const keyB = `${arrayKey}.${newIdx}`;
                _recursiveSwapSubStyles(block, keyA, keyB);
                
                setSelectedSubPath(`${arrayKey}.${newIdx}`);
                pushHistory();
                emit('blockUpdated', blockId);
                return;
            }
        }
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
      const arr = _ensureRepeaterArray(block, parentPath);
      
      if (!Array.isArray(arr) || index >= arr.length) return;

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

    // Theme backgrounds are applied ONLY at body/canvas level via CSS.
    // This function only updates text colors and accent colors on blocks
    // so text remains readable against the theme background.
    // Block backgrounds are NEVER touched — they stay as the user set them.

    const textColor = themeVars['--sf-text'] || '';
    const accentColor = themeVars['--sf-accent'] || '';
    const buttonBg = themeVars['--sf-btn-bg'] || accentColor;
    const buttonText = themeVars['--sf-btn-text'] || '#ffffff';
    const headingColor = themeVars['--sf-heading-color'] || textColor;
    const linkColor = themeVars['--sf-link-color'] || accentColor || textColor;

    _blocks.forEach((block) => {
      if (!block || !block.props) return;

      // Update text and accent colors only (not backgrounds)
      if ('textColor' in block.props) block.props.textColor = textColor;
      if ('color' in block.props && block.type !== 'button') block.props.color = textColor;
      if ('accentColor' in block.props) block.props.accentColor = accentColor;
      if ('headingColor' in block.props) block.props.headingColor = headingColor;
      if ('linkColor' in block.props) block.props.linkColor = linkColor;
      if ('fontColor' in block.props) block.props.fontColor = textColor;

      // Button-specific: update button colors
      if (block.type === 'button') {
        if ('bgColor' in block.props) block.props.bgColor = buttonBg;
        if ('color' in block.props) block.props.color = buttonText;
      }
      if ('buttonColor' in block.props) block.props.buttonColor = buttonBg;
      if ('buttonTextColor' in block.props) block.props.buttonTextColor = buttonText;
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
    
    // Deep clone imported data to prevent external mutation
    let importedBlocks;
    try {
      importedBlocks = JSON.parse(JSON.stringify(blocks));
    } catch (e) {
      console.warn('Import failed: blocks could not be cloned.', e);
      importedBlocks = [];
    }
    
    // Validate and sanitize imported blocks
    _blocks = validateBlocks(importedBlocks);
    
    if (meta && typeof meta === 'object') {
        // Only merge known meta keys to prevent injection of arbitrary data
        const safeMeta = {};
        const allowedMetaKeys = ['title', 'description', 'keywords', 'favicon', 'scripts', 'fonts', 'url', 'robots', 'whatsapp', 'telegram', 'currency', 'cartTitle'];
        allowedMetaKeys.forEach(key => {
          if (meta[key] !== undefined) safeMeta[key] = String(meta[key] || '');
        });
        _meta = { ..._meta, ...safeMeta };
    }

    _activeTheme = (theme && typeof theme === 'string') ? theme : null;
    
    if (Array.isArray(pages) && pages.length > 0) {
      let importedPages;
      try {
        importedPages = JSON.parse(JSON.stringify(pages));
      } catch (e) {
        importedPages = [];
      }
      _pages = validatePages(importedPages);
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
    
    // Ensure all blocks reference valid pages
    const validPageIds = new Set(_pages.map(p => p.id));
    _blocks.forEach(b => {
      if (!validPageIds.has(b.pageId)) {
        b.pageId = _pages[0].id;
      }
    });
    
    _selectedId = null;
    _selectedSubPath = null;
    
    // Run full integrity check
    sanitize();
    
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

  // Initial load — synchronous to prevent race conditions with module initialization
  loadFromLocal();
  _history = [snapshot()];
  _historyStep = 0;

  return {
    on, emit,
    getBlocks, getAllBlocks, getBlock, getSelectedId, getSelectedSubPath, getDevice, getMeta, getActiveTheme,
    setSelected, setSelectedSubPath, setDevice, updateMeta, addBlock, removeBlock, duplicateBlock, moveBlock,
    updateBlockProps, updateBlockParent, updateSubStyle, appendSubElement, hideSubElement, removeSubElement, moveSubElement, moveSubElementToNewParent, moveSubElementBetweenBlocks, duplicateSubElement, promoteTemplateChildren, reorderSubElement, setTheme, getTheme, applyThemeToProject, importBlocks, clearProject, getBlockIndex, undo, redo, sanitize, _pathType,
    getPages, getCurrentPageId, addPage, removePage, switchPage, renamePage, duplicatePage,
    generateId, SCHEMA_VERSION,
    /**
     * Execute multiple state mutations as a single transaction.
     * Renders are deferred until the transaction completes.
     * Usage: State.transaction(() => { addBlock(...); setSelected(...); });
     */
    transaction(fn) {
      if (typeof RenderScheduler !== 'undefined') {
        RenderScheduler.transaction(fn);
      } else {
        fn();
      }
    }
  };
})();

