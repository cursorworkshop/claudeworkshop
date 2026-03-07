# CursorWorkshop Integration Plan

## Goal

Use Nautilus as the single incubator pipeline repo. Only push mature output into `cursorworkshop`.

## Integration Contract

- Article destination: `content/editorials/<slug>.mdx`
- Image destination: `public/images/editorials/<slug>.png`
- Optional image map: `src/components/ResearchList.tsx` (`articleImages` map)

## Promotion Flow

1. Run Nautilus cycle.
2. Review `data/outbox/<run>/article.mdx` and `image.png`.
3. Apply package to local `cursorworkshop` checkout.
4. Commit and push in `cursorworkshop`.
5. Deploy `claudeworkshop.com`.
6. Sync the same publish into `claudeworkshop` and `codexworkshop`.
7. Deploy both mirror sites.
8. Wait until the research URL is live on all three sites.
9. Send founders the completion email.
