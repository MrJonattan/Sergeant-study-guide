#!/bin/bash
# Build NYPD Sergeant Study Guide - Combined HTML (print to PDF from browser)
# Usage: ./scripts/build-pdf.sh

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$PROJECT_DIR/build"
CHAPTERS_DIR="$PROJECT_DIR/chapters"

# Chapter order (by PG section number)
CHAPTERS=(
  "200-general"
  "202-duties-responsibilities"
  "207-complaints"
  "208-arrests"
  "209-summonses"
  "210-prisoners"
  "211-court-appearances"
  "212-command-operations"
  "213-mobilization-emergency"
  "214-quality-of-life"
  "215-juvenile-matters"
  "216-aided-cases"
  "217-vehicle-collisions"
  "218-property-general"
  "219-department-property"
  "220-citywide-incident-mgmt"
  "221-tactical-operations"
  "303-duties-responsibilities"
  "304-general-regulations"
  "305-uniforms-equipment"
  "318-disciplinary-matters"
  "319-civilian-personnel"
  "320-personnel-matters"
  "324-leave-payroll-timekeeping"
  "329-career-development"
  "330-medical-health-wellness"
  "331-evaluations"
  "332-employee-rights"
)

COMBINED="$OUTPUT_DIR/study-guide-combined.md"

echo "# NYPD Sergeant Promotional Exam — Study Guide" > "$COMBINED"
echo "" >> "$COMBINED"
echo "---" >> "$COMBINED"
echo "" >> "$COMBINED"

for chapter in "${CHAPTERS[@]}"; do
  chapter_dir="$CHAPTERS_DIR/$chapter"
  if [ ! -d "$chapter_dir" ]; then
    continue
  fi

  # Add README (chapter overview) with internal navigation removed
  if [ -f "$chapter_dir/README.md" ]; then
    # Remove internal navigation sections using awk, then strip .md file links
    awk '
      /^## Study Files$/ { skip=1; next }
      /^## Study Guide Files$/ { skip=1; next }
      /^## Chapter Contents$/ { skip=1; next }
      /^## Study Tips$/ { skip=1; next }
      /^## Study Content$/ { skip=1; next }
      /^## / && skip { skip=0 }
      !skip { print }
    ' "$chapter_dir/README.md" | \
    sed -E 's/`section-[^`]+\.md`//g' | \
    sed -E 's/`key-terms\.md`//g' | \
    sed -E 's/`review-questions\.md`//g' | \
    sed -E 's/\[([^]]*)\.md\]\([^)]*\.md\)/\1/g' >> "$COMBINED"
    echo "" >> "$COMBINED"
    echo "---" >> "$COMBINED"
    echo "" >> "$COMBINED"
  fi

  # Add section files (sorted), stripping .md file references
  for section_file in "$chapter_dir"/section-*.md; do
    if [ -f "$section_file" ]; then
      sed -E 's/`?section-[^` ]+\.md`?//g; s/`?key-terms\.md`?//g; s/`?review-questions\.md`?//g' "$section_file" >> "$COMBINED"
      echo "" >> "$COMBINED"
      echo "---" >> "$COMBINED"
      echo "" >> "$COMBINED"
    fi
  done

  # Add key terms
  if [ -f "$chapter_dir/key-terms.md" ]; then
    cat "$chapter_dir/key-terms.md" >> "$COMBINED"
    echo "" >> "$COMBINED"
    echo "---" >> "$COMBINED"
    echo "" >> "$COMBINED"
  fi

  # Add review questions
  if [ -f "$chapter_dir/review-questions.md" ]; then
    cat "$chapter_dir/review-questions.md" >> "$COMBINED"
    echo "" >> "$COMBINED"
    echo "---" >> "$COMBINED"
    echo "" >> "$COMBINED"
  fi
done

echo "Combined markdown: $COMBINED"

# Generate HTML with table of contents
pandoc "$COMBINED" \
  --standalone \
  --toc \
  --toc-depth=2 \
  --metadata title="NYPD Sergeant Promotional Exam Study Guide" \
  --css="" \
  -V mainfont="Helvetica" \
  --html-q-tags \
  -o "$OUTPUT_DIR/study-guide.html"

echo "HTML output: $OUTPUT_DIR/study-guide.html"
echo ""
echo "To create PDF: Open study-guide.html in your browser and use Print → Save as PDF"

# Also build cheat sheet and practice exam as HTML
pandoc "$OUTPUT_DIR/quick-reference-cheat-sheet.md" \
  --standalone \
  --metadata title="NYPD Sergeant Exam — Quick Reference Cheat Sheet" \
  -o "$OUTPUT_DIR/quick-reference-cheat-sheet.html"

pandoc "$OUTPUT_DIR/master-practice-exam.md" \
  --standalone \
  --toc \
  --metadata title="NYPD Sergeant Exam — Master Practice Exam (120 Questions)" \
  -o "$OUTPUT_DIR/master-practice-exam.html"

echo "Cheat sheet HTML: $OUTPUT_DIR/quick-reference-cheat-sheet.html"
echo "Practice exam HTML: $OUTPUT_DIR/master-practice-exam.html"
echo ""
echo "Done! Open any .html file in browser and Print → Save as PDF."
