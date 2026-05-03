class CopyrightYear extends HTMLElement {
  connectedCallback() {
    const year = new Date().getFullYear();
    this.textContent = year;
  }
}

customElements.define('copyright-year', CopyrightYear);
