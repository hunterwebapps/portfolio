const pageSwiper = initPageSwiper();
initCalendly();
initContact();
initNextPageButtons(pageSwiper);
initRecentBlogs();

function initPageSwiper() {
  const swiper = new Swiper('.page-swiper', {
    direction: 'vertical',
    slidesOffsetAfter: 200,
    pagination: {
      el: '.page-swiper>.swiper-pagination',
      type: 'progressbar',
    },
    mousewheel: {
      thresholdDelta: 100,
      forceToAxis: true,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: false,
      pageUpDown: true,
    },
    hashNavigation: true,
    breakpoints: {
      1024: {
        scrollbar: {
          el: '.page-swiper>.swiper-scrollbar',
          draggable: true,
          snapOnRelease: true,
        },
      },
    },
  });

  return swiper;
}

function initPostSwiper() {
  const swiper = new Swiper('.post-swiper', {
    direction: 'horizontal',
    loop: true,
    nested: true,
    centerInsufficientSlides: true,
    spaceBetween: 16,
    slidesPerView: 1.1,
    pagination: {
      el: '.post-swiper>.swiper-pagination',
    },
    navigation: {
      nextEl: '.post-swiper>.swiper-button-next',
      prevEl: '.post-swiper>.swiper-button-prev',
    },
    mousewheel: {
      thresholdDelta: 100,
      forceToAxis: true,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: false,
      pageUpDown: true,
    },
    breakpoints: {
      500: {
        slidesPerView: 2.2,
      },
      992: {
        slidesPerView: 3.2,
      }
    },
  });

  return swiper;
}

function initCalendly() {
  const showCalendly = document.getElementById('show-calendly');

  showCalendly.addEventListener('click', () => {
    Calendly.initPopupWidget({
      url: 'https://calendly.com/hunter-web-apps/video-consultation?text_color=000000&primary_color=141a46',
    });
  });
}

function initContact() {
  const contactOptions = document.getElementById('contact-options');
  const calendarThanks = document.getElementById('contact-thanks-calendar');

  const submitButton = document.getElementById('recaptcha-submit');

  submitButton.setAttribute('data-sitekey', '6LfA7ZYfAAAAAEWfRZggGaIbUBEQNjCtlVAB3uxp');
  submitButton.setAttribute('data-callback', 'handleSubmitContact');

  window.addEventListener('message', (e) => {
    if (e.data.event === '' && e.data.event.indexOf('calendly') === 0) {
      if (e.data.event === 'calendly.event_scheduled') {
        contactOptions.classList.add('hide');
        calendarThanks.classList.remove('hide');
      }
    }
  });
}

async function handleSubmitContact() {
  if (!validateContactForm()) {
    return;
  }

  const submitLoading = document.getElementById('submit-loading');

  submitLoading.classList.remove('hide');

  const contactOptions = document.getElementById('contact-options');
  const formThanks = document.getElementById('contact-thanks-form');

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
      contactOptions.classList.add('hide');
      formThanks.classList.remove('hide');
    }

    submitLoading.classList.add('hide');
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
    emailErrorEl.classList.add('show');
    isValid = false;
  } else {
    emailErrorEl.classList.remove('show');
  }

  if (!messageEl.value) {
    messageErrorEl.classList.add('show');
    isValid = false;
  } else {
    messageErrorEl.classList.remove('show');
  }

  return isValid;
}

function handleContactFormFailure(ex, originalMessage) {
  appInsights.trackException({ exception: ex });

  const contactFailEl = document.getElementById('contact-form-fail');
  const contactOptionsEl = document.getElementById('contact-options');
  const originalMessageEl = document.getElementById('original-message');

  originalMessageEl.value = originalMessage;
  contactOptionsEl.classList.add('hide');
  contactFailEl.classList.remove('hide');
  originalMessageEl.focus();
  originalMessageEl.select();
}

function initNextPageButtons(swiper) {
  const nextPageButtons = document.getElementsByTagName('next-page');

  for (const nextPageButton of nextPageButtons) {
    nextPageButton.addEventListener('click', (e) => {
      swiper.slideNext();
    });
  }
}

async function initRecentBlogs() {
  let response;
  try {
    response = await fetch('https://hunterwebapps.blog/wp-json/wp/v2/posts');
  } catch (ex) {
    handleBlogFailure(ex);
  }

  const blogPosts = document.getElementById('blog-posts');

  if (!response.ok) {
    const blogPostsError = document.getElementById('blog-posts-error');
    blogPosts.classList.add('hide');
    blogPostsError.classList.remove('hide');
    return;
  }

  const body = await response.json();

  for (const post of body) {
    const blogPostDiv = document.createElement('div');
    blogPostDiv.classList.add('swiper-slide');
    blogPostDiv.innerHTML = `
      <a href="${post.link}" class="blog-card">
        <img src="${post.jetpack_featured_media_url}" alt="${post.title.rendered}">
        <div class="blog-description">
          ${post.title.rendered}
        </div>
      </a>
    `;
    blogPosts.getElementsByClassName('swiper-wrapper')[0].appendChild(blogPostDiv);
  }

  initPostSwiper();
}

function handleBlogFailure(ex) {
  appInsights.trackException({ exception: ex });

  const blogEl = document.getElementById('blog-posts');
  const blogFailEl = document.getElementById('blog-posts-error');

  blogEl.classList.add('hide');
  blogFailEl.classList.remove('hide');
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
