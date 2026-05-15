document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initOperatingHours();
  initRevealOnScroll();
  initNavbarScrollState();
  initActiveSectionHighlight();
  initContactForm();
  initImageLightbox();
  initFloatingCtaContrast();
  initFloatingCtaScrollReveal();
});

function initNavbar() {
  const navLinks = document.querySelectorAll('.nav-link[href*="#"]');
  const navbarNav = document.getElementById('navbarNav');
  const bsNavbar = new bootstrap.Collapse(navbarNav, {
    toggle: false
  });

  for (const link of navLinks) {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('href').split('#')[1];
      const el = target && document.getElementById(target);
      if (!el) return; // let the browser navigate (e.g. /#X from a sub-page)
      e.preventDefault();
      bsNavbar.hide();
      el.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

function initRevealOnScroll() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || els.length === 0) {
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  els.forEach(el => io.observe(el));
}

function initNavbarScrollState() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const update = () => {
    if (window.scrollY > 12) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initActiveSectionHighlight() {
  const siteNav = document.querySelector('site-nav');
  if (siteNav && siteNav.dataset.active) return;

  const sectionIds = ['CaseStudies', 'WhereWeFit', 'Engagement', 'Contact'];
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const links = new Map(
    Array.from(document.querySelectorAll('.navbar-nav .nav-link[href*="#"]'))
      .map(a => [a.getAttribute('href').split('#')[1], a])
  );
  if (!('IntersectionObserver' in window) || sections.length === 0) return;

  const visible = new Set();
  let lastActiveId = null;

  const computeActiveId = () => {
    if (visible.size > 0) {
      return sectionIds.find(id => visible.has(id)) || null;
    }
    return window.scrollY < 100 ? 'Home' : null;
  };

  const updateActive = () => {
    const next = computeActiveId();
    if (next === lastActiveId) return;
    lastActiveId = next;
    document.querySelectorAll('.navbar-nav .nav-link.active').forEach(a => a.classList.remove('active'));
    if (next) {
      const link = links.get(next);
      if (link) link.classList.add('active');
    }
  };

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target.id);
      else visible.delete(entry.target.id);
    }
    updateActive();
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
  sections.forEach(s => io.observe(s));

  let pending = false;
  window.addEventListener('scroll', () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      updateActive();
    });
  }, { passive: true });

  updateActive();
}

function initImageLightbox() {
  const triggers = document.querySelectorAll('.cs-hero-image');
  if (triggers.length === 0) return;

  let lightbox = null;
  let lightboxImage = null;
  let closeBtn = null;
  let lastFocused = null;

  const closeLightbox = () => {
    if (!lightbox || lightbox.getAttribute('data-open') !== 'true') return;
    lightbox.setAttribute('data-open', 'false');
    document.body.classList.remove('cs-lightbox-open');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  };

  const createLightbox = () => {
    lightbox = document.createElement('div');
    lightbox.className = 'cs-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Image viewer');
    lightbox.setAttribute('data-open', 'false');

    lightboxImage = document.createElement('img');
    lightboxImage.className = 'cs-lightbox-image';
    lightboxImage.alt = '';

    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'cs-lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close image viewer');
    closeBtn.innerHTML = '&times;';

    lightbox.append(lightboxImage, closeBtn);
    document.body.appendChild(lightbox);

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target === lightboxImage) {
        closeLightbox();
      }
    });
    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        closeBtn.focus();
      }
    });
  };

  const openLightbox = (src, alt) => {
    if (!lightbox) createLightbox();
    lightboxImage.src = src;
    lightboxImage.alt = alt || '';
    lightbox.setAttribute('data-open', 'true');
    document.body.classList.add('cs-lightbox-open');
    lastFocused = document.activeElement;
    requestAnimationFrame(() => closeBtn.focus());
  };

  for (const trigger of triggers) {
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('aria-label', `Click to enlarge: ${trigger.alt || 'image'}`);

    trigger.addEventListener('click', () => openLightbox(trigger.src, trigger.alt));
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(trigger.src, trigger.alt);
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

function initFloatingCtaContrast() {
  const cta = document.getElementById('floating-cta');
  if (!cta) return;
  const sections = Array.from(document.querySelectorAll('section, footer'));
  if (sections.length === 0) return;
  let raf = null;
  const update = () => {
    raf = null;
    const ctaRect = cta.getBoundingClientRect();
    const probeY = ctaRect.top + ctaRect.height / 2;
    for (const section of sections) {
      const r = section.getBoundingClientRect();
      if (r.top <= probeY && r.bottom >= probeY) {
        const isDark =
          section.classList.contains('section-dark') ||
          section.classList.contains('hero') ||
          section.classList.contains('site-footer');
        cta.classList.toggle('is-on-dark', isDark);
        return;
      }
    }
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

function initFloatingCtaScrollReveal() {
  const cta = document.getElementById('floating-cta');
  if (!cta) return;
  const sentinel = document.querySelector('.hero .hero-cta') || document.querySelector('.hero');
  if (!sentinel) {
    cta.classList.add('is-past-hero');
    return;
  }
  if (!('IntersectionObserver' in window)) {
    cta.classList.add('is-past-hero');
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      cta.classList.toggle('is-past-hero', !entry.isIntersecting);
    }
  }, { threshold: 0 });
  io.observe(sentinel);
}

function initOperatingHours() {
  const openHour = 9;
  const closeHour = 18;
  const timeZone = 'America/New_York';

  const formatter = new Intl.DateTimeFormat([], {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timeZone
  });

  const open = formatter.format(new Date(2020, 0, 1, openHour, 0));
  const close = formatter.format(new Date(2020, 0, 1, closeHour, 0));
  const zone = new Intl.DateTimeFormat([], { timeZoneName: 'short' })
    .formatToParts(new Date())
    .find(p => p.type === 'timeZoneName')?.value || '';

  const el = document.getElementById('OperatingHours');
  if (el) el.innerHTML = `${open} to ${close} ${zone}`;
}

const EMAIL_REGEX = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

function initContactForm() {
  const form = document.getElementById('ContactForm');
  if (!form) return;

  form.addEventListener('submit', handleSubmitContact);

  const emailEl = document.getElementById('email');
  const messageEl = document.getElementById('message');

  if (emailEl) {
    // Blur: only flag format errors when there's content to validate.
    emailEl.addEventListener('blur', () => {
      if (emailEl.value.trim()) validateEmailField(emailEl);
    });
    // Input: clear existing error as soon as it's valid.
    emailEl.addEventListener('input', () => {
      if (emailEl.getAttribute('aria-invalid') === 'true' && EMAIL_REGEX.test(emailEl.value)) {
        clearFieldError(emailEl, 'email-error');
      }
    });
  }

  if (messageEl) {
    // Clear empty-required error as soon as the user types.
    messageEl.addEventListener('input', () => {
      if (messageEl.getAttribute('aria-invalid') === 'true' && messageEl.value.trim()) {
        clearFieldError(messageEl, 'message-error');
      }
    });
  }
}

function validateEmailField(el) {
  if (!el.value.trim() || !EMAIL_REGEX.test(el.value)) {
    setFieldError(el, 'email-error');
    return false;
  }
  clearFieldError(el, 'email-error');
  return true;
}

function validateMessageField(el) {
  if (!el.value.trim()) {
    setFieldError(el, 'message-error');
    return false;
  }
  clearFieldError(el, 'message-error');
  return true;
}

function setFieldError(inputEl, errorId) {
  inputEl.setAttribute('aria-invalid', 'true');
  inputEl.classList.add('is-invalid');
  const err = document.getElementById(errorId);
  if (err) err.classList.remove('d-none');
}

function clearFieldError(inputEl, errorId) {
  inputEl.removeAttribute('aria-invalid');
  inputEl.classList.remove('is-invalid');
  const err = document.getElementById(errorId);
  if (err) err.classList.add('d-none');
}

function validateContactForm() {
  const emailEl = document.getElementById('email');
  const messageEl = document.getElementById('message');

  const emailOk = validateEmailField(emailEl);
  const messageOk = validateMessageField(messageEl);

  if (!emailOk) {
    emailEl.focus();
    return false;
  }
  if (!messageOk) {
    messageEl.focus();
    return false;
  }
  return true;
}

async function handleSubmitContact(e) {
  e.preventDefault();

  const serverErrorEl = document.getElementById('server-error');
  serverErrorEl.classList.add('d-none');
  serverErrorEl.textContent = '';

  if (!validateContactForm()) return;

  const submitBtn = document.getElementById('recaptcha-submit');
  const labelEl = submitBtn.querySelector('.submit-btn-label');
  const contactForm = document.getElementById('ContactForm');
  const formThanks = document.getElementById('ContactThanksForm');

  const name = document.getElementById('name').value.trim();
  const names = name ? name.split(/\s+/) : [];
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone')?.value.trim() || '';
  const confirmEmail = document.getElementById('confirm_email').value;
  const message = document.getElementById('message').value.trim();

  setSubmitting(submitBtn, labelEl, true);

  try {
    const token = await new Promise((resolve) => {
      grecaptcha.enterprise.ready(async () => {
        resolve(await grecaptcha.enterprise.execute('6LdOBZMsAAAAAAuxSTFA0n2zyfmipK222HVnQyi9', { action: 'CONTACT' }));
      });
    });

    const emailResponse = await fetch('https://hunterwebservices-prod.azurewebsites.net/api/SendEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'PortfolioContact',
        name,
        email,
        phone,
        confirmEmail,
        message,
        recaptchaToken: token,
      }),
      mode: 'cors',
    });

    if (emailResponse.status === 400) {
      const raw = await emailResponse.text();
      const errorText = raw.replace(/^"|"$/g, '');
      serverErrorEl.textContent = errorText || 'Please check your email and try again.';
      serverErrorEl.classList.remove('d-none');
      setSubmitting(submitBtn, labelEl, false);
      return;
    }

    if (!emailResponse.ok) {
      throw new Error('Submission failed');
    }

    webToLead(names.at(0) || '', names.length > 1 ? names.at(-1) : '', email, phone, message);

    showThankYou(contactForm, formThanks, names.at(0), email);

    HWA_TRACKING.identifyVisitor(email, { firstname: names.at(0), lastname: names.at(-1), phone });
    HWA_TRACKING.trackHubSpotEvent('pe_contact_form_submit');
    HWA_TRACKING.pushDataLayerEvent('contact_form_submit', { formType: 'contact', userEmail: email });
    HWA_TRACKING.sendToClayWebhook(Object.assign({
      source: 'contact_form',
      firstName: names.at(0),
      lastName: names.length > 1 ? names.at(-1) : '',
      email,
      phone,
      message,
      pageUrl: window.location.href,
      timestamp: new Date().toISOString()
    }, HWA_TRACKING.getUtmParams()));
  } catch (ex) {
    handleContactFormFailure(ex, message);
  }
}

function setSubmitting(btn, labelEl, isSubmitting) {
  if (!btn) return;
  btn.disabled = isSubmitting;
  btn.classList.toggle('is-submitting', isSubmitting);
  btn.setAttribute('aria-busy', isSubmitting ? 'true' : 'false');
  if (labelEl) labelEl.textContent = isSubmitting ? 'Sending…' : 'Send Message';
}

function showThankYou(formEl, thanksEl, firstName, email) {
  const nameSpan = document.getElementById('ThankYouName');
  if (nameSpan) nameSpan.textContent = firstName ? `, ${firstName}` : '';

  const emailSpan = document.getElementById('ThankYouEmail');
  if (emailSpan) emailSpan.textContent = email || 'your inbox';

  formEl.classList.add('d-none');
  thanksEl.classList.remove('d-none');

  // Soft focus + scroll for screen readers and visual continuity
  requestAnimationFrame(() => {
    thanksEl.focus({ preventScroll: true });
    thanksEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

function handleContactFormFailure(ex, originalMessage) {
  console.error('Contact form submission failed:', ex);

  const contactFailEl = document.getElementById('ContactFormFail');
  const contactFormEl = document.getElementById('ContactForm');
  const originalMessageEl = document.getElementById('OriginalMessage');

  originalMessageEl.value = originalMessage;
  contactFormEl.classList.add('d-none');
  contactFailEl.classList.remove('d-none');

  requestAnimationFrame(() => {
    contactFailEl.focus({ preventScroll: true });
    contactFailEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    originalMessageEl.select();
  });
}

function webToLead(firstName, lastName, email, phone, description) {
  const form = document.createElement('form');

  form.method = 'POST';
  form.action = 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8';
  form.target = 'salesforce';

  form.appendChild(createHiddenInput('oid', '00D8b000002byl2'));
  form.appendChild(createHiddenInput('retURL', 'https://applied3pl.com'));
  form.appendChild(createHiddenInput('debug', '1'));
  form.appendChild(createHiddenInput('debugEmail', 'hello@applied3pl.com'));
  form.appendChild(createHiddenInput('first_name', firstName));
  form.appendChild(createHiddenInput('last_name', lastName));
  form.appendChild(createHiddenInput('email', email));
  if (phone) form.appendChild(createHiddenInput('phone', phone));
  form.appendChild(createHiddenInput('description', description));

  document.body.appendChild(form);

  form.submit();
}

function createHiddenInput(name, value) {
  const input = document.createElement('input');
  input.name = name;
  input.value = value;
  input.setAttribute('type', 'hidden');
  return input;
}
