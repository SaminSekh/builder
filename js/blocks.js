// ============================================================
// blocks.js – Block type definitions and HTML renderers
// ============================================================

const VideoHelper = {
  isDirectVideo(url) {
    if (!url) return false;
    const directExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return directExtensions.some(ext => url.toLowerCase().split('?')[0].endsWith(ext));
  },
  getEmbedUrl(url) {
    if (!url) return '';
    if (this.isDirectVideo(url)) return url;
    // Google Drive
    if (url.includes('drive.google.com')) {
      const match = url.match(/(?:\/d\/|\/folders\/|\?id=|&id=)([\w-]{25,})/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    // YouTube
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let vid = '';
        if (url.includes('list=')) {
          const listId = url.split('list=')[1].split('&')[0];
          return `https://www.youtube.com/embed/videoseries?list=${listId}&enablejsapi=1`;
        }
        if (url.includes('v=')) vid = url.split('v=')[1].split('&')[0];
        else if (url.includes('embed/')) vid = url.split('embed/')[1].split('/')[0].split('?')[0];
        else vid = url.trim().replace(/\/$/, '').split('/').pop().split('?')[0];
        return `https://www.youtube.com/embed/${vid}?enablejsapi=1`;
      }
    // Dailymotion
    if (url.includes('dailymotion.com') || url.includes('dai.ly')) {
      const vid = url.split('/').pop().split('_')[0];
      return `https://www.dailymotion.com/embed/video/${vid}`;
    }
    // Vimeo
    if (url.includes('vimeo.com')) {
      const vid = url.split('/').pop();
      return `https://player.vimeo.com/video/${vid}?api=1`;
    }
    // TikTok
    if (url.includes('tiktok.com')) {
      const vid = url.split('/video/')[1]?.split('?')[0];
      if (vid) return `https://www.tiktok.com/embed/v2/${vid}`;
    }
    // Facebook
    if (url.includes('facebook.com')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560`;
    }
    return url; // Fallback to raw URL
  }
};

const MediaLayoutHelper = {
  getColumns(count) {
    if (count <= 1) return 1;
    if (count === 2) return 2;
    if (count === 4) return 2;
    return 3;
  },
  imageItemsFromProps(props) {
    if (Array.isArray(props.items) && props.items.length) return props.items;
    return [{
      src: props.src,
      alt: props.alt,
      caption: props.caption,
      description: props.description,
      rating: props.rating
    }];
  },
  videoItemsFromProps(props) {
    if (Array.isArray(props.items) && props.items.length) return props.items;
    return [{
      url: props.url,
      thumb: props.thumb,
      title: props.title,
      description: props.description,
      rating: props.rating,
      autoplay: props.autoplay
    }];
  }
};

const BlockTypes = {

  navbar: {
    label: 'Navbar',
    icon: 'fa-solid fa-bars',
    category: 'Navigation',
    defaultProps: {
      navStyle: 'classic',
      brand: 'MySite',
      logo: '',
      bgColor: '#1a1a2e',
      textColor: '#ffffff',
      links: [
        { label: 'Home', href: '#home' },
        { label: 'About', href: '#about' },
        { label: 'Services', href: '#services' },
        { label: 'Contact', href: '#contact' }
      ],
      navPosition: 'sticky',
      sticky: true,
      showButton: true,
      buttonText: 'Get Started',
      buttonHref: '#contact',
      buttonColor: '#6c63ff',
      showCart: true,
      whatsapp: '',
      telegram: '',
      showApk: true,
      apkShowDesktop: true,
      apkShowMobile: true,
      customId: '',
      customClass: '',
      // Layout
      width: '100%',
      height: 'auto',
      margin: '0',
      padding: '12px 32px',
      align: 'center',
      display: 'flex',
      justify: 'space-between',
      gap: '24px'
    },
    render(props) {
      const uid = props.customId || 'nav_' + Math.random().toString(36).substr(2, 9);
      const navStyle = props.navStyle || 'classic';
      const navPosition = props.navPosition || (props.sticky === false ? 'static' : 'sticky');
      const logo = props.logo ? `<img src="${props.logo}" alt="logo" style="height:36px;margin-right:8px;"/>` : '';
      const btn = props.showButton ? `<a href="${props.buttonHref || '#'}" class="nav-btn" style="background:${props.buttonColor};color:#fff;padding:8px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:0.85rem;transition:opacity .2s;" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">${props.buttonText}</a>` : '';
      
      const cartHtml = props.showCart ? `
        <div class="sf-cart-trigger" onclick="if(window.Cart)Cart.open()" style="position:relative;cursor:pointer;color:${props.textColor};padding:8px;z-index:902;display:flex;align-items:center;">
          <i class="fa-solid fa-basket-shopping fa-lg"></i>
          <span class="sf-cart-badge" style="display:none;">0</span>
        </div>` : '';

      const wrapperMap = {
        classic: {
          shell: `width:100%;display:flex;align-items:center;justify-content:space-between;gap:${props.gap || '24px'};`,
          brand: `display:flex;align-items:center;gap:8px;z-index:902;`,
          brandText: `color:${props.textColor};font-size:1.25rem;font-weight:700;`,
          linksWrap: `display:flex;align-items:center;gap:inherit;flex-wrap:wrap;`,
          links: `display:flex;gap:24px;`,
          actions: `display:flex;align-items:center;gap:16px;`,
          navExtra: 'box-shadow:0 2px 10px rgba(0,0,0,.2);'
        },
        editorial: {
          shell: `max-width:1180px;margin:0 auto;padding:12px 18px;border-radius:999px;border:1px solid rgba(15,23,42,.09);background:rgba(255,255,255,.88);box-shadow:0 18px 40px rgba(15,23,42,.08);backdrop-filter:blur(14px);display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:${props.gap || '24px'};`,
          brand: `display:flex;align-items:center;gap:8px;z-index:902;padding-left:8px;`,
          brandText: `color:${props.textColor};font-size:1rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;`,
          linksWrap: `display:flex;align-items:center;justify-content:center;gap:inherit;`,
          links: `display:flex;align-items:center;justify-content:center;gap:12px;padding:6px;border-radius:999px;background:rgba(15,23,42,.04);`,
          actions: `display:flex;align-items:center;justify-content:flex-end;gap:12px;padding-right:8px;`,
          navExtra: ''
        },
        app: {
          shell: `max-width:1220px;margin:0 auto;padding:14px 18px;border-radius:24px;border:1px solid rgba(255,255,255,.16);background:linear-gradient(135deg, rgba(15,23,42,.5), rgba(76,29,149,.32));box-shadow:0 24px 60px rgba(15,23,42,.25);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:space-between;gap:${props.gap || '20px'};`,
          brand: `display:flex;align-items:center;gap:10px;z-index:902;`,
          brandText: `color:${props.textColor};font-size:1.15rem;font-weight:700;`,
          linksWrap: `display:flex;align-items:center;gap:inherit;flex-wrap:wrap;`,
          links: `display:flex;align-items:center;gap:18px;padding:8px 16px;border-radius:999px;background:rgba(255,255,255,.08);`,
          actions: `display:flex;align-items:center;gap:14px;`,
          navExtra: 'box-shadow:none;'
        }
      };
      const chrome = wrapperMap[navStyle] || wrapperMap.classic;
      const brandBadge = navStyle === 'app'
        ? `<span style="width:10px;height:10px;border-radius:50%;background:${props.buttonColor || '#14b8a6'};box-shadow:0 0 0 6px rgba(20,184,166,.14);display:inline-block;"></span>`
        : '';
      const linkBase = navStyle === 'editorial'
        ? `color:${props.textColor};text-decoration:none;font-weight:600;transition:all .2s;padding:10px 16px;border-radius:999px;`
        : `color:${props.textColor};text-decoration:none;font-weight:${navStyle === 'app' ? '600' : '500'};transition:opacity .2s;`;
      const buttonStyle = navStyle === 'app'
        ? `background:${props.buttonColor};color:#08111f;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:700;font-size:0.85rem;transition:transform .2s,opacity .2s;box-shadow:0 12px 30px rgba(20,184,166,.28);`
        : navStyle === 'editorial'
          ? `background:${props.buttonColor};color:#fff;padding:9px 18px;border-radius:999px;text-decoration:none;font-weight:600;font-size:0.82rem;transition:opacity .2s;`
          : `background:${props.buttonColor};color:#fff;padding:8px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:0.85rem;transition:opacity .2s;`;
      const styledBtn = props.showButton ? `<a href="${props.buttonHref || '#'}" class="nav-btn" style="${buttonStyle}" onmouseover="${navStyle === 'app' ? "this.style.transform='translateY(-1px)';this.style.opacity='.92'" : "this.style.opacity='.85'"}" onmouseout="${navStyle === 'app' ? "this.style.transform='translateY(0)';this.style.opacity='1'" : "this.style.opacity='1'"}">${props.buttonText}</a>` : '';
      const positionStyleMap = {
        static: '',
        relative: 'position:relative;z-index:900;',
        absolute: 'position:absolute;top:0;left:0;right:0;z-index:900;',
        fixed: 'position:fixed;top:0;left:0;right:0;z-index:900;',
        sticky: 'position:sticky;top:0;z-index:900;'
      };
      const positionStyle = positionStyleMap[navPosition] || positionStyleMap.sticky;
      const builderPositionOverride = navPosition === 'fixed'
        ? `
#canvasFrame #${uid},
#canvasFrame.tablet #${uid},
#canvasFrame.mobile #${uid} {
  position: sticky !important;
  top: 0 !important;
  left: auto !important;
  right: auto !important;
  width: 100% !important;
}
`
        : '';

      return `<nav id="${uid}" class="sf-navbar ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)} overflow-x:clip; ${positionStyle}${chrome.navExtra}">
  <div class="sf-navbar-shell" style="${chrome.shell}">
  <div style="${chrome.brand}">
    ${brandBadge}${logo}<span style="${chrome.brandText}">${props.brand}</span>
  </div>
  
  <div class="hamburger" onclick="this.closest('nav').classList.toggle('mobile-open')" style="display:none;flex-direction:column;gap:5px;cursor:pointer;z-index:1001;padding:10px;">
    <span class="line line-1" style="width:25px;height:3px;background:${props.textColor};border-radius:2px;transition:0.3s;"></span>
    <span class="line line-2" style="width:25px;height:3px;background:${props.textColor};border-radius:2px;transition:0.3s;"></span>
    <span class="line line-3" style="width:25px;height:3px;background:${props.textColor};border-radius:2px;transition:0.3s;"></span>
  </div>

  <div class="nav-links-container" style="${chrome.linksWrap}">
    <div class="nav-links" style="${chrome.links}">
      ${(props.links || []).map((link, i) => {
        const path = `links.${i}`;
        const base = linkBase;
        return `<a href="${link.href || '#'}" class="nav-link" data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, base)}"
           onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">${link.label}</a>`;
      }).join('')}
      ${props.showApk ? `<a href="javascript:void(0)" class="nav-link apk-install-btn${!props.apkShowDesktop ? ' apk-hide-desktop' : ''}${!props.apkShowMobile ? ' apk-hide-mobile' : ''}" style="color:${props.textColor};text-decoration:none;font-weight:600;display:flex;align-items:center;gap:6px;${navStyle === 'app' ? 'padding:10px 14px;border-radius:999px;background:rgba(255,255,255,.08);' : ''}" onclick="window._sfShowApkInfo?.()">
          <i class="fa-solid fa-mobile-screen-button"></i> APK
        </a>` : ''}
    </div>
    <div class="nav-actions-wrap" style="${chrome.actions}">
        ${cartHtml}
        <div class="nav-actions">${styledBtn}</div>
    </div>
  </div>
  </div>
  <script>
    if (window.Cart) {
        Cart.setConfig({
            whatsapp: '${props.whatsapp || ''}',
            telegram: '${props.telegram || ''}'
        });
    }
    if (!window._sfShowApkInfo) {
      window._sfShowApkInfo = async function() {
        if (window._sfTriggerInstall) {
          try {
            const handled = await window._sfTriggerInstall();
            if (handled) return;
          } catch (err) {}
        }
        if (document.getElementById('sf-apk-modal')) {
          document.getElementById('sf-apk-modal').style.display = 'flex';
          return;
        }
        const modal = document.createElement('div');
        modal.id = 'sf-apk-modal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(5px);font-family:sans-serif;';
        modal.innerHTML = \`
          <div style="background:#1a1a2e;color:#fff;max-width:400px;width:100%;padding:32px;border-radius:20px;position:relative;box-shadow:0 20px 50px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);">
            <button onclick="this.parentElement.parentElement.style.display='none'" style="position:absolute;top:16px;right:16px;background:none;border:none;color:#aaa;font-size:24px;cursor:pointer;">&times;</button>
            <div style="text-align:center;margin-bottom:24px;">
              <div style="width:64px;height:64px;background:#6c63ff;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 8px 16px rgba(108,99,255,0.3);">
                <i class="fa-solid fa-mobile-screen-button" style="font-size:32px;"></i>
              </div>
              <h3 style="font-size:1.5rem;margin:0;">Install as App</h3>
              <p style="font-size:0.9rem;color:#aaa;margin-top:8px;">Convert this site to a native-like APK experience (PWA).</p>
            </div>
            <div style="background:rgba(255,255,255,0.05);padding:16px;border-radius:12px;margin-bottom:16px;">
              <p style="font-size:0.9rem;font-weight:600;margin-bottom:8px;"><i class="fa-brands fa-android" style="color:#3DDC84;"></i> For Android / Chrome</p>
              <p style="font-size:0.85rem;color:#ccc;line-height:1.4;">Tap the 3 dots (⋮) and select <b>'Install App'</b> or <b>'Add to Home Screen'</b>.</p>
            </div>
            <div style="background:rgba(255,255,255,0.05);padding:16px;border-radius:12px;">
              <p style="font-size:0.9rem;font-weight:600;margin-bottom:8px;"><i class="fa-brands fa-apple" style="color:#fff;"></i> For iPhone / Safari</p>
              <p style="font-size:0.85rem;color:#ccc;line-height:1.4;">Tap the <b>'Share'</b> icon at the bottom and select <b>'Add to Home Screen'</b>.</p>
            </div>
            <button onclick="this.parentElement.parentElement.style.display='none'" style="width:100%;margin-top:24px;padding:12px;background:#6c63ff;color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">Close</button>
          </div>
        \`;
        document.body.appendChild(modal);
      };
    }
  </script>
</nav>

<style>
${builderPositionOverride}
/* Exported Media Query */
@media (max-width: 768px) {
  #${uid} .sf-navbar-shell { display:flex !important; justify-content:space-between !important; align-items:center !important; width:100% !important; max-width:100% !important; box-sizing:border-box !important; }
  #${uid} .hamburger { display: flex !important; }
  #${uid} .nav-links-container {
    display:flex !important;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: auto;
    max-width: none;
    height: 100vh;
    background: ${props.bgColor};
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
    z-index: 901;
    gap: 40px !important;
    padding: 40px 24px;
    box-sizing: border-box;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    overflow-y: auto;
    transform: translate3d(100%, 0, 0);
  }
  #${uid}.mobile-open .nav-links-container { transform: translate3d(0, 0, 0); opacity: 1; visibility: visible; pointer-events: auto; }
  #${uid} .nav-links { display:flex !important; width:100%; flex-direction: column; align-items: center; justify-content: center; gap: 30px !important; background: transparent !important; padding: 0 !important; }
  #${uid} .nav-links-container .nav-link { width:100%; max-width:320px; justify-content:center; text-align:center; }
  #${uid} .nav-actions-wrap { display:flex !important; width:100%; flex-direction:column; align-items:center; justify-content:center; gap:16px !important; padding:0 !important; }
  #${uid} .nav-actions { display:flex !important; justify-content:center; }
  
  /* X Close Animation */
  #${uid}.mobile-open .line-1 { transform: translateY(8px) rotate(45deg); }
  #${uid}.mobile-open .line-2 { opacity: 0; }
  #${uid}.mobile-open .line-3 { transform: translateY(-8px) rotate(-45deg); }
  /* APK Mobile Visibility */
  #${uid} .apk-hide-mobile { display: none !important; }
}
@media (min-width: 769px) {
  /* APK Desktop Visibility */
  #${uid} .apk-hide-desktop { display: none !important; }
}

/* Builder-specific Mobile Mode */
#canvasFrame.mobile #${uid} .sf-navbar-shell {
    display:flex !important;
    justify-content:space-between !important;
    align-items:center !important;
    width:100% !important;
    max-width:100% !important;
    box-sizing:border-box !important;
}
#canvasFrame.mobile #${uid} .hamburger { display: flex !important; }
#canvasFrame.mobile #${uid} .nav-links-container {
    display:flex !important;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: auto;
    max-width: none;
    height: 100vh;
    background: ${props.bgColor};
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
    z-index: 901;
    gap: 30px !important;
    padding: 28px 18px;
    box-sizing: border-box;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    overflow-y: auto;
    transform: translate3d(100%, 0, 0);
}
#canvasFrame.mobile #${uid}.mobile-open .nav-links-container { transform: translate3d(0, 0, 0); opacity: 1; visibility: visible; pointer-events: auto; }
#canvasFrame.mobile #${uid} .nav-links { display:flex !important; width:100%; flex-direction: column; align-items: center; justify-content: center; gap: 20px !important; background: transparent !important; padding: 0 !important; }
#canvasFrame.mobile #${uid} .nav-links-container .nav-link { width:100%; max-width:320px; justify-content:center; text-align:center; }
#canvasFrame.mobile #${uid} .nav-actions-wrap { display:flex !important; width:100%; flex-direction:column; align-items:center; justify-content:center; gap:16px !important; padding:0 !important; }
#canvasFrame.mobile #${uid} .nav-actions { display:flex !important; justify-content:center; }
#canvasFrame.mobile #${uid}.mobile-open .line-1 { transform: translateY(8px) rotate(45deg); }
#canvasFrame.mobile #${uid}.mobile-open .line-2 { opacity: 0; }
#canvasFrame.mobile #${uid}.mobile-open .line-3 { transform: translateY(-8px) rotate(-45deg); }
/* APK Builder Canvas Mobile/Desktop visibility */
#canvasFrame.mobile #${uid} .apk-hide-mobile { display: none !important; }
#canvasFrame.desktop #${uid} .apk-hide-desktop { display: none !important; }
#canvasFrame.tablet #${uid} .apk-hide-desktop { display: none !important; }
</style>`;
    }
  },


  hero: {
    label: 'Hero / Header',
    icon: 'fa-solid fa-star',
    category: 'Sections',
    defaultProps: {
      title: 'Design Your Future',
      subtitle: 'Build stunning, responsive websites in minutes with our intuitive drag-and-drop platform.',
      ctaText: 'Start Building',
      ctaHref: '#',
      cta2Text: 'Learn More',
      cta2Href: '#',
      minHeight: '80vh',
      padding: '100px 32px',
      bgColor: '#12122b',
      bgImage: '',
      textColor: '#ffffff',
      accentColor: '#6c63ff',
      titleSize: '3.5rem',
      subtitleSize: '1.25rem',
      titleAlign: 'center',
      subtitleAlign: 'center',
      ctaAlign: 'center',
      titleAlign: 'center',
      subtitleAlign: 'center',
      ctaAlign: 'center',
      titleWeight: '800',
      fontFamily: 'Inter, sans-serif',
      customId: '',
      customClass: '',
      // Layout
      width: '100%',
      height: 'auto',
      margin: '0',
      display: 'flex'
    },
    render(props) {
      const uid = props.customId || props.id || 'home';
      const bg = props.bgImage ? `background: linear-gradient(rgba(18, 18, 43, 0.7), rgba(18, 18, 43, 0.7)), url(${props.bgImage}) center/cover no-repeat;` : `background: ${props.bgColor};`;
      const layout = BlockTypes.applyLayout(props);

      if (!props.ctas) {
          props.ctas = [];
          if (props.ctaText) props.ctas.push({ text: props.ctaText, href: props.ctaHref, primary: true });
          if (props.cta2Text) props.ctas.push({ text: props.cta2Text, href: props.cta2Href, primary: false });
      } else if (props.ctas.length === 0) {
          if (props.ctaText) props.ctas.push({ text: props.ctaText, href: props.ctaHref, primary: true });
          if (props.cta2Text) props.ctas.push({ text: props.cta2Text, href: props.cta2Href, primary: false });
      }

      if (!props.segments) {
          props.segments = [
              { type: 'title' },
              { type: 'subtitle' },
              { type: 'ctas' }
          ];
      }

      const ctaHtml = (props.ctas || []).map((c, i) => {
          const isP = c.primary !== false;
          const style = isP 
            ? `background: ${props.accentColor}; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display:inline-block; transition: transform .2s;`
            : `border: 2px solid ${props.accentColor}; color: ${props.accentColor}; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; display:inline-block; transition: all .2s;`;
          
          if (!c.segments) {
              c.segments = [{ type: 'text', value: c.text || 'Button' }];
          } else if (c.segments.length > 0) {
              c.segments[0].value = c.text || 'Button';
          }

          const nestedHtml = c.segments.map((seg, si) => {
              const path = `ctas.${i}.segments.${si}`;
              if (seg.type === 'text') return `<span data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path)}">${seg.value}</span>`;
              if (seg.type === 'icon') return `<i data-sf-path="${path}" class="fa-solid ${seg.value}" style="${BlockTypes.applySubStyle(props, path, 'margin-right:8px;')}"></i>`;
              return '';
          }).join('');

          return `<a data-sf-path="ctas.${i}" href="${c.href || '#'}" class="${isP ? 'hero-btn' : 'hero-btn-sec'}" style="${style}">${nestedHtml}</a>`;
      }).join('');

      const segsHtml = props.segments.map((s, i) => {
          const path = `segments.${i}`;
          if (s.type === 'title') {
              const base = `font-size: ${props.titleSize}; font-weight: ${props.titleWeight}; line-height: 1.1; margin-bottom: 24px; color: ${props.accentColor}; text-align:${props.titleAlign || 'center'};`;
              return `<h1 data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, base)}" data-initial-value="${props.title}">${props.title}</h1>`;
          }
          if (s.type === 'subtitle') {
              const base = `font-size: ${props.subtitleSize}; line-height: 1.6; margin-bottom: 40px; opacity: 0.9; text-align:${props.subtitleAlign || 'center'}; margin-left:${props.subtitleAlign === 'center' ? 'auto' : '0'}; margin-right:${props.subtitleAlign === 'center' ? 'auto' : '0'};`;
              return `<p data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, base)}" data-initial-value="${props.subtitle}">${props.subtitle}</p>`;
          }
          if (s.type === 'ctas') {
              const base = `display: flex; gap: 16px; justify-content: ${props.ctaAlign === 'center' ? 'center' : (props.ctaAlign === 'right' ? 'flex-end' : 'flex-start')}; flex-wrap: wrap; margin-bottom: 20px;`;
              return `<div data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, base)}">
                ${ctaHtml}
              </div>`;
          }
          return '';
      }).join('');

      return `<section id="${uid}" class="sf-hero ${props.customClass || ''}" style="${bg} color: ${props.textColor}; ${layout} align-items:center; justify-content:center;">
  <div style="max-width: 950px; width: 100%;">
    ${segsHtml}
  </div>
</section>`;
    }
  },

  about: {
    label: 'About Section',
    icon: 'fa-solid fa-circle-info',
    category: 'Sections',
    defaultProps: {
      id: 'about',
      badge: 'OUR STORY',
      title: 'Passionate about delivering excellence.',
      text: 'We believe that every brand has a story to tell. Our mission is to help you tell yours through stunning design and innovative technology. With years of experience and a team of dedicated professionals, we bring your vision to life.',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
      imagePosition: 'right',
      bgColor: '#ffffff',
      textColor: '#1a1a2e',
      accentColor: '#6c63ff',
      padding: '80px 32px',
      features: [
        { icon: 'fa-solid fa-check', text: 'Innovative Solutions' },
        { icon: 'fa-solid fa-check', text: 'Expert Team' },
        { icon: 'fa-solid fa-check', text: 'Quality Support' }
      ],
      titleSize: '2.5rem',
      textSize: '1.1rem',
      badgeAlign: 'left',
      titleAlign: 'left',
      textAlign: 'left',
      fontFamily: 'Inter, sans-serif',
      customId: '',
      customClass: '',
      // Layout
      width: '100%',
      height: 'auto',
      margin: '0',
      display: 'flex',
      gap: '56px'
    },
    render(props) {
      const uid = props.customId || props.id || 'about';
      const sectionGap = props.gap || '56px';
      const features = (props.features || []).map((f, i) => {
        if (!f.segments) {
            f.segments = [
                { type: 'icon', value: f.icon || 'fa-solid fa-check' },
                { type: 'text', value: f.text || 'Feature' }
            ];
        } else if (f.segments.length >= 2) {
            f.segments[0].value = f.icon || 'fa-solid fa-check';
            f.segments[1].value = f.text || 'Feature';
        }

        const nestedHtml = f.segments.map((seg, si) => {
            if (seg.type === 'icon') return `<i data-sf-path="features.${i}.segments.${si}" class="${seg.value}" style="color:${props.accentColor}; margin-right:12px;"></i>`;
            if (seg.type === 'text') return `<span data-sf-path="features.${i}.segments.${si}" style="color:inherit;" data-initial-value="${seg.value}">${seg.value}</span>`;
            return '';
        }).join('');

        return `<div data-sf-path="features.${i}" style="display:flex;align-items:center;margin-bottom:12px;">${nestedHtml}</div>`;
      }).join('');

      if (!props.segments) {
          props.segments = [
              { type: 'badge' },
              { type: 'title' },
              { type: 'text' },
              { type: 'features' }
          ];
      }

      const segsHtml = props.segments.map((s, i) => {
          const path = `segments.${i}`;
          if (s.type === 'badge') {
              const base = `color:${props.accentColor};font-weight:700;letter-spacing:1.5px;text-transform:uppercase;font-size:0.85rem;display:inline-block;`;
              return `<div data-sf-path="${path}" style="text-align:${props.badgeAlign || 'left'}; margin-bottom:16px;">
                <span style="${BlockTypes.applySubStyle(props, path, base)}">${props.badge}</span>
              </div>`;
          }
          if (s.type === 'title') {
              const base = `font-size:${props.titleSize}; color:inherit; margin-bottom:24px; line-height:1.2; text-align:${props.titleAlign || 'left'};`;
              return `<h2 data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, base)}" data-initial-value="${props.title}">${props.title}</h2>`;
          }
          if (s.type === 'text') {
              const base = `font-size:${props.textSize}; line-height:1.7; color:inherit; opacity:0.8; margin-bottom:32px; text-align:${props.textAlign || 'left'};`;
              return `<p data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, base)}" data-initial-value="${props.text}">${props.text}</p>`;
          }
          if (s.type === 'features') {
              return `<div data-sf-path="${path}" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px 24px; margin-bottom: 20px;">${features}</div>`;
          }
          return '';
      }).join('');

      const content = `
        <div class="sf-about-content" style="flex:1.2; min-width:300px; color:${props.textColor}; padding-right:${props.imagePosition === 'left' ? '0' : '12px'}; padding-left:${props.imagePosition === 'left' ? '12px' : '0'};">
          ${segsHtml}
        </div>`;

      const img = `<div class="sf-about-media" style="flex:1; min-width:300px; padding-left:${props.imagePosition === 'left' ? '0' : '12px'}; padding-right:${props.imagePosition === 'left' ? '12px' : '0'};"><img src="${props.image}" style="width:100%; display:block; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.1);"/></div>`;

      return `<section id="${uid}" class="sf-about ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)}">
        <style>
          #${uid} .sf-about-shell {
            gap: ${sectionGap};
          }
          @media (max-width: 768px) {
            #${uid} .sf-about-shell {
              gap: 28px !important;
            }
            #${uid} .sf-about-content,
            #${uid} .sf-about-media {
              min-width: 100% !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
            }
          }
        </style>
        <div class="sf-container sf-about-shell" style="max-width:1100px;margin:auto;display:flex;align-items:center;gap:${sectionGap};flex-wrap:wrap;flex-direction:${props.imagePosition === 'left' ? 'row-reverse' : 'row'};">
          ${content}
          ${img}
        </div>
      </section>`;
    }
  },

  services: {
    label: 'Services Section',
    icon: 'fa-solid fa-briefcase',
    category: 'Sections',
    defaultProps: {
      id: 'services',
      badge: 'What We Offer',
      title: 'Our Services',
      subtitle: 'We provide end-to-end solutions tailored to your needs.',
      bgColor: '#f9fafb',
      textColor: '#111827',
      accentColor: '#6c63ff',
      padding: '80px 32px',
      columns: 3,
      gridGap: '24px',
      badgeAlign: 'center',
      titleAlign: 'center',
      subtitleAlign: 'center',
      cardAlign: 'center',
      cardBg: '#ffffff',
      items: [
        { icon: '🎨', title: 'Web Design', desc: 'Beautiful, responsive designs that engage your users.' },
        { icon: '⚡', title: 'Development', desc: 'Fast, scalable web applications built with modern tech.' },
        { icon: '📱', title: 'Mobile Apps', desc: 'Intuitive mobile apps for iOS and Android platforms.' },
        { icon: '📈', title: 'SEO & Marketing', desc: 'Boost visibility and drive organic traffic to your site.' },
        { icon: '🔒', title: 'Security', desc: 'Protect your digital assets with enterprise-grade security.' },
        { icon: '🚀', title: 'Consulting', desc: 'Expert advice to help you navigate the digital landscape.' }
      ],
      customId: '',
      customClass: '',
      // Layout
      width: '100%',
      height: 'auto',
      margin: '0',
      display: 'block'
    },
    render(props) {
      const uid = props.customId || props.id || 'services';
      const cards = (props.items || []).map((item, i) => {
        if (!item.segments) {
            item.segments = [
                { type: 'icon', value: item.icon },
                { type: 'title', value: item.title },
                { type: 'desc', value: item.desc }
            ];
        } else if (item.segments.length >= 3) {
            item.segments[0].value = item.icon;
            item.segments[1].value = item.title;
            item.segments[2].value = item.desc;
        }

        const nestedHtml = item.segments.map((seg, si) => {
            const path = `items.${i}.segments.${si}`;
            if (seg.type === 'icon') return `<div data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, 'font-size:2.5rem;margin-bottom:14px;')}">${seg.value}</div>`;
            if (seg.type === 'title') return `<h3 data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, 'color:inherit;font-weight:700;margin-bottom:10px;font-size:1.1rem;')}">${seg.value}</h3>`;
            if (seg.type === 'desc') return `<p data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, 'color:inherit;opacity:.65;font-size:0.9rem;line-height:1.7;')}">${seg.value}</p>`;
            return '';
        }).join('');

        return `
        <div data-sf-path="items.${i}" style="background:${props.cardBg || '#fff'}; color:${props.textColor}; border-radius:12px; padding:28px; text-align:${props.cardAlign || 'center'}; box-shadow:0 2px 20px rgba(0,0,0,.07); transition:all .3s ease;" 
             onmouseover="this.style.transform='translateY(-6px)';this.style.boxShadow='0 12px 30px rgba(108, 99, 255, 0.15)'" 
             onmouseout="this.style.transform='';this.style.boxShadow='0 2px 20px rgba(0,0,0,.07)'">
          ${nestedHtml}
        </div>`;
      }).join('');
      
      if (!props.segments) {
          props.segments = [
              { type: 'badge' },
              { type: 'title' },
              { type: 'subtitle' },
              { type: 'items' }
          ];
      }

      const cols = props.columns || 3;
      const gap = props.gridGap || '24px';
      const gridStyle = `display:grid; grid-template-columns:repeat(auto-fit, minmax(max(240px, calc(${100/cols}% - ${gap})), 1fr)); gap:${gap};`;

      const segsHtml = props.segments.map((s, i) => {
          if (s.type === 'badge') {
              return `<div data-sf-path="segments.${i}" style="text-align:${props.badgeAlign || 'center'}; margin-bottom:16px;">
                <span style="background:${props.accentColor};color:#fff;padding:6px 16px;border-radius:99px;font-size:0.78rem;font-weight:600;display:inline-block;">${props.badge}</span>
              </div>`;
          }
          if (s.type === 'title') {
              return `<h2 data-sf-path="segments.${i}" style="color:${props.textColor};font-size:clamp(1.8rem,4vw,2.6rem);font-weight:800;margin-bottom:16px;font-family:'Poppins',sans-serif; text-align:${props.titleAlign || 'center'};">${props.title}</h2>`;
          }
          if (s.type === 'subtitle') {
              return `<p data-sf-path="segments.${i}" style="color:${props.textColor};opacity:.65;max-width:650px;margin-bottom:48px;line-height:1.7; text-align:${props.subtitleAlign || 'center'}; margin-left:${props.subtitleAlign === 'center' ? 'auto' : (props.subtitleAlign === 'right' ? 'auto' : '0')}; margin-right:${props.subtitleAlign === 'center' ? 'auto' : (props.subtitleAlign === 'left' ? 'auto' : '0')};">${props.subtitle}</p>`;
          }
          if (s.type === 'items') {
              return `<div data-sf-path="segments.${i}" style="${gridStyle}">${cards}</div>`;
          }
          return '';
      }).join('');

      return `<section id="${uid}" class="sf-services ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)}">
  <div style="max-width:1100px;margin:auto;">
    ${segsHtml}
  </div>
</section>`;
    }
  },

  carousel: {
    label: 'Carousel / Slider',
    icon: 'fa-solid fa-images',
    category: 'Media',
    defaultProps: {
      carouselLayout: 'hero',
      autoplay: true,
      interval: 4000,
      showDots: true,
      showArrows: true,
      slides: [
        { image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=500&fit=crop&q=80', title: 'Slide One', subtitle: 'Your compelling message here' },
        { image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=500&fit=crop&q=80', title: 'Slide Two', subtitle: 'Another great slide' },
        { image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=500&fit=crop&q=80', title: 'Slide Three', subtitle: 'A third beautiful slide' }
      ],
      objectFit: 'cover',
      customId: '',
      customClass: ''
    },
    render(props) {
      const uid = props.customId || props.id || ('cs' + Math.random().toString(36).substr(2, 9));
      const layout = props.carouselLayout || 'hero';
      const fitMap = {
        stretch: 'fill'
      };
      const objectFit = fitMap[props.objectFit] || props.objectFit || 'cover';
      const hasFixedHeight = !!(props.height && !['auto', '100%', 'inherit'].includes(props.height));
      const fitNeedsFrame = objectFit === 'cover' || objectFit === 'fill';
      const preserveFixedFrame = fitNeedsFrame && hasFixedHeight;
      const dynamicCoverHeight = fitNeedsFrame && !hasFixedHeight;
      const autoHeightFit = objectFit === 'contain' || objectFit === 'fill';
      const layoutStyle = autoHeightFit
        ? BlockTypes.applyLayout(props).replace(/min-height:[^;]+;/g, '').replace(/height:[^;]+;/g, 'height:auto;')
        : BlockTypes.applyLayout(props);

      const slidesHtml = (props.slides || []).map((slide, i) => {
        if (!slide.segments) {
            slide.segments = [
                { type: 'title', value: slide.title },
                { type: 'subtitle', value: slide.subtitle }
            ];
        } else if (slide.segments.length >= 2) {
            slide.segments[0].value = slide.title;
            slide.segments[1].value = slide.subtitle;
        }

        const nestedHtml = slide.segments.map((seg, si) => {
            const path = `slides.${i}.segments.${si}`;
            if (seg.type === 'title') return `<h2 data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, "font-size:clamp(1.5rem,4vw,3rem);font-weight:800;margin-bottom:12px;text-shadow:0 2px 10px rgba(0,0,0,.5);font-family:'Poppins',sans-serif;color:#fff;")}" data-initial-value="${seg.value}">${seg.value}</h2>`;
            if (seg.type === 'subtitle') return `<p data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, "font-size:1.1rem;opacity:.9;color:#fff;")}" data-initial-value="${seg.value}">${seg.value}</span>`;
            return '';
        }).join('');

        let imgSrc = slide.image || '';
        if (imgSrc.startsWith('//')) imgSrc = 'https:' + imgSrc;
        if (imgSrc.startsWith('http:')) imgSrc = imgSrc.replace('http:', 'https:'); // Force HTTPS

        const overlay = layout === 'editorial'
          ? 'position:absolute;inset:0;background:linear-gradient(90deg, rgba(0,0,0,.68) 0%, rgba(0,0,0,.28) 45%, rgba(0,0,0,.12) 100%);pointer-events:none;'
          : layout === 'card'
            ? 'position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,.08) 0%, rgba(0,0,0,.52) 100%);pointer-events:none;'
            : 'position:absolute;inset:0;background:rgba(0,0,0,.45);pointer-events:none;';
        const contentWrap = layout === 'editorial'
          ? 'position:absolute;inset:0;display:flex;align-items:center;justify-content:flex-start;z-index:1;'
          : layout === 'card'
            ? 'position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;z-index:1;'
            : 'position:absolute;inset:0;display:flex;align-items:flex-start;justify-content:center;z-index:1;padding-top:39vh;transform:translateY(-50%);';
        const contentInner = layout === 'editorial'
          ? 'text-align:left;color:#fff;padding:48px;max-width:640px;'
          : layout === 'card'
            ? 'text-align:left;color:#fff;padding:28px;max-width:520px;margin:0 0 32px 0;background:rgba(15,23,42,.62);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(12px);border-radius:22px;'
            : 'text-align:center;color:#fff;padding:20px;max-width:min(100%, 960px);width:100%;';
        const slideStyle = `width:100%;flex-shrink:0;position:relative;display:block;margin:0 !important;padding:0 !important;list-style:none !important;visibility:visible !important;opacity:1 !important;min-height:${preserveFixedFrame ? props.height : '100px'};${preserveFixedFrame ? `height:${props.height};` : ''}${fitNeedsFrame ? 'overflow:hidden;' : ''}`;
        const imageStyle = fitNeedsFrame
          ? `width:100%;height:${preserveFixedFrame || dynamicCoverHeight ? '100%' : 'auto'};display:block;border:none;visibility:visible !important;opacity:1 !important;min-height:${preserveFixedFrame ? '100%' : '100px'};object-fit:${objectFit};`
          : `width:100%;height:auto;display:block;border:none;visibility:visible !important;opacity:1 !important;min-height:100px;object-fit:${objectFit};`;
        return `<li data-sf-path="slides.${i}" class="sf-slide-${uid}" style="${slideStyle}"><img src="${imgSrc}" loading="${i===0?'eager':'lazy'}" fetchpriority="${i===0?'high':'low'}" alt="Slide ${i+1}" draggable="false" style="${imageStyle}" onerror="this.src='https://placehold.co/1200x500/222/fff?text=Image+Load+Error'" /><div style="${overlay}"></div><div class="sf-carousel-caption-${uid}" style="${contentWrap}"><div class="sf-carousel-caption-inner-${uid}" style="${contentInner}">${nestedHtml}</div></div></li>`;
      }).join('');

      if (!props.segments) {
          props.segments = [
              { type: 'slides' },
              { type: 'dots' },
          ];
      }

      // 8MBets Style: White Square Arrows (40x40px), Hover-Only Visibility
      const arrowBase = `position:absolute;top:50%;transform:translateY(-50%);pointer-events:auto;background:#fff;border:none;width:40px;height:40px;border-radius:3px;cursor:pointer;color:#444;display:flex;align-items:center;justify-content:center;z-index:20000;box-shadow:0 4px 12px rgba(0,0,0,0.2);transition:all .3s ease;opacity:0;`;
      const svgPrev = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
      const svgNext = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
      
      const safeId = uid.replace(/[^a-z0-9]/gi, '_');

      const dotsHtml = props.showDots ? `<div class="sf-dots-${uid}" style="position:absolute;bottom:20px;left:0;right:0;display:flex;justify-content:center;gap:10px;pointer-events:auto;z-index:20;">
        ${(props.slides || []).map((_, idx) => `<div onclick="event.stopPropagation(); if(window['csgo_${safeId}']) window['csgo_${safeId}'](${idx})" style="width:11px;height:11px;border-radius:20px;cursor:pointer;background:${idx === 0 ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.5)'};box-shadow:inset 0 0 3px rgba(0,0,0,0.3);" class="sf-dot-${uid}"></div>`).join('')}
      </div>` : '';

      const arrowsHtml = props.showArrows ? `<div class="sf-carousel-arrows-${uid}" style="position:absolute;inset:0;pointer-events:none;z-index:20000 !important;">
        <div onclick="event.stopPropagation(); if(window['csprev_${safeId}']) window['csprev_${safeId}']()" style="${arrowBase}left:30px;" aria-label="Previous" onmouseover="this.style.background='#eee'" onmouseout="this.style.background='#fff'">${svgPrev}</div>
        <div onclick="event.stopPropagation(); if(window['csnext_${safeId}']) window['csnext_${safeId}']()" style="${arrowBase}right:30px;" aria-label="Next" onmouseover="this.style.background='#eee'" onmouseout="this.style.background='#fff'">${svgNext}</div>
      </div>` : '';

      const styles = `<style>
        #${uid} { transition: height 0.3s ease; }
        #${uid} ul { display: flex !important; margin: 0 !important; padding: 0 !important; list-style: none !important; width: 100% !important; flex-wrap: nowrap !important; min-height: ${preserveFixedFrame ? props.height : '100px'} !important;${preserveFixedFrame ? `height:${props.height} !important;` : ''} }
        #${uid} li { flex: 0 0 100% !important; min-width: 100% !important; margin: 0 !important; padding: 0 !important;${preserveFixedFrame ? `height:${props.height} !important;` : ''} }
        .sf-carousel-track-${uid} { transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1); will-change: transform; }
        #${uid} .sf-carousel-caption-${uid} { width: 100%; }
        #${uid} .sf-carousel-caption-${uid} h2 { color:#f7ae12; font-family:'Poppins',sans-serif; font-weight:600; font-size:clamp(2rem,4.5vw,3.125rem); text-transform:uppercase; margin:0 0 12px; }
        #${uid} .sf-carousel-caption-${uid} p { color:#fff; font-family:'Poppins',sans-serif; text-transform:uppercase; font-size:1.1rem; line-height:1.6; margin:0 auto; max-width:min(100%, 560px); }
        #${uid} .sf-dots-${uid} { bottom:20px; }
        #${uid} .sf-dot-${uid}:hover { background:rgba(0,0,0,0.7) !important; }
        #${uid}:hover .sf-carousel-arrows-${uid} div { opacity: 1 !important; }
        #${uid}:hover .sf-carousel-arrows-${uid} div:first-child { left: 30px !important; }
        #${uid}:hover .sf-carousel-arrows-${uid} div:last-child { right: 30px !important; }
        
        /* Initial state for hover effect */
        .sf-carousel-arrows-${uid} div:first-child { left: -50px !important; }
        .sf-carousel-arrows-${uid} div:last-child { right: -50px !important; }
        @media (max-width: 768px) {
          #${uid} { width:100% !important; border-radius:${layout === 'card' ? '20px' : '0'} !important; }
          #${uid} .sf-carousel-arrows-${uid} { display:none !important; }
          ${preserveFixedFrame ? `#${uid} li img { min-height:${layout === 'card' ? '260px' : (layout === 'editorial' ? '320px' : '360px')} !important; }` : ''}
          #${uid} .sf-carousel-caption-${uid} { padding-top:0 !important; transform:none !important; align-items:center !important; }
          #${uid} li [data-sf-path^="slides."] h2 { font-size:clamp(1.35rem, 6vw, 2rem) !important; }
          #${uid} li [data-sf-path^="slides."] p { font-size:0.95rem !important; }
          #${uid} li > div[style*="justify-content:flex-start"] > div { padding:24px !important; max-width:100% !important; }
          #${uid} li > div[style*="align-items:flex-end"] > div { margin:0 16px 16px 16px !important; padding:18px !important; max-width:calc(100% - 32px) !important; }
        }
        #canvasFrame.mobile #${uid} { width:100% !important; border-radius:${layout === 'card' ? '20px' : '0'} !important; }
        #canvasFrame.mobile #${uid} .sf-carousel-arrows-${uid} { display:none !important; }
        ${preserveFixedFrame ? `#canvasFrame.mobile #${uid} li img { min-height:${layout === 'card' ? '260px' : (layout === 'editorial' ? '320px' : '360px')} !important; }` : ''}
        #canvasFrame.mobile #${uid} .sf-carousel-caption-${uid} { padding-top:0 !important; transform:none !important; align-items:center !important; }
        #canvasFrame.mobile #${uid} li [data-sf-path^="slides."] h2 { font-size:clamp(1.35rem, 6vw, 2rem) !important; }
        #canvasFrame.mobile #${uid} li [data-sf-path^="slides."] p { font-size:0.95rem !important; }
        #canvasFrame.mobile #${uid} li > div[style*="justify-content:flex-start"] > div { padding:24px !important; max-width:100% !important; }
        #canvasFrame.mobile #${uid} li > div[style*="align-items:flex-end"] > div { margin:0 16px 16px 16px !important; padding:18px !important; max-width:calc(100% - 32px) !important; }
      </style>`;

    const script = `<script>
  (function(){
    var sid = '${safeId}', uid = '${uid}';
    var track = document.getElementById('sftrack_' + uid);
    if (!track) return;
    var cur = 0, total = ${props.slides ? props.slides.length : 0};
    if (window['sf_iv_' + uid]) clearInterval(window['sf_iv_' + uid]);

    window['csgo_' + sid] = function(i) {
      if (total <= 0) return;
      var trackEl = document.getElementById('sftrack_' + uid);
      if (!trackEl) return;
      if (i < 0) i = total - 1; 
      if (i >= total) i = 0;
      cur = i;
      trackEl.style.transform = 'translate3d(-' + (cur * 100) + '%, 0, 0)';
      var dots = document.querySelectorAll('.sf-dot-' + uid);
      dots.forEach(function(d, idx) { d.style.background = idx === cur ? '#fff' : 'transparent'; });
      window['sf_cur_' + uid] = cur;
      syncHeight();
    };
    
    window['csnext_' + sid] = function() { window['csgo_' + sid]((window['sf_cur_' + uid] || 0) + 1); };
    window['csprev_' + sid] = function() { window['csgo_' + sid]((window['sf_cur_' + uid] || 0) - 1); };
    window['sf_cur_' + uid] = window['sf_cur_' + uid] || 0;

    function refresh() { if(window['csgo_'+sid]) window['csgo_'+sid](window['sf_cur_'+uid] || 0); }
    function syncHeight() {
      var root = document.getElementById(uid);
      var trackEl = document.getElementById('sftrack_' + uid);
      if (!root || !trackEl) return;
      if (${preserveFixedFrame ? 'true' : 'false'}) {
        root.style.height = '';
        Array.prototype.forEach.call(trackEl.children || [], function(slideEl) {
          slideEl.style.height = '${preserveFixedFrame ? props.height : ''}';
        });
        return;
      }
      if (!${dynamicCoverHeight ? 'true' : 'false'}) {
        root.style.height = '';
        Array.prototype.forEach.call(trackEl.children || [], function(slideEl) {
          slideEl.style.height = '';
        });
        return;
      }
      var activeSlide = trackEl.children[cur];
      var activeImg = activeSlide && activeSlide.querySelector('img');
      if (!activeSlide || !activeImg || !activeImg.naturalWidth || !activeImg.naturalHeight) return;
      var nextHeight = Math.round((root.clientWidth || activeImg.clientWidth) * (activeImg.naturalHeight / activeImg.naturalWidth));
      if (!nextHeight) return;
      root.style.height = nextHeight + 'px';
      Array.prototype.forEach.call(trackEl.children || [], function(slideEl, slideIndex) {
        slideEl.style.height = slideIndex === cur ? nextHeight + 'px' : '';
      });
    }

    // Multi-phase initialization for layout stability
    refresh();
    syncHeight();
    setTimeout(refresh, 50);
    setTimeout(syncHeight, 50);
    setTimeout(refresh, 300);
    setTimeout(syncHeight, 300);
    window.addEventListener('load', refresh);
    window.addEventListener('load', syncHeight);
    window.addEventListener('resize', function(){ refresh(); syncHeight(); });
    Array.prototype.forEach.call(track.querySelectorAll('img'), function(img){
      if (img.complete) {
        syncHeight();
        return;
      }
      img.addEventListener('load', syncHeight);
    });

    var pollCount = 0;
    var ivPoll = setInterval(function(){
      if (pollCount > 20 || !document.getElementById('sftrack_' + uid)) { clearInterval(ivPoll); return; }
      refresh();
      syncHeight();
      pollCount++;
    }, 250);

    ${props.autoplay ? `
    window['sf_iv_' + uid] = setInterval(function(){
      if (!document.getElementById('sftrack_' + uid)) { clearInterval(window['sf_iv_' + uid]); return; }
      if (window['csnext_' + sid]) window['csnext_' + sid]();
    }, ${props.interval || 4000});` : ''}
  })();
  <\/script>`;

      const shellStyle = layout === 'card' ? 'position:relative;overflow:hidden;border-radius:28px;box-shadow:0 30px 80px rgba(0,0,0,.22);' : 'position:relative;overflow:hidden;';
      return `${styles}<div id="${uid}" class="sf-carousel ${props.customClass || ''}" style="${shellStyle}width:${props.width||'100%'};${layoutStyle}"><ul id="sftrack_${uid}" class="sf-carousel-track-${uid}">${slidesHtml}</ul>${dotsHtml}${arrowsHtml}${script}</div>`;
    }
  },

  videoCarousel: {
    label: 'Video Card Carousel',
    icon: 'fa-solid fa-film',
    category: 'Media',
    defaultProps: {
      videoCarouselLayout: 'standard',
      sectionTitle: 'Watch Our Videos',
      sectionSubtitle: 'Browse our latest video tutorials',
      bgColor: '#0d1117',
      textColor: '#ffffff',
      accentColor: '#f5a623',
      cardBg: '#161b22',
      cardBorder: '#30363d',
      padding: '60px 20px',
      autoplay: false,
      interval: 5000,
      showDots: true,
      showArrows: true,
      cardsPerView: 3,
      allowMultiplePlayback: false,
      videos: [
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'How to Get Started – Full Guide', views: '2.1M views', thumb: '' },
        { url: 'https://www.youtube.com/watch?v=9bZkp7q19f0', title: 'Advanced Tips & Tricks Tutorial', views: '1.3M views', thumb: '' },
        { url: 'https://www.youtube.com/watch?v=kXYiU_JCYtU', title: 'Complete Beginner Walkthrough', views: '980K views', thumb: '' },
        { url: 'https://www.youtube.com/watch?v=CevxZvSJLk8', title: 'Top 10 Strategies Explained', views: '760K views', thumb: '' },
        { url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', title: 'Live Session – Q&A Highlights', views: '540K views', thumb: '' },
        { url: 'https://www.youtube.com/watch?v=YQHsXMglC9A', title: 'Exclusive Member Benefits Review', views: '420K views', thumb: '' }
      ],
      customId: '',
      customClass: '',
      // Layout
      width: '100%',
      height: 'auto',
      margin: '0',
      display: 'block'
    },
    render(props) {
      const uid = props.customId || props.id || ('vc' + Math.random().toString(36).substr(2, 9));
      const layout = props.videoCarouselLayout || 'standard';
      const cpv = Math.max(1, Math.min(5, props.cardsPerView || 3));
      const safeId = uid.replace(/[^a-z0-9]/gi, '_');
      const allowMultiplePlayback = props.allowMultiplePlayback === true;

      const videos = (props.videos || []);
      const total = videos.length;
      const maxIdx = Math.max(0, total - cpv);

      const cards = videos.map((v, i) => {
        const baseUrl = VideoHelper.getEmbedUrl(v.url);
        const embedUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'autoplay=1&mute=1&playsinline=1';
        const ytMatch = v.url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
        const ytId = ytMatch ? ytMatch[1] : null;
        let thumb = v.thumb || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : 'https://placehold.co/320x180/161b22/f5a623?text=Video');
        if (thumb.startsWith('http:')) thumb = thumb.replace('http:', 'https:');

        return `
          <div class="vc-card-${uid}" data-embed="${embedUrl.replace(/"/g,'&quot;')}" data-allow-multiple="${allowMultiplePlayback ? 'true' : 'false'}"
               style="flex:0 0 calc(100% / ${cpv}); padding: 0 8px; box-sizing: border-box; cursor: pointer; transition: transform 0.3s; position:relative; pointer-events:auto; z-index:5;" 
               onclick="event.stopPropagation(); if(window['vplay_${safeId}']) window['vplay_${safeId}'](this);">
            <div style="background:${props.cardBg || '#161b22'}; border:1px solid ${props.cardBorder || '#30363d'}; border-radius:${layout === 'spotlight' ? '22px' : '12px'}; overflow:hidden;">
              <div class="vc-thumb-wrap-${uid}" style="position:relative;aspect-ratio:16/9;overflow:hidden;pointer-events:none;background:#000;">
                <img src="${thumb}" style="width:100%;height:100%;object-fit:cover;display:block;" loading="lazy"/>
                <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.15);">
                  <div style="width:52px;height:52px;border-radius:50%;background:${props.accentColor || '#f5a623'};display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(0,0,0,0.3); transition: transform 0.2s;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </div>
              <div style="padding:14px 16px;pointer-events:none;">
                <div style="font-weight:600;font-size:0.88rem;color:${props.textColor || '#ffffff'};line-height:1.4;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${v.title || 'Video Title'}</div>
                <div style="font-size:0.75rem;color:${props.accentColor || '#f5a623'};font-weight:600;display:flex;align-items:center;gap:5px;">
                  <i class="fa-solid fa-eye" style="font-size:10px;"></i>${v.views || '0 views'}
                </div>
              </div>
            </div>
          </div>`;
      }).join('');

      // Navigation Dots
      const dotsHtml = (props.showDots && total > cpv) ? `
        <div id="vc-dots-${uid}" style="display:flex;justify-content:center;gap:10px;margin-top:28px;position:relative;z-index:100;pointer-events:auto;">
          ${Array.from({length: maxIdx + 1}).map((_, i) => `
            <div onclick="event.stopPropagation(); if(window['vgo_${safeId}']) window['vgo_${safeId}'](${i});" 
                 class="vc-dot-${uid}" 
                 style="width:${i===0?'24px':'10px'};height:10px;border-radius:5px;cursor:pointer;background:${i===0?(props.accentColor||'#f5a623'):'rgba(255,255,255,0.2)'};transition:all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></div>
          `).join('')}
        </div>` : '';

      // Navigation Arrows
      const arrowStyle = `position:absolute;top:50%;transform:translateY(-50%);pointer-events:auto;background:#fff;border:none;width:44px;height:44px;border-radius:50%;cursor:pointer;color:#333;display:flex;align-items:center;justify-content:center;z-index:20001;box-shadow:0 6px 20px rgba(0,0,0,0.2);transition:all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);`;
      const svgPrev = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
      const svgNext = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

      const arrowsHtml = (props.showArrows && total > cpv) ? `
        <div class="vc-arrows-${uid}" style="position:absolute;inset:0;pointer-events:none;z-index:20000;">
          <div onclick="event.stopPropagation(); if(window['vprev_${safeId}']) window['vprev_${safeId}']();" class="vc-arrow-btn-${uid}" style="${arrowStyle}left:-22px;">${svgPrev}</div>
          <div onclick="event.stopPropagation(); if(window['vnext_${safeId}']) window['vnext_${safeId}']();" class="vc-arrow-btn-${uid}" style="${arrowStyle}right:-22px;">${svgNext}</div>
        </div>` : '';

      const script = `<script>
(function(){
  var sid='${safeId}', tid='vc-track-${uid}', uid='${uid}', cpv=${cpv}, total=${total};
  var maxIdx = Math.max(0, total - cpv), cur = 0;
  
  window['vgo_' + sid] = function(idx){
    var track = document.getElementById(tid); if(!track) return;
    if(idx < 0) idx = maxIdx; if(idx > maxIdx) idx = 0;
    cur = idx;
    var shift = cur * (100 / cpv);
    track.style.transform = 'translate3d(-' + shift + '%, 0, 0)';
    var dots = document.querySelectorAll('.vc-dot-'+uid);
    dots.forEach(function(d,i){
      if(i <= maxIdx) {
        d.style.background = i===cur ? '${props.accentColor||'#f5a623'}' : 'rgba(255,255,255,0.2)';
        d.style.width = i===cur ? '24px' : '10px';
      }
    });
  };
  
  window['vplay_' + sid] = function(el){
    var allowMultiple = el.getAttribute('data-allow-multiple') === 'true';
    var embed = el.getAttribute('data-embed');
    var container = el.querySelector('.vc-thumb-wrap-'+uid);
    if(container) {
      if (!allowMultiple && window.stopOtherMedia) window.stopOtherMedia(container);
      container.setAttribute('data-original-html', container.innerHTML);
      container.setAttribute('data-active-video', 'true');
      container.setAttribute('data-allow-multiple', allowMultiple ? 'true' : 'false');
      var origin = window.location.origin;
      if (origin === 'null' || origin.startsWith('file:')) origin = '*';
      var finalUrl = embed + (embed.includes('?') ? '&' : '?') + 'origin=' + encodeURIComponent(origin);
      container.innerHTML = '<iframe data-allow-multiple="'+(allowMultiple ? 'true' : 'false')+'" src="'+finalUrl+'" frameborder="0" allow="autoplay;encrypted-media;accelerometer;gyroscope;picture-in-picture" allowfullscreen style="width:100%;height:100%;display:block;border-radius:0;"></iframe>';
    }
  };

  window['vnext_' + sid] = function(){ window['vgo_' + sid](cur + 1); };
  window['vprev_' + sid] = function(){ window['vgo_' + sid](cur - 1); };

  // Init
  setTimeout(function(){ window['vgo_' + sid](0); }, 50);
  
  if(window['iv_vc_'+sid]) clearInterval(window['iv_vc_'+sid]);
  ${props.autoplay ? `window['iv_vc_'+sid] = setInterval(function(){ 
    if(!document.getElementById(tid)) return clearInterval(window['iv_vc_'+sid]);
    window['vnext_'+sid](); 
  }, ${props.interval||5000});` : ''}
})();
<\/script>`;

      const titleHtml = props.sectionTitle ? `<h2 style="color:${props.textColor||'#fff'};font-size:clamp(1.5rem,3vw,2.2rem);font-weight:800;margin-bottom:8px;font-family:'Poppins',sans-serif;">${props.sectionTitle}</h2>` : '';
      const subtitleHtml = props.sectionSubtitle ? `<p style="color:${props.textColor||'#fff'};opacity:0.6;font-size:0.95rem;margin-bottom:40px;">${props.sectionSubtitle}</p>` : '';

      const headerWrap = layout === 'editorial'
        ? `<div style="display:grid;grid-template-columns:.8fr 1.2fr;gap:28px;align-items:end;margin-bottom:34px;">
            <div>${titleHtml}</div>
            <div style="text-align:left;">${subtitleHtml}</div>
          </div>`
        : `<div style="text-align:${layout === 'spotlight' ? 'left' : 'center'};">${titleHtml}${subtitleHtml}</div>`;
      return `<section id="${uid}" class="sf-video-carousel ${props.customClass||''}" style="background:${props.bgColor||'#0d1117'};${BlockTypes.applyLayout(props)} padding:${props.padding || '60px 20px'};">
        <div style="max-width:1200px;margin:auto;">
          ${headerWrap}
          <div style="position:relative;">
            <div class="vc-inner-wrap-${uid}" style="position:relative;">
              <div style="overflow:hidden; margin: 0 -8px;">
                <div id="vc-track-${uid}" style="display:flex; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); will-change: transform;">
                  ${cards}
                </div>
              </div>
              ${arrowsHtml}
            </div>
          </div>
          ${dotsHtml}
        </div>
        <style>
          .vc-inner-wrap-${uid}:hover .vc-arrow-btn-${uid} { opacity: 1 !important; transform: translateY(-50%) scale(1.1); }
          .vc-arrow-btn-${uid} { opacity: 0.7; }
          .vc-card-${uid}:hover { transform: translateY(-5px); }
          .vc-card-${uid}:hover img { transform: scale(1.05); }
          .vc-card-${uid} img { transition: transform 0.5s ease; }
          @media(max-width:900px){
            .vc-card-${uid}{ flex: 0 0 calc(100% / 2) !important; }
          }
          @media(max-width:600px){
            .vc-card-${uid}{ flex: 0 0 100% !important; }
          }
        </style>
        ${script}
      </section>`;
    }
  },
  promoCarousel: {
    label: 'Promo Slider',
    icon: 'fa-solid fa-rectangle-ad',
    category: 'Media',
    defaultProps: {
      promoLayout: 'banner',
      autoplay: true,
      interval: 4000,
      showDots: true,
      showArrows: true,
      objectFit: 'cover',
      slides: [
        { image: 'https://picsum.photos/seed/promo-slider-1/1600/900' },
        { image: 'https://picsum.photos/seed/promo-slider-2/1600/900' },
        { image: 'https://picsum.photos/seed/promo-slider-3/1600/900' },
        { image: 'https://picsum.photos/seed/promo-slider-4/1600/900' }
      ],
      customId: '',
      customClass: '',
      // Layout
      width: '100%',
      height: 'auto',
      margin: '0',
      padding: '0'
    },
    render(props) {
      const uid = props.customId || props.id || ('ps' + Math.random().toString(36).substr(2, 9));
      const layout = props.promoLayout || 'banner';
      const objectFit = props.objectFit === 'stretch' ? 'fill' : (props.objectFit || 'cover');
      const hasFixedHeight = !!(props.height && !['auto', '100%', 'inherit'].includes(props.height));
      const fitNeedsFrame = objectFit === 'cover' || objectFit === 'fill';
      const preserveFixedFrame = fitNeedsFrame && hasFixedHeight;
      const dynamicCoverHeight = fitNeedsFrame && !hasFixedHeight;
      const autoHeightFit = objectFit === 'contain' || objectFit === 'fill';
      const layoutStyle = autoHeightFit
        ? BlockTypes.applyLayout(props).replace(/min-height:[^;]+;/g, '').replace(/height:[^;]+;/g, 'height:auto;')
        : BlockTypes.applyLayout(props);
      
      const total = props.slides ? props.slides.length : 0;
      if (total === 0) return `<section id="${uid}" class="sf-promo-carousel ${props.customClass || ''}" style="${BlockTypes.applyLayout(props)} text-align:center;padding:50px;">No slides</section>`;

      const slidesHtml = (props.slides || []).map((slide, i) => {
        if (!slide.segments) {
          slide.segments = [{ type: 'image', value: slide.image }];
        } else if (slide.segments.length > 0) {
          slide.segments[0].value = slide.image;
        }
        let pmImg = slide.segments[0].value;
        if (pmImg.startsWith('http:')) pmImg = pmImg.replace('http:', 'https:');
        const slideStyle = `flex:0 0 100%; min-width:100%; position:relative; display:block; margin:0 !important; padding:0 !important; list-style:none !important; min-height:${preserveFixedFrame ? props.height : '100px'};${preserveFixedFrame ? `height:${props.height};` : ''}${fitNeedsFrame ? 'overflow:hidden;' : ''}`;
        const imageStyle = fitNeedsFrame
          ? `width:100%;height:${preserveFixedFrame || dynamicCoverHeight ? '100%' : 'auto'};display:block;border:none;min-height:${preserveFixedFrame ? '100%' : '100px'};object-fit:${objectFit};`
          : `width:100%;height:auto;display:block;border:none;min-height:100px;object-fit:${objectFit};`;
        return `<li style="${slideStyle}"><img src="${pmImg}" alt="Slide ${i+1}" loading="${i===0?'eager':'lazy'}" draggable="false" style="${imageStyle}" data-sf-path="slides.${i}.segments.0" /></li>`;
      }).join('');

      const sid = uid.replace(/[^a-z0-9]/gi, '_');

      const css = `
<style>
#${uid} {
  display: block;
  width: 100%;
  max-width: 100%;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  box-sizing: border-box;
}
.slider-wrap-${uid} {
  position: relative;
  overflow: hidden;
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-size: 0;
  line-height: 0;
  transition: height 0.3s ease;
  min-height: ${preserveFixedFrame ? props.height : '100px'};
  ${preserveFixedFrame ? `height:${props.height};` : ''}
}
.slider-track-${uid} {
  display: flex;
  align-items: flex-start;
  flex-wrap: nowrap;
  transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  margin: 0;
  padding: 0;
  list-style: none;
  width: 100%;
  box-sizing: border-box;
  min-height: ${preserveFixedFrame ? props.height : '100px'};
  ${preserveFixedFrame ? `height:${props.height};` : ''}
}
.slider-track-${uid} > li {
  box-sizing: border-box;
  margin: 0 !important;
  padding: 0 !important;
}
.slider-track-${uid} > li > img {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}
.slider-nav-${uid} {
  display: ${props.showArrows ? 'block' : 'none'};
}
.slider-nav-${uid} a {
  text-decoration: none;
  display: block;
  position: absolute;
  top: 55%;
  transform: translateY(-50%);
  z-index: 10;
  width: 40px;
  height: 40px;
  background-color: #ffffff;
  color: #444444;
  border-radius: 3px;
  text-align: center;
  line-height: 40px;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.slider-nav-${uid} .prev-${uid} { left: 15px; opacity: 1; }
.slider-nav-${uid} .next-${uid} { right: 15px; opacity: 1; }
.slider-wrap-${uid} { background: transparent; }
.slider-dots-${uid} {
  display:${props.showDots ? 'flex' : 'none'};
  position:absolute;
  left:0;
  right:0;
  bottom:18px;
  justify-content:center;
  gap:10px;
  z-index:20;
}
.slider-dots-${uid} .dot-${uid} {
  width:11px;
  height:11px;
  border-radius:999px;
  cursor:pointer;
  background:rgba(255,255,255,0.46);
  box-shadow:0 1px 4px rgba(0,0,0,0.22);
  transition:all 0.25s ease;
}
.slider-dots-${uid} .dot-${uid}.active {
  background:rgba(255,255,255,0.95);
  transform:scale(1.05);
}
@media screen and (max-width: 860px) {
  #${uid} {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  .slider-nav-${uid} .prev-${uid} { left: 8px; }
  .slider-nav-${uid} .next-${uid} { right: 8px; }
}
#canvasFrame.tablet #${uid},
#canvasFrame.mobile #${uid} {
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
</style>
`;

      const script = `<script>
(function(){
  var track = document.getElementById('track-${uid}');
  var wrap = document.getElementById('wrap-${uid}');
  if (!track || !wrap) return;
  var cur = 0;
  var total = ${props.slides ? props.slides.length : 0};
  var iv = null;

  window['psgo_' + '${sid}'] = function(idx){
    if (total <= 1) return;
    if (idx < 0) idx = total - 1;
    if (idx >= total) idx = 0;
    cur = idx;
    track.style.transform = 'translate3d(-' + (cur * 100) + '%, 0, 0)';
    var dots = wrap.querySelectorAll('.dot-${uid}');
    dots.forEach(function(dot, dotIdx){
      dot.classList.toggle('active', dotIdx === cur);
    });
    syncHeight();
  };
  
  window['psnext_' + '${sid}'] = function(){ window['psgo_' + '${sid}'](cur + 1); };
  window['psprev_' + '${sid}'] = function(){ window['psgo_' + '${sid}'](cur - 1); };

  function syncHeight() {
    var root = document.getElementById('${uid}');
    if (${preserveFixedFrame ? 'true' : 'false'}) {
      if (root) root.style.height = '${preserveFixedFrame ? props.height : ''}';
      wrap.style.height = '${preserveFixedFrame ? props.height : ''}';
      return;
    }
    var activeSlide = track.children[cur];
    var activeImg = activeSlide && activeSlide.querySelector('img');
    if (!activeSlide) return;
    if (!${dynamicCoverHeight ? 'true' : 'false'}) {
      if (root) root.style.height = '';
      wrap.style.height = activeSlide.offsetHeight + 'px';
      Array.prototype.forEach.call(track.children || [], function(slideEl) {
        slideEl.style.height = '';
      });
      return;
    }
    if (!activeImg || !activeImg.naturalWidth || !activeImg.naturalHeight) return;
    var containerWidth = wrap.clientWidth || activeImg.clientWidth;
    var nextHeight = Math.round(containerWidth * (activeImg.naturalHeight / activeImg.naturalWidth));
    if (!nextHeight) return;
    if (root) root.style.height = nextHeight + 'px';
    wrap.style.height = nextHeight + 'px';
    Array.prototype.forEach.call(track.children || [], function(slideEl, slideIndex) {
      slideEl.style.height = slideIndex === cur ? nextHeight + 'px' : '';
    });
  }
  window.addEventListener('resize', syncHeight);
  Array.prototype.forEach.call(track.querySelectorAll('img'), function(img){
    if (img.complete) {
      syncHeight();
      return;
    }
    img.addEventListener('load', syncHeight);
  });
  window.addEventListener('load', syncHeight);
  setTimeout(syncHeight, 50);
  setTimeout(syncHeight, 300);
  setTimeout(function(){ window['psgo_' + '${sid}'](0); }, 10);

  ${props.autoplay ? `
  function startIv() {
    if (iv) clearInterval(iv);
    iv = setInterval(function(){
      if (window['psnext_${sid}']) window['psnext_${sid}']();
    }, ${props.interval || 4000});
  }
  startIv();
  wrap.addEventListener('mouseenter', function(){ if(iv) clearInterval(iv); });
  wrap.addEventListener('mouseleave', function(){ startIv(); });
  ` : ''}
})();
<\/script>`;

      // 8MBets Style: White Square Arrows (40x40px), Hover-Only Visibility
      const arrowBase = `position:absolute;top:50%;transform:translateY(-50%);pointer-events:auto;background:#fff;border:none;width:40px;height:40px;border-radius:3px;cursor:pointer;color:#444;display:flex;align-items:center;justify-content:center;z-index:20000;box-shadow:0 4px 12px rgba(0,0,0,0.2);transition:all .3s ease;opacity:0;`;
      const svgPrev = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
      const svgNext = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
      const arrowsHtml = props.showArrows ? `<div class="ps-arrows-${uid}" style="position:absolute;inset:0;pointer-events:none;z-index:20000 !important;">
        <div onclick="event.stopPropagation(); if(window['psprev_${sid}']) window['psprev_${sid}']()" style="${arrowBase}left:25px;" aria-label="Previous" onmouseover="this.style.background='#eee'" onmouseout="this.style.background='#fff'">${svgPrev}</div>
        <div onclick="event.stopPropagation(); if(window['psnext_${sid}']) window['psnext_${sid}']()" style="${arrowBase}right:25px;" aria-label="Next" onmouseover="this.style.background='#eee'" onmouseout="this.style.background='#fff'">${svgNext}</div>
      </div>` : '';
      const dotsHtml = props.showDots ? `<div class="slider-dots-${uid}">
        ${(props.slides || []).map((_, idx) => `<div class="dot-${uid}${idx === 0 ? ' active' : ''}" onclick="event.stopPropagation(); if(window['psgo_${sid}']) window['psgo_${sid}'](${idx})"></div>`).join('')}
      </div>` : '';

      const updatedCss = css.replace('.slider-nav-' + uid + ' {', '.slider-nav-' + uid + ' { display:none !important; ').replace('</style>', `
        #wrap-${uid}:hover .ps-arrows-${uid} div { opacity: 1 !important; }
        #wrap-${uid}:hover .ps-arrows-${uid} div:first-child { left: 25px !important; }
        #wrap-${uid}:hover .ps-arrows-${uid} div:last-child { right: 25px !important; }
        .ps-arrows-${uid} div:first-child { left: -50px !important; }
        .ps-arrows-${uid} div:last-child { right: -50px !important; }
        .slider-wrap-${uid} { min-height: 100px !important; background: transparent !important; }
      </style>`);

      const shellStyle = layout === 'card'
        ? 'overflow:hidden; position:relative; border-radius:24px; box-shadow:0 26px 70px rgba(0,0,0,.18);'
        : layout === 'filmstrip'
          ? 'overflow:hidden; position:relative; border-top:8px solid rgba(255,255,255,.12); border-bottom:8px solid rgba(255,255,255,.12);'
          : 'overflow:hidden; position:relative;';
      return `<section id="${uid}" class="sf-promo-carousel ${props.customClass || ''}" style="${layoutStyle} ${shellStyle}">${updatedCss}<div id="wrap-${uid}" class="slider-wrap-${uid}">${arrowsHtml}${dotsHtml}<ul id="track-${uid}" class="slider-track-${uid}">${slidesHtml}</ul></div>${script}</section>`;
    }
  },

  contact: {
    label: 'Contact Section',
    icon: 'fa-solid fa-envelope',
    category: 'Sections',
    defaultProps: {
      id: 'contact',
      badge: 'Contact',
      title: 'Get In Touch',
      subtitle: "We'd love to hear from you. Fill out the form below and we'll get back to you shortly.",
      bgColor: '#0f1117',
      textColor: '#ffffff',
      accentColor: '#6c63ff',
      padding: '80px 32px',
      headerAlign: 'center',
      layoutStyle: 'split',
      formFirst: false,
      showMap: false,
      phone: '+1 (555) 000-0000',
      email: 'hello@example.com',
      address: '123 Workspace St, Digital City',
      customId: '',
      customClass: ''
    },
    render(props) {
      const uid = props.customId || props.id || 'contact';

      if (!props.segments) {
          props.segments = [
              { type: 'header' },
              { type: 'content' }
          ];
      }

      const headerAlign = props.headerAlign || 'center';
      const header = `
        <div style="text-align:${headerAlign};margin-bottom:48px;">
          <span data-sf-path="segments.0.badge" style="${BlockTypes.applySubStyle(props, "segments.0.badge", `background:${props.accentColor};color:#fff;padding:4px 14px;border-radius:99px;font-size:0.78rem;font-weight:600;`)}">${props.badge}</span>
          <h2 data-sf-path="segments.0.title" style="${BlockTypes.applySubStyle(props, "segments.0.title", `color:${props.textColor};font-size:clamp(1.6rem,3vw,2.4rem);font-weight:700;margin:16px 0 10px;font-family:'Poppins',sans-serif;`)}">${props.title}</h2>
          <p data-sf-path="segments.0.subtitle" style="${BlockTypes.applySubStyle(props, "segments.0.subtitle", `color:${props.textColor};opacity:.65;max-width:550px;line-height:1.7;margin:${headerAlign === 'center' ? 'auto' : '0'};`)}">${props.subtitle}</p>
        </div>`;

      const infoItems = [
          { type: 'phone', icon: 'fa-solid fa-phone', label: 'Phone', value: props.phone },
          { type: 'email', icon: 'fa-solid fa-envelope', label: 'Email', value: props.email },
          { type: 'address', icon: 'fa-solid fa-location-dot', label: 'Address', value: props.address }
      ].map((item, i) => {
          if (!item.segments) {
              item.segments = [
                  { type: 'icon', value: item.icon },
                  { type: 'content', label: item.label, value: item.value }
              ];
          }

          const nestedHtml = item.segments.map((seg, si) => {
              if (seg.type === 'icon') return `<div data-sf-path="info.${i}.segments.${si}" style="width:40px;height:40px;border-radius:50%;background:rgba(108,99,255,0.1);display:flex;align-items:center;justify-content:center;color:${props.accentColor};"><i class="${seg.value}"></i></div>`;
              if (seg.type === 'content') return `<div data-sf-path="info.${i}.segments.${si}">
                  <div style="font-size:0.8rem;opacity:0.6;">${seg.label}</div>
                  <div style="font-weight:600;">${seg.value}</div>
                </div>`;
              return '';
          }).join('');

          return `<div data-sf-path="info.${i}" style="display:flex;align-items:center;gap:15px;margin-bottom:24px;">${nestedHtml}</div>`;
      }).join('');

      if (!props.formSegments) {
          props.formSegments = [
              { type: 'row', items: [{ type: 'name' }, { type: 'email' }] },
              { type: 'subject' },
              { type: 'message' },
              { type: 'submit' }
          ];
      }

      const formHtml = props.formSegments.map((s, i) => {
          if (s.type === 'row') {
              const rowItems = (s.items || []).map((ri, rj) => {
                  if (ri.type === 'name') return `<input data-sf-path="formSegments.${i}.items.${rj}" type="text" placeholder="Your Name" required style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:13px 16px;color:${props.textColor};font-size:0.9rem;outline:none;width:100%;" />`;
                  if (ri.type === 'email') return `<input data-sf-path="formSegments.${i}.items.${rj}" type="email" placeholder="Your Email" required style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:13px 16px;color:${props.textColor};font-size:0.9rem;outline:none;width:100%;" />`;
                  return '';
              }).join('');
              return `<div data-sf-path="formSegments.${i}" class="sf-contact-form-row" style="display:grid;grid-template-columns:repeat(${s.items.length}, 1fr);gap:14px;">${rowItems}</div>`;
          }
          if (s.type === 'subject') return `<input data-sf-path="formSegments.${i}" type="text" placeholder="Subject" style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:13px 16px;color:${props.textColor};font-size:0.9rem;outline:none;" />`;
          if (s.type === 'message') return `<textarea data-sf-path="formSegments.${i}" placeholder="Your message…" rows="5" required style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:13px 16px;color:${props.textColor};font-size:0.9rem;outline:none;resize:vertical;"></textarea>`;
          if (s.type === 'submit') return `<button data-sf-path="formSegments.${i}" type="submit" style="background:${props.accentColor};color:#fff;border:none;border-radius:8px;padding:14px;font-size:0.95rem;font-weight:700;cursor:pointer;">Send Message ✉️</button>`;
          return '';
      }).join('');

      const infoColumn = `<div data-sf-path="info-container">${infoItems}</div>`;
      const formColumn = `<form onsubmit="event.preventDefault();alert('Message sent! (Demo)');" style="display:flex;flex-direction:column;gap:14px;">${formHtml}</form>`;
      const infoContent = (props.layoutStyle || 'split') === 'stacked'
        ? `<div class="sf-contact-grid" style="display:flex;flex-direction:column;gap:24px;max-width:760px;margin:auto;">
            <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:28px;">${infoItems}</div>
            <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:28px;">${formColumn}</div>
          </div>`
        : `<div class="sf-contact-grid" style="display:grid;grid-template-columns:1fr 1.5fr;gap:48px;align-items:start;">
            ${props.formFirst ? formColumn : infoColumn}
            ${props.formFirst ? infoColumn : formColumn}
          </div>`;

      const segsHtml = props.segments.map((s, i) => {
          if (s.type === 'header') return `<div data-sf-path="segments.${i}">${header}</div>`;
          if (s.type === 'content') return `<div data-sf-path="segments.${i}">${infoContent}</div>`;
          return '';
      }).join('');

      return `<section id="${uid}" class="sf-contact ${props.customClass || ''}" style="background:${props.bgColor}; padding:${props.padding || '80px 32px'};">
  <div style="max-width:1000px;margin:auto;">
    ${segsHtml}
  </div>
</section>`;
    }
  },

  footer: {
    label: 'Footer',
    icon: 'fa-solid fa-shoe-prints',
    category: 'Navigation',
    defaultProps: {
      brand: 'MySite',
      tagline: 'Building beautiful things.',
      bgColor: '#0a0a0f',
      textColor: '#a0abc0',
      headingColor: '#ffffff',
      accentColor: '#6c63ff',
      linkColor: '#a0abc0',
      cardBg: 'rgba(255,255,255,.07)',
      borderColor: 'rgba(255,255,255,.1)',
      copyright: '© 2025 MySite. All rights reserved.',
      showSocials: true,
      footerStyle: 'split',
      padding: '48px 32px 24px',
      socials: [
        { icon: 'fa-brands fa-twitter', href: '#' },
        { icon: 'fa-brands fa-github', href: '#' },
        { icon: 'fa-brands fa-linkedin', href: '#' },
        { icon: 'fa-brands fa-instagram', href: '#' }
      ],
      links: [
        { label: 'Home', href: '#' },
        { label: 'About', href: '#about' },
        { label: 'Services', href: '#services' },
        { label: 'Contact', href: '#contact' }
      ],
      customId: '',
      customClass: '',
      // Layout
      width: '100%',
      height: 'auto',
      margin: '0',
      padding: '48px 32px 24px',
      display: 'block'
    },
    render(props) {
      const uid = props.customId || 'footer_' + Math.random().toString(36).substr(2, 9);
      const headingColor = props.headingColor || props.textColor || '#ffffff';
      const linkColor = props.linkColor || props.textColor || '#a0abc0';
      const cardBg = props.cardBg || 'rgba(255,255,255,.07)';
      const borderColor = props.borderColor || 'rgba(255,255,255,.1)';

      const linksHtml = (props.links || []).map((l, i) => {
        const path = `links.${i}`;
        const base = `color:${linkColor};text-decoration:none;font-size:0.85rem;opacity:.78;transition:opacity .2s,color .2s;display:inline-block;`;
        return `
        <li data-sf-path="${path}" style="margin-bottom:10px;">
          <a href="${l.href || '#'}" style="${BlockTypes.applySubStyle(props, path, base)}" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='.78'">
            ${l.label || 'Link'}
          </a>
        </li>`;
      }).join('');

      const socialsHtml = props.showSocials ? (props.socials || []).map((s, i) => {
        return `<a data-sf-path="socials.${i}" href="${s.href}" class="sf-footer-social-${uid}" style="width:40px;height:40px;border-radius:999px;background:${cardBg};border:1px solid ${borderColor};display:flex;align-items:center;justify-content:center;color:${props.textColor};text-decoration:none;font-size:0.95rem;"><i class="${s.icon}"></i></a>`;
      }).join('') : '';

      if (!props.segments) {
        props.segments = [
          { type: 'content' },
          { type: 'copyright' }
        ];
      }

      const footerStyle = props.footerStyle || 'split';
      const segsHtml = props.segments.map((s, i) => {
        if (s.type === 'content') {
          const contentLayout = footerStyle === 'centered'
            ? `display:flex;flex-direction:column;align-items:center;text-align:center;gap:22px;margin-bottom:36px;`
            : `display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));align-items:flex-start;gap:32px;margin-bottom:36px;`;
          const linksWrap = footerStyle === 'centered'
            ? `justify-self:center;width:min(100%,420px);text-align:center;`
            : `justify-self:end;width:min(100%,280px);`;
          const linksList = footerStyle === 'centered'
            ? `list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;justify-content:center;gap:12px 20px;`
            : `list-style:none;padding:0;margin:0;`;
          return `<div data-sf-path="segments.${i}" style="${contentLayout}">
            <div data-sf-path="segments.${i}.brand">
              <div data-sf-path="segments.${i}.brand.name" style="${BlockTypes.applySubStyle(props, `segments.${i}.brand.name`, `font-size:1.45rem;font-weight:700;color:${headingColor};margin-bottom:10px;font-family:'Poppins',sans-serif;line-height:1.15;`)}">${props.brand}</div>
              <p data-sf-path="segments.${i}.brand.tag" style="${BlockTypes.applySubStyle(props, `segments.${i}.brand.tag`, `color:${props.textColor};max-width:320px;line-height:1.7;font-size:0.92rem;margin:0;`)}">${props.tagline}</p>
              ${props.showSocials ? `<div data-sf-path="segments.${i}.brand.socials" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:18px;${footerStyle === 'centered' ? 'justify-content:center;' : ''}">${socialsHtml}</div>` : ''}
            </div>
            <div data-sf-path="segments.${i}.links-container" style="${linksWrap}">
              <h4 data-sf-path="segments.${i}.links-title" style="${BlockTypes.applySubStyle(props, `segments.${i}.links-title`, `color:${headingColor};font-weight:600;margin:0 0 16px;font-size:0.98rem;letter-spacing:0.02em;`)}">Quick Links</h4>
              <ul data-sf-path="segments.${i}.links-list" style="${linksList}">${linksHtml}</ul>
            </div>
          </div>`;
        }
        if (s.type === 'copyright') {
          const path = `segments.${i}`;
          return `<div data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, `border-top:1px solid ${borderColor};padding-top:20px;text-align:center;color:${props.textColor};font-size:0.82rem;line-height:1.6;`)}">${props.copyright}</div>`;
        }
        return '';
      }).join('');

      return `<footer id="${uid}" class="sf-footer ${props.customClass || ''}" style="background:${props.bgColor};color:${props.textColor};${BlockTypes.applyLayout(props)}box-sizing:border-box;">
  <style>
    #${uid} .sf-footer-social-${uid} {
      transition: transform .2s ease, background .2s ease, color .2s ease, border-color .2s ease, box-shadow .2s ease;
    }
    #${uid} .sf-footer-social-${uid}:hover {
      background: ${props.accentColor};
      color: ${props.bgColor};
      border-color: ${props.accentColor};
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,.16);
    }
    @media (max-width: 768px) {
      #${uid} [data-sf-path$="links-container"] {
        justify-self: start !important;
        width: 100% !important;
      }
    }
  </style>
  <div style="max-width:1100px;margin:auto;">
    ${segsHtml}
  </div>
</footer>`;
    }
  },

  button: {
    label: 'Button',
    icon: 'fa-solid fa-square',
    category: 'Layout',
    defaultProps: {
      text: 'Click Me',
      href: '#',
      actionType: 'link', // link, page, cart
      cartItemName: 'Product Name',
      cartItemPrice: '$10.00',
      cartItemImage: 'https://placehold.co/100x100',
      bgColor: '#6c63ff',
      textColor: '#ffffff',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      textAlign: 'center',
      customId: '',
      customClass: '',
      // Layout
      width: 'auto',
      height: 'auto',
      margin: '8px',
      display: 'inline-block'
    },
    render(props) {
      const uid = props.customId || 'btn_' + Math.random().toString(36).substr(2, 5);
      const style = `background:${props.bgColor}; color:${props.textColor}; padding:${props.padding}; border-radius:${props.borderRadius}; font-size:${props.fontSize}; font-weight:${props.fontWeight}; text-decoration:none; transition:opacity 0.2s; display:${props.display}; ${BlockTypes.applyLayout(props)}`;
      
      if (props.actionType === 'cart') {
          const item = JSON.stringify({
              name: props.cartItemName || 'Product',
              price: props.cartItemPrice || '$0.00',
              image: props.cartItemImage || ''
          }).replace(/"/g, '&quot;');
          return `<button id="${uid}" class="sf-button ${props.customClass || ''}" style="${style}; border:none; cursor:pointer;" onclick="if(window.Cart)window.Cart.add(${item}, this); event.stopPropagation();" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">${props.text}</button>`;
      }
      
      return `<a id="${uid}" href="${props.href}" class="sf-button ${props.customClass || ''}" style="${style}" onclick="event.stopPropagation();" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">${props.text}</a>`;
    }
  },

  text: {
    label: 'Text Block',
    icon: 'fa-solid fa-font',
    category: 'Layout',
    defaultProps: {
      html: '<h2 style="font-size:2rem;font-weight:700;color:#111;margin-bottom:12px;">Section Title</h2><p style="color:#555;line-height:1.8;max-width:700px;">Add your body text here. Click on this block to select it, then edit the HTML content in the properties panel on the right.</p>',
      badge: '',
      title: 'Section Title',
      text: 'Add your body text here.',
      bgColor: '#ffffff',
      padding: '48px 32px',
      align: 'left',
      customId: '',
      customClass: '',
      // Layout
      width: '100%',
      height: 'auto',
      margin: '0',
      padding: '48px 32px',
      display: 'block'
    },
    render(props) {
      const uid = props.customId || '';
      if (Array.isArray(props.items) && props.items.length) {
        const responsiveMin = props.items.length <= 2 ? '280px' : props.items.length <= 4 ? '220px' : '180px';
        const cards = props.items.map((item, i) => {
          const badge = item.badge || '';
          const title = item.title || `Section ${i + 1}`;
          const text = item.text || 'Add text content here.';
          return `<div data-sf-path="items.${i}" style="width:100%;padding:${props.items.length > 1 ? '18px' : '0'};${props.items.length > 1 ? 'border:1px solid rgba(15,23,42,.08);border-radius:18px;background:rgba(255,255,255,.72);' : ''}">
    ${badge ? `<span data-sf-path="items.${i}.badge" style="display:inline-block;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:#4f46e5;font-weight:700;margin-bottom:12px;">${badge}</span>` : ''}
    <h3 data-sf-path="items.${i}.title" style="font-size:${props.items.length === 1 ? '2.3rem' : '1.45rem'};font-weight:800;color:#0f172a;margin:0 0 10px;line-height:1.15;">${title}</h3>
    <p data-sf-path="items.${i}.text" style="color:#475569;line-height:1.75;margin:0;">${text}</p>
  </div>`;
        }).join('');
        return `<div id="${uid}" class="sf-text-block ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)} text-align:${props.align};">
  <div style="max-width:1100px;margin:auto;display:grid;grid-template-columns:repeat(auto-fit, minmax(min(100%, ${responsiveMin}), 1fr));gap:${props.gap || '18px'};align-items:start;">
    ${cards}
  </div>
</div>`;
      }
      if (props.title || props.text || props.badge) {
        return `<div id="${uid}" class="sf-text-block ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)} text-align:${props.align};">
  <div style="max-width:1100px;margin:auto;">
    ${props.badge ? `<span data-sf-path="badge" style="display:inline-block;font-size:.8rem;letter-spacing:.18em;text-transform:uppercase;color:#4f46e5;font-weight:700;margin-bottom:14px;">${props.badge}</span>` : ''}
    <h2 data-sf-path="title" style="font-size:2.3rem;font-weight:800;color:#0f172a;margin:0 0 14px;line-height:1.1;">${props.title || 'Section Title'}</h2>
    <p data-sf-path="text" style="color:#475569;line-height:1.8;max-width:760px;margin:${props.align === 'center' ? '0 auto' : '0'};">${props.text || ''}</p>
  </div>
</div>`;
      }
      return `<div id="${uid}" class="sf-text-block ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)} text-align:${props.align};">
  <div style="max-width:1100px;margin:auto;">${props.html}</div>
</div>`;
    }
  },

  image: {
    label: 'Image',
    icon: 'fa-solid fa-image',
    category: 'Layout',
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
      alt: 'Image',
      width: '100%',
      height: 'auto',
      maxWidth: '1200px',
      maxHeight: 'none',
      objectFit: 'cover',
      bgColor: '#f9fafb',
      padding: '40px 32px',
      borderRadius: '12px',
      caption: '',
      showDetails: true,
      description: 'Add a beautiful description for your image here.',
      rating: 5,
      customId: '',
      customClass: '',
      // Layout
      width: '100%',
      height: 'auto',
      margin: '0',
      padding: '40px 32px',
      display: 'block'
    },
    render(props) {
      const uid = props.customId || '';
      const items = MediaLayoutHelper.imageItemsFromProps(props);
      const columns = MediaLayoutHelper.getColumns(items.length);
      const gridWidth = items.length === 1 ? (props.maxWidth || '1200px') : '100%';
      const cardHeight = props.height || 'auto';
      const responsiveMin = items.length <= 2 ? '280px' : items.length <= 4 ? '220px' : '180px';

      const imageCards = items.map((item, i) => {
        const rating = Number(item.rating ?? props.rating ?? 0);
        const safeRating = Math.max(0, Math.min(5, rating));
        const stars = '&#9733;'.repeat(safeRating) + '&#9734;'.repeat(5 - safeRating);
        const caption = item.caption ?? '';
        const description = item.description ?? '';
        const captionText = props.subStyles?.[`items.${i}.caption`]?.text ?? caption;
        const descText = props.subStyles?.[`items.${i}.description`]?.text ?? description;

        return `<figure style="margin:0; padding:15px; box-sizing:border-box; width:100%; background:rgba(255,255,255,0.02); border-radius:${props.borderRadius || '12px'};">
    <img data-sf-path="items.${i}.src" src="${item.src || props.src}" alt="${item.alt || props.alt || 'Image'}" style="width:100%; height:${cardHeight}; max-height:${props.maxHeight || 'none'}; object-fit:${props.objectFit}; border-radius:${props.borderRadius}; display:block; margin:auto;"/>
    ${caption ? `<figcaption data-sf-path="items.${i}.caption" style="margin-top:10px;color:#666;font-size:0.85rem;" data-initial-value="${caption}">${captionText}</figcaption>` : ''}
    ${props.showDetails ? `
      <div style="margin-top:16px; text-align:left; padding:0 8px;">
        <div data-sf-path="items.${i}.rating" style="color:#ffc107; font-size:1.1rem; margin-bottom:8px;">${stars}</div>
        <p data-sf-path="items.${i}.description" style="font-size:0.95rem; line-height:1.5; color:#444;" data-initial-value="${description}">${descText}</p>
      </div>` : ''}
  </figure>`;
      }).join('');

      return `<div id="${uid}" class="sf-image-block ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)} text-align:center;">
  <div style="max-width:${gridWidth}; width:100%; margin:auto; display:grid; grid-template-columns:${items.length === 1 ? 'minmax(0, 1fr)' : `repeat(auto-fit, minmax(min(100%, ${responsiveMin}), 1fr))`}; gap:${props.gap || '18px'}; align-items:start;">
    ${imageCards}
  </div>
</div>`;
    }
  },

  video: {
    label: 'Video',
    icon: 'fa-solid fa-video',
    category: 'Layout',
    defaultProps: {
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumb: '',
      title: 'Video',
      autoplay: false,
      bgColor: '#0f1117',
      textColor: '#ffffff',
      accentColor: '#ffc107',
      padding: '48px 32px',
      width: '100%',
      height: 'auto',
      maxWidth: '100%',
      aspectRatio: '56.25%',
      allowMultiplePlayback: false,
      showDetails: true,
      showShare: false,
      shareButtonText: 'Share',
      description: 'This is a description for your featured video content.',
      rating: 4,
      customId: '',
      customClass: '',
      // Layout
      width: '100%',
      height: 'auto',
      margin: '0',
      padding: '48px 32px',
      display: 'block'
    },
    render(props) {
      const uid = props.customId || '';
      const layout = BlockTypes.applyLayout(props).replace(/height:[^;]+;/, 'height:auto;');
      const items = MediaLayoutHelper.videoItemsFromProps(props);
      const gridWidth = items.length === 1 ? (props.maxWidth || '100%') : '100%';
      const responsiveMin = items.length <= 2 ? '280px' : items.length <= 4 ? '220px' : '180px';
      const allowMultiplePlayback = props.allowMultiplePlayback === true;
      const shareHandlerName = `sfShareVideo_${uid || Math.random().toString(36).slice(2, 9)}`;
      const pageOrigin = (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:'))
        ? window.location.origin
        : '';

      const videoCards = items.map((item, i) => {
        const rating = Number(item.rating ?? props.rating ?? 0);
        const safeRating = Math.max(0, Math.min(5, rating));
        const stars = '&#9733;'.repeat(safeRating) + '&#9734;'.repeat(5 - safeRating);
        const mediaUrl = item.url || props.url;
        const embedUrl = VideoHelper.getEmbedUrl(mediaUrl);
        const isDirect = VideoHelper.isDirectVideo(mediaUrl);
        const isAutoHeight = props.height === 'auto' || !props.height;
        const itemAutoplay = item.autoplay ?? props.autoplay;
        const videoContentStyle = (isAutoHeight && props.aspectRatio !== '0')
          ? `position:relative; padding-bottom:${item.aspectRatio || props.aspectRatio}; height:0;`
          : `position:relative; height:${props.height || '400px'};`;
        const autoplayAttr = itemAutoplay ? 'autoplay muted playsinline' : '';
        const iframeUrl = itemAutoplay ? (embedUrl + (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1&mute=1') : embedUrl;
        const finalIframeUrl = pageOrigin && !isDirect ? (iframeUrl + (iframeUrl.includes('?') ? '&' : '?') + 'origin=' + encodeURIComponent(pageOrigin)) : iframeUrl;
        const sid = `${i}_${(Math.random() + 1).toString(36).substring(7)}`;
        let videoElement = '';
        let vplayScript = '';

        if (!isDirect && (item.thumb || props.thumb) && !itemAutoplay) {
          const autoSrc = finalIframeUrl + (finalIframeUrl.includes('?') ? '&' : '?') + 'autoplay=1&mute=1&playsinline=1';
          const safeTitle = (item.title || props.title || '').replace(/"/g, '&quot;');
          const thumb = item.thumb || props.thumb;
          videoElement = `
          <div class="sf-video-placeholder" 
               data-embed="${autoSrc.replace(/"/g, '&quot;')}" 
               data-title="${safeTitle}"
               data-allow-multiple="${allowMultiplePlayback ? 'true' : 'false'}"
               style="position:absolute;inset:0;background:url('${thumb}') center/cover no-repeat;z-index:10;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:inherit;" 
               onclick="if(window['vplay_${sid}']) window['vplay_${sid}'](this); event.stopPropagation();">
            <div style="width:64px;height:64px;background:rgba(0,0,0,0.6);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;border:2px solid rgba(255,255,255,0.8);box-shadow:0 4px 15px rgba(0,0,0,.3);transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
              <i class="fa-solid fa-play" style="margin-left:4px;"></i>
            </div>
          </div>`;
          vplayScript = `<script>
          window['vplay_${sid}'] = function(el) {
            var allowMultiple = el.getAttribute('data-allow-multiple') === 'true';
            var embed = el.getAttribute('data-embed');
            var title = el.getAttribute('data-title');
            var container = el.parentElement;
            if (container) {
              if (!allowMultiple && window.stopOtherMedia) window.stopOtherMedia(container);
              container.setAttribute('data-original-html', container.innerHTML);
              container.setAttribute('data-active-video', 'true');
              container.setAttribute('data-allow-multiple', allowMultiple ? 'true' : 'false');
              var origin = window.location.origin;
              if (origin === 'null' || origin.startsWith('file:')) origin = '*';
              var finalUrl = embed;
              if (origin !== '*' && !embed.includes('origin=')) {
                finalUrl += (embed.includes('?') ? '&' : '?') + 'origin=' + encodeURIComponent(origin);
              }
              container.innerHTML = '<iframe data-allow-multiple="'+(allowMultiple ? 'true' : 'false')+'" src="'+finalUrl+'" title="'+title+'" frameborder="0" allow="autoplay;fullscreen;encrypted-media;accelerometer;gyroscope;picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:inherit;display:block;"></iframe>';
            }
          };
        </script>`;
        } else if (!isDirect) {
          videoElement = `<iframe data-sf-path="items.${i}.url" data-allow-multiple="${allowMultiplePlayback ? 'true' : 'false'}" src="${finalIframeUrl}" title="${item.title || props.title}" frameborder="0" allow="autoplay;fullscreen;encrypted-media;accelerometer;gyroscope;picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:inherit;display:block;"></iframe>`;
        } else {
          videoElement = `<video data-sf-path="items.${i}.url" data-allow-multiple="${allowMultiplePlayback ? 'true' : 'false'}" src="${embedUrl}" controls ${autoplayAttr} ${(item.thumb || props.thumb) ? `poster="${item.thumb || props.thumb}"` : ''} style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;"></video>`;
        }

        const title = item.title || props.title || 'Video';
        const description = item.description || props.description || '';
        const titleText = props.subStyles?.[`items.${i}.title`]?.text ?? title;
        const descText = props.subStyles?.[`items.${i}.description`]?.text ?? description;
        const sharePayload = encodeURIComponent(JSON.stringify({
          title,
          url: mediaUrl,
          buttonText: item.shareButtonText || props.shareButtonText || 'Share'
        }));

        return `<div style="width:100%;">
    <div class="video-container" style="${videoContentStyle} overflow:hidden; border-radius:12px; box-shadow:0 8px 40px rgba(0,0,0,.3);">
      ${videoElement}
    </div>
    ${props.showDetails ? `
      <div data-sf-path="items.${i}" class="video-details" style="margin-top:20px; text-align:left; padding:0 8px;">
        <h4 data-sf-path="items.${i}.title" style="margin-bottom:8px; font-size:1.1rem; color:${props.textColor};" data-initial-value="${title}">${titleText}</h4>
        <div data-sf-path="items.${i}.rating" style="color:${props.accentColor}; font-size:1.1rem; margin-bottom:8px;">${stars}</div>
        <p data-sf-path="items.${i}.description" style="font-size:0.95rem; line-height:1.5; color:${props.textColor}; opacity:0.75;" data-initial-value="${description}">${descText}</p>
        ${props.showShare ? `<button type="button" onclick="event.stopPropagation(); if(window['${shareHandlerName}']) window['${shareHandlerName}']('${sharePayload}');" style="margin-top:12px;display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border:none;border-radius:999px;background:${props.accentColor};color:#fff;font-weight:600;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.18);"><i class="fa-solid fa-share-nodes"></i>${item.shareButtonText || props.shareButtonText || 'Share'}</button>` : ''}
      </div>` : ''}
    ${vplayScript}
  </div>`;
      }).join('');

      const shareScript = `<script>
        window['${shareHandlerName}'] = async function(payload){
          try {
            var data = JSON.parse(decodeURIComponent(payload));
            var shareText = data.title || 'Video';
            var shareUrl = data.url || window.location.href;
            if (navigator.share) {
              try {
                await navigator.share({ title: shareText, text: shareText, url: shareUrl });
                return;
              } catch (err) {}
            }
            var fallbackText = shareText + ' ' + shareUrl;
            if (navigator.clipboard && navigator.clipboard.writeText) {
              try {
                await navigator.clipboard.writeText(fallbackText);
                if (window.showToast) window.showToast('Video link copied.', 'success');
                return;
              } catch (err) {}
            }
            window.prompt('Copy this video link:', fallbackText);
          } catch (err) {}
        };
      <\/script>`;

      return `<div id="${uid}" class="sf-video-block ${props.customClass || ''}" style="background:${props.bgColor}; ${layout} box-sizing:border-box;">
  <div class="sf-video-inner" style="max-width:${gridWidth}; width:100%; margin:auto; display:grid; grid-template-columns:${items.length === 1 ? 'minmax(0, 1fr)' : `repeat(auto-fit, minmax(min(100%, ${responsiveMin}), 1fr))`}; gap:${props.gap || '18px'}; align-items:start;">
    ${videoCards}
  </div>
</div>${shareScript}`;
    }
  },

  html: {
    label: 'Custom HTML',
    icon: 'fa-solid fa-code',
    category: 'Advanced',
    defaultProps: {
      code: '<section style="padding:60px 32px;text-align:center;background:#f3f4f6;">\n  <h2 style="font-size:2rem;color:#111;">Custom HTML Block</h2>\n  <p style="margin-top:12px;color:#555;">Paste any HTML here.</p>\n</section>',
      customId: '',
      customClass: ''
    },
    render(props) {
      // For custom HTML, we wrap it to apply ID/Class if provided
      if (props.customId || props.customClass) {
        return `<div id="${props.customId || ''}" class="sf-html-block ${props.customClass || ''}">${props.code || ''}</div>`;
      }
      return props.code || '';
    }
  },

  container: {
    label: 'Flex Container',
    icon: 'fa-solid fa-square-plus',
    category: 'Layout',
    defaultProps: {
      padding: '40px 32px',
      bgColor: '#f9fafb',
      customId: '',
      customClass: '',
      // Layout
      width: '100%',
      height: 'auto',
      margin: '0',
      display: 'flex',
      direction: 'row',
      wrap: 'wrap',
      justify: 'center',
      align: 'stretch',
      gap: '24px',
      minHeight: '150px'
    },
    render(props) {
      const uid = props.customId || '';
      return `<section id="${uid}" class="sf-container-block ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)} box-sizing:border-box;">
        <div class="container-inner sf-internal" style="width:100%; height:100%; display:inherit; flex-direction:inherit; flex-wrap:${props.wrap || 'wrap'}; justify-content:inherit; align-items:inherit; gap:inherit; min-height:inherit; box-sizing:border-box;">
          <div class="sf-drop-hint sf-internal" style="border:2px dashed #ccc; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#999; font-size:0.9rem; width:100%; min-height:100px; flex:1;">
            Drag elements here to add them to the container
          </div>
        </div>
      </section>`;
    }
  },

  box: {
    label: 'Box / Div',
    icon: 'fa-solid fa-square-person-confining',
    category: 'Layout',
    defaultProps: {
      padding: '10px',
      bgColor: 'transparent',
      customId: '',
      customClass: '',
      width: 'auto',
      height: 'auto',
      margin: '10px',
      display: 'flex',
      direction: 'column',
      justify: 'flex-start',
      align: 'stretch',
      gap: '10px'
    },
    render(props) {
      const uid = props.customId || '';
      if (Array.isArray(props.items) && props.items.length) {
        const responsiveMin = props.items.length <= 2 ? '280px' : props.items.length <= 4 ? '220px' : '180px';
        const cards = props.items.map((item, i) => {
          const title = item.title || `Box ${i + 1}`;
          const body = item.text || 'Add content here.';
          const buttonText = item.buttonText || '';
          return `<div data-sf-path="items.${i}" style="padding:${props.padding || '20px'};background:${props.cardBg || 'rgba(255,255,255,0.8)'};border-radius:${props.borderRadius || '16px'};border:${props.borderWidth || '1px'} ${props.borderStyle || 'solid'} ${props.borderColor || 'rgba(15,23,42,.08)'};box-shadow:${props.boxShadow || '0 10px 30px rgba(15,23,42,.06)'};min-height:100%;display:flex;flex-direction:column;gap:12px;justify-content:flex-start;">
  <h3 data-sf-path="items.${i}.title" style="margin:0;font-size:1.1rem;font-weight:700;color:${props.textColor || '#0f172a'};">${title}</h3>
  <p data-sf-path="items.${i}.text" style="margin:0;color:${props.textColor || '#475569'};opacity:0.82;line-height:1.7;">${body}</p>
  ${buttonText ? `<a data-sf-path="items.${i}.buttonText" href="${item.buttonHref || '#'}" style="margin-top:auto;display:inline-flex;align-items:center;justify-content:center;padding:10px 16px;border-radius:999px;background:${props.accentColor || '#111827'};color:#fff;text-decoration:none;font-weight:600;width:max-content;">${buttonText}</a>` : ''}
</div>`;
        }).join('');
        return `<div id="${uid}" class="sf-box-block ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)}">
        <div class="container-inner" style="width:100%; height:100%; display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, ${responsiveMin}), 1fr)); gap:${props.gap || '16px'}; align-items:stretch;">
          ${cards}
        </div>
      </div>`;
      }
      return `<div id="${uid}" class="sf-box-block ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)}">
        <div class="container-inner" style="width:100%; height:100%; display:inherit; flex-direction:inherit; justify-content:inherit; align-items:inherit; gap:inherit; flex-wrap:inherit; min-height:inherit;">
          <div class="sf-drop-hint" style="border:1px dashed #ccc; border-radius:4px; padding:10px; display:flex; align-items:center; justify-content:center; color:#999; font-size:0.8rem; width:100%; min-height:40px;">
            Box
          </div>
        </div>
      </div>`;
    }
  },

  divider: {
    label: 'Divider',
    icon: 'fa-solid fa-minus',
    category: 'Layout',
    defaultProps: {
      style: 'solid',
      color: '#e5e7eb',
      thickness: '1px',
      width: '100%',
      bgColor: '#ffffff',
      padding: '20px 32px',
      customId: '',
      customClass: '',
      // Layout
      width: '100%',
      height: 'auto',
      margin: '0',
      display: 'block'
    },
    render(props) {
      const uid = props.customId || '';
      return `<div id="${uid}" class="sf-divider-block ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)}">
  <hr style="border:none;border-top:${props.thickness} ${props.style} ${props.color};width:100%;margin:0 auto;"/>
</div>`;
    }
  },

  cta: {
    label: 'CTA Banner',
    icon: 'fa-solid fa-bullhorn',
    category: 'Sections',
    defaultProps: {
      ctaLayout: 'centered',
      eyebrow: '',
      title: 'Ready to Get Started?',
      subtitle: 'Join thousands of users who trust us every day.',
      buttonText: 'Start Now',
      buttonHref: '#contact',
      bgColor: '#6c63ff',
      textColor: '#ffffff',
      accentColor: '#ffffff',
      padding: '64px 32px',
      customId: '',
      customClass: '',
      // Layout
      width: '100%',
      height: 'auto',
      margin: '0',
      display: 'block'
    },
    render(props) {
      const uid = props.customId || '';
      const layout = props.ctaLayout || 'centered';
      const eyebrowHtml = props.eyebrow
        ? `<div data-sf-path="segments.3" style="${BlockTypes.applySubStyle(props, "segments.3", `display:inline-block;margin-bottom:16px;padding:7px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.18);color:${props.textColor};font-size:.75rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;`)}">${props.eyebrow}</div>`
        : '';
      const buttonBase = `background:${props.accentColor};color:${props.bgColor};padding:15px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:1.02rem;display:inline-block;transition:opacity .2s,transform .2s;box-shadow:0 10px 30px rgba(0,0,0,.16);`;

      if (layout === 'split') {
        return `<section id="${uid}" class="sf-cta-block ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)}">
  <div style="max-width:1100px;margin:auto;display:grid;grid-template-columns:1.3fr auto;gap:28px;align-items:center;">
    <div style="text-align:left;">
      ${eyebrowHtml}
      <h2 data-sf-path="segments.0" style="${BlockTypes.applySubStyle(props, "segments.0", `color:${props.textColor};font-size:clamp(2rem,4vw,3.3rem);font-weight:800;margin-bottom:14px;font-family:'Poppins',sans-serif;line-height:1.05;`)}">${props.title}</h2>
      <p data-sf-path="segments.1" style="${BlockTypes.applySubStyle(props, "segments.1", `color:${props.textColor};opacity:.82;font-size:1.06rem;max-width:620px;line-height:1.7;margin:0;`)}">${props.subtitle}</p>
    </div>
    <div style="display:flex;justify-content:flex-end;">
      <a data-sf-path="segments.2" href="${props.buttonHref}" style="${BlockTypes.applySubStyle(props, "segments.2", buttonBase + `white-space:nowrap;`)}" onmouseover="this.style.opacity='.9';this.style.transform='translateY(-2px)'" onmouseout="this.style.opacity='1';this.style.transform='translateY(0)'">${props.buttonText}</a>
    </div>
  </div>
</section>`;
      }

      if (layout === 'card') {
        return `<section id="${uid}" class="sf-cta-block ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)}">
  <div style="max-width:860px;margin:auto;">
    <div style="padding:42px;border-radius:24px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);box-shadow:0 24px 70px rgba(0,0,0,.18);text-align:left;">
      ${eyebrowHtml}
      <h2 data-sf-path="segments.0" style="${BlockTypes.applySubStyle(props, "segments.0", `color:${props.textColor};font-size:clamp(1.9rem,4vw,3rem);font-weight:800;margin-bottom:12px;font-family:'Poppins',sans-serif;line-height:1.08;max-width:12ch;`)}">${props.title}</h2>
      <p data-sf-path="segments.1" style="${BlockTypes.applySubStyle(props, "segments.1", `color:${props.textColor};opacity:.8;font-size:1.02rem;line-height:1.7;max-width:560px;margin-bottom:26px;`)}">${props.subtitle}</p>
      <div style="display:flex;justify-content:flex-start;">
        <a data-sf-path="segments.2" href="${props.buttonHref}" style="${BlockTypes.applySubStyle(props, "segments.2", buttonBase)}" onmouseover="this.style.opacity='.9';this.style.transform='translateY(-2px)'" onmouseout="this.style.opacity='1';this.style.transform='translateY(0)'">${props.buttonText}</a>
      </div>
    </div>
  </div>
</section>`;
      }

      return `<section id="${uid}" class="sf-cta-block ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)} text-align:center;">
  ${eyebrowHtml}
  <h2 data-sf-path="segments.0" style="${BlockTypes.applySubStyle(props, "segments.0", `color:${props.textColor};font-size:clamp(1.8rem,3vw,2.8rem);font-weight:800;margin-bottom:14px;font-family:'Poppins',sans-serif;`)}">${props.title}</h2>
  <p data-sf-path="segments.1" style="${BlockTypes.applySubStyle(props, "segments.1", `color:${props.textColor};opacity:.85;font-size:1.1rem;margin-bottom:32px;max-width:500px;margin-left:auto;margin-right:auto;line-height:1.7;`)}">${props.subtitle}</p>
  <a data-sf-path="segments.2" href="${props.buttonHref}" style="${BlockTypes.applySubStyle(props, "segments.2", buttonBase)}" onmouseover="this.style.opacity='.9';this.style.transform='translateY(-2px)'" onmouseout="this.style.opacity='1';this.style.transform='translateY(0)'">${props.buttonText}</a>
</section>`;
    }
  },

  testimonials: {
    label: 'Testimonials',
    icon: 'fa-solid fa-quote-left',
    category: 'Sections',
    defaultProps: {
      id: 'testimonials',
      badge: 'Testimonials',
      title: 'What Our Clients Say',
      bgColor: '#f9fafb',
      textColor: '#111827',
      accentColor: '#6c63ff',
      padding: '80px 32px',
      testimonialLayout: 'grid',
      sectionAlign: 'center',
      columns: 3,
      cardBg: '#ffffff',
      items: [
        { name: 'Jane Doe', role: 'CEO, TechCorp', avatar: 'https://i.pravatar.cc/80?img=1', text: 'Absolutely brilliant! Saved us months of development time.' },
        { name: 'John Smith', role: 'Designer, CreativeStudio', avatar: 'https://i.pravatar.cc/80?img=3', text: 'The best product on the market. Easy to use and beautifully designed.' },
        { name: 'Alice Brown', role: 'Founder, StartupXYZ', avatar: 'https://i.pravatar.cc/80?img=5', text: 'Highly recommend to anyone who wants to launch a site quickly!' }
      ],
      customId: '',
      customClass: ''
    },
    render(props) {
      const uid = props.customId || props.id || 'testimonials';
      const layout = props.testimonialLayout || 'grid';
      const cards = (props.items || []).map((item, i) => {
        if (!item.segments) {
            item.segments = [
                { type: 'quote' },
                { type: 'text', value: item.text },
                { type: 'author', name: item.name, role: item.role, avatar: item.avatar || item.image }
            ];
        } else if (item.segments.length >= 3) {
            item.segments[1].value = item.text;
            item.segments[2].name = item.name;
            item.segments[2].role = item.role;
            item.segments[2].avatar = item.avatar || item.image;
        }

        const nestedHtml = item.segments.map((seg, si) => {
            const path = `items.${i}.segments.${si}`;
            if (seg.type === 'quote') return `<div data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, `color:${props.accentColor}; font-size:1.5rem; margin-bottom:16px;`)}"><i class="fa-solid fa-quote-left"></i></div>`;
            if (seg.type === 'text') return `<p data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, `color:${props.textColor}; opacity:0.8; font-style:italic; line-height:1.7; margin-bottom:24px; font-size:1rem;`)}">"${seg.value}"</p>`;
            if (seg.type === 'author') {
                return `<div data-sf-path="${path}" style="display:flex; align-items:center; gap:14px;">
                    <div style="width:48px; height:48px; border-radius:50%; background:url('${seg.avatar}') center/cover no-repeat;"></div>
                    <div>
                        <div data-sf-path="${path}.name" style="${BlockTypes.applySubStyle(props, path + '.name', `font-weight:700; color:${props.textColor}; font-size:0.95rem;`)}">${seg.name}</div>
                        <div data-sf-path="${path}.role" style="${BlockTypes.applySubStyle(props, path + '.role', `font-size:0.8rem; color:${props.textColor}; opacity:0.6;`)}">${seg.role}</div>
                    </div>
                </div>`;
            }
            return '';
        }).join('');

        const cardStyle = layout === 'stack'
          ? `background:${props.cardBg || '#fff'}; border-radius:18px; padding:30px; box-shadow:0 10px 30px rgba(0,0,0,0.05); border:1px solid rgba(0,0,0,0.05); display:grid; grid-template-columns:auto 1fr; gap:20px; align-items:start;`
          : layout === 'spotlight' && i === 0
            ? `background:${props.cardBg || '#fff'}; border-radius:20px; padding:40px; box-shadow:0 14px 40px rgba(0,0,0,0.06); border:1px solid rgba(0,0,0,0.05); min-height:100%;`
            : `background:${props.cardBg || '#fff'}; border-radius:16px; padding:32px; box-shadow:0 10px 30px rgba(0,0,0,0.05); border:1px solid rgba(0,0,0,0.05);`;
        return `<div data-sf-path="items.${i}" style="${cardStyle}">${nestedHtml}</div>`;
      });

      if (!props.segments) {
          props.segments = [
              { type: 'badge' },
              { type: 'title' },
              { type: 'items' }
          ];
      }

      const segsHtml = props.segments.map((s, i) => {
          const path = `segments.${i}`;
          if (s.type === 'badge') {
              return `<div data-sf-path="${path}"><span style="${BlockTypes.applySubStyle(props, path, `background:${props.accentColor};color:#fff;padding:4px 14px;border-radius:99px;font-size:0.78rem;font-weight:600;`)}">${props.badge}</span></div>`;
          }
          if (s.type === 'title') {
              return `<h2 data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, `color:${props.textColor};font-size:clamp(1.6rem,3vw,2.4rem);font-weight:700;margin:16px 0 40px;font-family:'Poppins',sans-serif;`)}">${props.title}</h2>`;
          }
          if (s.type === 'items') {
              if (layout === 'stack') {
                  return `<div data-sf-path="${path}" style="display:flex;flex-direction:column;gap:18px;text-align:left;">${cards.join('')}</div>`;
              }
              if (layout === 'spotlight' && cards.length > 1) {
                  return `<div data-sf-path="${path}" style="display:grid;grid-template-columns:1.2fr .8fr;gap:24px;text-align:left;">
                    <div>${cards[0]}</div>
                    <div style="display:flex;flex-direction:column;gap:24px;">${cards.slice(1).join('')}</div>
                  </div>`;
              }
              return `<div data-sf-path="${path}" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(${(props.columns || 3) === 2 ? '320px' : '240px'},1fr));gap:24px;text-align:left;">${cards.join('')}</div>`;
          }
          return '';
      }).join('');

      return `<section id="${uid}" class="sf-testimonials ${props.customClass || ''}" style="background:${props.bgColor}; padding:${props.padding || '80px 32px'};">
  <style>
    @media (max-width: 768px) {
      #${uid} { padding:56px 16px !important; }
      #${uid} [data-sf-path="segments.2"] { grid-template-columns:1fr !important; gap:18px !important; }
      #${uid} [data-sf-path="segments.2"] > div,
      #${uid} [data-sf-path="segments.2"] > div > div { width:100% !important; }
      #${uid} [data-sf-path^="items."] { padding:22px !important; }
    }
    #canvasFrame.mobile #${uid} { padding:56px 16px !important; }
    #canvasFrame.mobile #${uid} [data-sf-path="segments.2"] { grid-template-columns:1fr !important; gap:18px !important; }
    #canvasFrame.mobile #${uid} [data-sf-path="segments.2"] > div,
    #canvasFrame.mobile #${uid} [data-sf-path="segments.2"] > div > div { width:100% !important; }
    #canvasFrame.mobile #${uid} [data-sf-path^="items."] { padding:22px !important; }
  </style>
  <div style="max-width:1100px;margin:auto;text-align:${props.sectionAlign || 'center'};">
    ${segsHtml}
  </div>
</section>`;
    }
  },

  pricing: {
    label: 'Pricing Section',
    icon: 'fa-solid fa-tag',
    category: 'Sections',
    defaultProps: {
      id: 'pricing',
      badge: 'Pricing',
      title: 'Simple, Transparent Pricing',
      subtitle: 'Choose the plan that works best for you.',
      bgColor: '#0f1117',
      textColor: '#ffffff',
      accentColor: '#6c63ff',
      padding: '80px 32px',
      pricingLayout: 'cards',
      sectionAlign: 'center',
      columns: 3,
      plans: [
        { name: 'Starter', price: '$9', period: '/mo', featured: false, features: '5 Projects\n10 GB Storage\nBasic Support\nAPI Access', cta: 'Get Started' },
        { name: 'Pro', price: '$29', period: '/mo', featured: true, features: 'Unlimited Projects\n100 GB Storage\nPriority Support\nAPI Access\nAnalytics', cta: 'Start Free Trial' },
        { name: 'Enterprise', price: '$99', period: '/mo', featured: false, features: 'Unlimited Everything\n1 TB Storage\n24/7 Support\nCustom Integrations\nDedicated Manager', cta: 'Contact Sales' }
      ],
      customId: '',
      customClass: ''
    },
    render(props) {
      const uid = props.customId || props.id || 'pricing';
      const layout = props.pricingLayout || 'cards';
      const plansCards = (props.plans || []).map((plan, i) => {
        if (!plan.segments) {
            plan.segments = [
                { type: 'badge' },
                { type: 'name', value: plan.name },
                { type: 'price', value: plan.price, period: plan.period },
                { type: 'features', items: Array.isArray(plan.features) ? plan.features : (typeof plan.features === 'string' ? plan.features.split('\n').filter(Boolean) : []) },
                { type: 'cta', text: plan.ctaText || plan.cta || 'Get Started', href: plan.ctaHref || '#contact' }
            ];
        } else if (plan.segments.length >= 5) {
            plan.segments[1].value = plan.name;
            plan.segments[2].value = plan.price;
            plan.segments[2].period = plan.period;
            plan.segments[3].items = Array.isArray(plan.features) ? plan.features : (typeof plan.features === 'string' ? plan.features.split('\n').filter(Boolean) : []);
            plan.segments[4].text = plan.ctaText || plan.cta || 'Get Started';
            plan.segments[4].href = plan.ctaHref || '#contact';
        }

        const nestedHtml = plan.segments.map((seg, si) => {
            const hPath = `plans.${i}.segments.${si}`;
            if (seg.type === 'badge' && plan.popular) {
                return `<div data-sf-path="${hPath}" style="${BlockTypes.applySubStyle(props, hPath, `position:absolute;top:12px;right:-35px;background:#fff;color:${props.accentColor};padding:4px 40px;transform:rotate(45deg);font-size:0.75rem;font-weight:700;letter-spacing:1px;`)}">POPULAR</div>`;
            }
            if (seg.type === 'name') {
                return `<div data-sf-path="${hPath}" style="${BlockTypes.applySubStyle(props, hPath, `font-size:1rem;font-weight:700;margin-bottom:12px;opacity:0.9;text-transform:uppercase;letter-spacing:1.5px;`)}">${seg.value}</div>`;
            }
            if (seg.type === 'price') {
                return `<div data-sf-path="${hPath}" style="margin-bottom:24px;">
                    <span data-sf-path="${hPath}.val" style="${BlockTypes.applySubStyle(props, hPath + '.val', `font-size:2.5rem;font-weight:800;`)}">${seg.value}</span>
                    <span data-sf-path="${hPath}.per" style="${BlockTypes.applySubStyle(props, hPath + '.per', `font-size:1rem;opacity:0.7;`)}">/${seg.period}</span>
                </div>`;
            }
            if (seg.type === 'features') {
                const features = (seg.items || []).map((f, fi) => `<li data-sf-path="${hPath}.items.${fi}" style="${BlockTypes.applySubStyle(props, `${hPath}.items.${fi}`, `margin-bottom:12px;font-size:0.95rem;display:flex;align-items:center;gap:10px;`)}"><i class="fa-solid fa-check" style="color:${plan.popular ? '#fff' : props.accentColor};"></i> ${f}</li>`).join('');
                return `<ul data-sf-path="${hPath}" style="list-style:none;padding:0;margin:0 0 32px 0;text-align:left;">${features}</ul>`;
            }
            if (seg.type === 'cta') {
                return `<a data-sf-path="${hPath}" href="${seg.href}" style="${BlockTypes.applySubStyle(props, hPath, `display:block;background:${plan.popular ? '#fff' : props.accentColor}; color:${plan.popular ? props.accentColor : '#fff'}; padding:14px; border-radius:8px; text-decoration:none; font-weight:700; transition:opacity 0.2s;`)}" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">${seg.text}</a>`;
            }
            return '';
        }).join('');

        const cardShell = layout === 'rows'
          ? `background:${plan.popular ? props.accentColor : props.cardBg || '#fff'}; color:${plan.popular ? '#fff' : props.textColor}; border-radius:18px; padding:28px 30px; text-align:left; box-shadow:${plan.popular ? '0 20px 40px rgba(108, 99, 255, 0.3)' : '0 10px 30px rgba(0,0,0,0.05)'}; position:relative; overflow:hidden; border:1px solid ${plan.popular ? props.accentColor : 'rgba(0,0,0,0.05)'}; transition:transform 0.3s; display:grid; grid-template-columns:1fr auto; gap:24px; align-items:center;`
          : `background:${plan.popular ? props.accentColor : props.cardBg || '#fff'}; color:${plan.popular ? '#fff' : props.textColor}; border-radius:16px; padding:40px 32px; text-align:center; box-shadow:${plan.popular ? '0 20px 40px rgba(108, 99, 255, 0.3)' : '0 10px 30px rgba(0,0,0,0.05)'}; position:relative; overflow:hidden; border:1px solid ${plan.popular ? props.accentColor : 'rgba(0,0,0,0.05)'}; transition:transform 0.3s;`;
        return `
        <div data-sf-path="plans.${i}" style="${cardShell}" onmouseover="this.style.transform='translateY(-10px)'" onmouseout="this.style.transform=''">
          ${nestedHtml}
        </div>`;
      }).join('');

      if (!props.segments) {
          props.segments = [
              { type: 'badge' },
              { type: 'title' },
              { type: 'subtitle' },
              { type: 'plans' }
          ];
      }

      const segsHtml = props.segments.map((s, i) => {
          const path = `segments.${i}`;
          if (s.type === 'badge') {
              return `<div data-sf-path="${path}" style="margin-bottom:10px;"><span style="${BlockTypes.applySubStyle(props, path, `background:${props.accentColor};color:#fff;padding:4px 14px;border-radius:99px;font-size:0.78rem;font-weight:600;`)}">${props.badge}</span></div>`;
          }
          if (s.type === 'title') {
              return `<h2 data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, `color:${props.textColor};font-size:clamp(1.6rem,3vw,2.4rem);font-weight:700;margin:16px 0 10px;font-family:'Poppins',sans-serif;`)}">${props.title}</h2>`;
          }
          if (s.type === 'subtitle') {
              return `<p data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, `color:${props.textColor};opacity:.65;margin-bottom:48px;`)}">${props.subtitle}</p>`;
          }
          if (s.type === 'plans') {
              if (layout === 'rows') {
                  return `<div data-sf-path="${path}" style="display:flex;flex-direction:column;gap:20px;align-items:stretch;">${plansCards}</div>`;
              }
              return `<div data-sf-path="${path}" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(${(props.columns || 3) === 2 ? '300px' : '240px'},1fr));gap:24px;align-items:center;">${plansCards}</div>`;
          }
          return '';
      }).join('');

      return `<section id="${uid}" class="sf-pricing ${props.customClass || ''}" style="background:${props.bgColor}; padding:${props.padding || '80px 32px'};">
  <div style="max-width:1000px;margin:auto;text-align:${props.sectionAlign || 'center'};">
    ${segsHtml}
  </div>
</section>`;
    }
  },

  stats: {
    label: 'Stats / Numbers',
    icon: 'fa-solid fa-chart-bar',
    category: 'Sections',
    defaultProps: {
      bgColor: '#6c63ff',
      textColor: '#ffffff',
      padding: '60px 32px',
      statsLayout: 'grid',
      title: '',
      subtitle: '',
      columns: 4,
      cardBg: '',
      itemAlign: 'center',
      customId: '',
      customClass: '',
      items: [
        { number: '10K+', label: 'Happy Customers' },
        { number: '500+', label: 'Projects Completed' },
        { number: '50+', label: 'Team Members' },
        { number: '99%', label: 'Satisfaction Rate' }
      ]
    },
    render(props) {
      const layout = props.statsLayout || 'grid';
      const items = (props.items || []).map((item, i) => {
        const path = `items.${i}`;
        return `
        <div data-sf-path="${path}" style="text-align:${props.itemAlign || 'center'};padding:20px;color:${props.textColor};${props.cardBg ? `background:${props.cardBg};border-radius:18px;` : ''}">
          <div data-sf-path="${path}.num" style="${BlockTypes.applySubStyle(props, path + '.num', `font-size:clamp(2rem,4vw,3rem);font-weight:800;color:inherit;font-family:'Poppins',sans-serif;`)}">${item.number}</div>
          <div data-sf-path="${path}.label" style="${BlockTypes.applySubStyle(props, path + '.label', `color:inherit;opacity:.75;margin-top:8px;font-size:0.95rem;`)}">${item.label}</div>
        </div>`;
      }).join('');
      const uid = props.customId || '';

      if (!props.segments) {
          props.segments = [
              { type: 'header' },
              { type: 'items' }
          ];
      }

      const segsHtml = props.segments.map((s, i) => {
          if (s.type === 'header') {
              if (!props.title && !props.subtitle) return '';
              return `<div data-sf-path="segments.${i}" style="max-width:480px;${layout === 'split' ? '' : 'margin:0 auto 28px;'}">
                ${props.title ? `<h2 style="margin:0 0 10px 0;color:${props.textColor};font-size:clamp(1.6rem,3vw,2.6rem);font-weight:800;">${props.title}</h2>` : ''}
                ${props.subtitle ? `<p style="margin:0;color:${props.textColor};opacity:.72;line-height:1.7;">${props.subtitle}</p>` : ''}
              </div>`;
          }
          if (s.type === 'items') {
              if (layout === 'split') {
                  return `<div data-sf-path="segments.${i}" style="max-width:1180px;margin:auto;display:grid;grid-template-columns:.9fr 1.1fr;gap:32px;align-items:center;">
                    <div>${props.title || props.subtitle ? '' : `<h2 style="margin:0;color:${props.textColor};font-size:clamp(1.6rem,3vw,2.6rem);font-weight:800;line-height:1.1;">Metrics That Prove The Story</h2>`}</div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px;">${items}</div>
                  </div>`;
              }
              return `<div data-sf-path="segments.${i}" style="max-width:1100px;margin:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(${(props.columns || 4) <= 2 ? '240px' : '180px'},1fr));gap:20px;">
                ${items}
              </div>`;
          }
          return '';
      }).join('');

      return `<section id="${uid}" class="sf-stats-block ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)}">
  ${segsHtml}
</section>`;
    }
  },

  products: {
    label: 'Products Grid',
    icon: 'fa-solid fa-cart-shopping',
    category: 'Sections',
    defaultProps: {
      bgColor: '#ffffff',
      textColor: '#1a1a2e',
      accentColor: '#6c63ff',
      padding: '80px 32px',
      badge: 'OUR SHOP',
      title: 'Featured Products',
      subtitle: 'Premium assets for your next project',
      productsLayout: 'grid',
      sectionAlign: 'center',
      columns: 3,
      cardBg: '#ffffff',
      customId: '',
      customClass: '',
      items: [
        { images: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop', name: 'Premium Watch', price: '$199.00', desc: 'Elegant and durable timepiece crafted for perfection. Featuring sapphire glass, premium stainless steel, and a water-resistant design.', cta: 'Add to Cart' },
        { images: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop', name: 'Wireless Headphones', price: '$149.00', desc: 'Noise-canceling studio quality sound with 40-hour battery life, ultra-soft ear cushions, and Bluetooth 5.2 connectivity.', cta: 'Add to Cart' },
        { images: 'https://images.unsplash.com/photo-1526170315870-ef68a6f3dd39?q=80&w=2070&auto=format&fit=crop', name: 'Retro Camera', price: '$299.00', desc: 'Capture timeless memories in style. 35mm film camera with manual controls, multiple exposure mode, and vintage chrome finish.', cta: 'Add to Cart' }
      ]
    },
    render(props) {
      const uid = props.customId || 'prod_' + Math.random().toString(36).substr(2, 9);
      const safeId = uid.replace(/[^a-z0-9]/gi, '_');
      const layout = props.productsLayout || 'grid';

      // Shared Gallery Lightbox
      const lightboxHtml = `
        <div id="sf-lb-${uid}" onclick="if(event.target===this){this.style.display='none';} event.stopPropagation();" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:99999;align-items:center;justify-content:center;cursor:default;user-select:none;backdrop-filter:blur(8px);">
          <div onclick="document.getElementById('sf-lb-${uid}').style.display='none'; event.stopPropagation();" style="position:absolute;top:20px;right:24px;background:#fff;border:none;color:#1a1a2e;font-size:2.5rem;cursor:pointer;line-height:1;width:50px;height:50px;display:flex;align-items:center;justify-content:center;border-radius:50%;z-index:100001;box-shadow:0 10px 30px rgba(0,0,0,0.5);">&times;</div>
          
          <div onclick="event.stopPropagation(); if(window['lbgprev_${safeId}']) window['lbgprev_${safeId}']();" style="position:absolute;left:20px;top:50%;transform:translateY(-50%);width:50px;height:50px;background:#fff;color:#1a1a2e;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:100001;box-shadow:0 10px 30px rgba(0,0,0,0.5);transition:all 0.2s;"><i class="fa-solid fa-chevron-left"></i></div>
          <div onclick="event.stopPropagation(); if(window['lbgnext_${safeId}']) window['lbgnext_${safeId}']();" style="position:absolute;right:20px;top:50%;transform:translateY(-50%);width:50px;height:50px;background:#fff;color:#1a1a2e;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:100001;box-shadow:0 10px 30px rgba(0,0,0,0.5);transition:all 0.2s;"><i class="fa-solid fa-chevron-right"></i></div>

          <div style="width:90%;height:85%;display:flex;align-items:center;justify-content:center;position:relative;">
            <img id="sf-lb-img-${uid}" src="" style="max-width:100%;max-height:100%;border-radius:8px;object-fit:contain;box-shadow:0 25px 80px rgba(0,0,0,0.7);transition:opacity 0.2s;" />
            <div id="sf-lb-count-${uid}" style="position:absolute;bottom:-40px;left:50%;transform:translateX(-50%);color:#fff;font-weight:600;font-size:1rem;opacity:0.8;"></div>
          </div>
        </div>`;

      // Shared product detail modal (one per block)
      const detailModalHtml = `
        <div id="sf-dm-${uid}" onclick="if(event.target===this){this.style.display='none';document.body.style.overflow='';} event.stopPropagation();" style="display:none;position:fixed;inset:0;background:rgba(2,6,23,0.62);backdrop-filter:blur(10px);z-index:99998;align-items:center;justify-content:center;padding:24px;">
          <div onclick="event.stopPropagation()" style="position:relative;background:#fff;border-radius:26px;width:100%;max-width:640px;max-height:min(88vh,760px);overflow:hidden;box-shadow:0 30px 90px rgba(15,23,42,0.28);animation:sfProductFloatIn 0.26s cubic-bezier(0.16,1,0.3,1);display:flex;flex-direction:column;">
            <style>@keyframes sfProductFloatIn{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}</style>
            <div style="display:flex;justify-content:flex-end;padding:16px 16px 0;position:absolute;right:0;left:0;z-index:2;pointer-events:none;">
              <div onclick="document.getElementById('sf-dm-${uid}').style.display='none';document.body.style.overflow='';event.stopPropagation();" style="margin-left:auto;background:rgba(255,255,255,0.9);backdrop-filter:blur(8px);border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:1.35rem;display:flex;align-items:center;justify-content:center;pointer-events:auto;box-shadow:0 10px 30px rgba(15,23,42,0.12);">&times;</div>
            </div>
            <img id="sf-dm-img-${uid}" src="" style="width:100%;max-height:320px;object-fit:cover;background:#f8fafc;flex-shrink:0;" />
            <div style="padding:26px 26px 28px;overflow-y:auto;">
              <h2 id="sf-dm-name-${uid}" style="margin:0 0 6px 0;font-size:1.55rem;font-weight:800;color:#0f172a;line-height:1.15;"></h2>
              <div id="sf-dm-price-${uid}" style="font-size:1.35rem;font-weight:800;color:${props.accentColor};margin-bottom:16px;"></div>
              <p id="sf-dm-desc-${uid}" style="font-size:0.96rem;line-height:1.8;color:#475569;margin:0 0 24px;white-space:pre-line;"></p>
              <button id="sf-dm-cart-${uid}" class="sf-add-to-cart" data-name="" data-price="" data-image="" style="width:100%;padding:15px 18px;border-radius:14px;border:none;background:${props.accentColor};color:#fff;font-weight:700;font-size:0.98rem;cursor:pointer;box-shadow:0 16px 30px ${props.accentColor}33;" onclick="if(window.Cart)Cart.add({},this);event.stopPropagation();">${props.items?.[0]?.cta || 'Add to Cart'}</button>
            </div>
          </div>
        </div>`;

      const cards = (props.items || []).map((item, i) => {
        const allImgs = (item.images || item.image || '').split(',').map(s => s.trim()).filter(Boolean);
        const firstImg = allImgs[0] || 'https://placehold.co/400x400?text=Product';
        const escapedDesc = (item.desc || '').replace(/'/g, "\\'").replace(/\n/g, '\\n');
        const escapedName = (item.name || '').replace(/'/g, "\\'");
        const imgListJson = JSON.stringify(allImgs).replace(/"/g, '&quot;');

        // Thumbnail strip (shown only if >1 image)
        const thumbStrip = allImgs.length > 1 ? `
          <div style="display:flex;gap:8px;padding:8px 12px 0;overflow-x:auto;scrollbar-width:none;">
            ${allImgs.map((img, ti) => `
              <div onclick="var card=this.closest('[data-sf-card]'); card.querySelector('img.sf-main-img').src='${img}'; var ts=card.querySelectorAll('.sf-thumb-${safeId}'); ts.forEach(t=>t.style.border='2px solid transparent'); this.style.border='2px solid ${props.accentColor}'; event.stopPropagation();" class="sf-thumb-${safeId}" style="width:52px;height:52px;background:url('${img}') center/cover no-repeat;border-radius:8px;cursor:pointer;flex-shrink:0;transition:all 0.2s;border:2px solid ${ti===0?props.accentColor:'transparent'};"></div>
            `).join('')}
          </div>` : '';

        // Open detail modal function
        const openModal = `
          var m=document.getElementById('sf-dm-${uid}');
          document.getElementById('sf-dm-img-${uid}').src='${firstImg}';
          document.getElementById('sf-dm-name-${uid}').textContent='${escapedName}';
          document.getElementById('sf-dm-price-${uid}').textContent='${item.price || ''}';
          document.getElementById('sf-dm-desc-${uid}').textContent='${escapedDesc}';
          var cb=document.getElementById('sf-dm-cart-${uid}');
          cb.setAttribute('data-name','${escapedName}');
          cb.setAttribute('data-price','${item.price || ''}');
          cb.setAttribute('data-image','${firstImg}');
          m.style.display='flex';document.body.style.overflow='hidden';
        `.replace(/\n\s*/g, '');

        const cardStyle = layout === 'list'
          ? `background:${props.cardBg || '#fff'};border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.07);border:1px solid rgba(0,0,0,0.05);transition:transform 0.3s;pointer-events:auto;display:grid;grid-template-columns:280px 1fr;align-items:stretch;`
          : `background:${props.cardBg || '#fff'};border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.07);border:1px solid rgba(0,0,0,0.05);transition:transform 0.3s;pointer-events:auto;`;
        return `
          <div data-sf-path="items.${i}" data-sf-card="1" style="${cardStyle}" onmouseover="this.style.transform='translateY(-8px)'" onmouseout="this.style.transform=''">
            <div style="aspect-ratio:1/1;overflow:hidden;background:#f8f9fa;position:relative;cursor:zoom-in;" data-images="${imgListJson}" onclick="if(window['lbopen_${safeId}']) window['lbopen_${safeId}'](this); event.stopPropagation();">
              <img class="sf-main-img" src="${firstImg}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;transition:opacity 0.3s;" />
              <div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.45);color:#fff;border-radius:6px;padding:4px 8px;font-size:0.72rem;pointer-events:none;">${allImgs.length > 1 ? `<i class="fa-solid fa-images" style="margin-right:4px;"></i>${allImgs.length} photos` : '<i class="fa-solid fa-magnifying-glass-plus"></i>'}</div>
            </div>
            ${thumbStrip}
            <div style="padding:20px;">
              <h3 data-sf-path="items.${i}.name" style="${BlockTypes.applySubStyle(props, `items.${i}.name`, `margin:0 0 4px 0;font-size:1.1rem;font-weight:700;color:${props.textColor};`)}">${item.name}</h3>
              <div data-sf-path="items.${i}.price" style="${BlockTypes.applySubStyle(props, `items.${i}.price`, `font-size:1.3rem;font-weight:800;color:${props.accentColor};margin-bottom:8px;`)}">${item.price}</div>
              <p data-sf-path="items.${i}.desc" style="${BlockTypes.applySubStyle(props, `items.${i}.desc`, `font-size:0.9rem;color:${props.textColor};opacity:0.65;margin:0 0 6px;line-height:1.6;`)}">${item.desc || ''}</p>
              ${item.desc && item.desc.length > 60 ? `<div onclick="event.preventDefault(); event.stopPropagation(); ${openModal}" style="cursor:pointer;font-size:0.82rem;color:${props.accentColor};font-weight:600;margin-bottom:14px;display:inline-block;">Read more</div>` : '<div style="margin-bottom:14px;"></div>'}
              <button data-sf-path="items.${i}.cta" class="sf-add-to-cart" data-name="${item.name}" data-price="${item.price || ''}" data-image="${firstImg}" style="${BlockTypes.applySubStyle(props, `items.${i}.cta`, `width:100%;padding:12px;border-radius:8px;border:none;background:${props.accentColor};color:#fff;font-weight:700;cursor:pointer;transition:opacity 0.2s;`)}" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'" onclick="if(window.Cart)Cart.add({name:'${escapedName}',price:'${item.price || ''}',image:'${firstImg}'},this);event.stopPropagation();">${item.cta || 'Add to Cart'}</button>
            </div>
          </div>`;
      }).join('');

      if (!props.segments) {
        props.segments = [{ type: 'badge' }, { type: 'title' }, { type: 'subtitle' }, { type: 'items' }];
      }

      const script = `<script>
(function(){
  var sid = '${safeId}';
  var curImgs = [];
  var curIdx = 0;
  var lb = document.getElementById('sf-lb-${uid}');
  var lbImg = document.getElementById('sf-lb-img-${uid}');
  var lbCount = document.getElementById('sf-lb-count-${uid}');

  window['lbopen_' + sid] = function(el) {
    curImgs = JSON.parse(el.getAttribute('data-images') || '[]');
    if(curImgs.length === 0) return;
    var currentSrc = el.querySelector('img.sf-main-img').src;
    curIdx = curImgs.indexOf(currentSrc);
    if(curIdx === -1) curIdx = 0;
    updateLb();
    lb.style.display = 'flex';
  };

  window['lbgnext_' + sid] = function() {
    if(curImgs.length <= 1) return;
    curIdx = (curIdx + 1) % curImgs.length;
    updateLb();
  };

  window['lbgprev_' + sid] = function() {
    if(curImgs.length <= 1) return;
    curIdx = (curIdx - 1 + curImgs.length) % curImgs.length;
    updateLb();
  };

  function updateLb() {
    if(!curImgs[curIdx]) return;
    lbImg.style.opacity = '0';
    setTimeout(function(){
      lbImg.src = curImgs[curIdx];
      lbImg.style.opacity = '1';
      lbCount.textContent = (curIdx + 1) + ' / ' + curImgs.length;
    }, 100);
  }
})();
<\/script>`;

      const segsHtml = props.segments.map((s, i) => {
        const path = `segments.${i}`;
        if (s.type === 'badge') return `<div data-sf-path="${path}" style="margin-bottom:12px;"><span style="${BlockTypes.applySubStyle(props, path, `background:${props.accentColor}22;color:${props.accentColor};padding:6px 16px;border-radius:99px;font-size:0.75rem;font-weight:700;letter-spacing:1px;`)}">${props.badge}</span></div>`;
        if (s.type === 'title') return `<h2 data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, `margin:0 0 12px 0;font-size:clamp(2rem,4vw,3rem);font-weight:800;color:${props.textColor};`)}">${props.title}</h2>`;
        if (s.type === 'subtitle') return `<p data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, `margin:0 0 48px 0;font-size:1.1rem;color:${props.textColor};opacity:0.6;max-width:600px;${(props.sectionAlign || 'center') === 'center' ? 'margin-left:auto;margin-right:auto;' : ''}`)}">${props.subtitle}</p>`;
        if (s.type === 'items') {
          if (layout === 'list') return `<div data-sf-path="${path}" style="display:flex;flex-direction:column;gap:22px;">${cards}</div>`;
          if (layout === 'feature') return `<div data-sf-path="${path}" class="sf-products-feature-${uid}" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px;">${cards}</div>`;
          return `<div data-sf-path="${path}" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(${(props.columns || 3) === 2 ? '300px' : '240px'},1fr));gap:32px;">${cards}</div>`;
        }
        return '';
      }).join('');

      return `<section id="${uid}" class="sf-products ${props.customClass || ''}" style="background:${props.bgColor};padding:${props.padding};position:relative;">
        <style>
          .sf-thumb-${safeId} { opacity: 0.85; transition: all 0.2s; }
          .sf-thumb-${safeId}:hover { opacity: 1; transform: scale(1.05); }
          .sf-products-feature-${uid} > [data-sf-card="1"]:first-child { grid-column: span 2; }
          @media (max-width: 860px) {
            .sf-products-feature-${uid} { grid-template-columns: 1fr !important; }
            .sf-products-feature-${uid} > [data-sf-card="1"]:first-child { grid-column: span 1; }
          }
          @media (max-width: 768px) {
            #${uid} { padding:56px 16px !important; }
            #${uid} [data-sf-path="segments.3"] { gap:18px !important; }
            #${uid} [data-sf-path="segments.3"] > [data-sf-card="1"] { display:block !important; }
            #${uid} [data-sf-path="segments.3"] > [data-sf-card="1"] > div:first-child { aspect-ratio: 4 / 3 !important; }
          }
          #canvasFrame.mobile #${uid} { padding:56px 16px !important; }
          #canvasFrame.mobile #${uid} [data-sf-path="segments.3"] { gap:18px !important; }
          #canvasFrame.mobile #${uid} [data-sf-path="segments.3"] > [data-sf-card="1"] { display:block !important; }
          #canvasFrame.mobile #${uid} [data-sf-path="segments.3"] > [data-sf-card="1"] > div:first-child { aspect-ratio: 4 / 3 !important; }
        </style>
        ${lightboxHtml}
        ${detailModalHtml}
        <div style="max-width:1200px;margin:auto;text-align:${props.sectionAlign || 'center'};">
          ${segsHtml}
        </div>
        ${script}
      </section>`;
    }
  },






  roadmap: {
    label: 'Roadmap / Timeline',
    icon: 'fa-solid fa-timeline',
    category: 'Sections',
    defaultProps: {
      bgColor: '#1a1a2e',
      bgImage: '',
      textColor: '#ffffff',
      accentColor: '#6c63ff',
      padding: '80px 32px',
      sectionAlign: 'center',
      layoutStyle: 'timeline',
      title: 'Our Roadmap',
      subtitle: 'The journey to our vision',
      customId: '',
      customClass: '',
      items: [
        { date: 'Phase 1 - Q1 2024', title: 'Foundation & Research', desc: 'Initial research, team formation, and core architecture design.', status: 'completed', icon: 'fa-solid fa-flask', link: '' },
        { date: 'Phase 2 - Q2 2024', title: 'Beta Launch', desc: 'Public beta release for early adopters and feedback collection.', status: 'current', icon: 'fa-solid fa-rocket', link: 'https://example.com' },
        { date: 'Phase 3 - Q3 2024', title: 'Ecosystem Expansion', desc: 'Adding new features, integrations, and performance optimizations.', status: 'upcoming', icon: '', link: '' },
        { date: 'Phase 4 - Q4 2024', title: 'Global Scaling', desc: 'Scaling infrastructure for global availability and enterprise support.', status: 'upcoming', icon: '', link: '' }
      ]
    },
    render(props) {
      const uid = props.customId || 'road_' + Math.random().toString(36).substr(2, 9);
      if ((props.layoutStyle || 'timeline') === 'showcase') {
        const showcaseItems = (props.items || []).map((item, i) => {
          const alignRight = i % 2 === 1;
          const icon = item.icon || 'fa-solid fa-gift';
          const lines = String(item.desc || '')
            .split('\n')
            .filter(Boolean)
            .map((line, li) => `<div data-sf-path="items.${i}.desc.${li}" style="${BlockTypes.applySubStyle(props, `items.${i}.desc.${li}`, `font-size:1.02rem;line-height:1.7;color:${props.textColor};`)}">${line}</div>`)
            .join('');
          const cardBase = `position:relative;max-width:min(460px, calc(100% - 70px));margin:${alignRight ? '0 0 0 auto' : '0 auto 0 0'};padding:28px 26px;border-radius:22px;background:linear-gradient(135deg, rgba(193,98,18,0.96) 0%, rgba(238,170,72,0.96) 100%);box-shadow:0 20px 45px rgba(0,0,0,0.28);text-align:left;overflow:hidden;`;
          return `<div data-sf-path="items.${i}" class="sf-roadmap-showcase-item ${alignRight ? 'is-right' : 'is-left'}" style="position:relative;display:flex;justify-content:${alignRight ? 'flex-end' : 'flex-start'};margin-bottom:38px;">
            <div class="sf-roadmap-showcase-line" style="position:absolute;left:50%;top:18px;bottom:${i === (props.items || []).length - 1 ? '18px' : '-38px'};width:2px;background:rgba(255,255,255,0.72);transform:translateX(-50%);"></div>
            <div class="sf-roadmap-showcase-dot" style="position:absolute;left:50%;top:50%;transform:translate(-50%, -50%);width:34px;height:34px;border-radius:50%;background:#000;border:2px solid #fff;display:flex;align-items:center;justify-content:center;z-index:3;box-shadow:0 10px 25px rgba(0,0,0,0.35);">
              <i class="${icon}" style="font-size:14px;color:#fff;"></i>
            </div>
            <div class="sf-roadmap-showcase-card" style="${cardBase}">
              <div style="position:absolute;inset:0;background:linear-gradient(140deg, transparent 0%, transparent 52%, rgba(255,228,164,0.22) 52%, rgba(255,228,164,0.22) 70%, transparent 70%);pointer-events:none;"></div>
              <div style="position:relative;z-index:1;">
                <h3 data-sf-path="items.${i}.title" style="${BlockTypes.applySubStyle(props, `items.${i}.title`, `margin:0 0 12px;font-size:1.95rem;font-weight:800;color:${props.textColor};line-height:1.2;`)}">${item.title}</h3>
                <div style="display:flex;flex-direction:column;gap:6px;">${lines}</div>
              </div>
            </div>
          </div>`;
        }).join('');

        const bgLayer = props.bgImage
          ? `background:
              linear-gradient(rgba(18,11,7,0.55), rgba(18,11,7,0.55)),
              url('${props.bgImage}') center/cover no-repeat;`
          : `background:${props.bgColor};`;

        return `<section id="${uid}" class="sf-roadmap ${props.customClass || ''}" style="${bgLayer}padding:${props.padding};">
        <style>
          @media (max-width: 768px) {
            #${uid} { padding: 56px 16px !important; }
            #${uid} .sf-roadmap-showcase-item { justify-content:flex-start !important; margin-bottom:28px !important; padding-left:52px; }
            #${uid} .sf-roadmap-showcase-line { left:18px !important; transform:none !important; }
            #${uid} .sf-roadmap-showcase-dot { left:18px !important; top:28px !important; transform:translate(-50%, 0) !important; }
            #${uid} .sf-roadmap-showcase-card { max-width:100% !important; width:100% !important; margin:0 !important; padding:22px 18px !important; border-radius:18px !important; }
            #${uid} h3[data-sf-path*=".title"] { font-size:1.45rem !important; }
          }
          #canvasFrame.mobile #${uid} { padding: 56px 16px !important; }
          #canvasFrame.mobile #${uid} .sf-roadmap-showcase-item { justify-content:flex-start !important; margin-bottom:28px !important; padding-left:52px; }
          #canvasFrame.mobile #${uid} .sf-roadmap-showcase-line { left:18px !important; transform:none !important; }
          #canvasFrame.mobile #${uid} .sf-roadmap-showcase-dot { left:18px !important; top:28px !important; transform:translate(-50%, 0) !important; }
          #canvasFrame.mobile #${uid} .sf-roadmap-showcase-card { max-width:100% !important; width:100% !important; margin:0 !important; padding:22px 18px !important; border-radius:18px !important; }
          #canvasFrame.mobile #${uid} h3[data-sf-path*=".title"] { font-size:1.45rem !important; }
        </style>
        <div style="max-width:1080px;margin:auto;text-align:${props.sectionAlign || 'center'};">
          ${props.badge ? `<div style="margin-bottom:10px;"><span data-sf-path="badge" style="${BlockTypes.applySubStyle(props, 'badge', `display:inline-block;padding:6px 16px;border-radius:999px;background:rgba(255,255,255,0.14);color:${props.textColor};font-size:0.8rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;`)}">${props.badge}</span></div>` : ''}
          ${props.title ? `<h2 data-sf-path="title" style="${BlockTypes.applySubStyle(props, 'title', `margin:0 0 12px;font-size:clamp(2.2rem,4vw,3.4rem);font-weight:900;color:${props.textColor};`)}">${props.title}</h2>` : ''}
          ${props.subtitle ? `<p data-sf-path="subtitle" style="${BlockTypes.applySubStyle(props, 'subtitle', `margin:0 0 56px;font-size:1.05rem;color:${props.textColor};opacity:0.82;`)}">${props.subtitle}</p>` : '<div style="height:18px;"></div>'}
          <div data-sf-path="items" style="position:relative;display:flex;flex-direction:column;gap:0;">${showcaseItems}</div>
        </div>
      </section>`;
      }
      const items = (props.items || []).map((item, i) => {
        const isCompleted = item.status === 'completed';
        const isCurrent = item.status === 'current';
        const dotColor = isCompleted ? '#2ecc71' : (isCurrent ? props.accentColor : 'rgba(255,255,255,0.15)');
        const dotShadow = isCurrent ? `box-shadow:0 0 18px ${props.accentColor};` : '';
        const statusLabel = isCompleted ? 'Completed' : (isCurrent ? 'In Progress' : 'Upcoming');
        const statusColor = isCompleted ? '#2ecc71' : (isCurrent ? props.accentColor : 'rgba(255,255,255,0.3)');

        // Dot: show icon inside if provided, else plain dot
        const dotHtml = item.icon
          ? `<div style="position:absolute;left:0;top:4px;width:22px;height:22px;border-radius:50%;background:${dotColor};${dotShadow}display:flex;align-items:center;justify-content:center;z-index:2;">
               <i class="${item.icon}" style="font-size:10px;color:#fff;"></i>
             </div>`
          : `<div style="position:absolute;left:3px;top:8px;width:16px;height:16px;border-radius:50%;background:${dotColor};${dotShadow}border:2px solid ${isCurrent ? '#fff' : 'transparent'};z-index:2;"></div>`;

        // Link button (optional)
        const linkHtml = item.link
          ? `<a href="${item.link}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;margin-top:12px;padding:8px 16px;border-radius:8px;background:${props.accentColor}22;color:${props.accentColor};font-size:0.82rem;font-weight:700;text-decoration:none;border:1px solid ${props.accentColor}44;transition:background 0.2s;" onmouseover="this.style.background='${props.accentColor}44'" onmouseout="this.style.background='${props.accentColor}22'">Learn More <i class="fa-solid fa-arrow-right" style="font-size:0.75rem;"></i></a>`
          : '';

        if ((props.layoutStyle || 'timeline') === 'grid') {
          return `
          <div data-sf-path="items.${i}" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:24px;text-align:left;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
              <span data-sf-path="items.${i}.date" style="${BlockTypes.applySubStyle(props, `items.${i}.date`, `font-size:0.78rem;font-weight:700;color:${props.accentColor};text-transform:uppercase;letter-spacing:1px;`)}">${item.date}</span>
              <span style="font-size:0.7rem;font-weight:600;padding:2px 8px;border-radius:99px;background:${statusColor}22;color:${statusColor};border:1px solid ${statusColor}44;">${statusLabel}</span>
            </div>
            <h3 data-sf-path="items.${i}.title" style="${BlockTypes.applySubStyle(props, `items.${i}.title`, `margin:0 0 8px 0;font-size:1.2rem;font-weight:700;color:${props.textColor};`)}">${item.title}</h3>
            <p data-sf-path="items.${i}.desc" style="${BlockTypes.applySubStyle(props, `items.${i}.desc`, `margin:0;font-size:0.92rem;color:${props.textColor};opacity:0.6;line-height:1.7;`)}">${item.desc}</p>
            ${linkHtml}
          </div>`;
        }
        return `
          <div data-sf-path="items.${i}" style="position:relative;padding-left:44px;margin-bottom:44px;text-align:left;">
            ${i < props.items.length - 1 ? `<div style="position:absolute;left:10px;top:28px;bottom:-44px;width:2px;background:linear-gradient(to bottom,${dotColor},rgba(255,255,255,0.05));"></div>` : ''}
            ${dotHtml}
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px 24px;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                <span data-sf-path="items.${i}.date" style="${BlockTypes.applySubStyle(props, `items.${i}.date`, `font-size:0.78rem;font-weight:700;color:${props.accentColor};text-transform:uppercase;letter-spacing:1px;`)}">${item.date}</span>
                <span style="font-size:0.7rem;font-weight:600;padding:2px 8px;border-radius:99px;background:${statusColor}22;color:${statusColor};border:1px solid ${statusColor}44;">${statusLabel}</span>
              </div>
              <h3 data-sf-path="items.${i}.title" style="${BlockTypes.applySubStyle(props, `items.${i}.title`, `margin:0 0 8px 0;font-size:1.2rem;font-weight:700;color:${props.textColor};`)}">${item.title}</h3>
              <p data-sf-path="items.${i}.desc" style="${BlockTypes.applySubStyle(props, `items.${i}.desc`, `margin:0;font-size:0.92rem;color:${props.textColor};opacity:0.6;line-height:1.7;`)}">${item.desc}</p>
              ${linkHtml}
            </div>
          </div>`;
      }).join('');

      if (!props.segments) {
        props.segments = [{ type: 'title' }, { type: 'subtitle' }, { type: 'items' }];
      }

      const segsHtml = props.segments.map((s, i) => {
        const path = `segments.${i}`;
        if (s.type === 'title') return `<h2 data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, `margin:0 0 12px 0;font-size:clamp(2rem,4vw,3rem);font-weight:800;color:${props.textColor};`)}">${props.title}</h2>`;
        if (s.type === 'subtitle') return `<p data-sf-path="${path}" style="${BlockTypes.applySubStyle(props, path, `margin:0 0 56px 0;font-size:1.1rem;color:${props.textColor};opacity:0.6;`)}">${props.subtitle}</p>`;
        if (s.type === 'items') return `<div data-sf-path="${path}" style="${(props.layoutStyle || 'timeline') === 'grid' ? 'display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:22px;' : 'max-width:680px;margin:auto;'}">${items}</div>`;
        return '';
      }).join('');

      return `<section id="${uid}" class="sf-roadmap ${props.customClass || ''}" style="background:${props.bgColor};padding:${props.padding};">
        <div style="max-width:1000px;margin:auto;text-align:${props.sectionAlign || 'center'};">
          ${segsHtml}
        </div>
      </section>`;
    }
  },

  table: {
    label: 'Table',
    icon: 'fa-solid fa-table',
    category: 'Sections',
    defaultProps: {
      badge: 'Comparison',
      title: 'Feature Comparison Table',
      subtitle: 'Use this section for pricing, package comparison, schedules, or downloadable resource lists.',
      bgColor: '#f8fafc',
      textColor: '#0f172a',
      accentColor: '#6c63ff',
      cardBg: '#ffffff',
      borderColor: '#dbe4f0',
      padding: '72px 24px',
      sectionAlign: 'center',
      columnCount: '4',
      header1: 'Plan',
      header2: 'Price',
      header3: 'Best For',
      header4: 'Action',
      rows: [
        { col1: 'Starter', col2: '$19', col3: 'Solo creators', col4: 'Choose plan' },
        { col1: 'Growth', col2: '$49', col3: 'Small teams', col4: 'Choose plan' },
        { col1: 'Scale', col2: '$99', col3: 'Agencies', col4: 'Choose plan' }
      ],
      customId: '',
      customClass: ''
    },
    render(props) {
      const uid = props.customId || 'table_' + Math.random().toString(36).substr(2, 9);
      const rows = Array.isArray(props.rows) ? props.rows : [];
      const configuredCount = Math.max(2, parseInt(props.columnCount || '4', 10) || 4);
      const headerNumbers = Object.keys(props || {})
        .map((key) => /^header(\d+)$/.exec(key))
        .filter(Boolean)
        .map((match) => parseInt(match[1], 10));
      const rowNumbers = rows.flatMap((row) => Object.keys(row || {})
        .map((key) => /^col(\d+)$/.exec(key))
        .filter(Boolean)
        .map((match) => parseInt(match[1], 10)));
      const detectedColumns = Math.max(0, ...headerNumbers, ...rowNumbers);
      const activeColumns = Math.max(configuredCount, detectedColumns || 0);
      const headers = Array.from({ length: activeColumns }, (_, index) => props[`header${index + 1}`] || '');
      const tableHead = headers.map((label, index) => `
        <th data-sf-path="header${index + 1}" style="${BlockTypes.applySubStyle(props, `header${index + 1}`, `padding:18px 20px;text-align:left;font-size:0.82rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${props.textColor};background:${props.cardBg};border-bottom:1px solid ${props.borderColor};white-space:nowrap;`)}">
          ${label || `Column ${index + 1}`}
        </th>
      `).join('');

      const tableRows = rows.map((row, rowIndex) => {
        const cells = headers.map((_, colIndex) => {
          const key = `col${colIndex + 1}`;
          const isActionCell = colIndex === headers.length - 1 && /action|button|download|cta/i.test((headers[colIndex] || '').toString());
          const cellValue = row?.[key] || '';
          const cellStyle = `padding:18px 20px;border-bottom:1px solid ${props.borderColor};color:${props.textColor};font-size:0.96rem;line-height:1.6;vertical-align:top;text-align:left;`;
          const actionMarkup = `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:140px;padding:10px 16px;border-radius:999px;background:${props.accentColor};color:#fff;font-weight:700;font-size:0.9rem;white-space:nowrap;">${cellValue || 'Action'}</span>`;
          return `<td data-sf-path="rows.${rowIndex}.${key}" style="${BlockTypes.applySubStyle(props, `rows.${rowIndex}.${key}`, cellStyle)}">${isActionCell && cellValue ? actionMarkup : (cellValue || '&nbsp;')}</td>`;
        }).join('');
        return `<tr data-sf-path="rows.${rowIndex}" style="background:${rowIndex % 2 === 0 ? props.cardBg : `${props.cardBg}f2`};">${cells}</tr>`;
      }).join('');

      return `<section id="${uid}" class="sf-table-block ${props.customClass || ''}" style="background:${props.bgColor};padding:${props.padding};">
        <style>
          #${uid} .sf-table-shell { max-width:1180px; margin:auto; }
          #${uid} .sf-table-wrap { overflow-x:auto; border:1px solid ${props.borderColor}; border-radius:24px; background:${props.cardBg}; box-shadow:0 18px 48px rgba(15,23,42,0.08); }
          #${uid} table { width:100%; table-layout:fixed; border-collapse:separate; border-spacing:0; min-width:${Math.max(720, headers.length * 180)}px; }
          #${uid} th, #${uid} td { width:${(100 / Math.max(1, headers.length)).toFixed(4)}%; box-sizing:border-box; text-align:left; }
          #${uid} td { word-break:break-word; }
          #${uid} tbody tr:last-child td { border-bottom:none; }
          #${uid} thead th:first-child { border-top-left-radius:24px; }
          #${uid} thead th:last-child { border-top-right-radius:24px; }
          #${uid} tbody tr:last-child td:first-child { border-bottom-left-radius:24px; }
          #${uid} tbody tr:last-child td:last-child { border-bottom-right-radius:24px; }
          @media (max-width: 768px) {
            #${uid} { padding:56px 16px !important; }
            #${uid} .sf-table-wrap { border-radius:18px !important; }
            #${uid} table { min-width:${Math.max(560, headers.length * 150)}px !important; }
          }
          #canvasFrame.mobile #${uid} { padding:56px 16px !important; }
          #canvasFrame.mobile #${uid} .sf-table-wrap { border-radius:18px !important; }
          #canvasFrame.mobile #${uid} table { min-width:${Math.max(560, headers.length * 150)}px !important; }
        </style>
        <div class="sf-table-shell" style="text-align:${props.sectionAlign || 'center'};">
          ${props.badge ? `<div style="margin-bottom:10px;"><span data-sf-path="badge" style="${BlockTypes.applySubStyle(props, 'badge', `display:inline-block;padding:6px 14px;border-radius:999px;background:${props.accentColor}18;color:${props.accentColor};font-size:0.78rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;`)}">${props.badge}</span></div>` : ''}
          ${props.title ? `<h2 data-sf-path="title" style="${BlockTypes.applySubStyle(props, 'title', `margin:0 0 12px;font-size:clamp(2rem,4vw,3rem);font-weight:800;color:${props.textColor};`)}">${props.title}</h2>` : ''}
          ${props.subtitle ? `<p data-sf-path="subtitle" style="${BlockTypes.applySubStyle(props, 'subtitle', `margin:0 auto 34px;max-width:760px;font-size:1rem;line-height:1.75;color:${props.textColor};opacity:0.68;`)}">${props.subtitle}</p>` : ''}
          <div class="sf-table-wrap">
            <table>
              <thead><tr>${tableHead}</tr></thead>
              <tbody data-sf-path="rows">${tableRows}</tbody>
            </table>
          </div>
        </div>
      </section>`;
    }
  },

  word: {
    label: 'MS Word Content',
    icon: 'fa-solid fa-file-word',
    category: 'Sections',
    defaultProps: {
      title: 'MS Word Content',
      subtitle: 'Paste rich content from Microsoft Word and keep the copied formatting on your website.',
      bgColor: '#f8fafc',
      textColor: '#0f172a',
      cardBg: '#ffffff',
      borderColor: '#dbe4f0',
      padding: '72px 24px',
      sectionAlign: 'left',
      contentHtml: '<h2 style="margin:0 0 16px;">Paste your Word content here</h2><p style="margin:0 0 12px;line-height:1.8;">Open the block settings, then paste formatted text from Microsoft Word into the <strong>Word Content Box</strong>.</p><ul style="margin:0;padding-left:22px;line-height:1.8;"><li>Text formatting is preserved</li><li>Lists and tables are supported</li><li>Images copied with Word content can appear too</li></ul>',
      customId: '',
      customClass: ''
    },
    render(props) {
      const uid = props.customId || 'word_' + Math.random().toString(36).substr(2, 9);
      return `<section id="${uid}" class="sf-word-block ${props.customClass || ''}" style="background:${props.bgColor};padding:${props.padding};">
        <style>
          #${uid} .sf-word-shell { max-width:1100px; margin:auto; }
          #${uid} .sf-word-card { background:${props.cardBg || '#ffffff'}; border:1px solid ${props.borderColor || '#dbe4f0'}; border-radius:24px; padding:30px; box-shadow:0 18px 48px rgba(15,23,42,0.08); overflow:hidden; }
          #${uid} .sf-word-content { color:${props.textColor}; text-align:left; line-height:1.7; }
          #${uid} .sf-word-content img { max-width:100%; height:auto; display:block; }
          #${uid} .sf-word-content table { width:100% !important; max-width:100%; border-collapse:collapse; display:block; overflow-x:auto; }
          #${uid} .sf-word-content table tbody,
          #${uid} .sf-word-content table thead,
          #${uid} .sf-word-content table tr { width:100%; }
          #${uid} .sf-word-content td,
          #${uid} .sf-word-content th { border:1px solid ${props.borderColor || '#dbe4f0'}; padding:10px 12px; vertical-align:top; text-align:left; }
          #${uid} .sf-word-content p,
          #${uid} .sf-word-content li { color:inherit; }
          @media (max-width: 768px) {
            #${uid} { padding:56px 16px !important; }
            #${uid} .sf-word-card { padding:18px !important; border-radius:18px !important; }
          }
          #canvasFrame.mobile #${uid} { padding:56px 16px !important; }
          #canvasFrame.mobile #${uid} .sf-word-card { padding:18px !important; border-radius:18px !important; }
        </style>
        <div class="sf-word-shell" style="text-align:${props.sectionAlign || 'left'};">
          ${props.title ? `<h2 data-sf-path="title" style="${BlockTypes.applySubStyle(props, 'title', `margin:0 0 12px;font-size:clamp(2rem,4vw,3rem);font-weight:800;color:${props.textColor};text-align:${props.sectionAlign || 'left'};`)}">${props.title}</h2>` : ''}
          ${props.subtitle ? `<p data-sf-path="subtitle" style="${BlockTypes.applySubStyle(props, 'subtitle', `margin:0 0 28px;font-size:1rem;line-height:1.8;color:${props.textColor};opacity:0.72;text-align:${props.sectionAlign || 'left'};`)}">${props.subtitle}</p>` : ''}
          <div class="sf-word-card">
            <div class="sf-word-content" data-sf-path="contentHtml">${props.contentHtml || ''}</div>
          </div>
        </div>
      </section>`;
    }
  },

  motionPopup: {
    label: 'Pop Up',
    icon: 'fa-solid fa-wand-magic-sparkles',
    category: 'Sections',
    defaultProps: {
      title: 'Popup Manager',
      subtitle: 'This block controls a timed website popup.',
      bgColor: 'transparent',
      textColor: '#0f172a',
      accentColor: '#6c63ff',
      cardBg: '#ffffff',
      borderColor: '#dbe4f0',
      padding: '0',
      sectionAlign: 'left',
      popupEnabled: true,
      popupDelay: '3000',
      popupTitle: 'Welcome offer',
      popupText: 'Show a timed popup after a few seconds to highlight an offer, newsletter signup, or important announcement.',
      popupButtonText: 'Explore Now',
      popupButtonHref: '#',
      popupAutoClose: false,
      popupWidth: '460px',
      popupPadding: '28px',
      popupRadius: '24px',
      customId: '',
      customClass: ''
    },
    render(props) {
      const uid = props.customId || 'motion_' + Math.random().toString(36).substr(2, 9);
      const popupScript = props.popupEnabled ? `<script>
(() => {
  const root = document.getElementById('${uid}');
  if (!root) return;
  if (root.dataset.sfPopupBound === '1') return;
  root.dataset.sfPopupBound = '1';
  const popup = root.querySelector('.sf-motion-popup');
  if (!popup) return;
  const delay = Math.max(0, parseInt('${props.popupDelay || '3000'}', 10) || 0);
  const autoClose = ${props.popupAutoClose === true ? 'true' : 'false'};
  const showPopup = () => {
    popup.style.display = 'flex';
    requestAnimationFrame(() => popup.classList.add('is-open'));
    if (autoClose) {
      window.setTimeout(() => {
        popup.classList.remove('is-open');
        window.setTimeout(() => { popup.style.display = 'none'; }, 260);
      }, 4000);
    }
  };
  window.setTimeout(showPopup, delay);
})();
<\/script>` : '';

      return `<section id="${uid}" class="sf-motion-popup ${props.customClass || ''}" style="background:${props.bgColor};padding:${props.padding};position:relative;overflow:visible;min-height:0;">
        <style>
          #${uid} .sf-popup-builder-card {
            display:none;
            max-width:520px;
            margin:18px auto;
            padding:18px 20px;
            border-radius:18px;
            border:1px dashed ${props.borderColor};
            background:${props.cardBg};
            box-shadow:0 10px 30px rgba(15,23,42,0.08);
            text-align:left;
          }
          #canvasFrame #${uid} .sf-popup-builder-card { display:block; }
          #${uid} .sf-motion-popup {
            position:fixed; inset:0; z-index:9998; display:none; align-items:center; justify-content:center;
            background:rgba(2,6,23,.68); backdrop-filter:blur(8px); opacity:0; transition:opacity .25s ease;
          }
          #${uid} .sf-motion-popup.is-open { opacity:1; }
          #${uid} .sf-motion-popup-card {
            width:min(92vw, ${props.popupWidth || '460px'}); background:#ffffff; color:#0f172a; border-radius:${props.popupRadius || '24px'}; padding:${props.popupPadding || '28px'};
            box-shadow:0 24px 80px rgba(15,23,42,.28); transform:translateY(18px); transition:transform .25s ease;
          }
          #${uid} .sf-motion-popup.is-open .sf-motion-popup-card { transform:translateY(0); }
          #${uid} .sf-motion-close {
            position:absolute; top:14px; right:14px; width:38px; height:38px; border-radius:50%;
            border:none; background:#e2e8f0; color:#0f172a; cursor:pointer; font-size:1rem;
          }
          @media (max-width: 768px) {
            #${uid} .sf-motion-popup-card { width:min(92vw, 420px) !important; padding:22px !important; border-radius:18px !important; }
          }
        </style>
        <div class="sf-popup-builder-card">
          <div data-sf-path="title" style="${BlockTypes.applySubStyle(props, 'title', `margin:0 0 8px;font-size:1.05rem;font-weight:800;color:#0f172a;`)}">${props.title || 'Popup Manager'}</div>
          <div data-sf-path="subtitle" style="${BlockTypes.applySubStyle(props, 'subtitle', `margin:0;font-size:0.9rem;line-height:1.7;color:#475569;`)}">${props.subtitle || 'This block controls a timed website popup.'}</div>
        </div>
        <div class="sf-motion-popup" onclick="if(event.target===this){this.classList.remove('is-open'); setTimeout(()=>this.style.display='none',260);}">
          <div class="sf-motion-popup-card" onclick="event.stopPropagation();" style="position:relative;">
            <button type="button" class="sf-motion-close" onclick="const popup=this.closest('.sf-motion-popup'); popup.classList.remove('is-open'); setTimeout(()=>popup.style.display='none',260);">&times;</button>
            <div data-sf-path="popupTitle" style="${BlockTypes.applySubStyle(props, 'popupTitle', `font-size:1.5rem;font-weight:800;margin:0 0 12px;color:#0f172a;`)}">${props.popupTitle || ''}</div>
            <div data-sf-path="popupText" style="${BlockTypes.applySubStyle(props, 'popupText', `font-size:0.96rem;line-height:1.75;color:#334155;margin-bottom:20px;`)}">${props.popupText || ''}</div>
            <a data-sf-path="popupButtonText" href="${props.popupButtonHref || '#'}" style="${BlockTypes.applySubStyle(props, 'popupButtonText', `display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:999px;background:${props.accentColor};color:#fff;text-decoration:none;font-weight:700;`)}">${props.popupButtonText || 'Continue'}</a>
          </div>
        </div>
        ${popupScript}
      </section>`;
    }
  },

  accordion: {
    label: 'Accordion / Expand',
    icon: 'fa-solid fa-chevron-down',
    category: 'Sections',
    defaultProps: {
      badge: 'Guide',
      title: 'Expandable Content',
      subtitle: 'Use expandable rows to reveal richer content like text, images, tables, and download links.',
      bgColor: '#000000',
      textColor: '#ffffff',
      accentColor: '#f4b400',
      cardBg: '#0a0a0a',
      borderColor: 'rgba(255,255,255,0.16)',
      padding: '72px 32px',
      sectionAlign: 'center',
      customId: '',
      customClass: '',
      items: [
        {
          title: 'WELCOME BONUS',
          open: true,
          contentHtml: '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;"><img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop" alt="Bonus" style="width:100%;border-radius:18px;display:block;" /><div><div style="font-size:2rem;font-weight:800;color:#f4b400;margin-bottom:12px;">100% Welcome Bonus</div><p style="color:#e5e7eb;line-height:1.8;margin-bottom:16px;">Add any mix of image, text, or table-style HTML here. This expandable area is fully editable from the content settings.</p><table style="width:100%;border-collapse:collapse;color:#fff;"><tr><th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.14);">Size</th><th style="text-align:left;padding:10px;border-bottom:1px solid rgba(255,255,255,.14);">Category</th></tr><tr><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">1080 x 1080</td><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,.08);">Profile Picture</td></tr><tr><td style="padding:10px;">1920 x 600</td><td style="padding:10px;">Banner</td></tr></table></div></div>'
        },
        {
          title: 'DAILY FREE BONUS',
          open: false,
          contentHtml: '<p style="color:#d1d5db;line-height:1.8;">Add daily offer details, promo text, links, or small screenshots here.</p>'
        },
        {
          title: 'FIRST DEPOSIT BONUS',
          open: false,
          contentHtml: '<p style="color:#d1d5db;line-height:1.8;">Each accordion item can hold full HTML, so tables, banners, and styled notes all work here.</p>'
        }
      ]
    },
    render(props) {
      const uid = props.customId || 'acc_' + Math.random().toString(36).substr(2, 9);
      const items = (props.items || []).map((item, i) => {
        const isOpen = item.open === true;
        return `
          <div data-sf-path="items.${i}" class="sf-accordion-item${isOpen ? ' is-open' : ''}" style="border-bottom:1px solid ${props.borderColor || 'rgba(255,255,255,0.16)'};">
            <button type="button" class="sf-accordion-trigger" onclick="var item=this.closest('.sf-accordion-item'); item.classList.toggle('is-open'); this.setAttribute('aria-expanded', item.classList.contains('is-open') ? 'true' : 'false');" aria-expanded="${isOpen ? 'true' : 'false'}" style="width:100%;background:none;border:none;color:${props.textColor};padding:24px 16px;display:flex;align-items:center;justify-content:space-between;gap:16px;cursor:pointer;text-align:left;">
              <span data-sf-path="items.${i}.title" style="${BlockTypes.applySubStyle(props, `items.${i}.title`, `font-size:clamp(1.05rem,2vw,1.24rem);font-weight:700;letter-spacing:0.01em;color:${props.textColor};text-transform:uppercase;`)}">${item.title || `Item ${i + 1}`}</span>
              <span class="sf-accordion-icon" style="width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;color:${props.textColor};font-size:1rem;transition:transform .25s ease;"><i class="fa-solid fa-chevron-down"></i></span>
            </button>
            <div class="sf-accordion-panel" style="display:${isOpen ? 'block' : 'none'};padding:0 0 28px;">
              <div class="sf-accordion-panel-inner" data-sf-path="items.${i}.contentHtml" style="background:${props.cardBg || '#0a0a0a'};border-radius:18px;padding:0;color:${props.textColor};overflow:auto;">${item.contentHtml || ''}</div>
            </div>
          </div>
        `;
      }).join('');

      return `<section id="${uid}" class="sf-accordion ${props.customClass || ''}" style="background:${props.bgColor};padding:${props.padding};">
        <style>
          #${uid} .sf-accordion-item.is-open .sf-accordion-panel { display:block !important; }
          #${uid} .sf-accordion-item.is-open .sf-accordion-icon { transform:rotate(180deg); }
          #${uid} .sf-accordion-panel-inner img { max-width:100%; height:auto; display:block; }
          #${uid} .sf-accordion-panel-inner table { width:100%; }
          #${uid} .sf-accordion-trigger:hover { opacity:0.96; }
          #${uid} .sf-accordion-panel-inner { box-shadow:none; }
          @media (max-width: 768px) {
            #${uid} { padding:56px 16px !important; }
            #${uid} .sf-accordion-trigger { padding:18px 8px !important; gap:12px !important; }
            #${uid} .sf-accordion-trigger [data-sf-path*=".title"] { font-size:1rem !important; line-height:1.4 !important; padding-right:8px; }
            #${uid} .sf-accordion-icon { width:28px !important; height:28px !important; flex:0 0 28px !important; font-size:.9rem !important; }
            #${uid} .sf-accordion-panel { padding:0 0 20px !important; }
            #${uid} .sf-accordion-panel-inner { border-radius:14px !important; overflow:hidden !important; }
            #${uid} .sf-accordion-panel-inner > div[style*="grid-template-columns"] { grid-template-columns:1fr !important; gap:16px !important; }
            #${uid} .sf-accordion-panel-inner > div { padding-left:0 !important; padding-right:0 !important; }
            #${uid} .sf-accordion-panel-inner [style*="font-size:5rem"] { font-size:3.2rem !important; }
            #${uid} .sf-accordion-panel-inner [style*="font-size:3rem"] { font-size:2.1rem !important; }
            #${uid} .sf-accordion-panel-inner [style*="font-size:2.6rem"] { font-size:1.7rem !important; }
            #${uid} .sf-accordion-panel-inner table,
            #${uid} .sf-accordion-panel-inner thead,
            #${uid} .sf-accordion-panel-inner tbody,
            #${uid} .sf-accordion-panel-inner tr,
            #${uid} .sf-accordion-panel-inner td,
            #${uid} .sf-accordion-panel-inner th { font-size:0.88rem !important; }
            #${uid} .sf-accordion-panel-inner table { display:block; overflow-x:auto; white-space:nowrap; -webkit-overflow-scrolling:touch; }
          }
          #canvasFrame.mobile #${uid} { padding:56px 16px !important; }
          #canvasFrame.mobile #${uid} .sf-accordion-trigger { padding:18px 8px !important; gap:12px !important; }
          #canvasFrame.mobile #${uid} .sf-accordion-trigger [data-sf-path*=".title"] { font-size:1rem !important; line-height:1.4 !important; padding-right:8px; }
          #canvasFrame.mobile #${uid} .sf-accordion-icon { width:28px !important; height:28px !important; flex:0 0 28px !important; font-size:.9rem !important; }
          #canvasFrame.mobile #${uid} .sf-accordion-panel { padding:0 0 20px !important; }
          #canvasFrame.mobile #${uid} .sf-accordion-panel-inner { border-radius:14px !important; overflow:hidden !important; }
          #canvasFrame.mobile #${uid} .sf-accordion-panel-inner > div[style*="grid-template-columns"] { grid-template-columns:1fr !important; gap:16px !important; }
          #canvasFrame.mobile #${uid} .sf-accordion-panel-inner > div { padding-left:0 !important; padding-right:0 !important; }
          #canvasFrame.mobile #${uid} .sf-accordion-panel-inner [style*="font-size:5rem"] { font-size:3.2rem !important; }
          #canvasFrame.mobile #${uid} .sf-accordion-panel-inner [style*="font-size:3rem"] { font-size:2.1rem !important; }
          #canvasFrame.mobile #${uid} .sf-accordion-panel-inner [style*="font-size:2.6rem"] { font-size:1.7rem !important; }
          #canvasFrame.mobile #${uid} .sf-accordion-panel-inner table,
          #canvasFrame.mobile #${uid} .sf-accordion-panel-inner thead,
          #canvasFrame.mobile #${uid} .sf-accordion-panel-inner tbody,
          #canvasFrame.mobile #${uid} .sf-accordion-panel-inner tr,
          #canvasFrame.mobile #${uid} .sf-accordion-panel-inner td,
          #canvasFrame.mobile #${uid} .sf-accordion-panel-inner th { font-size:0.88rem !important; }
          #canvasFrame.mobile #${uid} .sf-accordion-panel-inner table { display:block; overflow-x:auto; white-space:nowrap; -webkit-overflow-scrolling:touch; }
        </style>
        <div style="max-width:1180px;margin:auto;text-align:${props.sectionAlign || 'center'};">
          ${props.badge ? `<div style="margin-bottom:10px;"><span data-sf-path="badge" style="${BlockTypes.applySubStyle(props, 'badge', `display:inline-block;color:${props.accentColor};font-size:0.92rem;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;`)}">${props.badge}</span></div>` : ''}
          ${props.title ? `<h2 data-sf-path="title" style="${BlockTypes.applySubStyle(props, 'title', `margin:0 0 12px;font-size:clamp(2rem,4vw,3.2rem);font-weight:900;color:${props.textColor};text-transform:uppercase;`)}">${props.title}</h2>` : ''}
          ${props.subtitle ? `<p data-sf-path="subtitle" style="${BlockTypes.applySubStyle(props, 'subtitle', `margin:0 auto 40px;max-width:760px;font-size:1rem;line-height:1.75;color:${props.textColor};opacity:0.76;`)}">${props.subtitle}</p>` : ''}
          <div data-sf-path="items" style="text-align:left;">${items}</div>
        </div>
      </section>`;
    }
  },


  applyLayout(props) {
    const opacity = props.opacity !== undefined ? `opacity:${props.opacity};` : '';
    const blur = props.blur ? `filter:blur(${props.blur}px);` : '';
    const grow = props.flexGrow !== undefined ? `flex-grow:${props.flexGrow};` : '';
    const shrink = props.flexShrink !== undefined ? `flex-shrink:${props.flexShrink};` : '';
    const basis = props.flexBasis ? `flex-basis:${props.flexBasis};` : '';
    const overflow = props.overflow ? `overflow:${props.overflow};` : '';
    const animationMap = {
      'fade-up': 'sf-anim-fade-up',
      'fade-in': 'sf-anim-fade-in',
      'zoom-in': 'sf-anim-zoom-in',
      'slide-right': 'sf-anim-slide-right'
    };
    const animationName = animationMap[props.animationPreset || ''] || '';
    const animationTrigger = props.animationTrigger || 'load';
    const animationDuration = Math.max(0.2, parseFloat(props.animationDuration || '0.8') || 0.8);
    const animationDelay = Math.max(0, parseFloat(props.animationDelay || '0') || 0);
    const animation = animationName
      ? (animationTrigger === 'scroll'
          ? ''
          : `animation:${animationName} ${animationDuration}s ease both;animation-delay:${animationDelay}s;`)
      : '';

    const h = props.height || 'auto';
    const heightStyle = (h === 'auto' || h === '100%' || h === 'inherit') ? `height:${h};` : `min-height:${h};`;
    
    return `width:${props.width || '100%'}; max-width:100%; ${heightStyle} margin:${props.margin || '0'}; padding:${props.padding || '0'}; display:${props.display || 'block'}; flex-direction:${props.direction || 'row'}; justify-content:${props.justify || 'center'}; align-items:${props.align || 'center'}; gap:${props.gap || '0'}; flex-wrap:wrap; box-sizing:border-box; ${opacity} ${blur} ${grow} ${shrink} ${basis} ${overflow} ${animation}`;
  },

  applySubStyle(props, path, baseStyle = '') {
    if (!props || !props.subStyles || !props.subStyles[path]) return baseStyle;
    const s = props.subStyles[path];
    const rules = [];
    if (s.color) rules.push(`color:${s.color}`);
    if (s.fontSize) rules.push(`font-size:${s.fontSize}`);
    if (s.fontWeight) rules.push(`font-weight:${s.fontWeight}`);
    if (s.textAlign) rules.push(`text-align:${s.textAlign}`);
    if (s.backgroundColor) rules.push(`background-color:${s.backgroundColor}`);
    if (s.padding) rules.push(`padding:${s.padding}`);
    if (s.margin) rules.push(`margin:${s.margin}`);
    if (s.borderRadius) rules.push(`border-radius:${s.borderRadius}`);
    if (s.display) rules.push(`display:${s.display}`);
    if (s.opacity) rules.push(`opacity:${s.opacity}`);
    if (s.lineHeight) rules.push(`line-height:${s.lineHeight}`);
    if (s.letterSpacing) rules.push(`letter-spacing:${s.letterSpacing}`);
    if (s.textTransform) rules.push(`text-transform:${s.textTransform}`);
    if (s.width) rules.push(`width:${s.width}`);
    if (s.height) rules.push(`height:${s.height}`);
    if (s.border) rules.push(`border:${s.border}`);
    if (s.boxShadow) rules.push(`box-shadow:${s.boxShadow}`);
    if (s.maxWidth) rules.push(`max-width:${s.maxWidth}`);
    if (s.zIndex !== undefined) rules.push(`z-index:${s.zIndex}`);
    if (s.position) rules.push(`position:${s.position}`);
    
    if (rules.length === 0) return baseStyle;
    
    let merged = baseStyle.split(';').map(r => r.trim()).filter(r => !!r);
    rules.forEach(newRule => {
        const prop = newRule.split(':')[0];
        const idx = merged.findIndex(r => r.startsWith(prop + ':'));
        if (idx !== -1) merged[idx] = newRule;
        else merged.push(newRule);
    });
    return merged.join(';') + (merged.length > 0 ? ';' : '');
  }

};
