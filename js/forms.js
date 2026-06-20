// ============================================================
// forms.js – Form Backend Integrations
// Generates proper form action/handling code for export.
// Supports: Formspree, Netlify Forms, EmailJS, Webhook, Google Sheets
// ============================================================

const FormIntegrations = (() => {

    // Available form backend providers
    const PROVIDERS = {
        none: {
            id: 'none',
            name: 'None (Demo Only)',
            description: 'Form shows an alert on submit. No data is sent.',
            fields: [],
            generateFormAttrs: () => ({ action: '#', method: 'POST', extra: 'onsubmit="event.preventDefault();alert(\'Message sent! (Demo)\');"' }),
            generateScript: () => ''
        },
        formspree: {
            id: 'formspree',
            name: 'Formspree',
            description: 'Send form submissions to your email via Formspree.io',
            fields: [
                { key: 'formspreeId', label: 'Formspree Form ID', placeholder: 'xrgbkwyz', required: true }
            ],
            generateFormAttrs: (config) => ({
                action: `https://formspree.io/f/${escAttr(config.formspreeId || '')}`,
                method: 'POST',
                extra: ''
            }),
            generateScript: () => ''
        },
        netlify: {
            id: 'netlify',
            name: 'Netlify Forms',
            description: 'Automatically captured by Netlify when deployed there.',
            fields: [
                { key: 'netlifyFormName', label: 'Form Name', placeholder: 'contact', required: true }
            ],
            generateFormAttrs: (config) => ({
                action: '/thank-you',
                method: 'POST',
                extra: `data-netlify="true" netlify-honeypot="bot-field" name="${escAttr(config.netlifyFormName || 'contact')}"`
            }),
            generateScript: () => '',
            generateHiddenFields: (config) => `<input type="hidden" name="form-name" value="${escAttr(config.netlifyFormName || 'contact')}" /><p style="display:none;"><input name="bot-field" /></p>`
        },
        emailjs: {
            id: 'emailjs',
            name: 'EmailJS',
            description: 'Send emails directly from the browser using EmailJS.',
            fields: [
                { key: 'emailjsPublicKey', label: 'Public Key', placeholder: 'your_public_key', required: true },
                { key: 'emailjsServiceId', label: 'Service ID', placeholder: 'service_xxxxx', required: true },
                { key: 'emailjsTemplateId', label: 'Template ID', placeholder: 'template_xxxxx', required: true }
            ],
            generateFormAttrs: (config) => ({
                action: '#',
                method: 'POST',
                extra: `id="sf-emailjs-form" onsubmit="event.preventDefault();sfSendEmailJS(this);"`
            }),
            generateScript: (config) => `
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
<script>
  emailjs.init("${escAttr(config.emailjsPublicKey || '')}");
  function sfSendEmailJS(form) {
    const btn = form.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    emailjs.sendForm("${escAttr(config.emailjsServiceId || '')}", "${escAttr(config.emailjsTemplateId || '')}", form)
      .then(() => {
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = 'Sent ✓'; }
        setTimeout(() => { if (btn) btn.textContent = 'Send Message'; }, 3000);
      })
      .catch((err) => {
        console.error('EmailJS error:', err);
        if (btn) { btn.disabled = false; btn.textContent = 'Error - Try Again'; }
      });
  }
</script>`
        },
        webhook: {
            id: 'webhook',
            name: 'Webhook (Custom URL)',
            description: 'POST form data as JSON to any URL (Zapier, Make, n8n, custom API).',
            fields: [
                { key: 'webhookUrl', label: 'Webhook URL', placeholder: 'https://hooks.zapier.com/...', required: true },
                { key: 'webhookSuccessMsg', label: 'Success Message', placeholder: 'Thank you! We\'ll be in touch.' }
            ],
            generateFormAttrs: (config) => ({
                action: '#',
                method: 'POST',
                extra: `onsubmit="event.preventDefault();sfSendWebhook(this);"`
            }),
            generateScript: (config) => `
<script>
  async function sfSendWebhook(form) {
    const btn = form.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    const data = Object.fromEntries(new FormData(form));
    try {
      await fetch("${escAttr(config.webhookUrl || '')}", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      form.reset();
      if (btn) { btn.disabled = false; btn.textContent = '${escAttr(config.webhookSuccessMsg || 'Sent ✓')}'; }
      setTimeout(() => { if (btn) btn.textContent = 'Send Message'; }, 3000);
    } catch (err) {
      console.error('Webhook error:', err);
      if (btn) { btn.disabled = false; btn.textContent = 'Error - Try Again'; }
    }
  }
</script>`
        },
        googleSheets: {
            id: 'googleSheets',
            name: 'Google Sheets',
            description: 'Append form submissions as rows in a Google Sheet (via Apps Script web app).',
            fields: [
                { key: 'sheetsWebAppUrl', label: 'Google Apps Script Web App URL', placeholder: 'https://script.google.com/macros/s/.../exec', required: true }
            ],
            generateFormAttrs: (config) => ({
                action: '#',
                method: 'POST',
                extra: `onsubmit="event.preventDefault();sfSendToSheets(this);"`
            }),
            generateScript: (config) => `
<script>
  async function sfSendToSheets(form) {
    const btn = form.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    var formData = new FormData(form);
    var urlEncoded = new URLSearchParams();
    formData.forEach(function(value, key) { urlEncoded.append(key, value); });
    urlEncoded.append('_timestamp', new Date().toLocaleString());
    try {
      await fetch("${escAttr(config.sheetsWebAppUrl || '')}", {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncoded.toString()
      });
      form.reset();
      if (btn) { btn.disabled = false; btn.textContent = 'Saved ✓'; }
      setTimeout(function() { if (btn) btn.textContent = 'Send Message'; }, 3000);
    } catch (err) {
      console.error('Google Sheets error:', err);
      if (btn) { btn.disabled = false; btn.textContent = 'Error - Try Again'; }
    }
  }
</script>`
        }
    };

    /**
     * Get all available providers.
     */
    function getProviders() {
        return Object.values(PROVIDERS);
    }

    /**
     * Get a specific provider by ID.
     */
    function getProvider(id) {
        return PROVIDERS[id] || PROVIDERS.none;
    }

    /**
     * Generate the form opening tag attributes for export.
     * @param {string} providerId - Provider ID
     * @param {object} config - Provider-specific configuration
     * @returns {string} - Complete form opening tag attributes string
     */
    function generateFormTag(providerId, config = {}) {
        const provider = getProvider(providerId);
        const attrs = provider.generateFormAttrs(config);
        let tag = `action="${attrs.action}" method="${attrs.method}"`;
        if (attrs.extra) tag += ' ' + attrs.extra;
        return tag;
    }

    /**
     * Generate any hidden fields needed (e.g., Netlify form-name).
     */
    function generateHiddenFields(providerId, config = {}) {
        const provider = getProvider(providerId);
        if (provider.generateHiddenFields) {
            return provider.generateHiddenFields(config);
        }
        return '';
    }

    /**
     * Generate any external scripts needed for the form backend.
     */
    function generateScript(providerId, config = {}) {
        const provider = getProvider(providerId);
        return provider.generateScript(config);
    }

    /**
     * Generate the complete form HTML for export.
     * Wraps existing form content with proper action/method/scripts.
     */
    function wrapFormForExport(formInnerHtml, providerId, config = {}) {
        const formAttrs = generateFormTag(providerId, config);
        const hidden = generateHiddenFields(providerId, config);
        const script = generateScript(providerId, config);

        return `<form ${formAttrs} style="display:flex;flex-direction:column;gap:14px;">
    ${hidden}
    ${formInnerHtml}
</form>
${script}`;
    }

    /**
     * Get the configuration fields needed for a provider (for the properties panel).
     */
    function getProviderFields(providerId) {
        const provider = getProvider(providerId);
        return provider.fields || [];
    }

    return {
        getProviders,
        getProvider,
        generateFormTag,
        generateHiddenFields,
        generateScript,
        wrapFormForExport,
        getProviderFields,
        PROVIDERS
    };
})();

// Expose globally
if (typeof window !== 'undefined') {
    window.FormIntegrations = FormIntegrations;
}
