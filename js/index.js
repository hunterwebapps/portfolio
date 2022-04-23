new slider('.slides');

const showCalendly = document.getElementById('show-calendly');

showCalendly.addEventListener('click', () => {
  Calendly.initPopupWidget({
    url: 'https://calendly.com/hunter-web-apps/video-consultation?text_color=000000&primary_color=141a46',
  });

  return false;
});

window.addEventListener('message', (e) => {
  if (e.data.event === '' && e.data.event.indexOf('calendly') === 0) {
    gtag('event', 'Calendly', {
      event_label: e.data.event,
    })
  }
});

async function handleSubmitContact() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  const data = new FormData();
  data.set('name', name);
  data.set('email', email);
  data.set('message', message);

  const response = await fetch('https://hunterwebservices-prod.azurewebsites.net/api/SendEmail', {
    method: 'POST',
    body: data,
  });

  if (response.ok) {
    // TODO: Show thank you.
  }
}
