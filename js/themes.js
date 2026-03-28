// ============================================================
// themes.js – Website theme definitions and apply logic
// ============================================================

const Themes = (() => {

    const THEMES = [
        // ---- SOLID ----
        {
            id: 'midnight-dark',
            name: 'Midnight Dark',
            type: 'solid',
            preview: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
            vars: {
                '--sf-bg': '#0f172a',
                '--sf-section-bg': '#0f172a',
                '--sf-text': '#f1f5f9',
                '--sf-text-muted': '#94a3b8',
                '--sf-accent': '#6c63ff',
                '--sf-btn-bg': '#6c63ff',
                '--sf-btn-text': '#ffffff',
                '--sf-header-bg': 'rgba(15,23,42,0.97)',
                '--sf-footer-bg': '#020617',
                '--sf-card-bg': '#1e293b',
                '--sf-border': '#334155',
                '--sf-heading-color': '#f8fafc',
                '--sf-link-color': '#818cf8',
            }
        },
        {
            id: 'pure-light',
            name: 'Pure Light',
            type: 'solid',
            preview: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            vars: {
                '--sf-bg': '#ffffff',
                '--sf-section-bg': '#f8fafc',
                '--sf-text': '#1e293b',
                '--sf-text-muted': '#64748b',
                '--sf-accent': '#4f46e5',
                '--sf-btn-bg': '#4f46e5',
                '--sf-btn-text': '#ffffff',
                '--sf-header-bg': 'rgba(255,255,255,0.97)',
                '--sf-footer-bg': '#ffffff',
                '--sf-card-bg': '#f8fafc',
                '--sf-border': '#e2e8f0',
                '--sf-heading-color': '#0f172a',
                '--sf-link-color': '#4f46e5',
            }
        },
        {
            id: 'forest-green',
            name: 'Forest Green',
            type: 'solid',
            preview: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)',
            vars: {
                '--sf-bg': '#052e16',
                '--sf-section-bg': '#071a0d',
                '--sf-text': '#f0fdf4',
                '--sf-text-muted': '#86efac',
                '--sf-accent': '#22c55e',
                '--sf-btn-bg': '#22c55e',
                '--sf-btn-text': '#052e16',
                '--sf-header-bg': 'rgba(5,46,22,0.97)',
                '--sf-footer-bg': '#020f08',
                '--sf-card-bg': '#14532d',
                '--sf-border': '#166534',
                '--sf-heading-color': '#dcfce7',
                '--sf-link-color': '#4ade80',
            }
        },
        {
            id: 'ocean-navy',
            name: 'Ocean Navy',
            type: 'solid',
            preview: 'linear-gradient(135deg, #0c1445 0%, #1a237e 100%)',
            vars: {
                '--sf-bg': '#0c1445',
                '--sf-section-bg': '#0a1128',
                '--sf-text': '#e8eaf6',
                '--sf-text-muted': '#9fa8da',
                '--sf-accent': '#536dfe',
                '--sf-btn-bg': '#536dfe',
                '--sf-btn-text': '#ffffff',
                '--sf-header-bg': 'rgba(12,20,69,0.97)',
                '--sf-footer-bg': '#050a1a',
                '--sf-card-bg': '#1a237e',
                '--sf-border': '#283593',
                '--sf-heading-color': '#e8eaf6',
                '--sf-link-color': '#82b1ff',
            }
        },
        {
            id: 'neon-night',
            name: 'Neon Night',
            type: 'solid',
            preview: 'linear-gradient(135deg, #0d0d0d 0%, #1a0033 100%)',
            vars: {
                '--sf-bg': '#0d0d0d',
                '--sf-section-bg': '#0d0d0d',
                '--sf-text': '#ffffff',
                '--sf-text-muted': '#a78bfa',
                '--sf-accent': '#a855f7',
                '--sf-btn-bg': 'linear-gradient(90deg, #a855f7, #ec4899)',
                '--sf-btn-text': '#ffffff',
                '--sf-header-bg': 'rgba(13,13,13,0.97)',
                '--sf-footer-bg': '#050505',
                '--sf-card-bg': '#1a001a',
                '--sf-border': '#581c87',
                '--sf-heading-color': '#f5d0fe',
                '--sf-link-color': '#e879f9',
            }
        },
        {
            id: 'sandstone',
            name: 'Sandstone',
            type: 'solid',
            preview: 'linear-gradient(135deg, #f5e9d7 0%, #d8b98a 100%)',
            vars: {
                '--sf-bg': '#f8f1e7',
                '--sf-section-bg': '#f5e9d7',
                '--sf-text': '#4a3426',
                '--sf-text-muted': '#8a6a54',
                '--sf-accent': '#c97b38',
                '--sf-btn-bg': '#c97b38',
                '--sf-btn-text': '#fff8f0',
                '--sf-header-bg': 'rgba(248,241,231,0.96)',
                '--sf-footer-bg': '#3b2417',
                '--sf-card-bg': '#fff8ef',
                '--sf-border': '#dec5a6',
                '--sf-heading-color': '#2f1e13',
                '--sf-link-color': '#b9632b',
            }
        },
        {
            id: 'graphite-fire',
            name: 'Graphite Fire',
            type: 'solid',
            preview: 'linear-gradient(135deg, #111827 0%, #3f1d0d 100%)',
            vars: {
                '--sf-bg': '#111827',
                '--sf-section-bg': '#161b22',
                '--sf-text': '#f9fafb',
                '--sf-text-muted': '#cbd5e1',
                '--sf-accent': '#f97316',
                '--sf-btn-bg': '#f97316',
                '--sf-btn-text': '#111827',
                '--sf-header-bg': 'rgba(17,24,39,0.97)',
                '--sf-footer-bg': '#0b0f16',
                '--sf-card-bg': '#1f2937',
                '--sf-border': '#374151',
                '--sf-heading-color': '#ffffff',
                '--sf-link-color': '#fb923c',
            }
        },
        {
            id: 'royal-plum',
            name: 'Royal Plum',
            type: 'solid',
            preview: 'linear-gradient(135deg, #2d123c 0%, #5b1e78 100%)',
            vars: {
                '--sf-bg': '#241132',
                '--sf-section-bg': '#2d123c',
                '--sf-text': '#faf5ff',
                '--sf-text-muted': '#d8b4fe',
                '--sf-accent': '#c084fc',
                '--sf-btn-bg': '#c084fc',
                '--sf-btn-text': '#2d123c',
                '--sf-header-bg': 'rgba(36,17,50,0.97)',
                '--sf-footer-bg': '#170b22',
                '--sf-card-bg': '#4c1d68',
                '--sf-border': '#7e22ce',
                '--sf-heading-color': '#ffffff',
                '--sf-link-color': '#e9d5ff',
            }
        },
        // ---- GRADIENT ----
        {
            id: 'ocean-breeze',
            name: 'Ocean Breeze',
            type: 'gradient',
            preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            vars: {
                '--sf-bg': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '--sf-section-bg': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '--sf-text': '#ffffff',
                '--sf-text-muted': 'rgba(255,255,255,0.75)',
                '--sf-accent': '#f093fb',
                '--sf-btn-bg': 'linear-gradient(90deg, #f093fb, #f5576c)',
                '--sf-btn-text': '#ffffff',
                '--sf-header-bg': 'rgba(102, 126, 234, 0.97)',
                '--sf-footer-bg': 'rgba(53,56,110,0.98)',
                '--sf-card-bg': 'rgba(255,255,255,0.12)',
                '--sf-border': 'rgba(255,255,255,0.2)',
                '--sf-heading-color': '#ffffff',
                '--sf-link-color': '#f093fb',
            }
        },
        {
            id: 'sunset-glow',
            name: 'Sunset Glow',
            type: 'gradient',
            preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            vars: {
                '--sf-bg': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                '--sf-section-bg': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                '--sf-text': '#1a0010',
                '--sf-text-muted': 'rgba(26,0,16,0.65)',
                '--sf-accent': '#7b2d8b',
                '--sf-btn-bg': 'linear-gradient(90deg, #7b2d8b, #c0036e)',
                '--sf-btn-text': '#ffffff',
                '--sf-header-bg': 'rgba(250,112,154,0.97)',
                '--sf-footer-bg': 'rgba(80,20,40,0.97)',
                '--sf-card-bg': 'rgba(255,255,255,0.25)',
                '--sf-border': 'rgba(255,255,255,0.3)',
                '--sf-heading-color': '#1a0010',
                '--sf-link-color': '#7b2d8b',
            }
        },
        {
            id: 'aurora',
            name: 'Aurora',
            type: 'gradient',
            preview: 'linear-gradient(135deg, #0b3d2e 0%, #0ea5e9 50%, #7c3aed 100%)',
            vars: {
                '--sf-bg': 'linear-gradient(135deg, #0b3d2e 0%, #064e3b 40%, #1e1b4b 100%)',
                '--sf-section-bg': 'linear-gradient(135deg, #0b3d2e 0%, #064e3b 40%, #1e1b4b 100%)',
                '--sf-text': '#ecfdf5',
                '--sf-text-muted': '#6ee7b7',
                '--sf-accent': '#34d399',
                '--sf-btn-bg': 'linear-gradient(90deg, #34d399, #0ea5e9)',
                '--sf-btn-text': '#0b3d2e',
                '--sf-header-bg': 'rgba(11,61,46,0.97)',
                '--sf-footer-bg': 'rgba(4,20,16,0.97)',
                '--sf-card-bg': 'rgba(255,255,255,0.08)',
                '--sf-border': 'rgba(52,211,153,0.25)',
                '--sf-heading-color': '#d1fae5',
                '--sf-link-color': '#34d399',
            }
        },
        {
            id: 'rose-gold',
            name: 'Rose Gold',
            type: 'gradient',
            preview: 'linear-gradient(135deg, #f9a8d4 0%, #fbbf24 100%)',
            vars: {
                '--sf-bg': 'linear-gradient(135deg, #fce7f3 0%, #fef3c7 100%)',
                '--sf-section-bg': 'linear-gradient(135deg, #fce7f3 0%, #fef3c7 100%)',
                '--sf-text': '#831843',
                '--sf-text-muted': '#be185d',
                '--sf-accent': '#e11d48',
                '--sf-btn-bg': 'linear-gradient(90deg, #e11d48, #f59e0b)',
                '--sf-btn-text': '#ffffff',
                '--sf-header-bg': 'rgba(252,231,243,0.97)',
                '--sf-footer-bg': '#fff1f2',
                '--sf-card-bg': 'rgba(255,255,255,0.55)',
                '--sf-border': 'rgba(225,29,72,0.2)',
                '--sf-heading-color': '#500724',
                '--sf-link-color': '#e11d48',
            }
        },
        {
            id: 'midnight-spectrum',
            name: 'Midnight Spectrum',
            type: 'gradient',
            preview: 'linear-gradient(135deg, #020617 0%, #1d4ed8 45%, #7c3aed 100%)',
            vars: {
                '--sf-bg': 'linear-gradient(135deg, #020617 0%, #0f172a 35%, #1d4ed8 70%, #7c3aed 100%)',
                '--sf-section-bg': 'linear-gradient(135deg, #020617 0%, #0f172a 35%, #1d4ed8 70%, #7c3aed 100%)',
                '--sf-text': '#eff6ff',
                '--sf-text-muted': 'rgba(239,246,255,0.78)',
                '--sf-accent': '#38bdf8',
                '--sf-btn-bg': 'linear-gradient(90deg, #38bdf8, #8b5cf6)',
                '--sf-btn-text': '#031525',
                '--sf-header-bg': 'rgba(2,6,23,0.94)',
                '--sf-footer-bg': 'rgba(7,11,28,0.98)',
                '--sf-card-bg': 'rgba(15,23,42,0.45)',
                '--sf-border': 'rgba(147,197,253,0.25)',
                '--sf-heading-color': '#ffffff',
                '--sf-link-color': '#7dd3fc',
            }
        },
        {
            id: 'citrus-pop',
            name: 'Citrus Pop',
            type: 'gradient',
            preview: 'linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)',
            vars: {
                '--sf-bg': 'linear-gradient(135deg, #fff7ed 0%, #fde68a 35%, #fb7185 100%)',
                '--sf-section-bg': 'linear-gradient(135deg, #fff7ed 0%, #fde68a 35%, #fb7185 100%)',
                '--sf-text': '#4c0519',
                '--sf-text-muted': 'rgba(76,5,25,0.72)',
                '--sf-accent': '#ea580c',
                '--sf-btn-bg': 'linear-gradient(90deg, #f59e0b, #f43f5e)',
                '--sf-btn-text': '#ffffff',
                '--sf-header-bg': 'rgba(255,247,237,0.94)',
                '--sf-footer-bg': 'rgba(136,19,55,0.95)',
                '--sf-card-bg': 'rgba(255,255,255,0.4)',
                '--sf-border': 'rgba(251,113,133,0.25)',
                '--sf-heading-color': '#3f0a1d',
                '--sf-link-color': '#c2410c',
            }
        },
        {
            id: 'arctic-flow',
            name: 'Arctic Flow',
            type: 'gradient',
            preview: 'linear-gradient(135deg, #dbeafe 0%, #67e8f9 45%, #6366f1 100%)',
            vars: {
                '--sf-bg': 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 20%, #67e8f9 65%, #6366f1 100%)',
                '--sf-section-bg': 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 20%, #67e8f9 65%, #6366f1 100%)',
                '--sf-text': '#082f49',
                '--sf-text-muted': 'rgba(8,47,73,0.72)',
                '--sf-accent': '#2563eb',
                '--sf-btn-bg': 'linear-gradient(90deg, #38bdf8, #6366f1)',
                '--sf-btn-text': '#ffffff',
                '--sf-header-bg': 'rgba(239,246,255,0.95)',
                '--sf-footer-bg': '#eff6ff',
                '--sf-card-bg': 'rgba(255,255,255,0.55)',
                '--sf-border': 'rgba(59,130,246,0.2)',
                '--sf-heading-color': '#082f49',
                '--sf-link-color': '#1d4ed8',
            }
        },
        {
            id: 'cherry-wave',
            name: 'Cherry Wave',
            type: 'gradient',
            preview: 'linear-gradient(135deg, #7f1d1d 0%, #be123c 45%, #f472b6 100%)',
            vars: {
                '--sf-bg': 'linear-gradient(135deg, #3f0a1d 0%, #881337 45%, #f472b6 100%)',
                '--sf-section-bg': 'linear-gradient(135deg, #3f0a1d 0%, #881337 45%, #f472b6 100%)',
                '--sf-text': '#fff1f2',
                '--sf-text-muted': 'rgba(255,241,242,0.75)',
                '--sf-accent': '#fb7185',
                '--sf-btn-bg': 'linear-gradient(90deg, #fb7185, #f9a8d4)',
                '--sf-btn-text': '#4c0519',
                '--sf-header-bg': 'rgba(63,10,29,0.95)',
                '--sf-footer-bg': 'rgba(44,4,15,0.98)',
                '--sf-card-bg': 'rgba(255,255,255,0.12)',
                '--sf-border': 'rgba(251,113,133,0.25)',
                '--sf-heading-color': '#ffffff',
                '--sf-link-color': '#fecdd3',
            }
        },
        // ---- BLOB ----
        {
            id: 'blob-violet',
            name: 'Blob Violet',
            type: 'blob',
            preview: 'radial-gradient(ellipse at 20% 20%, #7c3aed 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #4f46e5 0%, transparent 60%), #0f0023',
            vars: {
                '--sf-bg': '#0f0023',
                '--sf-section-bg': '#0f0023',
                '--sf-text': '#f5f3ff',
                '--sf-text-muted': '#c4b5fd',
                '--sf-accent': '#8b5cf6',
                '--sf-btn-bg': 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                '--sf-btn-text': '#ffffff',
                '--sf-header-bg': 'rgba(15,0,35,0.95)',
                '--sf-footer-bg': '#06000f',
                '--sf-card-bg': 'rgba(124,58,237,0.15)',
                '--sf-border': 'rgba(139,92,246,0.3)',
                '--sf-heading-color': '#ede9fe',
                '--sf-link-color': '#a78bfa',
                '--sf-blob-1': 'radial-gradient(ellipse at 15% 15%, rgba(124,58,237,0.55) 0%, transparent 55%)',
                '--sf-blob-2': 'radial-gradient(ellipse at 85% 85%, rgba(79,70,229,0.45) 0%, transparent 55%)',
                '--sf-blob-3': 'radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.15) 0%, transparent 65%)',
            }
        },
        {
            id: 'blob-coral',
            name: 'Blob Coral',
            type: 'blob',
            preview: 'radial-gradient(ellipse at 20% 20%, #f43f5e 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #fb923c 0%, transparent 60%), #1a0a00',
            vars: {
                '--sf-bg': '#1a0500',
                '--sf-section-bg': '#1a0500',
                '--sf-text': '#fff7f5',
                '--sf-text-muted': '#fda4af',
                '--sf-accent': '#fb7185',
                '--sf-btn-bg': 'linear-gradient(135deg, #f43f5e, #fb923c)',
                '--sf-btn-text': '#ffffff',
                '--sf-header-bg': 'rgba(26,5,0,0.95)',
                '--sf-footer-bg': '#0d0200',
                '--sf-card-bg': 'rgba(244,63,94,0.12)',
                '--sf-border': 'rgba(251,113,133,0.3)',
                '--sf-heading-color': '#ffe4e6',
                '--sf-link-color': '#fb7185',
                '--sf-blob-1': 'radial-gradient(ellipse at 10% 20%, rgba(244,63,94,0.5) 0%, transparent 55%)',
                '--sf-blob-2': 'radial-gradient(ellipse at 90% 80%, rgba(251,146,60,0.45) 0%, transparent 55%)',
                '--sf-blob-3': 'radial-gradient(ellipse at 60% 40%, rgba(251,113,133,0.2) 0%, transparent 60%)',
            }
        },
        {
            id: 'blob-nebula',
            name: 'Nebula',
            type: 'blob',
            preview: 'radial-gradient(ellipse at 30% 20%, #db2777 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, #4f46e5 0%, transparent 60%), #0f172a',
            vars: {
                '--sf-bg': '#0f172a', '--sf-section-bg': '#0f172a', '--sf-text': '#f8fafc',
                '--sf-text-muted': '#cbd5e1', '--sf-accent': '#ec4899', '--sf-btn-bg': 'linear-gradient(135deg, #db2777, #4f46e5)',
                '--sf-btn-text': '#ffffff', '--sf-header-bg': 'rgba(15,23,42,0.95)', '--sf-footer-bg': '#020617',
                '--sf-card-bg': 'rgba(219,39,119,0.1)', '--sf-border': 'rgba(236,72,153,0.2)',
                '--sf-heading-color': '#fdf2f8', '--sf-link-color': '#f472b6',
                '--sf-blob-1': 'radial-gradient(ellipse at 20% 30%, rgba(219,39,119,0.4) 0%, transparent 60%)',
                '--sf-blob-2': 'radial-gradient(ellipse at 80% 70%, rgba(79,70,229,0.3) 0%, transparent 60%)',
                '--sf-blob-3': 'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.15) 0%, transparent 65%)',
            }
        },
        {
            id: 'blob-cyberpunk',
            name: 'Cyberpunk',
            type: 'blob',
            preview: 'radial-gradient(ellipse at 20% 80%, #06b6d4 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #eab308 0%, transparent 50%), #09090b',
            vars: {
                '--sf-bg': '#09090b', '--sf-section-bg': '#09090b', '--sf-text': '#fafafa',
                '--sf-text-muted': '#a1a1aa', '--sf-accent': '#06b6d4', '--sf-btn-bg': 'linear-gradient(135deg, #06b6d4, #eab308)',
                '--sf-btn-text': '#000000', '--sf-header-bg': 'rgba(9,9,11,0.95)', '--sf-footer-bg': '#000000',
                '--sf-card-bg': 'rgba(6,182,212,0.1)', '--sf-border': 'rgba(234,179,8,0.3)',
                '--sf-heading-color': '#cffafe', '--sf-link-color': '#22d3ee',
                '--sf-blob-1': 'radial-gradient(ellipse at 15% 85%, rgba(6,182,212,0.35) 0%, transparent 50%)',
                '--sf-blob-2': 'radial-gradient(ellipse at 85% 15%, rgba(234,179,8,0.25) 0%, transparent 50%)',
                '--sf-blob-3': 'radial-gradient(ellipse at 50% 50%, rgba(236,72,153,0.15) 0%, transparent 65%)',
            }
        },
        {
            id: 'blob-mint',
            name: 'Mint Splash',
            type: 'blob',
            preview: 'radial-gradient(ellipse at 20% 20%, #10b981 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #3b82f6 0%, transparent 60%), #f0fdf4',
            vars: {
                '--sf-bg': '#f0fdf4', '--sf-section-bg': '#f0fdf4', '--sf-text': '#064e3b',
                '--sf-text-muted': '#059669', '--sf-accent': '#10b981', '--sf-btn-bg': 'linear-gradient(135deg, #10b981, #3b82f6)',
                '--sf-btn-text': '#ffffff', '--sf-header-bg': 'rgba(240,253,244,0.95)', '--sf-footer-bg': '#d1fae5',
                '--sf-card-bg': 'rgba(255,255,255,0.7)', '--sf-border': 'rgba(16,185,129,0.2)',
                '--sf-heading-color': '#022c22', '--sf-link-color': '#059669',
                '--sf-blob-1': 'radial-gradient(ellipse at 15% 25%, rgba(16,185,129,0.3) 0%, transparent 55%)',
                '--sf-blob-2': 'radial-gradient(ellipse at 85% 75%, rgba(59,130,246,0.25) 0%, transparent 55%)',
                '--sf-blob-3': 'radial-gradient(ellipse at 60% 40%, rgba(99,102,241,0.15) 0%, transparent 60%)',
            }
        },
        {
            id: 'blob-sunset',
            name: 'Mango Sunset',
            type: 'blob',
            preview: 'radial-gradient(ellipse at 20% 80%, #f97316 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #f43f5e 0%, transparent 60%), #fff7ed',
            vars: {
                '--sf-bg': '#fff7ed', '--sf-section-bg': '#fff7ed', '--sf-text': '#431407',
                '--sf-text-muted': '#9a3412', '--sf-accent': '#f97316', '--sf-btn-bg': 'linear-gradient(135deg, #f97316, #f43f5e)',
                '--sf-btn-text': '#ffffff', '--sf-header-bg': 'rgba(255,247,237,0.95)', '--sf-footer-bg': '#ffedd5',
                '--sf-card-bg': 'rgba(255,255,255,0.7)', '--sf-border': 'rgba(249,115,22,0.2)',
                '--sf-heading-color': '#7c2d12', '--sf-link-color': '#ea580c',
                '--sf-blob-1': 'radial-gradient(ellipse at 10% 80%, rgba(249,115,22,0.25) 0%, transparent 55%)',
                '--sf-blob-2': 'radial-gradient(ellipse at 90% 20%, rgba(244,63,94,0.2) 0%, transparent 55%)',
                '--sf-blob-3': 'radial-gradient(ellipse at 50% 50%, rgba(234,179,8,0.15) 0%, transparent 65%)',
            }
        },
        {
            id: 'blob-emerald',
            name: 'Emerald Core',
            type: 'blob',
            preview: 'radial-gradient(ellipse at 50% 50%, #059669 0%, transparent 70%), #022c22',
            vars: {
                '--sf-bg': '#022c22', '--sf-section-bg': '#022c22', '--sf-text': '#ecfdf5',
                '--sf-text-muted': '#6ee7b7', '--sf-accent': '#10b981', '--sf-btn-bg': 'linear-gradient(135deg, #059669, #047857)',
                '--sf-btn-text': '#ffffff', '--sf-header-bg': 'rgba(2,44,34,0.95)', '--sf-footer-bg': '#064e3b',
                '--sf-card-bg': 'rgba(5,150,105,0.1)', '--sf-border': 'rgba(16,185,129,0.2)',
                '--sf-heading-color': '#d1fae5', '--sf-link-color': '#34d399',
                '--sf-blob-1': 'radial-gradient(ellipse at 50% 50%, rgba(5,150,105,0.4) 0%, transparent 65%)',
                '--sf-blob-2': 'radial-gradient(ellipse at 10% 10%, rgba(4,120,87,0.3) 0%, transparent 55%)',
                '--sf-blob-3': 'radial-gradient(ellipse at 90% 90%, rgba(6,78,59,0.2) 0%, transparent 65%)',
            }
        },
        {
            id: 'blob-ice',
            name: 'Ice Cave',
            type: 'blob',
            preview: 'radial-gradient(ellipse at 20% 20%, #38bdf8 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #818cf8 0%, transparent 60%), #f0f9ff',
            vars: {
                '--sf-bg': '#f0f9ff', '--sf-section-bg': '#f0f9ff', '--sf-text': '#0c4a6e',
                '--sf-text-muted': '#0284c7', '--sf-accent': '#0ea5e9', '--sf-btn-bg': 'linear-gradient(135deg, #38bdf8, #818cf8)',
                '--sf-btn-text': '#ffffff', '--sf-header-bg': 'rgba(240,249,255,0.95)', '--sf-footer-bg': '#e0f2fe',
                '--sf-card-bg': 'rgba(255,255,255,0.8)', '--sf-border': 'rgba(56,189,248,0.3)',
                '--sf-heading-color': '#082f49', '--sf-link-color': '#0284c7',
                '--sf-blob-1': 'radial-gradient(ellipse at 15% 15%, rgba(56,189,248,0.2) 0%, transparent 55%)',
                '--sf-blob-2': 'radial-gradient(ellipse at 85% 85%, rgba(129,140,248,0.15) 0%, transparent 55%)',
                '--sf-blob-3': 'radial-gradient(ellipse at 50% 50%, rgba(14,165,233,0.1) 0%, transparent 60%)',
            }
        },
        {
            id: 'blob-lava',
            name: 'Magma Core',
            type: 'blob',
            preview: 'radial-gradient(ellipse at 50% 50%, #dc2626 0%, transparent 70%), #450a0a',
            vars: {
                '--sf-bg': '#450a0a', '--sf-section-bg': '#450a0a', '--sf-text': '#fef2f2',
                '--sf-text-muted': '#fca5a5', '--sf-accent': '#ef4444', '--sf-btn-bg': 'linear-gradient(135deg, #ef4444, #b91c1c)',
                '--sf-btn-text': '#ffffff', '--sf-header-bg': 'rgba(69,10,10,0.95)', '--sf-footer-bg': '#2c0606',
                '--sf-card-bg': 'rgba(220,38,38,0.15)', '--sf-border': 'rgba(239,68,68,0.3)',
                '--sf-heading-color': '#fee2e2', '--sf-link-color': '#ef4444',
                '--sf-blob-1': 'radial-gradient(ellipse at 50% 50%, rgba(220,38,38,0.45) 0%, transparent 65%)',
                '--sf-blob-2': 'radial-gradient(ellipse at 15% 85%, rgba(185,28,28,0.35) 0%, transparent 55%)',
                '--sf-blob-3': 'radial-gradient(ellipse at 85% 15%, rgba(153,27,27,0.25) 0%, transparent 55%)',
            }
        },
        {
            id: 'blob-orchid',
            name: 'Orchid Bloom',
            type: 'blob',
            preview: 'radial-gradient(ellipse at 20% 80%, #d946ef 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #a855f7 0%, transparent 60%), #fdf4ff',
            vars: {
                '--sf-bg': '#fdf4ff', '--sf-section-bg': '#fdf4ff', '--sf-text': '#4a044e',
                '--sf-text-muted': '#86198f', '--sf-accent': '#d946ef', '--sf-btn-bg': 'linear-gradient(135deg, #d946ef, #a855f7)',
                '--sf-btn-text': '#ffffff', '--sf-header-bg': 'rgba(253,244,255,0.95)', '--sf-footer-bg': '#fae8ff',
                '--sf-card-bg': 'rgba(255,255,255,0.8)', '--sf-border': 'rgba(217,70,239,0.3)',
                '--sf-heading-color': '#701a75', '--sf-link-color': '#c026d3',
                '--sf-blob-1': 'radial-gradient(ellipse at 15% 85%, rgba(217,70,239,0.2) 0%, transparent 55%)',
                '--sf-blob-2': 'radial-gradient(ellipse at 85% 15%, rgba(168,85,247,0.15) 0%, transparent 55%)',
                '--sf-blob-3': 'radial-gradient(ellipse at 50% 50%, rgba(236,72,153,0.1) 0%, transparent 60%)',
            }
        },
        {
            id: 'blob-abyss',
            name: 'The Abyss',
            type: 'blob',
            preview: 'radial-gradient(ellipse at 80% 80%, #1e1b4b 0%, transparent 70%), #000000',
            vars: {
                '--sf-bg': '#000000', '--sf-section-bg': '#000000', '--sf-text': '#e0e7ff',
                '--sf-text-muted': '#818cf8', '--sf-accent': '#6366f1', '--sf-btn-bg': 'linear-gradient(135deg, #4f46e5, #3730a3)',
                '--sf-btn-text': '#ffffff', '--sf-header-bg': 'rgba(0,0,0,0.95)', '--sf-footer-bg': '#050510',
                '--sf-card-bg': 'rgba(30,27,75,0.4)', '--sf-border': 'rgba(79,70,229,0.3)',
                '--sf-heading-color': '#ffffff', '--sf-link-color': '#818cf8',
                '--sf-blob-1': 'radial-gradient(ellipse at 80% 80%, rgba(49,46,129,0.5) 0%, transparent 65%)',
                '--sf-blob-2': 'radial-gradient(ellipse at 20% 20%, rgba(30,27,75,0.4) 0%, transparent 55%)',
                '--sf-blob-3': 'radial-gradient(ellipse at 50% 80%, rgba(55,48,163,0.2) 0%, transparent 60%)',
            }
        },
        {
            id: 'blob-peach',
            name: 'Soft Peach',
            type: 'blob',
            preview: 'radial-gradient(ellipse at 20% 20%, #fca5a5 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #fdba74 0%, transparent 60%), #fff1f2',
            vars: {
                '--sf-bg': '#fff1f2', '--sf-section-bg': '#fff1f2', '--sf-text': '#4c0519',
                '--sf-text-muted': '#9f1239', '--sf-accent': '#f43f5e', '--sf-btn-bg': 'linear-gradient(135deg, #fca5a5, #fdba74)',
                '--sf-btn-text': '#4c0519', '--sf-header-bg': 'rgba(255,241,242,0.95)', '--sf-footer-bg': '#ffe4e6',
                '--sf-card-bg': 'rgba(255,255,255,0.85)', '--sf-border': 'rgba(252,165,165,0.4)',
                '--sf-heading-color': '#881337', '--sf-link-color': '#e11d48',
                '--sf-blob-1': 'radial-gradient(ellipse at 15% 25%, rgba(252,165,165,0.3) 0%, transparent 55%)',
                '--sf-blob-2': 'radial-gradient(ellipse at 85% 75%, rgba(253,186,116,0.25) 0%, transparent 55%)',
                '--sf-blob-3': 'radial-gradient(ellipse at 50% 50%, rgba(244,63,94,0.1) 0%, transparent 60%)',
            }
        },
        {
            id: 'blob-lagoon',
            name: 'Lagoon Bloom',
            type: 'blob',
            preview: 'radial-gradient(ellipse at 15% 25%, #14b8a6 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, #22d3ee 0%, transparent 55%), #052f2d',
            vars: {
                '--sf-bg': '#052f2d',
                '--sf-section-bg': '#052f2d',
                '--sf-text': '#ecfeff',
                '--sf-text-muted': '#99f6e4',
                '--sf-accent': '#2dd4bf',
                '--sf-btn-bg': 'linear-gradient(135deg, #14b8a6, #22d3ee)',
                '--sf-btn-text': '#042f2e',
                '--sf-header-bg': 'rgba(5,47,45,0.94)',
                '--sf-footer-bg': '#021b1a',
                '--sf-card-bg': 'rgba(34,211,238,0.12)',
                '--sf-border': 'rgba(45,212,191,0.25)',
                '--sf-heading-color': '#ffffff',
                '--sf-link-color': '#67e8f9',
                '--sf-blob-1': 'radial-gradient(circle at 18% 22%, rgba(20,184,166,0.55) 0%, rgba(20,184,166,0.18) 22%, transparent 46%)',
                '--sf-blob-2': 'radial-gradient(circle at 80% 18%, rgba(34,211,238,0.45) 0%, rgba(34,211,238,0.16) 20%, transparent 44%)',
                '--sf-blob-3': 'radial-gradient(circle at 74% 78%, rgba(16,185,129,0.4) 0%, rgba(16,185,129,0.14) 22%, transparent 46%)',
                '--sf-blob-4': 'radial-gradient(circle at 30% 75%, rgba(125,211,252,0.26) 0%, transparent 42%)',
            }
        },
        {
            id: 'blob-candy-cloud',
            name: 'Candy Cloud',
            type: 'blob',
            preview: 'radial-gradient(ellipse at 20% 25%, #fb7185 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, #c084fc 0%, transparent 55%), #fff7fb',
            vars: {
                '--sf-bg': '#fff7fb',
                '--sf-section-bg': '#fff7fb',
                '--sf-text': '#701a75',
                '--sf-text-muted': '#a855f7',
                '--sf-accent': '#ec4899',
                '--sf-btn-bg': 'linear-gradient(135deg, #fb7185, #c084fc)',
                '--sf-btn-text': '#ffffff',
                '--sf-header-bg': 'rgba(255,247,251,0.95)',
                '--sf-footer-bg': '#f5d0fe',
                '--sf-card-bg': 'rgba(255,255,255,0.78)',
                '--sf-border': 'rgba(236,72,153,0.22)',
                '--sf-heading-color': '#4a044e',
                '--sf-link-color': '#db2777',
                '--sf-blob-1': 'radial-gradient(circle at 18% 22%, rgba(251,113,133,0.34) 0%, rgba(251,113,133,0.12) 22%, transparent 44%)',
                '--sf-blob-2': 'radial-gradient(circle at 82% 24%, rgba(192,132,252,0.32) 0%, rgba(192,132,252,0.12) 22%, transparent 44%)',
                '--sf-blob-3': 'radial-gradient(circle at 70% 78%, rgba(244,114,182,0.24) 0%, transparent 42%)',
                '--sf-blob-4': 'radial-gradient(circle at 28% 76%, rgba(253,186,116,0.22) 0%, transparent 42%)',
            }
        },
        {
            id: 'blob-electric-lime',
            name: 'Electric Lime',
            type: 'blob',
            preview: 'radial-gradient(ellipse at 20% 80%, #a3e635 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, #22c55e 0%, transparent 55%), #0b1410',
            vars: {
                '--sf-bg': '#0b1410',
                '--sf-section-bg': '#0b1410',
                '--sf-text': '#f7fee7',
                '--sf-text-muted': '#bef264',
                '--sf-accent': '#a3e635',
                '--sf-btn-bg': 'linear-gradient(135deg, #a3e635, #22c55e)',
                '--sf-btn-text': '#14230f',
                '--sf-header-bg': 'rgba(11,20,16,0.95)',
                '--sf-footer-bg': '#050905',
                '--sf-card-bg': 'rgba(132,204,22,0.12)',
                '--sf-border': 'rgba(163,230,53,0.22)',
                '--sf-heading-color': '#ffffff',
                '--sf-link-color': '#d9f99d',
                '--sf-blob-1': 'radial-gradient(circle at 16% 80%, rgba(163,230,53,0.4) 0%, rgba(163,230,53,0.13) 20%, transparent 42%)',
                '--sf-blob-2': 'radial-gradient(circle at 82% 18%, rgba(34,197,94,0.34) 0%, rgba(34,197,94,0.11) 20%, transparent 42%)',
                '--sf-blob-3': 'radial-gradient(circle at 52% 46%, rgba(74,222,128,0.2) 0%, transparent 38%)',
                '--sf-blob-4': 'radial-gradient(circle at 74% 74%, rgba(190,242,100,0.16) 0%, transparent 34%)',
            }
        },
        {
            id: 'blob-moondust',
            name: 'Moondust',
            type: 'blob',
            preview: 'radial-gradient(ellipse at 25% 20%, #e2e8f0 0%, transparent 55%), radial-gradient(ellipse at 75% 80%, #93c5fd 0%, transparent 55%), #0f172a',
            vars: {
                '--sf-bg': '#0f172a',
                '--sf-section-bg': '#0f172a',
                '--sf-text': '#f8fafc',
                '--sf-text-muted': '#cbd5e1',
                '--sf-accent': '#93c5fd',
                '--sf-btn-bg': 'linear-gradient(135deg, #93c5fd, #c4b5fd)',
                '--sf-btn-text': '#0f172a',
                '--sf-header-bg': 'rgba(15,23,42,0.95)',
                '--sf-footer-bg': '#020617',
                '--sf-card-bg': 'rgba(148,163,184,0.12)',
                '--sf-border': 'rgba(148,163,184,0.24)',
                '--sf-heading-color': '#ffffff',
                '--sf-link-color': '#bfdbfe',
                '--sf-blob-1': 'radial-gradient(circle at 20% 20%, rgba(226,232,240,0.26) 0%, rgba(226,232,240,0.1) 20%, transparent 42%)',
                '--sf-blob-2': 'radial-gradient(circle at 78% 24%, rgba(147,197,253,0.24) 0%, rgba(147,197,253,0.08) 20%, transparent 42%)',
                '--sf-blob-3': 'radial-gradient(circle at 70% 76%, rgba(196,181,253,0.2) 0%, transparent 40%)',
                '--sf-blob-4': 'radial-gradient(circle at 30% 78%, rgba(148,163,184,0.14) 0%, transparent 36%)',
            }
        }
    ];

    function resolveThemeVars(theme) {
        const vars = { ...(theme?.vars || {}) };
        if (theme?.type === 'blob' && vars['--sf-blob-1']) {
            const layers = [
                vars['--sf-blob-1'],
                vars['--sf-blob-2'],
                vars['--sf-blob-3'],
                vars['--sf-blob-4'],
                vars['--sf-bg']
            ].filter(Boolean);
            vars['--sf-section-bg'] = layers.join(', ');
        }
        return vars;
    }

    const themeOverrides = `
/* Backgrounds */
section:not(.block-actions *), header:not(.block-actions *), footer:not(.block-actions *), nav:not(.block-actions *), .sf-hero:not(.block-actions *), .sf-section:not(.block-actions *) {
  background: var(--sf-section-bg) !important;
}
nav:not(.block-actions *), .sf-navbar:not(.block-actions *) {
  background: var(--sf-header-bg) !important;
}
footer:not(.block-actions *), .sf-footer:not(.block-actions *) {
  background: var(--sf-footer-bg) !important;
}
.sf-footer:not(.block-actions *),
.sf-footer:not(.block-actions *) p,
.sf-footer:not(.block-actions *) li,
.sf-footer:not(.block-actions *) div,
.sf-footer:not(.block-actions *) span {
  color: var(--sf-text-muted, var(--sf-text)) !important;
}
.sf-footer:not(.block-actions *) h1,
.sf-footer:not(.block-actions *) h2,
.sf-footer:not(.block-actions *) h3,
.sf-footer:not(.block-actions *) h4,
.sf-footer:not(.block-actions *) h5,
.sf-footer:not(.block-actions *) h6 {
  color: var(--sf-heading-color, var(--sf-text)) !important;
}
.sf-footer:not(.block-actions *) a {
  color: var(--sf-link-color, var(--sf-accent)) !important;
}

/* Headings */
h1:not(.block-actions *), h2:not(.block-actions *), h3:not(.block-actions *), h4:not(.block-actions *), h5:not(.block-actions *), h6:not(.block-actions *), .nav-brand:not(.block-actions *) {
  color: var(--sf-heading-color, var(--sf-text)) !important;
}

/* Base Text */
p:not(.block-actions *), li:not(.block-actions *), span:not(.nav-brand):not(.block-actions *), div[style*="color:"]:not(.canvas-block *), label:not(.block-actions *) {
  color: var(--sf-text-muted, var(--sf-text)) !important;
}

/* Links */
a:not([style*="padding"]):not(.block-actions *) {
  color: var(--sf-link-color, var(--sf-accent)) !important;
}

/* Buttons */
button:not(.block-actions *):not(.tb-btn):not(.tab-btn):not(.sf-accordion-trigger), 
input[type="submit"]:not(.block-actions *), 
input[type="button"]:not(.block-actions *),
a[style*="padding"][style*="background"]:not(.block-actions *),
a[class*="btn"]:not(.block-actions *),
.sf-btn:not(.block-actions *) {
  background: var(--sf-btn-bg) !important;
  color: var(--sf-btn-text) !important;
  border-color: transparent !important;
}

/* Outline Buttons */
a[style*="padding"][style*="border"]:not([style*="background"]):not(.block-actions *),
a[class*="btn-outline"]:not(.block-actions *),
.hero-btn-sec:not(.block-actions *) {
  background: transparent !important;
  color: var(--sf-accent) !important;
  border-color: var(--sf-accent) !important;
}

/* Icons */
i[class*="fa-"]:not(.block-actions *):not(.tb-btn *):not(.tab-btn *):not(.layer-item *):not(.palette-item *) {
  color: var(--sf-accent) !important;
}

/* Inputs */
input:not([type="submit"]):not([type="button"]):not(.block-actions *), textarea:not(.block-actions *), select:not(.block-actions *) {
  background: var(--sf-card-bg) !important;
  color: var(--sf-text) !important;
  border-color: var(--sf-border) !important;
}

/* Cards / Inner Boxes (Pattern matching inline styles) */
div[style*="box-shadow"][style*="border-radius"]:not(.block-actions *):not(.canvas-block > div):not(.icon-picker-panel), 
div[style*="background:#fff"]:not(.block-actions *):not(.canvas-block > div):not(.icon-picker-panel), 
div[style*="background: #fff"]:not(.block-actions *):not(.canvas-block > div):not(.icon-picker-panel), 
div[style*="background:#ffffff"]:not(.block-actions *):not(.canvas-block > div):not(.icon-picker-panel),
div[style*="background: #ffffff"]:not(.block-actions *):not(.canvas-block > div):not(.icon-picker-panel) {
  background: var(--sf-card-bg) !important;
  border-color: var(--sf-border) !important;
}

/* hr */
hr:not(.block-actions *) { border-color: var(--sf-border) !important; }
`;

    let _activeId = null;

    function getAll() { return THEMES; }
    function getActive() { return THEMES.find(t => t.id === _activeId) || null; }
    function getActiveId() { return _activeId; }
    function getActiveVars() {
        const theme = getActive();
        return theme ? resolveThemeVars(theme) : null;
    }
    function getThemeVars(id) {
        const theme = THEMES.find(t => t.id === id);
        return theme ? resolveThemeVars(theme) : null;
    }

    function apply(id, shouldTrackHistory = true) {
        const theme = THEMES.find(t => t.id === id);
        if (!theme) return;
        _activeId = id;
        const resolvedVars = resolveThemeVars(theme);

        // Remove old style tag
        let style = document.getElementById('sf-theme-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'sf-theme-style';
            document.head.appendChild(style);
        }

        // Build CSS from vars, scoped to #canvas
        const lines = Object.entries(resolvedVars).map(([k, v]) => `  ${k}: ${v};`).join('\n');
        let css = `#canvas {\n${lines}\n}\n`;

        // For blob themes, inject decorative pseudo blobs on the canvas
        if (theme.type === 'blob' && resolvedVars['--sf-blob-1']) {
            css += `
#canvas::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 0;
  background:
    ${resolvedVars['--sf-blob-1'] || ''},
    ${resolvedVars['--sf-blob-2'] || ''},
    ${resolvedVars['--sf-blob-3'] || ''};
  filter: blur(28px) saturate(120%);
  transform: scale(1.08);
  opacity: 0.95;
}
#canvas::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 0;
  background:
    ${resolvedVars['--sf-blob-4'] || resolvedVars['--sf-blob-3'] || ''},
    ${resolvedVars['--sf-blob-2'] || ''};
  filter: blur(54px);
  transform: scale(1.14);
  opacity: 0.68;
}
`;
        } else {
            css += `#canvas::before { display: none; }\n#canvas::after { display: none; }\n`;
        }

        // Apply universal overrides to canvas blocks
        css += themeOverrides.split('\n').map(line => {
            if (line.trim().length === 0 || line.startsWith('/*')) return line;
            if (line.includes('{')) return '#canvas ' + line.split(',').join(', #canvas ');
            return line;
        }).join('\n');

        style.textContent = css;

        // Save to state and force-refresh saved project colors/backgrounds to match the theme
        if (typeof State !== 'undefined') {
            State.applyThemeToProject(resolvedVars, false);
            State.setTheme(id, shouldTrackHistory);
        }

        // Update active card in modal
        document.querySelectorAll('.theme-card').forEach(c => {
            c.classList.toggle('active', c.dataset.themeId === id);
        });
    }

    function clear() {
        _activeId = null;
        const style = document.getElementById('sf-theme-style');
        if (style) style.remove();
        if (typeof State !== 'undefined') State.setTheme(null, true);
        document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
    }

    function buildCSSVars() {
        const theme = getActive();
        if (!theme) return '';
        const resolvedVars = resolveThemeVars(theme);
        
        // 1. Root variables
        let css = ':root {\n' + Object.entries(resolvedVars).map(([k, v]) => `  ${k}: ${v};`).join('\n') + '\n}\n\n';
        
        // 2. Blob generator (applied to body for exported sites)
        if (theme.type === 'blob' && resolvedVars['--sf-blob-1']) {
            css += `body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  background:
    ${resolvedVars['--sf-blob-1'] || ''},
    ${resolvedVars['--sf-blob-2'] || ''},
    ${resolvedVars['--sf-blob-3'] || ''};
  filter: blur(30px) saturate(120%);
  transform: scale(1.06);
  opacity: 0.95;
}
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  background:
    ${resolvedVars['--sf-blob-4'] || resolvedVars['--sf-blob-3'] || ''},
    ${resolvedVars['--sf-blob-2'] || ''};
  filter: blur(56px);
  transform: scale(1.12);
  opacity: 0.68;
}\n\n`;
        }
        
        // 3. Universal theme overrides for exported HTML
        css += `\n/* Theme Overrides */\n${themeOverrides}`;
        return css;
    }

    function restore(id) {
        if (!id) return;
        const theme = THEMES.find(t => t.id === id);
        if (theme) {
            _activeId = id;
            apply(id, false);
        }
    }

    return { getAll, getActive, getActiveId, getActiveVars, getThemeVars, apply, clear, buildCSSVars, restore };
})();
