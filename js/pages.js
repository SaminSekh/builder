// ============================================================
// pages.js – Page Manager UI Logic
// ============================================================

const PagesManager = (() => {
  function init() {
    const pagesList = document.getElementById('pagesList');
    const addPageBtn = document.getElementById('addPageBtn');

    if (addPageBtn) {
      addPageBtn.onclick = () => {
        const name = prompt('Enter page name:', 'New Page');
        if (name) {
          State.addPage(name);
        }
      };
    }

    State.on('pagesChanged', renderPages);
    
    // Initial render
    renderPages(State.getPages());
  }

  function renderPages(pages) {
    const pagesList = document.getElementById('pagesList');
    if (!pagesList) return;

    const currentId = State.getCurrentPageId();
    pagesList.innerHTML = '';

    pages.forEach(page => {
      const tab = document.createElement('div');
      tab.className = `page-tab ${page.id === currentId ? 'active' : ''}`;
      tab.dataset.id = page.id;
      
      tab.innerHTML = `
        <i class="fa-solid fa-file-lines"></i>
        <span>${page.name}</span>
        <div class="page-tab-actions">
          <button class="page-tab-btn edit-page" title="Rename"><i class="fa-solid fa-pen"></i></button>
          <button class="page-tab-btn delete-page" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      `;

      tab.onclick = (e) => {
        if (e.target.closest('.page-tab-btn')) return;
        State.switchPage(page.id);
      };

      const editBtn = tab.querySelector('.edit-page');
      editBtn.onclick = (e) => {
        e.stopPropagation();
        const newName = prompt('Rename page:', page.name);
        if (newName) {
          State.renamePage(page.id, newName);
        }
      };

      const delBtn = tab.querySelector('.delete-page');
      delBtn.onclick = (e) => {
        e.stopPropagation();
        if (page.id === 'page_index') {
          alert('Cannot delete the Home page.');
          return;
        }
        if (confirm(`Are you sure you want to delete "${page.name}" and all its content?`)) {
          State.removePage(page.id);
        }
      };

      pagesList.appendChild(tab);
    });
  }

  return { init };
})();

// Initialize when DOM is ready (or called from app.js)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', PagesManager.init);
} else {
    PagesManager.init();
}
