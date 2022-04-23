class NextPage extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 3rem;
        }

        .chevron {
          position: absolute;
          width: 2.1rem;
          height: 0.48rem;
          opacity: 0;
          transform: scale(0.3);
          animation: move-chevron 3s ease-out infinite;
        }

        .chevron:first-child {
          animation: move-chevron 3s ease-out 1s infinite;
        }

        .chevron:nth-child(2) {
          animation: move-chevron 3s ease-out 2s infinite;
        }

        .chevron::before,
        .chevron::after {
          content: '';
          position: absolute;
          top: 0;
          height: 100%;
          width: 50%;
          background: #141A46;
        }

        .chevron::before {
          left: 0;
          transform: skewY(30deg);
        }

        .chevron::after {
          right: 0;
          width: 50%;
          transform: skewY(-30deg);
        }

        @keyframes move-chevron {
          25% {
            opacity: 1;
          }
          33.3% {
            opacity: 1;
            transform: translateY(1.5rem);
          }
          66.6% {
            opacity: 1;
            transform: translateY(2.25rem);
          }
          100% {
            opacity: 0;
            transform: translateY(3rem) scale(0.5);
          }
        }
      </style>
      <div class="container">
        <div class="chevron"></div>
        <div class="chevron"></div>
        <div class="chevron"></div>
      </div>
    `;

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('next-page', NextPage);
