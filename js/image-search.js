// ============================================================
// image-search.js – Image Search using Wikimedia Commons API
// Free, no API key, CORS-friendly, returns relevant results.
// ============================================================

const ImageSearch = (() => {
    let _isOpen = false;
    let _results = [];
    let _loading = false;
    let _query = '';
    let _offset = 0;

    // Wikimedia Commons API - free, no key, CORS allowed
    async function searchImages(query, offset = 0) {
        _loading = true;
        _query = query;
        _offset = offset;
        if (offset === 0) _results = [];
        renderModal();

        try {
            const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=28&gsroffset=${offset}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=400&format=json&origin=*`;
            const res = await fetch(url);
            const data = await res.json();
            const pages = data.query?.pages || {};
            const results = Object.values(pages)
                .filter(p => p.imageinfo && p.imageinfo[0] && p.imageinfo[0].mime?.startsWith('image/'))
                .map(p => {
                    const info = p.imageinfo[0];
                    return {
                        id: p.pageid,
                        thumb: info.thumburl || info.url,
                        regular: info.url,
                        full: info.url,
                        width: info.width,
                        height: info.height,
                        title: (p.title || '').replace('File:', '').replace(/\.[^.]+$/, '')
                    };
                });
            _results = offset === 0 ? results : [..._results, ...results];
        } catch (e) {
            console.error('ImageSearch error:', e);
            if (window.showToast) window.showToast('Search failed', 'error');
        }

        _loading = false;
        renderModal();
    }

    function open() { _isOpen = true; _results = []; _query = ''; _offset = 0; renderModal(); }
    function close() { _isOpen = false; const m = document.getElementById('imgSearchModal'); if (m) m.classList.add('hidden'); }

    function copyUrl(url) {
        navigator.clipboard.writeText(url).then(() => {
            if (window.showToast) window.showToast('Image URL copied!', 'success');
        }).catch(() => {
            const t = document.createElement('textarea'); t.value = url;
            document.body.appendChild(t); t.select(); document.execCommand('copy');
            document.body.removeChild(t);
            if (window.showToast) window.showToast('Image URL copied!', 'success');
        });
    }

    const CATS = ['casino', 'gaming', 'gold', 'neon lights', 'dark background', 'nature', 'city night', 'technology', 'abstract art', 'sports', 'food', 'people', 'car', 'luxury', 'cat', 'dog', 'mountain', 'ocean', 'flower', 'space'];

    function renderModal() {
        let modal = document.getElementById('imgSearchModal');
        if (!modal) { modal = document.createElement('div'); modal.id = 'imgSearchModal'; modal.className = 'modal-overlay'; document.body.appendChild(modal); }
        modal.classList.remove('hidden');

        const catHtml = CATS.map(c => `<button onclick="ImageSearch.doSearchQuery('${c}')" style="padding:5px 11px;border-radius:6px;border:1px solid var(--border);background:${_query===c?'var(--accent)':'var(--surface2)'};color:${_query===c?'#fff':'var(--text2)'};font-size:0.73rem;cursor:pointer;white-space:nowrap;text-transform:capitalize;">${c}</button>`).join('');

        const gridHtml = _loading
            ? '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text3);"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top:8px;font-size:0.8rem;">Searching...</p></div>'
            : _results.length > 0
                ? _results.map(img => {
                    const u = img.regular.replace(/'/g, "\\'");
                    return `<div style="position:relative;border-radius:8px;overflow:hidden;cursor:pointer;aspect-ratio:3/2;background:#222;" onmouseover="this.lastElementChild.style.opacity='1'" onmouseout="this.lastElementChild.style.opacity='0'" onclick="ImageSearch.copyUrl('${u}')">
                        <img src="${img.thumb}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.parentElement.style.display='none'"/>
                        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.6);opacity:0;transition:opacity 0.2s;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;">
                            <i class="fa-solid fa-copy" style="color:#fff;font-size:1.2rem;"></i>
                            <span style="color:#fff;font-size:0.7rem;font-weight:600;">Copy URL</span>
                        </div>
                    </div>`;
                }).join('')
                : `<div style="grid-column:1/-1;text-align:center;padding:50px;color:var(--text3);"><i class="fa-solid fa-image fa-2x" style="opacity:0.2;margin-bottom:12px;display:block;"></i><p>${_query ? 'No results found' : 'Search or pick a category'}</p></div>`;

        const loadMoreBtn = _results.length >= 20 && !_loading
            ? `<div style="grid-column:1/-1;text-align:center;padding:8px;"><button class="tb-btn secondary" onclick="ImageSearch.loadMore()"><i class="fa-solid fa-plus"></i> Load More</button></div>` : '';

        modal.innerHTML = `<div class="modal modal-lg">
            <div class="modal-header"><h2><i class="fa-solid fa-magnifying-glass-plus"></i> Image Search</h2><button class="modal-close" onclick="ImageSearch.close()"><i class="fa-solid fa-xmark"></i></button></div>
            <div class="modal-body" style="padding:16px;">
                <div style="display:flex;gap:8px;margin-bottom:12px;">
                    <input type="text" id="imgSearchInput" value="${_query}" placeholder="Search any image (cat, car, casino, gold...)" style="flex:1;padding:9px 14px;border:1px solid var(--border);border-radius:8px;background:var(--surface2);color:var(--text1);font-size:0.88rem;" onkeydown="if(event.key==='Enter')ImageSearch.doSearch()"/>
                    <button class="tb-btn primary" onclick="ImageSearch.doSearch()"><i class="fa-solid fa-search"></i></button>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">${catHtml}</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:8px;max-height:55vh;overflow-y:auto;">${gridHtml}${loadMoreBtn}</div>
                <p style="font-size:0.68rem;color:var(--text3);margin-top:10px;text-align:center;">Free images from Wikimedia Commons · Click to copy URL</p>
            </div>
        </div>`;
        modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    }

    function doSearch() { const i = document.getElementById('imgSearchInput'); if (i && i.value.trim()) searchImages(i.value.trim(), 0); }
    function doSearchQuery(q) { searchImages(q, 0); }
    function loadMore() { searchImages(_query, _offset + 28); }

    return { open, close, doSearch, doSearchQuery, loadMore, copyUrl };
})();

if (typeof window !== 'undefined') window.ImageSearch = ImageSearch;
