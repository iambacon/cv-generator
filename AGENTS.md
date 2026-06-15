# Project: Automated CV Generation

## Objective

Create a maintainable, high-fidelity PDF CV from Markdown, matching the visual
style of the previous InDesign exports.

## Resume Authoring Contract

Use the `$cv-authoring` skill when drafting, revising, tailoring, or reviewing
CV content. The rules below define this generator's current output contract and
take precedence if they differ from the skill's bundled format reference.

When creating or editing a resume for this generator:

1. Use `Resume.example.md` as the canonical example.
2. Write private resume data to `Resume.md`. It is gitignored.
3. Keep structured data in YAML frontmatter between the opening and closing
   `---` lines.
4. Put only the professional profile in the Markdown body after the
   frontmatter.
5. Do not rename fields or invent new fields without also updating
   `src/template.html` and, where necessary, `build.js`.
6. Run `npm run build` after editing and confirm that `dist/resume.pdf` is
   generated successfully.

### Supported Schema

```yaml
---
name: Full Name
title: Professional Title
sectionTitle: Employment History # optional; this is the default
contact:
  phone: "Phone number"
  email: email@example.com
  location: City, Country
links:
  - label: Link label
    url: https://example.com
skills:
  - "Category: Skill, Skill, Skill"
education:
  - degree: Qualification
    institution: Institution name
    period: "YYYY - YYYY" # optional
experience:
  - company: Company name
    title: Role title
    location: City or Remote
    period: "Month YYYY - Month YYYY"
    pageBreakBefore: true # optional; starts this role on a new page
    tech: Technology, Technology # optional
    summary: One-sentence role summary. # optional
    bullets: # optional
      - Achievement or responsibility.
---
```

After the closing `---`, write the profile as Markdown:

```markdown
## Professional Summary

A concise professional profile, ideally one short paragraph.
```

### Authoring Rules

- Preserve the YAML indentation shown above; use spaces, not tabs.
- Quote values containing YAML-sensitive characters when needed. In
  particular, quote phone numbers and date ranges if there is any ambiguity.
- Keep `links`, `skills`, `education`, `experience`, and `bullets` as YAML
  lists, even when a list contains only one item.
- Use plain text inside YAML values. Markdown formatting is rendered only in
  the Markdown body.
- Write experience in reverse chronological order.
- Make bullets concise and outcome-focused. Start each with a strong verb and
  include evidence or measurable impact where the source material supports it.
- Do not fabricate employers, dates, qualifications, technologies, metrics, or
  achievements. Mark missing facts clearly for the user to supply.
- Keep content compact enough for the CV layout. If the PDF becomes crowded,
  shorten summaries and bullets before changing typography or page geometry.
- Omit optional fields cleanly instead of inserting placeholders such as
  `N/A`.

## Build

```bash
npm run build
```

To build a different source file:

```bash
npm run build -- /path/to/resume.md
```

The output is written to `dist/resume.pdf`.

## Project Files

- `Resume.example.md`: canonical resume input example
- `build.js`: Markdown/frontmatter parsing and PDF generation
- `src/template.html`: supported field rendering and document structure
- `src/style.css`: print layout and visual styling

## Current Status

- [x] Implement data injection from `Resume.md` into `template.html`.
- [ ] Refine CSS to achieve pixel-perfect parity with the InDesign export.
- [ ] Integrate into the main project build workflow.
