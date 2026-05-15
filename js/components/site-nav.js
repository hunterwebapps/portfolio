const CASE_STUDIES = [
  {
    num: '01',
    href: '/case-studies/ai-vision-agent.html',
    title: 'Scaling warehouse ops without scaling the team',
    tagline: 'Virtual operator across WMS, ERP, and retailer screens'
  },
  {
    num: '02',
    href: '/case-studies/retailer-scorecards.html',
    title: 'Retailer-grade scorecards, automatically',
    tagline: 'Live PIFOT and on-time dashboards'
  },
  {
    num: '03',
    href: '/case-studies/modern-ops-on-legacy-erp.html',
    title: 'Modern ops on top of a legacy ERP',
    tagline: 'Real-time grid with 30+ validation rules'
  },
  {
    num: '04',
    href: '/case-studies/portal-extension.html',
    title: "Your team lives in your customers' portals",
    tagline: 'Chrome extension for ShipIQ and Amazon'
  },
  {
    num: '05',
    href: '/case-studies/amazon-routing.html',
    title: 'From routing request to confirmed shipment',
    tagline: 'Email-in to lights-out Amazon SP-API'
  }
];

class SiteNav extends HTMLElement {
  connectedCallback() {
    const active = this.dataset.active || '';
    const cls = (key) => `nav-link${key === active ? ' active' : ''}`;

    const dropdownItems = CASE_STUDIES.map(cs => `
                            <a class="nav-dropdown-link" role="menuitem" href="${cs.href}">
                                <span class="nav-dropdown-num">${cs.num}</span>
                                <span class="nav-dropdown-text">
                                    <span class="nav-dropdown-title">${cs.title}</span>
                                    <span class="nav-dropdown-tagline">${cs.tagline}</span>
                                </span>
                            </a>`).join('');

    this.innerHTML = `
<nav id="Home" class="navbar navbar-expand-lg">
    <div class="container navbar-container">
        <a class="navbar-brand" href="/">
            <img src="/images/logo_applied_main.svg" alt="Applied 3PL Systems" class="logo" width="135" height="40"/>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarNav" aria-controls="navbarNav"
                aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav mx-auto">
                <li class="nav-item"><a class="${cls('home')}" href="/#Home">Home</a></li>
                <li class="nav-item has-dropdown">
                    <a class="${cls('case-studies')}" href="/#CaseStudies" aria-haspopup="true">Case Studies</a>
                    <div class="nav-dropdown" role="menu" aria-label="Case studies">
                        <span class="nav-dropdown-eyebrow">Five case studies</span>
                        <div class="nav-dropdown-list">${dropdownItems}
                        </div>
                    </div>
                </li>
                <li class="nav-item"><a class="${cls('fit')}" href="/#WhereWeFit">Where We Fit</a></li>
                <li class="nav-item"><a class="${cls('engagement')}" href="/#Engagement">Engagement</a></li>
                <li class="nav-item"><a class="${cls('scorecard')}" href="/scorecard.html">Scorecard</a></li>
                <li class="nav-item"><a class="${cls('contact')}" href="/#Contact">Contact</a></li>
            </ul>
        </div>
    </div>
</nav>
`;
  }
}

customElements.define('site-nav', SiteNav);
