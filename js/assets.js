// ============================================================
// assets.js – Asset Manager / Media Library
// Client-side image/media management with localStorage persistence.
// Supports: upload, browse, reuse, compress, global replace.
// ============================================================

const AssetManager = (() => {
    const STORAGE_KEY = 'sf_asset_library';
    const MAX_ASSETS = 200;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
    const THUMB_SIZE = 200;

    let _assets = []; // { id, name, type, size, dataUrl, thumbUrl, uploadedAt, usageCount }
    let _isOpen = false;
    let _onSelectCallback = null; // callback when user picks an asset

    // --- Persistence ---
    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(_assets));
        } catch (e) {
            console.warn('AssetManager: localStorage full, removing oldest assets');
            // Remove oldest assets until it fits
            while (_assets.length > 10) {
                _assets.shift();
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(_assets));
                    return;
                } catch (e2) { /* keep trying */ }
            }
        }
    }

    function load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) _assets = JSON.parse(saved);
        } catch (e) {
            _assets = [];
        }
    }

    // --- Compression ---
    function compressImage(file, maxWidth = 1200, quality = 0.82) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width;
                    let h = img.height;

                    if (w > maxWidth) {
                        h = Math.round(h * (maxWidth / w));
                        w = maxWidth;
                    }

                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);

                    const dataUrl = canvas.toDataURL('image/webp', quality) || canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function createThumbnail(dataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width;
                let h = img.height;
                const ratio = Math.min(THUMB_SIZE / w, THUMB_SIZE / h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/webp', 0.6) || canvas.toDataURL('image/jpeg', 0.6));
            };
            img.onerror = () => resolve(dataUrl);
            img.src = dataUrl;
        });
    }

    // --- Upload ---
    async function upload(file) {
        if (!file) return null;
        if (file.size > MAX_FILE_SIZE) {
            if (window.showToast) window.showToast(`File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`, 'error');
            return null;
        }
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            if (window.showToast) window.showToast('Only image and video files are supported', 'error');
            return null;
        }

        let dataUrl;
        if (file.type.startsWith('image/')) {
            dataUrl = await compressImage(file);
        } else {
            // For video, store a placeholder (videos are too large for localStorage)
            dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        const thumbUrl = file.type.startsWith('image/') ? await createThumbnail(dataUrl) : '';

        const asset = {
            id: 'asset_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
            name: file.name,
            type: file.type,
            size: dataUrl.length,
            dataUrl,
            thumbUrl,
            path: '', // will be set below
            uploadedAt: new Date().toISOString(),
            usageCount: 0
        };

        // Generate a clean asset path
        const ext = file.type.includes('png') ? 'png' : file.type.includes('gif') ? 'gif' : file.type.includes('svg') ? 'svg' : 'webp';
        const safeName = (file.name || 'image').replace(/[^a-z0-9_.-]/gi, '_').replace(/\.[^.]+$/, '');
        asset.path = `assets/img/${safeName}_${asset.id.slice(-6)}.${ext}`;

        if (_assets.length >= MAX_ASSETS) {
            // Remove least used, oldest asset
            _assets.sort((a, b) => a.usageCount - b.usageCount || new Date(a.uploadedAt) - new Date(b.uploadedAt));
            _assets.shift();
        }

        _assets.push(asset);
        save();

        if (window.showToast) window.showToast(`Uploaded: ${file.name}`, 'success');
        return asset;
    }

    async function uploadMultiple(files) {
        const results = [];
        for (const file of files) {
            const asset = await upload(file);
            if (asset) results.push(asset);
        }
        return results;
    }

    // --- Browse / Query ---
    function getAll() {
        return [..._assets];
    }

    function getById(id) {
        return _assets.find(a => a.id === id) || null;
    }

    function getByPath(path) {
        if (!path) return null;
        return _assets.find(a => a.path === path) || null;
    }

    /**
     * Resolve an asset path to its data URL for rendering.
     * If the value is already a full URL (http/https) or data URL, returns it as-is.
     * If it's an asset path (assets/img/...), looks up the data URL from the library.
     */
    function resolve(value) {
        if (!value) return '';
        // Already a full URL or data URL — return as-is
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) {
            return value;
        }
        // Try to find by path
        const asset = _assets.find(a => a.path === value);
        if (asset) return asset.dataUrl;
        // Not found — return original (might be a relative path from imported project)
        return value;
    }

    function search(query) {
        const q = (query || '').toLowerCase();
        if (!q) return getAll();
        return _assets.filter(a => a.name.toLowerCase().includes(q));
    }

    function getRecent(count = 20) {
        return [..._assets].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)).slice(0, count);
    }

    // --- Usage Tracking ---
    function markUsed(id) {
        const asset = _assets.find(a => a.id === id);
        if (asset) {
            asset.usageCount++;
            save();
        }
    }

    // --- Delete ---
    function remove(id) {
        _assets = _assets.filter(a => a.id !== id);
        save();
    }

    function clear() {
        _assets = [];
        save();
    }

    // --- Global Replace ---
    /**
     * Replace all occurrences of oldUrl with newUrl across all blocks.
     */
    function replaceGlobally(oldUrl, newUrl) {
        if (!oldUrl || !newUrl) return 0;
        let count = 0;
        const blocks = State.getAllBlocks('all');

        blocks.forEach(block => {
            const propsStr = JSON.stringify(block.props);
            if (propsStr.includes(oldUrl)) {
                const updated = JSON.parse(propsStr.replace(new RegExp(escapeRegex(oldUrl), 'g'), newUrl));
                Object.assign(block.props, updated);
                count++;
            }
        });

        if (count > 0) {
            State.emit('blocksChanged');
            if (window.showToast) window.showToast(`Replaced in ${count} block(s)`, 'success');
        }
        return count;
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // --- UI: Asset Picker Modal ---
    function open(callback) {
        _onSelectCallback = callback || null;
        _isOpen = true;
        renderModal();
    }

    function close() {
        _isOpen = false;
        _onSelectCallback = null;
        const modal = document.getElementById('assetModal');
        if (modal) modal.classList.add('hidden');
    }

    function renderModal() {
        let modal = document.getElementById('assetModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'assetModal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }
        modal.classList.remove('hidden');

        const assets = getAll().sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

        modal.innerHTML = `
            <div class="modal modal-lg">
                <div class="modal-header">
                    <h2><i class="fa-solid fa-images"></i> Media Library</h2>
                    <button class="modal-close" onclick="AssetManager.close()"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="modal-body" style="padding:20px;">
                    <div style="display:flex;gap:12px;margin-bottom:20px;align-items:center;flex-wrap:wrap;">
                        <label class="tb-btn primary" style="cursor:pointer;margin:0;">
                            <i class="fa-solid fa-upload"></i> Upload Images
                            <input type="file" id="assetUploadInput" multiple accept="image/*" style="display:none;" />
                        </label>
                        <input type="text" id="assetSearchInput" placeholder="Search assets..." style="flex:1;min-width:160px;padding:8px 14px;border:1px solid var(--border);border-radius:8px;background:var(--surface2);color:var(--text1);font-size:0.85rem;" />
                        <span style="font-size:0.78rem;color:var(--text3);">${assets.length} / ${MAX_ASSETS} assets</span>
                    </div>
                    <div id="assetGrid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(140px, 1fr));gap:12px;max-height:55vh;overflow-y:auto;padding:4px;">
                        ${assets.length === 0 ? '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text3);"><i class="fa-solid fa-cloud-arrow-up fa-3x" style="opacity:0.3;margin-bottom:16px;display:block;"></i><p>No assets yet. Upload images to get started.</p></div>' : ''}
                        ${assets.map(a => `
                            <div class="asset-card" data-id="${a.id}" style="position:relative;border-radius:12px;overflow:hidden;border:2px solid transparent;cursor:pointer;transition:all 0.2s;background:var(--surface2);" onmouseover="this.style.borderColor='var(--accent)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='transparent';this.style.transform=''">
                                <div style="width:100%;aspect-ratio:1;background:url('${a.thumbUrl || a.dataUrl}') center/cover no-repeat;background-color:#1a1a2e;"></div>
                                <div style="padding:8px;font-size:0.72rem;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(a.name)}</div>
                                <button class="asset-delete-btn" data-id="${a.id}" style="position:absolute;top:6px;right:6px;width:24px;height:24px;border-radius:50%;border:none;background:rgba(0,0,0,0.7);color:#fff;font-size:0.7rem;cursor:pointer;display:none;align-items:center;justify-content:center;" onmouseover="event.stopPropagation()" title="Delete"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Wire events
        const uploadInput = modal.querySelector('#assetUploadInput');
        uploadInput.addEventListener('change', async (e) => {
            const files = e.target.files;
            if (!files.length) return;
            await uploadMultiple(Array.from(files));
            renderModal(); // refresh grid
        });

        const searchInput = modal.querySelector('#assetSearchInput');
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            modal.querySelectorAll('.asset-card').forEach(card => {
                const asset = _assets.find(a => a.id === card.dataset.id);
                card.style.display = (asset && asset.name.toLowerCase().includes(q)) ? '' : 'none';
            });
        });

        // Click to select
        modal.querySelectorAll('.asset-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.asset-delete-btn')) return;
                const asset = _assets.find(a => a.id === card.dataset.id);
                if (asset && _onSelectCallback) {
                    markUsed(asset.id);
                    _onSelectCallback(asset.dataUrl, asset);
                    close();
                }
            });

            // Show delete on hover
            card.addEventListener('mouseenter', () => {
                const btn = card.querySelector('.asset-delete-btn');
                if (btn) btn.style.display = 'flex';
            });
            card.addEventListener('mouseleave', () => {
                const btn = card.querySelector('.asset-delete-btn');
                if (btn) btn.style.display = 'none';
            });
        });

        // Delete buttons
        modal.querySelectorAll('.asset-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (confirm('Delete this asset?')) {
                    remove(id);
                    renderModal();
                }
            });
        });

        // Click overlay to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });
    }

    /**
     * Open the asset picker and return a promise that resolves with the selected URL.
     * Usage: const url = await AssetManager.pick();
     */
    function pick() {
        return new Promise((resolve) => {
            open((url) => resolve(url));
        });
    }

    // --- Init ---
    load();

    return {
        upload,
        uploadMultiple,
        getAll,
        getById,
        getByPath,
        resolve,
        search,
        getRecent,
        markUsed,
        remove,
        clear,
        replaceGlobally,
        open,
        close,
        pick,
        MAX_ASSETS
    };
})();

// Expose globally
if (typeof window !== 'undefined') {
    window.AssetManager = AssetManager;
}
