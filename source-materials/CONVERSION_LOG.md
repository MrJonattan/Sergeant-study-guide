# PDF Conversion Log

**Last Updated:** 2026-04-28

All source PDFs have been converted to markdown using Docling. Extracted content is stored in `./extracted/` directory.

---

## Patrol Guide Volumes

| File | Sections | Document Key | Markdown Size | Status |
|------|----------|--------------|---------------|--------|
| `public-pguide1.pdf` | 200, 202, 207, 208, 209 | `30c9edaceab676a174ef5686add0c7e9` | 1.5 MB | Converted |
| `public-pguide2.pdf` | 210, 211, 212, 213 | `0e689fa61d88bff31935b15e3872b44f` | 961 KB | Converted |
| `public-pguide3.pdf` | 214, 215, 216, 217 | `3009f44dd1a787245a5f87a2d44ac111` | 1.4 MB | Converted |
| `public-pguide4.pdf` | 218-221, 303-332 | `9ac1e3157347850a473058e7979debea` | 830 KB | Converted |

---

## Administrative Guide Volumes

| File | Sections | Document Key | Markdown Size | Status |
|------|----------|--------------|---------------|--------|
| `Public Admin Guide1.pdf` | 303 (Borough Commander) | `cee4bd357dfea62a3ef191a37d5b5d99` | 910 KB | Converted |
| `Public Admin Guide2.pdf` | 320 (Personnel Matters) | `cee4bd357dfea62a3ef191a37d5b5d99` | 910 KB | Converted |

---

## Individual Administrative Guide PDFs

| File | Procedure | Document Key | Markdown Size | Target Chapter |
|------|-----------|--------------|---------------|----------------|
| `A.G. 304-04 Fitness For Duty.pdf` | 304-04 | `5c3cca646f3c91b3ccbf663e8642932a` | 6.7 KB | 304-general-regulations |
| `A.G. 305-05 Lost Or Damaged Uniform.pdf` | 305-05 | `b07f67a834a39ff93cc9fd76edb535b9` | 2.3 KB | 305-uniforms-equipment |
| `A.G. 305-07 Firearms General Regulations.pdf` | 305-07 | `85acf8cfc71a6cb34f2c4b9dcb26f632` | 7.4 KB | 305-uniforms-equipment |
| `A.G. 318-10 Removal Of Firearms From Intoxicated UMOS.pdf` | 318-10 | `61ac0804a818731aae6e21f0b1aaf788` | 14.7 KB | 318-disciplinary-matters |
| `A.G. 318-11 Interrogation Of Members.pdf` | 318-11 | `cf9242179d347038ebdf651b3f38902f` | 8.6 KB | 318-disciplinary-matters |
| `A.G. 319-08 Civilian Member - Injury.pdf` | 319-08 | `b7b6254d4e5f4fc6242dcb3ff90263d5` | 1.4 KB | 319-civilian-personnel |
| `A.G. 325-35 Computer Use Policy.pdf` | 325-35 | `28eacb58b6e88597d0bfc11e4a43453f` | 34 KB | 324-leave-payroll-timekeeping |
| `A.G. 329-06 Retirement Discontinuance.pdf` | 329-06 | `4a5b7c6c983bd83dca3f3c74e792bf63` | 18.9 KB | 329-career-development |
| `A.G. 329-07 Resignation.pdf` | 329-07 | `bad4c1e93e893a617b07f9ffa8ae7d74` | 6.8 KB | 329-career-development |
| `A.G. 330-03 Line Of Duty Injury Or Death.pdf` | 330-03 | `98af4a57ae9a70296aa67e9bda4aee01` | 19.5 KB | 330-medical-health-wellness |
| `A.G. 330-07 Trauma Counseling Program.pdf` | 330-07 | `60283aa08439352d47ab21bdc2e4c54e` | 5.8 KB | 330-medical-health-wellness |
| `A.G. 330-09 Exposure To Infectious Diseases.pdf` | 330-09 | `1ef24141f3b9fbf268d801ec325ff6d2` | 10.9 KB | 330-medical-health-wellness |

---

## Content Integration Status

| Chapter | Procedures from AG PDFs | Integration Status |
|---------|------------------------|-------------------|
| 304-general-regulations | 304-04 (Fitness for Duty) | Existing content verified |
| 305-uniforms-equipment | 305-05, 305-07 | Existing content verified |
| 318-disciplinary-matters | 318-10, 318-11 | Existing content verified |
| 319-civilian-personnel | 319-08 | Existing content verified |
| 324-leave-payroll-timekeeping | 325-35 (Computer Use Policy) | Content exists in chapter 219 |
| 329-career-development | 329-06, 329-07 | Existing content verified |
| 330-medical-health-wellness | 330-03, 330-07, 330-09 | Existing content verified |

---

## Notes

1. **OCR Quality:** Scanned PDFs (pguide1, pguide4) used OCR'd versions for extraction
2. **Text-Selectable PDFs:** pguide2, pguide3, and Admin Guide PDFs were already text-selectable
3. **Extraction Quality:** Docling successfully extracted headings, tables, lists, and procedure metadata
4. **Integration:** Most chapter content already exists and matches extracted source material

---

## Next Steps

1. Review chapters marked "Needs review" above for potential gaps
2. Compare extracted markdown with existing chapter content for accuracy
3. Update any procedures that have been revised since initial chapter creation
4. Integrate any missing callouts or exam alerts from The Key materials

---

## May 2026 Source Update (2026-05-07)

New source PDFs converted and integrated:

| File | Sections | Document Key | Status |
|------|----------|--------------|--------|
| `public-pguide1.pdf` | 200, 202, 207, 208, 209 | `0f17e5688516ff87e71aaa67e568ace5` | Converted & Integrated |
| `public-pguide2.pdf` | 210, 211, 212, 213 | `35a2a596b8eac6f28b934e9a066dca25` | Converted & Integrated |
| `public-pguide3.pdf` | 214, 215, 216, 217 | `050da21c66575fd566be0ac0cd4759af` | Converted & Integrated |
| `public-pguide4.pdf` | 218-221, 303-332 | `ded27aa12b593da7e7e798ccf2457852` | Converted & Integrated |
| `public-adminguide1.pdf` | 303 (Borough Command) | `c4efbe2b93a4df80a5b8d9ae40e73c88` | Converted & Integrated |
| `public-adminguide2.pdf` | 320 (Personnel Matters) | `0b24a2c15fd767be74f6246e935757b9` | Converted & Integrated |
| `TOC.pdf` | Table of Contents | `a25eee4d7a5dcb77d4dc23e9221bf9bc` | Converted |

### Procedures Updated (2025-2026 Dates)

| Procedure | Title | New Date | Chapter |
|-----------|-------|----------|---------|
| P.G. 202-06 | Administrative Quality of Life Officer | 05/05/26 | 202 |
| A.G. 303-14 | Crime Analysis Sergeant | 04/23/26 | 303 |
| A.G. 303-15 | Crime Prevention Officer | 02/02/26 | 303 |
| A.G. 303-17 | Digital Communications Officer | 02/02/26 | 303 |
| A.G. 303-20 | Community Ambassador | 10/24/25 | 303 |
| A.G. 303-09 | Patrol Borough Traffic Safety Coordinator | 10/24/25 | 303 |
| P.G. 218-01 | Invoicing Property - General | 06/26/25 | 218 |
| P.G. 218-02 | Return of Property/Vehicles | 06/02/25 | 218 |
| P.G. 218-12 | Safeguarding Vehicles in Custody | 07/25/25 | 218 |
| A.G. 320-03 | Maintenance/Transfer of Personal Records | 08/12/25 | 320 |
| A.G. 324-01 | Vacation Policy | 10/20/25 | 324 |
| A.G. 324-02 | Working During Vacation | 05/08/23 | 324 |
