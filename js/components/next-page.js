class NextPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="next-page">
        <div class="chevron"></div>
        <div class="chevron"></div>
        <div class="chevron"></div>
      </div>
    `;
  }
}

customElements.define('next-page', NextPage);
