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
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const vid = url.split('v=')[1] || url.split('/').pop();
      const cleanId = vid.split('&')[0];
      return `https://www.youtube.com/embed/${cleanId}`;
    }
    // Dailymotion
    if (url.includes('dailymotion.com') || url.includes('dai.ly')) {
      const vid = url.split('/').pop().split('_')[0];
      return `https://www.dailymotion.com/embed/video/${vid}`;
    }
    // Vimeo
    if (url.includes('vimeo.com')) {
      const vid = url.split('/').pop();
      return `https://player.vimeo.com/video/${vid}`;
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

const BlockTypes = {

  navbar: {
    label: 'Navbar',
    icon: 'fa-solid fa-bars',
    category: 'Navigation',
    defaultProps: {
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
      sticky: true,
      showButton: true,
      buttonText: 'Get Started',
      buttonHref: '#contact',
      buttonColor: '#6c63ff',
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
      const links = (props.links || []).map(l =>
        `<a href="${l.href || '#'}" class="nav-link" style="color:${props.textColor};text-decoration:none;font-weight:500;transition:opacity .2s;"
           onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">${l.label}</a>`
      ).join('');
      const logo = props.logo ? `<img src="${props.logo}" alt="logo" style="height:36px;margin-right:8px;"/>` : '';
      const btn = props.showButton ? `<a href="${props.buttonHref || '#'}" class="nav-btn" style="background:${props.buttonColor};color:#fff;padding:8px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:0.85rem;transition:opacity .2s;" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">${props.buttonText}</a>` : '';

      return `<nav id="${uid}" class="sf-navbar ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)} ${props.sticky ? 'position:sticky;top:0;z-index:900;' : ''}box-shadow:0 2px 10px rgba(0,0,0,.2);">
  <div style="display:flex;align-items:center;gap:4px;z-index:902;">
    ${logo}<span style="color:${props.textColor};font-size:1.25rem;font-weight:700;">${props.brand}</span>
  </div>
  
  <!-- Hamburger Menu Icon -->
  <div class="hamburger" onclick="this.parentElement.classList.toggle('mobile-open')" style="display:none;flex-direction:column;gap:5px;cursor:pointer;z-index:902;padding:10px;">
    <span class="line line-1" style="width:25px;height:3px;background:${props.textColor};border-radius:2px;transition:0.3s;"></span>
    <span class="line line-2" style="width:25px;height:3px;background:${props.textColor};border-radius:2px;transition:0.3s;"></span>
    <span class="line line-3" style="width:25px;height:3px;background:${props.textColor};border-radius:2px;transition:0.3s;"></span>
  </div>

  <div class="nav-links-container" style="display:flex;align-items:center;gap:inherit;flex-wrap:wrap;">
    <div class="nav-links" style="display:flex;gap:24px;">${links}</div>
    <div class="nav-actions">${btn}</div>
  </div>
</nav>

<style>
/* Exported Media Query */
@media (max-width: 768px) {
  #${uid} .hamburger { display: flex !important; }
  #${uid} .nav-links-container {
    position: fixed;
    top: 0;
    right: -100%;
    width: 100%;
    height: 100vh;
    background: ${props.bgColor};
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 901;
    gap: 40px !important;
  }
  #${uid}.mobile-open .nav-links-container { right: 0; }
  #${uid} .nav-links { flex-direction: column; align-items: center; gap: 30px !important; }
  
  /* X Close Animation */
  #${uid}.mobile-open .line-1 { transform: translateY(8px) rotate(45deg); }
  #${uid}.mobile-open .line-2 { opacity: 0; }
  #${uid}.mobile-open .line-3 { transform: translateY(-8px) rotate(-45deg); }
}

/* Builder-specific Mobile Mode */
#canvasFrame.mobile #${uid} .hamburger { display: flex !important; }
#canvasFrame.mobile #${uid} .nav-links-container {
    position: absolute;
    top: 0;
    right: -100%;
    width: 100%;
    height: 100%;
    background: ${props.bgColor};
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 901;
    gap: 30px !important;
}
#canvasFrame.mobile #${uid}.mobile-open .nav-links-container { right: 0; }
#canvasFrame.mobile #${uid} .nav-links { flex-direction: column; align-items: center; gap: 20px !important; }
#canvasFrame.mobile #${uid}.mobile-open .line-1 { transform: translateY(8px) rotate(45deg); }
#canvasFrame.mobile #${uid}.mobile-open .line-2 { opacity: 0; }
#canvasFrame.mobile #${uid}.mobile-open .line-3 { transform: translateY(-8px) rotate(-45deg); }
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
      const uid = props.customId || '';
      const bg = props.bgImage ? `background: linear-gradient(rgba(18, 18, 43, 0.7), rgba(18, 18, 43, 0.7)), url(${props.bgImage}) center/cover no-repeat;` : `background: ${props.bgColor};`;
      const layout = BlockTypes.applyLayout(props);

      return `<section id="${uid}" class="sf-hero ${props.customClass || ''}" style="${bg} color: ${props.textColor}; ${layout} align-items:center; justify-content:center;">
  <div style="max-width: 950px; width: 100%;">
    <h1 style="font-size: ${props.titleSize}; font-weight: ${props.titleWeight}; line-height: 1.1; margin-bottom: 24px; color: ${props.accentColor}; text-align:${props.titleAlign || 'center'};" data-initial-value="${props.title}">${props.title}</h1>
    <p style="font-size: ${props.subtitleSize}; line-height: 1.6; margin-bottom: 40px; opacity: 0.9; text-align:${props.subtitleAlign || 'center'}; margin-left:${props.subtitleAlign === 'center' ? 'auto' : '0'}; margin-right:${props.subtitleAlign === 'center' ? 'auto' : '0'};" data-initial-value="${props.subtitle}">${props.subtitle}</p>
    <div style="display: flex; gap: 16px; justify-content: ${props.ctaAlign === 'center' ? 'center' : (props.ctaAlign === 'right' ? 'flex-end' : 'flex-start')}; flex-wrap: wrap;">
      <a href="${props.ctaHref}" class="hero-btn" style="background: ${props.accentColor}; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: transform .2s;">${props.ctaText}</a>
      ${props.cta2Text ? `<a href="${props.cta2Href}" class="hero-btn-sec" style="border: 2px solid ${props.accentColor}; color: ${props.accentColor}; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: all .2s;">${props.cta2Text}</a>` : ''}
    </div>
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
      display: 'flex'
    },
    render(props) {
      const uid = props.customId || props.id || 'about';
      const features = (props.features || []).map(f => `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <i class="${f.icon}" style="color:${props.accentColor};"></i>
          <span style="color:inherit;" data-initial-value="${f.text}">${f.text}</span>
        </div>`).join('');

      const content = `
        <div style="flex:1.2; min-width:300px; color:${props.textColor};">
          <div style="text-align:${props.badgeAlign || 'left'}; margin-bottom:16px;">
            <span style="color:${props.accentColor};font-weight:700;letter-spacing:1.5px;text-transform:uppercase;font-size:0.85rem;display:inline-block;">${props.badge}</span>
          </div>
          <h2 style="font-size:${props.titleSize}; color:inherit; margin-bottom:24px; line-height:1.2; text-align:${props.titleAlign || 'left'};" data-initial-value="${props.title}">${props.title}</h2>
          <p style="font-size:${props.textSize}; line-height:1.7; color:inherit; opacity:0.8; margin-bottom:32px; text-align:${props.textAlign || 'left'};" data-initial-value="${props.text}">${props.text}</p>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px 24px;">${features}</div>
        </div>`;

      const img = `<div style="flex:1;min-width:300px;"><img src="${props.image}" style="width:100%;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.1);"/></div>`;

      return `<section id="${uid}" class="sf-about ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)}">
        <div class="sf-container" style="max-width:1100px;margin:auto;display:flex;align-items:inherit;gap:inherit;flex-wrap:wrap;flex-direction:${props.imagePosition === 'left' ? 'row-reverse' : 'row'};">
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
      const cards = (props.items || []).map(item => `
        <div style="background:${props.cardBg || '#fff'}; color:${props.textColor}; border-radius:12px; padding:28px; text-align:${props.cardAlign || 'center'}; box-shadow:0 2px 20px rgba(0,0,0,.07); transition:all .3s ease;" 
             onmouseover="this.style.transform='translateY(-6px)';this.style.boxShadow='0 12px 30px rgba(108, 99, 255, 0.15)'" 
             onmouseout="this.style.transform='';this.style.boxShadow='0 2px 20px rgba(0,0,0,.07)'">
          <div style="font-size:2.5rem;margin-bottom:14px;">${item.icon}</div>
          <h3 style="color:inherit;font-weight:700;margin-bottom:10px;font-size:1.1rem;">${item.title}</h3>
          <p style="color:inherit;opacity:.65;font-size:0.9rem;line-height:1.7;">${item.desc}</p>
        </div>`).join('');
      
      const cols = props.columns || 3;
      const gap = props.gridGap || '24px';
      const gridStyle = `display:grid; grid-template-columns:repeat(auto-fit, minmax(max(240px, calc(${100/cols}% - ${gap})), 1fr)); gap:${gap};`;

      return `<section id="${uid}" class="sf-services ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)}">
  <div style="max-width:1100px;margin:auto;">
    <div style="text-align:${props.badgeAlign || 'center'}; margin-bottom:16px;">
      <span style="background:${props.accentColor};color:#fff;padding:6px 16px;border-radius:99px;font-size:0.78rem;font-weight:600;display:inline-block;">${props.badge}</span>
    </div>
    <h2 style="color:${props.textColor};font-size:clamp(1.8rem,4vw,2.6rem);font-weight:800;margin-bottom:16px;font-family:'Poppins',sans-serif; text-align:${props.titleAlign || 'center'};">${props.title}</h2>
    <p style="color:${props.textColor};opacity:.65;max-width:650px;margin-bottom:48px;line-height:1.7; text-align:${props.subtitleAlign || 'center'}; margin-left:${props.subtitleAlign === 'center' ? 'auto' : (props.subtitleAlign === 'right' ? 'auto' : '0')}; margin-right:${props.subtitleAlign === 'center' ? 'auto' : (props.subtitleAlign === 'left' ? 'auto' : '0')};">${props.subtitle}</p>
    <div style="${gridStyle}">
      ${cards}
    </div>
  </div>
</section>`;
    }
  },

  carousel: {
    label: 'Carousel / Slider',
    icon: 'fa-solid fa-images',
    category: 'Media',
    defaultProps: {
      id: 'carousel_' + Date.now(),
      autoplay: true,
      interval: 4000,
      showDots: true,
      showArrows: true,
      height: '480px',
      slides: [
        { image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&q=80', title: 'Slide One', subtitle: 'Your compelling message here' },
        { image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80', title: 'Slide Two', subtitle: 'Another great slide' },
        { image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80', title: 'Slide Three', subtitle: 'A third beautiful slide' }
      ],
      objectFit: 'cover',
      customId: '',
      customClass: ''
    },
    render(props) {
      const uid = props.customId || props.id || ('c' + Math.random().toString(36).substr(2, 9));
      const fit = props.objectFit || 'cover';
      const bgSize = fit === 'stretch' ? '100% 100%' : fit;
      const slides = (props.slides || []).map((s, i) => `
        <div class="sf-slide-${uid}" style="display:${i === 0 ? 'flex' : 'none'};background:url('${s.image}') center/${bgSize} no-repeat;height:${props.height || '480px'};align-items:center;justify-content:center;position:relative;">
          <div style="position:absolute;inset:0;background:rgba(0,0,0,.45);"></div>
          <div style="position:relative;z-index:1;text-align:center;color:#fff;padding:20px;">
            <h2 style="font-size:clamp(1.5rem,4vw,3rem);font-weight:800;margin-bottom:12px;text-shadow:0 2px 10px rgba(0,0,0,.5);font-family:'Poppins',sans-serif;">${s.title}</h2>
            <p style="font-size:1.1rem;opacity:.9;">${s.subtitle}</p>
          </div>
        </div>`).join('');
      const dots = props.showDots ? `<div style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:8px;" id="dots_${uid}">
        ${(props.slides || []).map((_, i) => `<button onclick="window.sfGoTo_${uid}(${i})" style="width:10px;height:10px;border-radius:50%;border:none;cursor:pointer;background:${i === 0 ? '#fff' : 'rgba(255,255,255,.5)'};" class="sf-dot-${uid}"></button>`).join('')}
      </div>` : '';
      const arrows = props.showArrows ? `
        <button onclick="window.sfPrev_${uid}()" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);z-index:2;background:rgba(255,255,255,.25);border:none;width:44px;height:44px;border-radius:50%;cursor:pointer;color:#fff;font-size:1.2rem;backdrop-filter:blur(4px);">&#8592;</button>
        <button onclick="window.sfNext_${uid}()" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);z-index:2;background:rgba(255,255,255,.25);border:none;width:44px;height:44px;border-radius:50%;cursor:pointer;color:#fff;font-size:1.2rem;backdrop-filter:blur(4px);">&#8594;</button>` : '';
      const script = `<script>
(function(){
  if (window.sf_init_${uid}) return;
  window.sf_init_${uid} = true;
  var cur_${uid}=0;
  function upd_${uid}(){
    var slides = document.querySelectorAll('.sf-slide-${uid}');
    var dots = document.querySelectorAll('.sf-dot-${uid}');
    if (!slides.length) return;
    slides.forEach(function(s,i){s.style.display=i===cur_${uid}?'flex':'none';});
    dots.forEach(function(d,i){d.style.background=i===cur_${uid}?'#fff':'rgba(255,255,255,.5)';});
  }
  window.sfGoTo_${uid}=function(i){cur_${uid}=i;upd_${uid}();};
  window.sfNext_${uid}=function(){
    var slides = document.querySelectorAll('.sf-slide-${uid}');
    if (!slides.length) return;
    cur_${uid}=(cur_${uid}+1)%slides.length;upd_${uid}();
  };
  window.sfPrev_${uid}=function(){
    var slides = document.querySelectorAll('.sf-slide-${uid}');
    if (!slides.length) return;
    cur_${uid}=(cur_${uid}-1+slides.length)%slides.length;upd_${uid}();
  };
  ${props.autoplay ? `setInterval(function(){ window.sfNext_${uid}(); }, ${props.interval || 4000});` : ''}
})();
<\/script>`;
      return `<div id="${uid}" class="sf-carousel ${props.customClass || ''}" style="position:relative;overflow:hidden;">${slides}${dots}${arrows}${script}</div>`;
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
      showMap: false,
      phone: '+1 (555) 000-0000',
      email: 'hello@example.com',
      address: '123 Workspace St, Digital City',
      customId: '',
      customClass: ''
    },
    render(props) {
      const uid = props.customId || props.id || 'contact';
      return `<section id="${uid}" class="sf-contact ${props.customClass || ''}" style="background:${props.bgColor}; padding:${props.padding || '80px 32px'};">
  <div style="max-width:1000px;margin:auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <span style="background:${props.accentColor};color:#fff;padding:4px 14px;border-radius:99px;font-size:0.78rem;font-weight:600;">${props.badge}</span>
      <h2 style="color:${props.textColor};font-size:clamp(1.6rem,3vw,2.4rem);font-weight:700;margin:16px 0 10px;font-family:'Poppins',sans-serif;">${props.title}</h2>
      <p style="color:${props.textColor};opacity:.65;max-width:550px;margin:auto;line-height:1.7;">${props.subtitle}</p>
    </div>
    <div class="sf-contact-grid" style="display:grid;grid-template-columns:1fr 1.5fr;gap:48px;">
      <div>
        <div style="margin-bottom:24px;">
          <div style="color:${props.accentColor};font-size:1.3rem;margin-bottom:6px;"><i class="fa-solid fa-phone"></i></div>
          <div style="color:${props.textColor};font-weight:600;margin-bottom:4px;">Phone</div>
          <div style="color:${props.textColor};opacity:.65;">${props.phone}</div>
        </div>
        <div style="margin-bottom:24px;">
          <div style="color:${props.accentColor};font-size:1.3rem;margin-bottom:6px;"><i class="fa-solid fa-envelope"></i></div>
          <div style="color:${props.textColor};font-weight:600;margin-bottom:4px;">Email</div>
          <div style="color:${props.textColor};opacity:.65;">${props.email}</div>
        </div>
        <div>
          <div style="color:${props.accentColor};font-size:1.3rem;margin-bottom:6px;"><i class="fa-solid fa-location-dot"></i></div>
          <div style="color:${props.textColor};font-weight:600;margin-bottom:4px;">Address</div>
          <div style="color:${props.textColor};opacity:.65;">${props.address || '123 Workspace St, Digital City'}</div>
        </div>
      </div>
      <form onsubmit="event.preventDefault();alert('Message sent! (Demo)');" style="display:flex;flex-direction:column;gap:14px;">
        <div class="sf-contact-form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
          <input type="text" placeholder="Your Name" required style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:13px 16px;color:${props.textColor};font-size:0.9rem;outline:none;font-family:inherit;" onfocus="this.style.borderColor='${props.accentColor}'" onblur="this.style.borderColor='rgba(255,255,255,.1)'"/>
          <input type="email" placeholder="Your Email" required style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:13px 16px;color:${props.textColor};font-size:0.9rem;outline:none;font-family:inherit;" onfocus="this.style.borderColor='${props.accentColor}'" onblur="this.style.borderColor='rgba(255,255,255,.1)'"/>
        </div>
        <input type="text" placeholder="Subject" style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:13px 16px;color:${props.textColor};font-size:0.9rem;outline:none;font-family:inherit;" onfocus="this.style.borderColor='${props.accentColor}'" onblur="this.style.borderColor='rgba(255,255,255,.1)'"/>
        <textarea placeholder="Your message…" rows="5" required style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:13px 16px;color:${props.textColor};font-size:0.9rem;outline:none;font-family:inherit;resize:vertical;" onfocus="this.style.borderColor='${props.accentColor}'" onblur="this.style.borderColor='rgba(255,255,255,.1)'"></textarea>
        <button type="submit" style="background:${props.accentColor};color:#fff;border:none;border-radius:8px;padding:14px;font-size:0.95rem;font-weight:700;cursor:pointer;transition:opacity .2s;" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">Send Message ✉️</button>
      </form>
    </div>
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
      accentColor: '#6c63ff',
      copyright: '© 2025 MySite. All rights reserved.',
      showSocials: true,
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
      const linksHtml = (props.links || []).map(l => `
        <li style="margin-bottom:10px;">
          <a href="${l.href || '#'}" style="color:${props.textColor};text-decoration:none;font-size:0.85rem;opacity:.7;transition:opacity .2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='.7'">
            ${l.label || 'Link'}
          </a>
        </li>`).join('');
      
      const socials = props.showSocials ? (props.socials || []).map(s =>
        `<a href="${s.href}" style="width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;color:${props.textColor};text-decoration:none;transition:all .2s;font-size:0.9rem;" onmouseover="this.style.background='${props.accentColor}';this.style.color='#fff'" onmouseout="this.style.background='rgba(255,255,255,.07)';this.style.color='${props.textColor}'"><i class="${s.icon}"></i></a>`
      ).join('') : '';

      return `<footer id="${uid}" class="sf-footer ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)}">
  <div style="max-width:1100px;margin:auto;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:32px;margin-bottom:40px;">
      <div>
        <div style="font-size:1.4rem;font-weight:700;color:#fff;margin-bottom:8px;font-family:'Poppins',sans-serif;">${props.brand}</div>
        <p style="color:${props.textColor};max-width:260px;line-height:1.6;font-size:0.9rem;">${props.tagline}</p>
        ${props.showSocials ? `<div style="display:flex;gap:10px;margin-top:16px;">${socials}</div>` : ''}
      </div>
      <div>
        <h4 style="color:#fff;font-weight:600;margin-bottom:16px;font-size:0.95rem;">Quick Links</h4>
        <ul style="list-style:none;padding:0;">${linksHtml}</ul>
      </div>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,.08);padding-top:20px;text-align:center;color:${props.textColor};font-size:0.82rem;">${props.copyright}</div>
  </div>
</footer>`;
    }
  },

  text: {
    label: 'Text Block',
    icon: 'fa-solid fa-font',
    category: 'Layout',
    defaultProps: {
      html: '<h2 style="font-size:2rem;font-weight:700;color:#111;margin-bottom:12px;">Section Title</h2><p style="color:#555;line-height:1.8;max-width:700px;">Add your body text here. Click on this block to select it, then edit the HTML content in the properties panel on the right.</p>',
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
      const stars = '★'.repeat(props.rating || 0) + '☆'.repeat(5 - (props.rating || 0));
      const sizeStyle = `width: ${props.width}; height: ${props.height}; max-width: ${props.maxWidth}; max-height: ${props.maxHeight};`;
      const captionText = props.subStyles?.['0.1']?.text ?? props.caption;
      const descText = props.subStyles?.['0.2.1']?.text ?? props.subStyles?.['0.1.1']?.text ?? props.description;

      return `<div id="${uid}" class="sf-image-block ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)} text-align:center;">
  <figure style="margin:0; display:inline-block; padding:15px; box-sizing:border-box; ${sizeStyle}">
    <img src="${props.src}" alt="${props.alt}" style="width:100%; height:100%; object-fit:${props.objectFit}; border-radius:${props.borderRadius}; display:block; margin:auto;"/>
    ${props.caption ? `<figcaption style="margin-top:10px;color:#666;font-size:0.85rem;" data-initial-value="${props.caption}">${captionText}</figcaption>` : ''}
    ${props.showDetails ? `
      <div style="margin-top:16px; text-align:left; padding:0 8px;">
        <div style="color:#ffc107; font-size:1.1rem; margin-bottom:8px;">${stars}</div>
        <p style="font-size:0.95rem; line-height:1.5; color:#444;" data-initial-value="${props.description}">${descText}</p>
      </div>` : ''}
  </figure>
</div>`;
    }
  },

  video: {
    label: 'Video',
    icon: 'fa-solid fa-video',
    category: 'Layout',
    defaultProps: {
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      title: 'Video',
      bgColor: '#0f1117',
      padding: '48px 32px',
      width: '100%',
      height: 'auto',
      maxWidth: '100%',
      aspectRatio: '56.25%',
      showDetails: true,
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
      const stars = '★'.repeat(props.rating || 0) + '☆'.repeat(5 - (props.rating || 0));
      const embedUrl = VideoHelper.getEmbedUrl(props.url);
      const isDirect = VideoHelper.isDirectVideo(props.url);
      const isAutoHeight = props.height === 'auto' || !props.height;

      const videoContentStyle = (isAutoHeight && props.aspectRatio !== '0')
        ? `position:relative; padding-bottom:${props.aspectRatio}; height:0;`
        : `position:relative; height:${props.height || '400px'};`;

      const videoElement = isDirect
        ? `<video src="${embedUrl}" controls style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:12px;"></video>`
        : `<iframe src="${embedUrl}" title="${props.title}" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>`;

      const layout = BlockTypes.applyLayout(props).replace(/height:[^;]+;/, 'height:auto;');
      
      const titleText = props.subStyles?.['0.1']?.text ?? props.subStyles?.['0.1.0']?.text ?? props.title;
      const descText = props.subStyles?.['0.1.2']?.text ?? props.subStyles?.['0.2.2']?.text ?? props.description;

      return `<div id="${uid}" class="sf-video-block ${props.customClass || ''}" style="background:${props.bgColor}; ${layout} box-sizing:border-box;">
  <div class="sf-video-inner" style="max-width:${props.maxWidth || '100%'}; width:100%; margin:auto;">
    <div class="video-container" style="${videoContentStyle} overflow:hidden; border-radius:12px; box-shadow:0 8px 40px rgba(0,0,0,.3);">
      ${videoElement}
    </div>
    ${props.showDetails ? `
      <div class="video-details" style="margin-top:20px; text-align:left; padding:0 8px;">
        <h4 style="margin-bottom:8px; font-size:1.1rem; color:#fff;" data-initial-value="${props.title}">${titleText}</h4>
        <div style="color:#ffc107; font-size:1.1rem; margin-bottom:8px;">${stars}</div>
        <p style="font-size:0.95rem; line-height:1.5; color:rgba(255,255,255,0.7);" data-initial-value="${props.description}">${descText}</p>
      </div>` : ''}
  </div>
</div>`;
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
        <div class="container-inner" style="width:100%; height:100%; display:inherit; flex-direction:inherit; flex-wrap:${props.wrap || 'wrap'}; justify-content:inherit; align-items:inherit; gap:inherit; min-height:inherit; box-sizing:border-box;">
          <div class="sf-drop-hint" style="border:2px dashed #ccc; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#999; font-size:0.9rem; width:100%; min-height:100px; flex:1;">
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
      return `<section id="${uid}" class="sf-cta-block ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)} text-align:center;">
  <h2 style="color:${props.textColor};font-size:clamp(1.6rem,3vw,2.5rem);font-weight:800;margin-bottom:14px;font-family:'Poppins',sans-serif;">${props.title}</h2>
  <p style="color:${props.textColor};opacity:.85;font-size:1.1rem;margin-bottom:32px;max-width:500px;margin-left:auto;margin-right:auto;line-height:1.7;">${props.subtitle}</p>
  <a href="${props.buttonHref}" style="background:${props.accentColor};color:${props.bgColor};padding:15px 40px;border-radius:8px;text-decoration:none;font-weight:700;font-size:1.05rem;display:inline-block;transition:opacity .2s;box-shadow:0 4px 20px rgba(0,0,0,.15);" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">${props.buttonText}</a>
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
      const cards = (props.items || []).map(item => `
        <div style="background:#fff; color:${props.textColor}; border-radius:12px;padding:28px;box-shadow:0 2px 20px rgba(0,0,0,.07);">
          <p style="color:inherit;opacity:.75;line-height:1.8;margin-bottom:20px;font-style:italic;">"${item.text}"</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="${item.avatar}" alt="${item.name}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;"/>
            <div>
              <div style="color:inherit;font-weight:700;font-size:0.9rem;">${item.name}</div>
              <div style="color:${props.accentColor};font-size:0.78rem;">${item.role}</div>
            </div>
          </div>
        </div>`).join('');
      return `<section id="${uid}" class="sf-testimonials ${props.customClass || ''}" style="background:${props.bgColor}; padding:${props.padding || '80px 32px'};">
  <div style="max-width:1100px;margin:auto;text-align:center;">
    <span style="background:${props.accentColor};color:#fff;padding:4px 14px;border-radius:99px;font-size:0.78rem;font-weight:600;">${props.badge}</span>
    <h2 style="color:${props.textColor};font-size:clamp(1.6rem,3vw,2.4rem);font-weight:700;margin:16px 0 40px;font-family:'Poppins',sans-serif;">${props.title}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;text-align:left;">
      ${cards}
    </div>
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
      const cards = (props.plans || []).map(plan => {
        const featList = typeof plan.features === 'string' ? plan.features.split('\n').filter(Boolean) : (plan.features || []);
        const features = featList.map(f => `<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.07);color:inherit;opacity:.75;font-size:0.87rem;">✅ ${f}</div>`).join('');
        const border = plan.featured ? `border:2px solid ${props.accentColor};transform:scale(1.04);` : 'border:1px solid rgba(255,255,255,.1);';
        return `<div style="background:rgba(255,255,255,.05);color:${props.textColor};border-radius:14px;padding:32px;position:relative;${border}">
          ${plan.featured ? `<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:${props.accentColor};color:#fff;padding:3px 16px;border-radius:99px;font-size:0.72rem;font-weight:700;white-space:nowrap;">MOST POPULAR</div>` : ''}
          <div style="font-size:1rem;font-weight:700;color:inherit;margin-bottom:12px;">${plan.name}</div>
          <div style="font-size:2.8rem;font-weight:800;color:inherit;font-family:'Poppins',sans-serif;">${plan.price}<span style="font-size:1rem;font-weight:400;opacity:.5;">${plan.period}</span></div>
          <div style="margin:20px 0;">${features}</div>
          <a href="#contact" style="display:block;text-align:center;${plan.featured ? `background:${props.accentColor};` : 'background:rgba(255,255,255,.1);'}color:#fff;padding:12px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:20px;transition:opacity .2s;" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">${plan.cta}</a>
        </div>`;
      }).join('');
      return `<section id="${uid}" class="sf-pricing ${props.customClass || ''}" style="background:${props.bgColor}; padding:${props.padding || '80px 32px'};">
  <div style="max-width:1000px;margin:auto;text-align:center;">
    <span style="background:${props.accentColor};color:#fff;padding:4px 14px;border-radius:99px;font-size:0.78rem;font-weight:600;">${props.badge}</span>
    <h2 style="color:${props.textColor};font-size:clamp(1.6rem,3vw,2.4rem);font-weight:700;margin:16px 0 10px;font-family:'Poppins',sans-serif;">${props.title}</h2>
    <p style="color:${props.textColor};opacity:.65;margin-bottom:48px;">${props.subtitle}</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;align-items:center;">
      ${cards}
    </div>
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
      const items = (props.items || []).map(item =>
        `<div style="text-align:center;padding:20px;color:${props.textColor};">
          <div style="font-size:clamp(2rem,4vw,3rem);font-weight:800;color:inherit;font-family:'Poppins',sans-serif;">${item.number}</div>
          <div style="color:inherit;opacity:.75;margin-top:8px;font-size:0.95rem;">${item.label}</div>
        </div>`
      ).join('');
      const uid = props.customId || '';
      return `<section id="${uid}" class="sf-stats-block ${props.customClass || ''}" style="background:${props.bgColor}; ${BlockTypes.applyLayout(props)}">
  <div style="max-width:1100px;margin:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px;">
    ${items}
  </div>
</section>`;
    }
  },

  applyLayout(props) {
    return `width:${props.width || '100%'}; height:${props.height || 'auto'}; margin:${props.margin || '0'}; padding:${props.padding || '0'}; display:${props.display || 'block'}; flex-direction:${props.direction || 'row'}; justify-content:${props.justify || 'center'}; align-items:${props.align || 'center'}; gap:${props.gap || '0'}; flex-wrap:wrap;`;
  }

};
