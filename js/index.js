document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initOperatingHours();
});

function initNavbar() {
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const navbarNav = document.getElementById('navbarNav');
  const bsNavbar = new bootstrap.Collapse(navbarNav, {
    toggle: false
  });

  for (const link of navLinks) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      bsNavbar.hide();
      const target = link.getAttribute('href').substring(1);
      document.getElementById(target).scrollIntoView({ behavior: 'smooth' });
    });
  }
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

  document.getElementById('OperatingHours').innerHTML = `${open} to ${close} ${zone}`;
}

async function handleSubmitContact() {
  if (!validateContactForm()) {
    return;
  }

  const submitLoading = document.getElementById('submit-loading');

  submitLoading.classList.remove('d-none');

  const contactForm = document.getElementById('ContactForm');
  const formThanks = document.getElementById('ContactThanksForm');

  const name = document.getElementById('name').value;
  const names = name.split(' ');
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  try {
    webToLead(names.at(0), names.at(-1), email, message);

    const emailResponse = await fetch('https://hunterwebservices-prod.azurewebsites.net/api/SendEmail', {
      method: 'POST',
      body: JSON.stringify({
        type: 'PortfolioContact',
        name,
        email,
        message,
      }),
      mode: 'cors',
    });

    if (emailResponse.ok) {
      contactForm.classList.add('d-none');
      formThanks.classList.remove('d-none');
    }

    submitLoading.classList.add('d-none');
  } catch (ex) {
    handleContactFormFailure(ex, message);
  }
}

function validateContactForm() {
  const emailEl = document.getElementById('email');
  const emailErrorEl = document.getElementById('email-error');
  const messageEl = document.getElementById('message');
  const messageErrorEl = document.getElementById('message-error');

  let isValid = true;

  const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  if (!emailRegex.test(emailEl.value)) {
    emailErrorEl.classList.remove('d-none');
    isValid = false;
  } else {
    emailErrorEl.classList.add('d-none');
  }

  if (!messageEl.value) {
    messageErrorEl.classList.remove('d-none');
    isValid = false;
  } else {
    messageErrorEl.classList.add('d-none');
  }

  return isValid;
}

function handleContactFormFailure(ex, originalMessage) {
  console.error('Contact form submission failed:', ex);

  const contactFailEl = document.getElementById('ContactFormFail');
  const contactFormEl = document.getElementById('ContactForm');
  const originalMessageEl = document.getElementById('OriginalMessage');

  originalMessageEl.value = originalMessage;
  contactFormEl.classList.add('d-none');
  contactFailEl.classList.remove('d-none');
  originalMessageEl.focus();
  originalMessageEl.select();
}

function webToLead(firstName, lastName, email, description) {
  const form = document.createElement('form');

  form.method = 'POST';
  form.action = 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8';
  form.target = 'salesforce';

  form.appendChild(createHiddenInput('oid', '00D8b000002byl2'));
  form.appendChild(createHiddenInput('retURL', 'https://hunterwebapps.dev'));
  form.appendChild(createHiddenInput('debug', '1'));
  form.appendChild(createHiddenInput('debugEmail', 'hunter@hunterwebapps.com'));
  form.appendChild(createHiddenInput('first_name', firstName));
  form.appendChild(createHiddenInput('last_name', lastName));
  form.appendChild(createHiddenInput('email', email));
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
