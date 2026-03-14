// ============================================================
// export.js – Export final website as downloadable ZIP
// ============================================================

const Exporter = (() => {

  function generateHTML() {
    const meta = State.getMeta();

    function renderBlockRecursively(block) {
      const def = BlockTypes[block.type];
      if (!def) return '';
      let html = def.render(block.props);

      // --- NEW: Apply Sub-element Styles (Pen Tool edits) ---
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

            Array.from(el.children).forEach((child, i) => {
              applyStylesRecursively(child, path + '.' + i);
            });
          }

          Array.from(doc.body.children).forEach((child, i) => {
            applyStylesRecursively(child, i.toString());
          });

          html = doc.body.innerHTML;
        }
      }

      // If it's a container, we need to inject its children into .container-inner
      if (block.type === 'container') {
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

    const rootBlocks = State.getBlocks();
    const bodySections = rootBlocks.map(block => {
      const def = BlockTypes[block.type];
      if (!def) return '';
      return `\n  <!-- ${def.label} -->\n  ${renderBlockRecursively(block)}`;
    }).join('\n');

    const faviconTag = meta.favicon
      ? `<link rel="icon" href="${meta.favicon}" />`
      : '';

    const fontsLink = meta.fonts
      ? `<link rel="preconnect" href="https://fonts.googleapis.com" />\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n  <link href="${meta.fonts}" rel="stylesheet" />`
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(meta.title || 'My Website')}</title>
  <meta name="description" content="${escHtml(meta.description)}" />
  <meta name="keywords" content="${escHtml(meta.keywords)}" />
  ${faviconTag}
  ${fontsLink}
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="css/style.css" />
  ${meta.scripts || ''}
</head>
<body>
${bodySections}
</body>
</html>`;
  }

  function generateCSS() {
    const themeVars = (typeof Themes !== 'undefined') ? Themes.buildCSSVars() : '';
    return `/* ============================================================
   ${State.getMeta().title || 'My Website'} – Stylesheet
   Generated by SiteForge Website Builder
   ============================================================ */

${themeVars ? themeVars + '\n\n' : ''}*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  font-size: 16px;
}

body {
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  line-height: 1.6;
  color: #111827;
  overflow-x: hidden;
  margin: 0;
}

img, video {
  max-width: 100%;
  height: auto;
  display: block;
}

a { text-decoration: none; color: inherit; }

/* Hamburger common styles */
.sf-navbar.mobile-open .hamburger span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
.sf-navbar.mobile-open .hamburger span:nth-child(2) { opacity: 0; }
.sf-navbar.mobile-open .hamburger span:nth-child(3) { transform: rotate(-45deg) translate(7px, -6px); }
.sf-navbar .hamburger span { transition: all 0.3s ease; }

/* Responsive adjustments */
@media (max-width: 768px) {
  section, footer, nav {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
  
  /* Universal stacking for flex/grid containers */
  div[style*="display:flex"], 
  div[style*="display: flex"] {
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
    gap: 20px !important;
  }
  
  /* Reset widths for mobile */
  div[style*="width"], section[style*="width"], figure[style*="width"] {
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Grid layouts */
  div[style*="display:grid"], 
  div[style*="display: grid"] {
    grid-template-columns: 1fr !important;
    gap: 30px !important;
  }
  
  h1 { font-size: 2.2rem !important; }
  h2 { font-size: 1.8rem !important; }
  p { font-size: 1rem !important; }
}

@media (max-width: 480px) {
  h1 { font-size: 1.8rem !important; }
  .sf-navbar { padding: 10px 15px !important; }
}
`;
  }

  function generateReadme(meta) {
    return `# ${meta.title || 'My Website'}

> Built with [SiteForge](https://github.com/your-repo) – Drag & Drop Website Builder

## Description
${meta.description || 'A beautiful website.'}

## How to Use
1. Open \`index.html\` in your browser directly, OR
2. Upload all files to any web host / GitHub Pages.

## File Structure
\`\`\`
├── index.html        # Main HTML file
├── css/
│   └── style.css     # Stylesheet
└── README.md
\`\`\`

## Deployment
- **GitHub Pages**: Push all files to a repository, go to Settings → Pages, set source to main branch.
- **Netlify / Vercel**: Drag and drop the folder — done!
- **Any hosting**: Upload files via FTP.
`;
  }

  function escHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  async function exportZIP() {
    const meta = State.getMeta();

    if (!window.JSZip) {
      showToast('JSZip is loading, please try again in a moment.', 'error');
      return;
    }

    const zip = new JSZip();
    zip.file('index.html', generateHTML());
    zip.file('css/style.css', generateCSS());
    zip.file('README.md', generateReadme(meta));
    
    // Store project state for future imports
    const projectData = {
      version: '1.0',
      blocks: State.getAllBlocks(),
      meta: State.getMeta()
    };
    zip.file('project.json', JSON.stringify(projectData, null, 2));

    const blob = await zip.generateAsync({ type: 'blob' });
    const filename = (meta.title || 'my-website').toLowerCase().replace(/\s+/g, '-') + '.zip';

    // Download
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('✅ Exported: ' + filename, 'success');
  }

  function getPreviewHTML() {
    let html = generateHTML();
    html = html.replace(/<link[^>]*href="css\/style\.css"[^>]*>/i, '');
    html = html.replace('</head>', `<style>\n${generateCSS()}\n</style>\n</head>`);
    return html;
  }

  return { exportZIP, getPreviewHTML, generateHTML, generateCSS };
})();
