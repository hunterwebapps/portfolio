document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initOperatingHours();
  initRecentBlogs();
});

let categories = [];

function initNavbar() {
  const navLinks = document.querySelectorAll('[data-href]');
  const navbarNav = document.getElementById('navbarNav');
  const bsNavbar = new bootstrap.Collapse(navbarNav, {
    toggle: false
  });

  for (const link of navLinks) {
    link.addEventListener('click', () => {
      bsNavbar.hide();
      const target = link.getAttribute('data-href');
      document.getElementById(target).scrollIntoView({ behavior: 'smooth' });
    });
  }
}

function initOperatingHours() {
  const timeFormat = 'HH:mm:ssZ';
  const companyBaseTimezone = 'America/New_York';
  const openingHour = '10:00:00';
  const hoursOpen = 8;

  const openMoment = moment.tz(`2020-01-01 ${openingHour}`, companyBaseTimezone);
  const openHour = openMoment.format(timeFormat);
  const closeHour = openMoment.add(hoursOpen, 'hours').format(timeFormat);

  const openDate = new Date(`1970-01-01T${openHour}`);
  const closeDate = new Date(`1970-01-01T${closeHour}`);

  const localeOptions = {
    hour: 'numeric',
    minute: '2-digit'
  };

  const localOpen = openDate.toLocaleTimeString([], localeOptions);
  const localClose = closeDate.toLocaleTimeString([], localeOptions);

  const zoneAbbr = moment.tz(moment.tz.guess()).zoneAbbr();

  const p = document.getElementById('OperatingHours');
  p.innerHTML = `${localOpen} to ${localClose} ${zoneAbbr}`;
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
  appInsights.trackException({ exception: ex });

  const contactFailEl = document.getElementById('ContactFormFail');
  const contactFormEl = document.getElementById('ContactForm');
  const originalMessageEl = document.getElementById('OriginalMessage');

  originalMessageEl.value = originalMessage;
  contactFormEl.classList.add('d-none');
  contactFailEl.classList.remove('d-none');
  originalMessageEl.focus();
  originalMessageEl.select();
}

async function fetchCategories() {
  let response;

  try {
    response = await fetch('https://hunterwebapps.blog/wp-json/wp/v2/categories');
  } catch (ex) {
    return;
  }

  if (!response.ok) {
    return;
  }

  categories = await response.json();
}

function getCategoryNameById(categoryId) {
  const category = categories.find(x => x.id === categoryId);
  return category ? category.name : 'General';
}

async function initRecentBlogs() {
  const fetchCategoriesPromise = fetchCategories();
  const blogPosts = document.getElementById('BlogPostContainer');
  const blogPostsError = document.getElementById('BlogPostError');

  let response;

  try {
    const responsePromise = fetch('https://hunterwebapps.blog/wp-json/wp/v2/posts');

    const results = await Promise.allSettled([responsePromise, fetchCategoriesPromise]);

    response = results[0].value;
  } catch (ex) {
    blogPosts.classList.add('d-none');
    blogPostsError.innerText = 'Network Error. Please check your connection, and refresh your browser.';
    blogPostsError.classList.remove('d-none');
    return;
  }

  if (!response.ok) {
    const response = await response.text();
    appInsights.trackException({ exception: new Error(response) });
    blogPosts.classList.add('d-none');
    blogPostsError.classList.remove('d-none');
    return;
  }

  const body = await response.json();

  blogPosts.innerHTML = '';

  let counter = 0;
  for (const post of body) {
    const blogPostEl = document.createElement('blog-post');
    blogPostEl.setAttribute('title', post.title.rendered);
    blogPostEl.setAttribute('link', post.link);
    blogPostEl.setAttribute('image', post.jetpack_featured_media_url);
    blogPostEl.setAttribute('category', getCategoryNameById(post.categories[0]));
    blogPostEl.setAttribute('date', post.date);
    blogPostEl.setAttribute('index', counter);

    blogPosts.appendChild(blogPostEl);
    counter++;
  }
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
