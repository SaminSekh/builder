// ============================================================
// state.js – Global application state
// ============================================================

const State = (() => {
  let _blocks = [];
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
    fonts: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
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
    const data = { blocks: _blocks.filter(b => !!b), meta: _meta, theme: _activeTheme };
    localStorage.setItem('sf_project_autosave', JSON.stringify(data));
  }

  function loadFromLocal() {
    const saved = localStorage.getItem('sf_project_autosave');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            // Sanitize: filter out any null/undefined entries that may have been persisted
            _blocks = (data.blocks || []).filter(b => !!b && b.id && b.type);
            _meta = data.meta || _meta;
            if (data.theme) _activeTheme = data.theme;
            if (_blocks.length > 0) {
                emit('blocksChanged');
            }
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
    _history.push(JSON.stringify({ blocks: _blocks, meta: _meta }));
    if (_history.length > 50) _history.shift(); // Limit to 50 steps
    _historyStep = _history.length - 1;
    saveToLocal();
  }

  function undo() {
    if (_historyStep > 0) {
        _historyStep--;
        const data = JSON.parse(_history[_historyStep]);
        _blocks = data.blocks;
        _meta = data.meta;
        emit('blocksChanged');
        emit('metaChanged');
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
        _meta = data.meta;
        emit('blocksChanged');
        emit('metaChanged');
        saveToLocal();
        return true;
    }
    return false;
  }

  function getBlocks(parentId = null) {
    return _blocks.filter(b => b && (b.parentId === parentId || (parentId === null && !b.parentId)));
  }
  function getAllBlocks() { return _blocks.filter(b => !!b); }
  function getBlock(id) { return _blocks.find(b => b && b.id === id); }
  function getSelectedId() { return _selectedId; }
  function getSelectedSubPath() { return _selectedSubPath; }
  function getDevice() { return _device; }
  function getMeta() { return { ..._meta }; }

  function addBlock(blockDef, insertAfterIndex = null, parentIdArg = null) {
    const parentId = blockDef.parentId || parentIdArg || null;
    const block = {
      ...blockDef,
      id: 'block_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      parentId: parentId
    };

    if (insertAfterIndex !== null && insertAfterIndex >= 0) {
      const siblings = _blocks.filter(b => b && b.parentId === parentId);
      if (insertAfterIndex < siblings.length) {
        const targetSibling = siblings[insertAfterIndex];
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
    return block.id;
  }

  function removeBlock(id) {
    _blocks = _blocks.filter(b => b.id !== id && b.parentId !== id);
    if (_selectedId === id) _selectedId = null;
    pushHistory();
    emit('blocksChanged');
    emit('selectionChanged', null);
  }

  function duplicateBlock(id) {
    const idx = _blocks.findIndex(b => b.id === id);
    if (idx === -1) return;
    const copy = JSON.parse(JSON.stringify(_blocks[idx]));
    copy.id = 'block_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    _blocks.splice(idx + 1, 0, copy);
    pushHistory();
    emit('blocksChanged');
  }

  function moveBlock(id, direction) {
    const idx = _blocks.findIndex(b => b.id === id);
    if (direction === 'up' && idx > 0) {
      [_blocks[idx - 1], _blocks[idx]] = [_blocks[idx], _blocks[idx - 1]];
      pushHistory();
      emit('blocksChanged');
    } else if (direction === 'down' && idx < _blocks.length - 1) {
      [_blocks[idx], _blocks[idx + 1]] = [_blocks[idx + 1], _blocks[idx]];
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

  function setMeta(meta) {
    Object.assign(_meta, meta);
    pushHistory();
    emit('metaChanged');
  }

  function importBlocks(blocks) {
    _blocks = (blocks || []).filter(b => !!b);
    _selectedId = null;
    pushHistory();
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
    getBlocks, getAllBlocks, getBlock, getSelectedId, getSelectedSubPath, getDevice, getMeta,
    addBlock, removeBlock, duplicateBlock, moveBlock,
    updateBlockParent, updateBlockProps, setSelected, setSelectedSubPath, setDevice, setMeta,
    setTheme, getTheme,
    importBlocks, getBlockIndex, undo, redo, clearProject
  };
})();
