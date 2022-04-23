class PageSlide extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div>
        Page Number ${this.pageNumber}
        <slot></slot>
      </div>
    `;
  }

  get pageNumber() {
    return this.attributes['number'].value;
  }
}

customElements.define('page-slide', PageSlide);
