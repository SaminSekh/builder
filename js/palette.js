// ============================================================
// palette.js – Left sidebar component palette
// ============================================================

const Palette = (() => {
    let dragType = null;

    function init() {
        renderList();
        document.getElementById('paletteSearch').addEventListener('input', (e) => {
            renderList(e.target.value.toLowerCase());
        });
    }

    function renderList(filter = '') {
        const container = document.getElementById('paletteList');
        container.innerHTML = '';

        // Group by category
        const categories = {};
        for (const [type, def] of Object.entries(BlockTypes)) {
            const cat = def.category || 'Other';
            if (!categories[cat]) categories[cat] = [];
            if (!filter || def.label.toLowerCase().includes(filter) || cat.toLowerCase().includes(filter)) {
                categories[cat].push({ type, ...def });
            }
        }

        for (const [cat, items] of Object.entries(categories)) {
            if (!items.length) continue;
            const catEl = document.createElement('div');
            catEl.className = 'palette-category';
            catEl.textContent = cat;
            container.appendChild(catEl);

            items.forEach(item => {
                const el = document.createElement('div');
                el.className = 'palette-item';
                el.draggable = true;
                el.dataset.type = item.type;
                el.innerHTML = `<i class="${item.icon}"></i><span>${item.label}</span>`;

                el.addEventListener('dragstart', (e) => {
                    dragType = item.type;
                    el.classList.add('dragging');
                    e.dataTransfer.setData('text/plain', item.type);
                    e.dataTransfer.effectAllowed = 'copy';
                });
                el.addEventListener('dragend', () => {
                    el.classList.remove('dragging');
                    dragType = null;
                });

                // Click-to-add fallback (appends block at end of canvas)
                el.addEventListener('click', () => {
                    const def = BlockTypes[item.type];
                    if (!def) return;
                    const id = State.addBlock({ type: item.type, props: JSON.parse(JSON.stringify(def.defaultProps)) });
                    State.setSelected(id);
                    // Scroll canvas to bottom so user sees the new block
                    const canvasWrapper = document.getElementById('canvasWrapper');
                    setTimeout(() => canvasWrapper.scrollTo({ top: canvasWrapper.scrollHeight, behavior: 'smooth' }), 80);
                    showToast('✅ ' + def.label + ' added — click to select & edit', 'success');
                });

                container.appendChild(el);
            });
        }
    }

    function getDragType() { return dragType; }

    return { init, getDragType };
})();
