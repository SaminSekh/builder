// ============================================================
// export.js – Export final website as downloadable ZIP
// ============================================================

const Exporter = (() => {

  function generateHTML(pageId = null) {
    const meta = State.getMeta();
    const activePage = pageId ? State.getPages().find(p => p.id === pageId) : State.getPages().find(p => p.id === State.getCurrentPageId());
    const pageMeta = activePage?.meta || meta;

    function renderBlockRecursively(block) {
      const def = BlockTypes[block.type];
      if (!def) return '';
      let html = def.render(block.props);

      // --- Apply Sub-element Styles (Pen Tool edits) ---
      if (block.props.subStyles && Object.keys(block.props.subStyles).length > 0) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const root = doc.body.firstElementChild;

        if (root) {
          const subStyles = block.props.subStyles;

          function applyStylesRecursively(el, path) {
            const s = subStyles[path];
            if (s) {
              const clean = (val) => (val && typeof val === 'string') ? val.replace(' !important', '').trim() : val;
              
              // Layout
              if (s.display) el.style.setProperty('display', clean(s.display), 'important');
              if (s.width) el.style.setProperty('width', clean(s.width), 'important');
              if (s.height) el.style.setProperty('height', clean(s.height), 'important');
              if (s.minWidth) el.style.setProperty('min-width', clean(s.minWidth), 'important');
              if (s.minHeight) el.style.setProperty('min-height', clean(s.minHeight), 'important');
              if (s.maxWidth) el.style.setProperty('max-width', clean(s.maxWidth), 'important');
              if (s.maxHeight) el.style.setProperty('max-height', clean(s.maxHeight), 'important');
              if (s.margin) el.style.setProperty('margin', clean(s.margin), 'important');
              if (s.padding) el.style.setProperty('padding', clean(s.padding), 'important');
              if (s.gap) el.style.setProperty('gap', clean(s.gap), 'important');
              if (s.direction) el.style.setProperty('flex-direction', clean(s.direction), 'important');
              if (s.justify) el.style.setProperty('justify-content', clean(s.justify), 'important');
              if (s.align) el.style.setProperty('align-items', clean(s.align), 'important');
              if (s.flexGrow) el.style.setProperty('flex-grow', clean(s.flexGrow), 'important');
              if (s.flexShrink) el.style.setProperty('flex-shrink', clean(s.flexShrink), 'important');
              if (s.alignSelf) el.style.setProperty('align-self', clean(s.alignSelf), 'important');

              // Typography
              if (s.color) el.style.setProperty('color', clean(s.color), 'important');
              if (s.fontSize) el.style.setProperty('font-size', clean(s.fontSize), 'important');
              if (s.fontWeight) el.style.setProperty('font-weight', clean(s.fontWeight), 'important');
              if (s.fontFamily) el.style.setProperty('font-family', clean(s.fontFamily), 'important');
              if (s.lineHeight) el.style.setProperty('line-height', clean(s.lineHeight), 'important');
              if (s.letterSpacing) el.style.setProperty('letter-spacing', clean(s.letterSpacing), 'important');
              if (s.textAlign) el.style.setProperty('text-align', clean(s.textAlign), 'important');

              // Visuals
              if (s.bgColor) el.style.setProperty('background-color', clean(s.bgColor), 'important');
              if (s.background) el.style.setProperty('background', clean(s.background), 'important');
              if (s.opacity) el.style.setProperty('opacity', clean(s.opacity), 'important');
              if (s.zIndex) el.style.setProperty('z-index', clean(s.zIndex), 'important');
              if (s.boxShadow) el.style.setProperty('box-shadow', clean(s.boxShadow), 'important');
              if (s.borderRadius) el.style.setProperty('border-radius', clean(s.borderRadius), 'important');
              if (s.border) el.style.setProperty('border', clean(s.border), 'important');
              if (s.borderWidth) el.style.setProperty('border-width', clean(s.borderWidth), 'important');
              if (s.borderStyle) el.style.setProperty('border-style', clean(s.borderStyle), 'important');
              if (s.borderColor) el.style.setProperty('border-color', clean(s.borderColor), 'important');

              // Behavior / Content
              if (s.customId) el.id = s.customId;
              if (s.customClass) el.className = s.customClass;
              const isContentTag = ['P', 'SPAN', 'A', 'BUTTON', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'FIGCAPTION', 'LABEL', 'I'].includes(el.tagName);
              if (s.text !== undefined && (el.children.length === 0 || isContentTag)) {
                el.innerText = s.text;
              }
            }

            // Existing children
            Array.from(el.children).forEach((child, i) => {
              applyStylesRecursively(child, path + '.' + i);
            });

            // Dynamic children (Nesting)
            if (s && s.children && s.children.length > 0) {
              s.children.forEach((childData, i) => {
                const childPath = path + '.c' + i;
                const cs = subStyles[childPath] || {};
                let childEl;
                
                if (childData.type === 'img') {
                  childEl = doc.createElement('img');
                  childEl.src = cs.src || childData.props.src || '';
                  childEl.style.maxWidth = '100%';
                } else if (childData.type === 'add-to-cart') {
                  childEl = doc.createElement('button');
                  childEl.className = 'sf-add-to-cart';
                  childEl.innerText = cs.text || childData.props.text || 'Add to Cart';
                  childEl.setAttribute('data-name', cs.name || childData.props.name || 'Product');
                  childEl.setAttribute('data-price', cs.price || childData.props.price || '0');
                    childEl.setAttribute('data-image', cs.image || childData.props.image || '');
                    childEl.setAttribute('onclick', `if(window.Cart) Cart.add({
                    name: this.getAttribute('data-name'),
                    price: this.getAttribute('data-price'),
                    image: this.getAttribute('data-image')
                  }, this)`);
                } else if (childData.type === 'div') {
                  childEl = doc.createElement('div');
                  // No default placeholder styles for export, it will take from subStyles
                } else {
                  childEl = doc.createElement('p');
                  childEl.innerText = cs.text || childData.props.text || 'New text...';
                }

                el.appendChild(childEl);
                applyStylesRecursively(childEl, childPath);
              });
            }
          }

          Array.from(doc.body.children).forEach((child, i) => {
            applyStylesRecursively(child, i.toString());
          });

          html = doc.body.innerHTML;
        }
      }

      // If it's a container or box, inject children
      if (block.type === 'container' || block.type === 'box') {
        const children = State.getBlocks(block.id);
        const childrenHtml = children.map(child => renderBlockRecursively(child)).join('\n');

        if (html.includes('class="sf-drop-hint"')) {
          html = html.replace(/<div class="sf-drop-hint".*?<\/div>/s, childrenHtml);
        } else if (html.includes('container-inner')) {
          html = html.replace(/(<div class="container-inner".*?>)/, `$1${childrenHtml}`);
        }
      }

      return html;
    }

    State.sanitize();

    const rootBlocks = State.getBlocks(null); 
    const bodySections = rootBlocks.map(block => {
      const def = BlockTypes[block.type];
      if (!def) return `<!-- Unknown block type: ${block.type} -->`;
      try {
        return `\n  <!-- ${def.label} -->\n  ${renderBlockRecursively(block)}`;
      } catch (err) {
        console.error(`Error rendering block ${block.id} (${block.type}):`, err);
        return `<!-- Error rendering block ${block.id} -->`;
      }
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(pageMeta?.title || 'My Website')}</title>
  <meta name="description" content="${escHtml(pageMeta?.description || '')}" />
  <meta name="keywords" content="${escHtml(pageMeta?.keywords || '')}" />
  ${pageMeta?.favicon ? `<link rel="icon" href="${pageMeta.favicon}" />` : ''}
  
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${pageMeta?.fonts || 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap'}" rel="stylesheet" />

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css" />
  <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css" />
  <link rel="stylesheet" href="css/style.css" />


  ${pageMeta?.scripts || ''}
</head>
<body>
${bodySections}

<script src="js/cart.js"></script>
</body>
</html>`;
  }

  function generateCSS() {
    const themeVars = (typeof Themes !== 'undefined') ? Themes.buildCSSVars() : '';
    return `/* ============================================================
   Generated Stylesheet
   ============================================================ */
${themeVars}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #111827; overflow-x: hidden; }
img, video, iframe { max-width: 100%; height: auto; display: block; }
a { text-decoration: none; color: inherit; }

/* Responsive */
@media (max-width: 768px) {
  section, footer, nav { padding-left: 20px !important; padding-right: 20px !important; }
  div[style*="display:flex"], div[style*="display: flex"] { flex-direction: column !important; align-items: center !important; gap: 20px !important; }
}
`;
  }

  function generateRobots() {
    const meta = State.getMeta();
    return meta.robots || 'User-agent: *\nAllow: /';
  }

  function generateReadme(meta) {
    return `# ${meta.title || 'My Website'}\nBuild with SiteForge.`;
  }

  function escHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  async function exportZIP() {
    if (!window.JSZip) {
      showToast('JSZip not loaded yet.', 'error');
      return;
    }

    const zip = new JSZip();
    const pages = State.getPages();
    pages.forEach(page => {
      zip.file(page.filename, generateHTML(page.id));
    });

    zip.file('css/style.css', generateCSS());
    zip.file('robots.txt', generateRobots());
    zip.file('README.md', generateReadme(State.getMeta()));

    // Include cart logic if available
    try {
        const cartContent = await (await fetch('js/cart.js')).text();
        zip.file('js/cart.js', cartContent);
    } catch(e) {
        console.warn('Could not fetch cart.js for export');
    }
    
    const projectData = {
      version: '1.0',
      blocks: State.getAllBlocks('all'),
      pages: State.getPages(),
      meta: State.getMeta()
    };
    zip.file('project.json', JSON.stringify(projectData, null, 2));

    const blob = await zip.generateAsync({ type: 'blob' });
    const filename = 'my-website.zip';

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    showToast('Exported: ' + filename, 'success');
  }

  function getPreviewHTML() {
    let html = generateHTML();
    html = html.replace(/<link[^>]*href="css\/style\.css"[^>]*>/i, '');
    html = html.replace('</head>', `<style>${generateCSS()}</style></head>`);
    return html;
  }

  return { exportZIP, getPreviewHTML, generateHTML, generateCSS };
})();
