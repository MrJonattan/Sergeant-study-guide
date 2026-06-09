# Update Ingestion Complete — June/May 2026

**Generated:** 2026-06-07  
**Source:** Update1.pdf + NYPD Patrol Guide PDFs (downloaded 2026-06-07)

---

## ✅ What Was Done

### 1. Created Ingestion Scripts
- `scripts/ingest-updates.mjs` — Parses Update1.pdf timeline and adds update notices to sections
- `scripts/compare-updates.mjs` — Extracts actual procedure content from source PDFs
- `scripts/cleanup-duplicate-notices.mjs` — Removes duplicate update notices

### 2. Added Update Notices
- **41 procedures** marked with update notices in section files
- **14 files** cleaned of duplicate notices
- Update summary created at `docs/PROCEDURE-UPDATES-2026.md`

### 3. Content Comparison & Updates
- Extracted text from all updated procedures to `build/update-comparison/`
- Created detailed change analysis at `docs/JUNE-MAY-2026-CHANGES.md`

### 4. Study Guide Updates

#### Section 202-18: Desk Officer (Updated June 2, 2026)
**NEW Requirements Added:**
- CPR System "Court Appearances" query requirement
- "Rundown" to communications dispatcher upon completion of roll call
- Ongoing notification to dispatcher of resource changes throughout tour

#### Section 202-19: Patrol Supervisor (Updated June 2, 2026)
**NEW Requirements Added:**
- Use **Salesforce Application** for quality of life operations supervision
- Use **AVL (Automatic Vehicle Location)** in **DAS** to monitor RMP locations
- AVL failure protocol: notify D.O., do NOT remove vehicle unless IAB/Fleet directs

#### Section 212-125: Crime Victim Assistance Program (CVAP) (NEW June 4, 2026)
**Entirely New Procedure Added:**
- CVAP managed by MOCJ + Safe Horizon
- Desk Officer: Command Log entries for advocate arrival/departure
- Crime Analysis Officer: Review/print reports for advocate (EXCEPT sex crimes, under 18, cross complaints, unfounded DV, non-crimes)
- DV Supervisor: Facilitate advocate home visits (except open CR/wanted perp locations)
- Operations Coordinator: Direct ballistic vest use during home visits

---

## 📋 Critical Updates Summary

### June 2026 (Highest Priority)

| Date | Procedure | Change Type | Exam Impact |
|------|-----------|-------------|-------------|
| June 4 | 212-125 | **NEW PROCEDURE** | High — entirely new content |
| June 2 | 202-18 | Added CPR/Rundown requirements | High — Desk Officer duties |
| June 2 | 202-19 | Added Salesforce/AVL requirements | High — Patrol Supervisor duties |

### May 2026 (Medium Priority)

| Date | Procedures | Count | Chapters Affected |
|------|------------|-------|-------------------|
| May 28 | 207-07 | 1 | Complaints |
| May 27 | 207-01 | 1 | Complaints |
| May 26 | 304-22, 330-08, 219-12 | 3 | Regulations, Medical, Property |
| May 19 | 318-09, 318-17, 202-05, 202-20 | 4 | Disciplinary, Duties |
| May 13 | 14 procedures | 14 | Multiple |
| May 5 | 15 procedures | 15 | Multiple |

---

## 📁 Files Modified

### Documentation
- `docs/PROCEDURE-UPDATES-2026.md` — Update timeline summary
- `docs/JUNE-MAY-2026-CHANGES.md` — Detailed change analysis
- `docs/UPDATE-INGESTION-COMPLETE.md` — This file

### Chapter Files
- `chapters/202-duties-responsibilities/section-202-supervisors.md` — Updated 202-18 and 202-19 with June changes
- `chapters/212-command-operations/section-212-miscellaneous.md` — Added new 212-125 (CVAP)
- `chapters/212-command-operations/README.md` — Added CVAP to procedure index

### Extracted Content
- `build/update-comparison/ALL-UPDATES.md` — Full extracted text from 45+ procedures
- `build/update-comparison/[procedure-number].txt` — Individual procedure extracts

---

## 🎯 Study Recommendations

### For Immediate Study (June 2026 Updates)

1. **CVAP (212-125)** — Memorize:
   - Who manages it (MOCJ + Safe Horizon)
   - Which reports NOT to give advocate (sex crimes, <18, cross complaints, unfounded, non-crime)
   - When ballistic vest required (home visits with DV investigators)
   - Who directs vest use (Operations Coordinator)

2. **Desk Officer (202-18)** — New duties:
   - Query CPR "Court Appearances"
   - Provide "Rundown" after roll call
   - Notify dispatcher of changes throughout tour

3. **Patrol Supervisor (202-19)** — New technology:
   - Salesforce for QOL operations
   - AVL/DAS for RMP monitoring
   - AVL failure → notify D.O. only

### For Review (May 2026 Updates)

Review the extracted content in `build/update-comparison/` for:
- 207-01 (Complaint System)
- 207-07 (Preliminary Investigations)
- 212-12 (Intelligence Reporting)
- 212-99 (AMBER Alert)

---

## ⚠️ Important Notes

1. **Update1.pdf contains only the timeline** — The actual content changes must be compared against the source Patrol Guide PDFs

2. **Some procedures updated multiple times** — E.g., 207-01 updated May 27 AND April 23; 207-07 updated May 28 AND May 13

3. **Content extraction is partial** — The compare script extracts ~3000 characters per procedure; full content should be reviewed from source PDFs

4. **Some section files don't exist** — The study guide doesn't have sections for all 100+ procedures; some updates couldn't be mapped

---

## 🔄 Next Steps

1. **Review extracted content** — Open `build/update-comparison/ALL-UPDATES.md` and compare with current sections

2. **Update remaining procedures** — Add content changes for May 2026 updates

3. **Generate new practice questions** — Create questions for:
   - CVAP procedure (212-125)
   - New Desk Officer duties (202-18)
   - New Patrol Supervisor technology (202-19)

4. **Regenerate study guide** — Rebuild PDF/HTML with updated content

5. **Update web app data** — Refresh `web/data.js` with new procedures and questions

---

## 📊 Statistics

- **Total procedures in Update1.pdf:** 100+
- **Procedures updated June 2026:** 3
- **Procedures updated May 2026:** ~40
- **Section files updated:** 3
- **Update notices added:** 41
- **Duplicate notices cleaned:** 14 files
- **New procedures added:** 1 (CVAP)
