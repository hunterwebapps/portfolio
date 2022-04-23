new slider('.slides');

const showCalendly = document.getElementById('show-calendly');

showCalendly.addEventListener('click', () => {
  Calendly.initPopupWidget({
    url: 'https://calendly.com/hunter-web-apps/video-consultation?text_color=000000&primary_color=141a46',
  });

  return false;
});

const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', async (e) => {
  const data = new FormData(e.target);

  const response = await fetch({
    url: 'api/EmailService.csx',
    method: 'POST',
    body: data,
  });

  if (response.ok) {
    // TODO: Show thank you.
  }
});
