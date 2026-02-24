#AI-Augmented Software Development — Midterm Rubric

**Total Points:** 100 (Weighted)

**Philosophy:** We grade your **PROCESS**, not your product. Evidence of document-driven development and systematic AI iteration is the primary lens for evaluation.

---

## 1. Grading Overview

| Grader    | Focus                   | Weight | Scoring               |
| --------- | ----------------------- | ------ | --------------------- |
| **Casey** | Technical Process       | 45%    | 4 areas @ 25pts each  |
| **Jason** | Product & System Design | 45%    | 5 areas @ 20pts each  |
| **Guest** | Presentation Quality    | 10%    | Holistic / Subjective |

---

## 2. Technical Process (Casey - 45%)

_Scored out of 100 total technical points._

### [25pts] PRD & Document-Driven Development

- **What Good Looks Like:** PRD is clear and serves as the "immutable source of truth."
- **Workflow:** PRD → Plan → Roadmap → Implementation.
- **Iteration:** Documents are living artifacts; evidence of AI-assisted iteration (not one-shot).

### [25pts] AI Development Infrastructure

- **Structure:** `ai/` folder pattern implemented (`context.md`, project docs).
- **Tools:** MCP configured and functional.
- **Git:** Branching strategy, meaningful commits, and PRs. `.gitignore` properly handles secrets/env vars.

### [25pts] Phase-by-Phase Implementation

- **Incrementalism:** Built via roadmap phases, not massive one-shot prompts.
- **Checklists:** Roadmaps used as active checklists.
- **History:** Git history shows clear "Plan/Implement/Review" cycles across multiple sessions.

### [25pts] Structured Logging & Debugging

- **Logging:** Structured logs implemented (beyond simple `console.log`).
- **Testing:** CLI test scripts exist and function.
- **Loop:** Evidence of "Test-Log-Fix" loop where AI reads logs to diagnose and resolve issues.

---

## 3. Product & System Design (Jason - 45%)

_Scored out of 100 total product points._

### [20pts] System Understanding

- **Visualization:** System diagram mapping the ecosystem, elements, and relationships.
- **Strategy:** Identification of the larger system goal and key leverage points.

### [20pts] Problem Identification

- **Justification:** Strong "Why" for the chosen problem.
- **Divergent Thinking:** Evidence that alternative problems were considered.
- **Validation:** Falsifiability check and due diligence to prove the premise wrong.

### [20pts] Customer Focus

- **Targeting:** Clearly identified customer and differentiation from alternatives.
- **Analysis:** Multiple lenses applied to explain why this solution succeeds where others fail.

### [20pts] Success & Failure Planning

- **Metrics:** Measurable indicators for both success and failure states.
- **Pivoting:** Documented plans for how to react to both success and failure scenarios.

### [20pts] Customer Interaction

- **Evidence:** Notes/feedback from real user sessions or interviews.
- **Influence:** Documentation of how feedback directly changed the project trajectory.

---

## 4. Scoring Scale & Grades

| Level            | Range   | Meaning                                         |
| ---------------- | ------- | ----------------------------------------------- |
| **Exemplary**    | 95-100% | Exceptional; used as a future example.          |
| **Proficient**   | 90-94%  | Solid work; process clearly followed (A-minus). |
| **Developing**   | 80-89%  | Partial implementation; gaps in process.        |
| **Insufficient** | < 80%   | Major gaps; process not followed.               |

**Grade Scale:** `A: 93%` | `A-: 90%` | `B+: 87%` | `B: 83%` | `B-: 80%` | `C+: 77%` | `C: 73%`

---

## 5. Quick Evidence Checklist

_Use these as boolean flags for AI auditing._

### Technical Evidence

- [ ] `prd.md` or similar exists and is comprehensive.
- [ ] `ai/` folder contains `context.md` and active project docs.
- [ ] `.gitignore` prevents secrets/keys from being committed.
- [ ] Git history shows small, iterative commits aligned with roadmap tasks.
- [ ] CLI test scripts are present in the repository.
- [ ] Structured logging implementation is visible in code.

### Product Evidence

- [ ] System design diagram file (e.g., Mermaid, PNG, or Excalidraw).
- [ ] Problem statement includes a "falsifiability" section.
- [ ] Documented "Success" and "Failure" metrics.
- [ ] User interview notes or feedback logs.
- [ ] Documented "Pivot Plan."

---

## 6. Presentation Requirements

- **Duration:** 15 mins (Total 20 with Q&A).
- **Split:** 50% Product/System Design, 50% Technical Demo.
- **Mandatory:** System design diagram must be shown.
- **Persona:** Pitching to C-suite (Casey/Jason) for project "Green-lighting."

> **Note on Failure:** Pivots and setbacks are "Evidence of Good Process." If you failed but documented the "Why" and the "Next Step," you are meeting the rubric requirements.
