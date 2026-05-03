class CopyrightYear extends HTMLElement {
  connectedCallback() {
    const year = new Date().getFullYear();
    this.innerHTML = `<a href="https://applied3pl.com">\u00A9 ${year} Applied 3PL Systems</a>`;
  }
}

customElements.define('copyright-year', CopyrightYear);
