#!/usr/bin/env python3
"""Build a styled PDF of the NYPD Sergeant Study Guide using markdown + WeasyPrint."""

import subprocess
import sys
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
INPUT_MD = PROJECT / "output" / "study-guide-combined.md"
OUTPUT_DIR = Path.home() / "Documents"
OUTPUT_PDF = OUTPUT_DIR / "NYPD-Sergeant-Study-Guide.pdf"

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&display=swap');

@page {
    size: letter;
    margin: 1in 0.9in;
    @top-center {
        content: "NYPD Sergeant Promotional Exam — Study Guide";
        font-family: 'Source Serif 4', 'Georgia', serif;
        font-size: 8pt;
        color: #666;
        border-bottom: 0.5pt solid #ccc;
        padding-bottom: 4pt;
    }
    @bottom-center {
        content: counter(page);
        font-family: 'Source Serif 4', 'Georgia', serif;
        font-size: 9pt;
        color: #333;
    }
}

@page :first {
    @top-center { content: none; }
    @bottom-center { content: none; }
}

body {
    font-family: 'Source Serif 4', 'Georgia', serif;
    font-size: 10.5pt;
    line-height: 1.55;
    color: #111;
    max-width: none;
}

h1 {
    font-size: 22pt;
    font-weight: 700;
    margin-top: 40pt;
    margin-bottom: 12pt;
    padding-bottom: 6pt;
    border-bottom: 2.5pt solid #000;
    page-break-before: always;
    color: #000;
}

h1:first-of-type {
    page-break-before: avoid;
    font-size: 28pt;
    text-align: center;
    border-bottom: none;
    margin-top: 120pt;
    margin-bottom: 40pt;
}

h2 {
    font-size: 15pt;
    font-weight: 700;
    margin-top: 24pt;
    margin-bottom: 8pt;
    color: #000;
    border-bottom: 1pt solid #ccc;
    padding-bottom: 4pt;
}

h3 {
    font-size: 12pt;
    font-weight: 700;
    margin-top: 18pt;
    margin-bottom: 6pt;
    color: #222;
}

h4 {
    font-size: 11pt;
    font-weight: 600;
    margin-top: 14pt;
    margin-bottom: 4pt;
    color: #333;
}

p {
    margin: 6pt 0;
    text-align: justify;
    orphans: 3;
    widows: 3;
}

strong {
    font-weight: 700;
    color: #000;
}

ul, ol {
    margin: 6pt 0 6pt 18pt;
    padding: 0;
}

li {
    margin-bottom: 3pt;
}

blockquote {
    border-left: 3pt solid #000;
    margin: 12pt 0;
    padding: 8pt 14pt;
    background: #f5f5f5;
    font-size: 10pt;
}

/* Sergeant Focus callouts */
blockquote:has(strong:first-child) {
    border-left: 4pt solid #000;
    background: #e8e8e8;
}

table {
    border-collapse: collapse;
    width: 100%;
    margin: 12pt 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
}

th {
    background: #000;
    color: #fff;
    font-weight: 600;
    text-align: left;
    padding: 6pt 8pt;
}

td {
    padding: 5pt 8pt;
    border-bottom: 0.5pt solid #ccc;
}

tr:nth-child(even) td {
    background: #f8f8f8;
}

code {
    font-family: 'Menlo', 'Courier New', monospace;
    font-size: 9pt;
    background: #f0f0f0;
    padding: 1pt 4pt;
    border: 0.5pt solid #ddd;
}

pre {
    background: #f5f5f5;
    border: 1pt solid #ddd;
    padding: 10pt;
    font-size: 8.5pt;
    line-height: 1.4;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    page-break-inside: avoid;
}

pre code {
    background: none;
    border: none;
    padding: 0;
}

hr {
    border: none;
    border-top: 1pt solid #ccc;
    margin: 20pt 0;
}

details {
    margin: 8pt 0;
    padding: 6pt 10pt;
    border: 1pt solid #ccc;
    background: #fafafa;
    page-break-inside: avoid;
}

summary {
    font-weight: 700;
    cursor: pointer;
    color: #000;
}

/* Keep headings with their content */
h1, h2, h3, h4 {
    page-break-after: avoid;
}

/* Avoid breaking inside list items and table rows */
li, tr {
    page-break-inside: avoid;
}
"""


def main():
    if not INPUT_MD.exists():
        print(f"Error: {INPUT_MD} not found. Run build-web.js first or check output/ dir.")
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Step 1: Convert markdown to HTML with pandoc
    print("Converting markdown to HTML with pandoc...")
    html_result = subprocess.run(
        [
            "pandoc",
            str(INPUT_MD),
            "-f", "markdown+emoji",
            "-t", "html5",
            "--standalone",
            "--toc",
            "--toc-depth=2",
            "--metadata", "title=NYPD Sergeant Promotional Exam — Study Guide",
            "--css", "/dev/stdin",  # We'll inject CSS separately
        ],
        capture_output=True,
        text=True,
    )
    if html_result.returncode != 0:
        # Try without --css flag, inject manually
        html_result = subprocess.run(
            [
                "pandoc",
                str(INPUT_MD),
                "-f", "markdown+emoji",
                "-t", "html5",
                "--standalone",
                "--toc",
                "--toc-depth=2",
                "--metadata", "title=NYPD Sergeant Promotional Exam — Study Guide",
            ],
            capture_output=True,
            text=True,
        )
        if html_result.returncode != 0:
            print(f"Pandoc error: {html_result.stderr}")
            sys.exit(1)

    html = html_result.stdout

    # Inject CSS into the HTML head
    css_tag = f"<style>\n{CSS}\n</style>"
    html = html.replace("</head>", f"{css_tag}\n</head>")

    # Write intermediate HTML
    intermediate_html = PROJECT / "output" / "study-guide-pdf.html"
    intermediate_html.write_text(html, encoding="utf-8")
    print(f"Intermediate HTML: {intermediate_html}")

    # Step 2: Convert HTML to PDF with WeasyPrint
    print("Generating PDF with WeasyPrint (this may take a minute)...")
    from weasyprint import HTML as WPHTML

    doc = WPHTML(filename=str(intermediate_html))
    doc.write_pdf(str(OUTPUT_PDF))

    size_mb = OUTPUT_PDF.stat().st_size / (1024 * 1024)
    print(f"\nPDF generated: {OUTPUT_PDF}")
    print(f"Size: {size_mb:.1f} MB")


if __name__ == "__main__":
    main()
