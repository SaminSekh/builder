// ============================================================
// properties.js – Right sidebar properties panel
// ============================================================

const Properties = (() => {
    let _currentTab = 'design';

    function init() {
        State.on('selectionChanged', (id) => {
            if (id) renderPanel(State.getBlock(id));
            else renderEmpty();
        });
        State.on('subSelectionChanged', () => {
            const id = State.getSelectedId();
            if (id) renderPanel(State.getBlock(id));
        });
    }

    function renderEmpty() {
        document.getElementById('propPanelContent').innerHTML = `
      <div class="prop-empty">
        <i class="fa-solid fa-arrow-pointer"></i>
        <p>Click any element on the canvas to edit its properties.</p>
      </div>`;
    }

    function renderPanel(block) {
        if (!block) { renderEmpty(); return; }
        const def = BlockTypes[block.type];
        const panel = document.getElementById('propPanelContent');
        panel.innerHTML = '';

        // --- Header ---
        const header = document.createElement('div');
        header.className = 'prop-header';
        
        const subPath = State.getSelectedSubPath();
        const headerTitle = subPath ? `Sub-element` : def.label;
        
        const titleWrap = document.createElement('div');
        titleWrap.className = 'prop-title';
        titleWrap.innerHTML = `<i class="${def.icon}"></i> <span>${headerTitle}</span>`;
        header.appendChild(titleWrap);
        
        if (subPath) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'btn-icon';
            closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            closeBtn.onclick = () => State.setSelectedSubPath(null);
            header.appendChild(closeBtn);
        }
        panel.appendChild(header);

        // --- Tabs ---
        const tabs = document.createElement('div');
        tabs.className = 'prop-tabs';
        ['design', 'content', 'advanced'].forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'tab-btn' + (_currentTab === t ? ' active' : '');
            btn.textContent = t.charAt(0).toUpperCase() + t.slice(1);
            btn.onclick = () => {
                _currentTab = t;
                renderPanel(block);
            };
            tabs.appendChild(btn);
        });
        panel.appendChild(tabs);

        // --- Body ---
        const body = document.createElement('div');
        body.className = 'prop-body';
        
        const sections = buildFields(block, _currentTab);
        sections.forEach(sec => {
            const secEl = document.createElement('div');
            secEl.className = 'prop-section';
            if (sec.title) secEl.innerHTML = `<h4>${sec.title}</h4>`;
            sec.fields.forEach(fieldEl => secEl.appendChild(fieldEl));
            body.appendChild(secEl);
        });
        panel.appendChild(body);
    }

    function buildFields(block, currentTab) {
        const subPath = State.getSelectedSubPath();
        const subStyle = subPath ? (block.props.subStyles?.[subPath] || {}) : null;
        const p = subStyle || block.props;
        const sections = [];

        const isDesign = currentTab === 'design';
        const isContent = currentTab === 'content';
        const isAdvanced = currentTab === 'advanced';

        if (isAdvanced) {
            sections.push({
                title: 'Identifiers',
                fields: [
                    field('Custom ID', text('customId', p.customId, block.id)).fields[0],
                    field('Custom Class', text('customClass', p.customClass, block.id)).fields[0]
                ]
            });
            return sections;
        }

        if (subPath) {
            const getSubDefaults = () => {
                const blockEl = document.getElementById('block_' + block.id);
                if (!blockEl) return {};
                const el = blockEl.querySelector(`[data-sf-path="${subPath}"]`);
                if (!el) return {};
                
                const getStyle = (prop) => {
                    const val = el.style.getPropertyValue(prop) || window.getComputedStyle(el).getPropertyValue(prop);
                    return (val || '').replace(' !important', '').trim();
                };

                const isContentTag = ['P', 'SPAN', 'A', 'BUTTON', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'FIGCAPTION', 'LABEL', 'I'].includes(el.tagName);

                return {
                    text: (el.children.length === 0 || isContentTag) ? el.innerText.trim() : '',
                    display: getStyle('display'),
                    width: getStyle('width'),
                    height: getStyle('height'),
                    minWidth: getStyle('min-width'),
                    minHeight: getStyle('min-height'),
                    maxWidth: getStyle('max-width'),
                    maxHeight: getStyle('max-height'),
                    margin: getStyle('margin'),
                    padding: getStyle('padding'),
                    color: getStyle('color'),
                    fontSize: getStyle('font-size'),
                    fontWeight: getStyle('font-weight'),
                    fontFamily: getStyle('font-family'),
                    lineHeight: getStyle('line-height'),
                    letterSpacing: getStyle('letter-spacing'),
                    textAlign: getStyle('text-align'),
                    bgColor: getStyle('background-color'),
                    background: getStyle('background'),
                    opacity: getStyle('opacity'),
                    zIndex: getStyle('z-index'),
                    boxShadow: getStyle('box-shadow'),
                    borderRadius: getStyle('border-radius'),
                    borderWidth: getStyle('border-width'),
                    borderStyle: getStyle('border-style'),
                    borderColor: getStyle('border-color'),
                    direction: getStyle('flex-direction'),
                    justify: getStyle('justify-content'),
                    align: getStyle('align-items'),
                    gap: getStyle('gap'),
                    flexGrow: getStyle('flex-grow'),
                    flexShrink: getStyle('flex-shrink'),
                    alignSelf: getStyle('align-self')
                };
            };
            const d = getSubDefaults();

            if (isDesign) {
                // Visual Guide (Editor Only) - HIGH VISIBILITY
                sections.push({
                    title: 'Visual Guides',
                    fields: [
                        field('Highlight Layer', select2('visualGuide', p.visualGuide || 'none', ['none', 'red', 'green'], block.id)).fields[0]
                    ]
                });

                // Layout & Spacing
                const layoutFields = [
                    field('Display', select2('display', p.display || d.display || 'block', ['block', 'inline-block', 'flex', 'inline-flex', 'grid', 'none'], block.id)).fields[0],
                    field('Width', text('width', p.width || d.width || '', block.id)).fields[0],
                    field('Height', text('height', p.height || d.height || '', block.id)).fields[0],
                    field('Min Width', text('minWidth', p.minWidth || '', block.id)).fields[0],
                    field('Min Height', text('minHeight', p.minHeight || '', block.id)).fields[0],
                    field('Max Width', text('maxWidth', p.maxWidth || '', block.id)).fields[0],
                    field('Max Height', text('maxHeight', p.maxHeight || '', block.id)).fields[0],
                    field('Margin', text('margin', p.margin || d.margin || '', block.id)).fields[0],
                    field('Padding', text('padding', p.padding || d.padding || '', block.id)).fields[0]
                ];
                
                // Flexbox Contextual
                const blockEl = document.getElementById('block_' + block.id);
                const currentEl = blockEl ? blockEl.querySelector(`[data-sf-path="${subPath}"]`) : null;
                const parentEl = currentEl ? currentEl.parentElement : null;
                const isParentFlex = parentEl && window.getComputedStyle(parentEl).display.includes('flex');

                if (isParentFlex) {
                    layoutFields.push(
                        field('Flex Grow', text('flexGrow', p.flexGrow || '', block.id)).fields[0],
                        field('Flex Shrink', text('flexShrink', p.flexShrink || '', block.id)).fields[0],
                        field('Align Self', select2('alignSelf', p.alignSelf || '', ['auto', 'flex-start', 'center', 'flex-end', 'stretch'], block.id)).fields[0]
                    );
                }

                if ((p.display || d.display || '').includes('flex')) {
                    layoutFields.push(
                        field('Flex Direction', select2('direction', p.direction || 'row', ['row', 'column'], block.id)).fields[0],
                        field('Flex Wrap', select2('wrap', p.wrap || 'wrap', ['nowrap', 'wrap', 'wrap-reverse'], block.id)).fields[0],
                        field('Justify', select2('justify', p.justify || 'center', ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'], block.id)).fields[0],
                        field('Align', select2('align', p.align || 'center', ['flex-start', 'center', 'flex-end', 'stretch'], block.id)).fields[0],
                        field('Gap', text('gap', p.gap || '', block.id)).fields[0]
                    );
                }
                sections.push({ title: 'Layout & Spacing', fields: layoutFields });

                // Typography
                sections.push({
                    title: 'Typography',
                    fields: [
                        field('Text Color', color('color', p.color || d.color, block.id)).fields[0],
                        field('Font Size', text('fontSize', p.fontSize || d.fontSize, block.id)).fields[0],
                        field('Font Weight', select2('fontWeight', p.fontWeight || d.fontWeight || 'normal', ['normal', 'bold', '100', '300', '400', '500', '600', '700', '800', '900'], block.id)).fields[0],
                        field('Font Family', text('fontFamily', p.fontFamily || d.fontFamily, block.id)).fields[0],
                        field('Line Height', text('lineHeight', p.lineHeight || '', block.id)).fields[0],
                        field('Letter Spacing', text('letterSpacing', p.letterSpacing || '', block.id)).fields[0],
                        field('Text Align', select2('textAlign', p.textAlign || d.textAlign || 'inherit', ['inherit', 'left', 'center', 'right', 'justify'], block.id)).fields[0]
                    ]
                });

                // Visuals
                sections.push({
                    title: 'Visuals',
                    fields: [
                        field('BG Color', color('bgColor', p.bgColor || d.bgColor, block.id)).fields[0],
                        field('Background', text('background', p.background || '', block.id)).fields[0],
                        field('Z-index', text('zIndex', p.zIndex || '', block.id)).fields[0],
                        field('Box Shadow', text('boxShadow', p.boxShadow || '', block.id)).fields[0],
                        field('Overflow', select2('overflow', p.overflow || 'visible', ['visible', 'hidden', 'auto', 'scroll'], block.id)).fields[0],
                        field('Flex Grow', range('flexGrow', p.flexGrow !== undefined ? p.flexGrow : 0, 0, 10, 1, block.id)).fields[0],
                        field('Flex Shrink', range('flexShrink', p.flexShrink !== undefined ? p.flexShrink : 1, 0, 10, 1, block.id)).fields[0]
                    ]
                });

                // Borders
                sections.push({
                    title: 'Borders',
                    fields: [
                        field('Border Radius', text('borderRadius', p.borderRadius || '', block.id)).fields[0],
                        field('Border Width', text('borderWidth', p.borderWidth || '', block.id)).fields[0],
                        field('Border Style', select2('borderStyle', p.borderStyle || 'none', ['none', 'solid', 'dashed', 'dotted', 'double'], block.id)).fields[0],
                        field('Border Color', color('borderColor', p.borderColor || '#000000', block.id)).fields[0]
                    ]
                });

                // Effects
                sections.push({
                    title: 'Effects',
                    fields: [
                        field('Opacity', range('opacity', p.opacity !== undefined ? p.opacity : 1, 0, 1, 0.01, block.id)).fields[0],
                        field('Blur (px)', range('blur', p.blur || 0, 0, 20, 1, block.id)).fields[0]
                    ]
                });
            }
            if (isContent) {
                const blockEl = document.getElementById('block_' + block.id);
                const el = blockEl ? blockEl.querySelector(`[data-sf-path="${subPath}"]`) : null;
                const tagName = el ? el.tagName : '';

                // 1. Existing Content
                if (['IMG', 'VIDEO', 'SOURCE', 'IFRAME'].includes(tagName)) {
                    sections.push({
                        title: 'Media Settings',
                        fields: [
                            field('Source URL', text('src', p.src || (el ? el.src || el.getAttribute('src') : ''), block.id)).fields[0]
                        ]
                    });
                } else if (el && el.classList.contains('sf-add-to-cart')) {
                    sections.push({
                        title: 'Product Details',
                        fields: [
                            field('Button Text', text('text', p.text || 'Add to Cart', block.id)).fields[0],
                            field('Product Name', text('name', p.name || '', block.id)).fields[0],
                            field('Price', text('price', p.price || '0.00', block.id)).fields[0],
                            field('Image URL', url('image', p.image || '', block.id)).fields[0],
                            field('Button Color', color('bgColor', p.bgColor || '#6c63ff', block.id)).fields[0],
                            field('Text Color', color('textColor', p.textColor || '#ffffff', block.id)).fields[0]
                        ]
                    });
                } else if (tagName === 'A') {
                    sections.push({
                        title: 'Link Settings',
                        fields: [
                            field('Link Text', text('text', p.text || el.innerText.trim(), block.id)).fields[0],
                            field('URL (href)', text('href', p.href || el.getAttribute('href'), block.id)).fields[0]
                        ]
                    });
                } else {
                    sections.push({
                        title: 'Text Content',
                        fields: [
                            field('Edit Text', textarea('text', p.text || d.text, block.id)).fields[0]
                        ]
                    });
                }

                // 2. Nesting (Append Child) - Only for Containers (DIV, SECTION, NAV, FOOTER, HEADER)
                if (['DIV', 'SECTION', 'NAV', 'FOOTER', 'HEADER', 'MAIN', 'ASIDE'].includes(tagName)) {
                    const appendSec = {
                        title: 'Append Child Element',
                        fields: []
                    };
                    
                    const types = [
                        { label: 'Text (P)', icon: 'fa-solid fa-paragraph', type: 'p' },
                        { label: 'Image', icon: 'fa-solid fa-image', type: 'img' },
                        { label: 'Video', icon: 'fa-solid fa-video', type: 'video' },
                        { label: 'Button', icon: 'fa-solid fa-rectangle-ad', type: 'button' },
                        { label: 'Add to Cart', icon: 'fa-solid fa-cart-plus', type: 'add-to-cart' },
                        { label: 'Flex Container', icon: 'fa-solid fa-box', type: 'div' }
                    ];

                    const btnGrid = document.createElement('div');
                    btnGrid.className = 'append-btn-grid'; // Will add styles for this
                    btnGrid.style.display = 'grid';
                    btnGrid.style.gridTemplateColumns = '1fr 1fr';
                    btnGrid.style.gap = '8px';
                    btnGrid.style.marginTop = '10px';

                    types.forEach(t => {
                        const btn = document.createElement('button');
                        btn.className = 'tb-btn secondary';
                        btn.style.fontSize = '0.8rem';
                        btn.style.padding = '8px';
                        btn.innerHTML = `<i class="${t.icon}"></i> ${t.label}`;
                        btn.onclick = () => {
                            const currentChildren = (block.props.subStyles?.[subPath]?.children) || [];
                            
                            const newChild = { type: t.type, props: {}, styles: {} };
                            if (t.type === 'p') newChild.props.text = 'New paragraph text...';
                            if (t.type === 'img') newChild.props.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop';
                            if (t.type === 'video') newChild.props.src = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';
                            if (t.type === 'button') newChild.props.text = 'Click Me';
                            if (t.type === 'add-to-cart') {
                                newChild.props.text = 'Add to Cart';
                                newChild.props.price = '99.00';
                                newChild.props.name = 'Product Name';
                                newChild.props.image = '';
                            }

                            // Update only the children property of this sub-element
                            State.updateBlockProps(block.id, { children: [...currentChildren, newChild] });
                            showToast(`Added ${t.label} to div`, 'success');
                            renderPanel(State.getBlock(block.id));
                        };
                        btnGrid.appendChild(btn);
                    });
                    
                    appendSec.fields.push(btnGrid);
                    sections.push(appendSec);
                }
                const resetBtn = document.createElement('button');
                resetBtn.innerText = 'Reset to Default';
                resetBtn.className = 'tb-btn danger';
                resetBtn.style.width = '100%';
                resetBtn.onclick = () => {
                    const subStyles = { ...block.props.subStyles };
                    delete subStyles[subPath];
                    State.setSelectedSubPath(null); // Must deselect path so updateBlockProps targets root props
                    State.updateBlockProps(block.id, { subStyles });
                    renderPanel(State.getBlock(block.id));
                };
                sections.push({ title: 'Actions', fields: [resetBtn] });
            }
            return sections;
        }

        if (isDesign) {
            sections.push({
                title: 'Layout & Spacing',
                fields: [
                    field('Display', select2('display', p.display || 'block', ['block', 'flex', 'grid', 'none'], block.id)).fields[0],
                    field('Width', text('width', p.width || '100%', block.id)).fields[0],
                    field('Height', text('height', p.height || 'auto', block.id)).fields[0],
                    field('Margin', text('margin', p.margin || '0px', block.id)).fields[0],
                    field('Padding', text('padding', p.padding || '0px', block.id)).fields[0],
                    field('Flex Grow', range('flexGrow', p.flexGrow !== undefined ? p.flexGrow : 0, 0, 10, 1, block.id)).fields[0],
                    field('Flex Shrink', range('flexShrink', p.flexShrink !== undefined ? p.flexShrink : 1, 0, 10, 1, block.id)).fields[0]
                ]
            });
            if (p.display === 'flex') {
                sections[0].fields.push(
                    field('Flex Direction', select2('direction', p.direction || 'row', ['row', 'column'], block.id)).fields[0],
                    field('Flex Wrap', select2('wrap', p.wrap || 'wrap', ['nowrap', 'wrap', 'wrap-reverse'], block.id)).fields[0],
                    field('Justify', select2('justify', p.justify || 'center', ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'], block.id)).fields[0],
                    field('Align', select2('align', p.align || 'center', ['flex-start', 'center', 'flex-end', 'stretch'], block.id)).fields[0],
                    field('Gap', text('gap', p.gap || '0px', block.id)).fields[0]
                );
            }
            switch(block.type) {
                case 'navbar': 
                case 'hero':
                case 'about':
                case 'services':
                case 'contact':
                case 'footer':
                case 'testimonials':
                case 'stats':
                case 'container':
                case 'box':
                case 'video':
                case 'image':
                case 'pricing':
                    sections.push({
                        title: 'Theme & Background',
                        fields: [
                            field('BG Color', color('bgColor', p.bgColor, block.id)).fields[0],
                            field('Text Color', color('textColor', p.textColor, block.id)).fields[0]
                        ]
                    });
                    break;
            }

            // Effects
            sections.push({
                title: 'Effects',
                fields: [
                    field('Opacity', range('opacity', p.opacity !== undefined ? p.opacity : 1, 0, 1, 0.01, block.id)).fields[0],
                    field('Blur (px)', range('blur', p.blur || 0, 0, 20, 1, block.id)).fields[0],
                    field('Overflow', select2('overflow', p.overflow || 'visible', ['visible', 'hidden', 'auto', 'scroll'], block.id)).fields[0]
                ]
            });

            // Actions (Root)
            const actions = [];
            if (block.parentId) {
                const unnestBtn = document.createElement('button');
                unnestBtn.innerText = '📤 Move to Root Level';
                unnestBtn.className = 'tb-btn secondary';
                unnestBtn.style.width = '100%';
                unnestBtn.onclick = () => {
                    State.updateBlockParent(block.id, null);
                    showToast('✅ Moved to root level', 'success');
                };
                actions.push(unnestBtn);
            }
            if (actions.length > 0) {
                sections.push({ title: 'Actions', fields: actions });
            }
        }

        if (isContent) {
            switch (block.type) {
                case 'navbar':
                    sections.push({
                        title: 'Branding',
                        fields: [
                            field('Brand Name', text('brand', p.brand, block.id)).fields[0],
                            field('Logo URL', url('logo', p.logo, block.id)).fields[0],
                            field('Sticky Position', toggle('sticky', p.sticky, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Navigation Links', 'links', p.links, block.id, [
                        { key: 'label', type: 'text', label: 'Label' },
                        { key: 'href', type: 'text', label: 'Link' }
                    ]));
                    sections.push({
                        title: 'CTA Button',
                        fields: [
                            field('Show Button', toggle('showButton', p.showButton, block.id)).fields[0],
                            field('Button Text', text('buttonText', p.buttonText, block.id)).fields[0],
                            field('Button Link', text('buttonHref', p.buttonHref, block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Cart Settings',
                        fields: [
                            field('Show Cart Icon', toggle('showCart', p.showCart, block.id)).fields[0],
                            field('WhatsApp Number (+)', text('whatsapp', p.whatsapp, block.id)).fields[0],
                            field('Telegram (@)', text('telegram', p.telegram, block.id)).fields[0]
                        ]
                    });
                    break;
                case 'hero':
                    sections.push({
                        title: 'Main Content',
                        fields: [
                            field('Title', text('title', p.title, block.id)).fields[0],
                            field('Subtitle', textarea('subtitle', p.subtitle, block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Actions',
                        fields: [
                            field('Primary Btn', text('ctaText', p.ctaText, block.id)).fields[0],
                            field('Primary Link', text('ctaHref', p.ctaHref, block.id)).fields[0],
                            field('Secondary Btn', text('cta2Text', p.cta2Text, block.id)).fields[0],
                            field('Secondary Link', text('cta2Href', p.cta2Href, block.id)).fields[0]
                        ]
                    });
                    break;
                case 'about':
                    sections.push({
                        title: 'About Details',
                        fields: [
                            field('Badge', text('badge', p.badge, block.id)).fields[0],
                            field('Title', text('title', p.title, block.id)).fields[0],
                            field('Text', textarea('text', p.text, block.id)).fields[0],
                            field('Image URL', url('image', p.image, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Features', 'features', p.features, block.id, [
                        { key: 'icon', type: 'icon', label: 'Icon' },
                        { key: 'text', type: 'text', label: 'Text' }
                    ]));
                    break;
                case 'services':
                    sections.push({
                        title: 'Header',
                        fields: [
                            field('Badge', text('badge', p.badge, block.id)).fields[0],
                            field('Title', text('title', p.title, block.id)).fields[0],
                            field('Subtitle', textarea('subtitle', p.subtitle, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Service Cards', 'items', p.items, block.id, [
                        { key: 'icon', type: 'icon', label: 'Icon' },
                        { key: 'title', type: 'text', label: 'Title' },
                        { key: 'desc', type: 'textarea', label: 'Description' }
                    ]));
                    break;
                case 'testimonials':
                    sections.push({
                        title: 'Header',
                        fields: [
                            field('Badge', text('badge', p.badge, block.id)).fields[0],
                            field('Title', text('title', p.title, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Testimonial Cards', 'items', p.items, block.id, [
                        { key: 'name', type: 'text', label: 'Name' },
                        { key: 'role', type: 'text', label: 'Role' },
                        { key: 'avatar', type: 'url', label: 'Avatar URL' },
                        { key: 'text', type: 'textarea', label: 'Quote' }
                    ]));
                    break;
                case 'pricing':
                    sections.push({
                        title: 'Header',
                        fields: [
                            field('Badge', text('badge', p.badge, block.id)).fields[0],
                            field('Title', text('title', p.title, block.id)).fields[0],
                            field('Subtitle', textarea('subtitle', p.subtitle, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Pricing Plans', 'plans', p.plans, block.id, [
                        { key: 'name', type: 'text', label: 'Plan Name' },
                        { key: 'price', type: 'text', label: 'Price' },
                        { key: 'period', type: 'text', label: 'Period (e.g. /mo)' },
                        { key: 'featured', type: 'toggle', label: 'Highlighted?' },
                        { key: 'features', type: 'textarea', label: 'Features (one per line, will be split)' },
                        { key: 'cta', type: 'text', label: 'Button Text' }
                    ]));
                    break;
                case 'stats':
                    sections.push(repeater('Stats', 'items', p.items, block.id, [
                        { key: 'icon', type: 'icon', label: 'Icon' },
                        { key: 'number', type: 'text', label: 'Number' },
                        { key: 'label', type: 'text', label: 'Label' }
                    ]));
                    break;
                case 'image':
                    sections.push({
                        title: 'Source & Caption',
                        fields: [
                            field('Image URL', url('src', p.src, block.id)).fields[0],
                            field('Alt Text', text('alt', p.alt, block.id)).fields[0],
                            field('Caption', text('caption', p.caption, block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Review Details',
                        fields: [
                            field('Show Details', toggle('showDetails', p.showDetails, block.id)).fields[0],
                            field('Description', textarea('description', p.description, block.id)).fields[0],
                            field('Rating (0-5)', number('rating', p.rating, block.id)).fields[0]
                        ]
                    });
                    break;
                case 'video':
                    sections.push({
                        title: 'Source',
                        fields: [
                            field('Video URL', url('url', p.url, block.id)).fields[0],
                            field('Title', text('title', p.title, block.id)).fields[0],
                            field('Autoplay', toggle('autoplay', p.autoplay, block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Review Details',
                        fields: [
                            field('Show Details', toggle('showDetails', p.showDetails, block.id)).fields[0],
                            field('Description', textarea('description', p.description, block.id)).fields[0],
                            field('Rating (0-5)', number('rating', p.rating, block.id)).fields[0]
                        ]
                    });
                    break;
                case 'html':
                    sections.push({
                        title: 'Embed Code',
                        fields: [field('HTML Code', htmlEditor('code', p.code, block.id)).fields[0]]
                    });
                    break;
                case 'text':
                    sections.push({
                        title: 'Content',
                        fields: [field('HTML Content', htmlEditor('html', p.html, block.id)).fields[0]]
                    });
                    break;
                case 'divider':
                    sections.push({
                        title: 'Line Style',
                        fields: [
                            field('Style', select2('style', p.style || 'solid', ['solid', 'dashed', 'dotted'], block.id)).fields[0],
                            field('Thickness', text('thickness', p.thickness || '1px', block.id)).fields[0],
                            field('Color', color('color', p.color || '#e5e7eb', block.id)).fields[0]
                        ]
                    });
                    break;
                case 'cta':
                    sections.push({
                        title: 'Content',
                        fields: [
                            field('Title', text('title', p.title, block.id)).fields[0],
                            field('Subtitle', textarea('subtitle', p.subtitle, block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Action',
                        fields: [
                            field('Button Text', text('buttonText', p.buttonText, block.id)).fields[0],
                            field('Button Link', text('buttonHref', p.buttonHref, block.id)).fields[0]
                        ]
                    });
                    break;
                case 'footer':
                    sections.push({
                        title: 'Basic Info',
                        fields: [
                            field('Brand Name', text('brand', p.brand, block.id)).fields[0],
                            field('Tagline', text('tagline', p.tagline, block.id)).fields[0],
                            field('Copyright', text('copyright', p.copyright, block.id)).fields[0]
                        ]
                    });
                    sections.push({
                        title: 'Socials',
                        fields: [
                            field('Show Socials', toggle('showSocials', p.showSocials, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Social Links', 'socials', p.socials, block.id, [
                        { key: 'icon', type: 'icon', label: 'Icon' },
                        { key: 'href', type: 'url', label: 'URL' }
                    ]));
                    sections.push(repeater('Quick Links', 'links', p.links, block.id, [
                        { key: 'label', type: 'text', label: 'Label' },
                        { key: 'href', type: 'text', label: 'URL' }
                    ]));
                    break;
                case 'carousel':
                    sections.push({
                        title: 'Settings',
                        fields: [
                            field('Image Fit', select2('objectFit', p.objectFit || 'cover', ['cover', 'contain', 'stretch', 'fill'], block.id)).fields[0],
                            field('Autoplay', toggle('autoplay', p.autoplay, block.id)).fields[0],
                            field('Show Dots', toggle('showDots', p.showDots, block.id)).fields[0],
                            field('Show Arrows', toggle('showArrows', p.showArrows, block.id)).fields[0]
                        ]
                    });
                    sections.push(repeater('Slides', 'slides', p.slides, block.id, [
                        { key: 'image', type: 'url', label: 'Image URL' },
                        { key: 'title', type: 'text', label: 'Title' },
                        { key: 'subtitle', type: 'textarea', label: 'Subtitle' }
                    ]));
                    break;
                case 'contact':
                    sections.push({
                        title: 'Info',
                        fields: [
                            field('Title', text('title', p.title, block.id)).fields[0],
                            field('Email', text('email', p.email, block.id)).fields[0],
                            field('Phone', text('phone', p.phone, block.id)).fields[0]
                        ]
                    });
                    break;
            }
        }
        return sections;
    }

    function field(label, inputEl) {
        const wrap = document.createElement('div');
        wrap.className = 'form-group';
        const lbl = document.createElement('label');
        lbl.textContent = label;
        wrap.appendChild(lbl);
        if (inputEl) wrap.appendChild(inputEl);
        return { title: null, fields: [wrap] };
    }

    function text(key, val, blockId) {
        const el = document.createElement('input');
        el.type = 'text'; el.value = val || '';
        el.addEventListener('change', () => {
            let v = el.value.trim();
            if (['margin', 'padding', 'width', 'height', 'gap', 'fontSize', 'borderRadius', 'borderWidth', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'top', 'bottom', 'left', 'right'].includes(key)) {
                if (/^-?\d+$/.test(v)) v += 'px';
                el.value = v; // update UI so user sees the 'px'
            }
            State.updateBlockProps(blockId, { [key]: v });
        });
        return el;
    }
    function number(key, val, blockId) {
        const el = document.createElement('input');
        el.type = 'number'; el.value = val || 0;
        el.addEventListener('input', () => State.updateBlockProps(blockId, { [key]: Number(el.value) }));
        return el;
    }
    function url(key, val, blockId) {
        const wrap = document.createElement('div');
        wrap.style.display = 'flex'; wrap.style.flexDirection = 'column'; wrap.style.gap = '5px';
        
        const el = document.createElement('input');
        el.type = 'text'; el.value = val || '';
        el.placeholder = 'https://… or select page';
        el.addEventListener('input', () => State.updateBlockProps(blockId, { [key]: el.value }));
        wrap.appendChild(el);

        const pages = State.getPages();
        if (pages.length > 1) {
            const sel = document.createElement('select');
            sel.style.fontSize = '0.75rem';
            sel.innerHTML = `<option value="">-- Link to Page --</option>` + 
                pages.map(p => `<option value="${p.filename}" ${val === p.filename ? 'selected' : ''}>Page: ${p.name}</option>`).join('');
            sel.addEventListener('change', () => {
                if (sel.value) {
                    el.value = sel.value;
                    State.updateBlockProps(blockId, { [key]: sel.value });
                }
            });
            wrap.appendChild(sel);
        }
        return wrap;
    }
    function color(key, val, blockId) {
        const row = document.createElement('div');
        row.style.display = 'flex'; row.style.gap = '8px'; row.style.alignItems = 'center';
        const picker = document.createElement('input');
        
        const cleanVal = (val || '#ffffff').replace(' !important', '').trim();
        picker.type = 'color'; picker.value = cleanVal;
        picker.style.width = '44px'; picker.style.height = '30px';
        picker.style.flex = '0 0 44px';
        const textInput = document.createElement('input');
        textInput.type = 'text'; textInput.value = cleanVal;
        textInput.style.flex = '1';
        
        picker.addEventListener('input', () => {
            textInput.value = picker.value;
            State.updateBlockProps(blockId, { [key]: picker.value });
        });
        textInput.addEventListener('input', () => {
            picker.value = textInput.value;
            State.updateBlockProps(blockId, { [key]: textInput.value });
        });
        row.appendChild(picker); row.appendChild(textInput);
        return row;
    }
    function textarea(key, val, blockId) {
        const el = document.createElement('textarea');
        el.rows = 3; el.value = val || '';
        el.addEventListener('input', () => State.updateBlockProps(blockId, { [key]: el.value }));
        return el;
    }
    function htmlEditor(key, val, blockId) {
        const el = document.createElement('textarea');
        el.rows = 6; el.value = val || '';
        el.style.fontFamily = 'monospace'; el.style.fontSize = '0.78rem';
        el.addEventListener('input', () => State.updateBlockProps(blockId, { [key]: el.value }));
        return el;
    }
    function select2(key, val, options, blockId) {
        const el = document.createElement('select');
        options.forEach(o => {
            const opt = document.createElement('option');
            opt.value = o; opt.textContent = o;
            if (o === val) opt.selected = true;
            el.appendChild(opt);
        });
        el.addEventListener('change', () => {
            State.updateBlockProps(blockId, { [key]: el.value });
            if (key === 'display') {
                renderPanel(State.getBlock(blockId));
            }
        });
        return el;
    }
    function toggle(key, val, blockId) {
        const row = document.createElement('div');
        row.style.display = 'flex'; row.style.alignItems = 'center'; row.style.gap = '8px';
        const el = document.createElement('input');
        el.type = 'checkbox'; el.checked = !!val;
        el.style.width = 'auto'; el.style.height = '16px'; el.style.cursor = 'pointer';
        el.addEventListener('change', () => State.updateBlockProps(blockId, { [key]: el.checked }));
        const lbl = document.createElement('span');
        lbl.textContent = val ? 'On' : 'Off';
        lbl.style.fontSize = '0.8rem'; lbl.style.color = 'var(--text2)';
        el.addEventListener('change', () => { lbl.textContent = el.checked ? 'On' : 'Off'; });
        row.appendChild(el); row.appendChild(lbl);
        return row;
    }

    const ICON_LIB = [
        // --- Font Awesome Solid ---
        'fa-solid fa-house', 'fa-solid fa-user', 'fa-solid fa-check', 'fa-solid fa-download', 'fa-solid fa-magnifying-glass', 
        'fa-solid fa-envelope', 'fa-solid fa-star', 'fa-solid fa-heart', 'fa-solid fa-location-dot', 'fa-solid fa-xmark',
        'fa-solid fa-plus', 'fa-solid fa-minus', 'fa-solid fa-gear', 'fa-solid fa-bell', 'fa-solid fa-circle-question',
        'fa-solid fa-circle-info', 'fa-solid fa-circle-exclamation', 'fa-solid fa-circle-check', 'fa-solid fa-image',
        'fa-solid fa-phone', 'fa-solid fa-video', 'fa-solid fa-microphone', 'fa-solid fa-briefcase', 'fa-solid fa-chart-line',
        'fa-solid fa-chart-pie', 'fa-solid fa-chart-bar', 'fa-solid fa-credit-card', 'fa-solid fa-wallet', 'fa-solid fa-cart-shopping',
        'fa-solid fa-bag-shopping', 'fa-solid fa-truck', 'fa-solid fa-plane', 'fa-solid fa-car', 'fa-solid fa-train',
        'fa-solid fa-bus', 'fa-solid fa-ship', 'fa-solid fa-bicycle', 'fa-solid fa-motorcycle', 'fa-solid fa-clock',
        'fa-solid fa-calendar', 'fa-solid fa-camera', 'fa-solid fa-laptop', 'fa-solid fa-mobile-screen', 'fa-solid fa-desktop',
        'fa-solid fa-tablet-screen-button', 'fa-solid fa-tv', 'fa-solid fa-headphones', 'fa-solid fa-music', 'fa-solid fa-play',
        'fa-solid fa-pause', 'fa-solid fa-stop', 'fa-solid fa-forward', 'fa-solid fa-backward', 'fa-solid fa-volume-high',
        'fa-solid fa-volume-low', 'fa-solid fa-volume-off', 'fa-solid fa-volume-xmark', 'fa-solid fa-wifi', 'fa-solid fa-bluetooth',
        'fa-solid fa-battery-full', 'fa-solid fa-battery-half', 'fa-solid fa-battery-empty', 'fa-solid fa-plug', 'fa-solid fa-microchip',
        'fa-solid fa-server', 'fa-solid fa-database', 'fa-solid fa-code', 'fa-solid fa-code-merge', 'fa-solid fa-code-fork',
        'fa-solid fa-code-branch', 'fa-solid fa-terminal', 'fa-solid fa-cloud', 'fa-solid fa-cloud-arrow-up', 'fa-solid fa-cloud-arrow-down',
        'fa-solid fa-upload', 'fa-solid fa-print', 'fa-solid fa-copy', 'fa-solid fa-paste', 'fa-solid fa-trash', 'fa-solid fa-pen',
        'fa-solid fa-pen-to-square', 'fa-solid fa-eye', 'fa-solid fa-eye-slash', 'fa-solid fa-lock', 'fa-solid fa-unlock',
        'fa-solid fa-shield-halved', 'fa-solid fa-key', 'fa-solid fa-filter', 'fa-solid fa-list', 'fa-solid fa-grip',
        'fa-solid fa-bars', 'fa-solid fa-ellipsis', 'fa-solid fa-share-nodes', 'fa-solid fa-link', 'fa-solid fa-unlink',
        'fa-solid fa-paperclip', 'fa-solid fa-tag', 'fa-solid fa-tags', 'fa-solid fa-ticket', 'fa-solid fa-landmark',
        'fa-solid fa-building', 'fa-solid fa-hotel', 'fa-solid fa-shop', 'fa-solid fa-store', 'fa-solid fa-hospital',
        'fa-solid fa-school', 'fa-solid fa-graduation-cap', 'fa-solid fa-book', 'fa-solid fa-book-open', 'fa-solid fa-pencil',
        'fa-solid fa-palette', 'fa-solid fa-brush', 'fa-solid fa-utensils', 'fa-solid fa-mug-hot', 'fa-solid fa-coffee',
        'fa-solid fa-burger', 'fa-solid fa-pizza-slice', 'fa-solid fa-apple-whole', 'fa-solid fa-carrot', 'fa-solid fa-leaf',
        'fa-solid fa-tree', 'fa-solid fa-sun', 'fa-solid fa-moon', 'fa-solid fa-cloud-sun', 'fa-solid fa-umbrella',
        'fa-solid fa-snowflake', 'fa-solid fa-droplet', 'fa-solid fa-fire', 'fa-solid fa-bolt', 'fa-solid fa-mountain',
        'fa-solid fa-mountain-sun', 'fa-solid fa-earth-americas', 'fa-solid fa-earth-europe', 'fa-solid fa-earth-asia',
        'fa-solid fa-rocket', 'fa-solid fa-shuttle-space', 'fa-solid fa-ghost', 'fa-solid fa-skull', 'fa-solid fa-award',
        'fa-solid fa-medal', 'fa-solid fa-trophy', 'fa-solid fa-gem', 'fa-solid fa-hand-holding-dollar', 'fa-solid fa-coins',
        'fa-solid fa-money-bill', 'fa-solid fa-money-check', 'fa-solid fa-vault', 'fa-solid fa-piggy-bank', 'fa-solid fa-gift',
        'fa-solid fa-cake-candles', 'fa-solid fa-balloon', 'fa-solid fa-compass', 'fa-solid fa-map', 'fa-solid fa-flag',
        'fa-solid fa-anchor', 'fa-solid fa-compass-drafting', 'fa-solid fa-ruler', 'fa-solid fa-shapes', 'fa-solid fa-puzzle-piece',
        'fa-solid fa-brain', 'fa-solid fa-dna', 'fa-solid fa-microscope', 'fa-solid fa-stethoscope', 'fa-solid fa-heart-pulse',
        'fa-solid fa-pills', 'fa-solid fa-syringe', 'fa-solid fa-wheelchair', 'fa-solid fa-user-doctor', 'fa-solid fa-user-nurse',
        'fa-solid fa-users', 'fa-solid fa-user-group', 'fa-solid fa-address-book', 'fa-solid fa-id-card', 'fa-solid fa-newspaper',

        // --- Font Awesome Brands ---
        'fa-brands fa-facebook', 'fa-brands fa-facebook-f', 'fa-brands fa-facebook-messenger', 'fa-brands fa-twitter', 'fa-brands fa-x-twitter',
        'fa-brands fa-instagram', 'fa-brands fa-linkedin', 'fa-brands fa-linkedin-in', 'fa-brands fa-youtube', 'fa-brands fa-vimeo',
        'fa-brands fa-vimeo-v', 'fa-brands fa-github', 'fa-brands fa-gitlab', 'fa-brands fa-bitbucket', 'fa-brands fa-whatsapp',
        'fa-brands fa-telegram', 'fa-brands fa-tiktok', 'fa-brands fa-snapchat', 'fa-brands fa-pinterest', 'fa-brands fa-pinterest-p',
        'fa-brands fa-discord', 'fa-brands fa-slack', 'fa-brands fa-skype', 'fa-brands fa-zoom', 'fa-brands fa-google',
        'fa-brands fa-google-drive', 'fa-brands fa-google-play', 'fa-brands fa-apple', 'fa-brands fa-app-store', 'fa-brands fa-android',
        'fa-brands fa-chrome', 'fa-brands fa-edge', 'fa-brands fa-firefox', 'fa-brands fa-safari', 'fa-brands fa-amazon',
        'fa-brands fa-ebay', 'fa-brands fa-shopify', 'fa-brands fa-wordpress', 'fa-brands fa-wix', 'fa-brands fa-squarespace',
        'fa-brands fa-paypal', 'fa-brands fa-stripe', 'fa-brands fa-cc-visa', 'fa-brands fa-cc-mastercard', 'fa-brands fa-cc-amex',
        'fa-brands fa-cc-paypal', 'fa-brands fa-cc-discover', 'fa-brands fa-bitcoin', 'fa-brands fa-ethereum', 'fa-brands fa-medium',
        'fa-brands fa-reddit', 'fa-brands fa-reddit-alien', 'fa-brands fa-quora', 'fa-brands fa-stack-overflow', 'fa-brands fa-behance',
        'fa-brands fa-dribbble', 'fa-brands fa-figma', 'fa-brands fa-sketch', 'fa-brands fa-adobe', 'fa-brands fa-canva',
        'fa-brands fa-node-js', 'fa-brands fa-js', 'fa-brands fa-react', 'fa-brands fa-vuejs', 'fa-brands fa-angular',
        'fa-brands fa-html5', 'fa-brands fa-css3', 'fa-brands fa-sass', 'fa-brands fa-itunes', 'fa-brands fa-spotify',
        'fa-brands fa-soundcloud', 'fa-brands fa-twitch', 'fa-brands fa-xbox', 'fa-brands fa-playstation', 'fa-brands fa-steam',
        'fa-brands fa-unity', 'fa-brands fa-unreal-engine', 'fa-brands fa-microsoft', 'fa-brands fa-linux', 'fa-brands fa-ubuntu',
        'fa-brands fa-docker', 'fa-brands fa-aws', 'fa-brands fa-digital-ocean', 'fa-brands fa-python', 'fa-brands fa-php',
        'fa-brands fa-java', 'fa-brands fa-rust', 'fa-brands fa-golang', 'fa-brands fa-swift', 'fa-brands fa-kotlin',
        'fa-brands fa-strava', 'fa-brands fa-trello', 'fa-brands fa-asana', 'fa-brands fa-jira', 'fa-brands fa-confluence',

        // --- Bootstrap Icons ---
        'bi bi-activity', 'bi bi-alarm', 'bi bi-align-bottom', 'bi bi-align-center', 'bi bi-align-end', 'bi bi-align-middle', 'bi bi-align-start',
        'bi bi-align-top', 'bi bi-alt', 'bi bi-app', 'bi bi-app-indicator', 'bi bi-archive', 'bi bi-arrow-90deg-down', 'bi bi-arrow-90deg-left',
        'bi bi-arrow-90deg-right', 'bi bi-arrow-90deg-up', 'bi bi-arrow-bar-down', 'bi bi-arrow-bar-left', 'bi bi-arrow-bar-right', 'bi bi-arrow-bar-up',
        'bi bi-award', 'bi bi-back', 'bi bi-backspace', 'bi bi-bag', 'bi bi-bank', 'bi bi-bar-chart', 'bi bi-basket', 'bi bi-battery', 'bi bi-bell',
        'bi bi-bicycle', 'bi bi-book', 'bi bi-bookmark', 'bi bi-box', 'bi bi-briefcase', 'bi bi-broadcast', 'bi bi-browser-chrome', 'bi bi-box-arrow-in-right',
        'bi bi-box-arrow-right', 'bi bi-bug', 'bi bi-building', 'bi bi-bullseye', 'bi bi-calculator', 'bi bi-calendar', 'bi bi-camera', 'bi bi-car-front',
        'bi bi-cart', 'bi bi-cash', 'bi bi-chat', 'bi bi-check', 'bi bi-chevron-down', 'bi bi-chevron-left', 'bi bi-chevron-right', 'bi bi-chevron-up',
        'bi bi-circle', 'bi bi-clipboard', 'bi bi-clock', 'bi bi-cloud', 'bi bi-code', 'bi bi-collection', 'bi bi-columns', 'bi bi-command', 'bi bi-compass',
        'bi bi-cpu', 'bi bi-credit-card', 'bi bi-crop', 'bi bi-cup-hot', 'bi bi-currency-bitcoin', 'bi bi-currency-dollar', 'bi bi-currency-euro',
        'bi bi-cursor', 'bi bi-dash', 'bi bi-database', 'bi bi-desktop', 'bi bi-diagram-3', 'bi bi-display', 'bi bi-door-closed', 'bi bi-download',
        'bi bi-droplet', 'bi bi-earbuds', 'bi bi-easel', 'bi bi-egg', 'bi bi-envelope', 'bi bi-eraser', 'bi bi-ethernet', 'bi bi-exclamation', 'bi bi-eye',
        'bi bi-facebook', 'bi bi-file', 'bi bi-filter', 'bi bi-fingerprint', 'bi bi-fire', 'bi bi-flag', 'bi bi-flower1', 'bi bi-folder', 'bi bi-forward',
        'bi bi-fullscreen', 'bi bi-funnel', 'bi bi-gear', 'bi bi-gem', 'bi bi-gift', 'bi bi-github', 'bi bi-globe', 'bi bi-google', 'bi bi-graph-up',
        'bi bi-grid', 'bi bi-hammer', 'bi bi-hand-thumbs-up', 'bi bi-hash', 'bi bi-headphones', 'bi bi-heart', 'bi bi-house', 'bi bi-image', 'bi bi-inbox',
        'bi bi-infinity', 'bi bi-info-circle', 'bi bi-instagram', 'bi bi-journal', 'bi bi-key', 'bi bi-keyboard', 'bi bi-laptop', 'bi bi-layers',
        'bi bi-layout-sidebar', 'bi bi-lightning', 'bi bi-link', 'bi bi-linkedin', 'bi bi-list', 'bi bi-lock', 'bi bi-magic', 'bi bi-magnet', 'bi bi-mailbox',
        'bi bi-map', 'bi bi-mask', 'bi bi-megaphone', 'bi bi-messenger', 'bi bi-mic', 'bi bi-microsoft', 'bi bi-moon', 'bi bi-music-note', 'bi bi-newspaper',
        'bi bi-nut', 'bi bi-option', 'bi bi-palette', 'bi bi-paperclip', 'bi bi-pause', 'bi bi-paypal', 'bi bi-pc-display', 'bi bi-pencil', 'bi bi-pentagon',
        'bi bi-people', 'bi bi-person', 'bi bi-phone', 'bi bi-pie-chart', 'bi bi-pin', 'bi bi-play', 'bi bi-plus', 'bi bi-power', 'bi bi-printer', 'bi bi-puzzle',
        'bi bi-question-circle', 'bi bi-reception-4', 'bi bi-reddit', 'bi bi-reply', 'bi bi-robot', 'bi bi-rocket', 'bi bi-rss', 'bi bi-safe', 'bi bi-save',
        'bi bi-scissors', 'bi bi-search', 'bi bi-send', 'bi bi-server', 'bi bi-share', 'bi bi-shield', 'bi bi-shop', 'bi bi-shuffle', 'bi bi-sign-turn-right',
        'bi bi-signal', 'bi bi-slack', 'bi bi-sliders', 'bi bi-smartwatch', 'bi bi-snapchat', 'bi bi-snow', 'bi bi-speaker', 'bi bi-speedometer', 'bi bi-spotify',
        'bi bi-stack', 'bi bi-star', 'bi bi-stickies', 'bi bi-stop', 'bi bi-stopwatch', 'bi bi-suit-heart', 'bi bi-sun', 'bi bi-tags', 'bi bi-telegram',
        'bi bi-telephone', 'bi bi-terminal', 'bi bi-text-center', 'bi bi-text-left', 'bi bi-text-right', 'bi bi-three-dots', 'bi bi-thumbs-up', 'bi bi-ticket',
        'bi bi-tiktok', 'bi bi-toggle-on', 'bi bi-tools', 'bi bi-train-front', 'bi bi-trash', 'bi bi-tree', 'bi bi-trello', 'bi bi-trophy', 'bi bi-truck',
        'bi bi-tv', 'bi bi-twitch', 'bi bi-twitter-x', 'bi bi-umbrella', 'bi bi-unlock', 'bi bi-upload', 'bi bi-usb', 'bi bi-vector-pen', 'bi bi-vimeo',
        'bi bi-volume-up', 'bi bi-wallet', 'bi bi-watch', 'bi bi-water', 'bi bi-whatsapp', 'bi bi-wifi', 'bi bi-window', 'bi bi-wrench', 'bi bi-xbox',
        'bi bi-youtube', 'bi bi-zoom-in',

        // --- Boxicons (Solid & Regular) ---
        'bx bx-home', 'bx bx-user', 'bx bx-message', 'bx bx-notification', 'bx bx-cog', 'bx bx-search', 'bx bx-heart', 'bx bx-star',
        'bx bx-calendar', 'bx bx-time', 'bx bx-cart', 'bx bx-shopping-bag', 'bx bx-wallet', 'bx bx-credit-card', 'bx bx-briefcase',
        'bx bx-book', 'bx bx-bookmark', 'bx bx-image', 'bx bx-camera', 'bx bx-video', 'bx bx-microphone', 'bx bx-headset', 'bx bx-support',
        'bx bx-phone', 'bx bx-envelope', 'bx bx-map', 'bx bx-location-plus', 'bx bx-globe', 'bx bx-cloud', 'bx bx-wifi', 'bx bx-bluetooth',
        'bx bx-battery', 'bx bx-plug', 'bx bx-bolt', 'bx bx-sun', 'bx bx-moon', 'bx bx-cloud-lightning', 'bx bx-wind', 'bx bx-droplet',
        'bx bx-leaf', 'bx bx-tree', 'bx bx-rocket', 'bx bx-layer', 'bx bx-layout', 'bx bx-grid', 'bx bx-list-ul', 'bx bx-list-ol',
        'bx bx-link', 'bx bx-unlink', 'bx bx-paperclip', 'bx bx-attachment', 'bx bx-paper-plane', 'bx bx-share-alt', 'bx bx-upload', 'bx bx-download',
        'bx bx-refresh', 'bx bx-sync', 'bx bx-history', 'bx bx-archive', 'bx bx-folder', 'bx bx-file', 'bx bx-copy', 'bx bx-paste',
        'bx bx-trash', 'bx bx-edit', 'bx bx-pencil', 'bx bx-show', 'bx bx-hide', 'bx bx-lock', 'bx bx-lock-open', 'bx bx-key',
        'bx bx-shield', 'bx bx-flag', 'bx bx-tag', 'bx bx-label', 'bx bx-trophy', 'bx bx-medal', 'bx bx-award', 'bx bx-gift',
        'bx bx-party', 'bx bx-drink', 'bx bx-food-menu', 'bx bx-restaurant', 'bx bx-coffee', 'bx bx-beer', 'bx bx-wine', 'bx bx-cake',
        'bx bx-tv', 'bx bx-laptop', 'bx bx-mobile', 'bx bx-tablet', 'bx bx-desktop', 'bx bx-mouse', 'bx bx-keyboard', 'bx bx-printer',
        'bx bx-station', 'bx bx-car', 'bx bx-bus', 'bx bx-train', 'bx bx-plane', 'bx bx-ship', 'bx bx-walk', 'bx bx-run', 'bx bx-cycling',
        'bx bx-football', 'bx bx-basketball', 'bx bx-tennis-ball', 'bx bx-game', 'bx bx-joystick', 'bx bx-music', 'bx bx-headphone', 'bx bx-volume-full',
        'bx bxs-hot', 'bx bxs-flame', 'bx bxs-star', 'bx bxs-heart', 'bx bxs-smile', 'bx bxs-face', 'bx bxs-cool', 'bx bxs-medal',
        'bx bxs-trophy', 'bx bxs-crown', 'bx bxs-diamond', 'bx bxs-gem', 'bx bxs-zap', 'bx bxs-bolt', 'bx bxs-camera', 'bx bxs-video',
        'bx bxs-phone', 'bx bxs-envelope', 'bx bxs-chat', 'bx bxs-comment', 'bx bxs-user-detail', 'bx bxs-contact', 'bx bxs-id-card',
        'bx bxs-briefcase', 'bx bxs-bank', 'bx bxs-calculator', 'bx bxs-cloud-upload', 'bx bxs-cloud-download', 'bx bxs-file-pdf',
        'bx bxs-cog', 'bx bxs-wrench', 'bx bxs-magic-wand', 'bx bxs-palette', 'bx bxs-paint', 'bx bxs-component',

        // --- Remix Icon (Line & Fill) ---
        'ri-home-line', 'ri-home-fill', 'ri-user-line', 'ri-user-fill', 'ri-message-line', 'ri-message-fill', 'ri-notification-line',
        'ri-notification-fill', 'ri-settings-line', 'ri-settings-fill', 'ri-search-line', 'ri-heart-line', 'ri-heart-fill',
        'ri-star-line', 'ri-star-fill', 'ri-calendar-line', 'ri-time-line', 'ri-shopping-cart-line', 'ri-shopping-bag-line',
        'ri-wallet-line', 'ri-credit-card-line', 'ri-briefcase-line', 'ri-book-line', 'ri-bookmark-line', 'ri-image-line',
        'ri-camera-line', 'ri-video-line', 'ri-mic-line', 'ri-headset-line', 'ri-customer-service-line', 'ri-customer-service-2-line',
        'ri-phone-line', 'ri-mail-line', 'ri-map-pin-line', 'ri-globe-line', 'ri-cloud-line', 'ri-wifi-line', 'ri-bluetooth-line',
        'ri-battery-line', 'ri-plug-line', 'ri-flashlight-line', 'ri-sun-line', 'ri-moon-line', 'ri-cloud-windy-line', 'ri-leaf-line',
        'ri-temp-hot-line', 'ri-temp-cold-line', 'ri-fire-line', 'ri-water-flash-line', 'ri-rocket-line', 'ri-plane-line', 'ri-car-line',
        'ri-truck-line', 'ri-bicycle-line', 'ri-walk-line', 'ri-run-line', 'ri-football-line', 'ri-gamepad-line', 'ri-music-line',
        'ri-volume-up-line', 'ri-volume-down-line', 'ri-volume-mute-line', 'ri-mic-off-line', 'ri-video-off-line', 'ri-shield-line',
        'ri-shield-check-line', 'ri-lock-line', 'ri-lock-unlock-line', 'ri-key-line', 'ri-flag-line', 'ri-tag-line', 'ri-price-tag-line',
        'ri-award-line', 'ri-medal-line', 'ri-cup-line', 'ri-cake-line', 'ri-gift-line', 'ri-compass-line', 'ri-anchor-line',
        'ri-pencil-line', 'ri-edit-line', 'ri-delete-bin-line', 'ri-save-line', 'ri-file-line', 'ri-folder-line', 'ri-upload-line',
        'ri-download-line', 'ri-share-line', 'ri-links-line', 'ri-external-link-line', 'ri-refresh-line', 'ri-history-line',
        'ri-timer-line', 'ri-alarm-line', 'ri-at-line', 'ri-hashtag-line', 'ri-qr-code-line', 'ri-barcode-line', 'ri-computer-line',
        'ri-tablet-line', 'ri-smartphone-line', 'ri-tv-line', 'ri-dashboard-line', 'ri-pie-chart-line', 'ri-bar-chart-line',
        'ri-line-chart-line', 'ri-code-line', 'ri-terminal-line', 'ri-command-line', 'ri-database-line', 'ri-sever-line',
        'ri-customer-service-fill', 'ri-customer-service-2-fill', 'ri-service-line', 'ri-service-fill', 'ri-hand-heart-line',
        'ri-hand-coin-line', 'ri-shake-hands-line', 'ri-team-line', 'ri-group-line', 'ri-community-line'
    ];

    function icon(key, value, blockId, onUpdate) {
        const container = document.createElement('div');
        container.className = 'icon-picker-field';
        container.style.display = 'flex'; container.style.gap = '8px'; container.style.alignItems = 'center';

        const preview = document.createElement('div');
        preview.className = 'val-preview';
        preview.innerHTML = `<i class="${value || 'fa-solid fa-star'}"></i>`;
        
        const input = document.createElement('input');
        input.type = 'text'; input.value = value || '';
        input.placeholder = 'Icon class...';
        input.style.flex = '1';
        input.oninput = (e) => {
            const val = e.target.value;
            preview.innerHTML = `<i class="${val || 'fa-solid fa-question'}"></i>`;
            if (onUpdate) onUpdate(val);
            else State.updateBlockProps(blockId, { [key]: val });
        };

        const openBtn = document.createElement('button');
        openBtn.className = 'picker-btn';
        openBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
        openBtn.onclick = (e) => {
            e.stopPropagation();
            const existing = document.querySelector('.icon-picker-panel');
            if (existing) existing.remove();

            const rect = openBtn.getBoundingClientRect();
            const panel = document.createElement('div');
            panel.className = 'icon-picker-panel';
            panel.style.position = 'fixed';
            panel.style.top = Math.min(window.innerHeight - 420, rect.top) + 'px';
            panel.style.left = (rect.left - 310) + 'px'; // Position to the left of the button
            panel.style.width = '300px';
            panel.style.maxHeight = '400px';
            panel.style.backgroundColor = '#1a1d27'; // var(--surface) equivalent
            panel.style.border = '1px solid #2e3349'; // var(--border) equivalent
            panel.style.borderRadius = '12px';
            panel.style.boxShadow = '0 10px 40px rgba(0,0,0,0.5)';
            panel.style.zIndex = '10000'; // Very high z-index
            panel.style.display = 'flex';
            panel.style.flexDirection = 'column';
            panel.style.overflow = 'hidden';

            const searchWrap = document.createElement('div');
            searchWrap.style.padding = '12px';
            searchWrap.style.borderBottom = '1px solid #2e3349';
            const search = document.createElement('input');
            search.placeholder = 'Search icons...';
            search.style.width = '100%';
            search.style.padding = '8px';
            search.style.backgroundColor = '#0f1117'; // var(--bg) equivalent
            search.style.border = '1px solid #3d4266'; // var(--border2) equivalent
            search.style.borderRadius = '6px';
            search.style.color = '#e2e8f0'; // var(--text) equivalent
            searchWrap.appendChild(search);
            panel.appendChild(searchWrap);

            const grid = document.createElement('div');
            grid.className = 'icon-grid-scroll'; // Added class
            grid.style.padding = '10px';
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
            grid.style.gap = '8px';
            grid.style.overflowY = 'auto';
            grid.style.flex = '1';

            const renderGrid = (term = '') => {
                grid.innerHTML = '';
                const filtered = ICON_LIB.filter(ic => ic.toLowerCase().includes(term.toLowerCase()));
                filtered.forEach(ic => {
                    const btn = document.createElement('button');
                    btn.style.padding = '10px 0';
                    btn.style.background = 'rgba(255,255,255,0.05)';
                    btn.style.border = '1px solid rgba(255,255,255,0.1)';
                    btn.style.borderRadius = '8px';
                    btn.style.color = '#fff';
                    btn.style.cursor = 'pointer';
                    btn.title = ic;
                    btn.innerHTML = `<i class="${ic}" style="font-size:1.2rem;"></i>`;
                    btn.onclick = () => {
                        input.value = ic;
                        input.oninput({ target: input });
                        panel.remove();
                    };
                    btn.onmouseover = () => btn.style.background = 'rgba(108, 99, 255, 0.2)';
                    btn.onmouseout = () => btn.style.background = 'rgba(255,255,255,0.05)';
                    grid.appendChild(btn);
                });
            };

            search.oninput = (e) => renderGrid(e.target.value);
            renderGrid();

            panel.appendChild(grid);
            document.body.appendChild(panel);

            // Close on click outside
            const clickOutside = (ev) => {
                if (!panel.contains(ev.target) && ev.target !== openBtn) {
                    panel.remove();
                    document.removeEventListener('mousedown', clickOutside);
                }
            };
            setTimeout(() => document.addEventListener('mousedown', clickOutside), 10);
        };

        container.appendChild(preview);
        container.appendChild(input);
        container.appendChild(openBtn);
        return container;
    }

    function range(key, val, min, max, step, blockId) {
        const row = document.createElement('div');
        row.style.display = 'flex'; row.style.alignItems = 'center'; row.style.gap = '10px';
        const el = document.createElement('input');
        el.type = 'range'; el.min = min; el.max = max; el.step = step; el.value = val;
        el.style.flex = '1'; el.style.cursor = 'pointer';
        const lbl = document.createElement('span');
        lbl.textContent = val;
        lbl.style.fontSize = '0.8rem'; lbl.style.color = 'var(--text2)'; lbl.style.minWidth = '35px';
        el.addEventListener('input', () => {
            lbl.textContent = el.value;
            State.updateBlockProps(blockId, { [key]: el.value });
        });
        row.appendChild(el); row.appendChild(lbl);
        return row;
    }

    function repeater(title, key, items, blockId, fieldDefs) {
        const sec = document.createElement('div');
        sec.className = 'prop-section';
        const h4 = document.createElement('h4');
        h4.textContent = title;
        sec.appendChild(h4);

        const renderItems = () => {
            sec.querySelectorAll('.repeater-item').forEach(el => el.remove());
            sec.querySelector('.add-item-btn') && sec.querySelector('.add-item-btn').remove();

            const currentItems = State.getBlock(blockId).props[key] || [];

            currentItems.forEach((item, idx) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'repeater-item';
                const header = document.createElement('div');
                header.className = 'repeater-item-header';
                
                const firstKey = fieldDefs[0].key;
                let headerLabel = `Item ${idx + 1}`;
                if (item[firstKey] !== undefined) {
                     headerLabel = String(item[firstKey]) || `Item ${idx + 1}`;
                }
                header.innerHTML = `<span>${headerLabel.substring(0, 20)}</span>`;
                
                const rmBtn = document.createElement('button');
                rmBtn.className = 'rm-btn';
                rmBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                rmBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const arr = [...(State.getBlock(blockId).props[key] || [])];
                    arr.splice(idx, 1);
                    State.updateBlockProps(blockId, { [key]: arr });
                    renderItems();
                });
                header.appendChild(rmBtn);

                const body = document.createElement('div');
                body.className = 'repeater-item-body';

                fieldDefs.forEach(def => {
                    const fg = document.createElement('div');
                    fg.className = 'form-group';
                    const lbl = document.createElement('label');
                    lbl.textContent = def.label;
                    fg.appendChild(lbl);

                    let inp;
                    if (def.type === 'toggle') {
                        // Inline toggle implementation without wrapper conflict
                        const tWrap = document.createElement('div');
                        tWrap.style.display = 'flex'; tWrap.style.gap = '8px'; tWrap.style.alignItems = 'center';
                        inp = document.createElement('input');
                        inp.type = 'checkbox';
                        inp.checked = !!item[def.key];
                        inp.style.width = 'auto'; inp.style.height = '16px'; inp.style.cursor = 'pointer';
                        const tLbl = document.createElement('span');
                        tLbl.textContent = item[def.key] ? 'On' : 'Off';
                        tLbl.style.fontSize = '0.8rem'; tLbl.style.color = 'var(--text2)';
                        inp.addEventListener('change', () => {
                            tLbl.textContent = inp.checked ? 'On' : 'Off';
                            const arr = [...(State.getBlock(blockId).props[key] || [])];
                            arr[idx] = { ...arr[idx], [def.key]: inp.checked };
                            State.updateBlockProps(blockId, { [key]: arr });
                        });
                        tWrap.appendChild(inp); tWrap.appendChild(tLbl);
                        fg.appendChild(tWrap);
                    } else if (def.type === 'textarea') {
                        inp = document.createElement('textarea');
                        inp.rows = 3;
                        inp.value = item[def.key] || '';
                    } else if (def.type === 'number') {
                        inp = document.createElement('input');
                        inp.type = 'number';
                        inp.value = item[def.key] || 0;
                    } else if (def.type === 'icon') {
                        inp = icon(def.key, item[def.key], blockId, (v) => {
                            const arr = [...(State.getBlock(blockId).props[key] || [])];
                            arr[idx] = { ...arr[idx], [def.key]: v };
                            State.updateBlockProps(blockId, { [key]: arr });
                            if (def.key === firstKey) { 
                                header.querySelector('span').textContent = (String(v) || `Item ${idx + 1}`).substring(0, 20); 
                            }
                        });
                    } else {
                        inp = document.createElement('input');
                        inp.type = def.type === 'url' ? 'url' : 'text';
                        inp.value = item[def.key] || '';
                    }

                    if (def.type !== 'toggle' && def.type !== 'icon') {
                        inp.addEventListener('input', () => {
                            const arr = [...(State.getBlock(blockId).props[key] || [])];
                            let val = inp.value;
                            if (def.type === 'number') val = Number(val);
                            arr[idx] = { ...arr[idx], [def.key]: val };
                            State.updateBlockProps(blockId, { [key]: arr });
                            if (def.key === firstKey) { 
                                header.querySelector('span').textContent = (String(val) || `Item ${idx + 1}`).substring(0, 20); 
                            }
                        });
                    }
                    if (def.type !== 'toggle') {
                        fg.appendChild(inp);
                    }

                    body.appendChild(fg);
                });

                itemEl.appendChild(header);
                itemEl.appendChild(body);
                sec.appendChild(itemEl);
            });

            const addBtn = document.createElement('button');
            addBtn.className = 'add-item-btn';
            addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Item';
            addBtn.addEventListener('click', () => {
                const arr = [...(State.getBlock(blockId).props[key] || [])];
                const emptyItem = {};
                fieldDefs.forEach(def => {
                    emptyItem[def.key] = def.type === 'toggle' ? false : (def.type === 'number' ? 0 : '');
                });
                arr.push(emptyItem);
                State.updateBlockProps(blockId, { [key]: arr });
                renderItems();
            });
            sec.appendChild(addBtn);
        };

        renderItems();
        return { title: null, fields: [sec] };
    }

    return { init };
})();
