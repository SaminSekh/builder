// ============================================================
// palette.js - Left sidebar component palette
// ============================================================

const Palette = (() => {
    let dragType = null;
    const expandedGroups = new Set();
    let previewEl = null;
    let previewHideTimer = null;
    const TEMPLATE_GROUP_KEY = 'preset-theme-templates';

    const COMPONENT_VARIANTS = {
        navbar: [
            {
                id: 'navbar-1',
                label: 'Navbar 1',
                description: 'Commerce split bar with CTA and cart',
                props: {
                    navStyle: 'classic',
                    brand: 'CanvasBuild',
                    bgColor: '#0f172a',
                    textColor: '#f8fafc',
                    buttonColor: '#6366f1',
                    padding: '14px 36px',
                    sticky: true,
                    showButton: true,
                    showCart: true,
                    showApk: false,
                    links: [
                        { label: 'Product', href: '#product' },
                        { label: 'Solutions', href: '#solutions' },
                        { label: 'Pricing', href: '#pricing' },
                        { label: 'Contact', href: '#contact' }
                    ]
                }
            },
            {
                id: 'navbar-2',
                label: 'Navbar 2',
                description: 'Framed editorial navbar with centered links',
                props: {
                    navStyle: 'editorial',
                    brand: 'Studio North',
                    bgColor: '#f6f1e8',
                    textColor: '#0f172a',
                    buttonColor: '#0f172a',
                    padding: '24px 32px',
                    sticky: false,
                    showCart: false,
                    showButton: false,
                    showApk: false,
                    justify: 'center',
                    gap: '24px',
                    links: [
                        { label: 'Work', href: '#work' },
                        { label: 'Journal', href: '#journal' },
                        { label: 'Team', href: '#team' },
                        { label: 'Book a Call', href: '#contact' }
                    ]
                }
            },
            {
                id: 'navbar-3',
                label: 'Navbar 3',
                description: 'Glass app navbar with utility actions',
                props: {
                    navStyle: 'app',
                    brand: 'Orbit App',
                    bgColor: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
                    textColor: '#ffffff',
                    buttonColor: '#14b8a6',
                    padding: '18px 42px',
                    sticky: true,
                    showButton: true,
                    buttonText: 'Download App',
                    buttonHref: '#download',
                    showCart: false,
                    showApk: true,
                    apkShowDesktop: true,
                    apkShowMobile: true,
                    links: [
                        { label: 'Features', href: '#features' },
                        { label: 'Community', href: '#community' },
                        { label: 'Changelog', href: '#changelog' },
                        { label: 'Support', href: '#support' }
                    ]
                }
            }
        ],
        text: [
            {
                id: 'text-1',
                label: 'Text 1',
                description: 'Full-width intro copy',
                props: {
                    bgColor: '#ffffff',
                    padding: '56px 40px',
                    align: 'left',
                    html: '<h2 style="font-size:3rem;font-weight:800;color:#0f172a;margin-bottom:16px;line-height:1.05;">Build sections like modular page stories.</h2><p style="color:#475569;line-height:1.8;max-width:760px;font-size:1.05rem;">Use this for a wide introduction, section opener, or brand story block that spans the full row before you add media or cards underneath.</p>'
                }
            },
            {
                id: 'text-2',
                label: 'Text 2',
                description: 'Narrow editorial text column',
                props: {
                    bgColor: '#fff7ed',
                    padding: '48px 36px',
                    align: 'left',
                    html: '<span style="display:inline-block;font-size:.8rem;letter-spacing:.18em;text-transform:uppercase;color:#ea580c;font-weight:700;margin-bottom:14px;">Editorial Copy</span><h3 style="font-size:2.2rem;font-weight:700;color:#7c2d12;margin-bottom:14px;line-height:1.15;">A balanced text block for 2-column layouts.</h3><p style="color:#9a3412;line-height:1.8;">Drop this beside an image, video, or another content card when you want a more magazine-like composition.</p>'
                }
            },
            {
                id: 'text-3',
                label: 'Text 3',
                description: 'Compact sidebar content card',
                props: {
                    bgColor: '#0f172a',
                    padding: '32px 28px',
                    align: 'left',
                    html: '<span style="display:inline-block;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:#22d3ee;font-weight:700;margin-bottom:12px;">Sidebar</span><h3 style="font-size:1.5rem;font-weight:700;color:#f8fafc;margin-bottom:12px;">Use this as a supporting note.</h3><p style="color:#cbd5e1;line-height:1.7;">Great for stats, short explanations, CTAs, or stacked notes inside a 3-column composition.</p>'
                }
            },
            {
                id: 'text-4',
                label: 'Text 4',
                description: 'Centered section intro block',
                props: {
                    bgColor: '#f8fafc',
                    padding: '64px 40px',
                    align: 'center',
                    html: '<span style="display:inline-block;font-size:.8rem;letter-spacing:.2em;text-transform:uppercase;color:#4f46e5;font-weight:700;margin-bottom:14px;">Section Intro</span><h2 style="font-size:2.8rem;font-weight:800;color:#0f172a;margin-bottom:14px;line-height:1.08;">Introduce a section with a centered editorial heading.</h2><p style="color:#475569;line-height:1.8;max-width:680px;margin:0 auto;">Use this when you want a strong section opener before cards, products, or media blocks.</p>'
                }
            },
            {
                id: 'text-5',
                label: 'Text 5',
                description: 'Quote or statement panel',
                props: {
                    bgColor: '#fff7ed',
                    padding: '44px 40px',
                    align: 'left',
                    html: '<div style="max-width:820px;"><div style="font-size:3rem;line-height:1;color:#ea580c;margin-bottom:14px;">"</div><p style="font-size:1.5rem;line-height:1.5;color:#7c2d12;font-weight:600;margin-bottom:18px;">A text preset for founder quotes, testimonials, mission statements, or pull-quote style content.</p><div style="font-size:.9rem;letter-spacing:.14em;text-transform:uppercase;color:#c2410c;font-weight:700;">Founder Note</div></div>'
                }
            },
            {
                id: 'text-6',
                label: 'Text 6',
                description: 'Dark boxed article card',
                props: {
                    bgColor: '#020617',
                    padding: '38px 34px',
                    align: 'left',
                    html: '<div style="border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:30px;background:rgba(255,255,255,.04);"><span style="display:inline-block;font-size:.78rem;letter-spacing:.18em;text-transform:uppercase;color:#38bdf8;font-weight:700;margin-bottom:12px;">Article Card</span><h3 style="font-size:1.9rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.12;">Use a boxed writing style when the copy needs more presence.</h3><p style="color:#cbd5e1;line-height:1.8;">This layout works well for stories, long descriptions, newsletter blurbs, or feature highlights inside darker pages.</p></div>'
                }
            }
        ],
        image: [
            {
                id: 'image-1',
                label: 'Image 1',
                description: 'Wide feature image',
                props: {
                    src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop',
                    bgColor: '#f8fafc',
                    maxWidth: '1200px',
                    height: '420px',
                    objectFit: 'cover',
                    borderRadius: '28px',
                    padding: '28px',
                    caption: 'Feature visual',
                    description: 'A full-width image block that works well as a hero follow-up or wide storytelling section.',
                    rating: 5
                }
            },
            {
                id: 'image-2',
                label: 'Image 2',
                description: 'Two-column editorial image',
                props: {
                    src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1400&auto=format&fit=crop',
                    bgColor: '#ffffff',
                    maxWidth: '100%',
                    height: '460px',
                    objectFit: 'cover',
                    borderRadius: '20px',
                    padding: '18px',
                    caption: 'Editorial frame',
                    description: 'Sized to pair with a text block inside a 2-column layout.',
                    rating: 4
                }
            },
            {
                id: 'image-3',
                label: 'Image 3',
                description: 'Three-column gallery tile',
                props: {
                    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
                    bgColor: '#fff7ed',
                    maxWidth: '100%',
                    height: '320px',
                    objectFit: 'cover',
                    borderRadius: '18px',
                    padding: '14px',
                    caption: 'Gallery tile',
                    description: 'A compact square-ish media card for 3-column rows and product grids.',
                    rating: 5
                }
            },
            {
                id: 'image-4',
                label: 'Image 4',
                description: 'Minimal framed editorial image',
                props: {
                    src: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1400&auto=format&fit=crop',
                    bgColor: '#ffffff',
                    maxWidth: '980px',
                    height: '420px',
                    objectFit: 'contain',
                    borderRadius: '0',
                    padding: '28px',
                    caption: 'Editorial frame',
                    description: 'A cleaner image treatment with more whitespace around the media.',
                    rating: 4
                }
            },
            {
                id: 'image-5',
                label: 'Image 5',
                description: 'Polaroid-style image card',
                props: {
                    src: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?q=80&w=1400&auto=format&fit=crop',
                    bgColor: '#fefce8',
                    maxWidth: '760px',
                    height: '440px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    padding: '22px',
                    caption: 'Photo note',
                    description: 'Good for travel, portfolio, or scrapbook-inspired sections with more personality.',
                    rating: 5
                }
            },
            {
                id: 'image-6',
                label: 'Image 6',
                description: 'Dark cinematic image panel',
                props: {
                    src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop',
                    bgColor: '#0f172a',
                    maxWidth: '1200px',
                    height: '500px',
                    objectFit: 'cover',
                    borderRadius: '24px',
                    padding: '18px',
                    caption: 'Cinematic panel',
                    description: 'A moodier image style for hero follow-ups, campaigns, and bold visual sections.',
                    rating: 5
                }
            }
        ],
        video: [
            {
                id: 'video-1',
                label: 'Video 1',
                description: 'Wide featured video',
                props: {
                    url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
                    title: 'Feature Walkthrough',
                    bgColor: '#0f172a',
                    textColor: '#ffffff',
                    accentColor: '#22d3ee',
                    maxWidth: '1200px',
                    padding: '32px',
                    aspectRatio: '56.25%',
                    description: 'Use this as a full-row demo or presentation block.',
                    rating: 5
                }
            },
            {
                id: 'video-2',
                label: 'Video 2',
                description: 'Two-column video card',
                props: {
                    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    title: 'Interview Clip',
                    bgColor: '#ffffff',
                    textColor: '#0f172a',
                    accentColor: '#2563eb',
                    maxWidth: '100%',
                    padding: '22px',
                    aspectRatio: '62%',
                    description: 'A balanced media card for side-by-side layouts.',
                    rating: 4
                }
            },
            {
                id: 'video-3',
                label: 'Video 3',
                description: 'Tall mobile-style reel',
                props: {
                    url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
                    title: 'Short Form Clip',
                    bgColor: '#111827',
                    textColor: '#f8fafc',
                    accentColor: '#f59e0b',
                    maxWidth: '100%',
                    padding: '18px',
                    aspectRatio: '130%',
                    description: 'Good for reel-style previews, testimonials, or social highlights in a 3-column row.',
                    rating: 5
                }
            },
            {
                id: 'video-4',
                label: 'Video 4',
                description: 'Minimal light presentation video',
                props: {
                    url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
                    title: 'Presentation Clip',
                    bgColor: '#ffffff',
                    textColor: '#0f172a',
                    accentColor: '#4f46e5',
                    padding: '26px',
                    maxWidth: '980px',
                    aspectRatio: '56.25%',
                    description: 'A calmer light style for tutorials, explainers, and presentation embeds.',
                    rating: 4
                }
            },
            {
                id: 'video-5',
                label: 'Video 5',
                description: 'Cinema-style dark feature',
                props: {
                    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    title: 'Trailer Cut',
                    bgColor: '#020617',
                    textColor: '#f8fafc',
                    accentColor: '#f97316',
                    padding: '36px',
                    maxWidth: '1200px',
                    aspectRatio: '42%',
                    description: 'A wider cinematic ratio for trailers, launches, and dramatic product videos.',
                    rating: 5
                }
            },
            {
                id: 'video-6',
                label: 'Video 6',
                description: 'Glass-card spotlight video',
                props: {
                    url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
                    title: 'Spotlight Clip',
                    bgColor: 'linear-gradient(135deg, #111827 0%, #312e81 100%)',
                    textColor: '#ffffff',
                    accentColor: '#22d3ee',
                    padding: '30px',
                    maxWidth: '960px',
                    aspectRatio: '62%',
                    description: 'A more premium feature style for key launches or featured interviews.',
                    rating: 5
                }
            }
        ],
        container: [
            {
                id: 'container-1',
                label: 'Container 1',
                description: 'Single-column stack wrapper',
                props: {
                    bgColor: '#f8fafc',
                    padding: '48px 32px',
                    direction: 'column',
                    justify: 'flex-start',
                    align: 'stretch',
                    gap: '24px',
                    minHeight: '180px'
                }
            },
            {
                id: 'container-2',
                label: 'Container 2',
                description: 'Two-column row wrapper',
                props: {
                    bgColor: '#ffffff',
                    padding: '40px 32px',
                    direction: 'row',
                    justify: 'space-between',
                    align: 'stretch',
                    gap: '24px',
                    minHeight: '220px'
                }
            },
            {
                id: 'container-3',
                label: 'Container 3',
                description: 'Three-column grid wrapper',
                props: {
                    bgColor: '#fff7ed',
                    padding: '36px 28px',
                    direction: 'row',
                    justify: 'flex-start',
                    align: 'stretch',
                    gap: '24px',
                    minHeight: '220px'
                }
            },
            {
                id: 'container-4',
                label: 'Container 4',
                description: 'Centered content stage',
                props: {
                    bgColor: '#f8fafc',
                    padding: '56px 36px',
                    direction: 'column',
                    justify: 'center',
                    align: 'center',
                    gap: '20px',
                    minHeight: '260px'
                }
            },
            {
                id: 'container-5',
                label: 'Container 5',
                description: 'Even split row wrapper',
                props: {
                    bgColor: '#ffffff',
                    padding: '42px 32px',
                    direction: 'row',
                    justify: 'space-evenly',
                    align: 'center',
                    gap: '28px',
                    minHeight: '220px'
                }
            },
            {
                id: 'container-6',
                label: 'Container 6',
                description: 'Dark panel workspace',
                props: {
                    bgColor: '#0f172a',
                    padding: '40px 30px',
                    direction: 'column',
                    justify: 'flex-start',
                    align: 'stretch',
                    gap: '18px',
                    minHeight: '240px'
                }
            }
        ],
        box: [
            {
                id: 'box-1',
                label: 'Box 1',
                description: 'Single full-width content box',
                props: {
                    margin: '0',
                    padding: '24px',
                    bgColor: 'rgba(255,255,255,0.85)',
                    borderRadius: '20px',
                    gap: '16px',
                    direction: 'column'
                }
            },
            {
                id: 'box-2',
                label: 'Box 2',
                description: 'Half-width 2-column box',
                props: {
                    margin: '0',
                    padding: '22px',
                    bgColor: 'rgba(255,255,255,0.9)',
                    borderRadius: '18px',
                    gap: '14px',
                    direction: 'column'
                }
            },
            {
                id: 'box-3',
                label: 'Box 3',
                description: 'Third-width 3-column box',
                props: {
                    margin: '0',
                    padding: '20px',
                    bgColor: 'rgba(255,255,255,0.92)',
                    borderRadius: '16px',
                    gap: '12px',
                    direction: 'column'
                }
            },
            {
                id: 'box-4',
                label: 'Box 4',
                description: 'Outlined content frame',
                props: {
                    margin: '0',
                    padding: '26px',
                    bgColor: 'transparent',
                    borderRadius: '22px',
                    gap: '18px',
                    direction: 'column',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(15,23,42,.14)'
                }
            },
            {
                id: 'box-5',
                label: 'Box 5',
                description: 'Glass-like panel box',
                props: {
                    margin: '0',
                    padding: '24px',
                    bgColor: 'rgba(255,255,255,0.12)',
                    borderRadius: '24px',
                    gap: '16px',
                    direction: 'column',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(255,255,255,.18)'
                }
            },
            {
                id: 'box-6',
                label: 'Box 6',
                description: 'Horizontal action row box',
                props: {
                    margin: '0',
                    padding: '18px 22px',
                    bgColor: '#111827',
                    borderRadius: '999px',
                    gap: '14px',
                    direction: 'row',
                    justify: 'space-between',
                    align: 'center'
                }
            }
        ],
        hero: [
            {
                id: 'hero-1',
                label: 'Hero 1',
                description: 'Centered SaaS launch hero',
                props: {
                    bgColor: '#0f172a',
                    textColor: '#ffffff',
                    accentColor: '#6366f1',
                    badge: 'NEW PLATFORM',
                    title: 'Launch your website in a single afternoon.',
                    subtitle: 'A complete visual builder for teams that want speed, control, and polished pages without rebuilding everything from scratch.',
                    minHeight: '82vh',
                    padding: '120px 32px',
                    titleSize: '4rem',
                    subtitleSize: '1.2rem',
                    titleAlign: 'center',
                    subtitleAlign: 'center',
                    ctaAlign: 'center',
                    ctas: [
                        { text: 'Start Free', href: '#pricing', primary: true },
                        { text: 'Watch Demo', href: '#demo', primary: false }
                    ]
                }
            },
            {
                id: 'hero-2',
                label: 'Hero 2',
                description: 'Editorial left-aligned hero',
                props: {
                    bgColor: '#f8fafc',
                    textColor: '#0f172a',
                    accentColor: '#2563eb',
                    badge: 'CREATIVE STUDIO',
                    title: 'Design systems, campaigns, and landing pages with one workflow.',
                    subtitle: 'Built for agencies and brands that need cleaner structure, stronger storytelling, and reusable building blocks across every page.',
                    minHeight: '68vh',
                    padding: '96px 48px 84px',
                    titleSize: '3.6rem',
                    subtitleSize: '1.08rem',
                    titleAlign: 'left',
                    subtitleAlign: 'left',
                    ctaAlign: 'left',
                    ctas: [
                        { text: 'View Services', href: '#services', primary: true },
                        { text: 'See Work', href: '#about', primary: false }
                    ]
                }
            },
            {
                id: 'hero-3',
                label: 'Hero 3',
                description: 'Immersive image campaign hero',
                props: {
                    bgColor: '#111827',
                    bgImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1600',
                    textColor: '#ffffff',
                    accentColor: '#fbbf24',
                    badge: 'LIVE EVENT',
                    title: 'Build a brand experience people remember.',
                    subtitle: 'Use cinematic hero sections, strong calls to action, and bold messaging to turn a simple homepage into a campaign.',
                    minHeight: '90vh',
                    padding: '140px 40px 110px',
                    titleSize: '4.4rem',
                    subtitleSize: '1.15rem',
                    titleAlign: 'left',
                    subtitleAlign: 'left',
                    ctaAlign: 'left',
                    ctas: [
                        { text: 'Reserve Seats', href: '#contact', primary: true },
                        { text: 'Event Details', href: '#roadmap', primary: false }
                    ]
                }
            }
        ],
        footer: [
            {
                id: 'footer-1',
                label: 'Footer 1',
                description: 'Editorial brand footer',
                props: {
                    brand: 'CanvasBuild',
                    tagline: 'A builder for polished launches, client sites, and fast-moving teams.',
                    footerStyle: 'split',
                    bgColor: '#0f172a',
                    textColor: '#cbd5e1',
                    headingColor: '#ffffff',
                    linkColor: '#cbd5e1',
                    accentColor: '#818cf8',
                    cardBg: 'rgba(255,255,255,.07)',
                    borderColor: 'rgba(255,255,255,.12)',
                    padding: '64px 40px 26px',
                    links: [
                        { label: 'Platform', href: '#platform' },
                        { label: 'Templates', href: '#templates' },
                        { label: 'Pricing', href: '#pricing' },
                        { label: 'Support', href: '#support' }
                    ]
                }
            },
            {
                id: 'footer-2',
                label: 'Footer 2',
                description: 'Minimal studio footer',
                props: {
                    brand: 'Studio North',
                    tagline: 'Identity, motion, and web design for brands that want a sharper point of view.',
                    footerStyle: 'centered',
                    bgColor: '#ffffff',
                    textColor: '#64748b',
                    headingColor: '#0f172a',
                    linkColor: '#334155',
                    accentColor: '#4f46e5',
                    cardBg: '#f8fafc',
                    borderColor: '#e2e8f0',
                    showSocials: false,
                    padding: '42px 40px 22px',
                    links: [
                        { label: 'Selected Work', href: '#work' },
                        { label: 'Approach', href: '#about' },
                        { label: 'Journal', href: '#journal' },
                        { label: 'Book Project', href: '#contact' }
                    ]
                }
            },
            {
                id: 'footer-3',
                label: 'Footer 3',
                description: 'Community app footer',
                props: {
                    brand: 'Orbit App',
                    tagline: 'Daily planning, community updates, and mobile access in one calm workspace.',
                    footerStyle: 'split',
                    bgColor: 'linear-gradient(135deg, #1e1b4b 0%, #5b21b6 100%)',
                    textColor: 'rgba(255,255,255,.82)',
                    headingColor: '#ffffff',
                    linkColor: '#ffffff',
                    accentColor: '#14b8a6',
                    cardBg: 'rgba(255,255,255,.12)',
                    borderColor: 'rgba(255,255,255,.22)',
                    padding: '56px 40px 24px',
                    links: [
                        { label: 'Download', href: '#download' },
                        { label: 'Community', href: '#community' },
                        { label: 'Roadmap', href: '#roadmap' },
                        { label: 'Help Center', href: '#support' }
                    ]
                }
            }
        ],
        about: [
            {
                id: 'about-1',
                label: 'About 1',
                description: 'Story section with feature checklist',
                props: {
                    badge: 'OUR STORY',
                    title: 'Built by a small team obsessed with cleaner websites.',
                    text: 'We started with the same frustration most teams face: too much time lost rebuilding layouts, fixing spacing, and wrestling with tools that slow ideas down.',
                    imagePosition: 'right',
                    bgColor: '#ffffff',
                    textColor: '#0f172a',
                    accentColor: '#4f46e5',
                    features: [
                        { icon: 'fa-solid fa-check', text: 'Reusable sections' },
                        { icon: 'fa-solid fa-check', text: 'Fast visual editing' },
                        { icon: 'fa-solid fa-check', text: 'Export-ready layouts' }
                    ]
                }
            },
            {
                id: 'about-2',
                label: 'About 2',
                description: 'Editorial founder note',
                props: {
                    badge: 'FOUNDER LETTER',
                    title: 'We turn rough ideas into calm, premium digital experiences.',
                    text: 'From strategy to launch, every page is shaped to feel intentional. This variant works well for agencies, studios, and personal brands that want a more human tone.',
                    imagePosition: 'left',
                    bgColor: '#fff7ed',
                    textColor: '#7c2d12',
                    accentColor: '#ea580c',
                    badgeAlign: 'left',
                    titleAlign: 'left',
                    textAlign: 'left',
                    features: [
                        { icon: 'fa-solid fa-pen-ruler', text: 'Brand systems' },
                        { icon: 'fa-solid fa-film', text: 'Campaign creative' },
                        { icon: 'fa-solid fa-layer-group', text: 'Page architecture' }
                    ]
                }
            },
            {
                id: 'about-3',
                label: 'About 3',
                description: 'Dark mission statement section',
                props: {
                    badge: 'WHY WE EXIST',
                    title: 'Clearer structure. Better conversion. Less rebuild work.',
                    text: 'This version feels more product-led and direct. It suits software, startups, and teams that want an assertive value statement with supporting proof points.',
                    imagePosition: 'right',
                    bgColor: '#111827',
                    textColor: '#f9fafb',
                    accentColor: '#22d3ee',
                    features: [
                        { icon: 'fa-solid fa-bolt', text: 'Fast launches' },
                        { icon: 'fa-solid fa-chart-line', text: 'Measured growth' },
                        { icon: 'fa-solid fa-users', text: 'Team-friendly editing' }
                    ]
                }
            }
        ],
        services: [
            {
                id: 'services-1',
                label: 'Services 1',
                description: 'Three-column service grid',
                props: {
                    badge: 'SERVICES',
                    title: 'Everything needed to ship a polished site.',
                    subtitle: 'A balanced, card-based layout for agencies, SaaS products, and corporate pages.',
                    titleAlign: 'center',
                    subtitleAlign: 'center',
                    bgColor: '#f8fafc',
                    textColor: '#0f172a',
                    accentColor: '#4f46e5',
                    cardBg: '#ffffff',
                    columns: 3,
                    cardAlign: 'center',
                    items: [
                        { icon: '01', title: 'Brand Direction', desc: 'Sharper layouts, clearer hierarchy, and stronger visual systems.' },
                        { icon: '02', title: 'Web Production', desc: 'Responsive builds that stay editable after launch.' },
                        { icon: '03', title: 'Optimization', desc: 'Performance, conversion, and experience improvements over time.' }
                    ]
                }
            },
            {
                id: 'services-2',
                label: 'Services 2',
                description: 'Feature-heavy dark services block',
                props: {
                    badge: 'PLATFORM CAPABILITIES',
                    title: 'A builder made for bigger project workflows.',
                    subtitle: 'This version feels denser and more product-oriented, with more cards and a darker presentation.',
                    badgeAlign: 'left',
                    titleAlign: 'left',
                    subtitleAlign: 'left',
                    bgColor: '#020617',
                    textColor: '#f8fafc',
                    accentColor: '#22c55e',
                    cardBg: '#0f172a',
                    columns: 4,
                    cardAlign: 'left',
                    items: [
                        { icon: 'A', title: 'Page Mapping', desc: 'Organize sections and site hierarchy before design starts.' },
                        { icon: 'B', title: 'Style Controls', desc: 'Tune spacing, typography, borders, and surfaces visually.' },
                        { icon: 'C', title: 'Drag Editing', desc: 'Move blocks and nested items with less friction.' },
                        { icon: 'D', title: 'Theme Switching', desc: 'Apply broad visual updates across the full project.' }
                    ]
                }
            },
            {
                id: 'services-3',
                label: 'Services 3',
                description: 'Soft editorial service showcase',
                props: {
                    badge: 'SELECTED OFFERINGS',
                    title: 'Choose the kind of support your launch needs.',
                    subtitle: 'A softer, campaign-friendly section that works well for studios and consulting pages.',
                    badgeAlign: 'left',
                    titleAlign: 'left',
                    subtitleAlign: 'left',
                    bgColor: 'linear-gradient(135deg, #eff6ff 0%, #fae8ff 100%)',
                    textColor: '#312e81',
                    accentColor: '#9333ea',
                    cardBg: 'rgba(255,255,255,.82)',
                    columns: 2,
                    cardAlign: 'left',
                    items: [
                        { icon: 'A1', title: 'Campaign Pages', desc: 'Focused launch pages built around one clear action.' },
                        { icon: 'A2', title: 'Content Systems', desc: 'Repeatable sections for case studies, blogs, and announcements.' },
                        { icon: 'A3', title: 'Mobile Polish', desc: 'Tighter spacing and stronger responsive patterns out of the box.' },
                        { icon: 'A4', title: 'Strategic Support', desc: 'Collaborative iteration for teams that want guidance, not just code.' }
                    ]
                }
            }
        ],
        contact: [
            {
                id: 'contact-1',
                label: 'Contact 1',
                description: 'Dark support and sales contact',
                props: {
                    badge: 'TALK TO US',
                    title: 'Start the conversation with our team.',
                    subtitle: 'Use this version for software, services, or support pages that need a strong split layout and direct contact details.',
                    headerAlign: 'center',
                    layoutStyle: 'split',
                    bgColor: '#0f172a',
                    textColor: '#e2e8f0',
                    accentColor: '#6366f1',
                    phone: '+1 (800) 245-0199',
                    email: 'hello@canvasbuild.io',
                    address: '500 Product Lane, Suite 210, Austin'
                }
            },
            {
                id: 'contact-2',
                label: 'Contact 2',
                description: 'Light agency inquiry section',
                props: {
                    badge: 'BOOK A PROJECT',
                    title: 'Tell us what you are building next.',
                    subtitle: 'A cleaner, softer contact section for studios, consultants, and service-led businesses.',
                    headerAlign: 'left',
                    layoutStyle: 'split',
                    formFirst: true,
                    bgColor: '#ffffff',
                    textColor: '#334155',
                    accentColor: '#2563eb',
                    phone: '+44 20 5555 0132',
                    email: 'projects@studionorth.co',
                    address: '18 Mercer Street, London'
                }
            },
            {
                id: 'contact-3',
                label: 'Contact 3',
                description: 'Event or campaign contact section',
                props: {
                    badge: 'RESERVE YOUR SPOT',
                    title: 'Questions about the launch event?',
                    subtitle: 'This version works well for promotions, conferences, and limited-time campaigns that need a warmer, more urgent feel.',
                    headerAlign: 'center',
                    layoutStyle: 'stacked',
                    bgColor: '#431407',
                    textColor: '#ffedd5',
                    accentColor: '#fb923c',
                    phone: '+1 (323) 555-0198',
                    email: 'events@orbitapp.com',
                    address: 'Pier 7 Hall, San Francisco'
                }
            }
        ],
        cta: [
            {
                id: 'cta-1',
                label: 'CTA 1',
                description: 'Centered banner CTA',
                props: {
                    ctaLayout: 'centered',
                    eyebrow: 'QUICK START',
                    title: 'Ready to launch faster?',
                    subtitle: 'Start with a flexible builder and refine every section visually.',
                    buttonText: 'Create My Site',
                    bgColor: '#6366f1',
                    textColor: '#ffffff',
                    accentColor: '#ffffff'
                }
            },
            {
                id: 'cta-2',
                label: 'CTA 2',
                description: 'Left editorial CTA strip',
                props: {
                    ctaLayout: 'split',
                    eyebrow: 'STRATEGY SESSION',
                    title: 'Need a calmer design system?',
                    subtitle: 'Book a short strategy call and map the right structure before you build.',
                    buttonText: 'Book a Call',
                    bgColor: '#f8fafc',
                    textColor: '#0f172a',
                    accentColor: '#0f172a'
                }
            },
            {
                id: 'cta-3',
                label: 'CTA 3',
                description: 'Tight campaign card CTA',
                props: {
                    ctaLayout: 'card',
                    eyebrow: 'LIMITED ACCESS',
                    title: 'The next release goes live this week.',
                    subtitle: 'Join early and get launch access before public rollout.',
                    buttonText: 'Reserve Access',
                    bgColor: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
                    textColor: '#ffffff',
                    accentColor: '#ffffff'
                }
            }
        ],
        carousel: [
            {
                id: 'carousel-1',
                label: 'Carousel 1',
                description: 'Full-width hero slider',
                props: {
                    carouselLayout: 'hero',
                    height: '520px',
                    autoplay: true,
                    showDots: true,
                    showArrows: true
                }
            },
            {
                id: 'carousel-2',
                label: 'Carousel 2',
                description: 'Half-width feature slider',
                props: {
                    carouselLayout: 'editorial',
                    height: '360px',
                    autoplay: false,
                    showDots: true,
                    showArrows: true
                }
            },
            {
                id: 'carousel-3',
                label: 'Carousel 3',
                description: 'Compact gallery slider',
                props: {
                    carouselLayout: 'card',
                    height: '280px',
                    autoplay: false,
                    showDots: false,
                    showArrows: true
                }
            }
        ],
        videoCarousel: [
            {
                id: 'videoCarousel-1',
                label: 'Video Carousel 1',
                description: 'Wide 3-card video row',
                props: {
                    videoCarouselLayout: 'standard',
                    sectionTitle: 'Watch Our Videos',
                    sectionSubtitle: 'Browse our latest video tutorials',
                    bgColor: '#0d1117',
                    textColor: '#ffffff',
                    accentColor: '#f5a623',
                    cardBg: '#161b22',
                    cardsPerView: 3,
                    showDots: true,
                    showArrows: true
                }
            },
            {
                id: 'videoCarousel-2',
                label: 'Video Carousel 2',
                description: 'Editorial 2-card showcase',
                props: {
                    videoCarouselLayout: 'editorial',
                    sectionTitle: 'Featured Sessions',
                    sectionSubtitle: 'A calmer layout for tutorials, interviews, and highlights.',
                    bgColor: '#ffffff',
                    textColor: '#0f172a',
                    accentColor: '#2563eb',
                    cardBg: '#f8fafc',
                    cardBorder: '#dbeafe',
                    cardsPerView: 2,
                    showDots: true,
                    showArrows: true
                }
            },
            {
                id: 'videoCarousel-3',
                label: 'Video Carousel 3',
                description: 'Single featured video rail',
                props: {
                    videoCarouselLayout: 'spotlight',
                    sectionTitle: 'Spotlight Episode',
                    sectionSubtitle: 'A larger single-card carousel for podcast, webinar, or feature content.',
                    bgColor: 'linear-gradient(135deg, #111827 0%, #312e81 100%)',
                    textColor: '#ffffff',
                    accentColor: '#22d3ee',
                    cardBg: 'rgba(255,255,255,.08)',
                    cardBorder: 'rgba(255,255,255,.15)',
                    cardsPerView: 1,
                    showDots: false,
                    showArrows: true
                }
            }
        ],
        promoCarousel: [
            {
                id: 'promoCarousel-1',
                label: 'Promo Slider 1',
                description: 'Wide promo banner slider',
                props: {
                    promoLayout: 'banner',
                    height: '420px',
                    autoplay: true,
                    showArrows: true
                }
            },
            {
                id: 'promoCarousel-2',
                label: 'Promo Slider 2',
                description: 'Half-width campaign slider',
                props: {
                    promoLayout: 'card',
                    height: '320px',
                    autoplay: false,
                    showArrows: true
                }
            },
            {
                id: 'promoCarousel-3',
                label: 'Promo Slider 3',
                description: 'Compact square promo slider',
                props: {
                    promoLayout: 'filmstrip',
                    height: '260px',
                    autoplay: false,
                    showArrows: true
                }
            }
        ],
        testimonials: [
            {
                id: 'testimonials-1',
                label: 'Testimonials 1',
                description: 'Clean client review grid',
                props: {
                    testimonialLayout: 'grid',
                    bgColor: '#f8fafc',
                    textColor: '#0f172a',
                    accentColor: '#4f46e5',
                    sectionAlign: 'center',
                    columns: 3,
                    cardBg: '#ffffff',
                    badge: 'CLIENT NOTES',
                    title: 'Teams use us to launch faster with less friction.',
                    items: [
                        { name: 'Nina Patel', role: 'Growth Lead, Fathom', avatar: 'https://i.pravatar.cc/80?img=12', text: 'We replaced a slow patchwork workflow with one builder our team could actually manage.' },
                        { name: 'Mason Reed', role: 'Creative Director, North House', avatar: 'https://i.pravatar.cc/80?img=15', text: 'The structure is simple enough for clients and still flexible enough for production work.' },
                        { name: 'Jules Carter', role: 'Founder, Relay Labs', avatar: 'https://i.pravatar.cc/80?img=18', text: 'We shipped a full campaign site in days instead of spending weeks rebuilding sections.' }
                    ]
                }
            },
            {
                id: 'testimonials-2',
                label: 'Testimonials 2',
                description: 'Premium dark testimonial wall',
                props: {
                    testimonialLayout: 'spotlight',
                    bgColor: '#111827',
                    textColor: '#ffffff',
                    accentColor: '#f59e0b',
                    sectionAlign: 'left',
                    columns: 2,
                    cardBg: '#1f2937',
                    badge: 'TRUSTED BY TEAMS',
                    title: 'Designed for ambitious launches and polished client delivery.',
                    items: [
                        { name: 'Aria Chen', role: 'Head of Marketing, Signal', avatar: 'https://i.pravatar.cc/80?img=20', text: 'It feels premium enough for our brand team and practical enough for our marketers.' },
                        { name: 'Daniel Ross', role: 'Product Manager, Orbit', avatar: 'https://i.pravatar.cc/80?img=25', text: 'We could restructure whole pages without the usual handoff bottlenecks.' },
                        { name: 'Elena Brooks', role: 'Studio Owner, Formlane', avatar: 'https://i.pravatar.cc/80?img=29', text: 'This is the first builder that did not make our final pages feel generic.' }
                    ]
                }
            },
            {
                id: 'testimonials-3',
                label: 'Testimonials 3',
                description: 'Playful creator-focused reviews',
                props: {
                    testimonialLayout: 'stack',
                    bgColor: '#fff1f2',
                    textColor: '#881337',
                    accentColor: '#ec4899',
                    sectionAlign: 'center',
                    columns: 3,
                    cardBg: '#ffffff',
                    badge: 'CREATOR FEEDBACK',
                    title: 'Friendly enough for solo creators, strong enough for real launches.',
                    items: [
                        { name: 'Lena Moss', role: 'Course Creator', avatar: 'https://i.pravatar.cc/80?img=32', text: 'I could finally move sections around without feeling like I might break the page.' },
                        { name: 'Theo Grant', role: 'Newsletter Writer', avatar: 'https://i.pravatar.cc/80?img=33', text: 'The presets gave me three directions instantly instead of one layout in three colors.' },
                        { name: 'Skye Harper', role: 'Brand Strategist', avatar: 'https://i.pravatar.cc/80?img=34', text: 'Perfect for landing pages that need more personality than typical templates.' }
                    ]
                }
            }
        ],
        pricing: [
            {
                id: 'pricing-1',
                label: 'Pricing 1',
                description: 'Three-tier SaaS pricing',
                props: {
                    pricingLayout: 'cards',
                    badge: 'PRICING',
                    title: 'Choose a plan that fits your launch stage.',
                    subtitle: 'A classic comparison table for products and subscriptions.',
                    sectionAlign: 'center',
                    columns: 3,
                    bgColor: '#ffffff',
                    textColor: '#0f172a',
                    accentColor: '#4f46e5',
                    cardBg: '#f8fafc',
                    plans: [
                        { name: 'Starter', price: '$12', period: 'mo', popular: false, features: '1 Website\nBasic Theme Tools\nEmail Support', cta: 'Start Starter' },
                        { name: 'Pro', price: '$32', period: 'mo', popular: true, features: '5 Websites\nAdvanced Styling\nPriority Support\nTheme Library', cta: 'Go Pro' },
                        { name: 'Scale', price: '$79', period: 'mo', popular: false, features: 'Unlimited Websites\nTeam Seats\nExport Tools\nAdvanced Support', cta: 'Choose Scale' }
                    ]
                }
            },
            {
                id: 'pricing-2',
                label: 'Pricing 2',
                description: 'Premium dark pricing section',
                props: {
                    pricingLayout: 'cards',
                    badge: 'PREMIUM ACCESS',
                    title: 'Built for teams running bigger web systems.',
                    subtitle: 'A more enterprise-leaning plan set with premium emphasis.',
                    sectionAlign: 'left',
                    columns: 3,
                    bgColor: '#0f172a',
                    textColor: '#f8fafc',
                    accentColor: '#22d3ee',
                    cardBg: '#111827',
                    plans: [
                        { name: 'Launch', price: '$49', period: 'mo', popular: false, features: 'Campaign Sites\nShared Themes\nEmail Support', cta: 'Choose Launch' },
                        { name: 'Studio', price: '$129', period: 'mo', popular: true, features: 'Unlimited Projects\nClient Handover\nAdvanced Customization\nFaster Support', cta: 'Choose Studio' },
                        { name: 'Enterprise', price: '$299', period: 'mo', popular: false, features: 'Team Roles\nImplementation Help\nPriority Success\nCustom Workflow', cta: 'Talk to Sales' }
                    ]
                }
            },
            {
                id: 'pricing-3',
                label: 'Pricing 3',
                description: 'Creator membership pricing',
                props: {
                    pricingLayout: 'rows',
                    badge: 'MEMBERSHIP',
                    title: 'Pick the support level that matches your pace.',
                    subtitle: 'A warmer pricing style for creator tools, coaching, or communities.',
                    sectionAlign: 'center',
                    columns: 2,
                    bgColor: '#fff7ed',
                    textColor: '#7c2d12',
                    accentColor: '#ea580c',
                    cardBg: '#ffffff',
                    plans: [
                        { name: 'Solo', price: '$19', period: 'mo', popular: false, features: '1 Brand Kit\nMonthly Templates\nCommunity Access', cta: 'Join Solo' },
                        { name: 'Creator+', price: '$39', period: 'mo', popular: true, features: 'Everything in Solo\nWeekly Drops\nPriority Q&A', cta: 'Join Creator+' },
                        { name: 'Partner', price: '$89', period: 'mo', popular: false, features: 'Team Seats\nPartner Sessions\nPrivate Library', cta: 'Join Partner' }
                    ]
                }
            }
        ],
        stats: [
            {
                id: 'stats-1',
                label: 'Stats 1',
                description: 'Launch metrics strip',
                props: {
                    statsLayout: 'grid',
                    bgColor: '#111827',
                    textColor: '#ffffff',
                    columns: 4,
                    itemAlign: 'center',
                    items: [
                        { number: '24h', label: 'to publish first draft' },
                        { number: '40+', label: 'ready-made sections' },
                        { number: '3x', label: 'faster editing flow' },
                        { number: '99%', label: 'layout consistency' }
                    ]
                }
            },
            {
                id: 'stats-2',
                label: 'Stats 2',
                description: 'Agency credibility strip',
                props: {
                    statsLayout: 'split',
                    title: 'A track record built on delivery.',
                    subtitle: 'Use this version when the numbers should support a stronger headline.',
                    bgColor: '#f8fafc',
                    textColor: '#0f172a',
                    columns: 2,
                    itemAlign: 'left',
                    cardBg: '#ffffff',
                    items: [
                        { number: '120+', label: 'projects shipped' },
                        { number: '18', label: 'countries served' },
                        { number: '92%', label: 'return clients' },
                        { number: '8 yrs', label: 'industry experience' }
                    ]
                }
            },
            {
                id: 'stats-3',
                label: 'Stats 3',
                description: 'Community growth strip',
                props: {
                    statsLayout: 'grid',
                    bgColor: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    textColor: '#ffffff',
                    columns: 4,
                    itemAlign: 'center',
                    cardBg: 'rgba(255,255,255,.08)',
                    items: [
                        { number: '50K+', label: 'monthly users' },
                        { number: '11K', label: 'discord members' },
                        { number: '420+', label: 'community templates' },
                        { number: '4.9/5', label: 'average rating' }
                    ]
                }
            }
        ],
        products: [
            {
                id: 'products-1',
                label: 'Products 1',
                description: 'Modern product catalog',
                props: {
                    productsLayout: 'grid',
                    badge: 'STORE',
                    title: 'Clean essentials for a modern workspace.',
                    subtitle: 'A balanced storefront layout for product-first pages.',
                    sectionAlign: 'center',
                    columns: 3,
                    cardBg: '#ffffff',
                    bgColor: '#ffffff',
                    textColor: '#0f172a',
                    accentColor: '#4f46e5',
                    items: [
                        { images: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600&auto=format&fit=crop', name: 'Motion Sneakers', price: '$149.00', desc: 'Minimal sneakers with premium cushioning and a clean silhouette.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1600&auto=format&fit=crop', name: 'Steel Chronograph', price: '$249.00', desc: 'A sharp stainless steel watch with subtle detailing and a durable build.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600&auto=format&fit=crop', name: 'Studio Headphones', price: '$179.00', desc: 'Comfortable over-ear headphones tuned for long sessions and detailed sound.', cta: 'Add to Cart' }
                    ]
                }
            },
            {
                id: 'products-2',
                label: 'Products 2',
                description: 'Dark premium product showcase',
                props: {
                    productsLayout: 'feature',
                    badge: 'LIMITED DROP',
                    title: 'Designed for collectors and premium launches.',
                    subtitle: 'A more dramatic showcase for premium items and limited releases.',
                    sectionAlign: 'left',
                    columns: 2,
                    cardBg: '#111827',
                    bgColor: '#0f172a',
                    textColor: '#f8fafc',
                    accentColor: '#22c55e',
                    items: [
                        { images: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1600&auto=format&fit=crop', name: 'Performance Jacket', price: '$229.00', desc: 'Weather-ready shell with refined structure and technical detailing.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop', name: 'Travel Duffel', price: '$189.00', desc: 'Structured duffel bag with premium hardware and versatile storage.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1600&auto=format&fit=crop', name: 'Leather Boots', price: '$259.00', desc: 'Bold everyday boots with a rich finish and long-wear comfort.', cta: 'Add to Cart' }
                    ]
                }
            },
            {
                id: 'products-3',
                label: 'Products 3',
                description: 'Lifestyle boutique grid',
                props: {
                    productsLayout: 'list',
                    badge: 'CURATED PICKS',
                    title: 'Warm, playful products for lifestyle brands.',
                    subtitle: 'A softer storefront direction for fashion, beauty, and creator-led shops.',
                    sectionAlign: 'center',
                    columns: 3,
                    cardBg: '#ffffff',
                    bgColor: '#fff1f2',
                    textColor: '#881337',
                    accentColor: '#ec4899',
                    items: [
                        { images: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1600&auto=format&fit=crop', name: 'Soft Cotton Tee', price: '$39.00', desc: 'Relaxed everyday tee with a soft finish and playful color story.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1600&auto=format&fit=crop', name: 'Rose Gold Bag', price: '$129.00', desc: 'Compact shoulder bag with structured curves and polished hardware.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1600&auto=format&fit=crop', name: 'Weekend Set', price: '$84.00', desc: 'A lightweight essentials set for travel, gifting, or a capsule collection.', cta: 'Add to Cart' }
                    ]
                }
            },
            {
                id: 'products-4',
                label: 'Products 4',
                description: 'Large 20-product modern catalog',
                props: {
                    productsLayout: 'grid',
                    badge: 'FULL CATALOG',
                    title: 'Browse a complete 20-product collection.',
                    subtitle: 'A larger starter storefront with enough products to build a real catalog page quickly.',
                    sectionAlign: 'center',
                    columns: 4,
                    cardBg: '#ffffff',
                    bgColor: '#f8fafc',
                    textColor: '#0f172a',
                    accentColor: '#2563eb',
                    items: [
                        { images: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600&auto=format&fit=crop', name: 'Motion Sneakers', price: '$149.00', desc: 'Minimal sneakers with premium cushioning and a clean silhouette.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1600&auto=format&fit=crop', name: 'Steel Chronograph', price: '$249.00', desc: 'A sharp stainless steel watch with subtle detailing.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600&auto=format&fit=crop', name: 'Studio Headphones', price: '$179.00', desc: 'Over-ear headphones tuned for long sessions.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1600&auto=format&fit=crop', name: 'Performance Jacket', price: '$229.00', desc: 'Weather-ready outerwear with a technical finish.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop', name: 'Travel Duffel', price: '$189.00', desc: 'Structured duffel with versatile compartments.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1600&auto=format&fit=crop', name: 'Leather Boots', price: '$259.00', desc: 'Bold everyday boots with long-wear comfort.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1600&auto=format&fit=crop', name: 'Soft Cotton Tee', price: '$39.00', desc: 'Relaxed everyday tee with a soft finish.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1600&auto=format&fit=crop', name: 'Rose Gold Bag', price: '$129.00', desc: 'Compact shoulder bag with polished hardware.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1600&auto=format&fit=crop', name: 'Weekend Set', price: '$84.00', desc: 'A lightweight essentials set for travel and gifting.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop', name: 'City Backpack', price: '$98.00', desc: 'Slim backpack designed for everyday carry.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=1600&auto=format&fit=crop', name: 'Signature Sunglasses', price: '$119.00', desc: 'A clean frame with premium lens clarity.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1600&auto=format&fit=crop', name: 'Runner Pro', price: '$159.00', desc: 'Performance sneakers for active days.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop', name: 'Carry Sleeve', price: '$59.00', desc: 'Padded sleeve for tablets and laptops.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1600&auto=format&fit=crop', name: 'Layered Hoodie', price: '$72.00', desc: 'Midweight hoodie for casual layering.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1600&auto=format&fit=crop', name: 'Classic Tote', price: '$68.00', desc: 'Soft structured tote for daily essentials.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1600&auto=format&fit=crop', name: 'Trail Runner', price: '$134.00', desc: 'Grip-focused shoes built for movement.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=1600&auto=format&fit=crop', name: 'Minimal Desk Lamp', price: '$89.00', desc: 'A clean lighting piece for modern desks.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1600&auto=format&fit=crop', name: 'Everyday Cap', price: '$29.00', desc: 'Structured cap with subtle branding.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?q=80&w=1600&auto=format&fit=crop', name: 'Travel Flask', price: '$34.00', desc: 'Insulated flask for hot and cold drinks.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1526170315870-ef68a6f3dd39?q=80&w=1600&auto=format&fit=crop', name: 'Retro Camera', price: '$299.00', desc: 'Capture timeless memories in style.', cta: 'Add to Cart' }
                    ]
                }
            },
            {
                id: 'products-5',
                label: 'Products 5',
                description: 'Large 20-product dark storefront',
                props: {
                    productsLayout: 'feature',
                    badge: 'PREMIUM STORE',
                    title: 'A premium 20-product storefront for bigger shops.',
                    subtitle: 'Use this darker layout when you want a stronger launch or premium product feeling.',
                    sectionAlign: 'left',
                    columns: 4,
                    cardBg: '#111827',
                    bgColor: '#020617',
                    textColor: '#f8fafc',
                    accentColor: '#22c55e',
                    items: [
                        { images: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1600&auto=format&fit=crop', name: 'Storm Jacket', price: '$229.00', desc: 'Performance outerwear with a premium technical build.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop', name: 'Weekender Duffel', price: '$189.00', desc: 'Travel-ready bag with bold premium detailing.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1600&auto=format&fit=crop', name: 'Field Boots', price: '$259.00', desc: 'Rich leather boots with a structured profile.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600&auto=format&fit=crop', name: 'Audio One', price: '$179.00', desc: 'Studio-grade headphones with immersive sound.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600&auto=format&fit=crop', name: 'Velocity Sneaker', price: '$149.00', desc: 'Modern sneakers with a standout silhouette.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1600&auto=format&fit=crop', name: 'Midnight Watch', price: '$249.00', desc: 'A dark-finish chronograph with subtle shine.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=1600&auto=format&fit=crop', name: 'Carbon Shades', price: '$129.00', desc: 'Sharp sunglasses for a bold modern look.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop', name: 'Transit Pack', price: '$98.00', desc: 'Compact city pack for everyday travel.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1600&auto=format&fit=crop', name: 'Core Hoodie', price: '$72.00', desc: 'Premium hoodie with an elevated everyday fit.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1600&auto=format&fit=crop', name: 'Road Runner', price: '$159.00', desc: 'High-comfort sneakers for daily movement.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=1600&auto=format&fit=crop', name: 'Desk Light Pro', price: '$89.00', desc: 'Task lighting with a clean premium finish.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1600&auto=format&fit=crop', name: 'Black Cap', price: '$29.00', desc: 'Minimal cap with crisp structure.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?q=80&w=1600&auto=format&fit=crop', name: 'Thermal Flask', price: '$34.00', desc: 'Insulated flask for travel and office use.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1526170315870-ef68a6f3dd39?q=80&w=1600&auto=format&fit=crop', name: 'Collector Camera', price: '$299.00', desc: 'A collector-grade camera with vintage appeal.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1600&auto=format&fit=crop', name: 'Structured Tote', price: '$74.00', desc: 'Premium tote with room for daily essentials.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1600&auto=format&fit=crop', name: 'Terrain Runner', price: '$139.00', desc: 'All-day comfort with trail-inspired grip.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1600&auto=format&fit=crop', name: 'Essential Tee', price: '$39.00', desc: 'Soft cotton tee with a premium finish.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1600&auto=format&fit=crop', name: 'Orbit Shoulder Bag', price: '$129.00', desc: 'A polished compact bag for travel and city wear.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1600&auto=format&fit=crop', name: 'Weekend Utility Set', price: '$84.00', desc: 'A bundled essentials pack for short trips.', cta: 'Add to Cart' },
                        { images: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop', name: 'Tech Sleeve', price: '$59.00', desc: 'Protective carry sleeve for your daily setup.', cta: 'Add to Cart' }
                    ]
                }
            }
        ],
        roadmap: [
            {
                id: 'roadmap-1',
                label: 'Roadmap 1',
                description: 'Product milestone timeline',
                props: {
                    title: 'Product Rollout Roadmap',
                    subtitle: 'A launch-focused timeline for product teams and roadmap communication.',
                    sectionAlign: 'center',
                    layoutStyle: 'timeline',
                    bgColor: '#0f172a',
                    textColor: '#ffffff',
                    accentColor: '#6366f1',
                    items: [
                        { date: 'Phase 1 - Discovery', title: 'Research & Positioning', desc: 'Validate the audience, shape the message, and map the first conversion path.', status: 'completed', icon: 'fa-solid fa-magnifying-glass', link: '' },
                        { date: 'Phase 2 - Build', title: 'Core Experience', desc: 'Create the main pages, structure, and reusable visual language.', status: 'current', icon: 'fa-solid fa-hammer', link: '' },
                        { date: 'Phase 3 - Launch', title: 'Campaign Rollout', desc: 'Push launch assets, paid traffic pages, and announcement updates live.', status: 'upcoming', icon: 'fa-solid fa-bullhorn', link: '' }
                    ]
                }
            },
            {
                id: 'roadmap-2',
                label: 'Roadmap 2',
                description: 'Client project plan timeline',
                props: {
                    title: 'Project Delivery Plan',
                    subtitle: 'A cleaner timeline for agencies, studios, and service projects.',
                    sectionAlign: 'left',
                    layoutStyle: 'grid',
                    bgColor: '#ffffff',
                    textColor: '#0f172a',
                    accentColor: '#2563eb',
                    items: [
                        { date: 'Week 1', title: 'Workshop & Scope', desc: 'Gather goals, references, and page priorities with the client team.', status: 'completed', icon: 'fa-solid fa-comments', link: '' },
                        { date: 'Week 2', title: 'Wireframe Direction', desc: 'Map layout direction and content hierarchy across primary sections.', status: 'current', icon: 'fa-solid fa-vector-square', link: '' },
                        { date: 'Week 3', title: 'Visual Build', desc: 'Translate the approved structure into the live website builder.', status: 'upcoming', icon: 'fa-solid fa-wand-magic-sparkles', link: '' },
                        { date: 'Week 4', title: 'QA & Handover', desc: 'Polish, test, and hand over an editable site with clear controls.', status: 'upcoming', icon: 'fa-solid fa-flag-checkered', link: '' }
                    ]
                }
            },
            {
                id: 'roadmap-3',
                label: 'Roadmap 3',
                description: 'Community event timeline',
                props: {
                    title: 'Community Launch Sequence',
                    subtitle: 'A warmer timeline style for events, memberships, and creator launches.',
                    sectionAlign: 'center',
                    layoutStyle: 'grid',
                    bgColor: '#431407',
                    textColor: '#ffedd5',
                    accentColor: '#fb923c',
                    items: [
                        { date: 'Day 1', title: 'Teaser Drop', desc: 'Announce the new release and open a waitlist for early supporters.', status: 'completed', icon: 'fa-solid fa-sparkles', link: '' },
                        { date: 'Day 3', title: 'Preview Access', desc: 'Give early supporters a first look at the product and key sessions.', status: 'current', icon: 'fa-solid fa-door-open', link: '' },
                        { date: 'Day 5', title: 'Public Launch', desc: 'Open registration, publish the landing page, and activate social traffic.', status: 'upcoming', icon: 'fa-solid fa-rocket', link: '' }
                    ]
                }
            },
            {
                id: 'roadmap-4',
                label: 'Roadmap 4',
                description: 'Alternating luxury bonus timeline',
                props: {
                    badge: '',
                    title: 'VIP Reward Timeline',
                    subtitle: '',
                    sectionAlign: 'center',
                    layoutStyle: 'showcase',
                    bgColor: '#120b07',
                    bgImage: 'https://images.unsplash.com/photo-1610375461369-d613b56458d2?q=80&w=1600&auto=format&fit=crop',
                    textColor: '#fff7ed',
                    accentColor: '#f59e0b',
                    padding: '90px 32px',
                    items: [
                        { date: 'Step 1', title: 'ভিআইপি ১ বাড়তি সুবিধাসমূহ', desc: '১. ১৫০০ ডিপোজিট ও টার্নওভার করলে ভিআইপি ২ আপডেট হবে ও ২৮ টাকা বোনাস পাবেন।', status: 'completed', icon: 'fa-solid fa-gift', link: '' },
                        { date: 'Step 2', title: 'ভিআইপি ২ বাড়তি সুবিধাসমূহ', desc: '১. ২৫০০ ডিপোজিট ও টার্নওভার করলে ভিআইপি ৩ আপডেট হবে ও ২৮ টাকা বোনাস পাবেন।\n২. ২৪ ঘন্টা ডিপোজিট ও উত্তোলনের সেবা পাবেন', status: 'current', icon: 'fa-solid fa-gift', link: '' },
                        { date: 'Step 3', title: 'ভিআইপি ৩ বাড়তি সুবিধাসমূহ', desc: '১. জন্মদিন তারিখে বোনাস পাবেন ৬৮ টাকা।\n২. ৩৫০০ ডিপোজিট ও টার্নওভার করলে ভিআইপি ৪ আপডেট হবে ও ২৮ টাকা বোনাস পাবেন।\n৩. ২৪ ঘন্টা ডিপোজিট ও উত্তোলনের সেবা পাবেন', status: 'upcoming', icon: 'fa-solid fa-cake-candles', link: '' },
                        { date: 'Step 4', title: 'ভিআইপি ৪ বাড়তি সুবিধাসমূহ', desc: '১. জন্মদিন তারিখে বোনাস পাবেন ৬৮ টাকা।\n২. ৫০০০ ডিপোজিট ও টার্নওভার করলে ভিআইপি ৫ আপডেট হবে ও ৩৮ টাকা বোনাস পাবেন।\n৩. ২৪ ঘন্টা ডিপোজিট ও উত্তোলনের সেবা পাবেন', status: 'upcoming', icon: 'fa-solid fa-crown', link: '' }
                    ]
                }
            }
        ],
        accordion: [
            {
                id: 'accordion-1',
                label: 'Expand 1',
                description: 'Minimal dark affiliate guide list',
                props: {
                    badge: 'Affiliate Guide',
                    title: 'Affiliate Guide',
                    subtitle: '',
                    bgColor: '#000000',
                    textColor: '#ffffff',
                    accentColor: '#f4b400',
                    cardBg: '#050505',
                    borderColor: 'rgba(255,255,255,0.18)',
                    items: [
                        { title: 'WELCOME BONUS 🔥', open: false, contentHtml: '<p style="color:#d1d5db;line-height:1.8;">Add your welcome bonus details here.</p>' },
                        { title: 'DAILY FREE BONUS 🔥', open: false, contentHtml: '<p style="color:#d1d5db;line-height:1.8;">Add daily free bonus content here.</p>' },
                        { title: 'FIRST DEPOSIT BONUS 🔥', open: false, contentHtml: '<p style="color:#d1d5db;line-height:1.8;">Add deposit bonus content here.</p>' },
                        { title: 'UNLIMITED RELOAD 🔥', open: false, contentHtml: '<p style="color:#d1d5db;line-height:1.8;">Add reload bonus details here.</p>' }
                    ]
                }
            },
            {
                id: 'accordion-2',
                label: 'Expand 2',
                description: 'Expanded promo panel with image and table',
                props: {
                    badge: 'Affiliate Guide',
                    title: 'Affiliate Guide',
                    subtitle: '',
                    bgColor: '#000000',
                    textColor: '#ffffff',
                    accentColor: '#d4a62a',
                    cardBg: '#0b0b0b',
                    borderColor: 'rgba(255,255,255,0.16)',
                    items: [
                        {
                            title: 'WELCOME BONUS 🔥',
                            open: true,
                            contentHtml: '<div style="display:grid;grid-template-columns:1.1fr .95fr;gap:18px;align-items:start;"><img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop" alt="Bonus" style="width:100%;border-radius:16px;display:block;" /><div><div style="font-size:1.8rem;font-weight:900;color:#f4b400;margin-bottom:10px;">WELCOME BONUS</div><div style="font-size:3rem;font-weight:900;color:#fff;margin-bottom:18px;line-height:1;">100%</div><table style="width:100%;border-collapse:collapse;color:#fff;background:rgba(212,166,42,.08);border-radius:14px;overflow:hidden;"><tr style="background:rgba(212,166,42,.22);"><th style="padding:12px;text-align:left;">Size</th><th style="padding:12px;text-align:left;">Design For</th><th style="padding:12px;text-align:left;">Category</th></tr><tr><td style="padding:12px;border-top:1px solid rgba(255,255,255,.08);">1080 x 1080</td><td style="padding:12px;border-top:1px solid rgba(255,255,255,.08);">Facebook / Instagram</td><td style="padding:12px;border-top:1px solid rgba(255,255,255,.08);">Profile Picture</td></tr><tr><td style="padding:12px;border-top:1px solid rgba(255,255,255,.08);">1920 x 600</td><td style="padding:12px;border-top:1px solid rgba(255,255,255,.08);">TikTok / YouTube</td><td style="padding:12px;border-top:1px solid rgba(255,255,255,.08);">Banner</td></tr></table></div></div>'
                        },
                        { title: 'DAILY FREE BONUS 🔥', open: false, contentHtml: '<p style="color:#d1d5db;line-height:1.8;">Add more banners, tables, and download buttons inside each expanded item.</p>' },
                        { title: 'FIRST DEPOSIT BONUS 🔥', open: false, contentHtml: '<p style="color:#d1d5db;line-height:1.8;">This layout is good for promo guides and asset libraries.</p>' }
                    ]
                }
            },
            {
                id: 'accordion-3',
                label: 'Expand 3',
                description: 'Resource accordion with cleaner card content',
                props: {
                    badge: 'Resource Hub',
                    title: 'Media Resource Guide',
                    subtitle: 'A cleaner expandable layout for tutorials, support documents, media kits, and quick downloads.',
                    bgColor: '#0b1220',
                    textColor: '#f8fafc',
                    accentColor: '#38bdf8',
                    cardBg: '#101a2c',
                    borderColor: 'rgba(148,163,184,0.22)',
                    items: [
                        { title: 'How to start', open: true, contentHtml: '<div style="padding:22px;border:1px solid rgba(148,163,184,.16);border-radius:18px;background:rgba(255,255,255,.02);"><p style="color:#cbd5e1;line-height:1.8;">Use this panel for onboarding instructions, policy notes, or support content.</p></div>' },
                        { title: 'Banner sizes and formats', open: false, contentHtml: '<table style="width:100%;border-collapse:collapse;color:#0f172a;"><tr><th style="text-align:left;padding:10px;border-bottom:1px solid #dbe4f0;">Format</th><th style="text-align:left;padding:10px;border-bottom:1px solid #dbe4f0;">Use</th></tr><tr><td style="padding:10px;border-bottom:1px solid #e5edf6;">1080 x 1080</td><td style="padding:10px;border-bottom:1px solid #e5edf6;">Social post</td></tr><tr><td style="padding:10px;">1920 x 600</td><td style="padding:10px;">Header banner</td></tr></table>' },
                        { title: 'Image and media guide', open: false, contentHtml: '<img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop" alt="Guide" style="width:100%;border-radius:14px;display:block;margin-bottom:14px;" /><p style="color:#475569;line-height:1.8;">You can mix screenshots, illustrations, and custom text inside each expanded row.</p>' }
                    ]
                }
            }
        ],
        table: [
            {
                id: 'table-1',
                label: 'Table 1',
                description: 'Clean comparison table with soft light styling',
                props: {
                    badge: 'Packages',
                    title: 'Choose the right package',
                    subtitle: 'A clean comparison layout for plans, services, or feature bundles.',
                    bgColor: '#f8fafc',
                    textColor: '#0f172a',
                    accentColor: '#6c63ff',
                    cardBg: '#ffffff',
                    borderColor: '#dbe4f0',
                    columnCount: '4',
                    header1: 'Package',
                    header2: 'Price',
                    header3: 'Best For',
                    header4: 'Action',
                    rows: [
                        { col1: 'Starter', col2: '$29', col3: 'Solo founders', col4: 'Get Started' },
                        { col1: 'Studio', col2: '$79', col3: 'Growing brands', col4: 'Choose Studio' },
                        { col1: 'Agency', col2: '$149', col3: 'Teams and agencies', col4: 'Book Demo' }
                    ]
                }
            },
            {
                id: 'table-2',
                label: 'Table 2',
                description: 'Dark promo table for bonuses or media assets',
                props: {
                    badge: 'Affiliate Assets',
                    title: 'Bonus banner download table',
                    subtitle: 'A darker table style that works well for promo guides, asset libraries, and download lists.',
                    bgColor: '#050505',
                    textColor: '#ffffff',
                    accentColor: '#d4a62a',
                    cardBg: '#0f0f10',
                    borderColor: 'rgba(255,255,255,0.12)',
                    columnCount: '4',
                    header1: 'Size',
                    header2: 'Design For',
                    header3: 'Category',
                    header4: 'Download',
                    rows: [
                        { col1: '1080 x 1080', col2: 'Facebook / Instagram', col3: 'Profile Picture', col4: 'Download' },
                        { col1: '1920 x 600', col2: 'TikTok / YouTube', col3: 'Header Banner', col4: 'Download' },
                        { col1: '1200 x 628', col2: 'Ads / Campaigns', col3: 'Promo Banner', col4: 'Download' }
                    ]
                }
            },
            {
                id: 'table-3',
                label: 'Table 3',
                description: 'Resource or schedule table with editorial feel',
                props: {
                    badge: 'Course Roadmap',
                    title: 'Weekly lesson schedule',
                    subtitle: 'A neat format for tutorials, course modules, event schedules, or support documentation.',
                    bgColor: '#fffaf4',
                    textColor: '#3b1d0a',
                    accentColor: '#ef7d32',
                    cardBg: '#ffffff',
                    borderColor: '#f1d7c3',
                    columnCount: '4',
                    header1: 'Week',
                    header2: 'Topic',
                    header3: 'Format',
                    header4: 'Access',
                    rows: [
                        { col1: 'Week 1', col2: 'Setup and overview', col3: 'Video + notes', col4: 'Open lesson' },
                        { col1: 'Week 2', col2: 'Builder workflow', col3: 'Workshop', col4: 'Open lesson' },
                        { col1: 'Week 3', col2: 'Export and publish', col3: 'Checklist', col4: 'Open lesson' }
                    ]
                }
            }
        ],
        word: [
            {
                id: 'word-1',
                label: 'MS Word Content',
                description: 'Paste rich Word content and keep the copied formatting',
                props: {
                    title: 'MS Word Content',
                    subtitle: 'Paste formatted content from Microsoft Word into this section and show it directly on the page.',
                    bgColor: '#f8fafc',
                    textColor: '#0f172a',
                    cardBg: '#ffffff',
                    borderColor: '#dbe4f0',
                    padding: '72px 24px',
                    sectionAlign: 'left',
                    contentHtml: '<h2 style="margin:0 0 14px;">Document heading</h2><p style="margin:0 0 14px;line-height:1.8;">This section is made for Word-style pasted content. Open the content tab and paste directly into the editor box.</p><p style="margin:0;line-height:1.8;"><strong>Tip:</strong> tables, bold text, lists, colors, and many inline Word styles will stay visible here.</p>'
                }
            }
        ],
        motionPopup: [
            {
                id: 'motion-popup-1',
                label: 'Popup 1',
                description: 'Welcome popup after 3 seconds',
                props: {
                    title: 'Popup Manager',
                    subtitle: 'Controls a welcome popup for new visitors.',
                    bgColor: 'transparent',
                    textColor: '#0f172a',
                    accentColor: '#6c63ff',
                    cardBg: '#ffffff',
                    borderColor: '#dbe4f0',
                    popupEnabled: true,
                    popupDelay: '3000',
                    popupTitle: 'Welcome bonus',
                    popupText: 'Show this popup a few seconds after the visitor arrives to highlight a bonus, launch, or offer.',
                    popupButtonText: 'Claim Offer',
                    popupButtonHref: '#',
                    popupWidth: '460px',
                    popupPadding: '28px',
                    popupRadius: '24px'
                }
            },
            {
                id: 'motion-popup-2',
                label: 'Popup 2',
                description: 'Newsletter-style popup with larger modal size',
                props: {
                    title: 'Popup Manager',
                    subtitle: 'Controls a newsletter or signup popup.',
                    bgColor: 'transparent',
                    textColor: '#0f172a',
                    accentColor: '#ef7d32',
                    cardBg: '#ffffff',
                    borderColor: '#f1d7c3',
                    popupEnabled: true,
                    popupDelay: '3000',
                    popupTitle: 'Get weekly updates',
                    popupText: 'Use this popup for signups, updates, or lead capture moments after the page loads.',
                    popupButtonText: 'Subscribe',
                    popupButtonHref: '#',
                    popupWidth: '540px',
                    popupPadding: '32px',
                    popupRadius: '28px'
                }
            }
        ]
    };

    const SITE_TEMPLATES = [
        {
            id: 'site-portfolio',
            label: 'Portfolio Template',
            description: 'Clean personal portfolio with intro, work highlights, testimonials, and contact.',
            icon: 'fa-solid fa-briefcase',
            themeId: 'pure-light',
            meta: {
                title: 'Portfolio Template',
                description: 'Starter portfolio website template.'
            },
            sections: [
                { type: 'navbar', variantId: 'navbar-2', props: { brand: 'Avery Studio' } },
                { type: 'hero', variantId: 'hero-2', props: { title: 'Designing polished brands and digital experiences.', subtitle: 'A refined portfolio starter for freelancers, studios, and personal brands.', buttonText: 'View Projects', buttonHref: '#projects' } },
                { type: 'about', variantId: 'about-2', props: { title: 'About the studio', subtitle: 'A calm editorial section to explain your process, values, and creative approach.' } },
                { type: 'services', variantId: 'services-2', props: { title: 'Selected Services', subtitle: 'Package your capabilities in a premium grid before showing featured work.' } },
                { type: 'testimonials', variantId: 'testimonials-1', props: { title: 'Client Feedback', subtitle: 'Use proof and social trust to support your portfolio story.' } },
                { type: 'contact', variantId: 'contact-2', props: { title: 'Start a Project', subtitle: 'Invite potential clients to get in touch for collaborations and new work.' } },
                { type: 'footer', variantId: 'footer-2', props: { brand: 'Avery Studio', tagline: 'Brand identity, web design, and digital storytelling.' } }
            ]
        },
        {
            id: 'site-agency',
            label: 'Agency Template',
            description: 'Modern agency website with services, proof, process, and conversion-focused CTA.',
            icon: 'fa-solid fa-building',
            themeId: 'ocean-navy',
            meta: {
                title: 'Agency Template',
                description: 'Starter agency website template.'
            },
            sections: [
                { type: 'navbar', variantId: 'navbar-1', props: { brand: 'Northlane Agency', buttonText: 'Book Strategy Call', buttonHref: '#contact' } },
                { type: 'hero', variantId: 'hero-1', props: { title: 'Growth campaigns, conversion design, and websites built to perform.', subtitle: 'A high-clarity agency starter for teams offering design, marketing, and development services.', buttonText: 'See Services', buttonHref: '#services' } },
                { type: 'services', variantId: 'services-1', props: { title: 'What we do', subtitle: 'Use this section to package the main outcomes your agency delivers.' } },
                { type: 'stats', variantId: 'stats-1', props: { title: 'Results that create trust', subtitle: 'Bring performance metrics forward before case studies and testimonials.' } },
                { type: 'testimonials', variantId: 'testimonials-1', props: { title: 'Client Stories', subtitle: 'Social proof that supports your positioning and offer.' } },
                { type: 'contact', variantId: 'contact-1', props: { title: 'Let’s talk about growth', subtitle: 'A simple conversion section for discovery calls and lead generation.' } },
                { type: 'footer', variantId: 'footer-1', props: { brand: 'Northlane Agency', tagline: 'Strategy, design, and digital growth systems for ambitious brands.' } }
            ]
        },
        {
            id: 'site-course',
            label: 'Online Course Template',
            description: 'Educational template for cohort learning, modules, roadmap, and pricing.',
            icon: 'fa-solid fa-graduation-cap',
            themeId: 'arctic-flow',
            meta: {
                title: 'Online Course Template',
                description: 'Starter online course website template.'
            },
            sections: [
                { type: 'navbar', variantId: 'navbar-1', props: { brand: 'CoursePilot', buttonText: 'Enroll Now', buttonHref: '#pricing' } },
                { type: 'hero', variantId: 'hero-2', props: { title: 'Turn your expertise into a structured, sellable learning experience.', subtitle: 'A polished starter for online courses, workshops, and digital education brands.', buttonText: 'View Curriculum', buttonHref: '#roadmap' } },
                { type: 'about', variantId: 'about-1', props: { title: 'What students will achieve', subtitle: 'Introduce the transformation and value of your training program.' } },
                { type: 'roadmap', variantId: 'roadmap-1', props: { title: 'Course Journey', subtitle: 'Break the learning process into clear phases and milestones.' } },
                { type: 'pricing', variantId: 'pricing-2', props: { title: 'Enrollment Options', subtitle: 'Offer one-time, bundle, or premium access packages.' } },
                { type: 'testimonials', variantId: 'testimonials-3', props: { title: 'Student Outcomes', subtitle: 'Share proof from learners who finished and got results.' } },
                { type: 'footer', variantId: 'footer-2', props: { brand: 'CoursePilot', tagline: 'Structured online learning for practical real-world outcomes.' } }
            ]
        },
        {
            id: 'site-vlog',
            label: 'Vlog Template',
            description: 'Creator-focused site for channel promotion, featured videos, stories, and updates.',
            icon: 'fa-solid fa-camera-retro',
            themeId: 'rose-gold',
            meta: {
                title: 'Vlog Template',
                description: 'Starter vlog and creator website template.'
            },
            sections: [
                { type: 'navbar', variantId: 'navbar-3', props: { brand: 'Luna Vlog', buttonText: 'Subscribe', buttonHref: '#videos' } },
                { type: 'hero', variantId: 'hero-3', props: { title: 'Weekly stories, travel diaries, and creator updates.', subtitle: 'A vibrant starter homepage for vloggers, streamers, and personal content brands.', buttonText: 'Watch Latest', buttonHref: '#videos' } },
                { type: 'carousel', variantId: 'carousel-2', props: { title: 'Recent Adventures', subtitle: 'Promote recent highlights with a bold visual slider.' } },
                { type: 'videoCarousel', variantId: 'videoCarousel-2', props: { title: 'Featured Videos', subtitle: 'Showcase your best episodes, interviews, or travel stories.' } },
                { type: 'stats', variantId: 'stats-2', props: { title: 'Growing Community', subtitle: 'Highlight your reach across subscribers, watch time, and fan support.' } },
                { type: 'testimonials', variantId: 'testimonials-2', props: { title: 'What viewers say', subtitle: 'Turn comments and fan love into social proof.' } },
                { type: 'footer', variantId: 'footer-3', props: { brand: 'Luna Vlog', tagline: 'New stories every week across travel, lifestyle, and behind-the-scenes moments.' } }
            ]
        },
        {
            id: 'site-podcast',
            label: 'Podcast Template',
            description: 'Audio-first show website with featured episodes, host intro, testimonials, and signup.',
            icon: 'fa-solid fa-podcast',
            themeId: 'midnight-spectrum',
            meta: {
                title: 'Podcast Template',
                description: 'Starter podcast website template.'
            },
            sections: [
                { type: 'navbar', variantId: 'navbar-3', props: { brand: 'Signal Talks', buttonText: 'Listen Now', buttonHref: '#episodes' } },
                { type: 'hero', variantId: 'hero-3', props: { title: 'Conversations with builders, creators, and operators shaping what’s next.', subtitle: 'A strong homepage starter for podcasts, interview shows, and media brands.', buttonText: 'Browse Episodes', buttonHref: '#episodes' } },
                { type: 'videoCarousel', variantId: 'videoCarousel-3', props: { title: 'Featured Episodes', subtitle: 'Promote your best interviews, deep dives, or recent releases.' } },
                { type: 'about', variantId: 'about-3', props: { title: 'Meet the host', subtitle: 'Introduce your voice, format, and what listeners can expect every week.' } },
                { type: 'testimonials', variantId: 'testimonials-2', props: { title: 'Listener Reviews', subtitle: 'Build trust with audience praise and standout comments.' } },
                { type: 'cta', variantId: 'cta-3', props: { title: 'Never miss an episode', subtitle: 'Drive subscriptions, newsletter signups, and audience retention.', buttonText: 'Join the Newsletter', buttonHref: '#subscribe' } },
                { type: 'footer', variantId: 'footer-3', props: { brand: 'Signal Talks', tagline: 'Sharp conversations, weekly insights, and long-form stories worth hearing.' } }
            ]
        },
        {
            id: 'site-restaurant',
            label: 'Restaurant Template',
            description: 'Hospitality template with hero, menu highlights, reviews, and reservation CTA.',
            icon: 'fa-solid fa-utensils',
            themeId: 'sandstone',
            meta: {
                title: 'Restaurant Template',
                description: 'Starter restaurant website template.'
            },
            sections: [
                { type: 'navbar', variantId: 'navbar-2', props: { brand: 'Olive Table' } },
                { type: 'hero', variantId: 'hero-2', props: { title: 'Seasonal dishes, warm atmosphere, and memorable evenings.', subtitle: 'A restaurant starter for cafes, bistros, and modern dining spaces.', buttonText: 'Reserve a Table', buttonHref: '#contact' } },
                { type: 'image', variantId: 'image-2' },
                { type: 'products', variantId: 'products-1', props: { title: 'Chef’s Selection', subtitle: 'Turn featured dishes into a visual menu highlight section.' } },
                { type: 'testimonials', variantId: 'testimonials-1', props: { title: 'Guest Favorites', subtitle: 'Show what customers love most about the experience.' } },
                { type: 'contact', variantId: 'contact-2', props: { title: 'Book your evening', subtitle: 'Use this section for reservations, address, and operating hours.' } },
                { type: 'footer', variantId: 'footer-2', props: { brand: 'Olive Table', tagline: 'Seasonal plates, intimate dining, and a menu built around fresh ingredients.' } }
            ]
        },
        {
            id: 'site-shop',
            label: 'Ecommerce Template',
            description: 'Product-focused storefront with featured items, reviews, and conversion sections.',
            icon: 'fa-solid fa-bag-shopping',
            themeId: 'citrus-pop',
            meta: {
                title: 'Ecommerce Template',
                description: 'Starter ecommerce website template.'
            },
            sections: [
                { type: 'navbar', variantId: 'navbar-1', props: { brand: 'Nova Goods', buttonText: 'Shop Now', buttonHref: '#products' } },
                { type: 'hero', variantId: 'hero-1', props: { title: 'Thoughtful products for everyday upgrades.', subtitle: 'A storefront starter for lifestyle brands, curated products, and direct-to-consumer shops.', buttonText: 'Explore Collection', buttonHref: '#products' } },
                { type: 'products', variantId: 'products-3', props: { title: 'Featured Collection', subtitle: 'Showcase hero products and best sellers with stronger visual hierarchy.' } },
                { type: 'stats', variantId: 'stats-3', props: { title: 'Why customers stay', subtitle: 'Use trust metrics to support purchase decisions.' } },
                { type: 'testimonials', variantId: 'testimonials-1', props: { title: 'Customer Reviews', subtitle: 'Add buyer feedback and product satisfaction proof.' } },
                { type: 'cta', variantId: 'cta-1', props: { title: 'Ready to upgrade your setup?', subtitle: 'Keep the buying flow moving with a focused final call to action.', buttonText: 'Shop Best Sellers', buttonHref: '#products' } },
                { type: 'footer', variantId: 'footer-1', props: { brand: 'Nova Goods', tagline: 'Useful, well-made products designed to look good and work hard.' } }
            ]
        },
        {
            id: 'site-tutorial',
            label: 'Tutorial Video Template',
            description: 'Teaching-focused video website with lessons, roadmap, pricing, and support CTA.',
            icon: 'fa-solid fa-circle-play',
            themeId: 'ocean-breeze',
            meta: {
                title: 'Tutorial Video Template',
                description: 'Starter tutorial and learning video website template.'
            },
            sections: [
                { type: 'navbar', variantId: 'navbar-1', props: { brand: 'SkillFrame', buttonText: 'Start Learning', buttonHref: '#courses' } },
                { type: 'hero', variantId: 'hero-1', props: { title: 'Learn through structured video lessons that actually keep momentum.', subtitle: 'A full starter site for tutorial creators, online educators, and video course websites.', buttonText: 'Browse Lessons', buttonHref: '#courses' } },
                { type: 'videoCarousel', variantId: 'videoCarousel-1', props: { title: 'Popular Tutorials', subtitle: 'Put your top tutorials and course modules front and center.' } },
                { type: 'products', variantId: 'products-2', props: { title: 'Courses & Downloads', subtitle: 'Mix premium video courses, templates, and paid learning packs.' } },
                { type: 'roadmap', variantId: 'roadmap-2', props: { title: 'Learning Path', subtitle: 'Guide students through a clear step-by-step learning roadmap.' } },
                { type: 'pricing', variantId: 'pricing-1', props: { title: 'Choose a Learning Plan', subtitle: 'Offer membership, bundles, or one-time training access.' } },
                { type: 'cta', variantId: 'cta-2', props: { title: 'Ready to build real skills?', subtitle: 'Invite visitors into your teaching funnel with one strong final action.', buttonText: 'Join Today', buttonHref: '#pricing' } },
                { type: 'footer', variantId: 'footer-1', props: { brand: 'SkillFrame', tagline: 'Practical video lessons, guided roadmaps, and learning resources that help you ship.' } }
            ]
        },
        {
            id: 'site-startup',
            label: 'Startup Template',
            description: 'SaaS and startup landing page with product story, stats, pricing, and CTA.',
            icon: 'fa-solid fa-rocket',
            themeId: 'blob-nebula',
            meta: {
                title: 'Startup Template',
                description: 'Starter startup website template.'
            },
            sections: [
                { type: 'navbar', variantId: 'navbar-3', props: { brand: 'OrbitFlow', buttonText: 'Start Free', buttonHref: '#pricing' } },
                { type: 'hero', variantId: 'hero-3', props: { title: 'The operating system for fast-moving modern teams.', subtitle: 'A sharp startup starter for SaaS launches, AI tools, and product-led websites.', buttonText: 'See the Product', buttonHref: '#features' } },
                { type: 'services', variantId: 'services-3', props: { title: 'Why teams switch', subtitle: 'Use this section like a feature grid to explain core benefits.' } },
                { type: 'stats', variantId: 'stats-2', props: { title: 'Adoption at a glance', subtitle: 'Present trust-building product and user metrics.' } },
                { type: 'pricing', variantId: 'pricing-3', props: { title: 'Simple Pricing', subtitle: 'Convert visitors with clear plans and a strong popular option.' } },
                { type: 'cta', variantId: 'cta-2', props: { title: 'Start building with less friction', subtitle: 'Give visitors one strong action after they understand the product.', buttonText: 'Create Account', buttonHref: '#pricing' } },
                { type: 'footer', variantId: 'footer-3', props: { brand: 'OrbitFlow', tagline: 'Team workflows, product operations, and visibility in one clean platform.' } }
            ]
        },
        {
            id: 'site-gym',
            label: 'Fitness Template',
            description: 'High-energy template for gym, trainer, or fitness coaching websites.',
            icon: 'fa-solid fa-dumbbell',
            themeId: 'graphite-fire',
            meta: {
                title: 'Fitness Template',
                description: 'Starter fitness website template.'
            },
            sections: [
                { type: 'navbar', variantId: 'navbar-1', props: { brand: 'Forge Fitness', buttonText: 'Join Today', buttonHref: '#pricing' } },
                { type: 'hero', variantId: 'hero-1', props: { title: 'Train harder, stay consistent, and see measurable progress.', subtitle: 'A performance-focused starter for gyms, personal trainers, and coaching brands.', buttonText: 'See Programs', buttonHref: '#services' } },
                { type: 'services', variantId: 'services-1', props: { title: 'Programs & Coaching', subtitle: 'Lay out membership tiers, coaching options, and class types.' } },
                { type: 'stats', variantId: 'stats-1', props: { title: 'Built on consistency', subtitle: 'Use bold metrics to reinforce transformation and trust.' } },
                { type: 'testimonials', variantId: 'testimonials-3', props: { title: 'Member Results', subtitle: 'Share success stories from your clients and gym members.' } },
                { type: 'pricing', variantId: 'pricing-1', props: { title: 'Membership Plans', subtitle: 'Keep pricing simple and outcome-oriented.' } },
                { type: 'footer', variantId: 'footer-1', props: { brand: 'Forge Fitness', tagline: 'Strength, conditioning, and coaching systems for real progress.' } }
            ]
        },
        {
            id: 'site-wedding',
            label: 'Wedding Template',
            description: 'Elegant event template for wedding, engagement, or ceremony information pages.',
            icon: 'fa-solid fa-heart',
            themeId: 'rose-gold',
            meta: {
                title: 'Wedding Template',
                description: 'Starter wedding website template.'
            },
            sections: [
                { type: 'navbar', variantId: 'navbar-2', props: { brand: 'Emma & Noah' } },
                { type: 'hero', variantId: 'hero-2', props: { title: 'We’re getting married, and we’d love to celebrate with you.', subtitle: 'A warm, elegant starter for wedding websites, RSVP pages, and event timelines.', buttonText: 'View Details', buttonHref: '#roadmap' } },
                { type: 'image', variantId: 'image-1' },
                { type: 'about', variantId: 'about-2', props: { title: 'Our Story', subtitle: 'Share the journey, details, and personal note behind the celebration.' } },
                { type: 'roadmap', variantId: 'roadmap-3', props: { title: 'Wedding Weekend Schedule', subtitle: 'Lay out the timeline so guests know what to expect.' } },
                { type: 'contact', variantId: 'contact-3', props: { title: 'RSVP & Questions', subtitle: 'Use this section for responses, venue info, and guest support.' } },
                { type: 'footer', variantId: 'footer-2', props: { brand: 'Emma & Noah', tagline: 'Thank you for being part of our story and celebration.' } }
            ]
        },
        {
            id: 'site-realestate',
            label: 'Real Estate Template',
            description: 'Professional property website starter for listings, agents, reviews, and inquiries.',
            icon: 'fa-solid fa-house',
            themeId: 'forest-green',
            meta: {
                title: 'Real Estate Template',
                description: 'Starter real estate website template.'
            },
            sections: [
                { type: 'navbar', variantId: 'navbar-1', props: { brand: 'Prime Estates', buttonText: 'Book Viewing', buttonHref: '#contact' } },
                { type: 'hero', variantId: 'hero-1', props: { title: 'Properties presented with clarity, trust, and local expertise.', subtitle: 'A strong real estate starter for agencies, agents, and premium property showcases.', buttonText: 'Browse Listings', buttonHref: '#products' } },
                { type: 'products', variantId: 'products-2', props: { title: 'Featured Listings', subtitle: 'Use product cards as listing cards for homes, apartments, or commercial spaces.' } },
                { type: 'about', variantId: 'about-1', props: { title: 'Why clients choose us', subtitle: 'Explain your process, local knowledge, and buyer support.' } },
                { type: 'testimonials', variantId: 'testimonials-1', props: { title: 'Buyer & Seller Reviews', subtitle: 'Reinforce confidence with proof from past clients.' } },
                { type: 'contact', variantId: 'contact-1', props: { title: 'Request property details', subtitle: 'Invite visitors to ask about listings, tours, and market opportunities.' } },
                { type: 'footer', variantId: 'footer-1', props: { brand: 'Prime Estates', tagline: 'Residential and commercial properties guided by trust and local expertise.' } }
            ]
        }
    ];

    function init() {
        renderList();
        ensurePreviewElement();
        document.getElementById('paletteSearch').addEventListener('input', (e) => {
            renderList(e.target.value.toLowerCase());
        });
    }

    function openOnlyGroup(groupKey) {
        expandedGroups.clear();
        if (groupKey) expandedGroups.add(groupKey);
        renderList(document.getElementById('paletteSearch')?.value?.toLowerCase?.() || '');
    }

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function getVariantsForType(type) {
        const def = BlockTypes[type];
        if (!def || !def.defaultProps) return [];
        if (COMPONENT_VARIANTS[type]) return COMPONENT_VARIANTS[type];
        if (['button', 'divider', 'html'].includes(type)) {
            const label = def.label || type;
            return [
                {
                    id: `${type}-1`,
                    label,
                    description: 'Default starter style',
                    props: {}
                }
            ];
        }

        const label = def.label || type;
        return [
            {
                id: `${type}-1`,
                label: `${label} 1`,
                description: 'Default starter style',
                props: {}
            },
            {
                id: `${type}-2`,
                label: `${label} 2`,
                description: 'Light starter style',
                props: {
                    bgColor: '#ffffff',
                    textColor: '#0f172a',
                    accentColor: '#2563eb',
                    cardBg: '#f8fafc',
                    borderColor: '#e2e8f0'
                }
            },
            {
                id: `${type}-3`,
                label: `${label} 3`,
                description: 'Bold starter style',
                props: {
                    bgColor: 'linear-gradient(135deg, #111827 0%, #312e81 100%)',
                    textColor: '#ffffff',
                    accentColor: '#f59e0b',
                    cardBg: 'rgba(255,255,255,.1)',
                    borderColor: 'rgba(255,255,255,.18)'
                }
            }
        ];
    }

    function buildBlockFromVariant(type, variantId = null) {
        const def = BlockTypes[type];
        if (!def || !def.defaultProps) return null;

        const props = deepClone(def.defaultProps);
        const variant = getVariantsForType(type).find((item) => item.id === variantId) || getVariantsForType(type)[0];
        if (variant?.props) Object.assign(props, deepClone(variant.props));
        if ((type === 'image' || type === 'video' || type === 'text' || type === 'box' || type === 'container') && variantId) {
            const match = variantId.match(/-(\d+)$/);
            const count = match ? Math.max(1, Number(match[1])) : 1;
            if (type === 'image' || type === 'video') {
                props.items = buildMediaLayoutItems(type, props, count);
                props.gap = props.gap || (count >= 4 ? '14px' : '18px');
            } else if (type === 'text' || type === 'box') {
                props.items = buildLayoutPresetItems(type, props, count);
                props.gap = props.gap || (count >= 4 ? '14px' : '18px');
            } else if (type === 'container') {
                props.presetCount = count;
                props.direction = count > 1 ? 'row' : (props.direction || 'column');
                props.wrap = 'wrap';
                props.justify = count > 1 ? 'flex-start' : (props.justify || 'flex-start');
                props.align = 'stretch';
                props.gap = props.gap || (count >= 4 ? '14px' : '18px');
            }
        }
        applyBaseLightTheme(type, props);
        const activeThemeVars = typeof Themes !== 'undefined' && typeof Themes.getActiveVars === 'function'
            ? Themes.getActiveVars()
            : null;
        if (activeThemeVars) {
            applyThemeToNewBlock(type, props, activeThemeVars);
        }
        return { type, props };
    }

    function createId(prefix = 'blk') {
        return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
    }

    function buildSiteTemplate(templateId) {
        const template = SITE_TEMPLATES.find((item) => item.id === templateId);
        if (!template) return null;
        const themeVars = typeof Themes !== 'undefined' && typeof Themes.getThemeVars === 'function'
            ? Themes.getThemeVars(template.themeId)
            : null;

        const blocks = template.sections
            .map((section) => {
                const blockData = buildBlockFromVariant(section.type, section.variantId);
                if (!blockData) return null;
                if (section.props) Object.assign(blockData.props, deepClone(section.props));
                if (themeVars) applyThemeToNewBlock(section.type, blockData.props, themeVars);
                return {
                    id: createId(section.type),
                    type: section.type,
                    props: blockData.props
                };
            })
            .filter(Boolean);

        return {
            template,
            blocks,
            meta: template.meta || null,
            theme: template.themeId || null
        };
    }

    function applyBaseLightTheme(type, props) {
        const lightTheme = {
            sectionBg: '#ffffff',
            headerBg: '#ffffff',
            footerBg: '#ffffff',
            textColor: '#0f172a',
            mutedText: '#475569',
            accentColor: '#2563eb',
            buttonBg: '#2563eb',
            buttonText: '#ffffff',
            cardBg: '#f8fafc',
            borderColor: '#e2e8f0',
            linkColor: '#2563eb',
            headingColor: '#0f172a'
        };
        applyThemeToNewBlock(type, props, lightTheme);
    }

    function applyThemeToNewBlock(type, props, themeVars) {
        if (!props || !themeVars) return;

        const sectionBg = themeVars['--sf-section-bg'] || themeVars.sectionBg || themeVars['--sf-bg'] || '';
        const headerBg = themeVars['--sf-header-bg'] || themeVars.headerBg || sectionBg;
        const footerBg = themeVars['--sf-footer-bg'] || themeVars.footerBg || sectionBg;
        const textColor = themeVars['--sf-text'] || themeVars.textColor || '';
        const mutedText = themeVars['--sf-text-muted'] || themeVars.mutedText || textColor;
        const accentColor = themeVars['--sf-accent'] || themeVars.accentColor || '';
        const buttonBg = themeVars['--sf-btn-bg'] || themeVars.buttonBg || accentColor || sectionBg;
        const buttonText = themeVars['--sf-btn-text'] || themeVars.buttonText || '#ffffff';
        const cardBg = themeVars['--sf-card-bg'] || themeVars.cardBg || sectionBg;
        const borderColor = themeVars['--sf-border'] || themeVars.borderColor || '';
        const linkColor = themeVars['--sf-link-color'] || themeVars.linkColor || accentColor || textColor;
        const headingColor = themeVars['--sf-heading-color'] || themeVars.headingColor || textColor;

        const buttonLikeTypes = new Set(['button']);
        const headerTypes = new Set(['navbar']);
        const footerTypes = new Set(['footer']);
        const cardLikeTypes = new Set(['box', 'container', 'text', 'image', 'video', 'divider', 'accordion', 'table', 'word', 'motionPopup']);
        const accentHeavyTypes = new Set(['hero', 'services', 'contact', 'cta', 'pricing', 'products', 'roadmap', 'videoCarousel', 'testimonials', 'stats', 'accordion', 'table', 'word', 'motionPopup']);
        const lightSurfaceTypes = new Set(['about', 'services', 'testimonials', 'pricing', 'products', 'contact', 'videoCarousel', 'roadmap', 'accordion', 'table', 'word', 'motionPopup']);

        const applyThemeToStyleObject = (styleObj, bgValue, localTextColor = textColor) => {
            if (!styleObj || typeof styleObj !== 'object') return;
            if ('color' in styleObj) styleObj.color = localTextColor;
            if ('textColor' in styleObj) styleObj.textColor = localTextColor;
            if ('background' in styleObj) styleObj.background = bgValue;
            if ('bgColor' in styleObj) styleObj.bgColor = bgValue;
            if ('backgroundColor' in styleObj) styleObj.backgroundColor = bgValue;
            if ('borderColor' in styleObj) styleObj.borderColor = borderColor;
            if ('accentColor' in styleObj) styleObj.accentColor = accentColor;
            if ('buttonColor' in styleObj) styleObj.buttonColor = buttonBg;
            if ('cardBg' in styleObj) styleObj.cardBg = cardBg;
            if ('cardBorder' in styleObj) styleObj.cardBorder = borderColor;
            if ('fill' in styleObj) styleObj.fill = accentColor;
            if ('stroke' in styleObj) styleObj.stroke = accentColor;
        };

        let blockBg = sectionBg;
        let blockText = textColor;
        let innerSurface = cardBg;

        if (headerTypes.has(type)) blockBg = headerBg;
        else if (footerTypes.has(type)) blockBg = footerBg;
        else if (buttonLikeTypes.has(type)) blockBg = buttonBg;
        else if (cardLikeTypes.has(type)) blockBg = cardBg;

        if (buttonLikeTypes.has(type)) blockText = buttonText;
        if (!lightSurfaceTypes.has(type) && type !== 'footer') innerSurface = cardBg;

        if ('bgColor' in props) props.bgColor = blockBg;
        if ('background' in props) props.background = blockBg;
        if ('textColor' in props) props.textColor = blockText;
        if ('color' in props) props.color = blockText;
        if ('accentColor' in props) props.accentColor = accentColor;
        if ('headingColor' in props) props.headingColor = headingColor;
        if ('buttonColor' in props) props.buttonColor = buttonBg;
        if ('buttonTextColor' in props) props.buttonTextColor = buttonText;
        if ('cardBg' in props) props.cardBg = innerSurface;
        if ('cardBorder' in props) props.cardBorder = borderColor;
        if ('borderColor' in props) props.borderColor = borderColor;
        if ('linkColor' in props) props.linkColor = linkColor;
        if ('fontColor' in props) props.fontColor = blockText;

        if (Array.isArray(props.items)) {
            props.items.forEach((item) => {
                if (!item || typeof item !== 'object') return;
                if ('bgColor' in item) item.bgColor = innerSurface;
                if ('background' in item) item.background = innerSurface;
                if ('textColor' in item) item.textColor = blockText;
                if ('accentColor' in item) item.accentColor = accentColor;
                if ('color' in item) item.color = blockText;
                if ('borderColor' in item) item.borderColor = borderColor;
            });
        }
        if (Array.isArray(props.plans)) {
            props.plans.forEach((plan) => {
                if (!plan || typeof plan !== 'object') return;
                if ('bgColor' in plan) plan.bgColor = plan.popular ? accentColor : innerSurface;
                if ('cardBg' in plan) plan.cardBg = plan.popular ? accentColor : innerSurface;
                if ('textColor' in plan) plan.textColor = plan.popular ? buttonText : blockText;
                if ('accentColor' in plan) plan.accentColor = accentColor;
                if ('borderColor' in plan) plan.borderColor = borderColor;
            });
        }
        if (Array.isArray(props.links)) {
            props.links.forEach((link) => {
                if (!link || typeof link !== 'object') return;
                if ('color' in link) link.color = linkColor;
                if ('textColor' in link) link.textColor = linkColor;
            });
        }

        if (props.subStyles && typeof props.subStyles === 'object') {
            Object.entries(props.subStyles).forEach(([path, styleObj]) => {
                if (!styleObj || typeof styleObj !== 'object' || Array.isArray(styleObj)) return;
                let subBg = sectionBg;
                let subText = blockText;
                if (/(\.|^)items\./.test(path) || /(\.|^)plans\./.test(path) || /(\.|^)cards\./.test(path) || /(\.|^)children\./.test(path) || /(\.|^)info\./.test(path)) {
                    subBg = innerSurface;
                }
                if (/(\.|^)(badge|cta|button|submit|price|icon)(\.|$)/.test(path) || accentHeavyTypes.has(type) && /(\.|^)(cta|badge|button|icon)(\.|$)/.test(path)) {
                    subBg = buttonBg;
                    subText = buttonText;
                }
                if (/(\.|^)(name|title|subtitle|desc|text|role|date|label|num|val|per)(\.|$)/.test(path) && subBg === buttonBg) {
                    subBg = innerSurface;
                    subText = blockText;
                }
                applyThemeToStyleObject(styleObj, subBg, subText);
            });
        }

        if (type === 'container' && props.customClass && String(props.customClass).includes('preset-slot')) {
            props.bgColor = cardBg;
            props.textColor = mutedText;
            props.accentColor = accentColor;
            props.borderColor = borderColor;
        }
    }

    function buildMediaLayoutItems(type, props, count) {
        const imageSeeds = [
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1497366412874-3415097a27e7?q=80&w=1400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop'
        ];
        const videoSeeds = [
            'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'https://www.youtube.com/watch?v=jNQXAC9IVRw',
            'https://www.youtube.com/watch?v=ysz5S6PUM-U',
            'https://www.youtube.com/watch?v=ScMzIvxBSi4',
            'https://www.youtube.com/watch?v=M7lc1UVf-VE'
        ];

        return Array.from({ length: count }, (_, index) => {
            if (type === 'image') {
                return {
                    src: imageSeeds[index] || props.src,
                    alt: `${props.alt || 'Image'} ${index + 1}`,
                    caption: count === 1 ? (props.caption || `Image ${index + 1}`) : `Image ${index + 1}`,
                    description: props.description || 'Add a short note for this image.',
                    rating: props.rating || 5
                };
            }
            return {
                url: videoSeeds[index] || props.url,
                thumb: props.thumb || '',
                title: count === 1 ? (props.title || `Video ${index + 1}`) : `Video ${index + 1}`,
                description: props.description || 'Add a short note for this video.',
                rating: props.rating || 4,
                autoplay: !!props.autoplay
            };
        });
    }

    function buildLayoutPresetItems(type, props, count) {
        if (type === 'text') {
            return Array.from({ length: count }, (_, index) => ({
                badge: `Text ${index + 1}`,
                title: `Section ${index + 1}`,
                text: `Add your content for text block ${index + 1}. This layout lets multiple text panels appear together in one text section.`
            }));
        }

        return Array.from({ length: count }, (_, index) => ({
            title: `${type === 'container' ? 'Panel' : 'Box'} ${index + 1}`,
            text: `Add content inside ${type === 'container' ? 'panel' : 'box'} ${index + 1}.`,
            buttonText: count <= 2 ? 'Action' : '',
            buttonHref: '#'
        }));
    }

    function parsePayload(raw) {
        if (!raw) return null;
        if (raw.startsWith('sf-sub:')) return null;
        try {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.type && BlockTypes[parsed.type]) {
                return parsed;
            }
        } catch (err) {
            // plain type fallback
        }
        if (BlockTypes[raw]) return { type: raw, variantId: null };
        return null;
    }

    function addVariantToCanvas(type, variantId) {
        const blockData = buildBlockFromVariant(type, variantId);
        if (!blockData) return;
        const id = State.addBlock(blockData);
        finalizeAddedBlock(id, blockData);
        State.setSelected(id);
        const canvasWrapper = document.getElementById('canvasWrapper');
        setTimeout(() => canvasWrapper.scrollTo({ top: canvasWrapper.scrollHeight, behavior: 'smooth' }), 80);
        if (window.showToast) window.showToast(`${BlockTypes[type].label} added`, 'success');
    }

    function finalizeAddedBlock(id, blockData) {
        if (!id || !blockData || blockData.type !== 'container' || !blockData.props?.presetCount) return;
        const activeThemeVars = typeof Themes !== 'undefined' && typeof Themes.getActiveVars === 'function'
            ? Themes.getActiveVars()
            : null;
        const count = Number(blockData.props.presetCount) || 1;
        for (let i = 0; i < count; i++) {
            const slotProps = buildContainerSlotProps(count, i);
            applyBaseLightTheme('box', slotProps);
            if (activeThemeVars) applyThemeToNewBlock('box', slotProps, activeThemeVars);
            State.addBlock({
                type: 'box',
                parentId: id,
                props: slotProps
            });
        }
    }

    function addSiteTemplateToCanvas(templateId) {
        const payload = buildSiteTemplate(templateId);
        if (!payload) return;

        const loadTemplate = () => {
            const currentRoots = State.getBlocks(null) || [];
            currentRoots.forEach((block) => {
                if (block?.id) State.removeBlock(block.id);
            });

            let firstAddedId = null;
            payload.blocks.forEach((blockDef) => {
                const id = State.addBlock({
                    type: blockDef.type,
                    props: deepClone(blockDef.props || {})
                });
                if (!firstAddedId) firstAddedId = id;
            });

            if (payload.meta && typeof State.updateMeta === 'function') {
                State.updateMeta(payload.meta);
            }
            if (payload.theme && typeof Themes !== 'undefined' && typeof Themes.apply === 'function') {
                Themes.apply(payload.theme);
            }
            if (firstAddedId) State.setSelected(firstAddedId);
            const canvasWrapper = document.getElementById('canvasWrapper');
            if (canvasWrapper) canvasWrapper.scrollTo({ top: 0, behavior: 'smooth' });
            if (window.showToast) window.showToast(`${payload.template.label} loaded`, 'success');
        };

        if (State.getAllBlocks().length > 0 && typeof window.askConfirm === 'function') {
            window.askConfirm(
                'Load Template',
                'This will replace the current canvas with the selected starter website template.',
                loadTemplate
            );
            return;
        }

        loadTemplate();
    }

    function buildContainerSlotProps(count, index) {
        const widthMap = {
            1: '100%',
            2: 'calc(50% - 12px)',
            3: 'calc(33.333% - 12px)',
            4: 'calc(25% - 12px)',
            5: 'calc(33.333% - 12px)',
            6: 'calc(33.333% - 12px)'
        };
        return {
            bgColor: 'rgba(255,255,255,0.55)',
            width: widthMap[count] || 'calc(33.333% - 12px)',
            minHeight: count === 1 ? '140px' : '180px',
            margin: '0',
            padding: '18px',
            display: 'flex',
            direction: 'column',
            justify: 'flex-start',
            align: 'stretch',
            gap: '12px',
            borderRadius: '16px',
            borderWidth: '1px',
            borderStyle: 'dashed',
            borderColor: 'rgba(15,23,42,.16)',
            boxShadow: 'none',
            textColor: '#64748b',
            accentColor: '#111827',
            customClass: `preset-slot preset-slot-${index + 1}`
        };
    }

    function ensurePreviewElement() {
        if (previewEl) return previewEl;
        previewEl = document.createElement('div');
        previewEl.id = 'paletteHoverPreview';
        previewEl.className = 'palette-hover-preview hidden';
        document.body.appendChild(previewEl);
        return previewEl;
    }

    function sanitizePreviewHtml(html) {
        if (!html) return '';
        return String(html)
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/\son[a-z]+\s*=\s*(["']).*?\1/gi, '')
            .replace(/\shref\s*=\s*(["'])javascript:[\s\S]*?\1/gi, ' href="#"');
    }

    function buildPreviewHtml(type, variantId) {
        const blockData = buildBlockFromVariant(type, variantId);
        if (!blockData) return '';
        const def = BlockTypes[type];
        if (!def || typeof def.render !== 'function') return '';
        try {
            const rendered = def.render(deepClone(blockData.props));
            return sanitizePreviewHtml(rendered);
        } catch (err) {
            console.warn('Preview render failed for', type, variantId, err);
            return '';
        }
    }

    function buildSiteTemplatePreviewHtml(templateId) {
        const payload = buildSiteTemplate(templateId);
        if (!payload || !payload.blocks.length) return '';
        const html = payload.blocks.map((block) => {
            const def = BlockTypes[block.type];
            if (!def || typeof def.render !== 'function') return '';
            try {
                return def.render(deepClone(block.props));
            } catch (err) {
                return '';
            }
        }).join('');
        return sanitizePreviewHtml(`<div style="background:#ffffff;">${html}</div>`);
    }

    function placePreview(anchorEl) {
        if (!previewEl || !anchorEl) return;
        const rect = anchorEl.getBoundingClientRect();
        const previewWidth = Math.min(460, Math.max(320, Math.round(window.innerWidth * 0.26)));
        previewEl.style.width = `${previewWidth}px`;
        previewEl.style.maxHeight = `${Math.max(280, window.innerHeight - 40)}px`;
        previewEl.style.left = '0px';
        previewEl.style.top = '0px';

        const measuredWidth = previewEl.offsetWidth || previewWidth;
        const measuredHeight = previewEl.offsetHeight || 360;
        const fitsRight = rect.right + 18 + measuredWidth <= window.innerWidth - 12;
        const left = fitsRight
            ? rect.right + 18
            : Math.max(12, rect.left - measuredWidth - 18);
        const top = Math.min(
            Math.max(12, rect.top),
            Math.max(12, window.innerHeight - measuredHeight - 12)
        );

        previewEl.style.left = `${left}px`;
        previewEl.style.top = `${top}px`;
    }

    function showPreview(anchorEl, type, variant) {
        clearTimeout(previewHideTimer);
        const root = ensurePreviewElement();
        const previewHtml = buildPreviewHtml(type, variant.id);
        showCustomPreview(anchorEl, variant.label, variant.description, previewHtml);
    }

    function showCustomPreview(anchorEl, title, description, previewHtml) {
        clearTimeout(previewHideTimer);
        const root = ensurePreviewElement();
        root.innerHTML = `
            <div class="palette-hover-preview-head">
                <div class="palette-hover-preview-title">${title}</div>
                <div class="palette-hover-preview-desc">${description}</div>
            </div>
            <div class="palette-hover-preview-body">
                <div class="palette-hover-preview-scale">
                    ${previewHtml || '<div class="palette-hover-preview-empty">Preview unavailable</div>'}
                </div>
            </div>
        `;
        root.classList.remove('hidden');
        placePreview(anchorEl);
    }

    function hidePreview(immediate = false) {
        clearTimeout(previewHideTimer);
        if (immediate) {
            if (previewEl) previewEl.classList.add('hidden');
            return;
        }
        previewHideTimer = setTimeout(() => {
            if (previewEl) previewEl.classList.add('hidden');
        }, 90);
    }

    function createVariantItem(type, variant, autoOpen = false) {
        const item = document.createElement('div');
        let suppressNextClick = false;
        item.className = 'palette-variant-item';
        item.draggable = true;
        item.dataset.type = type;
        item.dataset.variantId = variant.id;
        item.innerHTML = `
            <div class="palette-variant-icon"><i class="${BlockTypes[type].icon}"></i></div>
            <div class="palette-variant-copy">
                <div class="palette-variant-title">${variant.label}</div>
                <div class="palette-variant-desc">${variant.description}</div>
            </div>
        `;

        item.addEventListener('dragstart', (e) => {
            const payload = JSON.stringify({ type, variantId: variant.id });
            dragType = type;
            suppressNextClick = true;
            item.classList.add('dragging');
            e.dataTransfer.setData('text/plain', payload);
            e.dataTransfer.effectAllowed = 'copy';
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            dragType = null;
            setTimeout(() => { suppressNextClick = false; }, 0);
        });
        item.addEventListener('mouseenter', () => showPreview(item, type, variant));
        item.addEventListener('mousemove', () => placePreview(item));
        item.addEventListener('mouseleave', () => hidePreview());
        item.addEventListener('click', () => {
            if (suppressNextClick) return;
            addVariantToCanvas(type, variant.id);
        });

        return item;
    }

    function createSiteTemplateItem(template) {
        const item = document.createElement('div');
        item.className = 'palette-variant-item';
        item.dataset.templateId = template.id;
        item.innerHTML = `
            <div class="palette-variant-icon"><i class="${template.icon}"></i></div>
            <div class="palette-variant-copy">
                <div class="palette-variant-title">${template.label}</div>
                <div class="palette-variant-desc">${template.description}</div>
            </div>
        `;

        item.addEventListener('mouseenter', () => {
            showCustomPreview(item, template.label, template.description, buildSiteTemplatePreviewHtml(template.id));
        });
        item.addEventListener('mousemove', () => placePreview(item));
        item.addEventListener('mouseleave', () => hidePreview());
        item.addEventListener('click', () => addSiteTemplateToCanvas(template.id));

        return item;
    }

    function renderSiteTemplatesSection(container, filter = '') {
        const templates = SITE_TEMPLATES.filter((template) => {
            if (!filter) return true;
            const value = `${template.label} ${template.description}`.toLowerCase();
            return value.includes(filter) || 'preset theme'.includes(filter) || 'template'.includes(filter);
        });
        if (!templates.length) return;

        const catEl = document.createElement('div');
        catEl.className = 'palette-category';
        catEl.textContent = 'Preset Theme';
        container.appendChild(catEl);

        const group = document.createElement('div');
        group.className = 'palette-group';
        const isOpen = !!filter ? true : expandedGroups.has(TEMPLATE_GROUP_KEY);
        if (isOpen) group.classList.add('open');

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'palette-group-trigger';
        trigger.innerHTML = `
            <span class="palette-group-main">
                <i class="fa-solid fa-layer-group"></i>
                <span>Website Templates</span>
            </span>
            <i class="fa-solid fa-chevron-down palette-group-chevron"></i>
        `;

        const variantList = document.createElement('div');
        variantList.className = 'palette-variant-list';
        templates.forEach((template) => variantList.appendChild(createSiteTemplateItem(template)));

        trigger.addEventListener('click', () => {
            if (group.classList.contains('open')) {
                group.classList.remove('open');
                expandedGroups.delete(TEMPLATE_GROUP_KEY);
                renderList(document.getElementById('paletteSearch')?.value?.toLowerCase?.() || '');
            } else {
                openOnlyGroup(TEMPLATE_GROUP_KEY);
            }
        });

        group.appendChild(trigger);
        group.appendChild(variantList);
        container.appendChild(group);
    }

    function renderList(filter = '') {
        const container = document.getElementById('paletteList');
        container.innerHTML = '';
        renderSiteTemplatesSection(container, filter);

        const categories = {};
        for (const [type, def] of Object.entries(BlockTypes)) {
            if (typeof def !== 'object' || !def.label) continue;
            const variants = getVariantsForType(type);
            const variantMatches = variants.some((variant) =>
                variant.label.toLowerCase().includes(filter) || variant.description.toLowerCase().includes(filter)
            );
            const baseMatches = def.label.toLowerCase().includes(filter) || (def.category || 'other').toLowerCase().includes(filter);
            if (filter && !baseMatches && !variantMatches) continue;

            const cat = def.category || 'Other';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push({ type, ...def, variants, autoOpen: !!filter && (baseMatches || variantMatches) });
        }

        for (const [cat, items] of Object.entries(categories)) {
            if (!items.length) continue;
            const catEl = document.createElement('div');
            catEl.className = 'palette-category';
            catEl.textContent = cat;
            container.appendChild(catEl);

            items.forEach((item) => {
                const group = document.createElement('div');
                group.className = 'palette-group';

                const trigger = document.createElement('button');
                trigger.type = 'button';
                trigger.className = 'palette-group-trigger';
                trigger.innerHTML = `
                    <span class="palette-group-main">
                        <i class="${item.icon}"></i>
                        <span>${item.label}</span>
                    </span>
                    <i class="fa-solid fa-chevron-down palette-group-chevron"></i>
                `;

                const variantList = document.createElement('div');
                variantList.className = 'palette-variant-list';

                const isOpen = item.autoOpen || expandedGroups.has(item.type);
                if (isOpen) group.classList.add('open');

                trigger.addEventListener('click', () => {
                    if (group.classList.contains('open')) {
                        group.classList.remove('open');
                        expandedGroups.delete(item.type);
                        renderList(document.getElementById('paletteSearch')?.value?.toLowerCase?.() || '');
                    } else {
                        openOnlyGroup(item.type);
                    }
                });

                item.variants.forEach((variant) => {
                    variantList.appendChild(createVariantItem(item.type, variant));
                });

                group.appendChild(trigger);
                group.appendChild(variantList);
                container.appendChild(group);
            });
        }
    }

    function getDragType() { return dragType; }

    return {
        init,
        getDragType,
        getVariantsForType,
        buildBlockFromVariant,
        finalizeAddedBlock,
        resolvePayload: parsePayload
    };
})();
