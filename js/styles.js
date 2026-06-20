// ============================================================
// styles.js – True Style System
// Generates reusable CSS classes from inline styles during export.
// Deduplicates identical style declarations into shared classes.
// Dramatically reduces exported HTML size.
// ============================================================

const StyleSystem = (() => {
    // Maps a style string hash → generated class name
    let _classMap = new Map();
    let _classCounter = 0;
    let _generatedCSS = [];

    // Properties that should be extracted into classes (visual, not structural)
    const EXTRACTABLE_PROPS = new Set([
        'color', 'background-color', 'background', 'font-size', 'font-weight',
        'font-family', 'line-height', 'letter-spacing', 'text-align', 'text-transform',
        'opacity', 'border-radius', 'border', 'border-width', 'border-style',
        'border-color', 'box-shadow', 'padding', 'margin', 'gap',
        'max-width', 'min-width', 'min-height', 'max-height'
    ]);

    // Properties that must remain inline (layout-critical, position-dependent)
    const INLINE_ONLY_PROPS = new Set([
        'width', 'height', 'display', 'flex-direction', 'justify-content',
        'align-items', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis',
        'position', 'top', 'bottom', 'left', 'right', 'z-index',
        'grid-template-columns', 'grid-template-rows', 'column-gap', 'row-gap',
        'place-content', 'justify-items', 'align-self', 'overflow',
        'transform', 'animation', 'animation-delay', 'transition',
        'will-change', 'pointer-events', 'cursor'
    ]);

    /**
     * Reset the style system for a new export run.
     */
    function reset() {
        _classMap = new Map();
        _classCounter = 0;
        _generatedCSS = [];
    }

    /**
     * Generate a short, deterministic class name.
     */
    function _generateClassName() {
        _classCounter++;
        return 'sf-s' + _classCounter.toString(36);
    }

    /**
     * Hash a style string for deduplication.
     */
    function _hashStyle(styleStr) {
        // Simple string hash — fast and sufficient for dedup
        let hash = 0;
        for (let i = 0; i < styleStr.length; i++) {
            const char = styleStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return hash.toString(36);
    }

    /**
     * Parse an inline style string into an object.
     */
    function parseStyle(styleStr) {
        if (!styleStr) return {};
        const result = {};
        styleStr.split(';').forEach(rule => {
            const trimmed = rule.trim();
            if (!trimmed) return;
            const colonIdx = trimmed.indexOf(':');
            if (colonIdx === -1) return;
            const prop = trimmed.substring(0, colonIdx).trim().toLowerCase();
            const value = trimmed.substring(colonIdx + 1).trim().replace(/\s*!important\s*$/, '');
            if (prop && value) result[prop] = value;
        });
        return result;
    }

    /**
     * Split a style object into extractable (class-worthy) and inline-only parts.
     */
    function splitStyles(styleObj) {
        const extractable = {};
        const inlineOnly = {};

        Object.entries(styleObj).forEach(([prop, value]) => {
            if (INLINE_ONLY_PROPS.has(prop)) {
                inlineOnly[prop] = value;
            } else if (EXTRACTABLE_PROPS.has(prop)) {
                extractable[prop] = value;
            } else {
                // Unknown props stay inline for safety
                inlineOnly[prop] = value;
            }
        });

        return { extractable, inlineOnly };
    }

    /**
     * Convert a style object back to a CSS string.
     */
    function styleObjToString(obj) {
        return Object.entries(obj).map(([prop, val]) => `${prop}:${val}`).join(';');
    }

    /**
     * Get or create a CSS class for a set of extractable styles.
     * Returns the class name if styles were extracted, or null if nothing to extract.
     */
    function getOrCreateClass(extractableStyles) {
        if (!extractableStyles || Object.keys(extractableStyles).length === 0) return null;

        const cssStr = styleObjToString(extractableStyles);
        const hash = _hashStyle(cssStr);

        if (_classMap.has(hash)) {
            return _classMap.get(hash);
        }

        const className = _generateClassName();
        _classMap.set(hash, className);
        _generatedCSS.push(`.${className}{${cssStr}}`);
        return className;
    }

    /**
     * Process an HTML element's inline style:
     * - Extract class-worthy properties into a shared CSS class
     * - Leave layout-critical properties inline
     * - Return { className, remainingInlineStyle }
     */
    function processElementStyle(inlineStyleStr) {
        if (!inlineStyleStr) return { className: null, remainingStyle: '' };

        const parsed = parseStyle(inlineStyleStr);
        const { extractable, inlineOnly } = splitStyles(parsed);

        const className = getOrCreateClass(extractable);
        const remainingStyle = styleObjToString(inlineOnly);

        return { className, remainingStyle };
    }

    /**
     * Process an entire HTML string, extracting inline styles into classes.
     * Returns { html, css } where html has classes added and styles reduced.
     */
    function processHTML(htmlStr) {
        if (!htmlStr) return { html: '', css: '' };

        // Use regex to find style attributes and process them
        const processed = htmlStr.replace(/style="([^"]*)"/gi, (match, styleValue) => {
            const { className, remainingStyle } = processElementStyle(styleValue);

            if (!className && !remainingStyle) return '';
            if (!className) return `style="${remainingStyle}"`;
            if (!remainingStyle) return `class="${className}"`;

            // Both class and remaining inline style
            return `class="${className}" style="${remainingStyle}"`;
        });

        // Merge class attributes where an element already has a class
        const merged = processed.replace(/class="([^"]*)" class="([^"]*)"/gi, (match, c1, c2) => {
            return `class="${c1} ${c2}"`;
        });

        return { html: merged, css: getGeneratedCSS() };
    }

    /**
     * Get all generated CSS rules as a single string.
     */
    function getGeneratedCSS() {
        if (_generatedCSS.length === 0) return '';
        return '/* Generated utility classes */\n' + _generatedCSS.join('\n');
    }

    /**
     * Get stats about the style extraction.
     */
    function getStats() {
        return {
            totalClasses: _classMap.size,
            totalRules: _generatedCSS.length,
            estimatedSavings: _estimateSavings()
        };
    }

    function _estimateSavings() {
        // Each reuse of a class saves ~the length of the style string
        // minus the class name reference (~10 chars)
        let totalOriginalSize = 0;
        let totalOptimizedSize = 0;

        _generatedCSS.forEach(rule => {
            totalOptimizedSize += rule.length; // CSS rule defined once
        });

        // Rough estimate: each class is used ~3 times on average
        const avgReuse = 3;
        const avgRuleLength = totalOptimizedSize / Math.max(1, _generatedCSS.length);
        totalOriginalSize = _generatedCSS.length * avgRuleLength * avgReuse;
        totalOptimizedSize += _classMap.size * 15 * avgReuse; // class="sf-sXX" references

        return {
            originalEstimate: totalOriginalSize,
            optimizedEstimate: totalOptimizedSize,
            reductionPercent: totalOriginalSize > 0
                ? Math.round((1 - totalOptimizedSize / totalOriginalSize) * 100)
                : 0
        };
    }

    return {
        reset,
        parseStyle,
        splitStyles,
        processElementStyle,
        processHTML,
        getOrCreateClass,
        getGeneratedCSS,
        getStats,
        styleObjToString
    };
})();

// Expose globally
if (typeof window !== 'undefined') {
    window.StyleSystem = StyleSystem;
}
