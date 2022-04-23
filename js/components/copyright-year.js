class CopyrightYear extends HTMLElement {
  connectedCallback() {
    const year = new Date().getFullYear();
    this.innerText = `\u00A9 ${year} Hunter Web Apps`;
  }
}

customElements.define('copyright-year', CopyrightYear);
