// ============================================================
// sitetext.js – Global Site Text / Typography Manager
// Edit all text styles by element type (H1, H2, P, links, etc.)
// Changes apply across ALL blocks in the project.
// ============================================================

const SiteText = (() => {
    const STORAGE_KEY = 'sf_site_text_styles';

    // Default typography groups
    const GROUPS = [
        { id: 'h1', label: 'Heading 1 (H1)', selector: 'h1', defaults: { fontSize: '3.5rem', fontWeight: '800', fontFamily: 'Inter, sans-serif', lineHeight: '1.1', letterSpacing: '-0.02em', color: '', opacity: '1', textShadow: 'none' } },
        { id: 'h2', label: 'Heading 2 (H2)', selector: 'h2', defaults: { fontSize: '2.5rem', fontWeight: '700', fontFamily: 'Inter, sans-serif', lineHeight: '1.2', letterSpacing: '-0.01em', color: '', opacity: '1', textShadow: 'none' } },
        { id: 'h3', label: 'Heading 3 (H3)', selector: 'h3', defaults: { fontSize: '1.8rem', fontWeight: '700', fontFamily: 'Inter, sans-serif', lineHeight: '1.3', letterSpacing: '0', color: '', opacity: '1', textShadow: 'none' } },
        { id: 'h4', label: 'Heading 4 (H4)', selector: 'h4', defaults: { fontSize: '1.4rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', lineHeight: '1.4', letterSpacing: '0', color: '', opacity: '1', textShadow: 'none' } },
        { id: 'h5', label: 'Heading 5 (H5)', selector: 'h5', defaults: { fontSize: '1.1rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', lineHeight: '1.4', letterSpacing: '0.02em', color: '', opacity: '1', textShadow: 'none' } },
        { id: 'h6', label: 'Heading 6 (H6)', selector: 'h6', defaults: { fontSize: '0.9rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', lineHeight: '1.5', letterSpacing: '0.05em', color: '', opacity: '1', textShadow: 'none' } },
        { id: 'p', label: 'Paragraph (P)', selector: 'p', defaults: { fontSize: '1rem', fontWeight: '400', fontFamily: 'Inter, sans-serif', lineHeight: '1.7', letterSpacing: '0', color: '', opacity: '1', textShadow: 'none' } },
        { id: 'a', label: 'Links (A)', selector: 'a', defaults: { fontSize: '', fontWeight: '500', fontFamily: '', lineHeight: '', letterSpacing: '', color: '', opacity: '1', textDecoration: 'none', textShadow: 'none' } },
        { id: 'span', label: 'Span / Inline', selector: 'span', defaults: { fontSize: '', fontWeight: '', fontFamily: '', lineHeight: '', letterSpacing: '', color: '', opacity: '1', textShadow: 'none' } },
        { id: 'button', label: 'Buttons', selector: 'button, .nav-btn, .hero-btn', defaults: { fontSize: '0.9rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', lineHeight: '1', letterSpacing: '0', color: '', opacity: '1', borderRadius: '8px', textShadow: 'none' } },
        { id: 'label', label: 'Labels / Badges', selector: 'label, .badge', defaults: { fontSize: '0.78rem', fontWeight: '700', fontFamily: 'Inter, sans-serif', lineHeight: '1.2', letterSpacing: '0.1em', color: '', opacity: '1', textTransform: 'uppercase', textShadow: 'none' } }
    ];

    let _styles = {};

    function load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) _styles = JSON.parse(saved);
        } catch (e) { _styles = {}; }
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_styles));
    }

    function getGroupStyle(groupId) {
        const group = GROUPS.find(g => g.id === groupId);
        return { ...(group?.defaults || {}), ...(_styles[groupId] || {}) };
    }

    function setGroupStyle(groupId, key, value) {
        if (!_styles[groupId]) _styles[groupId] = {};
        _styles[groupId][key] = value;
        save();
        applyToCanvas();
    }

    function resetGroup(groupId) {
        delete _styles[groupId];
        save();
        applyToCanvas();
    }

    function resetAll() {
        _styles = {};
        save();
        applyToCanvas();
    }

    /**
     * Apply site text styles to the canvas.
     * Uses BOTH a <style> tag AND direct DOM manipulation for color
     * (because inline styles can't be overridden by stylesheet alone).
     */
    function applyToCanvas() {
        let styleEl = document.getElementById('sf-site-text-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'sf-site-text-styles';
            document.head.appendChild(styleEl);
        }

        let css = '/* Site Text Global Styles */\n';
        GROUPS.forEach(group => {
            const style = getGroupStyle(group.id);
            const rules = [];
            if (style.fontSize) rules.push(`font-size:${style.fontSize}`);
            if (style.fontWeight) rules.push(`font-weight:${style.fontWeight}`);
            if (style.fontFamily) rules.push(`font-family:${style.fontFamily}`);
            if (style.lineHeight) rules.push(`line-height:${style.lineHeight}`);
            if (style.letterSpacing) rules.push(`letter-spacing:${style.letterSpacing}`);
            if (style.color) rules.push(`color:${style.color}`);
            if (style.opacity && style.opacity !== '1') rules.push(`opacity:${style.opacity}`);
            if (style.textShadow && style.textShadow !== 'none') rules.push(`text-shadow:${style.textShadow}`);
            if (style.textDecoration) rules.push(`text-decoration:${style.textDecoration}`);
            if (style.textTransform) rules.push(`text-transform:${style.textTransform}`);
            if (style.borderRadius) rules.push(`border-radius:${style.borderRadius}`);

            if (rules.length > 0) {
                const importantRules = rules.map(r => r + ' !important').join(';');
                css += `#canvas .block-content ${group.selector},\n`;
                css += `#canvas .block-content ${group.selector}[style],\n`;
                css += `#canvas .block-content [data-sf-path] ${group.selector} { ${importantRules}; }\n`;
            }
        });

        styleEl.textContent = css;
        
        // Direct DOM application for color (overrides inline styles)
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        
        // Apply per-group colors
        GROUPS.forEach(group => {
            const style = _styles[group.id];
            if (!style || !style.color) return;
            canvas.querySelectorAll(`.block-content ${group.selector}`).forEach(el => {
                el.style.setProperty('color', style.color, 'important');
            });
        });
        
        // If ALL groups have the same color set, apply to everything
        const allColors = GROUPS.map(g => _styles[g.id]?.color).filter(c => c);
        if (allColors.length > 0) {
            // Find the most common color (if user set same color for multiple groups)
            const colorCounts = {};
            allColors.forEach(c => { colorCounts[c] = (colorCounts[c] || 0) + 1; });
            const dominantColor = Object.entries(colorCounts).sort((a,b) => b[1] - a[1])[0];
            
            // If majority of groups share same color, apply to ALL text descendants
            if (dominantColor && dominantColor[1] >= Math.floor(GROUPS.length * 0.6)) {
                canvas.querySelectorAll('.block-content *').forEach(el => {
                    const tag = el.tagName;
                    if (['SCRIPT','STYLE','IMG','VIDEO','IFRAME','SVG','INPUT','TEXTAREA','SELECT','BR','HR'].includes(tag)) return;
                    if (el.children.length === 0 || el.textContent.trim()) {
                        el.style.setProperty('color', dominantColor[0], 'important');
                    }
                });
            }
        }
    }

    /**
     * Generate a complete export tag (style + script) for exported sites.
     * The script applies colors at runtime to override inline styles.
     */
    function generateExportTag() {
        const css = generateExportCSS();
        if (!css || css.trim() === '/* Site Text Typography */') return '';
        
        // Build runtime color application script — ONLY for groups that have color explicitly set
        const colorRules = [];
        GROUPS.forEach(group => {
            const style = _styles[group.id];
            if (style && style.color) {
                colorRules.push({ selector: group.selector, color: style.color });
            }
        });
        
        let script = '';
        if (colorRules.length > 0) {
            const rulesJson = JSON.stringify(colorRules);
            script = `<script>
document.addEventListener('DOMContentLoaded', function() {
    var rules = ${rulesJson};
    rules.forEach(function(r) {
        document.querySelectorAll(r.selector).forEach(function(el) {
            el.style.setProperty('color', r.color, 'important');
        });
    });
});
</script>`;
        }
        
        return `<style>${css}</style>\n${script}`;
    }

    /**
     * Generate CSS for export (without #canvas prefix).
     * ONLY outputs rules for groups that have EXPLICIT user changes.
     * Never outputs inherited/default values.
     */
    function generateExportCSS() {
        let css = '/* Site Text Typography */\n';
        GROUPS.forEach(group => {
            const userStyle = _styles[group.id]; // Only user-set values, NOT defaults
            if (!userStyle || Object.keys(userStyle).length === 0) return;
            
            const rules = [];
            if (userStyle.fontSize) rules.push(`font-size:${userStyle.fontSize}`);
            if (userStyle.fontWeight) rules.push(`font-weight:${userStyle.fontWeight}`);
            if (userStyle.fontFamily) rules.push(`font-family:${userStyle.fontFamily}`);
            if (userStyle.lineHeight) rules.push(`line-height:${userStyle.lineHeight}`);
            if (userStyle.letterSpacing) rules.push(`letter-spacing:${userStyle.letterSpacing}`);
            if (userStyle.color) rules.push(`color:${userStyle.color}`);
            if (userStyle.opacity && userStyle.opacity !== '1') rules.push(`opacity:${userStyle.opacity}`);
            if (userStyle.textShadow && userStyle.textShadow !== 'none') rules.push(`text-shadow:${userStyle.textShadow}`);
            if (userStyle.textDecoration) rules.push(`text-decoration:${userStyle.textDecoration}`);
            if (userStyle.textTransform) rules.push(`text-transform:${userStyle.textTransform}`);

            if (rules.length > 0) {
                css += `${group.selector} { ${rules.join(';')}; }\n`;
            }
        });
        return css;
    }

    /**
     * Open the Site Text panel in the properties sidebar.
     */
    function openPanel() {
        const panel = document.getElementById('propPanelContent');
        if (!panel) return;

        panel.innerHTML = '';

        // Header
        const header = document.createElement('div');
        header.className = 'prop-header';
        header.innerHTML = `
            <div class="prop-title"><i class="fa-solid fa-font"></i> <span>Site Text</span></div>
            <button class="btn-icon" id="siteTextClose"><i class="fa-solid fa-xmark"></i></button>
        `;
        panel.appendChild(header);
        header.querySelector('#siteTextClose').onclick = () => {
            const id = State.getSelectedId();
            if (id && typeof Properties !== 'undefined' && Properties.refresh) Properties.refresh();
            else panel.innerHTML = '<div class="prop-empty"><i class="fa-solid fa-arrow-pointer"></i><p>Click any element on the canvas to edit its properties.</p></div>';
        };

        // Body
        const body = document.createElement('div');
        body.className = 'prop-body';
        body.style.padding = '12px';

        const intro = document.createElement('p');
        intro.style.cssText = 'font-size:0.78rem;color:var(--text3);margin-bottom:16px;line-height:1.5;';
        intro.textContent = 'Edit typography styles globally. Changes apply to ALL matching elements across your site.';
        body.appendChild(intro);

        // Reset all button
        const resetAllBtn = document.createElement('button');
        resetAllBtn.className = 'tb-btn secondary';
        resetAllBtn.style.cssText = 'width:100%;margin-bottom:16px;font-size:0.75rem;';
        resetAllBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Reset All to Defaults';
        resetAllBtn.onclick = () => { resetAll(); openPanel(); };
        body.appendChild(resetAllBtn);

        // Groups
        GROUPS.forEach(group => {
            const section = document.createElement('div');
            section.style.cssText = 'margin-bottom:16px;border:1px solid var(--border);border-radius:10px;overflow:hidden;';

            const sectionHeader = document.createElement('div');
            sectionHeader.style.cssText = 'padding:10px 14px;background:var(--surface2);cursor:pointer;display:flex;align-items:center;justify-content:space-between;font-size:0.82rem;font-weight:600;';
            sectionHeader.innerHTML = `<span>${group.label}</span><i class="fa-solid fa-chevron-down" style="font-size:0.6rem;opacity:0.5;"></i>`;

            const sectionBody = document.createElement('div');
            sectionBody.style.cssText = 'padding:10px 14px;display:none;';

            sectionHeader.onclick = () => {
                const isOpen = sectionBody.style.display !== 'none';
                sectionBody.style.display = isOpen ? 'none' : 'block';
                sectionHeader.querySelector('i').className = isOpen ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
            };

            const style = getGroupStyle(group.id);

            const fields = [
                { key: 'fontSize', label: 'Size', type: 'text', placeholder: '1rem, 16px, clamp(1rem,2vw,2rem)', suggestions: ['0.75rem','0.875rem','1rem','1.125rem','1.25rem','1.5rem','1.75rem','2rem','2.5rem','3rem','3.5rem','4rem'] },
                { key: 'fontWeight', label: 'Weight', type: 'select', options: ['100','200','300','400','500','600','700','800','900'] },
                { key: 'fontFamily', label: 'Font', type: 'text', placeholder: 'Inter, Poppins, Georgia', suggestions: ['Inter, sans-serif','Poppins, sans-serif','Montserrat, sans-serif','Roboto, sans-serif','Open Sans, sans-serif','Playfair Display, serif','Georgia, serif','monospace','system-ui, sans-serif'] },
                { key: 'lineHeight', label: 'Line H.', type: 'text', placeholder: '1.5, normal', suggestions: ['1','1.1','1.2','1.3','1.4','1.5','1.6','1.7','1.8','2','normal'] },
                { key: 'letterSpacing', label: 'Spacing', type: 'text', placeholder: '0, 0.05em, -0.02em', suggestions: ['-0.05em','-0.02em','-0.01em','0','0.01em','0.02em','0.05em','0.1em','0.15em','0.2em'] },
                { key: 'color', label: 'Color', type: 'rgba' },
                { key: 'opacity', label: 'Opacity', type: 'text', placeholder: '0 to 1', suggestions: ['0.1','0.2','0.3','0.4','0.5','0.6','0.7','0.8','0.9','1'] },
                { key: 'textShadow', label: 'Shadow', type: 'text', placeholder: '2px 2px 4px rgba(0,0,0,0.3)', suggestions: ['none','1px 1px 2px rgba(0,0,0,0.1)','2px 2px 4px rgba(0,0,0,0.2)','2px 2px 8px rgba(0,0,0,0.3)','0 0 10px rgba(108,99,255,0.5)','0 0 20px rgba(255,255,255,0.3)','3px 3px 6px rgba(0,0,0,0.4)'] }
            ];

            fields.forEach(f => {
                const row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:6px;';

                const label = document.createElement('label');
                label.style.cssText = 'font-size:0.72rem;color:var(--text3);width:55px;flex-shrink:0;';
                label.textContent = f.label;
                row.appendChild(label);

                if (f.type === 'select') {
                    const sel = document.createElement('select');
                    sel.style.cssText = 'flex:1;padding:4px 8px;border:1px solid var(--border);border-radius:4px;background:var(--surface2);color:var(--text1);font-size:0.75rem;';
                    f.options.forEach(o => { const opt = document.createElement('option'); opt.value = o; opt.textContent = o; if (style[f.key] === o) opt.selected = true; sel.appendChild(opt); });
                    sel.onchange = () => setGroupStyle(group.id, f.key, sel.value);
                    row.appendChild(sel);
                } else if (f.type === 'rgba') {
                    // RGBA color picker with native picker + alpha slider
                    const colorWrap = document.createElement('div');
                    colorWrap.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:4px;';
                    
                    const colorRow = document.createElement('div');
                    colorRow.style.cssText = 'display:flex;gap:6px;align-items:center;';
                    
                    const picker = document.createElement('input');
                    picker.type = 'color';
                    let hexVal = style[f.key] || '#ffffff';
                    if (hexVal.startsWith('rgb')) {
                        const m = hexVal.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
                        if (m) hexVal = '#' + [m[1],m[2],m[3]].map(n => parseInt(n).toString(16).padStart(2,'0')).join('');
                    }
                    picker.value = hexVal.startsWith('#') ? hexVal.substring(0,7) : '#ffffff';
                    picker.style.cssText = 'width:32px;height:24px;border:1px solid var(--border);border-radius:4px;cursor:pointer;padding:0;flex-shrink:0;';
                    
                    const textIn = document.createElement('input');
                    textIn.type = 'text';
                    textIn.value = style[f.key] || '';
                    textIn.placeholder = 'rgba(255,0,0,1)';
                    textIn.style.cssText = 'flex:1;padding:4px 6px;border:1px solid var(--border);border-radius:4px;background:var(--surface2);color:var(--text1);font-size:0.72rem;min-width:0;';
                    
                    const alphaSlider = document.createElement('input');
                    alphaSlider.type = 'range'; alphaSlider.min = '0'; alphaSlider.max = '100'; alphaSlider.step = '1';
                    let curAlpha = 1;
                    const am = (style[f.key]||'').match(/,\s*([\d.]+)\s*\)/);
                    if (am) curAlpha = parseFloat(am[1]);
                    alphaSlider.value = Math.round(curAlpha * 100);
                    alphaSlider.style.cssText = 'width:100%;height:4px;cursor:pointer;accent-color:var(--accent);';
                    
                    function buildRgba(hex, alpha) {
                        const h = hex.replace('#','');
                        return `rgba(${parseInt(h.substring(0,2),16)}, ${parseInt(h.substring(2,4),16)}, ${parseInt(h.substring(4,6),16)}, ${alpha})`;
                    }
                    picker.oninput = () => { const rgba = buildRgba(picker.value, parseInt(alphaSlider.value)/100); textIn.value = rgba; setGroupStyle(group.id, f.key, rgba); };
                    alphaSlider.oninput = () => { const rgba = buildRgba(picker.value, parseInt(alphaSlider.value)/100); textIn.value = rgba; setGroupStyle(group.id, f.key, rgba); };
                    textIn.onchange = () => setGroupStyle(group.id, f.key, textIn.value);
                    
                    colorRow.appendChild(picker);
                    colorRow.appendChild(textIn);
                    colorWrap.appendChild(colorRow);
                    colorWrap.appendChild(alphaSlider);
                    row.appendChild(colorWrap);
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = style[f.key] || '';
                    input.placeholder = f.placeholder || '';
                    input.style.cssText = 'flex:1;padding:4px 8px;border:1px solid var(--border);border-radius:4px;background:var(--surface2);color:var(--text1);font-size:0.75rem;';
                    
                    // Add datalist suggestions
                    if (f.suggestions && f.suggestions.length > 0) {
                        const listId = 'st-' + group.id + '-' + f.key;
                        const datalist = document.createElement('datalist');
                        datalist.id = listId;
                        f.suggestions.forEach(s => { const opt = document.createElement('option'); opt.value = s; datalist.appendChild(opt); });
                        input.setAttribute('list', listId);
                        row.appendChild(datalist);
                    }
                    
                    input.onchange = () => setGroupStyle(group.id, f.key, input.value);
                    row.appendChild(input);
                }

                sectionBody.appendChild(row);
            });

            // Reset group button
            const resetBtn = document.createElement('button');
            resetBtn.style.cssText = 'font-size:0.7rem;color:var(--text3);border:none;background:none;cursor:pointer;margin-top:4px;';
            resetBtn.textContent = 'Reset this group';
            resetBtn.onclick = () => { resetGroup(group.id); openPanel(); };
            sectionBody.appendChild(resetBtn);

            section.appendChild(sectionHeader);
            section.appendChild(sectionBody);
            body.appendChild(section);
        });

        panel.appendChild(body);
    }

    // Init
    load();
    applyToCanvas();

    return {
        openPanel,
        getGroupStyle,
        setGroupStyle,
        resetGroup,
        resetAll,
        applyToCanvas,
        generateExportCSS,
        generateExportTag,
        GROUPS
    };
})();

if (typeof window !== 'undefined') window.SiteText = SiteText;
