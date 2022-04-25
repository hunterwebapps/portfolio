const pageSwiper = initPageSwiper();
initCalendly();
initContact();
initNextPageButtons(pageSwiper);
initRecentBlogs();

function initPageSwiper() {
  const swiper = new Swiper('.page-swiper', {
    direction: 'vertical',
    pagination: {
      el: '.page-swiper>.swiper-pagination',
      type: 'progressbar',
    },
    mousewheel: {
      thresholdDelta: 100,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: false,
      pageUpDown: true,
    },
    hashNavigation: true,
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
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    mousewheel: {
      thresholdDelta: 100,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: false,
      pageUpDown: true,
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
      gtag('event', 'Calendly', {
        event_label: e.data.event,
      });

      if (e.data.event === 'calendly.event_scheduled') {
        contactOptions.classList.add('hide');
        calendarThanks.classList.remove('hide');
      }
    }
  });
}

async function handleSubmitContact() {
  const contactOptions = document.getElementById('contact-options');
  const formThanks = document.getElementById('contact-thanks-form');

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  const response = await fetch('https://hunterwebservices-prod.azurewebsites.net/api/SendEmail', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      message,
    }),
    mode: 'cors',
  });

  if (response.ok) {
    contactOptions.classList.add('hide');
    formThanks.classList.remove('hide');
  }
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
  const response = await fetch('https://hunterwebapps.blog/wp-json/wp/v2/posts');

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
        <p>
          ${post.excerpt.rendered}
        </p>
      </a>
    `;
    blogPosts.getElementsByClassName('swiper-wrapper')[0].appendChild(blogPostDiv);
  }

  initPostSwiper();
}
