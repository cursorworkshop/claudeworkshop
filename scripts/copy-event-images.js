const fs = require('fs');
const path = require('path');

/**
 * Copies any images found in `content/{events,workshops}/<slug>/images` to
 * `public/images/{events,workshops}/<slug>/` so Next.js can serve them.
 * This maintains backward-compat with the old events folder while supporting
 * the new workshops structure.
 */
function copyImages() {
  console.log('📸 Copying images from content to public...');

  const categories = ['events', 'workshops'];
  const projectRoot = process.cwd();

  categories.forEach(category => {
    const contentDir = path.join(projectRoot, 'content', category);
    if (!fs.existsSync(contentDir)) return; // skip if dir missing

    const publicDir = path.join(projectRoot, 'public', 'images', category);
    fs.mkdirSync(publicDir, { recursive: true });

    const items = fs
      .readdirSync(contentDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    items.forEach(slug => {
      const srcImagesDir = path.join(contentDir, slug, 'images');
      if (!fs.existsSync(srcImagesDir)) {
        console.log(`⚠️  No images directory found for ${category}: ${slug}`);
        return;
      }

      const destDir = path.join(publicDir, slug);
      copyDirectoryRecursive(srcImagesDir, destDir);
      console.log(`✅ Copied images for ${category}: ${slug}`);
    });
  });

  console.log('🎉 Image copy completed!');
}

function copyDirectoryRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyImages();
