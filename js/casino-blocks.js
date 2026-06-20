// ============================================================
// casino-blocks.js – Casino/Gaming Website Components
// Adds specialized blocks for building casino partnership,
// gaming listing, and affiliate-style websites.
// Loaded AFTER blocks.js
// ============================================================

(function() {
'use strict';

// ============================================================
// 1. ANIMATED GRADIENT BACKGROUND (SVG Blob Animation)
// ============================================================
BlockTypes.animatedBg = {
    label: 'Animated Background',
    icon: 'fa-solid fa-circle-nodes',
    category: 'Media',
    defaultProps: {
        color1: '#6c63ff',
        color2: '#ff6b6b',
        color3: '#feca57',
        color4: '#48dbfb',
        color5: '#ff9ff3',
        bgColor: '#120E05',
        blobSize: '600',
        animSpeed: '20',
        blurAmount: '80',
        opacity: '0.6',
        fixed: true,
        width: '100%',
        height: '100vh',
        margin: '0',
        padding: '0',
        display: 'block',
        customId: '',
        customClass: ''
    },
    render(props) {
        const uid = props.customId || 'animbg_' + Math.random().toString(36).substr(2, 9);
        const size = parseInt(props.blobSize) || 600;
        const speed = parseInt(props.animSpeed) || 20;
        const blur = parseInt(props.blurAmount) || 80;
        const op = parseFloat(props.opacity) || 0.6;
        return `<div id="${uid}" class="sf-animated-bg ${props.customClass || ''}" style="position:relative;height:60px;overflow:hidden;background:${props.bgColor};border:1px dashed rgba(255,255,255,0.15);border-radius:8px;margin:4px 0;">
  <div style="position:absolute;inset:0;filter:blur(${blur}px);opacity:${op};transform:scale(0.2);transform-origin:center;">
    <div style="position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:${props.color1};top:10%;left:20%;animation:sf-blob-move-1 ${speed}s infinite alternate ease-in-out;"></div>
    <div style="position:absolute;width:${size*0.8}px;height:${size*0.8}px;border-radius:50%;background:${props.color2};top:50%;right:20%;animation:sf-blob-move-2 ${speed*1.2}s infinite alternate ease-in-out;"></div>
    <div style="position:absolute;width:${size*0.7}px;height:${size*0.7}px;border-radius:50%;background:${props.color3};bottom:20%;left:40%;animation:sf-blob-move-3 ${speed*0.9}s infinite alternate ease-in-out;"></div>
  </div>
  <div class="sf-bg-label" style="position:relative;z-index:1;display:flex;align-items:center;justify-content:center;height:100%;gap:8px;color:rgba(255,255,255,0.6);font-size:0.72rem;"><i class="fa-solid fa-circle-nodes"></i> Animated BG (fullscreen on site)</div>
</div>
<style>
@keyframes sf-blob-move-1{0%{transform:translate(0,0) scale(1)}50%{transform:translate(100px,-80px) scale(1.1)}100%{transform:translate(-60px,60px) scale(0.9)}}
@keyframes sf-blob-move-2{0%{transform:translate(0,0) scale(1)}50%{transform:translate(-120px,60px) scale(0.9)}100%{transform:translate(80px,-40px) scale(1.1)}}
@keyframes sf-blob-move-3{0%{transform:translate(0,0) scale(1)}50%{transform:translate(60px,-100px) scale(1.05)}100%{transform:translate(-80px,80px) scale(0.95)}}
@keyframes sf-blob-move-4{0%{transform:translate(0,0) scale(1)}50%{transform:translate(-80px,80px) scale(1.1)}100%{transform:translate(100px,-60px) scale(0.9)}}
@keyframes sf-blob-move-5{0%{transform:translate(0,0) scale(1)}50%{transform:translate(80px,60px) scale(0.95)}100%{transform:translate(-60px,-80px) scale(1.05)}}
</style>
<script>
(function(){
  var el = document.getElementById('${uid}');
  if(!el) return;
  // Skip if inside builder canvas
  if(document.getElementById('canvas') && el.closest('#canvas')) return;
  // Make fullscreen background
  el.style.cssText='position:fixed;inset:0;z-index:-1;height:auto;overflow:hidden;background:${props.bgColor};border:none;border-radius:0;margin:0;padding:0;';
  // Scale blobs to full
  var blobDiv = el.children[0];
  if(blobDiv) {
    blobDiv.style.transform='scale(1)';
    blobDiv.style.filter='url(#${uid}-goo) blur(${blur}px)';
    blobDiv.innerHTML+='<div style="position:absolute;width:${size*0.6}px;height:${size*0.6}px;border-radius:50%;background:${props.color4};top:30%;left:60%;animation:sf-blob-move-4 ${speed*1.1}s infinite alternate ease-in-out;"></div><div style="position:absolute;width:${size*0.5}px;height:${size*0.5}px;border-radius:50%;background:${props.color5};bottom:30%;right:30%;animation:sf-blob-move-5 ${speed*0.8}s infinite alternate ease-in-out;"></div>';
  }
  // Hide label
  var lbl = el.querySelector('.sf-bg-label');
  if(lbl) lbl.style.display='none';
  // Move to start of body
  document.body.insertBefore(el, document.body.firstChild);
})();
</script>`;
    }
};


// ============================================================
// 2. GOLD METALLIC HEADING
// ============================================================
BlockTypes.goldHeading = {
    label: 'Gold Heading',
    icon: 'fa-solid fa-crown',
    category: '_hidden',
    defaultProps: {
        text: 'HIMALAYAN HARMONY GROUP',
        subtitle: 'IN NEPAL 2026',
        tag: 'h1',
        fontSize: '3.5rem',
        subtitleSize: '1.5rem',
        gradientStart: '#BF953F',
        gradientMid: '#FCF6BA',
        gradientEnd: '#B38728',
        textShadow: true,
        textAlign: 'center',
        fontFamily: "'Poppins', sans-serif",
        fontWeight: '800',
        letterSpacing: '2px',
        bgColor: 'transparent',
        textColor: '#ffffff',
        accentColor: '#BF953F',
        headingColor: '#FCF6BA',
        cardBg: '#1a1a2e',
        borderColor: 'rgba(255,255,255,0.1)',
        animation: 'fadeInDown',
        width: '100%',
        height: 'auto',
        margin: '0',
        padding: '60px 32px 20px',
        display: 'flex',
        direction: 'column',
        align: 'center',
        gap: '12px',
        customId: '',
        customClass: ''
    },
    render(props) {
        const uid = props.customId || 'goldh_' + Math.random().toString(36).substr(2, 9);
        const shadow = props.textShadow ? 'text-shadow:0 0 20px rgba(191,149,63,0.5),0 0 40px rgba(191,149,63,0.3);' : '';
        const animClass = props.animation ? `sf-anim-${props.animation}` : '';
        return `<div id="${uid}" class="${props.customClass || ''} ${animClass}" style="${BlockTypes.applyLayout(props)}">
  <${props.tag} data-sf-path="segments.0" style="font-family:${props.fontFamily};font-size:${props.fontSize};font-weight:${props.fontWeight};letter-spacing:${props.letterSpacing};background:linear-gradient(135deg,${props.gradientStart},${props.gradientMid},${props.gradientEnd},${props.gradientMid},${props.gradientStart});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-align:${props.textAlign};line-height:1.2;margin:0;${shadow}${BlockTypes.applySubStyle(props,'segments.0','')}">${escHtml(props.text)}</${props.tag}>
  ${props.subtitle ? `<p data-sf-path="segments.1" style="font-family:${props.fontFamily};font-size:${props.subtitleSize};color:rgba(255,255,255,0.8);text-align:${props.textAlign};margin:0;font-weight:400;letter-spacing:4px;${BlockTypes.applySubStyle(props,'segments.1','')}">${escHtml(props.subtitle)}</p>` : ''}
</div>`;
    }
};


// ============================================================
// 3. PARTNER CARDS SECTION
// ============================================================
BlockTypes.partnerCards = {
    label: 'Partner Cards',
    icon: 'fa-solid fa-handshake',
    category: '_hidden',
    defaultProps: {
        heading: 'Our Partners',
        cards: [
            {
                name: '8MBets',
                logo: '',
                badge: 'favourite',
                row1Label: 'Daily Check-In', row1Value: '100%',
                row2Label: 'Referral Bonus', row2Value: '1800',
                row3Label: 'Daily Rebate', row3Value: '0.85%',
                row4Label: 'Sign in Task', row4Value: '28,888',
                row5Label: 'RTP', row5Value: '99.25%',
                link: '#',
                featured: true
            },
            {
                name: 'MJ88',
                logo: '',
                badge: 'hot',
                row1Label: 'Welcome Bonus', row1Value: '250%',
                row2Label: 'Referral Bonus', row2Value: '500+600',
                row3Label: 'Daily Rebate', row3Value: '1.50%',
                row4Label: 'Sign in Task', row4Value: '2,888',
                row5Label: 'RTP', row5Value: '97.15%',
                link: '#',
                featured: false
            },
            {
                name: 'Esewa12',
                logo: '',
                badge: 'hot',
                row1Label: 'Welcome Bonus', row1Value: '100%',
                row2Label: 'Referral Bonus', row2Value: '300+800',
                row3Label: 'Daily Rebate', row3Value: '0.99%',
                row4Label: 'Sign in Task', row4Value: '12,888',
                row5Label: 'RTP', row5Value: '96.90%',
                link: '#',
                featured: false
            }
        ],
        cardBg: 'linear-gradient(to top, #1a1a2e 0%, #16213e 100%)',
        accentColor: '#BF953F',
        textColor: '#ffffff',
        bgColor: '#0F1729',
        headingColor: '#ffffff',
        borderColor: 'rgba(255,255,255,0.1)',
        btnText: 'PLAY NOW',
        btnColor: 'linear-gradient(135deg, #BF953F, #FCF6BA, #B38728)',
        showRainbowBorder: true,
        width: '100%',
        height: 'auto',
        margin: '0',
        padding: '40px 24px',
        display: 'flex',
        direction: 'row',
        align: 'stretch',
        justify: 'center',
        gap: '24px',
        wrap: 'wrap',
        customId: '',
        customClass: ''
    },
    render(props) {
        const uid = props.customId || 'partners_' + Math.random().toString(36).substr(2, 9);
        const cards = props.cards || [];
        const cardsHtml = cards.map((card, i) => {
            const badge = card.badge || 'none';
            const isFeatured = card.featured === true;
            const badgeHtml = badge === 'favourite'
                ? `<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#BF953F,#FCF6BA,#B38728);color:#1a1a2e;padding:4px 16px;border-radius:20px;font-size:0.7rem;font-weight:700;white-space:nowrap;z-index:2;"><i class="fa-solid fa-heart"></i> PLAYERS' FAVOURITE</div>`
                : badge === 'hot'
                    ? `<div style="position:absolute;top:-10px;right:12px;z-index:2;"><img src="https://www.jitnpr.com/wp-content/uploads/2025/09/hot.webp" alt="HOT" style="height:28px;"/></div>`
                    : badge === 'new'
                        ? `<div style="position:absolute;top:-10px;right:12px;z-index:2;"><img src="https://www.jitnpr.com/wp-content/uploads/2025/09/new.webp" alt="NEW" style="height:28px;"/></div>`
                        : '';
            const borderStyle = isFeatured && props.showRainbowBorder
                ? `border:3px solid transparent;background-image:${props.cardBg},linear-gradient(var(--rainbow-angle,0deg),#ff0000,#ff8000,#ffff00,#00ff00,#0080ff,#8000ff,#ff0080);background-origin:border-box;background-clip:padding-box,border-box;animation:sf-rainbow-rotate 3s linear infinite;filter:drop-shadow(0 0 25px rgba(255,230,172,0.6));`
                : `background:${props.cardBg};border:1px solid rgba(255,255,255,0.1);`;
            const btnStyle = isFeatured
                ? `background:${props.btnColor};color:#1a1a2e;font-weight:700;`
                : `background:${props.accentColor};color:#fff;font-weight:600;`;

            // Use flexible row labels (supports custom labels per card)
            const r1Label = card.row1Label || 'Welcome Bonus';
            const r1Value = card.row1Value || card.welcomeBonus || '';
            const r2Label = card.row2Label || 'Referral Bonus';
            const r2Value = card.row2Value || card.referralBonus || '';
            const r3Label = card.row3Label || 'Daily Rebate';
            const r3Value = card.row3Value || card.dailyRebate || '';
            const r4Label = card.row4Label || 'Sign in Task';
            const r4Value = card.row4Value || card.signInTask || '';
            const r5Label = card.row5Label || 'RTP';
            const r5Value = card.row5Value || card.rtp || '';

            return `<div class="sf-partner-card${isFeatured ? ' sf-featured' : ''}" data-sf-path="cards.${i}" style="position:relative;${borderStyle}border-radius:16px;padding:32px 20px 24px;min-width:220px;max-width:280px;flex:1;display:flex;flex-direction:column;align-items:center;gap:16px;transition:transform 0.3s,filter 0.3s;cursor:pointer;" onmouseover="this.style.transform='scale(1.05)';this.style.filter='drop-shadow(0 0 25px rgba(255,230,172,1))'" onmouseout="this.style.transform='';this.style.filter='${isFeatured ? 'drop-shadow(0 0 25px rgba(255,230,172,0.6))' : 'none'}'">
      ${badgeHtml}
      ${card.logo ? `<img src="${escAttr(card.logo)}" alt="${escAttr(card.name)}" style="height:48px;object-fit:contain;"/>` : `<div style="width:80px;height:48px;background:rgba(255,255,255,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;color:${props.textColor};font-size:0.8rem;">${escHtml(card.name)}</div>`}
      <table style="width:100%;border-collapse:collapse;font-size:0.75rem;color:${props.textColor};">
        <tr><td style="padding:6px 4px;opacity:0.7;">${escHtml(r1Label)}</td><td style="padding:6px 4px;text-align:right;font-weight:600;">${escHtml(r1Value)}</td></tr>
        <tr><td style="padding:6px 4px;opacity:0.7;">${escHtml(r2Label)}</td><td style="padding:6px 4px;text-align:right;font-weight:600;">${escHtml(r2Value)}</td></tr>
        <tr><td style="padding:6px 4px;opacity:0.7;">${escHtml(r3Label)}</td><td style="padding:6px 4px;text-align:right;font-weight:600;">${escHtml(r3Value)}</td></tr>
        <tr><td style="padding:6px 4px;opacity:0.7;">${escHtml(r4Label)}</td><td style="padding:6px 4px;text-align:right;font-weight:600;">${escHtml(r4Value)}</td></tr>
        <tr><td style="padding:6px 4px;opacity:0.7;">${escHtml(r5Label)}</td><td style="padding:6px 4px;text-align:right;font-weight:600;">${escHtml(r5Value)}</td></tr>
      </table>
      <a href="${escAttr(card.link)}" target="_blank" style="${btnStyle}display:block;width:100%;text-align:center;padding:12px;border-radius:8px;text-decoration:none;font-size:0.85rem;position:relative;overflow:hidden;"><span style="position:relative;z-index:1;">${escHtml(props.btnText)}</span><span class="sf-btn-shine" style="position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);animation:sf-shine 2s infinite;"></span></a>
    </div>`;
        }).join('');

        return `<section id="${uid}" class="${props.customClass || ''}" style="${BlockTypes.applyLayout(props)}">
  ${cardsHtml}
</section>
<style>
@keyframes sf-rainbow-rotate{0%{--rainbow-angle:0deg}100%{--rainbow-angle:360deg}}
@property --rainbow-angle{syntax:'<angle>';initial-value:0deg;inherits:false}
@keyframes sf-shine{0%{left:-100%}50%{left:100%}100%{left:100%}}
</style>`;
    }
};


// ============================================================
// 4. VIDEO RECOMMENDATIONS SECTION
// ============================================================
BlockTypes.videoRecommendations = {
    label: 'Video Recommendations',
    icon: 'fa-solid fa-video',
    category: '_hidden',
    defaultProps: {
        heading: 'Recommended by:',
        headingColor: '#ffffff',
        videos: [
            { title: '8MBets', thumb: 'https://himalayanharmonygroup.com/scr/8m.png', logo: 'https://himalayanharmonygroup.com/assets/images/8m.png', videoUrl: 'https://vimeo.com/123456', featured: true },
            { title: 'MJ88', thumb: 'https://himalayanharmonygroup.com/scr/m88.png', logo: 'https://himalayanharmonygroup.com/assets/images/mj88.png', videoUrl: 'https://vimeo.com/234567', featured: false },
            { title: 'esewa12', thumb: 'https://himalayanharmonygroup.com/scr/e12.png', logo: 'https://himalayanharmonygroup.com/assets/images/e12.png', videoUrl: 'https://vimeo.com/345678', featured: false },
            { title: 'NPR77', thumb: 'https://himalayanharmonygroup.com/scr/n77.png', logo: 'https://himalayanharmonygroup.com/assets/images/npr77.png', videoUrl: 'https://vimeo.com/456789', featured: false },
            { title: 'MAGAR33', thumb: 'https://himalayanharmonygroup.com/scr/m33.png', logo: 'https://himalayanharmonygroup.com/assets/images/m33.png', videoUrl: 'https://vimeo.com/567890', featured: false }
        ],
        cardBg: '#1a1a2e',
        overlayColor: 'rgba(0,0,0,0.45)',
        btnColor: '#BF953F',
        btnTextColor: '#1a1a2e',
        bgColor: '#0F1729',
        textColor: '#ffffff',
        accentColor: '#BF953F',
        headingColor: '#ffffff',
        borderColor: 'rgba(255,255,255,0.08)',
        width: '100%',
        height: 'auto',
        margin: '0',
        padding: '60px 32px',
        display: 'flex',
        direction: 'column',
        align: 'center',
        gap: '32px',
        customId: '',
        customClass: ''
    },
    render(props) {
        const uid = props.customId || 'vidrec_' + Math.random().toString(36).substr(2, 9);
        const videos = props.videos || [];
        const videosHtml = videos.map((v, i) => {
            const isFeatured = v.featured;
            const resolvedThumb = (typeof AssetManager !== 'undefined' && AssetManager.resolve) ? AssetManager.resolve(v.thumb) : v.thumb;
            const thumbStyle = resolvedThumb ? `background-image:url(${escAttr(resolvedThumb)});background-size:cover;background-position:center top;` : `background:${props.cardBg};`;
            return `<div class="sf-video-card${isFeatured ? ' sf-featured' : ''}" data-sf-path="videos.${i}" style="position:relative;flex:${isFeatured ? '1.6' : '1'};min-width:160px;min-height:${isFeatured ? '320px' : '260px'};border-radius:16px;overflow:hidden;${thumbStyle}display:flex;flex-direction:column;justify-content:flex-end;cursor:pointer;transition:transform 0.3s,box-shadow 0.3s;border:1px solid rgba(255,255,255,0.08);" onmouseover="this.style.transform='scale(1.03)';this.style.boxShadow='0 12px 40px rgba(0,0,0,0.4)'" onmouseout="this.style.transform='';this.style.boxShadow='none'">
        <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(0,0,0,0.85) 0%, ${props.overlayColor} 50%, rgba(0,0,0,0.2) 100%);"></div>
        ${v.logo ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1;opacity:0.9;"><img src="${escAttr(v.logo)}" alt="${escAttr(v.title)}" style="height:${isFeatured ? '50px' : '38px'};object-fit:contain;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.5));"/></div>` : ''}
        <div style="position:relative;z-index:2;padding:${isFeatured ? '24px' : '18px'};display:flex;flex-direction:column;gap:10px;">
          <h4 style="color:#fff;font-weight:700;font-size:${isFeatured ? '1.1rem' : '0.9rem'};margin:0;">${escHtml(v.title)}</h4>
          <button class="sf-watch-btn" onclick="document.getElementById('${uid}-modal-${i}').style.display='flex'" style="display:inline-flex;align-items:center;gap:8px;background:${props.btnColor};color:${props.btnTextColor};padding:${isFeatured ? '11px 22px' : '9px 18px'};border-radius:8px;border:none;font-weight:700;font-size:${isFeatured ? '0.82rem' : '0.75rem'};width:fit-content;cursor:pointer;transition:transform 0.2s,opacity 0.2s;box-shadow:0 4px 12px rgba(191,149,63,0.3);" onmouseover="this.style.transform='translateY(-1px)';this.style.opacity='0.9'" onmouseout="this.style.transform='';this.style.opacity='1'"><i class="fa-solid fa-play" style="font-size:0.7rem;"></i> WATCH NOW</button>
        </div>
      </div>
      <div id="${uid}-modal-${i}" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:99999;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);" onclick="if(event.target===this){this.style.display='none';var ifr=this.querySelector('iframe');if(ifr)ifr.src=ifr.src;}">
        <div style="position:relative;width:100%;max-width:900px;aspect-ratio:16/9;">
          <iframe src="${escAttr(VideoHelper.getEmbedUrl(v.videoUrl))}" style="width:100%;height:100%;border:none;border-radius:12px;" allow="autoplay;fullscreen" allowfullscreen></iframe>
          <button onclick="var m=this.closest('[id$=&quot;-modal-${i}&quot;]');m.style.display='none';var ifr=m.querySelector('iframe');if(ifr)ifr.src=ifr.src;" style="position:absolute;top:-44px;right:0;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.2rem;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">&times;</button>
        </div>
      </div>`;
        }).join('');

        return `<section id="${uid}" class="${props.customClass || ''}" style="background:${props.bgColor || 'transparent'};${BlockTypes.applyLayout(props)}">
  <h2 data-sf-path="segments.0" style="color:${props.headingColor};font-size:1.8rem;font-weight:700;text-align:center;margin:0;${BlockTypes.applySubStyle(props,'segments.0','')}">${escHtml(props.heading)}</h2>
  <div class="sf-video-grid" style="display:flex;gap:16px;width:100%;max-width:1200px;">
    ${videosHtml}
  </div>
</section>
<style>
@media(max-width:768px){
  #${uid} .sf-video-grid{flex-direction:column;}
  #${uid} .sf-video-card{min-height:200px!important;flex:1!important;}
}
</style>`;
    }
};


// ============================================================
// 5. GAME CAROUSEL (Auto-sliding Owl Carousel style)
// ============================================================
BlockTypes.gameCarousel = {
    label: 'Game Carousel',
    icon: 'fa-solid fa-gamepad',
    category: '_hidden',
    defaultProps: {
        heading: 'Popular Games',
        headingColor: '#ffffff',
        variant: 'popular',
        games: [
            { name: 'Sugar Rush', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/sugar-rush.webp', waysToWin: '3580', link: '#' },
            { name: 'Wild Bandito', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/552x380_EN_GAMEID_49.webp', waysToWin: '3058', link: '#' },
            { name: 'Sweet Bonanza', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/sweet-bonanza.webp', waysToWin: '2670', link: '#' },
            { name: 'Tiger Dance', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/tiger-dance.webp', waysToWin: '3647', link: '#' },
            { name: 'Zeus', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/zeus.webp', waysToWin: '2185', link: '#' },
            { name: 'Starlight Princess', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/starlight-princess.webp', waysToWin: '2478', link: '#' },
            { name: 'Mahjong Ways', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/552x380_EN_GAMEID_47.webp', waysToWin: '4582', link: '#' },
            { name: 'Gates of Olympus', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/gates-of-olympus.webp', waysToWin: '2593', link: '#' },
            { name: 'Legacy of Kong', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/legacy-of-kong-maxways.webp', waysToWin: '1620', link: '#' },
            { name: 'Lucky Fortunes', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/lucky-fortunes.webp', waysToWin: '3177', link: '#' }
        ],
        partnerLinks: ['#partner1', '#partner2', '#partner3'],
        showFireEmoji: false,
        autoplay: true,
        autoplaySpeed: 3000,
        slidesToShow: 5,
        cardBg: '#1e293b',
        overlayColor: 'rgba(0,0,0,0.7)',
        accentColor: '#BF953F',
        bgColor: '#0F1729',
        textColor: '#ffffff',
        headingColor: '#ffffff',
        borderColor: 'rgba(255,255,255,0.1)',
        btnText: 'PLAY NOW',
        width: '100%',
        height: 'auto',
        margin: '0',
        padding: '60px 32px',
        display: 'flex',
        direction: 'column',
        align: 'center',
        gap: '32px',
        customId: '',
        customClass: ''
    },
    render(props) {
        const uid = props.customId || 'gamec_' + Math.random().toString(36).substr(2, 9);
        const games = props.games || [];
        const fireEmoji = props.showFireEmoji ? `<img src="https://images.emojiterra.com/google/noto-emoji/animated-emoji/1f525.gif" alt="fire" style="position:absolute;top:8px;right:8px;width:32px;height:32px;z-index:2;pointer-events:none;"/>` : '';
        const slidesToShow = props.slidesToShow || 5;
        const gamesHtml = games.map((game, i) => {
            const thumbBg = game.thumb ? `<img src="${escAttr(game.thumb)}" alt="${escAttr(game.name)}" style="width:100%;height:100%;object-fit:cover;"/>` : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#2d1b69,#11998e);"></div>`;
            return `<div class="sf-game-slide" data-sf-path="games.${i}" style="position:relative;border-radius:12px;overflow:hidden;aspect-ratio:3/4;flex:0 0 calc(${100/slidesToShow}% - 12px);min-width:0;cursor:pointer;background-color:${props.cardBg};" onmouseover="this.querySelector('.sf-game-overlay').style.opacity='1'" onmouseout="this.querySelector('.sf-game-overlay').style.opacity='0'">
        ${fireEmoji}
        ${thumbBg}
        <div class="sf-game-overlay" style="position:absolute;inset:0;background:${props.overlayColor};opacity:0;transition:opacity 0.3s;display:flex;align-items:center;justify-content:center;z-index:3;">
          <span style="background:${props.accentColor};color:#fff;padding:10px 24px;border-radius:8px;font-weight:700;font-size:0.8rem;pointer-events:none;">${escHtml(props.btnText)}</span>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;padding:10px 12px;background:linear-gradient(transparent,rgba(0,0,0,0.85));z-index:1;">
          <p style="color:#fff;font-size:0.75rem;font-weight:600;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(game.name)}</p>
          ${game.waysToWin ? `<p style="color:rgba(255,255,255,0.6);font-size:0.68rem;margin:3px 0 0;">${escHtml(game.waysToWin)} ways to win</p>` : ''}
        </div>
      </div>`;
        }).join('');

        const autoplaySpeed = props.autoplaySpeed || 3000;

        return `<section id="${uid}" class="${props.customClass || ''}" style="${BlockTypes.applyLayout(props)}">
  <h2 data-sf-path="segments.0" style="color:${props.headingColor};font-size:2rem;font-weight:700;text-align:center;margin:0;${BlockTypes.applySubStyle(props,'segments.0','')}">${props.showFireEmoji ? '🔥 ' : ''}${escHtml(props.heading)}</h2>
  <div class="sf-game-carousel-track" style="display:flex;gap:12px;width:100%;max-width:1200px;overflow:hidden;position:relative;">
    <div class="sf-game-carousel-inner" style="display:flex;gap:12px;transition:transform 0.5s ease;will-change:transform;">
      ${gamesHtml}
    </div>
  </div>
</section>
<style>
#${uid} .sf-game-slide:hover .sf-game-overlay{opacity:1}
@media(max-width:992px){#${uid} .sf-game-slide{flex:0 0 calc(33.333% - 12px);}}
@media(max-width:576px){#${uid} .sf-game-slide{flex:0 0 calc(50% - 12px);}}
</style>
<script>
(function(){
  var el = document.getElementById('${uid}');
  if(!el || el.closest('#canvas'))return;
  var track = el.querySelector('.sf-game-carousel-inner');
  var slides = el.querySelectorAll('.sf-game-slide');
  if(!track || slides.length <= ${slidesToShow}) return;
  var idx = 0;
  var total = slides.length;
  // Clone slides for infinite loop
  var clones = '';
  slides.forEach(function(s){clones += s.outerHTML;});
  track.innerHTML += clones;
  var allSlides = track.querySelectorAll('.sf-game-slide');
  function advance(){
    idx++;
    track.style.transition = 'transform 0.5s ease';
    track.style.transform = 'translateX(-' + (idx * (100/${slidesToShow})) + '%)';
    if(idx >= total){
      setTimeout(function(){
        track.style.transition = 'none';
        idx = 0;
        track.style.transform = 'translateX(0)';
      }, 520);
    }
  }
  var interval = setInterval(advance, ${autoplaySpeed});
  el.addEventListener('mouseenter', function(){clearInterval(interval);});
  el.addEventListener('mouseleave', function(){interval = setInterval(advance, ${autoplaySpeed});});
  // Random link redirect
  var links = ${JSON.stringify(props.partnerLinks || [])};
  el.querySelectorAll('.sf-game-overlay').forEach(function(ov){
    ov.addEventListener('click',function(){
      if(links.length){window.open(links[Math.floor(Math.random()*links.length)],'_blank');}
    });
  });
})();
</script>`;
    }
};


// ============================================================
// 6. FAQ ACCORDION (with JSON-LD Schema)
// ============================================================
BlockTypes.faqAccordion = {
    label: 'FAQ Accordion',
    icon: 'fa-solid fa-circle-question',
    category: '_hidden',
    defaultProps: {
        heading: 'FREQUENTLY ASKED QUESTIONS',
        subtitle: 'NEPAL 2025',
        headingColor: '#ffffff',
        subtitleColor: 'rgba(255,255,255,0.5)',
        items: [
            { question: 'Is this platform legal in Nepal?', answer: 'Yes, we operate under a valid gaming license from Curacao and serve players in compliance with international gaming regulations. We are fully licensed and regulated, ensuring a safe and legal gaming environment for all our players.' },
            { question: 'How quickly can I withdraw my winnings?', answer: 'Most withdrawals are processed within 24 hours for verified accounts, with e-wallet withdrawals often completed within minutes. VIP members enjoy priority processing with even faster withdrawal times.' },
            { question: 'What games are available?', answer: 'We offer over 3,000 games including slots, live casino, sports betting, table games, and lottery options. Our game library features titles from top providers like Pragmatic Play, Microgaming, Evolution Gaming, and NetEnt.' },
            { question: 'Is my personal information safe?', answer: 'Absolutely! We use 256-bit SSL encryption and follow strict data protection policies to keep your information secure. Our platform employs industry-leading security measures including advanced firewalls and regular security audits.' },
            { question: 'Can I play on my mobile device?', answer: 'Yes! Our platform is fully optimized for mobile devices with both responsive website and dedicated mobile app. You can enjoy the same high-quality gaming experience on your smartphone or tablet.' },
            { question: 'What payment methods do you accept?', answer: 'We support local banks (Nabil Bank, Himalayan Bank, Nepal Investment Bank), e-wallets (eSewa, Khalti, IME Pay), cryptocurrency (Bitcoin, Ethereum), mobile banking (Connect IPS), and various prepaid card options.' },
            { question: 'What bonuses are available for new players?', answer: 'New players can enjoy a 250% welcome bonus up to NPR 50,000, plus regular promotions including daily reload bonuses (60%), cashback offers (up to 20%), free spins on popular slots, and access to our exclusive VIP program.' },
            { question: 'How do I contact customer support?', answer: 'Our 24/7 customer support team is available through multiple channels: live chat on our website, email support, phone support, WhatsApp messaging, and our comprehensive FAQ section.' },
            { question: 'What is the minimum deposit amount?', answer: 'The minimum deposit amount varies by payment method, but typically starts from NPR 100. This low minimum allows players of all budgets to enjoy our gaming platform.' },
            { question: 'How do I verify my account?', answer: 'Account verification is simple and secure. You\'ll need to provide a valid government-issued ID, proof of address (utility bill or bank statement), and in some cases, a selfie with your ID. The verification process usually takes 24-48 hours.' },
            { question: 'Are the games fair and random?', answer: 'Yes, all our games use certified Random Number Generators (RNG) and are regularly tested by independent laboratories to ensure fair play and random outcomes. We are committed to transparency with RTP rates up to 98%.' },
            { question: 'Can I set deposit limits for responsible gaming?', answer: 'Absolutely! We provide comprehensive responsible gaming tools including deposit limits (daily, weekly, monthly), session time limits, loss limits, self-exclusion options, and reality checks.' },
            { question: 'What sports can I bet on?', answer: 'We cover over 40 sports with thousands of betting markets including cricket (IPL, World Cup, Nepal Premier League), football (Premier League, La Liga, Bundesliga), basketball (NBA, EuroLeague), tennis, esports, and many more.' },
            { question: 'How do I become a VIP member?', answer: 'VIP membership is automatically awarded based on your gaming activity and loyalty. As you play and wager, you\'ll progress through different VIP levels, each offering enhanced rewards including personal account managers and faster withdrawals.' },
            { question: 'What languages are supported on the platform?', answer: 'Our platform supports multiple languages including English, Nepali, and Hindi. The interface, customer support, and all communications are available in these languages.' },
            { question: 'Can I play live casino games?', answer: 'Yes! Our live casino features professional dealers streaming in HD quality, offering games like Live Baccarat, Live Blackjack, Live Roulette, Live Dragon Tiger, and Live Sic Bo. You can interact with dealers in real-time.' }
        ],
        bgColor: '#0F1729',
        cardBg: 'rgba(255,255,255,0.03)',
        cardBgHover: 'rgba(255,255,255,0.05)',
        textColor: '#ffffff',
        answerColor: 'rgba(255,255,255,0.7)',
        accentColor: '#BF953F',
        borderColor: 'rgba(255,255,255,0.08)',
        contentMaxWidth: '900px',
        singleOpen: true,
        includeSchema: true,
        width: '100%',
        height: 'auto',
        margin: '0',
        padding: '80px 32px',
        display: 'block',
        customId: '',
        customClass: ''
    },
    render(props) {
        const uid = props.customId || 'faq_' + Math.random().toString(36).substr(2, 9);
        const items = props.items || [];
        const singleOpen = props.singleOpen !== false;
        const faqHtml = items.map((item, i) => {
            const onclickCode = singleOpen
                ? `var item=this.closest('.sf-faq-item');var list=item.parentElement;list.querySelectorAll('.sf-faq-item').forEach(function(x){if(x!==item){x.classList.remove('sf-faq-open');var a=x.querySelector('.sf-faq-answer');if(a)a.style.maxHeight='0';}});var ans=item.querySelector('.sf-faq-answer');if(item.classList.contains('sf-faq-open')){item.classList.remove('sf-faq-open');ans.style.maxHeight='0';}else{item.classList.add('sf-faq-open');ans.style.maxHeight=ans.scrollHeight+'px';}`
                : `var item=this.closest('.sf-faq-item');var ans=item.querySelector('.sf-faq-answer');if(item.classList.contains('sf-faq-open')){item.classList.remove('sf-faq-open');ans.style.maxHeight='0';}else{item.classList.add('sf-faq-open');ans.style.maxHeight=ans.scrollHeight+'px';}`;
            return `<div class="sf-faq-item" data-sf-path="items.${i}" style="border:1px solid ${props.borderColor};border-radius:12px;overflow:hidden;background:${props.cardBg};transition:background 0.2s;">
        <button type="button" class="sf-faq-question" onclick="${onclickCode}" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:18px 24px;background:none;border:none;color:${props.textColor};font-size:0.92rem;font-weight:600;cursor:pointer;text-align:left;font-family:inherit;gap:16px;line-height:1.4;">
          <span style="flex:1;">${escHtml(item.question)}</span>
          <span class="sf-faq-icon" style="width:28px;height:28px;border-radius:50%;background:rgba(191,149,63,0.15);display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:400;transition:transform 0.3s,background 0.3s;color:${props.accentColor};flex-shrink:0;">+</span>
        </button>
        <div class="sf-faq-answer" style="max-height:0;overflow:hidden;transition:max-height 0.4s ease;">
          <div style="padding:0 24px 20px;color:${props.answerColor || 'rgba(255,255,255,0.7)'};font-size:0.88rem;line-height:1.8;">${escHtml(item.answer)}</div>
        </div>
      </div>`;
        }).join('');

        const schemaJson = props.includeSchema ? `<script type="application/ld+json">${JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": items.map(item => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": { "@type": "Answer", "text": item.answer }
            }))
        })}<\/script>` : '';

        return `<section id="${uid}" class="${props.customClass || ''}" style="background:${props.bgColor};${BlockTypes.applyLayout(props)}">
  <div style="max-width:${props.contentMaxWidth || '900px'};margin:0 auto;text-align:center;margin-bottom:20px;">
    <h2 data-sf-path="segments.0" style="color:${props.headingColor};font-size:clamp(1.4rem,4vw,2rem);font-weight:700;margin:0 0 8px;letter-spacing:1px;${BlockTypes.applySubStyle(props,'segments.0','')}">${escHtml(props.heading)}</h2>
    ${props.subtitle ? `<p data-sf-path="segments.1" style="color:${props.subtitleColor};font-size:0.85rem;letter-spacing:3px;margin:0;font-weight:400;${BlockTypes.applySubStyle(props,'segments.1','')}">${escHtml(props.subtitle)}</p>` : ''}
  </div>
  <div class="sf-faq-list" style="width:100%;max-width:${props.contentMaxWidth || '900px'};margin:0 auto;display:flex;flex-direction:column;gap:10px;">
    ${faqHtml}
  </div>
  ${schemaJson}
</section>
<style>
#${uid} .sf-faq-item.sf-faq-open{background:${props.cardBgHover || 'rgba(255,255,255,0.05)'};border-color:rgba(191,149,63,0.2);}
#${uid} .sf-faq-item.sf-faq-open .sf-faq-answer{max-height:500px;}
#${uid} .sf-faq-item.sf-faq-open .sf-faq-icon{transform:rotate(45deg);background:rgba(191,149,63,0.3);}
#${uid} .sf-faq-question:hover{background:rgba(255,255,255,0.02);}
@media(max-width:768px){
  #${uid} .sf-faq-question{padding:14px 16px;font-size:0.84rem;gap:12px;}
  #${uid} .sf-faq-answer div{padding:0 16px 16px;font-size:0.82rem;}
  #${uid} .sf-faq-icon{width:24px;height:24px;font-size:1rem;}
}
</style>`;
    }
};


// ============================================================
// 7. CASINO NAVBAR (with Dropdown Sub-menus)
// ============================================================
BlockTypes.casinoNavbar = {
    label: 'Casino Navbar',
    icon: 'fa-solid fa-dice',
    category: '_hidden',
    defaultProps: {
        brand: 'CasinoSite',
        logo: '',
        bgColor: '#120E05',
        textColor: '#ffffff',
        accentColor: '#BF953F',
        headingColor: '#ffffff',
        cardBg: '#1a1a2e',
        borderColor: 'rgba(255,255,255,0.1)',
        links: [
            {
                label: 'Casino',
                href: '#casino',
                children: [
                    { label: 'Lottery', href: '#lottery' },
                    { label: 'Fishing Games', href: '#fishing' }
                ]
            },
            { label: 'Live Casino', href: '#live-casino', children: [] },
            {
                label: 'Sports Betting',
                href: '#sports',
                children: [
                    { label: 'Esports', href: '#esports' }
                ]
            },
            { label: 'Cockfighting', href: '#cockfighting', children: [] },
            { label: 'App', href: '#app', children: [] }
        ],
        sticky: true,
        showButton: true,
        buttonText: 'JOIN NOW',
        buttonHref: '#register',
        width: '100%',
        height: 'auto',
        margin: '0',
        padding: '14px 32px',
        display: 'flex',
        justify: 'space-between',
        align: 'center',
        gap: '24px',
        customId: '',
        customClass: ''
    },
    render(props) {
        const uid = props.customId || 'cnav_' + Math.random().toString(36).substr(2, 9);
        const logo = props.logo ? `<img src="${escAttr(props.logo)}" alt="logo" style="height:40px;object-fit:contain;"/>` : '';
        const linksHtml = (props.links || []).map((link, i) => {
            let children = link.children || [];
            if (!children.length && link.childrenText) {
                children = link.childrenText.split('\n').filter(l => l.trim()).map(l => {
                    const parts = l.split('|').map(p => p.trim());
                    return { label: parts[0] || '', href: parts[1] || '#' };
                });
            }
            const hasChildren = children.length > 0;
            const dropdownHtml = hasChildren ? `<div class="sf-cn-dropdown" style="position:absolute;top:100%;left:0;min-width:180px;background:${props.bgColor};border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px 0;opacity:0;visibility:hidden;transform:translateY(8px);transition:all 0.3s;z-index:1000;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                ${children.map(child => `<a href="${escAttr(child.href)}" style="display:block;padding:10px 20px;color:${props.textColor};text-decoration:none;font-size:0.85rem;transition:background 0.2s;" onmouseover="this.style.background='rgba(191,149,63,0.15)'" onmouseout="this.style.background='none'">${escHtml(child.label)}</a>`).join('')}
            </div>` : '';
            return `<div class="sf-cn-link-wrap" style="position:relative;" data-sf-path="links.${i}" onmouseover="var d=this.querySelector('.sf-cn-dropdown');if(d){d.style.opacity='1';d.style.visibility='visible';d.style.transform='translateY(0)';}" onmouseout="var d=this.querySelector('.sf-cn-dropdown');if(d){d.style.opacity='0';d.style.visibility='hidden';d.style.transform='translateY(8px)';}">
                <a href="${escAttr(link.href)}" style="color:${props.textColor};text-decoration:none;font-weight:500;font-size:0.9rem;padding:8px 12px;display:flex;align-items:center;gap:4px;transition:color 0.2s;" onmouseover="this.style.color='${props.accentColor}'" onmouseout="this.style.color='${props.textColor}'">${escHtml(link.label)}${hasChildren ? ' <i class="fa-solid fa-chevron-down" style="font-size:0.6rem;"></i>' : ''}</a>
                ${dropdownHtml}
            </div>`;
        }).join('');

        const btn = props.showButton ? `<a href="${escAttr(props.buttonHref)}" style="background:linear-gradient(135deg,#BF953F,#FCF6BA,#B38728);color:#1a1a2e;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.85rem;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform=''">${escHtml(props.buttonText)}</a>` : '';

        return `<nav id="${uid}" class="sf-casino-navbar ${props.customClass || ''}" style="background:${props.bgColor};${props.sticky ? 'position:sticky;top:0;z-index:900;' : ''}${BlockTypes.applyLayout(props)}box-shadow:0 2px 20px rgba(0,0,0,0.3);">
  <div style="display:flex;align-items:center;gap:12px;">
    ${logo}<span style="color:${props.textColor};font-size:1.2rem;font-weight:700;">${escHtml(props.brand)}</span>
  </div>
  <div class="sf-cn-hamburger" onclick="this.closest('nav').classList.toggle('sf-cn-open')" style="display:none;flex-direction:column;gap:5px;cursor:pointer;padding:10px;z-index:1001;">
    <span style="width:25px;height:3px;background:${props.textColor};border-radius:2px;transition:0.3s;"></span>
    <span style="width:25px;height:3px;background:${props.textColor};border-radius:2px;transition:0.3s;"></span>
    <span style="width:25px;height:3px;background:${props.textColor};border-radius:2px;transition:0.3s;"></span>
  </div>
  <div class="sf-cn-links" style="display:flex;align-items:center;gap:4px;">
    ${linksHtml}
  </div>
  <div class="sf-cn-actions">${btn}</div>
</nav>
<style>
#${uid} .sf-cn-link-wrap:hover .sf-cn-dropdown{opacity:1;visibility:visible;transform:translateY(0);}
@media(max-width:768px){
  #${uid} .sf-cn-hamburger{display:flex!important;}
  #${uid} .sf-cn-links{position:fixed;inset:0;background:${props.bgColor};flex-direction:column;justify-content:center;align-items:center;gap:24px;z-index:1000;opacity:0;visibility:hidden;transition:all 0.3s;}
  #${uid}.sf-cn-open .sf-cn-links{opacity:1;visibility:visible;}
  #${uid} .sf-cn-actions{display:none;}
  #${uid}.sf-cn-open .sf-cn-actions{display:flex;position:fixed;bottom:40px;left:50%;transform:translateX(-50%);z-index:1001;}
}
</style>`;
    }
};


// ============================================================
// 8. CASINO FOOTER (with Partner Logos)
// ============================================================
BlockTypes.casinoFooter = {
    label: 'Casino Footer',
    icon: 'fa-solid fa-trophy',
    category: '_hidden',
    defaultProps: {
        logo: '',
        brand: 'CasinoSite',
        description: 'Your trusted online gaming destination. Licensed and regulated for fair play.',
        partnerLogos: [
            { logo: '', name: 'Partner 1', link: '#' },
            { logo: '', name: 'Partner 2', link: '#' },
            { logo: '', name: 'Partner 3', link: '#' }
        ],
        partnersHeading: 'Exclusive Partnerships',
        copyright: '© 2026 CasinoSite. All rights reserved.',
        bgColor: '#0a0a0f',
        textColor: '#ffffff',
        accentColor: '#BF953F',
        headingColor: '#BF953F',
        cardBg: '#1a1a2e',
        borderColor: 'rgba(255,255,255,0.1)',
        width: '100%',
        height: 'auto',
        margin: '0',
        padding: '60px 32px 30px',
        display: 'flex',
        direction: 'column',
        align: 'center',
        gap: '40px',
        customId: '',
        customClass: ''
    },
    render(props) {
        const uid = props.customId || 'cfooter_' + Math.random().toString(36).substr(2, 9);
        const logo = props.logo ? `<img src="${escAttr(props.logo)}" alt="logo" style="height:48px;object-fit:contain;"/>` : '';
        const partners = props.partnerLogos || [];
        const partnersHtml = partners.map((p, i) => {
            const logoEl = p.logo
                ? `<img src="${escAttr(p.logo)}" alt="${escAttr(p.name)}" style="height:40px;object-fit:contain;opacity:0.7;transition:opacity 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'"/>`
                : `<span style="padding:8px 16px;background:rgba(255,255,255,0.1);border-radius:8px;color:${props.textColor};font-size:0.8rem;font-weight:600;">${escHtml(p.name)}</span>`;
            return `<a href="${escAttr(p.link)}" data-sf-path="partnerLogos.${i}" style="text-decoration:none;">${logoEl}</a>`;
        }).join('');

        return `<footer id="${uid}" class="${props.customClass || ''}" style="background:${props.bgColor};${BlockTypes.applyLayout(props)}">
  <div style="display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;max-width:600px;">
    <div style="display:flex;align-items:center;gap:12px;">
      ${logo}<span style="color:${props.textColor};font-size:1.3rem;font-weight:700;">${escHtml(props.brand)}</span>
    </div>
    <p data-sf-path="segments.0" style="color:rgba(255,255,255,0.6);font-size:0.9rem;line-height:1.6;margin:0;${BlockTypes.applySubStyle(props,'segments.0','')}">${escHtml(props.description)}</p>
  </div>
  <div style="width:100%;border-top:1px solid ${props.borderColor};padding-top:32px;display:flex;flex-direction:column;align-items:center;gap:20px;">
    <h3 style="color:${props.accentColor};font-size:1rem;font-weight:600;margin:0;">${escHtml(props.partnersHeading)}</h3>
    <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;justify-content:center;">
      ${partnersHtml}
    </div>
  </div>
  <p style="color:rgba(255,255,255,0.4);font-size:0.8rem;text-align:center;margin:0;padding-top:20px;border-top:1px solid ${props.borderColor};width:100%;">${escHtml(props.copyright)}</p>
</footer>`;
    }
};


// ============================================================
// 9. SEO CONTENT BLOCK
// ============================================================
BlockTypes.seoContent = {
    label: 'SEO Content',
    icon: 'fa-solid fa-file-lines',
    category: '_hidden',
    defaultProps: {
        sections: [
            {
                heading: 'Why Choose Us',
                content: 'We offer the best online gaming experience with over 3000+ games, live casino, sports betting, and more. Our platform is licensed, secure, and offers 24/7 customer support.'
            },
            {
                heading: 'Extensive Game Library – Over 3,000 Games',
                content: 'Explore our vast collection of 3000+ games including slots, table games, live dealer games, fishing games, and lottery. New games are added weekly from top providers like Pragmatic Play, Microgaming, Evolution Gaming, and NetEnt.'
            },
            {
                heading: 'Live Casino Experience',
                content: 'Experience the thrill of a real casino from the comfort of your home. Our professional dealers stream in crystal-clear HD, bringing authentic casino atmosphere directly to your screen with multiple tables and betting limits.'
            },
            {
                heading: 'Sports Betting – Comprehensive Coverage',
                content: 'Our sports betting platform covers over 40 sports with thousands of betting markets available daily. From major international tournaments to local leagues, with competitive odds and live betting options.'
            },
            {
                heading: 'Payment Methods – Secure and Convenient',
                content: 'We support a wide range of payment methods including local banks, e-wallets (eSewa, Khalti, IME Pay), cryptocurrency (Bitcoin, Ethereum), mobile banking (Connect IPS), and prepaid cards. Most deposits are instant.'
            },
            {
                heading: 'Bonuses and Promotions',
                content: 'Enjoy generous welcome bonuses up to 250%, daily reload bonuses (60%), cashback offers (up to 20%), free spins on popular slots, and access to our exclusive VIP program with enhanced benefits.'
            },
            {
                heading: 'Mobile Gaming – Play Anywhere',
                content: 'Our responsive website and dedicated mobile app provide full access to all games and features on your smartphone or tablet. Optimized for touch controls with the same high-quality graphics and smooth gameplay.'
            },
            {
                heading: 'Security and Fair Play',
                content: 'We employ industry-leading security measures including 256-bit SSL encryption, advanced firewalls, and regular security audits. All games are tested by independent laboratories to guarantee fair play and random outcomes.'
            },
            {
                heading: 'VIP Program – Exclusive Benefits',
                content: 'Our VIP program rewards loyal players with personal account managers, faster withdrawals, exclusive bonuses, higher limits, and invitations to special events. Progress through levels automatically as you play.'
            },
            {
                heading: 'Responsible Gaming',
                content: 'We provide various tools including deposit limits, session time limits, self-exclusion options, and access to professional support services to help players maintain control over their gaming activities.'
            }
        ],
        bgColor: '#0F1729',
        textColor: '#ffffff',
        headingColor: '#ffffff',
        contentColor: 'rgba(255,255,255,0.75)',
        accentColor: '#BF953F',
        cardBg: '#1a1a2e',
        borderColor: 'rgba(255,255,255,0.1)',
        contentMaxWidth: '900px',
        width: '100%',
        height: 'auto',
        margin: '0',
        padding: '80px 32px',
        display: 'block',
        customId: '',
        customClass: ''
    },
    render(props) {
        const uid = props.customId || 'seo_' + Math.random().toString(36).substr(2, 9);
        const sections = props.sections || [];
        const sectionsHtml = sections.map((sec, i) => {
            return `<div data-sf-path="sections.${i}" style="width:100%;">
        <h2 style="color:${props.headingColor};font-size:clamp(1.2rem,3vw,1.5rem);font-weight:700;margin:0 0 16px;line-height:1.3;">${escHtml(sec.heading)}</h2>
        <p style="color:${props.contentColor || 'rgba(255,255,255,0.75)'};font-size:clamp(0.85rem,2vw,0.95rem);line-height:1.8;margin:0;word-wrap:break-word;overflow-wrap:break-word;">${escHtml(sec.content)}</p>
      </div>`;
        }).join('');

        return `<section id="${uid}" class="sf-seo-content ${props.customClass || ''}" style="background:${props.bgColor};${BlockTypes.applyLayout(props)}">
  <div class="sf-seo-inner" style="width:100%;max-width:${props.contentMaxWidth || '900px'};margin:0 auto;display:flex;flex-direction:column;gap:40px;">
    ${sectionsHtml}
  </div>
</section>
<style>
@media(max-width:768px){
  #${uid} .sf-seo-inner{gap:30px;}
}
</style>`;
    }
};


// ============================================================
// 10. CASINO HERO SECTION (Full-featured hero with CTA)
// ============================================================
BlockTypes.casinoHero = {
    label: 'Casino Hero',
    icon: 'fa-solid fa-star',
    category: '_hidden',
    defaultProps: {
        heading: 'HIMALAYAN HARMONY GROUP',
        subtitle: 'IN NEPAL 2026',
        description: 'Your premier destination for online gaming entertainment',
        gradientStart: '#BF953F',
        gradientMid: '#FCF6BA',
        gradientEnd: '#B38728',
        bgColor: '#120E05',
        textColor: '#ffffff',
        accentColor: '#BF953F',
        headingColor: '#FCF6BA',
        cardBg: '#1a1a2e',
        borderColor: 'rgba(255,255,255,0.1)',
        bgImage: '',
        showCta: true,
        ctaText: 'JOIN NOW',
        ctaLink: '#register',
        ctaColor: 'linear-gradient(135deg, #BF953F, #FCF6BA, #B38728)',
        showBlobs: true,
        fontFamily: "'Poppins', sans-serif",
        animation: 'fadeInUp',
        width: '100%',
        height: '100vh',
        margin: '0',
        padding: '80px 32px',
        display: 'flex',
        direction: 'column',
        align: 'center',
        justify: 'center',
        gap: '24px',
        customId: '',
        customClass: ''
    },
    render(props) {
        const uid = props.customId || 'chero_' + Math.random().toString(36).substr(2, 9);
        const blobsHtml = props.showBlobs ? `
  <div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;">
    <div style="position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,${props.gradientStart}33,transparent 70%);top:-10%;left:-10%;animation:sf-blob-move-1 20s infinite alternate ease-in-out;"></div>
    <div style="position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,${props.gradientEnd}33,transparent 70%);bottom:-10%;right:-10%;animation:sf-blob-move-2 25s infinite alternate ease-in-out;"></div>
    <div style="position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,${props.gradientMid}22,transparent 70%);top:40%;left:50%;animation:sf-blob-move-3 18s infinite alternate ease-in-out;"></div>
  </div>` : '';

        const ctaHtml = props.showCta ? `<a href="${escAttr(props.ctaLink)}" data-sf-path="segments.3" style="background:${props.ctaColor};color:#1a1a2e;padding:16px 40px;border-radius:10px;text-decoration:none;font-weight:800;font-size:1rem;letter-spacing:1px;position:relative;overflow:hidden;transition:transform 0.3s,box-shadow 0.3s;box-shadow:0 8px 30px rgba(191,149,63,0.4);z-index:1;${BlockTypes.applySubStyle(props,'segments.3','')}" onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 12px 40px rgba(191,149,63,0.6)'" onmouseout="this.style.transform='';this.style.boxShadow='0 8px 30px rgba(191,149,63,0.4)'">${escHtml(props.ctaText)}<span style="position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);animation:sf-shine 2.5s infinite;"></span></a>` : '';

        return `<section id="${uid}" class="${props.customClass || ''}" style="position:relative;background:${props.bgColor};${BlockTypes.applyLayout(props)}overflow:hidden;">
  ${blobsHtml}
  <h1 data-sf-path="segments.0" style="font-family:${props.fontFamily};font-size:clamp(2rem,6vw,4rem);font-weight:800;letter-spacing:3px;background:linear-gradient(135deg,${props.gradientStart},${props.gradientMid},${props.gradientEnd},${props.gradientMid},${props.gradientStart});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-align:center;margin:0;position:relative;z-index:1;${BlockTypes.applySubStyle(props,'segments.0','')}">${escHtml(props.heading)}</h1>
  <p data-sf-path="segments.1" style="font-family:${props.fontFamily};font-size:clamp(1rem,3vw,1.8rem);color:rgba(255,255,255,0.8);text-align:center;margin:0;letter-spacing:5px;font-weight:300;position:relative;z-index:1;${BlockTypes.applySubStyle(props,'segments.1','')}">${escHtml(props.subtitle)}</p>
  ${props.description ? `<p data-sf-path="segments.2" style="color:rgba(255,255,255,0.6);font-size:1rem;text-align:center;max-width:600px;margin:0;position:relative;z-index:1;${BlockTypes.applySubStyle(props,'segments.2','')}">${escHtml(props.description)}</p>` : ''}
  ${ctaHtml}
</section>
<style>
@keyframes sf-shine{0%{left:-100%}50%{left:100%}100%{left:100%}}
</style>`;
    }
};


// ============================================================
// 11. SCROLL ANIMATIONS SECTION (fadeInDown, fadeInUp, fadeIn)
// ============================================================
BlockTypes.scrollAnimSection = {
    label: 'Scroll Anim Section',
    icon: 'fa-solid fa-wand-sparkles',
    category: 'Sections',
    defaultProps: {
        animation: 'fadeInUp',
        duration: '0.8s',
        delay: '0s',
        threshold: 0.2,
        bgColor: 'transparent',
        width: '100%',
        height: 'auto',
        margin: '0',
        padding: '0',
        display: 'block',
        customId: '',
        customClass: ''
    },
    render(props) {
        const uid = props.customId || 'scrollanim_' + Math.random().toString(36).substr(2, 9);
        return `<div id="${uid}" class="sf-scroll-anim ${props.customClass || ''}" data-anim="${props.animation}" data-duration="${props.duration}" data-delay="${props.delay}" style="opacity:0;transform:translateY(${props.animation === 'fadeInDown' ? '-30px' : props.animation === 'fadeInUp' ? '30px' : '0'});transition:opacity ${props.duration} ease ${props.delay},transform ${props.duration} ease ${props.delay};${BlockTypes.applyLayout(props)}background:${props.bgColor};">
  <div class="container-inner" style="width:100%;"></div>
</div>
<script>
(function(){
  var el = document.getElementById('${uid}');
  if(!el || el.closest('#canvas'))return;
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        el.style.opacity='1';
        el.style.transform='translateY(0)';
        obs.unobserve(el);
      }
    });
  },{threshold:${props.threshold}});
  obs.observe(el);
})();
</script>`;
    }
};


// ============================================================
// 12. PROMO BADGE CARDS (Multi-item partner cards with effects)
// ============================================================
BlockTypes.promoBadgeCard = {
    label: 'Promo Badge Cards',
    icon: 'fa-solid fa-id-badge',
    category: '_hidden',
    defaultProps: {
        items: [
            { name: 'Brand A', logo: '', badge: 'favourite', row1Label: 'Welcome Bonus', row1Value: '100%', row2Label: 'Referral Bonus', row2Value: '20%', row3Label: 'Daily Rebate', row3Value: '1.2%', row4Label: 'Sign in Task', row4Value: '₹50', row5Label: 'RTP', row5Value: '97.5%', link: '#', featured: true },
            { name: 'Brand B', logo: '', badge: 'hot', row1Label: 'Welcome Bonus', row1Value: '150%', row2Label: 'Referral Bonus', row2Value: '15%', row3Label: 'Daily Rebate', row3Value: '1.0%', row4Label: 'Sign in Task', row4Value: '₹30', row5Label: 'RTP', row5Value: '96.8%', link: '#', featured: false },
            { name: 'Brand C', logo: '', badge: 'new', row1Label: 'Welcome Bonus', row1Value: '200%', row2Label: 'Referral Bonus', row2Value: '25%', row3Label: 'Daily Rebate', row3Value: '1.5%', row4Label: 'Sign in Task', row4Value: '₹100', row5Label: 'RTP', row5Value: '97.2%', link: '#', featured: false }
        ],
        btnText: 'PLAY NOW',
        cardBg: 'linear-gradient(to top, #1a1a2e 0%, #16213e 100%)',
        accentColor: '#BF953F',
        textColor: '#ffffff',
        bgColor: 'transparent',
        headingColor: '#ffffff',
        borderColor: 'rgba(255,255,255,0.1)',
        showRainbowBorder: true,
        showShineEffect: true,
        bgColor: 'transparent',
        width: '100%', height: 'auto', margin: '0', padding: '40px 24px',
        display: 'block',
        customId: '', customClass: ''
    },
    render(props) {
        const uid = props.customId || 'promo_' + Math.random().toString(36).substr(2, 9);
        const items = props.items || [];
        const cardsHtml = items.map((card, i) => {
            const badge = card.badge || 'none';
            const isFeatured = card.featured === true;
            const badgeHtml = badge === 'favourite' ? `<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#BF953F,#FCF6BA,#B38728);color:#1a1a2e;padding:5px 18px;border-radius:20px;font-size:0.72rem;font-weight:700;white-space:nowrap;z-index:2;"><i class="fa-solid fa-heart"></i> PLAYERS' FAVOURITE</div>` : badge === 'hot' ? `<div style="position:absolute;top:-10px;right:12px;z-index:2;"><img src="https://www.jitnpr.com/wp-content/uploads/2025/09/hot.webp" alt="HOT" style="height:28px;"/></div>` : badge === 'new' ? `<div style="position:absolute;top:-10px;right:12px;z-index:2;"><img src="https://www.jitnpr.com/wp-content/uploads/2025/09/new.webp" alt="NEW" style="height:28px;"/></div>` : '';
            const borderStyle = isFeatured && props.showRainbowBorder ? `border:3px solid transparent;background-image:${props.cardBg},linear-gradient(var(--rainbow-angle,0deg),#ff0000,#ff8000,#ffff00,#00ff00,#0080ff,#8000ff,#ff0080);background-origin:border-box;background-clip:padding-box,border-box;animation:sf-rainbow-rotate 3s linear infinite;filter:drop-shadow(0 0 25px rgba(255,230,172,0.6));` : `background:${props.cardBg};border:1px solid rgba(255,255,255,0.1);`;
            const btnStyle = isFeatured ? `background:linear-gradient(135deg,#BF953F,#FCF6BA,#B38728);color:#1a1a2e;font-weight:700;` : `background:${props.accentColor};color:#fff;font-weight:600;`;
            const shineHtml = props.showShineEffect && isFeatured ? `<span style="position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);animation:sf-shine 2.5s infinite;"></span>` : '';
            return `<div class="sf-promo-card" data-sf-path="items.${i}" style="position:relative;${borderStyle}border-radius:16px;padding:32px 20px 24px;min-width:220px;max-width:280px;flex:1;display:flex;flex-direction:column;align-items:center;gap:16px;transition:transform 0.3s;cursor:pointer;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform=''">
      ${badgeHtml}
      ${card.logo ? `<img src="${escAttr(card.logo)}" alt="${escAttr(card.name)}" style="height:50px;object-fit:contain;"/>` : `<div style="width:90px;height:50px;background:rgba(255,255,255,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;color:${props.textColor};font-size:0.85rem;">${escHtml(card.name)}</div>`}
      <table style="width:100%;border-collapse:collapse;font-size:0.78rem;color:${props.textColor};"><tr><td style="padding:7px 4px;opacity:0.7;">${escHtml(card.row1Label||'Welcome Bonus')}</td><td style="padding:7px 4px;text-align:right;font-weight:600;">${escHtml(card.row1Value||'')}</td></tr><tr><td style="padding:7px 4px;opacity:0.7;">${escHtml(card.row2Label||'Referral Bonus')}</td><td style="padding:7px 4px;text-align:right;font-weight:600;">${escHtml(card.row2Value||'')}</td></tr><tr><td style="padding:7px 4px;opacity:0.7;">${escHtml(card.row3Label||'Daily Rebate')}</td><td style="padding:7px 4px;text-align:right;font-weight:600;">${escHtml(card.row3Value||'')}</td></tr><tr><td style="padding:7px 4px;opacity:0.7;">${escHtml(card.row4Label||'Sign in Task')}</td><td style="padding:7px 4px;text-align:right;font-weight:600;">${escHtml(card.row4Value||'')}</td></tr><tr><td style="padding:7px 4px;opacity:0.7;">${escHtml(card.row5Label||'RTP')}</td><td style="padding:7px 4px;text-align:right;font-weight:600;">${escHtml(card.row5Value||'')}</td></tr></table>
      <a href="${escAttr(card.link)}" target="_blank" style="${btnStyle}display:block;width:100%;text-align:center;padding:13px;border-radius:8px;text-decoration:none;font-size:0.88rem;position:relative;overflow:hidden;"><span style="position:relative;z-index:1;">${escHtml(props.btnText)}</span>${shineHtml}</a>
    </div>`;
        }).join('');
        return `<section id="${uid}" class="${props.customClass || ''}" style="background:${props.bgColor || 'transparent'};${BlockTypes.applyLayout(props)}">
  <div style="display:flex;flex-wrap:wrap;gap:24px;justify-content:center;align-items:stretch;width:100%;">
    ${cardsHtml}
  </div>
</section>
<style>@keyframes sf-rainbow-rotate{0%{--rainbow-angle:0deg}100%{--rainbow-angle:360deg}}@property --rainbow-angle{syntax:'<angle>';initial-value:0deg;inherits:false}@keyframes sf-shine{0%{left:-100%}50%{left:100%}100%{left:100%}}</style>`;
    }
};


// 13. LIGHTBOX VIDEO CARDS (Multi-item)
// ============================================================
BlockTypes.lightboxVideo = {
    label: 'Lightbox Video Cards',
    icon: 'fa-solid fa-clapperboard',
    category: '_hidden',
    defaultProps: {
        items: [
            { title: '8MBets', thumb: 'https://himalayanharmonygroup.com/scr/8m.png', logo: 'https://himalayanharmonygroup.com/assets/images/8m.png', videoUrl: 'https://vimeo.com/123456', featured: true },
            { title: 'MJ88', thumb: 'https://himalayanharmonygroup.com/scr/m88.png', logo: 'https://himalayanharmonygroup.com/assets/images/mj88.png', videoUrl: 'https://vimeo.com/234567', featured: false },
            { title: 'esewa12', thumb: 'https://himalayanharmonygroup.com/scr/e12.png', logo: 'https://himalayanharmonygroup.com/assets/images/e12.png', videoUrl: 'https://vimeo.com/345678', featured: false },
            { title: 'NPR77', thumb: 'https://himalayanharmonygroup.com/scr/n77.png', logo: 'https://himalayanharmonygroup.com/assets/images/npr77.png', videoUrl: 'https://vimeo.com/456789', featured: false }
        ],
        btnText: 'WATCH NOW', cardBg: '#1a1a2e', overlayColor: 'rgba(0,0,0,0.5)', btnColor: '#BF953F',
        bgColor: 'transparent', textColor: '#ffffff', accentColor: '#BF953F', headingColor: '#ffffff', borderColor: 'rgba(255,255,255,0.08)',
        width: '100%', height: 'auto', margin: '0', padding: '40px 24px',
        display: 'block',
        customId: '', customClass: ''
    },
    render(props) {
        const uid = props.customId || 'lbvid_' + Math.random().toString(36).substr(2, 9);
        const items = props.items || [];
        const cardsHtml = items.map((v, i) => {
            const isFeatured = v.featured;
            const resolvedThumb = (typeof AssetManager !== 'undefined' && AssetManager.resolve) ? AssetManager.resolve(v.thumb) : v.thumb;
            const thumbStyle = resolvedThumb ? `background-image:url(${escAttr(resolvedThumb)});background-size:cover;background-position:center top;` : `background:${props.cardBg};`;
            return `<div class="sf-lb-card" data-sf-path="items.${i}" style="position:relative;flex:${isFeatured?'1.6':'1'};min-width:160px;min-height:${isFeatured?'300px':'240px'};border-radius:16px;overflow:hidden;${thumbStyle}display:flex;flex-direction:column;justify-content:flex-end;cursor:pointer;transition:transform 0.3s;border:1px solid rgba(255,255,255,0.08);" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform=''">
        <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.85) 0%,${props.overlayColor} 50%,rgba(0,0,0,0.2) 100%);"></div>
        ${v.logo?`<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1;"><img src="${escAttr(v.logo)}" alt="${escAttr(v.title)}" style="height:${isFeatured?'48px':'36px'};object-fit:contain;"/></div>`:''}
        <div style="position:relative;z-index:2;padding:${isFeatured?'22px':'16px'};display:flex;flex-direction:column;gap:10px;">
          <h4 style="color:#fff;font-weight:700;font-size:${isFeatured?'1rem':'0.85rem'};margin:0;">${escHtml(v.title)}</h4>
          <button type="button" onclick="document.getElementById('${uid}-m${i}').style.display='flex'" style="display:inline-flex;align-items:center;gap:8px;background:${props.btnColor};color:#1a1a2e;padding:9px 18px;border-radius:8px;border:none;font-weight:700;font-size:0.75rem;width:fit-content;cursor:pointer;"><i class="fa-solid fa-play" style="font-size:0.65rem;"></i> ${escHtml(props.btnText)}</button>
        </div>
      </div>
      <div id="${uid}-m${i}" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:99999;align-items:center;justify-content:center;padding:20px;" onclick="if(event.target===this)this.style.display='none'">
        <div style="position:relative;width:100%;max-width:900px;aspect-ratio:16/9;"><iframe src="${escAttr(VideoHelper.getEmbedUrl(v.videoUrl))}" style="width:100%;height:100%;border:none;border-radius:12px;" allowfullscreen></iframe><button onclick="this.closest('div[id]').style.display='none'" style="position:absolute;top:-40px;right:0;background:none;border:none;color:#fff;font-size:2rem;cursor:pointer;">&times;</button></div>
      </div>`;
        }).join('');
        return `<section id="${uid}" class="${props.customClass||''}" style="background:${props.bgColor || 'transparent'};${BlockTypes.applyLayout(props)}">
  <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:stretch;width:100%;">
    ${cardsHtml}
  </div>
</section>`;
    }
};


// 14. GAME CARDS (Multi-item grid)
// ============================================================
BlockTypes.gameCard = {
    label: 'Game Cards',
    icon: 'fa-solid fa-puzzle-piece',
    category: '_hidden',
    defaultProps: {
        items: [
            { name: 'Sugar Rush', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/sugar-rush.webp', waysToWin: '3580', link: '#', showFire: false },
            { name: 'Sweet Bonanza', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/sweet-bonanza.webp', waysToWin: '2670', link: '#', showFire: false },
            { name: 'Gates of Olympus', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/gates-of-olympus.webp', waysToWin: '2593', link: '#', showFire: false },
            { name: 'Starlight Princess', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/starlight-princess.webp', waysToWin: '2478', link: '#', showFire: false },
            { name: 'Tiger Dance', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/tiger-dance.webp', waysToWin: '3647', link: '#', showFire: false },
            { name: 'Zeus', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/zeus.webp', waysToWin: '2185', link: '#', showFire: false },
            { name: 'Mahjong Ways', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/552x380_EN_GAMEID_47.webp', waysToWin: '4582', link: '#', showFire: false },
            { name: 'Legacy of Kong', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/legacy-of-kong-maxways.webp', waysToWin: '1620', link: '#', showFire: false },
            { name: 'Lucky Fortunes', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/lucky-fortunes.webp', waysToWin: '3177', link: '#', showFire: false },
            { name: 'Wild Bandito', thumb: 'https://www.jitnpr.com/wp-content/uploads/2025/08/552x380_EN_GAMEID_49.webp', waysToWin: '3058', link: '#', showFire: false }
        ],
        btnText: 'PLAY NOW', cardBg: '#1e293b', overlayColor: 'rgba(0,0,0,0.7)', accentColor: '#BF953F', textColor: '#ffffff',
        bgColor: 'transparent', headingColor: '#ffffff', borderColor: 'rgba(255,255,255,0.1)',
        partnerLinks: ['#partner1', '#partner2', '#partner3'],
        width: '100%', height: 'auto', margin: '0', padding: '40px 24px',
        display: 'block',
        customId: '', customClass: ''
    },
    render(props) {
        const uid = props.customId || 'gcards_' + Math.random().toString(36).substr(2, 9);
        const items = props.items || [];
        const links = JSON.stringify(props.partnerLinks || []);
        const cardsHtml = items.map((game, i) => {
            const resolvedGameThumb = (typeof AssetManager !== 'undefined' && AssetManager.resolve) ? AssetManager.resolve(game.thumb) : game.thumb;
            const thumbBg = resolvedGameThumb ? `background-image:url(${escAttr(resolvedGameThumb)});background-size:cover;background-position:center;` : `background:linear-gradient(135deg,#2d1b69,#11998e);`;
            const fireEmoji = game.showFire ? `<img src="https://images.emojiterra.com/google/noto-emoji/animated-emoji/1f525.gif" alt="fire" style="position:absolute;top:8px;right:8px;width:28px;height:28px;z-index:2;"/>` : '';
            return `<div class="sf-gc-item" data-sf-path="items.${i}" style="position:relative;border-radius:10px;overflow:hidden;${thumbBg}width:150px;height:200px;cursor:pointer;background-color:${props.cardBg};flex-shrink:0;" onmouseover="this.querySelector('.sf-gc-overlay').style.opacity='1'" onmouseout="this.querySelector('.sf-gc-overlay').style.opacity='0'">
        ${fireEmoji}
        <div class="sf-gc-overlay" onclick="var l=${escAttr(links)};if(l.length)window.open(l[Math.floor(Math.random()*l.length)],'_blank')" style="position:absolute;inset:0;background:${props.overlayColor};opacity:0;transition:opacity 0.3s;display:flex;align-items:center;justify-content:center;z-index:3;">
          <span style="background:${props.accentColor};color:#fff;padding:8px 18px;border-radius:6px;font-weight:700;font-size:0.72rem;pointer-events:none;">${escHtml(props.btnText)}</span>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;padding:8px 10px;background:linear-gradient(transparent,rgba(0,0,0,0.85));z-index:1;">
          <p style="color:${props.textColor};font-size:0.7rem;font-weight:600;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(game.name)}</p>
          ${game.waysToWin?`<p style="color:rgba(255,255,255,0.6);font-size:0.6rem;margin:3px 0 0;">${escHtml(game.waysToWin)} ways to win</p>`:''}
        </div>
      </div>`;
        }).join('');
        return `<section id="${uid}" class="${props.customClass||''}" style="background:${props.bgColor || 'transparent'};${BlockTypes.applyLayout(props)}">
  <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;width:100%;">
    ${cardsHtml}
  </div>
</section>
<style>#${uid} .sf-gc-item:hover .sf-gc-overlay{opacity:1}</style>`;
    }
};


// ============================================================
// 15. CASINO THEME (Dark + Gold preset)
// ============================================================
// Note: To add this theme, add the following entry to the THEMES array in themes.js:
// {
//     id: 'casino-dark-gold',
//     name: 'Casino Dark Gold',
//     type: 'solid',
//     preview: 'linear-gradient(135deg, #120E05 0%, #0F1729 50%, #1a1a2e 100%)',
//     vars: {
//         '--sf-bg': '#120E05',
//         '--sf-section-bg': '#0F1729',
//         '--sf-text': '#ffffff',
//         '--sf-text-muted': '#94a3b8',
//         '--sf-accent': '#BF953F',
//         '--sf-btn-bg': '#BF953F',
//         '--sf-btn-text': '#1a1a2e',
//         '--sf-header-bg': 'rgba(18,14,5,0.97)',
//         '--sf-footer-bg': '#0a0a0f',
//         '--sf-card-bg': '#1a1a2e',
//         '--sf-border': '#2a2a3e',
//         '--sf-heading-color': '#FCF6BA',
//         '--sf-link-color': '#BF953F',
//     }
// }

// ============================================================
// REGISTER ALL CASINO BLOCKS WITH BlockRegistry
// ============================================================
const casinoBlockTypes = [
    'animatedBg', 'goldHeading', 'partnerCards', 'videoRecommendations',
    'gameCarousel', 'faqAccordion', 'casinoNavbar', 'casinoFooter',
    'seoContent', 'casinoHero', 'scrollAnimSection', 'promoBadgeCard',
    'lightboxVideo', 'gameCard'
];

casinoBlockTypes.forEach(type => {
    if (BlockTypes[type] && typeof BlockRegistry !== 'undefined') {
        BlockRegistry.register({
            type: type,
            label: BlockTypes[type].label,
            icon: BlockTypes[type].icon,
            category: BlockTypes[type].category,
            defaultProps: BlockTypes[type].defaultProps,
            render: BlockTypes[type].render,
            version: 1
        });
    }
});

// ============================================================
// 15. LIVE CLOCK / DATE BLOCK (Real-time updating)
// ============================================================
BlockTypes.liveClock = {
    label: 'Live Clock / Date',
    icon: 'fa-solid fa-clock',
    category: 'Layout',
    defaultProps: {
        format: '{day}, {month} {date}, {year} — {hour}:{minute}:{second}',
        timezone: '',
        fontSize: '1.2rem',
        fontWeight: '600',
        textColor: '#ffffff',
        textAlign: 'center',
        fontFamily: 'inherit',
        showTimezone: false,
        updateInterval: 1000,
        bgColor: 'transparent',
        width: '100%',
        height: 'auto',
        margin: '0',
        padding: '20px 16px',
        display: 'block',
        customId: '',
        customClass: ''
    },
    render(props) {
        const uid = props.customId || 'clock_' + Math.random().toString(36).substr(2, 9);
        const preview = resolveTokens(props.format || '{year}');
        const tzLabel = props.showTimezone ? `<span style="font-size:0.7em;opacity:0.6;margin-left:8px;">${props.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}</span>` : '';
        return `<div id="${uid}" class="${props.customClass || ''}" style="font-size:${props.fontSize};font-weight:${props.fontWeight};color:${props.textColor};text-align:${props.textAlign};font-family:${props.fontFamily};${BlockTypes.applyLayout(props)}">
  <span class="sf-clock-display">${escHtml(preview)}</span>${tzLabel}
</div>
<script>
(function(){
  var el = document.getElementById('${uid}');
  if(!el || el.closest('#canvas')) return;
  var fmt = '${props.format.replace(/'/g, "\\'")}';
  var tz = '${props.timezone || ''}';
  function update(){
    var now = tz ? new Date(new Date().toLocaleString('en-US',{timeZone:tz})) : new Date();
    var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
    var days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var out = fmt
      .replace(/\\{year\\}/gi, now.getFullYear())
      .replace(/\\{month-short\\}/gi, months[now.getMonth()].slice(0,3))
      .replace(/\\{month-num\\}/gi, String(now.getMonth()+1).padStart(2,'0'))
      .replace(/\\{month\\}/gi, months[now.getMonth()])
      .replace(/\\{date\\}/gi, String(now.getDate()).padStart(2,'0'))
      .replace(/\\{day-short\\}/gi, days[now.getDay()].slice(0,3))
      .replace(/\\{day\\}/gi, days[now.getDay()])
      .replace(/\\{hour\\}/gi, String(now.getHours()).padStart(2,'0'))
      .replace(/\\{minute\\}/gi, String(now.getMinutes()).padStart(2,'0'))
      .replace(/\\{second\\}/gi, String(now.getSeconds()).padStart(2,'0'))
      .replace(/\\{ms\\}/gi, String(now.getMilliseconds()).padStart(3,'0'))
      .replace(/\\{time\\}/gi, String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'))
      .replace(/\\{timezone\\}/gi, tz || Intl.DateTimeFormat().resolvedOptions().timeZone);
    var span = el.querySelector('.sf-clock-display');
    if(span) span.textContent = out;
  }
  update();
  setInterval(update, ${props.updateInterval || 1000});
})();
</script>`;
    }
};

casinoBlockTypes.push('liveClock');
BlockRegistry.register({
    type: 'liveClock',
    label: BlockTypes.liveClock.label,
    icon: BlockTypes.liveClock.icon,
    category: BlockTypes.liveClock.category,
    defaultProps: BlockTypes.liveClock.defaultProps,
    render: BlockTypes.liveClock.render,
    version: 1
});

console.log('[Casino Blocks] Registered', casinoBlockTypes.length, 'casino/gaming components');

})();
