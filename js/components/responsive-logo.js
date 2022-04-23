class ResponsiveLogo extends HTMLElement {
  connectedCallback() {
    this.updateImage = this.updateImage.bind(this);
    window.addEventListener('resize', this.updateImage);
    this.updateImage();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.updateImage);
  }

  updateImage() {
    const { mobile, desktop, alt } = this.attributes;
    const imageUrl = document.documentElement.clientWidth < 480
      ? mobile.value
      : desktop.value;

    this.innerHTML = `<img src="${imageUrl}" alt="${alt.value}" class="logo" />`
  }
}

customElements.define('responsive-logo', ResponsiveLogo);
