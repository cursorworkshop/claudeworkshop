# Reference Style Spec (Editorial Sketch v4)

This file is the single source of truth for hero-image style.
Goal: lock visual DNA, not scene composition.

Reference asset: `target-style-reference.png`.

## 1) Visual Identity (Locked)

- Medium: hand-drawn black-pencil sketch on soft pastel paper.
- Ink family: single black graphite/pencil line family.
- Rendering intent: fast editorial notebook drawing, intentionally unfinished.
- Overall feel: human-made, rough, observational sketch.

## 2) Composition System (Flexible)

- Exactly one focal subject or focal object.
- Human presence is optional.
- Computers/screens/monitors are disallowed by default.
- Subject scale target: 16-28% of canvas area (small subject).
- Negative space target: 60-80% of canvas area (large breathing room).
- Keep framing pulled back with broad whitespace.

## 3) Scene Diversity Rules (Hard)

- Do not default to "person behind computer."
- When generating 3 variants, require all three context types:
  - `artifact_focus`
  - `workflow_moment`
  - `workspace`
- At least one variant must be non-human (no visible person).
- Scene must be grounded in the article, not generic AI coding imagery.

## 4) Linework DNA (Locked)

- Stroke quality: jittery, broken, pressure-varying, sketchy.
- Priority order:
  1) expressive contour lines
  2) local scribble hatching
  3) sparse construction marks
- Keep hatch density low; preserve large pastel-paper breathing gaps.
- Keep rough overlaps and slight perspective imperfections.
- Avoid smooth vector-like contours and polished edge cleanup.
- Avoid heavy global crosshatching.

## 5) Tonal DNA (Locked)

- Background: soft pastel paper only.
- Background must not be pure white or near-white.
- A subtle pastel wash or gentle tonal gradient is allowed.
- Keep drawing marks predominantly black graphite/pencil against the pastel field.

## 6) Detail and Content Rules

- Prefer abstract conceptual depictions over literal UI scenes.
- Avoid computers/monitors/laptops/screens/tablets/phones.
- No readable text, words, letters, labels, or numbers anywhere in the image.
- Avoid polished UI, logos, badges, and product text.
- Avoid dense, polished box-arrow diagrams as dominant content.

## 7) Hard Negatives (Must Never Appear)

- Multiple people.
- Photorealism, 3D rendering, glossy shading, comic-book polish.
- Highly clean geometric/vector finish.
- Logos, watermarks, signatures, branding.
- Any readable text or labels.
- Any computer/monitor/laptop/screen/browser/terminal UI.
- Floating arrows/icons/callouts.
- Futuristic HUD overlays.
- Pure white or near-white background.
- Neon, saturated, or high-contrast color accents.

## 8) Pass/Fail Checklist

Fail if:

- It looks polished/rendered instead of quickly sketched.
- It repeats the same person-at-desk trope when scene brief asks for other context.
- It includes readable text, labels, or numbers.
- Linework is too clean, uniform, or perfect.
- Whitespace is too low (crowded frame).
- The background falls back to white instead of a soft pastel paper tone.
- Colors are bright, neon, saturated, or ad-like instead of muted pastel.

Pass only if first impression is:

> "A rough black-pencil technical editorial sketch on muted pastel paper with strong breathing room and scene-specific content."

## 9) Prompting Notes

- Use direct style-lock language ("rough", "unfinished", "jittery strokes", "black graphite on muted pastel paper").
- Lock style DNA and whitespace target.
- Keep composition and subject flexible per scene brief.
- Repeat anti-trope instruction: do not default to person at computer, and avoid computer devices altogether.
