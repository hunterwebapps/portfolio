class RequiredAsterisk extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <abbr title="Required" aria-label="Required">
        *
      </abbr>
    `
  }
}
