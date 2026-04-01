# External readiness review — `final-project-rubric.md`

**Review date:** April 1, 2026  
**Scope:** Cross-check of this repository and stated team facts against [`final-project-rubric.md`](./final-project-rubric.md). This is not a grade; it is a **gap list** for the course’s **final** expectations.

**Norm:** Requirements are **not** restated here. Outstanding items point to the rubric (and occasionally to repo files). Read the rubric for full definitions.

---

## Team-submitted facts (April 2026)

| Topic | Stated position |
|--------|-----------------|
| Falsification follow-up | Not believed to have been run since the design in [`aiDocs/falsification_test.md`](aiDocs/falsification_test.md). |
| Additional customer conversations (target persona / outside immediate circle) | None since prior work; team needs a starting point for outreach. |
| Presentation materials deadline | **April 8** — confirmed. |
| Midterm baseline for “evolution” narrative | Midterm slides exist in a **separate repo** (usable for diagram/story delta vs. final). |
| Success/failure metrics vs plan | **Uncertain** — not yet reconciled to rubric expectations. |
| Confidential peer evaluation | Team **not** aligned on process/deadline. |
| Tracking `ai/` in git vs `.gitignore` | **Undecided.** |
| Live demo | **Web**; **production** Supabase data. |

---

## Auditor findings — material (highest impact first)

### 1. Falsification — **major gap**

**Observation:** [`aiDocs/falsification_test.md`](aiDocs/falsification_test.md) remains at **§8 Decision: Inconclusive** with **§9** describing planned next steps. The team reports **no** subsequent execution captured in-repo.

**Rubric:** [`final-project-rubric.md`](./final-project-rubric.md) — table **“What Changed from Midterm”** (falsification row); **Jason** area **2**; **Evidence Checklist** → **Problem Identification** (falsification bullets).

**Implication:** Until tests are run and results recorded (with explicit outcomes vs. the document’s own thresholds), the **Problem Identification** thread is **not** at the **final** bar described in the rubric.

---

### 2. Customer evidence — **major gap**

**Observation:** No additional documented conversations aligned with **target users outside friends/family** since prior notes.

**Rubric:** [`final-project-rubric.md`](./final-project-rubric.md) — **Jason** areas **3** and **5**; **Evidence Checklist** → **Customer Focus** and **Customer Interaction**; opening table on interviews (friends-and-family vs. broader).

**Implication:** **Customer Focus** and **Customer Interaction** checklist rows are **not** substantiated by new evidence. The rubric explicitly allows informal outreach; the issue is **absence of documented, qualifying conversations**, not formality.

---

### 3. Success & failure metrics — **unresolved**

**Observation:** Team uncertain where they stand vs. midterm success/failure definitions.

**Rubric:** [`final-project-rubric.md`](./final-project-rubric.md) — **Jason** area **4**; **Evidence Checklist** → **Success & Failure Planning**.

**Implication:** Presentations that cannot state **position vs. criteria** (or **why measurement failed**) underperform on that rubric thread. “Not sure” is a process finding to address before **April 8** materials.

---

### 4. Peer evaluation — **process risk**

**Observation:** Team not aligned on the confidential peer evaluation.

**Rubric:** [`final-project-rubric.md`](./final-project-rubric.md) — **“What Changed from Midterm”** (peer evaluation row); **Presentation** checklist (peer evaluation bullet); **Presentation Format** paragraph on peer evaluation.

**Implication:** Administrative **non-completion** is independent of product quality; treat as **mandatory** course deliverable.

---

### 5. Technical / documentation items (Casey domain)

**Observations (unchanged from repo review):**

- No root **`CLAUDE.md`** or **`.cursorrules`** — **Rubric:** Casey area **2** and **Evidence Checklist** → **AI Development Infrastructure** (behavioral guidance bullet).
- [`aiDocs/context.md`](aiDocs/context.md) does not implement the checklist’s **“bookshelf pattern”** as a labeled structure — **same checklist** (context.md bullet).
- [`.gitignore`](./.gitignore) does not include every pattern named in the **same checklist** (e.g. `ai/`, `.testEnvVars`). Team undecided on `ai/` — resolve and either **match** the checklist or **document** intentional deviation in [`README.md`](./README.md) / [`CONTRIBUTING.md`](./CONTRIBUTING.md).
- [`aiDocs/changelog.md`](aiDocs/changelog.md) is empty — **Rubric:** opening **“What Changed from Midterm”** (empty/stale docs) and **Evidence Checklist** → living docs.

**Stronger areas (evidence on record):** Structured logging integrated in application code ([`src/lib/logger.ts`](./src/lib/logger.ts) and call sites); CLI scripts in [`package.json`](./package.json); phased narrative in [`ai/roadmaps/development-progress.md`](./ai/roadmaps/development-progress.md); [`docs/STATUS.md`](./docs/STATUS.md) as canonical engineering status.

---

### 6. Presentation — **April 8** and demo posture

**Observation:** Materials due **April 8** confirmed. Demo will use **web** and **production** Supabase.

**Rubric:** [`final-project-rubric.md`](./final-project-rubric.md) — **Presentation Format** (duration, live demo, materials timing); **Guest Grader** table; **Evidence Checklist** → **Presentation**; **What We’re NOT Grading** (polish vs. working prototype).

**Implication:** Web + prod data is a **credible** demo setup if connectivity and accounts are rehearsed. **Guest** sub-criteria (communication, story, visuals, impact) remain **outside** this repo review.

---

## Where to start — customer conversations (minimal prescription)

The rubric does not mandate a channel; it requires **engagement beyond friends/family** with **traceability** to learning and (where possible) product decisions. Practical starting points:

1. **Reuse your own protocol** — [`aiDocs/falsification_test.md`](./aiDocs/falsification_test.md) **§5** (test method) and **§9** (next cheapest test) already define *who*, *what to ask*, and *how to score*. Running **that** satisfies both **falsification execution** and **new conversations** if participants match the stated persona filters.
2. **Recruitment** — Short posts or DMs in communities where **knowledge workers** who have **quit habit apps** actually gather (your doc names examples in **§9**). Time-box: smallest batch that meets your own **pass/fail** tallies in **§9**.
3. **Recordkeeping** — For each session: date, how they qualified, anonymized notes, and a **one-line** link to what you **learned** or **changed** (product, copy, or scope). File under something like [`ai/notes/customer_interviews/`](./ai/notes/customer_interviews/) for grader traceability.
4. **Midterm vs final** — Use slides from the **other repo** next to current [`ai/notes/system-architecture-diagrams.md`](./ai/notes/system-architecture-diagrams.md) for the rubric’s **“diagram / story evolved”** narrative (**Jason** area **1** and **Evidence Checklist** → **System Understanding**).

---

## Suggested work order (audit view)

1. **Execute + document** falsification follow-up per **your** §9 (or equivalent with explicit mapping) — ties directly to **What Changed from Midterm** and **Problem Identification** in [`final-project-rubric.md`](./final-project-rubric.md).
2. **Parallel:** Outreach batch for **Customer Focus** / **Customer Interaction** (can overlap with step 1 if the same sessions feed both).
3. **Reconcile** success/failure **position vs. plan** — **Success & Failure Planning** checklist.
4. **Casey checklist closes:** `CLAUDE.md` or `.cursorrules`, bookshelf-style index in context, changelog, `.gitignore`/README decision.
5. **April 8 pack:** slides (include diagram delta using midterm repo + current artifacts), live web demo script, peer-eval alignment.
6. **Peer evaluation:** assign owner; confirm form location and deadline with course staff if the team is unclear.

---

## References

- [`final-project-rubric.md`](./final-project-rubric.md) — sole normative document for grading expectations.
- [`docs/STATUS.md`](./docs/STATUS.md) — engineering single source of truth.
- [`aiDocs/falsification_test.md`](./aiDocs/falsification_test.md) — falsification design and intended next test.
