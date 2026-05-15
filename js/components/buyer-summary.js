const BUYER_SUMMARIES = {
  'ai-vision-agent': {
    symptom: 'Operators were spending too much time driving legacy and portal screens by hand.',
    pattern: 'Virtual operator for repetitive screen work, with live supervision.',
    changed: 'Seven workflows run end-to-end with live supervision and audit logs.',
    fit: '3PLs with high-volume repetitive work across old desktop apps, portals, and print/close-out steps.',
    metric: '70+ hrs/week eliminated.'
  },
  'retailer-scorecards': {
    symptom: 'Retailer scorecards were rebuilt manually and arrived too late to change the week.',
    pattern: 'Operational analytics layer joining legacy ERP and shipment data.',
    changed: 'PIFOT, on-time, and fill-rate refreshed every ~15 minutes during business hours.',
    fit: '3PLs reporting retailer KPIs from multiple systems or spreadsheets.',
    metric: 'Weekly reporting lag reduced to ~15-minute refresh.'
  },
  'modern-ops-on-legacy-erp': {
    symptom: 'The ERP remained the system of record, but the way operators worked around it was no longer sustainable.',
    pattern: 'Modern exception cockpit over a legacy ERP.',
    changed: '30+ shipment validations, ship-window math, and live updates without replacing the ERP.',
    fit: '3PLs that cannot justify WMS/ERP replacement but need modern operational control.',
    metric: '30+ validation rules and ~30-second lag to live grid.'
  },
  'portal-extension': {
    symptom: 'Operators lived in customer portals and copied data their own system already knew.',
    pattern: 'Browser extension that brings internal shipment context into customer portals.',
    changed: 'Matching POs highlighted, fields auto-filled, and shipment context shown in the side panel.',
    fit: '3PLs with heavy customer-portal work across ShipIQ, Amazon, Walmart, Target, or similar.',
    metric: '~2 hrs/operator/day reclaimed.'
  },
  'amazon-routing': {
    symptom: 'Amazon routing required a fragile chain of email reading, data shaping, API submission, polling, and legacy close-out.',
    pattern: 'End-to-end retailer workflow orchestration.',
    changed: 'Email-in to SP-API submission, async polling, confirmation, and legacy close-out run without human touch unless an exception needs review.',
    fit: '3PLs with meaningful Amazon vendor volume and compliance exposure.',
    metric: '0 human touches, ~5-minute email-to-SP-API submission.'
  }
};

const ROWS = [
  ['Operational symptom', 'symptom'],
  ['Workflow pattern', 'pattern'],
  ['What changed', 'changed'],
  ['Best-fit operation', 'fit'],
  ['Primary metric moved', 'metric']
];

class BuyerSummary extends HTMLElement {
  connectedCallback() {
    const data = BUYER_SUMMARIES[this.dataset.case];
    if (!data) {
      console.warn(`buyer-summary: no data for case "${this.dataset.case}"`);
      return;
    }

    this.classList.add('cs-section');

    const rows = ROWS.map(([label, key]) => `
            <div>
                <dt>${label}</dt>
                <dd>${data[key]}</dd>
            </div>`).join('');

    this.innerHTML = `
    <div class="cs-container">
        <span class="cs-section-label">Buyer summary</span>
        <dl class="cs-buyer-summary reveal">${rows}
        </dl>
    </div>
`;
  }
}

customElements.define('buyer-summary', BuyerSummary);
