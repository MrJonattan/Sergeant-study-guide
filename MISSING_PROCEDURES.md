# Missing P.G. and A.G. Procedures

**Generated:** 2026-05-23  
**Method:** Compared procedure numbers extracted from source materials vs. existing chapter markdown files  
**Verification:** All 59 procedures confirmed MISSING via grep audit (2026-05-23)

---

## Summary

**Total Missing Procedures: 59**
- P.G. Procedures: 22
- A.G. Procedures: 37

---

## P.G. Procedures Missing (22)

### 200-Series (Operations)

| Procedure | Chapter | Priority |
|-----------|---------|----------|
| P.G. 203-10 | 203 (not yet created) | High |
| P.G. 203-13 | 203 (not yet created) | High |
| P.G. 203-15 | 203 (not yet created) | High |
| P.G. 203-16 | 203 (not yet created) | High |
| P.G. 203-17 | 203 (not yet created) | High |
| P.G. 205-40 | 205 (not yet created) | Medium |
| P.G. 209-25 | 209-summonses | Medium |
| P.G. 211-01 | 211-court-appearances | Medium |
| P.G. 212-13 | 212-command-operations | High |
| P.G. 212-18 | 212-command-operations | High |
| P.G. 212-72 | 212-command-operations | Medium |
| P.G. 214-05 | 214-quality-of-life | Medium |
| P.G. 214-15 | 214-quality-of-life | Medium |
| P.G. 215-21 | 215-juvenile-matters | High |
| P.G. 217-17 | 217-vehicle-collisions | Medium |
| P.G. 217-18 | 217-vehicle-collisions | Medium |
| P.G. 218-10 | 218-property-general | Medium |
| P.G. 218-24 | 218-property-general | Low |
| P.G. 221-12 | 221-tactical-operations | Medium |
| P.G. 221-19 | 221-tactical-operations | Medium |
| P.G. 221-20 | 221-tactical-operations | Medium |
| P.G. 332-06 | 332-employee-rights | High |

**Note:** P.G. 203 and P.G. 205 chapters do not exist yet. These procedures were referenced in source materials but no chapter directories were created for these sections.

---

## A.G. Procedures Missing (37)

### 300-Series (Personnel & Administration)

| Procedure | Chapter | Priority |
|-----------|---------|----------|
| A.G. 304-15 | 304-general-regulations | High |
| A.G. 313-04 | 313 (not yet created) | Medium |
| A.G. 313-05 | 313 (not yet created) | Medium |
| A.G. 316-06 | 316 (not yet created) | Medium |
| A.G. 316-18 | 316 (not yet created) | Medium |
| A.G. 318-16 | 318-disciplinary-matters | High |
| A.G. 318-22 | 318-disciplinary-matters | High |
| A.G. 318-24 | 318-disciplinary-matters | High |
| A.G. 318-29 | 318-disciplinary-matters | High |
| A.G. 319-04 | 319-civilian-personnel | Low |
| A.G. 319-06 | 319-civilian-personnel | Low |
| A.G. 319-10 | 319-civilian-personnel | Low |
| A.G. 320-38 | 320-personnel-matters | Medium |
| A.G. 321-26 | 321 (not yet created) | Medium |
| A.G. 322-25 | 322 (not yet created) | Medium |
| A.G. 322-31 | 322 (not yet created) | Medium |
| A.G. 322-39 | 322 (not yet created) | Medium |
| A.G. 322-42 | 322 (not yet created) | Medium |
| A.G. 324-09 | 324-leave-payroll-timekeeping | Medium |
| A.G. 324-11 | 324-leave-payroll-timekeeping | Medium |
| A.G. 324-12 | 324-leave-payroll-timekeeping | Medium |
| A.G. 324-14 | 324-leave-payroll-timekeeping | Medium |
| A.G. 324-23 | 324-leave-payroll-timekeeping | Medium |
| A.G. 324-28 | 324-leave-payroll-timekeeping | Medium |
| A.G. 325-14 | 325 (not yet created) | Medium |
| A.G. 325-15 | 325 (not yet created) | Medium |
| A.G. 325-25 | 325 (not yet created) | Medium |
| A.G. 325-47 | 325 (not yet created) | Medium |
| A.G. 327-03 | 327 (not yet created) | Medium |
| A.G. 328-02 | 328 (not yet created) | Medium |
| A.G. 330-01 | 330-medical-health-wellness | Medium |
| A.G. 330-02 | 330-medical-health-wellness | Medium |
| A.G. 330-04 | 330-medical-health-wellness | Medium |
| A.G. 330-05 | 330-medical-health-wellness | Medium |
| A.G. 330-08 | 330-medical-health-wellness | Medium |
| A.G. 330-11 | 330-medical-health-wellness | Medium |
| A.G. 332-06 | 332-employee-rights | High |

**Note:** A.G. 313, 316, 321, 322, 325, 327, 328 chapters do not exist yet.

---

## Missing Chapters

The following chapter directories need to be created:

| Chapter | Section Topic | Procedures | Source |
|---------|--------------|------------|--------|
| 203 | (TBD) | 203-10, 203-13, 203-15, 203-16, 203-17 | pguide1 |
| 205 | (TBD) | 205-40 | pguide1 |
| 313 | (TBD) | 313-04, 313-05 | Admin Guide |
| 316 | (TBD) | 316-06, 316-18 | Admin Guide |
| 321 | (TBD) | 321-26 | Admin Guide |
| 322 | (TBD) | 322-25, 322-31, 322-39, 322-42 | Admin Guide |
| 325 | (TBD) | 325-14, 325-15, 325-25, 325-47 | Admin Guide |
| 327 | (TBD) | 327-03 | Admin Guide |
| 328 | (TBD) | 328-02 | Admin Guide |

---

## Next Steps

1. **Create missing chapter directories** for sections 203, 205, 313, 316, 321, 322, 325, 327, 328
2. **Extract procedure titles** from source PDFs using Docling for the missing procedures above
3. **Populate chapter content** with procedure summaries, key terms, and review questions
4. **Update existing chapters** with missing procedures (209-25, 211-01, 212-13, etc.)

---

## Methodology

Procedure numbers were extracted using grep pattern: `(P\.G\.|A\.G\.) [0-9]{3}-[0-9]{2}`

**Sources compared:**
- Source materials: `source-materials/extracted/*.md` (17 files from PDF conversion)
- Chapter files: `chapters/**/*.md` (all markdown files in chapter directories)

**Exclusion:** Procedures found in source but not in any chapter markdown file were flagged as missing.

**Verification (2026-05-23):** All 59 procedures confirmed missing via directory check and grep audit.
