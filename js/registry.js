// ============================================================
// registry.js – Block Registry, Dev Assertions & Testability
// Provides modular block registration, validation, and
// development-time integrity checks.
// Loaded AFTER state.js, BEFORE blocks.js
// ============================================================

const BlockRegistry = (() => {
    const _registry = new Map();
    const _categories = new Set();
    const _migrations = new Map(); // type → [{ fromVersion, migrate(props) }]

    /**
     * Register a block type.
     * This is the preferred way to define blocks going forward.
     * Existing BlockTypes object entries are auto-registered on init.
     *
     * @param {object} definition
     * @param {string} definition.type - Unique block type identifier
     * @param {string} definition.label - Display name
     * @param {string} definition.icon - CSS icon class
     * @param {string} definition.category - Category for palette grouping
     * @param {object} definition.defaultProps - Default properties
     * @param {function} definition.render - (props) => HTML string (MUST be pure)
     * @param {function} [definition.inspector] - Optional custom inspector renderer
     * @param {number} [definition.version] - Block schema version (default 1)
     * @param {array} [definition.migrations] - Array of { fromVersion, migrate(props) }
     */
    function register(definition) {
        if (!definition || !definition.type) {
            console.error('BlockRegistry: definition must have a type');
            return false;
        }

        const type = definition.type;

        // Validate required fields
        if (!definition.label) {
            console.warn(`BlockRegistry: "${type}" missing label`);
        }
        if (!definition.render || typeof definition.render !== 'function') {
            console.error(`BlockRegistry: "${type}" must have a render function`);
            return false;
        }
        if (!definition.defaultProps || typeof definition.defaultProps !== 'object') {
            console.warn(`BlockRegistry: "${type}" missing defaultProps, using empty object`);
            definition.defaultProps = {};
        }

        // Detect duplicate registration
        if (_registry.has(type)) {
            if (window.SOCOX_DEBUG) {
                console.warn(`BlockRegistry: overwriting existing type "${type}"`);
            }
        }

        // Store
        _registry.set(type, {
            type,
            label: definition.label || type,
            icon: definition.icon || 'fa-solid fa-cube',
            category: definition.category || 'Other',
            defaultProps: definition.defaultProps,
            render: definition.render,
            inspector: definition.inspector || null,
            version: definition.version || 1
        });

        _categories.add(definition.category || 'Other');

        // Register migrations
        if (Array.isArray(definition.migrations)) {
            _migrations.set(type, definition.migrations);
        }

        return true;
    }

    /**
     * Get a registered block definition.
     */
    function get(type) {
        return _registry.get(type) || null;
    }

    /**
     * Check if a block type is registered.
     */
    function has(type) {
        return _registry.has(type);
    }

    /**
     * Get all registered types.
     */
    function getAll() {
        return [..._registry.values()];
    }

    /**
     * Get all categories.
     */
    function getCategories() {
        return [..._categories];
    }

    /**
     * Get types by category.
     */
    function getByCategory(category) {
        return [..._registry.values()].filter(d => d.category === category);
    }

    /**
     * Migrate a block's props from an older version to current.
     * Called during import/load when block version doesn't match registry version.
     */
    function migrateBlockProps(type, props, fromVersion) {
        const migrations = _migrations.get(type);
        if (!migrations || !migrations.length) return props;

        let current = { ...props };
        let version = fromVersion || 1;

        const sorted = [...migrations].sort((a, b) => a.fromVersion - b.fromVersion);
        for (const m of sorted) {
            if (m.fromVersion >= version) {
                try {
                    current = m.migrate(current) || current;
                    version = m.fromVersion + 1;
                } catch (e) {
                    console.error(`BlockRegistry: migration failed for "${type}" v${m.fromVersion}:`, e);
                }
            }
        }

        return current;
    }

    /**
     * Auto-register all entries from the legacy BlockTypes object.
     * Called once after blocks.js loads.
     */
    function syncFromBlockTypes() {
        if (typeof BlockTypes === 'undefined') return;
        const skipKeys = ['applyLayout', 'applySubStyle'];
        Object.keys(BlockTypes).forEach(key => {
            if (skipKeys.includes(key)) return;
            const def = BlockTypes[key];
            if (!def || typeof def.render !== 'function') return;
            if (_registry.has(key)) return; // already registered
            register({
                type: key,
                label: def.label,
                icon: def.icon,
                category: def.category,
                defaultProps: def.defaultProps,
                render: def.render,
                version: 1
            });
        });
    }

    return {
        register,
        get,
        has,
        getAll,
        getCategories,
        getByCategory,
        migrateBlockProps,
        syncFromBlockTypes
    };
})();

// ============================================================
// DevAssertions – Development-time integrity checks
// Active only when window.SOCOX_DEBUG = true
// ============================================================

const DevAssertions = (() => {
    let _enabled = false;
    let _violations = [];
    const MAX_VIOLATIONS = 100;

    function enable() { _enabled = true; }
    function disable() { _enabled = false; }
    function isEnabled() { return _enabled; }

    /**
     * Assert a condition. If false, logs a violation.
     */
    function assert(condition, message, context) {
        if (!_enabled) return;
        if (condition) return;
        const violation = {
            message,
            context,
            ts: Date.now(),
            stack: new Error().stack
        };
        _violations.push(violation);
        if (_violations.length > MAX_VIOLATIONS) _violations.shift();
        console.warn(`[ASSERT] ${message}`, context || '');
    }

    /**
     * Run full state integrity check.
     * Call this periodically or after suspicious operations.
     */
    function checkStateIntegrity() {
        if (!_enabled) return { ok: true, issues: [] };
        if (typeof State === 'undefined') return { ok: true, issues: [] };

        const issues = [];
        const blocks = State.getAllBlocks('all');
        const blockIds = new Set(blocks.map(b => b.id));
        const pageIds = new Set(State.getPages().map(p => p.id));

        // Check for duplicate IDs
        const seenIds = new Set();
        blocks.forEach(b => {
            if (seenIds.has(b.id)) {
                issues.push({ type: 'duplicate_id', blockId: b.id });
            }
            seenIds.add(b.id);
        });

        // Check for invalid parent references
        blocks.forEach(b => {
            if (b.parentId && !blockIds.has(b.parentId)) {
                issues.push({ type: 'orphan_parent', blockId: b.id, parentId: b.parentId });
            }
        });

        // Check for invalid page references
        blocks.forEach(b => {
            if (!pageIds.has(b.pageId)) {
                issues.push({ type: 'invalid_page', blockId: b.id, pageId: b.pageId });
            }
        });

        // Check for circular parent chains
        blocks.forEach(b => {
            if (!b.parentId) return;
            const visited = new Set([b.id]);
            let current = b.parentId;
            let depth = 0;
            while (current && depth < 100) {
                if (visited.has(current)) {
                    issues.push({ type: 'circular_parent', blockId: b.id });
                    break;
                }
                visited.add(current);
                const parent = blocks.find(x => x.id === current);
                current = parent ? parent.parentId : null;
                depth++;
            }
        });

        // Check for missing props
        blocks.forEach(b => {
            if (!b.props || typeof b.props !== 'object') {
                issues.push({ type: 'missing_props', blockId: b.id });
            }
        });

        // Check selected block exists
        const selectedId = State.getSelectedId();
        if (selectedId && !blockIds.has(selectedId)) {
            issues.push({ type: 'stale_selection', selectedId });
        }

        const ok = issues.length === 0;
        if (!ok && window.SOCOX_DEBUG) {
            console.warn(`[Integrity] ${issues.length} issue(s) found:`, issues);
        }

        return { ok, issues };
    }

    /**
     * Check for stale DOM references (blocks in DOM not in state, or vice versa).
     */
    function checkDomSync() {
        if (!_enabled) return { ok: true, issues: [] };
        const issues = [];
        const canvas = document.getElementById('canvas');
        if (!canvas) return { ok: true, issues: [] };

        const domIds = new Set();
        canvas.querySelectorAll('.canvas-block').forEach(el => {
            domIds.add(el.dataset.id);
        });

        const stateIds = new Set(State.getBlocks(null).map(b => b.id));

        // DOM has blocks not in state
        domIds.forEach(id => {
            if (!stateIds.has(id)) {
                issues.push({ type: 'dom_orphan', id });
            }
        });

        // State has blocks not in DOM (root level only)
        stateIds.forEach(id => {
            if (!domIds.has(id)) {
                issues.push({ type: 'missing_dom', id });
            }
        });

        return { ok: issues.length === 0, issues };
    }

    /**
     * Detect if a render function mutated its props argument.
     * Wraps a render call with a frozen copy check.
     */
    function assertPureRender(type, props) {
        if (!_enabled) return;
        const before = JSON.stringify(props);
        const def = typeof BlockTypes !== 'undefined' ? BlockTypes[type] : null;
        if (!def || !def.render) return;
        def.render(props);
        const after = JSON.stringify(props);
        if (before !== after) {
            console.error(`[ASSERT] Render function for "${type}" MUTATED props!`);
            _violations.push({
                message: `Impure render: ${type}`,
                ts: Date.now()
            });
        }
    }

    /**
     * Get all recorded violations.
     */
    function getViolations() {
        return [..._violations];
    }

    /**
     * Clear violations.
     */
    function clearViolations() {
        _violations = [];
    }

    return {
        enable,
        disable,
        isEnabled,
        assert,
        checkStateIntegrity,
        checkDomSync,
        assertPureRender,
        getViolations,
        clearViolations
    };
})();

// ============================================================
// Freeze utilities for immutable state discipline
// ============================================================

/**
 * Shallow freeze an object for render consumption.
 * In debug mode, actually freezes. In production, returns as-is for performance.
 * Use this when passing props to render functions.
 */
function freezeForRender(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (window.SOCOX_DEBUG) {
        return Object.freeze({ ...obj });
    }
    return obj;
}

// Expose globally
if (typeof window !== 'undefined') {
    window.BlockRegistry = BlockRegistry;
    window.DevAssertions = DevAssertions;
}
