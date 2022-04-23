class EllipseImg extends HTMLElement {
  connectedCallback() {
    const { src, color } = this.attributes;

    this.innerHTML = `
      <div style="
        border-radius: 100%;
        background-color: ${color.value};
        height: 100%;
        width: 100%;
        overflow: hidden;
        padding: 1rem;
        box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;
      ">
        <div style="
          background: url(${src.value}) no-repeat center;
          background-size: contain;
          height: 100%;
          width: 100%;
        ">
        </div>
      </div>
    `;
  }
}

customElements.define('ellipse-img', EllipseImg);
