# Modern Operations on Top of a Legacy ERP — Without Rip-and-Replace

> A live, validated, real-time shipment cockpit built on top of a decades-old ERP — letting the team work the modern way without an 18-month system replacement.

**Industry:** Distribution & Third-Party Logistics
**The business problem in one line:** The system of record can't be replaced, but the team can't keep working the way it forces them to.
**The result in one line:** A modern, real-time operations dashboard layered on top of the legacy ERP, with thirty-plus automated validation checks and customer-specific ship-window rules — all reading from a single, live source of truth.

---

## At a Glance

- The legacy ERP **stays in place** as the system of record. A modern operations app sits on top of it, reading orders continuously and presenting them in a real-time grid.
- **30+ automated validation checks** flag exceptions — bad freight terms, PO Box on hazmat, missing customer item setup, zero ship time, unexpected workcenter, and more — *before* they turn into chargebacks.
- A **ship-window calculator** computes first/last ship and first/last tender dates per shipment, respecting customer-specific cases (with named carve-outs for Walmart, Target, Walgreens), UPS transit times, holidays, and weekends.
- **Real-time updates** via SignalR mean the whole team sees the same view of the operation at the same moment — no more "give me a sec to refresh."
- **Per-customer "acceptable error" rules** quietly suppress validation noise the team has explicitly decided to accept, keeping the exception queue focused on what matters.

## The Problem

If you've been in distribution or 3PL for any length of time, you know the system of record problem. The WMS, the TMS, or the ERP that you've been running for a decade or two is the system of record. It owns the customer master. It owns the orders. It owns the financials. It isn't going anywhere — replacing it is an 18-month, seven-figure project with months of dual running, and the upside doesn't pay back the risk.

The problem is that the system was never designed for the way modern operations actually work. The team needs to see live status across thousands of active shipments at once. Multiple people need to work the same exception queue without stepping on each other. Each retail customer has its own ship-window math and its own definition of "on time." Each retailer also has its own list of things you must validate before tendering — freight terms, hazmat rules, address rules, account-number formats — and the chargeback hits the moment one of them is wrong.

Doing that work inside a legacy ERP screen is slow. Doing it across a legacy ERP and a stack of spreadsheets is slower, and silently introduces errors. The longer you wait to address it, the more the team writes shadow systems — sticky-noted whiteboards, side databases, a "master spreadsheet" that lives in one person's OneDrive. None of those scale, all of them are key-person risks, and all of them disagree with each other.

## What We Built

A **modern operations cockpit** — a real-time, multi-user, validated shipment dashboard — layered on top of the legacy ERP. The legacy system stays the system of record. Every thirty seconds, a background worker pulls fresh orders from the legacy ERP into a modern data layer, where it can be validated, scored, and surfaced to every operator's screen the moment something changes. The team gets the modern operating model. The legacy ERP keeps doing what it does. Nobody has to underwrite a rip-and-replace.

### Action 1: Pull the legacy ERP's data live, into a modern operational store

- **Situation:** Orders, customers, items, and addresses live in the legacy ERP (an ODBC-accessed database). The data is authoritative, but reading it directly into modern interfaces is slow and chatty.
- **Task:** Get a clean, continuously-updated copy of the orders into a place where the rest of the system could work with them.
- **Action:** A background worker pulls new and changed orders from the legacy ERP every thirty seconds, materializes them as `Order` and `Shipment` records in a modern SQL Server schema, and keeps customer and address data synchronized.
- **Result:** The legacy ERP remains the system of record. The operations app reads from a modern data layer that's always within seconds of the legacy state.

### Action 2: Validate every shipment against thirty-plus rules — automatically

- **Situation:** Each retailer brings its own chargeback rulebook: freight terms must match carrier types, hazmat can't ship via air, PO Boxes need a specific carrier, account numbers have format requirements, certain customers need specific items pre-configured for label-pack quantities, and on and on.
- **Task:** Catch the violations before the shipment leaves the building, not after the retailer issues a debit.
- **Action:** A shipment validator runs more than thirty checks against every shipment, covering address completeness, ship/tender date math, customer-specific ship-window rules, freight-terms vs. carrier compatibility (with UPS and FedEx variants), hazmat / non-hazmat pairing for international freight, account-number format, customer item setup, duplicate item numbers, zero-quantity orders, and more. Each error has a stable code; the validator runs every time a shipment's data changes.
- **Result:** The exception queue is no longer a guessing game. Every problem that the rules can catch is surfaced with a clear code and message, attached to a specific shipment, ready for action.

### Action 3: Calculate ship windows the way each customer actually defines them

- **Situation:** "When does this shipment need to leave?" depends on the customer. Some customers measure the window backwards from a fixed delivery date; some allow ship-window math to extend through weekends; some have named tenders (Target's two-day tender window, Walmart's one-day, Walgreens' rules). And every customer's window has to respect actual UPS transit times and the actual holiday calendar.
- **Task:** Compute first/last ship and first/last tender dates for every shipment, respecting each customer's case and the calendar.
- **Action:** A `ShipWindowCalculator` codifies the customer cases (`ShipWindowCase` 1–4, `TenderWindowCase` 1–3) and the per-customer special rules. It takes the customer's required date, applies the right calendar math, accounts for UPS business transit days, skips holidays and weekends, and produces a four-date result: first ship, last ship, first tender, last tender.
- **Result:** The ship windows displayed in the operations app match the windows each customer actually enforces — so the "is this at risk?" question always has the same answer the retailer would give.

### Action 4: Push updates live to every screen

- **Situation:** Multiple operators work the same queue at the same time. A list that's a refresh out of date is a list with double-work and missed work in it.
- **Task:** Make every operator's screen reflect the same shared reality of the operation.
- **Action:** The shipment grid is built on a high-performance enterprise data grid (ag-Grid) with custom validation badges and filtering. A SignalR hub pushes every change — new shipment, validation update, status change — to every connected client.
- **Result:** Everyone sees the same view. The race conditions and double-work that legacy ERP screens cause go away.

### Action 5: Quiet the noise per customer with "acceptable errors"

- **Situation:** Not every validation rule applies the same way to every customer. Some retailers explicitly allow patterns that the generic rule would flag.
- **Task:** Suppress validation noise the team has explicitly decided to accept, without weakening the rules for everyone else.
- **Action:** A per-customer "acceptable errors" configuration lets the team mark specific error codes as acceptable for specific customers. The validator still runs every check, but the filtered output only surfaces the ones that actually require attention.
- **Result:** The exception queue stays focused. Operators stop dismissing the same false positive a hundred times a day.

## Business Outcomes

- **Time-to-spot an exception drops from "after the chargeback arrives" to "as soon as the data lands."** *{TBD — confirm cycle-time numbers with operations.}*
- **Chargeback exposure shrinks** because every shipment is checked against the rulebook every time it changes. *{TBD — confirm chargeback delta.}*
- **No system-of-record migration.** The legacy ERP keeps running; the team's training, integrations, and historical data are untouched.
- **Onboarding new customers and new retailers gets faster** — adding a new validation rule or ship-window case is a defined engineering task, not a months-long initiative.
- **Shadow spreadsheets retire.** When the operations app is the live view of the operation, the side-of-desk tools that used to track exceptions don't need to exist.

## Under the Hood

A .NET 8 API layered on top of the legacy ERP via ODBC. A background worker materializes orders into a modern SQL Server schema every thirty seconds. The shipment validator runs both per-shipment and cross-shipment rules (the latter for things like SUNWEB multi-order detection and hazmat / non-hazmat freight pairing). The ship-window calculator codifies the customer-case math and consumes the holiday calendar and UPS transit days as inputs. The React/Material-UI client uses ag-Grid for the live grid and SignalR for real-time push. Key locations:

- `christy-distribution-api/Christy.Distribution.Jobs/ImportADaMOrdersWorker.cs` — the 30-second order import worker
- `christy-distribution-api/Christy.Distribution.Business/ShipList/ShipmentValidator.cs` — the validator with 30+ rules and per-customer acceptable-error filtering
- `christy-distribution-api/Christy.Distribution.Business/ShipList/DatesCalculator/ShipWindowCalculator.cs` — ship-window math with `ShipWindowCase` / `TenderWindowCase` support
- `christy-distribution-api/Christy.Distribution.API/Hubs/ShipmentsHub.cs` — the SignalR hub for live updates
- `christy-distribution-client/src/pages/ship-list/ShipListPage.jsx` and `src/components/ship-list/ShipList.jsx` — the live operations grid

Related case studies: the [Analytics + PIFOT case study](02-analytics-and-pifot.md) draws its facts from this same operational backbone. The [AI Vision Agent case study](01-ai-vision-agent.md) executes the manual workflows that connect this layer to the legacy ERP's user-facing applications.

## Why This Matters for 3PLs

If your operation is on a WMS, TMS, or ERP you can't replace — and your team has built up a stack of spreadsheets, dashboards, and side databases just to work around it — the pattern we built for our client is the pattern you need. Keep the system of record. Layer a modern, real-time, validated operations cockpit on top of it. Codify the customer-specific rules in software instead of in tribal knowledge. The team gets a modern operating model; the business gets out of the rip-and-replace conversation entirely.
