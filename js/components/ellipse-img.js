class EllipseImg extends HTMLElement {
  connectedCallback() {
    const { src, color } = this.attributes;

    this.innerHTML = `
      <div class="ellipse-img" style="background-color: ${color.value};">
        <img src="${src.value}">
      </div>
    `;
  }
}

customElements.define('ellipse-img', EllipseImg);
