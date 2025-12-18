/**
 * Page Transitions
 * Smooth fade effect when navigating between pages
 */

(function() {
    // Fade in on page load
    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('fade-in');

        // Remove the class after animation completes
        setTimeout(() => {
            document.body.classList.remove('fade-in');
        }, 300);
    });

    // Handle navigation clicks
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');

        if (!link) return;

        const href = link.getAttribute('href');

        // Skip if:
        // - No href
        // - Hash link (same page anchor)
        // - External link
        // - Opens in new tab
        // - Has download attribute
        // - Modifier key pressed
        if (!href ||
            href.startsWith('#') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:') ||
            link.target === '_blank' ||
            link.hasAttribute('download') ||
            e.ctrlKey || e.metaKey || e.shiftKey) {
            return;
        }

        // Check if it's an internal navigation (same origin)
        try {
            const url = new URL(href, window.location.origin);
            if (url.origin !== window.location.origin) {
                return; // External link
            }

            // Skip if it's just a hash change on the same page
            if (url.pathname === window.location.pathname && url.hash) {
                return;
            }
        } catch {
            return; // Invalid URL
        }

        // Prevent default and fade out
        e.preventDefault();
        document.body.classList.add('fade-out');

        // Navigate after fade completes
        setTimeout(() => {
            window.location.href = href;
        }, 300);
    });

    // Handle browser back/forward
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            // Page was restored from cache (back/forward)
            document.body.classList.remove('fade-out');
            document.body.classList.add('fade-in');
            setTimeout(() => {
                document.body.classList.remove('fade-in');
            }, 300);
        }
    });
})();
