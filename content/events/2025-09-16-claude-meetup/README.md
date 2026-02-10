# Event Folder Structure

This folder contains all assets for the Claude Meetup event on September 16, 2025.

## Structure

```
2025-09-16-claude-meetup/
├── index.md          # Main event content and metadata
├── images/           # Event-specific images
│   ├── event-banner.jpg
│   ├── speaker-photos/
│   └── event-photos/
└── README.md         # This file
```

## Adding Images

1. Place event banner images in the `images/` folder
2. Use `./images/filename.jpg` in the `index.md` file
3. For speaker photos, create a `speaker-photos/` subfolder
4. For event photos, create an `event-photos/` subfolder

## Naming Convention

- Event banner (for event lists): `event-banner.jpg` (1220x250 - 4.88:1 aspect ratio)
- Event detail banner: `event-detail-banner.jpg` (800x600 - 4:3 aspect ratio)
- Speaker photos: `speaker-name.jpg`
- Event photos: `event-YYYY-MM-DD-XX.jpg`

## Usage

The `index.md` file contains the event metadata and content. Images referenced in the markdown should be placed in the `images/` folder.
