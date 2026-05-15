# Retailer-Grade Scorecards, Automatically — From the Data You Already Capture

> A self-refreshing analytics layer that turns transactional ERP and shipment data into PIFOT, on-time, and fill-rate scorecards — embedded right inside the operations app, refreshed every fifteen minutes during business hours.

**Industry:** Distribution & Third-Party Logistics
**The business problem in one line:** Every retailer asks for PIFOT and on-time, and the answer is always assembled by hand, late, and a little different every time.
**The result in one line:** Live, drillable scorecards that match the retailer's view of your performance — without an analyst rebuilding a spreadsheet every Monday.

---

## At a Glance

- An **automated ETL pipeline** pulls fresh data from both the legacy ERP and the operational database every fifteen minutes during business hours, plus a deeper refresh overnight.
- A **star-schema warehouse** pre-computes the SLA flags — picked-in-full, shipped-on-time, PIFOT, fill rate, days early/late — at the shipment and the line-item level.
- A **Power BI report**, embedded right inside the operations app, surfaces daily and monthly rollups with year-over-year and month-over-month comparisons, drillable by customer, workcenter, and channel.
- Every ETL run is **logged with row counts, timing, and per-loader success/failure** — the numbers are defensible to a retailer compliance team.

## The Problem

Every retailer who matters — Amazon, Walmart, Target, CVS, Dick's, the rest — measures your performance the same way. They want PIFOT (picked in full, on time). They want on-time delivery. They want fill rate. They want it broken down by DC, by week, by channel. And they will produce their own number, send it to you, and dispute yours if it doesn't match.

For most 3PLs, answering that question is a weekly fire drill. An analyst pulls extracts from the WMS, reconciles them by hand against the TMS or the ERP, fights with one or two timezone bugs, drops the result into a spreadsheet, and emails it around. The number is always a few days stale by the time anyone sees it. It rarely matches the retailer's number exactly. And worst of all, by the time the report lands on the operations leader's desk, the week is over — the misses can be *explained* but they can't be *prevented*.

Layered underneath that pain is the fact that the data lives in two places that don't agree: the legacy ERP (system of record for orders and customers) and the modern operational database (where shipment status, ship windows, and validation events actually happen). Reconciling them by hand is what makes the weekly report slow. Reconciling them once — properly — is the work nobody has time to do.

## What We Built

A **dedicated analytics layer** running alongside the operational system. Every fifteen minutes during business hours, an ETL pipeline reaches into both the legacy ERP and the operational database, transforms what it finds into a star schema (customers, SKUs, workcenters, dates, ship methods, vendors, plus shipment and line-item facts), and pre-computes the SLA flags that retailers care about. A **Power BI report** sits on top, embedded right inside the operations app — so the same PIFOT dashboard that runs the Monday review is one click away during the day.

### Action 1: Unify the legacy ERP and the operational data into one model

- **Situation:** Orders, customers, and historical financial data live in the legacy ERP. Shipment status, ship windows, validation outcomes, and customer-specific rules live in the modern operational system. Neither side, on its own, can answer "did we hit PIFOT this week."
- **Task:** Combine both sources into a single, query-able model that's authoritative for SLA reporting.
- **Action:** We built an ETL service that reads from the legacy ERP via its own data layer and from the operational SQL Server, lands the data in a clean star schema with eleven dimension tables and seven fact tables, and exposes pre-aggregated views for the analytics that run most often.
- **Result:** A single source of operational truth that reconciles to both sides and is friendly to BI tools.

### Action 2: Pre-compute the SLA flags that matter — at the right grain

- **Situation:** PIFOT, fill rate, on-time, days late — every one of those metrics has a precise definition, and every one of them can be argued about if it's computed differently in different places.
- **Task:** Compute them once, store them, and let every downstream use rely on the same numbers.
- **Action:** The shipment-fact loader computes the SLA flags at the shipment level: `PickedInFullFlag`, `ShippedOnTimeFlag`, `PIFOTFlag`, and the rest. A line-item-fact loader does the same at the line level. Pre-aggregated views (`vw_PIFOTDailySummary`, `vw_PIFOTMonthlySummary`) roll those flags up for daily and monthly reporting.
- **Result:** Whether you're looking at a corporate KPI tile or the retailer-facing scorecard, the same definition produces the same number.

### Action 3: Refresh fast enough to be operational, not just retrospective

- **Situation:** A weekly report tells you what already happened. A live dashboard tells you which shipments are at risk *right now*.
- **Task:** Refresh frequently enough that operations can act on the data, without crushing the source systems.
- **Action:** A scheduled worker runs a "frequent" ETL every fifteen minutes during business hours (eastern time) for the metrics that change intra-day — line items, open-order snapshots, inventory snapshots — and a deeper "daily" ETL overnight for dimensions and full-shipment facts. Run locks prevent overlaps; runs are logged with timing and per-loader success.
- **Result:** The PIFOT dashboard reflects the day's performance within minutes, not days. Operations can shift from explaining the miss after the fact to catching it while it's still preventable.

### Action 4: Embed the dashboard where the operations team already lives

- **Situation:** Reporting tools that live outside the operations app get ignored. People log into the app every day; they don't log into the BI tool every day.
- **Task:** Make the right scorecard one click away from the work.
- **Action:** A Power BI report is embedded inside the operations app's Analytics page. Authentication is handled at the workspace level via an Azure AD service principal so there's no token plumbing for the end user.
- **Result:** PIFOT, on-time, and fill rate are at the same URL as the shipment list. The numbers and the work live next to each other.

## Business Outcomes

- **PIFOT and on-time visibility within minutes**, not days. *{TBD — confirm the latency target with operations.}*
- **Hours saved per week on manual reporting** — the analyst's weekly spreadsheet exercise becomes a refresh-and-glance. *{TBD — confirm hours saved.}*
- **A defensible source of truth** for retailer scorecard disputes — every metric is reproducible, every ETL run is logged.
- **Shift from reactive to proactive ops.** When today's PIFOT is visible at 11am, the afternoon can be spent saving the shipments still at risk.
- **Customer-facing scorecard capability** — the same dashboard can be made available to a retailer or brand with their data scoped, eliminating ad-hoc report requests.

## Under the Hood

A dedicated .NET 8 ETL service (`Christy.Analytics.Service`) orchestrates eleven dimension loaders and seven fact loaders against a SQL Server analytics database. Pre-aggregated SQL views materialize the daily and monthly PIFOT rollups for fast Power BI queries. DAX measures define the canonical KPIs (PIFOT Rate, On-Time Rate, Picked-In-Full Rate, Fill Rate, plus failure breakdowns and time-intelligence variants). The Power BI report is embedded into the React/Material-UI client via the standard Azure AD service-principal embed flow. Key locations:

- `christy-distribution-api/Christy.Analytics.Service/Orchestration/EtlOrchestrator.cs` — coordinates dimension-then-fact loader execution with run locks
- `christy-distribution-api/Christy.Analytics.Service/Workers/EtlWorker.cs` — Frequent (15-min, business-hours Eastern) + Daily (overnight) schedules
- `christy-distribution-api/Christy.Analytics.Service/Facts/OutboundShipmentLoader.cs` — PIFOT, on-time, fill-rate, and lead-time calculations at the shipment grain
- `christy-distribution-api/Christy.Analytics.Service/PowerBI/CreateAnalyticsViews.sql` — pre-aggregated reporting views
- `christy-distribution-api/Christy.Analytics.Service/PowerBI/DAXMeasures.dax` — canonical KPI definitions
- `christy-distribution-client/src/pages/analytics/AnalyticsPage.jsx` and `pages/powerbi/PowerBIPage.jsx` — ETL run status panel and embedded Power BI report

Related case studies: the analytics layer draws shipment and validation data from the operational backbone described in [Ship List + ADaM Modernization](03-ship-list-adam-modernization.md).

## Why This Matters for 3PLs

If your weekly PIFOT report is still rebuilt by hand, you're carrying two costs at once: the analyst's time, and every chargeback you couldn't see coming. The pattern we built for our client — unify the legacy and operational data once, pre-compute the SLA flags, refresh fast, embed the dashboard where the team already works — is portable to any 3PL. It's the difference between a report you produce for your customers and a scorecard that drives how the floor runs *today*.
