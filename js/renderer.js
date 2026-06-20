// ============================================================
// renderer.js – Render Scheduler, Dirty Tracking & Performance
// Provides centralized render coordination for the canvas.
// Loaded AFTER state.js, BEFORE canvas.js
// ============================================================

const RenderScheduler = (() => {
    // --- Dirty Tracking ---
    // Tracks which blocks need re-rendering
    const _dirtyBlocks = new Set();   // block IDs that need individual re-render
    let _fullRenderNeeded = false;     // if true, full canvas rebuild required
    let _selectionDirty = false;       // if true, selection outline needs update
    let _pendingSelectionId = null;

    // --- RAF Scheduling ---
    let _rafId = null;
    let _isRendering = false;

    // --- Transaction Batching ---
    let _transactionDepth = 0;
    let _transactionHadRender = false;

    // --- Performance Instrumentation ---
    let _renderCount = 0;
    let _fullRenderCount = 0;
    let _partialRenderCount = 0;
    let _lastRenderDuration = 0;
    let _totalRenderTime = 0;
    let _frameDrops = 0;

    /**
     * Schedule a full canvas re-render.
     * Coalesces multiple calls within the same frame.
     */
    function scheduleFullRender(reason) {
        _fullRenderNeeded = true;
        _dirtyBlocks.clear(); // full render supersedes partial
        _scheduleFlush(reason);
    }

    /**
     * Schedule a single block re-render.
     * If a full render is already pending, this is a no-op.
     */
    function scheduleBlockRender(blockId, reason) {
        if (_fullRenderNeeded) return; // will be covered by full render
        if (!blockId) return;
        _dirtyBlocks.add(blockId);
        _scheduleFlush(reason);
    }

    /**
     * Schedule a selection update (lightweight, no DOM rebuild).
     */
    function scheduleSelectionUpdate(selectedId) {
        _selectionDirty = true;
        _pendingSelectionId = selectedId;
        _scheduleFlush('selection');
    }

    /**
     * Internal: schedule the RAF flush if not already scheduled.
     */
    function _scheduleFlush(reason) {
        // If inside a transaction, defer until commit
        if (_transactionDepth > 0) {
            _transactionHadRender = true;
            return;
        }
        if (_rafId !== null) return; // already scheduled
        _rafId = requestAnimationFrame(_flush);
    }

    /**
     * Internal: execute all pending render work.
     */
    function _flush() {
        _rafId = null;
        if (_isRendering) return; // prevent re-entrant rendering
        _isRendering = true;

        const start = performance.now();

        try {
            if (_fullRenderNeeded) {
                _fullRenderNeeded = false;
                _dirtyBlocks.clear();
                _doFullRender();
                _fullRenderCount++;
            } else if (_dirtyBlocks.size > 0) {
                const blocks = new Set(_dirtyBlocks);
                _dirtyBlocks.clear();
                _doPartialRender(blocks);
                _partialRenderCount++;
            }

            if (_selectionDirty) {
                _selectionDirty = false;
                _doSelectionUpdate(_pendingSelectionId);
            }
        } catch (e) {
            console.error('RenderScheduler: flush error', e);
        }

        _isRendering = false;
        _renderCount++;

        const duration = performance.now() - start;
        _lastRenderDuration = duration;
        _totalRenderTime += duration;
        if (duration > 16.67) _frameDrops++;

        if (window.SOCOX_DEBUG) {
            console.log(`[Render #${_renderCount}] ${duration.toFixed(1)}ms | full:${_fullRenderCount} partial:${_partialRenderCount} drops:${_frameDrops}`);
        }
    }

    // --- Render Callbacks (set by Canvas module) ---
    let _onFullRender = null;
    let _onBlockRender = null;
    let _onSelectionUpdate = null;

    function _doFullRender() {
        if (_onFullRender) _onFullRender();
    }

    function _doPartialRender(blockIds) {
        if (_onBlockRender) {
            blockIds.forEach(id => _onBlockRender(id));
        }
    }

    function _doSelectionUpdate(id) {
        if (_onSelectionUpdate) _onSelectionUpdate(id);
    }

    /**
     * Register render callbacks. Called by Canvas.init().
     */
    function setCallbacks(fullRender, blockRender, selectionUpdate) {
        _onFullRender = fullRender;
        _onBlockRender = blockRender;
        _onSelectionUpdate = selectionUpdate;
    }

    // --- Transaction API ---
    /**
     * Begin a transaction. Renders are deferred until the outermost transaction commits.
     * Usage: RenderScheduler.transaction(() => { State.addBlock(...); State.setSelected(...); });
     */
    function transaction(fn) {
        _transactionDepth++;
        try {
            fn();
        } finally {
            _transactionDepth--;
            if (_transactionDepth === 0 && _transactionHadRender) {
                _transactionHadRender = false;
                // Schedule the deferred render
                if (_rafId === null) {
                    _rafId = requestAnimationFrame(_flush);
                }
            }
        }
    }

    /**
     * Force an immediate synchronous flush (use sparingly).
     * Needed for operations that must see DOM state immediately after (e.g., measuring).
     */
    function flushSync() {
        if (_rafId !== null) {
            cancelAnimationFrame(_rafId);
            _rafId = null;
        }
        _flush();
    }

    /**
     * Check if a render is currently in progress (to avoid re-entrant calls).
     */
    function isRendering() {
        return _isRendering;
    }

    // --- Performance Stats ---
    function getStats() {
        return {
            renderCount: _renderCount,
            fullRenders: _fullRenderCount,
            partialRenders: _partialRenderCount,
            lastDuration: _lastRenderDuration,
            avgDuration: _renderCount > 0 ? (_totalRenderTime / _renderCount) : 0,
            frameDrops: _frameDrops,
            pendingDirty: _dirtyBlocks.size,
            fullPending: _fullRenderNeeded
        };
    }

    function resetStats() {
        _renderCount = 0;
        _fullRenderCount = 0;
        _partialRenderCount = 0;
        _lastRenderDuration = 0;
        _totalRenderTime = 0;
        _frameDrops = 0;
    }

    return {
        scheduleFullRender,
        scheduleBlockRender,
        scheduleSelectionUpdate,
        setCallbacks,
        transaction,
        flushSync,
        isRendering,
        getStats,
        resetStats
    };
})();

// Expose for debug console access
if (typeof window !== 'undefined') {
    window.RenderScheduler = RenderScheduler;
}
