# PDF Report Specification

## Button Label

Generer VA-risikorapport

## Technical Approach

1. Backend generates an HTML report
2. Puppeteer renders the HTML to PDF
3. Backend stores the PDF temporarily
4. API returns a download URL

## Report Length

6-8 pages for the demo.

## Report Sections

1. Sammendrag
2. Topp 10 risikoområder
3. Lekkasjeindikasjoner
4. Fremmedvannindikasjoner
5. Datakvalitet og datagap
6. Anbefalte feltkontroller
7. Metode og scoring
8. Vedlegg: scoringtabell

## First Page Content

Title:

VA-risikorapport

Subtitle:

Fjordvik kommune - Demo dataset

Summary:

Analysen viser 3 områder med høy lekkasjerisiko, 2 pumpestasjoner med tydelig regnrelatert respons og 8 anbefalte feltkontroller.

Purpose:

Rapporten er laget som beslutningsstøtte for lekkasjekontroll, fremmedvannstiltak og prioritering av videre undersøkelser.

## Report Tone

Use sober operational language. The report should sound like decision support for technical planning, not a sales document.

Important phrase:

Beslutningsstøtte, ikke automatisk diagnose.
