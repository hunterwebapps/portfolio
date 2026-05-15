# From Amazon Routing Request to Confirmed Shipment — Without a Human in the Loop

> An end-to-end automation chain that reads Amazon's routing request emails, submits the shipment through Amazon's API, polls the asynchronous transaction to confirmation, and closes out the legacy systems — all without manual intervention.

**Industry:** Distribution & Third-Party Logistics
**The business problem in one line:** Amazon vendor compliance is unforgiving, and the entire workflow — from inbound routing email through final close-out — has historically been a manual chain of nine or ten steps no one could afford to miss.
**The result in one line:** A fully orchestrated, always-on automation chain that runs the same way at 2am as at 2pm, with a clean audit trail for every step.

---

## At a Glance

- **The whole flow runs without a human in the loop**, from the inbound routing email all the way through the legacy-system close-out.
- **Amazon SP-API integration** handles authentication, shipment submission, and asynchronous transaction polling so the operations team doesn't have to manage tokens or refresh status manually.
- The **virtual operator** ([described in Case Study 1](01-ai-vision-agent.md)) takes care of the legacy-system close-out steps that have no API — without those, the chain would still need a human at the end.
- **Always-on coverage.** The chain runs the same way at 2am as at 2pm. Amazon doesn't care what time zone you're in; neither does the automation.
- **Full audit trail** of every step — defensible to retailer compliance teams and useful for diagnosing the rare exception.

## The Problem

Amazon vendor business is some of the most demanding work a 3PL can take on. The economics work — Amazon volume can be a meaningful share of revenue — but the operational cost of getting it wrong is brutal. Every chargeback is automatic. Every late ship is logged. Every imperfect shipment confirmation is a debit on the next invoice.

The flow itself is the problem. An Amazon routing request comes in by email. Someone has to read it, find the shipment in the ops system, calculate the cartons, group the orders correctly, submit the shipment data to Amazon's Selling Partner API, manage OAuth tokens, deal with the fact that the submission is asynchronous (you don't get an immediate yes/no — you get a transaction ID and have to poll for status), wait for confirmation, and then go back to the legacy systems and close out the corresponding records there. Miss any link in that chain — or do any of it sloppy — and the chargeback follows.

For most 3PLs, that means staffing a dedicated team to handle Amazon, training them carefully, building tribal knowledge, and absorbing the chargebacks that happen anyway when someone's out sick or the inbox backs up over a weekend. The volume keeps growing. The team keeps growing. The compliance risk never goes away.

## What We Built

A **fully orchestrated end-to-end automation chain** for Amazon vendor shipments. Routing requests arrive by email and are read automatically. Shipment data is enriched and validated. The submission goes to Amazon's SP-API with managed authentication. A background worker polls the transaction to confirmation. The virtual operator handles the legacy-system close-out steps. The whole chain runs continuously, with every step logged, and the operations team only gets involved on genuine exceptions.

### Action 1: Read the inbound routing request automatically

- **Situation:** Amazon routing requests arrive in the operations mailbox by email. Someone has to read each one, identify the relevant shipment, and pull out the data Amazon expects to receive.
- **Task:** Get the data out of the email and into the system without an operator opening it.
- **Action:** A scheduled email-processing worker monitors the operations mailbox, classifies incoming messages by intent, and runs a specialized extractor for Amazon shipment-routing requests to pull out the structured fields (PO numbers, dates, the rest).
- **Result:** The inbound side of the chain stops being an inbox-watching exercise.

### Action 2: Enrich the shipment data the way Amazon expects it

- **Situation:** Amazon's API doesn't accept whatever the operations system happens to have. It wants specific grouping, validated carton counts, and shipment data shaped the way the SP-API expects.
- **Task:** Get from "what we have" to "what Amazon will accept" without manual data prep.
- **Action:** A pre-tendering manager groups orders correctly, runs validation (using the same rule engine described in the [Ship List case study](03-ship-list-adam-modernization.md)), counts cartons, and assembles the payload Amazon's API expects.
- **Result:** The submission payload is right by construction. The most common cause of Amazon rejections — bad shipment data — goes away.

### Action 3: Submit, then track the asynchronous transaction to completion

- **Situation:** Submitting to Amazon's SP-API is the easy part. The hard part is that the submission is asynchronous: you get a transaction ID, and you have to poll Amazon's transaction-status endpoint until it tells you the shipment is confirmed (or rejected).
- **Task:** Manage the submission and the polling without making the operations team manage OAuth tokens and a manual refresh loop.
- **Action:** The SP-API integration handles Login-with-Amazon (LWA) OAuth token acquisition and refresh, submits the shipment, and a dedicated background worker polls the transaction-status endpoint until it terminates. Successful confirmations update the operational record; failures route to an exception queue.
- **Result:** Operations doesn't see tokens, doesn't poll, and doesn't refresh. They see "confirmed" or "needs attention."

### Action 4: Close out the legacy systems automatically

- **Situation:** Even after Amazon confirms, the work isn't done — the legacy ERP and OpShip need to be updated to reflect what just happened. Those systems don't have APIs. Historically, someone clicked through them.
- **Task:** Close the legacy loop without re-introducing a human at the end.
- **Action:** The virtual operator described in [Case Study 1](01-ai-vision-agent.md) performs the legacy close-out clicks (pre-tendering finalization), under supervision via the Operator Console.
- **Result:** "Lights-out" Amazon flows — the chain runs the same way overnight as during the day.

## Business Outcomes

- **Chargeback reduction.** Every link in the chain that used to depend on someone doing it correctly under time pressure now runs the same way every time. *{TBD — confirm chargeback delta.}*
- **Faster turn-around** on Amazon routing requests — minutes rather than the next staffed shift. *{TBD — confirm cycle time.}*
- **Capacity to grow Amazon volume without growing the Amazon team.** The chain doesn't care if you double the volume.
- **Always-on coverage.** Weekends and overnight aren't backlog-generating events anymore.
- **Defensible audit trail** for every step — useful both for retailer compliance disputes and for diagnosing the exception cases that do require a human.

## Under the Hood

A chain of cooperating components: an email-processing worker reads and classifies inbound messages and dispatches an Amazon-routing extractor; a pre-tendering manager enriches and validates the shipment data; the Amazon SP-API integration handles LWA OAuth and SP-API calls; a background worker polls the transaction-status endpoint; the virtual operator handles the legacy-system close-out. Key locations:

- `christy-distribution-api/Christy.Distribution.Business/Managers/PreTenderingManager.cs` — shipment enrichment, grouping, carton counting, validation
- `christy-distribution-api/Christy.Distribution.Business/Integrations/AmazonSpApi/AmazonSpApiService.cs` — SP-API client
- `christy-distribution-api/Christy.Distribution.Business/Integrations/AmazonSpApi/AmazonSpApiTokenProvider.cs` — managed LWA OAuth
- `christy-distribution-api/Christy.Distribution.Jobs/PollAmazonShipmentDetailsWorker.cs` — asynchronous transaction polling
- `christy-distribution-api/Christy.Distribution.Business/Managers/EmailProcessingManager.cs` — inbound email classification and dispatch
- `christy-distribution-api/Christy.Agent.Operator/Automation/` — the virtual operator that handles legacy-system close-out

Related case studies: this chain leans on the [AI Vision Agent](01-ai-vision-agent.md) for the legacy close-out, and on the operational backbone and validation engine described in [Ship List + ADaM Modernization](03-ship-list-adam-modernization.md).

## Why This Matters for 3PLs

If you handle meaningful Amazon volume, the routing/confirmation flow is probably the single largest operational risk line in your business. The pattern we built for our client isn't Amazon-specific — every major retailer is moving toward more API-driven, more asynchronous, more compliance-heavy fulfillment workflows. The architecture (email intake → automated enrichment → API-driven submission → asynchronous tracking → automated legacy close-out) is the right shape for whichever retailer's flow comes next. Build it once, generalize it, and you stop being staffed-up against retailer-specific chargeback risk.
