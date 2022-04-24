const gotoTop = document.getElementById('backtotop');

const _slider = new slider('.slides', (slideNumber) => {
  if (slideNumber > 1) {
    gotoTop.classList.add('show');
  } else if (slideNumber === 1) {
    gotoTop.classList.remove('show');
  }
});

gotoTop.addEventListener('click', (e) => {
  _slider.gotoSlide('.page-1');
});

const showCalendly = document.getElementById('show-calendly');

showCalendly.addEventListener('click', () => {
  Calendly.initPopupWidget({
    url: 'https://calendly.com/hunter-web-apps/video-consultation?text_color=000000&primary_color=141a46',
  });

  return false;
});

const contactOptions = document.getElementById('contact-options');
const calendarThanks = document.getElementById('contact-thanks-calendar');
const formThanks = document.getElementById('contact-thanks-form');

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

async function handleSubmitContact() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  const response = await fetch('http://localhost:7071/api/SendEmail', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      message,
    }),
  });

  if (response.ok) {
    contactOptions.classList.add('hide');
    formThanks.classList.remove('hide');
  }
}

const nextPageButtons = document.getElementsByTagName('next-page');

for (const nextPageButton of nextPageButtons) {
  nextPageButton.addEventListener('click', (e) => {
    _slider.changeSlide(1);
  });
}
