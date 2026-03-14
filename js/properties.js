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
                        field('Opacity (0-1)', text('opacity', p.opacity || '', block.id)).fields[0],
                        field('Z-index', text('zIndex', p.zIndex || '', block.id)).fields[0],
                        field('Box Shadow', text('boxShadow', p.boxShadow || '', block.id)).fields[0]
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
            }
            if (isContent) {
                sections.push({
                    title: 'Text Content',
                    fields: [
                        field('Edit Text', textarea('text', p.text || d.text, block.id)).fields[0]
                    ]
                });
                const resetBtn = document.createElement('button');
                resetBtn.innerText = 'Reset to Default';
                resetBtn.className = 'tb-btn danger';
                resetBtn.style.width = '100%';
                resetBtn.onclick = () => {
                    const subStyles = { ...block.props.subStyles };
                    delete subStyles[subPath];
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
                    field('Padding', text('padding', p.padding || '0px', block.id)).fields[0]
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
                    sections.push({
                        title: 'Theme & Background',
                        fields: [
                            field('BG Color', color('bgColor', p.bgColor, block.id)).fields[0],
                            field('Text Color', color('textColor', p.textColor, block.id)).fields[0]
                        ]
                    });
                    break;
            }
        }

        if (isContent) {
            switch (block.type) {
                case 'navbar':
                    sections.push({
                        title: 'Branding',
                        fields: [
                            field('Brand Name', text('brand', p.brand, block.id)).fields[0],
                            field('Logo URL', url('logo', p.logo, block.id)).fields[0]
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
                        { key: 'icon', type: 'text', label: 'Icon Class' },
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
                        { key: 'icon', type: 'text', label: 'Icon/Emoji' },
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
                            field('Title', text('title', p.title, block.id)).fields[0]
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
                        { key: 'icon', type: 'text', label: 'Icon Class (e.g. fa-brands fa-twitter)' },
                        { key: 'href', type: 'url', label: 'URL' }
                    ]));
                    sections.push(repeater('Quick Links', 'links', p.links, block.id, [
                        { key: 'label', type: 'text', label: 'Label' },
                        { key: 'href', type: 'text', label: 'URL' }
                    ]));
                    break;
                case 'carousel':
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
        el.addEventListener('input', () => State.updateBlockProps(blockId, { [key]: el.value }));
        return el;
    }
    function number(key, val, blockId) {
        const el = document.createElement('input');
        el.type = 'number'; el.value = val || 0;
        el.addEventListener('input', () => State.updateBlockProps(blockId, { [key]: Number(el.value) }));
        return el;
    }
    function url(key, val, blockId) {
        const el = document.createElement('input');
        el.type = 'url'; el.value = val || '';
        el.placeholder = 'https://…';
        el.addEventListener('input', () => State.updateBlockProps(blockId, { [key]: el.value }));
        return el;
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
                    } else {
                        inp = document.createElement('input');
                        inp.type = def.type === 'url' ? 'url' : 'text';
                        inp.value = item[def.key] || '';
                    }

                    if (def.type !== 'toggle') {
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
