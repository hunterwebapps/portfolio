class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
<footer id="Contact" class="site-footer">
    <div class="container">
        <div class="footer-grid">
            <!-- LEFT: brand statement + contact form -->
            <div>
                <span class="footer-eyebrow">05 / Contact</span>
                <div class="footer-lead">
                    <h3>Applied 3PL Systems</h3>
                    <p>Tell us what you're working on. We typically reply within 2&ndash;4 hours on business days.</p>
                </div>

                <h6 class="footer-label" style="margin-top: 2.5rem;">Workflow inquiry</h6>
                <form id="ContactForm" class="custom-form contact-form" action="#" method="post" novalidate>
                    <div class="form-field">
                        <input type="text" name="name" id="name" class="form-control" placeholder=" "
                               autocomplete="name" autocapitalize="words">
                        <label for="name" class="floating-label">Your Name</label>
                    </div>
                    <div class="form-row">
                        <div class="form-field">
                            <input type="email" name="email" id="email" class="form-control" placeholder=" "
                                   autocomplete="email" required aria-describedby="email-error" inputmode="email">
                            <label for="email" class="floating-label">Email Address</label>
                            <span id="email-error" class="field-error d-none" role="alert">Valid email required to reply.</span>
                        </div>
                        <div class="form-field">
                            <input type="tel" name="phone" id="phone" class="form-control" placeholder=" "
                                   autocomplete="tel" inputmode="tel">
                            <label for="phone" class="floating-label">Phone <span class="floating-label-meta">Optional</span></label>
                        </div>
                    </div>
                    <input type="text" name="confirm_email" id="confirm_email" class="d-none" tabindex="-1" autocomplete="off" aria-hidden="true">
                    <div class="form-field form-field--textarea">
                        <textarea class="form-control" rows="5" name="message" id="message" placeholder=" "
                                  required aria-describedby="message-error"></textarea>
                        <label for="message" class="floating-label">Project Details</label>
                        <span id="message-error" class="field-error d-none" role="alert">Required to reply.</span>
                    </div>
                    <span id="server-error" class="field-error d-none" role="alert" aria-live="assertive"></span>
                    <div class="col-12 submit-container">
                        <button type="submit" id="recaptcha-submit"
                                class="submit-btn">
                            <span class="submit-btn-label">Send Message</span>
                            <span class="submit-btn-spinner" aria-hidden="true"></span>
                        </button>
                    </div>
                    <p class="recaptcha-notice">
                        Protected by reCAPTCHA — Google's
                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                        and
                        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms</a>
                        apply.
                    </p>
                </form>

                <div id="ContactThanksForm" class="thank-you-panel d-none" aria-live="polite" tabindex="-1">
                    <div class="thank-you-confirm">
                        <span class="thank-you-check" aria-hidden="true"><i class="bi-check2"></i></span>
                        <div class="thank-you-confirm-text">
                            <span class="thank-you-eyebrow">Message received</span>
                            <h4 class="thank-you-title">Thanks<span id="ThankYouName"></span>—&nbsp;we got it.</h4>
                            <p class="thank-you-subtitle">
                                We respond within <strong>2–4 hours</strong> on business days. Check
                                <span id="ThankYouEmail" class="thank-you-email-inline"></span>
                                for a reply from <a href="mailto:hello@applied3pl.com">hello@applied3pl.com</a>.
                            </p>
                        </div>
                    </div>

                    <div class="thank-you-next">
                        <span class="thank-you-next-eyebrow">While you wait</span>
                        <div class="thank-you-next-grid">
                            <a href="/#CaseStudies" class="thank-you-next-card" data-cta="case-studies">
                                <span class="thank-you-next-num">/ 01</span>
                                <div class="thank-you-next-body">
                                    <h6>See real operations</h6>
                                    <p>Five case studies. Virtual operators, retailer scorecards, Amazon SP-API, and more.</p>
                                </div>
                                <span class="thank-you-next-arrow" aria-hidden="true">→</span>
                            </a>
                            <a href="/scorecard.html" class="thank-you-next-card" data-cta="scorecard">
                                <span class="thank-you-next-num">/ 02</span>
                                <div class="thank-you-next-body">
                                    <h6>Score your operation</h6>
                                    <p>A 10-minute self-assessment that shows where the operation is still propped up by spreadsheets and manual work.</p>
                                </div>
                                <span class="thank-you-next-arrow" aria-hidden="true">→</span>
                            </a>
                            <a href="https://www.linkedin.com/company/applied3plsystems/" target="_blank" rel="noopener noreferrer" class="thank-you-next-card" data-cta="linkedin">
                                <span class="thank-you-next-num">/ 03</span>
                                <div class="thank-you-next-body">
                                    <h6>Follow on LinkedIn</h6>
                                    <p>3PL tooling notes and the occasional warehouse story.</p>
                                </div>
                                <span class="thank-you-next-arrow" aria-hidden="true">↗</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div id="ContactFormFail" class="thank-you-panel thank-you-panel--fail d-none" aria-live="polite" tabindex="-1">
                    <div class="thank-you-confirm">
                        <span class="thank-you-check thank-you-check--warn" aria-hidden="true"><i class="bi-exclamation-triangle"></i></span>
                        <div class="thank-you-confirm-text">
                            <span class="thank-you-eyebrow">Send failed</span>
                            <h4 class="thank-you-title">Something didn't go through.</h4>
                            <p class="thank-you-subtitle">
                                Email us directly and we'll pick it up from there.
                            </p>
                        </div>
                    </div>
                    <p class="contact-email">
                        <i class="bi-envelope-open" aria-hidden="true"></i>
                        <a href="mailto:hello@applied3pl.com" target="_blank">hello@applied3pl.com</a>
                    </p>
                    <p class="fail-original-label"><strong>Your message</strong> — copy this into the email:</p>
                    <textarea id="OriginalMessage" rows="3" readonly></textarea>
                </div>
            </div>

            <!-- RIGHT: hours, contact, social -->
            <div>
                <div class="footer-info-grid">
                    <div class="footer-info-block">
                        <h6 class="footer-label">Operating Hours</h6>
                        <div class="hours-block">
                            <div class="hours-row">
                                <span class="hours-label">Mon – Fri</span>
                                <span class="hours-value" id="OperatingHours">9:00 – 18:00 ET</span>
                            </div>
                            <div class="hours-row">
                                <span class="hours-label">Sat – Sun</span>
                                <span class="hours-value">Closed</span>
                            </div>
                        </div>
                        <p class="tel-row">
                            <a href="tel:+14073493633">(407)&nbsp;349-3633</a>
                        </p>
                    </div>

                    <div class="footer-info-block">
                        <h6 class="footer-label">Connect</h6>
                        <ul class="social-icon">
                            <li><a href="https://www.linkedin.com/company/applied3plsystems/" target="_blank" rel="noopener noreferrer"
                                   class="social-icon-link bi-linkedin" aria-label="Visit Applied 3PL Systems on LinkedIn"></a></li>
                        </ul>

                        <h6 class="footer-label" style="margin-top: 2rem;">Direct</h6>
                        <p>
                            <a href="mailto:hello@applied3pl.com">hello@applied3pl.com</a>
                        </p>
                    </div>
                </div>

                <div class="footer-info-block" style="margin-top: 2.5rem;">
                    <h6 class="footer-label">Specialization</h6>
                    <p>We work with independent 3PL operators across the U.S. Software that fits between your WMS, your customers' portals, and the people running shipments out the door.</p>
                </div>

                <div class="footer-info-block footer-credential" style="margin-top: 2.5rem;">
                    <h6 class="footer-label">Credentialed</h6>
                    <img src="/images/credentials/ascm.webp" alt="Association for Supply Chain Management"
                         class="footer-ascm-card" width="355" height="242" loading="lazy" decoding="async">
                </div>
            </div>
        </div>

        <p class="copyright-text">
            <copyright-year></copyright-year>
            <span>·</span>
            <span><a href="https://applied3pl.com">Applied 3PL Systems</a> · All rights reserved</span>
        </p>
    </div>
</footer>
`;
  }
}

customElements.define('site-footer', SiteFooter);
