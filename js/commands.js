// ============================================================
// commands.js – Command System & Architecture Boundaries
// Provides deterministic, serializable state mutations.
// Loaded AFTER state.js and renderer.js, BEFORE other modules.
// ============================================================

const Commands = (() => {
    // --- Command Registry ---
    const _commands = new Map();

    // --- Execution Log (dev mode) ---
    let _log = [];
    const MAX_LOG = 200;

    /**
     * Register a command type.
     * @param {string} type - Unique command identifier (e.g. 'block.add')
     * @param {object} definition - { execute(params), validate?(params) }
     */
    function register(type, definition) {
        if (_commands.has(type)) {
            console.warn(`Commands: overwriting existing command "${type}"`);
        }
        if (!definition || typeof definition.execute !== 'function') {
            throw new Error(`Commands: "${type}" must have an execute function`);
        }
        _commands.set(type, definition);
    }

    /**
     * Execute a command by type.
     * Commands flow through: validate → execute → (state change) → render
     * @param {string} type - Command type
     * @param {object} params - Command parameters
     * @returns {*} Result from execute function
     */
    function execute(type, params = {}) {
        const cmd = _commands.get(type);
        if (!cmd) {
            console.error(`Commands: unknown command "${type}"`);
            return null;
        }

        // Optional validation
        if (cmd.validate) {
            const error = cmd.validate(params);
            if (error) {
                if (window.SOCOX_DEBUG) {
                    console.warn(`Commands: validation failed for "${type}":`, error);
                }
                return null;
            }
        }

        // Execute within a render transaction for batching
        let result = null;
        const start = performance.now();

        if (typeof RenderScheduler !== 'undefined') {
            RenderScheduler.transaction(() => {
                result = cmd.execute(params);
            });
        } else {
            result = cmd.execute(params);
        }

        const duration = performance.now() - start;

        // Log for debugging
        if (window.SOCOX_DEBUG) {
            const entry = { type, params, result, duration, ts: Date.now() };
            _log.push(entry);
            if (_log.length > MAX_LOG) _log.shift();
            console.log(`[Cmd] ${type}`, params, `(${duration.toFixed(1)}ms)`);
        }

        return result;
    }

    /**
     * Check if a command type is registered.
     */
    function has(type) {
        return _commands.has(type);
    }

    /**
     * Get the execution log (dev mode).
     */
    function getLog() {
        return [..._log];
    }

    /**
     * Clear the execution log.
     */
    function clearLog() {
        _log = [];
    }

    /**
     * List all registered command types.
     */
    function listCommands() {
        return [..._commands.keys()];
    }

    // =========================================================
    // BUILT-IN COMMANDS
    // These wrap existing State methods into the command pattern.
    // Existing direct State calls continue to work — commands
    // are an ADDITIONAL layer, not a replacement (yet).
    // =========================================================

    register('block.add', {
        validate(p) {
            if (!p.type) return 'Missing block type';
            if (typeof BlockTypes !== 'undefined' && !BlockTypes[p.type]) return `Unknown block type: ${p.type}`;
            return null;
        },
        execute(p) {
            return State.addBlock({
                type: p.type,
                props: p.props || {},
                parentId: p.parentId || null
            }, p.index ?? null);
        }
    });

    register('block.remove', {
        validate(p) {
            if (!p.id) return 'Missing block id';
            return null;
        },
        execute(p) {
            State.removeBlock(p.id);
        }
    });

    register('block.duplicate', {
        validate(p) {
            if (!p.id) return 'Missing block id';
            if (!State.getBlock(p.id)) return 'Block not found';
            return null;
        },
        execute(p) {
            State.duplicateBlock(p.id);
        }
    });

    register('block.move', {
        validate(p) {
            if (!p.id) return 'Missing block id';
            if (!['up', 'down'].includes(p.direction)) return 'Invalid direction';
            return null;
        },
        execute(p) {
            State.moveBlock(p.id, p.direction);
        }
    });

    register('block.updateProps', {
        validate(p) {
            if (!p.id) return 'Missing block id';
            if (!p.props || typeof p.props !== 'object') return 'Missing props object';
            return null;
        },
        execute(p) {
            State.updateBlockProps(p.id, p.props, p.options);
        }
    });

    register('block.reparent', {
        validate(p) {
            if (!p.id) return 'Missing block id';
            return null;
        },
        execute(p) {
            State.updateBlockParent(p.id, p.parentId || null, p.index ?? null);
        }
    });

    register('page.add', {
        validate(p) {
            if (!p.name) return 'Missing page name';
            return null;
        },
        execute(p) {
            return State.addPage(p.name, p.options || {});
        }
    });

    register('page.remove', {
        validate(p) {
            if (!p.id) return 'Missing page id';
            return null;
        },
        execute(p) {
            State.removePage(p.id);
        }
    });

    register('page.switch', {
        validate(p) {
            if (!p.id) return 'Missing page id';
            return null;
        },
        execute(p) {
            State.switchPage(p.id);
        }
    });

    register('page.rename', {
        validate(p) {
            if (!p.id || !p.name) return 'Missing id or name';
            return null;
        },
        execute(p) {
            State.renamePage(p.id, p.name);
        }
    });

    register('theme.apply', {
        execute(p) {
            if (typeof Themes !== 'undefined' && Themes.apply) {
                Themes.apply(p.themeId);
            }
        }
    });

    register('theme.clear', {
        execute() {
            if (typeof Themes !== 'undefined' && Themes.clear) {
                Themes.clear();
            }
        }
    });

    register('project.clear', {
        execute() {
            State.clearProject();
        }
    });

    register('project.import', {
        validate(p) {
            if (!p.data) return 'Missing import data';
            return null;
        },
        execute(p) {
            const d = p.data;
            State.importBlocks(d.blocks, d.meta, d.pages, d.theme);
        }
    });

    register('meta.update', {
        validate(p) {
            if (!p.meta || typeof p.meta !== 'object') return 'Missing meta object';
            return null;
        },
        execute(p) {
            State.updateMeta(p.meta);
        }
    });

    register('selection.set', {
        execute(p) {
            State.setSelected(p.id || null);
        }
    });

    register('selection.setSubPath', {
        execute(p) {
            State.setSelectedSubPath(p.path || null);
        }
    });

    register('history.undo', {
        execute() {
            return State.undo();
        }
    });

    register('history.redo', {
        execute() {
            return State.redo();
        }
    });

    return {
        register,
        execute,
        has,
        getLog,
        clearLog,
        listCommands
    };
})();

// Expose globally
if (typeof window !== 'undefined') {
    window.Commands = Commands;
}
