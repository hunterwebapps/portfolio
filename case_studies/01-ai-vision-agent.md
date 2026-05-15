# Scaling Warehouse Operations Without Scaling the Warehouse Team

> A virtual operator that drives the same screens a human does — running EDI imports, picking dialogs, label printing, and customer-portal close-outs around the clock, with a live web console so a single supervisor can watch over its shoulder.

**Industry:** Distribution & Third-Party Logistics
**The business problem in one line:** Skilled ops staff spend a growing share of their day on portal clicks and legacy-system data entry — work that's repetitive, can't be skipped, and that you can't hire your way out of.
**The result in one line:** A virtual operator that runs those workflows continuously, supervised from a single web page, with full audit trail.

---

## At a Glance

- A purpose-built virtual operator handles **seven distinct repetitive workflows** today: EDI order imports from retailer portals, building shipments in the legacy OpShip app, order printing, order cancellation, ship-via updates, work-order number updates, and PDF stamping.
- A web-based **Operator Console** streams the agent's live desktop and a synchronized action log to anyone with access — supervisors don't need to RDP in to verify what happened.
- When a screen doesn't look the way it normally does (an unexpected dialog, a layout change), the agent falls back to a **vision-model step** that reads the screen the way a person would, rather than failing the run.
- Capacity that used to scale 1-to-1 with people now scales without it — one supervisor can oversee many parallel agent sessions.

## The Problem

Ask any 3PL operations leader what their team actually *does* every day, and a surprising amount of the answer is not warehouse work — it's screen work. EDI files have to be imported through the retailer's portal. Pick tickets and packing slips have to be printed to the right printer in the right facility. Orders get cancelled at the last minute and have to be backed out of the legacy ERP. Ship-via codes get changed. Work-order numbers get fixed up. None of those tasks are warehouse work. All of them are required, and all of them happen hundreds of times a day.

The natural answer is to grow the team. But skilled warehouse-ops staff — the people who actually know how to navigate a retailer portal and a legacy ERP at the same time — are increasingly difficult to hire and even harder to retain. The work itself is the kind that burns people out: it's repetitive, it can't be batched, and it gets blamed every time a chargeback lands. Every percentage point of volume growth carries with it the cost of more headcount or the risk of falling behind.

The deeper problem is that none of the systems involved offer APIs that would let you automate the work the "clean" way. Retailer portals are HTML pages. The legacy ERP is a Windows desktop app from the 1990s. The choices have historically been: write screen-scraping scripts that break the moment a button moves, or staff up.

## What We Built

A **virtual operator**: a Windows-based agent that runs on a dedicated VM and drives the same screens a human would. It logs into the legacy ERP, navigates the retailer portals, fills out the dialogs, prints to the right printers, and reports back. It does this on a schedule, on demand from the operations team, or in response to events from the rest of the system. Its desktop and its action log stream live to an **Operator Console** page inside the existing operations app, so any supervisor can watch what it's doing in real time and step in if needed.

### Action 1: Standardize the seven highest-volume manual workflows

- **Situation:** EDI imports, building shipments in OpShip, order printing, cancellations, ship-via updates, WO-number updates, and PDF stamping were all manual, all repetitive, and all the kind of work that has to happen every day.
- **Task:** Get those workflows off humans without losing the judgment and recovery the team brings to them.
- **Action:** We built each workflow as a sequence of explicit steps the agent can run end-to-end. Each step knows what it expects to see on screen, how to verify it succeeded, and what to do if a dialog pops up. Every step is logged.
- **Result:** Each of those seven workflows now runs the same way, at the same speed, every time — including overnight and on weekends.

### Action 2: Build a live web console so one person can supervise many agent sessions

- **Situation:** Automation that runs in the dark scares operations leaders for good reason: when something goes wrong, you find out after the chargeback arrives.
- **Task:** Give supervisors the same visibility into the agent's work that they'd have if they were standing behind a human's shoulder.
- **Action:** The agent streams its desktop as a live video feed (HLS) into the operations app. Beside it, a synchronized action-log panel shows exactly what step is executing right now, what it just finished, and what it's about to do.
- **Result:** Supervisors can audit the agent from any browser without RDP'ing in. A single supervisor can watch multiple agent sessions simultaneously.

### Action 3: Vision-model fallback for the inevitable surprise

- **Situation:** Retailer portals and legacy apps occasionally change. A button moves; a dialog text changes; a session expires in an unexpected way. Traditional UI automation breaks the moment that happens.
- **Task:** Keep the agent running through small surprises without paging a human at 2am.
- **Action:** Each step has a fallback that hands the screen to a vision model, which interprets what it sees the way a person would and chooses the right action. Recoverable surprises stay recoverable; only the unrecoverable ones page a human.
- **Result:** Brittle UI automation becomes resilient. The supervisor's exception queue shrinks to "genuine problems" instead of "the button moved."

### Action 4: Make every action auditable

- **Situation:** When an automated system touches customer-facing data, ops leaders need to be able to point to what happened, when, and why.
- **Task:** Produce an audit trail at least as good as what a human would leave.
- **Action:** Every action the agent takes — every click, every step start, every step success or failure — is logged with timestamps and tied to a session. The same log feeds the Operator Console for live viewing and the database for after-the-fact review.
- **Result:** A defensible audit trail behind every automated action, available to operations, IT, and compliance.

## Business Outcomes

- **Capacity unlocked without headcount.** The same volume of EDI imports, builds, printing, and cancellations runs continuously without growing the team. *{TBD — confirm exact hours/day saved with operations.}*
- **24/7 coverage on workflows that used to be blocked by business hours.** EDI imports and printing that piled up overnight now happen overnight. *{TBD — confirm queue depth before/after.}*
- **Lower key-person risk.** The institutional knowledge of "how to drive OpShip" lives in the agent, not in two people's heads.
- **Faster onboarding of new retailer portals.** Adding support for a new portal is a defined engineering task with a known shape, not a six-month tribal-knowledge build-up.
- **Defensible audit trail** behind every automated action — defending against retailer chargeback disputes is now backed by timestamped, replayable evidence.

## Under the Hood

The agent is a WPF desktop application that runs on a dedicated VM. UI automation is built on top of UI Automation (UIA) primitives via FlaUI, with a vision fallback powered by Azure OpenAI. The Operator Console in the React/Material-UI client streams the agent's desktop over HLS using FFmpeg, with a synchronized action-log feed via SignalR. Action queue items are accepted from the operations app over HTTP and dispatched by the agent's orchestrator. Key locations:

- `christy-distribution-api/Christy.Agent.Operator/Automation/` — the seven workflow modules (BuildOpShipments, EdiOrders, OrderPrinting, OrderCancellation, UpdateOrderShipVia, UpdateOrderWONumber, OrderPdfStamping) and the AI vision fallback step
- `christy-distribution-api/Christy.Agent.Operator/Ai/` — the vision-model client and tool adapter
- `christy-distribution-client/src/pages/operator/OperatorPage.jsx` — the live web console with HLS stream and action log

Related case studies: [Automated Amazon Routing](05-automated-amazon-routing.md) uses this same virtual operator to handle the legacy close-out after an Amazon submission.

## Why This Matters for 3PLs

If you run a 3PL, your people probably spend more of their day in retailer portals and a legacy WMS/TMS/ERP than you'd like to admit — and you can't fix that by switching ERPs. The pattern we built for our client is the pattern that fits your operation too: identify the highest-volume manual workflows, build a supervised virtual operator that runs them, and put the supervisor on a web page they can watch from anywhere. You add capacity without adding headcount, and you de-risk the institutional knowledge that today lives only in your senior ops people.
