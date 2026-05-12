# Your Team Lives in Your Customers' Portals. We Brought Your Data With Them.

> A Chrome extension that follows the operations team into the customer portals they live in — highlighting POs that match your active shipments, populating forms automatically, and putting your own data in a side panel next to the customer's.

**Industry:** Distribution & Third-Party Logistics
**The business problem in one line:** Operations staff spend hours every day inside ShipIQ and Amazon's portals, copying and pasting data the operations team's own systems already know.
**The result in one line:** The extension overlays your data on top of the customer portals so the right answer is already on the screen the team is looking at.

---

## At a Glance

- Works directly inside the **customer portals the team uses every day** — ShipIQ (Target/partnersonline), Amazon Vendor Central, and Amazon Seller Central.
- **Highlights POs** on the portal page that match active shipments, so operators can see at a glance which work has already been touched.
- **Auto-populates ShipIQ form fields** from the operator's own shipment data, eliminating the copy-paste round trip.
- Includes a **side panel** that surfaces shipment context and calculator utilities (pallet calc, Walmart confirmation) right inside the browser.
- **Auto-detects environment** (dev / test / prod) so the same extension binary works for everyone, and the team can switch which back-end it talks to without reinstalling.

## The Problem

Walk into any 3PL's operations room and watch what the team is actually doing. A good chunk of the day, they aren't in your WMS or your TMS or your ERP. They're in your *customers'* portals. ShipIQ for Target. Vendor Central for Amazon. Seller Central for the marketplace side. Those portals are the gates the work has to pass through, and they were built for the customer's convenience — not yours.

So your operators sit there with two screens open. On one screen: the customer's portal, asking them to identify which PO they're confirming, type in a date, set a quantity, click submit. On the other screen: your own system, which already knows the answers — which shipment that PO belongs to, when it's planned to ship, the right quantity. The operator copy-pastes, alt-tabs, mistypes a digit, and starts again. Multiply by hundreds of POs a day, by every operator on the floor.

The silent cost of this is enormous. It isn't a single big problem you can point a leadership team at — it's a thousand small frictions that compound into real hours and real errors. Nobody complains about it because "this is just how the job works." But the time spent context-switching between two screens is time that doesn't get spent on the actual exceptions that need a human's judgment.

## What We Built

A **Chrome extension** that runs inside the customer portals the team uses every day. It reads the portal page, looks up the relevant POs and shipments in the operations system, and overlays the right information directly on top of the customer's UI. Operators stop alt-tabbing. The right answer is already on the screen they're looking at.

### Action 1: Highlight matching POs on the customer's page

- **Situation:** Operators land on a ShipIQ or Amazon page showing a long list of POs and need to find the ones that match their active shipments — by scrolling, by Ctrl+F, by gut feel.
- **Task:** Make the relevant POs visually obvious without making the operator do the work.
- **Action:** The extension's content scripts read the POs displayed on the portal page, query the operations backend for matching active shipments, and apply a visual highlight to the matching rows.
- **Result:** "Where am I in this list?" becomes a glance instead of a scroll.

### Action 2: Pre-fill ShipIQ form fields from operator data

- **Situation:** ShipIQ asks the operator to type in fields the operations system already knows — quantities, item identifiers, dates.
- **Task:** Eliminate the typing round-trip.
- **Action:** A dedicated **Auto-Set Items** module reads the ShipIQ form, matches it to the operator's own shipment data, and populates the fields automatically.
- **Result:** The transcription step — the most common place mistakes get introduced — disappears for the common cases.

### Action 3: Put shipment context and calculators in a side panel inside the browser

- **Situation:** Even with the highlight and auto-fill, operators still occasionally need to look up shipment details, run a pallet calculation, or fill out a Walmart confirmation form.
- **Task:** Keep that work in the browser where the portal already lives, instead of in a separate app.
- **Action:** The extension provides a side panel with shipment status tracking, a pallet calculator UI, and a Walmart-confirmation calculator backed by an Excel sheet.
- **Result:** The supplementary tools live next to the customer portal instead of in a separate window the operator has to find.

### Action 4: Auto-detect dev / test / prod so the team can switch environments without reinstalling

- **Situation:** Operations staff, QA, and developers all need the same extension to point at different back-ends at different times. Forcing each group to install a different build is fragile and breaks during testing.
- **Task:** Ship one extension binary that everyone uses.
- **Action:** The extension's environment manager auto-detects which back-end is available and routes API calls accordingly. Users can also switch environments manually from the side panel.
- **Result:** A single signed extension, deployed via Group Policy, that works for everyone — and that QA can flip into the test environment without redeploying.

## Business Outcomes

- **Time recovered per operator-shift** — the small frictions of copy-paste and PO-lookup add up to real hours that come back to the team. *{TBD — confirm hours/shift saved with operations.}*
- **Fewer transcription errors** on retailer portals — the auto-fill removes the most common error pathway.
- **Faster portal-driven exception handling** — when a retailer flags something, the operator can resolve it from inside the portal with their own data already on screen.
- **Lower onboarding cost for new operators** — they don't have to learn the "two-screen dance" for the customer portals; the extension does it for them.
- **Deployable via Group Policy and updated centrally** — IT doesn't have to chase down end-user machines.

## Under the Hood

A Manifest V3 Chrome extension with environment auto-detection, a service-worker background script for API calls and caching, content scripts that inject into ShipIQ and Amazon's portals, and a Chrome side panel for shipment status and calculator utilities. The extension is signed, packaged through the same CI pipeline as the rest of the platform, and deployed to operator workstations via Group Policy. Key locations:

- `christy-distribution-client/browser_extension/manifest.json` — host permissions, content-script matches, and side panel registration
- `christy-distribution-client/browser_extension/modules/shipiq/` — ShipIQ highlighter, AutoSetItems form-fill, and supporting modules
- `christy-distribution-client/browser_extension/modules/amazon/` — Amazon Vendor Central and Seller Central highlighter
- `christy-distribution-client/browser_extension/modules/core/EnvironmentManager.js` — dev/test/prod auto-detection
- `christy-distribution-client/browser_extension/sidepanel.html` and `sidepanel.js` — the side-panel UI

## Why This Matters for 3PLs

The portals your customers force you to use aren't going to get better. They're going to get more numerous — every new retail account adds another portal. The pattern we built for our client generalizes: identify the portals your team lives in, build a browser extension that overlays your own data on top, and centralize deployment through your IT. You take the silent friction tax off the operations day, and you bring your operational data with your team wherever the customer's portal makes them go.
