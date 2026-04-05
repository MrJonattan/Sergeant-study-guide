# The Key Preseason Materials Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich all study guide chapters with exam-focused content (mnemonics, exam alerts, prior test questions, PG conflict notes, role comparisons, cross-references) extracted from The Key Police Promotional School's 24-lesson Pre-Season Review Course.

**Architecture:** Each lesson PDF is read, exam-strategy content is extracted and cataloged, then surgically inserted inline into the corresponding existing markdown files at the precise location where the related concept is discussed. New section files are created when The Key covers procedures not yet represented.

**Tech Stack:** Markdown (study content), PDF reading, shell (git commits)

---

## Source Material

All Key lesson PDFs are located at: `~/Documents/The Key Preseason Sgt Study Guide/`

Each PDF contains 3-4 pages of ads/testimonials (cover page, SmarterDegree ad, Finest FCU ad, testimonials page, sometimes a Captain exam flyer). **Skip these pages entirely.** Only extract content from the actual lesson pages (numbered at bottom, e.g., "Lesson 1-Patrol Guide Section 202, page 1").

## Callout Format Reference

Every callout inserted must use one of these exact formats:

```markdown
> **Memory Aid — NAME:** What each letter stands for (e.g., C = Child, H = Homeless, ...)

> **Exam Alert:** Description of what the exam tests and how to avoid the trap.

> **Prior Test:** Scenario description — correct answer is X because Y.

> **PG Conflict:** PG/AG XXX-XX says A, but PG/AG YYY-YY says B. Know both exist.

> **See Also:** PG XXX-XX — Brief description of the related procedure.
```

Role comparison tables use standard markdown table format with a `**Role Comparison**` header.

## File Creation Convention

When creating new section files, follow this pattern:
- Filename: `section-XXX-topic-name.md`
- Header: `# Section XXX — Topic Name`
- Source line: `> **Source:** NYPD [Patrol/Admin] Guide, [PG/AG] XXX-XX`
- Content structured with `##` for major subsections, `###` for sub-topics
- Bullet points for individual rules/duties
- Bold for key terms, emphasis for qualifiers

---

## Task 1: Lesson 1 — PG 202 (Duties & Responsibilities)

**Source PDF:** `Lesson 1 PG Section 202 .pdf` (11 content pages)
**Files:**
- Modify: `chapters/202-duties-responsibilities/section-202-supervisors.md`
- Modify: `chapters/202-duties-responsibilities/section-202-officers.md`
- Modify: `chapters/202-duties-responsibilities/review-questions.md`
- Modify: `chapters/202-duties-responsibilities/key-terms.md`

**Key content to extract and merge:**

- [ ] **Step 1: Read the full lesson PDF (all pages)**

Read `~/Documents/The Key Preseason Sgt Study Guide/Lesson 1 PG Section 202 .pdf` pages 1-15 (skip cover, ads, testimonials). Catalog all exam-strategy content.

- [ ] **Step 2: Read existing section files**

Read `chapters/202-duties-responsibilities/section-202-supervisors.md` and `section-202-officers.md` in full. Identify insertion points for each cataloged item.

- [ ] **Step 3: Enrich section-202-supervisors.md — Desk Officer (202-18)**

Insert these known items at their matching locations:
- **Memory Aid — CAT PAC** after the "Direct Supervision" list: Clerk, APO, Telephone Switchboard, Patrol wagon, Attendant, Community guide
- **Exam Alert** on "Allowed Behind Desk" list: According to this list, the Mayor is NOT allowed behind the desk
- **Exam Alert** on assistants: DA, ME, Corp Counsel, Comptroller include their assistants; Judicial Officers do NOT include assistants
- **PG Conflict** on civil process: 211-21 says D.O. accepts regardless, but 202-18 mentions PRAA condition
- **Exam Alert** on US Flag: Prior test reversed order to "sunset to sunrise" — flag is NOT up in the dark
- **Exam Alert** on property >30 days: Make SEPARATE Command Log entry, notify Ops Coordinator
- Role comparison table: D.O. (responsible for police operations) vs Patrol Supervisor (supervise field operations) vs LPC (responsible for command operations)
- All cross-references mentioned in the lesson (e.g., AG 322-20 Attendance App, PG 324-17 AWOL, PG 212-01 Roll Call)

- [ ] **Step 4: Enrich section-202-supervisors.md — Patrol Supervisor (202-19)**

Insert these known items:
- **Exam Alert** comparing D.O. vs Patrol Supervisor: "1 or 2 words could matter" — D.O. is "responsible for police operations", P/S is "supervise field operations"
- **Exam Alert** on WEBS radio runs: Weapon, Emergency, Burglary, Serious crime
- **Exam Alert** on meal: P/S notifies Telephone Switchboard Operator of meal location AND relieves Lt Platoon Commander or D.O. for meal when designated

- [ ] **Step 5: Enrich section-202-supervisors.md — LPC (202-26) and SOL (202-27)**

Insert these known items:
- Role comparison table: LPC (command operations, in uniform) vs D.O. (police operations) vs P/S (field operations)
- **Exam Alert** on LPC plainclothes: Only when directed by C.O. — for ICO Operations or Plainclothes Operations
- **Memory Aid — I.A.D.I.E.** for SOL problem solving: Identify, Analyze, Design, Implement, Evaluate
- **Exam Alert** on SOL: Operations Coordinator supervises Crime Analysis Sergeant (PG 202-28 step 34b)
- SOL Daily/Weekly/Monthly/Annual duties table
- **See Also** cross-references for ICO (202-29), Auxiliary Police Program

- [ ] **Step 6: Enrich section-202-officers.md if applicable**

Check if any Key content applies to officer-level duties in this file and insert accordingly.

- [ ] **Step 7: Update review-questions.md**

Add 5-8 new practice questions based on prior test callouts from The Key lesson. Each question must be multiple choice (A-D) with the correct answer and explanation citing the PG procedure number.

- [ ] **Step 8: Update key-terms.md**

Add new acronyms/mnemonics: CAT PAC, WEBS, I.A.D.I.E., C.E.O. (Commanding Officer, Executive Officer, Operations Coordinator), and any others found in the lesson.

- [ ] **Step 9: Commit**

```bash
git add chapters/202-duties-responsibilities/
git commit -m "feat(202): enrich duties & responsibilities with The Key exam content

Add mnemonics (CAT PAC, WEBS, IADIE), exam alerts, prior test
callouts, PG conflict notes, and role comparison tables from
The Key Lesson 1."
```

---

## Task 2: Lesson 2 — AG 304 (General Regulations)

**Source PDF:** `Lesson 2 AG Section 304 .pdf` (~8 content pages)
**Files:**
- Modify: `chapters/304-general-regulations/section-304-fitness-for-duty.md`
- Create: `chapters/304-general-regulations/section-304-courtesies.md`
- Create: `chapters/304-general-regulations/section-304-compliance-with-orders.md`
- Create: `chapters/304-general-regulations/section-304-prohibited-conduct.md`
- Create: `chapters/304-general-regulations/section-304-personal-appearance.md`
- Modify: `chapters/304-general-regulations/review-questions.md`
- Modify: `chapters/304-general-regulations/key-terms.md`
- Modify: `chapters/304-general-regulations/README.md`

- [ ] **Step 1: Read the full lesson PDF (all pages)**

Read `~/Documents/The Key Preseason Sgt Study Guide/Lesson 2 AG Section 304 .pdf` — skip ads/testimonials. Catalog all exam-strategy content.

- [ ] **Step 2: Read existing section files**

Read `section-304-fitness-for-duty.md` and `section-304-computer-use-policy.md` in full. Identify what's already covered vs what needs new files.

- [ ] **Step 3: Enrich section-304-fitness-for-duty.md**

Insert these known items:
- **Exam Alert** on "Be fit for duty at all times": This is a WRONG answer without qualifier "EXCEPT while out sick" — the word "EXCEPT" is the qualifier that makes it correct
- **Exam Alert** on Unfit/Alcohol box: Breathalyzer .04 or greater = unfit (AG 318-20, note after step 1)
- **Exam Alert** on off-duty breathalyzer: Dept will pay OT to member
- **PG Conflict** on off-duty alcohol in uniform: AG 304-06 step 3 does NOT prohibit, but AG 304-13 page 1 step f claims AG 304-06 DOES prohibit. Know both exist.
- Alcohol rules summary box from The Key

- [ ] **Step 4: Create section-304-courtesies.md (304-02)**

New file with content from The Key covering:
- Salute rules (as per U.S. Army regulations)
- Who to salute: PC or ANY Deputy Commissioner (even in civilian clothes)
- When entering command: salute The DESK (not the Desk Officer)
- Flag/National Anthem salute rules
- **Exam Alert**: Flag at half mast and mourning band rules get mixed together on the test (references AG 305-14)
- **See Also:** AG 305-14 — Mourning Bands

- [ ] **Step 5: Create section-304-compliance-with-orders.md (304-03)**

New file covering:
- Department Manual = 4 books (Patrol Guide, Administrative Guide, Organizational Guide, Detective Guide)
- Punctuality, obeying lawful orders
- Driver's license requirements (CMOS + all UMOS)
- **Exam Alert** on driver's license: Notify Commanding Officer (breaks chain of command) if suspended/revoked/expired
- C.O. semi-annual DMV inquiry and warrant check
- IAB notification procedures for license issues

- [ ] **Step 6: Create section-304-prohibited-conduct.md (304-06)**

New file covering:
- General prohibitions (conduct prejudicial to good order, efficiency, discipline)
- Pronoun usage (He/She/They/Them)
- Criminal/hate group association rules
- Relationship restrictions (subordinates, CIs, witnesses, victims, youth)
- **Exam Alert** on Step 7 conduct restrictions: Dating, socializing, carpooling, unauthorized meet-ups, social media contact all prohibited
- Political restrictions (clubs, fundraising, school board, community board)
- **Exam Alert**: Can be on Community Board BUT cannot serve on Public Safety Committee
- 10-day rule for elected office
- Department business/resources restrictions
- **See Also:** AG 318-01 — Schedule "B" CD for bringing alcohol into dept facility

- [ ] **Step 7: Create section-304-personal-appearance.md (304-07)**

New file covering:
- General appearance standards
- Uniform requirements, button rules, short sleeve shirt rules
- 8-Point Cap rules: must be worn on foot post/traffic posts/details, optional May 1-Sept 30 for subway patrol
- Shoe requirements (shined, no visible company name/logo)

- [ ] **Step 8: Update review-questions.md**

Add 5-8 new practice questions based on prior test callouts. Include the fitness-for-duty qualifier trap and the community board/public safety committee distinction.

- [ ] **Step 9: Update key-terms.md and README.md**

Add new terms. Update README.md to list the new section files.

- [ ] **Step 10: Commit**

```bash
git add chapters/304-general-regulations/
git commit -m "feat(304): add courtesies, compliance, prohibited conduct, appearance sections

Create 4 new section files from The Key Lesson 2. Enrich
fitness-for-duty with exam alerts and PG conflict notes.
Add mnemonics, prior test callouts, and practice questions."
```

---

## Task 3: Lesson 3 — AG 305 (Uniforms & Equipment)

**Source PDF:** `Lesson 3 AG Section 305 .pdf`
**Files:**
- Modify: `chapters/305-uniforms-equipment/section-305-firearms-regulations.md`
- Modify: `chapters/305-uniforms-equipment/section-305-lost-damaged-uniform.md`
- Create: New section files as needed based on PDF content
- Modify: `chapters/305-uniforms-equipment/review-questions.md`
- Modify: `chapters/305-uniforms-equipment/key-terms.md`

- [ ] **Step 1: Read the full lesson PDF**
- [ ] **Step 2: Read existing section files**
- [ ] **Step 3: Enrich existing files with exam alerts, mnemonics, cross-references**
- [ ] **Step 4: Create new section files for uncovered procedures**
- [ ] **Step 5: Update review-questions.md with prior test content**
- [ ] **Step 6: Update key-terms.md**
- [ ] **Step 7: Commit**

```bash
git add chapters/305-uniforms-equipment/
git commit -m "feat(305): enrich uniforms & equipment with The Key exam content"
```

---

## Task 4: Lesson 4 — PG 324 & 330 (Leave/Payroll & Medical)

**Source PDF:** `Lesson 4 PG Section 324 & 330.pdf`
**Files:**
- Modify or Create: `chapters/324-leave-payroll-timekeeping/` section files (currently only README.md)
- Modify: `chapters/330-medical-health-wellness/` section files
- Create: `chapters/324-leave-payroll-timekeeping/key-terms.md`
- Create: `chapters/324-leave-payroll-timekeeping/review-questions.md`

- [ ] **Step 1: Read the full lesson PDF**
- [ ] **Step 2: Read existing files in both chapter directories**
- [ ] **Step 3: Create new section files for 324 (currently empty chapter)**
- [ ] **Step 4: Enrich existing 330 files with exam alerts, mnemonics, cross-references**
- [ ] **Step 5: Create new 330 section files for uncovered procedures**
- [ ] **Step 6: Update/create review-questions.md and key-terms.md for both chapters**
- [ ] **Step 7: Commit**

```bash
git add chapters/324-leave-payroll-timekeeping/ chapters/330-medical-health-wellness/
git commit -m "feat(324,330): add leave/payroll sections, enrich medical with The Key content"
```

---

## Task 5: Lesson 5 — AG 332 (Employee Rights)

**Source PDF:** `Lesson 5 AG Section 332 .pdf`
**Files:**
- Modify or Create: `chapters/332-employee-rights/` section files (currently only README.md)
- Create: `chapters/332-employee-rights/key-terms.md`
- Create: `chapters/332-employee-rights/review-questions.md`

- [ ] **Step 1: Read the full lesson PDF**
- [ ] **Step 2: Read existing README.md**
- [ ] **Step 3: Create new section files with full content and inline exam enrichment**
- [ ] **Step 4: Create review-questions.md and key-terms.md**
- [ ] **Step 5: Commit**

```bash
git add chapters/332-employee-rights/
git commit -m "feat(332): create employee rights sections from The Key Lesson 5"
```

---

## Task 6: Lesson 6 — AG 318 (Disciplinary Matters)

**Source PDF:** `Lesson 6 AG Section 318 .pdf`
**Files:**
- Modify: `chapters/318-disciplinary-matters/section-318-interrogation-mos.md`
- Modify: `chapters/318-disciplinary-matters/section-318-removal-firearms-intoxicated.md`
- Create: New section files as needed
- Modify: `chapters/318-disciplinary-matters/review-questions.md`
- Modify: `chapters/318-disciplinary-matters/key-terms.md`

- [ ] **Step 1: Read the full lesson PDF**
- [ ] **Step 2: Read existing section files**
- [ ] **Step 3: Enrich existing files**
- [ ] **Step 4: Create new section files for uncovered procedures**
- [ ] **Step 5: Update review-questions.md and key-terms.md**
- [ ] **Step 6: Commit**

```bash
git add chapters/318-disciplinary-matters/
git commit -m "feat(318): enrich disciplinary matters with The Key exam content"
```

---

## Task 7: Lessons 7-8 — PG 207 (Complaints)

**Source PDFs:**
- `Lesson 7 PG Section 207-PT 1.pdf`
- `Lesson 8 PG Section 207-PT 2.pdf`

**Files:**
- Modify: `chapters/207-complaints/section-207-complaint-system.md`
- Modify: `chapters/207-complaints/section-207-investigations.md`
- Modify: `chapters/207-complaints/section-207-corruption-civilian.md`
- Modify: `chapters/207-complaints/section-207-notifications.md`
- Modify: `chapters/207-complaints/section-207-missing-alerts.md`
- Create: New section files as needed
- Modify: `chapters/207-complaints/review-questions.md`
- Modify: `chapters/207-complaints/key-terms.md`

- [ ] **Step 1: Read both lesson PDFs**
- [ ] **Step 2: Read all existing section files**
- [ ] **Step 3: Enrich existing files with exam content from both lessons**
- [ ] **Step 4: Create new section files for uncovered procedures**
- [ ] **Step 5: Update review-questions.md and key-terms.md**
- [ ] **Step 6: Commit**

```bash
git add chapters/207-complaints/
git commit -m "feat(207): enrich complaints with The Key exam content (Lessons 7-8)"
```

---

## Task 8: Lessons 9-10 — PG 208 (Arrests)

**Source PDFs:**
- `Lesson 10 PG Section 208-Pt 1.pdf`
- `Lesson 10 PG Section 208-Pt 2.pdf`

**Note:** The filenames say "Lesson 10" for both parts but the lesson sequence lists them as Lessons 9-10.

**Files:**
- Modify: All files in `chapters/208-arrests/`
- Create: New section files as needed
- Modify: `chapters/208-arrests/review-questions.md`
- Modify: `chapters/208-arrests/key-terms.md`

- [ ] **Step 1: Read both lesson PDFs**
- [ ] **Step 2: Read all existing section files**
- [ ] **Step 3: Enrich existing files**
- [ ] **Step 4: Create new section files for uncovered procedures**
- [ ] **Step 5: Update review-questions.md and key-terms.md**
- [ ] **Step 6: Commit**

```bash
git add chapters/208-arrests/
git commit -m "feat(208): enrich arrests with The Key exam content (Lessons 9-10)"
```

---

## Task 9: Lesson 11 — PG 209 (Summonses)

**Source PDF:** `Lesson 11 PG Section 209 .pdf`
**Files:**
- Modify: All files in `chapters/209-summonses/`
- Create: New section files as needed
- Modify: `chapters/209-summonses/review-questions.md`
- Modify: `chapters/209-summonses/key-terms.md`

- [ ] **Step 1: Read the full lesson PDF**
- [ ] **Step 2: Read all existing section files**
- [ ] **Step 3: Enrich existing files**
- [ ] **Step 4: Create new section files for uncovered procedures**
- [ ] **Step 5: Update review-questions.md and key-terms.md**
- [ ] **Step 6: Commit**

```bash
git add chapters/209-summonses/
git commit -m "feat(209): enrich summonses with The Key exam content (Lesson 11)"
```

---

## Task 10: Lesson 12 — PG 210 (Prisoners)

**Source PDF:** `Lesson 12 PG Section 210.pdf`
**Files:**
- Modify: All files in `chapters/210-prisoners/`
- Create: New section files as needed
- Modify: `chapters/210-prisoners/review-questions.md`
- Modify: `chapters/210-prisoners/key-terms.md`

- [ ] **Step 1: Read the full lesson PDF**
- [ ] **Step 2: Read all existing section files**
- [ ] **Step 3: Enrich existing files**
- [ ] **Step 4: Create new section files for uncovered procedures**
- [ ] **Step 5: Update review-questions.md and key-terms.md**
- [ ] **Step 6: Commit**

```bash
git add chapters/210-prisoners/
git commit -m "feat(210): enrich prisoners with The Key exam content (Lesson 12)"
```

---

## Task 11: Lessons 13-15 — PG 212 (Command Operations)

**Source PDFs:**
- `Lesson 13 PG Section 212-Pt 1.pdf`
- `Lesson 14 PG Section 212-Pt 2.pdf`
- `Lesson 15 PG Section 212-Pt.3.pdf`

**Files:**
- Modify: All files in `chapters/212-command-operations/`
- Create: New section files as needed
- Modify: `chapters/212-command-operations/review-questions.md`
- Modify: `chapters/212-command-operations/key-terms.md`

- [ ] **Step 1: Read all three lesson PDFs**
- [ ] **Step 2: Read all existing section files**
- [ ] **Step 3: Enrich existing files with exam content from all three lessons**
- [ ] **Step 4: Create new section files for uncovered procedures**
- [ ] **Step 5: Update review-questions.md and key-terms.md**
- [ ] **Step 6: Commit**

```bash
git add chapters/212-command-operations/
git commit -m "feat(212): enrich command operations with The Key exam content (Lessons 13-15)"
```

---

## Task 12: Lesson 16 — PG 213 (Mobilization & Emergency)

**Source PDF:** `Lesson 16 PG Section 213.pdf`
**Files:**
- Modify: All files in `chapters/213-mobilization-emergency/`
- Create: New section files as needed
- Modify: `chapters/213-mobilization-emergency/review-questions.md`
- Modify: `chapters/213-mobilization-emergency/key-terms.md`

- [ ] **Step 1: Read the full lesson PDF**
- [ ] **Step 2: Read all existing section files**
- [ ] **Step 3: Enrich existing files**
- [ ] **Step 4: Create new section files for uncovered procedures**
- [ ] **Step 5: Update review-questions.md and key-terms.md**
- [ ] **Step 6: Commit**

```bash
git add chapters/213-mobilization-emergency/
git commit -m "feat(213): enrich mobilization/emergency with The Key exam content (Lesson 16)"
```

---

## Task 13: Lesson 17 — PG 214 (Quality of Life)

**Source PDF:** `Lesson 17 PG Section 214.pdf`
**Files:**
- Modify: All files in `chapters/214-quality-of-life/`
- Create: New section files as needed
- Modify: `chapters/214-quality-of-life/review-questions.md`
- Modify: `chapters/214-quality-of-life/key-terms.md`

- [ ] **Step 1: Read the full lesson PDF**
- [ ] **Step 2: Read all existing section files**
- [ ] **Step 3: Enrich existing files**
- [ ] **Step 4: Create new section files for uncovered procedures**
- [ ] **Step 5: Update review-questions.md and key-terms.md**
- [ ] **Step 6: Commit**

```bash
git add chapters/214-quality-of-life/
git commit -m "feat(214): enrich quality of life with The Key exam content (Lesson 17)"
```

---

## Task 14: Lesson 18 — PG 215 (Juvenile Matters)

**Source PDF:** `Lesson 18 PG Section 215.pdf`
**Files:**
- Modify: All files in `chapters/215-juvenile-matters/`
- Create: New section files as needed
- Modify: `chapters/215-juvenile-matters/review-questions.md`
- Modify: `chapters/215-juvenile-matters/key-terms.md`

- [ ] **Step 1: Read the full lesson PDF**
- [ ] **Step 2: Read all existing section files**
- [ ] **Step 3: Enrich existing files**
- [ ] **Step 4: Create new section files for uncovered procedures**
- [ ] **Step 5: Update review-questions.md and key-terms.md**
- [ ] **Step 6: Commit**

```bash
git add chapters/215-juvenile-matters/
git commit -m "feat(215): enrich juvenile matters with The Key exam content (Lesson 18)"
```

---

## Task 15: Lesson 19 — PG 216 (Aided Cases)

**Source PDF:** `Lesson 19 PG Section 216.pdf`
**Files:**
- Modify: `chapters/216-aided-cases/section-216-general-procedure.md`
- Modify: `chapters/216-aided-cases/section-216-dead-body.md`
- Modify: `chapters/216-aided-cases/section-216-special-aided.md`
- Modify: `chapters/216-aided-cases/section-216-medical-programs.md`
- Modify: `chapters/216-aided-cases/section-216-auxiliary-transit-notifications.md`
- Create: New section files as needed
- Modify: `chapters/216-aided-cases/review-questions.md`
- Modify: `chapters/216-aided-cases/key-terms.md`

**Key content to extract and merge:**

- [ ] **Step 1: Read the full lesson PDF (all pages)**
- [ ] **Step 2: Read all existing section files**

- [ ] **Step 3: Enrich section-216-general-procedure.md**

Insert these known items:
- **Memory Aid — CHILD-ERS** after aided case definition: Child (Runaway/Abandoned/Destitute/Abused/Neglected), Homeless, Injured, Lost, DOA, EDP, Requires care, Sick
- **Exam Alert** on "NEVER a Prisoner" (that's Medical Treatment of Prisoner) and "NEVER from Vehicle/Bicycle collision" (that's a PAR)
- **Memory Aid — I C no P.A.I.N.** for routine sick at home: Identified and Conscious, no Police service needed, Adults dependent/uncared for children, Investigation needed, Notifications required
- **Exam Alert** on "No Aided Report 2 times": (1) Routine sick at home — no aided report, just Digital A/L; (2) Routine sick in nursing home — no response AND no aided report
- **Prior Test** on nursing home: Old woman burnt by morning coffee — answer is injury (aided case), not routine sick
- **Exam Alert** on 3 "UNs" for riding in ambulance: UN-identified, UN-conscious, UN-sound mind (221-13 EDP)
- **Exam Alert** on Medic Alert Emblems: DO NOT REMOVE
- **See Also:** PG 221-13 — EDP procedures

- [ ] **Step 4: Enrich section-216-dead-body.md**

Insert these known items:
- **Memory Aid — TED the M.D. from D.C.** for who can disturb a body: Technician (Highway CIS), ESU (subway/tunnel/train tracks), Doctor/Paramedic/EMT, Medical examiner or assistant, District attorney or assistant, Detective Bureau/Squad, Crime Scene Unit
- **Exam Alert**: "Don't search body until Patrol Supervisor instructs" was a correct answer on a recent test
- **Exam Alert**: Any gender can search a DOA — "Don't be bashful"
- **Exam Alert** on moving body: Can move body offensive to public decency, BUT if suspicious, get approval of BOTH M.E. AND Assigned Detective
- **Exam Alert** on EMS 90Z: FDNY-EMS can depart location of deceased if responsible adult present, no crime belief, and deceased in secure location
- **See Also:** PG 219-01 — Patrol Supervisor's car needs 4 waterproof body covers
- **See Also:** PG 212-04 — Crime Scene; P/S notifies CSU, PDS notifies if P/S unavailable

- [ ] **Step 5: Enrich remaining section files**

Check section-216-special-aided.md, section-216-medical-programs.md, and section-216-auxiliary-transit-notifications.md for matching content from the lesson (disagreement/argument procedures, deranged due to drug overdose, etc.).

- [ ] **Step 6: Update review-questions.md**

Add 5-8 new practice questions. Include the nursing home burn question, the 3 UNs, the body search question.

- [ ] **Step 7: Update key-terms.md**

Add: CHILD-ERS, TED the M.D. from D.C., I C no P.A.I.N., EDP (in aided context), ACR/PCR, 95-tag, EMS 90Z.

- [ ] **Step 8: Commit**

```bash
git add chapters/216-aided-cases/
git commit -m "feat(216): enrich aided cases with The Key exam content (Lesson 19)

Add CHILD-ERS, TED the M.D. from D.C., I C no PAIN mnemonics.
Add exam alerts for nursing home trick question, body search
rules, 3 UNs, and medic alert emblems."
```

---

## Task 16: Lesson 20 — PG 217 (Vehicle Collisions)

**Source PDF:** `Lesson 20 PG Section 217.pdf`
**Files:**
- Modify: All files in `chapters/217-vehicle-collisions/`
- Create: New section files as needed
- Modify: `chapters/217-vehicle-collisions/review-questions.md`
- Modify: `chapters/217-vehicle-collisions/key-terms.md`

- [ ] **Step 1: Read the full lesson PDF**
- [ ] **Step 2: Read all existing section files**
- [ ] **Step 3: Enrich existing files**
- [ ] **Step 4: Create new section files for uncovered procedures**
- [ ] **Step 5: Update review-questions.md and key-terms.md**
- [ ] **Step 6: Commit**

```bash
git add chapters/217-vehicle-collisions/
git commit -m "feat(217): enrich vehicle collisions with The Key exam content (Lesson 20)"
```

---

## Task 17: Lessons 21-22 — PG 218 (Property General)

**Source PDFs:**
- `Lesson 21 PG Section 218.pdf`
- `Lesson 22 PG Section 218-Part II.pdf`

**Files:**
- Modify: All files in `chapters/218-property-general/`
- Create: New section files as needed
- Modify: `chapters/218-property-general/review-questions.md`
- Modify: `chapters/218-property-general/key-terms.md`

- [ ] **Step 1: Read both lesson PDFs**
- [ ] **Step 2: Read all existing section files**
- [ ] **Step 3: Enrich existing files with exam content from both lessons**
- [ ] **Step 4: Create new section files for uncovered procedures**
- [ ] **Step 5: Update review-questions.md and key-terms.md**
- [ ] **Step 6: Commit**

```bash
git add chapters/218-property-general/
git commit -m "feat(218): enrich property general with The Key exam content (Lessons 21-22)"
```

---

## Task 18: Lesson 23 — PG 219 (Department Property)

**Source PDF:** `Lesson 23 PG Section 219.pdf`
**Files:**
- Modify: All files in `chapters/219-department-property/`
- Create: New section files as needed
- Modify: `chapters/219-department-property/review-questions.md`
- Modify: `chapters/219-department-property/key-terms.md`

- [ ] **Step 1: Read the full lesson PDF**
- [ ] **Step 2: Read all existing section files**
- [ ] **Step 3: Enrich existing files**
- [ ] **Step 4: Create new section files for uncovered procedures**
- [ ] **Step 5: Update review-questions.md and key-terms.md**
- [ ] **Step 6: Commit**

```bash
git add chapters/219-department-property/
git commit -m "feat(219): enrich department property with The Key exam content (Lesson 23)"
```

---

## Task 19: Lesson 24 — PG 220 (Citywide Incident Management)

**Source PDF:** `Lesson 24 PG Section 220.pdf`
**Files:**
- Modify: All files in `chapters/220-citywide-incident-mgmt/`
- Create: New section files as needed
- Modify: `chapters/220-citywide-incident-mgmt/review-questions.md`
- Modify: `chapters/220-citywide-incident-mgmt/key-terms.md`

- [ ] **Step 1: Read the full lesson PDF**
- [ ] **Step 2: Read all existing section files**
- [ ] **Step 3: Enrich existing files**
- [ ] **Step 4: Create new section files for uncovered procedures**
- [ ] **Step 5: Update review-questions.md and key-terms.md**
- [ ] **Step 6: Commit**

```bash
git add chapters/220-citywide-incident-mgmt/
git commit -m "feat(220): enrich citywide incident mgmt with The Key exam content (Lesson 24)"
```

---

## Task 20: Regenerate Combined Output & Web App Data

**Files:**
- Modify: `web/data.js`
- Modify: Output files in `output/`

- [ ] **Step 1: Check existing build scripts**

Read `scripts/` directory to understand how `web/data.js` and output files are generated.

- [ ] **Step 2: Run the build/generation script**

Execute the appropriate script to regenerate the combined study guide and web app data file from the enriched chapter content.

- [ ] **Step 3: Verify the web app loads correctly**

Open `web/index.html` in a browser and spot-check that enriched content (mnemonics, exam alerts) appears correctly.

- [ ] **Step 4: Commit**

```bash
git add web/ output/
git commit -m "chore: regenerate combined output and web app data with Key enrichments"
```

---

## Task 21: Final Verification

- [ ] **Step 1: Verify all 24 lessons have been processed**

Cross-check each lesson PDF against the commit log to confirm every lesson was integrated.

- [ ] **Step 2: Spot-check 3-5 chapters for quality**

Read a sample of enriched files to verify:
- Callout format is consistent
- No existing content was removed
- Mnemonics include what each letter stands for
- Cross-references include procedure numbers
- Review questions have correct answers with explanations

- [ ] **Step 3: Run a word count comparison**

```bash
git diff --stat HEAD~21 HEAD -- chapters/
```

Verify meaningful content was added across all chapters.

- [ ] **Step 4: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "chore: final cleanup after Key integration"
```
