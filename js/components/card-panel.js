class CardPanel extends HTMLElement {
  connectedCallback() {
    const { header, subtitle, content } = this.attributes;

    const rootDiv = document.createElement('div');
    rootDiv.classList.add('card');

    const headerEl = document.createElement('h6');
    headerEl.classList.add('card-header');
    headerEl.innerText = header.value;

    const bodyEl = document.createElement('div');
    bodyEl.classList.add('card-body');

    const titleEl = document.createElement('h4');
    titleEl.classList.add('card-title', 'justify-content-between', 'd-flex');
    titleEl.innerHTML = subtitle.value;

    const contentEl = document.createElement('div');
    contentEl.classList.add('card-text');
    contentEl.innerHTML = content.value;

    bodyEl.appendChild(titleEl);
    bodyEl.appendChild(contentEl);

    rootDiv.appendChild(headerEl);
    rootDiv.appendChild(bodyEl);

    this.appendChild(rootDiv);
  }
}

customElements.define('card-panel', CardPanel);
