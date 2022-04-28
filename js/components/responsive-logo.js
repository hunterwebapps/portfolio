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
    const { portrait, landscape, alt } = this.attributes;
    const imageUrl = window.innerHeight > window.innerWidth
      ? portrait.value
      : landscape.value;

    this.innerHTML = `<img src="${imageUrl}" alt="${alt.value}" class="logo" />`
  }
}

customElements.define('responsive-logo', ResponsiveLogo);
