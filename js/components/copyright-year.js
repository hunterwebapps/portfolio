class CopyrightYear extends HTMLElement {
  connectedCallback() {
    const year = new Date().getFullYear();
    this.innerHTML = `<a href="https://www.hunterwebapps.com">\u00A9 ${year} Hunter Web Apps</a>`;
  }
}

customElements.define('copyright-year', CopyrightYear);
