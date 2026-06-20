// ============================================================
// export.js – Export final website as downloadable ZIP
// ============================================================

const Exporter = (() => {
  function normalizeAbsoluteBaseUrl(url) {
    const raw = String(url || '').trim();
    if (!raw) return '';
    try {
      const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      const parsed = new URL(normalized);
      parsed.hash = '';
      parsed.search = '';
      return parsed.href.endsWith('/') ? parsed.href : `${parsed.href}/`;
    } catch (err) {
      return '';
    }
  }

  function xmlEscape(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function slugInitials(value) {
    const words = String(value || 'App').trim().split(/\s+/).filter(Boolean);
    return (words.slice(0, 2).map(word => word[0]).join('') || 'A').toUpperCase();
  }

  function getThemeMeta() {
    const activeVars = typeof Themes !== 'undefined' && typeof Themes.getActiveVars === 'function'
      ? Themes.getActiveVars()
      : null;
    return {
      bg: activeVars?.['--sf-bg'] || activeVars?.['--sf-section-bg'] || '#ffffff',
      accent: activeVars?.['--sf-accent'] || '#2563eb',
      text: activeVars?.['--sf-text'] || '#0f172a',
      btnText: activeVars?.['--sf-btn-text'] || '#ffffff'
    };
  }

  function createPwaIconBase64(size, meta) {
    const theme = getThemeMeta();
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, size, size);

    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, theme.accent);
    gradient.addColorStop(1, theme.text);
    ctx.fillStyle = gradient;

    const pad = Math.round(size * 0.12);
    const radius = Math.round(size * 0.22);
    ctx.beginPath();
    ctx.moveTo(pad + radius, pad);
    ctx.lineTo(size - pad - radius, pad);
    ctx.quadraticCurveTo(size - pad, pad, size - pad, pad + radius);
    ctx.lineTo(size - pad, size - pad - radius);
    ctx.quadraticCurveTo(size - pad, size - pad, size - pad - radius, size - pad);
    ctx.lineTo(pad + radius, size - pad);
    ctx.quadraticCurveTo(pad, size - pad, pad, size - pad - radius);
    ctx.lineTo(pad, pad + radius);
    ctx.quadraticCurveTo(pad, pad, pad + radius, pad);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = theme.btnText;
    ctx.font = `700 ${Math.round(size * 0.34)}px Inter, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(slugInitials(meta.title || 'App'), size / 2, size / 2);

    return canvas.toDataURL('image/png').split(',')[1];
  }

  function buildPwaAssets(meta) {
    return {
      icon192Base64: createPwaIconBase64(192, meta),
      icon512Base64: createPwaIconBase64(512, meta),
      icon192Path: 'assets/icon-192.png',
      icon512Path: 'assets/icon-512.png'
    };
  }

  function generateHTML(pageId = null, exportOptions = {}) {
    const meta = State.getMeta();
    const activePage = pageId ? State.getPages().find(p => p.id === pageId) : State.getPages().find(p => p.id === State.getCurrentPageId());
    const targetPageId = activePage?.id || State.getCurrentPageId();
    const pageMeta = activePage?.meta || meta;
    const pwaAssets = exportOptions.pwaAssets || buildPwaAssets(meta);
    const baseUrl = normalizeAbsoluteBaseUrl(meta.url);
    const pageUrl = baseUrl ? `${baseUrl}${activePage?.filename === 'index.html' ? '' : activePage?.filename || ''}` : '';
    const themeMeta = getThemeMeta();

    function canHostBlocks(el) {
      if (!el || !el.tagName) return false;
      return ['DIV', 'SECTION', 'NAV', 'HEADER', 'FOOTER', 'MAIN', 'ARTICLE', 'ASIDE', 'FORM', 'UL', 'OL', 'LI', 'FIGURE'].includes(el.tagName.toUpperCase());
    }

    function getExportChildHost(doc) {
      const explicit = doc.querySelector('.container-inner');
      if (explicit) return explicit;
      const root = doc.body.firstElementChild;
      if (canHostBlocks(root)) return root;
      return null;
    }

    function getPageBlocks(parentId = null) {
      return State.getAllBlocks(targetPageId).filter((block) => block && (block.parentId === parentId || (parentId === null && !block.parentId)));
    }

    function renderBlockRecursively(block) {
      const def = BlockTypes[block.type];
      if (!def) return '';
      // Deep clone props to prevent render mutation from affecting state
      let html = def.render(JSON.parse(JSON.stringify(block.props)));
      let finalHtml = html;

      // Parse the HTML into a DOM tree so we can safely manipulate it
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const root = Array.from(doc.body.children).find((node) => !['STYLE', 'SCRIPT'].includes(node.tagName)) || doc.body.firstElementChild;

      if (root) {
        root.querySelectorAll('.block-actions, .block-toolbar, .sf-pen-tool-container, .resize-handle-v, .resize-handle-h, .resize-handle-both, .sf-sub-resize-handle').forEach((node) => node.remove());

        // Apply Top-Level Block Layout Styles correctly for export
        const rootStyle = BlockTypes.applyLayout(block.props);
        const preserveRenderedAutoHeight =
          block.type === 'promoCarousel' &&
          ['contain', 'fill'].includes(String(block.props?.objectFit || 'cover'));
        if (rootStyle) {
            const tempDiv = document.createElement('div');
            tempDiv.style.cssText = rootStyle;
            for (let i = 0; i < tempDiv.style.length; i++) {
                const prop = tempDiv.style[i];
                if (preserveRenderedAutoHeight && (prop === 'height' || prop === 'min-height' || prop === 'max-height')) {
                    continue;
                }
                root.style.setProperty(prop, tempDiv.style.getPropertyValue(prop), 'important');
            }
            
            // Direct background image application (tempDiv may not parse url() correctly)
            if (block.props.bgImage) {
                const overlayOpacity = block.props.bgOverlayOpacity !== undefined ? block.props.bgOverlayOpacity : 0.4;
                const overlayColor = block.props.bgOverlayColor || '0,0,0';
                const bgSize = block.props.bgSize || 'cover';
                const bgPosition = block.props.bgPosition || 'center';
                root.style.setProperty('background', `linear-gradient(rgba(${overlayColor},${overlayOpacity}), rgba(${overlayColor},${overlayOpacity})), url(${block.props.bgImage}) ${bgPosition}/${bgSize} no-repeat`, 'important');
            }
        }
        
        // Add bgBlur style tag if needed
        if (block.props.bgImage && block.props.bgBlur && parseInt(block.props.bgBlur) > 0) {
            const blurId = root.id || root.getAttribute('id') || ('blk_' + block.id);
            if (!root.id) root.id = blurId;
            const blurStyle = doc.createElement('style');
            const blur = parseInt(block.props.bgBlur);
            const overlayOpacity = block.props.bgOverlayOpacity !== undefined ? block.props.bgOverlayOpacity : 0.4;
            const overlayColor = block.props.bgOverlayColor || '0,0,0';
            const bgSize = block.props.bgSize || 'cover';
            const bgPosition = block.props.bgPosition || 'center';
            blurStyle.textContent = `
#${blurId} { position:relative; overflow:hidden; background:none !important; }
#${blurId}::before { content:''; position:absolute; inset:-${blur*2}px; background: linear-gradient(rgba(${overlayColor},${overlayOpacity}), rgba(${overlayColor},${overlayOpacity})), url(${block.props.bgImage}) ${bgPosition}/${bgSize} no-repeat; filter:blur(${blur}px); z-index:0; }
#${blurId} > * { position:relative; z-index:1; }`;
            root.parentNode.insertBefore(blurStyle, root);
        }

        if (block.props.animationPreset && block.props.animationPreset !== 'none' && (block.props.animationTrigger || 'load') === 'scroll') {
          root.setAttribute('data-sf-anim', block.props.animationPreset);
          root.setAttribute('data-sf-anim-duration', block.props.animationDuration || '0.8');
          root.setAttribute('data-sf-anim-delay', block.props.animationDelay || '0');
        }

        // --- 1. Apply Sub-element Styles (Pen Tool edits) ---
        if (block.props.subStyles && Object.keys(block.props.subStyles).length > 0) {
          const subStyles = block.props.subStyles;

          function applyStylesRecursively(el, path) {
            // Priority 1: Use the explicit path from the component's data-sf-path attribute
            const explicitPath = el.getAttribute('data-sf-path');
            const targetPath = explicitPath || path;
            const s = subStyles[targetPath];

            if (s) {
              const clean = (val) => (val && typeof val === 'string') ? val.replace(' !important', '').trim() : val;
              
              const propsToApply = [
                ['display', 'display'], ['width', 'width'], ['height', 'height'],
                ['minWidth', 'min-width'], ['minHeight', 'min-height'], ['maxWidth', 'max-width'], ['maxHeight', 'max-height'],
                ['margin', 'margin'], ['padding', 'padding'], ['gap', 'gap'], 
                ['direction', 'flex-direction'], ['justify', 'justify-content'], ['align', 'align-items'],
                ['flexGrow', 'flex-grow'], ['flexShrink', 'flex-shrink'], ['alignSelf', 'align-self'],
                ['color', 'color'], ['fontSize', 'font-size'], ['fontWeight', 'font-weight'], ['fontFamily', 'font-family'],
                ['lineHeight', 'line-height'], ['letterSpacing', 'letter-spacing'], ['textAlign', 'text-align'],
                ['bgColor', 'background-color'], ['background', 'background'], ['opacity', 'opacity'],
                ['zIndex', 'z-index'], ['boxShadow', 'box-shadow'], ['borderRadius', 'border-radius'],
                ['border', 'border'], ['borderWidth', 'border-width'], ['borderStyle', 'border-style'], ['borderColor', 'border-color']
              ];

              propsToApply.forEach(([pKey, cssProp]) => {
                if (s[pKey] !== undefined) {
                    // NEVER override background on elements that have explicit inline border styling
                    // (these are outline/secondary buttons — their transparent bg is intentional)
                    if ((pKey === 'bgColor' || pKey === 'background') && el.style.border && !el.style.background && !el.style.backgroundColor) {
                        return; // Skip — this is an outline button
                    }
                    el.style.setProperty(cssProp, clean(s[pKey]), 'important');
                }
              });

              if (s.customId) el.id = s.customId;
              if (s.customClass) el.className = s.customClass;
              
              const isContentTag = ['P', 'SPAN', 'A', 'BUTTON', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'FIGCAPTION', 'LABEL', 'I'].includes(el.tagName);
              if (s.text !== undefined && (el.children.length === 0 || isContentTag)) {
                el.innerText = s.text;
              }

              // Optional link override for add-to-cart buttons
              if (el.classList && el.classList.contains('sf-add-to-cart')) {
                const href = typeof s.href === 'string' ? clean(s.href) : '';
                if (href && el.tagName === 'BUTTON') {
                  const linkEl = doc.createElement('a');
                  Array.from(el.attributes).forEach((attr) => {
                    if (attr.name === 'onclick' || attr.name === 'type') return;
                    linkEl.setAttribute(attr.name, attr.value);
                  });
                  linkEl.setAttribute('href', href);
                  linkEl.innerHTML = el.innerHTML;
                  if (el.getAttribute('style')) linkEl.setAttribute('style', el.getAttribute('style'));
                  if (!/text-decoration\s*:/i.test(linkEl.getAttribute('style') || '')) {
                    linkEl.style.textDecoration = 'none';
                  }
                  if (!/display\s*:/i.test(linkEl.getAttribute('style') || '')) {
                    linkEl.style.display = 'inline-flex';
                    linkEl.style.alignItems = 'center';
                    linkEl.style.justifyContent = 'center';
                  }
                  if (el.parentNode) el.parentNode.replaceChild(linkEl, el);
                  applyStylesRecursively(linkEl, targetPath);
                  return;
                }

                if (!href) {
                  const name = (s.name !== undefined ? s.name : el.getAttribute('data-name')) || 'Product';
                  const price = (s.price !== undefined ? s.price : el.getAttribute('data-price')) || '0.00';
                  const image = (s.image !== undefined ? s.image : el.getAttribute('data-image')) || '';
                  el.setAttribute('data-name', name);
                  el.setAttribute('data-price', price);
                  el.setAttribute('data-image', image);
                  el.setAttribute('onclick', `if(window.Cart)window.Cart.add({ name: this.getAttribute('data-name'), price: this.getAttribute('data-price'), image: this.getAttribute('data-image') }, this); event.stopPropagation();`);
                }
              }
            }

            // 1. Handle Template Promotion hiding
            const isPromoted = s && s.templatePromoted;
            
            // Existing children recursion
            Array.from(el.children).forEach((child, i) => {
              const childExplicit = child.getAttribute('data-sf-path');
              if (childExplicit && childExplicit.includes('.c')) return; // handled by dynamic children
              
              if (isPromoted) {
                 child.remove();
                 return;
              }
              // Match editor pathing: implicit template children use `.t{index}` segments
              applyStylesRecursively(child, childExplicit || (targetPath + '.t' + i));
            });

            // 2. Dynamic children (Nesting)
            if (s && s.children && s.children.length > 0) {
              s.children.forEach((childData, i) => {
                const childPath = targetPath + '.c' + i;
                const cs = subStyles[childPath] || {};
                let childEl;
                const type = childData.type;

                const actsLikeReadMore =
                  (type === 'read-more') ||
                  (
                    type === 'button' &&
                    (
                      cs.popupTitle !== undefined ||
                      cs.popupText !== undefined ||
                      cs.popupVariant !== undefined ||
                      childData.props.popupTitle !== undefined ||
                      childData.props.popupText !== undefined ||
                      childData.props.popupVariant !== undefined
                    )
                  );

                if (type === 'img') {
                  childEl = doc.createElement('img');
                  childEl.src = cs.src || childData.props.src || '';
                  childEl.style.maxWidth = '100%';
                  childEl.style.height = 'auto';
                  childEl.style.display = 'block';
                } else if (type === 'br') {
                  childEl = doc.createElement('br');
                } else if (type === 'hr') {
                  childEl = doc.createElement('hr');
                  childEl.style.cssText = 'width:100%;border:none;border-top:1px solid rgba(15,23,42,0.16);margin:12px 0;';
                } else if (type === 'marquee') {
                  childEl = doc.createElement('marquee');
                  childEl.innerText = cs.text || childData.props.text || childData.props.html || 'Scrolling marquee text...';
                  childEl.style.cssText = 'width:100%;padding:8px 0;';
                } else if (type === 'video') {
                  childEl = doc.createElement('div');
                  childEl.style.cssText = 'position:relative;padding-bottom:56.25%;height:0;overflow:hidden;width:100%;';
                  const iframe = doc.createElement('iframe');
                  const videoSrc = cs.src || childData.props.src || '';
                  iframe.src = VideoHelper.getEmbedUrl(videoSrc);
                  iframe.setAttribute('frameborder', '0');
                  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                  iframe.setAttribute('allowfullscreen', '');
                  iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;';
                  childEl.appendChild(iframe);
                } else if (type === 'add-to-cart') {
                  childEl = doc.createElement('button');
                  childEl.className = 'sf-add-to-cart';
                  childEl.innerText = cs.text || childData.props.text || 'Add to Cart';
                  childEl.setAttribute('data-name', cs.name || childData.props.name || 'Product');
                  childEl.setAttribute('data-price', cs.price || childData.props.price || '0');
                  childEl.setAttribute('data-image', cs.image || childData.props.image || '');
                  const cartBg = cs.bgColor || childData.props.bgColor || 'var(--accent, #6c63ff)';
                  const cartColor = cs.color || cs.textColor || childData.props.color || childData.props.textColor || '#fff';
                  const cartPadding = cs.padding || childData.props.padding || '10px 20px';
                  const cartRadius = cs.borderRadius || childData.props.borderRadius || '6px';
                  const cartFontSize = cs.fontSize || childData.props.fontSize || '1rem';
                  const cartFontWeight = cs.fontWeight || childData.props.fontWeight || '700';
                  const cartWidth = cs.width || childData.props.width || 'auto';
                  childEl.style.cssText = `padding:${cartPadding};background:${cartBg};color:${cartColor};border:none;border-radius:${cartRadius};cursor:pointer;font-size:${cartFontSize};font-weight:${cartFontWeight};width:${cartWidth};`;
                  childEl.setAttribute('onclick', `if(window.Cart) Cart.add({ name: this.getAttribute('data-name'), price: this.getAttribute('data-price'), image: this.getAttribute('data-image') }, this)`);
                } else if (actsLikeReadMore) {
                  const popupId = `sf_rm_${Math.random().toString(36).slice(2, 10)}`;
                  const buttonText = cs.text || childData.props.text || 'Read More';
                  const popupTitle = cs.popupTitle || childData.props.popupTitle || 'More Details';
                  const popupText = cs.popupText || childData.props.popupText || 'Add your read more content from the Content tab.';
                  const popupVariant = cs.popupVariant || childData.props.popupVariant || 'centered';
                  const overlayAlign = popupVariant === 'side-panel'
                    ? 'align-items:stretch;justify-content:flex-end;'
                    : popupVariant === 'minimal'
                      ? 'align-items:flex-start;justify-content:center;padding-top:min(12vh,96px);'
                      : popupVariant === 'full-screen'
                        ? 'align-items:stretch;justify-content:stretch;padding:18px;'
                        : 'align-items:center;justify-content:center;';
                  const cardStyle = popupVariant === 'side-panel'
                    ? 'width:min(92vw,420px);height:100%;max-height:100vh;border-radius:24px 0 0 24px;display:flex;flex-direction:column;'
                    : popupVariant === 'minimal'
                      ? 'width:min(92vw,420px);max-height:min(78vh,720px);border-radius:18px;display:flex;flex-direction:column;'
                      : popupVariant === 'full-screen'
                        ? 'width:100%;height:100%;max-width:none;max-height:none;border-radius:28px;display:flex;flex-direction:column;'
                        : 'width:min(92vw,540px);max-height:min(82vh,760px);border-radius:24px;display:flex;flex-direction:column;';

                  childEl = doc.createElement('div');
                  childEl.className = 'sf-read-more-child';
                  childEl.style.cssText = 'display:inline-flex;position:relative;';
                  childEl.innerHTML = `
                    <button type="button" style="display:inline-flex;align-items:center;gap:8px;padding:11px 16px;border:none;border-radius:999px;background:var(--accent, #6c63ff);color:#fff;font-weight:700;cursor:pointer;box-shadow:0 10px 24px rgba(15,23,42,0.16);" onclick="event.stopPropagation(); var modal=document.getElementById('${popupId}'); if(modal){ modal.style.display='flex'; document.body.style.overflow='hidden'; }">
                      <span>${buttonText}</span><i class="fa-solid fa-arrow-right-long"></i>
                    </button>
                    <div id="${popupId}" onclick="if(event.target===this){this.style.display='none';document.body.style.overflow='';} event.stopPropagation();" style="display:none;position:fixed;inset:0;background:rgba(2,6,23,0.58);backdrop-filter:blur(10px);z-index:99999;padding:24px;${overlayAlign}">
                      <div onclick="event.stopPropagation()" style="position:relative;background:#fff;color:#0f172a;box-shadow:0 30px 90px rgba(15,23,42,0.24);padding:${popupVariant === 'minimal' ? '22px' : popupVariant === 'full-screen' ? '32px' : '28px'};${cardStyle}">
                        <button type="button" onclick="var modal=document.getElementById('${popupId}'); if(modal){ modal.style.display='none'; document.body.style.overflow=''; } event.stopPropagation();" style="position:absolute;top:14px;right:14px;width:36px;height:36px;border:none;border-radius:50%;background:#eef2f7;color:#0f172a;font-size:1.2rem;cursor:pointer;">&times;</button>
                        <div style="font-size:${popupVariant === 'minimal' ? '1.15rem' : '1.5rem'};font-weight:800;line-height:1.15;margin-bottom:12px;padding-right:42px;flex:0 0 auto;">${popupTitle}</div>
                        <div style="font-size:0.96rem;line-height:1.8;color:#475569;overflow-y:auto;flex:1 1 auto;padding-right:6px;word-break:break-word;">${popupText}</div>
                      </div>
                    </div>
                  `;
                } else if (type === 'button') {
                  const resolvedActionType = cs.actionType || childData.props.actionType || 'link';
                  const resolvedHref = cs.href || childData.props.href || '#';
                  if (resolvedActionType === 'cart') {
                    const cartName = cs.cartItemName || childData.props.cartItemName || 'Product';
                    const cartPrice = cs.cartItemPrice || childData.props.cartItemPrice || '0.00';
                    const cartImage = cs.cartItemImage || childData.props.cartItemImage || '';
                    childEl = doc.createElement('button');
                    childEl.type = 'button';
                    childEl.className = 'nav-btn';
                    childEl.innerText = cs.text || childData.props.text || 'Button';
                    const btnBg = cs.bgColor || childData.props.bgColor || 'var(--accent, #6c63ff)';
                    const btnColor = cs.color || childData.props.color || '#fff';
                    childEl.style.cssText = `padding:10px 20px;background:${btnBg};color:${btnColor};border:none;border-radius:6px;cursor:pointer;font-size:1rem;`;
                    childEl.setAttribute('onclick', `if(window.Cart)window.Cart.add({name:${JSON.stringify(cartName)},price:${JSON.stringify(cartPrice)},image:${JSON.stringify(cartImage)}}, this); event.stopPropagation();`);
                  } else {
                    childEl = doc.createElement('a');
                    childEl.className = 'nav-btn';
                    childEl.innerText = cs.text || childData.props.text || 'Button';
                    childEl.href = resolvedHref;
                    const linkBg = cs.bgColor || childData.props.bgColor || 'var(--accent, #6c63ff)';
                    const linkColor = cs.color || childData.props.color || '#fff';
                    childEl.style.cssText = `padding:10px 20px;background:${linkBg};color:${linkColor};border:none;border-radius:6px;cursor:pointer;font-size:1rem;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;`;
                  }
                } else if (type === 'div' && !childData.props.html) {
                  childEl = doc.createElement('div');
                } else {
                  childEl = doc.createElement(type || 'p');
                  if (childData.props.html) { childEl.innerHTML = childData.props.html; }
                  else { childEl.innerText = cs.text || childData.props.text || ''; }
                  if (type === 'a' && childData.props.href) { childEl.href = childData.props.href; }
                }

                if (!childData.promoted) {
                    childEl.style.margin = '10px 0';
                    childEl.style.display = 'block';
                }

                el.appendChild(childEl);
                applyStylesRecursively(childEl, childPath);
              });
            }

            // Wrap in link if href is present (e.g. for non-anchor elements edited via Pen tool links)
            if (s && s.href !== undefined && s.href !== '') {
              const cleanHref = clean(s.href);
              if (el.tagName === 'A') {
                el.setAttribute('href', cleanHref);
                if (s.target) el.setAttribute('target', s.target);
              } else if (el.classList && el.classList.contains('sf-add-to-cart')) {
                // Handled in sf-add-to-cart block
              } else {
                const link = doc.createElement('a');
                link.href = cleanHref;
                if (s.target) link.target = s.target;
                const elColor = el.style.color || 'inherit';
                link.style.cssText = `color:${elColor} !important;text-decoration:none !important;`;
                while (el.firstChild) {
                  link.appendChild(el.firstChild);
                }
                el.appendChild(link);
              }
            }
          }

          Array.from(doc.body.children).forEach((child, i) => {
            applyStylesRecursively(child, i.toString());
          });
        }

        // --- 2. Recursively Inject Block Children (Container/Box) ---
        const childrenBlocks = getPageBlocks(block.id);
        if (childrenBlocks.length > 0) {
          const childrenHtml = childrenBlocks.map(child => renderBlockRecursively(child)).join('\n');
          const innerContainer = getExportChildHost(doc);

          if (innerContainer) {
             const dropHint = innerContainer.querySelector('.sf-drop-hint');
             if (dropHint) dropHint.remove();
             innerContainer.innerHTML += childrenHtml;
          } else {
             doc.body.innerHTML += childrenHtml; 
          }
        }

        // Move everything from doc.head into doc.body to ensure it's not lost when we return body.innerHTML
        // DOMParser often moves <style> and <script> tags to the head if they are in the fragment.
        while(doc.head.firstChild) {
            doc.body.appendChild(doc.head.firstChild);
        }
        finalHtml = doc.body.innerHTML;
      }

      return finalHtml;
    }

    State.sanitize();

    const rootBlocks = getPageBlocks(null); 
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

    const css = generateCSS(); 
    const hasCart = bodySections.includes('sf-add-to-cart') || bodySections.includes('sf-cart-icon-wrap') || bodySections.includes('Cart.open');
    const cartConfig = hasCart ? `<script>
      document.addEventListener('DOMContentLoaded', () => {
        if(window.Cart) {
          Cart.setConfig({
            whatsapp: '${meta.whatsapp || ''}',
            telegram: '${meta.telegram || ''}',
            currency: '${meta.currency || '₹'}',
            cartTitle: '${meta.cartTitle || 'Your Basket'}'
          });
        }
      });
    </script>` : '';

    const videoPauseScript = `<script>
      window.stopOtherMedia = (current) => {
        const allowsMultiple = (node) => {
          if (!node || typeof node.getAttribute !== 'function') return false;
          return node.getAttribute('data-allow-multiple') === 'true';
        };
        const forceStopIframe = (iframe) => {
          if (!iframe || allowsMultiple(iframe)) return;
          try {
            const src = iframe.getAttribute('src');
            if (!src) return;
            iframe.setAttribute('src', src);
          } catch (err) {}
        };
        if (allowsMultiple(current)) return;
        const players = document.querySelectorAll('video, audio');
        players.forEach(p => {
          if (p !== current && !allowsMultiple(p)) p.pause();
        });
        
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          if (iframe !== current && iframe.contentWindow !== current && !allowsMultiple(iframe)) {
            try {
              if (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be')) {
                iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
              }
              if (iframe.src.includes('vimeo.com')) {
                iframe.contentWindow.postMessage('{"method":"pause"}', '*');
              }
            } catch(err) {}
            if (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be') || iframe.src.includes('vimeo.com')) {
              setTimeout(() => forceStopIframe(iframe), 120);
            }
          }
        });

        document.querySelectorAll('[data-active-video="true"]').forEach(function(c){
          if (c !== current && c.contentWindow !== current && !allowsMultiple(c)) {
            if (c.getAttribute('data-original-html')) {
              c.innerHTML = c.getAttribute('data-original-html');
              c.removeAttribute('data-active-video');
            }
          }
        });
      };
      document.addEventListener('play', (e) => {
        if (e.target?.getAttribute?.('data-allow-multiple') === 'true') return;
        window.stopOtherMedia(e.target);
      }, true);
      window.addEventListener('message', (e) => {
        try {
          let data = e.data;
          if (typeof data === 'string') {
              if (data.includes('onStateChange') || data.includes('"event":"play"')) {
                  data = JSON.parse(data);
              } else { return; }
          }
          const sourceFrame = Array.from(document.querySelectorAll('iframe')).find((iframe) => iframe.contentWindow === e.source);
          if (sourceFrame?.getAttribute?.('data-allow-multiple') === 'true') return;
          // YouTube: {"event":"onStateChange","info":1} (1=playing)
          if (data.event === 'onStateChange' && (data.info === 1 || data.info === '1')) {
             window.stopOtherMedia(sourceFrame || e.source);
          }
          // Vimeo: {"event":"play"}
          if (data.event === 'play' || (data.method === 'onEvent' && data.event === 'play')) {
             window.stopOtherMedia(sourceFrame || e.source);
          }
        } catch(err) {}
      });
    </script>`;
    const scrollAnimationScript = `<script>
      (() => {
        const getInitial = (preset) => {
          switch (preset) {
            case 'fade-up': return { opacity: '0', transform: 'translate3d(0, 36px, 0)' };
            case 'fade-in': return { opacity: '0', transform: 'none' };
            case 'zoom-in': return { opacity: '0', transform: 'scale(0.92)' };
            case 'slide-right': return { opacity: '0', transform: 'translate3d(-42px, 0, 0)' };
            default: return { opacity: '', transform: '' };
          }
        };
        const targets = document.querySelectorAll('[data-sf-anim]');
        if (!targets.length) return;
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const preset = el.getAttribute('data-sf-anim');
            const duration = Math.max(0.2, parseFloat(el.getAttribute('data-sf-anim-duration') || '0.8') || 0.8);
            const delay = Math.max(0, parseFloat(el.getAttribute('data-sf-anim-delay') || '0') || 0);
            el.style.animation = 'sf-anim-' + preset + ' ' + duration + 's ease both';
            el.style.animationDelay = delay + 's';
            el.style.opacity = '';
            el.style.transform = '';
            observer.unobserve(el);
          });
        }, { threshold: 0.18 });
        targets.forEach((el) => {
          const preset = el.getAttribute('data-sf-anim');
          const initial = getInitial(preset);
          el.style.opacity = initial.opacity;
          el.style.transform = initial.transform;
          el.style.willChange = 'transform, opacity';
          observer.observe(el);
        });
      })();
    </script>`;

    // --- Style System: Extract inline styles into reusable CSS classes ---
    let processedBodySections = bodySections;
    let generatedUtilityCSS = '';
    if (typeof StyleSystem !== 'undefined') {
        StyleSystem.reset();
        const result = StyleSystem.processHTML(bodySections);
        processedBodySections = result.html;
        generatedUtilityCSS = result.css;
        if (window.SOCOX_DEBUG) {
            const stats = StyleSystem.getStats();
            console.log('[Export] StyleSystem:', stats);
        }
    }

    // --- Form Backend Integration: Generate scripts for form providers ---
    let formBackendScripts = '';
    if (typeof FormIntegrations !== 'undefined') {
        // Check all blocks for form configuration
        const allBlocks = State.getAllBlocks(targetPageId);
        allBlocks.forEach(block => {
            if (block.type === 'contact' && block.props.formProvider && block.props.formProvider !== 'none') {
                formBackendScripts += FormIntegrations.generateScript(block.props.formProvider, block.props.formConfig || {});
            }
        });
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(pageMeta?.title || 'My Website')}</title>
  <meta name="description" content="${escHtml(pageMeta?.description || '')}" />
  <meta name="keywords" content="${escHtml(pageMeta?.keywords || '')}" />
  ${pageMeta?.favicon ? `<link rel="icon" href="${pageMeta.favicon}" />` : ''}

  <!-- SEO & Social Sharing -->
  ${baseUrl ? `
  <link rel="canonical" href="${pageUrl || baseUrl}" />
  <meta property="og:title" content="${escHtml(pageMeta?.title || 'My Website')}" />
  <meta property="og:description" content="${escHtml(pageMeta?.description || '')}" />
  <meta property="og:url" content="${pageUrl || baseUrl}" />
  <meta property="og:image" content="${pageMeta?.favicon || pwaAssets.icon512Path}" />
  <meta name="twitter:card" content="summary_large_image" />
  ` : ''}
  
  
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${pageMeta?.fonts || 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;600;700;800&display=swap'}" rel="stylesheet" />

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css" />
  <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css" />
  
  <!-- PWA / APK Support -->
  <link rel="manifest" href="manifest.json" />
  <meta name="theme-color" content="${themeMeta.accent}" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="${escHtml(meta.title || 'My App')}" />
  <link rel="apple-touch-icon" href="${pwaAssets.icon192Path}" />

  <style>${css}
${generatedUtilityCSS}
</style>
${typeof SiteText !== 'undefined' ? SiteText.generateExportTag() : ''}

  ${pageMeta?.scripts || ''}
</head>
<body>
${processedBodySections}
${hasCart ? `<script src="js/cart.js"></script>${cartConfig}` : ''}
${formBackendScripts}
${videoPauseScript}
${scrollAnimationScript}
<script>
  document.addEventListener('click', function(event) {
    const link = event.target.closest && event.target.closest('a[href^="#"]');
    if (!link) return;
    const rawHref = (link.getAttribute('href') || '').trim();
    if (!rawHref || rawHref === '#') return;
    const targetId = rawHref.slice(1);
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;
    event.preventDefault();
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, true);

  window.__sfDeferredInstallPrompt = null;
  window.__sfPwaInstallReady = false;

  window._sfOpenPwaFallback = function(message) {
    if (document.getElementById('sf-pwa-install-modal')) {
      const modal = document.getElementById('sf-pwa-install-modal');
      const note = modal.querySelector('[data-sf-pwa-note]');
      if (note) note.textContent = message || 'Install this site as an app on desktop or mobile.';
      modal.style.display = 'flex';
      return true;
    }

    const modal = document.createElement('div');
    modal.id = 'sf-pwa-install-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(5px);font-family:Inter,Arial,sans-serif;';
    modal.innerHTML = \`
      <div style="background:#111827;color:#fff;max-width:460px;width:100%;padding:28px;border-radius:22px;position:relative;box-shadow:0 20px 50px rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.08);">
        <button onclick="this.closest('#sf-pwa-install-modal').style.display='none'" style="position:absolute;top:14px;right:14px;background:none;border:none;color:#94a3b8;font-size:24px;cursor:pointer;">&times;</button>
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
          <div style="width:58px;height:58px;border-radius:16px;background:${themeMeta.accent};display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(0,0,0,0.22);">
            <i class="fa-solid fa-download" style="font-size:26px;color:#fff;"></i>
          </div>
          <div>
            <h3 style="margin:0;font-size:1.35rem;">Install This Website App</h3>
            <p data-sf-pwa-note style="margin:6px 0 0;color:#cbd5e1;font-size:0.92rem;">\${message || 'Install this site as an app on desktop or mobile.'}</p>
          </div>
        </div>
        <div style="display:grid;gap:12px;">
          <div style="background:rgba(255,255,255,0.05);padding:14px 16px;border-radius:14px;">
            <div style="font-weight:700;margin-bottom:6px;"><i class="fa-brands fa-chrome" style="margin-right:8px;color:#60a5fa;"></i>Chrome / Edge Desktop</div>
            <div style="color:#cbd5e1;font-size:0.9rem;line-height:1.5;">Look for the install icon in the address bar, or open the browser menu and choose <b>Install app</b>.</div>
          </div>
          <div style="background:rgba(255,255,255,0.05);padding:14px 16px;border-radius:14px;">
            <div style="font-weight:700;margin-bottom:6px;"><i class="fa-brands fa-android" style="margin-right:8px;color:#4ade80;"></i>Android</div>
            <div style="color:#cbd5e1;font-size:0.9rem;line-height:1.5;">Tap the browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>.</div>
          </div>
          <div style="background:rgba(255,255,255,0.05);padding:14px 16px;border-radius:14px;">
            <div style="font-weight:700;margin-bottom:6px;"><i class="fa-brands fa-apple" style="margin-right:8px;color:#fff;"></i>iPhone / iPad</div>
            <div style="color:#cbd5e1;font-size:0.9rem;line-height:1.5;">Open in Safari, tap <b>Share</b>, then choose <b>Add to Home Screen</b>.</div>
          </div>
        </div>
      </div>
    \`;
    document.body.appendChild(modal);
    return true;
  };

  window._sfTriggerInstall = async function() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      return window._sfOpenPwaFallback('This app is already installed on this device.');
    }

    if (window.__sfDeferredInstallPrompt) {
      const promptEvent = window.__sfDeferredInstallPrompt;
      window.__sfDeferredInstallPrompt = null;
      promptEvent.prompt();
      try {
        await promptEvent.userChoice;
      } catch (err) {}
      return true;
    }

    return window._sfOpenPwaFallback(window.__sfPwaInstallReady
      ? 'Use your browser install option to add this website as an app.'
      : 'Install prompt is not available yet. Try again after the page fully loads.');
  };

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    window.__sfDeferredInstallPrompt = event;
    window.__sfPwaInstallReady = true;
  });

  window.addEventListener('appinstalled', () => {
    window.__sfDeferredInstallPrompt = null;
    window.__sfPwaInstallReady = true;
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(err => console.log('SW registration failed', err));
    });
  }
</script>
</body>
</html>`;

  }

  function generateCSS() {
    const themeVars = (typeof Themes !== 'undefined') ? Themes.buildCSSVars() : '';
    return `/* ============================================================
   Generated Stylesheet – SiteForge Export
   ============================================================ */
${themeVars}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #111827; overflow-x: hidden; }
img { max-width: 100%; display: block; }
video { max-width: 100%; display: block; }
a { text-decoration: none; color: inherit !important; }
a[style*="color"] { color: inherit; }
.block-actions, .block-toolbar, .sf-pen-tool-container, .resize-handle-v, .resize-handle-h, .resize-handle-both, .sf-sub-resize-handle, .bubble-trigger { display: none !important; }

/* Fix overlapping sticky navbars */
.sf-navbar { position: sticky; top: 0; z-index: 900; }

/* Cart badge */
.sf-cart-badge { position: absolute; top: -6px; right: -6px; background: #ef4444; color: #fff; font-size: 0.65rem; font-weight: 700; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; }

/* Global Container */
.sf-container { width: 100%; max-width: 1200px; margin-left: auto; margin-right: auto; padding-left: 20px; padding-right: 20px; }

/* Carousel / Slider */
.sf-carousel { overflow: hidden; }

/* Contact grid */
@media (max-width: 768px) {
  .sf-contact-grid, .sf-contact-form-row { grid-template-columns: 1fr !important; gap: 20px !important; }
  .sf-text-block .sf-text-inner,
  .sf-image-block .sf-image-inner,
  .sf-video-block .sf-video-inner {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  .sf-box-block > .container-inner[style*="display:grid"] {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  .sf-container-block > .container-inner,
  .sf-box-block > .container-inner[style*="display:flex"] {
    flex-direction: column !important;
    align-items: stretch !important;
    justify-content: flex-start !important;
  }
  .sf-container-block > .container-inner > *,
  .sf-box-block > .container-inner[style*="display:flex"] > * {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}

@media (max-width: 480px) {
  .sf-hero h1 { font-size: 2rem !important; }
  .sf-text-block .sf-text-inner,
  .sf-image-block .sf-image-inner,
  .sf-video-block .sf-video-inner,
  .sf-box-block > .container-inner[style*="display:grid"] {
    grid-template-columns: minmax(0, 1fr) !important;
  }
  .sf-container-block,
  .sf-image-block,
  .sf-video-block,
  .sf-text-block,
  .sf-box-block {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
  .sf-container-block > .container-inner,
  .sf-box-block > .container-inner {
    gap: 16px !important;
  }
  .sf-container-block > .container-inner > *,
  .sf-box-block > .container-inner > *,
  .sf-video-block,
  .sf-image-block {
    width: 100% !important;
    max-width: 100% !important;
  }
}
`;
  }


  function generateRobots() {
    const meta = State.getMeta();
    const baseUrl = normalizeAbsoluteBaseUrl(meta.url);
    let content = String(meta.robots || 'User-agent: *\nAllow: /').replace(/\r\n/g, '\n').trim();
    if (!content) content = 'User-agent: *\nAllow: /';
    if (baseUrl && !/^sitemap:/im.test(content)) {
      content += `\n\nSitemap: ${baseUrl}sitemap.xml`;
    }
    return content.endsWith('\n') ? content : `${content}\n`;
  }

  function generateSitemap() {
    const meta = State.getMeta();
    const pages = State.getPages()
      .filter((page) => page && page.filename)
      .filter((page, index, arr) => arr.findIndex((p) => p.filename === page.filename) === index);
    const baseUrl = normalizeAbsoluteBaseUrl(meta.url);
    const now = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    if (baseUrl) {
      pages.forEach(p => {
        const loc = p.filename === 'index.html' ? baseUrl : `${baseUrl}${p.filename}`;
        xml += `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n    <lastmod>${now}</lastmod>\n    <priority>${p.filename === 'index.html' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
      });
    }

    xml += `</urlset>`;
    return xml;
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

    showToast('🚀 Generating your website ZIP...', 'info');

    // Wait 500ms so UI/Toast can render
    await new Promise(r => setTimeout(r, 500));

    const zip = new JSZip();
    const meta = State.getMeta();
    const pages = State.getPages();
    const pwaAssets = buildPwaAssets(meta);
    const currentPageId = State.getCurrentPageId();
    
    // Export each page using the CANVAS SNAPSHOT (same as preview)
    // --- Build asset map FIRST (data URLs -> file paths) ---
    const dataUrlMap = new Map();
    let assetIndex = 0;

    // Collect data URLs from AssetManager and map them to their clean paths
    if (typeof AssetManager !== 'undefined') {
        const allAssets = AssetManager.getAll();
        allAssets.forEach(asset => {
            if (!asset.dataUrl || !asset.dataUrl.startsWith('data:')) return;
            if (dataUrlMap.has(asset.dataUrl)) return;
            // Use the asset's own path if available, otherwise generate one
            const filename = asset.path || (() => {
                const ext = asset.type?.includes('png') ? 'png' : asset.type?.includes('gif') ? 'gif' : asset.type?.includes('svg') ? 'svg' : 'webp';
                const safeName = (asset.name || 'image').replace(/[^a-z0-9_.-]/gi, '_').replace(/\.[^.]+$/, '');
                return `assets/img/${safeName}_${assetIndex}.${ext}`;
            })();
            assetIndex++;
            const base64Data = asset.dataUrl.split(',')[1];
            if (base64Data) {
                zip.file(filename, base64Data, { base64: true });
                dataUrlMap.set(asset.dataUrl, filename);
            }
        });
    }

    // Helper: find and extract ALL data URLs from HTML, add to zip, return replaced HTML
    function extractAndReplaceDataUrls(html) {
        if (!html) return html;
        // Match data:image/xxx;base64,... patterns in src="..." or url(...)
        const dataUrlRegex = /data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g;
        let match;
        const found = new Set();
        while ((match = dataUrlRegex.exec(html)) !== null) {
            found.add(match[0]);
        }
        
        let result = html;
        found.forEach(dataUrl => {
            if (dataUrlMap.has(dataUrl)) {
                // Already mapped
                result = result.split(dataUrl).join(dataUrlMap.get(dataUrl));
            } else {
                // New data URL found in HTML — extract it
                const mimeMatch = dataUrl.match(/data:image\/([^;]+);/);
                const ext = mimeMatch ? (mimeMatch[1] === 'jpeg' ? 'jpg' : mimeMatch[1]) : 'webp';
                const filename = `assets/img/image_${assetIndex}.${ext}`;
                assetIndex++;
                const base64Data = dataUrl.split(',')[1];
                if (base64Data) {
                    zip.file(filename, base64Data, { base64: true });
                    dataUrlMap.set(dataUrl, filename);
                    result = result.split(dataUrl).join(filename);
                }
            }
        });
        return result;
    }

    // For the current page, snapshot directly. For other pages, switch, render, snapshot, switch back.
    for (const page of pages) {
        if (page.id === currentPageId) {
            zip.file(page.filename, extractAndReplaceDataUrls(getCanvasSnapshotHTML(page.id)));
        } else {
            State.switchPage(page.id);
            if (typeof RenderScheduler !== 'undefined') RenderScheduler.flushSync();
            else if (typeof Canvas !== 'undefined' && Canvas.renderAll) Canvas.renderAll();
            await new Promise(r => setTimeout(r, 100));
            zip.file(page.filename, extractAndReplaceDataUrls(getCanvasSnapshotHTML(page.id)));
        }
    }
    // Switch back to original page
    if (State.getCurrentPageId() !== currentPageId) {
        State.switchPage(currentPageId);
        if (typeof RenderScheduler !== 'undefined') RenderScheduler.flushSync();
    }

    zip.file('css/style.css', generateCSS());
    zip.file('robots.txt', generateRobots());
    zip.file('sitemap.xml', generateSitemap());
    zip.file('README.md', generateReadme(State.getMeta()));

    try {
        const cartContent = await (await fetch('js/cart.js')).text();
        zip.file('js/cart.js', cartContent);
    } catch(e) {
        console.warn('Could not fetch cart.js for export');
    }
    
    zip.file(pwaAssets.icon192Path, pwaAssets.icon192Base64, { base64: true });
    zip.file(pwaAssets.icon512Path, pwaAssets.icon512Base64, { base64: true });

    // PWA Manifest and SW
    const baseUrl = normalizeAbsoluteBaseUrl(meta.url);
    const themeMeta = getThemeMeta();
    const manifestStartUrl = './index.html';
    const manifest = {
      "name": meta.title || "My Website",
      "short_name": (meta.title || "My App").slice(0, 12),
      "start_url": manifestStartUrl,
      "scope": "./",
      "display": "standalone",
      "orientation": "any",
      "background_color": themeMeta.bg,
      "theme_color": themeMeta.accent,
      "icons": [
        { "src": pwaAssets.icon192Path, "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
        { "src": pwaAssets.icon512Path, "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
      ]
    };
    if (baseUrl) manifest.id = baseUrl;
    zip.file("manifest.json", JSON.stringify(manifest, null, 2));
    
    const staticAssets = [
      './',
      './manifest.json',
      './robots.txt',
      './sitemap.xml',
      './sw.js',
      './css/style.css',
      './js/cart.js',
      './assets/icon-192.png',
      './assets/icon-512.png',
      ...pages.map(page => `./${page.filename}`)
    ];

    const swContent = `
      const CACHE_NAME = 'siteforge-export-v2';
      const ASSETS = ${JSON.stringify(staticAssets)};

      self.addEventListener('install', (event) => {
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
        );
      });

      self.addEventListener('activate', (event) => {
        event.waitUntil(
          caches.keys().then((keys) => Promise.all(keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()))).then(() => self.clients.claim())
        );
      });

      self.addEventListener('fetch', (event) => {
        const request = event.request;
        if (request.method !== 'GET') return;

        if (request.mode === 'navigate') {
          event.respondWith(
            fetch(request).catch(() => caches.match('./index.html'))
          );
          return;
        }

        event.respondWith(
          caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
              return response;
            });
          })
        );
      });
    `;
    zip.file("sw.js", swContent);
    
    const projectData = {
      version: State.SCHEMA_VERSION || 2,
      exportedAt: new Date().toISOString(),
      blocks: State.getAllBlocks('all'),
      pages: State.getPages(),
      meta: State.getMeta(),
      theme: State.getTheme()
    };
    zip.file('project.json', JSON.stringify(projectData, null, 2));

    const blob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        if (metadata.percent > 1 && metadata.percent < 99) {
            showToast(`📦 Packaging ZIP: ${Math.round(metadata.percent)}%`, 'info');
        }
    });
    const filename = 'my-website.zip';

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    showToast('Exported: ' + filename, 'success');
  }

  async function getPreviewHTML(pageId = null) {
    const currentPageId = State.getCurrentPageId();
    const resolvedPageId = pageId || currentPageId;

    // If requesting the CURRENT page, use the canvas snapshot (WYSIWYG — exact match)
    if (!resolvedPageId || resolvedPageId === currentPageId) {
      return getCanvasSnapshotHTML(resolvedPageId);
    }

    // For a DIFFERENT page, switch the page, render, capture snapshot, and stay on that page.
    // The preview UI tracks the original page and will restore it when closed.
    State.switchPage(resolvedPageId);
    if (typeof RenderScheduler !== 'undefined') RenderScheduler.flushSync();
    else if (typeof Canvas !== 'undefined' && Canvas.renderAll) Canvas.renderAll();
    
    // Give a short timeout for the DOM/canvas to render fully before capturing
    await new Promise(r => setTimeout(r, 100));

    return getCanvasSnapshotHTML(resolvedPageId);
  }


  /**
   * CANVAS SNAPSHOT EXPORT
   * Serializes the EXACT rendered canvas DOM + FULL runtime environment.
   * Includes ALL assets the canvas uses: icons, fonts, CSS, scripts.
   * What you see in the editor IS what you get — guaranteed.
   */
  function getCanvasSnapshotHTML(pageId = null) {
    const meta = State.getMeta();
    const targetPageId = pageId || State.getCurrentPageId();
    const canvas = document.getElementById('canvas');
    if (!canvas) return generateHTML(targetPageId); // fallback

    // Clone the entire canvas DOM
    const clone = canvas.cloneNode(true);

    // Remove ALL editor-only elements
    const editorSelectors = [
        '.block-actions',
        '.block-toolbar', 
        '.resize-handle-v',
        '.resize-handle-h',
        '.resize-handle-both',
        '.sf-pen-tool-container',
        '.sf-sub-resize-handle',
        '.sf-drop-hint',
        '.sf-link-toolbar',
        '#canvas-empty-state',
        '.bubble-trigger'
    ];
    editorSelectors.forEach(sel => {
        clone.querySelectorAll(sel).forEach(el => el.remove());
    });

    // Apply links FIRST (before removing data-id attributes)
    // Wrap elements that have href in subStyles with <a> tags
    const liveCanvas = document.getElementById('canvas');
    const allBlocks = State.getAllBlocks(targetPageId);
    allBlocks.forEach(block => {
        if (!block.props.subStyles) return;
        Object.entries(block.props.subStyles).forEach(([path, style]) => {
            if (!style.href) return;
            const blockWrapper = clone.querySelector(`[data-id="${block.id}"]`) || clone.querySelector(`#block_${block.id}`);
            if (!blockWrapper) return;
            const targetEl = blockWrapper.querySelector(`[data-sf-path="${path}"]`);
            if (!targetEl) return;
            
            const liveBlockEl = liveCanvas?.querySelector(`#block_${block.id}`);
            const liveEl = liveBlockEl?.querySelector(`[data-sf-path="${path}"]`);
            const liveColor = liveEl ? window.getComputedStyle(liveEl).color : '';
            
            if (targetEl.tagName === 'A') {
                targetEl.setAttribute('href', style.href);
                if (style.target) targetEl.setAttribute('target', style.target);
                return;
            }
            const link = document.createElement('a');
            link.href = style.href;
            if (style.target) link.target = style.target;
            const finalColor = liveColor || targetEl.style.color || 'inherit';
            link.style.cssText = `color:${finalColor} !important;text-decoration:none !important;`;
            while (targetEl.firstChild) {
                link.appendChild(targetEl.firstChild);
            }
            targetEl.appendChild(link);
            if (liveColor) {
                targetEl.style.setProperty('color', liveColor, 'important');
            }
        });
    });

    // Remove editor-only classes and clean wrapper divs
    clone.querySelectorAll('.canvas-block').forEach(el => {
        el.classList.remove('canvas-block', 'selected', 'dragging');
        el.removeAttribute('data-id');
        el.removeAttribute('data-type');
        // Remove the id="block_xxx" that's editor-only
        if (el.id && el.id.startsWith('block_')) el.removeAttribute('id');
    });

    // Remove editor-only attributes
    clone.querySelectorAll('[data-sf-editing]').forEach(el => el.removeAttribute('data-sf-editing'));
    clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    clone.querySelectorAll('[draggable]').forEach(el => el.removeAttribute('draggable'));
    // Remove sub-selection class that hides elements via export CSS
    clone.querySelectorAll('.sf-sub-selected').forEach(el => el.classList.remove('sf-sub-selected'));

    // Get the cleaned HTML body content
    const bodyContent = clone.innerHTML;
    
    // DEBUG: Log if heading is missing
    if (window.SOCOX_DEBUG && !bodyContent.includes('polished')) {
        console.error('[Export] Heading text missing from snapshot!');
        console.log('Clone HTML length:', bodyContent.length);
        console.log('First 500 chars:', bodyContent.substring(0, 500));
    }

    // === RUNTIME ENVIRONMENT: Exact same assets as editor canvas ===
    
    // 1. Collect ALL <link> stylesheets from the editor (fonts, icons, etc.)
    const runtimeCSS = [];
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        // Skip editor-only CSS
        if (href && !href.includes('builder.css')) {
            runtimeCSS.push(`<link rel="stylesheet" href="${href}" />`);
        }
    });
    
    // 2. Collect preconnect hints
    const preconnects = [];
    document.querySelectorAll('link[rel="preconnect"]').forEach(link => {
        preconnects.push(link.outerHTML);
    });

    // 3. Theme CSS (from active theme style tag, remove #canvas scoping)
    const themeStyleEl = document.getElementById('sf-theme-style');
    let themeCSS = '';
    if (themeStyleEl) {
        themeCSS = themeStyleEl.textContent
            .replace(/#canvas\s+/g, '')
            .replace(/#canvas/g, 'body')
            .replace(/#canvasFrame/g, 'body');
    }

    // 4. Site Text styles (from the runtime style tag)
    const siteTextStyleEl = document.getElementById('sf-site-text-styles');
    let siteTextCSS = '';
    if (siteTextStyleEl) {
        siteTextCSS = siteTextStyleEl.textContent
            .replace(/#canvas\s*\.block-content\s*/g, '')
            .replace(/#canvas\s*\.block-content/g, '');
    }

    // 5. Site Text runtime script (for color overrides)
    const siteTextTag = typeof SiteText !== 'undefined' ? SiteText.generateExportTag() : '';

    // 6. Collect inline <style> tags from canvas blocks (navbar responsive, etc.)
    let blockStyles = '';
    clone.querySelectorAll('style').forEach(styleEl => {
        // Keep block-generated styles but remove #canvasFrame scoping
        let css = styleEl.textContent;
        css = css.replace(/#canvasFrame\.mobile\s*/g, '@media(max-width:768px){ ').replace(/#canvasFrame\.tablet\s*/g, '@media(max-width:1024px){ ');
        css = css.replace(/#canvasFrame/g, '');
        styleEl.textContent = css;
    });

    // 7. Base CSS (resets + responsive)
    const baseCSS = generateCSS();

    // Build the full HTML document with COMPLETE runtime
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(meta.title || 'My Website')}</title>
  <meta name="description" content="${escHtml(meta.description || '')}" />
  <meta name="keywords" content="${escHtml(meta.keywords || '')}" />
  ${meta.favicon ? `<link rel="icon" href="${meta.favicon}" />` : ''}
  ${preconnects.join('\n  ')}
  ${runtimeCSS.join('\n  ')}
  <style>
${baseCSS}
${themeCSS}
${siteTextCSS}
  </style>
  ${siteTextTag}
  ${meta.scripts || ''}
</head>
<body style="margin:0;padding:0;font-family:'Inter',sans-serif;">
${bodyContent}
${(() => {
    // Form backend scripts for preview
    let formScripts = '';
    if (typeof FormIntegrations !== 'undefined') {
        const allBlocks = State.getAllBlocks(targetPageId);
        allBlocks.forEach(block => {
            if (block.type === 'contact' && block.props.formProvider && block.props.formProvider !== 'none') {
                formScripts += FormIntegrations.generateScript(block.props.formProvider, block.props.formConfig || {});
            }
        });
    }
    return formScripts;
})()}
<script>
// Scroll animations
(function(){
  var targets = document.querySelectorAll('[data-sf-anim]');
  if (!targets.length) return;
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var preset = el.getAttribute('data-sf-anim');
      var duration = Math.max(0.2, parseFloat(el.getAttribute('data-sf-anim-duration') || '0.8'));
      var delay = Math.max(0, parseFloat(el.getAttribute('data-sf-anim-delay') || '0'));
      el.style.animation = 'sf-anim-' + preset + ' ' + duration + 's ease both';
      el.style.animationDelay = delay + 's';
      el.style.opacity = '';
      el.style.transform = '';
      observer.unobserve(el);
    });
  }, {threshold:0.18});
  targets.forEach(function(el){
    var preset = el.getAttribute('data-sf-anim');
    var initials = {
      'fade-up': {opacity:'0',transform:'translate3d(0,36px,0)'},
      'fade-in': {opacity:'0',transform:'none'},
      'zoom-in': {opacity:'0',transform:'scale(0.92)'},
      'slide-right': {opacity:'0',transform:'translate3d(-42px,0,0)'}
    };
    var init = initials[preset] || {};
    if (init.opacity) el.style.opacity = init.opacity;
    if (init.transform) el.style.transform = init.transform;
    el.style.willChange = 'transform, opacity';
    observer.observe(el);
  });
})();
</script>
${(bodyContent.includes('sf-add-to-cart') || bodyContent.includes('Cart.open') || bodyContent.includes('sf-cart-icon-wrap')) ? `<script src="js/cart.js"><\/script><script>document.addEventListener('DOMContentLoaded',function(){if(window.Cart){Cart.setConfig({whatsapp:'${(State.getMeta().whatsapp||'').replace(/'/g,"\\'")}',telegram:'${(State.getMeta().telegram||'').replace(/'/g,"\\'")}',currency:'${(State.getMeta().currency||'₹').replace(/'/g,"\\'")}',cartTitle:'${(State.getMeta().cartTitle||'Your Basket').replace(/'/g,"\\'")}'});}});<\/script>` : ''}
</body>
</html>`;
  }

  return { exportZIP, getPreviewHTML, getCanvasSnapshotHTML, generateHTML, generateCSS };
})();
